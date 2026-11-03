#!/usr/bin/env node
/** Run: node --test src/utils/imageUploadFormat.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { imagePlacementForPage, isImageFile, prepareImageForUpload } from './imageUploadFormat.js'

const file = (name, type) => new File([new Uint8Array([1, 2, 3])], name, { type })

describe('image upload format', () => {
  it('recognises images by type or extension', () => {
    assert.equal(isImageFile(file('a.gif', 'image/gif')), true)
    assert.equal(isImageFile(file('photo.jfif', '')), true)
    assert.equal(isImageFile(file('pic.avif', '')), true)
    assert.equal(isImageFile(file('clip.mp4', 'video/mp4')), false)
    assert.equal(isImageFile(null), false)
  })

  it('keeps JPEG/PNG/WebP and non-images unchanged', async () => {
    const jpg = file('a.jpg', 'image/jpeg')
    assert.equal(await prepareImageForUpload(jpg), jpg)
    const mp4 = file('a.mp4', 'video/mp4')
    assert.equal(await prepareImageForUpload(mp4), mp4)
  })

  it('labels JPEGs with a missing or non-standard type (.jfif, image/jpg)', async () => {
    const jfif = await prepareImageForUpload(file('photo.jfif', ''))
    assert.equal(jfif.type, 'image/jpeg')
    assert.equal(jfif.name, 'photo.jpg')
    const jpg = await prepareImageForUpload(file('x.jpg', 'image/jpg'))
    assert.equal(jpg.type, 'image/jpeg')
    assert.equal(jpg.name, 'x.jpg')
    const png = await prepareImageForUpload(file('y.png', 'application/octet-stream'))
    assert.equal(png.type, 'image/png')
  })

  it('places a new image at its aspect ratio, inside the page', () => {
    const page = { width: 1280, height: 720 }
    const p = imagePlacementForPage({ width: 4000, height: 2000 }, page)
    assert.equal(p.width / p.height, 2)
    assert.ok(p.width <= 1280 * 0.6 && p.height <= 720 * 0.6)
    assert.equal(p.x, Math.round((1280 - p.width) / 2))
    const corner = imagePlacementForPage({ width: 200, height: 100 }, page, { x: 1280, y: 720 })
    assert.equal(corner.x + corner.width, 1280)
    assert.equal(corner.y + corner.height, 720)
  })
})
