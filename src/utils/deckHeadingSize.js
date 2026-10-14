/**
 * One heading size for every content slide in a deck.
 * Mirrors AthenaVI_backend/src/modules/presentation/artDirection/deckHeadingSize.js (applyDeckHeadingSize).
 */

const FONT_REF_WIDTH = 900
const MAIN_HEADING_SLOTS = ['HEADING', 'TITLE', 'MAIN_TITLE', 'HEADLINE']
const EXEMPT_CONTENT_TYPES = new Set(['title', 'section_divider', 'closing'])

export function resolveDeckHeadingPx(themeTokens) {
  const scale = themeTokens?.typeScale || {}
  const deckHeading = Number(scale.deckHeading)
  if (deckHeading > 0) return Math.round(deckHeading)
  const title = Number(scale.title)
  if (title > 0) return Math.round(title)
  const display = Number(scale.display)
  if (display > 0) return Math.round(display * 0.75)
  return 42
}

function isLikelyCoverLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return (
    id.startsWith('title_') ||
    id.includes('fullbleed') ||
    id.includes('hero') ||
    id.includes('statement_top') ||
    id.includes('statement_bottom')
  )
}

export function isDeckHeadingExemptLayout(schema) {
  const layoutId = String(schema?.layout_id || schema?.layoutId || '').toLowerCase()
  const contentType = String(schema?.content_type || schema?.contentType || '').toLowerCase()
  return (
    isLikelyCoverLayout(layoutId) ||
    EXEMPT_CONTENT_TYPES.has(contentType) ||
    /^(section_|closing_|thank_you)/.test(layoutId)
  )
}

function plainText(content) {
  if (typeof content?.text === 'string') return content.text
  if (Array.isArray(content?.runs)) return content.runs.map((r) => String(r?.text || '')).join('')
  return ''
}

export function findMainHeading(elements = []) {
  const texts = elements.filter((el) => el && (el.type === 'text' || el.type === 'textbox'))
  const bySlot = (ids) => texts.find((el) => ids.includes(String(el.slotId || '').toUpperCase()))
  return bySlot(MAIN_HEADING_SLOTS) || bySlot(['CHART_HEADING']) || null
}

function estimateLineCount(text, charsPerLine) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return 1
  let lines = 1
  let current = 0
  for (const word of words) {
    const len = word.length
    if (current === 0) current = len
    else if (current + 1 + len <= charsPerLine) current += 1 + len
    else {
      lines += 1
      current = len
    }
  }
  return lines
}

function requiredHeight(content, width, fontSize, canvasWidth) {
  const px = fontSize * (Math.max(canvasWidth, 320) / FONT_REF_WIDTH)
  const pad = Number(content?.padding) || 0
  const lineHeight = Number(content?.lineHeight) > 0 ? Number(content.lineHeight) : 1.2
  const charsPerLine = Math.max(1, (width - pad * 2) / (px * 0.54))
  return Math.ceil(estimateLineCount(plainText(content).trim(), charsPerLine) * px * lineHeight + pad * 2)
}

const rect = (p) => ({ x: Number(p?.x) || 0, y: Number(p?.y) || 0, w: Number(p?.width) || 0, h: Number(p?.height) || 0 })
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
const contains = (outer, inner) =>
  outer.x <= inner.x && outer.y <= inner.y && outer.x + outer.w >= inner.x + inner.w && outer.y + outer.h >= inner.y + inner.h

function growIntoFreeSpace(heading, elements, neededH, canvasHeight) {
  const box = rect(heading.placement)
  if (neededH <= box.h) return heading
  const grown = { ...box, h: Math.min(neededH, canvasHeight - box.y) }
  const blocked = elements.some((el) => {
    if (!el || el === heading || el.id === heading.id) return false
    const r = rect(el.placement)
    if (!(r.w > 0 && r.h > 0)) return false
    if (contains(r, box)) return false
    return overlaps(grown, r)
  })
  if (blocked || grown.h <= box.h) return heading
  return { ...heading, placement: { ...heading.placement, height: Math.round(grown.h) } }
}

