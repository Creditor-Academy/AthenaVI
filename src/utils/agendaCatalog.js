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
  ], { mode: 'agenda_three_columns' }),

  agenda_three_columns_hero_v1: layoutBase('agenda_three_columns_hero_v1', 'agenda', [
    heroImage('cols 1-12, rows 1-4', 'HERO_IMAGE', { imageStyle: 'flat' }),
    heading('HEADING', 'cols 2-11, rows 5-6', 'Agenda', {
      typography: typo('heading', { fontSize: 30, align: 'left' }),
    }),
    ...agendaColumn(1, 1, 4, 7),
    ...agendaColumn(2, 5, 8, 7),
    ...agendaColumn(3, 9, 12, 7),
  ], { mode: 'agenda_three_columns_hero' }),

  agenda_numbered_v1: layoutBase('agenda_numbered_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', "Today's agenda", {
      typography: typo('heading', { fontSize: 34, align: 'center' }),
    }),
    body('ITEM_1', 'cols 3-10, rows 3-4', '01 · Opening and goals', 1, { typography: typo('body', { fontWeight: 600 }) }),
    body('ITEM_2', 'cols 3-10, rows 4-5', '02 · Market context', 1, { typography: typo('body', { fontWeight: 600 }) }),
    body('ITEM_3', 'cols 3-10, rows 5-6', '03 · Product demo', 1, { typography: typo('body', { fontWeight: 600 }) }),
    body('ITEM_4', 'cols 3-10, rows 6-7', '04 · Q&A', 1, { typography: typo('body', { fontWeight: 600 }) }),
  ], { mode: 'agenda_numbered' }),

  agenda_minimal_v1: layoutBase('agenda_minimal_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 2-4', 'Agenda', {
      typography: typo('heading', { fontSize: 40, align: 'center' }),
    }),
    body('BODY', 'cols 3-10, rows 4-8', 'Topic one\nTopic two\nTopic three\nTopic four', 6, {
      typography: centeredTypo('body', { fontSize: 20 }),
    }),
  ], { mode: 'agenda_minimal' }),

  agenda_two_column_v1: layoutBase('agenda_two_column_v1', 'agenda', [
    heading('HEADING', 'cols 2-11, rows 1-2', 'Session overview', { max_lines: 2 }),
    ...agendaColumn(1, 1, 6, 3),
    ...agendaColumn(2, 7, 12, 3),
  ], { mode: 'agenda_two_columns' }),

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
  ], { mode: 'process_flow' }),
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
  agenda_editorial_v1: agendaFromSource('agenda_editorial_v1', 'agenda_minimal_v1', 'editorial'),
  agenda_cards_v1: agendaFromSource('agenda_cards_v1', 'agenda_minimal_v1', 'cards'),
  agenda_numbered_bold_v1: agendaFromSource('agenda_numbered_bold_v1', 'agenda_numbered_v1', 'bold'),
  agenda_numbered_timeline_v1: agendaFromSource('agenda_numbered_timeline_v1', 'agenda_numbered_v1', 'timeline'),
  agenda_three_cards_hero_v1: agendaFromSource('agenda_three_cards_hero_v1', 'agenda_three_columns_hero_v1', 'cards'),
  agenda_three_panel_hero_v1: agendaFromSource('agenda_three_panel_hero_v1', 'agenda_three_columns_hero_v1', 'panel'),
  agenda_three_cards_v1: agendaFromSource('agenda_three_cards_v1', 'agenda_three_columns_v1', 'cards'),
  agenda_three_tiles_v1: agendaFromSource('agenda_three_tiles_v1', 'agenda_three_columns_v1', 'tiles'),
  agenda_vertical_roadmap_v1: agendaFromSource('agenda_vertical_roadmap_v1', 'agenda_timeline_preview_v1', 'vertical'),
  agenda_progress_path_v1: agendaFromSource('agenda_progress_path_v1', 'agenda_timeline_preview_v1', 'path'),
  agenda_split_panel_v1: agendaFromSource('agenda_split_panel_v1', 'agenda_two_column_v1', 'split_panel'),
  agenda_asymmetric_v1: agendaFromSource('agenda_asymmetric_v1', 'agenda_two_column_v1', 'asymmetric'),
})

export default CATALOG
