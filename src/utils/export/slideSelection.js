/**
 * Which slides an export covers, image options, file names, and the choices remembered per
 * deck. No DOM, so it runs in node tests.
 */

export const EXPORT_SCOPES = ['all', 'current', 'custom']
export const IMAGE_SCALES = [1, 2, 3]
export const DEFAULT_JPEG_QUALITY = 90

const FORMATS = ['PPTX', 'PDF', 'PNG', 'JPEG']
const PPTX_TARGETS = ['powerpoint', 'google-slides']

/** Slide ids in deck order. */
function idsInDeckOrder(slides, ids) {
  const wanted = new Set(ids)
  return (slides || []).map((s) => s?.id).filter((id) => id && wanted.has(id))
}

/**
 * The slides to export.
 * @returns {{ slideIds: string[] | null, count: number, error: string | null }} slideIds null =
 *   the whole deck.
 */
export function resolveExportSelection({ scope = 'all', slides = [], currentSlideId = null, selectedIds = [] } = {}) {
  const list = Array.isArray(slides) ? slides.filter((s) => s?.id) : []
  if (!list.length) return { slideIds: null, count: 0, error: 'This presentation has no slides to export.' }
  if (scope === 'current') {
    if (!currentSlideId || !list.some((s) => s.id === currentSlideId)) {
      return { slideIds: null, count: 0, error: 'Pick a slide in the editor first.' }
    }
    return { slideIds: [currentSlideId], count: 1, error: null }
  }
  if (scope === 'custom') {
    const ids = idsInDeckOrder(list, selectedIds || [])
    if (!ids.length) return { slideIds: null, count: 0, error: 'Select at least one slide.' }
    // Every slide picked is the whole deck: no need to send the list.
    if (ids.length === list.length) return { slideIds: null, count: ids.length, error: null }
    return { slideIds: ids, count: ids.length, error: null }
  }
  return { slideIds: null, count: list.length, error: null }
}

/**
 * Click on a slide in the picker. A plain click toggles it; a shift-click selects every slide
 * between the last one clicked (`anchorId`) and this one. The result is in deck order.
 */
export function toggleSlideSelection(selectedIds, slides, slideId, { range = false, anchorId = null } = {}) {
  const order = (slides || []).map((s) => s?.id).filter(Boolean)
  const current = new Set(selectedIds || [])
  const to = order.indexOf(slideId)
  if (to < 0) return idsInDeckOrder(slides, [...current])
  const from = range && anchorId ? order.indexOf(anchorId) : -1
  if (from >= 0) {
    const [a, b] = from < to ? [from, to] : [to, from]
    for (let i = a; i <= b; i += 1) current.add(order[i])
  } else if (current.has(slideId)) {
    current.delete(slideId)
  } else {
    current.add(slideId)
  }
  return idsInDeckOrder(slides, [...current])
}

/** The backend's file base name: letters, digits, spaces, dots and dashes; at most 80. */
export function exportFileBase(name) {
  return (
    String(name || 'presentation')
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'presentation'
  )
}

/** `<Deck>-slide-03.png`, numbered by the slide's position in the deck (same as the server). */
export function slideImageFilename(deckName, position, ext) {
  return `${exportFileBase(deckName)}-slide-${String(position).padStart(2, '0')}.${ext}`
}

/** Pixel size of a slide image: the canvas size times the chosen scale. */
export function imagePixelSize(canvas, scale = 1) {
  const s = IMAGE_SCALES.includes(Number(scale)) ? Number(scale) : 1
  const width = Number(canvas?.width) || 1920
  const height = Number(canvas?.height) || 1080
  return { width: Math.round(width * s), height: Math.round(height * s) }
}

/** Slide images held in browser memory at once: slide count × scale². 40 = a full 40-slide deck
 * at 1×, 10 slides at 2×, 4 at 3×. Bigger exports go to the server.
 */
export const BROWSER_IMAGE_BUDGET = 40

/**
 * Extract a concise title or heading text from a slide's elements for Canva-style list displays.
 */
export function getSlideTitle(slide, index = 0) {
  if (!slide) return `Slide ${index + 1}`
  const elements = slide.elements || slide.canvas?.elements || []
  const titleEl = elements.find(
    (el) =>
      el?.role === 'title' ||
      el?.role === 'heading' ||
      String(el?.slotId || '').toUpperCase().includes('TITLE') ||
      String(el?.slotId || '').toUpperCase().includes('HEADING')
  )
  const text = String(titleEl?.content?.text || '').trim().replace(/\s+/g, ' ')
  if (text && text.toLowerCase() !== 'untitled presentation' && text.toLowerCase() !== 'untitled') {
    return text.slice(0, 50)
  }
  return `Slide ${index + 1}`
}

