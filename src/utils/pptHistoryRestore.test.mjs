import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slidesToSaveAfterRestore } from './pptHistoryRestore.js'

const slide = (id, text, extra = {}) => ({
  id,
  elements: { version: 1, canvas: { width: 1920, height: 1080 }, elements: [{ id: `${id}-t`, type: 'text', content: { text } }] },
  ...extra,
})

test('undo of an edit on one slide saves only that slide (N-1)', () => {
  const before = [slide('s1', 'edited'), slide('s2', 'b'), slide('s3', 'c')]
  const restored = [slide('s1', 'original'), slide('s2', 'b'), slide('s3', 'c')]
  assert.deepEqual(slidesToSaveAfterRestore(before, restored), ['s1'])
})

test('nothing changed and nothing pending: no saves', () => {
  const slides = [slide('s1', 'a'), slide('s2', 'b')]
  assert.deepEqual(slidesToSaveAfterRestore(slides, slides.map((s) => ({ ...s }))), [])
})

test('a slide whose save was cancelled by the restore is still saved', () => {
  const before = [slide('s1', 'a'), slide('s2', 'typed, not saved yet')]
  const restored = [slide('s1', 'a'), slide('s2', 'typed, not saved yet')]
  assert.deepEqual(slidesToSaveAfterRestore(before, restored, ['s2']), ['s2'])
})

test('a slide that only exists in the snapshot (undo of delete) is saved, as before', () => {
  const before = [slide('s1', 'a')]
  const restored = [slide('s1', 'a'), slide('s2', 'back')]
  assert.deepEqual(slidesToSaveAfterRestore(before, restored), ['s2'])
})

test('temporary and server ids of the same slide are matched', () => {
  const map = { 'new-slide-1': 'srv-1' }
  const resolve = (id) => map[id] || id
  const before = [slide('new-slide-1', 'a')]
  const restored = [{ ...before[0], id: 'srv-1' }]
  assert.deepEqual(slidesToSaveAfterRestore(before, restored, [], resolve), [])
  assert.deepEqual(slidesToSaveAfterRestore(before, restored, ['new-slide-1'], resolve), ['srv-1'])
})

test('background-only changes count as a change', () => {
  const a = slide('s1', 'x')
  const b = { ...a, elements: { ...a.elements, backgroundColor: '#C9DAF8' } }
  assert.deepEqual(slidesToSaveAfterRestore([b], [a]), ['s1'])
})

test('slides without an elements doc are skipped', () => {
  assert.deepEqual(slidesToSaveAfterRestore([], [{ id: 's1' }, null]), [])
})

import { slideListChanges } from './pptHistoryRestore.js'

test('undo of add: the added slide is removed on the server', () => {
  assert.deepEqual(slideListChanges(['a', 'b', 'new'], ['a', 'b']), { removed: ['new'], recreated: [], orderChanged: false })
})

test('undo of delete: the slide is recreated', () => {
  assert.deepEqual(slideListChanges(['a', 'c'], ['a', 'b', 'c']), { removed: [], recreated: ['b'], orderChanged: false })
})

test('undo of reorder: order change detected', () => {
  assert.deepEqual(slideListChanges(['b', 'a', 'c'], ['a', 'b', 'c']), { removed: [], recreated: [], orderChanged: true })
})

test('only content changed: nothing to send for the slide list', () => {
  assert.deepEqual(slideListChanges(['a', 'b'], ['a', 'b']), { removed: [], recreated: [], orderChanged: false })
})

test('temporary ids are left to the add request on its way', () => {
  const isTemp = (id) => id.startsWith('new-slide-')
  assert.deepEqual(slideListChanges(['a', 'new-slide-1'], ['a'], isTemp), { removed: [], recreated: [], orderChanged: false })
})
