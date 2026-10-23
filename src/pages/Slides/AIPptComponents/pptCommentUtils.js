export function commentText(comment) {
  return comment?.body || comment?.text || ''
}

export function commentAuthor(comment) {
  return (
    comment?.author?.name ||
    comment?.authorName ||
    comment?.displayName ||
    comment?.author?.displayName ||
    (comment?.author?.isAnonymous ? 'Anonymous viewer' : '') ||
    'Guest'
  )
}

export function commentAvatarUrl(comment) {
  return comment?.author?.profileImage || comment?.author?.avatarUrl || null
}

export function commentInitials(comment) {
  const name = commentAuthor(comment).trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function commentAvatarTone(comment) {
  const seed = String(comment?.author?.id || commentAuthor(comment))
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % 6
}

export function commentReplies(comment) {
  return Array.isArray(comment?.replies) ? comment.replies : []
}

export function commentRelativeTime(comment) {
  const raw = comment?.createdAt || comment?.created_at
  if (!raw) return ''
  const then = new Date(raw).getTime()
  if (!Number.isFinite(then)) return ''
  const diff = Math.max(0, Date.now() - then)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'now'
  if (diff < hour) return `${Math.floor(diff / minute)}m`
  if (diff < day) return `${Math.floor(diff / hour)}h`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function isCommentResolved(comment) {
  return Boolean(comment?.resolvedAt || comment?.resolved || comment?.isResolved)
}

export function commentListFromPayload(payload) {
  const data = payload?.data || payload || {}
  const list = data.comments || data.items || []
  return Array.isArray(list) ? list : []
}
