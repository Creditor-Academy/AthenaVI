#!/usr/bin/env node
/** Run: node --test src/utils/pptGroupUtils.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  canPptGroup,
  canPptUngroup,
  createPptGroup,
  ungroupPptElement,
  collectPptMoveIds,
} from './pptGroupUtils.js'

function el(id, extra = {}) {
  return {
    id,
    type: 'shape',
    placement: { x: 10, y: 10, width: 80, height: 40 },
    layer: 1,
    ...extra,
  }
}

describe('PPT editor grouping', () => {
  it('groups two unlocked roots and ungroup restores them', () => {
    const elements = [el('a'), el('b'), el('c')]
    assert.equal(canPptGroup(elements, ['a', 'b']), true)
    assert.equal(canPptGroup(elements, ['a']), false)

    const grouped = createPptGroup(elements, ['a', 'b'])
    const group = grouped.find((item) => item.type === 'group')
    assert.ok(group)
    assert.deepEqual(group.childIds, ['a', 'b'])
    assert.equal(grouped.find((item) => item.id === 'a').groupId, group.id)
    assert.equal(canPptUngroup(grouped, [group.id]), true)

    const restored = ungroupPptElement(grouped, group.id)
    assert.equal(restored.some((item) => item.type === 'group'), false)
    assert.equal(restored.find((item) => item.id === 'a').groupId, undefined)
    assert.equal(restored.length, 3)
  })

  it('does not group a locked element or an already grouped child', () => {
    const elements = [el('a', { locked: true }), el('b'), el('c', { groupId: 'g1' })]
    assert.equal(canPptGroup(elements, ['a', 'b']), false)
    assert.equal(canPptGroup(elements, ['b', 'c']), false)
  })

  it('moves a grouped child together with its siblings', () => {
    const elements = [
      el('a', { groupId: 'g1' }),
      el('b', { groupId: 'g1' }),
      { id: 'g1', type: 'group', childIds: ['a', 'b'], placement: { x: 0, y: 0, width: 100, height: 100 } },
    ]
    const moving = collectPptMoveIds(elements, ['a'], 'a')
    assert.ok(moving.includes('a'))
    assert.ok(moving.includes('b'))
    assert.ok(moving.includes('g1'))
  })
})
