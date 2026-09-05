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
  pricing_four_para_cards_v1: pricingFromSource('pricing_four_para_cards_v1', 'pricing_four_para_v1', 'cards'),
  pricing_three_highlight_split_v1: pricingFromSource('pricing_three_highlight_split_v1', 'pricing_three_highlight_v1', 'split'),
  pricing_three_plans_featured_v1: pricingFromSource('pricing_three_plans_featured_v1', 'pricing_three_plans_v1', 'featured', {
    highlightedColumnIndex: 1,
  }),
})

CATALOG.pricing_three_plans_v1 = layoutBase('pricing_three_plans_v1', 'pricing', [
  heading('HEADING', 'cols 2-11, rows 1-2', 'Three Pricing Table Slide', {
    typography: typo('heading', { fontSize: 32, align: 'center' }),
    max_lines: 1,
  }),
  slot('SUBHEADING', 'cols 2-11, rows 2-3', 'subheading', 'Present complex data in an easy-to-understand way.', {
    layer: 10,
    typography: typo('caption', { fontSize: 14, align: 'center', fontWeight: 500 }),
  }),
  slot('PLAN_1_LABEL', 'cols 1-4, rows 3-4', 'heading', 'Basic Plan', {
    layer: 10,
    typography: typo('heading', { fontSize: 15 }),
    max_lines: 1,
  }),
  slot('PLAN_1_PRICE', 'cols 1-4, rows 3-4', 'stat', '$49', {
    layer: 10,
    typography: typo('stat', { fontSize: 40, align: 'left' }),
    max_lines: 1,
  }),
  slot('PLAN_1_CTA', 'cols 1-4, rows 3-4', 'caption', 'Start Now', {
    layer: 10,
    typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 800 }),
    max_lines: 1,
  }),
  slot('PLAN_1_ITEM_1', 'cols 1-4, rows 5-6', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_2', 'cols 1-4, rows 6-7', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_3', 'cols 1-4, rows 7-8', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_4', 'cols 1-4, rows 8-9', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_2_LABEL', 'cols 5-8, rows 3-4', 'heading', 'Standard Plan', {
    layer: 10,
    typography: typo('heading', { fontSize: 15 }),
    max_lines: 1,
  }),
  slot('PLAN_2_PRICE', 'cols 5-8, rows 3-4', 'stat', '$79', {
    layer: 10,
    typography: typo('stat', { fontSize: 40, align: 'left' }),
    max_lines: 1,
  }),
  slot('PLAN_2_CTA', 'cols 5-8, rows 3-4', 'caption', 'Start Now', {
    layer: 10,
    typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 800 }),
    max_lines: 1,
  }),
  slot('PLAN_2_ITEM_1', 'cols 5-8, rows 5-6', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_2', 'cols 5-8, rows 6-7', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_3', 'cols 5-8, rows 7-8', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_4', 'cols 5-8, rows 8-9', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_3_LABEL', 'cols 9-12, rows 3-4', 'heading', 'Premium Plan', {
    layer: 10,
    typography: typo('heading', { fontSize: 15 }),
    max_lines: 1,
  }),
  slot('PLAN_3_PRICE', 'cols 9-12, rows 3-4', 'stat', '$99', {
    layer: 10,
    typography: typo('stat', { fontSize: 40, align: 'left' }),
    max_lines: 1,
  }),
  slot('PLAN_3_CTA', 'cols 9-12, rows 3-4', 'caption', 'Start Now', {
    layer: 10,
    typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 800 }),
    max_lines: 1,
  }),
  slot('PLAN_3_ITEM_1', 'cols 9-12, rows 5-6', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_2', 'cols 9-12, rows 6-7', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_3', 'cols 9-12, rows 7-8', 'body', 'Present complex data in an easy-to', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_4', 'cols 9-12, rows 8-9', 'body', 'Data in an easy-to-understand way', { layer: 10, typography: typo('body', { fontSize: 14 }), max_lines: 1 }),
], { mode: 'pricing_plans', pricingVariant: 'horizontal' })

