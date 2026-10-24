#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runDisplayStyle, splitRunsByLines, fontFamilyForRunRole } from './pptTextContent.js'
import { coerceInkHexForAppearance } from './themeAppearance.js'

describe('runDisplayStyle', () => {
  it('resolves colorRole through palette like edit mode', () => {
    const palette = { primary: '#4F46E5', text: '#0F172A', bg: '#FFFFFF', appearance: 'light' }
    const content = { text: 'Hello', color: '#0F172A' }
    const style = runDisplayStyle({ text: 'Hi', colorRole: 'primary' }, content, palette, {})
    assert.equal(style.color, '#4F46E5')
    assert.equal(style.WebkitTextFillColor, '#4F46E5')
  })

  it('maps white ink to dark text on light slides', () => {
    const palette = { bg: '#FFFFFF', text: '#0F172A', appearance: 'light' }
    const content = { text: 'Title', bg: '#FFFFFF' }
    const style = runDisplayStyle(
      { text: 'Title', color: '#FFFFFF', colorRole: 'textOnImage' },
      content,
      palette,
      {}
    )
    assert.equal(style.color, '#0F172A')
  })

  it('maps dark ink to light text on dark slides', () => {
    const palette = { bg: '#0B1220', text: '#F8FAFC', appearance: 'dark' }
    const content = { text: 'Title' }
    const style = runDisplayStyle({ text: 'Title', color: '#0F172A', colorRole: 'text' }, content, palette, {})
    assert.equal(style.color, '#F8FAFC')
  })
})

describe('fontFamilyForRunRole', () => {
  it('maps body and heading fontRole to CSS theme vars', () => {
    assert.equal(fontFamilyForRunRole({ fontRole: 'body' }), 'var(--ppt-font-body, inherit)')
    assert.equal(fontFamilyForRunRole({ fontRole: 'heading' }), 'var(--ppt-font-heading, inherit)')
  })

  it('runDisplayStyle applies body fontRole on dual-style title runs', () => {
    const palette = { bg: '#FFFFFF', primary: '#4F46E5', accent: '#4F46E5', appearance: 'light' }
    const content = { text: 'Hello world', color: '#0F172A' }
    const lead = runDisplayStyle({ text: 'Hello ', colorRole: 'text', fontRole: 'body' }, content, palette, {})
    const punch = runDisplayStyle(
      { text: 'world', colorRole: 'accent', fontWeight: 700, fontRole: 'heading' },
      content,
      palette,
      { fontFamily: 'var(--ppt-font-heading, inherit)' }
    )
    assert.equal(lead.fontFamily, 'var(--ppt-font-body, inherit)')
    assert.equal(punch.fontFamily, 'var(--ppt-font-heading, inherit)')
    assert.equal(punch.fontWeight, 700)
  })
})

describe('coerceInkHexForAppearance', () => {
  it('rejects white on light appearance', () => {
    assert.equal(coerceInkHexForAppearance('#FFFFFF', 'light', { colorRole: 'text' }), '#0F172A')
  })
})

describe('splitRunsByLines', () => {
  it('splits runs on newline boundaries', () => {
    const lines = splitRunsByLines([
      { text: 'Line one\nLine two', color: '#111' },
      { text: '\nLine three', color: '#222' },
    ])
    assert.equal(lines.length, 3)
    assert.equal(lines[0][0].text, 'Line one')
    assert.equal(lines[1][0].text, 'Line two')
    assert.equal(lines[2][0].text, 'Line three')
  })
})
