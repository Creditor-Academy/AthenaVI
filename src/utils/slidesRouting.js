/** Slides section ids ↔ URL paths (keep in sync with App PATH_TO_VIEW_MAP). */
import { normalizeClientPath, readClientPath } from './dashboardRouting.js';

export const SLIDES_SECTIONS = new Set([
  'home',
  'ppt-generator',
  'image-generator',
  'settings',
  'help',
]);

/**
 * Map /slides/* to a slides section id.
 * Returns null when the path is not a slides route.
 */
export function resolveSlidesSectionFromPath(pathname = window.location.pathname, hash = window.location.hash) {
  const path = readClientPath(pathname, hash);

  if (path === '/slides' || path === '/slides/home') return 'home';

  if (path.startsWith('/slides/')) {
    const slug = path.slice('/slides/'.length).split('/')[0];
    if (!slug) return 'home';
    if (SLIDES_SECTIONS.has(slug)) return slug;
    return 'home';
  }

  return null;
}

export function slidesPathForSection(section) {
  if (section === 'home') return '/slides';
  return `/slides/${section}`;
}

export function isSlidesClientPath(pathname = window.location.pathname, hash = window.location.hash) {
  const path = readClientPath(pathname, hash);
  return path === '/slides' || path.startsWith('/slides/');
}

export { normalizeClientPath, readClientPath };
