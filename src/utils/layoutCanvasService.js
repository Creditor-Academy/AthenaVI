import presentationService from '../services/presentationService'
import {
  compileDeckLayoutToElements,
  buildThemeCompileOptions,
  hasOverlappingTextPlacements,
  isTextLayoutRole,
} from './compileDeckLayoutToElements'
import { buildContentBySlotIdFromSlideContent, mergeContentBySlotId } from './contentSlotMapping'
import { isCatalogPlaceholderText } from './catalogPlaceholder'
import {
  buildLayoutSchemaMap,
  getDeckLayoutSchema,
  resolveLayoutSchemaById,
} from './deckLayoutRegistry'
import { parseRegion } from './layoutPreviewUtils'
import { buildCanvasDoc, resolveCanvasSize } from './presentationHelpers'
import { layoutSchemaHasCanvasElements, resolveLayoutCanvasElementsDoc } from './videoTemplateToCanvasElements'

function unwrapTemplateList(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.templates || payload?.data || []
}

export function buildLayoutSchemaMapFromTemplates(templates = []) {
  const map = buildLayoutSchemaMap(
    templates
      .filter(
        (template) =>
          template?.schema?.slots?.length
          || template?.schema?.layout_id
          || layoutSchemaHasCanvasElements(template?.schema)
      )
      .map((template) => ({ schema: template.schema }))
  )

  for (const template of templates) {
    const layoutId = String(template?.schema?.layout_id || '').trim()
    if (!layoutId || map[layoutId]) continue
    const registered = getDeckLayoutSchema(layoutId)
    if (registered) map[layoutId] = registered
  }

  return map
}

export function resolveLayoutTemplateRecord(templateId, layoutTemplates = []) {
  const key = String(templateId || '').trim()
  if (!key) return null
  return (
    layoutTemplates.find(
      (template) =>
        String(template.id || template.templateId || '') === key ||
        String(template.templateId || '') === key
    ) || null
  )
}

export async function fetchLayoutSchemaMap(workspaceId) {
  if (!workspaceId) return {}
  try {
    const payload = await presentationService.listTemplates(workspaceId)
    const templates = unwrapTemplateList(payload).filter(
      (template) =>
        template?.type === 'DECK_LAYOUT' ||
        template?.schema?.layout_id ||
        String(template?.contentType || '').toLowerCase() === 'layout'
    )
    return buildLayoutSchemaMapFromTemplates(templates)
  } catch {
    return {}
  }
}

export async function resolveLayoutSchema({
  workspaceId,
  templateId,
  layoutId,
  schema,
  layoutSchemaMap = {},
}) {
  if (schema?.slots?.length || layoutSchemaHasCanvasElements(schema)) return schema

  const key = String(layoutId || '').trim()
  if (key) {
    const fromMap = resolveLayoutSchemaById(key, layoutSchemaMap)
    if (fromMap?.slots?.length || layoutSchemaHasCanvasElements(fromMap)) return fromMap
    const registered = getDeckLayoutSchema(key)
    if (registered?.slots?.length || layoutSchemaHasCanvasElements(registered)) return registered
  }

  if (templateId && workspaceId) {
    try {
      const row = await presentationService.getTemplate(workspaceId, templateId)
      const resolved = row?.schema || row?.data?.schema || row?.template?.schema
      if (resolved?.slots?.length || layoutSchemaHasCanvasElements(resolved)) return resolved
    } catch {
      // fall through
    }
  }

  return null
}

function sortSlotsByPosition(slots) {
  return [...slots].sort((a, b) => {
    const ra = parseRegion(a.region)
    const rb = parseRegion(b.region)
    if (!ra && !rb) return 0
    if (!ra) return 1
    if (!rb) return -1
    if (ra.r1 !== rb.r1) return ra.r1 - rb.r1
    if (ra.c1 !== rb.c1) return ra.c1 - rb.c1
    return String(a.id).localeCompare(String(b.id))
  })
}

