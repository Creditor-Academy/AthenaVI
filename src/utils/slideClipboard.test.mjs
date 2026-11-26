import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildSlideClip, pastedSlideFromClip, readSlideClipboard, writeSlideClipboard } from './slideClipboard.js'

const slide = {
  id: 's5',
  title: 'Roadmap',
  layoutId: 'metric_three_v1',
  backgroundColor: '#C9DAF8',
  transition: 'fade',
  speakerNotes: 'Say hello',
}
const doc = {
  version: 1,
  canvas: { width: 1920, height: 1080 },
  backgroundImage: 'https://b/bg.png',
  backgroundImageFit: 'cover',
  backgroundImageElementId: 'img_bg',
  elements: [
    { id: 'img_bg', type: 'image', content: { url: 'https://b/bg.png', useAsBackground: true } },
    { id: 'g1', type: 'group', childIds: ['t1', 'i1'] },
    { id: 't1', type: 'text', groupId: 'g1', content: { text: 'Hello' } },
    { id: 'i1', type: 'image', groupId: 'g1', content: { url: 'https://b/i1.png' } },
  ],
}

test('S-1: a copied slide keeps elements, background, transition, notes, title and layout', () => {
  const clip = buildSlideClip(slide, doc)
  assert.equal(clip.title, 'Roadmap')
  assert.equal(clip.layoutId, 'metric_three_v1')
  assert.equal(clip.elements.length, 4)
  assert.equal(clip.background.backgroundColor, '#C9DAF8')
  assert.equal(clip.background.backgroundImage, 'https://b/bg.png')
  assert.equal(clip.background.backgroundImageElementId, 'img_bg')
  assert.equal(clip.transition, 'fade')
  assert.equal(clip.speakerNotes, 'Say hello')
})

test('S-1: a paste gets new element ids; groups and the background photo still point at the right elements', () => {
  const pasted = pastedSlideFromClip(buildSlideClip(slide, doc), (old) => `new-${old}`)
  assert.deepEqual(pasted.elements.map((e) => e.id), ['new-img_bg', 'new-g1', 'new-t1', 'new-i1'])
  assert.deepEqual(pasted.elements[1].childIds, ['new-t1', 'new-i1'])
  assert.equal(pasted.elements[2].groupId, 'new-g1')
  assert.equal(pasted.background.backgroundImageElementId, 'new-img_bg')
  assert.equal(pasted.background.backgroundColor, '#C9DAF8')
})

test('S-1: the copied slide is not linked to the original (changing one never changes the other)', () => {
  const clip = buildSlideClip(slide, doc)
  doc.elements[2].content.text = 'changed after copy'
  assert.equal(clip.elements[2].content.text, 'Hello')
  doc.elements[2].content.text = 'Hello'
})

test('S-1: the clipboard works without local storage (in-memory fallback)', () => {
  const clip = buildSlideClip(slide, doc)
  writeSlideClipboard(clip)
  assert.equal(readSlideClipboard().title, 'Roadmap')
})
