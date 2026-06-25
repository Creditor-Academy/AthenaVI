/**
 * Post-build step for Render static hosting.
 * - Copies index.html → 404.html (SPA fallback for unknown paths)
 * - Copies index.html into known client routes so direct hits work even
 *   when Render rewrite rules from render.yaml are not applied.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexHtml = join(distDir, 'index.html');

/** Client routes from App.jsx PATH_TO_VIEW_MAP (no leading slash). */
const SPA_ROUTE_DIRS = [
  'login',
  'signup',
  'dashboard',
  'dashboard/home',
  'dashboard/videos',
  'dashboard/avatars',
  'dashboard/create-avatar',
  'dashboard/templates',
  'dashboard/template-details',
  'dashboard/library',
  'dashboard/workspace',
  'dashboard/admin-portal',
  'dashboard/settings',
  'dashboard/voices',
  'dashboard/create-voice',
  'dashboard/brandkits',
  'dashboard/credits',
  'dashboard/help',
  'profile',
  'create',
  'products',
  'about-us',
  'news',
  'resources',
  'help',
  'privacy',
  'marketing-suite',
  'sales-suite',
  'ethics',
  'technology',
  'use-cases',
  'customer-experience',
  'learning-development',
  'settings',
  'ai-videos',
  'ai-avatars-videos',
  'support',
  'download',
];

if (!existsSync(indexHtml)) {
  console.error('[render-postbuild] dist/index.html not found — run vite build first');
  process.exit(1);
}

copyFileSync(indexHtml, join(distDir, '404.html'));
console.log('[render-postbuild] SPA fallback: dist/index.html → dist/404.html');

let routeCount = 0;
for (const route of SPA_ROUTE_DIRS) {
  const target = join(distDir, route, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(indexHtml, target);
  routeCount += 1;
}
console.log(`[render-postbuild] Copied index.html into ${routeCount} client route directories`);
