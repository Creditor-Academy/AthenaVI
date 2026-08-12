#!/usr/bin/env node
/**
 * Seed DECK_LAYOUT + DECK_PACK templates via Superadmin API.
 *
 * Env:
 *   API_BASE_URL or VITE_API_BASE_URL — backend origin (no trailing slash)
 *   SUPERADMIN_TOKEN — Bearer token for superadmin routes
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import REGISTRY from '../src/utils/deckLayoutRegistry.js'
import {
  buildDeckLayoutsFromPack,
  convertPublicTemplateToDeckPack,
  filterManifestPacks,
  loadManifest,
} from './lib/publicTemplateToPresentation.mjs'
import { collectRequiredLayoutIds } from './lib/layoutTypeMap.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MANIFEST_PATH = join(__dirname, 'deck-pack-seed-manifest.json')

function parseArgs(argv) {
  const args = {
    dryRun: false,
    layoutsOnly: false,
    packsOnly: false,
    uploadMedia: false,
    only: [],
    writeSchema: null,
    exportOnly: false,
  }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--export-only') {
      args.exportOnly = true
      args.writeSchema = args.writeSchema || 'scripts/output/womens_wellness_deck_pack.json'
    }
    else if (arg === '--layouts-only') args.layoutsOnly = true
    else if (arg === '--packs-only') args.packsOnly = true
    else if (arg === '--upload-media') args.uploadMedia = true
    else if (arg === '--write-schema') args.writeSchema = argv[++i] || null
    else if (arg === '--only') {
      args.only = argv[++i]?.split(',').map((s) => s.trim()).filter(Boolean) || []
    }
  }
  return args
}

function loadDotEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const path = join(__dirname, '..', name)
    try {
      const text = readFileSync(path, 'utf8')
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"'))
          || (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        if (process.env[key] == null || process.env[key] === '') {
          process.env[key] = value
        }
      }
    } catch {
      // optional env files
    }
  }
}

loadDotEnvFiles()

function resolveAccessToken() {
  return (
    process.env.SUPERADMIN_TOKEN?.trim()
    || process.env.ACCESS_TOKEN?.trim()
    || ''
  )
}

function getApiBaseUrl() {
  const base = (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:9000').trim()
  return base.replace(/\/$/, '')
}

function getAuthHeaders(json = true, { required = true } = {}) {
  const token = resolveAccessToken()
  if (!token && required) {
    throw new Error(
      'SUPERADMIN_TOKEN (or ACCESS_TOKEN) is required. Add it to .env.local or your shell environment.'
    )
  }
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function loginForAccessToken() {
  const email = process.env.SEED_LOGIN_EMAIL?.trim()
  const password = process.env.SEED_LOGIN_PASSWORD?.trim()
  if (!email || !password) return null
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Login failed (${response.status})`)
  }
  return body.data?.accessToken || null
}

async function ensureAccessToken() {
  if (resolveAccessToken()) return resolveAccessToken()
  const token = await loginForAccessToken()
  if (token) {
    process.env.SUPERADMIN_TOKEN = token
    console.log('Authenticated via SEED_LOGIN_EMAIL')
  }
  return resolveAccessToken()
}

async function apiRequest(path, options = {}) {
  const url = `${getApiBaseUrl()}${path}`
  const isMultipart = options.body instanceof FormData
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(!isMultipart),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    const message = body.message || `${response.status} ${response.statusText}`
    throw new Error(`API ${options.method || 'GET'} ${path}: ${message}`)
  }
  return body.data
}

function layoutIdFromTemplateRow(row) {
  return row?.schema?.layout_id || row?.schema?.layoutId || null
}

function templateRowId(row) {
  if (!row) return null
  return row.id || row.templateId || row.template?.id || null
}

function packIdFromTemplateRow(row) {
  return row?.schema?.pack_id || row?.variant || null
}

function humanLayoutName(layoutId) {
  return String(layoutId)
    .replace(/_v\d+$/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function listTemplates(type, { offline = false } = {}) {
  if (offline) return []
  const data = await apiRequest(`/api/superadmin/templates?type=${encodeURIComponent(type)}`)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.templates)) return data.templates
  return []
}

async function seedLayouts(requiredLayoutIds, { dryRun }) {
  const existing = await listTemplates('DECK_LAYOUT', { offline: dryRun && !resolveAccessToken() })
  const existingIds = new Set(existing.map(layoutIdFromTemplateRow).filter(Boolean))
  const toCreate = requiredLayoutIds.filter((id) => !existingIds.has(id))

  console.log(`\n[layouts] required=${requiredLayoutIds.length} existing=${existingIds.size} toCreate=${toCreate.length}`)

  const created = []
  for (const layoutId of toCreate) {
    const schema = REGISTRY[layoutId]
    if (!schema) {
      console.warn(`  skip missing registry entry: ${layoutId}`)
      continue
    }
    const payload = {
      type: 'DECK_LAYOUT',
      name: humanLayoutName(layoutId),
      contentType: schema.content_type || 'layout',
      variant: layoutId,
      isActive: true,
      schema: {
        ...JSON.parse(JSON.stringify(schema)),
        grid: schema.grid || '12-col',
      },
    }
    if (dryRun) {
      console.log(`  [dry-run] POST DECK_LAYOUT ${layoutId}`)
      created.push({ layoutId, dryRun: true })
      continue
    }
    const row = await apiRequest('/api/superadmin/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    console.log(`  created DECK_LAYOUT ${layoutId} → id=${templateRowId(row) || '?'}`)
    created.push({ layoutId, id: row?.id || row?.templateId })
  }

  for (const layoutId of requiredLayoutIds) {
    if (existingIds.has(layoutId)) {
      console.log(`  exists DECK_LAYOUT ${layoutId}`)
    }
  }

  return created
}

async function upsertDerivedLayout(layoutRow, existingRows, { dryRun }) {
  const match = existingRows.find((row) => layoutIdFromTemplateRow(row) === layoutRow.layoutId)
  const elementCount =
    layoutRow.schema?.preview?.canvasElements?.elements?.length
    || layoutRow.schema?.elements?.elements?.length
    || 0
  const payload = {
    type: 'DECK_LAYOUT',
    name: layoutRow.name,
    contentType: layoutRow.contentType || 'layout',
    variant: layoutRow.layoutId,
    isActive: true,
    schema: layoutRow.schema,
  }

  if (dryRun) {
    console.log(`  [dry-run] ${match ? 'PATCH' : 'POST'} DECK_LAYOUT ${layoutRow.layoutId} (${elementCount} elements, neutral)`)
    return { layoutId: layoutRow.layoutId, dryRun: true }
  }

  if (match) {
    const templateId = templateRowId(match)
    await apiRequest(`/api/superadmin/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: payload.name,
        contentType: payload.contentType,
        variant: payload.variant,
        isActive: true,
        schema: payload.schema,
      }),
    })
    console.log(`  updated DECK_LAYOUT ${layoutRow.layoutId} (${elementCount} elements) → id=${templateId}`)
    return { layoutId: layoutRow.layoutId, id: templateId, updated: true }
  }

  const row = await apiRequest('/api/superadmin/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  console.log(`  created DECK_LAYOUT ${layoutRow.layoutId} (${elementCount} elements) → id=${templateRowId(row) || '?'}`)
  return { layoutId: layoutRow.layoutId, id: templateRowId(row) }
}

/** Seed DECK_LAYOUT rows with neutral canvas structure (shapes/text, no brand colors/images). */
async function seedDerivedLayouts(packs, { dryRun }) {
  const existing = await listTemplates('DECK_LAYOUT', { offline: dryRun && !resolveAccessToken() })
  const layoutRows = packs.flatMap((entry) => buildDeckLayoutsFromPack(entry))
  console.log(`\n[layouts-derived] packs=${packs.length} layouts=${layoutRows.length}`)

  const results = []
  for (const layoutRow of layoutRows) {
    results.push(await upsertDerivedLayout(layoutRow, existing, { dryRun }))
  }
  return results
}

