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

export function resolveViewFromLocation(pathToViewMap) {
  if (getOAuthAccessTokenFromUrl() || isOAuthCallbackPath(window.location.pathname)) {
    return 'google-callback';
  }

  if (getOAuthErrorFromUrl()) {
    return 'login';
  }

  let currentPath = readClientPath();

  const urlView = pathToViewMap[currentPath];
  if (urlView) return urlView;

  const isSpecialPath =
    currentPath.includes('/reset-password') ||
    currentPath.includes('/invite/accept') ||
    currentPath.includes('/invitations/accept');
  if (isSpecialPath) {
    return window.localStorage.getItem('athenavi:view') || 'landing';
  }

  return 'not-found';
}
