/**
 * Browsers refuse a `keepalive` request (one that outlives the page, sent while a tab closes)
 * once the bodies of all keepalive requests in flight add up to more than 64 KiB. That limit is
 * the browser's and cannot be raised. This tracks the bytes in flight so a caller can use
 * keepalive while a body still fits and send an ordinary request when it doesn't, instead of
 * having the browser reject the save outright.
 */

/** The browser's limit is 65,536 bytes; leave room for other keepalive requests on the page. */
export const KEEPALIVE_BUDGET_BYTES = 60 * 1024

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

/** Size in bytes of a request body as it is sent (UTF-8 for strings). */
export function bodyByteLength(body) {
  if (body == null) return 0
  if (typeof body === 'string') return encoder ? encoder.encode(body).length : body.length * 3
  if (typeof body.size === 'number') return body.size // Blob
  if (typeof body.byteLength === 'number') return body.byteLength // ArrayBuffer / views
  return Infinity // FormData, streams: size unknown, never sent as keepalive
}

export function createKeepaliveBudget(limit = KEEPALIVE_BUDGET_BYTES) {
  let inFlight = 0
  return {
    /**
     * Reserve room for `body`. Returns a function that gives the room back (call it when the
     * request settles), or null when the body doesn't fit and must go as an ordinary request.
     */
    reserve(body) {
      const bytes = bodyByteLength(body)
      if (!(bytes <= limit - inFlight)) return null
      inFlight += bytes
      let released = false
      return () => {
        if (released) return
        released = true
        inFlight -= bytes
      }
    },
    get inFlight() {
      return inFlight
    },
  }
}
