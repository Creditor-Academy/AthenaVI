/**
 * Device frames DECK_LAYOUT v2 catalog — 8 phone / tablet / laptop mockup layouts.
 */

import {
  typo,
  layoutBase,
  heading,
  body,
  slot,
  deviceScreenSlot,
  deviceSplitCopy,
  SAMPLE_PARA,
} from './deckLayoutV2Helpers.js'
import { HIGHLIGHT_FEATURES } from './devicePhoneHighlightsLayout.js'
import { TRIPLE_COPY } from './devicePhoneTripleLayout.js'

const P = SAMPLE_PARA

const CATALOG = {
  device_phone_horizontal_v1: layoutBase('device_phone_horizontal_v1', 'device_frames', [
    heading('HEADING', 'cols 1-5, rows 3-5', 'Describe this mockup', {
      typography: typo('heading', { fontSize: 42, lineHeight: 1.12 }),
      max_lines: 2,
    }),
    body('BODY', 'cols 1-5, rows 5-8', P.short, 4, {
      typography: typo('body', { fontSize: 18, lineHeight: 1.5 }),
    }),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 6-12, rows 3-8', 'phone_landscape', 'PHONE_LANDSCAPE_FRAME'),
  ], { mode: 'device_phone_horizontal' }),

  device_phone_vertical_split_v1: layoutBase('device_phone_vertical_split_v1', 'device_frames', [
    heading('HEADING', 'cols 2-6, rows 3-5', 'Describe this mockup', {
      typography: typo('heading', { fontSize: 36, lineHeight: 1.15, letterSpacing: -0.02, fontWeight: 700 }),
      max_lines: 2,
      clipToSlot: false,
    }),
    body('BODY', 'cols 2-6, rows 6-8', P.short, 4, {
      typography: typo('body', { fontSize: 16, lineHeight: 1.5 }),
    }),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 8-12, rows 2-9', 'phone', 'PHONE_FRAME'),
  ], { mode: 'device_phone_vertical_split' }),

  device_phone_highlights_v1: layoutBase('device_phone_highlights_v1', 'device_frames', [
    heading('HEADING', 'cols 2-11, rows 1-3', 'Highlights that matter', {
      typography: typo('heading', { fontSize: 36, align: 'center', fontWeight: 800, lineHeight: 1.2 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 5-8, rows 4-9', 'phone', 'PHONE_FRAME'),
    ...HIGHLIGHT_FEATURES.flatMap((feat) => {
      const cols = feat.side === 'L' ? 'cols 1-4' : 'cols 9-12'
      const row = feat.key.endsWith('1') ? 3 : feat.key.endsWith('2') ? 5 : 8
      const align = feat.side === 'L' ? 'right' : 'left'
      return [
        heading(`FEATURE_${feat.key}_HEADING`, `${cols}, rows ${row}-${row + 1}`, feat.heading, {
          typography: typo('heading', { fontSize: 22, align, fontWeight: 700 }),
          max_lines: 1,
        }),
        body(`FEATURE_${feat.key}_BODY`, `${cols}, rows ${row + 1}-${row + 2}`, feat.body, 3, {
          typography: typo('body', { fontSize: 16, align, lineHeight: 1.45 }),
        }),
      ]
    }),
  ], { mode: 'device_phone_highlights' }),

  device_phone_triple_v1: layoutBase('device_phone_triple_v1', 'device_frames', [
    heading('HEADING', 'cols 2-11, rows 2-3', 'Describe this mockup', {
      typography: typo('heading', { fontSize: 36, align: 'center', fontWeight: 800, lineHeight: 1.2 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    heading('HEADING_L', 'cols 1-3, rows 4-5', TRIPLE_COPY[0].heading, {
      typography: typo('heading', { fontSize: 28, fontWeight: 800, lineHeight: 1.15 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    body('BODY_L', 'cols 1-3, rows 5-8', TRIPLE_COPY[0].body, 3, {
      typography: typo('body', { fontSize: 16, lineHeight: 1.45 }),
    }),
    heading('HEADING_R', 'cols 10-12, rows 4-5', TRIPLE_COPY[1].heading, {
      typography: typo('heading', { fontSize: 28, fontWeight: 800, lineHeight: 1.15 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    body('BODY_R', 'cols 10-12, rows 5-8', TRIPLE_COPY[1].body, 3, {
      typography: typo('body', { fontSize: 16, lineHeight: 1.45 }),
    }),
    ...deviceScreenSlot('DEVICE_IMAGE_1', 'cols 4-6, rows 4-9', 'phone', 'PHONE_FRAME_1'),
    ...deviceScreenSlot('DEVICE_IMAGE_2', 'cols 5-8, rows 2-9', 'phone', 'PHONE_FRAME_2'),
    ...deviceScreenSlot('DEVICE_IMAGE_3', 'cols 7-9, rows 4-9', 'phone', 'PHONE_FRAME_3'),
  ], { mode: 'device_phone_triple' }),

  device_multi_cluster_v1: layoutBase('device_multi_cluster_v1', 'device_frames', [
    heading('HEADING', 'cols 1-5, rows 3-4', 'Multi-device', {
      typography: typo('heading', { fontSize: 42, lineHeight: 1.1, fontWeight: 800 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    heading('HEADING_2', 'cols 1-5, rows 4-5', 'experience', {
      typography: typo('heading', { fontSize: 42, lineHeight: 1.1, fontWeight: 800, colorRole: 'primary' }),
      max_lines: 1,
      clipToSlot: false,
    }),
    slot('SUBHEADING', 'cols 1-5, rows 5-6', 'subheading', 'Title 01', {
      layer: 10,
      typography: typo('subheading', { fontSize: 18 }),
      max_lines: 1,
      clipToSlot: false,
    }),
    body('BODY', 'cols 1-5, rows 6-9', 'Description 01', 4, {
      typography: typo('body', { fontSize: 16, lineHeight: 1.5 }),
    }),
    ...deviceScreenSlot('TABLET_IMAGE', 'cols 8-11, rows 2-9', 'tablet', 'TABLET_FRAME'),
    ...deviceScreenSlot('LAPTOP_IMAGE', 'cols 6-10, rows 5-9', 'laptop', 'LAPTOP_FRAME'),
    ...deviceScreenSlot('PHONE_IMAGE', 'cols 10-12, rows 3-8', 'phone', 'PHONE_FRAME'),
    ...deviceScreenSlot('WATCH_IMAGE', 'cols 11-12, rows 6-8', 'watch', 'WATCH_FRAME'),
  ], { mode: 'device_multi_cluster' }),

  device_tablet_centered_v1: layoutBase('device_tablet_centered_v1', 'device_frames', [
    heading('HEADING', 'cols 3-10, rows 1-2', 'Describe this mockup', {
      typography: typo('heading', { fontSize: 32, align: 'center' }),
    }),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 4-9, rows 4-10', 'tablet', 'TABLET_FRAME'),
  ], { mode: 'device_tablet_centered' }),

  device_tablet_split_v1: layoutBase('device_tablet_split_v1', 'device_frames', [
    ...deviceSplitCopy('cols 1-6'),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 8-12, rows 2-9', 'tablet', 'TABLET_FRAME'),
  ], { mode: 'device_tablet_split' }),

  device_laptop_split_v1: layoutBase('device_laptop_split_v1', 'device_frames', [
    ...deviceSplitCopy('cols 1-6'),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 7-12, rows 3-9', 'laptop', 'LAPTOP_FRAME'),
  ], { mode: 'device_laptop_split' }),
}

export default CATALOG
