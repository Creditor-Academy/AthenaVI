#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  TABLE_MIN_COL_FRACTION,
  TABLE_MIN_ROW_PX,
  minColFraction,
  naturalRowHeights,
  normalizeColWidths,
  normalizeRowHeights,
  resizeColumnBorder,
  resizeRowBorder,
  rowMinimumsFromLayout,
  tableBoxHeightToApply,
  tableCellsOf,
  tableColumnCount,
} from './pptTableLayout.js'

const close = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`)

describe('table cells', () => {
  it('reads cells, or the older rows array of arrays', () => {
    assert.deepEqual(tableCellsOf({ cells: [['a']] }), [['a']])
    assert.deepEqual(tableCellsOf({ rows: [['b', 'c']] }), [['b', 'c']])
    // `rows` as a count (what the editors also store) isn't a table body.
    assert.deepEqual(tableCellsOf({ rows: 3 }), [])
    assert.equal(tableColumnCount([['a'], ['b', 'c', 'd']]), 3)
    assert.equal(tableColumnCount([]), 0)
  })
})

describe('column widths', () => {
  it('equal columns when none are stored or they no longer match', () => {
    assert.deepEqual(normalizeColWidths(null, 4), [0.25, 0.25, 0.25, 0.25])
    assert.deepEqual(normalizeColWidths([0.5, 0.5], 4), [0.25, 0.25, 0.25, 0.25])
    assert.deepEqual(normalizeColWidths([0.5, -1, 0.5], 3).map((w) => +w.toFixed(4)), [0.3333, 0.3333, 0.3333])
  })

  it('stored shares are scaled to add up to 1', () => {
    const w = normalizeColWidths([2, 1, 1], 3)
    close(w[0], 0.5)
    close(w[1] + w[2], 0.5)
  })

  it('dragging a border moves only the two columns beside it', () => {
    const next = resizeColumnBorder([0.25, 0.25, 0.5], 0, 0.1)
    close(next[0], 0.35)
    close(next[1], 0.15)
    assert.equal(next[2], 0.5)
    close(next.reduce((a, b) => a + b, 0), 1)
  })

  it('a column never gets narrower than the minimum', () => {
    const next = resizeColumnBorder([0.5, 0.5], 0, 0.9)
    close(next[1], TABLE_MIN_COL_FRACTION)
    close(next[0], 1 - TABLE_MIN_COL_FRACTION)
    const back = resizeColumnBorder([0.5, 0.5], 0, -0.9)
    close(back[0], TABLE_MIN_COL_FRACTION)
  })

  it('the last border (the table edge) is not a column border', () => {
    const w = [0.5, 0.5]
    assert.equal(resizeColumnBorder(w, 1, 0.1), w)
  })

  it('narrow tables get a larger minimum share (24 px)', () => {
    assert.equal(minColFraction(0), TABLE_MIN_COL_FRACTION)
    close(minColFraction(240), 0.1)
    assert.equal(minColFraction(2000), TABLE_MIN_COL_FRACTION)
  })
})

describe('row heights', () => {
  it('stored minimums only when they match the rows', () => {
    assert.equal(normalizeRowHeights(null, 2), null)
    assert.equal(normalizeRowHeights([20], 2), null)
    assert.deepEqual(normalizeRowHeights([20, 4], 2), [20, TABLE_MIN_ROW_PX])
  })

  it('a row is as tall as its text or its minimum, whichever is larger', () => {
    assert.deepEqual(naturalRowHeights([30, 14], [20, 40]), [30, 40])
    assert.deepEqual(naturalRowHeights([18, 2], null), [18, TABLE_MIN_ROW_PX])
  })

  it('freezing the drawn rows keeps spare room, but not height that only the text made', () => {
    // Row 0 has room to spare (drawn 47, text 24); row 1 is as tall as its text.
    assert.deepEqual(rowMinimumsFromLayout([47, 58], [24, 58]), [47, TABLE_MIN_ROW_PX])
    // A stored minimum is kept for a row its text has outgrown.
    assert.deepEqual(rowMinimumsFromLayout([47, 80], [24, 80], [30, 30]), [47, 30])
  })

  it('dragging a row border changes that row and never cuts its text', () => {
    assert.deepEqual(resizeRowBorder([20, 20, 20], [16, 16, 16], 1, 15), [20, 35, 20])
    // Dragged up past its text: stops at the text height.
    assert.deepEqual(resizeRowBorder([40, 40], [30, 16], 0, -100), [30, 40])
  })
})

describe('table box height', () => {
  it('grows when the text needs more room (text is never cut)', () => {
    assert.equal(tableBoxHeightToApply({ boxHeight: 100, naturalHeight: 140 }), 140)
    assert.equal(tableBoxHeightToApply({ boxHeight: 100, naturalHeight: 101 }), null)
  })

  it('a table with its own row heights shrinks back when text is removed', () => {
    assert.equal(
      tableBoxHeightToApply({ boxHeight: 160, naturalHeight: 120, hasRowHeights: true, contentChanged: true }),
      120
    )
  })

  it('an older table (no row heights) or a box the user stretched keeps its height', () => {
    assert.equal(tableBoxHeightToApply({ boxHeight: 300, naturalHeight: 120, contentChanged: true }), null)
    assert.equal(
      tableBoxHeightToApply({ boxHeight: 300, naturalHeight: 120, hasRowHeights: true, contentChanged: false }),
      null
    )
  })
})
