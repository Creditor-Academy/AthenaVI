#!/usr/bin/env node
/** Run: node --test src/utils/pptGroupTransform.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  createPptGroup,
  getPptUnionBounds,
  groupPlacementChildPatches,
  normalizeRotation,
  reorderPptElements,
  rotatePptGroupPatches,
  startPptGroupResize,
} from './pptGroupUtils.js'

const el = (id, x, y, width, height, extra = {}) => ({ id, type: 'text', placement: { x, y, width, height }, ...extra })

describe('group rotation and transparency', () => {
  it('turning a group turns its children about the group centre', () => {
    const grouped = createPptGroup([el('a', 0, 0, 100, 20), el('b', 0, 80, 100, 20)], ['a', 'b'], 'g')
    const state = startPptGroupResize(grouped.find((x) => x.id === 'g'), grouped)
    const patches = rotatePptGroupPatches(state, 'g', { x: 0, y: 0, width: 100, height: 100, rotation: 0 }, 90)
    // centre (50,50): a's centre (50,10) → (90,50); b's centre (50,90) → (10,50)
    assert.deepEqual([patches.a.x, patches.a.y, patches.a.rotation], [40, 40, 90])
    assert.deepEqual([patches.b.x, patches.b.y, patches.b.rotation], [-40, 40, 90])
    assert.equal(patches.g.rotation, 90)
    // the frame wraps the turned children (they now stand upright: 20 wide, 100 tall)
    assert.deepEqual([patches.g.x, patches.g.y, patches.g.width, patches.g.height], [0, 0, 100, 100])
  })

  it('bounds account for rotated elements', () => {
    const b = getPptUnionBounds([{ placement: { x: 0, y: 40, width: 100, height: 20, rotation: 90 } }])
    assert.deepEqual([b.x, b.y, b.width, b.height].map((v) => Math.round(v) || 0), [40, 0, 20, 100])
  })

  it('Design panel: a new angle turns children by the difference; transparency reaches every child', () => {
    const grouped = createPptGroup([el('a', 0, 0, 100, 20), el('b', 0, 80, 100, 20, { locked: true })], ['a', 'b'], 'g')
    const group = grouped.find((x) => x.id === 'g')
    const turned = groupPlacementChildPatches(grouped, group, { rotation: 45 })
    assert.equal(turned.a.rotation, 45)
    assert.equal(turned.b, undefined, 'locked children stay as they are')
    const faded = groupPlacementChildPatches(grouped, group, { opacity: 0.27 })
    assert.equal(faded.a.opacity, 0.27)
    assert.deepEqual(groupPlacementChildPatches(grouped, group, { rotation: 0 }), {}, 'same angle: nothing to do')
    assert.deepEqual(groupPlacementChildPatches(grouped, grouped[0], { opacity: 0.5 }), {}, 'not a group')
  })

  it('normalizes angles into 0–360', () => {
    assert.equal(normalizeRotation(-90), 270)
    assert.equal(normalizeRotation(450), 90)
  })
})

describe('layer order', () => {
  const stack = [el('bg', 0, 0, 1, 1), el('a', 0, 0, 1, 1), el('b', 0, 0, 1, 1), el('top', 0, 0, 1, 1)]
  const ids = (list) => list.map((x) => x.id).join(',')

  it('moves one step or to the ends', () => {
    assert.equal(ids(reorderPptElements(stack, 'a', 'forward')), 'bg,b,a,top')
    assert.equal(ids(reorderPptElements(stack, 'a', 'back')), 'a,bg,b,top')
    assert.equal(ids(reorderPptElements(stack, 'bg', 'toFront')), 'a,b,top,bg')
    assert.equal(ids(reorderPptElements(stack, 'top', 'toBack')), 'top,bg,a,b')
    assert.equal(reorderPptElements(stack, 'top', 'toFront'), null)
    assert.equal(reorderPptElements(stack, 'missing', 'toFront'), null)
  })

  it('a group moves together with its children, keeping their order', () => {
    const grouped = createPptGroup(stack, ['a', 'b'], 'g')
    const next = reorderPptElements(grouped, 'g', 'toFront')
    assert.equal(ids(next), 'bg,top,a,b,g')
    assert.equal(ids(reorderPptElements(grouped, 'g', 'toBack')), 'a,b,g,bg,top')
  })

  it('several selected elements move as one block', () => {
    assert.equal(ids(reorderPptElements(stack, ['bg', 'b'], 'toFront')), 'a,top,bg,b')
  })
})
