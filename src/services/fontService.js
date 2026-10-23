import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js'

class FontService {
  unwrap(json) {
    return json?.data ?? json
  }

  async request(endpoint) {
    const response = await fetch(buildUrl(endpoint), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const err = new Error(payload.message || `Font request failed: ${response.status}`)
      err.status = response.status
      err.data = payload
      throw err
    }

    const json = await response.json().catch(() => ({}))
    return this.unwrap(json)
  }

  /**
   * @param {{ q?: string, category?: string, featured?: boolean, limit?: number, subset?: string }} [params]
   * @returns {Promise<{ fonts: Array, pairings: Array, total: number }>}
   */
  async getCatalog({ q, category, featured, limit, subset } = {}) {
    const search = new URLSearchParams()
    if (q) search.set('q', String(q).trim())
    if (category) search.set('category', category)
    if (subset) search.set('subset', subset)
    if (featured === true || featured === false) search.set('featured', String(featured))
    if (limit != null) search.set('limit', String(limit))

    const qs = search.toString()
    const data = await this.request(
      `${API_CONFIG.ENDPOINTS.FONTS.CATALOG}${qs ? `?${qs}` : ''}`
    )
    return {
      fonts: Array.isArray(data?.fonts) ? data.fonts : [],
      pairings: Array.isArray(data?.pairings) ? data.pairings : [],
      total: Number(data?.total) || 0,
    }
  }

  /**
   * @param {string|string[]} families
   * @returns {Promise<{ href: string, families: string[] }>}
   */
  async getCssHref(families) {
    const list = (Array.isArray(families) ? families : String(families || '').split(','))
      .map((f) => String(f || '').trim())
      .filter(Boolean)
    if (!list.length) {
      throw new Error('At least one font family is required')
    }
    const search = new URLSearchParams()
    search.set('families', list.join(','))
    const data = await this.request(`${API_CONFIG.ENDPOINTS.FONTS.CSS}?${search}`)
    return {
      href: data?.href || '',
      families: Array.isArray(data?.families) ? data.families : list,
    }
  }
}

const fontService = new FontService()
export default fontService
