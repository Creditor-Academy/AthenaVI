#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasDocument.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_ELEMENTS_PER_PAGE,
  MAX_PAGES,
  createDocument,
  addPage,
  duplicatePage,
  deletePage,
  movePage,
  resizeDocument,
  insertElements,
  collectIds,
  isLocalUrl,
  replaceUrlInDocument,
  stripLocalUrls,
  collectLocalUrls,
  serializeForSave,
  hydrateFromServer,
  validateForSave,
} from './canvasDocument.js'
import {
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  currentEntry,
  canUndo,
  canRedo,
  mapHistory,
  HISTORY_LIMIT,
} from './canvasHistory.js'

const SIZE = { width: 1080, height: 1080 }

function textElement(id = 'element-1') {
  return {
    id,
    type: 'text',
    placement: { x: 0, y: 0, width: 200, height: 60 },
    content: { text: 'Hello' },
    layer: 1,
  }
}

function imageElement(url, id = 'image-1') {
  return {
    id,
    type: 'image',
    placement: { x: 0, y: 0, width: 200, height: 200 },
    content: { url, src: url },
  }
}

describe('pages', () => {
  it('addPage appends a page of the given size', () => {
    const doc = createDocument(SIZE)
    const next = addPage(doc, { width: 500, height: 300 })
    assert.equal(next.length, 2)
    assert.equal(next[1].width, 500)
    assert.notEqual(next[1].id, doc[0].id)
  })

  it('addPage stops at the page cap', () => {
    let doc = createDocument(SIZE)
    for (let i = 1; i < MAX_PAGES; i += 1) doc = addPage(doc, SIZE)
    assert.equal(doc.length, MAX_PAGES)
    assert.equal(addPage(doc, SIZE), doc)
  })

  it('duplicatePage copies below the source with fresh ids and remapped groups', () => {
    const group = { ...textElement('g1'), type: 'group', childIds: ['a'] }
    const child = { ...textElement('a'), groupId: 'g1' }
    const doc = [{ ...createDocument(SIZE)[0], elements: [group, child] }, ...createDocument(SIZE)]
    const { canvases, page } = duplicatePage(doc, doc[0].id)
    assert.equal(canvases.length, 3)
    assert.equal(canvases[1], page)
    const [copyGroup, copyChild] = page.elements
    assert.notEqual(copyGroup.id, 'g1')
    assert.deepEqual(copyGroup.childIds, [copyChild.id])
    assert.equal(copyChild.groupId, copyGroup.id)
  })

  it('deletePage never removes the last page', () => {
    const doc = createDocument(SIZE)
    assert.equal(deletePage(doc, doc[0].id), doc)
    const two = addPage(doc, SIZE)
    assert.deepEqual(deletePage(two, two[0].id), [two[1]])
  })

  it('movePage reorders and ignores out-of-range moves', () => {
    const doc = addPage(addPage(createDocument(SIZE), SIZE), SIZE)
    const moved = movePage(doc, 0, 2)
    assert.deepEqual(moved.map((p) => p.id), [doc[1].id, doc[2].id, doc[0].id])
    assert.equal(movePage(doc, 0, 3), doc)
    assert.equal(movePage(doc, 1, 1), doc)
  })

  it('resizeDocument resizes every page', () => {
    const doc = addPage(createDocument(SIZE), SIZE)
    const resized = resizeDocument(doc, { width: 1920, height: 1080 })
    assert.ok(resized.every((p) => p.width === 1920 && p.height === 1080))
  })
})

describe('elements', () => {
  it('insertElements appends to the target page only', () => {
    const doc = addPage(createDocument(SIZE), SIZE)
    const next = insertElements(doc, doc[1].id, [textElement()])
    assert.equal(next[0], doc[0])
    assert.equal(next[1].elements.length, 1)
  })

  it('insertElements refuses to go past the element cap', () => {
    const full = Array.from({ length: MAX_ELEMENTS_PER_PAGE }, (_, i) => textElement(`e${i}`))
    const doc = [{ ...createDocument(SIZE)[0], elements: full }]
    assert.equal(insertElements(doc, doc[0].id, [textElement('extra')]), doc)
  })

  it('collectIds lists page and element ids', () => {
    const doc = createDocument(SIZE)
    const withEl = insertElements(doc, doc[0].id, [textElement('x')])
    const { pageIds, elementIds } = collectIds(withEl)
    assert.ok(pageIds.has(doc[0].id))
    assert.ok(elementIds.has('x'))
    assert.equal(elementIds.size, 1)
  })
})

describe('local image URLs', () => {
  const blob = 'blob:http://localhost:5173/abc'
  const stored = 'https://cdn.example.com/a.png'

  it('isLocalUrl only matches blob: URLs', () => {
    assert.equal(isLocalUrl(blob), true)
    assert.equal(isLocalUrl(stored), false)
    assert.equal(isLocalUrl('data:image/png;base64,AAA'), false)
    assert.equal(isLocalUrl(null), false)
  })

  it('replaceUrlInDocument swaps the URL in content and page fields and patches content', () => {
    const page = { ...createDocument(SIZE)[0], backgroundImage: blob, elements: [imageElement(blob)] }
    const next = replaceUrlInDocument([page], blob, stored, { assetId: 'asset-1' })
    assert.equal(next[0].backgroundImage, stored)
    assert.equal(next[0].elements[0].content.url, stored)
    assert.equal(next[0].elements[0].content.src, stored)
    assert.equal(next[0].elements[0].content.assetId, 'asset-1')
  })

  it('replaceUrlInDocument keeps identity when the URL is absent', () => {
    const doc = [{ ...createDocument(SIZE)[0], elements: [imageElement(stored)] }]
    assert.equal(replaceUrlInDocument(doc, blob, stored), doc)
  })

  it('stripLocalUrls nulls blob URLs and collectLocalUrls finds them', () => {
    const doc = [{ ...createDocument(SIZE)[0], elements: [imageElement(blob), imageElement(stored, 'i2')] }]
    assert.deepEqual(collectLocalUrls(doc), [blob])
    const stripped = stripLocalUrls(doc)
    assert.equal(stripped[0].elements[0].content.url, null)
    assert.equal(stripped[0].elements[1], doc[0].elements[1])
    assert.deepEqual(collectLocalUrls(stripped), [])
  })
})

