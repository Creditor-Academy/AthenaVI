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
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))

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
}

export { SuperadminApiError }
export default superadminService
