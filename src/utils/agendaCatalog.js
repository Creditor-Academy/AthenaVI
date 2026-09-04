/**
 * Agenda DECK_LAYOUT v2 catalog — 6 core + 12 similar-variant layouts.
 */

import {
  slot,
  typo,
  centeredTypo,
  layoutBase,
  heading,
  body,
  agendaColumn,
  heroImage,
} from './deckLayoutV2Helpers.js'

const CATALOG = {
  agenda_three_columns_v1: layoutBase('agenda_three_columns_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Agenda', {
      typography: typo('heading', { fontSize: 36, align: 'center' }),
    }),
    ...agendaColumn(1, 1, 4),
    ...agendaColumn(2, 5, 8),
    ...agendaColumn(3, 9, 12),
  ], { mode: 'agenda_three_columns', agendaVariant: 'default' }),

  agenda_three_columns_hero_v1: layoutBase('agenda_three_columns_hero_v1', 'agenda', [
    heroImage('cols 1-12, rows 1-4', 'HERO_IMAGE', { imageStyle: 'flat' }),
    heading('HEADING', 'cols 2-11, rows 5-6', 'Agenda', {
      typography: typo('heading', { fontSize: 30, align: 'left' }),
    }),
    ...agendaColumn(1, 1, 4, 7),
    ...agendaColumn(2, 5, 8, 7),
    ...agendaColumn(3, 9, 12, 7),
  ], { mode: 'agenda_three_columns_hero', agendaVariant: 'default' }),

  agenda_numbered_v1: layoutBase('agenda_numbered_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', "Today's agenda", {
      typography: typo('heading', { fontSize: 34, align: 'center' }),
    }),
    body('ITEM_1', 'cols 3-10, rows 3-4', 'Opening and goals', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
    body('ITEM_2', 'cols 3-10, rows 4-5', 'Market context', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
    body('ITEM_3', 'cols 3-10, rows 5-6', 'Product demo', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
    body('ITEM_4', 'cols 3-10, rows 6-7', 'Q&A', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
  ], { mode: 'agenda_numbered', agendaVariant: 'default' }),

  agenda_minimal_v1: layoutBase('agenda_minimal_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Agenda', {
      typography: typo('heading', { fontSize: 44, align: 'left' }),
    }),
    body('ITEM_1', 'cols 3-11, rows 3-4', 'Opening and goals', 1, { typography: typo('body', { fontWeight: 600, fontSize: 22 }) }),
    body('ITEM_2', 'cols 3-11, rows 4-5', 'Context and constraints', 1, { typography: typo('body', { fontWeight: 600, fontSize: 22 }) }),
    body('ITEM_3', 'cols 3-11, rows 5-6', 'Proposal and proof', 1, { typography: typo('body', { fontWeight: 600, fontSize: 22 }) }),
    body('ITEM_4', 'cols 3-11, rows 6-7', 'Decisions and next steps', 1, { typography: typo('body', { fontWeight: 600, fontSize: 22 }) }),
  ], { mode: 'agenda_minimal', agendaVariant: 'default' }),

  agenda_editorial_v1: layoutBase('agenda_editorial_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', "Today's agenda", {
      typography: typo('heading', { fontSize: 32, align: 'left' }),
    }),
    body('ITEM_1', 'cols 6-12, rows 2-3', 'Opening and goals', 1, { typography: typo('body', { fontWeight: 600, fontSize: 16 }) }),
    body('ITEM_2', 'cols 6-12, rows 3-4', 'Context and constraints', 1, { typography: typo('body', { fontWeight: 600, fontSize: 16 }) }),
    body('ITEM_3', 'cols 6-12, rows 4-5', 'Proposal and proof', 1, { typography: typo('body', { fontWeight: 600, fontSize: 16 }) }),
    body('ITEM_4', 'cols 6-12, rows 5-6', 'Decisions and owners', 1, { typography: typo('body', { fontWeight: 600, fontSize: 16 }) }),
    body('ITEM_5', 'cols 6-12, rows 6-7', 'Q&A and next steps', 1, { typography: typo('body', { fontWeight: 600, fontSize: 16 }) }),
  ], { mode: 'agenda_minimal', agendaVariant: 'editorial' }),

  agenda_cards_v1: layoutBase('agenda_cards_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Agenda', {
      typography: typo('heading', { fontSize: 32, align: 'left' }),
    }),
    body('ITEM_1', 'cols 1-6, rows 3-5', 'Opening and goals', 2, { typography: typo('body', { fontWeight: 700, fontSize: 20 }) }),
    body('ITEM_2', 'cols 7-12, rows 3-5', 'Context and constraints', 2, { typography: typo('body', { fontWeight: 700, fontSize: 20 }) }),
    body('ITEM_3', 'cols 1-6, rows 6-8', 'Proposal and proof', 2, { typography: typo('body', { fontWeight: 700, fontSize: 20 }) }),
    body('ITEM_4', 'cols 7-12, rows 6-8', 'Decisions and next steps', 2, { typography: typo('body', { fontWeight: 700, fontSize: 20 }) }),
  ], { mode: 'agenda_minimal', agendaVariant: 'cards' }),

  agenda_two_column_v1: layoutBase('agenda_two_column_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Two Column Layout Slide of Compare Predictive B2b Marketing', {
      typography: typo('heading', { fontSize: 28, align: 'left' }),
      max_lines: 2,
    }),
    heading('AGENDA_COL_1_HEADING', 'cols 1-6, rows 3-4', 'Column 01', {
      typography: typo('heading', { fontSize: 18, align: 'left' }),
    }),
    body('AGENDA_COL_1_ITEM_1', 'cols 1-6, rows 4-5', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_1_ITEM_1_BODY', 'cols 1-6, rows 5-6', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_1_ITEM_2', 'cols 1-6, rows 5-6', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_1_ITEM_2_BODY', 'cols 1-6, rows 6-7', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_1_ITEM_3', 'cols 1-6, rows 6-7', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_1_ITEM_3_BODY', 'cols 1-6, rows 7-8', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_1_ITEM_4', 'cols 1-6, rows 7-8', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_1_ITEM_4_BODY', 'cols 1-6, rows 8-9', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_1_ITEM_5', 'cols 1-6, rows 8-9', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_1_ITEM_5_BODY', 'cols 1-6, rows 9-10', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    heading('AGENDA_COL_2_HEADING', 'cols 7-12, rows 3-4', 'Column 02', {
      typography: typo('heading', { fontSize: 18, align: 'left' }),
    }),
    body('AGENDA_COL_2_ITEM_1', 'cols 7-12, rows 4-5', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_2_ITEM_1_BODY', 'cols 7-12, rows 5-6', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_2_ITEM_2', 'cols 7-12, rows 5-6', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_2_ITEM_2_BODY', 'cols 7-12, rows 6-7', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_2_ITEM_3', 'cols 7-12, rows 6-7', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_2_ITEM_3_BODY', 'cols 7-12, rows 7-8', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_2_ITEM_4', 'cols 7-12, rows 7-8', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_2_ITEM_4_BODY', 'cols 7-12, rows 8-9', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
    body('AGENDA_COL_2_ITEM_5', 'cols 7-12, rows 8-9', 'Text Here', 1, { typography: typo('body', { fontWeight: 700, fontSize: 14 }) }),
    body('AGENDA_COL_2_ITEM_5_BODY', 'cols 7-12, rows 9-10', 'This slide 100% editable. Adapt it to your needs and capture your audience\'s attention.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 12 }) }),
  ], { mode: 'agenda_two_columns', agendaVariant: 'default' }),

  agenda_timeline_preview_v1: layoutBase('agenda_timeline_preview_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Roadmap preview', { max_lines: 2 }),
    slot('milestone_1_label', 'cols 1-3, rows 4-5', 'subheading', 'Phase 1', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }),
    }),
    slot('milestone_2_label', 'cols 4-6, rows 4-5', 'subheading', 'Phase 2', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }),
    }),
    slot('milestone_3_label', 'cols 7-9, rows 4-5', 'subheading', 'Phase 3', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }),
    }),
    slot('milestone_4_label', 'cols 10-12, rows 4-5', 'subheading', 'Phase 4', {
      layer: 10,
      typography: typo('caption', { fontSize: 13, align: 'center', fontWeight: 700 }),
    }),
  ], { mode: 'process_flow', agendaVariant: 'default' }),
}

