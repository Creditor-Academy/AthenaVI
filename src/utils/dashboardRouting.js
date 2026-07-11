/** Dashboard section ids ↔ URL paths (keep in sync with App PATH_TO_VIEW_MAP). */
export const DASHBOARD_SECTIONS = new Set([
  'home',
  'videos',
  'avatars',
  'create-avatar',
  'create-avatar-look',
  'voices',
  'create-voice',
  'library',
  'templates',
  'template-details',
  'workspace',
  'admin-portal',
  'brandkits',
  'credits',
  'profile',
  'settings',
  'help',
]);

export function normalizeClientPath(pathname = '') {
  if (!pathname) return '/';
  let path = String(pathname).trim();
  // Hash routes may include a query (e.g. #/dashboard/settings?tab=security).
  path = path.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

/** Use hash as route only when it encodes a path (e.g. #/dashboard/videos). */
export function readClientPath(pathname = window.location.pathname, hash = window.location.hash) {
  const hashRoute = (hash || '').replace(/^#/, '');
  if (hashRoute.startsWith('/')) {
    return normalizeClientPath(hashRoute);
  }
  return normalizeClientPath(pathname);
}

/**
 * Map /dashboard/* (and /profile, /support) to a dashboard section id.
 * Returns null when the path is not a dashboard route.
 */
export function resolveDashboardSectionFromPath(pathname = window.location.pathname, hash = window.location.hash) {
  const path = readClientPath(pathname, hash);

  if (path === '/support') return 'help';
  if (path === '/profile') return 'profile';
  if (path === '/dashboard' || path === '/dashboard/home') return 'home';

  if (path.startsWith('/dashboard/')) {
    const slug = path.slice('/dashboard/'.length).split('/')[0];
    if (!slug) return 'home';
    if (DASHBOARD_SECTIONS.has(slug)) return slug;
    return 'home';
  }

  return null;
}

export function dashboardPathForSection(section) {
  if (section === 'home') return '/dashboard';
  if (section === 'profile') return '/profile';
  return `/dashboard/${section}`;
}

export const SETTINGS_TAB_IDS = ['preferences', 'notifications', 'security', 'billing'];

export function isValidSettingsTab(tab) {
  return SETTINGS_TAB_IDS.includes(tab);
}

/** Read Settings tab from `?tab=` (defaults to Appearance / preferences). */
export function resolveSettingsTabFromSearch(search = window.location.search) {
  const tryParams = (raw) => {
    const params = new URLSearchParams(raw || '');
    const tab = params.get('tab');
    return isValidSettingsTab(tab) ? tab : null;
  };

  const fromSearch = tryParams(typeof search === 'string' ? search : window.location.search);
  if (fromSearch) return fromSearch;

  if (typeof window !== 'undefined') {
    const hash = (window.location.hash || '').replace(/^#/, '');
    const qIndex = hash.indexOf('?');
    if (qIndex >= 0) {
      const fromHash = tryParams(hash.slice(qIndex + 1));
      if (fromHash) return fromHash;
    }
  }

  return 'preferences';
}

/** Build `/dashboard/settings` or `/dashboard/settings?tab=security`. */
export function dashboardPathForSettingsTab(tab = 'preferences') {
  const base = dashboardPathForSection('settings');
  if (!isValidSettingsTab(tab) || tab === 'preferences') return base;
  return `${base}?tab=${encodeURIComponent(tab)}`;
}

/**
 * Update the current URL's `tab` query while staying on Settings.
 * Uses replaceState so tab clicks don't spam browser history.
 */
export function syncSettingsTabInUrl(tab) {
  if (!isValidSettingsTab(tab)) return;
  if (typeof window === 'undefined') return;

  const path = readClientPath();
  const onSettings =
    path === '/dashboard/settings' ||
    path.startsWith('/dashboard/settings/') ||
    path === '/settings';
  if (!onSettings) return;

  const base = path === '/settings' ? '/settings' : dashboardPathForSection('settings');
  const nextPath =
    !isValidSettingsTab(tab) || tab === 'preferences'
      ? base
      : `${base}?tab=${encodeURIComponent(tab)}`;
  const current = `${window.location.pathname}${window.location.search}`;
  // Prefer comparing against the client path when hash routing is active.
  const currentClient = `${path}${window.location.search}`;
  if (current === nextPath || currentClient === nextPath) return;

  window.history.replaceState(
    { ...(window.history.state || {}), section: 'settings', settingsTab: tab },
    '',
    nextPath
  );
}

export function isDashboardClientPath(pathname = window.location.pathname, hash = window.location.hash) {
  const path = readClientPath(pathname, hash);
  return path === '/profile' || path === '/dashboard' || path.startsWith('/dashboard/') || path === '/support';
}
