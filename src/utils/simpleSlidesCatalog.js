/**
 * Simple slides catalog — 33 DECK_LAYOUT v2 schemas (clean, airy, Pitch-style).
 * Side images bleed full height; body copy sized for 3–4 lines.
 */

import {
  slot,
  typo,
  displayTypo,
  centeredTypo,
  cardShape,
  surfaceHalf,
  overlayScrim,
  ctaPill,
  layoutBase,
  previewSlot,
  SAMPLE_PARA,
  body,
  heading,
  imageRight,
  imageLeft,
  imageBoxed,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

const CATALOG = {
  title_centered_v1: layoutBase('title_centered_v1', 'title', [
    slot('MAIN_TITLE', 'cols 2-11, rows 4-6', 'heading', 'Presentation Title', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 56 }),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-8', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
  ]),

  title_image_logo_v1: layoutBase('title_image_logo_v1', 'title', [
    slot('LOGO', 'cols 2-4, rows 2-3', 'decoration', 'logo', {
      layer: 2,
      aiOnly: true,
      shapeHint: { aiOnly: true, kind: 'logoPlaceholder', suggestedBehind: 'none' },
    }),
    slot('MAIN_TITLE', 'cols 2-6, rows 3-6', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 2,
    }),
    imageRight('cols 7-12, rows 1-10', 'HERO_IMAGE', 'hero'),
  ]),

  title_hero_left_blob_v1: layoutBase('title_hero_left_blob_v1', 'title', [
    slot('HERO_IMAGE', 'cols 1-7, rows 1-10', 'image', null, {
      layer: 2,
      fit: 'cover',
      imageStyle: 'hero',
      imageMask: { type: 'blob', side: 'left' },
    }),
    slot('MAIN_TITLE', 'cols 7-11, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 7-11, rows 5-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: typo('subheading', { fontSize: 22 }),
      max_lines: 2,
    }),
  ]),

  title_hero_right_oval_v1: layoutBase('title_hero_right_oval_v1', 'title', [
    slot('MAIN_TITLE', 'cols 2-6, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 2-6, rows 5-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: typo('subheading', { fontSize: 22 }),
      max_lines: 2,
    }),
    slot('HERO_IMAGE', 'cols 6-12, rows 1-10', 'image', null, {
      layer: 2,
      fit: 'cover',
      imageStyle: 'hero',
      imageMask: { type: 'oval', side: 'right' },
    }),
  ]),

  title_hero_left_fade_v1: layoutBase('title_hero_left_fade_v1', 'title', [
    imageLeft('cols 1-7, rows 1-10', 'HERO_IMAGE', 'hero'),
    slot('MAIN_TITLE', 'cols 7-11, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 7-11, rows 5-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: typo('subheading', { fontSize: 22 }),
      max_lines: 2,
    }),
  ]),

  title_hero_right_fade_v1: layoutBase('title_hero_right_fade_v1', 'title', [
    slot('MAIN_TITLE', 'cols 2-6, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 2-6, rows 5-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: typo('subheading', { fontSize: 22 }),
      max_lines: 2,
    }),
    imageRight('cols 6-12, rows 1-10', 'HERO_IMAGE', 'hero'),
  ]),

  title_fullbleed_v1: layoutBase('title_fullbleed_v1', 'title', [
    slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
    overlayScrim(),
    slot('MAIN_TITLE', 'cols 2-10, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 52 }), colorRole: 'textOnImage' },
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 2-10, rows 5-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: { ...typo('subheading', { fontSize: 24 }), colorRole: 'textOnImageMuted' },
      max_lines: 2,
    }),
  ]),

  title_with_logo_v1: layoutBase('title_with_logo_v1', 'title', [
    slot('LOGO', 'cols 2-4, rows 2-3', 'decoration', 'logo', {
      layer: 2,
      aiOnly: true,
      shapeHint: { aiOnly: true, kind: 'logoPlaceholder', suggestedBehind: 'none' },
    }),
    slot('MAIN_TITLE', 'cols 2-10, rows 4-6', 'heading', 'Add your presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 52 }),
    }),
    slot('FOOTNOTE', 'cols 2-8, rows 7-8', 'caption', 'A small footnote or subheadline', {
      layer: 10,
      typography: typo('caption'),
    }),
  ]),

  section_divider_centered_v1: layoutBase('section_divider_centered_v1', 'section_divider', [
    slot('SECTION_NUMBER', 'cols 5-8, rows 3-4', 'stat', '01', {
      layer: 10,
      typography: centeredTypo('stat', { fontSize: 48 }),
    }),
    slot('HEADING', 'cols 2-11, rows 4-6', 'heading', 'Section Title', {
      layer: 10,
      typography: centeredTypo('heading'),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'A short line that sets up what comes next', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
  ]),

  section_with_image_v1: layoutBase('section_with_image_v1', 'image+text', [
    heading('HEADING', 'cols 2-6, rows 2-4', 'Section title'),
    body('BODY', 'cols 2-6, rows 4-8', P.one, 4),
    imageRight(),
  ]),

  section_right_image_v1: layoutBase('section_right_image_v1', 'image+text', [
    heading('HEADING', 'cols 2-6, rows 2-4', 'Section title'),
    body('BODY', 'cols 2-6, rows 4-8', P.one, 4),
    imageRight(),
  ]),

  section_left_image_v1: layoutBase('section_left_image_v1', 'image+text', [
    imageLeft(),
    heading('HEADING', 'cols 7-11, rows 2-4', 'Section title'),
    body('BODY', 'cols 7-11, rows 4-8', P.one, 4),
  ]),

  wide_image_statement_top_v1: layoutBase('wide_image_statement_top_v1', 'image+text', [
    slot('HERO_IMAGE', 'cols 1-12, rows 1-5', 'image', null, { layer: 2, fit: 'cover' }),
    slot('SUBHEADLINE', 'cols 2-10, rows 6-7', 'subheading', 'Subheadline', {
      layer: 10,
      typography: typo('subheading', { fontWeight: 700 }),
    }),
    slot('STATEMENT', 'cols 2-10, rows 7-10', 'quote', P.short, {
      layer: 10,
      typography: typo('quote'),
      max_lines: 3,
    }),
  ]),

  wide_image_statement_bottom_v1: layoutBase('wide_image_statement_bottom_v1', 'image+text', [
    slot('SUBHEADLINE', 'cols 2-10, rows 2-3', 'subheading', 'Subheadline', {
      layer: 10,
      typography: typo('subheading', { fontWeight: 700 }),
    }),
    slot('STATEMENT', 'cols 2-10, rows 3-6', 'quote', P.short, {
      layer: 10,
      typography: typo('quote'),
      max_lines: 3,
    }),
    slot('HERO_IMAGE', 'cols 1-12, rows 6-10', 'image', null, { layer: 2, fit: 'cover' }),
  ]),

  statement_left_v1: layoutBase('statement_left_v1', 'quote', [
    slot('EYEBROW', 'cols 2-10, rows 3-4', 'eyebrow', 'Section context', {
      layer: 10,
      typography: { ...typo('eyebrow'), letterSpacing: 0.08 },
      max_lines: 1,
    }),
    slot('STATEMENT', 'cols 2-10, rows 4-7', 'quote', P.short, {
      layer: 10,
      typography: typo('quote', { fontSize: 30 }),
      max_lines: 4,
    }),
  ], { mode: 'quote_attribution' }),

  statement_large_v1: layoutBase('statement_large_v1', 'quote', [
    slot('STATEMENT', 'cols 2-10, rows 3-7', 'quote', P.short, {
      layer: 10,
      typography: displayTypo(),
      max_lines: 4,
    }),
  ], { mode: 'quote_attribution' }),

  para_title_left_image_boxed_v1: layoutBase('para_title_left_image_boxed_v1', 'image+text', [
    cardShape('cols 2-5, rows 3-8', 'IMAGE_CARD_BG', 10, 'HERO_IMAGE'),
    imageBoxed('cols 2-5, rows 3-8'),
    heading('HEADING', 'cols 6-10, rows 3-4', 'Describe this slide'),
    body('BODY', 'cols 6-10, rows 4-8', P.one, 4),
  ]),

  para_title_right_image_boxed_v1: layoutBase('para_title_right_image_boxed_v1', 'image+text', [
    heading('HEADING', 'cols 2-6, rows 3-4', 'Describe this slide'),
    body('BODY', 'cols 2-6, rows 4-8', P.one, 4),
    cardShape('cols 8-11, rows 3-8', 'IMAGE_CARD_BG', 10, 'HERO_IMAGE'),
    imageBoxed('cols 8-11, rows 3-8'),
  ]),

  para_landscape_image_v1: layoutBase('para_landscape_image_v1', 'image+text', [
    heading('HEADING', 'cols 2-10, rows 2-3', 'Describe this slide'),
    body('BODY', 'cols 2-10, rows 3-5', P.one, 3),
    slot('HERO_IMAGE', 'cols 2-11, rows 6-10', 'image', null, { layer: 2, fit: 'cover' }),
  ]),

  para_split_50_50_v1: layoutBase('para_split_50_50_v1', 'image+text', [
    imageLeft('cols 1-6, rows 1-10'),
    surfaceHalf('cols 7-12, rows 1-10'),
    heading('HEADING', 'cols 7-11, rows 2-3', 'Describe this slide'),
    body('BODY', 'cols 7-11, rows 4-9', P.one, 4),
  ]),

  two_para_right_image_v1: layoutBase('two_para_right_image_v1', 'image+text', [
    body('BODY_1', 'cols 2-6, rows 2-5', P.one, 4),
    body('BODY_2', 'cols 2-6, rows 5-8', P.two, 4),
    imageRight(),
  ]),

  three_para_image_v1: layoutBase('three_para_image_v1', 'image+text', [
    body('BODY_1', 'cols 2-6, rows 2-4', P.one, 3),
    body('BODY_2', 'cols 2-6, rows 4-6', P.two, 3),
    body('BODY_3', 'cols 2-6, rows 6-8', P.three, 3),
    imageRight(),
  ]),

  four_para_image_v1: layoutBase('four_para_image_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-7, rows 2-3', 'Key points', { typography: typo('heading', { fontSize: 32 }) }),
    body('BULLET_1', 'cols 2-4, rows 4-5', P.one, 3),
    body('BULLET_2', 'cols 2-4, rows 6-7', P.two, 3),
    body('BULLET_3', 'cols 5-7, rows 4-5', P.three, 3),
    body('BULLET_4', 'cols 5-7, rows 6-7', P.four, 3),
    imageRight('cols 8-12, rows 1-10'),
  ]),

  para_two_images_v1: layoutBase('para_two_images_v1', 'image+text', [
    body('BODY_1', 'cols 2-5, rows 2-4', P.one, 3),
    body('BODY_2', 'cols 7-10, rows 2-4', P.two, 3),
    slot('IMAGE_1', 'cols 2-5, rows 4-10', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_2', 'cols 7-10, rows 4-10', 'image', null, { layer: 2, fit: 'cover' }),
  ]),

  para_three_images_v1: layoutBase('para_three_images_v1', 'image+text', [
    body('BODY', 'cols 2-11, rows 2-3', P.short, 2),
    slot('IMAGE_1', 'cols 1-4, rows 4-10', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_2', 'cols 5-8, rows 4-10', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_3', 'cols 9-12, rows 4-10', 'image', null, { layer: 2, fit: 'cover' }),
  ]),

  para_image_cta_v1: layoutBase('para_image_cta_v1', 'closing', [
    body('BODY', 'cols 2-6, rows 2-5', P.short, 4),
    ctaPill('cols 2-5, rows 6-7'),
    slot('CTA', 'cols 2-5, rows 6-7', 'cta', 'Book a demo', { layer: 10, typography: typo('cta') }),
    imageRight(),
  ], { mode: 'closing_cta' }),

  three_cards_image_text_v1: layoutBase('three_cards_image_text_v1', 'image+text', [
    heading('HEADING', 'cols 2-11, rows 2-3', 'Product highlights', { typography: typo('heading', { fontSize: 32 }) }),
    slot('IMAGE_1', 'cols 1-4, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_1_TITLE', 'cols 1-4, rows 6-7', 'heading', 'Feature A', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_1_BODY', 'cols 1-4, rows 7-9', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('IMAGE_2', 'cols 5-8, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_2_TITLE', 'cols 5-8, rows 6-7', 'heading', 'Feature B', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_2_BODY', 'cols 5-8, rows 7-9', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('IMAGE_3', 'cols 9-12, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_3_TITLE', 'cols 9-12, rows 6-7', 'heading', 'Feature C', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_3_BODY', 'cols 9-12, rows 7-9', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
  ]),

  two_cards_image_text_v1: layoutBase('two_cards_image_text_v1', 'image+text', [
    slot('EYEBROW', 'cols 2-10, rows 2-3', 'eyebrow', 'Describe this slide', {
      layer: 10,
      typography: typo('eyebrow'),
    }),
    slot('COL_1_IMAGE', 'cols 2-6, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('COL_1_TITLE', 'cols 2-6, rows 6-7', 'heading', 'Make your point', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('COL_1_BODY', 'cols 2-6, rows 7-9', P.one, 3, { typography: typo('body', { fontSize: 16 }) }),
    slot('COL_2_IMAGE', 'cols 7-11, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('COL_2_TITLE', 'cols 7-11, rows 6-7', 'heading', 'Make another point', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('COL_2_BODY', 'cols 7-11, rows 7-9', P.two, 3, { typography: typo('body', { fontSize: 16 }) }),
  ], { mode: 'two_image_columns' }),

  two_large_image_cards_v1: layoutBase('two_large_image_cards_v1', 'image+text', [
    slot('IMAGE_1', 'cols 2-6, rows 2-5', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_1_TITLE', 'cols 2-6, rows 5-6', 'heading', 'Product one', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('CARD_1_BODY', 'cols 2-6, rows 6-7', P.short, 3, { typography: typo('body', { fontSize: 15 }) }),
    slot('IMAGE_2', 'cols 7-11, rows 2-5', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_2_TITLE', 'cols 7-11, rows 5-6', 'heading', 'Product two', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('CARD_2_BODY', 'cols 7-11, rows 6-7', P.short, 3, { typography: typo('body', { fontSize: 15 }) }),
  ]),

  four_images_text_v1: layoutBase('four_images_text_v1', 'image+text', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Gallery', { typography: typo('heading', { fontSize: 32 }) }),
    slot('IMAGE_1', 'cols 1-3, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_1_LABEL', 'cols 1-3, rows 6-7', 'caption', 'Label 1', { layer: 10, typography: typo('caption') }),
    slot('IMAGE_2', 'cols 4-6, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_2_LABEL', 'cols 4-6, rows 6-7', 'caption', 'Label 2', { layer: 10, typography: typo('caption') }),
    slot('IMAGE_3', 'cols 7-9, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_3_LABEL', 'cols 7-9, rows 6-7', 'caption', 'Label 3', { layer: 10, typography: typo('caption') }),
    slot('IMAGE_4', 'cols 10-12, rows 3-6', 'image', null, { layer: 2, fit: 'cover' }),
    slot('IMAGE_4_LABEL', 'cols 10-12, rows 6-7', 'caption', 'Label 4', { layer: 10, typography: typo('caption') }),
  ]),

  eight_short_texts_image_v1: layoutBase('eight_short_texts_image_v1', 'grid', [
    heading('HEADING', 'cols 2-9, rows 1-2', 'Eight key points', { typography: typo('heading', { fontSize: 32 }) }),
    body('POINT_1_LABEL', 'cols 1-3, rows 3-4', 'Point one', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_2_LABEL', 'cols 4-6, rows 3-4', 'Point two', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_3_LABEL', 'cols 7-9, rows 3-4', 'Point three', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_4_LABEL', 'cols 1-3, rows 4-5', 'Point four', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_5_LABEL', 'cols 4-6, rows 6-7', 'Point five', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_6_LABEL', 'cols 7-9, rows 6-7', 'Point six', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_7_LABEL', 'cols 1-3, rows 7-8', 'Point seven', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    body('POINT_8_LABEL', 'cols 4-6, rows 7-8', 'Point eight', 2, { typography: typo('body', { fontSize: 16, fontWeight: 700 }) }),
    imageRight('cols 10-12, rows 1-10', 'HERO_IMAGE'),
  ], { mode: 'eight_short_texts' }),

  headline_centered_v1: layoutBase('headline_centered_v1', 'title', [
    slot('HEADLINE', 'cols 2-11, rows 3-5', 'heading', 'Opening headline', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 44 }),
    }),
    slot('BODY', 'cols 3-10, rows 5-7', 'body', P.short, {
      layer: 10,
      typography: centeredTypo('body'),
      max_lines: 4,
    }),
    slot('DIVIDER', 'cols 5-8, rows 7-7', 'divider', null, {
      layer: 2,
      aiOnly: true,
      shapeHint: { aiOnly: true, kind: 'accentBar', suggestedBehind: 'none' },
    }),
  ]),

  intro_four_para_v1: layoutBase('intro_four_para_v1', 'bullet_list', [
    slot('INTRO', 'cols 2-10, rows 2-3', 'subheading', 'What we will cover', {
      layer: 10,
      typography: typo('subheading', { fontWeight: 700 }),
    }),
    body('ITEM_1', 'cols 2-10, rows 3-4', '01 · Introduction', 1, { typography: typo('body', { fontWeight: 700 }) }),
    body('ITEM_2', 'cols 2-10, rows 4-5', '02 · Problem & opportunity', 1, { typography: typo('body', { fontWeight: 700 }) }),
    body('ITEM_3', 'cols 2-10, rows 5-6', '03 · Solution & proof', 1, { typography: typo('body', { fontWeight: 700 }) }),
    body('ITEM_4', 'cols 2-10, rows 6-7', '04 · Next steps', 1, { typography: typo('body', { fontWeight: 700 }) }),
  ]),

  intro_three_para_icons_v1: layoutBase('intro_three_para_icons_v1', 'grid', [
    slot('INTRO', 'cols 2-10, rows 2-3', 'subheading', 'Three pillars', {
      layer: 10,
      typography: typo('subheading', { fontWeight: 700 }),
    }),
    slot('ROW_1_TITLE', 'cols 2-4, rows 3-4', 'heading', 'Pillar 1', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('ROW_1_BODY', 'cols 2-4, rows 4-6', P.one, 3, { typography: typo('body', { fontSize: 15 }) }),
    slot('ROW_2_TITLE', 'cols 5-7, rows 3-4', 'heading', 'Pillar 2', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('ROW_2_BODY', 'cols 5-7, rows 4-6', P.two, 3, { typography: typo('body', { fontSize: 15 }) }),
    slot('ROW_3_TITLE', 'cols 8-10, rows 3-4', 'heading', 'Pillar 3', {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
    }),
    body('ROW_3_BODY', 'cols 8-10, rows 4-6', P.three, 3, { typography: typo('body', { fontSize: 15 }) }),
  ]),

  centered_text_cta_v1: layoutBase('centered_text_cta_v1', 'closing', [
    slot('HEADING', 'cols 3-10, rows 3-5', 'heading', 'Thank you', {
      layer: 10,
      typography: centeredTypo('heading'),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 5-6', 'subheading', "Let's build something great together", {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
    ctaPill('cols 4-9, rows 6-7'),
    slot('CTA', 'cols 4-9, rows 6-7', 'cta', 'Book a demo', { layer: 10, typography: typo('cta') }),
    slot('CONTACT', 'cols 4-9, rows 8-9', 'caption', 'hello@company.com', {
      layer: 10,
      typography: centeredTypo('caption'),
    }),
  ], { mode: 'closing_cta' }),

  headline_right_text_v1: layoutBase('headline_right_text_v1', 'image+text', [
    heading('HEADLINE', 'cols 2-6, rows 2-4', 'Section headline'),
    body('BODY', 'cols 7-11, rows 2-8', P.one, 4),
  ]),

  large_image_v1: layoutBase('large_image_v1', 'image+text', [
    slot('HERO_IMAGE', 'cols 2-11, rows 2-9', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CAPTION', 'cols 2-10, rows 9-10', 'caption', 'Image caption', {
      layer: 10,
      typography: typo('caption'),
    }),
  ]),

  full_bg_image_overlay_v1: layoutBase('full_bg_image_overlay_v1', 'image+text', [
    slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
    overlayScrim(),
    slot('MAIN_TITLE', 'cols 2-10, rows 3-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: { ...typo('heading', { fontSize: 52 }), colorRole: 'textOnImage' },
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 2-10, rows 5-6', 'subheading', 'Supporting line or tagline', {
      layer: 10,
      typography: { ...typo('subheading'), colorRole: 'textOnImageMuted' },
    }),
    body('BODY', 'cols 2-10, rows 6-8', P.short, 3, {
      typography: { ...typo('body'), colorRole: 'textOnImageMuted' },
    }),
  ]),

  title_minimal_v1: layoutBase('title_minimal_v1', 'title', [
    slot('MAIN_TITLE', 'cols 2-11, rows 4-6', 'heading', 'Minimal title slide', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 52 }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'Optional tagline', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
  ]),

  title_statement_v1: layoutBase('title_statement_v1', 'title', [
    slot('HEADLINE', 'cols 2-10, rows 3-6', 'heading', 'Bold opening statement', {
      layer: 10,
      typography: typo('heading', { fontSize: 48 }),
      max_lines: 3,
    }),
    body('BODY', 'cols 2-8, rows 6-8', P.short, 3),
  ]),

  section_divider_band_v1: layoutBase('section_divider_band_v1', 'section_divider', [
    slot('BAND', 'cols 1-12, rows 4-6', 'decoration', null, {
      layer: 1,
      shape: { fillColorRole: 'primary' },
    }),
    heading('HEADING', 'cols 2-11, rows 4-6', 'Section break', {
      typography: centeredTypo('heading', { colorRole: 'textOnImage' }),
    }),
  ]),

  section_divider_split_v1: layoutBase('section_divider_split_v1', 'section_divider', [
    heading('HEADING', 'cols 1-6, rows 3-6', 'Next section', {
      typography: typo('heading', { fontSize: 36 }),
    }),
    body('BODY', 'cols 7-11, rows 3-7', P.short, 4),
  ]),

  bullet_list_dense_v1: layoutBase('bullet_list_dense_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Key takeaways', { max_lines: 2 }),
    body('BULLETS', 'cols 2-10, rows 2-9', '• Point one\n• Point two\n• Point three\n• Point four\n• Point five\n• Point six', 8),
  ]),

  bullet_list_numbered_v1: layoutBase('bullet_list_numbered_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Numbered list', { max_lines: 2 }),
    body('ITEM_1', 'cols 2-10, rows 2-3', '1. First priority', 1),
    body('ITEM_2', 'cols 2-10, rows 3-4', '2. Second priority', 1),
    body('ITEM_3', 'cols 2-10, rows 4-5', '3. Third priority', 1),
    body('ITEM_4', 'cols 2-10, rows 5-6', '4. Fourth priority', 1),
    body('ITEM_5', 'cols 2-10, rows 6-7', '5. Fifth priority', 1),
  ]),

  bullet_list_two_column_v1: layoutBase('bullet_list_two_column_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Two-column points', { max_lines: 2 }),
    body('LEFT_BODY', 'cols 1-6, rows 2-9', '• Left column point\n• Another left point\n• Third left point', 6),
    body('RIGHT_BODY', 'cols 7-12, rows 2-9', '• Right column point\n• Another right point\n• Third right point', 6),
  ]),

  text_only_centered_v1: layoutBase('text_only_centered_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 2-4', 'Centered message', {
      typography: centeredTypo('heading'),
    }),
    body('BODY', 'cols 3-10, rows 4-7', P.short, 4, {
      typography: centeredTypo('body'),
    }),
  ]),

  text_two_column_v1: layoutBase('text_two_column_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Two perspectives', { max_lines: 2 }),
    slot('LEFT_TITLE', 'cols 1-6, rows 2-3', 'heading', 'Column A', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('LEFT_BODY', 'cols 1-6, rows 3-9', P.short, 5),
    slot('RIGHT_TITLE', 'cols 7-12, rows 2-3', 'heading', 'Column B', {
      layer: 10,
      typography: typo('heading', { fontSize: 22 }),
    }),
    body('RIGHT_BODY', 'cols 7-12, rows 3-9', P.short, 5),
  ]),

  closing_thank_you_v1: layoutBase('closing_thank_you_v1', 'closing', [
    slot('HEADING', 'cols 2-11, rows 4-6', 'heading', 'Thank you', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 56 }),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'Questions?', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
  ], { mode: 'closing_cta' }),

  closing_contact_cta_v1: layoutBase('closing_contact_cta_v1', 'closing', [
    slot('HEADING', 'cols 2-11, rows 2-4', 'heading', "Let's connect", {
      layer: 10,
      typography: centeredTypo('heading'),
    }),
    slot('CONTACT', 'cols 3-10, rows 4-6', 'contact', 'hello@company.com', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 20 }),
    }),
    ctaPill('cols 4-9, rows 6-7'),
    slot('CTA', 'cols 4-9, rows 6-7', 'cta', 'Get in touch', { layer: 10, typography: typo('cta') }),
  ], { mode: 'closing_cta' }),
}

export default CATALOG

export const SIMPLE_SLIDES_LAYOUT_IDS = Object.keys(CATALOG)
