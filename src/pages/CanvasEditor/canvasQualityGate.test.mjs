#!/usr/bin/env node
/**
 * Quality gate for the Canvas editor surface.
 * Run: node --test src/pages/CanvasEditor/canvasQualityGate.test.mjs
 *
 * create → insert element → undo → autosave payload shape; reopen hydrates data.canvases.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  createDocument,
  createElement,
  insertElements,
  serializeForSave,
  hydrateFromServer,
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  currentEntry,
} from './canvasDocument.js'

const SIZE = { width: 1080, height: 1080 }

function autosaveShape(payload) {
  assert.deepEqual(Object.keys(payload).sort(), ['canvases', 'docTitle', 'size', 'version'])
  assert.equal(payload.version, 1)
  assert.equal(payload.docTitle, 'Launch poster')
  assert.deepEqual(payload.size, SIZE)
  assert.ok(Array.isArray(payload.canvases) && payload.canvases.length === 1)
}

describe('canvas quality gate', () => {
  it('create → insert → undo → autosave payload; reopen hydrates data.canvases', () => {
    const created = createDocument(SIZE)
    let history = createHistory(created)
    const page = created[0]

    const element = createElement(
      { type: 'text', content: { text: 'Launch' } },
      page,
      0,
      { id: 'el-1' }
    )
    const inserted = insertElements(created, page.id, [element])
    assert.equal(inserted[0].elements.length, 1)
    assert.equal(inserted[0].elements[0].content.text, 'Launch')
    assert.equal(created[0].elements.length, 0)

    history = pushHistory(history, inserted)
    history = undoHistory(history)
    assert.equal(currentEntry(history), created)
    assert.equal(currentEntry(history)[0].elements.length, 0)

    const undone = serializeForSave({
      canvases: currentEntry(history),
      docTitle: 'Launch poster',
      size: SIZE,
    })
    autosaveShape(undone)
    assert.equal(undone.canvases[0].elements.length, 0)

    history = redoHistory(history)
    const edited = currentEntry(history)
    assert.equal(edited[0].elements[0].id, 'el-1')

    const saved = serializeForSave({ canvases: edited, docTitle: 'Launch poster', size: SIZE })
    autosaveShape(saved)
    assert.equal(saved.canvases[0].elements[0].type, 'text')
    assert.equal(saved.canvases[0].elements[0].content.text, 'Launch')
    assert.equal(JSON.stringify(saved).includes('blob:'), false)

    const loaded = hydrateFromServer(
      { name: 'Launch poster', data: saved },
      SIZE,
      'Untitled Design'
    )
    assert.equal(loaded.canvases.length, saved.canvases.length)
    assert.equal(loaded.canvases[0].id, saved.canvases[0].id)
    assert.equal(loaded.canvases[0].elements.length, 1)
    assert.equal(loaded.canvases[0].elements[0].id, 'el-1')
    assert.equal(loaded.canvases[0].elements[0].content.text, 'Launch')
    assert.equal(loaded.docTitle, 'Launch poster')
    assert.deepEqual(loaded.size, SIZE)
  })
})
