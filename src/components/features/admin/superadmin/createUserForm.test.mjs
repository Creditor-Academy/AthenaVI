#!/usr/bin/env node
/**
 * Unit tests for the superadmin "Create user" form helpers.
 * Run: node --test src/components/features/admin/superadmin/createUserForm.test.mjs
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  INITIAL_CREATE_USER_VALUES,
  PASSWORD_MODE,
  validateCreateUserForm,
  buildCreateUserPayload,
  mapCreateUserError,
  createUserSuccessMessage,
} from './createUserForm.js'

const valid = { ...INITIAL_CREATE_USER_VALUES, name: 'Jane Doe', email: 'jane@example.com' }

describe('validateCreateUserForm', () => {
  it('accepts a valid email-link form (no password needed)', () => {
    assert.deepEqual(validateCreateUserForm(valid), {})
  })

  it('requires name and email, treating whitespace as empty', () => {
    const errors = validateCreateUserForm({ ...valid, name: '   ', email: '  ' })
    assert.match(errors.name, /required/i)
    assert.match(errors.email, /required/i)
  })

  it('enforces name length bounds', () => {
    assert.match(validateCreateUserForm({ ...valid, name: 'J' }).name, /at least 2/)
    assert.match(validateCreateUserForm({ ...valid, name: 'x'.repeat(51) }).name, /at most 50/)
    assert.deepEqual(validateCreateUserForm({ ...valid, name: 'Jo' }), {})
  })

  it('rejects malformed emails', () => {
    for (const email of ['jane', 'jane@', '@example.com', 'jane@example', 'ja ne@example.com', 'a@b.c']) {
      assert.ok(validateCreateUserForm({ ...valid, email }).email, `should reject ${email}`)
    }
  })

  it('accepts plus-addressing and subdomains', () => {
    assert.deepEqual(validateCreateUserForm({ ...valid, email: 'jane+test@mail.example.co.uk' }), {})
  })

  it('does not validate the password while in email-link mode', () => {
    assert.deepEqual(validateCreateUserForm({ ...valid, password: 'x' }), {})
  })

  it('requires a password in manual mode and enforces length', () => {
    const manual = { ...valid, passwordMode: PASSWORD_MODE.MANUAL }
    assert.match(validateCreateUserForm(manual).password, /Enter a password/)
    assert.match(validateCreateUserForm({ ...manual, password: 'short' }).password, /at least 8/)
    assert.match(validateCreateUserForm({ ...manual, password: 'a'.repeat(129) }).password, /at most 128/)
    assert.deepEqual(validateCreateUserForm({ ...manual, password: 'longenough' }), {})
  })

  it('rejects passwords over 72 bytes even when under the character limit', () => {
    const manual = { ...valid, passwordMode: PASSWORD_MODE.MANUAL, password: '😀'.repeat(20) }
    assert.match(validateCreateUserForm(manual).password, /too long/)
  })
})

describe('buildCreateUserPayload', () => {
  it('trims, lower-cases the email and omits the password in email-link mode', () => {
    const payload = buildCreateUserPayload({ ...valid, name: '  Jane Doe ', email: ' Jane@Example.COM ', password: 'leftover' })
    assert.deepEqual(payload, { name: 'Jane Doe', email: 'jane@example.com', sendWelcomeEmail: true })
  })

  it('forces the welcome email on in email-link mode even if the checkbox state is false', () => {
    assert.equal(buildCreateUserPayload({ ...valid, sendWelcomeEmail: false }).sendWelcomeEmail, true)
  })

  it('sends the password verbatim (not trimmed) and honours the checkbox in manual mode', () => {
    const payload = buildCreateUserPayload({
      ...valid,
      passwordMode: PASSWORD_MODE.MANUAL,
      password: ' pa ss word ',
      sendWelcomeEmail: false,
    })
    assert.equal(payload.password, ' pa ss word ')
    assert.equal(payload.sendWelcomeEmail, false)
  })
})

describe('mapCreateUserError', () => {
  it('turns a 409 into an inline email error', () => {
    const { fieldErrors, formError } = mapCreateUserError({ status: 409, message: 'Email already registered' })
    assert.match(fieldErrors.email, /already exists/)
    assert.equal(formError, '')
  })

  it('maps 403 to a permission message', () => {
    assert.match(mapCreateUserError({ status: 403 }).formError, /permission/)
  })

  it('surfaces the server message for other errors and has a fallback', () => {
    assert.equal(mapCreateUserError({ status: 400, message: 'Name is required' }).formError, 'Name is required')
    assert.match(mapCreateUserError({}).formError, /try again/)
    assert.match(mapCreateUserError(null).formError, /try again/)
  })
})

describe('createUserSuccessMessage', () => {
  it('reports success', () => {
    const out = createUserSuccessMessage({ user: { email: 'a@b.co' }, welcomeEmailSent: true }, { sendWelcomeEmail: true })
    assert.equal(out.type, 'success')
    assert.match(out.message, /a@b\.co was created/)
  })

  it('warns when the welcome email failed', () => {
    const out = createUserSuccessMessage({ user: { email: 'a@b.co' }, welcomeEmailSent: false }, { sendWelcomeEmail: true })
    assert.equal(out.type, 'warning')
    assert.match(out.message, /could not be sent/)
  })

  it('does not warn about email when none was requested', () => {
    const out = createUserSuccessMessage({ user: { email: 'a@b.co' }, welcomeEmailSent: false }, { sendWelcomeEmail: false })
    assert.equal(out.type, 'success')
  })
})
