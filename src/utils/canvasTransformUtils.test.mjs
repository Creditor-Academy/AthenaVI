#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isCornerHandle,
  normalizeAngle,
  snapAngle,
  snapAngleStep,
  computeResize,
  localizePointerDelta,
  MIN_CLIP_WIDTH,
  MIN_CLIP_HEIGHT,
} from './canvasTransformUtils.js'

describe('canvasTransformUtils', () => {
  it('normalizes and magnetically snaps rotation', () => {
    assert.equal(normalizeAngle(-10), 350)
    assert.equal(snapAngle(2), 0)
    assert.equal(snapAngle(20, false), 20)
    assert.equal(snapAngleStep(88, { step: 90, threshold: 9 }), 90)
    assert.equal(isCornerHandle('top-left'), true)
    assert.equal(isCornerHandle('left'), false)
  })

  it('keeps the opposite corner fixed while resizing', () => {
    const orig = { x: 100, y: 100, width: 200, height: 100 }
    const grown = computeResize('bottom-right', orig, 40, 20)
    assert.equal(grown.x, 100)
    assert.equal(grown.y, 100)
    assert.equal(grown.width, 240)
    assert.equal(grown.height, 120)

    const shrunk = computeResize('top-left', orig, 50, 30)
    assert.equal(shrunk.x + shrunk.width, 300)
    assert.equal(shrunk.y + shrunk.height, 200)
  })

  it('does not shrink below the minimum clip size', () => {
    const orig = { x: 0, y: 0, width: 80, height: 40 }
    const result = computeResize('bottom-right', orig, -1000, -1000)
    assert.equal(result.width, MIN_CLIP_WIDTH)
    assert.equal(result.height, MIN_CLIP_HEIGHT)
  })

  it('rotates pointer deltas into clip-local axes', () => {
    const unrotated = localizePointerDelta(10, 0, 0)
    assert.deepEqual(unrotated, { dx: 10, dy: 0 })
    const rotated = localizePointerDelta(10, 0, 90)
    assert.ok(Math.abs(rotated.dx) < 1e-10)
    assert.ok(Math.abs(rotated.dy + 10) < 1e-10)
  })
})
