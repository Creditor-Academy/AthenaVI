const TOKEN_KEY = (presentationId) => `athenavi:ppt-share-token:${presentationId}`
const URL_KEY = (presentationId) => `athenavi:ppt-share-url:${presentationId}`
const VIEWER_SESSION_KEY = 'athenavi:ppt-viewer-session-id'

export function extractShareToken(value) {
  if (!value) return ''
  const text = String(value).trim()
  if (/…|\.{3}/.test(text)) return ''
  if (text && !text.includes('/') && !text.includes('?') && !text.includes(' ')) {
    return text
  }
  try {
    const url = new URL(text, window.location.origin)
    const fromPath = url.pathname.match(/\/p\/([^/]+)/)?.[1]
    if (fromPath) return decodeURIComponent(fromPath)
    return url.searchParams.get('token') || ''
  } catch {
    const fromPath = String(value).match(/\/p\/([^/?#]+)/)?.[1]
    return fromPath ? decodeURIComponent(fromPath) : ''
  }
}

export function buildShareUrl(tokenOrUrl) {
  const token = extractShareToken(tokenOrUrl)
  if (!token) {
    return isCompleteShareUrl(tokenOrUrl) ? String(tokenOrUrl).trim() : ''
  }
  return `${window.location.origin}/p/${token}`
}

export function isCompleteShareUrl(value) {
  const text = String(value || '').trim()
  if (!text || /…|\.{3}/.test(text)) return false
  return /\/p\/[^/?#]+/.test(text) && !text.endsWith('…')
}

function writeStorage(storage, key, value) {
  try {
    if (value) storage.setItem(key, value)
    else storage.removeItem(key)
  } catch {
    /* ignore quota / private mode */
  }
}

function readStorage(key) {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function presenceDisplayName(viewer) {
  return String(viewer?.displayName || viewer?.name || viewer?.user?.name || '').trim().toLowerCase()
}

export function presenceHasPhoto(viewer) {
  return Boolean(
    viewer?.avatarUrl ||
      viewer?.avatar ||
      viewer?.profileImage ||
      viewer?.photoUrl ||
      viewer?.image ||
      viewer?.user?.profileImage ||
      viewer?.user?.avatarUrl
  )
}

export function presenceIdentityKeys(viewer) {
  if (!viewer) return []
  const keys = new Set()
  const add = (value) => {
    const text = String(value || '').trim().toLowerCase()
    if (text && text !== 'owner') keys.add(text)
  }
  add(viewer.id)
  add(viewer._id)
  add(viewer.userId)
  add(viewer.user?.id)
  add(viewer.user?._id)
  add(viewer.email)
  add(viewer.user?.email)
  add(viewer.viewerSessionId)
  add(viewer.sessionId)
  return Array.from(keys)
}

export function isAnonymousPresenceViewer(viewer) {
  if (!viewer) return true
  if (viewer.isAnonymous || viewer.anonymous || viewer.guest || viewer.isGuest) return true
  if (viewer.kind === 'guest' || viewer.role === 'guest' || viewer.type === 'anonymous') return true
  const userId = viewer.userId || viewer.user?.id || viewer.user?._id
  const email = viewer.email || viewer.user?.email
  const name = presenceDisplayName(viewer)
  if (userId || email || presenceHasPhoto(viewer)) return false
  return !name || /anonymous/i.test(name)
}

export function samePresencePerson(a, b) {
  if (!a || !b) return false
  const aKeys = new Set(presenceIdentityKeys(a))
  if (presenceIdentityKeys(b).some((key) => aKeys.has(key))) return true
  if (isAnonymousPresenceViewer(a) || isAnonymousPresenceViewer(b)) return false
  const aName = presenceDisplayName(a)
  const bName = presenceDisplayName(b)
  return Boolean(aName && aName === bName && !/anonymous/i.test(aName))
}

export function pickRicherPresenceViewer(current, incoming) {
  if (!current) return incoming
  if (!incoming) return current
  const incomingHasPhoto = presenceHasPhoto(incoming)
  const currentHasPhoto = presenceHasPhoto(current)
  if (incomingHasPhoto && !currentHasPhoto) return { ...current, ...incoming }
  if (currentHasPhoto && !incomingHasPhoto) return { ...incoming, ...current }
  return { ...current, ...incoming }
}

export function mergePresenceViewers(...lists) {
  const merged = []
  lists.flat().forEach((viewer) => {
    if (!viewer) return
    const index = merged.findIndex((existing) => samePresencePerson(existing, viewer))
    if (index === -1) merged.push(viewer)
    else merged[index] = pickRicherPresenceViewer(merged[index], viewer)
  })
  return merged
}

export function extractPresencePayload(payload) {
  if (!payload) {
    return { viewers: [], viewerCount: 0, contentUpdatedAt: null, token: '', url: '' }
  }
  const root = payload.data && typeof payload.data === 'object' ? { ...payload, ...payload.data } : payload
  const share = root.share && typeof root.share === 'object' ? root.share : {}
  const rawViewers =
    root.viewers ||
    root.liveViewers ||
    root.participants ||
    share.viewers ||
    share.liveViewers ||
    root.presence?.viewers ||
    []
  const viewers = Array.isArray(rawViewers) ? rawViewers : []
  const viewerCount = Number(root.viewerCount ?? share.viewerCount ?? root.count ?? viewers.length) || viewers.length
  return {
    viewers,
    viewerCount,
    contentUpdatedAt: root.contentUpdatedAt || share.contentUpdatedAt || null,
    token: root.token || share.token || '',
    url: root.url || share.url || share.publicUrl || '',
  }
}

export function stashShareToken(presentationId, tokenOrUrl) {
  if (!presentationId) return
  const token = extractShareToken(tokenOrUrl)
  const url = buildShareUrl(tokenOrUrl) || (isCompleteShareUrl(tokenOrUrl) ? String(tokenOrUrl).trim() : '')
  if (token) {
    writeStorage(localStorage, TOKEN_KEY(presentationId), token)
    writeStorage(sessionStorage, TOKEN_KEY(presentationId), token)
  }
  if (url) {
    writeStorage(localStorage, URL_KEY(presentationId), url)
    writeStorage(sessionStorage, URL_KEY(presentationId), url)
  }
  try {
    window.dispatchEvent(
      new CustomEvent('athenavi:ppt-share-token', { detail: { presentationId, token, url } })
    )
  } catch {
    /* ignore */
  }
}

export function readShareToken(presentationId) {
  if (!presentationId) return ''
  return extractShareToken(readStorage(TOKEN_KEY(presentationId)) || readStorage(URL_KEY(presentationId)))
}

export function readShareUrl(presentationId) {
  if (!presentationId) return ''
  const stored = readStorage(URL_KEY(presentationId))
  if (isCompleteShareUrl(stored)) return stored
  const token = readShareToken(presentationId)
  return token ? buildShareUrl(token) : ''
}

export function clearShareToken(presentationId) {
  if (!presentationId) return
  writeStorage(localStorage, TOKEN_KEY(presentationId), '')
  writeStorage(sessionStorage, TOKEN_KEY(presentationId), '')
  writeStorage(localStorage, URL_KEY(presentationId), '')
  writeStorage(sessionStorage, URL_KEY(presentationId), '')
}

export function getOrCreateViewerSessionId() {
  try {
    const existing = localStorage.getItem(VIEWER_SESSION_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(VIEWER_SESSION_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}
