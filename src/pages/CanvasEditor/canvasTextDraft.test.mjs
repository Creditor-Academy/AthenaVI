import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canvasesWithTextDraft } from './canvasTextDraft.js'

const pages = () => [
  { id: 'p1', elements: [{ id: 'img1', type: 'image', content: { url: 'u' } }] },
  { id: 'p2', elements: [{ id: 'txt1', type: 'text', content: { text: 'Add your paragraph text here.' } }] },
]

test('the text being typed is applied to its element on whichever page it is', () => {
  const out = canvasesWithTextDraft(pages(), { elementId: 'txt1', text: 'Typed then refreshed' })
  assert.equal(out[1].elements[0].content.text, 'Typed then refreshed')
  assert.deepEqual(out[0], pages()[0])
})

test('no draft, or a draft for an element not in the document: same array back', () => {
  const doc = pages()
  assert.equal(canvasesWithTextDraft(doc, null), doc)
  assert.equal(canvasesWithTextDraft(doc, { elementId: 'gone', text: 'x' }), doc)
})

test('the document passed in is not changed', () => {
  const doc = pages()
  canvasesWithTextDraft(doc, { elementId: 'txt1', text: 'new' })
  assert.equal(doc[1].elements[0].content.text, 'Add your paragraph text here.')
})
