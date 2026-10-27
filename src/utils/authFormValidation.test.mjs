#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  EMAIL_WITH_TLD_PATTERN,
  getFriendlyAuthErrorMessage,
  clearInputValidity,
  reportEmailValidity,
  reportNameValidity,
  reportPasswordMinLength,
} from './authFormValidation.js'

function fakeInput(value) {
  return {
    value,
    custom: '',
    setCustomValidity(message) {
      this.custom = message
    },
    reportValidity() {
      return this.custom === ''
    },
  }
}

describe('authFormValidation', () => {
  it('accepts emails with a TLD and rejects local-only addresses', () => {
    assert.equal(EMAIL_WITH_TLD_PATTERN.test('name@example.com'), true)
    assert.equal(EMAIL_WITH_TLD_PATTERN.test('name@example.in'), true)
    assert.equal(EMAIL_WITH_TLD_PATTERN.test('name@localhost'), false)
    assert.equal(EMAIL_WITH_TLD_PATTERN.test('not-an-email'), false)
  })

  it('maps network failures to a slow-connection message', () => {
    assert.match(getFriendlyAuthErrorMessage('timeout'), /connection seems slow/)
    assert.match(getFriendlyAuthErrorMessage('Network Error'), /connection seems slow/)
    assert.match(getFriendlyAuthErrorMessage('Failed to fetch'), /connection seems slow/)
  })

  it('maps invalid-email API errors to a friendly email hint', () => {
    assert.match(getFriendlyAuthErrorMessage('must be a valid email'), /valid email address/)
    assert.match(getFriendlyAuthErrorMessage('Validation error'), /valid email address/)
  })

  it('passes through unknown server messages', () => {
    assert.equal(getFriendlyAuthErrorMessage('Account locked'), 'Account locked')
  })

  it('validates email, name, and password inputs', () => {
    const empty = fakeInput('  ')
    assert.equal(reportEmailValidity(empty), false)
    assert.match(empty.custom, /enter your email/)

    const missingAt = fakeInput('name.example.com')
    assert.equal(reportEmailValidity(missingAt), false)
    assert.match(missingAt.custom, /@/)

    const ok = fakeInput(' name@example.com ')
    assert.equal(reportEmailValidity(ok), true)
    assert.equal(ok.custom, '')

    const shortName = fakeInput('A')
    assert.equal(reportNameValidity(shortName), false)
    const longName = fakeInput('Ankit')
    assert.equal(reportNameValidity(longName), true)

    const shortPassword = fakeInput('1234567')
    assert.equal(reportPasswordMinLength(shortPassword), false)
    const longPassword = fakeInput('12345678')
    assert.equal(reportPasswordMinLength(longPassword), true)

    assert.equal(reportEmailValidity(null), false)
    clearInputValidity(ok)
    assert.equal(ok.custom, '')
  })
})
