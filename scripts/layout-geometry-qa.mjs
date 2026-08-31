#!/usr/bin/env node
/**
 * Layout geometry QA runner — validates all catalog layouts compile without geometry drift.
 * Run: node scripts/layout-geometry-qa.mjs
 */
import ALL_LAYOUT_CATALOGS from '../src/utils/deckLayoutCatalogs.js'
import { compileLayoutGeometry, geometrySnapshot, validateLayoutGeometry } from '../src/utils/compileLayoutGeometry.js'
import { compileDeckLayoutToElements } from '../src/utils/compileDeckLayoutToElements.js'

const CANVAS = { width: 1920, height: 1080 }
const TOLERANCE = 1

const TEST_CONTENT = {
  title: 'The Future of AI',
  subtitle: 'A comprehensive overview of technology trends',
  body: 'Key insight paragraph for testing layout geometry fidelity across all catalog layouts.',
  bullets: ['First strategic point', 'Second strategic point', 'Third strategic point'],
  imageUrl: 'https://placehold.co/800x600/png',
  slotImageUrls: {
    HERO_IMAGE: 'https://placehold.co/800x600/png',
    BACKGROUND_IMAGE: 'https://placehold.co/1920x1080/png',
    IMAGE_1: 'https://placehold.co/400x300/png',
    IMAGE_2: 'https://placehold.co/400x300/png',
    IMAGE_3: 'https://placehold.co/400x300/png',
  },
  chart: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [42, 58, 51, 67],
  },
}

function isTransformSlot(slot, schema) {
  const id = String(slot?.id || '')
  const slots = schema?.slots || []

  if (
    slot?.geometryTransform ||
    /^STEP_\d+_CIRCLE$/i.test(id) ||
    /^METRIC_IMAGE_/i.test(id) ||
    slot?.shapeHint?.kind === 'stepCircle'
  ) {
    return true
  }

  if (/icon|avatar|logo/i.test(id) && (slot.role === 'decoration' || slot.shape)) {
    return true
  }

  if (/^DEVICE_|^PHONE_|^LAPTOP_|^TABLET_|^WATCH_/i.test(id) && slot.role === 'image') {
    return true
  }

  if (findDeviceFrameSlot(slots, id)) {
    return true
  }

  const layoutId = String(schema?.layout_id || '')
  if (/process_linner|timeline_/i.test(layoutId) && /^STEP_\d+_(TITLE|BODY|ICON)/i.test(id)) {
    return true
  }

  return false
}

function findDeviceFrameSlot(slots, imageSlotId) {
  const target = String(imageSlotId || '')
  return (slots || []).find(
    (s) => s?.shapeHint?.pairsWithSlotId && String(s.shapeHint.pairsWithSlotId) === target
  )
}

function diffPlacement(a, b) {
  return {
    x: (b?.x ?? 0) - (a?.x ?? 0),
    y: (b?.y ?? 0) - (a?.y ?? 0),
    width: (b?.width ?? 0) - (a?.width ?? 0),
    height: (b?.height ?? 0) - (a?.height ?? 0),
  }
}

function hasSignificantDiff(diff) {
  return (
    Math.abs(diff.x) > TOLERANCE ||
    Math.abs(diff.y) > TOLERANCE ||
    Math.abs(diff.width) > TOLERANCE ||
    Math.abs(diff.height) > TOLERANCE
  )
}

