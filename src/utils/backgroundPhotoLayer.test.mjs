import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveSlideStageBackground, slideBackgroundPhotoElement } from './presentationHelpers.js'
import { resolveStageElements } from './slideStageElements.js'

const canvas = { width: 1920, height: 1080 }
const photo = {
  id: 'img_bg',
  type: 'image',
  layer: 3,
  placement: { x: 1200, y: 300, width: 400, height: 300, rotation: 15, opacity: 0.8 },
  content: { url: 'https://b/new.png', fit: 'contain', useAsBackground: true, filters: { grayscale: 100 } },
}
const slide = (extra = {}) => ({
  id: 's1',
  backgroundImage: 'https://b/old-copy.png',
  backgroundImageElementId: 'img_bg',
  elements: { canvas, elements: [{ id: 't', type: 'text', layer: 1, placement: { x: 0, y: 0, width: 100, height: 50 }, content: { text: 'x' } }, photo] },
  ...extra,
})

test('E-4a: the background photo element is found (by id or useAsBackground)', () => {
  assert.equal(slideBackgroundPhotoElement(slide()).id, 'img_bg')
  assert.equal(slideBackgroundPhotoElement(slide({ backgroundImageElementId: undefined })).id, 'img_bg')
  assert.equal(slideBackgroundPhotoElement({ elements: { elements: [{ id: 'a', type: 'image', content: { url: 'u' } }] } }), null)
})

test('E-4a: the stage draws the photo itself as a full-slide bottom layer, with its own settings', () => {
  const els = resolveStageElements(slide(), canvas, null)
  const layer = els[0]
  assert.equal(layer.backgroundLayer, true)
  assert.equal(layer.sourceElementId, 'img_bg')
  assert.deepEqual([layer.placement.x, layer.placement.y, layer.placement.width, layer.placement.height, layer.placement.rotation], [0, 0, 1920, 1080, 0])
  assert.equal(layer.placement.opacity, 0.8)
  assert.equal(layer.content.url, 'https://b/new.png', 'the current picture, not the stored copy')
  assert.equal(layer.content.fit, 'contain')
  assert.deepEqual(layer.content.filters, { grayscale: 100 })
  assert.ok(!els.slice(1).some((e) => e.id === 'img_bg'), 'the photo is not also drawn at its old frame')
})

test('E-4a: stage CSS paints only the colour when the photo is a layer; otherwise the live picture', () => {
  const withLayer = resolveSlideStageBackground(slide(), '#fff', null, { photoLayer: true })
  assert.equal(withLayer.backgroundImage, undefined)
  const css = resolveSlideStageBackground(slide(), '#fff', null)
  assert.match(css.backgroundImage, /new\.png/)
  assert.equal(css.backgroundSize, 'contain')
})
