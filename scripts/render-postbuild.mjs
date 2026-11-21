/**
 * Post-build step (both the nginx deploy and Render static hosting).
 * - Prerenders each indexable marketing page so the raw HTML contains its headings, text and links.
 * - Copies index.html into each known client route (dist/<route>/index.html) so direct hits
 *   work even when the host's SPA rewrite rules are not applied.
 * - Gives every copy its own SEO tags (src/seo/seoRoutes.js): public pages get their own <title>,
 *   meta description, canonical, Open Graph, Twitter Card and JSON-LD. Sign-in pages and the app
 *   get <meta name="robots" content="noindex, follow"> and are not prerendered.
 * - Writes 404.html (unknown paths), marked noindex, with a real not-found page.
 * - Precompresses text assets so nginx can serve gzip (and a proxy can serve the .br files).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib'
import { seoForPath, INDEXABLE_PATHS, NOINDEX_PUBLIC_PATHS, jsonLdForPath, openGraphTags, BRAND } from '../src/seo/seoRoutes.js'
import { rewriteBuiltAssets } from './asset-rewrite.mjs'

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

/** Every route that gets its own copy of index.html: public pages first, then the app. */
const ROUTE_DIRS = [
  ...INDEXABLE_PATHS.filter((p) => p !== '/').map((p) => p.slice(1)),
  ...NOINDEX_PUBLIC_PATHS.map((p) => p.slice(1)),
  ...APP_ROUTE_DIRS,
]

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const NOT_FOUND_HTML =
  '<main><h1>Page not found</h1><p>This page is not on Athena Virtual Studio.</p>' +
  '<p><a href="/">Back to the homepage</a></p></main>'

/**
 * Replace the contents of <div id="root">, including when that contents has nested divs.
 */
export function setRootHtml(html, inner) {
  const open = '<div id="root">'
  const start = html.indexOf(open)
  if (start < 0) return html
  const contentStart = start + open.length
  let depth = 1
  let i = contentStart
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', i)
    const nextClose = html.indexOf('</div>', i)
    if (nextClose < 0) return html
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1
      i = nextOpen + 4
    } else {
      depth -= 1
      if (depth === 0) return html.slice(0, contentStart) + inner + html.slice(nextClose)
      i = nextClose + 6
    }
  }
  return html
}

function jsonLdScript(pathname) {
  const blocks = jsonLdForPath(pathname)
  if (!blocks.length) return ''
  const payload = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks).replace(/</g, '\\u003c')
  return `<script type="application/ld+json" id="seo-jsonld">${payload}</script>`
}

/**
 * index.html with this page's title, description, canonical, robots, social tags and JSON-LD.
 * `body` is the prerendered page (indexable routes) or the not-found message. Empty for the app.
 */
export function withSeoTags(html, pathname, body = null) {
  const seo = seoForPath(pathname)
  const inner = body == null
    ? (seo.title === `Page not found | ${BRAND}` ? NOT_FOUND_HTML : '')
    : body

  html = html
    .replace(/\s*<style>\.seo-prerender\{[^<]*<\/style>/g, '')
    .replace(/\s*<meta[^>]+name=["']description["'][^>]*>/gi, '')
    .replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+name=["']robots["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/\s*<script[^>]+id=["']seo-jsonld["'][^>]*>[\s\S]*?<\/script>/gi, '')

  html = setRootHtml(html, inner)
  if (seo.title) html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeText(seo.title)}</title>`)

  const tags = [
    seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}" />` : null,
    seo.canonical ? `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />` : null,
    seo.indexable ? null : `<meta name="robots" content="${escapeAttr(seo.robots)}" />`,
    ...openGraphTags(seo).map((tag) => `<meta ${tag.attr}="${tag.name}" content="${escapeAttr(tag.content)}" />`),
    jsonLdScript(pathname),
  ].filter(Boolean)
  if (!tags.length) return html
  return html.replace(/\s*<\/head>/i, `\n    ${tags.join('\n    ')}\n  </head>`)
}

function loadManifest() {
  for (const rel of ['.vite/manifest.json', 'manifest.json']) {
    const file = join(distDir, rel)
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  }
  return null
}

const COMPRESSIBLE = /\.(html|js|css|svg|json|xml|txt|webmanifest)$/i

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name)
    if (statSync(file).isDirectory()) walkFiles(file, acc)
    else acc.push(file)
  }
  return acc
}

function precompress(dir) {
  let count = 0
  for (const file of walkFiles(dir)) {
    if (!COMPRESSIBLE.test(file) || file.endsWith('.gz') || file.endsWith('.br')) continue
    const buf = readFileSync(file)
    if (buf.length < 256) continue
    writeFileSync(`${file}.gz`, gzipSync(buf, { level: 9 }))
    writeFileSync(
      `${file}.br`,
      brotliCompressSync(buf, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } }),
    )
    count += 1
  }
  console.log(`[render-postbuild] Precompressed ${count} text files (.gz and .br)`)
}

async function main() {
  if (!existsSync(indexHtml)) {
    console.error('[render-postbuild] dist/index.html not found — run vite build first')
    process.exit(1)
  }
  const base = readFileSync(indexHtml, 'utf8')
  const manifest = loadManifest()
  if (!manifest) console.warn('[render-postbuild] no Vite manifest — prerendered asset URLs were not rewritten')

  const { prerenderIndexablePages } = await import('./prerender-public.mjs')
  const rendered = await prerenderIndexablePages()
  const bodyFor = (pathname) => {
    const html = rendered[pathname]
    if (!html) return null
    return manifest ? rewriteBuiltAssets(html, manifest) : html
  }

  writeFileSync(join(distDir, '404.html'), withSeoTags(base, '/__not-found__'))
  console.log('[render-postbuild] SPA fallback: dist/404.html (noindex, not-found page)')

  for (const route of ROUTE_DIRS) {
    const target = join(distDir, route, 'index.html')
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, withSeoTags(base, `/${route}`, bodyFor(`/${route}`)))
  }
  writeFileSync(indexHtml, withSeoTags(base, '/', bodyFor('/')))

  const indexed = ROUTE_DIRS.filter((r) => seoForPath(`/${r}`).indexable).length + 1
  console.log(
    `[render-postbuild] Wrote ${ROUTE_DIRS.length + 1} pages ` +
      `(${indexed} prerendered with a canonical, the rest noindex)`,
  )
  precompress(distDir)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('[render-postbuild]', error)
    process.exit(1)
  })
}
