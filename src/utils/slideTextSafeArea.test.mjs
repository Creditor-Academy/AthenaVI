#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  SLIDE_TEXT_SAFE_INSET_X,
  SLIDE_TEXT_SAFE_INSET_Y,
  slideTextSafeRect,
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
})