function agendaFromSource(layoutId, sourceId, agendaVariant) {
  const source = CATALOG[sourceId]
  if (!source?.slots?.length) {
    throw new Error(`agendaFromSource: missing source ${sourceId}`)
  }
  return layoutBase(
    layoutId,
    'agenda',
    JSON.parse(JSON.stringify(source.slots)),
    { mode: source.preview?.mode, agendaVariant }
  )
}

Object.assign(CATALOG, {
  agenda_numbered_timeline_v1: agendaFromSource('agenda_numbered_timeline_v1', 'agenda_numbered_v1', 'timeline'),
  agenda_three_cards_hero_v1: agendaFromSource('agenda_three_cards_hero_v1', 'agenda_three_columns_hero_v1', 'cards'),
  agenda_three_cards_v1: agendaFromSource('agenda_three_cards_v1', 'agenda_three_columns_v1', 'cards'),
  agenda_vertical_roadmap_v1: agendaFromSource('agenda_vertical_roadmap_v1', 'agenda_timeline_preview_v1', 'vertical'),
})

CATALOG.agenda_split_panel_v1 = layoutBase('agenda_split_panel_v1', 'agenda', [
  heading('HEADING', 'cols 2-11, rows 1-2', 'Session overview', { max_lines: 2 }),
  ...agendaColumn(1, 1, 6, 3),
  ...agendaColumn(2, 7, 12, 3),
], { mode: 'agenda_two_columns', agendaVariant: 'split_panel' })

