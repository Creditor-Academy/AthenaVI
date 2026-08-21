/** Paths the backend may use for OAUTH_SUCCESS_PATH after Google sign-in */
import { readClientPath } from './dashboardRouting.js';

export const OAUTH_CALLBACK_PATHS = new Set([
  '/auth/google/callback',
  '/auth/callback',
  '/oauth/callback',
  '/login/callback',
]);

export function normalizePathname(pathname) {
  if (!pathname) return '/';
  let path = pathname;
  if (path.endsWith('/') && path.length > 1) {
    path = path.slice(0, -1);
  }
  return path;
}

/** Read access_token from hash (#) or query (?) — backend may use either */
export function getOAuthAccessTokenFromUrl() {
  const hash = window.location.hash || '';
  if (hash.includes('access_token=')) {
    const token = new URLSearchParams(hash.slice(1)).get('access_token');
    if (token) return token;
  }
  return new URLSearchParams(window.location.search).get('access_token');
}

export function getOAuthErrorFromUrl() {
  return new URLSearchParams(window.location.search).get('error');
}

export function isOAuthCallbackPath(pathname) {
  const path = normalizePathname(pathname);
  if (OAUTH_CALLBACK_PATHS.has(path)) return true;
  return path.endsWith('/auth/google/callback') || path.endsWith('/auth/callback');
}

export function clearOAuthParamsFromUrl() {
  const path = normalizePathname(window.location.pathname);
  window.history.replaceState(null, '', path);
}

export function isPublicPresentationPath(pathname) {
  const candidates = [
    pathname,
    typeof window !== 'undefined' ? window.location.pathname : '',
    readClientPath(),
  ];
  return candidates.some((path) => /^\/p\/[^/?#]+/.test(normalizePathname(path || '')));
}

export function getPublicPresentationToken(pathname) {
  const candidates = [
    pathname,
    typeof window !== 'undefined' ? window.location.pathname : '',
    readClientPath(),
  ];
  for (const path of candidates) {
    const match = normalizePathname(path || '').match(/^\/p\/([^/?#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return '';
}

export function resolveViewFromLocation(pathToViewMap) {
  if (getOAuthAccessTokenFromUrl() || isOAuthCallbackPath(window.location.pathname)) {
    return 'google-callback';
  }

  if (getOAuthErrorFromUrl()) {
    return 'login';
  }

  let currentPath = readClientPath();

  if (isPublicPresentationPath(currentPath)) {
    return 'public-presentation';
  }

  const urlView = pathToViewMap[currentPath];
  if (urlView) return urlView;

  if (currentPath === '/slides' || currentPath.startsWith('/slides/')) {
    return 'dashboard';
  }

  if (currentPath === '/hub' || currentPath === '/products/choose') {
    return 'dashboard';
  }

  const isSpecialPath =
    currentPath.includes('/reset-password') ||
    currentPath.includes('/invite/accept') ||
    currentPath.includes('/invitations/accept');
  if (isSpecialPath) {
    return window.localStorage.getItem('athenavi:view') || 'landing';
  }

  return 'not-found';
}
