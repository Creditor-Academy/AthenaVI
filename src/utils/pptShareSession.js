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
