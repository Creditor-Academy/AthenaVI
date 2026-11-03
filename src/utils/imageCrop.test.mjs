#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  centeredCropForAspect,
  cropAspectRatio,
  croppedImageStyle,
  dragCrop,
  normalizeCrop,
  placementForCrop,
} from './imageCrop.js'

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`)

describe('normalizeCrop', () => {
  it('treats missing or full-image crops as no crop', () => {
    assert.equal(normalizeCrop(null), null)
    assert.equal(normalizeCrop({ x: 0, y: 0, width: 1, height: 1 }), null)
  })
  it('clamps a region to the image', () => {
    const c = normalizeCrop({ x: 0.8, y: -1, width: 0.5, height: 0.5 })
    near(c.x, 0.8)
    near(c.y, 0)
    near(c.width, 0.2)
    near(c.height, 0.5)
  })
})

describe('croppedImageStyle', () => {
  it('scales and offsets the image so the region fills the frame', () => {
    const s = croppedImageStyle({ x: 0.25, y: 0.5, width: 0.5, height: 0.25 })
    assert.equal(s.width, '200%')
    assert.equal(s.height, '400%')
    assert.equal(s.left, '-50%')
    assert.equal(s.top, '-200%')
  })
  it('returns null without a crop', () => {
    assert.equal(croppedImageStyle(undefined), null)
  })
})

describe('placementForCrop', () => {
  it('keeps width and centre and takes the crop aspect ratio', () => {
    // 1600×900 image, crop the left half → 800×900 region (aspect 0.888…)
    const next = placementForCrop({ x: 10, y: 100, width: 400, height: 225 }, { x: 0, y: 0, width: 0.5, height: 1 }, 1600, 900)
    assert.equal(next.width, 400)
    assert.equal(next.height, 450)
    assert.equal(next.y, Math.round(100 + (225 - 450) / 2))
  })
  it('uses the full image ratio when the crop is cleared', () => {
    near(cropAspectRatio(null, 1600, 900), 16 / 9)
  })
})

describe('dragCrop', () => {
  const start = { x: 0.2, y: 0.2, width: 0.5, height: 0.5 }
  it('moves inside the image', () => {
    const next = dragCrop(start, 'move', 0.6, -0.5)
    near(next.x, 0.5)
    near(next.y, 0)
  })
  it('resizes from a corner without leaving the image', () => {
    const next = dragCrop(start, 'se', 0.9, 0.1)
    near(next.width, 0.8)
    near(next.height, 0.6)
  })
  it('keeps a pixel aspect ratio when locked', () => {
    const next = dragCrop(start, 'e', 0.1, 0, { aspect: 1, imageAspect: 2 })
    // square in pixels on a 2:1 image → height fraction is twice the width fraction
    near(next.height, next.width * 2)
  })
})

describe('centeredCropForAspect', () => {
  it('centres the largest region with the requested ratio', () => {
    const c = centeredCropForAspect(1, 16 / 9)
    near(c.height, 1)
    near(c.width, 9 / 16)
    near(c.x, (1 - 9 / 16) / 2)
  })
})
