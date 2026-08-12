import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'
import { InsufficientCreditsError } from './creditsService.js'
import { PPT_TITLE_MAX, sleep } from '../utils/presentationHelpers.js'

/** Turn a { message, errors } envelope into one readable line for the UI. */
function formatValidationMessage(payload) {
  const base = payload?.message || ''
  const rawErrors = payload?.errors

  let details = []
  if (Array.isArray(rawErrors)) {
    details = rawErrors.map((e) =>
      typeof e === 'string' ? e : [e?.field || e?.path, e?.message].filter(Boolean).join(': ')
    )
  } else if (rawErrors && typeof rawErrors === 'object') {
    details = Object.entries(rawErrors).map(([field, value]) => {
      const text = Array.isArray(value) ? value.join(', ') : String(value?.message || value)
      return `${field}: ${text}`
    })
  }

  details = details.filter(Boolean)
  if (!details.length) return base
  return base ? `${base} — ${details.join('; ')}` : details.join('; ')
}

function safeParseBody(body) {
  if (typeof body !== 'string') return body
  try {
    return JSON.parse(body)
  } catch {
    return body
  }
}

export class PresentationConflictError extends Error {
  constructor(message, data = {}) {
    super(message || 'Presentation is busy or overwrite is blocked')
    this.name = 'PresentationConflictError'
    this.code = 'PRESENTATION_CONFLICT'
    this.status = 409
    this.data = data
  }
}

export class PresentationRateLimitError extends Error {
  constructor(message, data = {}) {
    super(message || 'Too many generate requests. Please wait and try again.')
    this.name = 'PresentationRateLimitError'
    this.code = 'PRESENTATION_RATE_LIMIT'
    this.status = 429
    this.data = data
  }
}

class PresentationService {
  unwrap(json) {
    return json?.data ?? json
  }

  async readPayload(response) {
    return response.json().catch(() => ({}))
  }