/**
 * Parse a human-entered page range string like "1-3, 5, 8" into an array of 1-based page numbers.
 * @param {string} raw
 * @param {number} totalCount
 * @returns {number[]} sorted unique 1-based page numbers
 */
export function parsePageRange(raw, totalCount = 0) {
  const str = String(raw || '').trim().toLowerCase()
  if (!str) return []
  if (str === 'all') {
    return Array.from({ length: totalCount }, (_, i) => i + 1)
  }
  const parts = str.split(/[,;\s]+/)
  const result = new Set()
  for (const part of parts) {
    if (!part) continue
    const rangeMatch = part.match(/^(\d+)\s*[-–—]\s*(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      if (Number.isFinite(start) && Number.isFinite(end)) {
        const [low, high] = start <= end ? [start, end] : [end, start]
        for (let p = Math.max(1, low); p <= Math.min(totalCount || high, high); p += 1) {
          result.add(p)
        }
      }
    } else {
      const num = parseInt(part, 10)
      if (Number.isFinite(num) && num >= 1 && (!totalCount || num <= totalCount)) {
        result.add(num)
      }
    }
  }
  return [...result].sort((a, b) => a - b)
}

/**
 * Format a list of 1-based page numbers into a compact range string like "1-3, 5, 8".
 * @param {number[]} pageNumbers
 * @param {number} totalCount
 * @returns {string}
 */
export function formatPageRange(pageNumbers = [], totalCount = 0) {
  const sorted = [...new Set(pageNumbers)].filter((n) => Number.isFinite(n) && n >= 1).sort((a, b) => a - b)
  if (!sorted.length) return ''
  if (totalCount > 0 && sorted.length === totalCount) return `All pages (1-${totalCount})`

  const ranges = []
  let rangeStart = sorted[0]
  let prev = sorted[0]

  for (let i = 1; i < sorted.length; i += 1) {
    const cur = sorted[i]
    if (cur === prev + 1) {
      prev = cur
    } else {
      ranges.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`)
      rangeStart = cur
      prev = cur
    }
  }
  ranges.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`)
  return ranges.join(', ')
}

/**
 * Map slide IDs to 1-based page numbers in deck order.
 */
export function pageNumbersFromSlideIds(slides, slideIds) {
  const set = new Set(slideIds || [])
  const nums = []
  ;(slides || []).forEach((s, idx) => {
    if (s?.id && set.has(s.id)) nums.push(idx + 1)
  })
  return nums
}

/**
 * Map 1-based page numbers to slide IDs in deck order.
 */
export function slideIdsFromPageNumbers(slides, pageNumbers) {
  const nums = new Set(pageNumbers || [])
  const ids = []
  ;(slides || []).forEach((s, idx) => {
    if (s?.id && nums.has(idx + 1)) ids.push(s.id)
  })
  return ids
}

/** Make these slide images in the browser (true) or on the server (false)? */
export function shouldCaptureInBrowser({ count, scale = 1 } = {}) {
  const n = Number(count) || 0
  const s = IMAGE_SCALES.includes(Number(scale)) ? Number(scale) : 1
  return n > 0 && n * s * s <= BROWSER_IMAGE_BUDGET
}

export function exportPrefsKey(presentationId) {
  return `athena.pptExport.${presentationId || 'deck'}`
}

function defaultStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

/** The last choices made for this deck, cleaned up; {} when there are none or storage is off. */
export function loadExportPrefs(presentationId, storage = defaultStorage()) {
  let raw = null
  try {
    raw = storage?.getItem(exportPrefsKey(presentationId)) ?? null
  } catch {
    return {}
  }
  if (!raw) return {}
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!data || typeof data !== 'object') return {}
  const out = {}
  if (FORMATS.includes(data.format)) out.format = data.format
  if (PPTX_TARGETS.includes(data.pptxTarget)) out.pptxTarget = data.pptxTarget
  if (EXPORT_SCOPES.includes(data.scope)) out.scope = data.scope
  if (Array.isArray(data.selectedIds)) {
    out.selectedIds = data.selectedIds.filter((id) => typeof id === 'string').slice(0, 200)
  }
  if (IMAGE_SCALES.includes(Number(data.scale))) out.scale = Number(data.scale)
  const q = Number(data.quality)
  if (Number.isFinite(q) && q >= 60 && q <= 100) out.quality = Math.round(q)
  if (typeof data.transparent === 'boolean') out.transparent = data.transparent
  return out
}

export function saveExportPrefs(presentationId, prefs, storage = defaultStorage()) {
  try {
    storage?.setItem(exportPrefsKey(presentationId), JSON.stringify(prefs || {}))
    return true
  } catch {
    return false
  }
}
