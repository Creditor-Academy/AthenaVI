import API_CONFIG, { buildUrl } from '../config/api.js'

function createEarlyAccessError(payload, status, retryAfter) {
  const err = new Error(payload.message || 'Failed to submit early access request.')
  err.status = status
  err.code = payload.error || null
  err.fields = payload.fields || null
  if (retryAfter != null && retryAfter !== '') {
    const seconds = Number(retryAfter)
    if (!Number.isNaN(seconds)) {
      err.retryAfter = seconds
    }
  }
  return err
}

function formatRateLimitMessage(message, retryAfter) {
  if (!retryAfter) return message
  const mins = Math.ceil(retryAfter / 60)
  return `${message} Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`
}

const earlyAccessService = {
  async submitRequest({ name, email, company, role, useCase, message }) {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.EARLY_ACCESS.REQUEST), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        company: company?.trim() || undefined,
        role: role?.trim() || undefined,
        useCase: useCase?.trim() || undefined,
        message: message?.trim() || undefined,
      }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const err = createEarlyAccessError(
        payload,
        response.status,
        response.headers.get('Retry-After')
      )
      if (err.code === 'RATE_LIMIT_EXCEEDED') {
        err.message = formatRateLimitMessage(err.message, err.retryAfter)
      }
      throw err
    }

    return {
      success: payload.success === true,
      message: payload.message || 'Your early access request has been received.',
      requestId: payload.requestId || null,
    }
  },
}

export default earlyAccessService
