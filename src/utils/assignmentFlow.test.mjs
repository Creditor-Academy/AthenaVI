#!/usr/bin/env node
/** Run: node --test src/utils/assignmentFlow.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  canManageAssignment,
  assignmentRequest,
  currentAssigneeId,
  resolveMemberUserId,
  beginAssignSlide,
  rollbackAssignSlide,
  executeAssignProject,
  executeAssignScene,
  executeAssignSlide,
} from './assignmentFlow.js'

const members = [
  { userId: 'u2', user: { id: 'u2', name: 'Priya', email: 'priya@ex.com' } },
  { id: 'u3', name: 'Sam', email: 'sam@ex.com' },
]

describe('assignment permissions', () => {
  it('only TEAM OWNER/ADMIN can assign; personal and MEMBER cannot', () => {
    assert.equal(canManageAssignment({ type: 'workspace', userRole: 'OWNER' }), true)
    assert.equal(canManageAssignment({ type: 'workspace', userRole: 'ADMIN' }), true)
    assert.equal(canManageAssignment({ type: 'workspace', userRole: 'MEMBER' }), false)
    assert.equal(canManageAssignment({ type: 'personal', userRole: 'OWNER' }), false)
  })
})

describe('member and payload helpers', () => {
  it('sends only assigneeId on the dedicated endpoint body', () => {
    assert.deepEqual(assignmentRequest('u2'), { assigneeId: 'u2' })
    assert.deepEqual(assignmentRequest(null), { assigneeId: null })
  })

  it('reads the current assignee from either nested user or assignedToId', () => {
    assert.equal(currentAssigneeId({ assignee: { id: 'u2' } }), 'u2')
    assert.equal(currentAssigneeId({ assignedToId: 'u9' }), 'u9')
    assert.equal(currentAssigneeId({}), null)
  })

  it('resolves workspace member ids the picker rows use', () => {
    assert.equal(resolveMemberUserId(members[0]), 'u2')
    assert.equal(resolveMemberUserId(members[1]), 'u3')
  })
})

describe('Assign project', () => {
  it('PATCHes the project assignee and unassign sends null', async () => {
    const calls = []
    const updateProjectAssignee = async (workspaceId, projectId, assigneeId) => {
      calls.push({ workspaceId, projectId, body: assignmentRequest(assigneeId) })
      return {
        id: projectId,
        assignee: assigneeId ? { id: assigneeId, name: 'Priya' } : null,
      }
    }

    const assigned = await executeAssignProject({
      updateProjectAssignee,
      workspaceId: 'ws_1',
      projectId: 'proj_1',
      assigneeId: 'u2',
    })
    assert.deepEqual(calls[0], {
      workspaceId: 'ws_1',
      projectId: 'proj_1',
      body: { assigneeId: 'u2' },
    })
    assert.equal(assigned.assignee.id, 'u2')

    const cleared = await executeAssignProject({
      updateProjectAssignee,
      workspaceId: 'ws_1',
      projectId: 'proj_1',
      assigneeId: null,
    })
    assert.equal(calls[1].body.assigneeId, null)
    assert.equal(cleared.assignee, null)
  })

  it('does not call the API when ids are missing', async () => {
    let called = 0
    await assert.rejects(
      () =>
        executeAssignProject({
          updateProjectAssignee: async () => {
            called += 1
          },
          workspaceId: 'ws_1',
          projectId: '',
          assigneeId: 'u2',
        }),
      /Missing workspace or project/
    )
    assert.equal(called, 0)
  })
})

describe('Assign scene', () => {
  it('PATCHes the scene and returns the editor patch', async () => {
    const calls = []
    const patch = await executeAssignScene({
      updateSceneAssignee: async (workspaceId, projectId, sceneId, assigneeId) => {
        calls.push({ workspaceId, projectId, sceneId, body: assignmentRequest(assigneeId) })
        return {
          id: sceneId,
          assignee: { id: assigneeId, name: 'Priya' },
          assignedBy: { id: 'admin', name: 'Ankit' },
          assignedAt: '2026-10-20T00:00:00.000Z',
        }
      },
      workspaceId: 'ws_1',
      projectId: 'vid_1',
      sceneId: 'sc_1',
      assigneeId: 'u2',
    })
    assert.equal(calls[0].sceneId, 'sc_1')
    assert.deepEqual(calls[0].body, { assigneeId: 'u2' })
    assert.equal(patch.assignee.id, 'u2')
    assert.equal(patch.assignedBy.name, 'Ankit')
  })
})

describe('Assign slide (PPT editor)', () => {
  const slides = [
    { id: 's1', title: 'Title', assignee: { id: 'u9', name: 'Old' } },
    { id: 's2', title: 'Agenda', assignee: null },
  ]

  it('optimistically shows the member then keeps the server slide', async () => {
    const started = beginAssignSlide(slides, 's1', 'u2', members)
    assert.equal(started.previousAssignee.id, 'u9')
    assert.equal(started.slides[0].assignee.name, 'Priya')
    assert.equal(started.slides[1].assignee, null)

    const calls = []
    const out = await executeAssignSlide({
      updateSlideAssignee: async (workspaceId, presentationId, slideId, assigneeId) => {
        calls.push({ workspaceId, presentationId, slideId, body: assignmentRequest(assigneeId) })
        return {
          slide: {
            id: slideId,
            assignee: { id: assigneeId, name: 'Priya' },
            assignedBy: { id: 'admin' },
            assignedAt: '2026-10-20T00:00:00.000Z',
          },
        }
      },
      workspaceId: 'ws_1',
      presentationId: 'ppt_1',
      slideId: 's1',
      assigneeId: 'u2',
      slides,
      members,
    })
    assert.deepEqual(calls[0].body, { assigneeId: 'u2' })
    assert.equal(out.result.slide.assignee.id, 'u2')
    assert.equal(out.rolledBack, false)
  })

  it('rolls the previous assignee back when the dedicated endpoint fails', async () => {
    await assert.rejects(
      async () => {
        try {
          await executeAssignSlide({
            updateSlideAssignee: async () => {
              throw new Error('Failed to update slide assignee')
            },
            workspaceId: 'ws_1',
            presentationId: 'ppt_1',
            slideId: 's1',
            assigneeId: 'u2',
            slides,
            members,
          })
        } catch (err) {
          assert.equal(err.rolledBackSlides[0].assignee.id, 'u9')
          throw err
        }
      },
      /Failed to update slide assignee/
    )
  })

  it('unassign clears the optimistic assignee', () => {
    const started = beginAssignSlide(slides, 's1', null, members)
    assert.equal(started.slides[0].assignee, null)
    const rolled = rollbackAssignSlide(started.slides, 's1', started.previousAssignee)
    assert.equal(rolled[0].assignee.id, 'u9')
  })
})
