/**
 * Quotes & testimonials DECK_LAYOUT v2 catalog.
 */
import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  heading,
  body,
  imageLeft,
} from './deckLayoutV2Helpers.js'

const P = {
  short: 'A concise testimonial or supporting line that reinforces credibility without overwhelming the slide.',
}

const CATALOG = {
  quote_portrait_v1: layoutBase('quote_portrait_v1', 'quote', [
    slot('QUOTE', 'cols 5-11, rows 2-6', 'quote', 'Customer quote goes here — keep it under 25 words.', {
      layer: 10,
      typography: typo('quote', { fontSize: 28 }),
      max_lines: 4,
    }),
    slot('ATTRIBUTION', 'cols 5-11, rows 6-7', 'attribution', 'Name, Title', {
      layer: 10,
      typography: typo('caption', { fontWeight: 700 }),
    }),
    imageLeft('cols 1-4, rows 2-8', 'PORTRAIT_IMAGE', 'card'),
  ], { mode: 'quote_attribution' }),

  quote_testimonial_card_v1: layoutBase('quote_testimonial_card_v1', 'quote', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'What customers say', { max_lines: 2 }),
    slot('QUOTE', 'cols 2-11, rows 3-5', 'quote', 'Testimonial quote in a card-friendly length.', {
      layer: 10,
      typography: centeredTypo('quote', { fontSize: 26 }),
      max_lines: 4,
    }),
    slot('ATTRIBUTION', 'cols 2-11, rows 5-6', 'attribution', 'Customer name · Role · Company', {
      layer: 10,
      typography: centeredTypo('caption'),
    }),
    body('BODY', 'cols 3-10, rows 6-8', P.short, 2, {
      typography: centeredTypo('body', { fontSize: 15 }),
    }),
  ], { mode: 'quote_attribution' }),

  quote_grid_v1: layoutBase('quote_grid_v1', 'quote', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Voices from our users', { max_lines: 2 }),
    slot('QUOTE_1', 'cols 1-4, rows 2-5', 'quote', 'Short quote one', {
      layer: 10,
      typography: typo('body', { fontSize: 16, fontStyle: 'italic' }),
      max_lines: 4,
    }),
    slot('ATTR_1', 'cols 1-4, rows 5-6', 'attribution', 'Name · Role', {
      layer: 10,
      typography: typo('caption', { fontSize: 13 }),
    }),
    slot('QUOTE_2', 'cols 5-8, rows 2-5', 'quote', 'Short quote two', {
      layer: 10,
      typography: typo('body', { fontSize: 16, fontStyle: 'italic' }),
      max_lines: 4,
    }),
    slot('ATTR_2', 'cols 5-8, rows 5-6', 'attribution', 'Name · Role', {
      layer: 10,
      typography: typo('caption', { fontSize: 13 }),
    }),
    slot('QUOTE_3', 'cols 9-12, rows 2-5', 'quote', 'Short quote three', {
      layer: 10,
      typography: typo('body', { fontSize: 16, fontStyle: 'italic' }),
      max_lines: 4,
    }),
    slot('ATTR_3', 'cols 9-12, rows 5-6', 'attribution', 'Name · Role', {
      layer: 10,
      typography: typo('caption', { fontSize: 13 }),
    }),
  ], { mode: 'quote_attribution' }),
}

export default CATALOG
