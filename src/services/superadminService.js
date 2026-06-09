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

  getWorkspaceCredits(workspaceId) {
    return superadminRequest(`/api/superadmin/workspaces/${workspaceId}/credits`)
  },

  grantWorkspaceCredits(workspaceId, { amount, reason }) {
    return superadminRequest(`/api/superadmin/workspaces/${workspaceId}/credits/grant`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },

  getUsageReport({ from, to, workspaceId, userId } = {}) {
    return superadminRequest(
      `/api/superadmin/reports/credits/usage${toQuery({ from, to, workspaceId, userId })}`
    )
  },
}

export { SuperadminApiError }
export default superadminService
