/** Caps from PRESENTATION_FRONTEND_INTEGRATION */
import { SHAPE_LIBRARY } from '../constants/shapeLibrary'

export const PPT_CAPS = {
  AI_SLIDE_MIN: 5,
  AI_SLIDE_MAX: 20,
  DECK_MAX_SLIDES: 40,
  ELEMENTS_PER_SLIDE: 50,
}

export const PPT_AI_SLIDE_COUNTS = [5, 8, 10, 12, 15, 20]

export const PPT_EXPORT_FORMATS = ['PPTX', 'PDF', 'PNG', 'JPEG']

/** PPT canvas pixel sizes (stage must follow slide.elements.canvas). */
export const PPT_CANVAS_SIZES = {
  '16:9': { width: 1920, height: 1080 },
  '4:3': { width: 1600, height: 1200 },
}

export const DEFAULT_SLIDE_BG = '#FFFFFF'

export function isSlideBackgroundElement(el, slide) {
  if (!el) return false
  if (el.content?.useAsBackground) return true
  return Boolean(slide?.backgroundImageElementId && el.id === slide.backgroundImageElementId)
}

export function resolveSlideStageBackground(slide, fallback = DEFAULT_SLIDE_BG) {
  const color = slide?.backgroundColor || fallback
  if (slide?.backgroundImage) {
    const fit = slide.backgroundImageFit || 'cover'
    return {
      backgroundColor: color,
      backgroundImage: `url(${slide.backgroundImage})`,
      backgroundSize: fit === 'fill' ? '100% 100%' : fit,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  if (slide?.backgroundGradientStart && slide?.backgroundGradientEnd) {
    return {
      background: `linear-gradient(135deg, ${slide.backgroundGradientStart}, ${slide.backgroundGradientEnd})`,
    }
  }
  return { background: color }
}

const SHAPE_ALIAS = {
  square: 'rect',
  'triangle-up': 'triangle',
  'triangle-down': 'triangle',
  plus: 'plus',
  // Legacy broken alias — map old saved shapes to a real library entry
  arrows: 'arrow-right',
}

const LEGACY_SHAPE_IDS = {
  arrows: 'arrow-right',
}

const FALLBACK_CLIP = {
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
}

const FALLBACK_RADIUS = {
  circle: '50%',
  ellipse: '50%',
  pill: 999,
  'rounded-rect': 12,
}

function getShapeLibraryEntry(shapeId) {
  const id = String(shapeId || 'rect')
  const legacy = LEGACY_SHAPE_IDS[id]
  return SHAPE_LIBRARY.find((s) => s.id === id) || (legacy ? SHAPE_LIBRARY.find((s) => s.id === legacy) : null)
}

function parseShapeRadius(value) {
  if (value == null) return undefined
  if (typeof value === 'number') return value
  const raw = String(value).trim()
  if (!raw) return undefined
  if (raw.includes('%') || raw.includes('/') || raw.includes(' ')) return raw
  if (raw.endsWith('px')) return parseFloat(raw) || 0
  if (raw === '999' || raw.includes('999')) return 999
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

function isHorizontalLineShape(entry, shapeId) {
  const id = String(shapeId || '')
  if (entry?.category === 'lines' && entry.style?.clipPath) return false
  if (entry?.style?.height === '0px' && entry.style?.borderTop) return true
  return /^line-(solid|dashed|dotted)$/.test(id)
}

function resolveLineBorder(content, entry, fill, stroke, isOutlined) {
  const libBorder = entry?.style?.borderTop || '4px solid currentColor'
  const match = libBorder.match(/^(\d+(?:\.\d+)?)px\s+(solid|dashed|dotted)\s+/i)
  const width = content.strokeWidth != null ? content.strokeWidth : match ? Number(match[1]) : 4
  const style = match?.[2]?.toLowerCase() || 'solid'
  const color = isOutlined ? stroke || fill : fill
  return `${width}px ${style} ${color}`
}

/** Resolve stage pixels from slide.elements.canvas, then aspectRatio, then 16:9. */
export function resolveCanvasSize(slideOrDoc, aspectRatio = '16:9') {
  const canvas =
    slideOrDoc?.elements?.canvas ||
    slideOrDoc?.canvas ||
    null
  const width = Number(canvas?.width)
  const height = Number(canvas?.height)
  if (width > 0 && height > 0) return { width, height }

  const key = String(aspectRatio || '16:9')
  if (PPT_CANVAS_SIZES[key]) return { ...PPT_CANVAS_SIZES[key] }
  // Map legacy tall ratios to closest supported PPT size
  if (key === '9:16') return { ...PPT_CANVAS_SIZES['16:9'] }
  return { ...PPT_CANVAS_SIZES['16:9'] }
}

const DENSITY_MAP = {
  Minimal: 'concise',
  Concise: 'concise',
  Balanced: 'balanced',
  Detailed: 'detailed',
  Extensive: 'detailed',
  minimal: 'concise',
  concise: 'concise',
  balanced: 'balanced',
  detailed: 'detailed',
  extensive: 'detailed',
}

/** Flatten voice/tone/audience into a single prompt string (no nested prompt object). */
export function flattenPresentationPrompt({
  title = '',
  outline = '',
  tone = '',
  audience = '',
  purpose = '',
  mediaStyle = '',
  textAmount = '',
  imageSource = '',
} = {}) {
  const parts = []
  if (title?.trim()) parts.push(`Title: ${title.trim()}`)
  if (outline?.trim()) parts.push(`Brief / notes: ${outline.trim()}`)
  if (tone) parts.push(`Tone / voice: ${tone}`)
  if (audience) parts.push(`Audience: ${audience}`)
  if (purpose) parts.push(`Purpose: ${purpose}`)
  if (mediaStyle) parts.push(`Image style: ${mediaStyle}`)
  if (imageSource) parts.push(`Image source preference: ${imageSource}`)
  if (textAmount) parts.push(`Text density preference: ${textAmount}`)
  return parts.join('\n') || title || 'Untitled presentation'
}

export function mapDensity(textAmount) {
  return DENSITY_MAP[textAmount] || 'balanced'
}

/** Build the complete, persistable configuration sent when generation starts. */
export function buildPresentationGenerationPayload(
  config = {},
  { finalOutline = [], overwriteManualEdits = false } = {}
) {
  return {
    density: config.density || mapDensity(config.textAmount),
    overwriteManualEdits,
    generationFlow: {
      version: 1,
      source: 'ai_ppt_wizard',
      selections: {
        prompt: config.prompt || '',
        title: config.title || '',
        outlineNotes: config.outline || '',
        voiceAndTone: config.tone || '',
        audience: config.audience || '',
        purpose: config.purpose || '',
        style: config.style || '',
        color: config.color || '',
        industries: Array.isArray(config.industries) ? config.industries : [],
        baseTemplate: config.baseTemplate || '',
        colorTheme: config.theme || '',
        canvasSize: config.screenSize || '16:9',
        imageType: config.imageSource || '',
        imageStyle: config.mediaStyle || '',
        imageStyleFilter: config.imageStyleFilter || '',
        textContent: config.textAmount || '',
        density: config.density || mapDensity(config.textAmount),
        slideCount: clampAiSlideCount(
          finalOutline.length || config.slides || PPT_CAPS.AI_SLIDE_MIN
        ),
        locale: config.locale || 'en',
        packId: config.packId || null,
        brandKitId: config.brandKitId || null,
      },
      availableOptions: config.availableOptions || {},
    },
  }
}

/** Parse template schema whether object or JSON string. */
export function parsePackSchema(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return raw
  return {}
}

function extractPackSlides(pack, schema) {
  if (Array.isArray(schema?.slides) && schema.slides.length) return schema.slides
  if (Array.isArray(pack?.slides) && pack.slides.length) return pack.slides
  if (Array.isArray(pack?.raw?.slides) && pack.raw.slides.length) return pack.raw.slides
  return []
}

function readPackMedia(pack) {
  return Array.isArray(pack?.media) ? pack.media : []
}

function readMediaSlotUrl(media, slotHint) {
  if (!slotHint) return null
  const entry = media.find(
    (m) => String(m?.slotHint || m?.slot_hint || '').toLowerCase() === String(slotHint).toLowerCase()
  )
  return entry?.url || null
}

/** Pack card thumbnail priority (list + detail summary). */
export function resolvePackThumbnailUrl(pack) {
  if (!pack) return null
  const direct = pack.previewImageUrl || pack.preview_image_url
  if (direct) return direct

  const preview = pack.preview || {}
  if (preview.imageUrl) return preview.imageUrl
  if (preview.thumbnailUrl) return preview.thumbnailUrl

  const media = readPackMedia(pack)
  return (
    readMediaSlotUrl(media, 'preview') ||
    readMediaSlotUrl(media, 'slide:1') ||
    null
  )
}

/** Solid-color fallback when a pack has no preview image. */
export function resolvePackColorFallback(pack) {
  const preview = pack?.preview || {}
  return {
    color: preview.color || '#f8fafc',
    accentColor: preview.accentColor || preview.accent_color || '#94a3b8',
  }
}

/** Slide preview thumbnail — previewImageUrl, then media slot slide:{order}. */
export function resolveSlidePreviewThumbnail(slidePreview, media = []) {
  if (!slidePreview) return null
  const direct = slidePreview.previewImageUrl || slidePreview.preview_image_url
  if (direct) return direct
  const order = slidePreview.order ?? 1
  return readMediaSlotUrl(media, `slide:${order}`)
}

/** Summary row from GET .../presentation-deck-packs (no schema / slidePreviews). */
export function normalizeDeckPackListItem(pack) {
  if (!pack) return null
  const id = pack.id || pack._id
  if (!id) return null

  const meta = pack.meta || {}
  const preview = pack.preview || parsePackSchema(pack.schema)?.preview || null

  return {
    id,
    name: pack.name || meta.name || 'Deck Pack',
    packId: pack.packId || pack.pack_id || null,
    themeId: pack.themeId || pack.theme_id || null,
    aspectRatio: pack.aspectRatio || pack.aspect_ratio || '16:9',
    slideCount: pack.slideCount ?? pack.slide_count ?? null,
    meta: {
      description: meta.description || '',
      useCase: meta.useCase || meta.use_case || '',
    },
    narrative: pack.narrative || null,
    previewImageUrl: pack.previewImageUrl || pack.preview_image_url || null,
    preview,
    media: readPackMedia(pack),
    generationDefaults: pack.generationDefaults || pack.generation_defaults || null,
    variant: pack.variant ?? null,
    version: pack.version ?? null,
    thumbnailUrl: resolvePackThumbnailUrl(pack),
  }
}

/** Full pack from GET .../presentation-deck-packs/:id */
export function normalizeDeckPackDetail(payload) {
  const pack = payload?.pack ?? payload?.data?.pack ?? payload
  const base = normalizeDeckPackListItem(pack)
  if (!base) return null

  const schema = parsePackSchema(pack?.schema)
  const slides = extractPackSlides(pack, schema)
  const rawPreviews = pack?.slidePreviews || pack?.slide_previews || []
  const slidePreviews = (Array.isArray(rawPreviews) ? rawPreviews : [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((sp) => ({
      ...sp,
      thumbnailUrl: resolveSlidePreviewThumbnail(sp, base.media),
    }))

  return {
    ...base,
    thumbnailUrl: resolvePackThumbnailUrl({ ...pack, preview: base.preview, media: base.media }),
    schema: slides.length ? { ...schema, slides } : schema.slides ? schema : { ...schema, slides: [] },
    slidePreviews,
  }
}

/** Normalize one deck-pack / DECK_PACK template row (detail when schema present). */
export function normalizeDeckPackRecord(pack) {
  if (!pack) return null
  const id = pack.id || pack._id || pack.templateId
  if (!id) return null

  if (pack.schema || pack.slidePreviews || pack.slide_previews) {
    return normalizeDeckPackDetail({ pack })
  }

  return normalizeDeckPackListItem(pack)
}

/** Normalize deck-pack list from GET .../presentation-deck-packs */
export function normalizeDeckPacks(payload) {
  const root = payload?.data ?? payload
  const list = Array.isArray(root)
    ? root
    : root?.packs || root?.items || root?.templates || root?.deckPacks || []
  return (list || []).map(normalizeDeckPackListItem).filter(Boolean)
}

/** Merge deck-pack list rows with DECK_PACK rows from presentation-templates. */
export function mergeDeckPackCatalog(deckPacksPayload, templatesPayload) {
  const byId = new Map()

  for (const pack of normalizeDeckPacks(deckPacksPayload)) {
    byId.set(String(pack.id), pack)
  }

  const templates = Array.isArray(templatesPayload)
    ? templatesPayload
    : templatesPayload?.templates ||
      templatesPayload?.items ||
      templatesPayload?.data ||
      []

  for (const row of templates) {
    const type = String(row?.type || '').toUpperCase()
    const schema = parsePackSchema(row?.schema)
    const isPack = type === 'DECK_PACK' || Boolean(schema.pack_id)
    if (!isPack) continue

    const id = row.id || row.templateId
    if (!id) continue

    const next = normalizeDeckPackRecord(row)
    if (!next) continue

    const key = String(id)
    const prev = byId.get(key)

    if (!prev) {
      byId.set(key, next)
      continue
    }

    const prevDetail = prev.schema || prev.slidePreviews ? normalizeDeckPackDetail({ pack: prev }) : prev
    const nextDetail = normalizeDeckPackRecord(row)
    const merged = normalizeDeckPackDetail({
      pack: {
        ...prevDetail,
        ...nextDetail,
        schema:
          nextDetail?.schema?.slides?.length
            ? nextDetail.schema
            : prevDetail?.schema?.slides?.length
              ? prevDetail.schema
              : nextDetail?.schema || prevDetail?.schema,
        slidePreviews:
          nextDetail?.slidePreviews?.length
            ? nextDetail.slidePreviews
            : prevDetail?.slidePreviews || [],
      },
    })

    byId.set(key, merged || { ...prev, ...next })
  }

  return [...byId.values()]
}

export const PPT_TITLE_MAX = 255

/**
 * The wizard's single input doubles as the prompt, so it can be far longer than the
 * deck title the API accepts. Take the first sentence/line and cut on a word boundary.
 */
export function derivePresentationTitle(text, fallback = 'Untitled Presentation') {
  const flat = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!flat) return fallback

  const firstSentence = flat.split(/(?<=[.!?])\s|[\n·•|]/)[0].trim() || flat
  const limit = 120
  if (firstSentence.length <= limit) return firstSentence

  const clipped = firstSentence.slice(0, limit)
  const lastSpace = clipped.lastIndexOf(' ')
  const base = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped
  return `${base.replace(/[,;:\-–—]+$/, '')}…`
}

/** Theme ids must use underscores (midnight_blue), not kebab-case. */
export function toApiThemeId(themeId) {
  if (!themeId) return undefined
  return String(themeId).trim().replace(/-/g, '_')
}

export function clampAiSlideCount(count) {
  const n = Number(count) || PPT_CAPS.AI_SLIDE_MIN
  return Math.min(PPT_CAPS.AI_SLIDE_MAX, Math.max(PPT_CAPS.AI_SLIDE_MIN, n))
}

/**
 * Normalize outline API / UI shapes into cards for the outline review UI.
 * Accepts: { slides: [...] }, { outline: { slides } }, or a slides array.
 */
export function normalizeOutlineSlides(payload) {
  const root = payload?.outline ?? payload?.data?.outline ?? payload
  const slides =
    root?.slides ||
    root?.items ||
    (Array.isArray(root) ? root : null) ||
    payload?.slides ||
    []

  return (slides || []).map((slide, index) => {
    const bullets =
      slide.bullets ||
      slide.points ||
      slide.keyPoints ||
      (Array.isArray(slide.description) ? slide.description : null) ||
      (typeof slide.description === 'string' && slide.description
        ? [slide.description]
        : null) ||
      (typeof slide.summary === 'string' && slide.summary
        ? [slide.summary]
        : null) ||
      (typeof slide.content === 'string' ? [slide.content] : []) ||
      []

    return {
      id: slide.id || slide.slideId || index + 1,
      title: slide.title || slide.topic || `Slide ${index + 1}`,
      description: bullets,
      summary:
        slide.summary ||
        (Array.isArray(bullets) ? bullets.join(' ') : String(bullets || '')),
      suggestedContentType:
        slide.suggestedContentType ||
        slide.contentType ||
        slide.layoutHint ||
        slide.layout ||
        '',
      isEditing: false,
    }
  })
}

/** Build PATCH/POST outline body from UI cards. */
export function outlineCardsToApiPayload(
  cards,
  { title = 'Untitled Presentation', density = 'balanced', locale = 'en' } = {}
) {
  return {
    title,
    slideCount: (cards || []).length,
    density: mapDensity(density),
    locale,
    slides: (cards || []).map((card, index) => ({
      order: index + 1,
      title: card.title,
      summary:
        card.summary ||
        (Array.isArray(card.description)
          ? card.description.join(' ')
          : String(card.description || '')),
      suggestedContentType:
        card.suggestedContentType || card.layoutHint || 'bullet_list',
    })),
  }
}

export function extractPresentationId(payload) {
  return (
    payload?.id ||
    payload?._id ||
    payload?.presentationId ||
    payload?.presentation?.id ||
    payload?.presentation?._id ||
    payload?.project?.id ||
    payload?.project?._id ||
    null
  )
}

export function extractSlidesFromPresentation(presentation) {
  const slides =
    presentation?.slides ||
    presentation?.deck?.slides ||
    presentation?.presentation?.slides ||
    []
  const aspectRatio =
    presentation?.aspectRatio ||
    presentation?.deck?.aspectRatio ||
    presentation?.presentation?.aspectRatio ||
    presentation?.canvasSize ||
    '16:9'
  return (slides || []).map((slide, index) =>
    normalizeSlideForEditor(slide, index, aspectRatio)
  )
}

export function normalizeElementPlacement(placement, canvas = PPT_CANVAS_SIZES['16:9']) {
  const canvasW = canvas?.width || 1920
  const canvasH = canvas?.height || 1080
  const raw = placement || {}

  let x = raw.x ?? raw.left ?? raw.position?.x
  let y = raw.y ?? raw.top ?? raw.position?.y
  let width = raw.width ?? raw.size?.width
  let height = raw.height ?? raw.size?.height

  const finite = [x, y, width, height].filter((v) => Number.isFinite(Number(v)))
  const looksNormalized =
    finite.length >= 2 &&
    finite.every((v) => Number(v) >= 0 && Number(v) <= 1) &&
    (width == null || Number(width) <= 1) &&
    (height == null || Number(height) <= 1)

  if (looksNormalized) {
    x = Number(x || 0) * canvasW
    y = Number(y || 0) * canvasH
    width = Number(width || 0.5) * canvasW
    height = Number(height || 0.12) * canvasH
  }

  return {
    x: Number(x) || 0,
    y: Number(y) || 0,
    width: Math.max(Number(width) || 200, 40),
    height: Math.max(Number(height) || 80, 24),
    ...(raw.rotation != null ? { rotation: raw.rotation } : {}),
    ...(raw.opacity != null ? { opacity: raw.opacity } : {}),
  }
}

export function normalizeSlideForEditor(slide, index = 0, aspectRatio = '16:9') {
  const elementsDoc = slide?.elements
  const elements = Array.isArray(elementsDoc?.elements)
    ? elementsDoc.elements
    : Array.isArray(elementsDoc)
      ? elementsDoc
      : []

  const titleFromContent =
    slide?.content?.title ||
    slide?.title ||
    elements.find((el) => el.role === 'title' || el.role === 'heading' || el.type === 'text')
      ?.content?.text ||
    `Slide ${index + 1}`

  const bodyFromContent =
    slide?.content?.body ||
    slide?.content?.bullets ||
    slide?.description ||
    []

  const canvas = resolveCanvasSize(
    { elements: { canvas: elementsDoc?.canvas } },
    aspectRatio
  )

  return {
    id: slide?.id || slide?._id || `slide-${index + 1}`,
    title: titleFromContent,
    description: Array.isArray(bodyFromContent)
      ? bodyFromContent
      : bodyFromContent
        ? [String(bodyFromContent)]
        : [],
    content: slide?.content || {},
    backgroundColor:
      slide?.backgroundColor || elementsDoc?.backgroundColor || DEFAULT_SLIDE_BG,
    backgroundGradientStart:
      slide?.backgroundGradientStart || elementsDoc?.backgroundGradientStart,
    backgroundGradientEnd:
      slide?.backgroundGradientEnd || elementsDoc?.backgroundGradientEnd,
    backgroundImage: slide?.backgroundImage,
    backgroundImageFit: slide?.backgroundImageFit || 'cover',
    backgroundImageElementId: slide?.backgroundImageElementId,
    elements: {
      version: elementsDoc?.version || 1,
      canvas,
      elements: [...elements]
        .map((el) => ({
          ...el,
          placement: normalizeElementPlacement(el.placement, canvas),
        }))
        .sort((a, b) => (a.layer || 0) - (b.layer || 0)),
      ...(elementsDoc?.transition ? { transition: elementsDoc.transition } : {}),
      ...(elementsDoc?.contributorStatus
        ? { contributorStatus: elementsDoc.contributorStatus }
        : {}),
    },
    manuallyEdited: Boolean(slide?.manuallyEdited),
    status: slide?.status || 'READY',
    layoutId: slide?.layoutId || null,
    imageRef: slide?.imageRef || null,
    transition: slide?.transition || elementsDoc?.transition || 'none',
    contributorStatus:
      slide?.contributorStatus || elementsDoc?.contributorStatus || 'none',
  }
}

/**
 * Resolve a slide's visual.
 * Canvas elements are the render truth; imageRef is the fallback.
 * source: "none" means the slide is intentionally image-free (title/agenda/chart).
 */
export function getSlideImage(slide) {
  const elements = Array.isArray(slide?.elements?.elements)
    ? slide.elements.elements
    : Array.isArray(slide?.elements)
      ? slide.elements
      : []

  const imageEl = elements.find(
    (el) =>
      (el.type === 'image' || el.type === 'icon') &&
      (el.content?.url || el.content?.src)
  )
  const elementUrl = imageEl?.content?.url || imageEl?.content?.src || null

  const imageRef = slide?.imageRef
  const refUrl =
    typeof imageRef === 'string'
      ? imageRef
      : imageRef?.url || imageRef?.presignedUrl || imageRef?.src || null

  const source = typeof imageRef === 'object' ? imageRef?.source || '' : ''
  const error = typeof imageRef === 'object' ? imageRef?.error || null : null

  return {
    url: elementUrl || refUrl || null,
    source,
    error,
    intentionallyNone: String(source).toLowerCase() === 'none' && !elementUrl,
  }
}

export function extractSlideImageUrl(slide) {
  return getSlideImage(slide).url
}

export function emptyCanvasDoc(aspectRatio = '16:9') {
  return {
    version: 1,
    canvas: { ...resolveCanvasSize(null, aspectRatio) },
    elements: [],
  }
}

export function buildCanvasDoc(slide, { aspectRatio = '16:9', elements } = {}) {
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const list = Array.isArray(elements)
    ? elements
    : Array.isArray(slide?.elements?.elements)
      ? slide.elements.elements
      : []
  return {
    version: slide?.elements?.version || 1,
    canvas,
    elements: list,
    ...(slide?.elements?.transition ? { transition: slide.elements.transition } : {}),
    ...(slide?.elements?.contributorStatus
      ? { contributorStatus: slide.elements.contributorStatus }
      : {}),
  }
}

/** Normalize GET .../presentation-elements payload. */
export function normalizeElementPresets(payload) {
  const root = payload?.data ?? payload
  const list = Array.isArray(root)
    ? root
    : root?.presets || root?.items || root?.elements || []
  const canvas = resolveCanvasSize(root, '16:9')
  const presets = (list || [])
    .map((p) => {
      const presetId = p.presetId || p.id
      if (!presetId) return null
      return {
        id: presetId,
        presetId,
        type: p.type || 'text',
        label: p.label || p.name || presetId,
        content: p.content || p.defaultContent || {},
        defaultPlacement: p.defaultPlacement || p.placement || null,
        defaultContent: p.defaultContent || {},
        category: p.category || null,
        raw: p,
      }
    })
    .filter(Boolean)
  return { canvas, presets }
}

export function normalizeApiShape(shape) {
  if (!shape) return 'rect'
  const key = String(shape)
  return SHAPE_ALIAS[key] || key
}

/**
 * Resolve canvas CSS for a shape element using the shape library + content overrides.
 */
export function buildCanvasShapeStyle(content = {}, palette = {}) {
  const rawShape = content.shape || 'rect'
  const shapeId = normalizeApiShape(rawShape)
  const entry = getShapeLibraryEntry(rawShape) || getShapeLibraryEntry(shapeId)
  const lib = entry?.style || {}

  const fill = resolveFillCss(content.fill, palette, 'rgba(148,163,184,0.35)')
  const stroke = content.stroke ? resolveThemeColor(content.stroke, palette, content.stroke) : undefined
  const strokeWidth = content.strokeWidth != null ? content.strokeWidth : stroke ? 1 : 0
  const isOutlined = content.variant === 'outlined'

  if (content.border && !content.clipPath) {
    return {
      kind: 'box',
      style: {
        width: '100%',
        height: '100%',
        background: fill === 'rgba(148,163,184,0.35)' && content.fill == null ? 'transparent' : fill,
        border: content.border,
        borderRadius: content.borderRadius ?? 0,
        boxShadow: content.shadow || content.boxShadow || undefined,
        boxSizing: 'border-box',
      },
    }
  }

  if (isHorizontalLineShape(entry, rawShape)) {
    return {
      kind: 'line',
      style: {
        width: '100%',
        height: 0,
        background: 'transparent',
        borderTop: resolveLineBorder(content, entry, fill, stroke, isOutlined),
        alignSelf: 'center',
        boxSizing: 'border-box',
        flexShrink: 0,
      },
    }
  }

  const clipPath = content.clipPath || lib.clipPath || FALLBACK_CLIP[shapeId]
  let borderRadius =
    content.borderRadius != null ? content.borderRadius : parseShapeRadius(lib.borderRadius)
  if (borderRadius == null && FALLBACK_RADIUS[shapeId] != null) {
    borderRadius = FALLBACK_RADIUS[shapeId]
  }

  const background = isOutlined ? 'transparent' : fill
  const border =
    stroke || isOutlined
      ? `${strokeWidth || (isOutlined ? 3 : 1)}px solid ${stroke || fill}`
      : undefined

  if (clipPath) {
    return {
      kind: 'clip',
      style: {
        width: '100%',
        height: '100%',
        background,
        clipPath,
        boxSizing: 'border-box',
      },
    }
  }

  return {
    kind: 'box',
    style: {
      width: '100%',
      height: '100%',
      background: background === 'transparent' ? 'transparent' : background,
      borderRadius: borderRadius ?? 0,
      border,
      boxShadow: content.shadow || undefined,
      boxSizing: 'border-box',
    },
  }
}

/**
 * Resolve palette token / colorRole / hex / gradient object → CSS color or gradient.
 * Tokens: bg, surface, primary, secondary, text, muted, accent, divider, cardBg, …
 */
export function resolveThemeColor(value, palette = {}, fallback = undefined) {
  if (value == null || value === '') return fallback
  if (typeof value === 'object') {
    if (value.type === 'gradient') return cssGradientFromFill(value, palette)
    if (value.color) return resolveThemeColor(value.color, palette, fallback)
    return fallback
  }
  const raw = String(value).trim()
  if (
    raw.startsWith('#') ||
    raw.startsWith('rgb') ||
    raw.startsWith('hsl') ||
    raw.startsWith('url(') ||
    raw === 'transparent' ||
    raw.startsWith('linear-gradient')
  ) {
    return raw
  }
  if (palette?.[raw]) return palette[raw]
  return fallback !== undefined ? fallback : raw
}

export function cssGradientFromFill(fill, palette = {}) {
  if (!fill || typeof fill !== 'object') return null
  const angle = fill.angle != null ? Number(fill.angle) : 135
  const stops = Array.isArray(fill.stops) ? fill.stops : []
  if (stops.length) {
    const parts = stops.map((stop) => {
      const color = resolveThemeColor(stop.color || stop, palette, '#94A3B8')
      const at = stop.at != null ? ` ${Math.round(Number(stop.at) * (Number(stop.at) <= 1 ? 100 : 1))}%` : ''
      return `${color}${at}`
    })
    return `linear-gradient(${angle}deg, ${parts.join(', ')})`
  }
  const start =
    resolveThemeColor(fill.from || fill.start || palette.gradientStart, palette, '#3B82F6')
  const end =
    resolveThemeColor(fill.to || fill.end || palette.gradientEnd, palette, '#8B5CF6')
  return `linear-gradient(${angle}deg, ${start}, ${end})`
}

/** Resolve shape/text fill (string token, hex, or { type: 'gradient', … }). */
export function resolveFillCss(fill, palette = {}, fallback = 'rgba(148,163,184,0.35)') {
  if (fill == null || fill === '') return fallback
  if (typeof fill === 'object' && fill.type === 'gradient') {
    return cssGradientFromFill(fill, palette) || fallback
  }
  return resolveThemeColor(fill, palette, fallback)
}

/** CSS box for template shapes authored with clip-level nativeStyle (curves, borders). */
export function buildNativeShapeBoxStyle(nativeStyle = {}) {
  const style = nativeStyle || {}
  const box = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    border: style.border,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    opacity: style.opacity,
  }
  if (style.background) box.background = style.background
  else box.backgroundColor = style.backgroundColor || 'transparent'
  return box
}

export function shapeElementUsesNativeStyle(el) {
  if (!el || el.type !== 'shape' || !el.nativeStyle) return false
  const style = el.nativeStyle
  return Boolean(
    style.background
    || style.backgroundColor
    || style.border
    || style.borderRadius
    || style.boxShadow
  )
}

export function extractSlideFromMutation(payload) {
  return (
    payload?.slide ||
    payload?.data?.slide ||
    (payload?.id && payload?.elements ? payload : null) ||
    null
  )
}

export function extractElementFromMutation(payload) {
  return payload?.element || payload?.data?.element || null
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
