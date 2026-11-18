/**
 * Which public pages search engines should index, and their canonical URLs.
 *
 * Used by the build (scripts/render-postbuild.mjs writes a canonical / robots tag into each
 * page's HTML), by the app (applySeoHead keeps them right after in-app navigation), and by the
 * tests that check public/sitemap.xml against this list. Plain JS with no imports, so Node can
 * load it too.
 *
 * Trailing slash: every page is served from its own folder (dist/products/index.html), so the
 * web server answers /products with a 301 to /products/. A canonical must point at the URL that
 * answers 200, so canonical and sitemap URLs end in a slash. If the server is changed to serve
 * /products without the redirect, set TRAILING_SLASH to false and update public/sitemap.xml.
 */

export const SITE_URL = 'https://virtualstudio.lmsathena.com'

export const TRAILING_SLASH = true

/** Public marketing pages: indexable, with a self-referencing canonical. */
export const INDEXABLE_PATHS = [
  '/',
  '/products',
  '/marketing-suite',
  '/sales-suite',
  '/customer-experience',
  '/learning-development',
  '/use-cases',
  '/technology',
  '/ai-videos',
  '/ai-avatars-videos',
  '/about-us',
  '/news',
  '/resources',
  '/ethics',
  '/help',
  '/privacy',
  '/download',
]

/**
 * Public pages kept out of search: `noindex, follow` and no canonical. /early-access is the
 * old waitlist link and now shows the sign-up form, so it is treated like /signup.
 */
export const NOINDEX_PUBLIC_PATHS = ['/login', '/signup', '/early-access']

export const ROBOTS_INDEX = 'index, follow'
export const ROBOTS_NOINDEX = 'noindex, follow'

/** `/products/` → `/products`; `''` → `/`. Query and hash are dropped. */
export function normalizeSeoPath(pathname = '/') {
  let path = String(pathname || '/').split('?')[0].split('#')[0].trim()
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/{2,}/g, '/')
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

export function canonicalUrl(pathname) {
  const path = normalizeSeoPath(pathname)
  if (path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path}${TRAILING_SLASH ? '/' : ''}`
}

/**
 * The tags a page should carry. Indexable pages: a self-referencing canonical. Everything else
 * (sign-in, the app behind sign-in, shared links, unknown paths): `noindex, follow`, no canonical.
 */
export function seoForPath(pathname) {
  const path = normalizeSeoPath(pathname)
  if (INDEXABLE_PATHS.includes(path)) {
    return { indexable: true, canonical: canonicalUrl(path), robots: ROBOTS_INDEX }
  }
  return { indexable: false, canonical: null, robots: ROBOTS_NOINDEX }
}
