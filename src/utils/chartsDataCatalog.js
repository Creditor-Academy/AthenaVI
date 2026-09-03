/**
 * Charts & data DECK_LAYOUT v2 catalog — 23 core + 46 similar-variant layouts.
 */

import {
  slot,
  typo,
  layoutBase,
  SAMPLE_PARA,
  body,
  heading,
  chartSlot,
  tableSlot,
  statPair,
  cardShapeHint,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

function statLayout(id, contentType, statCount, previewMode, slots, preview = {}) {
  return layoutBase(id, contentType, slots, { mode: previewMode, ...preview })
}

const CATALOG = {
  chart_single_v1: layoutBase('chart_single_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Chart title', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    chartSlot('MAIN_CHART', 'cols 2-11, rows 3-10'),
  ], { mode: 'chart_full_width' }),

  chart_exponential_desc_v1: layoutBase('chart_exponential_desc_v1', 'chart', [
    heading('HEADING', 'cols 2-6, rows 2-3', 'Growth trajectory', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('BODY', 'cols 2-6, rows 3-8', P.short, 4),
    chartSlot('LINE_CHART', 'cols 7-11, rows 2-10', { chartType: 'area' }),
  ], { mode: 'chart_split', chartStyle: 'line' }),

  chart_with_description_v1: layoutBase('chart_with_description_v1', 'chart', [
    heading('HEADING', 'cols 2-6, rows 2-3', 'Chart title', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('BODY', 'cols 2-6, rows 3-8', P.short, 4),
    chartSlot('MAIN_CHART', 'cols 7-11, rows 2-10'),
  ], { mode: 'chart_split' }),

  chart_two_v1: layoutBase('chart_two_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Compare metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    chartSlot('CHART_1', 'cols 1-6, rows 3-10'),
    chartSlot('CHART_2', 'cols 7-12, rows 3-10'),
  ], { mode: 'chart_dual' }),

  chart_three_v1: layoutBase('chart_three_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Three views', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    chartSlot('CHART_1', 'cols 1-4, rows 3-10'),
    chartSlot('CHART_2', 'cols 5-8, rows 3-10'),
    chartSlot('CHART_3', 'cols 9-12, rows 3-10'),
  ], { mode: 'chart_triple' }),

  chart_two_cards_v1: layoutBase('chart_two_cards_v1', 'chart', [
    cardShapeHint('cols 1-6, rows 2-10', 'CHART_CARD_1_BG', 10, 'CHART_1'),
    heading('CHART_1_TITLE', 'cols 1-6, rows 2-3', 'Metric A', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    chartSlot('CHART_1', 'cols 1-6, rows 4-8'),
    slot('CHART_1_CAPTION', 'cols 1-6, rows 8-9', 'caption', 'Caption one', {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
    }),
    cardShapeHint('cols 7-12, rows 2-10', 'CHART_CARD_2_BG', 10, 'CHART_2'),
    heading('CHART_2_TITLE', 'cols 7-12, rows 2-3', 'Metric B', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    chartSlot('CHART_2', 'cols 7-12, rows 4-8'),
    slot('CHART_2_CAPTION', 'cols 7-12, rows 8-9', 'caption', 'Caption two', {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
    }),
  ], { mode: 'chart_card_grid' }),

  chart_three_context_v1: layoutBase('chart_three_context_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Quarterly breakdown', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    chartSlot('CHART_1', 'cols 1-4, rows 3-7'),
    body('CONTEXT_1', 'cols 1-4, rows 7-9', P.one, 2, { typography: typo('body', { fontSize: 14 }) }),
    chartSlot('CHART_2', 'cols 5-8, rows 3-7'),
    body('CONTEXT_2', 'cols 5-8, rows 7-9', P.two, 2, { typography: typo('body', { fontSize: 14 }) }),
    chartSlot('CHART_3', 'cols 9-12, rows 3-7'),
    body('CONTEXT_3', 'cols 9-12, rows 7-9', P.three, 2, { typography: typo('body', { fontSize: 14 }) }),
  ], { mode: 'chart_triple_context' }),

  chart_donut_context_v1: layoutBase('chart_donut_context_v1', 'chart', [
    heading('HEADING', 'cols 7-11, rows 2-3', 'Market share', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('BODY', 'cols 7-11, rows 3-8', P.short, 4),
    chartSlot('DONUT_CHART', 'cols 2-6, rows 2-10', { chartType: 'donut' }),
  ], { mode: 'chart_donut_split' }),

  chart_three_donut_v1: layoutBase('chart_three_donut_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Segment mix', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    chartSlot('DONUT_1', 'cols 1-4, rows 3-10', { chartType: 'donut' }),
    chartSlot('DONUT_2', 'cols 5-8, rows 3-10', { chartType: 'donut' }),
    chartSlot('DONUT_3', 'cols 9-12, rows 3-10', { chartType: 'donut' }),
  ], { mode: 'chart_donut_row' }),

  table_single_v1: layoutBase('table_single_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Data table', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    tableSlot('TABLE', 'cols 2-11, rows 3-10'),
  ], { mode: 'table_preview' }),

  table_with_description_v1: layoutBase('table_with_description_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Data table', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('BODY', 'cols 2-11, rows 2-3', P.short, 2),
    tableSlot('TABLE', 'cols 2-11, rows 4-10'),
  ], { mode: 'table_with_desc' }),

  table_two_desc_v1: layoutBase('table_two_desc_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Compare datasets', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    tableSlot('TABLE_1', 'cols 1-6, rows 3-8'),
    body('DESC_1', 'cols 1-6, rows 8-9', P.one, 2, { typography: typo('body', { fontSize: 14 }) }),
    tableSlot('TABLE_2', 'cols 7-12, rows 3-8'),
    body('DESC_2', 'cols 7-12, rows 8-9', P.two, 2, { typography: typo('body', { fontSize: 14 }) }),
  ], { mode: 'table_dual' }),

  table_two_same_header_v1: layoutBase('table_two_same_header_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Side by side', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('TABLE_HEADER', 'cols 1-12, rows 2-3', 'subheading', 'Shared column headers', {
      layer: 10,
      typography: typo('subheading', { fontWeight: 700, align: 'center' }),
    }),
    tableSlot('TABLE_1', 'cols 1-6, rows 4-10'),
    tableSlot('TABLE_2', 'cols 7-12, rows 4-10'),
  ], { mode: 'table_dual_shared_header' }),

  process_linner_horti_v1: layoutBase('process_linner_horti_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'How it works', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('STEP_1_TITLE', 'cols 2-3, rows 4-5', 'heading', 'Phase 1', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_1_BODY', 'cols 2-3, rows 8-10', 'Research and define the problem space.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
    slot('STEP_2_TITLE', 'cols 5-6, rows 4-5', 'heading', 'Phase 2', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_2_BODY', 'cols 5-6, rows 8-10', 'Design and iterate on the solution.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
    slot('STEP_3_TITLE', 'cols 8-9, rows 4-5', 'heading', 'Phase 3', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_3_BODY', 'cols 8-9, rows 8-10', 'Ship, measure, and improve.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
  ], { mode: 'process_linner_horti' }),

  process_linner_horti_four_v1: layoutBase('process_linner_horti_four_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'How it works', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('STEP_1_TITLE', 'cols 1-3, rows 4-5', 'heading', 'Phase 1', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_1_BODY', 'cols 1-3, rows 8-10', 'Research and define.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
    slot('STEP_2_TITLE', 'cols 4-6, rows 4-5', 'heading', 'Phase 2', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_2_BODY', 'cols 4-6, rows 8-10', 'Design and iterate.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
    slot('STEP_3_TITLE', 'cols 7-9, rows 4-5', 'heading', 'Phase 3', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_3_BODY', 'cols 7-9, rows 8-10', 'Build and validate.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
    slot('STEP_4_TITLE', 'cols 10-12, rows 4-5', 'heading', 'Phase 4', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, align: 'center', colorRole: 'primary' }),
    }),
    body('STEP_4_BODY', 'cols 10-12, rows 8-10', 'Launch and scale.', 3, {
      typography: typo('body', { fontSize: 14, align: 'center' }),
    }),
  ], { mode: 'process_linner_horti' }),

  process_linner_numeric_v1: layoutBase('process_linner_numeric_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Process overview', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('STEP_1_NUMBER', 'cols 2-4, rows 3-5', 'stat', '01', {
      layer: 10,
      typography: typo('stat', { fontSize: 72, align: 'center', colorRole: 'accent' }),
      max_lines: 1,
    }),
    slot('STEP_1_TITLE', 'cols 2-4, rows 5-6', 'heading', 'SHAPE TITLE', {
      layer: 10,
      typography: typo('heading', { fontSize: 15, align: 'center', fontWeight: 800 }),
    }),
    body('STEP_1_BODY', 'cols 2-4, rows 6-8', P.one, 3, {
      typography: typo('body', { fontSize: 13, align: 'center' }),
    }),
    slot('STEP_1_ICON', 'cols 2-4, rows 8-9', 'decoration', null, { layer: 8 }),
    slot('STEP_2_NUMBER', 'cols 5-7, rows 3-5', 'stat', '02', {
      layer: 10,
      typography: typo('stat', { fontSize: 72, align: 'center', colorRole: 'primary' }),
      max_lines: 1,
    }),
    slot('STEP_2_TITLE', 'cols 5-7, rows 5-6', 'heading', 'SHAPE TITLE', {
      layer: 10,
      typography: typo('heading', { fontSize: 15, align: 'center', fontWeight: 800 }),
    }),
    body('STEP_2_BODY', 'cols 5-7, rows 6-8', P.two, 3, {
      typography: typo('body', { fontSize: 13, align: 'center' }),
    }),
    slot('STEP_2_ICON', 'cols 5-7, rows 8-9', 'decoration', null, { layer: 8 }),
    slot('STEP_3_NUMBER', 'cols 8-10, rows 3-5', 'stat', '03', {
      layer: 10,
      typography: typo('stat', { fontSize: 72, align: 'center', colorRole: 'accent' }),
      max_lines: 1,
    }),
    slot('STEP_3_TITLE', 'cols 8-10, rows 5-6', 'heading', 'SHAPE TITLE', {
      layer: 10,
      typography: typo('heading', { fontSize: 15, align: 'center', fontWeight: 800 }),
    }),
    body('STEP_3_BODY', 'cols 8-10, rows 6-8', P.three, 3, {
      typography: typo('body', { fontSize: 13, align: 'center' }),
    }),
    slot('STEP_3_ICON', 'cols 8-10, rows 8-9', 'decoration', null, { layer: 8 }),
  ], { mode: 'process_linner_numeric' }),

  metric_single_v1: statLayout('metric_single_v1', 'stat', 1, 'stat_hero', [
    slot('STAT_VALUE', 'cols 3-10, rows 3-6', 'stat', '98%', {
      layer: 10,
      typography: typo('stat', { fontSize: 96, align: 'center' }),
      max_lines: 1,
    }),
    slot('STAT_LABEL', 'cols 3-10, rows 6-7', 'stat_label', 'Customer satisfaction', {
      layer: 10,
      typography: typo('subheading', { align: 'center' }),
      max_lines: 2,
    }),
  ]),

  metric_two_v1: statLayout('metric_two_v1', 'stat', 2, 'stat_row', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    ...statPair(1, 'cols 2-6, rows 4-5', 'cols 2-6, rows 5-7', '98%', 'Customer satisfaction'),
    ...statPair(2, 'cols 7-11, rows 4-5', 'cols 7-11, rows 5-7', '3.2x', 'Average ROI'),
  ]),

  metric_three_v1: statLayout('metric_three_v1', 'stat', 3, 'stat_row', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    ...statPair(1, 'cols 1-4, rows 4-5', 'cols 1-4, rows 5-7', '98%', 'Customer satisfaction'),
    ...statPair(2, 'cols 5-8, rows 4-5', 'cols 5-8, rows 5-7', '3.2x', 'Average ROI'),
    ...statPair(3, 'cols 9-12, rows 4-5', 'cols 9-12, rows 5-7', '500+', 'Active teams'),
  ]),

  metric_four_v1: statLayout('metric_four_v1', 'stat', 4, 'stat_row', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    ...statPair(1, 'cols 1-3, rows 4-5', 'cols 1-3, rows 5-7', '98%', 'Satisfaction'),
    ...statPair(2, 'cols 4-6, rows 4-5', 'cols 4-6, rows 5-7', '3.2x', 'ROI'),
    ...statPair(3, 'cols 7-9, rows 4-5', 'cols 7-9, rows 5-7', '500+', 'Teams'),
    ...statPair(4, 'cols 10-12, rows 4-5', 'cols 10-12, rows 5-7', '24h', 'Response'),
  ]),

  metric_five_v1: statLayout('metric_five_v1', 'stat', 5, 'stat_row', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    ...statPair(1, 'cols 1-2, rows 4-5', 'cols 1-2, rows 5-7', '98%', 'Sat.'),
    ...statPair(2, 'cols 3-5, rows 4-5', 'cols 3-5, rows 5-7', '3.2x', 'ROI'),
    ...statPair(3, 'cols 6-8, rows 4-5', 'cols 6-8, rows 5-7', '500+', 'Teams'),
    ...statPair(4, 'cols 9-10, rows 4-5', 'cols 9-10, rows 5-7', '24h', 'Response'),
    ...statPair(5, 'cols 11-12, rows 4-5', 'cols 11-12, rows 5-7', '12', 'Markets'),
  ]),

  metric_six_para_v1: statLayout('metric_six_para_v1', 'stat', 6, 'stat_six_para', [
    body('BODY', 'cols 1-12, rows 1-2', P.short, 2),
    ...statPair(1, 'cols 1-2, rows 3-4', 'cols 1-2, rows 4-5', '98%', 'Sat.'),
    ...statPair(2, 'cols 3-4, rows 3-4', 'cols 3-4, rows 4-5', '3.2x', 'ROI'),
    ...statPair(3, 'cols 5-6, rows 3-4', 'cols 5-6, rows 4-5', '500+', 'Teams'),
    ...statPair(4, 'cols 7-8, rows 3-4', 'cols 7-8, rows 4-5', '24h', 'Resp.'),
    ...statPair(5, 'cols 9-10, rows 3-4', 'cols 9-10, rows 4-5', '12', 'Mkts'),
    ...statPair(6, 'cols 11-12, rows 3-4', 'cols 11-12, rows 4-5', '4.9', 'Rating'),
  ]),

  metric_three_vertical_v1: statLayout('metric_three_vertical_v1', 'stat', 3, 'stat_vertical', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key metrics', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    ...statPair(1, 'cols 4-9, rows 3-4', 'cols 4-9, rows 4-5', '98%', 'Customer satisfaction'),
    ...statPair(2, 'cols 4-9, rows 5-6', 'cols 4-9, rows 6-7', '3.2x', 'Average ROI'),
    ...statPair(3, 'cols 4-9, rows 7-8', 'cols 4-9, rows 8-9', '500+', 'Active teams'),
  ]),
}

