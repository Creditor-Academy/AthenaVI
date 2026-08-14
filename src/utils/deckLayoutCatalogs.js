/**
 * Single source of truth for all DECK_LAYOUT catalog modules.
 * Used by deckLayoutRegistry.js and scripts/export-seed-layouts.mjs.
 */
import SIMPLE_CATALOG from './simpleSlidesCatalog.js'
import GRIDS_CATALOG from './gridsCatalog.js'
import CHARTS_DATA_CATALOG from './chartsDataCatalog.js'
import PRICING_CATALOG from './pricingCatalog.js'
import AGENDA_CATALOG from './agendaCatalog.js'
import PEOPLE_TEAMS_CATALOG from './peopleTeamsCatalog.js'
import DEVICE_FRAMES_CATALOG from './deviceFramesCatalog.js'
import COMPARISON_TIMELINE_CATALOG from './comparisonTimelineCatalog.js'
import QUOTES_CATALOG from './quotesCatalog.js'
import DIAGRAMS_CATALOG from './diagramsCatalog.js'

export const ALL_LAYOUT_CATALOGS = {
  ...SIMPLE_CATALOG,
  ...GRIDS_CATALOG,
  ...CHARTS_DATA_CATALOG,
  ...PRICING_CATALOG,
  ...AGENDA_CATALOG,
  ...PEOPLE_TEAMS_CATALOG,
  ...DEVICE_FRAMES_CATALOG,
  ...COMPARISON_TIMELINE_CATALOG,
  ...QUOTES_CATALOG,
  ...DIAGRAMS_CATALOG,
}

export default ALL_LAYOUT_CATALOGS
