/**
 * Post-build step (nginx and Render).
 * - Writes dist/spa.html: the empty app shell, marked noindex. App and editor routes fall back
 *   to this file, not to dist/index.html, because the homepage is prerendered into index.html.
 * - Copies that shell into each known app route (dist/<route>/index.html).
 * - Writes a noindex 404.html shell. scripts/prerender-public.mjs then replaces the public
 *   pages, the homepage, and 404.html with the rendered documents.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  seoForPath,
  openGraphForPath,
  twitterForPath,
  jsonLdForPath,
  LCP_IMAGE_PATH,
  normalizeSeoPath,
  isAppPath,
} from '../src/seo/seoRoutes.js'

const distDir = join(process.cwd(), 'dist')
const indexHtml = join(distDir, 'index.html')

/** App routes from App.jsx PATH_TO_VIEW_MAP (no leading slash). All are noindex. */
const APP_ROUTE_DIRS = [
  'dashboard',
  'dashboard/home',
  'dashboard/videos',
  'dashboard/avatars',
  'dashboard/create-avatar',
  'dashboard/create-avatar-look',
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
  'download',
  'profile',
  'create',
  'settings',
  'support',
]

/** App routes that get a noindex shell. Public pages are written by the prerender step. */
const ROUTE_DIRS = [...APP_ROUTE_DIRS]

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * index.html with this page's title, description, canonical, robots, Open Graph and Twitter
 * tags (any already there are replaced). The visible page is filled in by the prerender step;
 * this does not invent a heading inside #root.
 */
export function withSeoTags(html, pathname) {
  const seo = seoForPath(pathname)
  const og = openGraphForPath(pathname)
  const twitter = twitterForPath(pathname)
  const jsonLd = jsonLdForPath(pathname)
  if (seo.title) html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeText(seo.title)}</title>`)
  const tags = [
    seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}" />` : null,
    seo.canonical ? `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />` : null,
    `<meta name="robots" content="${escapeAttr(seo.robots)}" />`,
    og ? `<meta property="og:type" content="${escapeAttr(og.type)}" />` : null,
    og ? `<meta property="og:site_name" content="${escapeAttr(og.siteName)}" />` : null,
    og ? `<meta property="og:title" content="${escapeAttr(og.title)}" />` : null,
    og?.description ? `<meta property="og:description" content="${escapeAttr(og.description)}" />` : null,
    og ? `<meta property="og:url" content="${escapeAttr(og.url)}" />` : null,
    og ? `<meta property="og:image" content="${escapeAttr(og.image)}" />` : null,
    twitter ? `<meta name="twitter:card" content="${escapeAttr(twitter.card)}" />` : null,
    twitter ? `<meta name="twitter:title" content="${escapeAttr(twitter.title)}" />` : null,
    twitter?.description ? `<meta name="twitter:description" content="${escapeAttr(twitter.description)}" />` : null,
    twitter ? `<meta name="twitter:image" content="${escapeAttr(twitter.image)}" />` : null,
    jsonLd
      ? `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
      : null,
    normalizeSeoPath(pathname) === '/'
      ? `<link rel="preload" as="image" href="${escapeAttr(LCP_IMAGE_PATH)}" fetchpriority="high" data-seo-lcp="1" />`
      : null,
  ].filter(Boolean)
  const cleaned = html
    .replace(/\s*<style>\.seo-prerender\{[^<]*<\/style>/g, '')
    .replace(/<div class="seo-prerender">[\s\S]*?<\/div>/g, '')
    .replace(/\s*<meta[^>]+name=["']description["'][^>]*>/gi, '')
    .replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+name=["']robots["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<script[^>]*id=["']seo-jsonld["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\s*<link[^>]+data-seo-lcp=["']1["'][^>]*>/gi, '')
  if (!tags.length) return cleaned
  return cleaned.replace(/\s*<\/head>/i, `\n    ${tags.join('\n    ')}\n  </head>`)
}

function main() {
  if (!existsSync(indexHtml)) {
    console.error('[render-postbuild] dist/index.html not found — run vite build first')
    process.exit(1)
  }
  const base = readFileSync(indexHtml, 'utf8')
  // App fallback. Must not be the homepage: prerender writes the real home page into index.html.
  const shell = withSeoTags(base, '/dashboard')
  writeFileSync(join(distDir, 'spa.html'), shell)
  writeFileSync(join(distDir, '404.html'), withSeoTags(base, '/__not-found__'))
  console.log('[render-postbuild] dist/spa.html (noindex app shell) and dist/404.html')

  for (const route of ROUTE_DIRS) {
    if (!isAppPath(`/${route}`)) continue
    const target = join(distDir, route, 'index.html')
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, shell)
  }
  console.log(`[render-postbuild] Wrote the noindex app shell into ${ROUTE_DIRS.length} app routes`)
}

// Run when called as a script (not when imported by a test).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
