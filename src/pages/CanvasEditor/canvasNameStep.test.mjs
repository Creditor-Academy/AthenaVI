#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasNameStep.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { defaultDesignName, evaluateDesignName, MAX_DESIGN_NAME_LENGTH } from './canvasNameStep.js'

const p = (name) => ({ id: name, name })

describe('defaultDesignName', () => {
  it('uses the plain name when it is free', () => {
    assert.equal(defaultDesignName([]), 'Untitled Design')
    assert.equal(defaultDesignName([p('Something else')]), 'Untitled Design')
  })

  it('appends (1), then the next free number', () => {
    assert.equal(defaultDesignName([p('Untitled Design')]), 'Untitled Design (1)')
    assert.equal(
      defaultDesignName([p('Untitled Design'), p('Untitled Design (1)')]),
      'Untitled Design (2)'
    )
  })

  it('fills the first gap and is case-insensitive', () => {
    assert.equal(
      defaultDesignName([p('untitled design'), p('UNTITLED DESIGN (1)'), p('Untitled Design (3)')]),
      'Untitled Design (2)'
    )
  })

  it('accepts bare name strings too', () => {
    assert.equal(defaultDesignName(['Untitled Design']), 'Untitled Design (1)')
  })
})

describe('evaluateDesignName', () => {
  const projects = [p('Brand Poster')]

  it('allows a unique name', () => {
    assert.equal(evaluateDesignName({ name: 'New Flyer', projects }).canContinue, true)
  })

  it('flags duplicates ignoring case and surrounding whitespace', () => {
    const r = evaluateDesignName({ name: '  brand poster ', projects })
    assert.equal(r.duplicate, true)
    assert.equal(r.canContinue, false)
  })

  it('blocks empty and whitespace-only names', () => {
    assert.equal(evaluateDesignName({ name: '   ', projects }).empty, true)
    assert.equal(evaluateDesignName({ name: '', projects }).canContinue, false)
  })

  it('blocks names over the backend limit', () => {
    const r = evaluateDesignName({ name: 'x'.repeat(MAX_DESIGN_NAME_LENGTH + 1), projects })
    assert.equal(r.tooLong, true)
    assert.equal(r.canContinue, false)
  })

  it('waits while the folder is loading and does not guess a duplicate', () => {
    const r = evaluateDesignName({ name: 'Brand Poster', projects, loading: true })
    assert.equal(r.duplicate, false)
    assert.equal(r.canContinue, false)
  })

  it('falls back to the server check when the folder list failed to load', () => {
    const r = evaluateDesignName({ name: 'Brand Poster', projects, loadFailed: true })
    assert.equal(r.duplicate, false)
    assert.equal(r.canContinue, true)
  })

  it('honours a duplicate reported by the server', () => {
    const r = evaluateDesignName({ name: 'Fresh', projects: [], serverSaysDuplicate: true })
    assert.equal(r.duplicate, true)
    assert.equal(r.canContinue, false)
  })
})
