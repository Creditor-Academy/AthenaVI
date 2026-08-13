#!/usr/bin/env node
/** Export simpleSlidesCatalog → backend seed-layouts.json */
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import SIMPLE_CATALOG from '../src/utils/simpleSlidesCatalog.js'
import GRIDS_CATALOG from '../src/utils/gridsCatalog.js'
import CHARTS_DATA_CATALOG from '../src/utils/chartsDataCatalog.js'
import PRICING_CATALOG from '../src/utils/pricingCatalog.js'
import AGENDA_CATALOG from '../src/utils/agendaCatalog.js'
import PEOPLE_TEAMS_CATALOG from '../src/utils/peopleTeamsCatalog.js'
import DEVICE_FRAMES_CATALOG from '../src/utils/deviceFramesCatalog.js'

const ALL_CATALOGS = {
  ...SIMPLE_CATALOG,
  ...GRIDS_CATALOG,
  ...CHARTS_DATA_CATALOG,
  ...PRICING_CATALOG,
  ...AGENDA_CATALOG,
  ...PEOPLE_TEAMS_CATALOG,
  ...DEVICE_FRAMES_CATALOG,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../../AthenaVI_backend/src/modules/presentation/templates/seed-layouts.json')

function humanName(layoutId) {
  return String(layoutId)
    .replace(/_v\d+$/, '')
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

const rows = Object.values(ALL_CATALOGS).map((schema) => ({
  name: humanName(schema.layout_id),
  contentType: schema.content_type,
  variant: schema.layout_id,
  version: 2,
  isActive: true,
  schema: JSON.parse(JSON.stringify(schema)),
}))

writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`Wrote ${rows.length} layouts to ${outPath}`)
