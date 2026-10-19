#!/usr/bin/env node
/** Run: node --test src/pages/Slides/AIPptComponents/pptGenerateHappyPath.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runPptGenerateHappyPath } from './pptGenerateHappyPath.js'

function mockPptApi() {
  const calls = []
  let statusTick = 0
  return {
    calls,
    async createPresentation(workspaceId, body) {
      calls.push({ op: 'createPresentation', workspaceId, body })
      return { id: 'ppt_1', title: body.title }
    },
    async createOutline(workspaceId, presentationId, body) {
      calls.push({ op: 'createOutline', workspaceId, presentationId, body })
      return {
        presentation: { title: 'Q3 Review' },
        outline: {
          slides: [
            { id: 's1', title: 'Title', summary: 'Open' },
            { id: 's2', title: 'Agenda', summary: 'Plan' },
            { id: 's3', title: 'Results', summary: 'Numbers' },
            { id: 's4', title: 'Plan', summary: 'Next' },
            { id: 's5', title: 'Close', summary: 'Thanks' },
          ],
        },
      }
    },
    async updateOutline(workspaceId, presentationId, outline) {
      calls.push({ op: 'updateOutline', workspaceId, presentationId, outline })
    },
    async setTheme() {
      calls.push({ op: 'setTheme' })
    },
    async startGenerate(workspaceId, presentationId, body) {
      calls.push({ op: 'startGenerate', workspaceId, presentationId, body })
      return { status: 'GENERATING' }
    },
    async getStatus(workspaceId, presentationId) {
      statusTick += 1
      calls.push({ op: 'getStatus', workspaceId, presentationId, tick: statusTick })
      if (statusTick < 2) return { status: 'GENERATING', progress: 40 }
      return { status: 'READY', progress: 100 }
    },
    async getPresentation(workspaceId, presentationId) {
      calls.push({ op: 'getPresentation', workspaceId, presentationId })
      return {
        id: presentationId,
        title: 'Q3 Review',
        status: 'READY',
        slides: [
          { id: 's1', title: 'Title', status: 'READY', elements: { elements: [{ id: 'e1', type: 'text' }] } },
          { id: 's2', title: 'Agenda', status: 'READY' },
          { id: 's3', title: 'Results', status: 'READY' },
          { id: 's4', title: 'Plan', status: 'READY' },
          { id: 's5', title: 'Close', status: 'READY' },
        ],
      }
    },
  }
}

describe('PPT generate happy path', () => {
  it('submits the wizard, polls to READY, and hands slides to the editor', async () => {
    const api = mockPptApi()
    const result = await runPptGenerateHappyPath({
      api,
      wizard: {
        workspaceId: 'ws_1',
        folderId: 'folder_1',
        prompt: 'Quarterly business review for Q3',
        slideCount: 5,
        config: {
          title: 'Q3 Review',
          prompt: 'Quarterly business review for Q3',
          slides: 5,
          locale: 'en',
          themeMode: 'template',
        },
      },
    })

    assert.equal(api.calls[0].op, 'createPresentation')
    assert.equal(api.calls[1].op, 'createOutline')
    assert.equal(api.calls[2].op, 'updateOutline')
    assert.equal(api.calls[3].op, 'startGenerate')
    assert.ok(api.calls.some((c) => c.op === 'getStatus'))
    assert.equal(api.calls.at(-1).op, 'getPresentation')

    assert.equal(result.presentationId, 'ppt_1')
    assert.equal(result.status.status, 'READY')
    assert.equal(result.slides.length, 5)
    assert.equal(result.slides[0].title, 'Title')
    assert.equal(result.outlineCards.length, 5)
  })
})