/** Pull slot text from existing canvas elements (e.g. after broken apply-layout or AI generate). */
export function extractContentBySlotFromElements(elements = [], schema) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const bySlotId = {}

  for (const el of elements) {
    const slotId = el?.slotId || el?.meta?.slotId || el?.content?.slotId
    if (!slotId) continue
    if (el.type === 'text' && el.content?.text != null) {
      const text = String(el.content.text).trim()
      if (text && !isCatalogPlaceholderText(text)) {
        bySlotId[slotId] = text
      }
    }
    if (el.type === 'image' && (el.content?.url || el.content?.src)) {
      bySlotId[`${slotId}__url`] = el.content.url || el.content.src
    }
    if (el.type === 'chart' && el.content) {
      bySlotId[`${slotId}__chart`] = el.content
    }
  }
  if (Object.keys(bySlotId).length) return bySlotId

  const textSlots = sortSlotsByPosition(slots.filter((slot) => isTextLayoutRole(slot.role)))
  const textEls = elements
    .filter((el) => el.type === 'text' && String(el.content?.text || '').trim())
    .sort((a, b) => {
      const ay = a.placement?.y ?? 0
      const by = b.placement?.y ?? 0
      if (ay !== by) return ay - by
      return (a.placement?.x ?? 0) - (b.placement?.x ?? 0)
    })

  if (!textSlots.length || !textEls.length) return bySlotId

  const uniqueTexts = new Set(textEls.map((el) => String(el.content.text).trim()))
  if (uniqueTexts.size <= 1 && textEls.length > 2) return bySlotId

  textSlots.forEach((slot, index) => {
    const el = textEls[index]
    if (el?.content?.text == null) return
    const text = String(el.content.text).trim()
    if (!text) return
    const uniqueCount = new Set(textEls.map((item) => String(item.content?.text || '').trim())).size
    if (uniqueCount <= 1 && textEls.length > 2) return
    if (/insights chart|grid insights/i.test(text) && slot.role === 'caption') return
    bySlotId[slot.id] = text
  })

  for (const el of elements) {
    if (el.type !== 'image') continue
    const url = el.content?.url || el.content?.src
    if (!url) continue
    const imageSlots = slots.filter((slot) => slot.role === 'image')
    const match = imageSlots.find((slot) => {
      const reg = parseRegion(slot.region)
      if (!reg || !el.placement) return false
      const ex = el.placement.x ?? 0
      const ey = el.placement.y ?? 0
      return Math.abs(ex - reg.c1 * 160) < 200 && Math.abs(ey - reg.r1 * 108) < 200
    })
    if (match) bySlotId[`${match.id}__url`] = url
  }

  return bySlotId
}

export function needsLayoutCanvasRepair(slide, elements = [], schema = null, opts = {}) {
  if (slide?.manuallyEdited) return false

  const list = Array.isArray(elements) ? elements : []
  if (opts?.deckPackId) {
    return hasOverlappingTextPlacements(list)
  }
  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  if (slots.length && !list.length) return true
  if (!list.length) return false

  if (hasOverlappingTextPlacements(list)) return true
  if (needsLegacyBrokenLayout(list, slide?.title)) return true
  if (needsContentHydration(slide, list)) return true

  return false
}

function isEmptyCanvasText(text) {
  const t = String(text || '').trim()
  if (!t) return true
  return isCatalogPlaceholderText(t) || /^double-?click to edit$/i.test(t)
}

function needsContentHydration(slide, elements = []) {
  const content = slide?.content && typeof slide.content === 'object' ? slide.content : {}
  const hasCopy = Boolean(
    String(content.body || content.summary || content.cta || content.subtitle || '').trim() ||
      (Array.isArray(content.bullets) && content.bullets.length) ||
      (Array.isArray(content.columns) && content.columns.length) ||
      content.chart
  )
  if (hasCopy) {
    const emptyText = elements.some(
      (el) =>
        (el.type === 'text' || el.type === 'textbox') &&
        isEmptyCanvasText(el.content?.text) &&
        !/heading|title/i.test(String(el.role || el.slotId || ''))
    )
    if (emptyText) return true
  }

  const hasImageSource = Boolean(
    slide?.imageRef?.url ||
      content.imageRef?.url ||
      content.imageUrl ||
      (content.slotImageUrls && Object.values(content.slotImageUrls).some(Boolean)) ||
      (Array.isArray(content.imageUrls) && content.imageUrls.some(Boolean))
  )
  if (hasImageSource) {
    const missingImage = elements.some(
      (el) => el.type === 'image' && !el.content?.url && !el.content?.src
    )
    if (missingImage) return true
  }

  if (content.chart && typeof content.chart === 'object') {
    const chartEl = elements.find((el) => el.type === 'chart')
    const values =
      chartEl?.content?.data?.series?.[0]?.values ||
      chartEl?.content?.series?.[0]?.values ||
      chartEl?.content?.values ||
      []
    if (chartEl && (!Array.isArray(values) || !values.length)) return true
    if (!chartEl) return true
  }

  return false
}

