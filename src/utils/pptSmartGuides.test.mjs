#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getElementBounds, computePptSmartGuides } from './pptSmartGuides.js'

describe('pptSmartGuides', () => {
  const canvas = { width: 1920, height: 1080 }

  it('computes element edges and centers from placement', () => {
    const bounds = getElementBounds({
      id: 'e1',
      placement: { x: 100, y: 50, width: 200, height: 40 },
    })
    assert.equal(bounds.right, 300)
    assert.equal(bounds.bottom, 90)
    assert.equal(bounds.centerX, 200)
    assert.equal(bounds.centerY, 70)
  })

  it('snaps an element to the canvas center within 8px', () => {
    const moving = { x: 960 - 100 + 3, y: 540 - 20, width: 200, height: 40 }
    const result = computePptSmartGuides(moving, [], canvas, 'self')
    assert.equal(result.snapDx, -3)
    assert.ok(result.guides.some((g) => g.kind === 'canvas-center' && g.type === 'v'))
  })

  it('snaps to another unlocked element and ignores locked/group items', () => {
    const moving = { x: 103, y: 40, width: 100, height: 40 }
    const others = [
      { id: 'target', placement: { x: 0, y: 40, width: 100, height: 40 } },
      { id: 'locked', locked: true, placement: { x: 103, y: 0, width: 10, height: 10 } },
      { id: 'group', type: 'group', placement: { x: 103, y: 0, width: 10, height: 10 } },
    ]
    const result = computePptSmartGuides(moving, others, canvas, 'self')
    assert.equal(result.snapDx, -3)
    assert.ok(result.guides.some((g) => g.kind === 'edge' || g.kind === 'center'))
  })
})
