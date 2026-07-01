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

export function isDashboardClientPath(pathname = window.location.pathname, hash = window.location.hash) {
  const path = readClientPath(pathname, hash);
  return path === '/profile' || path === '/dashboard' || path.startsWith('/dashboard/') || path === '/support';
}
