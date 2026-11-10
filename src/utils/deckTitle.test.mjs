#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/deckTitle.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { deckTitleFromSlides, exportDeckTitle, isDefaultDeckTitle, slideElementList } from './deckTitle.js'

const heading = (text, extra = {}) => ({ id: 'h', type: 'text', role: 'heading', content: { text }, ...extra })

describe('naming an "Untitled" deck before export', () => {
  it('reads the editor slide shape (elements is the canvas document, not an array)', () => {
    // This shape made export fail with "(…).find is not a function".
    const slides = [{ id: 's1', elements: { canvas: { width: 1920, height: 1080 }, elements: [heading('Kurti Collection 2026')] } }]
    assert.doesNotThrow(() => deckTitleFromSlides(slides))
    assert.equal(deckTitleFromSlides(slides), 'Kurti Collection 2026')
  })

  it('also reads an element array, canvas.elements, and text stored only as runs', () => {
    assert.equal(deckTitleFromSlides([{ elements: [heading('Array form')] }]), 'Array form')
    assert.equal(deckTitleFromSlides([{ canvas: { elements: [heading('Canvas form')] } }]), 'Canvas form')
    const runsOnly = { id: 't', type: 'text', slotId: 'TITLE', content: { runs: [{ text: 'Big ' }, { text: 'idea' }] } }
    assert.equal(deckTitleFromSlides([{ elements: { elements: [runsOnly] } }]), 'Big idea')
  })

  it('falls back to the slide title, and never throws on odd data', () => {
    assert.equal(deckTitleFromSlides([{ title: 'From slide', elements: { elements: [] } }]), 'From slide')
    for (const bad of [null, undefined, [], [null], [{ elements: 'x' }], [{ elements: { elements: [null, 5] } }]]) {
      assert.doesNotThrow(() => deckTitleFromSlides(bad))
      assert.equal(deckTitleFromSlides(bad), null)
    }
    assert.deepEqual(slideElementList({ elements: { elements: 'nope' } }), [])
  })

  it('placeholder titles do not count, and line breaks become spaces', () => {
    assert.equal(deckTitleFromSlides([{ elements: [heading('Untitled Presentation')] }]), null)
    assert.equal(deckTitleFromSlides([{ elements: [heading('Two\nlines')] }]), 'Two lines')
    assert.equal(isDefaultDeckTitle('Untitled Presentation'), true)
    assert.equal(isDefaultDeckTitle('Q3 Review'), false)
  })

  it('the export name: the deck name, else the first slide title, else the fallback', () => {
    const slides = [{ elements: { elements: [heading('Slide Title')] } }]
    assert.equal(exportDeckTitle('Q3 Review', slides), 'Q3 Review')
    assert.equal(exportDeckTitle('Untitled Presentation', slides), 'Slide Title')
    assert.equal(exportDeckTitle('Untitled Presentation', []), 'Untitled Presentation')
    assert.equal(exportDeckTitle('', []), 'Presentation')
  })
})
