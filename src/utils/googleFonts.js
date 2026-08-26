/**
 * Load Google Font stylesheets for canvas / editor / share rendering.
 */

const GENERIC_FAMILIES = new Set(['sans-serif', 'serif', 'monospace', 'system-ui', 'cursive', 'fantasy'])

function stylesheetIdFromHref(href) {
  let hash = 0
  const s = String(href || '')
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  }
  return `gf-href-${hash.toString(36)}`
}

function familyLinkId(fontFamily) {
  const cleanName = String(fontFamily || '')
    .trim()
    .replace(/['"]/g, '')
  return `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`
}

/** Extract primary family from a CSS stack, e.g. `"Inter, sans-serif"` → `Inter`. */
export function extractPrimaryFontFamily(stored) {
  if (!stored) return ''
  const first = String(stored).split(',')[0] || ''
  return first.trim().replace(/^["']|["']$/g, '')
}

/**
 * Inject a stylesheet link into document.head (deduped by id or href).
 * @param {string} href
 * @param {string} [id]
 */
export function injectStylesheet(href, id) {
  if (typeof document === 'undefined') return
  if (!href) return
  const linkId = id || stylesheetIdFromHref(href)
  if (document.getElementById(linkId)) return
  const links = document.querySelectorAll('link[rel="stylesheet"]')
  for (const node of links) {
    if (node.getAttribute('href') === href) return
  }
  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

/** Inject deck-level fontCssUrl from presentation / public share payloads. */
export function ensureFontCssUrl(fontCssUrl) {
  if (typeof document === 'undefined') return
  if (!fontCssUrl) return
  const id = 'deck-font-css-url'
  const existing = document.getElementById(id)
  if (existing) {
    if (existing.getAttribute('href') === fontCssUrl) return
    existing.setAttribute('href', fontCssUrl)
    return
  }
  injectStylesheet(fontCssUrl, id)
}

/**
 * Load a single Google Font by family name (builds CSS2 URL).
 * Prefer injectStylesheet(font.cssUrl) when catalog meta is available.
 */
export function ensureGoogleFontLoaded(fontFamily) {
  if (typeof document === 'undefined') return
  const cleanName = extractPrimaryFontFamily(fontFamily)
  if (!cleanName || GENERIC_FAMILIES.has(cleanName.toLowerCase())) return
  const id = familyLinkId(cleanName)
  if (document.getElementById(id)) return
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
  injectStylesheet(href, id)
}

export function ensureThemeFontsLoaded(themeTokens) {
  const fonts = themeTokens?.fonts
  if (!fonts) return
  ;[fonts.heading, fonts.subheading, fonts.body, fonts.tertiary]
    .filter(Boolean)
    .forEach(ensureGoogleFontLoaded)
}

/** Load arbitrary element override families (bare names or stacks). */
export function ensureElementFontsLoaded(families = []) {
  const seen = new Set()
  for (const raw of families) {
    const family = extractPrimaryFontFamily(raw)
    if (!family) continue
    const key = family.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    ensureGoogleFontLoaded(family)
  }
}

/**
 * Collect fontFamily strings from PPT slide elements (content / runs / style).
 * @param {Array} slides
 * @returns {string[]}
 */
export function collectSlideFontFamilies(slides = []) {
  const out = []
  for (const slide of slides) {
    const elements = slide?.elements?.elements || slide?.elements || []
    if (!Array.isArray(elements)) continue
    for (const el of elements) {
      const c = el?.content
      if (c?.fontFamily) out.push(c.fontFamily)
      if (Array.isArray(c?.runs)) {
        for (const run of c.runs) {
          if (run?.fontFamily) out.push(run.fontFamily)
        }
      }
      if (el?.style?.fontFamily) out.push(el.style.fontFamily)
    }
  }
  return out
}

export function themeFontFamilies(themeTokens) {
  const fonts = themeTokens?.fonts || {}
  return {
    headerFont: fonts.heading || fonts.subheading || 'Inter',
    bodyFont: fonts.body || fonts.subheading || fonts.heading || 'Inter',
  }
}
