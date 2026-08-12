#!/usr/bin/env node
/**
 * Validate Women's Wellness pilot DECK_PACK conversion (+ optional API checks).
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
  convertPublicTemplateToDeckPack,
  filterManifestPacks,
  loadManifest,
} from './lib/publicTemplateToPresentation.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EXPECTED_LAYOUTS = [
  'womens_wellness_cover_v1',
  'womens_wellness_pillars_v1',
  'womens_wellness_timeline_v1',
  'womens_wellness_nutrition_v1',
  'womens_wellness_tracker_v1',
  'womens_wellness_cta_v1',
]

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      const text = readFileSync(join(__dirname, '..', name), 'utf8')
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        const value = trimmed.slice(eq + 1).trim()
        if (process.env[key] == null || process.env[key] === '') process.env[key] = value
      }
    } catch {
      // ignore
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function verifyLocal() {
  const manifest = loadManifest(join(__dirname, 'deck-pack-seed-manifest.json'))
  const entry = filterManifestPacks(manifest, ['womens_wellness_template'])[0]
  assert(entry, 'Manifest entry womens_wellness_template not found')

  const converted = convertPublicTemplateToDeckPack(entry)
  const { schema } = converted

  assert(schema.pack_id === 'womens_wellness', 'pack_id should be womens_wellness')
  assert(schema.themeId === 'sunset_coral', 'themeId should be sunset_coral')
  assert(schema.slides?.length === 6, 'expected 6 slides')
  assert(schema.slidePreviews?.length === 6, 'expected 6 slidePreviews')
  assert(schema.preview?.slideCount === 6, 'preview.slideCount should be 6')

  const layoutIds = schema.slides.map((s) => s.layout_id)
  for (const expected of EXPECTED_LAYOUTS) {
    assert(layoutIds.includes(expected), `missing layout ${expected}`)
  }

  for (const slide of schema.slides) {
    assert(slide.placeholder?.title, `slide ${slide.order} missing placeholder.title`)
    assert(slide.layout_id, `slide ${slide.order} missing layout_id`)
    assert(slide.contentType, `slide ${slide.order} missing contentType`)
    assert(slide.elements?.elements?.length, `slide ${slide.order} missing canvas elements`)
  }

  console.log('Local schema validation: OK')
  console.log(`  pack_id=${schema.pack_id}`)
  console.log(`  slides=${schema.slides.length}`)
  console.log(`  layouts=${layoutIds.join(', ')}`)
  return converted
}

async function verifyApi(token) {
  const base = (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:9000').replace(/\/$/, '')
  const headers = { Authorization: `Bearer ${token}` }

  const layoutRes = await fetch(`${base}/api/superadmin/templates?type=DECK_LAYOUT`, { headers })
  const layoutBody = await layoutRes.json().catch(() => ({}))
  assert(layoutRes.ok && layoutBody.success !== false, 'Failed to list DECK_LAYOUT templates')

  const layoutRows = Array.isArray(layoutBody.data) ? layoutBody.data : layoutBody.data?.templates || []
  const layoutIds = new Set(layoutRows.map((r) => r?.schema?.layout_id).filter(Boolean))
  for (const expected of EXPECTED_LAYOUTS) {
    assert(layoutIds.has(expected), `backend missing DECK_LAYOUT ${expected}`)
    const row = layoutRows.find((r) => r?.schema?.layout_id === expected)
    const canvasElements = row?.schema?.preview?.canvasElements
    assert(
      canvasElements?.elements?.length,
      `DECK_LAYOUT ${expected} missing preview.canvasElements`
    )
  }
  console.log(`Superadmin DECK_LAYOUT rows: ${layoutIds.size} (pilot layouts present)`)

  const packRes = await fetch(`${base}/api/superadmin/templates?type=DECK_PACK`, { headers })
  const packBody = await packRes.json().catch(() => ({}))
  assert(packRes.ok && packBody.success !== false, 'Failed to list DECK_PACK templates')

  const packRows = Array.isArray(packBody.data) ? packBody.data : packBody.data?.templates || []
  const wellness = packRows.find((r) => r?.schema?.pack_id === 'womens_wellness' || r?.variant === 'womens_wellness')
  assert(wellness, 'DECK_PACK womens_wellness not found on backend')
  assert(wellness.schema?.slides?.length === 6, 'backend pack should have 6 slides')
  console.log(`Superadmin DECK_PACK womens_wellness: id=${wellness.id || wellness.templateId}`)
  console.log('API verification: OK')
}

async function main() {
  loadDotEnv()
  await verifyLocal()

  const token = process.env.SUPERADMIN_TOKEN?.trim() || process.env.ACCESS_TOKEN?.trim()
  if (token) {
    await verifyApi(token)
  } else {
    console.log('Skipping API verification (set SUPERADMIN_TOKEN or ACCESS_TOKEN to enable).')
  }
}

main().catch((err) => {
  console.error(`Verification failed: ${err.message}`)
  process.exit(1)
})
