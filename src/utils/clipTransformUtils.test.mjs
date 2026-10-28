#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getClipFlipScale,
  flipScaleToBackendFlags,
  backendFlagsToFlipScale,
  buildClipTransform,
  getClipCenter,
  getOrientedBounds,
} from './clipTransformUtils.js'

describe('clipTransformUtils', () => {
  it('maps flip flags both ways', () => {
    assert.deepEqual(getClipFlipScale({ flipHorizontal: true }), { scaleX: -1, scaleY: 1 })
    assert.deepEqual(flipScaleToBackendFlags({ scaleX: -1, scaleY: 1 }), {
      flipHorizontal: true,
      flipVertical: false,
    })
    assert.equal(backendFlagsToFlipScale({ flipVertical: true }).scaleY, -1)
  })

  it('builds CSS transform in translate → rotate → scale → flip order', () => {
    const { transform, transformOrigin } = buildClipTransform(
      { rotation: 15, scale: 1, style: { scaleX: -1 } },
      { translateX: 4, translateY: 8, scale: 2 }
    )
    assert.equal(transformOrigin, 'center center')
    assert.equal(transform, 'translate(4px, 8px) rotate(15deg) scale(2) scale(-1, 1)')
  })

  it('computes center and axis-aligned bounds for a rotated clip', () => {
    const clip = {
      position: { x: 100, y: 50 },
      size: { width: 200, height: 100 },
      rotation: 0,
    }
    assert.deepEqual(getClipCenter(clip), { x: 200, y: 100 })
    const layout = { position: clip.position, size: clip.size }
    const box = getOrientedBounds(clip, layout)
    assert.deepEqual(box, { x: 100, y: 50, width: 200, height: 100 })

    const rotated = getOrientedBounds({ ...clip, rotation: 90 }, layout)
    assert.equal(Math.round(rotated.width), 100)
    assert.equal(Math.round(rotated.height), 200)
  })
})
