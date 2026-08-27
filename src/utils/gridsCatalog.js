/**
 * Grids DECK_LAYOUT v2 catalog — 10 bento / mosaic / mixed grid layouts.
 */

import {
  slot,
  typo,
  layoutBase,
  SAMPLE_PARA,
  body,
  heading,
  chartSlot,
  gridImage,
  insightCard,
  cardShapeHint,
  deviceFrameHint,
  statPair,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

const CATALOG = {
  grid_bento_three_v1: layoutBase('grid_bento_three_v1', 'grid', [
    gridImage(1, 'cols 1-6, rows 1-5'),
    gridImage(2, 'cols 1-6, rows 6-10'),
    gridImage(3, 'cols 7-12, rows 1-10'),
  ], { mode: 'grid_bento_three' }),

  grid_bento_four_v1: layoutBase('grid_bento_four_v1', 'grid', [
    gridImage(1, 'cols 1-8, rows 1-5'),
    gridImage(2, 'cols 9-12, rows 1-5'),
    gridImage(3, 'cols 1-4, rows 6-10'),
    gridImage(4, 'cols 5-12, rows 6-10'),
  ], { mode: 'grid_bento_four' }),

  grid_six_images_v1: layoutBase('grid_six_images_v1', 'grid', [
    gridImage(1, 'cols 1-4, rows 1-5'),
    gridImage(2, 'cols 5-8, rows 1-5'),
    gridImage(3, 'cols 9-12, rows 1-5'),
    gridImage(4, 'cols 1-4, rows 6-10'),
    gridImage(5, 'cols 5-8, rows 6-10'),
    gridImage(6, 'cols 9-12, rows 6-10'),
  ], { mode: 'grid_six_images' }),

  grid_text_image_cards_v1: layoutBase('grid_text_image_cards_v1', 'grid', [
    heading('FEATURE_TITLE', 'cols 1-8, rows 1-3', 'Describe this feature', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    body('FEATURE_BODY', 'cols 1-8, rows 3-5', P.short, 3),
    heading('POINT_TITLE', 'cols 9-12, rows 1-2', 'Describe this point', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('POINT_BODY', 'cols 9-12, rows 2-4', P.short, 2, { typography: typo('body', { fontSize: 14 }) }),
    slot('POINT_IMAGE', 'cols 9-12, rows 5-6', 'image', null, { layer: 2, fit: 'cover' }),
    gridImage(1, 'cols 1-4, rows 6-10'),
    gridImage(2, 'cols 5-8, rows 6-10'),
    gridImage(3, 'cols 9-12, rows 7-10'),
  ], { mode: 'grid_text_image_cards' }),

  grid_three_images_text_v1: layoutBase('grid_three_images_text_v1', 'grid', [
    gridImage(1, 'cols 1-4, rows 1-5'),
    gridImage(2, 'cols 5-8, rows 1-5'),
    gridImage(3, 'cols 9-12, rows 1-5'),
    body('BODY_1', 'cols 1-4, rows 6-8', P.one, 3),
    body('BODY_2', 'cols 5-8, rows 6-8', P.two, 3),
    body('BODY_3', 'cols 9-12, rows 6-8', P.three, 3),
  ], { mode: 'grid_three_images_text' }),

  grid_images_text_cards_v1: layoutBase('grid_images_text_cards_v1', 'grid', [
    slot('COL_1_IMAGE', 'cols 1-4, rows 2-6', 'image', null, { layer: 2, fit: 'cover' }),
    heading('COL_1_TITLE', 'cols 1-4, rows 6-7', 'Feature A', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('COL_1_BODY', 'cols 1-4, rows 7-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('COL_2_IMAGE', 'cols 5-8, rows 2-6', 'image', null, { layer: 2, fit: 'cover' }),
    heading('COL_2_TITLE', 'cols 5-8, rows 6-7', 'Feature B', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('COL_2_BODY', 'cols 5-8, rows 7-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('COL_3_IMAGE', 'cols 9-12, rows 2-6', 'image', null, { layer: 2, fit: 'cover' }),
    heading('COL_3_TITLE', 'cols 9-12, rows 6-7', 'Feature C', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('COL_3_BODY', 'cols 9-12, rows 7-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
  ], { mode: 'grid_images_text_cards' }),

  grid_insights_chart_v1: layoutBase('grid_insights_chart_v1', 'grid', [
    ...insightCard(1, 1, 3),
    ...insightCard(2, 4, 6),
    ...insightCard(3, 7, 9),
    cardShapeHint('cols 1-9, rows 5-10', 'CHART_CARD_BG', 10, 'BAR_CHART'),
    heading('CHART_HEADING', 'cols 1-9, rows 5-6', 'Revenue growth', {
      typography: typo('heading', { fontSize: 24 }),
    }),
    chartSlot('BAR_CHART', 'cols 1-9, rows 7-10'),
    slot('CHART_CAPTION', 'cols 1-9, rows 10-10', 'caption', 'Monthly performance', {
      layer: 10,
      typography: typo('caption'),
    }),
    cardShapeHint('cols 10-12, rows 1-10', 'POINT_CARD_BG', 10, 'POINT_IMAGE'),
    heading('POINT_HEADING', 'cols 10-12, rows 1-2', 'Key takeaway', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('POINT_BODY', 'cols 10-12, rows 3-5', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('POINT_IMAGE', 'cols 10-12, rows 6-10', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'grid_insights_chart' }),

  grid_metrics_mobile_v1: layoutBase('grid_metrics_mobile_v1', 'grid', [
    heading('FEATURE_TITLE', 'cols 1-8, rows 1-2', 'Describe this feature', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('FEATURE_BODY', 'cols 1-8, rows 2-4', P.short, 3),
    ...statPair(1, 'cols 1-4, rows 5-6', 'cols 1-4, rows 6-7', '100k', 'Add a key metric here'),
    ...statPair(2, 'cols 5-8, rows 5-6', 'cols 5-8, rows 6-7', '95%', 'Add another key metric'),
    deviceFrameHint('cols 9-12, rows 1-10', 'phone', 'PHONE_FRAME', 'DEVICE_IMAGE'),
    slot('DEVICE_IMAGE', 'cols 9-12, rows 2-9', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'grid_metrics_mobile' }),

  grid_metrics_masonry_v1: layoutBase('grid_metrics_masonry_v1', 'grid', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Performance highlights', {
      typography: typo('heading', { fontSize: 28 }),
    }),

    // Left feature / para card
    cardShapeHint('cols 2-6, rows 3-7', 'METRIC_CARD_1_BG', 12, 'METRIC_TITLE_1'),
    heading('METRIC_TITLE_1', 'cols 2-6, rows 3-4', 'Describe this feature', {
      typography: typo('heading', { fontSize: 18, colorRole: 'text' }),
    }),
    body('METRIC_BODY_1', 'cols 2-6, rows 4-7', P.short, 4, {
      typography: typo('body', { fontSize: 14, colorRole: 'muted' }),
    }),

    // Top-right stat (95%) — 2 rows tall so large numbers never clip
    cardShapeHint('cols 7-11, rows 3-5', 'METRIC_CARD_2_BG', 12, 'STAT_2_VALUE'),
    slot('STAT_2_VALUE', 'cols 7-9, rows 3-5', 'stat', '95%', {
      layer: 10,
      typography: typo('stat', { fontSize: 40, align: 'left', colorRole: 'accent', fontWeight: 900 }),
      max_lines: 1,
    }),
    slot('STAT_2_LABEL', 'cols 9-11, rows 3-5', 'stat_label', 'Explain the meaning of this metric', {
      layer: 10,
      typography: typo('caption', { align: 'left', fontSize: 14, colorRole: 'muted' }),
      max_lines: 3,
    }),

    // Square image (2 cols × 3 rows ≈ square on 16:9) — no card chrome
    slot('METRIC_IMAGE_2', 'cols 7-8, rows 6-8', 'image', null, {
      layer: 2,
      fit: 'cover',
      imageStyle: 'card',
      borderRadius: 12,
    }),

    // Bottom-left wide stat (100k)
    cardShapeHint('cols 2-8, rows 9-10', 'METRIC_CARD_4_BG', 12, 'STAT_1_VALUE'),
    slot('STAT_1_VALUE', 'cols 2-4, rows 9-10', 'stat', '100k', {
      layer: 10,
      typography: typo('stat', { fontSize: 40, align: 'left', colorRole: 'accent', fontWeight: 900 }),
      max_lines: 1,
    }),
    slot('STAT_1_LABEL', 'cols 5-8, rows 9-10', 'stat_label', 'Explain the meaning of this metric', {
      layer: 10,
      typography: typo('caption', { align: 'left', fontSize: 15, colorRole: 'muted' }),
      max_lines: 3,
    }),

    // Right tall para card
    cardShapeHint('cols 9-11, rows 6-10', 'METRIC_CARD_5_BG', 12, 'METRIC_TITLE_3'),
    heading('METRIC_TITLE_3', 'cols 9-11, rows 6-7', 'Describe this feature', {
      typography: typo('heading', { fontSize: 18, colorRole: 'text' }),
    }),
    body('METRIC_BODY_3', 'cols 9-11, rows 7-10', P.short, 4, {
      typography: typo('body', { fontSize: 14, colorRole: 'muted' }),
    }),
  ], { mode: 'grid_metrics_masonry' }),

  grid_device_mockups_v1: layoutBase('grid_device_mockups_v1', 'grid', [
    heading('FEATURE_1_TITLE', 'cols 1-6, rows 1-2', 'Describe this feature', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('FEATURE_1_BODY', 'cols 1-6, rows 2-3', P.short, 2, { typography: typo('body', { fontSize: 14 }) }),
    deviceFrameHint('cols 1-6, rows 3-6', 'laptop', 'LAPTOP_FRAME_1', 'DEVICE_L_1'),
    slot('DEVICE_L_1', 'cols 1-6, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    heading('FEATURE_2_TITLE', 'cols 1-6, rows 6-7', 'Describe this feature', {
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('FEATURE_2_BODY', 'cols 1-6, rows 7-8', P.short, 2, { typography: typo('body', { fontSize: 14 }) }),
    deviceFrameHint('cols 1-6, rows 8-10', 'laptop', 'LAPTOP_FRAME_2', 'DEVICE_L_2'),
    slot('DEVICE_L_2', 'cols 1-6, rows 8-10', 'image', null, { layer: 2, fit: 'cover' }),
    deviceFrameHint('cols 7-12, rows 1-10', 'phone', 'PHONE_FRAME', 'DEVICE_R'),
    slot('DEVICE_R', 'cols 7-12, rows 2-9', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'grid_device_mockups' }),

  logo_wall_v1: layoutBase('logo_wall_v1', 'grid', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Trusted by leading teams', {
      typography: typo('heading', { fontSize: 28, align: 'center' }),
    }),
    slot('IMAGE_1', 'cols 1-3, rows 3-5', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_2', 'cols 4-6, rows 3-5', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_3', 'cols 7-9, rows 3-5', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_4', 'cols 10-12, rows 3-5', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_5', 'cols 2-4, rows 5-7', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_6', 'cols 5-7, rows 5-7', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_7', 'cols 8-10, rows 5-7', 'image', null, { layer: 2, fit: 'contain' }),
  ], { mode: 'grid_six_images' }),

  logo_partner_strip_v1: layoutBase('logo_partner_strip_v1', 'grid', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Partners', {
      typography: typo('heading', { fontSize: 24, align: 'center' }),
    }),
    slot('IMAGE_1', 'cols 2-4, rows 4-6', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_2', 'cols 5-7, rows 4-6', 'image', null, { layer: 2, fit: 'contain' }),
    slot('IMAGE_3', 'cols 8-10, rows 4-6', 'image', null, { layer: 2, fit: 'contain' }),
  ], { mode: 'grid_three_images' }),
}

export default CATALOG

export const GRIDS_LAYOUT_IDS = Object.keys(CATALOG)
