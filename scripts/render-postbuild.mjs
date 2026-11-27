/**
 * Post-build step (both the nginx deploy and Render static hosting).
 * - Copies index.html into each known client route (dist/<route>/index.html) so direct hits
 *   work even when the host's SPA rewrite rules are not applied.
 * - Gives every copy its own SEO tags (src/seo/seoRoutes.js): public pages get their own <title>,
 *   meta description and H1 (prerendered inside #root), and indexable pages a self-referencing
 *   <link rel="canonical">; sign-in pages and the app get
 *   <meta name="robots" content="noindex, follow">. They are in the HTML itself, so crawlers
 *   (and "view source") see them without running the app.
 * - Writes 404.html (SPA fallback for unknown paths), marked noindex.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { seoForPath, INDEXABLE_PATHS, NOINDEX_PUBLIC_PATHS } from '../src/seo/seoRoutes.js'

const distDir = join(process.cwd(), 'dist')
const indexHtml = join(distDir, 'index.html')

/**
 * `/templates` is not a view in PATH_TO_VIEW_MAP (the catch-all renders Not Found).
 * It still gets its own dist/templates/index.html, marked noindex, so the URL is a
 * page instead of a static directory. Template JSON is served from /template-assets/.
 * A `templates/` folder with no index.html makes nginx 403 on `/templates/`.
 */
const SPA_SHELL_DIRS = ['templates']

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

/** Every route that gets its own copy of index.html: public pages first, then the app. */
const ROUTE_DIRS = [
  ...INDEXABLE_PATHS.filter((p) => p !== '/').map((p) => p.slice(1)),
  ...NOINDEX_PUBLIC_PATHS.map((p) => p.slice(1)),
  ...SPA_SHELL_DIRS,
  ...APP_ROUTE_DIRS,
]

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The page's H1 and description inside #root, so crawlers that don't run JavaScript read the
 * page's heading. It is the same heading the page shows; React replaces it when the app starts.
 * Visually hidden until then, so visitors don't see a flash of unstyled text.
 */
const PRERENDER_STYLE =
  '<style>.seo-prerender{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}</style>'

function withPrerenderedHeading(html, seo) {
  // Drop any heading already written (the inner <div> holds only an <h1> and a <p>).
  const cleaned = html
    .replace(/\s*<style>\.seo-prerender\{[^<]*<\/style>/, '')
    .replace(/<div class="seo-prerender">[\s\S]*?<\/div>/, '')
  if (!seo.h1) return cleaned
  const body =
    `<h1>${escapeText(seo.h1)}</h1>` + (seo.description ? `<p>${escapeText(seo.description)}</p>` : '')
  return cleaned
    .replace(/\s*<\/head>/i, `\n    ${PRERENDER_STYLE}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><div class="seo-prerender">${body}</div></div>`)
}

/**
 * index.html with this page's title, description / canonical / robots tags (any already there are
 * replaced) and its prerendered H1.
 */
export function withSeoTags(html, pathname) {
  const seo = seoForPath(pathname)
  html = withPrerenderedHeading(html, seo)
  if (seo.title) html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeText(seo.title)}</title>`)
  const tags = [
    seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}" />` : null,
    seo.canonical ? `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />` : null,
    seo.indexable ? null : `<meta name="robots" content="${escapeAttr(seo.robots)}" />`,
  ].filter(Boolean)
  const cleaned = html
    .replace(/\s*<meta[^>]+name=["']description["'][^>]*>/gi, '')
    .replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+name=["']robots["'][^>]*>/gi, '')
  if (!tags.length) return cleaned
  return cleaned.replace(/\s*<\/head>/i, `\n    ${tags.join('\n    ')}\n  </head>`)
}

function main() {
  if (!existsSync(indexHtml)) {
    console.error('[render-postbuild] dist/index.html not found — run vite build first')
    process.exit(1)
  }
  const base = readFileSync(indexHtml, 'utf8')

  // The SPA fallback for unknown paths: never indexed (the app sets the right tags once it runs).
  writeFileSync(join(distDir, '404.html'), withSeoTags(base, '/__not-found__'))
  console.log('[render-postbuild] SPA fallback: dist/index.html → dist/404.html (noindex)')

  for (const route of ROUTE_DIRS) {
    const target = join(distDir, route, 'index.html')
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, withSeoTags(base, `/${route}`))
  }
  // Last: the homepage (dist/index.html is also what the server returns for unknown paths).
  writeFileSync(indexHtml, withSeoTags(base, '/'))

  const indexed = ROUTE_DIRS.filter((r) => seoForPath(`/${r}`).indexable).length + 1
  console.log(
    `[render-postbuild] Copied index.html into ${ROUTE_DIRS.length} client route directories ` +
      `(${indexed} pages with a canonical, the rest noindex)`
  )
}

// Run when called as a script (not when imported by a test).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
