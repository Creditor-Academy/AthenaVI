// Pure helpers for the superadmin pause / resume / delete user actions.

export const PAUSE_REASON_MAX = 500

export function isUserPaused(user) {
  return Boolean(user?.pausedAt)
}

/**
 * Why (if at all) lifecycle actions are unavailable for a user. Mirrors the server guardrails so the
 * buttons explain themselves; the server still enforces them (e.g. env-allowlisted superadmins).
 * @returns {string} empty when allowed
 */
export function lifecycleBlockedReason(user, currentUserId) {
  if (!user?.id) return 'No user selected.'
  if (currentUserId && user.id === currentUserId) return 'You cannot pause or delete your own account.'
  if (user.isPlatformSuperadmin) return 'Revoke platform superadmin access first.'
  return ''
}

/** Delete needs the exact email typed back (case/whitespace-insensitive, like the server). */
export function isDeleteConfirmed(user, typed) {
  const expected = String(user?.email || '').trim().toLowerCase()
  return Boolean(expected) && String(typed ?? '').trim().toLowerCase() === expected
}

/** @param {'pause'|'resume'|'delete'} action */
export function mapLifecycleError(error, action) {
  const message = String(error?.message || '').trim()
  switch (error?.status) {
    case 404:
      return 'This user no longer exists. Refresh the list.'
    case 403:
      return 'You do not have permission to do that.'
    case 409:
    case 400:
      return message || `Could not ${action} this user.`
    default:
      return message || `Could not ${action} this user. Please try again.`
  }
}

export function lifecycleSuccessMessage(action, user) {
  const label = user?.name || user?.email || 'User'
  if (action === 'pause') return `Service paused for ${label}.`
  if (action === 'resume') return `Service resumed for ${label}.`
  return `${label} was deleted.`
}
