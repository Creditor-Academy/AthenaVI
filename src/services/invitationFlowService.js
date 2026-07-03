import workspaceService from './workspaceService.js'
import inboxService from './inboxService.js'
import {
  clearPendingInvitation,
  getPendingInvitation,
  redirectToWorkspaceAfterInvite,
} from '../utils/inviteNavigation.js'

export function isAlreadyMemberError(message) {
  const lower = String(message || '').toLowerCase()
  return lower.includes('already a member') || lower.includes('already member')
}

export function isStaleOrExpiredInvitationError(message) {
  const lower = String(message || '').toLowerCase()
  return (
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('no longer valid')
  )
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

export async function dismissInvitationInboxForToken(token) {
  if (!token) return
  try {
    const data = await inboxService.listNotifications({ category: 'workspace', limit: 50 })
    const matches = (data.notifications || []).filter(
      (notification) =>
        notification.type === 'WORKSPACE_INVITATION' && notification.metadata?.token === token
    )
    await Promise.all(
      matches.map((notification) => inboxService.dismiss(notification.id).catch(() => null))
    )
  } catch {
    // ignore
  }
}

export async function dismissInvitationInbox({
  notificationId = null,
  token = null,
  dismissNotification = true,
} = {}) {
  if (notificationId) {
    await cleanupInvitationNotification(notificationId, dismissNotification)
  }
  if (token) {
    await dismissInvitationInboxForToken(token)
  }
}

const invitationFlowService = {
  async completePendingInvitation({ dismissNotification = true } = {}) {
    const pending = getPendingInvitation()
    if (!pending?.token) return null

    try {
      const workspace = await workspaceService.acceptInvitation(pending.token)
      await dismissInvitationInbox({
        notificationId: pending.notificationId,
        token: pending.token,
        dismissNotification,
      })
      clearPendingInvitation()
      return workspace
    } catch (error) {
      if (isAlreadyMemberError(error.message)) {
        await dismissInvitationInbox({
          notificationId: pending.notificationId,
          token: pending.token,
          dismissNotification,
        })
        clearPendingInvitation()
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

  dismissInvitationInboxForToken,
  dismissInvitationInbox,
}

export default invitationFlowService
