/**
 * Helpers for workspace invitation acceptance flow.
 */

export const PENDING_INVITATION_KEY = 'athenavi:pendingInvitation'
export const PENDING_INVITATION_PREVIEW_KEY = 'athenavi:pendingInvitationPreview'

export function savePendingInvitation({ token, email = '', notificationId = null, workspaceId = null, workspaceName = '' } = {}) {
  if (!token) return
  try {
    sessionStorage.setItem(
      PENDING_INVITATION_KEY,
      JSON.stringify({
        token,
        email: email || '',
        notificationId: notificationId || null,
        workspaceId: workspaceId || null,
        workspaceName: workspaceName || '',
      })
    )
  } catch {
    // ignore
  }
}

export function savePendingInvitationPreview(invitation) {
  if (!invitation) return
  try {
    sessionStorage.setItem(PENDING_INVITATION_PREVIEW_KEY, JSON.stringify(invitation))
  } catch {
    // ignore
  }
}

export function getPendingInvitationPreview() {
  try {
    const raw = sessionStorage.getItem(PENDING_INVITATION_PREVIEW_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getPendingInvitation() {
  try {
    const raw = sessionStorage.getItem(PENDING_INVITATION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingInvitation() {
  try {
    sessionStorage.removeItem(PENDING_INVITATION_KEY)
    sessionStorage.removeItem(PENDING_INVITATION_PREVIEW_KEY)
  } catch {
    // ignore
  }
}

export function parseInvitationTokenFromUrl() {
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const acceptIndex = pathParts.findIndex((part) => part === 'accept')
  const tokenFromPath = acceptIndex >= 0 ? pathParts[acceptIndex + 1] : ''

  const urlParams = new URLSearchParams(window.location.search)
  return tokenFromPath || urlParams.get('token') || ''
}

export function buildInvitationHeadline(invitation) {
  const inviterLabel =
    invitation?.inviter?.name ||
    invitation?.inviter?.email ||
    'Someone'
  const workspaceName = invitation?.workspace?.name || 'this workspace'
  return `${inviterLabel} invited you to join ${workspaceName}`
}

export function redirectToWorkspaceAfterInvite(workspace) {
  if (!workspace?.id) {
    window.location.assign('/dashboard/workspace')
    return
  }

  try {
    sessionStorage.setItem(
      'workspaceCurrentLevel',
      JSON.stringify({
        type: 'workspace',
        id: workspace.id,
        ws: workspace,
      })
    )
  } catch {
    // ignore
  }

  window.location.assign('/dashboard/workspace')
}
