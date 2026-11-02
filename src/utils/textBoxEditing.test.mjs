#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  htmlToPlainText,
  keepTextBoxTallEnough,
  normalizePastedText,
  textBoxShrinksToFit,
} from './textBoxEditing.js'

describe('normalizePastedText', () => {
  it('drops blank lines above and below the pasted text', () => {
    assert.equal(normalizePastedText('\n\n\n  \nHello\nWorld\n\n\n'), 'Hello\nWorld')
  })

  it('keeps at most one empty line between paragraphs', () => {
    assert.equal(normalizePastedText('One\n\n\n\n\nTwo'), 'One\n\nTwo')
  })

  it('normalizes Windows / Unicode line breaks and invisible characters', () => {
    assert.equal(normalizePastedText('A\r\nB\rC\u2028D'), 'A\nB\nC\nD')
    assert.equal(normalizePastedText('\uFEFFzero\u200Bwidth\u00A0space'), 'zerowidth space')
  })

  it('trims trailing spaces per line but keeps indentation', () => {
    assert.equal(normalizePastedText('  indented   \nnext\t'), '  indented\nnext')
  })

  it('returns an empty string for whitespace-only input', () => {
    assert.equal(normalizePastedText(' \n \r\n\t'), '')
    assert.equal(normalizePastedText(null), '')
  })
})

describe('htmlToPlainText (no DOM fallback)', () => {
  it('turns block ends into line breaks and strips tags', () => {
    const text = normalizePastedText(htmlToPlainText('<p>Intro</p>\n<ul><li>One</li><li>Two &amp; more</li></ul>'))
    assert.equal(text, 'Intro\n\nOne\nTwo & more')
  })
})

describe('textBoxShrinksToFit', () => {
  it('is true only for layout slots that auto-fit', () => {
    assert.equal(textBoxShrinksToFit({ slotId: 'body', content: {} }), true)
    assert.equal(textBoxShrinksToFit({ slotId: 'body', content: { fit: false } }), false)
    assert.equal(textBoxShrinksToFit({ content: {} }), false)
  })
})

describe('keepTextBoxTallEnough', () => {
  const start = { x: 100, y: 200, width: 400, height: 150 }

  it('leaves a box alone when it is tall enough', () => {
    const next = { ...start, height: 120 }
    assert.equal(keepTextBoxTallEnough(next, start, 's', 100), next)
  })

  it('stops the bottom handle at the text height', () => {
    const next = keepTextBoxTallEnough({ ...start, height: 40 }, start, 's', 90)
    assert.equal(next.height, 90)
    assert.equal(next.y, 200)
  })

  it('keeps the bottom edge fixed for top handles', () => {
    const next = keepTextBoxTallEnough({ ...start, y: 300, height: 50 }, start, 'n', 90)
    assert.equal(next.height, 90)
    assert.equal(next.y, 200 + 150 - 90)
  })

  it('grows the box downward when narrowing it makes the text wrap', () => {
    const next = keepTextBoxTallEnough({ ...start, width: 200 }, start, 'e', 260)
    assert.equal(next.height, 260)
    assert.equal(next.y, 200)
    assert.equal(next.width, 200)
  })
})