function runLayoutQa(layoutId, schema) {
  const issues = []
  const geometryMap = compileLayoutGeometry(schema, CANVAS)

  const elements = compileDeckLayoutToElements(schema, {
    canvas: CANVAS,
    content: TEST_CONTENT,
  })

  const validation = validateLayoutGeometry(schema, elements, geometryMap, CANVAS)
  if (!validation.pass) {
    for (const issue of validation.issues) {
      issues.push(issue)
    }
  }

  const elementBySlot = new Map()
  for (const el of elements) {
    if (el.slotId && !elementBySlot.has(el.slotId)) {
      elementBySlot.set(el.slotId, el)
    }
  }

  for (const slot of schema.slots || []) {
    if (!slot?.id || slot.aiOnly) continue
    const geo = geometryMap.get(slot.id)
    if (!geo) {
      issues.push({ type: 'MISSING_GEOMETRY', slotId: slot.id })
      continue
    }

    const el = elementBySlot.get(slot.id)
    if (!el) {
      if (slot.role === 'decoration' && slot.aiOnly !== false) continue
      issues.push({ type: 'MISSING_ELEMENT', slotId: slot.id })
      continue
    }

    if (!isTransformSlot(slot, schema)) {
      const diff = diffPlacement(geo.compiled, el.placement)
      if (hasSignificantDiff(diff)) {
        issues.push({
          type: 'ELEMENT_GEOMETRY_MISMATCH',
          slotId: slot.id,
          expected: geo.compiled,
          actual: el.placement,
          diff,
        })
      }
    }

    const slotIdUpper = String(slot.id).toUpperCase()
    if (
      (slotIdUpper === 'BACKGROUND_IMAGE' || slotIdUpper === 'HERO_IMAGE') &&
      el.type === 'image' &&
      el.content?.fit !== 'cover' &&
      !slot.fit
    ) {
      issues.push({ type: 'WRONG_IMAGE_FIT', slotId: slot.id, fit: el.content?.fit })
    }
  }

  return { layoutId, issues, elementCount: elements.length, slotCount: geometryMap.size }
}

const layouts = Object.values(ALL_LAYOUT_CATALOGS)
const pass = []
const fail = []
const layoutDataIssues = []

console.log(`\nLayout Geometry QA — ${layouts.length} layouts\n${'='.repeat(50)}`)

for (const schema of layouts) {
  const layoutId = schema.layout_id
  const result = runLayoutQa(layoutId, schema)

  if (result.issues.length === 0) {
    pass.push(layoutId)
  } else {
    const dataIssues = result.issues.filter((i) =>
      ['TEXT_OVERLAP', 'OUTSIDE_CANVAS'].includes(i.type)
    )
    const rendererIssues = result.issues.filter(
      (i) => !['TEXT_OVERLAP', 'OUTSIDE_CANVAS'].includes(i.type)
    )

    if (rendererIssues.length) {
      fail.push({ layoutId, issues: rendererIssues })
    } else {
      layoutDataIssues.push({ layoutId, issues: dataIssues })
      pass.push(layoutId)
    }
  }
}

console.log(`\nPASS (${pass.length}):`)
for (const id of pass.slice(0, 10)) console.log(`  ${id}`)
if (pass.length > 10) console.log(`  ... and ${pass.length - 10} more`)

console.log(`\nFAIL (${fail.length}):`)
for (const { layoutId, issues } of fail) {
  console.log(`  ${layoutId}`)
  for (const issue of issues.slice(0, 5)) {
    if (issue.type === 'ELEMENT_GEOMETRY_MISMATCH') {
      const d = issue.diff
      const parts = []
      if (Math.abs(d.x) > TOLERANCE) parts.push(`x ${d.x > 0 ? '+' : ''}${d.x}px`)
      if (Math.abs(d.y) > TOLERANCE) parts.push(`y ${d.y > 0 ? '+' : ''}${d.y}px`)
      if (Math.abs(d.width) > TOLERANCE) parts.push(`width ${d.width > 0 ? '+' : ''}${d.width}px`)
      if (Math.abs(d.height) > TOLERANCE) parts.push(`height ${d.height > 0 ? '+' : ''}${d.height}px`)
      console.log(`    - ${issue.slotId}: ${parts.join(', ')}`)
    } else {
      console.log(`    - [${issue.type}] ${issue.slotId || ''} ${JSON.stringify(issue).slice(0, 120)}`)
    }
  }
  if (issues.length > 5) console.log(`    ... and ${issues.length - 5} more issues`)
}

if (layoutDataIssues.length) {
  console.log(`\nLAYOUT DATA ISSUE (${layoutDataIssues.length} — overlaps/bounds in source JSON):`)
  for (const { layoutId, issues } of layoutDataIssues.slice(0, 10)) {
    console.log(`  ${layoutId}: ${issues.map((i) => i.type).join(', ')}`)
  }
}

const passRate = ((pass.length / layouts.length) * 100).toFixed(1)
console.log(`\n${'='.repeat(50)}`)
console.log(`Pass rate: ${passRate}% (${pass.length}/${layouts.length})`)
console.log(`Renderer failures: ${fail.length}`)
console.log(`Layout data issues: ${layoutDataIssues.length}`)

process.exit(fail.length > 0 ? 1 : 0)
