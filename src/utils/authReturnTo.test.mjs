#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/authReturnTo.test.mjs */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { safeReturnTo, currentReturnTo, saveReturnTo, takeReturnTo, clearReturnTo } from './authReturnTo.js'

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}

describe('return to the page after sign-in', () => {
  beforeEach(() => {
    globalThis.window = {
      sessionStorage: memoryStorage(),
      location: { pathname: '/dashboard/editor', search: '?workspaceId=w1&presentationId=p1', hash: '#s2' },
    }
  })

  it('remembers the whole URL of the page (path, query and hash) and hands it back once', () => {
    assert.equal(currentReturnTo(), '/dashboard/editor?workspaceId=w1&presentationId=p1#s2')
    assert.equal(saveReturnTo(), '/dashboard/editor?workspaceId=w1&presentationId=p1#s2')
    assert.equal(takeReturnTo(), '/dashboard/editor?workspaceId=w1&presentationId=p1#s2')
    assert.equal(takeReturnTo(), null, 'used once')
  })

  it('only same-site paths: never another site, the homepage or the sign-in pages', () => {
    for (const bad of [
      'https://evil.example/x',
      '//evil.example/x',
      '/\\evil.example',
      'dashboard',
      '/',
      '/login',
      '/login/',
      '/signup?x=1',
      '/early-access',
      '/auth/google/callback#access_token=x',
      '/reset-password/tok',
      '/dashboard\n/x',
      null,
      42,
    ]) {
      assert.equal(safeReturnTo(bad), null, String(bad))
    }
    assert.equal(safeReturnTo('/create?projectId=7'), '/create?projectId=7')
    assert.equal(safeReturnTo('/settings'), '/settings')
  })

  it('is forgotten after 30 minutes, and can be cleared', () => {
    const t0 = 1_000_000
    saveReturnTo('/dashboard/brandkits', t0)
    assert.equal(takeReturnTo(t0 + 31 * 60 * 1000), null)
    saveReturnTo('/dashboard/brandkits', t0)
    assert.equal(takeReturnTo(t0 + 10 * 60 * 1000), '/dashboard/brandkits')
    saveReturnTo('/dashboard/brandkits')
    clearReturnTo()
    assert.equal(takeReturnTo(), null)
  })

  it('a tampered value is not followed', () => {
    window.sessionStorage.setItem('athenavi:returnTo', JSON.stringify({ url: '//evil.example', at: Date.now() }))
    assert.equal(takeReturnTo(), null)
    window.sessionStorage.setItem('athenavi:returnTo', '{not json')
    assert.equal(takeReturnTo(), null)
  })
})
