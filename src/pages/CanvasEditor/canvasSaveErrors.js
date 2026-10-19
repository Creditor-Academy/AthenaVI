/**
 * Classify Canvas autosave failures and decide what the editor does about each.
 * Errors come from canvasService, which sets `status` and `details` (server `errors`).
 */

export const SAVE_ERROR = {
  NETWORK: 'network',
  SERVER: 'server',
  VALIDATION: 'validation',
  AUTH: 'auth',
  NOT_FOUND: 'not-found',
  CONFLICT: 'conflict',
}

export const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000]

export function classifySaveError(error) {
  const status = Number(error?.status) || 0
  // fetch() rejects with a TypeError and no status when the request never got a response.
  if (!status) return SAVE_ERROR.NETWORK
  if (status === 409) return SAVE_ERROR.CONFLICT
  if (status === 401 || status === 403) return SAVE_ERROR.AUTH
  if (status === 404) return SAVE_ERROR.NOT_FOUND
  if (status === 408 || status === 429 || status >= 500) return SAVE_ERROR.SERVER
  return SAVE_ERROR.VALIDATION
}

/** Network and server failures are retried automatically; the rest need the user. */
export function isRetryable(kind) {
  return kind === SAVE_ERROR.NETWORK || kind === SAVE_ERROR.SERVER
}

/** Conflicts, deleted designs and expired sessions stop autosave until the user acts. */
export function haltsAutosave(kind) {
  return kind === SAVE_ERROR.CONFLICT || kind === SAVE_ERROR.NOT_FOUND || kind === SAVE_ERROR.AUTH
}

export function retryDelayMs(attempt) {
  return RETRY_DELAYS_MS[Math.min(Math.max(attempt, 0), RETRY_DELAYS_MS.length - 1)]
}

const VALIDATION_HINTS = [
  [/elements.*less than or equal to (\d+)/i, (n) => `A page can hold at most ${n} elements.`],
  [/canvases.*less than or equal to (\d+)/i, (n) => `A design can have at most ${n} pages.`],
  [/(width|height).*less than or equal to (\d+)/i, (_side, n) => `Pages can be at most ${n} px on each side.`],
  [/too large|exceeds server limit/i, () => 'This design is too large to save.'],
]

function describeValidationError(error) {
  const details = Array.isArray(error?.details) ? error.details : []
  for (const detail of [...details, error?.message || '']) {
    for (const [pattern, describe] of VALIDATION_HINTS) {
      const match = String(detail).match(pattern)
      if (match) return describe(...match.slice(1))
    }
  }
  return details[0] || error?.message || 'The server refused this design.'
}

/** One sentence for the header badge / dialogs. */
export function describeSaveError(kind, error) {
  switch (kind) {
    case SAVE_ERROR.NETWORK:
      return "You're offline or the server can't be reached. Retrying…"
    case SAVE_ERROR.SERVER:
      return 'The server had a problem saving. Retrying…'
    case SAVE_ERROR.CONFLICT:
      return 'This design was changed somewhere else since you opened it.'
    case SAVE_ERROR.AUTH:
      return 'Your session expired, so changes are not being saved.'
    case SAVE_ERROR.NOT_FOUND:
      return 'This design was deleted or you no longer have access to it.'
    default:
      return `Not saved: ${describeValidationError(error)}`
  }
}
