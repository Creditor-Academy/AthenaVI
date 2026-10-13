/**
 * Rebind slide.content onto existing canvas elements (geometry preserved).
 */
import { textForSlot, coerceSlotText } from './contentContract.js'
import { buildContentBySlotIdFromSlideContent } from './contentSlotMapping.js'
import { isCatalogPlaceholderText } from './catalogPlaceholder.js'

function isEmptyCanvasText(text) {
  const t = String(text || '').trim()
  if (!t) return true
  return isCatalogPlaceholderText(t) || /^double-?click to edit$/i.test(t)
}

function mayReplaceText(current, forceReplace = false) {
  if (forceReplace) return true
  if (isEmptyCanvasText(current)) return true
  if (isCatalogPlaceholderText(current)) return true
  if (/^option [ab]$/i.test(String(current || '').trim())) return true
  return false
}

/**
 * @param {Array} elements
 * @param {object} content
 * @param {object} layoutSchema
 * @param {{ forceTextReplace?: boolean, palette?: object, canvas?: object }} opts
 * @returns {Array}
 */
export function rebindSlideContent(elements = [], content = {}, layoutSchema = null, opts = {}) {
  const forceTextReplace = opts.forceTextReplace === true
  const contentBySlotId = buildContentBySlotIdFromSlideContent(content, layoutSchema)

  const next = (Array.isArray(elements) ? elements : []).map((el) => ({
    ...el,
    content: el.content ? { ...el.content } : {},
    placement: el.placement ? { ...el.placement } : el.placement,
  }))

  for (const el of next) {
    const slotId = String(el.slotId || el.id || '')
    if (!slotId) continue

    if (el.type === 'text' || el.type === 'textbox') {
      let mapped =
        contentBySlotId[slotId] ??
        contentBySlotId[slotId.toUpperCase()] ??
        contentBySlotId[slotId.toLowerCase()]
      if (mapped == null) {
        mapped = coerceSlotText(textForSlot(slotId, content, layoutSchema))
      }
      const value = String(mapped ?? '').trim()
      if (value && mayReplaceText(el.content?.text, forceTextReplace)) {
        el.content = { ...(el.content || {}), text: value }
      }
      continue
    }

    if (el.type === 'chart') {
      const saved = contentBySlotId[`${slotId}__chart`]
      if (saved && typeof saved === 'object') {
        el.content = { ...(el.content || {}), ...saved, data: saved.data || saved }
      }
    }

    if (el.type === 'image') {
      const url = contentBySlotId[`${slotId}__url`] || content?.slotImageUrls?.[slotId]
      if (url && !el.content?.url && !el.content?.src) {
        el.content = { ...(el.content || {}), url, src: url }
      }
    }
  }

  return next
}

/**
 * Rebind copy then run shape finalizers (no full slot recompile).
 */
export async function rebindAndFinalizeSlideElements(
  elements = [],
  content = {},
  layoutSchema = null,
  { palette = {}, canvas = {}, forceTextReplace = false } = {}
) {
  let next = rebindSlideContent(elements, content, layoutSchema, { forceTextReplace, palette, canvas })
  const canvasBox = {
    width: canvas.width || 1920,
    height: canvas.height || 1080,
    slideContent: content,
  }
  const { finalizeTimelineShapes } = await import('./timelineShapeFinalize.js')
  const { finalizeChartShapes } = await import('./chartShapeFinalize.js')
  next = finalizeTimelineShapes(next, layoutSchema, palette, canvasBox)
  next = finalizeChartShapes(next, layoutSchema, palette, canvasBox)
  // Diagram finalizers rebuild the heading at their hardcoded size — keep the deck heading size.
  const { preserveDeckHeadingSize } = await import('./deckHeadingSize.js')
  return preserveDeckHeadingSize(elements, next)
}

export function slideContentHasStructuredCopy(content) {
  if (!content || typeof content !== 'object') return false
  return Boolean(
    String(content.title || '').trim() ||
      String(content.body || content.summary || '').trim() ||
      (Array.isArray(content.bullets) && content.bullets.length) ||
      (Array.isArray(content.columns) && content.columns.length) ||
      (Array.isArray(content.timeline) && content.timeline.length) ||
      (Array.isArray(content.milestones) && content.milestones.length) ||
      (content.comparison && typeof content.comparison === 'object') ||
      (Array.isArray(content.comparisonRows) && content.comparisonRows.length) ||
      (content.left && typeof content.left === 'object') ||
      (content.right && typeof content.right === 'object') ||
      (Array.isArray(content.plans) && content.plans.length) ||
      (Array.isArray(content.stats) && content.stats.length) ||
      (Array.isArray(content.metrics) && content.metrics.length) ||
      (content.chart && typeof content.chart === 'object') ||
      (content.table && typeof content.table === 'object')
  )
}

export function countPlaceholderHeavyTextSlots(elements = [], schema = null) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const textSlotIds = new Set(
    slots
      .filter((s) => {
        const role = String(s.role || '').toLowerCase()
        return role !== 'image' && role !== 'chart' && role !== 'decoration' && role !== 'background'
      })
      .map((s) => String(s.id || '').toUpperCase())
  )
  let placeholders = 0
  let filled = 0
  for (const el of elements) {
    if (el.type !== 'text' && el.type !== 'textbox') continue
    const sid = String(el.slotId || '').toUpperCase()
    if (textSlotIds.size && sid && !textSlotIds.has(sid)) continue
    const text = el.content?.text
    if (isEmptyCanvasText(text)) placeholders += 1
    else filled += 1
  }
  return { placeholders, filled }
}
