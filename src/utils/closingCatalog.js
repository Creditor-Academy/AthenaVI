/**
 * Closing DECK_LAYOUT v2 catalog — 15 contact / thank-you / CTA layouts.
 */

import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  ctaPill,
  overlayScrim,
  SAMPLE_PARA,
  body,
  heading,
  imageLeft,
  imageRight,
  contactInfoFields,
} from './deckLayoutV2Helpers.js'

const P = SAMPLE_PARA

const CATALOG = {
  contact_left_image_v1: layoutBase('contact_left_image_v1', 'closing', [
    slot('CONTACT_IMAGE', 'cols 1-6, rows 1-10', 'image', null, { layer: 2, fit: 'cover' }),
    ...contactInfoFields(7, 11),
  ], { mode: 'contact_split_left' }),

  contact_right_image_v1: layoutBase('contact_right_image_v1', 'closing', [
    ...contactInfoFields(2, 6),
    slot('CONTACT_IMAGE', 'cols 7-12, rows 1-10', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'contact_split_right' }),

  contact_image_bottom_v1: layoutBase('contact_image_bottom_v1', 'closing', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Contact me', {
      typography: centeredTypo('heading', { fontSize: 32 }),
    }),
    slot('CONTACT_ADDRESS', 'cols 3-10, rows 3-4', 'body', '123 Main Street\nCity, State 12345', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
    slot('CONTACT_PHONE', 'cols 3-10, rows 4-5', 'body', '+1 (555) 123-4567', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 1,
    }),
    slot('CONTACT_EMAIL', 'cols 3-10, rows 5-6', 'body', 'hello@example.com', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 14 }),
      max_lines: 1,
    }),
    slot('CONTACT_IMAGE', 'cols 1-12, rows 6-10', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'contact_split_bottom' }),

  team_speaker_bio_v1: layoutBase('team_speaker_bio_v1', 'closing', [
    slot('MEMBER_1_IMAGE', 'cols 1-5, rows 2-9', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_1_NAME', 'cols 6-11, rows 2-3', 'heading', 'Speaker name', {
      layer: 10,
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('MEMBER_1_ROLE', 'cols 6-11, rows 3-4', 'subheading', 'Title · Organization', {
      layer: 10,
      typography: typo('subheading'),
    }),
    body('MEMBER_1_BIO', 'cols 6-11, rows 4-9', 'Speaker bio with credentials and talk focus.', 6),
  ], { mode: 'speaker_bio_left' }),

  speaker_bio_image_right_v1: layoutBase('speaker_bio_image_right_v1', 'closing', [
    slot('MEMBER_1_NAME', 'cols 2-6, rows 2-3', 'heading', 'Speaker name', {
      layer: 10,
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('MEMBER_1_ROLE', 'cols 2-6, rows 3-4', 'subheading', 'Title · Organization', {
      layer: 10,
      typography: typo('subheading'),
    }),
    body('MEMBER_1_BIO', 'cols 2-6, rows 4-9', 'Speaker bio with credentials and talk focus.', 6),
    slot('MEMBER_1_IMAGE', 'cols 7-11, rows 2-9', 'image', null, { layer: 2, fit: 'cover' }),
  ], { mode: 'speaker_bio_right' }),

  speaker_bio_centered_v1: layoutBase('speaker_bio_centered_v1', 'closing', [
    slot('MEMBER_1_IMAGE', 'cols 4-9, rows 2-5', 'image', null, { layer: 2, fit: 'cover' }),
    slot('MEMBER_1_NAME', 'cols 3-10, rows 5-6', 'heading', 'Speaker name', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 28 }),
    }),
    slot('MEMBER_1_ROLE', 'cols 3-10, rows 6-7', 'subheading', 'Title · Organization', {
      layer: 10,
      typography: centeredTypo('subheading'),
    }),
    body('MEMBER_1_BIO', 'cols 3-10, rows 7-9', 'Speaker bio with credentials and talk focus.', 4, {
      typography: centeredTypo('body'),
    }),
  ], { mode: 'speaker_bio_centered' }),

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

  minimal_text_cta_v1: layoutBase('minimal_text_cta_v1', 'closing', [
    slot('HEADING', 'cols 3-10, rows 4-5', 'heading', 'Thank you', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 48 }),
    }),
    ctaPill('cols 4-9, rows 6-7'),
    slot('CTA', 'cols 4-9, rows 6-7', 'cta', 'Book a demo', { layer: 10, typography: typo('cta') }),
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

  contact_card_cta_v1: layoutBase('contact_card_cta_v1', 'closing', [
    slot('HEADING', 'cols 3-10, rows 2-3', 'heading', "Let's connect", {
      layer: 10,
      typography: centeredTypo('heading'),
    }),
    slot('CONTACT_ADDRESS', 'cols 4-9, rows 4-5', 'body', '123 Main Street', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 16 }),
      max_lines: 2,
    }),
    slot('CONTACT_PHONE', 'cols 4-9, rows 5-6', 'body', '+1 (555) 123-4567', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 16 }),
      max_lines: 1,
    }),
    slot('CONTACT_EMAIL', 'cols 4-9, rows 6-7', 'body', 'hello@company.com', {
      layer: 10,
      typography: centeredTypo('body', { fontSize: 16 }),
      max_lines: 1,
    }),
    ctaPill('cols 4-9, rows 7-8'),
    slot('CTA', 'cols 4-9, rows 7-8', 'cta', 'Get in touch', { layer: 10, typography: typo('cta') }),
  ], { mode: 'closing_cta' }),

  contact_split_cta_v1: layoutBase('contact_split_cta_v1', 'closing', [
    heading('HEADING', 'cols 2-6, rows 2-3', "Let's connect", {
      typography: typo('heading', { fontSize: 28 }),
    }),
    slot('CONTACT_EMAIL', 'cols 2-6, rows 4-5', 'body', 'hello@company.com', {
      layer: 10,
      typography: typo('body', { fontSize: 15 }),
      max_lines: 1,
    }),
    slot('CONTACT_PHONE', 'cols 2-6, rows 5-6', 'body', '+1 (555) 123-4567', {
      layer: 10,
      typography: typo('body', { fontSize: 15 }),
      max_lines: 1,
    }),
    slot('CONTACT_ADDRESS', 'cols 2-6, rows 6-7', 'body', '123 Main Street', {
      layer: 10,
      typography: typo('body', { fontSize: 15 }),
      max_lines: 2,
    }),
    slot('CTA_HEADING', 'cols 7-11, rows 3-4', 'heading', 'Ready to talk?', {
      layer: 10,
      typography: centeredTypo('heading', { fontSize: 24 }),
    }),
    ctaPill('cols 7-11, rows 5-7'),
    slot('CTA', 'cols 7-11, rows 5-7', 'cta', 'Get in touch', {
      layer: 10,
      typography: centeredTypo('cta'),
    }),
  ], { mode: 'contact_split_cta' }),

  para_image_cta_v1: layoutBase('para_image_cta_v1', 'closing', [
    body('BODY', 'cols 2-6, rows 2-5', P.short, 4),
    ctaPill('cols 2-5, rows 6-7'),
    slot('CTA', 'cols 2-5, rows 6-7', 'cta', 'Book a demo', { layer: 10, typography: typo('cta') }),
    imageRight(),
  ], { mode: 'closing_image_right' }),

  image_para_cta_v1: layoutBase('image_para_cta_v1', 'closing', [
    imageLeft('cols 1-6, rows 1-10', 'HERO_IMAGE'),
    body('BODY', 'cols 7-11, rows 2-5', P.short, 4),
    ctaPill('cols 7-10, rows 6-7'),
    slot('CTA', 'cols 7-10, rows 6-7', 'cta', 'Book a demo', { layer: 10, typography: typo('cta') }),
  ], { mode: 'closing_image_left' }),

  overlay_image_cta_v1: layoutBase('overlay_image_cta_v1', 'closing', [
    slot('BACKGROUND_IMAGE', 'cols 1-12, rows 1-10', 'background', null, { layer: 0, fit: 'cover' }),
    overlayScrim(),
    slot('HEADING', 'cols 3-10, rows 3-5', 'heading', 'Thank you', {
      layer: 10,
      typography: { ...centeredTypo('heading', { fontSize: 48 }), colorRole: 'textOnImage' },
      max_lines: 2,
    }),
    body('BODY', 'cols 3-10, rows 5-6', P.short, 2, {
      typography: { ...centeredTypo('body'), colorRole: 'textOnImageMuted' },
    }),
    ctaPill('cols 4-9, rows 7-8'),
    slot('CTA', 'cols 4-9, rows 7-8', 'cta', 'Get in touch', { layer: 10, typography: typo('cta') }),
  ], { mode: 'closing_overlay' }),
}

export default CATALOG

export const CLOSING_LAYOUT_IDS = Object.keys(CATALOG)
