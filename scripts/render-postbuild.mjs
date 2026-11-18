/**
 * Post-build step (both the nginx deploy and Render static hosting).
 * - Copies index.html into each known client route (dist/<route>/index.html) so direct hits
 *   work even when the host's SPA rewrite rules are not applied.
 * - Gives every copy its own SEO tags (src/seo/seoRoutes.js): public marketing pages get a
 *   self-referencing <link rel="canonical">; sign-in pages and the app get
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
  'profile',
  'create',
  'settings',
  'support',
]

/** Every route that gets its own copy of index.html: public pages first, then the app. */
const ROUTE_DIRS = [
  ...INDEXABLE_PATHS.filter((p) => p !== '/').map((p) => p.slice(1)),
  ...NOINDEX_PUBLIC_PATHS.map((p) => p.slice(1)),
  ...APP_ROUTE_DIRS,
]

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

/** index.html with this page's canonical / robots tags (any already there are replaced). */
export function withSeoTags(html, pathname) {
  const seo = seoForPath(pathname)
  const tags = [
    seo.canonical ? `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />` : null,
    seo.indexable ? null : `<meta name="robots" content="${escapeAttr(seo.robots)}" />`,
  ].filter(Boolean)
  const cleaned = html
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
