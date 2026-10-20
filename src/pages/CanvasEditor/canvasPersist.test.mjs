#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasPersist.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { canOpenCanvasEditor, flushCanvasSave, reopenView } from './canvasPersist.js'
import { serializeForSave, hydrateFromServer, createDocument, addPage } from './canvasDocument.js'
import { normalizeLibraryItem } from '../../utils/workspaceLibrary.js'
import { relocateProjectInWorkspaces } from '../TeamWorkspace/workspaceUtils.js'
import { nextThumbnail } from './canvasThumbnail.js'

const SIZE = { width: 1080, height: 1080 }

describe('canvas folder policy', () => {
  it('blocks a new design until a workspace folder is chosen', () => {
    assert.equal(canOpenCanvasEditor({ workspaceId: 'ws' }), false)
    assert.equal(canOpenCanvasEditor({ workspaceId: 'ws', folderId: '' }), false)
    assert.equal(canOpenCanvasEditor({ folderId: 'folder-a' }), false)
    assert.equal(canOpenCanvasEditor({ workspaceId: 'ws', folderId: 'folder-a' }), true)
  })

  it('reopens an existing canvas without asking for a folder again', () => {
    assert.equal(canOpenCanvasEditor({ workspaceId: 'ws', canvasId: 'canvas-1' }), true)
  })
})

describe('flush before navigation', () => {
  it('does not report clean until the pending save has landed', async () => {
    const order = []
    let dirty = true
    let navigated = false
    const saved = await flushCanvasSave({
      clearDebounce: () => order.push('clear-debounce'),
      awaitHydrate: async () => order.push('hydrate'),
      awaitInFlight: async () => order.push('in-flight'),
      isDirty: () => dirty,
      persist: async () => {
        order.push('persist')
        dirty = false
      },
    })
    assert.deepEqual(order, ['clear-debounce', 'hydrate', 'in-flight', 'persist'])
    assert.equal(saved, true)
    if (saved) navigated = true
    assert.equal(navigated, true)
    assert.equal(dirty, false)
  })

  it('stays put when the save does not clear the document', async () => {
    const saved = await flushCanvasSave({
      isDirty: () => true,
      persist: async () => {},
    })
    assert.equal(saved, false)
  })
})

describe('reopen matches the last autosave', () => {
  it('keeps pages, size, title, elements, lock and order', () => {
    const first = {
      ...createDocument(SIZE)[0],
      background: '#111111',
      elements: [
        {
          id: 'back',
          type: 'shape',
          layer: 1,
          placement: { x: 0, y: 0, width: 100, height: 100, locked: true },
          content: { fill: '#cccccc' },
        },
        {
          id: 'title',
          type: 'text',
          layer: 2,
          locked: true,
          placement: { x: 24, y: 40, width: 400, height: 80, locked: false },
          content: { text: 'Launch' },
        },
      ],
    }
    const canvases = addPage([first], { width: 1920, height: 1080 })
    const payload = serializeForSave({ canvases, docTitle: 'Launch poster', size: { width: 1920, height: 1080 } })
    const loaded = hydrateFromServer({ name: 'Launch poster', data: payload })
    assert.deepEqual(
      reopenView(loaded),
      reopenView({ canvases, docTitle: 'Launch poster', size: payload.size })
    )
    assert.equal(loaded.canvases[0].elements[0].id, 'back')
    assert.equal(loaded.canvases[0].elements[1].id, 'title')
    assert.equal(loaded.canvases[1].id, canvases[1].id)
  })
})

describe('library cover and folder move', () => {
  it('sends a cover on create and a new one after the page background changes', () => {
    const canvases = createDocument(SIZE)
    const created = nextThumbnail(canvases, null)
    assert.equal(created.changed, true)
    assert.match(created.url, /^data:image\/svg\+xml/)

    const painted = canvases.map((item, index) =>
      index === 0 ? { ...item, background: '#0F172A' } : item
    )
    const updated = nextThumbnail(painted, created.signature)
    assert.equal(updated.changed, true)
    assert.notEqual(updated.url, created.url)
  })

  it('shows the stored cover on a CANVAS library card', () => {
    const cover = 'data:image/svg+xml;charset=utf-8,%3Csvg%3E'
    const card = normalizeLibraryItem({
      id: 'canvas-1',
      type: 'CANVAS',
      name: 'Poster',
      thumbnail: cover,
      folderId: 'folder-a',
    })
    assert.equal(card.kind, 'canvas')
    assert.equal(card.type, 'CANVAS')
    assert.equal(card.thumbnail, cover)
    assert.equal(card.thumbnailUrl, cover)
  })

  it('moves a design from folder A to folder B and keeps the document', () => {
    const design = {
      id: 'canvas-1',
      type: 'CANVAS',
      name: 'Poster',
      folderId: 'folder-a',
      thumbnail: 'data:image/svg+xml,cover',
      data: { docTitle: 'Poster', canvases: [{ id: 'page-1', elements: [{ id: 'title' }] }] },
    }
    const workspaces = [
      {
        id: 'ws',
        videos: [],
        folders: [
          { id: 'folder-a', videos: [design] },
          { id: 'folder-b', videos: [] },
        ],
      },
    ]
    const moved = relocateProjectInWorkspaces(workspaces, {
      workspaceId: 'ws',
      project: design,
      targetFolderId: 'folder-b',
    })
    const folderA = moved[0].folders.find((folder) => folder.id === 'folder-a')
    const folderB = moved[0].folders.find((folder) => folder.id === 'folder-b')
    assert.equal(folderA.videos.length, 0)
    assert.equal(folderB.videos.length, 1)
    assert.equal(folderB.videos[0].id, 'canvas-1')
    assert.equal(folderB.videos[0].folderId, 'folder-b')
    assert.deepEqual(folderB.videos[0].data, design.data)
    assert.equal(folderB.videos[0].thumbnail, design.thumbnail)
  })
})
