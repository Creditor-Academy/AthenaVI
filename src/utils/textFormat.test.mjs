#!/usr/bin/env node
/** Run: node --test src/utils/textFormat.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { applyTextFormat, boxFontWeight, runDisplayStyle, textFormatState } from './pptTextContent.js'

// The "Title" preset from the element catalog: bold with an explicit weight of 800.
const title = { text: 'Title', fontSize: 64, bold: true, fontWeight: 800, align: 'left' }

describe('bold / italic / font work on every text box type', () => {
  it('Bold turns off on a Title (saved with fontWeight 800)', () => {
    assert.equal(textFormatState(title).bold, true)
    const plain = applyTextFormat(title, { bold: false })
    assert.equal(boxFontWeight(plain), 400)
    assert.equal(textFormatState(plain).bold, false)
    assert.equal(boxFontWeight(applyTextFormat(plain, { bold: true })), 700)
  })

  it('a whole-box change wins over styles stored on the words', () => {
    // After a colour change the box's weight, italic and font are copied onto its runs.
    const styled = {
      ...title,
      italic: true,
      fontFamily: 'Outfit',
      runs: [
        { text: 'Big ', fontWeight: 800, italic: true, fontFamily: 'Outfit', color: '#ff0000' },
        { text: 'idea', fontWeight: 800, italic: true, fontRole: 'body', color: '#00ff00' },
      ],
    }
    const next = applyTextFormat(styled, { bold: false, italic: false, fontFamily: 'Lato' })
    assert.equal(next.fontFamily, 'Lato')
    for (const run of next.runs) {
      assert.equal(run.fontWeight, undefined)
      assert.equal(run.italic, undefined)
      assert.equal(run.fontFamily, undefined)
      assert.equal(run.fontRole, undefined)
    }
    assert.deepEqual(next.runs.map((r) => r.color), ['#ff0000', '#00ff00'], 'colours are kept')
    assert.deepEqual(textFormatState(next), { bold: false, italic: false, fontFamily: 'Lato' })
  })

  it('selected words change on their own, both ways', () => {
    const range = { start: 4, end: 8 } // "idea" in "Big idea"
    const content = { ...title, text: 'Big idea' }
    const next = applyTextFormat(content, { bold: false, italic: true }, range)
    assert.deepEqual(
      next.runs.map((r) => [r.text, r.fontWeight ?? null, r.italic ?? null]),
      [
        ['Big ', 800, null],
        ['idea', 400, true],
      ]
    )
    assert.equal(next.fontWeight, 800, 'the box itself is unchanged')
    assert.equal(textFormatState(next, range).bold, false)
    assert.equal(textFormatState(next, { start: 0, end: 3 }).bold, true)
    assert.equal(textFormatState(next).bold, false, 'not all of the box is bold any more')
  })

  it('a word set to not-italic inside an italic box draws upright', () => {
    const quote = { text: 'A quote', italic: true }
    const next = applyTextFormat(quote, { italic: false }, { start: 0, end: 1 })
    const run = next.runs.find((r) => r.text === 'A')
    assert.equal(runDisplayStyle(run, next, null, { fontStyle: 'italic' }).fontStyle, 'normal')
    assert.equal(textFormatState(next, { start: 2, end: 7 }).italic, true)
  })
})
