/**
 * Checks a saved HTML document against the SEO rules for one route.
 * Returns a list of problems (empty means the document is fine).
 */
const GTM_REMOVED = 'GTM-M4CC43NS'

function decodeAttr(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

function attrValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i')) || tag.match(new RegExp(`\\b${name}='([^']*)'`, 'i'))
  return match ? decodeAttr(match[1]) : null
}

function metaBy(html, attribute, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  const tag = tags.find((item) => attrValue(item, attribute) === key)
  return tag ? attrValue(tag, 'content') : null
}

function linkByRel(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const tag = tags.find((item) => attrValue(item, 'rel') === rel)
  return tag ? attrValue(tag, 'href') : null
}

function wordCount(html) {
  const body = html.split(/<body\b[^>]*>/i)[1]?.split(/<\/body>/i)[0] || ''
  const text = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
  return text.split(/\s+/).filter(Boolean).length
}

function h1Texts(html) {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) =>
    match[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  )
}

/**
 * @param {string} html
 * @param {{ title: string, description: string|null, canonical: string|null, robots: string, h1: string|null, expectJsonLd?: boolean, gtmId?: string|null, minWords?: number, requireContent?: boolean }} expected
 */
export function inspectPublicHtml(html, expected) {
  const problems = []
  const titles = [...html.matchAll(/<title>([^<]*)<\/title>/gi)].map((match) => decodeAttr(match[1]))
  if (titles.length !== 1) problems.push(`expected one <title>, found ${titles.length}`)
  else if (expected.title && titles[0] !== expected.title) problems.push(`title is "${titles[0]}"`)

  if (expected.title && expected.title.length >= 60) problems.push(`title is ${expected.title.length} characters`)
  if (expected.description && expected.description.length >= 155) {
    problems.push(`description is ${expected.description.length} characters`)
  }

  const description = metaBy(html, 'name', 'description')
  if (expected.description) {
    if (description !== expected.description) problems.push('description meta does not match')
  } else if (description) {
    problems.push('description meta should be absent')
  }

  const canonical = linkByRel(html, 'canonical')
  const canonicalCount = (html.match(/rel=["']canonical["']/gi) || []).length
  if (expected.canonical) {
    if (canonicalCount !== 1) problems.push(`expected one canonical, found ${canonicalCount}`)
    else if (canonical !== expected.canonical) problems.push(`canonical is "${canonical}"`)
    if (!expected.canonical.startsWith('https://virtualstudio.lmsathena.com')) {
      problems.push('canonical is not absolute')
    }
  } else if (canonicalCount) {
    problems.push('canonical should be absent')
  }

  const robots = metaBy(html, 'name', 'robots')
  if (robots !== expected.robots) problems.push(`robots is "${robots}"`)

  for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
    const present = new RegExp(`property=["']${key}["']`, 'i').test(html)
    if (expected.canonical && !present) problems.push(`missing ${key}`)
    if (!expected.canonical && present) problems.push(`${key} should be absent`)
  }
  for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    const present = new RegExp(`name=["']${key}["']`, 'i').test(html)
    if (expected.canonical && !present) problems.push(`missing ${key}`)
    if (!expected.canonical && present) problems.push(`${key} should be absent`)
  }
  if (expected.canonical && metaBy(html, 'name', 'twitter:card') !== 'summary_large_image') {
    problems.push('twitter:card is not summary_large_image')
  }

  const jsonBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  if (expected.expectJsonLd) {
    if (jsonBlocks.length !== 1) problems.push(`expected one JSON-LD block, found ${jsonBlocks.length}`)
    else {
      try {
        const data = JSON.parse(jsonBlocks[0][1])
        if (data['@type'] !== 'SoftwareApplication') problems.push('JSON-LD is not SoftwareApplication')
        if (data.name !== 'Athena Virtual Studio') problems.push('JSON-LD name is wrong')
        if (data.telephone || data.address || data.aggregateRating || data.offers) {
          problems.push('JSON-LD includes a fact that is not on the page')
        }
      } catch {
        problems.push('JSON-LD did not parse')
      }
    }
  } else if (jsonBlocks.length) {
    problems.push('JSON-LD should only be on the home page')
  }

  const headings = h1Texts(html)
  if (expected.h1) {
    if (headings.length !== 1) problems.push(`expected one h1, found ${headings.length}: ${headings.join(' | ')}`)
    else if (headings[0] !== expected.h1) problems.push(`h1 is "${headings[0]}"`)
  } else if (headings.length) {
    problems.push(`expected no h1, found ${headings.join(' | ')}`)
  }

  if (expected.requireContent) {
    const words = wordCount(html)
    const min = expected.minWords ?? 40
    if (words < min) problems.push(`body has ${words} words`)
  }

  if (expected.requireContent) {
    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])
    for (const tag of imgs) {
      const alt = tag.match(/\balt=["']([^"']*)["']/i)
      if (!alt || !alt[1].trim()) problems.push(`image missing alt: ${tag.slice(0, 140)}`)
      else if (alt[1].length > 125) problems.push(`alt longer than 125 characters: ${alt[1].slice(0, 40)}`)
    }
  }

  if (expected.gtmId) {
    const head = html.slice(html.search(/<head\b/i), html.search(/<\/head>/i))
    const bodyOpen = html.search(/<body\b[^>]*>/i)
    const bodyTag = html.slice(bodyOpen, bodyOpen + 700)
    if (!head.includes(`'${expected.gtmId}'`) && !head.includes(`id=${expected.gtmId}`)) {
      problems.push('GTM script is missing from <head>')
    }
    const gtmAt = head.indexOf('googletagmanager.com/gtm.js')
    const titleAt = head.indexOf('<title')
    if (gtmAt < 0 || (titleAt >= 0 && gtmAt > titleAt)) problems.push('GTM script is not at the top of <head>')
    if (!bodyTag.includes(`ns.html?id=${expected.gtmId}`)) problems.push('GTM noscript iframe is not at the start of <body>')
    if (/gtag\s*\(|googletagmanager\.com\/gtag\/js/i.test(html)) problems.push('gtag.js is present')
  }
  if (html.includes(GTM_REMOVED)) problems.push(`${GTM_REMOVED} is still in the HTML`)

  return problems
}
