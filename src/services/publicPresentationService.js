import API_CONFIG, { buildUrl } from '../config/api.js'
import { PresentationRateLimitError } from './presentationService.js'

export class PresentationShareUnavailableError extends Error {
  constructor(message = "This link isn't available") {
    super(message)
    this.name = 'PresentationShareUnavailableError'
    this.status = 404
  }
}

function headersWithOptionalAuth() {
  const token = localStorage.getItem('accessToken')
  return {
    ...API_CONFIG.HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function unwrap(json) {
  if (!json || typeof json !== 'object') return json
  const inner = json.data ?? json
  if (inner && typeof inner === 'object' && (inner.viewers || inner.viewerCount != null)) {
    return inner
  }
  if (inner?.presentation && (inner.presentation.slides || inner.presentation.deck)) {
    return { ...inner.presentation, ...inner }
  }
  return inner
}

function retryAfterMs(response) {
  const raw = response.headers.get('Retry-After')
  if (!raw) return 15000
  const seconds = Number(raw)
  if (Number.isFinite(seconds)) return Math.max(1000, seconds * 1000)
  const date = Date.parse(raw)
  if (Number.isFinite(date)) return Math.max(1000, date - Date.now())
  return 15000
}

async function readPayload(response) {
  return response.json().catch(() => ({}))
}

class PublicPresentationService {
  async request(endpoint, { method = 'GET', body, etag, keepalive, allowAuth = true } = {}) {
    const headers = allowAuth ? headersWithOptionalAuth() : { ...API_CONFIG.HEADERS }
    if (etag) headers['If-None-Match'] = etag

    const response = await fetch(buildUrl(endpoint), {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      keepalive: Boolean(keepalive),
    })

    if (
      allowAuth &&
      headers.Authorization &&
      (response.status === 401 || response.status === 403)
    ) {
      return this.request(endpoint, { method, body, etag, keepalive, allowAuth: false })
    }

    if (response.status === 304) {
      return { notModified: true, etag: response.headers.get('ETag') || etag || '' }
    }

    if (response.status === 404) {
      throw new PresentationShareUnavailableError()
    }

    if (response.status === 429) {
      const payload = await readPayload(response)
      const err = new PresentationRateLimitError(
        payload.message || 'Too many requests. Please wait and try again.',
        payload
      )
      err.retryAfterMs = retryAfterMs(response)
      throw err
    }

    if (!response.ok) {
      const payload = await readPayload(response)
      const err = new Error(payload?.message || `Request failed: ${response.status}`)
      err.status = response.status
      err.data = payload
      throw err
    }

    if (response.status === 204) {
      return { data: null, etag: response.headers.get('ETag') || '' }
    }

    const json = await readPayload(response)
    return {
      data: unwrap(json),
      etag: response.headers.get('ETag') || '',
      notModified: false,
    }
  }

  getDeck(token, { etag } = {}) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.PUBLIC_DECK(token), { etag })
  }

  getSession(token) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.PUBLIC_SESSION(token))
  }

  getPresence(token) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.PUBLIC_PRESENCE(token))
  }

  putPresence(token, { viewerSessionId, slideIndex }) {
    return this.request(API_CONFIG.ENDPOINTS.PRESENTATIONS.PUBLIC_PRESENCE(token), {
      method: 'PUT',
      body: { viewerSessionId, slideIndex },
    })
  }

  leavePresence(token, viewerSessionId) {
    const query = viewerSessionId
      ? `?viewerSessionId=${encodeURIComponent(viewerSessionId)}`
      : ''
    return this.request(
      `${API_CONFIG.ENDPOINTS.PRESENTATIONS.PUBLIC_PRESENCE(token)}${query}`,
      { method: 'DELETE', keepalive: true }
    ).catch(() => null)
  }
}

const publicPresentationService = new PublicPresentationService()
export default publicPresentationService
