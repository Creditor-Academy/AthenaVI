import { seoForPath } from './seoRoutes.js'

/**
 * Set the page's title, description, canonical link and robots meta for `pathname` (see seoRoutes). The built HTML
 * of each page already carries them; this keeps them right after in-app navigation, and for
 * paths the server answers with the app shell (unknown paths, shared links).
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

  let description = doc.head.querySelector('meta[name="description"]')
  if (seo.description) {
    if (!description) {
      description = doc.createElement('meta')
      description.setAttribute('name', 'description')
      doc.head.appendChild(description)
    }
    description.setAttribute('content', seo.description)
  } else if (description) {
    description.remove()
  }

  let robots = doc.head.querySelector('meta[name="robots"]')
  if (!robots) {
    robots = doc.createElement('meta')
    robots.setAttribute('name', 'robots')
    doc.head.appendChild(robots)
  }
  robots.setAttribute('content', seo.robots)
  return seo
}
