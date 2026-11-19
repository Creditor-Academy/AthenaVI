#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isChunkLoadError, reloadOnceForNewVersion } from './lazyWithReload.js'

function fakeStorage(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
  }
}

describe('reload once after a deploy removed the page files', () => {
  it('recognises failed downloads of app files in Chrome, Firefox and Safari wording', () => {
    assert.ok(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/Dashboard-abc.js')))
    assert.ok(isChunkLoadError(new TypeError('error loading dynamically imported module')))
    assert.ok(isChunkLoadError(new TypeError('Importing a module script failed.')))
    assert.ok(isChunkLoadError(new Error('Unable to preload CSS for /assets/Dashboard-abc.css')))
    assert.equal(isChunkLoadError(new Error('Cannot read properties of undefined')), false)
    assert.equal(isChunkLoadError(null), false)
  })

  it('reloads the first time, not again within 10 seconds, and again later', () => {
    const storage = fakeStorage()
    let reloads = 0
    const location = { reload: () => (reloads += 1) }
    assert.equal(reloadOnceForNewVersion({ storage, location, now: 1_000_000 }), true)
    assert.equal(reloadOnceForNewVersion({ storage, location, now: 1_005_000 }), false)
    assert.equal(reloads, 1)
    assert.equal(reloadOnceForNewVersion({ storage, location, now: 1_020_000 }), true)
    assert.equal(reloads, 2)
  })

  it('never reloads when storage is blocked (it could loop)', () => {
    let reloads = 0
    const storage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {},
    }
    assert.equal(reloadOnceForNewVersion({ storage, location: { reload: () => (reloads += 1) } }), false)
    assert.equal(reloads, 0)
  })
})
