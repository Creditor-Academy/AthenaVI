/** Requires local part @ domain with a TLD (e.g. .com, .in) */
export const EMAIL_WITH_TLD_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export function getFriendlyAuthErrorMessage(message = '') {
  const text = String(message || '')
  const lower = text.toLowerCase()

  if (
    lower.includes('timeout') ||
    lower.includes('econnaborted') ||
    lower.includes('network error') ||
    lower.includes('failed to fetch') ||
    lower.includes('network request failed')
  ) {
    return 'Your connection seems slow. Please check your internet and try again.'
  }

  if (lower === 'validation error' || lower.includes('must be a valid email')) {
    return 'Please enter a valid email address (e.g. name@example.com).'
  }

  return text
}

export function clearInputValidity(input) {
  if (input) {
    input.setCustomValidity('')
  }
}

export function reportEmailValidity(input) {
  if (!input) return false

  const value = String(input.value || '').trim()

  if (!value) {
    input.setCustomValidity('Please enter your email address.')
    return input.reportValidity()
  }

  if (!value.includes('@')) {
    input.setCustomValidity('Please include an @ in the email address.')
    return input.reportValidity()
  }

  if (!EMAIL_WITH_TLD_PATTERN.test(value)) {
    input.setCustomValidity(
      'Please enter a valid email address (e.g. name@example.com).'
    )
    return input.reportValidity()
  }

  input.setCustomValidity('')
  return input.reportValidity()
}

export function reportNameValidity(input) {
  if (!input) return false

  const value = String(input.value || '').trim()

  if (value.length < 2) {
    input.setCustomValidity('Please enter at least 2 characters for your name.')
    return input.reportValidity()
  }

  input.setCustomValidity('')
  return input.reportValidity()
}

export function reportPasswordMinLength(input, minLength = 8) {
  if (!input) return false

  const value = String(input.value || '')

  if (value.length < minLength) {
    input.setCustomValidity(
      `Please lengthen this text to ${minLength} characters or more (you are currently using ${value.length} characters).`
    )
    return input.reportValidity()
  }

  input.setCustomValidity('')
  return input.reportValidity()
}
