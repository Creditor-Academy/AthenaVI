/**
 * Keeps API calls working when the access token runs out.
 *
 * The access token lasts a day; the refresh-token cookie lasts a week. Every API call that
 * comes back 401 renews the access token once (one renewal shared by all calls failing at the
 * same moment) and is sent again with the new token. Only when the renewal itself is refused
 * does the session-expired prompt appear.
 */
import API_CONFIG, { buildUrl } from '../config/api.js'
import { AUTH_NO_REFRESH_PATHS, triggerSessionExpired } from './apiError.js'

const REFRESH_PATH = API_CONFIG.ENDPOINTS?.AUTH?.REFRESH_TOKEN || '/api/auth/refresh'
// Another tab may be renewing at the same moment (the refresh token rotates on each use, so
// only one of them succeeds); give it this long to store the token it got.
const OTHER_TAB_GRACE_MS = 600

let rawFetch = (...args) => globalThis.fetch(...args)
let inflight = null

function storedToken() {
  try {
    return localStorage.getItem('accessToken') || null
  } catch {
    return null
  }
}

function storeToken(token) {
  try {
    localStorage.setItem('accessToken', token)
  } catch {
    /* storage blocked: the token still works for this call */
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A fresh access token, or null when the session can't be renewed (signed out, refresh token
 * expired or revoked). Calls made while a renewal is running share it.
 * @param {{ staleToken?: string|null }} [opts] the token the failed request was sent with
 */
export function refreshAccessToken({ staleToken = null } = {}) {
  // Already renewed (by an earlier call or another tab) since that request went out.
  const current = storedToken()
  if (current && staleToken && current !== staleToken) return Promise.resolve(current)
  if (inflight) return inflight

  const before = current
  inflight = (async () => {
    try {
      const response = await rawFetch(buildUrl(REFRESH_PATH), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (response.ok) {
        const json = await response.json().catch(() => null)
        const token = json?.data?.accessToken || json?.accessToken
        if (token) {
          storeToken(token)
          globalThis.window?.dispatchEvent?.(new CustomEvent('auth:token-refreshed'))
          return token
        }
      }
    } catch {
      /* network error: fall through */
    }
    // Lost the race to another tab? It stores the token it got.
    await wait(OTHER_TAB_GRACE_MS)
    const after = storedToken()
    return after && after !== before ? after : null
  })().finally(() => {
    inflight = null
  })
  return inflight
}

function requestUrl(input) {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input?.url || ''
}

function isApiUrl(url) {
  if (!url) return false
  if (url.startsWith('/api/')) return true
  const base = API_CONFIG.BASE_URL
  if (base && url.startsWith(`${base.replace(/\/$/, '')}/api/`)) return true
  const origin = globalThis.location?.origin
  return Boolean(origin && url.startsWith(`${origin}/api/`))
}

function bearerOf(headers) {
  if (!headers) return null
  let value = null
  if (typeof Headers !== 'undefined' && headers instanceof Headers) value = headers.get('Authorization')
  else if (Array.isArray(headers)) value = headers.find(([k]) => k.toLowerCase() === 'authorization')?.[1]
  else {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === 'authorization')
    value = key ? headers[key] : null
  }
  const match = /^Bearer\s+(.+)$/i.exec(String(value || ''))
  return match ? match[1] : null
}

function withBearer(headers, token) {
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const next = new Headers(headers)
    next.set('Authorization', `Bearer ${token}`)
    return next
  }
  const entries = Array.isArray(headers) ? headers : Object.entries(headers || {})
  const next = Object.fromEntries(entries.filter(([k]) => k.toLowerCase() !== 'authorization'))
  next.Authorization = `Bearer ${token}`
  return next
}

/** Whether a 401 from this URL means "renew the token and try again". */
export function shouldRenewFor(url) {
  return isApiUrl(url) && !url.includes(REFRESH_PATH) && !AUTH_NO_REFRESH_PATHS.some((p) => url.includes(p))
}

/**
 * Renews the token after a 401 that `staleToken` got. Returns the new token, or null after
 * showing the session-expired prompt.
 */
export async function renewAfter401(staleToken) {
  const token = await refreshAccessToken({ staleToken })
  if (!token) triggerSessionExpired()
  return token
}

/** fetch that renews the access token and resends the request once when an API call gets a 401. */
export function withAuthRefresh(fetchImpl) {
  return async function authFetch(input, init) {
    const response = await fetchImpl(input, init)
    if (response.status !== 401) return response
    // A Request object's body can't be sent twice; every caller here passes a URL + init.
    if (typeof input !== 'string' && !(input instanceof URL)) return response
    const url = requestUrl(input)
    const sent = bearerOf(init?.headers)
    if (!sent || !shouldRenewFor(url)) return response
    const token = await renewAfter401(sent)
    if (!token) return response
    return fetchImpl(input, { ...init, headers: withBearer(init.headers, token) })
  }
}

/** Routes every fetch() in the app through withAuthRefresh. Call once at startup. */
export function installAuthFetch() {
  const target = globalThis
  if (!target.fetch || target.fetch.__authRefresh) return
  const original = target.fetch.bind(target)
  rawFetch = original
  const wrapped = withAuthRefresh(original)
  wrapped.__authRefresh = true
  target.fetch = wrapped
}

/** Test hook: point renewal at a stub fetch. */
export function __setRawFetchForTests(fn) {
  rawFetch = fn
  inflight = null
}
