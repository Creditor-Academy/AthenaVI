/**
 * Pricing DECK_LAYOUT v2 catalog — 5 core + 10 similar-variant layouts.
 */

import {
  slot,
  typo,
  layoutBase,
  SAMPLE_PARA,
  body,
  heading,
  tableSlot,
  planFields,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

function pricingPlansLayout(id, planCount, preview = {}) {
  const colWidth = Math.floor(12 / planCount)
  const slots = [
    slot('EYEBROW', 'cols 2-11, rows 1-2', 'eyebrow', 'Describe this slide', {
      layer: 10,
      typography: typo('eyebrow', { align: 'center' }),
      max_lines: 1,
    }),
  ]
  for (let i = 1; i <= planCount; i += 1) {
    const start = (i - 1) * colWidth + 1
    const end = i === planCount ? 12 : i * colWidth
    slots.push(...planFields(i, start, end))
  }
  return layoutBase(id, 'pricing', slots, { mode: 'pricing_plans', ...preview })
}

const CATALOG = {
  pricing_three_plans_v1: pricingPlansLayout('pricing_three_plans_v1', 3, {
    pricingVariant: 'horizontal',
  }),

  pricing_three_highlight_v1: pricingPlansLayout('pricing_three_highlight_v1', 3, {
    highlightedColumnIndex: 1,
    pricingVariant: 'default',
  }),

  pricing_four_plans_v1: pricingPlansLayout('pricing_four_plans_v1', 4, {
    pricingVariant: 'horizontal',
  }),

  pricing_four_para_v1: layoutBase('pricing_four_para_v1', 'pricing', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Choose your plan', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
    body('BODY', 'cols 2-11, rows 2-3', P.short, 2, {
      typography: typo('body', { align: 'center', fontSize: 14 }),
    }),
    ...planFields(1, 1, 3),
    ...planFields(2, 4, 6),
    ...planFields(3, 7, 9),
    ...planFields(4, 10, 12),
  ], { mode: 'pricing_four_para', pricingVariant: 'default' }),

  pricing_comparison_table_v1: layoutBase('pricing_comparison_table_v1', 'pricing', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Plan comparison', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    tableSlot('TABLE_1', 'cols 2-11, rows 3-10'),
  ], { mode: 'pricing_comparison_table', pricingVariant: 'table' }),
}

function pricingFromSource(layoutId, sourceId, pricingVariant, extraPreview = {}) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`pricingFromSource: missing source ${sourceId}`)
  }
  return layoutBase(
    layoutId,
    'pricing',
    JSON.parse(JSON.stringify(source.slots)),
    { mode: source.preview?.mode, pricingVariant, ...extraPreview }
  )
}

Object.assign(CATALOG, {
  pricing_comparison_cards_v1: pricingFromSource('pricing_comparison_cards_v1', 'pricing_comparison_table_v1', 'cards'),
  pricing_comparison_matrix_v1: pricingFromSource('pricing_comparison_matrix_v1', 'pricing_comparison_table_v1', 'matrix'),
  pricing_four_para_cards_v1: pricingFromSource('pricing_four_para_cards_v1', 'pricing_four_para_v1', 'cards'),
  pricing_four_para_grid_v1: pricingFromSource('pricing_four_para_grid_v1', 'pricing_four_para_v1', 'grid'),
  pricing_four_plans_featured_v1: pricingFromSource('pricing_four_plans_featured_v1', 'pricing_four_plans_v1', 'featured', {
    highlightedColumnIndex: 1,
  }),
  pricing_three_highlight_split_v1: pricingFromSource('pricing_three_highlight_split_v1', 'pricing_three_highlight_v1', 'split'),
  pricing_three_highlight_stack_v1: pricingFromSource('pricing_three_highlight_stack_v1', 'pricing_three_highlight_v1', 'stack'),
  pricing_three_plans_featured_v1: pricingFromSource('pricing_three_plans_featured_v1', 'pricing_three_plans_v1', 'featured', {
    highlightedColumnIndex: 1,
  }),
})

export default CATALOG
