#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasSaveErrors.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  SAVE_ERROR,
  classifySaveError,
  isRetryable,
  haltsAutosave,
  retryDelayMs,
  RETRY_DELAYS_MS,
  describeSaveError,
} from './canvasSaveErrors.js'
import {
  writeLocalDraft,
  readLocalDraft,
  clearLocalDraft,
  shouldOfferDraftRestore,
  DRAFT_MAX_AGE_MS,
} from './canvasLocalDraft.js'

function httpError(status, details = [], message = 'failed') {
  return Object.assign(new Error(message), { status, details })
}

describe('classifySaveError', () => {
  it('maps statuses to kinds', () => {
    assert.equal(classifySaveError(new TypeError('Failed to fetch')), SAVE_ERROR.NETWORK)
    assert.equal(classifySaveError(httpError(409)), SAVE_ERROR.CONFLICT)
    assert.equal(classifySaveError(httpError(401)), SAVE_ERROR.AUTH)
    assert.equal(classifySaveError(httpError(403)), SAVE_ERROR.AUTH)
    assert.equal(classifySaveError(httpError(404)), SAVE_ERROR.NOT_FOUND)
    assert.equal(classifySaveError(httpError(429)), SAVE_ERROR.SERVER)
    assert.equal(classifySaveError(httpError(503)), SAVE_ERROR.SERVER)
    assert.equal(classifySaveError(httpError(400)), SAVE_ERROR.VALIDATION)
    assert.equal(classifySaveError(httpError(413)), SAVE_ERROR.VALIDATION)
  })

  it('retries only network and server failures', () => {
    assert.equal(isRetryable(SAVE_ERROR.NETWORK), true)
    assert.equal(isRetryable(SAVE_ERROR.SERVER), true)
    assert.equal(isRetryable(SAVE_ERROR.VALIDATION), false)
    assert.equal(isRetryable(SAVE_ERROR.CONFLICT), false)
  })

  it('halts autosave for conflict, auth and not-found', () => {
    assert.equal(haltsAutosave(SAVE_ERROR.CONFLICT), true)
    assert.equal(haltsAutosave(SAVE_ERROR.AUTH), true)
    assert.equal(haltsAutosave(SAVE_ERROR.NOT_FOUND), true)
    assert.equal(haltsAutosave(SAVE_ERROR.VALIDATION), false)
    assert.equal(haltsAutosave(SAVE_ERROR.NETWORK), false)
  })

  it('backs off and then holds at the longest delay', () => {
    assert.equal(retryDelayMs(0), RETRY_DELAYS_MS[0])
    assert.equal(retryDelayMs(1), RETRY_DELAYS_MS[1])
    assert.equal(retryDelayMs(99), RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1])
  })

  it('turns Joi cap errors into plain language', () => {
    const elements = httpError(400, ['"data.canvases[0].elements" must contain less than or equal to 200 items'])
    assert.equal(describeSaveError(SAVE_ERROR.VALIDATION, elements), 'Not saved: A page can hold at most 200 elements.')
    const pages = httpError(400, ['"data.canvases" must contain less than or equal to 40 items'])
    assert.equal(describeSaveError(SAVE_ERROR.VALIDATION, pages), 'Not saved: A design can have at most 40 pages.')
    const other = httpError(400, ['"data.size.width" must be a number'])
    assert.equal(describeSaveError(SAVE_ERROR.VALIDATION, other), 'Not saved: "data.size.width" must be a number')
  })
})

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    map,
  }
}

describe('local draft', () => {
  const doc = { version: 1, docTitle: 'Poster', size: { width: 10, height: 10 }, canvases: [{ id: 'p', elements: [] }] }

  it('round-trips a draft and clears it', () => {
    const storage = memoryStorage()
    assert.equal(writeLocalDraft('c1', doc, { baseRevision: 3, now: 1000 }, storage), true)
    const draft = readLocalDraft('c1', { now: 2000 }, storage)
    assert.equal(draft.baseRevision, 3)
    assert.deepEqual(draft.doc, doc)
    clearLocalDraft('c1', storage)
    assert.equal(readLocalDraft('c1', { now: 2000 }, storage), null)
  })

  it('drops drafts older than the max age', () => {
    const storage = memoryStorage()
    writeLocalDraft('c1', doc, { now: 0 }, storage)
    assert.equal(readLocalDraft('c1', { now: DRAFT_MAX_AGE_MS + 1 }, storage), null)
    assert.equal(storage.map.size, 0)
  })

  it('survives storage that throws', () => {
    const broken = {
      getItem() { throw new Error('denied') },
      setItem() { throw new Error('quota') },
      removeItem() { throw new Error('denied') },
    }
    assert.equal(writeLocalDraft('c1', doc, {}, broken), false)
    assert.equal(readLocalDraft('c1', {}, broken), null)
    assert.doesNotThrow(() => clearLocalDraft('c1', broken))
  })

  it('offers a restore only while the server is still at the draft base revision', () => {
    assert.equal(shouldOfferDraftRestore(null, 3), false)
    assert.equal(shouldOfferDraftRestore({ baseRevision: 3 }, 3), true)
    assert.equal(shouldOfferDraftRestore({ baseRevision: 3 }, 4), false)
  })
})
