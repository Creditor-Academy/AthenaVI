#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { applyTextFill, resolveTextHex, runDisplayStyle } from './pptTextContent.js'

const lightPalette = { bg: '#FFFFFF', text: '#0F172A', primary: '#2563EB', appearance: 'light' }
const red = { type: 'solid', color: '#FF0000' } // 4.0:1 on white — below the readability bar

describe('user-picked text colours', () => {
  it('whole-box colour is shown exactly as picked', () => {
    const content = applyTextFill({ text: 'Hello world', color: '#0F172A' }, red)
    assert.equal(content.userColor, true)
    assert.ok(content.runs.every((run) => run.userColor === true && run.color === '#FF0000'))
    assert.equal(resolveTextHex(content, lightPalette), '#FF0000')
    const style = runDisplayStyle(content.runs[0], content, lightPalette, {})
    assert.equal(style.color, '#FF0000')
  })

  it('a selected range keeps the picked colour; the rest is unchanged', () => {
    const content = applyTextFill({ text: 'Hello world', color: '#0F172A' }, red, { start: 0, end: 5 })
    const [first, second] = content.runs
    assert.equal(first.text, 'Hello')
    assert.equal(first.userColor, true)
    assert.equal(runDisplayStyle(first, content, lightPalette, {}).color, '#FF0000')
    assert.notEqual(second.userColor, true)
  })

  it('generated (non-user) low-contrast colours are still made readable', () => {
    const content = { text: 'Hi', runs: [{ text: 'Hi', color: '#FF0000' }] }
    const style = runDisplayStyle(content.runs[0], content, lightPalette, {})
    assert.notEqual(style.color, '#FF0000')
  })

  it('a gradient fill clears the user-colour flag', () => {
    const grad = { type: 'gradient', kind: 'linear', angle: 90, stops: [{ color: '#FF0000', at: 0 }, { color: '#0000FF', at: 1 }] }
    const content = applyTextFill(applyTextFill({ text: 'Hi' }, red), grad)
    assert.equal(content.userColor, false)
    assert.ok(content.runs.every((run) => !run.userColor))
  })
})
