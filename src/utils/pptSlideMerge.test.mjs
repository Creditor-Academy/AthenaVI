#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mergeLoadedSlides } from './pptSlideMerge.js'

const s = (id, text) => ({ id, elements: { elements: [{ id: 'e', content: { text } }] } })
const textOf = (slides) => slides.map((slide) => `${slide.id}:${slide.elements.elements[0].content.text}`)

describe('merging a loaded deck with the slides on screen', () => {
  it('takes the loaded deck when nothing changed meanwhile', () => {
    const loaded = [s('a', 'A'), s('b', 'B')]
    assert.equal(mergeLoadedSlides([s('a', 'old'), s('b', 'old')], loaded), loaded)
    assert.equal(mergeLoadedSlides([], loaded), loaded)
  })

  it('keeps a slide edited while the deck was loading', () => {
    const out = mergeLoadedSlides([s('a', 'typed'), s('b', 'old')], [s('a', 'server'), s('b', 'B')], new Set(['a']))
    assert.deepEqual(textOf(out), ['a:typed', 'b:B'])
  })

  it('keeps a slide added meanwhile (not on the server yet), in place', () => {
    const out = mergeLoadedSlides(
      [s('a', 'old'), s('new-slide-1', 'layout'), s('b', 'old')],
      [s('a', 'A'), s('b', 'B')]
    )
    assert.deepEqual(textOf(out), ['a:A', 'new-slide-1:layout', 'b:B'])
  })

  it('a slide deleted meanwhile stays deleted', () => {
    const out = mergeLoadedSlides([s('b', 'old')], [s('a', 'A'), s('b', 'B')])
    assert.deepEqual(textOf(out), ['b:B'])
  })
})
