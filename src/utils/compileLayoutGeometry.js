/**
 * Authoritative layout geometry compiler.
 * Converts DECK_LAYOUT slot regions → canvas placements (1920×1080 default).
 * Geometry is immutable after this layer unless slot defines an explicit transform.
 */
import { parseRegion, getGridDims, filterPreviewSlots } from './layoutPreviewUtils.js'

export const DEFAULT_CANVAS = { width: 1920, height: 1080 }

/** Grid dims from visible slots only — excludes aiOnly hints so compile matches catalog preview. */
export function getCompileGridDims(slots = []) {
  return getGridDims(filterPreviewSlots(slots))
}

/** @typedef {{ x: number, y: number, width: number, height: number, rotation?: number, opacity?: number }} Placement */

/**
 * Resolve slot.padding (number or {top,right,bottom,left}) to pixel insets.
 * @returns {{ left: number, right: number, top: number, bottom: number }}
 */
export function resolveSlotPaddingPx(slot, grid, canvas) {
  const p = slot?.padding
  if (p == null) return { left: 0, right: 0, top: 0, bottom: 0 }

  const width = canvas?.width || DEFAULT_CANVAS.width
  const height = canvas?.height || DEFAULT_CANVAS.height
  const COLS = grid?.COLS || 12
  const ROWS = grid?.ROWS || 10
  const colW = width / COLS
  const rowH = height / ROWS

  if (typeof p === 'number') {
    const v = Number(p) || 0
    // Grid-unit padding when value is small (< 5); pixel padding otherwise
    const isGrid = v > 0 && v < 5
    const px = isGrid ? { x: v * colW, y: v * rowH } : { x: v, y: v }
    return { left: px.x, right: px.x, top: px.y, bottom: px.y }
  }

  const toPx = (val, unit) => {
    const n = Number(val) || 0
    if (unit === 'grid' || (n > 0 && n < 5 && !String(val).includes('px'))) {
      return n * (unit === 'grid' || val === p.left || val === p.right ? colW : rowH)
    }
    return n
  }

  return {
    left: toPx(p.left, p.unit),
    right: toPx(p.right, p.unit),
    top: toPx(p.top, p.unit),
    bottom: toPx(p.bottom, p.unit),
  }
}

/**
 * Convert parsed grid region to pixel placement (authoritative base geometry).
 */
export function gridRegionToPlacement(reg, grid, canvas, paddingPx = null) {
  const width = canvas?.width || DEFAULT_CANVAS.width
  const height = canvas?.height || DEFAULT_CANVAS.height
  const COLS = grid?.COLS || 12
  const ROWS = grid?.ROWS || 10
  const colW = width / COLS
  const rowH = height / ROWS

  const pad = paddingPx || { left: 0, right: 0, top: 0, bottom: 0 }
  const rawW = (reg.c2 - reg.c1 + 1) * colW
  const rawH = (reg.r2 - reg.r1 + 1) * rowH

  return {
    x: Math.round((reg.c1 - 1) * colW + pad.left),
    y: Math.round((reg.r1 - 1) * rowH + pad.top),
    width: Math.max(1, Math.round(rawW - pad.left - pad.right)),
    height: Math.max(1, Math.round(rawH - pad.top - pad.bottom)),
    rotation: 0,
    opacity: 1,
  }
}

/**
 * Normalize a single slot's region string into canonical pixel geometry.
 */
export function normalizeSlotGeometry(slot, grid, canvas, options = {}) {
  const reg = parseRegion(slot?.region)
  if (!reg) return null

  let adjusted = { ...reg }
  if (slot?.allowRowSplit === true && options?.allSlots) {
    adjusted = adjustSlotRegionIfAllowed(adjusted, slot, options.allSlots)
  }

  const paddingPx = resolveSlotPaddingPx(slot, grid, canvas)
  const base = gridRegionToPlacement(adjusted, grid, canvas, paddingPx)
  return { base, reg: adjusted }
}

const TEXT_ROLES = new Set([
  'heading', 'subheading', 'body', 'caption', 'stat', 'stat_label',
  'quote', 'attribution', 'cta', 'contact', 'eyebrow', 'divider',
])

