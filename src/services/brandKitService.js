import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'
import { InsufficientCreditsError } from './creditsService.js'
import {
  emptyBrandKitData,
  normalizeBrandKitDetail,
  normalizeBrandKitList,
  normalizeHealth,
  toBrandKitApiData,
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

  async list(workspaceId, { includePersonal } = {}) {
    const fetchList = async (endpoint) => {
      const data = await this.request(endpoint)
      return normalizeBrandKitList(data)
    }

    const base = API_CONFIG.ENDPOINTS.BRAND_KITS.LIST(workspaceId)
    if (includePersonal !== false) {
      return fetchList(base)
    }

    try {
      return await fetchList(`${base}${base.includes('?') ? '&' : '?'}includePersonal=false`)
    } catch (err) {
      if (err?.status !== 400) throw err
      const all = await fetchList(base)
      return (all || []).filter(
        (kit) => !kit.workspaceId || String(kit.workspaceId) === String(workspaceId)
      )
    }
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
        data: toBrandKitApiData(data || emptyBrandKitData()),
      }),
    }).then((payload) => normalizeBrandKitDetail(payload))
  }

  update(workspaceId, brandKitId, body = {}) {
    const payload = { ...body }
    if (payload.data) payload.data = toBrandKitApiData(payload.data)
    return this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.ONE(workspaceId, brandKitId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }).then((result) => normalizeBrandKitDetail(result) || result)
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

  async getHealth(workspaceId, brandKitId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.HEALTH(workspaceId, brandKitId))
    return normalizeHealth(data)
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
    const endpoint =
      API_CONFIG.ENDPOINTS.BRAND_KITS.MEDIA_STREAM?.(workspaceId, brandKitId, mediaId) ||
      `${API_CONFIG.ENDPOINTS.BRAND_KITS.MEDIA_ONE(workspaceId, brandKitId, mediaId)}/stream`
    const response = await fetch(buildUrl(endpoint), {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to stream media')
    return response.blob()
  }

  /**
   * AI color suggestion.
   * Pass `file` (File) for multipart, or JSON body with mediaId/brandKitId/tone/tagline.
   */
  async suggestColors(workspaceId, { file, tone, tagline, brandKitId, mediaId } = {}) {
    if (file) {
      const form = new FormData()
      form.append('file', file)
      if (tone) form.append('tone', tone)
      if (tagline) form.append('tagline', tagline)
      if (brandKitId) form.append('brandKitId', brandKitId)
      if (mediaId) form.append('mediaId', mediaId)
      const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_COLORS(workspaceId), {
        method: 'POST',
        body: form,
      })
      return data?.suggestion || data
    }

    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_COLORS(workspaceId), {
      method: 'POST',
      body: JSON.stringify({
        ...(tone ? { tone } : {}),
        ...(tagline ? { tagline } : {}),
        ...(brandKitId ? { brandKitId } : {}),
        ...(mediaId ? { mediaId } : {}),
      }),
    })
    return data?.suggestion || data
  }

  async suggestFonts(workspaceId, { tone, primaryHex, brandKitId } = {}) {
    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_FONTS(workspaceId), {
      method: 'POST',
      body: JSON.stringify({
        ...(tone ? { tone } : {}),
        ...(primaryHex ? { primaryHex } : {}),
        ...(brandKitId ? { brandKitId } : {}),
      }),
    })
    return data?.suggestion || data
  }

  async suggestVoice(workspaceId, { name, tagline, tone, brandKitId } = {}) {
    if (!name) throw new Error('Brand name is required for voice suggestion')
    const data = await this.request(API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_VOICE(workspaceId), {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(tagline ? { tagline } : {}),
        ...(tone ? { tone } : {}),
        ...(brandKitId ? { brandKitId } : {}),
      }),
    })
    return data?.suggestion || data
  }

  async suggestImageStyle(workspaceId, { tone, colors, colorRoles, brandKitId } = {}) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_IMAGE_STYLE(workspaceId),
      {
        method: 'POST',
        body: JSON.stringify({
          ...(tone ? { tone } : {}),
          ...(colors ? { colors } : {}),
          ...(colorRoles ? { colorRoles } : {}),
          ...(brandKitId ? { brandKitId } : {}),
        }),
      }
    )
    return data?.suggestion || data
  }

  /**
   * Logo variants:
   * - preview (free): body `{}`
   * - apply (paid): `{ applyRoles: ['light','dark','black','white', ...] }`
   */
  async suggestLogoVariants(workspaceId, brandKitId, body = {}) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.SUGGEST_LOGO_VARIANTS(workspaceId, brandKitId),
      {
        method: 'POST',
        body: JSON.stringify(body || {}),
      }
    )
    return data?.suggestion || data?.variants || data
  }

  /**
   * Logo product mockups catalog + free quota billing.
   * GET .../mockups/catalog → { templates, billing }
   */
  async listMockupCatalog(workspaceId, brandKitId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.MOCKUPS_CATALOG(workspaceId, brandKitId)
    )
    return {
      templates: data?.templates || [],
      billing: data?.billing || null,
    }
  }

  /**
   * Saved mockups for a kit (kind: mockup media) + billing.
   * GET .../mockups → { mockups, billing }
   */
  async listMockups(workspaceId, brandKitId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.MOCKUPS(workspaceId, brandKitId)
    )
    return {
      mockups: data?.mockups || data?.items || (Array.isArray(data) ? data : []),
      billing: data?.billing || null,
    }
  }

  /**
   * Generate a logo-on-product mockup.
   * POST .../mockups/generate
   * { templateId, itemColor?, logoRole?, logoPosition?, save? }
   * → { mockup, billing }
   *
   * - itemColor: omit when unset (keeps catalog default look)
   * - logoRole: defaults to primary on the server; send explicitly when chosen
   * - logoPosition: only for apparel templates that support it (tshirt / hoodie)
   */
  async generateMockup(
    workspaceId,
    brandKitId,
    { templateId, itemColor, logoRole, logoPosition, save = false } = {}
  ) {
    if (!templateId) throw new Error('templateId is required')

    const body = {
      templateId,
      save: Boolean(save),
    }

    const hex = typeof itemColor === 'string' ? itemColor.trim() : ''
    if (hex) body.itemColor = hex

    if (logoRole) body.logoRole = logoRole

    if (logoPosition) {
      const raw = String(logoPosition)
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, '_')
      const aliases = {
        back_center: 'center_back',
        back: 'center_back',
        rear: 'center_back',
        rear_center: 'center_back',
        upper_back: 'center_back',
        back_full: 'full_back',
        full_rear: 'full_back',
        rear_full: 'full_back',
      }
      body.logoPosition = aliases[raw] || raw
    }

    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.MOCKUPS_GENERATE(workspaceId, brandKitId),
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )
    return {
      mockup: data?.mockup || data,
      billing: data?.billing || null,
    }
  }

  async getGuidelines(workspaceId, brandKitId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.GUIDELINES(workspaceId, brandKitId)
    )
    return data?.guideline || data
  }

  /**
   * Download printable brand guideline PDF (style-sheet layout with logo variants).
   * Returns { blob, filename }.
   */
  async downloadGuidelinePdf(workspaceId, brandKitId) {
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.BRAND_KITS.GUIDELINES_PDF(workspaceId, brandKitId)),
      { headers: getAuthHeaders() }
    )

    if (response.status === 403) {
      const payload = await this.readPayload(response)
      throw new BrandKitPermissionError(
        payload.message || 'Not allowed to download brand guidelines',
        payload
      )
    }

    if (!response.ok) {
      const payload = await this.readPayload(response)
      throw new Error(payload.message || `Failed to download guideline PDF (${response.status})`)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)
    const filename = match
      ? decodeURIComponent(match[1].replace(/"/g, ''))
      : 'Brand_Guidelines.pdf'

    return { blob, filename }
  }

  async downloadGuidelinePdfAndSave(workspaceId, brandKitId) {
    const { blob, filename } = await this.downloadGuidelinePdf(workspaceId, brandKitId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async generateGuidelines(workspaceId, brandKitId, { folderId } = {}) {
    if (!folderId) throw new Error('folderId is required to generate brand guidelines')
    const data = await this.request(
      API_CONFIG.ENDPOINTS.BRAND_KITS.GUIDELINES_GENERATE(workspaceId, brandKitId),
      {
        method: 'POST',
        body: JSON.stringify({ folderId }),
      }
    )
    return data?.guideline || data
  }
}

const brandKitService = new BrandKitService()
export default brandKitService