const withFontSize = (el, size) => ({
  ...el,
  content: {
    ...el.content,
    fontSize: size,
    deckHeading: true,
    ...(Array.isArray(el.content?.runs)
      ? { runs: el.content.runs.map((r) => (r && r.fontSize ? { ...r, fontSize: size } : r)) }
      : {}),
  },
})

/**
 * Set the main heading of a compiled elements array to the deck size.
 * @param {object[]} elements
 * @param {{ schema?: object, targetPx: number, canvas?: { width?: number, height?: number } }} opts
 */
export function applyDeckHeadingSize(elements, { schema = null, targetPx, canvas = {} } = {}) {
  if (!Array.isArray(elements) || !(targetPx > 0) || isDeckHeadingExemptLayout(schema)) return elements
  const heading = findMainHeading(elements)
  if (!heading || !plainText(heading.content).trim()) return elements
  const canvasWidth = Number(canvas.width) || 1920
  const canvasHeight = Number(canvas.height) || 1080
  let next = withFontSize(heading, targetPx)
  const width = Number(next.placement?.width) || 0
  if (width > 0) {
    next = growIntoFreeSpace(next, elements, requiredHeight(next.content, width, targetPx, canvasWidth), canvasHeight)
  }
  return elements.map((el) => (el === heading ? next : el))
}

/** Mirrors backend textHierarchy.tierOf: 2 = card title/subheading, 3 = body, 4 = caption. */
function tierOf(el) {
  if (el?.content?.deckHeading) return 1
  const role = String(el?.role || '').toLowerCase()
  const sid = String(el?.slotId || '')
  if (/^(stat|metric|quote|cta)$/.test(role) || /^(stat|metric|quote|cta)/i.test(sid)) return 0
  if (/caption|eyebrow|attribution|footnote/.test(role)) return 4
  if (role === 'heading' || role === 'subheading' || /_(TITLE|HEADING|HEADER)$/i.test(sid)) return 2
  return 3
}

/** Apply the deck's harmonized tier sizes (themeTokens.typeScale.deckTiers) to a freshly compiled slide. */
export function applyDeckTierSizes(elements, { schema = null, tiers = null } = {}) {
  if (!Array.isArray(elements) || !tiers || isDeckHeadingExemptLayout(schema)) return elements
  const sizeFor = { 2: Number(tiers.t2), 3: Number(tiers.t3), 4: Number(tiers.t4) }
  return elements.map((el) => {
    if (!el || (el.type !== 'text' && el.type !== 'textbox') || !plainText(el.content).trim()) return el
    const tier = tierOf(el)
    const size = sizeFor[tier]
    if (!(size > 0)) return el
    const sized = withFontSize(el, size)
    return { ...sized, content: { ...sized.content, deckHeading: undefined, deckTier: tier } }
  })
}

/** Rebind/finalize rebuilds text at layout default sizes — keep each slot's deck tier size. */
export function preserveDeckTierSizes(previousElements, nextElements) {
  if (!Array.isArray(nextElements)) return nextElements
  const bySlot = new Map(
    (previousElements || [])
      .filter((el) => el?.content?.deckTier && el.slotId)
      .map((el) => [el.slotId, el])
  )
  if (!bySlot.size) return nextElements
  return nextElements.map((el) => {
    const prev = bySlot.get(el?.slotId)
    if (!prev || el.type !== 'text') return el
    const sized = withFontSize(el, Number(prev.content.fontSize))
    return { ...sized, content: { ...sized.content, deckHeading: undefined, deckTier: prev.content.deckTier } }
  })
}

/** Rebind/finalize may rebuild the heading with a layout's hardcoded size — keep the deck size it had. */
export function preserveDeckHeadingSize(previousElements, nextElements) {
  if (!Array.isArray(nextElements)) return nextElements
  const prev = (previousElements || []).find((el) => el?.content?.deckHeading === true)
  const size = Number(prev?.content?.fontSize)
  if (!(size > 0)) return nextElements
  const heading = findMainHeading(nextElements)
  if (!heading || Number(heading.content?.fontSize) === size) return nextElements
  return nextElements.map((el) => (el === heading ? withFontSize(el, size) : el))
}
