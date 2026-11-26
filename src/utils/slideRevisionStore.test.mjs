import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import {
  noteServerSlides,
  getServerSlide,
  getServerSlideBefore,
  clearServerSlides,
} from './slideRevisionStore.js'

const slide = (id, revision, text = 'x') => ({
  id,
  elements: { version: 1, revision, elements: [{ id: 't', type: 'text', content: { text } }] },
})

beforeEach(() => clearServerSlides())

test('records slides from a single-slide reply and from a whole deck', () => {
  noteServerSlides({ slide: slide('s1', 2) })
  noteServerSlides({ deck: { slides: [slide('s2', 5), slide('s3', 0)] } })
  assert.equal(getServerSlide('s1').revision, 2)
  assert.equal(getServerSlide('s2').revision, 5)
  assert.equal(getServerSlide('s3').revision, 0)
})

test('an older reply arriving late never replaces a newer copy', () => {
  noteServerSlides({ slide: slide('s1', 4, 'new') })
  noteServerSlides({ slide: slide('s1', 3, 'old') })
  assert.equal(getServerSlide('s1').revision, 4)
  assert.equal(getServerSlide('s1').doc.elements[0].content.text, 'new')
})

test('slides without a revision (older backend) are not recorded', () => {
  noteServerSlides({ slide: { id: 's1', elements: { elements: [] } } })
  assert.equal(getServerSlide('s1'), null)
})

test('keeps earlier copies for merge bases', () => {
  noteServerSlides({ slide: slide('s1', 1, 'one') })
  noteServerSlides({ slide: slide('s1', 2, 'two') })
  noteServerSlides({ slide: slide('s1', 3, 'three') })
  assert.equal(getServerSlideBefore('s1', 3).doc.elements[0].content.text, 'two')
  assert.equal(getServerSlideBefore('s1', 1), null)
})

test('stored docs are copies, not live references', () => {
  const s = slide('s1', 1, 'before')
  noteServerSlides({ slide: s })
  s.elements.elements[0].content.text = 'mutated'
  assert.equal(getServerSlide('s1').doc.elements[0].content.text, 'before')
})

test('the local base only moves when set, not on every reply seen (PATCH echoes)', async () => {
  const { setLocalBase, getLocalBase } = await import('./slideRevisionStore.js')
  noteServerSlides({ slide: slide('s1', 1, 'loaded') })
  setLocalBase('s1', 1)
  noteServerSlides({ slide: slide('s1', 3, 'patch echo with another tab’s change') })
  const base = getLocalBase('s1')
  assert.equal(base.revision, 1)
  assert.equal(base.doc.elements[0].content.text, 'loaded')
  setLocalBase('s1', 3)
  assert.equal(getLocalBase('s1').revision, 3)
})

test('unknown local base is null; a base whose copy was evicted has doc null', async () => {
  const { setLocalBase, getLocalBase } = await import('./slideRevisionStore.js')
  assert.equal(getLocalBase('nope'), null)
  setLocalBase('s9', 7)
  assert.deepEqual(getLocalBase('s9'), { revision: 7, doc: null })
})
