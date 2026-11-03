#!/usr/bin/env node
/** Run: node --test src/services/uploadTracker.test.mjs */
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import {
  dismissTrackedUpload,
  failTrackedUpload,
  finishTrackedUpload,
  getTrackedUploads,
  mediaKindOf,
  setTrackedProgress,
  startTrackedUpload,
  subscribeToUploads,
} from './uploadTracker.js'

describe('upload tracker', () => {
  it('tracks progress, completion and removal', () => {
    mock.timers.enable({ apis: ['setTimeout'] })
    let notified = 0
    const unsubscribe = subscribeToUploads(() => { notified += 1 })
    const id = startTrackedUpload({ name: 'clip.mp4', size: 2048, type: 'video/mp4' })
    let item = getTrackedUploads().find((u) => u.id === id)
    assert.deepEqual([item.status, item.kind, item.progress], ['uploading', 'video', 0])
    setTrackedProgress(id, 0.4)
    setTrackedProgress(id, 0.401) // same whole percent: no extra update
    assert.equal(getTrackedUploads().find((u) => u.id === id).progress, 0.4)
    finishTrackedUpload(id)
    item = getTrackedUploads().find((u) => u.id === id)
    assert.deepEqual([item.status, item.progress], ['done', 1])
    setTrackedProgress(id, 0.2) // late progress after completion is ignored
    assert.equal(getTrackedUploads().find((u) => u.id === id).progress, 1)
    mock.timers.tick(3000)
    assert.equal(getTrackedUploads().some((u) => u.id === id), false)
    assert.ok(notified >= 4)
    unsubscribe()
    mock.timers.reset()
  })

  it('keeps a failed upload with its message until dismissed', () => {
    const id = startTrackedUpload({ name: 'photo.png', size: 10, type: 'image/png' })
    failTrackedUpload(id, 'File too large (max 1 GB)')
    const item = getTrackedUploads().find((u) => u.id === id)
    assert.deepEqual([item.status, item.error], ['error', 'File too large (max 1 GB)'])
    dismissTrackedUpload(id)
    assert.equal(getTrackedUploads().some((u) => u.id === id), false)
  })

  it('classifies files by type', () => {
    assert.equal(mediaKindOf({ type: 'audio/mpeg' }), 'audio')
    assert.equal(mediaKindOf({ type: 'image/webp' }), 'image')
    assert.equal(mediaKindOf({ type: '' }), 'image')
  })
})
