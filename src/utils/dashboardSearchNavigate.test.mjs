#!/usr/bin/env node
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  DASHBOARD_SEARCH_CONTEXT_KEY,
  setDashboardSearchContext,
  peekDashboardSearchContext,
  consumeDashboardSearchContext,
  saveWorkspaceSearchTarget,
  applySearchResult,
} from './dashboardSearchNavigate.js'

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    map,
  }
}

describe('dashboardSearchNavigate', () => {
  beforeEach(() => {
    globalThis.sessionStorage = memoryStorage()
  })

  it('stores, peeks, and consumes context for the matching section only', () => {
    setDashboardSearchContext({ section: 'settings', settingsTab: 'security' })
    assert.equal(peekDashboardSearchContext().settingsTab, 'security')
    assert.equal(consumeDashboardSearchContext('help'), null)
    const ctx = consumeDashboardSearchContext('settings')
    assert.equal(ctx.settingsTab, 'security')
    assert.equal(peekDashboardSearchContext(), null)
  })

  it('saves a workspace or folder target for later restore', () => {
    saveWorkspaceSearchTarget({
      workspace: { id: 'w1', name: 'Team' },
      folder: { id: 'f1', name: 'Decks' },
    })
    const stored = JSON.parse(sessionStorage.getItem('workspaceCurrentLevel'))
    assert.equal(stored.type, 'folder')
    assert.equal(stored.id, 'f1')
  })

  it('routes search results through the matching action handlers', () => {
    const visited = []
    const goToSection = (section) => visited.push(section)

    applySearchResult(
      { title: 'Q3', action: { type: 'editVideo', video: { id: 'v1' } } },
      { goToSection, handleEditVideo: (video) => visited.push(`edit:${video.id}`) }
    )
    assert.deepEqual(visited, ['edit:v1'])

    applySearchResult(
      { title: 'Billing', action: { type: 'openSettings', tab: 'billing' } },
      { goToSection }
    )
    assert.equal(visited.at(-1), 'settings')
    assert.equal(peekDashboardSearchContext().settingsTab, 'billing')

    applySearchResult(
      {
        title: 'Design',
        action: { type: 'navigate', section: 'workspace', workspace: { id: 'w1' } },
      },
      { goToSection }
    )
    assert.equal(visited.at(-1), 'workspace')
  })
})
