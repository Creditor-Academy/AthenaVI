#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { canManageAsset, shouldShowUploader } from './assetPermissions.js'

describe('assetPermissions', () => {
  it('lets the signed-in owner manage assets in a personal workspace', () => {
    assert.equal(
      canManageAsset({ id: 'a1' }, { type: 'personal', isPersonal: true }, 'u1'),
      true
    )
    assert.equal(Boolean(canManageAsset({ id: 'a1' }, { type: 'personal' }, '')), false)
  })

  it('lets team owners and admins manage any asset, and members only their uploads', () => {
    const team = { type: 'TEAM', role: 'MEMBER' }
    assert.equal(canManageAsset({ uploadedBy: 'u1' }, team, 'u1'), true)
    assert.equal(canManageAsset({ uploadedBy: 'other' }, team, 'u1'), false)
    assert.equal(
      canManageAsset({ uploadedBy: 'other' }, { type: 'TEAM', role: 'ADMIN' }, 'u1'),
      true
    )
    assert.equal(
      canManageAsset({ uploadedBy: 'other' }, { type: 'WORKSPACE', role: 'OWNER' }, 'u1'),
      true
    )
  })

  it('shows the uploader only on team workspaces', () => {
    assert.equal(shouldShowUploader({ type: 'TEAM' }), true)
    assert.equal(shouldShowUploader({ type: 'workspace' }), true)
    assert.equal(shouldShowUploader({ type: 'personal' }), false)
  })
})
