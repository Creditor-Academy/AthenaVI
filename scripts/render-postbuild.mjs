/**
 * Post-build step for Render static hosting.
 * Copies index.html → 404.html so unknown paths (e.g. /auth/google/callback)
 * still load the SPA when CDN rewrite rules are missing or misconfigured.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexHtml = join(distDir, 'index.html');
const fallbackHtml = join(distDir, '404.html');

if (!existsSync(indexHtml)) {
  console.error('[render-postbuild] dist/index.html not found — run vite build first');
  process.exit(1);
}

copyFileSync(indexHtml, fallbackHtml);
console.log('[render-postbuild] SPA fallback: dist/index.html → dist/404.html');
