import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mergeSlideDocs } from './mergeSlideDocs.js'

const el = (id, text, extra = {}) => ({ id, type: 'text', content: { text }, ...extra })
const img = (id) => ({ id, type: 'image', content: { url: `https://b/${id}.png` } })
const doc = (elements, extra = {}) => ({ version: 1, canvas: { width: 1920, height: 1080 }, elements, ...extra })
const ids = (d) => d.elements.map((e) => e.id)

test('two tabs: my title edit and their new image both survive', () => {
  const base = doc([el('t', 'Title')], { revision: 3 })
  const local = doc([el('t', 'Title (mine)')], { revision: 3 })
  const server = doc([el('t', 'Title'), img('img_theirs')], { revision: 4 })
  const out = mergeSlideDocs(base, local, server)
  assert.deepEqual(ids(out), ['t', 'img_theirs'])
  assert.equal(out.elements[0].content.text, 'Title (mine)')
  assert.equal(out.revision, 4)
})

test('an element changed only on the server takes the server version', () => {
  const base = doc([el('a', 'A'), el('b', 'B')])
  const local = doc([el('a', 'A (mine)'), el('b', 'B')])
  const server = doc([el('a', 'A'), el('b', 'B (theirs)')])
  const out = mergeSlideDocs(base, local, server)
  assert.deepEqual(out.elements.map((e) => e.content.text), ['A (mine)', 'B (theirs)'])
})

test('changed on both sides: ours wins', () => {
  const out = mergeSlideDocs(doc([el('a', 'A')]), doc([el('a', 'mine')]), doc([el('a', 'theirs')]))
  assert.equal(out.elements[0].content.text, 'mine')
})

test('deleted here, untouched there: stays deleted', () => {
  const base = doc([el('a', 'A'), img('i1')])
  const out = mergeSlideDocs(base, doc([el('a', 'A')]), doc([el('a', 'A'), img('i1'), el('c', 'C')]))
  assert.deepEqual(ids(out), ['a', 'c'])
})

test('deleted there, untouched here: stays deleted', () => {
  const base = doc([el('a', 'A'), img('i1')])
  const out = mergeSlideDocs(base, doc([el('a', 'A'), img('i1')]), doc([el('a', 'A')]))
  assert.deepEqual(ids(out), ['a'])
})

test('deleted on one side but edited on the other: kept (no edit is lost)', () => {
  const base = doc([el('a', 'A')])
  assert.deepEqual(ids(mergeSlideDocs(base, doc([el('a', 'edited here')]), doc([]))), ['a'])
  assert.deepEqual(ids(mergeSlideDocs(base, doc([]), doc([el('a', 'edited there')]))), ['a'])
})

test('added locally (not saved yet) is kept', () => {
  const base = doc([el('a', 'A')])
  const out = mergeSlideDocs(base, doc([el('a', 'A'), el('el-new', 'new')]), doc([el('a', 'A')]))
  assert.deepEqual(ids(out), ['a', 'el-new'])
})

test('background: my colour change wins, their background image is kept', () => {
  const base = doc([], { backgroundColor: '#FFFFFF' })
  const local = doc([], { backgroundColor: '#C9DAF8' })
  const server = doc([], { backgroundColor: '#FFFFFF', backgroundImage: 'https://b/bg.png' })
  const out = mergeSlideDocs(base, local, server)
  assert.equal(out.backgroundColor, '#C9DAF8')
  assert.equal(out.backgroundImage, 'https://b/bg.png')
})

test('without a base: union, ours wins, nothing deleted', () => {
  const out = mergeSlideDocs(null, doc([el('a', 'mine')]), doc([el('a', 'theirs'), img('i')]))
  assert.deepEqual(ids(out), ['a', 'i'])
  assert.equal(out.elements[0].content.text, 'mine')
})

test('missing local or server returns the other side', () => {
  const d = doc([el('a', 'A')])
  assert.equal(mergeSlideDocs(d, d, null), d)
  assert.equal(mergeSlideDocs(d, null, d), d)
})
