#!/usr/bin/env node
/** Run: node --test src/utils/textLinks.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { linkedRuns, normalizeLinkHref, safeLinkHref, splitTextLinks } from './textLinks.js'
import { applyLinkToTextRange, elementTextLink, mergeAdjacentRuns, remapRunsToText } from './pptTextContent.js'

describe('link addresses', () => {
  it('normalizes what is typed in the Link box', () => {
    assert.equal(normalizeLinkHref('example.com'), 'https://example.com')
    assert.equal(normalizeLinkHref('  www.example.com/a?b=1 '), 'https://www.example.com/a?b=1')
    assert.equal(normalizeLinkHref('http://example.com'), 'http://example.com')
    assert.equal(normalizeLinkHref('name@example.com'), 'mailto:name@example.com')
    assert.equal(normalizeLinkHref('localhost:3000/x'), 'https://localhost:3000/x')
    assert.equal(normalizeLinkHref('tel:+15551234'), 'tel:+15551234')
  })

  it('refuses anything that is not a web link', () => {
    for (const bad of ['', '   ', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,hi', 'file:///etc/passwd', 'hello', 'vbscript:x']) {
      assert.equal(normalizeLinkHref(bad), '', bad)
    }
    assert.equal(safeLinkHref('javascript:alert(1)'), null)
    assert.equal(safeLinkHref(' https://ok.com '), 'https://ok.com')
  })
})

describe('web addresses in text', () => {
  it('finds the URL the tester pasted', () => {
    const url = 'https://360.articulate.com/review/content/d91edd25-c491-4389-a3b2-18b5ce1ba69f/review'
    assert.deepEqual(splitTextLinks(url), [{ text: url, href: url, auto: true }])
  })

  it('splits text around addresses and leaves trailing punctuation out', () => {
    const pieces = splitTextLinks('See www.example.com/docs, or (https://a.io/x_(y)).')
    assert.deepEqual(
      pieces.map((p) => [p.text, p.href || null]),
      [
        ['See ', null],
        ['www.example.com/docs', 'https://www.example.com/docs'],
        [', or (', null],
        ['https://a.io/x_(y)', 'https://a.io/x_(y)'],
        [').', null],
      ]
    )
  })

  it('plain text without addresses stays one piece', () => {
    assert.deepEqual(splitTextLinks('Grades 3–5 | 45-minute class'), [{ text: 'Grades 3–5 | 45-minute class' }])
  })

  it('stored links win; unsafe stored hrefs are dropped', () => {
    const runs = linkedRuns([
      { text: 'Docs', href: 'https://docs.example.com', bold: true },
      { text: ' and https://x.io', color: '#111111' },
      { text: 'bad', href: 'javascript:alert(1)' },
    ])
    assert.deepEqual(
      runs.map((r) => [r.text, r.href || null, r.bold || r.color || null]),
      [
        ['Docs', 'https://docs.example.com', true],
        [' and ', null, '#111111'],
        ['https://x.io', 'https://x.io', '#111111'],
        ['bad', null, null],
      ]
    )
  })
})

describe('linking words in a text box', () => {
  const content = { text: 'Read the guide today', runs: [{ text: 'Read the guide today', color: '#111111' }] }

  it('links only the selected words and keeps their formatting', () => {
    const next = applyLinkToTextRange(content, 9, 14, 'https://guide.io')
    assert.equal(next.text, 'Read the guide today')
    assert.deepEqual(
      next.runs.map((r) => [r.text, r.href || null, r.color]),
      [
        ['Read the ', null, '#111111'],
        ['guide', 'https://guide.io', '#111111'],
        [' today', null, '#111111'],
      ]
    )
  })

  it('no selection links the whole box; an empty href removes the link', () => {
    const linked = applyLinkToTextRange({ text: 'Plain box' }, 0, 0, 'https://a.io')
    assert.deepEqual(linked.runs.map((r) => [r.text, r.href]), [['Plain box', 'https://a.io']])
    const unlinked = applyLinkToTextRange(linked, 0, 0, '')
    assert.deepEqual(unlinked.runs.map((r) => [r.text, r.href]), [['Plain box', undefined]])
  })

  it('never stores an unsafe link', () => {
    const next = applyLinkToTextRange(content, 0, 4, 'javascript:alert(1)')
    assert.ok(next.runs.every((r) => !r.href))
  })

  it('links stay separate from neighbouring text with the same style, and survive text remaps', () => {
    const merged = mergeAdjacentRuns([{ text: 'a', href: 'https://a.io' }, { text: 'b' }])
    assert.equal(merged.length, 2)
    const remapped = remapRunsToText([{ text: 'ab', href: 'https://a.io' }], 'ab', 'abc')
    assert.equal(remapped[0].href, 'https://a.io')
  })

  it('reads back the link of the box for the Link control', () => {
    const linked = applyLinkToTextRange(content, 0, 0, 'https://guide.io')
    assert.equal(elementTextLink({ id: 'x', content: linked }), 'https://guide.io')
    const partly = applyLinkToTextRange(content, 9, 14, 'https://guide.io')
    assert.equal(elementTextLink({ id: 'x', content: partly }), '', 'mixed text has no single link')
    assert.equal(elementTextLink({ id: 'x', content }), '')
  })
})
