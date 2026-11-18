/**
 * "Open this page after sign-in": a signed-out visit to an app page (dashboard, editor, …)
 * remembers the full URL, the login page shows, and after sign-in (email, Google, or the
 * session-expired prompt) that URL opens.
 *
 * Kept in sessionStorage: it survives the Google sign-in redirect and a refresh of the login
 * page, stays in this tab, and is dropped after 30 minutes.
 */

const KEY = 'athenavi:returnTo'
const MAX_AGE_MS = 30 * 60 * 1000

/** Pages that are not worth coming back to after signing in. */
const SKIP = [/^\/(login|signup|early-access)(\/|$)/, /^\/(auth|oauth)\//, /^\/login\/callback/, /^\/reset-password/]

function storage() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

/**
 * A same-site path to return to, or null. Only `/…` paths (never `//host` or a full URL, so it
 * can't send anyone to another site), and never the sign-in pages themselves.
 */
export function safeReturnTo(value) {
  if (typeof value !== 'string') return null
  const url = value.trim()
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return null
  // No control characters (a newline or tab in a URL is never a real page).
  if ([...url].some((ch) => ch.charCodeAt(0) < 0x20)) return null
  const path = url.split(/[?#]/)[0]
  if (path === '/' || SKIP.some((re) => re.test(path))) return null
  return url.slice(0, 2000)
}

/** The current page's URL (path, query and hash), for returning to it after sign-in. */
export function currentReturnTo(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return null
  return safeReturnTo(`${loc.pathname || ''}${loc.search || ''}${loc.hash || ''}`)
}

/** Remember `url` (default: the current page). Returns what was saved, or null. */
export function saveReturnTo(url = currentReturnTo(), now = Date.now()) {
  const safe = safeReturnTo(url)
  const store = storage()
  if (!safe || !store) return null
  try {
    store.setItem(KEY, JSON.stringify({ url: safe, at: now }))
  } catch {
    return null
  }
  return safe
}

/** The remembered page (and forget it), or null when there is none or it is too old. */
export function takeReturnTo(now = Date.now()) {
  const store = storage()
  if (!store) return null
  let saved = null
  try {
    saved = JSON.parse(store.getItem(KEY) || 'null')
    store.removeItem(KEY)
  } catch {
    return null
  }
  if (!saved || now - Number(saved.at || 0) > MAX_AGE_MS) return null
  return safeReturnTo(saved.url)
}

export function clearReturnTo() {
  try {
    storage()?.removeItem(KEY)
  } catch {
    // nothing to clear
  }
}
