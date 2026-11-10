#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/menuPlacement.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { placeMenu } from './menuPlacement.js'

const vp = { width: 1440, height: 800 }
const size = { width: 212, height: 480 }
const button = (top) => ({ top, bottom: top + 24, left: 200, right: 224 })
const fits = (p) => p.top >= 8 && p.top + Math.min(size.height, p.maxHeight) <= vp.height - 8

describe('slide options menu placement', () => {
  it('opens below the button for slides near the top', () => {
    const p = placeMenu(button(100), null, size, vp)
    assert.equal(p.top, 130)
    assert.ok(fits(p))
  })

  it('opens above the button for the last slides, fully visible', () => {
    const b = button(720)
    const p = placeMenu(b, null, size, vp)
    assert.equal(p.top + size.height, b.top - 6)
    assert.ok(fits(p))
  })

  it('right-click near the bottom opens upward from the cursor', () => {
    const p = placeMenu(null, { x: 300, y: 760 }, size, vp)
    assert.equal(p.top + size.height, 760)
    assert.ok(fits(p))
  })

  it('a window too short for the menu pins it on screen and lets it scroll', () => {
    const short = { width: 1440, height: 400 }
    const p = placeMenu(button(300), null, size, short)
    assert.equal(p.top, 8)
    assert.equal(p.maxHeight, 384)
  })

  it('stays inside the right edge', () => {
    const p = placeMenu(null, { x: 1400, y: 100 }, size, vp)
    assert.equal(p.left, 1440 - 212 - 8)
  })
})
