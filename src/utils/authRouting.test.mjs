#!/usr/bin/env node
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  OAUTH_CALLBACK_PATHS,
  normalizePathname,
  getOAuthAccessTokenFromUrl,
  getOAuthErrorFromUrl,
  isOAuthCallbackPath,
  isPublicPresentationPath,
  getPublicPresentationToken,
  resolveViewFromLocation,
} from './authRouting.js'

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  }
}

function installWindow({ pathname = '/', search = '', hash = '', view = 'landing' } = {}) {
  const localStorage = memoryStorage()
  localStorage.setItem('athenavi:view', view)
  globalThis.window = {
    location: { pathname, search, hash },
    history: { replaceState() {}, state: null },
    localStorage,
  }
}

describe('authRouting', () => {
  beforeEach(() => installWindow())

  it('normalizes trailing slashes', () => {
    assert.equal(normalizePathname(''), '/')
    assert.equal(normalizePathname('/login/'), '/login')
    assert.equal(normalizePathname('/'), '/')
  })

  it('recognizes Google OAuth callback paths', () => {
    assert.ok(OAUTH_CALLBACK_PATHS.has('/auth/google/callback'))
    assert.equal(isOAuthCallbackPath('/auth/google/callback/'), true)
    assert.equal(isOAuthCallbackPath('/dashboard'), false)
  })

  it('reads the access token from hash or query', () => {
    installWindow({ pathname: '/auth/callback', hash: '#access_token=tok_hash' })
    assert.equal(getOAuthAccessTokenFromUrl(), 'tok_hash')

    installWindow({ pathname: '/auth/callback', search: '?access_token=tok_query' })
    assert.equal(getOAuthAccessTokenFromUrl(), 'tok_query')
  })

  it('reads OAuth errors from the query string', () => {
    installWindow({ search: '?error=access_denied' })
    assert.equal(getOAuthErrorFromUrl(), 'access_denied')
  })

  it('extracts public presentation tokens from /p/:token', () => {
    installWindow({ pathname: '/p/share-abc' })
    assert.equal(isPublicPresentationPath('/p/share-abc'), true)
    assert.equal(getPublicPresentationToken('/p/share-abc'), 'share-abc')
    installWindow({ pathname: '/dashboard' })
    assert.equal(getPublicPresentationToken('/dashboard'), '')
  })

  it('resolves views for OAuth, public decks, dashboard aliases, and stored fallback', () => {
    const map = { '/dashboard': 'dashboard', '/login': 'login' }

    installWindow({ pathname: '/auth/google/callback', hash: '#access_token=abc' })
    assert.equal(resolveViewFromLocation(map), 'google-callback')

    installWindow({ pathname: '/login', search: '?error=access_denied' })
    assert.equal(resolveViewFromLocation(map), 'login')

    installWindow({ pathname: '/p/deck-1' })
    assert.equal(resolveViewFromLocation(map), 'public-presentation')

    installWindow({ pathname: '/dashboard' })
    assert.equal(resolveViewFromLocation(map), 'dashboard')

    installWindow({ pathname: '/slides/ppt-ai' })
    assert.equal(resolveViewFromLocation(map), 'dashboard')

    installWindow({ pathname: '/share/x', view: 'landing' })
    assert.equal(resolveViewFromLocation(map), 'share')

    installWindow({ pathname: '/unknown', view: 'landing' })
    assert.equal(resolveViewFromLocation(map), 'landing')
  })
})
