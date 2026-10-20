#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  contentUsesInnerClipOrMask,
  onCanvasOnlyClipPath,
  overflowPaintStyle,
  elementOverflowsCanvas,
} from './canvasOverflowUtils.js'

describe('contentUsesInnerClipOrMask', () => {
  it('detects blob/oval masks, clipPath, and edge fade', () => {
    assert.equal(contentUsesInnerClipOrMask({ imageMask: { type: 'blob', side: 'right' } }), true)
    assert.equal(contentUsesInnerClipOrMask({ clipPath: 'ellipse(50% 50% at 50% 50%)' }), true)
    assert.equal(contentUsesInnerClipOrMask({ edgeFade: { side: 'left', width: 0.3 } }), true)
    assert.equal(contentUsesInnerClipOrMask({ imageMask: { type: 'none' } }), false)
    assert.equal(contentUsesInnerClipOrMask({}), false)
  })
})

describe('overflowPaintStyle vs inner clip', () => {
  const overflowing = {
    x: -40,
    y: 0,
    width: 800,
    height: 400,
    rotation: 0,
    canvasW: 1920,
    canvasH: 1080,
  }

  it('treats a left-overhang box as overflowing', () => {
    assert.equal(
      elementOverflowsCanvas(
        { x: overflowing.x, y: overflowing.y, width: overflowing.width, height: overflowing.height },
        overflowing.canvasW,
        overflowing.canvasH
      ),
      true
    )
  })

  it('does not apply a parent mask when the image already clips itself', () => {
    const style = overflowPaintStyle({ ...overflowing, selected: true, skipOverflowMask: true })
    assert.equal(style.maskImage, 'none')
    assert.equal(style.clipPath, 'none')
  })

  it('never uses inset(100%) which would paint a blank element', () => {
    assert.equal(
      onCanvasOnlyClipPath({ x: 5000, y: 5000, width: 100, height: 100 }, 1920, 1080),
      undefined
    )
  })

  it('still masks selected overflow when there is no inner clip', () => {
    const style = overflowPaintStyle({ ...overflowing, selected: true, skipOverflowMask: false })
    assert.ok(String(style.maskImage || '').includes('url('))
  })
})
