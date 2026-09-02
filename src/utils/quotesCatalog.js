/**
 * Quotes & testimonials DECK_LAYOUT v2 catalog.
 */
import {
  slot,
  typo,
  layoutBase,
  heading,
} from './deckLayoutV2Helpers.js'

const CATALOG = {
  quote_portrait_v1: layoutBase('quote_portrait_v1', 'quote', [
    slot('QUOTE', 'cols 2-10, rows 3-6', 'quote', 'Customer quote goes here — keep it under 25 words.', {
      layer: 10,
      typography: typo('quote', { fontSize: 32, fontWeight: 700, lineHeight: 1.4 }),
      max_lines: 5,
    }),
    slot('NAME', 'cols 3-8, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 11,
      typography: typo('caption', { fontSize: 18, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE', 'cols 3-8, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 11,
      typography: typo('caption', { fontSize: 15, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('PORTRAIT_IMAGE', 'cols 2-3, rows 8-10', 'image', null, {
      layer: 12,
      fit: 'cover',
      borderRadius: 999,
    }),
  ], { mode: 'quote_portrait' }),

  quote_testimonial_card_v1: layoutBase('quote_testimonial_card_v1', 'quote', [
    slot('QUOTE', 'cols 3-10, rows 3-6', 'quote', 'Testimonial quote in a card-friendly length.', {
      layer: 10,
      typography: typo('quote', { fontSize: 26, fontWeight: 600, lineHeight: 1.4 }),
      max_lines: 5,
    }),
    slot('NAME', 'cols 4-9, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 12,
      typography: typo('caption', { fontSize: 18, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE', 'cols 4-9, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 12,
      typography: typo('caption', { fontSize: 15, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('PORTRAIT_IMAGE', 'cols 3-4, rows 8-10', 'image', null, {
      layer: 13,
      fit: 'cover',
      borderRadius: 999,
    }),
  ], { mode: 'quote_testimonial' }),

  quote_attribution_v1: layoutBase('quote_attribution_v1', 'quote', [
    slot(
      'QUOTE',
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
    slot('AVATAR', 'cols 2-3, rows 8-10', 'image', null, {
      layer: 14,
      fit: 'cover',
      borderRadius: 999,
    }),
    slot('PORTRAIT_IMAGE', 'cols 8-12, rows 1-10', 'image', null, {
      layer: 13,
      fit: 'cover',
      borderRadius: 0,
    }),
  ], { mode: 'quote_attribution_split' }),

  quote_grid_v1: layoutBase('quote_grid_v1', 'quote', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Voices from our users', { max_lines: 2 }),
    slot('QUOTE_1', 'cols 1-4, rows 3-6', 'quote', 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.', {
      layer: 10,
      typography: typo('quote', { fontSize: 22, fontWeight: 700, lineHeight: 1.45 }),
      max_lines: 8,
    }),
    slot('NAME_1', 'cols 2-4, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 11,
      typography: typo('caption', { fontSize: 16, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE_1', 'cols 2-4, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 11,
      typography: typo('caption', { fontSize: 13, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('AVATAR_1', 'cols 1-2, rows 8-10', 'image', null, {
      layer: 12,
      fit: 'cover',
      borderRadius: 999,
    }),
    slot('QUOTE_2', 'cols 5-8, rows 3-6', 'quote', 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.', {
      layer: 10,
      typography: typo('quote', { fontSize: 22, fontWeight: 700, lineHeight: 1.45 }),
      max_lines: 8,
    }),
    slot('NAME_2', 'cols 6-8, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 11,
      typography: typo('caption', { fontSize: 16, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE_2', 'cols 6-8, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 11,
      typography: typo('caption', { fontSize: 13, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('AVATAR_2', 'cols 5-6, rows 8-10', 'image', null, {
      layer: 12,
      fit: 'cover',
      borderRadius: 999,
    }),
    slot('QUOTE_3', 'cols 9-12, rows 3-6', 'quote', 'A very nice quote from a very nice client. Ask your client to share some thoughts about this project.', {
      layer: 10,
      typography: typo('quote', { fontSize: 22, fontWeight: 700, lineHeight: 1.45 }),
      max_lines: 8,
    }),
    slot('NAME_3', 'cols 10-12, rows 8-9', 'attribution', 'Gemine Macberry', {
      layer: 11,
      typography: typo('caption', { fontSize: 16, fontWeight: 700, colorRole: 'text' }),
      max_lines: 1,
    }),
    slot('ROLE_3', 'cols 10-12, rows 9-10', 'caption', 'VP of Engineering at Acme Inc.', {
      layer: 11,
      typography: typo('caption', { fontSize: 13, colorRole: 'muted' }),
      max_lines: 2,
    }),
    slot('AVATAR_3', 'cols 9-10, rows 8-10', 'image', null, {
      layer: 12,
      fit: 'cover',
      borderRadius: 999,
    }),
  ], { mode: 'quote_grid' }),
}

export default CATALOG
