// Pure helpers for the superadmin "Create user" form (no React, easy to unit test).
// Rules mirror the backend (POST /api/superadmin/users) so most mistakes are caught before a round trip.

export const NAME_MIN = 2
export const NAME_MAX = 50
export const EMAIL_MAX = 254
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 128
export const PASSWORD_MAX_BYTES = 72

export const PASSWORD_MODE = Object.freeze({ EMAIL_LINK: 'email-link', MANUAL: 'manual' })

export const INITIAL_CREATE_USER_VALUES = Object.freeze({
  name: '',
  email: '',
  passwordMode: PASSWORD_MODE.EMAIL_LINK,
  password: '',
  sendWelcomeEmail: true,
})

// Intentionally permissive (the server is the source of truth); catches typos like "a@b" or spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function byteLength(value) {
  return new TextEncoder().encode(value).length
}

/** @returns {{ name?: string, email?: string, password?: string }} empty object when valid */
export function validateCreateUserForm(values) {
  const errors = {}
  const name = String(values?.name ?? '').trim()
  const email = String(values?.email ?? '').trim()

  if (!name) errors.name = 'Name is required.'
  else if (name.length < NAME_MIN) errors.name = `Name must be at least ${NAME_MIN} characters.`
  else if (name.length > NAME_MAX) errors.name = `Name must be at most ${NAME_MAX} characters.`

  if (!email) errors.email = 'Email is required.'
  else if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  if (values?.passwordMode === PASSWORD_MODE.MANUAL) {
    const password = String(values?.password ?? '')
    if (!password) errors.password = 'Enter a password, or choose to email a set-password link.'
    else if (password.length < PASSWORD_MIN) errors.password = `Password must be at least ${PASSWORD_MIN} characters.`
    else if (password.length > PASSWORD_MAX) errors.password = `Password must be at most ${PASSWORD_MAX} characters.`
    else if (byteLength(password) > PASSWORD_MAX_BYTES) errors.password = `Password is too long (max ${PASSWORD_MAX_BYTES} bytes — emoji and accents count extra).`
  }

  return errors
}

/** Builds the request body. Email-link mode never sends a password and always sends the email. */
export function buildCreateUserPayload(values) {
  const manual = values.passwordMode === PASSWORD_MODE.MANUAL
  const payload = {
    name: String(values.name).trim(),
    email: String(values.email).trim().toLowerCase(),
    sendWelcomeEmail: manual ? Boolean(values.sendWelcomeEmail) : true,
  }
  if (manual) payload.password = values.password
  return payload
}

/**
 * Maps an API failure to form state: a duplicate email becomes an inline field error,
 * everything else a form-level message.
 * @returns {{ fieldErrors: Record<string, string>, formError: string }}
 */
export function mapCreateUserError(error) {
  const status = error?.status
  const message = String(error?.message || '').trim()
  if (status === 409) {
    return { fieldErrors: { email: 'A user with this email already exists.' }, formError: '' }
  }
  if (status === 403) {
    return { fieldErrors: {}, formError: 'You do not have permission to create users.' }
  }
  return { fieldErrors: {}, formError: message || 'Could not create the user. Please try again.' }
}

/** Toast copy for a successful create. */
export function createUserSuccessMessage(result, payload) {
  const label = result?.user?.email || payload?.email || 'User'
  if (payload?.sendWelcomeEmail && result?.welcomeEmailSent === false) {
    return {
      type: 'warning',
      message: `${label} was created, but the welcome email could not be sent. They can use “Forgot password” to sign in.`,
    }
  }
  return { type: 'success', message: `${label} was created.` }
}