function shouldSplitSharedRow(upperRole, lowerRole) {
  if (TEXT_ROLES.has(upperRole) && TEXT_ROLES.has(lowerRole)) return true
  if (upperRole === 'heading' && lowerRole === 'body') return true
  if (upperRole === 'chart' && (lowerRole === 'caption' || TEXT_ROLES.has(lowerRole))) return true
  if (upperRole === 'image' && TEXT_ROLES.has(lowerRole)) return true
  return false
}

/** Opt-in row splitting — only when slot.allowRowSplit === true */
function adjustSlotRegionIfAllowed(reg, slot, allSlots) {
  const adjusted = { ...reg }
  const role = slot?.role || 'body'

  for (const other of allSlots) {
    if (other.id === slot.id) continue
    const oreg = parseRegion(other.region)
    if (!oreg) continue
    const otherRole = other.role || 'body'

    if (oreg.r1 === adjusted.r2 && shouldSplitSharedRow(role, otherRole)) {
      adjusted.r2 -= 0.75
    }
    if (oreg.r2 === adjusted.r1 && shouldSplitSharedRow(otherRole, role)) {
      adjusted.r1 += 0.75
    }
  }

  if (adjusted.r2 < adjusted.r1) adjusted.r2 = adjusted.r1 + 0.5
  return adjusted
}

/**
 * Apply explicit per-slot geometry transforms (step circles, metric squares, centered icons).
 * These are layout-defined transforms, not content-driven adjustments.
 */
export function applySlotGeometryTransform(slot, placement) {
  const id = String(slot?.id || '')
  const transform = slot?.geometryTransform

  if (transform === 'metricSquare' || /^METRIC_IMAGE_/i.test(id)) {
    const size = Math.max(48, Math.round(Math.min(placement.width || 0, placement.height || 0)))
    return {
      ...placement,
      x: Math.round((placement.x || 0) + ((placement.width || size) - size) / 2),
      y: Math.round((placement.y || 0) + ((placement.height || size) - size) / 2),
      width: size,
      height: size,
    }
  }

  return placement
}

/**
 * Compile all slot geometries for a layout schema.
 * @returns {Map<string, { layout: Placement, compiled: Placement, base: Placement }>}
 */
export function compileLayoutGeometry(schema, canvas = DEFAULT_CANVAS, options = {}) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const grid = getCompileGridDims(slots)
  const map = new Map()

  for (const slot of slots) {
    if (!slot?.id || !slot?.region) continue
    const normalized = normalizeSlotGeometry(slot, grid, canvas, { allSlots: slots })
    if (!normalized) continue

    const { base } = normalized
    const layoutPlacement = { ...base }
    const compiled = applySlotGeometryTransform(slot, base)

    map.set(slot.id, {
      layout: layoutPlacement,
      compiled,
      base,
    })
  }

  return map
}

/**
 * Get compiled placement for a slot (convenience).
 */
export function getSlotPlacement(geometryMap, slotId, slot = null) {
  const entry = geometryMap.get(slotId)
  if (!entry) return null
  if (slot) return applySlotGeometryTransform(slot, entry.base)
  return entry.compiled
}

/**
 * Debug snapshot: layout vs compiled geometry per slot.
 */
export function geometrySnapshot(schema, geometryMap, canvas = DEFAULT_CANVAS) {
  const slots = []
  for (const [slotId, entry] of geometryMap.entries()) {
    const layout = entry.layout || entry.base
    const compiled = entry.compiled
    slots.push({
      slotId,
      layout: pickGeo(layout),
      compiled: pickGeo(compiled),
      difference: {
        x: (compiled?.x ?? 0) - (layout?.x ?? 0),
        y: (compiled?.y ?? 0) - (layout?.y ?? 0),
        width: (compiled?.width ?? 0) - (layout?.width ?? 0),
        height: (compiled?.height ?? 0) - (layout?.height ?? 0),
      },
    })
  }

  return {
    layoutId: schema?.layout_id || 'unknown',
    canvas: {
      width: canvas?.width || DEFAULT_CANVAS.width,
      height: canvas?.height || DEFAULT_CANVAS.height,
    },
    slots,
  }
}

