#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { cssPaintString } from './presentationHelpers.js'

describe('cssPaintString', () => {
  it('passes CSS filter strings through and drops objects that would crash React', () => {
    assert.equal(cssPaintString('grayscale(1)'), 'grayscale(1)')
    assert.equal(cssPaintString({ brightness: 1 }), undefined)
    assert.equal(cssPaintString('none'), undefined)
    assert.equal(cssPaintString(''), undefined)
    assert.equal(cssPaintString(null), undefined)
  })
})