describe('save and load', () => {
  it('serializeForSave produces the autosave payload shape without blob URLs', () => {
    const doc = [{ ...createDocument(SIZE)[0], elements: [imageElement('blob:x'), textElement()] }]
    const payload = serializeForSave({ canvases: doc, docTitle: 'Poster', size: SIZE })
    assert.deepEqual(Object.keys(payload).sort(), ['canvases', 'docTitle', 'size', 'version'])
    assert.equal(payload.version, 1)
    assert.equal(payload.canvases[0].elements[0].content.url, null)
    assert.equal(payload.canvases[0].elements[1], doc[0].elements[1])
  })

  it('hydrateFromServer reads pages, title, size and revision', () => {
    const page = { ...createDocument(SIZE)[0], elements: [textElement()] }
    const loaded = hydrateFromServer({
      name: 'Server name',
      data: { docTitle: 'Old title', size: { width: 800, height: 600 }, canvases: [page], revision: 4 },
    })
    assert.equal(loaded.docTitle, 'Server name')
    assert.deepEqual(loaded.size, { width: 800, height: 600 })
    assert.equal(loaded.canvases[0], page)
    assert.equal(loaded.revision, 4)
  })

  it('hydrateFromServer falls back to one blank page for empty or malformed data', () => {
    for (const data of [undefined, {}, { canvases: [] }, { canvases: 'nope' }]) {
      const loaded = hydrateFromServer({ data }, SIZE, 'Fallback')
      assert.equal(loaded.canvases.length, 1)
      assert.deepEqual(loaded.canvases[0].elements, [])
      assert.equal(loaded.docTitle, 'Fallback')
      assert.equal(loaded.revision, 0)
    }
  })

  it('hydrateFromServer strips dead blob URLs left by older builds', () => {
    const page = { ...createDocument(SIZE)[0], elements: [imageElement('blob:dead')] }
    const loaded = hydrateFromServer({ data: { canvases: [page] } })
    assert.equal(loaded.canvases[0].elements[0].content.url, null)
  })

  it('validateForSave mirrors the server caps and flags pending uploads', () => {
    assert.equal(validateForSave({ canvases: createDocument(SIZE) }).ok, true)
    const full = Array.from({ length: MAX_ELEMENTS_PER_PAGE + 1 }, (_, i) => textElement(`e${i}`))
    const over = validateForSave({ canvases: [{ ...createDocument(SIZE)[0], elements: full }] })
    assert.equal(over.ok, false)
    assert.match(over.errors[0], /more than 200 elements/)
    const uploading = validateForSave({
      canvases: [{ ...createDocument(SIZE)[0], elements: [imageElement('blob:x')] }],
    })
    assert.match(uploading.errors.join(' '), /still uploading/)
  })
})

describe('history', () => {
  it('create → insert → undo restores the original document object', () => {
    const doc = createDocument(SIZE)
    let history = createHistory(doc)
    const inserted = insertElements(doc, doc[0].id, [textElement()])
    history = pushHistory(history, inserted)
    assert.equal(canUndo(history), true)
    history = undoHistory(history)
    // Same object, so the page id the editor is pointing at still exists.
    assert.equal(currentEntry(history), doc)
    assert.equal(canRedo(history), true)
    history = redoHistory(history)
    assert.equal(currentEntry(history), inserted)
  })

  it('pushing after an undo drops the redo branch', () => {
    const a = createDocument(SIZE)
    const b = addPage(a, SIZE)
    const c = addPage(a, { width: 10, height: 10 })
    let history = pushHistory(createHistory(a), b)
    history = undoHistory(history)
    history = pushHistory(history, c)
    assert.equal(canRedo(history), false)
    assert.deepEqual(history.stack, [a, c])
  })

  it('pushing the current entry again is a no-op', () => {
    const a = createDocument(SIZE)
    const history = createHistory(a)
    assert.equal(pushHistory(history, a), history)
  })

  it('undo and redo stop at the ends', () => {
    const history = createHistory(createDocument(SIZE))
    assert.equal(undoHistory(history), history)
    assert.equal(redoHistory(history), history)
  })

  it(`keeps at most ${HISTORY_LIMIT} entries`, () => {
    let doc = createDocument(SIZE)
    let history = createHistory(doc)
    for (let i = 0; i < HISTORY_LIMIT + 10; i += 1) {
      doc = resizeDocument(doc, { width: 100 + i, height: 100 })
      history = pushHistory(history, doc)
    }
    assert.equal(history.stack.length, HISTORY_LIMIT)
    assert.equal(currentEntry(history), doc)
  })

  it('mapHistory rewrites every entry so undo never brings back a blob URL', () => {
    const doc = createDocument(SIZE)
    const withBlob = insertElements(doc, doc[0].id, [imageElement('blob:x')])
    let history = pushHistory(createHistory(doc), withBlob)
    history = mapHistory(history, (entry) => replaceUrlInDocument(entry, 'blob:x', 'https://cdn/a.png'))
    assert.equal(history.stack[0], doc, 'entries without the URL keep identity')
    assert.equal(currentEntry(history)[0].elements[0].content.url, 'https://cdn/a.png')
  })
})
