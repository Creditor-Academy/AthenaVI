import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'
import { InsufficientCreditsError } from './creditsService.js'

export class ImageGenRateLimitError extends Error {
  constructor(message, data = {}) {
    super(message || 'Too many image requests. Please wait and try again.')
    this.name = 'ImageGenRateLimitError'
    this.code = 'IMAGE_GEN_RATE_LIMIT'
    this.status = 429
    this.data = data
  }
}

export class ImageGenProviderError extends Error {
  constructor(message, data = {}, status = 502) {
    super(message || 'Image generation provider is unavailable.')
    this.name = 'ImageGenProviderError'
    this.code = 'IMAGE_GEN_PROVIDER'
    this.status = status
    this.data = data
  }
}

const GENERATE_TIMEOUT_MS = 90_000

class ImageGenService {
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
    const { timeoutMs, signal, headers: extraHeaders, ...fetchOptions } = options
    const headers = {
      ...getAuthHeaders(),
      ...(extraHeaders || {}),
    }

    const controller = signal ? null : timeoutMs > 0 ? new AbortController() : null
    const timeoutId =
      controller && timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null

    try {
      const response = await fetch(buildUrl(endpoint), {
        ...fetchOptions,
        headers,
        signal: signal || controller?.signal,
      })

      if (response.status === 402) {
        const payload = await this.readPayload(response)
        throw new InsufficientCreditsError(payload.message || 'Insufficient credits', payload)
      }

      if (response.status === 429) {
        const payload = await this.readPayload(response)
        throw new ImageGenRateLimitError(payload.message || 'Rate limited', payload)
      }

      if (response.status === 502 || response.status === 503) {
        const payload = await this.readPayload(response)
        throw new ImageGenProviderError(
          payload.message || 'Image provider unavailable',
          payload,
          response.status
        )
      }

      if (!response.ok) {
        const payload = await this.readPayload(response)
        const err = new Error(payload.message || `Image Gen request failed: ${response.status}`)
        err.status = response.status
        err.data = payload
        throw err
      }

      if (response.status === 204) return null
      const json = await response.json()
      return this.unwrap(json)
    } catch (error) {
      if (error?.name === 'AbortError') {
        const err = new Error('Image generation timed out. Please try again.')
        err.status = 408
        throw err
      }
      throw error
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  async getModels() {
    const data = await this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.MODELS)
    return data?.models || []
  }

  async getFormats() {
    const data = await this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.FORMATS)
    return data?.formats || []
  }

  async getStyles() {
    const data = await this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.STYLES)
    return data?.styles || []
  }

  async getCatalogs() {
    const [models, formats, styles] = await Promise.all([
      this.getModels(),
      this.getFormats(),
      this.getStyles(),
    ])
    return { models, formats, styles }
  }

  async estimate(workspaceId, { modelId, mode = 'image', tweak = false } = {}) {
    const query = this.buildQuery({ modelId, mode, tweak: tweak ? 'true' : 'false' })
    return this.request(`${API_CONFIG.ENDPOINTS.IMAGE_GEN.ESTIMATE(workspaceId)}${query}`)
  }

  async generate(workspaceId, body) {
    return this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.GENERATE(workspaceId), {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: GENERATE_TIMEOUT_MS,
    })
  }

  async listGenerations(workspaceId, { take = 40, skip = 0 } = {}) {
    const query = this.buildQuery({ take, skip })
    const data = await this.request(
      `${API_CONFIG.ENDPOINTS.IMAGE_GEN.GENERATIONS(workspaceId)}${query}`
    )
    return data?.generations || []
  }

  async getGeneration(workspaceId, generationId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.IMAGE_GEN.GENERATION(workspaceId, generationId)
    )
    return data?.generation || data
  }

  async regenerate(workspaceId, generationId, body = {}) {
    return this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.REGENERATE(workspaceId, generationId), {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: GENERATE_TIMEOUT_MS,
    })
  }

  async tweak(workspaceId, generationId, instruction) {
    return this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.TWEAK(workspaceId, generationId), {
      method: 'POST',
      body: JSON.stringify({ instruction }),
      timeoutMs: GENERATE_TIMEOUT_MS,
    })
  }

  /**
   * Binary download — returns { blob, filename }.
   * format: png | jpg | jpeg | pdf
   */
  async download(workspaceId, generationId, format = 'png') {
    const query = this.buildQuery({ format })
    const response = await fetch(
      buildUrl(`${API_CONFIG.ENDPOINTS.IMAGE_GEN.DOWNLOAD(workspaceId, generationId)}${query}`),
      { headers: getAuthHeaders() }
    )

    if (!response.ok) {
      const payload = await this.readPayload(response)
      throw new Error(payload.message || `Download failed: ${response.status}`)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i)
    const filename = match
      ? decodeURIComponent(match[1].replace(/"/g, ''))
      : `athena-image.${format === 'jpeg' ? 'jpg' : format}`

    return { blob, filename }
  }

  async downloadAndSave(workspaceId, generationId, format = 'png') {
    const { blob, filename } = await this.download(workspaceId, generationId, format)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}

const imageGenService = new ImageGenService()
export default imageGenService
