/** Paths that must not trigger the global 401 refresh interceptor */
export const AUTH_NO_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/otp/generate',
  '/api/auth/otp/resend',
  '/api/auth/forget-password',
  '/api/auth/reset-password',
  '/api/auth/superadmin/login',
  '/api/early-access/request',
]

export function shouldSkipTokenRefresh(error) {
  const url = error.config?.url || ''
  return AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))
}

export { getFriendlyAuthErrorMessage } from './authFormValidation.js'

import { getFriendlyAuthErrorMessage } from './authFormValidation.js'
import { sanitizeUserFacingMessage } from './userFacingMessage.js'

export function getApiError(error, fallbackMessage = 'Request failed') {
  const rawMessage = error.response?.data?.message || error.message || fallbackMessage
  const message = sanitizeUserFacingMessage(getFriendlyAuthErrorMessage(rawMessage))
  const err = new Error(message)
  err.status = error.response?.status
  err.code = error.code
  const retryAfter = error.response?.headers?.['retry-after']
  if (retryAfter != null && retryAfter !== '') {
    const seconds = Number(retryAfter)
    if (!Number.isNaN(seconds)) {
      err.retryAfter = seconds
    }
  }
  return err
}

export function isEmailAlreadyRegisteredMessage(message = '') {
  const lower = String(message).toLowerCase()
  return lower.includes('already registered') || lower.includes('email already')
}

export function formatAuthErrorMessage(result, fallback = 'Request failed') {
  let message = sanitizeUserFacingMessage(getFriendlyAuthErrorMessage(result?.error || fallback))
  if (result?.status === 429 && result?.retryAfter) {
    const mins = Math.ceil(result.retryAfter / 60)
    message = `${message} Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`
  }
  return message
}

export function isSignupEmailExistsResult(result) {
  return (
    result?.emailExists === true ||
    result?.status === 409 ||
    isEmailAlreadyRegisteredMessage(result?.error)
  )
}

/** Triggers global session-expired event and cleans auth storage */
export function triggerSessionExpired() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

/** Check if an error or status indicates token / session expiration */
export function isTokenExpiredError(error) {
  if (!error) return false
  const status = error.status || error.response?.status
  if (status === 401) return true

  const msg = String(error.message || error.response?.data?.message || '').toLowerCase()
  return (
    msg.includes('token expired') ||
    msg.includes('jwt expired') ||
    msg.includes('session expired') ||
    msg.includes('token is invalid') ||
    msg.includes('invalid token') ||
    msg.includes('authentication required')
  )
}

