#!/usr/bin/env node
/** Export deckLayoutCatalogs → backend seed-layouts.json */
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import ALL_LAYOUT_CATALOGS from '../src/utils/deckLayoutCatalogs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../../AthenaVI_backend/src/modules/presentation/templates/seed-layouts.json')

function humanName(layoutId) {
  return String(layoutId)
    .replace(/_v\d+$/, '')
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

const rows = Object.values(ALL_LAYOUT_CATALOGS).map((schema) => ({
  name: humanName(schema.layout_id),
  contentType: schema.content_type,
  variant: schema.layout_id,
  schema,
}))

writeFileSync(outPath, JSON.stringify(rows, null, 2))
console.log(`Exported ${rows.length} layouts to ${outPath}`)
