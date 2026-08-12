import { buildUrl, getAuthHeaders } from '../config/api.js'

class SuperadminApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'SuperadminApiError'
    this.status = status
    this.errors = errors
  }
}

async function superadminRequest(path, options = {}) {
  // For multipart/form-data (FormData body), do NOT set Content-Type —
  // the browser must set it with the correct boundary automatically.
  const isMultipart = options.body instanceof FormData
  const authHeaders = getAuthHeaders()

  const baseHeaders = isMultipart
    ? (authHeaders['Authorization']
        ? { Authorization: authHeaders['Authorization'] }
        : {})
    : authHeaders

  const headers = {
    ...baseHeaders,
    ...options.headers,
  }

  const doFetch = (cacheMode) =>
    fetch(buildUrl(path), {
      credentials: 'include',
      ...options,
      cache: cacheMode,
      headers,
    })

  let response = await doFetch(options.cache ?? 'default')
  let body = await response.json().catch(() => ({}))

  // Express ETag 304s can arrive with an empty body in fetch; retry once uncached.
  if (!body.success && (response.status === 304 || (response.ok && body.success === undefined))) {
    response = await doFetch('no-store')
    body = await response.json().catch(() => ({}))
  }

  if (!body.success) {
    throw new SuperadminApiError(
      body.message || 'Request failed',
      response.status,
      body.errors || []
    )
  }

  return body.data
}

function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

