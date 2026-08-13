/**
 * Agenda DECK_LAYOUT v2 catalog — three-column agenda layouts.
 */

import {
  typo,
  layoutBase,
  heading,
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
}

export default CATALOG
