#!/usr/bin/env node
/**
 * Ankit pairing on Tanu's Image Studio: infographics stay a separate product
 * from PPT Path B (ENGINE_POLICY.md §5.1).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildImageGenerateBody } from './imageStudioGenerateFlow.js'

const here = dirname(fileURLToPath(import.meta.url))

describe('Image Studio vs PPT Path B boundary', () => {
  it('does not import the presentation Path B engine', () => {
    const studio = readFileSync(join(here, 'AIImageStudio.jsx'), 'utf8')
    const flow = readFileSync(join(here, 'imageStudioGenerateFlow.js'), 'utf8')
    const banned = /pathBSpec|ppt_image_path_b|diagramPathPolicy|deckGeneration\.service/
    assert.doesNotMatch(studio, banned)
    assert.doesNotMatch(flow, banned)
  })

  it('posts infographic fields without a Path B spec', () => {
    const body = buildImageGenerateBody({
      mode: 'infographic',
      folderId: 'f1',
      modelId: 'gemini-flash',
      infoLayout: 'timeline',
      styleHint: 'flat',
      prompt: 'Q3 funnel',
    })
    assert.equal(body.mode, 'infographic')
    assert.equal(body.archetypeHint, 'timeline')
    assert.equal(body.styleHint, 'flat')
    assert.equal('pathBSpec' in body, false)
    assert.equal('path_b' in body, false)
    assert.equal(body.feature, undefined)
  })
})
