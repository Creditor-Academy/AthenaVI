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
    heading('HEADING', 'cols 2-11, rows 1-2', 'Flat Bar Chart', {
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
    heading('HEADING', 'cols 2-11, rows 1-2', 'Revenue vs Forecast', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    slot('LEGEND_1', 'cols 2-3, rows 2-3', 'caption', 'Revenue', {
      layer: 10,
      typography: typo('caption', { fontSize: 14, fontWeight: 600, color: '#6B7280' }),
    }),
    slot('LEGEND_2', 'cols 3-4, rows 2-3', 'caption', 'Forecast', {
      layer: 10,
      typography: typo('caption', { fontSize: 14, fontWeight: 600, color: '#6B7280' }),
    }),
    chartSlot('CHART_1', 'cols 1-12, rows 3-10', { chartType: 'grouped_bar', series: 1 }),
    chartSlot('CHART_2', 'cols 1-12, rows 3-10', { chartType: 'grouped_bar', series: 2 }),
  ], { mode: 'chart_grouped_bar' }),

  chart_three_v1: layoutBase('chart_three_v1', 'chart', [
    heading('HEADING', 'cols 2-9, rows 1-2', 'Insert Your Text Here', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    slot('SUBHEADING', 'cols 2-9, rows 2-3', 'subheading', 'This is a sample text', {
      layer: 10,
      typography: typo('subheading', { fontSize: 14, color: '#9CA3AF' }),
    }),
    slot('LEGEND_1_TITLE', 'cols 10-11, rows 3-4', 'caption', 'Series 1', {
      layer: 10,
      typography: typo('caption', { fontSize: 15, fontWeight: 600 }),
    }),
    body('LEGEND_1_DESC', 'cols 10-11, rows 4-5', SAMPLE_PARA.one, 2, {
      typography: typo('caption', { fontSize: 11 }),
    }),
    slot('LEGEND_2_TITLE', 'cols 10-11, rows 5-6', 'caption', 'Series 2', {
      layer: 10,
      typography: typo('caption', { fontSize: 15, fontWeight: 600 }),
    }),
    body('LEGEND_2_DESC', 'cols 10-11, rows 6-7', SAMPLE_PARA.two, 2, {
      typography: typo('caption', { fontSize: 11 }),
    }),
    slot('LEGEND_3_TITLE', 'cols 10-11, rows 7-8', 'caption', 'Series 3', {
      layer: 10,
      typography: typo('caption', { fontSize: 15, fontWeight: 600 }),
    }),
    body('LEGEND_3_DESC', 'cols 10-11, rows 8-9', SAMPLE_PARA.three, 2, {
      typography: typo('caption', { fontSize: 11 }),
    }),
    chartSlot('CHART_1', 'cols 1-9, rows 3-10', { chartType: 'grouped_bar_3', series: 1 }),
    chartSlot('CHART_2', 'cols 1-9, rows 3-10', { chartType: 'grouped_bar_3', series: 2 }),
    chartSlot('CHART_3', 'cols 1-9, rows 3-10', { chartType: 'grouped_bar_3', series: 3 }),
  ], { mode: 'chart_three_grouped' }),

  chart_two_cards_v1: layoutBase('chart_two_cards_v1', 'chart', [
    slot('BADGE', 'cols 5-8, rows 1-2', 'caption', 'PERFORMANCE OVERVIEW', {
      layer: 10,
      typography: typo('caption', { fontSize: 11, fontWeight: 600, color: '#3B82F6', align: 'center', textTransform: 'uppercase' }),
    }),
    heading('HEADING', 'cols 2-11, rows 1-2', 'Two metrics comparison', {
      typography: typo('heading', { fontSize: 28, align: 'center' }),
    }),
    body('SUBHEADING', 'cols 2-11, rows 2-3', 'A side-by-side look at how the two metrics perform across four key periods.', 1, {
      typography: typo('subheading', { fontSize: 15, color: '#6B7280', align: 'center' }),
    }),
    // Card 1
    heading('CHART_1_TITLE', 'cols 1-6, rows 3-4', 'Metric A', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CHART_1_DESC', 'cols 1-6, rows 4-5', 'This is a sample description for metric A.', 1, {
      typography: typo('body', { fontSize: 12, color: '#6B7280' }),
    }),
    slot('CHART_1_GROWTH', 'cols 5-6, rows 3-4', 'stat', '+12%', {
      layer: 12,
      typography: typo('stat', { fontSize: 16, fontWeight: 600, color: '#10B981', align: 'right' }),
    }),
    chartSlot('CHART_1', 'cols 1-6, rows 5-8'),
    slot('CHART_1_CAPTION', 'cols 1-6, rows 8-9', 'caption', 'Caption one', {
      layer: 10,
      typography: typo('caption', { align: 'center', fontSize: 11, color: '#9CA3AF' }),
    }),
    // Card 2
    heading('CHART_2_TITLE', 'cols 7-12, rows 3-4', 'Metric B', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CHART_2_DESC', 'cols 7-12, rows 4-5', 'This is a sample description for metric B.', 1, {
      typography: typo('body', { fontSize: 12, color: '#6B7280' }),
    }),
    slot('CHART_2_GROWTH', 'cols 11-12, rows 3-4', 'stat', '+8%', {
      layer: 12,
      typography: typo('stat', { fontSize: 16, fontWeight: 600, color: '#10B981', align: 'right' }),
    }),
    chartSlot('CHART_2', 'cols 7-12, rows 5-8'),
    slot('CHART_2_CAPTION', 'cols 7-12, rows 8-9', 'caption', 'Caption two', {
      layer: 10,
      typography: typo('caption', { align: 'center', fontSize: 11, color: '#9CA3AF' }),
    }),
  ], { mode: 'chart_two_cards' }),

  chart_three_context_v1: layoutBase('chart_three_context_v1', 'chart', [
    slot('BADGE', 'cols 1-3, rows 1-2', 'caption', 'QUARTERLY OVERVIEW', {
      layer: 10,
      typography: typo('caption', { fontSize: 10, fontWeight: 600, color: '#3B82F6', align: 'left', textTransform: 'uppercase' }),
    }),
    heading('HEADING', 'cols 1-12, rows 1-2', 'Quarterly breakdown', {
      typography: typo('heading', { fontSize: 42, align: 'left' }),
    }),
    body('SUBHEADING', 'cols 1-12, rows 2-3', 'Tracking progress, performance and key milestones across each quarter.', 1, {
      typography: typo('subheading', { fontSize: 14, color: '#6B7280', align: 'left' }),
    }),
    
    // Card 1
    heading('CARD_1_QUARTER', 'cols 1-4, rows 3-4', 'Q1', {
      typography: typo('heading', { fontSize: 24, color: '#3B82F6' }),
    }),
    slot('CARD_1_SUBTITLE', 'cols 1-4, rows 4-5', 'caption', 'FOUNDATION & FOCUS', {
      layer: 10,
      typography: typo('caption', { fontSize: 11, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase' }),
    }),
    body('CARD_1_DESC', 'cols 1-4, rows 5-6', 'We help teams turn complex ideas into clear narratives that drive decisions.', 2, {
      typography: typo('body', { fontSize: 13, color: '#6B7280' }),
    }),
    chartSlot('CHART_1', 'cols 1-4, rows 6-8'),
    heading('CARD_1_INSIGHT_TITLE', 'cols 1-4, rows 8-9', 'Strong start', {
      typography: typo('heading', { fontSize: 14, color: '#3B82F6' }),
    }),
    body('CARD_1_INSIGHT_DESC', 'cols 1-4, rows 9-10', 'Momentum built across all key areas.', 1, {
      typography: typo('body', { fontSize: 11, color: '#6B7280' }),
    }),
    
    // Card 2
    heading('CARD_2_QUARTER', 'cols 5-8, rows 3-4', 'Q2', {
      typography: typo('heading', { fontSize: 24, color: '#8B5CF6' }),
    }),
    slot('CARD_2_SUBTITLE', 'cols 5-8, rows 4-5', 'caption', 'GROWTH & EXPANSION', {
      layer: 10,
      typography: typo('caption', { fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase' }),
    }),
    body('CARD_2_DESC', 'cols 5-8, rows 5-6', 'Our approach combines research, design, and storytelling so every slide earns attention.', 2, {
      typography: typo('body', { fontSize: 13, color: '#6B7280' }),
    }),
    chartSlot('CHART_2', 'cols 5-8, rows 6-8'),
    heading('CARD_2_INSIGHT_TITLE', 'cols 5-8, rows 8-9', 'Steady growth', {
      typography: typo('heading', { fontSize: 14, color: '#8B5CF6' }),
    }),
    body('CARD_2_INSIGHT_DESC', 'cols 5-8, rows 9-10', 'Consistent improvement across all quarters.', 1, {
      typography: typo('body', { fontSize: 11, color: '#6B7280' }),
    }),
    
    // Card 3
    heading('CARD_3_QUARTER', 'cols 9-12, rows 3-4', 'Q3', {
      typography: typo('heading', { fontSize: 24, color: '#10B981' }),
    }),
    slot('CARD_3_SUBTITLE', 'cols 9-12, rows 4-5', 'caption', 'DELIVERY & IMPACT', {
      layer: 10,
      typography: typo('caption', { fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }),
    }),
    body('CARD_3_DESC', 'cols 9-12, rows 5-6', 'From first draft to final delivery, we keep copy concise, visual, and aligned.', 2, {
      typography: typo('body', { fontSize: 13, color: '#6B7280' }),
    }),
    chartSlot('CHART_3', 'cols 9-12, rows 6-8'),
    heading('CARD_3_INSIGHT_TITLE', 'cols 9-12, rows 8-9', 'High impact', {
      typography: typo('heading', { fontSize: 14, color: '#10B981' }),
    }),
    body('CARD_3_INSIGHT_DESC', 'cols 9-12, rows 9-10', 'Delivered strong results and higher engagement.', 1, {
      typography: typo('body', { fontSize: 11, color: '#6B7280' }),
    }),
  ], { mode: 'chart_three_context' }),

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
    heading('HEADING', 'cols 1-12, rows 1-2', 'Annual Financial Summary Table', {
      typography: typo('heading', { fontSize: 26, fontWeight: 800 }),
    }),
    body('SUBTITLE', 'cols 1-12, rows 2-3', 'Revenue, Cost of Goods, Operations, Gross Profit, EBITDA, Net Income', 1, {
      typography: typo('body', { fontSize: 13, colorRole: 'muted' }),
    }),
    slot('COL_1_HEADER', 'cols 4-5, rows 3-4', 'heading', '20XX', { layer: 12, typography: typo('heading', { fontSize: 20, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_2_HEADER', 'cols 6-7, rows 3-4', 'heading', '20XX', { layer: 12, typography: typo('heading', { fontSize: 20, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_3_HEADER', 'cols 8-9, rows 3-4', 'heading', '20XX', { layer: 12, typography: typo('heading', { fontSize: 20, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_4_HEADER', 'cols 10-11, rows 3-4', 'heading', '20XX', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_4_SUB', 'cols 10-11, rows 4-4', 'caption', 'plan', { layer: 12, typography: typo('caption', { fontSize: 11, fontWeight: 600, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_5_HEADER', 'cols 11-12, rows 3-4', 'heading', '20XX', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_5_SUB', 'cols 11-12, rows 4-4', 'caption', 'fact', { layer: 12, typography: typo('caption', { fontSize: 11, fontWeight: 600, align: 'center', colorRole: 'textOnImage' }) }),

    slot('ROW_1_LABEL', 'cols 2-4, rows 4-5', 'body', 'Revenue', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 600 }) }),
    slot('ROW_2_LABEL', 'cols 2-4, rows 5-6', 'body', 'Cost of Goods Sold', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 600 }) }),
    slot('ROW_3_LABEL', 'cols 2-4, rows 6-7', 'body', 'Gross Profit', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 600 }) }),
    slot('ROW_4_LABEL', 'cols 2-4, rows 7-8', 'body', 'Costs of operations', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 600 }) }),
    slot('ROW_5_LABEL', 'cols 2-4, rows 8-9', 'body', 'EBITDA', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 600 }) }),
    slot('ROW_6_LABEL', 'cols 2-4, rows 9-10', 'body', 'Net Income', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 800 }) }),

    slot('CELL_1_1', 'cols 4-5, rows 4-5', 'stat', '150 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_2', 'cols 6-7, rows 4-5', 'stat', '200 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_3', 'cols 8-9, rows 4-5', 'stat', '210 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_4', 'cols 10-11, rows 4-5', 'stat', '350 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_5', 'cols 11-12, rows 4-5', 'stat', '340 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_2_1', 'cols 4-5, rows 5-6', 'stat', '30 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_2', 'cols 6-7, rows 5-6', 'stat', '60 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_3', 'cols 8-9, rows 5-6', 'stat', '60 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_4', 'cols 10-11, rows 5-6', 'stat', '75 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_5', 'cols 11-12, rows 5-6', 'stat', '80 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_3_1', 'cols 4-5, rows 6-7', 'stat', '120 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_2', 'cols 6-7, rows 6-7', 'stat', '140 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_3', 'cols 8-9, rows 6-7', 'stat', '150 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_4', 'cols 10-11, rows 6-7', 'stat', '190 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_5', 'cols 11-12, rows 6-7', 'stat', '200 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_4_1', 'cols 4-5, rows 7-8', 'stat', '30 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_2', 'cols 6-7, rows 7-8', 'stat', '20 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_3', 'cols 8-9, rows 7-8', 'stat', '10 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_4', 'cols 10-11, rows 7-8', 'stat', '25 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_5', 'cols 11-12, rows 7-8', 'stat', '30 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_5_1', 'cols 4-5, rows 8-9', 'stat', '90 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_2', 'cols 6-7, rows 8-9', 'stat', '120 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_3', 'cols 8-9, rows 8-9', 'stat', '140 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_4', 'cols 10-11, rows 8-9', 'stat', '190 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_5', 'cols 11-12, rows 8-9', 'stat', '190 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_6_1', 'cols 4-5, rows 9-10', 'stat', '70 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 800, align: 'center' }) }),
    slot('CELL_6_2', 'cols 6-7, rows 9-10', 'stat', '100 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 800, align: 'center' }) }),
    slot('CELL_6_3', 'cols 8-9, rows 9-10', 'stat', '110 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 800, align: 'center' }) }),
    slot('CELL_6_4', 'cols 10-11, rows 9-10', 'stat', '200 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 800, align: 'center' }) }),
    slot('CELL_6_5', 'cols 11-12, rows 9-10', 'stat', '210 000 000', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 800, align: 'center' }) }),
  ], { mode: 'table_preview' }),

  table_with_description_v1: layoutBase('table_with_description_v1', 'chart', [
    heading('HEADING', 'cols 1-5, rows 1-2', 'Table Template', {
      typography: typo('heading', { fontSize: 32, fontWeight: 800, align: 'left' }),
    }),
    body('DESCRIPTION', 'cols 5-12, rows 1-2', 'This slide presents a set of customizable table templates designed for clear and structured data presentation. Each row is visually supported by intuitive icons, making it easy to categorize and compare information across different business functions or metrics.', 3, {
      typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'left', colorRole: 'textMuted' }),
    }),

    slot('COL_1_HEADER', 'cols 4-6, rows 3-4', 'heading', 'Add Text Here', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_2_HEADER', 'cols 6-8, rows 3-4', 'heading', 'Add Text Here', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_3_HEADER', 'cols 8-10, rows 3-4', 'heading', 'Add Text Here', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_4_HEADER', 'cols 10-12, rows 3-4', 'heading', 'Add Text Here', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),

    slot('ROW_1_LABEL', 'cols 1-4, rows 4-5', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),
    slot('ROW_2_LABEL', 'cols 1-4, rows 5-6', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),
    slot('ROW_3_LABEL', 'cols 1-4, rows 6-7', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),
    slot('ROW_4_LABEL', 'cols 1-4, rows 7-8', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),
    slot('ROW_5_LABEL', 'cols 1-4, rows 8-9', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),
    slot('ROW_6_LABEL', 'cols 1-4, rows 9-10', 'body', 'Add Text Here', { layer: 12, typography: typo('body', { fontSize: 14, fontWeight: 700, colorRole: 'textOnImage' }) }),

    slot('CELL_1_1', 'cols 4-6, rows 4-5', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_1_2', 'cols 6-8, rows 4-5', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_1_3', 'cols 8-10, rows 4-5', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_1_4', 'cols 10-12, rows 4-5', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    slot('CELL_2_1', 'cols 4-6, rows 5-6', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_2_2', 'cols 6-8, rows 5-6', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_2_3', 'cols 8-10, rows 5-6', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_2_4', 'cols 10-12, rows 5-6', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    slot('CELL_3_1', 'cols 4-6, rows 6-7', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_3_2', 'cols 6-8, rows 6-7', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_3_3', 'cols 8-10, rows 6-7', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_3_4', 'cols 10-12, rows 6-7', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    slot('CELL_4_1', 'cols 4-6, rows 7-8', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_4_2', 'cols 6-8, rows 7-8', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_4_3', 'cols 8-10, rows 7-8', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_4_4', 'cols 10-12, rows 7-8', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    slot('CELL_5_1', 'cols 4-6, rows 8-9', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_5_2', 'cols 6-8, rows 8-9', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_5_3', 'cols 8-10, rows 8-9', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_5_4', 'cols 10-12, rows 8-9', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    slot('CELL_6_1', 'cols 4-6, rows 9-10', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_6_2', 'cols 6-8, rows 9-10', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_6_3', 'cols 8-10, rows 9-10', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('CELL_6_4', 'cols 10-12, rows 9-10', 'body', 'Lorem ipsum dolor\nsit amet', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
  ], { mode: 'table_with_desc' }),

  table_two_desc_v1: layoutBase('table_two_desc_v1', 'chart', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Compare Datasets', {
      typography: typo('heading', { fontSize: 32, fontWeight: 800, align: 'left' }),
    }),
    body('SUBTITLE', 'cols 1-12, rows 2-3', 'Explore the differences and similarities between the two datasets side by side for a clearer understanding.', 1, {
      typography: typo('body', { fontSize: 14, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),

    // Dataset 1
    slot('DATASET_1_TITLE', 'cols 1-4, rows 3-4', 'heading', 'Dataset 1', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 700, align: 'left' }) }),
    slot('DATASET_1_BADGE', 'cols 5-6, rows 3-4', 'badge', 'Source A', { layer: 12, typography: typo('badge', { fontSize: 11, fontWeight: 600, align: 'center', colorRole: 'primary' }) }),
    slot('T1_COL_1_HEADER', 'cols 1-2, rows 4-5', 'heading', 'A', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_COL_2_HEADER', 'cols 3-4, rows 4-5', 'heading', 'B', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_COL_3_HEADER', 'cols 5-6, rows 4-5', 'heading', 'C', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_ROW_1_LABEL', 'cols 1-2, rows 5-6', 'body', 'Row 1', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_1_1', 'cols 3-4, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_1_2', 'cols 5-6, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_ROW_2_LABEL', 'cols 1-2, rows 6-7', 'body', 'Row 2', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_2_1', 'cols 3-4, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_2_2', 'cols 5-6, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_ROW_3_LABEL', 'cols 1-2, rows 7-8', 'body', 'Row 3', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_3_1', 'cols 3-4, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_3_2', 'cols 5-6, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    // Description 1
    slot('DESC_1_TITLE', 'cols 1-6, rows 8-9', 'heading', 'Description 1', { layer: 12, typography: typo('heading', { fontSize: 16, fontWeight: 700, align: 'left' }) }),
    body('DESC_1', 'cols 1-6, rows 9-10', 'Add a short description about Dataset 1 here. You can mention key details, purpose, or any important insights.', 2, {
      typography: typo('body', { fontSize: 12.5, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),

    // Dataset 2
    slot('DATASET_2_TITLE', 'cols 7-10, rows 3-4', 'heading', 'Dataset 2', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 700, align: 'left' }) }),
    slot('DATASET_2_BADGE', 'cols 11-12, rows 3-4', 'badge', 'Source B', { layer: 12, typography: typo('badge', { fontSize: 11, fontWeight: 600, align: 'center', colorRole: 'secondary' }) }),
    slot('T2_COL_1_HEADER', 'cols 7-8, rows 4-5', 'heading', 'A', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_COL_2_HEADER', 'cols 9-10, rows 4-5', 'heading', 'B', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_COL_3_HEADER', 'cols 11-12, rows 4-5', 'heading', 'C', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_ROW_1_LABEL', 'cols 7-8, rows 5-6', 'body', 'Row 1', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_1_1', 'cols 9-10, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_1_2', 'cols 11-12, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_ROW_2_LABEL', 'cols 7-8, rows 6-7', 'body', 'Row 2', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_2_1', 'cols 9-10, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_2_2', 'cols 11-12, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_ROW_3_LABEL', 'cols 7-8, rows 7-8', 'body', 'Row 3', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_3_1', 'cols 9-10, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_3_2', 'cols 11-12, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    // Description 2
    slot('DESC_2_TITLE', 'cols 7-12, rows 8-9', 'heading', 'Description 2', { layer: 12, typography: typo('heading', { fontSize: 16, fontWeight: 700, align: 'left' }) }),
    body('DESC_2', 'cols 7-12, rows 9-10', 'Add a short description about Dataset 2 here. You can mention key details, purpose, or any important insights.', 2, {
      typography: typo('body', { fontSize: 12.5, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),
  ], { mode: 'table_dual' }),

  table_two_same_header_v1: layoutBase('table_two_same_header_v1', 'chart', [
    slot('TAG_BADGE', 'cols 2-5, rows 1-1', 'caption', 'DUAL DATASET COMPARISON', {
      layer: 10,
      typography: typo('caption', { fontSize: 11, fontWeight: 700, colorRole: 'primary' }),
    }),
    heading('HEADING', 'cols 2-11, rows 1-2', 'Side by side', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('SUBTITLE', 'cols 2-11, rows 2-3', 'subheading', 'Shared column headers across both operational datasets', {
      layer: 10,
      typography: typo('subheading', { fontSize: 14, fontWeight: 500, colorRole: 'muted' }),
    }),
    slot('COL_A_HEADER', 'cols 1-3, rows 3-4', 'caption', 'Performance Metric', {
      layer: 10,
      typography: typo('caption', { fontSize: 12, fontWeight: 700 }),
    }),
    slot('COL_B_HEADER', 'cols 3-5, rows 3-4', 'caption', 'Standard Tier', {
      layer: 10,
      typography: typo('caption', { fontSize: 12, fontWeight: 700, align: 'center' }),
    }),
    slot('COL_C_HEADER', 'cols 5-6, rows 3-4', 'caption', 'Enterprise Tier', {
      layer: 10,
      typography: typo('caption', { fontSize: 12, fontWeight: 700, align: 'center' }),
    }),
    slot('T1_TITLE', 'cols 1-6, rows 3-4', 'heading', 'Dataset A — Standard', {
      layer: 10,
      typography: typo('heading', { fontSize: 17, fontWeight: 700 }),
    }),
    slot('T2_TITLE', 'cols 7-12, rows 3-4', 'heading', 'Dataset B — Accelerated', {
      layer: 10,
      typography: typo('heading', { fontSize: 17, fontWeight: 700 }),
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

  process_linear_business_v1: layoutBase('process_linear_business_v1', 'chart', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Linear Business Process Diagram', {
      typography: typo('heading', { fontSize: 26, fontWeight: 800, align: 'left' }),
    }),
    slot('STEP_1_TITLE', 'cols 1-2, rows 3-4', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_1_BODY', 'cols 1-2, rows 4-6', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_2_TITLE', 'cols 3-4, rows 7-8', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_2_BODY', 'cols 3-4, rows 8-10', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_3_TITLE', 'cols 5-6, rows 3-4', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_3_BODY', 'cols 5-6, rows 4-6', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_4_TITLE', 'cols 6-7, rows 7-8', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_4_BODY', 'cols 6-7, rows 8-10', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_5_TITLE', 'cols 8-9, rows 3-4', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_5_BODY', 'cols 8-9, rows 4-6', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_6_TITLE', 'cols 10-11, rows 7-8', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_6_BODY', 'cols 10-11, rows 8-10', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
    slot('STEP_7_TITLE', 'cols 11-12, rows 3-4', 'heading', 'Text goes here', { layer: 10, typography: typo('heading', { fontSize: 14, align: 'center', fontWeight: 800 }) }),
    body('STEP_7_BODY', 'cols 11-12, rows 4-6', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 4, { typography: typo('body', { fontSize: 11, align: 'center', colorRole: 'muted' }) }),
  ], { mode: 'process_linear_business' }),

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
  chart_single_split_v1: layoutBase('chart_single_split_v1', 'chart', [
    heading('HEADING', 'cols 2-6, rows 1-2', 'Flat Bar Chart', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    slot('PANEL_TITLE', 'cols 9-11, rows 4-5', 'heading', 'Sample Text', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, color: '#6B7280' }),
      max_lines: 1,
    }),
    body('PANEL_BODY', 'cols 9-11, rows 5-7', 'This is a sample text. Insert your desired text here.', 3),
    chartSlot('MAIN_CHART', 'cols 2-8, rows 3-10'),
  ], { mode: 'chart_split' }),
  chart_three_context_cards_v1: chartsDataFromSource('chart_three_context_cards_v1', 'chart_three_context_v1', 'cards'),
  chart_three_donut_cards_v1: chartsDataFromSource('chart_three_donut_cards_v1', 'chart_three_donut_v1', 'cards'),
  chart_three_cards_v1: layoutBase('chart_three_cards_v1', 'chart', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Three metrics comparison', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    // Card 1
    cardShapeHint('cols 1-4, rows 3-10', 'CHART_CARD_1_BG', 10, 'CHART_1'),
    heading('CHART_1_TITLE', 'cols 1-4, rows 3-4', 'Metric A', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    chartSlot('CHART_1', 'cols 1-4, rows 4-8'),
    slot('CHART_1_CAPTION', 'cols 1-4, rows 8-10', 'caption', 'Caption one', {
      layer: 10,
      typography: typo('caption', { align: 'center', fontSize: 13 }),
    }),
    // Card 2
    cardShapeHint('cols 5-8, rows 3-10', 'CHART_CARD_2_BG', 10, 'CHART_2'),
    heading('CHART_2_TITLE', 'cols 5-8, rows 3-4', 'Metric B', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    chartSlot('CHART_2', 'cols 5-8, rows 4-8'),
    slot('CHART_2_CAPTION', 'cols 5-8, rows 8-10', 'caption', 'Caption two', {
      layer: 10,
      typography: typo('caption', { align: 'center', fontSize: 13 }),
    }),
    // Card 3
    cardShapeHint('cols 9-12, rows 3-10', 'CHART_CARD_3_BG', 10, 'CHART_3'),
    heading('CHART_3_TITLE', 'cols 9-12, rows 3-4', 'Metric C', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    chartSlot('CHART_3', 'cols 9-12, rows 4-8'),
    slot('CHART_3_CAPTION', 'cols 9-12, rows 8-10', 'caption', 'Caption three', {
      layer: 10,
      typography: typo('caption', { align: 'center', fontSize: 13 }),
    }),
  ], { mode: 'chart_card_grid_three' }),
  chart_two_cards_split_v1: layoutBase('chart_two_cards_split_v1', 'chart', [
    heading('HEADING', 'cols 1-8, rows 1-2', 'Two Metrics Comparison', {
      typography: typo('heading', { fontSize: 36 }),
    }),
    slot('SUBHEADING', 'cols 1-12, rows 2-3', 'subheading', 'A side-by-side view of how Metric A and Metric B perform across four quarters.', {
      layer: 10,
      typography: typo('subheading', { fontSize: 14, color: '#9CA3AF' }),
    }),
    heading('METRIC_A_TITLE', 'cols 2-5, rows 3-4', 'Metric A', {
      typography: typo('heading', { fontSize: 22, fontWeight: 700 }),
    }),
    body('METRIC_A_DESC', 'cols 2-5, rows 4-5', 'This is a sample description for metric A, giving a brief overview of what this metric represents.', 2, {
      typography: typo('body', { fontSize: 11, color: '#6B7280' }),
    }),
    slot('METRIC_A_LABEL', 'cols 2-5, rows 5-6', 'caption', '● Performance Trend', {
      layer: 12,
      typography: typo('caption', { fontSize: 12, color: '#3B82F6', fontWeight: 600 }),
    }),
    chartSlot('CHART_1', 'cols 6-12, rows 3-6'),
    
    heading('METRIC_B_TITLE', 'cols 2-5, rows 7-8', 'Metric B', {
      typography: typo('heading', { fontSize: 22, fontWeight: 700 }),
    }),
    body('METRIC_B_DESC', 'cols 2-5, rows 8-9', 'This is a sample description for metric B, giving a brief overview of what this metric represents.', 2, {
      typography: typo('body', { fontSize: 11, color: '#6B7280' }),
    }),
    slot('METRIC_B_LABEL', 'cols 2-5, rows 9-10', 'caption', '● Performance Trend', {
      layer: 12,
      typography: typo('caption', { fontSize: 12, color: '#8B5CF6', fontWeight: 600 }),
    }),
    chartSlot('CHART_2', 'cols 6-12, rows 7-10'),
  ], { mode: 'chart_metrics_comparison' }),
  chart_two_split_v1: layoutBase('chart_two_split_v1', 'chart', [
    heading('HEADING', 'cols 2-6, rows 1-2', 'Revenue vs Forecast', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    slot('LEGEND_1', 'cols 5-6, rows 2-3', 'caption', 'Revenue', {
      layer: 10,
      typography: typo('caption', { fontSize: 14, fontWeight: 600, color: '#6B7280' }),
    }),
    slot('LEGEND_2', 'cols 6-7, rows 2-3', 'caption', 'Forecast', {
      layer: 10,
      typography: typo('caption', { fontSize: 14, fontWeight: 600, color: '#6B7280' }),
    }),
    slot('PANEL_TITLE', 'cols 9-11, rows 4-5', 'heading', 'Sample Text', {
      layer: 10,
      typography: typo('heading', { fontSize: 18, color: '#6B7280' }),
      max_lines: 1,
    }),
    body('PANEL_BODY', 'cols 9-11, rows 5-7', 'This is a sample text. Insert your desired text here.', 3),
    chartSlot('CHART_1', 'cols 1-8, rows 3-10', { chartType: 'grouped_bar', series: 1 }),
    chartSlot('CHART_2', 'cols 1-8, rows 3-10', { chartType: 'grouped_bar', series: 2 }),
  ], { mode: 'chart_grouped_bar_split' }),
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
  table_single_cards_v1: layoutBase('table_single_cards_v1', 'chart', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Investment Report', {
      typography: typo('heading', { fontSize: 28, fontWeight: 800, align: 'center' }),
    }),
    body('SUBTITLE', 'cols 1-12, rows 2-3', 'This is the sample dummy text insert your desired text here because this is the dummy text.', 1, {
      typography: typo('body', { fontSize: 13, colorRole: 'muted', align: 'center' }),
    }),

    slot('COL_0_HEADER', 'cols 1-2, rows 3-4', 'heading', 'COLUMN 0', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_1_HEADER', 'cols 3-4, rows 3-4', 'heading', 'COLUMN 1', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_2_HEADER', 'cols 5-5, rows 3-4', 'heading', 'COLUMN 2', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_3_HEADER', 'cols 6-7, rows 3-4', 'heading', 'COLUMN 3', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_4_HEADER', 'cols 8-9, rows 3-4', 'heading', 'COLUMN 4', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_5_HEADER', 'cols 10-10, rows 3-4', 'heading', 'COLUMN 5', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_6_HEADER', 'cols 11-12, rows 3-4', 'heading', 'COLUMN 6', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),

    slot('ROW_1_LABEL', 'cols 1-2, rows 4-5', 'body', 'This is the sample', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600 }) }),
    slot('ROW_2_LABEL', 'cols 1-2, rows 5-6', 'body', 'dummy text insert your', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600 }) }),
    slot('ROW_3_LABEL', 'cols 1-2, rows 6-7', 'body', 'desired text here because', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600 }) }),
    slot('ROW_4_LABEL', 'cols 1-2, rows 7-8', 'body', 'this is the dummy text.', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600 }) }),

    slot('CELL_1_1', 'cols 3-4, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_2', 'cols 5-5, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_3', 'cols 6-7, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_4', 'cols 8-9, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_5', 'cols 10-10, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_6', 'cols 11-12, rows 4-5', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_2_1', 'cols 3-4, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_2', 'cols 5-5, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_3', 'cols 6-7, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_4', 'cols 8-9, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_5', 'cols 10-10, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_6', 'cols 11-12, rows 5-6', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_3_1', 'cols 3-4, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_2', 'cols 5-5, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_3', 'cols 6-7, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_4', 'cols 8-9, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_5', 'cols 10-10, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_6', 'cols 11-12, rows 6-7', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('CELL_4_1', 'cols 3-4, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_2', 'cols 5-5, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_3', 'cols 6-7, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_4', 'cols 8-9, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_5', 'cols 10-10, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_6', 'cols 11-12, rows 7-8', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 14, fontWeight: 600, align: 'center' }) }),

    slot('TOTAL_LABEL', 'cols 1-2, rows 8-9', 'heading', 'TOTAL', { layer: 12, typography: typo('heading', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_1', 'cols 3-4, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_2', 'cols 5-5, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_3', 'cols 6-7, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_4', 'cols 8-9, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_5', 'cols 10-10, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
    slot('TOTAL_6', 'cols 11-12, rows 8-9', 'stat', '$100.0', { layer: 12, typography: typo('stat', { fontSize: 15, fontWeight: 800, align: 'center', colorRole: 'textOnImage' }) }),
  ], { mode: 'table_preview', dataVariant: 'cards' }),
  table_two_desc_cards_v1: layoutBase('table_two_desc_cards_v1', 'chart', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Compare Datasets', {
      typography: typo('heading', { fontSize: 32, fontWeight: 800, align: 'left' }),
    }),
    body('SUBTITLE', 'cols 1-12, rows 2-3', 'Explore the differences and similarities between the two datasets side by side for a clearer understanding.', 1, {
      typography: typo('body', { fontSize: 14, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),

    // Dataset 1
    slot('DATASET_1_TITLE', 'cols 1-4, rows 3-4', 'heading', 'Dataset 1', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 700, align: 'left' }) }),
    slot('DATASET_1_SUB', 'cols 1-4, rows 4-4', 'caption', 'Key details and values', { layer: 12, typography: typo('caption', { fontSize: 12, fontWeight: 500, align: 'left', colorRole: 'textMuted' }) }),
    slot('T1_COL_1_HEADER', 'cols 1-2, rows 4-5', 'heading', 'A', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_COL_2_HEADER', 'cols 3-4, rows 4-5', 'heading', 'B', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_COL_3_HEADER', 'cols 5-6, rows 4-5', 'heading', 'C', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T1_ROW_1_LABEL', 'cols 1-2, rows 5-6', 'body', 'Row 1', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_1_1', 'cols 3-4, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_1_2', 'cols 5-6, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_ROW_2_LABEL', 'cols 1-2, rows 6-7', 'body', 'Row 2', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_2_1', 'cols 3-4, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_2_2', 'cols 5-6, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_ROW_3_LABEL', 'cols 1-2, rows 7-8', 'body', 'Row 3', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T1_CELL_3_1', 'cols 3-4, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T1_CELL_3_2', 'cols 5-6, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    // Description 1 inside Card 1
    slot('DESC_1_TITLE', 'cols 1-6, rows 8-9', 'heading', 'Description 1', { layer: 12, typography: typo('heading', { fontSize: 15, fontWeight: 700, align: 'left' }) }),
    body('DESC_1', 'cols 1-6, rows 9-10', 'Add a short description about Dataset 1 here. You can mention key details, purpose, or any important insights.', 2, {
      typography: typo('body', { fontSize: 11.5, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),

    // Dataset 2
    slot('DATASET_2_TITLE', 'cols 7-10, rows 3-4', 'heading', 'Dataset 2', { layer: 12, typography: typo('heading', { fontSize: 18, fontWeight: 700, align: 'left' }) }),
    slot('DATASET_2_SUB', 'cols 7-10, rows 4-4', 'caption', 'Key details and values', { layer: 12, typography: typo('caption', { fontSize: 12, fontWeight: 500, align: 'left', colorRole: 'textMuted' }) }),
    slot('T2_COL_1_HEADER', 'cols 7-8, rows 4-5', 'heading', 'A', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_COL_2_HEADER', 'cols 9-10, rows 4-5', 'heading', 'B', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_COL_3_HEADER', 'cols 11-12, rows 4-5', 'heading', 'C', { layer: 12, typography: typo('heading', { fontSize: 13, fontWeight: 700, align: 'center' }) }),
    slot('T2_ROW_1_LABEL', 'cols 7-8, rows 5-6', 'body', 'Row 1', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_1_1', 'cols 9-10, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_1_2', 'cols 11-12, rows 5-6', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_ROW_2_LABEL', 'cols 7-8, rows 6-7', 'body', 'Row 2', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_2_1', 'cols 9-10, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_2_2', 'cols 11-12, rows 6-7', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_ROW_3_LABEL', 'cols 7-8, rows 7-8', 'body', 'Row 3', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'left' }) }),
    slot('T2_CELL_3_1', 'cols 9-10, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),
    slot('T2_CELL_3_2', 'cols 11-12, rows 7-8', 'body', '—', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 500, align: 'center' }) }),

    // Description 2 inside Card 2
    slot('DESC_2_TITLE', 'cols 7-12, rows 8-9', 'heading', 'Description 2', { layer: 12, typography: typo('heading', { fontSize: 15, fontWeight: 700, align: 'left' }) }),
    body('DESC_2', 'cols 7-12, rows 9-10', 'Add a short description about Dataset 2 here. You can mention key details, purpose, or any important insights.', 2, {
      typography: typo('body', { fontSize: 11.5, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),
  ], { mode: 'table_dual', dataVariant: 'cards' }),
  table_two_same_header_cards_v1: chartsDataFromSource('table_two_same_header_cards_v1', 'table_two_same_header_v1', 'cards'),
  table_with_description_side_v1: layoutBase('table_with_description_side_v1', 'chart', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Table Slide', {
      typography: typo('heading', { fontSize: 32, fontWeight: 800, align: 'center' }),
    }),
    body('SUBTITLE', 'cols 1-12, rows 2-3', 'Make a big impact with our professional slides and charts', 1, {
      typography: typo('body', { fontSize: 14, fontWeight: 500, align: 'center', colorRole: 'textMuted' }),
    }),

    slot('COL_1_HEADER', 'cols 1-2, rows 3-4', 'heading', 'Target', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_2_HEADER', 'cols 3-4, rows 3-4', 'heading', 'Sales', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_3_HEADER', 'cols 5-6, rows 3-4', 'heading', 'Execution', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),
    slot('COL_4_HEADER', 'cols 7-8, rows 3-4', 'heading', 'Control', { layer: 12, typography: typo('heading', { fontSize: 14, fontWeight: 700, align: 'center', colorRole: 'textOnImage' }) }),

    slot('CELL_1_1', 'cols 1-2, rows 4-5', 'body', '10,000', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_2', 'cols 3-4, rows 4-5', 'body', '12,450', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_3', 'cols 5-6, rows 4-5', 'body', '98.5%', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_1_4', 'cols 7-8, rows 4-5', 'body', 'Approved', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),

    slot('CELL_2_1', 'cols 1-2, rows 5-6', 'body', '15,000', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_2', 'cols 3-4, rows 5-6', 'body', '18,200', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_3', 'cols 5-6, rows 5-6', 'body', '94.2%', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_2_4', 'cols 7-8, rows 5-6', 'body', 'Pending', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),

    slot('CELL_3_1', 'cols 1-2, rows 6-7', 'body', '20,000', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_2', 'cols 3-4, rows 6-7', 'body', '24,800', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_3', 'cols 5-6, rows 6-7', 'body', '99.1%', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_3_4', 'cols 7-8, rows 6-7', 'body', 'Complete', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),

    slot('CELL_4_1', 'cols 1-2, rows 7-8', 'body', '25,000', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_2', 'cols 3-4, rows 7-8', 'body', '15,600', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_3', 'cols 5-6, rows 7-8', 'body', '96.4%', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_4_4', 'cols 7-8, rows 7-8', 'body', 'In Review', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),

    slot('CELL_5_1', 'cols 1-2, rows 8-9', 'body', '30,000', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_2', 'cols 3-4, rows 8-9', 'body', '31,500', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_3', 'cols 5-6, rows 8-9', 'body', '97.8%', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),
    slot('CELL_5_4', 'cols 7-8, rows 8-9', 'body', 'Verified', { layer: 12, typography: typo('body', { fontSize: 13, fontWeight: 600, align: 'center' }) }),

    heading('SIDE_HEADING', 'cols 9-12, rows 4-5', 'Project Planning', {
      typography: typo('heading', { fontSize: 22, fontWeight: 800, align: 'left' }),
    }),
    body('BODY', 'cols 9-12, rows 5-8', 'Make a big impact with professional slides, charts, infographics and more. Turn complex data into easy to understand infographics.', 4, {
      typography: typo('body', { fontSize: 13.5, fontWeight: 400, align: 'left', colorRole: 'textMuted' }),
    }),
  ], { mode: 'table_with_desc', dataVariant: 'side' }),
})

export default CATALOG

export const CHARTS_DATA_LAYOUT_IDS = Object.keys(CATALOG)
