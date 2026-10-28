#!/usr/bin/env node
/** Run: node --test src/utils/canvasLibrary.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { canvasCopyName, canvasDuplicateRequest, libraryEditorTarget } from './canvasLibrary.js'
import { editorSurfaceForLibraryItem } from './editorSurface.js'
import { hydrateFromServer } from '../pages/CanvasEditor/canvasDocument.js'
import { workspaceFolderLevel } from './navigateToWorkspaceFolder.js'
import { classifySaveError, haltsAutosave, SAVE_ERROR } from '../pages/CanvasEditor/canvasSaveErrors.js'

const page = {
  id: 'page-1',
  width: 1080,
  height: 1080,
  background: '#fff',
  elements: [
    {
      id: 'el-1',
      type: 'text',
      layer: 1,
      placement: { x: 10, y: 20, width: 100, height: 40, locked: true },
      content: { text: 'Launch' },
    },
  ],
}

describe('canvas library actions', () => {
  it('names a duplicate “<name> (copy)” and copies the document and cover', () => {
    const request = canvasDuplicateRequest({
      name: 'Launch poster',
      folderId: 'folder-a',
      thumbnail: 'data:image/svg+xml,cover',
      data: { version: 1, docTitle: 'Launch poster', size: { width: 1080, height: 1080 }, canvases: [page] },
    })
    assert.equal(request.name, 'Launch poster (copy)')
    assert.equal(canvasCopyName(''), 'Untitled Design (copy)')
    assert.equal(request.folderId, 'folder-a')
    assert.equal(request.thumbnail, 'data:image/svg+xml,cover')
    assert.equal(request.data.canvases[0].elements[0].content.text, 'Launch')
    assert.equal(request.data.canvases[0].elements[0].placement.locked, true)
  })

  it('reopen uses the renamed project name in the header', () => {
    const loaded = hydrateFromServer(
      {
        name: 'Renamed design',
        data: { docTitle: 'Old title', size: { width: 1080, height: 1080 }, canvases: [page] },
      },
      { width: 1080, height: 1080 }
    )
    assert.equal(loaded.docTitle, 'Renamed design')
    assert.equal(loaded.canvases[0].id, 'page-1')
    assert.equal(loaded.canvases[0].elements[0].placement.locked, true)
  })

  it('search and notification rows for a canvas open the canvas editor', () => {
    const fromSearch = libraryEditorTarget({ id: 'c1', type: 'CANVAS', name: 'Poster' })
    const fromNotice = libraryEditorTarget({ videoId: 'c1', projectType: 'CANVAS' })
    assert.equal(editorSurfaceForLibraryItem(fromSearch), 'canvas')
    assert.equal(editorSurfaceForLibraryItem(fromNotice), 'canvas')
    assert.equal(fromNotice.id, 'c1')
    assert.notEqual(editorSurfaceForLibraryItem(fromSearch), 'presentation')
  })

  it('leaving the editor returns to the folder that holds the design', () => {
    const level = workspaceFolderLevel({
      workspaceId: 'ws-1',
      folderId: 'folder-b',
      workspace: 'Studio',
      folder: 'Campaigns',
    })
    assert.equal(level.type, 'folder')
    assert.equal(level.id, 'folder-b')
    assert.equal(level.folder.name, 'Campaigns')
  })

  it('a deleted design stops autosave with the not-found recovery, not a retry', () => {
    const kind = classifySaveError({ status: 404 })
    assert.equal(kind, SAVE_ERROR.NOT_FOUND)
    assert.equal(haltsAutosave(kind), true)
  })
})
