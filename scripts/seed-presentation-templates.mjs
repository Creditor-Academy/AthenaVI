#!/usr/bin/env node
/**
 * Seed DECK_LAYOUT templates from deckLayoutRegistry.js via Superadmin API.
 *
 * Env:
 *   API_BASE_URL or VITE_API_BASE_URL — backend origin (no trailing slash)
 *   SUPERADMIN_TOKEN — Bearer token for superadmin routes
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import REGISTRY from '../src/utils/deckLayoutRegistry.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const args = { dryRun: false, update: false, only: [] }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--update') args.update = true
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
  return process.env.SUPERADMIN_TOKEN?.trim() || process.env.ACCESS_TOKEN?.trim() || ''
}

function getApiBaseUrl() {
  const base = (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:9000').trim()
  return base.replace(/\/$/, '')
}

function getAuthHeaders(json = true) {
  const token = resolveAccessToken()
  if (!token) {
    throw new Error(
      'SUPERADMIN_TOKEN (or ACCESS_TOKEN) is required. Add it to .env.local or your shell environment.'
    )
  }
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
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
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
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

async function seedLayouts(layoutIds, { dryRun, update }) {
  const existing = await listTemplates('DECK_LAYOUT', { offline: dryRun && !resolveAccessToken() })
  const existingByLayoutId = new Map()
  for (const row of existing) {
    const lid = layoutIdFromTemplateRow(row)
    if (lid) existingByLayoutId.set(lid, row)
  }
  const existingIds = new Set(existingByLayoutId.keys())
  const toCreate = layoutIds.filter((id) => !existingIds.has(id))
  const toUpdate = update ? layoutIds.filter((id) => existingIds.has(id)) : []

  console.log(
    `\n[layouts] total=${layoutIds.length} existing=${existingIds.size} toCreate=${toCreate.length} toUpdate=${toUpdate.length}`
  )

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
    created.push({ layoutId, id: templateRowId(row) })
  }

  for (const layoutId of toUpdate) {
    const schema = REGISTRY[layoutId]
    const row = existingByLayoutId.get(layoutId)
    const templateId = templateRowId(row)
    if (!schema || !templateId) continue
    const payload = {
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
      console.log(`  [dry-run] PATCH DECK_LAYOUT ${layoutId}`)
      continue
    }
    await apiRequest(`/api/superadmin/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    console.log(`  updated DECK_LAYOUT ${layoutId} → id=${templateId}`)
  }

  for (const layoutId of layoutIds) {
    if (existingIds.has(layoutId) && !update) {
      console.log(`  exists DECK_LAYOUT ${layoutId}`)
    }
  }

  return created
}

async function main() {
  const args = parseArgs(process.argv)
  let layoutIds = Object.keys(REGISTRY)
  if (args.only.length) {
    layoutIds = layoutIds.filter((id) => args.only.includes(id))
  }

  if (!layoutIds.length) {
    console.error('No layouts matched --only filter.')
    process.exit(1)
  }

  console.log(`API: ${getApiBaseUrl()}`)
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}${args.update ? ' (update existing)' : ''}`)
  console.log(`Layouts: ${layoutIds.length}`)

  if (!args.dryRun) {
    await ensureAccessToken()
  }

  await seedLayouts(layoutIds, { dryRun: args.dryRun, update: args.update })
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(`\nSeed failed: ${err.message}`)
  process.exit(1)
})
