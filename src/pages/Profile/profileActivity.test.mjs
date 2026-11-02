#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildProfileActivity, creditActivityItem, workspaceActivityItems } from './profileActivity.js'

const at = (iso) => `2026-10-${iso}T10:00:00.000Z`

describe('profile activity', () => {
  it('names the workspace and amount for allocations and returns', () => {
    const names = { w1: 'Marketing Studio' }
    const alloc = creditActivityItem({ id: 1, type: 'allocation', amount: -1000, workspaceId: 'w1', createdAt: at('20') }, names)
    assert.equal(alloc.action, 'Credits allocated')
    assert.equal(alloc.detail, '1,000 credits to Marketing Studio')
    assert.equal(alloc.amount, -1000)

    const back = creditActivityItem({ id: 2, type: 'deallocation', amount: 250, metadata: { workspaceName: 'Design Lab' }, createdAt: at('21') })
    assert.equal(back.action, 'Credits returned')
    assert.equal(back.detail, '250 credits back from Design Lab')
    assert.equal(back.amount, 250)

    const unknown = creditActivityItem({ id: 3, type: 'allocation', amount: -1, createdAt: at('22') })
    assert.equal(unknown.detail, '1 credit to a workspace')
  })

  it('describes usage by what was made, and falls back to the amount', () => {
    const named = creditActivityItem({ id: 4, type: 'usage', amount: -120, usageDetail: { videoName: 'Launch' }, createdAt: at('20') })
    assert.equal(named.action, 'Credits used')
    assert.equal(named.detail, 'Video export — "Launch"')
    assert.equal(named.amount, -120)

    const bare = creditActivityItem({ id: 5, type: 'usage', amount: -40, createdAt: at('20') })
    assert.equal(bare.detail, '40 credits spent')
  })

  it('labels grants, purchases and revokes with signed amounts', () => {
    const grant = creditActivityItem({ id: 6, type: 'platform_grant', amount: 5000, usageDetail: { reason: 'Welcome bonus' }, createdAt: at('20') })
    assert.equal(grant.action, 'Credits granted')
    assert.equal(grant.detail, '5,000 credits · Welcome bonus')
    assert.equal(grant.amount, 5000)

    const revoke = creditActivityItem({ id: 7, type: 'platform_revoke', amount: -200, createdAt: at('20') })
    assert.equal(revoke.action, 'Credits removed')
    assert.equal(revoke.amount, -200)
  })

  it('turns owned team workspaces into "Workspace created" and others into "Joined"', () => {
    const items = workspaceActivityItems([
      { id: 'p', type: 'PRIVATE', name: 'Mine', role: 'OWNER', createdAt: at('01') },
      { id: 'a', type: 'TEAM', name: 'Marketing Studio', role: 'OWNER', createdAt: at('10') },
      { id: 'b', type: 'TEAM', name: 'Creditor Academy', role: 'EDITOR', createdAt: at('02'), members: [{ joinedAt: at('12') }] },
    ])
    assert.deepEqual(
      items.map((i) => [i.action, i.detail, i.at]),
      [
        ['Workspace created', 'Marketing Studio', at('10')],
        ['Joined workspace', 'Creditor Academy as Editor', at('12')],
      ]
    )
  })

  it('merges both sources newest first and caps the list', () => {
    const feed = buildProfileActivity({
      transactions: [
        { id: 1, type: 'allocation', amount: -500, workspaceId: 'a', createdAt: at('15') },
        { id: 2, type: 'platform_grant', amount: 100, createdAt: at('05') },
      ],
      workspaces: [{ id: 'a', type: 'TEAM', name: 'Marketing Studio', role: 'OWNER', createdAt: at('10') }],
      limit: 2,
    })
    assert.deepEqual(
      feed.map((i) => i.action),
      ['Credits allocated', 'Workspace created']
    )
    assert.equal(feed[0].detail, '500 credits to Marketing Studio')
  })
})
