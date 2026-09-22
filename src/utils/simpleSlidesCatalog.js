/**
 * Simple slides catalog — 33 DECK_LAYOUT v2 schemas (clean, airy, Pitch-style).
 * Side images bleed full height; body copy sized for 3–4 lines.
 */

import {
  slot,
  typo,
  centeredTypo,
  cardShape,
  surfaceHalf,
  overlayScrim,
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
    slot('MAIN_TITLE', 'cols 2-11, rows 4-5', 'heading', 'Presentation Title', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 72, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'center' }),
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'Tagline or company name', {
      layer: 10,
      typography: centeredTypo('subheading', { fontSize: 28, fontWeight: 400, lineHeight: 1.4, verticalAlign: 'flex-start' }),
    }),
  ]),

  title_image_logo_v1: layoutBase('title_image_logo_v1', 'title', [
    slot('LOGO', 'cols 2-4, rows 2-3', 'decoration', 'logo', {
      layer: 2,
      aiOnly: true,
      shapeHint: { aiOnly: true, kind: 'logoPlaceholder', suggestedBehind: 'none' },
    }),
    slot('MAIN_TITLE', 'cols 2-6, rows 4-5', 'heading', 'Presentation title', {
      layer: 10,
      typography: typo('heading', { fontSize: 48, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'center' }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 2-6, rows 6-7', 'subheading', 'Subtitle or company tagline', {
      layer: 10,
      typography: typo('subheading', { fontSize: 22, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start' }),
      max_lines: 2,
    }),
    imageRight('cols 7-12, rows 1-10', 'HERO_IMAGE', 'hero'),
  ]),

  title_hero_left_blob_v1: layoutBase(
    'title_hero_left_blob_v1',
    'title',
    [
      slot('BLOB_GRAPHIC', 'cols 1-12, rows 1-10', 'decoration', null, {
        layer: 2,
        aiOnly: true,
      }),
      slot('MAIN_TITLE', 'cols 2-6, rows 3-5', 'heading', 'Title Hero\nLeft Blob', {
        layer: 10,
        typography: typo('heading', { fontSize: 52, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-6, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: typo('subheading', { fontSize: 22, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('HERO_IMAGE', 'cols 7-12, rows 1-10', 'image', null, {
        layer: 6,
        fit: 'cover',
        imageStyle: 'hero',
        imageMask: { type: 'blob', side: 'right' },
      }),
    ],
    { mode: 'title_hero_left_blob' }
  ),

  title_hero_right_oval_v1: layoutBase(
    'title_hero_right_oval_v1',
    'title',
    [
      slot('OVAL_GRAPHIC', 'cols 1-12, rows 1-10', 'decoration', null, {
        layer: 2,
        aiOnly: true,
      }),
      slot('MAIN_TITLE', 'cols 2-6, rows 3-5', 'heading', 'Title Hero\nRight Oval', {
        layer: 10,
        typography: typo('heading', { fontSize: 56, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-6, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: typo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('HERO_IMAGE', 'cols 7-12, rows 1-10', 'image', null, {
        layer: 6,
        fit: 'cover',
        imageStyle: 'hero',
        borderRadius: 999,
        imageMask: { type: 'oval', side: 'right' },
      }),
    ],
    { mode: 'title_hero_right_oval' }
  ),

  title_hero_left_fade_v1: layoutBase(
    'title_hero_left_fade_v1',
    'title',
    [
      slot('HERO_IMAGE', 'cols 5-12, rows 1-10', 'image', null, {
        layer: 2,
        fit: 'cover',
        imageStyle: 'hero',
        edgeFade: { side: 'left', width: 0.38 },
      }),
      slot('MAIN_TITLE', 'cols 2-6, rows 3-5', 'heading', 'Presentation\nTitle', {
        layer: 10,
        typography: typo('heading', { fontSize: 56, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-6, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: typo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
    ],
    { mode: 'title_hero_left_fade' }
  ),

  title_hero_right_fade_v1: layoutBase(
    'title_hero_right_fade_v1',
    'title',
    [
      slot('HERO_IMAGE', 'cols 1-7, rows 1-10', 'image', null, {
        layer: 2,
        fit: 'cover',
        imageStyle: 'hero',
        edgeFade: { side: 'right', width: 0.38 },
        imageMask: { type: 'fade', side: 'right' },
      }),
      slot('MAIN_TITLE', 'cols 8-12, rows 3-5', 'heading', 'Presentation\nTitle', {
        layer: 10,
        typography: typo('heading', { fontSize: 56, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 8-12, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: typo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
    ],
    { mode: 'title_hero_right_fade' }
  ),

  title_with_logo_v1: layoutBase(
    'title_with_logo_v1',
    'title',
    [
      slot('LOGO', 'cols 2-4, rows 2-3', 'image', null, {
        layer: 5,
        fit: 'contain',
        role: 'logo',
      }),
      slot('MAIN_TITLE', 'cols 2-11, rows 3-5', 'heading', 'Add your presentation title', {
        layer: 10,
        typography: typo('heading', { fontSize: 60, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-11, rows 6-7', 'subheading', 'A comprehensive overview and strategic quarterly roadmap', {
        layer: 10,
        typography: typo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
    ],
    { mode: 'title_with_logo' }
  ),

  title_with_logo_corner_v1: layoutBase(
    'title_with_logo_corner_v1',
    'title',
    [
      slot('LOGO', 'cols 2-4, rows 2-3', 'image', null, {
        layer: 5,
        fit: 'contain',
        role: 'logo',
      }),
      slot('MAIN_TITLE', 'cols 2-11, rows 3-5', 'heading', 'Add your presentation title', {
        layer: 10,
        typography: typo('heading', { fontSize: 60, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-11, rows 6-7', 'subheading', 'A comprehensive overview and strategic quarterly roadmap', {
        layer: 10,
        typography: typo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start', align: 'left' }),
        max_lines: 2,
      }),
    ],
    { mode: 'title_with_logo', variant: 'corner' }
  ),

  title_with_logo_centered_v1: layoutBase(
    'title_with_logo_centered_v1',
    'title',
    [
      slot('LOGO', 'cols 5-8, rows 2-3', 'image', null, {
        layer: 5,
        fit: 'contain',
        role: 'logo',
      }),
      slot('MAIN_TITLE', 'cols 2-11, rows 3-5', 'heading', 'Add your presentation title', {
        layer: 10,
        typography: centeredTypo('heading', { fontSize: 60, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start' }),
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-11, rows 6-7', 'subheading', 'A comprehensive overview and strategic quarterly roadmap', {
        layer: 10,
        typography: centeredTypo('subheading', { fontSize: 26, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start' }),
        max_lines: 2,
      }),
    ],
    { mode: 'title_with_logo', variant: 'centered' }
  ),

  title_fullbleed_v1: layoutBase(
    'title_fullbleed_v1',
    'title',
    [
      slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
      slot('MAIN_TITLE', 'cols 2-11, rows 3-5', 'heading', 'Presentation title', {
        layer: 10,
        typography: { ...centeredTypo('heading', { fontSize: 68, fontWeight: 800, lineHeight: 1.16 }), colorRole: 'textOnImage' },
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 2-11, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: { ...centeredTypo('subheading', { fontSize: 28, fontWeight: 400, lineHeight: 1.4 }), colorRole: 'textOnImageMuted' },
        max_lines: 2,
      }),
    ],
    { mode: 'title_fullbleed' }
  ),

  title_fullbleed_overlay_v1: layoutBase(
    'title_fullbleed_overlay_v1',
    'title',
    [
      slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
      slot('OVERLAY_CARD', 'cols 3-10, rows 3-8', 'decoration', null, {
        layer: 2,
        aiOnly: true,
      }),
      slot('MAIN_TITLE', 'cols 3-10, rows 4-5', 'heading', 'Title Fullbleed\nOverlay', {
        layer: 10,
        typography: { ...centeredTypo('heading', { fontSize: 56, fontWeight: 800, lineHeight: 1.15, verticalAlign: 'flex-start' }), colorRole: 'textOnImage' },
        max_lines: 2,
      }),
      slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'Tagline or company name', {
        layer: 10,
        typography: { ...centeredTypo('subheading', { fontSize: 24, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start' }), colorRole: 'textOnImageMuted' },
        max_lines: 2,
      }),
    ],
    { mode: 'title_fullbleed_overlay' }
  ),

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
    imageRight('cols 7-11, rows 2-9', 'HERO_IMAGE'),
  ]),

  section_left_image_v1: layoutBase('section_left_image_v1', 'image+text', [
    imageLeft('cols 2-6, rows 2-9', 'HERO_IMAGE'),
    heading('HEADING', 'cols 7-11, rows 2-4', 'Section title'),
    body('BODY', 'cols 7-11, rows 4-8', P.one, 4),
  ]),

  wide_image_statement_top_v1: layoutBase('wide_image_statement_top_v1', 'image+text', [
    slot('SUBHEADLINE', 'cols 2-10, rows 1-2', 'subheading', 'Subheadline', {
      layer: 10,
      typography: typo('subheading', { fontSize: 16, fontWeight: 600, colorRole: 'accent' }),
    }),
    slot('STATEMENT', 'cols 2-10, rows 2-5', 'quote', P.short, {
      layer: 10,
      typography: typo('quote', { fontSize: 36, fontWeight: 800, lineHeight: 1.2, colorRole: 'text', color: '#1E293B' }),
      max_lines: 3,
    }),
    slot('HERO_IMAGE', 'cols 1-12, rows 6-10', 'image', null, { layer: 2, fit: 'cover', borderRadius: 0 }),
  ]),

  wide_image_statement_bottom_v1: layoutBase('wide_image_statement_bottom_v1', 'image+text', [
    slot('SUBHEADLINE', 'cols 2-10, rows 1-2', 'subheading', 'Subheadline', {
      layer: 10,
      typography: typo('subheading', { fontSize: 16, fontWeight: 600, colorRole: 'accent' }),
    }),
    slot('STATEMENT', 'cols 2-10, rows 2-6', 'quote', P.short, {
      layer: 10,
      typography: typo('quote', { fontSize: 40, fontWeight: 800, lineHeight: 1.2, colorRole: 'text', color: '#1E293B' }),
      max_lines: 3,
    }),
    slot('HERO_IMAGE', 'cols 1-12, rows 7-10', 'image', null, { layer: 2, fit: 'cover', borderRadius: 0 }),
  ]),

  wide_image_statement_overlay_v1: layoutBase('wide_image_statement_overlay_v1', 'image+text', [
    slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
    slot('OVERLAY_SCRIM', 'cols 1-12, rows 1-10', 'background', null, {
      layer: 1,
      shape: { type: 'rect', fill: { type: 'solid', color: 'rgba(0,0,0,0.5)' } },
    }),
    slot('SUBHEADLINE', 'cols 3-10, rows 4-5', 'subheading', 'Subheadline', {
      layer: 10,
      typography: typo('subheading', { fontSize: 20, fontWeight: 600, colorRole: 'textOnImage', color: '#FFFFFF', align: 'center' }),
    }),
    slot('STATEMENT', 'cols 2-11, rows 5-8', 'quote', P.short, {
      layer: 10,
      typography: typo('quote', { fontSize: 48, fontWeight: 800, lineHeight: 1.2, colorRole: 'textOnImage', color: '#FFFFFF', align: 'center' }),
      max_lines: 3,
    }),
  ], { slideVariant: 'center' }),

  statement_left_v1: layoutBase('statement_left_v1', 'quote', [
    slot(
      'STATEMENT',
      'cols 2-7, rows 3-6',
      'quote',
      'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.',
      {
        layer: 10,
        typography: typo('quote', { fontSize: 30, fontWeight: 700, lineHeight: 1.4 }),
        max_lines: 5,
      }
    ),
    slot('NAME', 'cols 3-7, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 12,
      typography: typo('caption', { fontSize: 18, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE', 'cols 3-7, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 12,
      typography: typo('caption', { fontSize: 15, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('PORTRAIT_IMAGE', 'cols 2-3, rows 8-10', 'image', null, {
      layer: 13,
      fit: 'cover',
      borderRadius: 999,
    }),
  ], { mode: 'statement_left' }),

  statement_large_v1: layoutBase('statement_large_v1', 'quote', [
    slot(
      'STATEMENT',
      'cols 2-10, rows 3-6',
      'quote',
      'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.',
      {
        layer: 10,
        typography: typo('quote', { fontSize: 36, fontWeight: 700, lineHeight: 1.4 }),
        max_lines: 5,
      }
    ),
    slot('NAME', 'cols 3-8, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 12,
      typography: typo('caption', { fontSize: 18, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE', 'cols 3-8, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 12,
      typography: typo('caption', { fontSize: 15, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('PORTRAIT_IMAGE', 'cols 2-3, rows 8-10', 'image', null, {
      layer: 13,
      fit: 'cover',
      borderRadius: 999,
    }),
  ], { mode: 'statement_large' }),

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

  three_cards_image_text_v1: layoutBase('three_cards_image_text_v1', 'image+text', [
    heading('HEADING', 'cols 2-11, rows 2-3', 'Product highlights', { typography: typo('heading', { fontSize: 32 }) }),
    slot('IMAGE_1', 'cols 1-4, rows 3-7', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_1_TITLE', 'cols 1-4, rows 7-8', 'heading', 'Feature A', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_1_BODY', 'cols 1-4, rows 8-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('IMAGE_2', 'cols 5-8, rows 3-7', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_2_TITLE', 'cols 5-8, rows 7-8', 'heading', 'Feature B', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_2_BODY', 'cols 5-8, rows 8-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('IMAGE_3', 'cols 9-12, rows 3-7', 'image', null, { layer: 2, fit: 'cover' }),
    slot('CARD_3_TITLE', 'cols 9-12, rows 7-8', 'heading', 'Feature C', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CARD_3_BODY', 'cols 9-12, rows 8-10', P.short, 3, { typography: typo('body', { fontSize: 14 }) }),
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
    slot('TAG_BADGE', 'cols 1-3, rows 1-2', 'badge', 'CORE CAPABILITIES', { typography: typo('badge', { fontSize: 13, fontWeight: 700 }) }),
    heading('HEADING', 'cols 1-9, rows 1-2', 'Eight key points', { typography: typo('heading', { fontSize: 32 }) }),
    slot('SUBTITLE', 'cols 1-9, rows 2-3', 'subheading', 'Strategic operational framework and execution architecture', { typography: typo('subheading', { fontSize: 15 }) }),
    body('POINT_1_TITLE', 'cols 1-4, rows 3-4', 'Strategic planning', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_1_DESC', 'cols 1-4, rows 4-5', 'Comprehensive roadmapping and KPI alignment across initiatives.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_2_TITLE', 'cols 5-8, rows 3-4', 'Resource optimization', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_2_DESC', 'cols 5-8, rows 4-5', 'Maximizing team throughput and capital deployment efficiency.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_3_TITLE', 'cols 1-4, rows 5-6', 'Rapid deployment', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_3_DESC', 'cols 1-4, rows 6-7', 'Automated CI/CD pipelines delivering zero-downtime updates.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_4_TITLE', 'cols 5-8, rows 5-6', 'Enterprise security', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_4_DESC', 'cols 5-8, rows 6-7', 'End-to-end encryption with granular compliance enforcement.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_5_TITLE', 'cols 1-4, rows 7-8', 'Global telemetry', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_5_DESC', 'cols 1-4, rows 8-9', 'Real-time observability and predictive fault detection network.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_6_TITLE', 'cols 5-8, rows 7-8', 'Data analytics', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_6_DESC', 'cols 5-8, rows 8-9', 'Transforming high-frequency telemetry into business insights.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_7_TITLE', 'cols 1-4, rows 9-10', 'Automated workflow', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_7_DESC', 'cols 1-4, rows 10-11', 'Autonomous orchestration replacing manual operational toil.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    body('POINT_8_TITLE', 'cols 5-8, rows 9-10', 'Continuous support', 1, { typography: typo('body', { fontSize: 15, fontWeight: 700 }) }),
    body('POINT_8_DESC', 'cols 5-8, rows 10-11', 'Round-the-clock proactive monitoring and incident handling.', 2, { typography: typo('caption', { fontSize: 12 }) }),
    imageRight('cols 9-12, rows 1-10', 'HERO_IMAGE'),
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
    slot('TAG_BADGE', 'cols 1-3, rows 1-2', 'badge', 'STRATEGIC FOUNDATION', { typography: typo('badge', { fontSize: 13, fontWeight: 700 }) }),
    heading('HEADING', 'cols 1-12, rows 1-2', 'Three pillars', { typography: typo('heading', { fontSize: 32 }) }),
    slot('SUBTITLE', 'cols 1-12, rows 2-3', 'subheading', 'Core principles driving long-term strategic execution and organizational alignment.', { typography: typo('subheading', { fontSize: 15 }) }),
    slot('ROW_1_CARD', 'cols 1-4, rows 3-10', 'graphic', null, { layer: 2 }),
    heading('ROW_1_TITLE', 'cols 1-4, rows 4-5', 'Pillar 1: Strategy', { typography: typo('heading', { fontSize: 18 }) }),
    body('ROW_1_BODY', 'cols 1-4, rows 5-9', 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the entire organization.', 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('ROW_2_CARD', 'cols 5-8, rows 3-10', 'graphic', null, { layer: 2 }),
    heading('ROW_2_TITLE', 'cols 5-8, rows 4-5', 'Pillar 2: Innovation', { typography: typo('heading', { fontSize: 18 }) }),
    body('ROW_2_BODY', 'cols 5-8, rows 5-9', 'Our approach combines research, design, and storytelling so every initiative earns attention and every message lands with precision.', 3, { typography: typo('body', { fontSize: 14 }) }),
    slot('ROW_3_CARD', 'cols 9-12, rows 3-10', 'graphic', null, { layer: 2 }),
    heading('ROW_3_TITLE', 'cols 9-12, rows 4-5', 'Pillar 3: Acceleration', { typography: typo('heading', { fontSize: 18 }) }),
    body('ROW_3_BODY', 'cols 9-12, rows 5-9', 'From first draft to final delivery, we keep workflows agile, visual, and tightly aligned to your audience and growth milestones.', 3, { typography: typo('body', { fontSize: 14 }) }),
  ], { mode: 'intro_three_para_icons' }),

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
    slot('MAIN_TITLE', 'cols 2-11, rows 4-5', 'heading', 'Minimal title slide', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 56, fontWeight: 700, lineHeight: 1.2, verticalAlign: 'center' }),
      max_lines: 2,
    }),
    slot('SUBTITLE', 'cols 3-10, rows 6-7', 'subheading', 'Optional tagline', {
      layer: 10,
      typography: centeredTypo('subheading', { fontSize: 24, fontWeight: 400, lineHeight: 1.45, verticalAlign: 'flex-start' }),
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
  ], { mode: 'section_divider_split' }),

  bullet_list_dense_v1: layoutBase('bullet_list_dense_v1', 'bullet_list', [
    heading('HEADING', 'cols 1-12, rows 1-2', '5 BULLET POINTS', {
      typography: typo('caption', { fontSize: 20, uppercase: true, color: '#E67E22' }),
      max_lines: 1,
    }),
    body('ITEM_1', 'cols 1-12, rows 2-3', 'You can easily replace this text with your own text. You can easily replace this text with your own text.', 2, {
      typography: typo('body', { fontSize: 13, color: '#FFFFFF' }),
    }),
    body('ITEM_2', 'cols 1-12, rows 3-4', 'You can easily replace this text with your own text. You can easily replace this text with your own text.', 2, {
      typography: typo('body', { fontSize: 13, color: '#FFFFFF' }),
    }),
    body('ITEM_3', 'cols 1-12, rows 4-5', 'You can easily replace this text with your own text. You can easily replace this text with your own text.', 2, {
      typography: typo('body', { fontSize: 13, color: '#FFFFFF' }),
    }),
    body('ITEM_4', 'cols 1-12, rows 5-6', 'You can easily replace this text with your own text. You can easily replace this text with your own text.', 2, {
      typography: typo('body', { fontSize: 13, color: '#FFFFFF' }),
    }),
    body('ITEM_5', 'cols 1-12, rows 6-8', 'You can easily replace this text with your own text. You can easily replace this text with your own text.', 2, {
      typography: typo('body', { fontSize: 13, color: '#FFFFFF' }),
    }),
  ], { mode: 'bullet_list_dense' }),

  bullet_list_numbered_v1: layoutBase('bullet_list_numbered_v1', 'bullet_list', [
    heading('HEADING', 'cols 2-11, rows 1', 'Five Numbers List', {
      typography: centeredTypo('heading', { fontSize: 26 }),
      max_lines: 1,
    }),
    slot('TITLE_1', 'cols 1-4, rows 3', 'heading', 'Caption', {
      layer: 10,
      typography: typo('heading', { fontSize: 14 }),
    }),
    body('ITEM_1', 'cols 1-4, rows 4-5', 'This slide is an editable slide with all your needs.', 3, {
      typography: typo('body', { fontSize: 12 }),
    }),
    slot('TITLE_2', 'cols 5-8, rows 3', 'heading', 'Caption', {
      layer: 10,
      typography: typo('heading', { fontSize: 14 }),
    }),
    body('ITEM_2', 'cols 5-8, rows 4-5', 'This slide is an editable slide with all your needs.', 3, {
      typography: typo('body', { fontSize: 12 }),
    }),
    slot('TITLE_3', 'cols 9-12, rows 3', 'heading', 'Caption', {
      layer: 10,
      typography: typo('heading', { fontSize: 14 }),
    }),
    body('ITEM_3', 'cols 9-12, rows 4-5', 'This slide is an editable slide with all your needs.', 3, {
      typography: typo('body', { fontSize: 12 }),
    }),
    slot('TITLE_4', 'cols 3-6, rows 7', 'heading', 'Caption', {
      layer: 10,
      typography: typo('heading', { fontSize: 14 }),
    }),
    body('ITEM_4', 'cols 3-6, rows 8-9', 'This slide is an editable slide with all your needs.', 3, {
      typography: typo('body', { fontSize: 12 }),
    }),
    slot('TITLE_5', 'cols 7-10, rows 7', 'heading', 'Caption', {
      layer: 10,
      typography: typo('heading', { fontSize: 14 }),
    }),
    body('ITEM_5', 'cols 7-10, rows 8-9', 'This slide is an editable slide with all your needs.', 3, {
      typography: typo('body', { fontSize: 12 }),
    }),
  ], { mode: 'bullet_list_numbered' }),

  bullet_list_two_column_v1: layoutBase('bullet_list_two_column_v1', 'bullet_list', [
    heading('HEADING', 'cols 1-12, rows 1-2', 'Long Agenda List with Two Column Bullet Points', {
      typography: typo('heading', { fontSize: 26 }),
      max_lines: 2,
    }),
    ...[1, 2, 3, 4, 5, 6, 7].flatMap((n) => [
      body(`LEFT_${n}`, `cols 1-6, rows ${n + 2}`, n % 2 === 1 ? 'Put your text here' : 'Add an item description', 1, {
        typography: typo('body', { fontSize: 15 }),
      }),
      body(`RIGHT_${n}`, `cols 7-12, rows ${n + 2}`, n % 2 === 1 ? 'Add an item description' : 'Put your text here', 1, {
        typography: typo('body', { fontSize: 15 }),
      }),
    ]),
  ], { mode: 'bullet_list_two_column' }),

  text_only_centered_v1: layoutBase('text_only_centered_v1', 'bullet_list', [
    slot('BADGE', 'cols 4-9, rows 2', 'eyebrow', 'A NOTE', {
      typography: centeredTypo('caption', { fontSize: 12, uppercase: true }),
    }),
    heading('HEADING', 'cols 2-11, rows 3-5', 'A clear idea, well said.', {
      typography: centeredTypo('heading', { fontSize: 40 }),
      max_lines: 2,
    }),
    body('BODY', 'cols 3-10, rows 6-8', P.short, 4, {
      typography: centeredTypo('body', { fontSize: 16 }),
    }),
  ], { mode: 'text_only_centered' }),

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
  ], { mode: 'text_two_column_cards' }),
}

function simpleSlidesFromSource(layoutId, sourceId, variant, extraPreview = {}) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`simpleSlidesFromSource: missing source ${sourceId}`)
  }
  const { mode, ...restPreview } = source.preview || {}
  const isGrid = source.content_type === 'grid'
  const variantField = isGrid ? { gridVariant: variant } : { slideVariant: variant }
  return layoutBase(
    layoutId,
    source.content_type,
    JSON.parse(JSON.stringify(source.slots)),
    { mode, ...variantField, ...restPreview, ...extraPreview }
  )
}

Object.assign(CATALOG, {
  eight_short_texts_image_right_v1: simpleSlidesFromSource(
    'eight_short_texts_image_right_v1',
    'eight_short_texts_image_v1',
    'right'
  ),
  intro_three_para_icons_horizontal_v1: simpleSlidesFromSource(
    'intro_three_para_icons_horizontal_v1',
    'intro_three_para_icons_v1',
    'horizontal'
  ),
  bullet_list_numbered_vertical_v1: layoutBase('bullet_list_numbered_vertical_v1', 'bullet_list', [
    heading('HEADING', 'cols 1-12, rows 1', '6-Step Curved Block List', {
      typography: typo('heading', { fontSize: 24 }),
      max_lines: 1,
    }),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
      slot(`TITLE_${n}`, `cols 4-9, rows ${n + 1}`, 'heading', 'Lorem Ipsum', {
        layer: 10,
        typography: typo('heading', { fontSize: 13 }),
      }),
      body(`ITEM_${n}`, `cols 4-10, rows ${n + 1}`, 'Lorem ipsum dolor sit amet, nibh est. A magna maecenas, quam magna nec quis.', 2, {
        typography: typo('body', { fontSize: 11 }),
      }),
    ]),
  ], { mode: 'bullet_list_numbered_vertical', slideVariant: 'vertical' }),
  bullet_list_split_v1: layoutBase('bullet_list_split_v1', 'bullet_list', [
    heading('HEADING', 'cols 1-12, rows 1', 'Two-column agenda', {
      typography: typo('heading', { fontSize: 26 }),
      max_lines: 1,
    }),
    slot('LEFT_TITLE', 'cols 1-6, rows 2', 'heading', 'Column A', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    slot('RIGHT_TITLE', 'cols 7-12, rows 2', 'heading', 'Column B', {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
    }),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
      body(`LEFT_${n}`, `cols 1-6, rows ${n + 2}`, n % 2 === 1 ? 'Put your text here' : 'Add an item description', 1, {
        typography: typo('body', { fontSize: 14 }),
      }),
      body(`RIGHT_${n}`, `cols 7-12, rows ${n + 2}`, n % 2 === 1 ? 'Add an item description' : 'Put your text here', 1, {
        typography: typo('body', { fontSize: 14 }),
      }),
    ]),
  ], { mode: 'bullet_list_split', slideVariant: 'split' }),
  four_images_text_mosaic_v1: simpleSlidesFromSource('four_images_text_mosaic_v1', 'four_images_text_v1', 'mosaic'),
  four_para_image_grid_v1: simpleSlidesFromSource('four_para_image_grid_v1', 'four_para_image_v1', 'grid'),
  full_bg_image_overlay_bottom_v1: simpleSlidesFromSource(
    'full_bg_image_overlay_bottom_v1',
    'full_bg_image_overlay_v1',
    'bottom'
  ),
  full_bg_image_overlay_side_v1: simpleSlidesFromSource(
    'full_bg_image_overlay_side_v1',
    'full_bg_image_overlay_v1',
    'side'
  ),
  para_landscape_image_top_v1: simpleSlidesFromSource('para_landscape_image_top_v1', 'para_landscape_image_v1', 'top'),
  para_landscape_image_bottom_v1: simpleSlidesFromSource(
    'para_landscape_image_bottom_v1',
    'para_landscape_image_v1',
    'bottom'
  ),
  para_three_images_horizontal_v1: simpleSlidesFromSource(
    'para_three_images_horizontal_v1',
    'para_three_images_v1',
    'horizontal'
  ),
  para_three_images_staggered_v1: simpleSlidesFromSource(
    'para_three_images_staggered_v1',
    'para_three_images_v1',
    'staggered'
  ),
  para_title_left_image_overlay_v1: simpleSlidesFromSource(
    'para_title_left_image_overlay_v1',
    'para_title_left_image_boxed_v1',
    'overlay'
  ),
  para_title_right_image_overlay_v1: simpleSlidesFromSource(
    'para_title_right_image_overlay_v1',
    'para_title_right_image_boxed_v1',
    'overlay'
  ),
  section_divider_band_full_v1: simpleSlidesFromSource('section_divider_band_full_v1', 'section_divider_band_v1', 'full'),
  section_divider_split_diagonal_v1: layoutBase('section_divider_split_diagonal_v1', 'section_divider', [
    slot('SECTION_NUMBER', 'cols 1-5, rows 2-4', 'stat', '02', {
      typography: typo('stat', { fontSize: 120, color: '#FFFFFF' }),
    }),
    slot('EYEBROW', 'cols 1-5, rows 5', 'caption', 'SECTION', {
      typography: typo('caption', { fontSize: 12, uppercase: true, color: '#FFFFFF' }),
    }),
    heading('HEADING', 'cols 1-5, rows 6-8', 'Next chapter', {
      typography: typo('heading', { fontSize: 36, color: '#FFFFFF' }),
      max_lines: 2,
    }),
    slot('LABEL', 'cols 8-12, rows 4', 'caption', 'IN THIS SECTION', {
      typography: typo('caption', { fontSize: 12, uppercase: true }),
    }),
    body('BODY', 'cols 8-12, rows 5-8', P.short, 5, {
      typography: typo('body', { fontSize: 16 }),
    }),
  ], { mode: 'section_divider_split_diagonal', slideVariant: 'diagonal' }),
  section_divider_split_image_v1: simpleSlidesFromSource(
    'section_divider_split_image_v1',
    'section_divider_split_v1',
    'image',
    { mode: 'section_divider' }
  ),
  section_left_image_fullheight_v1: layoutBase('section_left_image_fullheight_v1', 'image+text', [
    slot('HERO_IMAGE', 'cols 1-6, rows 1-10', 'image', null, { layer: 2, fit: 'cover', imageStyle: 'featured', borderRadius: 0 }),
    heading('HEADING', 'cols 7-11, rows 2-4', 'Section title'),
    body('BODY', 'cols 7-11, rows 4-8', P.one, 4),
  ], { slideVariant: 'fullheight' }),
  section_right_image_fullheight_v1: layoutBase('section_right_image_fullheight_v1', 'image+text', [
    heading('HEADING', 'cols 2-6, rows 2-4', 'Section title'),
    body('BODY', 'cols 2-6, rows 4-8', P.one, 4),
    slot('HERO_IMAGE', 'cols 7-12, rows 1-10', 'image', null, { layer: 2, fit: 'cover', imageStyle: 'featured', borderRadius: 0 }),
  ], { slideVariant: 'fullheight' }),
  text_two_column_split_v1: simpleSlidesFromSource('text_two_column_split_v1', 'text_two_column_v1', 'split'),
  title_statement_split_v1: simpleSlidesFromSource('title_statement_split_v1', 'title_statement_v1', 'split'),
  title_with_logo_corner_v1: simpleSlidesFromSource('title_with_logo_corner_v1', 'title_with_logo_v1', 'corner'),
  title_with_logo_centered_v1: simpleSlidesFromSource('title_with_logo_centered_v1', 'title_with_logo_v1', 'centered'),
  two_para_right_image_bottom_v1: simpleSlidesFromSource(
    'two_para_right_image_bottom_v1',
    'two_para_right_image_v1',
    'bottom'
  ),
})

export default CATALOG

export const SIMPLE_SLIDES_LAYOUT_IDS = Object.keys(CATALOG)
