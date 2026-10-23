#!/usr/bin/env node
/** Run: node --test src/utils/assignSlideNotify.flow.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { assignmentRequest } from './assignmentFlow.js'
import { runAssignSlideNotifyPath } from './assignSlideNotify.flow.js'

const WS = 'ws_1'
const PPT = 'ppt_1'
const SLIDE = 's1'
const ASSIGNEE = 'u2'

describe('Assign slide → notify (safety path)', () => {
  it('assigns the slide then puts an unread SLIDE_ASSIGNED item in the assignee inbox', async () => {
    const calls = []
    const inbox = []
    const api = {
      frontendUrl: 'https://app.example',
      workspace: { id: WS, name: 'Acme' },
      project: { id: PPT, workspaceId: WS, name: 'Pitch' },
      async updateSlideAssignee(workspaceId, presentationId, slideId, assigneeId) {
        calls.push({ workspaceId, presentationId, slideId, body: assignmentRequest(assigneeId) })
        return {
          slide: {
            id: slideId,
            assignedToId: assigneeId,
            order: 0,
            assignee: { id: assigneeId, name: 'Priya' },
          },
        }
      },
    }

    const out = await runAssignSlideNotifyPath({
      api,
      workspaceId: WS,
      presentationId: PPT,
      slideId: SLIDE,
      actor: { id: 'admin', name: 'Ankit' },
      assigneeId: ASSIGNEE,
      slides: [{ id: SLIDE, title: 'Title', assignee: null }],
      members: [{ user: { id: ASSIGNEE, name: 'Priya' } }],
      inbox,
    })

    assert.deepEqual(calls[0].body, { assigneeId: ASSIGNEE })
    assert.equal(out.assign.result.slide.assignee.id, ASSIGNEE)
    assert.equal(out.inboxItem.type, 'SLIDE_ASSIGNED')
    assert.equal(out.inboxItem.userId, ASSIGNEE)
    assert.match(out.inboxItem.metadata.actionUrl, new RegExp(`/presentations/${PPT}\\?slide=${SLIDE}`))
    assert.equal(out.visible.length, 1)
    assert.equal(out.unread, 1)
  })
})