  buildQuery(params = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value))
      }
    })
    const query = search.toString()
    return query ? `?${query}` : ''
  }

  async request(endpoint, options = {}) {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    }
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    }

    const response = await fetch(buildUrl(endpoint), {
      ...options,
      headers,
    })

    if (response.status === 402) {
      const payload = await this.readPayload(response)
      throw new InsufficientCreditsError(payload.message || 'Insufficient credits', payload)
    }

    if (response.status === 409) {
      const payload = await this.readPayload(response)
      throw new PresentationConflictError(
        payload.message || 'Conflict — generation in progress or overwrite blocked',
        payload
      )
    }

    if (response.status === 429) {
      const payload = await this.readPayload(response)
      throw new PresentationRateLimitError(payload.message || 'Rate limited', payload)
    }

    if (!response.ok) {
      const payload = await this.readPayload(response)
      if (import.meta.env?.DEV) {
        console.error('[presentationService] request failed', {
          endpoint,
          status: response.status,
          sentBody: safeParseBody(options.body),
          response: payload,
        })
      }
      const err = new Error(
        formatValidationMessage(payload) || `Presentation request failed: ${response.status}`
      )
      err.status = response.status
      err.data = payload
      err.errors = payload.errors
      throw err
    }

    if (response.status === 204) return null

    // 202 Accepted may still return a JSON body
    const json = await response.json().catch(() => ({}))
    return this.unwrap(json)
  }

  // ── Workspace pickers ──────────────────────────────────────────────

  listTemplates(workspaceId, { contentType } = {}) {
    const query = this.buildQuery({ contentType })
    return this.request(`${API_CONFIG.ENDPOINTS.PRESENTATIONS.TEMPLATES(workspaceId)}${query}`)
  }

  listDeckPacks(workspaceId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.DECK_PACKS(workspaceId))
  }

  /** Full pack schema (includes slides[]) when list endpoint omits them. */
  getDeckPack(workspaceId, packId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.DECK_PACK(workspaceId, packId))
  }

  /** Single template row — fallback when pack detail route is unavailable. */
  getTemplate(workspaceId, templateId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.TEMPLATE(workspaceId, templateId))
  }

  listThemes(workspaceId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.THEMES(workspaceId))
  }

  listElementPresets(workspaceId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.ELEMENT_PRESETS(workspaceId))
  }

  applyBrandKit(workspaceId, presentationId, brandKitId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.APPLY_BRAND_KIT(workspaceId, presentationId),
      { method: 'POST', body: JSON.stringify({ brandKitId }) }
    )
  }

  // ── Presentation CRUD ──────────────────────────────────────────────

  createPresentation(workspaceId, body) {
    const title = String(body?.title || '').trim()
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.LIST(workspaceId), {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        title: title.slice(0, PPT_TITLE_MAX) || 'Untitled Presentation',
      }),
    })
  }

  getPresentation(workspaceId, presentationId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.ONE(workspaceId, presentationId))
  }

  getCreditEstimate(workspaceId, presentationId, { slideCount } = {}) {
    const query = this.buildQuery({ slideCount })
    return this.request(
      `${API_CONFIG.ENDPOINTS.PRESENTATIONS.CREDIT_ESTIMATE(workspaceId, presentationId)}${query}`
    )
  }

  createOutline(workspaceId, presentationId, body) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.OUTLINE(workspaceId, presentationId), {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /** Multipart outline from document upload */
  async createOutlineFromDocument(
    workspaceId,
    presentationId,
    { file, documentText, slideCount, density, locale = 'en' }
  ) {
    const form = new FormData()
    form.append('source', 'document')
    if (file) form.append('file', file)
    if (documentText) form.append('documentText', documentText)
    if (slideCount != null) form.append('slideCount', String(slideCount))
    if (density) form.append('density', density)
    if (locale) form.append('locale', locale)

    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.OUTLINE(workspaceId, presentationId),
      { method: 'POST', body: form }
    )
  }

  updateOutline(workspaceId, presentationId, outline) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.OUTLINE(workspaceId, presentationId), {
      method: 'PATCH',
      body: JSON.stringify(outline),
    })
  }

  setTheme(workspaceId, presentationId, body) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.THEME(workspaceId, presentationId), {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  startGenerate(workspaceId, presentationId, body = {}) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.GENERATE(workspaceId, presentationId), {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  getStatus(workspaceId, presentationId) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.STATUS(workspaceId, presentationId))
  }

  /**
   * Poll GET .../status until deck READY | FAILED (or timeout).
   * onProgress receives the latest status payload each tick.
   */
  async pollUntilReady(
    workspaceId,
    presentationId,
    { intervalMs = 2000, timeoutMs = 10 * 60 * 1000, onProgress } = {}
  ) {
    const started = Date.now()
    while (Date.now() - started < timeoutMs) {
      const status = await this.getStatus(workspaceId, presentationId)
      onProgress?.(status)

      const deckStatus = String(
        status?.status || status?.deckStatus || status?.deck?.status || ''
      ).toUpperCase()

      if (deckStatus === 'READY') return status
      if (deckStatus === 'FAILED') {
        const err = new Error(status?.message || status?.error || 'Presentation generation failed')
        err.status = 'FAILED'
        err.data = status
        throw err
      }

      await sleep(intervalMs)
    }
    throw new Error('Timed out waiting for presentation generation')
  }

  // ── Slides ─────────────────────────────────────────────────────────

  addSlide(workspaceId, presentationId, body = {}) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDES(workspaceId, presentationId), {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  deleteSlide(workspaceId, presentationId, slideId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE(workspaceId, presentationId, slideId),
      { method: 'DELETE' }
    )
  }

  duplicateSlide(workspaceId, presentationId, slideId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_DUPLICATE(workspaceId, presentationId, slideId),
      { method: 'POST', body: JSON.stringify({}) }
    )
  }

  reorderSlides(workspaceId, presentationId, slideIds) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDES_REORDER(workspaceId, presentationId),
      { method: 'PATCH', body: JSON.stringify({ slideIds }) }
    )
  }

  applyLayout(workspaceId, presentationId, slideId, templateId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.APPLY_LAYOUT(workspaceId, presentationId, slideId),
      { method: 'POST', body: JSON.stringify({ templateId }) }
    )
  }

  getSlide(workspaceId, presentationId, slideId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE(workspaceId, presentationId, slideId)
    )
  }

  patchSlide(workspaceId, presentationId, slideId, body) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE(workspaceId, presentationId, slideId),
      { method: 'PATCH', body: JSON.stringify(body) }
    )
  }

  regenerateSlide(workspaceId, presentationId, slideId, body = {}) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.REGENERATE(workspaceId, presentationId, slideId),
      { method: 'POST', body: JSON.stringify(body) }
    )
  }

  // ── Canvas / elements ──────────────────────────────────────────────

  saveCanvas(workspaceId, presentationId, slideId, canvasDoc) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.CANVAS(workspaceId, presentationId, slideId),
      { method: 'PUT', body: JSON.stringify(canvasDoc) }
    )
  }

  insertElement(workspaceId, presentationId, slideId, body) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_ELEMENTS(workspaceId, presentationId, slideId),
      { method: 'POST', body: JSON.stringify(body) }
    )
  }

  updateElement(workspaceId, presentationId, slideId, elementId, body) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_ELEMENT(
        workspaceId,
        presentationId,
        slideId,
        elementId
      ),
      { method: 'PATCH', body: JSON.stringify(body) }
    )
  }

  deleteElement(workspaceId, presentationId, slideId, elementId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_ELEMENT(
        workspaceId,
        presentationId,
        slideId,
        elementId
      ),
      { method: 'DELETE' }
    )
  }

  reorderElements(workspaceId, presentationId, slideId, elementIds) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_ELEMENTS_REORDER(
        workspaceId,
        presentationId,
        slideId
      ),
      { method: 'PATCH', body: JSON.stringify({ elementIds }) }
    )
  }

  /** Multipart image upload → canvas image element (optional elementId to replace). */
  uploadSlideMedia(workspaceId, presentationId, slideId, file, { elementId } = {}) {
    const form = new FormData()
    form.append('file', file)
    if (elementId) form.append('elementId', elementId)
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SLIDE_MEDIA(workspaceId, presentationId, slideId),
      { method: 'POST', body: form }
    )
  }

  attachSlideAsset(workspaceId, presentationId, slideId, { assetId, elementId } = {}) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.ATTACH_ASSET(workspaceId, presentationId, slideId),
      {
        method: 'POST',
        body: JSON.stringify({
          assetId,
          ...(elementId ? { elementId } : {}),
        }),
      }
    )
  }

  insertStockOntoSlide(workspaceId, presentationId, slideId, body = {}) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.INSERT_STOCK(workspaceId, presentationId, slideId),
      { method: 'POST', body: JSON.stringify(body) }
    )
  }

  // ── Export ─────────────────────────────────────────────────────────

  startExport(workspaceId, presentationId, { format = 'PPTX', slideId = null } = {}) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.EXPORT(workspaceId, presentationId), {
      method: 'POST',
      body: JSON.stringify({ format, slideId }),
    })
  }

  getExportStatus(workspaceId, presentationId, exportId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.EXPORT_STATUS(workspaceId, presentationId, exportId)
    )
  }

  async pollExportUntilReady(
    workspaceId,
    presentationId,
    exportId,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000, onProgress } = {}
  ) {
    const started = Date.now()
    while (Date.now() - started < timeoutMs) {
      const status = await this.getExportStatus(workspaceId, presentationId, exportId)
      onProgress?.(status)

      const state = String(status?.status || status?.exportStatus || '').toUpperCase()
      if (state === 'READY') return status
      if (state === 'FAILED') {
        throw new Error(status?.message || status?.error || 'Export failed')
      }
      await sleep(intervalMs)
    }
    throw new Error('Timed out waiting for export')
  }

  // ── Import / share / duplicate ─────────────────────────────────────

  async importPresentation(workspaceId, file, { title } = {}) {
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.IMPORT(workspaceId), {
      method: 'POST',
      body: form,
    })
  }

  duplicatePresentation(workspaceId, presentationId) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.DUPLICATE(workspaceId, presentationId),
      { method: 'POST' }
    )
  }

  createShareLink(workspaceId, presentationId, { access = 'view' } = {}) {
    return this.request(
      API_CONFIG.ENDPOINTS.PRESENTATIONS.SHARE(workspaceId, presentationId),
      { method: 'POST', body: JSON.stringify({ access }) }
    )
  }
}

const presentationService = new PresentationService()
export default presentationService