async function fetchImageBlob(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : 'jpg'
  return { buffer, contentType, filename: `preview.${ext}` }
}

async function uploadTemplateMedia(templateId, { buffer, contentType, filename, kind, slotHint, name }) {
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: contentType }), filename)
  form.append('kind', kind)
  if (slotHint) form.append('slotHint', slotHint)
  if (name) form.append('name', name)
  return apiRequest(`/api/superadmin/templates/${templateId}/media`, {
    method: 'POST',
    body: form,
  })
}

async function seedPack(manifestEntry, { dryRun, uploadMedia }) {
  const converted = convertPublicTemplateToDeckPack(manifestEntry)
  const existing = await listTemplates('DECK_PACK', { offline: dryRun && !resolveAccessToken() })
  const match = existing.find((row) => packIdFromTemplateRow(row) === manifestEntry.packId)

  const payload = {
    type: 'DECK_PACK',
    name: converted.name,
    contentType: 'pack',
    variant: manifestEntry.packId,
    isActive: true,
    schema: converted.schema,
  }

  if (dryRun) {
    console.log(`\n[pack] [dry-run] ${match ? 'PATCH' : 'POST'} DECK_PACK ${manifestEntry.packId}`)
    console.log(`  slides=${converted.schema.slides.length} layouts=${converted.requiredLayoutIds.join(', ')}`)
    return { packId: manifestEntry.packId, dryRun: true, converted }
  }

  let row
  if (match) {
    const templateId = match.id || match.templateId
    row = await apiRequest(`/api/superadmin/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: payload.name,
        contentType: payload.contentType,
        variant: payload.variant,
        isActive: true,
        schema: payload.schema,
      }),
    })
    console.log(`\n[pack] updated DECK_PACK ${manifestEntry.packId} → id=${templateId}`)
    row = { ...(match || {}), ...(row || {}), id: templateId }
  } else {
    const row = await apiRequest('/api/superadmin/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const createdId = templateRowId(row)
    console.log(`\n[pack] created DECK_PACK ${manifestEntry.packId} → id=${createdId || '?'}`)
    row = { ...(row || {}), id: createdId || row?.id }
  }

  const templateId = templateRowId(row) || templateRowId(match)
  if (uploadMedia && templateId) {
    const uploads = []
    if (converted.previewUrl) {
      uploads.push({ kind: 'preview', slotHint: 'preview', url: converted.previewUrl, name: 'Pack preview' })
    }
    for (const hint of converted.mediaHints || []) {
      uploads.push({
        kind: 'photo',
        slotHint: hint.slotHint,
        url: hint.url,
        name: `Slide ${hint.slotHint.replace('slide:', '')}`,
      })
    }
    for (const item of uploads) {
      try {
        const blob = await fetchImageBlob(item.url)
        await uploadTemplateMedia(templateId, { ...blob, kind: item.kind, slotHint: item.slotHint, name: item.name })
        console.log(`  uploaded media ${item.slotHint} (${item.kind})`)
      } catch (err) {
        console.warn(`  media upload failed for ${item.slotHint}: ${err.message}`)
      }
    }
  }

  return { packId: manifestEntry.packId, id: templateId, converted }
}

function collectLayoutIdsFromPacks(packs) {
  const ids = new Set()
  for (const entry of packs) {
    const converted = convertPublicTemplateToDeckPack(entry)
    for (const layoutId of converted.requiredLayoutIds) ids.add(layoutId)
    const templateJson = JSON.parse(
      readFileSync(join(__dirname, '../public/templates', entry.templateFile), 'utf8')
    )
    for (const layoutId of collectRequiredLayoutIds(templateJson.scenes, entry.layoutOverrides)) {
      ids.add(layoutId)
    }
  }
  return [...ids]
}

async function main() {
  const args = parseArgs(process.argv)
  const manifest = loadManifest(MANIFEST_PATH)
  const packs = filterManifestPacks(manifest, args.only)

  if (!packs.length) {
    console.error('No packs matched --only filter. Available keys:')
    for (const p of manifest.packs || []) console.error(`  - ${p.key}`)
    process.exit(1)
  }

  if (args.writeSchema) {
    const converted = convertPublicTemplateToDeckPack(packs[0])
    const outPath = args.writeSchema.startsWith('/') || /^[A-Za-z]:/.test(args.writeSchema)
      ? args.writeSchema
      : join(process.cwd(), args.writeSchema)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(converted.schema, null, 2), 'utf8')
    console.log(`Wrote schema → ${outPath}`)
  }

  if (args.exportOnly) {
    console.log('Export complete.')
    return
  }

  console.log(`API: ${getApiBaseUrl()}`)
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}${args.layoutsOnly ? ' (layouts only)' : ''}${args.packsOnly ? ' (packs only)' : ''}`)
  console.log(`Packs: ${packs.map((p) => p.key).join(', ')}`)

  if (!args.dryRun) {
    await ensureAccessToken()
  }

  if (!args.packsOnly) {
    await seedDerivedLayouts(packs, { dryRun: args.dryRun })
  }

  if (!args.layoutsOnly) {
    for (const entry of packs) {
      await seedPack(entry, { dryRun: args.dryRun, uploadMedia: args.uploadMedia })
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(`\nSeed failed: ${err.message}`)
  process.exit(1)
})