function needsLegacyBrokenLayout(list, slideTitle = '') {
  const textEls = list.filter((el) => el.type === 'text')
  if (textEls.length < 2) return false

  const titleNorm = String(slideTitle || '').trim().toLowerCase()
  if (titleNorm) {
    const dupTitleCount = textEls.filter(
      (el) => String(el.content?.text || '').trim().toLowerCase() === titleNorm
    ).length
    if (dupTitleCount >= 2) return true
  }

  const buckets = new Map()
  for (const el of textEls) {
    const x = Math.round((el.placement?.x ?? 0) / 40)
    const y = Math.round((el.placement?.y ?? 0) / 40)
    const key = `${x},${y}`
    buckets.set(key, (buckets.get(key) || 0) + 1)
  }
  if ([...buckets.values()].some((count) => count >= 3)) return true

  const tinyText = textEls.filter(
    (el) => (el.placement?.width ?? 0) < 80 || (el.placement?.height ?? 0) < 20
  )
  if (tinyText.length >= Math.ceil(textEls.length / 2)) return true

  return false
}

export async function applyCompiledLayoutToSlide({
  workspaceId,
  presentationId,
  slideId,
  templateId,
  layoutId,
  schema,
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  palette = null,
  themeTokens = null,
  fonts = null,
  typeScale = null,
  slideTitle = '',
  slideContent = null,
  mergeFromElements = [],
  skipSave = false,
}) {
  if (!workspaceId || !presentationId || !slideId) return null

  const resolvedSchema = await resolveLayoutSchema({
    workspaceId,
    templateId,
    layoutId,
    schema,
    layoutSchemaMap,
  })
  if (layoutSchemaHasCanvasElements(resolvedSchema) && !resolvedSchema?.slots?.length) {
    const elementsDoc = resolveLayoutCanvasElementsDoc(resolvedSchema)
    const canvasDoc = buildCanvasDoc(
      { elements: elementsDoc },
      {
        aspectRatio,
        elements: elementsDoc.elements || [],
      }
    )
    if (skipSave) return canvasDoc

    const result = await presentationService.saveCanvas(
      workspaceId,
      presentationId,
      slideId,
      canvasDoc
    )
    return result
  }

  if (!resolvedSchema?.slots?.length) return null

  const canvas = resolveCanvasSize(null, aspectRatio)
  const content = {
    ...(slideContent && typeof slideContent === 'object' ? slideContent : {}),
    ...(slideTitle && !(slideContent && slideContent.title) ? { title: slideTitle } : {}),
  }
  const extracted = extractContentBySlotFromElements(mergeFromElements, resolvedSchema)
  const contentBySlotId = mergeContentBySlotId(
    buildContentBySlotIdFromSlideContent(content, resolvedSchema),
    extracted
  )
  const compileOptions = buildThemeCompileOptions(themeTokens, {
    palette,
    fonts,
    typeScale,
  })
  const elements = compileDeckLayoutToElements(resolvedSchema, {
    canvas,
    ...compileOptions,
    contentBySlotId,
    content,
  })

  const canvasDoc = buildCanvasDoc(null, {
    aspectRatio,
    elements,
    backgroundColor: compileOptions.palette?.bg || palette?.bg || null,
  })
  if (skipSave) return canvasDoc

  const result = await presentationService.saveCanvas(
    workspaceId,
    presentationId,
    slideId,
    canvasDoc
  )
  return result
}

export async function repairPresentationLayoutSlides({
  workspaceId,
  presentationId,
  slides = [],
  layoutSchemaMap = {},
  aspectRatio = '16:9',
  palette = null,
  themeTokens = null,
  deckPackId = null,
}) {
  const repairs = []

  for (const slide of slides) {
    const layoutId = slide?.layoutId || slide?.layout_id
    if (!layoutId) continue

    const elements = slide?.elements?.elements || []
    const schema = await resolveLayoutSchema({
      workspaceId,
      layoutId,
      layoutSchemaMap,
    })
    if (!schema?.slots?.length) continue
    if (!needsLayoutCanvasRepair(slide, elements, schema, { deckPackId })) continue

    repairs.push(
      applyCompiledLayoutToSlide({
        workspaceId,
        presentationId,
        slideId: slide.id,
        layoutId,
        schema,
        layoutSchemaMap,
        aspectRatio,
        palette,
        themeTokens,
        slideTitle: slide.title,
        slideContent: {
          ...(slide.content || slide.placeholder || {}),
          imageRef: slide.imageRef || slide.content?.imageRef || null,
        },
        mergeFromElements: elements,
      })
    )
  }

  if (!repairs.length) return false
  await Promise.all(repairs)
  return true
}
