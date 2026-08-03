/** Caps from PRESENTATION_FRONTEND_INTEGRATION */
export const PPT_CAPS = {
  AI_SLIDE_MIN: 5,
  AI_SLIDE_MAX: 20,
  DECK_MAX_SLIDES: 40,
  ELEMENTS_PER_SLIDE: 50,
}

export const PPT_AI_SLIDE_COUNTS = [5, 8, 10, 12, 15, 20]

export const PPT_EXPORT_FORMATS = ['PPTX', 'PDF', 'PNG', 'JPEG']

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

/** Normalize deck-pack list from GET .../presentation-deck-packs */
export function normalizeDeckPacks(payload) {
  const root = payload?.data ?? payload
  const list = Array.isArray(root)
    ? root
    : root?.packs || root?.items || root?.templates || root?.deckPacks || []
  return (list || [])
    .map((pack) => {
      const id = pack.id || pack._id || pack.templateId
      if (!id) return null
      const schema = pack.schema || {}
      return {
        id,
        name:
          pack.name ||
          schema.preview?.label ||
          schema.pack_id ||
          pack.pack_id ||
          'Deck Pack',
        packId: schema.pack_id || pack.pack_id || null,
        themeId: schema.themeId || pack.themeId || null,
        slideCount: Array.isArray(schema.slides) ? schema.slides.length : pack.slideCount || null,
        preview: schema.preview || pack.preview || null,
        schema,
        raw: pack,
      }
    })
    .filter(Boolean)
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
  return (slides || []).map((slide, index) => normalizeSlideForEditor(slide, index))
}

export function normalizeSlideForEditor(slide, index = 0) {
  const elementsDoc = slide?.elements
  const elements = Array.isArray(elementsDoc?.elements)
    ? elementsDoc.elements
    : Array.isArray(elementsDoc)
      ? elementsDoc
      : []

  const titleFromContent =
    slide?.content?.title ||
    slide?.title ||
    elements.find((el) => el.role === 'title' || el.type === 'text')?.content?.text ||
    `Slide ${index + 1}`

  const bodyFromContent =
    slide?.content?.body ||
    slide?.content?.bullets ||
    slide?.description ||
    []

  return {
    id: slide?.id || slide?._id || `slide-${index + 1}`,
    title: titleFromContent,
    description: Array.isArray(bodyFromContent)
      ? bodyFromContent
      : bodyFromContent
        ? [String(bodyFromContent)]
        : [],
    content: slide?.content || {},
    elements: {
      version: elementsDoc?.version || 1,
      canvas: elementsDoc?.canvas || { width: 1920, height: 1080 },
      elements: [...elements].sort((a, b) => (a.layer || 0) - (b.layer || 0)),
    },
    manuallyEdited: Boolean(slide?.manuallyEdited),
    status: slide?.status || 'READY',
    layoutId: slide?.layoutId || null,
    imageRef: slide?.imageRef || null,
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

export function emptyCanvasDoc() {
  return {
    version: 1,
    canvas: { width: 1920, height: 1080 },
    elements: [],
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
