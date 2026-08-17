/** Post-compile timeline connector line + dot shapes (mirrors backend finalizeElementsDoc). */

function paletteColor(palette, role, fallback) {
  if (!palette || typeof palette !== 'object') return fallback
  return palette[role] || fallback
}

function cardGroupKey(slotId) {
  const id = String(slotId || '')
  let m = id.match(/^milestone_(\d+)(?:_(label|detail))?$/i)
  if (m) return `milestone_${m[1]}`
  m = id.match(/^step_(\d+)_(title|body)$/i)
  if (m) return `step_${m[1]}`
  m = id.match(/^CARD_(\d+)_(TITLE|BODY)$/i)
  if (m) return `card_${m[1]}`
  return null
}

function isTimelineAnchorSlot(slotId) {
  const sid = String(slotId || '').toLowerCase()
  return (
    /^milestone_\d+(_label)?$/i.test(sid) ||
    /^step_\d+_title$/i.test(sid)
  )
}

export function applyDefaultCardShapes(elements, schema, palette = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements

  const slots = schema.slots
  const next = [...elements]
  const groups = new Map()

  for (const slot of slots) {
    const key = cardGroupKey(slot.id)
    if (!key) continue
    const role = String(slot.role || '').toLowerCase()
    if (!['heading', 'body', 'subheading', 'stat'].includes(role) && !/^milestone_/i.test(slot.id)) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(slot)
  }

  for (const groupSlots of groups.values()) {
    const placements = groupSlots
      .map((slot) => next.find((el) => el.slotId === slot.id)?.placement)
      .filter(Boolean)
    if (!placements.length) continue

    const x = Math.min(...placements.map((p) => p.x ?? 0))
    const y = Math.min(...placements.map((p) => p.y ?? 0))
    const x2 = Math.max(...placements.map((p) => (p.x ?? 0) + (p.width ?? 0)))
    const y2 = Math.max(...placements.map((p) => (p.y ?? 0) + (p.height ?? 0)))
    const pad = 12
    const colorMap = palette

    next.unshift({
      id: `shp-card-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 0,
      placement: {
        x: Math.max(0, x - pad),
        y: Math.max(0, y - pad),
        width: Math.max(40, x2 - x + pad * 2),
        height: Math.max(40, y2 - y + pad * 2),
        rotation: 0,
        opacity: 1,
      },
      content: {
        shape: 'rect',
        fill: paletteColor(colorMap, 'cardBg', 'color-mix(in srgb, #94a3b8 14%, #ffffff)'),
        borderRadius: 10,
        layoutSurface: true,
      },
      role: 'decoration',
    })
  }

  return next
}

function computeTimelineConnectorGeometry(elements, schema) {
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  const imageEls = elements.filter(
    (el) => el.type === 'image' && /^IMAGE_\d+$/i.test(String(el.slotId || ''))
  )
  const labelEls = elements
    .filter((el) => {
      if (el.type !== 'text' && el.type !== 'textbox') return false
      return /^milestone_\d+_label$/i.test(String(el.slotId || ''))
    })
    .sort((a, b) => (a.placement?.x ?? 0) - (b.placement?.x ?? 0))

  if (labelEls.length < 2) return null

  const columnCenters = labelEls.map((el) => {
    const p = el.placement || {}
    return {
      x: (p.x ?? 0) + (p.width ?? 0) / 2,
      labelTop: p.y ?? 0,
    }
  })

  let axisY
  if (/timeline_milestones_image/.test(layoutId) && imageEls.length) {
    axisY = Math.max(...imageEls.map((el) => (el.placement?.y ?? 0) + (el.placement?.height ?? 0))) + 12
  } else {
    axisY = Math.min(...columnCenters.map((c) => c.labelTop)) - 20
  }

  return {
    axisY,
    centers: columnCenters.map((c) => ({ x: c.x, y: axisY })),
    lineX1: columnCenters[0].x,
    lineX2: columnCenters[columnCenters.length - 1].x,
  }
}

export function applyTimelineConnectorShapes(elements, schema, palette = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements
  const layoutId = String(schema.layout_id || '').toLowerCase()
  if (!/timeline/.test(layoutId)) return elements

  const geometry = computeTimelineConnectorGeometry(elements, schema)
  if (!geometry) return elements

  const next = [...elements]
  const accent = paletteColor(palette, 'accent', paletteColor(palette, 'primary', '#6366F1'))
  const muted = paletteColor(palette, 'muted', '#94A3B8')
  const { axisY, centers, lineX1, lineX2 } = geometry

  next.unshift({
    id: `shp-timeline-line-${Math.random().toString(36).slice(2, 9)}`,
    type: 'shape',
    layer: 0,
    placement: {
      x: lineX1,
      y: axisY,
      width: Math.max(40, lineX2 - lineX1),
      height: 4,
      rotation: 0,
      opacity: 0.9,
    },
    content: {
      shape: 'rect',
      fill: muted,
      borderRadius: 2,
      layoutSurface: true,
    },
    role: 'decoration',
  })

  centers.forEach((c) => {
    const dotSize = 14
    next.unshift({
      id: `shp-timeline-dot-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 3,
      placement: {
        x: c.x - dotSize / 2,
        y: axisY - dotSize / 2 + 2,
        width: dotSize,
        height: dotSize,
        rotation: 0,
        opacity: 1,
      },
      content: {
        shape: 'ellipse',
        fill: accent,
        layoutSurface: true,
      },
      role: 'decoration',
    })
  })

  return next
}

export function finalizeTimelineShapes(elements, schema, palette = {}) {
  let next = applyDefaultCardShapes(elements, schema, palette)
  next = applyTimelineConnectorShapes(next, schema, palette)
  return next
}
