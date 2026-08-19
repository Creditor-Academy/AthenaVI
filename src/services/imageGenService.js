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

export class ImageGenContextPinnedError extends Error {
  constructor(message, data = {}) {
    super(message || 'This brief was used for a generation and can’t be deleted.')
    this.name = 'ImageGenContextPinnedError'
    this.code = 'IMAGE_GEN_CONTEXT_PINNED'
    this.status = 409
    this.data = data
  }
}

const IMAGE_GENERATE_TIMEOUT_MS = 90_000
// PARKED: infographic generate used 90–180s. Restore when Mode 2 returns.
// const INFOGRAPHIC_GENERATE_TIMEOUT_MS = 180_000
const TWEAK_TIMEOUT_MS = 90_000
const CONTEXT_TIMEOUT_MS = 90_000

function generateTimeoutMs() {
  return IMAGE_GENERATE_TIMEOUT_MS
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function u16(n) {
  const b = new Uint8Array(2)
  new DataView(b.buffer).setUint16(0, n, true)
  return b
}

function u32(n) {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setUint32(0, n, true)
  return b
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function buildZip(entries) {
  const encoder = new TextEncoder()
  const locals = []
  const centrals = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const data = entry.data
    const crc = crc32(data)
    const local = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data,
    ])
    const central = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const localBlob = concatBytes(locals)
  const centralBlob = concatBytes(centrals)
  const eocd = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralBlob.length),
    u32(localBlob.length),
    u16(0),
  ])
  return new Blob([concatBytes([localBlob, centralBlob, eocd])], { type: 'application/zip' })
}

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

  authOnlyHeaders() {
    const token = localStorage.getItem('accessToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request(endpoint, options = {}) {
    const { timeoutMs, signal, headers: extraHeaders, skipJsonContentType, ...fetchOptions } =
      options
    const baseHeaders = skipJsonContentType ? this.authOnlyHeaders() : getAuthHeaders()
    const headers = {
      ...baseHeaders,
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

  /**
   * Create a reusable context bundle (free, rate-limited).
   * @param {string} workspaceId
   * @param {{ files?: File[], inlineText?: string, assetIds?: string[] }} input
   */
  async createContext(workspaceId, { files = [], inlineText = '', assetIds = [] } = {}) {
    const form = new FormData()
    const payload = {}
    const trimmed = String(inlineText || '').trim()
    if (trimmed) payload.inlineText = trimmed
    if (Array.isArray(assetIds) && assetIds.length) payload.assetIds = assetIds
    form.append('payload', JSON.stringify(payload))
    for (const file of files || []) {
      form.append('files', file)
    }

    const data = await this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.CONTEXT(workspaceId), {
      method: 'POST',
      body: form,
      skipJsonContentType: true,
      timeoutMs: CONTEXT_TIMEOUT_MS,
    })
    return data?.context || data
  }

  async getContext(workspaceId, contextId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.IMAGE_GEN.CONTEXT_ONE(workspaceId, contextId)
    )
    return data?.context || data
  }

  async deleteContext(workspaceId, contextId) {
    try {
      return await this.request(
        API_CONFIG.ENDPOINTS.IMAGE_GEN.CONTEXT_ONE(workspaceId, contextId),
        { method: 'DELETE' }
      )
    } catch (error) {
      if (error?.status === 409) {
        throw new ImageGenContextPinnedError(
          error.message || 'Image generation context is in use and cannot be deleted',
          error.data
        )
      }
      throw error
    }
  }

  async generate(workspaceId, body) {
    return this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.GENERATE(workspaceId), {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: generateTimeoutMs(),
    })
  }

  async listGenerations(workspaceId, { take = 40, skip = 0 } = {}) {
    const query = this.buildQuery({ take, skip, mode: 'image' })
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
      timeoutMs: generateTimeoutMs(),
    })
  }

  async tweak(workspaceId, generationId, instruction) {
    return this.request(API_CONFIG.ENDPOINTS.IMAGE_GEN.TWEAK(workspaceId, generationId), {
      method: 'POST',
      body: JSON.stringify({ instruction }),
      timeoutMs: TWEAK_TIMEOUT_MS,
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
    saveBlob(blob, filename)
  }

  /**
   * Client-side zip of several generations (API is per-file only).
   * @param {{ generationId: string, name: string }[]} items
   */
  async downloadAllAsZip(workspaceId, items = [], format = 'png') {
    const used = new Set()
    const entries = []
    for (const item of items) {
      const { blob, filename } = await this.download(workspaceId, item.generationId, format)
      let name = String(item.name || filename || `image.${format}`).replace(/[\\/]/g, '-')
      if (used.has(name)) {
        const stem = name.replace(/(\.[^.]+)$/, '')
        const ext = name.slice(stem.length)
        let n = 2
        while (used.has(`${stem}-${n}${ext}`)) n += 1
        name = `${stem}-${n}${ext}`
      }
      used.add(name)
      entries.push({ name, data: new Uint8Array(await blob.arrayBuffer()) })
    }
    if (!entries.length) {
      throw new Error('Nothing to zip')
    }
    saveBlob(buildZip(entries), 'athena-images.zip')
  }
}

const imageGenService = new ImageGenService()
export default imageGenService
