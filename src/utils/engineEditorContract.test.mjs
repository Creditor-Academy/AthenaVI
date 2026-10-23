#!/usr/bin/env node
/**
 * Ankit (editor-contract backup): these fail if PPT editor caps or ARRAY_OVERFLOW
 * drift from ENGINE_POLICY.md. Pair: Komal's layoutSelectionRegression.test.js.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { textForSlot } from '@athena/contracts/slotText.js'
import {
  collectRawArrayOverflowErrors,
  normalizeContentForLayout,
} from '@athena/contracts/contentContract.js'
import { PPT_CAPS, PPT_CANVAS_SIZES, resolveCanvasSize } from './presentationHelpers.js'

const twoCardSchema = {
  layout_id: 'two_cards_image_text_v1',
  slots: [
    { id: 'MAIN_TITLE', role: 'heading' },
    { id: 'CARD_1_TITLE', role: 'heading' },
    { id: 'CARD_1_BODY', role: 'body' },
    { id: 'CARD_2_TITLE', role: 'heading' },
    { id: 'CARD_2_BODY', role: 'body' },
  ],
}

describe('Engine ↔ PPT editor contract (Ankit backup)', () => {
  it('keeps AI 5–20, manual 40, and 60 elements — same as presentation.constants', () => {
    assert.equal(PPT_CAPS.AI_SLIDE_MIN, 5)
    assert.equal(PPT_CAPS.AI_SLIDE_MAX, 20)
    assert.equal(PPT_CAPS.DECK_MAX_SLIDES, 40)
    assert.equal(PPT_CAPS.ELEMENTS_PER_SLIDE, 60)
  })

  it('maps 9:16 to the 16:9 PPT canvas instead of opening Canvas sizes', () => {
    assert.deepEqual(PPT_CANVAS_SIZES['16:9'], { width: 1920, height: 1080 })
    assert.deepEqual(PPT_CANVAS_SIZES['4:3'], { width: 1600, height: 1200 })
    assert.equal(PPT_CANVAS_SIZES['9:16'], undefined)
    assert.deepEqual(resolveCanvasSize({}, '9:16'), { width: 1920, height: 1080 })
  })

  it('does not hide ARRAY_OVERFLOW when five columns hit a two-card layout', () => {
    const content = {
      title: 'Cards',
      columns: [
        { title: '1', body: 'a' },
        { title: '2', body: 'b' },
        { title: '3', body: 'c' },
        { title: '4', body: 'd' },
        { title: '5', body: 'e' },
      ],
    }
    const raw = collectRawArrayOverflowErrors(content, twoCardSchema)
    assert.ok(raw.some((e) => e.code === 'ARRAY_OVERFLOW' && e.path === 'columns'))
    const normalized = normalizeContentForLayout(content, twoCardSchema)
    assert.equal(normalized.columns.length, 2)
    const stillOverflow = collectRawArrayOverflowErrors(content, twoCardSchema)
    assert.ok(stillOverflow.length >= 1, 'raw overflow must survive so repair retries layout')
  })

  it('binds comparison slot text the same way compile/editor maps do', () => {
    const schema = {
      layout_id: 'comparison_table_v1',
      slots: [{ id: 'ROW_1_LEFT_BODY', role: 'body' }],
    }
    assert.equal(
      textForSlot(
        'ROW_1_LEFT_BODY',
        {
          title: 'Models',
          comparison: {
            rows: [{ leftTitle: 'Fees', leftBody: 'Royalties apply', rightTitle: 'Free', rightBody: 'None' }],
          },
        },
        schema
      ),
      'Royalties apply'
    )
  })
})
