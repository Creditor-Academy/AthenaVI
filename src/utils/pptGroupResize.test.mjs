#!/usr/bin/env node
/** Run: node --test src/utils/pptGroupResize.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  applyPptElementPatch,
  createPptGroup,
  groupScaleForResize,
  placementPatchesChangeContent,
  resizePptGroupPatches,
  startPptGroupResize,
  syncPptGroupBounds,
} from './pptGroupUtils.js'

const el = (id, x, y, width, height, extra = {}) => ({ id, type: 'text', placement: { x, y, width, height }, ...extra })

describe('group frame and resize', () => {
  it('createPptGroup uses the given id', () => {
    const next = createPptGroup([el('a', 0, 0, 10, 10), el('b', 20, 20, 10, 10)], ['a', 'b'], 'g1')
    assert.ok(next.find((item) => item.id === 'g1' && item.type === 'group'))
  })

  it('the frame follows a child that grew on its own', () => {
    const grouped = createPptGroup([el('a', 0, 0, 100, 50), el('b', 0, 100, 100, 50)], ['a', 'b'], 'g')
    const grown = grouped.map((item) => (item.id === 'b' ? { ...item, placement: { ...item.placement, height: 200 } } : item))
    const synced = syncPptGroupBounds(grown)
    assert.deepEqual(synced.find((item) => item.id === 'g').placement, { x: 0, y: 0, width: 100, height: 300 })
  })

  it('returns the same array when every frame is already right', () => {
    const grouped = createPptGroup([el('a', 0, 0, 100, 50), el('b', 0, 100, 100, 50)], ['a', 'b'], 'g')
    assert.equal(syncPptGroupBounds(grouped), grouped)
    const plain = [el('a', 0, 0, 1, 1)]
    assert.equal(syncPptGroupBounds(plain), plain)
  })

  it('one scale per drag: side handles follow their axis, corners the larger change', () => {
    const start = { x: 0, y: 0, width: 200, height: 100 }
    assert.equal(groupScaleForResize('e', start, { ...start, width: 100, height: 100 }), 0.5)
    assert.equal(groupScaleForResize('s', start, { ...start, width: 200, height: 150 }), 1.5)
    assert.equal(groupScaleForResize('se', start, { ...start, width: 220, height: 200 }), 2)
    assert.equal(groupScaleForResize('e', start, { ...start, width: 0 }), 0.1)
  })

  it('scales positions, sizes and fonts evenly so children never overlap', () => {
    const grouped = createPptGroup([
      el('a', 0, 0, 200, 50, { content: { text: 'A', fontSize: 40, letterSpacing: 2 } }),
      el('b', 0, 100, 200, 50, { type: 'image', content: { url: 'x' } }),
    ], ['a', 'b'], 'g')
    const group = grouped.find((item) => item.id === 'g')
    const state = startPptGroupResize(group, grouped, { minHeightFor: (child) => (child.type === 'text' ? 60 : null) })
    const start = { x: 0, y: 0, width: 200, height: 150 }
    const patches = resizePptGroupPatches(state, 'g', start, 0.5, 'e')
    // text: needed 60 at start → 30 at half size; font halves with it
    assert.deepEqual(
      { x: patches.a.x, y: patches.a.y, width: patches.a.width, height: patches.a.height },
      { x: 0, y: 0, width: 100, height: 30 }
    )
    assert.deepEqual(patches.a.__content, { fontSize: 20, letterSpacing: 1 })
    assert.deepEqual({ y: patches.b.y, height: patches.b.height }, { y: 50, height: 25 })
    assert.equal(patches.b.__content, undefined)
    assert.ok(patches.a.y + patches.a.height <= patches.b.y, 'text stays above the image')
    assert.deepEqual(
      { x: patches.g.x, y: patches.g.y, width: patches.g.width, height: patches.g.height },
      { x: 0, y: 0, width: 100, height: 75 }
    )
    assert.equal(placementPatchesChangeContent(patches), true)
  })

  it('handles on the left/top keep the opposite edge in place', () => {
    const grouped = createPptGroup([el('a', 100, 100, 100, 50), el('b', 100, 200, 100, 50)], ['a', 'b'], 'g')
    const state = startPptGroupResize(grouped.find((item) => item.id === 'g'), grouped)
    const start = { x: 100, y: 100, width: 100, height: 150 }
    const patches = resizePptGroupPatches(state, 'g', start, 2, 'nw')
    assert.equal(patches.g.x + patches.g.width, 200)
    assert.equal(patches.g.y + patches.g.height, 250)
  })

  it('applyPptElementPatch moves __content into content, never into placement', () => {
    const next = applyPptElementPatch(
      { id: 'a', placement: { x: 0, y: 0, width: 10, height: 10 }, content: { text: 'hi', fontSize: 40 } },
      { x: 5, width: 20, __content: { fontSize: 20 } }
    )
    assert.deepEqual(next.placement, { x: 5, y: 0, width: 20, height: 10 })
    assert.deepEqual(next.content, { text: 'hi', fontSize: 20 })
    const same = { id: 'b', placement: {} }
    assert.equal(applyPptElementPatch(same, undefined), same)
  })

  it('locked children stay where they are', () => {
    const grouped = createPptGroup([el('a', 0, 0, 100, 50), el('b', 0, 100, 100, 50)], ['a', 'b'], 'g')
    const locked = grouped.map((item) => (item.id === 'b' ? { ...item, locked: true } : item))
    const state = startPptGroupResize(locked.find((item) => item.id === 'g'), locked)
    assert.deepEqual(Object.keys(state.starts), ['a'])
  })
})
