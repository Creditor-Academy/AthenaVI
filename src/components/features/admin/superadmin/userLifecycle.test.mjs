#!/usr/bin/env node
/** Run: node --test src/components/features/admin/superadmin/userLifecycle.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isUserPaused,
  lifecycleBlockedReason,
  isDeleteConfirmed,
  mapLifecycleError,
  lifecycleSuccessMessage,
} from './userLifecycle.js'

const user = { id: 'u1', email: 'Jane@Example.com', name: 'Jane', isPlatformSuperadmin: false }

describe('isUserPaused', () => {
  it('is true only when pausedAt is set', () => {
    assert.equal(isUserPaused({ pausedAt: '2026-10-10T00:00:00Z' }), true)
    assert.equal(isUserPaused({ pausedAt: null }), false)
    assert.equal(isUserPaused({}), false)
    assert.equal(isUserPaused(undefined), false)
  })
})

describe('lifecycleBlockedReason', () => {
  it('allows a normal user', () => {
    assert.equal(lifecycleBlockedReason(user, 'admin'), '')
  })
  it('blocks yourself', () => {
    assert.match(lifecycleBlockedReason(user, 'u1'), /own account/)
  })
  it('blocks platform superadmins', () => {
    assert.match(lifecycleBlockedReason({ ...user, isPlatformSuperadmin: true }, 'admin'), /superadmin/i)
  })
  it('blocks when there is no user', () => {
    assert.ok(lifecycleBlockedReason(null, 'admin'))
  })
  it('does not treat a missing current user id as "self"', () => {
    assert.equal(lifecycleBlockedReason(user, undefined), '')
  })
})

describe('isDeleteConfirmed', () => {
  it('matches the email ignoring case and surrounding whitespace', () => {
    assert.equal(isDeleteConfirmed(user, '  jane@example.COM '), true)
  })
  it('rejects partial, empty or different input', () => {
    assert.equal(isDeleteConfirmed(user, 'jane@example'), false)
    assert.equal(isDeleteConfirmed(user, ''), false)
    assert.equal(isDeleteConfirmed(user, undefined), false)
    assert.equal(isDeleteConfirmed(user, 'DELETE'), false)
  })
  it('never confirms a user without an email', () => {
    assert.equal(isDeleteConfirmed({ id: 'x' }, ''), false)
  })
})

describe('mapLifecycleError', () => {
  it('maps known statuses', () => {
    assert.match(mapLifecycleError({ status: 404 }, 'delete'), /no longer exists/)
    assert.match(mapLifecycleError({ status: 403 }, 'pause'), /permission/)
  })
  it('surfaces server guard messages for 400/409', () => {
    assert.equal(mapLifecycleError({ status: 409, message: 'owns team workspaces: Acme' }, 'delete'), 'owns team workspaces: Acme')
    assert.match(mapLifecycleError({ status: 400 }, 'pause'), /Could not pause/)
  })
  it('falls back for unknown errors', () => {
    assert.match(mapLifecycleError(null, 'resume'), /try again/)
  })
})

describe('lifecycleSuccessMessage', () => {
  it('names the user per action', () => {
    assert.match(lifecycleSuccessMessage('pause', user), /paused for Jane/)
    assert.match(lifecycleSuccessMessage('resume', user), /resumed for Jane/)
    assert.match(lifecycleSuccessMessage('delete', { email: 'a@b.co' }), /a@b\.co was deleted/)
  })
})
