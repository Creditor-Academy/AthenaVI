#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  mapInboxNotificationToInvitation,
  mapInboxNotificationsToInvitations,
} from './inboxInvitationMapper.js'

describe('inboxInvitationMapper', () => {
  it('maps a pending workspace invitation', () => {
    const invite = mapInboxNotificationToInvitation({
      id: 'n1',
      type: 'WORKSPACE_INVITATION',
      title: 'Invitation to Design',
      metadata: {
        token: 'tok',
        invitationId: 'inv-1',
        email: 'a@example.com',
        role: 'ADMIN',
        workspaceId: 'w1',
        workspaceName: 'Design',
        inviterName: 'Komal',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    })
    assert.equal(invite.id, 'inv-1')
    assert.equal(invite.token, 'tok')
    assert.equal(invite.role, 'ADMIN')
    assert.equal(invite.workspace.id, 'w1')
    assert.equal(invite.invitedBy, 'Komal')
  })

  it('drops missing tokens, non-invite types, and expired invites', () => {
    assert.equal(mapInboxNotificationToInvitation({ type: 'COMMENT' }), null)
    assert.equal(
      mapInboxNotificationToInvitation({
        type: 'WORKSPACE_INVITATION',
        metadata: {},
      }),
      null
    )
    assert.equal(
      mapInboxNotificationToInvitation({
        type: 'WORKSPACE_INVITATION',
        metadata: {
          token: 'tok',
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        },
      }),
      null
    )
  })

  it('filters a mixed inbox list down to pending invites', () => {
    const mapped = mapInboxNotificationsToInvitations([
      { id: 'n1', type: 'WORKSPACE_INVITATION', metadata: { token: 'a', workspaceName: 'A' } },
      { id: 'n2', type: 'COMMENT', metadata: { token: 'b' } },
    ])
    assert.equal(mapped.length, 1)
    assert.equal(mapped[0].token, 'a')
  })
})
