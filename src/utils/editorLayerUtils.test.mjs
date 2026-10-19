#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getLayerDisplayLabel,
  canSetAsSceneBackground,
  isBackgroundClip,
  sortClipsByPaintOrder,
  snapValue,
  snapPoint,
  getLayerNudgeStep,
  isCanvasNudgeableClip,
  bringClipForward,
  sendClipBackward,
  bringClipToFront,
  sendClipToBack,
  duplicateClip,
  DEFAULT_GRID_SIZE,
} from './editorLayerUtils.js'

function clip(id, extras = {}) {
  return { id, type: 'image', layer: 1, position: { x: 0, y: 0 }, size: { width: 100, height: 80 }, ...extras }
}

describe('editorLayerUtils', () => {
  it('labels clips for the sidebar and identifies backgrounds', () => {
    assert.equal(getLayerDisplayLabel({ type: 'shape', role: 'frame' }), 'Frame')
    assert.equal(getLayerDisplayLabel({ type: 'image' }), 'Image')
    assert.equal(getLayerDisplayLabel({ role: 'main-text' }), 'Heading')
    assert.equal(canSetAsSceneBackground({ type: 'image' }), true)
    assert.equal(canSetAsSceneBackground({ type: 'shape' }), false)
    assert.equal(isBackgroundClip({ role: 'background' }), true)
    assert.equal(isBackgroundClip({ type: 'text' }), false)
  })

  it('paints background clips behind others and snaps to the grid', () => {
    const clips = [
      clip('fg', { layer: 1 }),
      clip('bg', { role: 'background', layer: 9 }),
    ]
    assert.deepEqual(sortClipsByPaintOrder(clips).map((c) => c.id), ['bg', 'fg'])
    assert.equal(snapValue(27, 20, true), 20)
    assert.deepEqual(snapPoint({ x: 27, y: 33 }, 20, true), { x: 20, y: 40 })
    assert.equal(getLayerNudgeStep({ snapToGrid: true, gridSize: DEFAULT_GRID_SIZE }, false), 20)
    assert.equal(isCanvasNudgeableClip({ type: 'audio' }), false)
    assert.equal(isCanvasNudgeableClip({ type: 'image', locked: true }), false)
    assert.equal(isCanvasNudgeableClip({ type: 'image' }), true)
  })

  it('moves clips in the stack without pulling backgrounds off the back', () => {
    const clips = [
      clip('bg', { role: 'background', layer: 0 }),
      clip('a', { layer: 1 }),
      clip('b', { layer: 2 }),
    ]
    const forward = bringClipForward(clips, 'a')
    assert.deepEqual(
      sortClipsByPaintOrder(forward).map((c) => c.id),
      ['bg', 'b', 'a']
    )
    const back = sendClipToBack(forward, 'a')
    assert.equal(sortClipsByPaintOrder(back)[1].id, 'a')
    const front = bringClipToFront(clips, 'a')
    assert.equal(sortClipsByPaintOrder(front).at(-1).id, 'a')
    assert.equal(sendClipBackward(clips, 'bg'), clips)
  })

  it('duplicates a clip with a new id and offset', () => {
    const source = clip('orig', { position: { x: 10, y: 20 }, locked: true, layer: 2 })
    const copy = duplicateClip(source)
    assert.notEqual(copy.id, 'orig')
    assert.equal(copy.locked, false)
    assert.equal(copy.position.x, 34)
    assert.equal(copy.position.y, 44)
    assert.equal(copy.layer, 3)
  })
})
