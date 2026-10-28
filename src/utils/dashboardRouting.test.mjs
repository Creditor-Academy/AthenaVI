#!/usr/bin/env node
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  DASHBOARD_SECTIONS,
  normalizeClientPath,
  readClientPath,
  resolveDashboardSectionFromPath,
  dashboardPathForSection,
  isValidSettingsTab,
  resolveSettingsTabFromSearch,
  isDashboardClientPath,
} from './dashboardRouting.js'

describe('dashboardRouting', () => {
  beforeEach(() => {
    globalThis.window = {
      location: { pathname: '/', search: '', hash: '' },
      history: { replaceState() {}, state: null },
    }
  })

  it('keeps shipped product sections in the dashboard map', () => {
    for (const section of [
      'canvas-editor',
      'image-ai',
      'image-editor',
      'ppt-ai',
      'editor',
      'admin-portal',
      'brandkits',
      'credits',
      'workspace',
    ]) {
      assert.ok(DASHBOARD_SECTIONS.has(section), `missing section ${section}`)
    }
  })

  it('normalizes hash routes and maps /dashboard/* slugs', () => {
    assert.equal(normalizeClientPath('/dashboard/settings/?tab=x'), '/dashboard/settings')
    assert.equal(readClientPath('/ignored', '#/dashboard/canvas-editor'), '/dashboard/canvas-editor')
    assert.equal(resolveDashboardSectionFromPath('/dashboard/canvas-editor'), 'canvas-editor')
    assert.equal(resolveDashboardSectionFromPath('/dashboard/image-ai'), 'image-ai')
    assert.equal(resolveDashboardSectionFromPath('/dashboard/videos'), 'my-work')
    assert.equal(resolveDashboardSectionFromPath('/profile'), 'profile')
    assert.equal(resolveDashboardSectionFromPath('/support'), 'help')
    assert.equal(resolveDashboardSectionFromPath('/login'), null)
  })

  it('builds dashboard paths and settings tabs', () => {
    assert.equal(dashboardPathForSection('home'), '/dashboard')
    assert.equal(dashboardPathForSection('canvas-editor'), '/dashboard/canvas-editor')
    assert.equal(isValidSettingsTab('security'), true)
    assert.equal(isValidSettingsTab('nope'), false)
    assert.equal(resolveSettingsTabFromSearch('?tab=security'), 'security')
    assert.equal(resolveSettingsTabFromSearch(''), 'preferences')
    assert.equal(isDashboardClientPath('/dashboard/editor'), true)
    assert.equal(isDashboardClientPath('/login'), false)
  })
})
