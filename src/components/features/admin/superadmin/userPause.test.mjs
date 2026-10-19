#!/usr/bin/env node
/** Run: node --test src/components/features/admin/superadmin/userPause.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { executePauseUser, pauseUserRequest } from './userLifecycle.js'

const user = { id: 'u1', email: 'jane@example.com', name: 'Jane', isPlatformSuperadmin: false }

describe('Admin user pause', () => {
  it('sends the pause control payload to the lifecycle API', async () => {
    const calls = []
    const pauseUser = async (userId, payload) => {
      calls.push({ userId, payload })
      return {
        user: {
          id: userId,
          pausedAt: '2026-10-19T12:00:00.000Z',
          pauseReason: payload.reason || null,
        },
      }
    }

    const out = await executePauseUser({
      pauseUser,
      user,
      reason: '  Policy violation  ',
      currentUserId: 'admin',
    })

    assert.deepEqual(calls, [{ userId: 'u1', payload: { reason: 'Policy violation' } }])
    assert.equal(out.patch.pausedAt, '2026-10-19T12:00:00.000Z')
    assert.equal(out.patch.pauseReason, 'Policy violation')
  })

  it('does not call the API when the pause control is blocked', async () => {
    let called = 0
    await assert.rejects(
      () =>
        executePauseUser({
          pauseUser: async () => {
            called += 1
            return {}
          },
          user,
          reason: 'nope',
          currentUserId: 'u1',
        }),
      /own account/
    )
    assert.equal(called, 0)
  })

  it('omits an empty reason the same way the row action does', () => {
    assert.deepEqual(pauseUserRequest('   '), { reason: '' })
  })
})
