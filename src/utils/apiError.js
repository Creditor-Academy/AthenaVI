/** Paths that must not trigger the global 401 refresh interceptor */
export const AUTH_NO_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/otp/generate',
  '/api/auth/otp/resend',
  '/api/auth/forget-password',
  '/api/auth/reset-password',
  '/api/auth/superadmin/login',
]

export function shouldSkipTokenRefresh(error) {
  const url = error.config?.url || ''
  return AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))
}

export function getApiError(error, fallbackMessage = 'Request failed') {
  const message = error.response?.data?.message || error.message || fallbackMessage
  const err = new Error(message)
  err.status = error.response?.status
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
  let message = result?.error || fallback
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
