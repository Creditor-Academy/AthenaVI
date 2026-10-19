#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasInsertUndo.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  createDocument,
  insertElements,
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  currentEntry,
} from './canvasDocument.js'

describe('Canvas insert + undo', () => {
  it('inserts a text element and undo restores the previous document', () => {
    const doc = createDocument({ width: 1080, height: 1080 })
    let history = createHistory(doc)
    const inserted = insertElements(doc, doc[0].id, [
      {
        id: 'el-1',
        type: 'text',
        placement: { x: 100, y: 100, width: 200, height: 60 },
        content: { text: 'Hello' },
        layer: 1,
      },
    ])

    assert.equal(inserted[0].elements.length, 1)
    assert.equal(inserted[0].elements[0].id, 'el-1')

    history = pushHistory(history, inserted)
    assert.equal(currentEntry(history)[0].elements.length, 1)

    history = undoHistory(history)
    assert.equal(currentEntry(history)[0].elements.length, 0)
    assert.equal(currentEntry(history), doc)

    history = redoHistory(history)
    assert.equal(currentEntry(history)[0].elements[0].type, 'text')
  })

  it('inserts a shape the same way', () => {
    const doc = createDocument({ width: 1080, height: 1080 })
    const next = insertElements(doc, doc[0].id, [
      {
        id: 'shape-1',
        type: 'shape',
        placement: { x: 40, y: 40, width: 120, height: 80 },
        content: { shape: 'rect' },
        layer: 1,
      },
    ])
    assert.equal(next[0].elements[0].type, 'shape')
    assert.equal(doc[0].elements.length, 0)
  })
})
