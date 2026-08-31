#!/usr/bin/env node
/**
 * Unit tests for compileLayoutGeometry.
 * Run: node src/utils/compileLayoutGeometry.test.mjs
 */
import assert from 'node:assert/strict'
import ALL_LAYOUT_CATALOGS from './deckLayoutCatalogs.js'
import {
  compileLayoutGeometry,
  gridRegionToPlacement,
  geometrySnapshot,
  validateLayoutGeometry,
  DEFAULT_CANVAS,
} from './compileLayoutGeometry.js'
import { compileDeckLayoutToElements } from './compileDeckLayoutToElements.js'
import { parseRegion, getGridDims } from './layoutPreviewUtils.js'

const CANVAS = DEFAULT_CANVAS

function testDirectGridConversion() {
  const reg = { c1: 1, c2: 6, r1: 1, r2: 10 }
  const grid = { COLS: 12, ROWS: 10 }
  const p = gridRegionToPlacement(reg, grid, CANVAS)
  assert.equal(p.x, 0)
  assert.equal(p.y, 0)
  assert.equal(p.width, 960)
  assert.equal(p.height, 1080)
  console.log('  ✓ direct grid conversion')
}

function testHeroSlotFullBleed() {
  const schema = ALL_LAYOUT_CATALOGS.title_image_logo_v1
  const geo = compileLayoutGeometry(schema, CANVAS)
  const hero = geo.get('HERO_IMAGE')
  assert.ok(hero, 'HERO_IMAGE geometry exists')
  assert.equal(hero.compiled.x, 960)
  assert.equal(hero.compiled.y, 0)
  assert.equal(hero.compiled.width, 960)
  assert.equal(hero.compiled.height, 1080)
  console.log('  ✓ hero slot full-bleed geometry')
}

function testTitleCentered() {
  const schema = ALL_LAYOUT_CATALOGS.title_centered_v1
  const geo = compileLayoutGeometry(schema, CANVAS)
  const title = geo.get('MAIN_TITLE')
  assert.ok(title)
  const grid = getGridDims(schema.slots)
  const reg = parseRegion('cols 2-11, rows 4-6')
  const expected = gridRegionToPlacement(reg, grid, CANVAS)
  assert.equal(title.compiled.x, expected.x)
  assert.equal(title.compiled.y, expected.y)
  assert.equal(title.compiled.width, expected.width)
  assert.equal(title.compiled.height, expected.height)
  console.log('  ✓ title centered geometry matches grid')
}

function testNoPackColumnDrift() {
  const schema = ALL_LAYOUT_CATALOGS.title_centered_v1
  const elements = compileDeckLayoutToElements(schema, {
    canvas: CANVAS,
    content: { title: 'Test', subtitle: 'Sub' },
    packColumnStacks: false,
  })
  const geo = compileLayoutGeometry(schema, CANVAS)
  for (const el of elements) {
    if (!el.slotId || el.type !== 'text') continue
    const g = geo.get(el.slotId)
    if (!g) continue
    const dx = Math.abs((el.placement?.x ?? 0) - (g.compiled?.x ?? 0))
    const dy = Math.abs((el.placement?.y ?? 0) - (g.compiled?.y ?? 0))
    assert.ok(dx <= 1, `${el.slotId} x drift ${dx}`)
    assert.ok(dy <= 1, `${el.slotId} y drift ${dy}`)
  }
  console.log('  ✓ no column pack drift on title layout')
}

function testBackgroundImageElementType() {
  const schema = Object.values(ALL_LAYOUT_CATALOGS).find((s) =>
    s.slots?.some((sl) => sl.id === 'BACKGROUND_IMAGE')
  )
  if (!schema) {
    console.log('  ⊘ skip background image test (no layout with BACKGROUND_IMAGE)')
    return
  }
  const elements = compileDeckLayoutToElements(schema, {
    canvas: CANVAS,
    content: {
      slotImageUrls: { BACKGROUND_IMAGE: 'https://placehold.co/1920x1080' },
    },
  })
  const bg = elements.find((e) => e.slotId === 'BACKGROUND_IMAGE')
  assert.ok(bg, 'BACKGROUND_IMAGE element exists')
  assert.equal(bg.type, 'image')
  assert.equal(bg.content?.fit || 'cover', 'cover')
  console.log('  ✓ background image compiles as image element')
}

function testRepresentativeLayouts() {
  const ids = [
    'title_centered_v1',
    'title_image_logo_v1',
    'title_hero_left_blob_v1',
  ]
  for (const id of ids) {
    const schema = ALL_LAYOUT_CATALOGS[id]
    if (!schema) continue
    const geo = compileLayoutGeometry(schema, CANVAS)
    const elements = compileDeckLayoutToElements(schema, {
      canvas: CANVAS,
      content: { title: 'Test Title', subtitle: 'Subtitle' },
    })
    const validation = validateLayoutGeometry(schema, elements, geo, CANVAS)
    const rendererIssues = validation.issues.filter(
      (i) => !['TEXT_OVERLAP'].includes(i.type)
    )
    assert.equal(rendererIssues.length, 0, `${id} should have no renderer issues`)
  }
  console.log('  ✓ representative layouts pass validation')
}

function testGeometrySnapshot() {
  const schema = ALL_LAYOUT_CATALOGS.title_centered_v1
  const geo = compileLayoutGeometry(schema, CANVAS)
  const snap = geometrySnapshot(schema, geo, CANVAS)
  assert.equal(snap.layoutId, 'title_centered_v1')
  assert.ok(snap.slots.length >= 2)
  for (const slot of snap.slots) {
    assert.equal(slot.difference.x, 0)
    assert.equal(slot.difference.y, 0)
    assert.equal(slot.difference.width, 0)
    assert.equal(slot.difference.height, 0)
  }
  console.log('  ✓ geometry snapshot shows zero drift')
}

console.log('compileLayoutGeometry tests\n')
testDirectGridConversion()
testHeroSlotFullBleed()
testTitleCentered()
testNoPackColumnDrift()
testBackgroundImageElementType()
testRepresentativeLayouts()
testGeometrySnapshot()
console.log('\nAll tests passed.')
