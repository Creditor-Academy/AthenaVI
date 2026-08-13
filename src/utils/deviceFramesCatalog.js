/**
 * Device frames DECK_LAYOUT v2 catalog — 8 phone / tablet / laptop mockup layouts.
 */

import {
  slot,
  typo,
  layoutBase,
  heading,
  body,
  deviceScreenSlot,
  deviceSplitCopy,
  SAMPLE_PARA,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

const CATALOG = {
  device_phone_horizontal_v1: layoutBase('device_phone_horizontal_v1', 'device_frames', [
    ...deviceSplitCopy('cols 1-6'),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 7-12, rows 4-8', 'phone_landscape', 'PHONE_LANDSCAPE_FRAME'),
  ], { mode: 'device_phone_horizontal' }),

  device_phone_vertical_split_v1: layoutBase('device_phone_vertical_split_v1', 'device_frames', [
    ...deviceSplitCopy('cols 1-6'),
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 9-12, rows 2-9', 'phone', 'PHONE_FRAME'),
  ], { mode: 'device_phone_vertical_split' }),

  device_phone_highlights_v1: layoutBase('device_phone_highlights_v1', 'device_frames', [
    ...deviceScreenSlot('DEVICE_IMAGE', 'cols 5-8, rows 3-9', 'phone', 'PHONE_FRAME'),
    heading('CALLOUT_L_HEADING', 'cols 1-4, rows 3-4', 'A highlight feature', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CALLOUT_L_BODY', 'cols 1-4, rows 4-6', 'Say something about it here.', 2, {
      typography: typo('body', { fontSize: 13 }),
    }),
    heading('CALLOUT_R_HEADING', 'cols 9-12, rows 6-7', 'Another highlight', {
      typography: typo('heading', { fontSize: 18 }),
    }),
    body('CALLOUT_R_BODY', 'cols 9-12, rows 7-9', 'Say something about it here.', 2, {
      typography: typo('body', { fontSize: 13 }),
    }),
  ], { mode: 'device_phone_highlights' }),

  device_phone_triple_v1: layoutBase('device_phone_triple_v1', 'device_frames', [
    ...deviceSplitCopy('cols 1-5'),
    ...deviceScreenSlot('DEVICE_IMAGE_1', 'cols 8-10, rows 2-5', 'phone', 'PHONE_FRAME_1'),
    ...deviceScreenSlot('DEVICE_IMAGE_2', 'cols 9-11, rows 4-7', 'phone', 'PHONE_FRAME_2'),
    ...deviceScreenSlot('DEVICE_IMAGE_3', 'cols 10-12, rows 6-9', 'phone', 'PHONE_FRAME_3'),
  ], { mode: 'device_phone_triple' }),

  device_multi_cluster_v1: layoutBase('device_multi_cluster_v1', 'device_frames', [
    ...deviceScreenSlot('LAPTOP_IMAGE', 'cols 2-5, rows 4-8', 'laptop', 'LAPTOP_FRAME'),
    ...deviceScreenSlot('TABLET_IMAGE', 'cols 4-7, rows 2-7', 'tablet', 'TABLET_FRAME'),
    ...deviceScreenSlot('PHONE_IMAGE', 'cols 6-8, rows 5-9', 'phone', 'PHONE_FRAME'),
    ...deviceScreenSlot('WATCH_IMAGE', 'cols 8-9, rows 6-8', 'watch', 'WATCH_FRAME'),
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
