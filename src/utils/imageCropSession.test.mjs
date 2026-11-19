#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CROP_MAX_ZOOM,
  finishCropSession,
  panPhoto,
  photoZoom,
  resetCropSession,
  resizeFrame,
  scalePhoto,
  setFrameAspect,
  startCropSession,
  unrotateDelta,
  zoomPhoto,
} from './imageCropSession.js'

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`)
const covers = (s) => {
  const { frame: f, photo: p } = s
  assert.ok(p.x <= f.x + 1e-9 && p.y <= f.y + 1e-9, 'photo starts before the frame')
  assert.ok(p.x + p.width >= f.x + f.width - 1e-9 && p.y + p.height >= f.y + f.height - 1e-9, 'photo ends after the frame')
}

// A 2000×1000 photo in a 400×400 box at (100, 50): cover shows the middle square.
const base = () =>
  startCropSession({ id: 'e1', box: { x: 100, y: 50, width: 400, height: 400 }, content: {}, natural: { width: 2000, height: 1000 } })

describe('starting a crop on the design', () => {
  it('shows exactly what the box shows now (cover, centred)', () => {
    const s = base()
    near(s.photo.height, 400)
    near(s.photo.width, 800)
    near(s.photo.x, 100 - 200)
    near(s.photo.y, 50)
    near(photoZoom(s), 1)
  })

  it('an existing crop opens where it is', () => {
    const s = startCropSession({
      box: { x: 0, y: 0, width: 300, height: 150 },
      content: { crop: { x: 0.5, y: 0, width: 0.5, height: 0.5 } },
      natural: { width: 1000, height: 500 },
    })
    near(s.photo.width, 600)
    near(s.photo.x, -300)
    near(s.photo.y, 0)
  })

  it('a flipped image opens on the region you see', () => {
    const s = startCropSession({
      box: { x: 0, y: 0, width: 300, height: 150 },
      content: { crop: { x: 0, y: 0, width: 0.5, height: 0.5 }, flipHorizontal: true },
      natural: { width: 1000, height: 500 },
    })
    near(s.photo.x, -300) // the stored left half shows as the right half
    const { crop } = finishCropSession(panPhoto(s, 10, 0))
    assert.ok(crop.x < 0.5 && crop.x >= 0)
  })
})

describe('moving and scaling the photo', () => {
  it('panning stops at the photo edges', () => {
    const s = panPhoto(base(), 500, 0)
    near(s.photo.x, 100)
    const t = panPhoto(base(), -500, 0)
    near(t.photo.x + t.photo.width, 500)
    covers(t)
  })

  it('zoom keeps the middle of the frame on the same spot of the photo, clamped 1…max', () => {
    const z = zoomPhoto(base(), 2)
    near(photoZoom(z), 2)
    near((300 - z.photo.x) / z.photo.width, 0.5)
    near(photoZoom(zoomPhoto(base(), 0.2)), 1)
    near(photoZoom(zoomPhoto(base(), 99)), CROP_MAX_ZOOM)
    covers(z)
  })

  it('dragging a photo corner scales it from the opposite corner, never below the frame', () => {
    const s = base()
    const big = scalePhoto(s, 'se', 80, 40)
    near(big.photo.x, s.photo.x)
    near(big.photo.y, s.photo.y)
    assert.ok(big.photo.width > s.photo.width)
    near(big.photo.width / big.photo.height, 2)
    const small = scalePhoto(s, 'se', -500, -500)
    covers(small)
  })
})

describe('changing the frame', () => {
  it('resizes from a handle and stays inside the photo', () => {
    const s = resizeFrame(base(), 'e', -100, 0)
    near(s.frame.width, 300)
    near(s.frame.x, 100)
    const wide = resizeFrame(base(), 'w', -1000, 0)
    near(wide.frame.x, wide.photo.x)
  })

  it('keeps a chosen shape while resizing', () => {
    const s = resizeFrame(base(), 'se', -100, -10, 1)
    near(s.frame.width, s.frame.height)
    near(s.frame.x, 100)
    near(s.frame.y, 50)
  })

  it('a shape preset keeps about the same size, centred, inside the photo', () => {
    const s = setFrameAspect(base(), '16:9')
    near(s.frame.width / s.frame.height, 16 / 9)
    near(s.frame.x + s.frame.width / 2, 300)
    assert.ok(s.frame.y >= s.photo.y - 1e-9 && s.frame.y + s.frame.height <= s.photo.y + s.photo.height + 1e-9)
    const o = setFrameAspect(base(), 'original')
    near(o.frame.width / o.frame.height, 2)
  })
})

describe('finishing', () => {
  it('nothing moved on an uncropped image: no crop, same box', () => {
    const r = finishCropSession(base())
    assert.equal(r.changed, false)
    assert.equal(r.crop, null)
    assert.deepEqual(r.placement, { x: 100, y: 50, width: 400, height: 400 })
  })

  it('a moved photo becomes a crop of the frame', () => {
    const r = finishCropSession(panPhoto(base(), 200, 0))
    near(r.crop.x, 0)
    near(r.crop.width, 0.5)
    near(r.crop.height, 1)
    const reset = finishCropSession(resetCropSession(panPhoto(base(), 200, 0)))
    assert.equal(reset.changed, false)
  })

  it('a smaller frame moves the box; a rotated box turns about the right point', () => {
    const r = finishCropSession(resizeFrame(base(), 'e', -200, 0))
    assert.deepEqual(r.placement, { x: 100, y: 50, width: 200, height: 400 })
    const rot = startCropSession({ box: { x: 0, y: 0, width: 200, height: 100, rotation: 90 }, natural: { width: 200, height: 100 } })
    const out = finishCropSession(resizeFrame(rot, 'e', -100, 0))
    // Local centre (50, 50) turned 90° about (100, 50) lands at (100, 0).
    near(out.placement.x + out.placement.width / 2, 100)
    near(out.placement.y + out.placement.height / 2, 0)
  })

  it('screen movement maps into a rotated element\'s axes', () => {
    const d = unrotateDelta(0, 10, 90)
    near(d.dx, 10)
    near(d.dy, 0)
  })
})
