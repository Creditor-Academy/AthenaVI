#!/usr/bin/env node
/** Run: node --test src/components/features/admin/superadmin/pauseUserSession.flow.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createPausedSessionWorld, runPauseUserSessionDies } from './pauseUserSession.flow.js'

const target = { id: 'u1', email: 'jane@example.com', name: 'Jane', isPlatformSuperadmin: false }

describe('Pause user → session dies (safety path)', () => {
  it('revokes the live session (401) and blocks login (403)', async () => {
    const world = createPausedSessionWorld(target)
    const out = await runPauseUserSessionDies({
      world,
      target,
      currentUserId: 'admin',
      reason: '  Policy violation  ',
    })

    assert.equal(out.before.ok, true)
    assert.equal(out.paused.patch.pauseReason, 'Policy violation')
    assert.equal(out.nextRequest.status, 401)
    assert.match(out.nextRequest.message, /session/i)
    assert.equal(out.auth.accessToken, null)
    assert.equal(out.nextLogin.status, 403)
    assert.match(out.nextLogin.message, /paused/i)
  })

  it('does not kill a session when the admin is blocked from pausing themselves', async () => {
    const world = createPausedSessionWorld(target)
    const sessionId = world.issueSession()
    await assert.rejects(
      () =>
        runPauseUserSessionDies({
          world,
          target,
          currentUserId: target.id,
          reason: 'nope',
        }),
      /own account/
    )
    assert.equal(world.requestWithSession(sessionId).ok, true)
  })
})
