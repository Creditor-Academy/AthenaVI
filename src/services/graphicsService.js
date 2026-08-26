import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'

async function graphicsRequest(path, options = {}) {
  const isMultipart = options.body instanceof FormData
  const authHeaders = getAuthHeaders()
  const headers = isMultipart
    ? { ...(authHeaders.Authorization ? { Authorization: authHeaders.Authorization } : {}), ...(options.headers || {}) }
    : { ...authHeaders, ...options.headers }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!body.success) {
    const err = new Error(body.message || 'Graphics request failed')
    err.status = response.status
    throw err
  }
  return body.data
}

const graphicsService = {
  list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') qs.set(k, String(v))
    })
    const suffix = qs.toString() ? `?${qs}` : ''
    return graphicsRequest(`${API_CONFIG.ENDPOINTS.GRAPHICS.LIST}${suffix}`)
  },

  search(intent) {
    return graphicsRequest(API_CONFIG.ENDPOINTS.GRAPHICS.SEARCH, {
      method: 'POST',
      body: JSON.stringify(intent),
    })
  },

  get(id) {
    return graphicsRequest(API_CONFIG.ENDPOINTS.GRAPHICS.GET(id))
  },
}

export default graphicsService
