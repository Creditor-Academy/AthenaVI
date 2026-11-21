import { jsonLdForPath, openGraphTags, seoForPath } from './seoRoutes.js'

const JSON_LD_ID = 'seo-jsonld'

function upsertMeta(doc, attr, name, content) {
  const selector = `meta[data-seo="1"][${attr}="${name}"]`
  let el = doc.head.querySelector(selector)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = doc.createElement('meta')
    el.setAttribute(attr, name)
    el.setAttribute('data-seo', '1')
    doc.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Set the page's title, description, canonical link, robots meta, social tags and JSON-LD
 * for `pathname` (see seoRoutes). The built HTML of each page already carries them; this
 * keeps them right after in-app navigation.
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

  const wanted = new Map(openGraphTags(seo).map((tag) => [`${tag.attr}:${tag.name}`, tag.content]))
  for (const el of [...doc.head.querySelectorAll('meta[data-seo="1"]')]) {
    const attr = el.hasAttribute('property') ? 'property' : 'name'
    const key = `${attr}:${el.getAttribute(attr)}`
    if (!wanted.has(key)) el.remove()
  }
  for (const [key, content] of wanted) {
    const [attr, name] = key.split(':')
    upsertMeta(doc, attr, name, content)
  }

  let jsonLd = doc.getElementById(JSON_LD_ID)
  const blocks = jsonLdForPath(pathname)
  if (blocks.length) {
    if (!jsonLd) {
      jsonLd = doc.createElement('script')
      jsonLd.id = JSON_LD_ID
      jsonLd.type = 'application/ld+json'
      doc.head.appendChild(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks).replace(/</g, '\\u003c')
  } else if (jsonLd) {
    jsonLd.remove()
  }

  return seo
}
