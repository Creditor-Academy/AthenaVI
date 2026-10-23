import workspaceService from './workspaceService.js'
import inboxService from './inboxService.js'
import {
  clearPendingInvitation,
  getPendingInvitation,
  redirectToWorkspaceAfterInvite,
} from '../utils/inviteNavigation.js'

function isAlreadyMemberError(message) {
  const lower = String(message || '').toLowerCase()
  return lower.includes('already a member') || lower.includes('already member')
}

async function cleanupInvitationNotification(notificationId, dismissNotification) {
  if (!notificationId) return
  try {
    await inboxService.markRead(notificationId)
  } catch {
    // ignore
  }
  if (dismissNotification) {
    try {
      await inboxService.dismiss(notificationId)
    } catch {
      // ignore
    }
  }
}

const invitationFlowService = {
  async completePendingInvitation({ dismissNotification = true } = {}) {
    const pending = getPendingInvitation()
    if (!pending?.token) return null

    try {
      const workspace = await workspaceService.acceptInvitation(pending.token)
      await cleanupInvitationNotification(pending.notificationId, dismissNotification)
      clearPendingInvitation()
      return workspace
    } catch (error) {
      // A failed accept must not linger: a stale pending invite would be retried
      // (and fail) on every later login. The invite page re-saves it on retry.
      clearPendingInvitation()
      if (isAlreadyMemberError(error.message)) {
        await cleanupInvitationNotification(pending.notificationId, dismissNotification)
        if (pending.workspaceId) {
          return { id: pending.workspaceId, name: pending.workspaceName || 'Workspace' }
        }
      }
      throw error
    }
  },

  redirectAfterInvite(workspace) {
    redirectToWorkspaceAfterInvite(workspace)
  },

  finishInviteWithWorkspace(workspace) {
    clearPendingInvitation()
    redirectToWorkspaceAfterInvite(workspace)
  },
}

export default invitationFlowService
