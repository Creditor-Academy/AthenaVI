#!/usr/bin/env node
/** Run: node --test src/pages/CanvasEditor/canvasThumbnail.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_THUMBNAIL_CHARS,
  previewSignature,
  nextThumbnail,
  thumbnailDataUrl,
  buildCoverSvg,
} from './canvasThumbnail.js'

function page(extra = {}) {
  return {
    id: 'page-1',
    width: 1080,
    height: 1080,
    background: '#FFFFFF',
    elements: [],
    ...extra,
  }
}

describe('canvas thumbnail', () => {
  it('builds a cover from the first page background and text', () => {
    const cover = page({
      background: '#112233',
      elements: [
        {
          id: 't1',
          type: 'text',
          layer: 1,
          placement: { x: 40, y: 80, width: 400, height: 80 },
          content: { text: 'Hello & <world>', color: '#172033' },
        },
      ],
    })
    const svg = buildCoverSvg(cover)
    assert.match(svg, /fill="#112233"/)
    assert.match(svg, /Hello &amp; &lt;world&gt;/)
    const url = thumbnailDataUrl(cover)
    assert.match(url, /^data:image\/svg\+xml/)
    assert.ok(url.length <= MAX_THUMBNAIL_CHARS)
    assert.match(decodeURIComponent(url.split(',')[1]), /Hello/)
  })

  it('changes the signature on background and element edits, not on lock or title', () => {
    const blank = [page()]
    const painted = [page({ background: '#E11D48' })]
    const withText = [
      page({
        elements: [
          {
            id: 't1',
            type: 'text',
            placement: { x: 0, y: 0, width: 100, height: 40, locked: true },
            content: { text: 'Poster' },
            locked: true,
          },
        ],
      }),
    ]
    const unlocked = [
      page({
        elements: [
          {
            id: 't1',
            type: 'text',
            placement: { x: 0, y: 0, width: 100, height: 40, locked: false },
            content: { text: 'Poster' },
          },
        ],
      }),
    ]
    assert.notEqual(previewSignature(blank), previewSignature(painted))
    assert.notEqual(previewSignature(blank), previewSignature(withText))
    assert.equal(previewSignature(withText), previewSignature(unlocked))

    const first = nextThumbnail(blank, null)
    assert.equal(first.changed, true)
    assert.match(first.url, /^data:image\/svg\+xml/)
    const again = nextThumbnail(blank, first.signature)
    assert.equal(again.changed, false)
    assert.equal(again.url, null)
    const afterPaint = nextThumbnail(painted, first.signature)
    assert.equal(afterPaint.changed, true)
    assert.match(decodeURIComponent(afterPaint.url.split(',')[1]), /#E11D48/)
  })
})
