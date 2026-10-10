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

/** Toast copy for a successful create or bulk import. */
export function createUserSuccessMessage(result, payload) {
  if (result?.isBulk) {
    const { successCount = 0, failedCount = 0, total = 0 } = result
    if (failedCount > 0) {
      return {
        type: 'warning',
        message: `Imported ${successCount} of ${total} users. ${failedCount} failed to create.`,
      }
    }
    return {
      type: 'success',
      message: `Successfully created ${successCount} user${successCount === 1 ? '' : 's'}.`,
    }
  }
  const label = result?.user?.email || payload?.email || 'User'
  if (payload?.sendWelcomeEmail && result?.welcomeEmailSent === false) {
    return {
      type: 'warning',
      message: `${label} was created, but the welcome email could not be sent. They can use “Forgot password” to sign in.`,
    }
  }
  return { type: 'success', message: `${label} was created.` }
}

/** Robust RFC-4180 compliant CSV line/cell parser */
export function parseCsvRows(text) {
  if (!text || typeof text !== 'string') return []
  const rows = []
  let currentRow = []
  let currentCell = ''
  let insideQuotes = false
  let i = 0

  while (i < text.length) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"'
          i += 2
          continue
        } else {
          insideQuotes = false
          i++
          continue
        }
      } else {
        currentCell += char
        i++
        continue
      }
    } else {
      if (char === '"') {
        insideQuotes = true
        i++
        continue
      } else if (char === ',') {
        currentRow.push(currentCell.trim())
        currentCell = ''
        i++
        continue
      } else if (char === '\r') {
        if (nextChar === '\n') i++
        currentRow.push(currentCell.trim())
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
        i++
        continue
      } else if (char === '\n') {
        currentRow.push(currentCell.trim())
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
        i++
        continue
      } else {
        currentCell += char
        i++
        continue
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    rows.push(currentRow)
  }

  return rows
}

/** Parses CSV text into validated user items ready for preview & provisioning */
export function parseCsvUsers(text) {
  const rawRows = parseCsvRows(text)
  const nonEmptyRows = rawRows.filter((r) => r.some((cell) => cell.length > 0))

  if (nonEmptyRows.length === 0) {
    return {
      rows: [],
      validRows: [],
      invalidRows: [],
      totalCount: 0,
      validCount: 0,
      invalidCount: 0,
      error: 'The CSV file appears to be empty.',
    }
  }

  const headerRow = nonEmptyRows[0]
  let nameIndex = -1
  let emailIndex = -1
  let passwordIndex = -1

  headerRow.forEach((col, idx) => {
    const clean = col.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (['name', 'fullname', 'username', 'user', 'namecolumn'].includes(clean)) nameIndex = idx
    else if (['email', 'emailaddress', 'useremail', 'mail'].includes(clean)) emailIndex = idx
    else if (['password', 'pass', 'temppassword', 'userpassword'].includes(clean)) passwordIndex = idx
  })

  // Fallback index assignment if standard header words aren't fully matched
  if (nameIndex === -1 && headerRow.length >= 1) nameIndex = 0
  if (emailIndex === -1 && headerRow.length >= 2) emailIndex = 1
  if (passwordIndex === -1 && headerRow.length >= 3) passwordIndex = 2

  const dataRows = nonEmptyRows.slice(1)
  if (dataRows.length === 0) {
    return {
      rows: [],
      validRows: [],
      invalidRows: [],
      totalCount: 0,
      validCount: 0,
      invalidCount: 0,
      error: 'No data rows found below the header row.',
    }
  }

  const seenEmails = new Set()
  const rows = dataRows.map((cols, index) => {
    const rowNumber = index + 2
    const name = String(cols[nameIndex] || '').trim()
    const email = String(cols[emailIndex] || '').trim().toLowerCase()
    const password = passwordIndex >= 0 ? String(cols[passwordIndex] || '').trim() : ''

    const passwordMode = password ? PASSWORD_MODE.MANUAL : PASSWORD_MODE.EMAIL_LINK
    const errors = validateCreateUserForm({
      name,
      email,
      passwordMode,
      password,
    })

    if (email && seenEmails.has(email)) {
      errors.email = 'Duplicate email found within this CSV.'
    } else if (email) {
      seenEmails.add(email)
    }

    const isValid = Object.keys(errors).length === 0

    return {
      id: `row-${rowNumber}`,
      rowNumber,
      name,
      email,
      password,
      passwordMode,
      isValid,
      errors,
      status: 'pending',
      statusMessage: '',
    }
  })

  const validRows = rows.filter((r) => r.isValid)
  const invalidRows = rows.filter((r) => !r.isValid)

  return {
    rows,
    validRows,
    invalidRows,
    totalCount: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    error: null,
  }
}

/** Generates standard sample CSV content */
export function generateUserCsvTemplate() {
  return [
    'Full Name,Email Address,Password',
    'Sarah Connor,sarah.connor@example.com,',
    'John Doe,john.doe@example.com,TempPass123!',
    'Jane Smith,jane.smith@example.com,',
  ].join('\r\n')
}

/** Triggers download of sample CSV template in browser */
export function downloadUserCsvTemplate() {
  if (typeof document === 'undefined') return
  const content = generateUserCsvTemplate()
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'users_import_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