CATALOG.pricing_three_plans_featured_v1 = layoutBase('pricing_three_plans_featured_v1', 'pricing', [
  heading('HEADING', 'cols 1-8, rows 1-2', 'PRICING PLANS', {
    typography: typo('heading', { fontSize: 34, align: 'left' }),
    max_lines: 1,
  }),
  slot('PLAN_1_LABEL', 'cols 1-4, rows 3-4', 'heading', 'BASIC', { layer: 10, typography: typo('heading', { fontSize: 15, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_PRICE', 'cols 1-4, rows 3-4', 'stat', '$29', { layer: 10, typography: typo('stat', { fontSize: 40, align: 'right' }), max_lines: 1 }),
  slot('PLAN_1_CENTS', 'cols 1-4, rows 3-4', 'caption', ',99', { layer: 10, typography: typo('caption', { fontSize: 16 }), max_lines: 1 }),
  slot('PLAN_1_BODY', 'cols 1-4, rows 4-6', 'body', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', { layer: 10, typography: typo('body', { fontSize: 11, align: 'center' }), max_lines: 4 }),
  slot('PLAN_1_ITEM_1', 'cols 1-4, rows 6-7', 'body', 'Feature comes here 1', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_2', 'cols 1-4, rows 7-8', 'body', 'Feature comes here 2', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_3', 'cols 1-4, rows 8-9', 'body', 'Feature comes here 3', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_1_CTA', 'cols 1-4, rows 9-10', 'caption', 'Purchase', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_2_LABEL', 'cols 5-8, rows 3-4', 'heading', 'PROFESSIONAL', { layer: 10, typography: typo('heading', { fontSize: 15, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_PRICE', 'cols 5-8, rows 3-4', 'stat', '$49', { layer: 10, typography: typo('stat', { fontSize: 40, align: 'right' }), max_lines: 1 }),
  slot('PLAN_2_CENTS', 'cols 5-8, rows 3-4', 'caption', ',99', { layer: 10, typography: typo('caption', { fontSize: 16 }), max_lines: 1 }),
  slot('PLAN_2_BODY', 'cols 5-8, rows 4-6', 'body', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', { layer: 10, typography: typo('body', { fontSize: 11, align: 'center' }), max_lines: 4 }),
  slot('PLAN_2_ITEM_1', 'cols 5-8, rows 6-7', 'body', 'Feature comes here 1', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_2', 'cols 5-8, rows 7-8', 'body', 'Feature comes here 2', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_3', 'cols 5-8, rows 8-9', 'body', 'Feature comes here 3', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_2_CTA', 'cols 5-8, rows 9-10', 'caption', 'Purchase', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_3_LABEL', 'cols 9-12, rows 3-4', 'heading', 'PREMIUM', { layer: 10, typography: typo('heading', { fontSize: 15, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_PRICE', 'cols 9-12, rows 3-4', 'stat', '$99', { layer: 10, typography: typo('stat', { fontSize: 40, align: 'right' }), max_lines: 1 }),
  slot('PLAN_3_CENTS', 'cols 9-12, rows 3-4', 'caption', ',99', { layer: 10, typography: typo('caption', { fontSize: 16 }), max_lines: 1 }),
  slot('PLAN_3_BODY', 'cols 9-12, rows 4-6', 'body', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', { layer: 10, typography: typo('body', { fontSize: 11, align: 'center' }), max_lines: 4 }),
  slot('PLAN_3_ITEM_1', 'cols 9-12, rows 6-7', 'body', 'Feature comes here 1', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_2', 'cols 9-12, rows 7-8', 'body', 'Feature comes here 2', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_3', 'cols 9-12, rows 8-9', 'body', 'Feature comes here 3', { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 1 }),
  slot('PLAN_3_CTA', 'cols 9-12, rows 9-10', 'caption', 'Purchase', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
], { mode: 'pricing_plans', pricingVariant: 'featured', highlightedColumnIndex: 1 })

CATALOG.pricing_three_highlight_v1 = layoutBase('pricing_three_highlight_v1', 'pricing', [
  heading('HEADING', 'cols 2-11, rows 1-2', 'Slide Title Here', {
    typography: typo('heading', { fontSize: 36, align: 'center' }),
    max_lines: 1,
  }),
  slot('PLAN_1_LABEL', 'cols 1-4, rows 3-4', 'heading', 'Basic', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_PRICE', 'cols 1-4, rows 3-4', 'stat', '$000', { layer: 10, typography: typo('stat', { fontSize: 48, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_PERIOD', 'cols 1-4, rows 4-5', 'caption', 'PER MONTH', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_ITEM_1', 'cols 1-4, rows 5-6', 'body', '12 Data Base', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_2', 'cols 1-4, rows 6-7', 'body', '15 GB Disk Space', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_1_ITEM_3', 'cols 1-4, rows 7-8', 'body', '10 Users', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_1_CTA', 'cols 1-4, rows 9-10', 'caption', 'Get Started', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_2_LABEL', 'cols 5-8, rows 3-4', 'heading', 'Medium', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_PRICE', 'cols 5-8, rows 3-4', 'stat', '$000', { layer: 10, typography: typo('stat', { fontSize: 48, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_PERIOD', 'cols 5-8, rows 4-5', 'caption', 'PER MONTH', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_ITEM_1', 'cols 5-8, rows 5-6', 'body', '12 Data Base', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_2', 'cols 5-8, rows 6-7', 'body', '15 GB Disk Space', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_2_ITEM_3', 'cols 5-8, rows 7-8', 'body', '10 Users', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_2_CTA', 'cols 5-8, rows 9-10', 'caption', 'Get Started', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_3_LABEL', 'cols 9-12, rows 3-4', 'heading', 'Ultimate', { layer: 10, typography: typo('heading', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_PRICE', 'cols 9-12, rows 3-4', 'stat', '$000', { layer: 10, typography: typo('stat', { fontSize: 48, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_PERIOD', 'cols 9-12, rows 4-5', 'caption', 'PER MONTH', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_ITEM_1', 'cols 9-12, rows 5-6', 'body', '12 Data Base', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_2', 'cols 9-12, rows 6-7', 'body', '15 GB Disk Space', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_3_ITEM_3', 'cols 9-12, rows 7-8', 'body', '10 Users', { layer: 10, typography: typo('body', { fontSize: 13 }), max_lines: 1 }),
  slot('PLAN_3_CTA', 'cols 9-12, rows 9-10', 'caption', 'Get Started', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }), max_lines: 1 }),
], { mode: 'pricing_plans', pricingVariant: 'default', highlightedColumnIndex: 1 })

CATALOG.pricing_three_highlight_split_v1 = layoutBase('pricing_three_highlight_split_v1', 'pricing', [
  heading('HEADING', 'cols 2-11, rows 1-2', 'Slide Title Here', {
    typography: typo('heading', { fontSize: 32, align: 'center' }),
    max_lines: 1,
  }),
  slot('PLAN_1_LABEL', 'cols 4-6, rows 2-3', 'heading', 'Base Plan', { layer: 10, typography: typo('heading', { fontSize: 18, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_PRICE', 'cols 4-6, rows 3-4', 'stat', '$00.00', { layer: 10, typography: typo('stat', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_1_CTA', 'cols 4-6, rows 9-10', 'caption', 'MORE INFORMATION', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_2_LABEL', 'cols 7-9, rows 2-3', 'heading', 'Silver Plan', { layer: 10, typography: typo('heading', { fontSize: 18, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_PRICE', 'cols 7-9, rows 3-4', 'stat', '$000.00', { layer: 10, typography: typo('stat', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_2_CTA', 'cols 7-9, rows 9-10', 'caption', 'MORE INFORMATION', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('PLAN_3_LABEL', 'cols 10-12, rows 2-3', 'heading', 'Gold Plan', { layer: 10, typography: typo('heading', { fontSize: 18, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_PRICE', 'cols 10-12, rows 3-4', 'stat', '$000.00', { layer: 10, typography: typo('stat', { fontSize: 16, align: 'center' }), max_lines: 1 }),
  slot('PLAN_3_CTA', 'cols 10-12, rows 9-10', 'caption', 'MORE INFORMATION', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
  slot('ROW_1_LABEL', 'cols 1-3, rows 4-5', 'body', 'Add text here', { layer: 10, typography: typo('body', { fontSize: 14, fontWeight: 700 }), max_lines: 1 }),
  slot('ROW_2_LABEL', 'cols 1-3, rows 5-6', 'body', 'Add text here', { layer: 10, typography: typo('body', { fontSize: 14, fontWeight: 700 }), max_lines: 1 }),
  slot('ROW_3_LABEL', 'cols 1-3, rows 6-7', 'body', 'Add text here', { layer: 10, typography: typo('body', { fontSize: 14, fontWeight: 700 }), max_lines: 1 }),
  slot('ROW_4_LABEL', 'cols 1-3, rows 7-8', 'body', 'Add text here', { layer: 10, typography: typo('body', { fontSize: 14, fontWeight: 700 }), max_lines: 1 }),
  slot('ROW_5_LABEL', 'cols 1-3, rows 8-9', 'body', 'Add text here', { layer: 10, typography: typo('body', { fontSize: 14, fontWeight: 700 }), max_lines: 1 }),
], { mode: 'pricing_plans', pricingVariant: 'split' })

CATALOG.pricing_four_plans_v1 = layoutBase('pricing_four_plans_v1', 'pricing', [
  heading('HEADING', 'cols 1-8, rows 1-2', 'Pricing Table', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4].flatMap((n) => {
    const names = ['Free', 'Standard', 'Professional', 'Enterprise']
    const prices = ['$ 0', '$ 19', '$ 99', '$ 499']
    const col = n === 1 ? '1-3' : n === 2 ? '4-6' : n === 3 ? '7-9' : '10-12'
    return [
      slot(`PLAN_${n}_LABEL`, `cols ${col}, rows 2-3`, 'heading', names[n - 1], { layer: 10, typography: typo('heading', { fontSize: 16, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_PRICE`, `cols ${col}, rows 3-4`, 'stat', prices[n - 1], { layer: 10, typography: typo('stat', { fontSize: 36, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_PERIOD`, `cols ${col}, rows 3-4`, 'caption', '/yr', { layer: 10, typography: typo('caption', { fontSize: 14, align: 'left' }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_1`, `cols ${col}, rows 5-6`, 'body', 'Feature Number 1', { layer: 10, typography: typo('body', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_2`, `cols ${col}, rows 6-7`, 'body', 'Feature Number 2', { layer: 10, typography: typo('body', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_3`, `cols ${col}, rows 7-8`, 'body', 'Feature Number 3', { layer: 10, typography: typo('body', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_4`, `cols ${col}, rows 8-9`, 'body', 'Feature Number 4', { layer: 10, typography: typo('body', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_CTA`, `cols ${col}, rows 9-10`, 'caption', '30-day free trial', { layer: 10, typography: typo('caption', { fontSize: 11, align: 'center', fontWeight: 700 }), max_lines: 1 }),
    ]
  }),
], { mode: 'pricing_plans', pricingVariant: 'horizontal' })

CATALOG.pricing_four_plans_featured_v1 = layoutBase('pricing_four_plans_featured_v1', 'pricing', [
  heading('HEADING', 'cols 1-8, rows 1-2', 'Pricing Table', {
    typography: typo('heading', { fontSize: 22, align: 'left' }),
    max_lines: 1,
  }),
  ...[1, 2, 3, 4].flatMap((n) => {
    const names = ['Essential', 'Team', 'Professional', 'Enterprise']
    const prices = ['$ 9.99', '$ 19.99', '$ 29.99', '$ 39.99']
    const col = n === 1 ? '1-3' : n === 2 ? '4-6' : n === 3 ? '7-9' : '10-12'
    return [
      slot(`PLAN_${n}_LABEL`, `cols ${col}, rows 2-3`, 'heading', names[n - 1], { layer: 10, typography: typo('heading', { fontSize: 16, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_1`, `cols ${col}, rows 3-4`, 'body', 'Lorem ipsum is simply dummy', { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_2`, `cols ${col}, rows 4-5`, 'body', 'Lorem ipsum is simply dummy', { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_3`, `cols ${col}, rows 5-6`, 'body', 'Lorem ipsum is simply dummy', { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_4`, `cols ${col}, rows 6-7`, 'body', 'Lorem ipsum is simply dummy', { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 1 }),
      slot(`PLAN_${n}_ITEM_5`, `cols ${col}, rows 7-8`, 'body', 'Lorem ipsum is simply dummy', { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 1 }),
      slot(`PLAN_${n}_BODY`, `cols ${col}, rows 8-9`, 'body', 'Lorem Ipsum is simply dummy text of the printing and typesetting.', { layer: 10, typography: typo('body', { fontSize: 10, align: 'center' }), max_lines: 2 }),
      slot(`PLAN_${n}_CAPTION`, `cols ${col}, rows 9-10`, 'caption', 'Only With', { layer: 10, typography: typo('caption', { fontSize: 12, align: 'center' }), max_lines: 1 }),
      slot(`PLAN_${n}_PRICE`, `cols ${col}, rows 9-10`, 'stat', prices[n - 1], { layer: 10, typography: typo('stat', { fontSize: 24, align: 'right' }), max_lines: 1 }),
      slot(`PLAN_${n}_PERIOD`, `cols ${col}, rows 9-10`, 'caption', '/yr', { layer: 10, typography: typo('caption', { fontSize: 13, align: 'left' }), max_lines: 1 }),
    ]
  }),
], { mode: 'pricing_plans', pricingVariant: 'featured', highlightedColumnIndex: 1 })

const FPA_PARA = 'A short paragraph that explains who this plan is for and what working together actually looks like in practice.'
CATALOG.pricing_four_para_v1 = layoutBase('pricing_four_para_v1', 'pricing', [
  heading('HEADING', 'cols 1-8, rows 1-2', 'Choose a plan', {
    typography: typo('heading', { fontSize: 26, align: 'left' }),
    max_lines: 1,
  }),
  body('BODY', 'cols 1-11, rows 2-3', 'Four ways to work with us — written as stories, not a feature dump.', 1, {
    typography: typo('body', { align: 'left', fontSize: 13 }),
  }),
  ...[1, 2, 3, 4].flatMap((n) => {
    const names = ['Starter', 'Studio', 'Agency', 'Partner']
    const prices = ['$29', '$79', '$149', '$299']
    const col = n === 1 || n === 3 ? '1-6' : '7-12'
    const rowLabel = n <= 2 ? '3-4' : '7-8'
    return [
      slot(`PLAN_${n}_LABEL`, `cols ${col}, rows ${rowLabel}`, 'heading', names[n - 1], { layer: 10, typography: typo('heading', { fontSize: 15 }), max_lines: 1 }),
      slot(`PLAN_${n}_PRICE`, `cols ${col}, rows ${rowLabel}`, 'stat', prices[n - 1], { layer: 10, typography: typo('stat', { fontSize: 28, align: 'left' }), max_lines: 1 }),
      slot(`PLAN_${n}_BODY`, `cols ${col}, rows ${n <= 2 ? '4-7' : '8-10'}`, 'body', FPA_PARA, { layer: 10, typography: typo('body', { fontSize: 12 }), max_lines: 4 }),
      slot(`PLAN_${n}_CTA`, `cols ${col}, rows ${n <= 2 ? '6-7' : '9-10'}`, 'caption', 'Explore plan', { layer: 10, typography: typo('caption', { fontSize: 12, fontWeight: 700 }), max_lines: 1 }),
    ]
  }),
], { mode: 'pricing_four_para', pricingVariant: 'default' })

CATALOG.pricing_four_para_cards_v1 = layoutBase('pricing_four_para_cards_v1', 'pricing', [
  heading('HEADING', 'cols 2-11, rows 1-2', 'Membership cards', {
    typography: typo('heading', { fontSize: 22, align: 'center' }),
    max_lines: 1,
  }),
  body('BODY', 'cols 2-11, rows 2-3', 'Pick a card — each plan is a paragraph, not a checklist.', 1, {
    typography: typo('body', { align: 'center', fontSize: 12 }),
  }),
  ...[1, 2, 3, 4].flatMap((n) => {
    const names = ['Bronze', 'Silver', 'Gold', 'Black']
    const prices = ['$39', '$89', '$159', '$329']
    const col = n === 1 ? '1-3' : n === 2 ? '4-6' : n === 3 ? '7-9' : '10-12'
    return [
      slot(`PLAN_${n}_LABEL`, `cols ${col}, rows 3-4`, 'heading', names[n - 1], { layer: 10, typography: typo('heading', { fontSize: 13, align: 'left' }), max_lines: 1 }),
      slot(`PLAN_${n}_PRICE`, `cols ${col}, rows 3-4`, 'stat', prices[n - 1], { layer: 10, typography: typo('stat', { fontSize: 26, align: 'left' }), max_lines: 1 }),
      slot(`PLAN_${n}_BODY`, `cols ${col}, rows 5-9`, 'body', FPA_PARA, { layer: 10, typography: typo('body', { fontSize: 11 }), max_lines: 5 }),
      slot(`PLAN_${n}_CTA`, `cols ${col}, rows 9-10`, 'caption', 'Get this card', { layer: 10, typography: typo('caption', { fontSize: 12, fontWeight: 700 }), max_lines: 1 }),
    ]
  }),
], { mode: 'pricing_four_para', pricingVariant: 'cards' })

export default CATALOG
