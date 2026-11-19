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
  cropZoom,
  zoomCrop,
  fitCropToAspect,
  frameAspectOf,
  MAX_CROP_ZOOM,
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

describe('zoom (Canva-style scale of the photo inside the frame)', () => {
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`)

  it('the whole image is zoom 1; half the width at the same shape is zoom 2', () => {
    near(cropZoom({ x: 0, y: 0, width: 1, height: 1 }, 1.5), 1)
    near(cropZoom({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, 1.5), 2)
  })

  it('zooming keeps the frame shape and the centre of what shows', () => {
    const start = { x: 0.2, y: 0.3, width: 0.4, height: 0.4 }
    const z = zoomCrop(start, cropZoom(start, 2) * 2, 2)
    near(z.width / z.height, 1)
    near(z.width, 0.2)
    near(z.x + z.width / 2, 0.4)
    near(z.y + z.height / 2, 0.5)
  })

  it('zooming out stops at the image edges and slides the region back inside', () => {
    const z = zoomCrop({ x: 0.7, y: 0, width: 0.3, height: 0.3 }, 1, 1)
    near(z.width, 1)
    near(z.x, 0)
    const wide = zoomCrop({ x: 0.5, y: 0.5, width: 0.5, height: 0.25 }, 1, 1)
    near(wide.width, 1)
    near(wide.height, 0.5)
    assert.ok(wide.y + wide.height <= 1 + 1e-9)
  })

  it('zoom is clamped to 1…MAX_CROP_ZOOM', () => {
    const full = { x: 0, y: 0, width: 1, height: 1 }
    near(zoomCrop(full, 0.2, 1).width, 1)
    near(zoomCrop(full, 99, 1).width, 1 / MAX_CROP_ZOOM)
  })
})

describe('opening the crop in the shape of the image box', () => {
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`)

  it('an uncropped image starts with what object-fit: cover shows in the box', () => {
    // 3:2 photo in a square box: the centre square, full height.
    const c = fitCropToAspect(null, 1, 1.5)
    near(c.height, 1)
    near(c.width, 1 / 1.5)
    near(c.x, (1 - 1 / 1.5) / 2)
    near(c.y, 0)
    // 3:2 photo in a 16:9 box: full width, top and bottom trimmed.
    const wide = fitCropToAspect(null, 16 / 9, 1.5)
    near(wide.width, 1)
    near((wide.width * 1.5) / wide.height, 16 / 9)
  })

  it('an existing crop keeps its centre and zoom and takes the box shape', () => {
    const start = { x: 0.2, y: 0.2, width: 0.4, height: 0.2 } // 2:1 on a square photo
    const c = fitCropToAspect(start, 1, 1)
    near(c.width, 0.2)
    near(c.height, 0.2)
    near(c.x + c.width / 2, 0.4)
    near(c.y + c.height / 2, 0.3)
  })

  it('box aspect comes from the placement / size; unknown boxes give null', () => {
    near(frameAspectOf({ width: 400, height: 300 }), 4 / 3)
    assert.equal(frameAspectOf({ width: 0, height: 300 }), null)
    assert.equal(frameAspectOf(null), null)
  })

  it('a crop in the box shape leaves the box exactly where it is', () => {
    const placement = { x: 10, y: 20, width: 400, height: 300 }
    const crop = fitCropToAspect(null, 400 / 300, 1000 / 500)
    assert.deepEqual(placementForCrop(placement, crop, 1000, 500), placement)
  })
})
