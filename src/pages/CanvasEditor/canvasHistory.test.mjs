#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  HISTORY_LIMIT,
  createHistory,
  currentEntry,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  mapHistory,
} from './canvasHistory.js'

describe('canvasHistory', () => {
  it('seeds from the present snapshot', () => {
    const present = [{ id: 'p1' }]
    const history = createHistory(present)
    assert.equal(currentEntry(history), present)
    assert.equal(canUndo(history), false)
    assert.equal(canRedo(history), false)
  })

  it('undo and redo walk the stack and pushing after undo drops the redo branch', () => {
    const a = [{ id: 'a' }]
    const b = [{ id: 'b' }]
    const c = [{ id: 'c' }]
    let history = pushHistory(createHistory(a), b)
    history = undoHistory(history)
    assert.equal(currentEntry(history), a)
    assert.equal(canRedo(history), true)

    history = pushHistory(history, c)
    assert.equal(currentEntry(history), c)
    assert.equal(canRedo(history), false)
    assert.equal(redoHistory(history), history)
  })

  it(`keeps at most ${HISTORY_LIMIT} snapshots`, () => {
    let history = createHistory(0)
    for (let i = 1; i <= HISTORY_LIMIT + 5; i += 1) {
      history = pushHistory(history, i)
    }
    assert.equal(history.stack.length, HISTORY_LIMIT)
    assert.equal(currentEntry(history), HISTORY_LIMIT + 5)
  })

  it('mapHistory rewrites every snapshot and is a no-op when nothing changes', () => {
    const a = [{ url: 'old' }]
    const b = [{ url: 'new' }]
    let history = pushHistory(createHistory(a), b)
    const unchanged = mapHistory(history, (entry) => entry)
    assert.equal(unchanged, history)

    history = mapHistory(history, (entry) =>
      entry.map((page) => ({ ...page, url: page.url === 'old' ? 'cdn' : page.url }))
    )
    assert.equal(history.stack[0][0].url, 'cdn')
    assert.equal(history.stack[1][0].url, 'new')
  })
})
