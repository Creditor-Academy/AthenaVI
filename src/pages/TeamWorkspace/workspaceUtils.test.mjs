#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeId,
  extractUserId,
  readRole,
  normalizeWorkspace,
  normalizeVideo,
  normalizeFolder,
  workspaceCanEdit,
  workspaceCanManageContributors,
  hasConflictingName,
  getRenameSiblingNames,
  findVideoLocation,
} from './workspaceUtils.js'

describe('workspaceUtils', () => {
  it('normalizes ids from strings and objects', () => {
    assert.equal(normalizeId('abc'), 'abc')
    assert.equal(normalizeId({ _id: 'obj1' }), 'obj1')
    assert.equal(normalizeId(null), '')
    assert.equal(extractUserId({ userId: 'u1' }), 'u1')
  })

  it('treats personal workspaces as OWNER and names them from the auth user', () => {
    const ws = normalizeWorkspace(
      { id: 'w1', type: 'PERSONAL', name: 'Personal' },
      'u1',
      { name: 'Ankit Kumar' }
    )
    assert.equal(ws.type, 'personal')
    assert.equal(ws.userRole, 'OWNER')
    assert.equal(ws.name, "Ankit's Personal")
    assert.equal(workspaceCanEdit(ws), true)
    assert.equal(workspaceCanManageContributors(ws), false)
  })

  it('lets team admins manage contributors but not viewers-as-members', () => {
    const admin = normalizeWorkspace(
      { id: 'w2', type: 'TEAM', name: 'Design', role: 'ADMIN', ownerId: 'other' },
      'u1',
      { name: 'Ankit' }
    )
    assert.equal(admin.type, 'workspace')
    assert.equal(admin.userRole, 'ADMIN')
    assert.equal(workspaceCanEdit(admin), true)
    assert.equal(workspaceCanManageContributors(admin), true)
  })

  it('detects conflicting names case-insensitively, excluding the current name', () => {
    assert.equal(hasConflictingName('Deck', ['deck', 'Other']), true)
    assert.equal(hasConflictingName('Deck', ['deck'], { excludeName: 'Deck' }), false)
    assert.equal(hasConflictingName('  ', ['deck']), false)
  })

  it('normalizes library items and finds rename siblings in the same folder', () => {
    const video = normalizeVideo(
      { _id: 'v1', type: 'CANVAS', title: '' },
      'u1',
      { name: 'You' }
    )
    assert.equal(video.id, 'v1')
    assert.equal(video.kind, 'canvas')
    assert.equal(video.name, 'Untitled Design')

    const folder = normalizeFolder({ id: 'f1', name: 'Posters', videos: [video] }, 'u1', { name: 'You' })
    assert.equal(folder.videos[0].id, 'v1')

    const workspaces = [{ id: 'w1', name: 'Team', folders: [folder] }]
    assert.deepEqual(findVideoLocation(workspaces, 'v1')?.folder?.id, 'f1')
    assert.deepEqual(
      getRenameSiblingNames(workspaces, { type: 'video', id: 'v1' }),
      []
    )
    const two = {
      id: 'w1',
      name: 'Team',
      folders: [
        {
          id: 'f1',
          name: 'Posters',
          videos: [
            { id: 'v1', name: 'A' },
            { id: 'v2', name: 'B' },
          ],
        },
      ],
    }
    assert.deepEqual(getRenameSiblingNames([two], { type: 'video', id: 'v1' }), ['B'])
  })
})