function chartsDataFromSource(layoutId, sourceId, dataVariant, extraPreview = {}) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`chartsDataFromSource: missing source ${sourceId}`)
  }
  const { mode, chartStyle, ...restPreview } = source.preview || {}
  return layoutBase(
    layoutId,
    source.content_type,
    JSON.parse(JSON.stringify(source.slots)),
    { mode, chartStyle, dataVariant, ...restPreview, ...extraPreview }
  )
}

Object.assign(CATALOG, {
  chart_donut_context_right_v1: chartsDataFromSource('chart_donut_context_right_v1', 'chart_donut_context_v1', 'right'),
  chart_exponential_desc_side_v1: chartsDataFromSource('chart_exponential_desc_side_v1', 'chart_exponential_desc_v1', 'side'),
  chart_with_description_side_v1: chartsDataFromSource('chart_with_description_side_v1', 'chart_with_description_v1', 'side'),
  chart_single_split_v1: chartsDataFromSource('chart_single_split_v1', 'chart_single_v1', 'split'),
  chart_three_context_cards_v1: chartsDataFromSource('chart_three_context_cards_v1', 'chart_three_context_v1', 'cards'),
  chart_three_donut_cards_v1: chartsDataFromSource('chart_three_donut_cards_v1', 'chart_three_donut_v1', 'cards'),
  chart_three_cards_v1: chartsDataFromSource('chart_three_cards_v1', 'chart_three_v1', 'cards'),
  chart_two_cards_split_v1: chartsDataFromSource('chart_two_cards_split_v1', 'chart_two_cards_v1', 'split'),
  chart_two_split_v1: chartsDataFromSource('chart_two_split_v1', 'chart_two_v1', 'split'),
  metric_five_cards_v1: chartsDataFromSource('metric_five_cards_v1', 'metric_five_v1', 'cards'),
  metric_four_cards_v1: chartsDataFromSource('metric_four_cards_v1', 'metric_four_v1', 'cards'),
  metric_three_cards_v1: chartsDataFromSource('metric_three_cards_v1', 'metric_three_v1', 'cards'),
  metric_single_split_v1: chartsDataFromSource('metric_single_split_v1', 'metric_single_v1', 'split'),
  metric_six_cards_v1: chartsDataFromSource('metric_six_cards_v1', 'metric_six_para_v1', 'cards'),
  metric_three_vertical_cards_v1: chartsDataFromSource('metric_three_vertical_cards_v1', 'metric_three_vertical_v1', 'cards'),
  metric_two_split_v1: chartsDataFromSource('metric_two_split_v1', 'metric_two_v1', 'split'),
  process_linear_four_cards_v1: chartsDataFromSource('process_linear_four_cards_v1', 'process_linner_horti_four_v1', 'cards'),
  process_linear_horizontal_v2: chartsDataFromSource('process_linear_horizontal_v2', 'process_linner_horti_v1', 'horizontal'),
  process_linear_numeric_cards_v1: chartsDataFromSource('process_linear_numeric_cards_v1', 'process_linner_numeric_v1', 'cards'),
  table_single_cards_v1: chartsDataFromSource('table_single_cards_v1', 'table_single_v1', 'cards'),
  table_two_desc_cards_v1: chartsDataFromSource('table_two_desc_cards_v1', 'table_two_desc_v1', 'cards'),
  table_two_same_header_cards_v1: chartsDataFromSource('table_two_same_header_cards_v1', 'table_two_same_header_v1', 'cards'),
  table_with_description_side_v1: chartsDataFromSource('table_with_description_side_v1', 'table_with_description_v1', 'side'),
})

export default CATALOG

export const CHARTS_DATA_LAYOUT_IDS = Object.keys(CATALOG)
