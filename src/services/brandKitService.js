import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'
import { InsufficientCreditsError } from './creditsService.js'
import {
  emptyBrandKitData,
  normalizeBrandKitDetail,
  normalizeBrandKitList,
} from '../utils/brandKitHelpers.js'

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

export class BrandKitPermissionError extends Error {
  constructor(message, data = {}) {
    super(message || 'You do not have permission to modify brand kits')
    this.name = 'BrandKitPermissionError'
    this.code = 'BRAND_KIT_PERMISSION'
    this.status = 403
    this.data = data
  }
}

class BrandKitService {
  unwrap(json) {
    return json?.data ?? json
  }

  async readPayload(response) {
    return response.json().catch(() => ({}))
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

    if (response.status === 403) {
      const payload = await this.readPayload(response)
      throw new BrandKitPermissionError(
        payload.message || 'Not allowed to modify brand kits',
        payload
      )
    }

    if (!response.ok) {
      const payload = await this.readPayload(response)
      if (import.meta.env?.DEV) {
        console.error('[brandKitService] request failed', {
          endpoint,
          status: response.status,
          response: payload,
        })
      }
      const err = new Error(
        formatValidationMessage(payload) || `Brand kit request failed: ${response.status}`
      )
      err.status = response.status
      err.data = payload
      err.errors = payload.errors
      throw err
    }

    if (response.status === 204) return null
    const json = await response.json().catch(() => ({}))
    return this.unwrap(json)
  }

  async list(workspaceId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.LIST(workspaceId))
    return normalizeBrandKitList(data)
  }

  async get(workspaceId, brandKitId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.ONE(workspaceId, brandKitId))
    return normalizeBrandKitDetail(data)
  }

  create(workspaceId, { name, isDefault = false, data } = {}) {
    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.LIST(workspaceId), {
      method: 'POST',
      body: JSON.stringify({
        name: name || 'Untitled Brand Kit',
        isDefault: Boolean(isDefault),
        data: data || emptyBrandKitData(),
      }),
    }).then((payload) => normalizeBrandKitDetail(payload))
  }

  update(workspaceId, brandKitId, body = {}) {
    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.ONE(workspaceId, brandKitId), {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((payload) => normalizeBrandKitDetail(payload) || payload)
  }

  remove(workspaceId, brandKitId) {
    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.ONE(workspaceId, brandKitId), {
      method: 'DELETE',
    })
  }

  setDefault(workspaceId, brandKitId) {
    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.SET_DEFAULT(workspaceId, brandKitId), {
      method: 'POST',
      body: JSON.stringify({}),
    }).then((payload) => normalizeBrandKitDetail(payload) || payload)
  }

  uploadMedia(workspaceId, brandKitId, { file, kind, role, name } = {}) {
    if (!file) throw new Error('File is required')
    if (!kind) throw new Error('Media kind is required (logo | photo | graphic)')

    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    if (role) form.append('role', role)
    if (name) form.append('name', name)

    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.MEDIA(workspaceId, brandKitId), {
      method: 'POST',
      body: form,
    })
  }

  deleteMedia(workspaceId, brandKitId, mediaId) {
    return this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.MEDIA_ONE(workspaceId, brandKitId, mediaId),
      { method: 'DELETE' }
    )
  }

  async fetchMediaBlob(workspaceId, brandKitId, mediaId) {
    const endpoint = `${API_CONFIG.ENDPOINTS.BRAND_KITS.MEDIA_ONE(workspaceId, brandKitId, mediaId)}/stream`
    const response = await fetch(buildUrl(endpoint), {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to stream media')
    return response.blob()
  }
}

const brandKitService = new BrandKitService()
export default brandKitService
