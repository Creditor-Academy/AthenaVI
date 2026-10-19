/**
 * Map WORKSPACE_INVITATION inbox notifications to workspace invitation UI shape.
 */
export function mapInboxNotificationToInvitation(notification) {
  if (!notification || notification.type !== 'WORKSPACE_INVITATION') return null

  const metadata = notification.metadata || {}
  const token = metadata.token
  if (!token) return null
  // Expired invites can no longer be accepted; don't list them as pending.
  if (metadata.expiresAt && new Date(metadata.expiresAt).getTime() < Date.now()) return null

  return {
    id: metadata.invitationId || notification.id,
    notificationId: notification.id,
    token,
    email: metadata.email || '',
    role: metadata.role || 'MEMBER',
    workspaceId: metadata.workspaceId,
    workspaceName: metadata.workspaceName || notification.title?.replace(/^Invitation to /i, '') || 'Workspace',
    invitedBy: metadata.inviterName || null,
    expiresAt: metadata.expiresAt || null,
    workspace: metadata.workspaceId
      ? { id: metadata.workspaceId, name: metadata.workspaceName }
      : null,
  }
}

export function mapInboxNotificationsToInvitations(notifications = []) {
  return notifications
    .map(mapInboxNotificationToInvitation)
    .filter(Boolean)
}
