#!/usr/bin/env node
/** Run: node --test src/utils/editorSurface.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { editorSurfaceForLibraryItem, createSurfaceForOption } from './editorSurface.js'

describe('editor surface', () => {
  it('opens a canvas in the canvas editor, never the presentation editor', () => {
    assert.equal(editorSurfaceForLibraryItem({ type: 'CANVAS', kind: 'video' }), 'canvas')
    assert.equal(editorSurfaceForLibraryItem({ projectType: 'CANVAS' }), 'canvas')
    assert.equal(editorSurfaceForLibraryItem({ kind: 'canvas', type: 'PRESENTATION' }), 'canvas')
    assert.equal(editorSurfaceForLibraryItem({ category: 'design' }), 'canvas')
    assert.notEqual(editorSurfaceForLibraryItem({ type: 'CANVAS' }), 'presentation')
  })

  it('keeps presentations on the PPT editor and videos on the video editor', () => {
    assert.equal(editorSurfaceForLibraryItem({ type: 'PRESENTATION' }), 'presentation')
    assert.equal(editorSurfaceForLibraryItem({ type: 'VIDEO' }), 'video')
    assert.equal(editorSurfaceForLibraryItem({ kind: 'image' }), 'image')
  })

  it('starts a new design in the canvas builder, not the PPT flow', () => {
    assert.equal(createSurfaceForOption('image-editor'), 'canvas')
    assert.equal(createSurfaceForOption('ppt-ai'), 'presentation')
    assert.equal(createSurfaceForOption('ppt-builder'), 'presentation')
    assert.equal(createSurfaceForOption('image-ai'), 'image')
    assert.notEqual(createSurfaceForOption('image-editor'), 'presentation')
  })
})
