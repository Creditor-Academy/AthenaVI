/** Post-compile timeline connector + card shapes (mirrors backend finalizeElementsDoc). */

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
  m = id.match(/^STEP_(\d+)_(TITLE|BODY)$/)
  if (m) return `step_${m[1]}`
  m = id.match(/^CARD_(\d+)_(TITLE|BODY)$/i)
  if (m) return `card_${m[1]}`
  return null
}

function separateCardBoxes(boxes, canvas, { edgeInset = 56, gap = 24 } = {}) {
  if (!boxes.length) return boxes
  const canvasW = canvas?.width || 1920
  const canvasH = canvas?.height || 1080
  const sorted = [...boxes].sort((a, b) => a.x - b.x)

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]
    const cur = sorted[i]
    const prevRight = prev.x + prev.width
    if (cur.x < prevRight + gap) {
      const mid = (prevRight + cur.x) / 2
      const newPrevRight = mid - gap / 2
      const newCurLeft = mid + gap / 2
      prev.width = Math.max(40, newPrevRight - prev.x)
      const shrinkLeft = newCurLeft - cur.x
      cur.x = newCurLeft
      cur.width = Math.max(40, cur.width - shrinkLeft)
    }
  }

  return sorted.map((box) => {
    let x = Math.max(edgeInset, box.x)
    let y = Math.max(edgeInset * 0.35, box.y)
    let width = box.width
    let height = box.height
    if (x + width > canvasW - edgeInset) width = Math.max(40, canvasW - edgeInset - x)
    if (y + height > canvasH - edgeInset * 0.35) height = Math.max(40, canvasH - edgeInset * 0.35 - y)
    return { ...box, x, y, width, height }
  })
}