const superadminService = {
  listUsers({ page = 1, limit = 20, search } = {}) {
    return superadminRequest(`/api/superadmin/users${toQuery({ page, limit, search })}`)
  },

  updateUserPlatformAccess(userId, { isPlatformSuperadmin }) {
    return superadminRequest(`/api/superadmin/users/${userId}/platform-access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPlatformSuperadmin }),
    })
  },

  getUserCredits(userId) {
    return superadminRequest(`/api/superadmin/users/${userId}/credits`)
  },

  getUserCreditHistory(userId, { page = 1, limit = 20, type } = {}) {
    return superadminRequest(
      `/api/superadmin/users/${userId}/credits/history${toQuery({ page, limit, type })}`
    )
  },

  grantUserCredits(userId, { amount, reason }) {
    return superadminRequest(`/api/superadmin/users/${userId}/credits/grant`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },

  revokeUserCredits(userId, { amount, reason }) {
    return superadminRequest(`/api/superadmin/users/${userId}/credits/revoke`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },

  getUserStorage(userId) {
    return superadminRequest(`/api/superadmin/users/${userId}/storage`)
  },

  getUserStorageHistory(userId, { page = 1, limit = 20, type } = {}) {
    return superadminRequest(
      `/api/superadmin/users/${userId}/storage/history${toQuery({ page, limit, type })}`
    )
  },

  grantUserStorage(userId, { additionalBytes, tierId, reason }) {
    return superadminRequest(`/api/superadmin/users/${userId}/storage/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additionalBytes, tierId, reason }),
    })
  },

  revokeUserStorage(userId, { amountBytes, reason }) {
    return superadminRequest(`/api/superadmin/users/${userId}/storage/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountBytes, reason }),
    })
  },

  getStorageTiers() {
    return superadminRequest('/api/superadmin/storage/tiers')
  },

  listStorageRequests({ page = 1, limit = 20, status } = {}) {
    return superadminRequest(`/api/superadmin/storage/requests${toQuery({ page, limit, status })}`)
  },

  rejectStorageRequest(requestId, { reviewNote } = {}) {
    return superadminRequest(`/api/superadmin/storage/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewNote }),
    })
  },

  listWorkspaces({ page = 1, limit = 20, search } = {}) {
    return superadminRequest(`/api/superadmin/workspaces${toQuery({ page, limit, search })}`)
  },

  getWorkspaceCredits(workspaceId) {
    return superadminRequest(`/api/superadmin/workspaces/${workspaceId}/credits`)
  },

  getWorkspaceCreditHistory(workspaceId, { page = 1, limit = 20, type } = {}) {
    return superadminRequest(
      `/api/superadmin/workspaces/${workspaceId}/credits/history${toQuery({ page, limit, type })}`
    )
  },

  getWorkspaceUsageByMember(workspaceId, { page = 1, limit = 20 } = {}) {
    return superadminRequest(
      `/api/superadmin/workspaces/${workspaceId}/credits/usage-by-member${toQuery({ page, limit })}`
    )
  },

  grantWorkspaceCredits(workspaceId, { amount, reason }) {
    return superadminRequest(`/api/superadmin/workspaces/${workspaceId}/credits/grant`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },

  revokeWorkspaceCredits(workspaceId, { amount, reason }) {
    return superadminRequest(`/api/superadmin/workspaces/${workspaceId}/credits/revoke`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },

  getUsageReport({ from, to, workspaceId, userId, topLimit } = {}) {
    return superadminRequest(
      `/api/superadmin/reports/credits/usage${toQuery({ from, to, workspaceId, userId, topLimit })}`
    )
  },

  getPlatformActionsReport({ page = 1, limit = 20, from, to, type, scope } = {}) {
    return superadminRequest(
      `/api/superadmin/reports/credits/platform-actions${toQuery({ page, limit, from, to, type, scope })}`
    )
  },

  getAlertsSummary() {
    return superadminRequest('/api/superadmin/alerts/summary')
  },

  getHeygenAccount() {
    return superadminRequest('/api/superadmin/heygen/account')
  },

  sendProductEmailBroadcast({ subject, html, text }) {
    return superadminRequest('/api/superadmin/broadcasts/product-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html, text: text || undefined, confirm: 'send' }),
    })
  },

  listEarlyAccessRequests({ page = 1, limit = 20, status } = {}) {
    return superadminRequest(
      `/api/superadmin/early-access/requests${toQuery({ page, limit, status })}`
    )
  },

  getEarlyAccessRequest(requestId) {
    return superadminRequest(`/api/superadmin/early-access/requests/${requestId}`)
  },

  updateEarlyAccessStatus(requestId, { status }) {
    return superadminRequest(`/api/superadmin/early-access/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  },

  approveEarlyAccessRequest(requestId) {
    return superadminRequest(`/api/superadmin/early-access/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  rejectEarlyAccessRequest(requestId) {
    return superadminRequest(`/api/superadmin/early-access/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  },

  listProductEmailBroadcasts({ page = 1, limit = 20 } = {}) {
    return superadminRequest(
      `/api/superadmin/broadcasts/product-email${toQuery({ page, limit })}`
    )
  },

  getProductEmailBroadcast(broadcastId) {
    return superadminRequest(`/api/superadmin/broadcasts/product-email/${broadcastId}`)
  },

  listProductEmailBroadcastRecipients(broadcastId, { page = 1, limit = 50, status } = {}) {
    return superadminRequest(
      `/api/superadmin/broadcasts/product-email/${broadcastId}/recipients${toQuery({ page, limit, status })}`
    )
  },

  // ── Templates ────────────────────────────────────────────────────────────
  listTemplates({ type, isActive } = {}) {
    return superadminRequest(`/api/superadmin/templates${toQuery({ type, isActive })}`)
  },

  getTemplate(templateId) {
    return superadminRequest(`/api/superadmin/templates/${templateId}`)
  },

  createTemplate({ type, name, contentType, variant, isActive, schema }) {
    return superadminRequest('/api/superadmin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, contentType, variant, isActive, schema }),
    })
  },

  updateTemplate(templateId, { name, contentType, variant, isActive, schema }) {
    return superadminRequest(`/api/superadmin/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contentType, variant, isActive, schema }),
    })
  },

  /**
   * Publish a canvas-authored presentation as a DECK_PACK template.
   * POST /api/superadmin/presentations/:presentationId/publish-as-pack
   * @param {string} presentationId
   * @param {{ name: string, packId: string, themeId?: string, variant?: string, isActive?: boolean }} opts
   */
  publishPresentationAsPack(presentationId, { name, packId, themeId, variant, isActive = true }) {
    return superadminRequest(`/api/superadmin/presentations/${presentationId}/publish-as-pack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, packId, themeId, variant, isActive }),
    })
  },

  /**
   * Publish one video scene → VIDEO_SCENE template.
   * POST /api/superadmin/projects/:projectId/scenes/:sceneId/publish-as-template
   */
  publishSceneAsTemplate(projectId, sceneId, { name, variant, isActive = true }) {
    return superadminRequest(`/api/superadmin/projects/${projectId}/scenes/${sceneId}/publish-as-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, variant, isActive }),
    })
  },

  /**
   * Publish all video scenes of a project → VIDEO_PACK template.
   * POST /api/superadmin/projects/:projectId/publish-as-video-pack
   */
  publishProjectAsVideoPack(projectId, { name, packId, isActive = true, variant }) {
    return superadminRequest(`/api/superadmin/projects/${projectId}/publish-as-video-pack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, packId, isActive, variant }),
    })
  },

  // ── Template media (Canva-like baked photos for pack clone) ──────────────
  listTemplateMedia(templateId) {
    return superadminRequest(`/api/superadmin/templates/${templateId}/media`)
  },

  /**
   * Upload a media item to a template.
   * @param {string} templateId
   * @param {{ file: File, kind: 'photo'|'preview'|'graphic', slotHint?: string, name?: string }} opts
   */
  uploadTemplateMedia(templateId, { file, kind, slotHint, name }) {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    if (slotHint) form.append('slotHint', slotHint)
    if (name)     form.append('name', name)
    return superadminRequest(`/api/superadmin/templates/${templateId}/media`, {
      method: 'POST',
      body: form,
      // no Content-Type header — browser sets multipart boundary automatically
    })
  },

  deleteTemplateMedia(templateId, mediaId) {
    return superadminRequest(`/api/superadmin/templates/${templateId}/media/${mediaId}`, {
      method: 'DELETE',
    })
  },
}

export { SuperadminApiError }
export default superadminService