CATALOG.agenda_cards_v1.slots.push(
  body('ITEM_1_BODY', 'cols 1-6, rows 5-6', 'Set the purpose and what a good outcome looks like.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
  body('ITEM_2_BODY', 'cols 7-12, rows 5-6', 'Share the context, constraints, and what is already decided.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
  body('ITEM_3_BODY', 'cols 1-6, rows 8-9', 'Walk through the proposal and the proof behind it.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
  body('ITEM_4_BODY', 'cols 7-12, rows 8-9', 'Agree owners, dates, and the next concrete steps.', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
)

CATALOG.agenda_numbered_timeline_v1.slots.push(
  body('ITEM_1_BODY', 'cols 1-3, rows 7-8', '• Kickoff notes\n• Desired outcome', 3, { typography: typo('body', { fontWeight: 400, fontSize: 13 }) }),
  body('ITEM_2_BODY', 'cols 4-6, rows 7-8', '• Market snapshot\n• Key constraints', 3, { typography: typo('body', { fontWeight: 400, fontSize: 13 }) }),
  body('ITEM_3_BODY', 'cols 7-9, rows 7-8', '• Live walkthrough\n• Proof points', 3, { typography: typo('body', { fontWeight: 400, fontSize: 13 }) }),
  body('ITEM_4_BODY', 'cols 10-12, rows 7-8', '• Open questions\n• Next steps', 3, { typography: typo('body', { fontWeight: 400, fontSize: 13 }) }),
)

CATALOG.agenda_numbered_v1.slots.push(
  body('ITEM_5', 'cols 3-6, rows 8-9', 'Workshop breakout', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
  body('ITEM_6', 'cols 7-10, rows 8-9', 'Closing remarks', 3, { typography: typo('body', { fontWeight: 400, fontSize: 14 }) }),
)

export default CATALOG