export function applyDefaultCardShapes(elements, schema, palette = {}, canvas = {}) {
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

  const pending = []
  for (const [key, groupSlots] of groups.entries()) {
    const placements = groupSlots
      .map((slot) => next.find((el) => el.slotId === slot.id)?.placement)
      .filter(Boolean)
    if (!placements.length) continue

    const x = Math.min(...placements.map((p) => p.x ?? 0))
    const y = Math.min(...placements.map((p) => p.y ?? 0))
    const x2 = Math.max(...placements.map((p) => (p.x ?? 0) + (p.width ?? 0)))
    const y2 = Math.max(...placements.map((p) => (p.y ?? 0) + (p.height ?? 0)))
    const pad = 14
    pending.push({
      key,
      x: x - pad,
      y: y - pad,
      width: Math.max(40, x2 - x + pad * 2),
      height: Math.max(40, y2 - y + pad * 2),
    })
  }

  const separated = separateCardBoxes(pending, canvas, { edgeInset: 56, gap: 24 })
  for (const box of separated) {
    next.unshift({
      id: `shp-card-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 0,
      placement: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        rotation: 0,
        opacity: 1,
      },
      content: {
        shape: 'rect',
        fill: paletteColor(palette, 'cardBg', 'color-mix(in srgb, #94a3b8 14%, #ffffff)'),
        borderRadius: 12,
        layoutSurface: true,
      },
      role: 'decoration',
      slotId: `AUTO_CARD_BG_${box.key}`,
    })
  }

  return next
}

function isProcessFlowLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return (
    /timeline/.test(id) ||
    /process_linear/.test(id) ||
    /diagram_process/.test(id) ||
    /process_steps/.test(id) ||
    /agenda_timeline/.test(id)
  )
}

function findProcessAnchorElements(elements) {
  return elements
    .filter((el) => {
      if (el.type !== 'text' && el.type !== 'textbox') return false
      const sid = String(el.slotId || '')
      return (
        /^milestone_\d+_label$/i.test(sid) ||
        /^milestone_\d+$/i.test(sid) ||
        /^step_\d+_title$/i.test(sid) ||
        /^STEP_\d+_TITLE$/i.test(sid)
      )
    })
    .sort((a, b) => {
      const ay = a.placement?.y ?? 0
      const by = b.placement?.y ?? 0
      const ax = a.placement?.x ?? 0
      const bx = b.placement?.x ?? 0
      if (Math.abs(ay - by) > 80) return ay - by
      return ax - bx
    })
}

export function applyTimelineConnectorShapes(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements
  const layoutId = String(schema.layout_id || '').toLowerCase()
  if (!isProcessFlowLayout(layoutId)) return elements

  if (
    elements.some(
      (el) =>
        /^TIMELINE_(NODE|SEG|ARROW|SPINE)/i.test(String(el.slotId || '')) ||
        String(el.slotId || '') === 'TIMELINE_SPINE'
    )
  ) {
    return elements
  }

  const next = [...elements]
  const accent = paletteColor(palette, 'accent', paletteColor(palette, 'primary', '#6366F1'))
  const muted = paletteColor(palette, 'muted', '#94A3B8')
  const textColor = paletteColor(palette, 'text', '#0F172A')
  const canvasW = canvas.width || 1920

  const imageEls = next.filter(
    (el) => el.type === 'image' && /^IMAGE_\d+$/i.test(String(el.slotId || ''))
  )
  const labelEls = findProcessAnchorElements(next)
  if (labelEls.length < 2) return elements

  const isVertical = /timeline_vertical/.test(layoutId)
  const NODE = 48
  const NUM_H = 22
  const hasStepCircles = next.some((el) => /^STEP_\d+_CIRCLE$/i.test(String(el.slotId || '')))

  const centers = labelEls.map((el, i) => {
    const p = el.placement || {}
    return {
      x: (p.x ?? 0) + (p.width ?? 0) / 2,
      labelTop: p.y ?? 0,
      index: i + 1,
    }
  })

  let axisY
  if (/timeline_milestones_image/.test(layoutId) && imageEls.length) {
    axisY =
      Math.max(...imageEls.map((el) => (el.placement?.y ?? 0) + (el.placement?.height ?? 0))) + 28
  } else if (isVertical) {
    axisY = null
  } else {
    axisY = Math.min(...centers.map((c) => c.labelTop)) - NODE - NUM_H - 12
    axisY = Math.max(72, axisY)
  }

  if (isVertical) {
    const spineX = Math.min(...centers.map((c) => c.x)) - 36
    const y1 = centers[0].labelTop + 8
    const y2 = centers[centers.length - 1].labelTop + 8
    next.unshift({
      id: `shp-timeline-spine-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 0,
      placement: {
        x: Math.round(spineX - 1.5),
        y: Math.round(y1),
        width: 3,
        height: Math.max(40, y2 - y1),
        rotation: 0,
        opacity: 0.95,
      },
      content: { shape: 'rect', fill: muted, borderRadius: 2, layoutSurface: true },
      role: 'decoration',
      slotId: 'TIMELINE_SPINE',
    })
    centers.forEach((c) => {
      const cy = c.labelTop + 10
      next.unshift({
        id: `shp-timeline-node-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        layer: 3,
        placement: {
          x: Math.round(spineX - NODE / 2),
          y: Math.round(cy - NODE / 2),
          width: NODE,
          height: NODE,
          rotation: 0,
          opacity: 1,
        },
        content: { shape: 'ellipse', fill: accent, layoutSurface: true },
        role: 'decoration',
        slotId: `TIMELINE_NODE_${c.index}`,
      })
      next.unshift({
        id: `txt-timeline-num-${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        layer: 4,
        placement: {
          x: Math.round(spineX - NODE / 2),
          y: Math.round(cy + NODE / 2 + 2),
          width: NODE,
          height: NUM_H,
          rotation: 0,
          opacity: 1,
        },
        content: {
          text: String(c.index),
          align: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
        },
        role: 'caption',
        slotId: `TIMELINE_NODE_NUM_${c.index}`,
      })
    })
    return next
  }

  if (!hasStepCircles) {
    centers.forEach((c) => {
      next.unshift({
        id: `shp-timeline-node-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        layer: 3,
        placement: {
          x: Math.round(Math.max(56, Math.min(c.x - NODE / 2, canvasW - NODE - 56))),
          y: Math.round(axisY - NODE / 2),
          width: NODE,
          height: NODE,
          rotation: 0,
          opacity: 1,
        },
        content: { shape: 'ellipse', fill: accent, layoutSurface: true },
        role: 'decoration',
        slotId: `TIMELINE_NODE_${c.index}`,
      })
      next.unshift({
        id: `txt-timeline-num-${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        layer: 4,
        placement: {
          x: Math.round(Math.max(56, Math.min(c.x - NODE / 2, canvasW - NODE - 56))),
          y: Math.round(axisY + NODE / 2 + 2),
          width: NODE,
          height: NUM_H,
          rotation: 0,
          opacity: 1,
        },
        content: {
          text: String(c.index),
          align: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
        },
        role: 'caption',
        slotId: `TIMELINE_NODE_NUM_${c.index}`,
      })
    })
  }

  for (let i = 0; i < centers.length - 1; i += 1) {
    const a = centers[i]
    const b = centers[i + 1]
    const nodeR = hasStepCircles ? 32 : NODE / 2
    const x1 = a.x + nodeR + 4
    const x2 = b.x - nodeR - 4
    const segW = Math.max(8, x2 - x1)
    const lineY = axisY
    next.unshift({
      id: `shp-timeline-seg-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 1,
      placement: {
        x: Math.round(x1),
        y: Math.round(lineY - 1.5),
        width: Math.round(segW),
        height: 3,
        rotation: 0,
        opacity: 0.95,
      },
      content: { shape: 'rect', fill: muted, borderRadius: 2, layoutSurface: true },
      role: 'decoration',
      slotId: `TIMELINE_SEG_${i + 1}`,
    })
    const midX = (a.x + b.x) / 2
    const chevronSize = 18
    next.unshift({
      id: `shp-timeline-arrow-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 2,
      placement: {
        x: Math.round(midX - chevronSize / 2),
        y: Math.round(lineY - chevronSize / 2),
        width: chevronSize,
        height: chevronSize,
        rotation: 0,
        opacity: 1,
      },
      content: { shape: 'chevron-right', fill: accent, layoutSurface: true },
      role: 'decoration',
      slotId: `TIMELINE_ARROW_${i + 1}`,
    })
  }

  return next
}

export function finalizeTimelineShapes(elements, schema, palette = {}, canvas = {}) {
  let next = applyDefaultCardShapes(elements, schema, palette, canvas)
  next = applyTimelineConnectorShapes(next, schema, palette, canvas)
  return next
}