function pickGeo(p) {
  return {
    x: p?.x ?? 0,
    y: p?.y ?? 0,
    width: p?.width ?? 0,
    height: p?.height ?? 0,
  }
}

/**
 * QA validation pass after compilation.
 */
export function validateLayoutGeometry(schema, elements = [], geometryMap = null, canvas = DEFAULT_CANVAS) {
  const issues = []
  const cw = canvas?.width || DEFAULT_CANVAS.width
  const ch = canvas?.height || DEFAULT_CANVAS.height
  const tolerance = 1

  if (geometryMap) {
    for (const [slotId, entry] of geometryMap.entries()) {
      const layout = entry.layout || entry.base
      const compiled = entry.compiled
      const slot = (schema?.slots || []).find((s) => s.id === slotId)
      const isTransformSlot =
        slot &&
        (slot.geometryTransform ||
          /^STEP_\d+_CIRCLE$/i.test(slotId) ||
          /^METRIC_IMAGE_/i.test(slotId) ||
          slot.shapeHint?.kind === 'stepCircle')

      if (!isTransformSlot) {
        for (const key of ['x', 'y', 'width', 'height']) {
          const diff = Math.abs((compiled?.[key] ?? 0) - (layout?.[key] ?? 0))
          if (diff > tolerance) {
            issues.push({
              type: 'GEOMETRY_DRIFT',
              slotId,
              field: key,
              expected: layout?.[key],
              actual: compiled?.[key],
              diff,
            })
          }
        }
      }
    }
  }

  for (const el of elements) {
    const p = el.placement || {}
    if ((p.width ?? 0) < 0 || (p.height ?? 0) < 0) {
      issues.push({ type: 'NEGATIVE_DIMENSION', slotId: el.slotId, placement: p })
    }
    if ((p.x ?? 0) < -tolerance || (p.y ?? 0) < -tolerance) {
      issues.push({ type: 'OUTSIDE_CANVAS', slotId: el.slotId, placement: p })
    }
    if ((p.x ?? 0) + (p.width ?? 0) > cw + tolerance) {
      issues.push({ type: 'OUTSIDE_CANVAS', slotId: el.slotId, placement: p, edge: 'right' })
    }
    if ((p.y ?? 0) + (p.height ?? 0) > ch + tolerance) {
      issues.push({ type: 'OUTSIDE_CANVAS', slotId: el.slotId, placement: p, edge: 'bottom' })
    }

    const slotId = String(el.slotId || '').toUpperCase()
    if (
      (slotId === 'BACKGROUND_IMAGE' || slotId === 'HERO_IMAGE') &&
      el.type !== 'image'
    ) {
      issues.push({ type: 'WRONG_ELEMENT_TYPE', slotId: el.slotId, expected: 'image', actual: el.type })
    }
    if (
      (slotId === 'BACKGROUND_IMAGE' || slotId === 'HERO_IMAGE') &&
      el.type === 'image' &&
      el.content?.fit &&
      el.content.fit !== 'cover'
    ) {
      issues.push({ type: 'WRONG_IMAGE_FIT', slotId: el.slotId, fit: el.content.fit })
    }
  }

  const textEls = elements.filter((e) => e.type === 'text')
  for (let i = 0; i < textEls.length; i++) {
    const a = textEls[i].placement || {}
    for (let j = i + 1; j < textEls.length; j++) {
      const b = textEls[j].placement || {}
      const overlapX = (a.x ?? 0) < (b.x ?? 0) + (b.width ?? 0) && (b.x ?? 0) < (a.x ?? 0) + (a.width ?? 0)
      const overlapY = (a.y ?? 0) < (b.y ?? 0) + (b.height ?? 0) && (b.y ?? 0) < (a.y ?? 0) + (a.height ?? 0)
      if (overlapX && overlapY) {
        const overlapArea =
          Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
          Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
        const minArea = Math.min((a.width ?? 1) * (a.height ?? 1), (b.width ?? 1) * (b.height ?? 1))
        if (overlapArea > minArea * 0.15) {
          issues.push({
            type: 'TEXT_OVERLAP',
            slotA: textEls[i].slotId,
            slotB: textEls[j].slotId,
          })
        }
      }
    }
  }

  return { pass: issues.length === 0, issues }
}
