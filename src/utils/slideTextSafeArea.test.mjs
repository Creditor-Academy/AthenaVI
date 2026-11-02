#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  SLIDE_TEXT_SAFE_INSET_X,
  SLIDE_TEXT_SAFE_INSET_Y,
  slideTextSafeRect,
  textElementsInDangerZone,
} from './slideTextSafeArea.js'

describe('slideTextSafeArea', () => {
  it('insets 1920×1080 by the standard danger-zone margins', () => {
    const rect = slideTextSafeRect(1920, 1080)
    assert.equal(rect.x, SLIDE_TEXT_SAFE_INSET_X)
    assert.equal(rect.y, SLIDE_TEXT_SAFE_INSET_Y)
    assert.equal(rect.width, 1920 - SLIDE_TEXT_SAFE_INSET_X * 2)
    assert.equal(rect.height, 1080 - SLIDE_TEXT_SAFE_INSET_Y * 2)
  })

  it('scales insets down on small canvases so the usable box stays at least 80px', () => {
    const rect = slideTextSafeRect(400, 300)
    assert.ok(rect.x <= Math.floor(400 * 0.12))
    assert.ok(rect.width >= 80)
    assert.ok(rect.height >= 80)
  })

  it('flags text boxes that reach into the danger zone and ignores non-text', () => {
    const text = (id, x, y, width, height, extra = {}) => ({
      id, type: 'text', placement: { x, y, width, height }, ...extra,
    })
    const ids = textElementsInDangerZone(
      [
        text('inside', 200, 200, 800, 120),
        text('edge', SLIDE_TEXT_SAFE_INSET_X, SLIDE_TEXT_SAFE_INSET_Y, 400, 100),
        text('left', 20, 300, 400, 100),
        text('bottom', 300, 1000, 400, 70),
        text('hidden', 0, 0, 400, 100, { hidden: true }),
        { id: 'img', type: 'image', placement: { x: 0, y: 0, width: 1920, height: 1080 } },
        { id: 'tb', type: 'textbox', placement: { x: 1800, y: 400, width: 200, height: 80 } },
      ],
      1920,
      1080
    )
    assert.deepEqual(ids, ['left', 'bottom', 'tb'])
  })

  it('returns nothing for empty or malformed input', () => {
    assert.deepEqual(textElementsInDangerZone(null), [])
    assert.deepEqual(textElementsInDangerZone([{ id: 'a', type: 'text' }]), [])
  })
})
