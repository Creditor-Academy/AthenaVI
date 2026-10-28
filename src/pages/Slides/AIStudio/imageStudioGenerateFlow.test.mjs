#!/usr/bin/env node
/** Run: node --test src/pages/Slides/AIStudio/imageStudioGenerateFlow.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  TWEAK_INSTRUCTION_MAX,
  canStartGenerate,
  canApplyTweak,
  buildImageGenerateBody,
  runGenerateThenTweak,
} from './imageStudioGenerateFlow.js'

describe('Image Studio generate then tweak', () => {
  it('blocks generate without a folder or prompt', () => {
    assert.equal(canStartGenerate({ workspaceId: 'w1', isGenerating: false }).ok, false)
    assert.match(canStartGenerate({ workspaceId: 'w1', folderId: 'f1', prompt: '  ' }).error, /prompt/)
  })

  it('blocks tweak when the model cannot edit or the instruction is too long', () => {
    const base = {
      workspaceId: 'w1',
      activeGeneration: { id: 'g1' },
      instruction: 'warmer light',
    }
    assert.match(canApplyTweak({ ...base, supportsEdit: false }).error, /does not support/)
    assert.match(
      canApplyTweak({ ...base, instruction: 'x'.repeat(TWEAK_INSTRUCTION_MAX + 1) }).error,
      /too long/
    )
  })

  it('starts generate then applies a tweak without throwing, with the image-gen API mocked', async () => {
    const calls = []
    const api = {
      async generate(workspaceId, body) {
        calls.push({ op: 'generate', workspaceId, body })
        return {
          generation: {
            id: 'gen_1',
            url: 'https://cdn.example/gen_1.png',
            prompt: body.prompt,
          },
          thread: { id: 'thread_1' },
        }
      },
      async tweak(workspaceId, generationId, instruction) {
        calls.push({ op: 'tweak', workspaceId, generationId, instruction })
        return {
          generation: {
            id: 'gen_2',
            parentId: generationId,
            url: 'https://cdn.example/gen_2.png',
            prompt: instruction,
          },
        }
      },
    }

    const result = await runGenerateThenTweak({
      api,
      workspaceId: 'ws_1',
      generateInput: {
        folderId: 'folder_1',
        modelId: 'gemini-flash',
        formatId: 'square',
        styleId: 'minimal',
        prompt: 'A city skyline at dusk',
      },
      tweakInstruction: 'Make the sky warmer',
    })

    assert.equal(calls[0].op, 'generate')
    assert.equal(calls[0].body.prompt, 'A city skyline at dusk')
    assert.equal(calls[0].body.folderId, 'folder_1')
    assert.equal(calls[1].op, 'tweak')
    assert.equal(calls[1].generationId, 'gen_1')
    assert.equal(calls[1].instruction, 'Make the sky warmer')

    assert.equal(result.thread.length, 2)
    assert.equal(result.thread[0].kind, 'generate')
    assert.equal(result.thread[0].status, 'done')
    assert.equal(result.thread[1].kind, 'tweak')
    assert.equal(result.thread[1].status, 'done')
    assert.equal(result.generation.id, 'gen_2')
    assert.equal(result.generation.url, 'https://cdn.example/gen_2.png')
  })

  it('builds the same generate body the studio posts', () => {
    const body = buildImageGenerateBody({
      mode: 'image',
      folderId: 'f1',
      modelId: 'm1',
      styleId: 'flat',
      prompt: '  hello  ',
    })
    assert.equal(body.formatId, 'square')
    assert.equal(body.prompt, 'hello')
    assert.equal(body.style, 'flat')
  })

  it('throws when generate returns no generation', async () => {
    await assert.rejects(
      () =>
        runGenerateThenTweak({
          api: {
            async generate() {
              return { thread: { id: 't1' } }
            },
          },
          workspaceId: 'ws_1',
          generateInput: { folderId: 'f1', prompt: 'A lake' },
          tweakInstruction: 'warmer',
        }),
      /Generate returned no generation/
    )
  })

  it('throws when the generate API fails', async () => {
    await assert.rejects(
      () =>
        runGenerateThenTweak({
          api: {
            async generate() {
              throw new Error('quota exceeded')
            },
          },
          workspaceId: 'ws_1',
          generateInput: { folderId: 'f1', prompt: 'A lake' },
          tweakInstruction: 'warmer',
        }),
      /quota exceeded/
    )
  })
})
