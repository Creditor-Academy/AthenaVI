import { seoForPath, openGraphForPath, twitterForPath, jsonLdForPath, LCP_IMAGE_PATH, normalizeSeoPath } from './seoRoutes.js'

const OG_KEYS = ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image']
const TWITTER_KEYS = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']

function upsertMeta(doc, attr, key, content) {
  let el = doc.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = doc.createElement('meta')
    el.setAttribute(attr, key)
    doc.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Set the page's title, description, canonical, Open Graph, Twitter, JSON-LD and robots meta
 * for `pathname` (see seoRoutes). The built HTML of each page already carries them; this keeps
 * them right after in-app navigation, and for paths the server answers with the app shell.
 */
export function applySeoHead(pathname, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc?.head) return null
  const seo = seoForPath(pathname)
  if (seo.title) doc.title = seo.title

  let canonical = doc.head.querySelector('link[rel="canonical"]')
  if (seo.canonical) {
    if (!canonical) {
      canonical = doc.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      doc.head.appendChild(canonical)
    }
    canonical.setAttribute('href', seo.canonical)
  } else if (canonical) {
    canonical.remove()
  }

  upsertMeta(doc, 'name', 'description', seo.description)

  let robots = doc.head.querySelector('meta[name="robots"]')
  if (!robots) {
    robots = doc.createElement('meta')
    robots.setAttribute('name', 'robots')
    doc.head.appendChild(robots)
  }
  robots.setAttribute('content', seo.robots)

  const og = openGraphForPath(pathname)
  const ogValues = og
    ? {
        'og:type': og.type,
        'og:site_name': og.siteName,
        'og:title': og.title,
        'og:description': og.description,
        'og:url': og.url,
        'og:image': og.image,
      }
    : {}
  for (const key of OG_KEYS) upsertMeta(doc, 'property', key, ogValues[key] || null)

  const twitter = twitterForPath(pathname)
  const twitterValues = twitter
    ? {
        'twitter:card': twitter.card,
        'twitter:title': twitter.title,
        'twitter:description': twitter.description,
        'twitter:image': twitter.image,
      }
    : {}
  for (const key of TWITTER_KEYS) upsertMeta(doc, 'name', key, twitterValues[key] || null)

  const jsonLd = jsonLdForPath(pathname)
  let script = doc.getElementById('seo-jsonld')
  if (jsonLd) {
    if (!script) {
      script = doc.createElement('script')
      script.id = 'seo-jsonld'
      script.type = 'application/ld+json'
      doc.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  } else if (script) {
    script.remove()
  }

  let preload = doc.head.querySelector('link[data-seo-lcp="1"]')
  if (normalizeSeoPath(pathname) === '/') {
    if (!preload) {
      preload = doc.createElement('link')
      preload.setAttribute('rel', 'preload')
      preload.setAttribute('as', 'image')
      preload.setAttribute('data-seo-lcp', '1')
      doc.head.appendChild(preload)
    }
    preload.setAttribute('href', LCP_IMAGE_PATH)
    preload.setAttribute('fetchpriority', 'high')
  } else if (preload) {
    preload.remove()
  }

  return seo
}
