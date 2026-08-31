/** Post-compile timeline connector + Process Linner shapes (mirrors backend finalizeElementsDoc). */

import { cycleSegmentInlineSvg, cycleSegmentPlacement, CYCLE_SEGMENT_COLORS, cycleOverlayPlacements } from './diagramCycleSvg'
import { funnelStageInlineSvg, funnelStagePlacement, FUNNEL_TITLE_COLORS, FUNNEL_GEOM, FUNNEL_STAGE_COLORS, funnelOverlayPlacements } from './diagramFunnelSvg'
import { matrixQuadPlacement, matrixArrowPlacement, matrixArrowInlineSvg, MATRIX_GEOM, MATRIX_QUAD_COLORS, MATRIX_ARROW_COLOR, matrixOverlayPlacements } from './diagramMatrixSvg'
import {
  PYRAMID_N,
  PYRAMID_COLORS,
  pyramidStagePlacement,
  pyramidStageInlineSvg,
  pyramidGraphicBox,
  pyramidLegendPlacements,
  PYRAMID_BADGE_CLIP,
} from './diagramPyramid'
import {
  SWOT_N,
  SWOT_LETTERS,
  SWOT_COLORS,
  SWOT_LABELS,
  swotPetalPlacement,
  swotPetalInlineSvg,
  swotIconInlineSvg,
  swotDashInlineSvg,
  swotGraphicBox,
  swotOverlayPlacements,
} from './diagramSwotSvg'
import {
  VENN_N,
  VENN_COLORS,
  vennRingColor,
  vennCoreInlineSvg,
  vennIconInlineSvg,
  vennFrame,
  vennSetGeom,
} from './diagramVennSvg'
import {
  QUOTE_GRID_N,
  QUOTE_MARK_COLOR,
  QUOTE_CARD_BORDER,
  quoteMarkInlineSvg,
  quoteGridFrame,
  quoteGridCardGeom,
  quotePortraitGeom,
  quoteTestimonialGeom,
  quoteStatementLeftGeom,
} from './quoteGridLayout'
import {
  timelineNodeInlineSvg,
  timelineSpineSegmentInlineSvg,
  timelineChevronInlineSvg,
  processPhaseCircleInlineSvg,
  processNumericBadgeInlineSvg,
} from './timelineProcessSvg'

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
  m = id.match(/^STEP_(\d+)_(TITLE|BODY|NUMBER|ICON)$/)
  if (m) return `step_${m[1]}`
  m = id.match(/^CARD_(\d+)_(TITLE|BODY)$/i)
  if (m) return `card_${m[1]}`
  return null
}

function isProcessLinnerLayout(layoutId) {
  return /^process_linner_/i.test(String(layoutId || ''))
}

function isProcessLinnerHortiLayout(layoutId) {
  return /^process_linner_horti/i.test(String(layoutId || ''))
}

function isProcessLinnerNumericLayout(layoutId) {
  return /^process_linner_numeric/i.test(String(layoutId || ''))
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

function layoutHasExplicitCardBg(schema, groupKey) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const m = String(groupKey || '').match(/^(card|row|bullet|item|milestone|step)_(\d+)$/i)
  if (!m) return false
  const kind = m[1].toLowerCase()
  const n = m[2]
  return slots.some((s) => {
    const id = String(s.id || '')
    return (
      new RegExp(`^CARD_${n}_BG$`, 'i').test(id) ||
      new RegExp(`^${kind}_${n}_BG$`, 'i').test(id) ||
      new RegExp(`^MILESTONE_${n}_CARD_BG$`, 'i').test(id) ||
      new RegExp(`^STEP_${n}_CIRCLE$`, 'i').test(id) ||
      new RegExp(`^STEP_${n}_CARD_BG$`, 'i').test(id)
    )
  })
}

export function applyDefaultCardShapes(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements
  if (isProcessLinnerLayout(schema.layout_id)) return elements

  const slots = schema.slots
  const next = [...elements]
  const groups = new Map()

  for (const slot of slots) {
    const key = cardGroupKey(slot.id)
    if (!key) continue
    if (layoutHasExplicitCardBg(schema, key)) continue
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

function findStepTitleElements(elements) {
  return elements
    .filter(
      (el) =>
        (el.type === 'text' || el.type === 'textbox') &&
        /^STEP_\d+_TITLE$/i.test(String(el.slotId || ''))
    )
    .sort((a, b) => (a.placement?.x ?? 0) - (b.placement?.x ?? 0))
}

function updateElementBySlotId(elements, slotId, patchFn) {
  const idx = elements.findIndex((el) => el.slotId === slotId)
  if (idx < 0) return elements
  const next = [...elements]
  next[idx] = patchFn(next[idx])
  return next
}

export function applyProcessLinnerHortiShapes(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements
  const layoutId = String(schema.layout_id || '')
  if (!isProcessLinnerHortiLayout(layoutId)) return elements
  if (elements.some((el) => String(el.slotId || '') === 'PROCESS_LINNER_SPINE')) return elements

  let next = [...elements]
  const spineColor = paletteColor(palette, 'text', '#0F172A')
  const phaseFill = paletteColor(
    palette,
    'cardBg',
    'color-mix(in srgb, #e8b4a0 42%, #ffffff)'
  )
  const primaryColor = paletteColor(palette, 'primary', paletteColor(palette, 'accent', '#2563EB'))
  const white = '#FFFFFF'

  const titleEls = findStepTitleElements(next)
  if (titleEls.length < 2) return elements

  const SPINE_NODE = 28
  const NUM_H = 18
  const minTitleY = Math.min(...titleEls.map((t) => t.placement?.y ?? 0))
  const spineY = Math.max(96, minTitleY - 100)

  const centers = titleEls.map((el, i) => {
    const p = el.placement || {}
    return {
      x: (p.x ?? 0) + (p.width ?? 0) / 2,
      titleSlotId: el.slotId,
      index: i + 1,
    }
  })

  const spineX1 = centers[0].x
  const spineX2 = centers[centers.length - 1].x
  next.unshift({
    id: `shp-plinner-spine-${Math.random().toString(36).slice(2, 9)}`,
    type: 'shape',
    layer: 1,
    placement: {
      x: Math.round(spineX1),
      y: Math.round(spineY - 1),
      width: Math.round(Math.max(8, spineX2 - spineX1)),
      height: 2,
      rotation: 0,
      opacity: 1,
    },
    content: { shape: 'rect', fill: spineColor, layoutSurface: true },
    role: 'decoration',
    slotId: 'PROCESS_LINNER_SPINE',
  })

  centers.forEach((c) => {
    const phaseRadius = c.index % 2 === 0 ? 105 : 90
    const phaseSize = phaseRadius * 2
    const phaseY = spineY + SPINE_NODE / 2 + 28 + phaseRadius
    const phaseBottom = phaseY + phaseRadius

    next.unshift({
      id: `shp-plinner-node-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 3,
      placement: {
        x: Math.round(c.x - SPINE_NODE / 2),
        y: Math.round(spineY - SPINE_NODE / 2),
        width: SPINE_NODE,
        height: SPINE_NODE,
        rotation: 0,
        opacity: 1,
      },
      content: { shape: 'ellipse', fill: spineColor, layoutSurface: true },
      role: 'decoration',
      slotId: `STEP_${c.index}_SPINE_NODE`,
    })

    next.unshift({
      id: `txt-plinner-num-${Math.random().toString(36).slice(2, 9)}`,
      type: 'text',
      layer: 4,
      placement: {
        x: Math.round(c.x - SPINE_NODE / 2),
        y: Math.round(spineY - NUM_H / 2),
        width: SPINE_NODE,
        height: NUM_H,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: String(c.index),
        align: 'center',
        fontSize: 12,
        fontWeight: 700,
        color: white,
      },
      role: 'caption',
      slotId: `STEP_${c.index}_SPINE_NUM`,
    })

    next.unshift({
      id: `shp-plinner-phase-${Math.random().toString(36).slice(2, 9)}`,
      type: 'graphic',
      layer: 2,
      placement: {
        x: Math.round(c.x - phaseRadius),
        y: Math.round(phaseY - phaseRadius),
        width: phaseSize,
        height: phaseSize,
        rotation: 0,
        opacity: 1,
      },
      content: timelineGraphicContent(processPhaseCircleInlineSvg(), phaseFill, `Phase ${c.index}`),
      role: 'decoration',
      slotId: `STEP_${c.index}_PHASE_CIRCLE`,
    })

    const titleEl = next.find((el) => el.slotId === c.titleSlotId)
    if (titleEl) {
      const titleHeight = Math.max(28, titleEl.placement?.height ?? 32)
      next = updateElementBySlotId(next, c.titleSlotId, (el) => ({
        ...el,
        layer: 5,
        placement: {
          ...el.placement,
          x: Math.round(c.x - phaseRadius + 16),
          y: Math.round(phaseY - titleHeight / 2),
          width: Math.round(phaseSize - 32),
          height: titleHeight,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
          color: primaryColor,
          colorRole: 'primary',
        },
      }))
    }

    const ANCHOR = 14
    const anchorY = phaseBottom + 36
    const connectorHeight = Math.max(12, anchorY - ANCHOR / 2 - phaseBottom - 4)

    next.unshift({
      id: `shp-plinner-conn-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 1,
      placement: {
        x: Math.round(c.x - 1),
        y: Math.round(phaseBottom + 4),
        width: 2,
        height: Math.round(connectorHeight),
        rotation: 0,
        opacity: 1,
      },
      content: { shape: 'rect', fill: spineColor, layoutSurface: true },
      role: 'decoration',
      slotId: `STEP_${c.index}_CONNECTOR`,
    })

    next.unshift({
      id: `shp-plinner-anchor-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 2,
      placement: {
        x: Math.round(c.x - ANCHOR / 2),
        y: Math.round(anchorY - ANCHOR / 2),
        width: ANCHOR,
        height: ANCHOR,
        rotation: 0,
        opacity: 1,
      },
      content: {
        shape: 'ellipse',
        fill: 'transparent',
        stroke: spineColor,
        strokeWidth: 2,
        layoutSurface: true,
      },
      role: 'decoration',
      slotId: `STEP_${c.index}_ANCHOR`,
    })

    const bodySlotId = `STEP_${c.index}_BODY`
    const bodyEl = next.find((el) => el.slotId === bodySlotId)
    if (bodyEl) {
      const titleWidth = next.find((el) => el.slotId === c.titleSlotId)?.placement?.width
      const bodyWidth = Math.max(bodyEl.placement?.width ?? 0, titleWidth ?? 200)
      const bodyTop = anchorY + ANCHOR / 2 + 14
      next = updateElementBySlotId(next, bodySlotId, (el) => ({
        ...el,
        placement: {
          ...el.placement,
          x: Math.round(c.x - bodyWidth / 2),
          y: Math.round(bodyTop),
          width: bodyWidth,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
        },
      }))
    }
  })

  return next
}

export function applyProcessLinnerNumericShapes(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements) || !schema?.slots?.length) return elements
  const layoutId = String(schema.layout_id || '')
  if (!isProcessLinnerNumericLayout(layoutId)) return elements

  let next = [...elements]
  const lineColor = paletteColor(palette, 'text', '#0F172A')
  const shadowColor = 'rgba(15, 23, 42, 0.12)'

  const numberEls = next
    .filter((el) => el.type === 'text' && /^STEP_\d+_NUMBER$/i.test(String(el.slotId || '')))
    .sort((a, b) => (a.placement?.x ?? 0) - (b.placement?.x ?? 0))

  numberEls.forEach((numEl) => {
    const m = String(numEl.slotId || '').match(/^STEP_(\d+)_NUMBER$/i)
    if (!m) return
    const n = m[1]
    const p = numEl.placement || {}
    const slotLineY = (p.y ?? 0) + (p.height ?? 0) - 8
    const lineWidth = Math.max(60, (p.width ?? 0) * 0.85)
    const lineX = (p.x ?? 0) + ((p.width ?? 0) - lineWidth) / 2

    if (!next.some((el) => el.slotId === `STEP_${n}_NUMBER_SLOT`)) {
      next.unshift({
        id: `shp-plinner-slot-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        layer: 1,
        placement: {
          x: Math.round(lineX),
          y: Math.round(slotLineY),
          width: Math.round(lineWidth),
          height: 3,
          rotation: 0,
          opacity: 1,
        },
        content: { shape: 'rect', fill: lineColor, layoutSurface: true },
        role: 'decoration',
        slotId: `STEP_${n}_NUMBER_SLOT`,
      })

      next.unshift({
        id: `shp-plinner-shadow-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        layer: 0,
        placement: {
          x: Math.round((p.x ?? 0) + 4),
          y: Math.round(slotLineY + 2),
          width: Math.round(lineWidth - 8),
          height: 6,
          rotation: 0,
          opacity: 0.35,
        },
        content: { shape: 'rect', fill: shadowColor, borderRadius: 3, layoutSurface: true },
        role: 'decoration',
        slotId: `STEP_${n}_NUMBER_SHADOW`,
      })
    }

    const iconSlotId = `STEP_${n}_ICON`
    const iconEl = next.find((el) => el.slotId === iconSlotId)
    if (iconEl && iconEl.type === 'text') {
      const ip = iconEl.placement || {}
      const size = Math.min(ip.width ?? 48, ip.height ?? 48, 48)
      const cx = (ip.x ?? 0) + (ip.width ?? size) / 2
      const cy = (ip.y ?? 0) + (ip.height ?? size) / 2
      next = next.filter((el) => el.slotId !== iconSlotId)
      next.push({
        id: `shp-plinner-icon-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        slotId: iconSlotId,
        layer: iconEl.layer ?? 8,
        placement: {
          x: Math.round(cx - size / 2),
          y: Math.round(cy - size / 2),
          width: size,
          height: size,
          rotation: 0,
          opacity: 1,
        },
        content: {
          shape: 'circle',
          fill: paletteColor(palette, 'iconFill', 'color-mix(in srgb, #64748b 18%, transparent)'),
          stroke: paletteColor(palette, 'iconRing', 'color-mix(in srgb, #6366f1 32%, transparent)'),
          strokeWidth: 1.5,
          layoutSurface: true,
        },
        role: 'decoration',
      })
    }
  })

  return next
}

function isProcessFlowLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  if (/^process_linner_horti/.test(id)) return false
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
  if (isProcessLinnerLayout(layoutId)) return elements
  if (isProcessLinnerHortiLayout(layoutId)) return elements
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
        type: 'graphic',
        layer: 3,
        placement: {
          x: Math.round(spineX - NODE / 2),
          y: Math.round(cy - NODE / 2),
          width: NODE,
          height: NODE,
          rotation: 0,
          opacity: 1,
        },
        content: timelineGraphicContent(timelineNodeInlineSvg(), accent, `Timeline node ${c.index}`),
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
        type: 'graphic',
        layer: 3,
        placement: {
          x: Math.round(Math.max(56, Math.min(c.x - NODE / 2, canvasW - NODE - 56))),
          y: Math.round(axisY - NODE / 2),
          width: NODE,
          height: NODE,
          rotation: 0,
          opacity: 1,
        },
        content: timelineGraphicContent(timelineNodeInlineSvg(), accent, `Timeline node ${c.index}`),
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
    let lineY = axisY
    if (hasStepCircles) {
      const circle = next.find(
        (el) => String(el.slotId || '').toUpperCase() === `STEP_${i + 1}_CIRCLE`
      )
      if (circle?.placement) {
        lineY = (circle.placement.y ?? 0) + (circle.placement.height ?? 0) / 2
      }
    }
    next.unshift({
      id: `shp-timeline-seg-${Math.random().toString(36).slice(2, 9)}`,
      type: 'graphic',
      layer: 1,
      placement: {
        x: Math.round(x1),
        y: Math.round(lineY - 1.5),
        width: Math.round(segW),
        height: 3,
        rotation: 0,
        opacity: 0.95,
      },
      content: timelineGraphicContent(timelineSpineSegmentInlineSvg(), muted, 'Timeline segment'),
      role: 'decoration',
      slotId: `TIMELINE_SEG_${i + 1}`,
    })
    const midX = (a.x + b.x) / 2
    const chevronSize = 18
    next.unshift({
      id: `shp-timeline-arrow-${Math.random().toString(36).slice(2, 9)}`,
      type: 'graphic',
      layer: 2,
      placement: {
        x: Math.round(midX - chevronSize / 2),
        y: Math.round(lineY - chevronSize / 2),
        width: chevronSize,
        height: chevronSize,
        rotation: 0,
        opacity: 1,
      },
      content: timelineGraphicContent(timelineChevronInlineSvg(), accent, 'Timeline arrow'),
      role: 'decoration',
      slotId: `TIMELINE_ARROW_${i + 1}`,
    })
  }

  return next
}

function isDiagramProcessStepsLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_process_steps|timeline_process_steps/.test(id)
}

function timelineGraphicContent(svg, fill, alt = '') {
  return { svg, colorMode: 'recolorable', fill, alt }
}

function newShapeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Canonical 4-column process diagram: title, numbered timeline, equal cards.
 * Generic card/timeline heuristics overlap this layout when slots sit too high.
 */
export function layoutDiagramProcessSteps(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const cardBg = paletteColor(palette, 'cardBg', 'color-mix(in srgb, #c4b5a0 28%, #f8f4ee)')

  const stepNums = [
    ...new Set(
      elements
        .map((el) => String(el.slotId || '').match(/^step_(\d+)_(title|body)$/i)?.[1])
        .filter(Boolean)
        .map((n) => Number(n))
    ),
  ].sort((a, b) => a - b)
  const n = stepNums.length || 4
  const insetX = 64
  const insetY = 52
  const headingH = 88
  const nodeSize = 48
  const numH = 36
  const titleToTimeline = 32
  const numToCards = 72
  const cardGap = 22
  const bottomInset = 72
  const cardTop = insetY + headingH + titleToTimeline + nodeSize + numH + numToCards
  const cardH = Math.min(520, Math.max(360, canvasH - cardTop - bottomInset))
  const usableW = canvasW - insetX * 2
  const cardW = (usableW - cardGap * (n - 1)) / n
  const axisY = insetY + headingH + titleToTimeline + nodeSize / 2

  const stripped = elements.filter((el) => {
    const sid = String(el.slotId || '')
    return !/^AUTO_CARD_BG_/i.test(sid) && !/^TIMELINE_(NODE|SEG|ARROW|SPINE)/i.test(sid)
  })

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: insetX,
          y: insetY,
          width: canvasW - insetX * 2,
          height: headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
          verticalAlign: 'center',
          fontSize: Math.min(Number(el.content?.fontSize) || 34, 36),
          fontWeight: 800,
          letterSpacing: '0',
          lineHeight: 1.15,
          padding: 0,
          paddingX: 0,
          stroke: undefined,
          strokeWidth: 0,
          shadow: undefined,
        },
      }
    }
    const titleM = sid.match(/^step_(\d+)_title$/i)
    const bodyM = sid.match(/^step_(\d+)_body$/i)
    const idx = titleM ? stepNums.indexOf(Number(titleM[1])) : bodyM ? stepNums.indexOf(Number(bodyM[1])) : -1
    if (idx < 0) return el
    const cardX = insetX + idx * (cardW + cardGap)
    const padX = 28
    const padY = 40
    const titleH = 72
    if (titleM) {
      return {
        ...el,
        layer: Math.max(el.layer || 0, 10),
        placement: {
          ...(el.placement || {}),
          x: Math.round(cardX + padX),
          y: Math.round(cardTop + padY),
          width: Math.round(cardW - padX * 2),
          height: titleH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...(el.content || {}),
          align: 'center',
          verticalAlign: 'center',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0',
          lineHeight: 1.25,
          padding: 0,
          paddingX: 0,
        },
      }
    }
    return {
      ...el,
      layer: Math.max(el.layer || 0, 10),
      placement: {
        ...(el.placement || {}),
        x: Math.round(cardX + padX),
        y: Math.round(cardTop + padY + titleH + 12),
        width: Math.round(cardW - padX * 2),
        height: Math.round(Math.max(80, cardH - padY * 2 - titleH - 12)),
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(el.content || {}),
        align: 'center',
        verticalAlign: 'flex-start',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.4,
        padding: 0,
        paddingX: 0,
      },
    }
  })

  const chrome = []
  const centers = Array.from({ length: n }, (_, i) => insetX + i * (cardW + cardGap) + cardW / 2)

  for (let i = 0; i < n; i += 1) {
    const cardX = insetX + i * (cardW + cardGap)
    chrome.push({
      id: newShapeId('shp-card'),
      type: 'shape',
      layer: 0,
      placement: {
        x: Math.round(cardX),
        y: Math.round(cardTop),
        width: Math.round(cardW),
        height: Math.round(cardH),
        rotation: 0,
        opacity: 1,
      },
      content: {
        shape: 'rect',
        fill: cardBg,
        borderRadius: 18,
        layoutSurface: true,
      },
      role: 'decoration',
      slotId: `AUTO_CARD_BG_step_${stepNums[i] || i + 1}`,
    })
    chrome.push({
      id: newShapeId('shp-timeline-node'),
      type: 'graphic',
      layer: 3,
      placement: {
        x: Math.round(centers[i] - nodeSize / 2),
        y: Math.round(axisY - nodeSize / 2),
        width: nodeSize,
        height: nodeSize,
        rotation: 0,
        opacity: 1,
      },
      content: timelineGraphicContent(timelineNodeInlineSvg(), textColor, `Step ${i + 1}`),
      role: 'decoration',
      slotId: `TIMELINE_NODE_${i + 1}`,
    })
    chrome.push({
      id: newShapeId('txt-timeline-num'),
      type: 'text',
      layer: 4,
      placement: {
        x: Math.round(centers[i] - nodeSize / 2),
        y: Math.round(axisY + nodeSize / 2 + 8),
        width: nodeSize,
        height: numH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: String(i + 1),
        align: 'center',
        verticalAlign: 'center',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0',
        padding: 0,
        paddingX: 0,
        color: textColor,
      },
      role: 'caption',
      slotId: `TIMELINE_NODE_NUM_${i + 1}`,
    })
  }

  for (let i = 0; i < n - 1; i += 1) {
    const x1 = centers[i] + nodeSize / 2 + 6
    const x2 = centers[i + 1] - nodeSize / 2 - 6
    chrome.push({
      id: newShapeId('shp-timeline-seg'),
      type: 'graphic',
      layer: 1,
      placement: {
        x: Math.round(x1),
        y: Math.round(axisY - 2.5),
        width: Math.round(Math.max(8, x2 - x1)),
        height: 5,
        rotation: 0,
        opacity: 0.95,
      },
      content: timelineGraphicContent(timelineSpineSegmentInlineSvg(), textColor, 'Process spine'),
      role: 'decoration',
      slotId: `TIMELINE_SEG_${i + 1}`,
    })
  }

  return [...chrome, ...next]
}

function isDiagramCycleLayout(layoutId) {
  return /diagram_cycle/.test(String(layoutId || '').toLowerCase())
}

export function layoutDiagramCycle(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const colors = [
    paletteColor(palette, 'accent', CYCLE_SEGMENT_COLORS[0]),
    paletteColor(palette, 'secondary', CYCLE_SEGMENT_COLORS[1]),
    paletteColor(palette, 'primary', CYCLE_SEGMENT_COLORS[2]),
    paletteColor(palette, 'highlight', CYCLE_SEGMENT_COLORS[3]),
  ]

  const insetX = 56
  const headingH = 72
  const headingY = 52
  const bottomPad = 56
  const cycleSize = Math.min(620, canvasH - headingY - headingH - bottomPad - 24)
  const cycleX = Math.round((canvasW - cycleSize) / 2)
  const spaceBelowTitle = canvasH - headingY - headingH - bottomPad
  const cycleY = Math.round(headingY + headingH + Math.max(24, (spaceBelowTitle - cycleSize) / 2))
  const sideW = Math.max(260, cycleX - insetX - 28)
  const titleH = 44
  const bodyH = 88
  const topBlockY = cycleY + Math.round(cycleSize * 0.16)
  const bottomBlockY = cycleY + Math.round(cycleSize * 0.58)

  const overlay = cycleOverlayPlacements(cycleX, cycleY, cycleSize)

  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^CYCLE_(SEG_[1-4]|HUB)$/i.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) => !/^CYCLE_(RING|SEG_[1-4]|HUB)$/i.test(String(el.slotId || ''))
  )

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: insetX,
          y: headingY,
          width: canvasW - insetX * 2,
          height: headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: Math.min(Number(el.content?.fontSize) || 34, 36),
          fontWeight: 800,
          color: textColor,
        },
      }
    }
    if (sid.toUpperCase() === 'CYCLE_CENTER') {
      return {
        ...el,
        layer: 12,
        placement: { ...(el.placement || {}), ...overlay.center, rotation: 0, opacity: 1 },
        content: {
          ...base,
          text: el.content?.text || 'CYCLE',
          align: 'center',
          verticalAlign: 'center',
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '0.12em',
          wrap: 'nowrap',
          color: textColor,
        },
      }
    }
    const numM = sid.match(/^CYCLE_NUM_([1-4])$/i)
    if (numM) {
      const idx = Number(numM[1]) - 1
      return {
        ...el,
        layer: 12,
        placement: { ...(el.placement || {}), ...overlay.numbers[idx], rotation: 0, opacity: 1 },
        content: {
          ...base,
          text: el.content?.text || String(idx + 1),
          align: 'center',
          verticalAlign: 'center',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          wrap: 'nowrap',
          color: '#ffffff',
        },
      }
    }
    const m = sid.match(/^Q([1-4])_(TITLE|BODY)$/i)
    if (!m) return el
    const q = Number(m[1])
    const isTitle = String(m[2]).toUpperCase() === 'TITLE'
    const leftSide = q === 3 || q === 4
    const topSide = q === 1 || q === 4
    const x = leftSide ? insetX : canvasW - insetX - sideW
    const y = topSide ? topBlockY : bottomBlockY
    if (isTitle) {
      return {
        ...el,
        layer: Math.max(el.layer || 0, 10),
        placement: {
          ...(el.placement || {}),
          x,
          y,
          width: sideW,
          height: titleH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: leftSide ? 'right' : 'left',
          verticalAlign: 'flex-end',
          fontSize: 22,
          fontWeight: 700,
          color: textColor,
        },
      }
    }
    return {
      ...el,
      layer: Math.max(el.layer || 0, 10),
      placement: {
        ...(el.placement || {}),
        x,
        y: y + titleH + 6,
        width: sideW,
        height: bodyH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...base,
        align: leftSide ? 'right' : 'left',
        verticalAlign: 'flex-start',
        fontSize: 16,
        fontWeight: 400,
        color: muted,
        lineHeight: 1.4,
      },
    }
  })

  const extras = []
  if (!next.some((el) => String(el.slotId || '').toUpperCase() === 'CYCLE_CENTER')) {
    extras.push({
      id: newShapeId('txt-cycle-center'),
      type: 'text',
      slotId: 'CYCLE_CENTER',
      role: 'heading',
      layer: 12,
      placement: { ...overlay.center, rotation: 0, opacity: 1 },
      content: {
        text: 'CYCLE',
        align: 'center',
        verticalAlign: 'center',
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: '0.12em',
        wrap: 'nowrap',
        color: textColor,
        padding: 0,
        paddingX: 0,
      },
    })
  }
  for (let i = 0; i < 4; i += 1) {
    const slotId = `CYCLE_NUM_${i + 1}`
    if (next.some((el) => String(el.slotId || '').toUpperCase() === slotId)) continue
    extras.push({
      id: newShapeId('txt-cycle-num'),
      type: 'text',
      slotId,
      role: 'caption',
      layer: 12,
      placement: { ...overlay.numbers[i], rotation: 0, opacity: 1 },
      content: {
        text: String(i + 1),
        align: 'center',
        verticalAlign: 'center',
        fontSize: 36,
        fontWeight: 800,
        lineHeight: 1,
        wrap: 'nowrap',
        color: '#ffffff',
        padding: 0,
        paddingX: 0,
      },
    })
  }

  const segs = [0, 1, 2, 3].map((i) => {
    const slotId = `CYCLE_SEG_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const fill = prev?.content?.fill || colors[i]
    return {
      id: prev?.id || newShapeId('shp-cycle-seg'),
      type: 'graphic',
      layer: 2 + i,
      placement: { ...cycleSegmentPlacement(cycleX, cycleY, cycleSize, i), rotation: 0, opacity: 1 },
      content: {
        svg: cycleSegmentInlineSvg(i),
        colorMode: 'recolorable',
        fill,
        stroke: typeof fill === 'string' ? fill : fill?.color,
        alt: `Cycle segment ${i + 1}`,
      },
      role: 'decoration',
      slotId,
    }
  })
  const prevHub = prevBySlot.get('CYCLE_HUB')
  const hub = {
    id: prevHub?.id || newShapeId('shp-cycle-hub'),
    type: 'shape',
    layer: 8,
    placement: { ...overlay.hub, rotation: 0, opacity: 1 },
    content: {
      shape: 'ellipse',
      fill: prevHub?.content?.fill || '#ffffff',
    },
    role: 'decoration',
    slotId: 'CYCLE_HUB',
  }

  return [...segs, hub, ...next, ...extras]
}

function isDiagramFunnelLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_funnel/.test(id) && !/pyramid/.test(id)
}

function isDiagramPyramidLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_pyramid/.test(id)
}

export function layoutDiagramPyramid(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const frame = pyramidGraphicBox(canvasW, canvasH)
  const legend = pyramidLegendPlacements(frame)
  const colors = [
    paletteColor(palette, 'accent', PYRAMID_COLORS[0]),
    paletteColor(palette, 'secondary', PYRAMID_COLORS[1]),
    paletteColor(palette, 'primary', PYRAMID_COLORS[2]),
    paletteColor(palette, 'highlight', PYRAMID_COLORS[3]),
    paletteColor(palette, 'accent', PYRAMID_COLORS[4]),
  ]
  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^PYRAMID_(SEG|BADGE)_[1-5]$/i.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter((el) => !/^PYRAMID_(SEG|BADGE|BAR)_/i.test(String(el.slotId || '')))
  const extras = []

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: 56,
          y: frame.headingY,
          width: canvasW - 112,
          height: frame.headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 40,
          fontWeight: 800,
          color: textColor,
        },
      }
    }
    const numM = sid.match(/^PYRAMID_NUM_([1-5])$/i)
    if (numM) {
      const i = Number(numM[1]) - 1
      return {
        ...el,
        layer: 12,
        placement: { ...legend[i].num, rotation: 0, opacity: 1 },
        content: {
          ...base,
          text: el.content?.text || String(i + 1).padStart(2, '0'),
          align: 'center',
          verticalAlign: 'center',
          fontSize: 20,
          fontWeight: 800,
          wrap: 'nowrap',
          lineHeight: 1,
          color: '#ffffff',
        },
      }
    }
    const titleM = sid.match(/^funnel_([1-5])_title$/i)
    if (titleM) {
      const i = Number(titleM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...legend[i].title, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 22,
          fontWeight: 800,
          color: textColor,
        },
      }
    }
    const bodyM = sid.match(/^funnel_([1-5])_body$/i)
    if (bodyM) {
      const i = Number(bodyM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...legend[i].body, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: 15,
          fontWeight: 400,
          color: muted,
          lineHeight: 1.35,
        },
      }
    }
    return el
  })

  for (let i = 0; i < PYRAMID_N; i += 1) {
    const numId = `PYRAMID_NUM_${i + 1}`
    if (next.some((el) => String(el.slotId || '').toUpperCase() === numId)) continue
    extras.push({
      id: newShapeId('txt-pyramid-num'),
      type: 'text',
      slotId: numId,
      role: 'caption',
      layer: 12,
      placement: { ...legend[i].num, rotation: 0, opacity: 1 },
      content: {
        text: String(i + 1).padStart(2, '0'),
        align: 'center',
        verticalAlign: 'center',
        fontSize: 20,
        fontWeight: 800,
        wrap: 'nowrap',
        lineHeight: 1,
        color: '#ffffff',
        padding: 0,
        paddingX: 0,
      },
    })
  }

  const { graphicX, graphicY, graphicW, graphicH } = frame
  const segs = [0, 1, 2, 3, 4].map((i) => {
    const slotId = `PYRAMID_SEG_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const fill = prev?.content?.fill || colors[i]
    return {
      id: prev?.id || newShapeId('shp-pyramid-seg'),
      type: 'graphic',
      layer: 3 + i,
      placement: { ...pyramidStagePlacement(graphicX, graphicY, graphicW, graphicH, i), rotation: 0, opacity: 1 },
      content: {
        svg: pyramidStageInlineSvg(i),
        colorMode: 'recolorable',
        fill,
        alt: `Pyramid stage ${i + 1}`,
      },
      role: 'decoration',
      slotId,
    }
  })

  const badges = [0, 1, 2, 3, 4].map((i) => {
    const slotId = `PYRAMID_BADGE_${i + 1}`
    const prev = prevBySlot.get(slotId)
    return {
      id: prev?.id || newShapeId('shp-pyramid-badge'),
      type: 'shape',
      layer: 4,
      placement: { ...legend[i].badge, rotation: 0, opacity: 1 },
      content: {
        shape: 'rect',
        fill: prev?.content?.fill || colors[i],
        clipPath: PYRAMID_BADGE_CLIP,
      },
      role: 'decoration',
      slotId,
    }
  })

  return [...segs, ...badges, ...next, ...extras]
}

export function layoutDiagramFunnel(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')

  const headingY = 36
  const headingH = 78
  const graphicH = Math.min(900, canvasH - headingY - headingH - 40)
  const graphicW = Math.round(graphicH * (FUNNEL_GEOM.viewW / FUNNEL_GEOM.viewH))
  const graphicY = headingY + headingH + 6
  const graphicX = 72
  const colors = [
    paletteColor(palette, 'accent', FUNNEL_STAGE_COLORS[0]),
    paletteColor(palette, 'secondary', FUNNEL_STAGE_COLORS[1]),
    paletteColor(palette, 'primary', FUNNEL_STAGE_COLORS[2]),
    paletteColor(palette, 'highlight', FUNNEL_STAGE_COLORS[3]),
  ]
  const overlay = funnelOverlayPlacements(graphicX, graphicY, graphicW, graphicH)
  const textX = graphicX + graphicW + 28
  const textWidth = Math.max(360, canvasW - textX - 72)

  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^FUNNEL_SEG_[1-4]$/i.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) =>
      !/^FUNNEL_(SEG|TAB|LID|SHADE|RING)_/i.test(String(el.slotId || '')) &&
      String(el.slotId || '') !== 'FUNNEL_RING'
  )
  const extras = []

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: 64,
          y: headingY,
          width: canvasW - 128,
          height: headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 42,
          fontWeight: 800,
          color: textColor,
        },
      }
    }
    const numM = sid.match(/^FUNNEL_NUM_([1-4])$/i)
    if (numM) {
      const i = Number(numM[1]) - 1
      return {
        ...el,
        layer: 12,
        placement: { ...overlay.stages[i].num, rotation: 0, opacity: 1 },
        content: {
          ...base,
          text: el.content?.text || String(i + 1).padStart(2, '0'),
          align: 'center',
          verticalAlign: 'center',
          fontSize: 28,
          fontWeight: 800,
          wrap: 'nowrap',
          lineHeight: 1,
          color: '#ffffff',
        },
      }
    }
    const titleM = sid.match(/^funnel_([1-4])_title$/i)
    if (titleM) {
      const i = Number(titleM[1]) - 1
      const st = overlay.stages[i]
      return {
        ...el,
        layer: 10,
        placement: {
          x: textX,
          y: st.y + Math.round(st.h * 0.22),
          width: textWidth,
          height: 38,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 22,
          fontWeight: 700,
          color: FUNNEL_TITLE_COLORS[i],
        },
      }
    }
    const bodyM = sid.match(/^funnel_([1-4])_body$/i)
    if (bodyM) {
      const i = Number(bodyM[1]) - 1
      const st = overlay.stages[i]
      return {
        ...el,
        layer: 10,
        placement: {
          x: textX,
          y: st.y + Math.round(st.h * 0.22) + 40,
          width: textWidth,
          height: Math.max(40, st.h - 88),
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: 16,
          fontWeight: 400,
          color: muted,
          lineHeight: 1.4,
        },
      }
    }
    return el
  })

  for (let i = 0; i < 4; i += 1) {
    const numId = `FUNNEL_NUM_${i + 1}`
    if (next.some((el) => String(el.slotId || '').toUpperCase() === numId)) continue
    extras.push({
      id: newShapeId('txt-funnel-num'),
      type: 'text',
      slotId: numId,
      role: 'caption',
      layer: 12,
      placement: { ...overlay.stages[i].num, rotation: 0, opacity: 1 },
      content: {
        text: String(i + 1).padStart(2, '0'),
        align: 'center',
        verticalAlign: 'center',
        fontSize: 28,
        fontWeight: 800,
        wrap: 'nowrap',
        lineHeight: 1,
        color: '#ffffff',
        padding: 0,
        paddingX: 0,
      },
    })
  }

  const segs = [0, 1, 2, 3].map((i) => {
    const slotId = `FUNNEL_SEG_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const fill = prev?.content?.fill || colors[i]
    return {
      id: prev?.id || newShapeId('shp-funnel-seg'),
      type: 'graphic',
      layer: 2 + i,
      placement: { ...funnelStagePlacement(graphicX, graphicY, graphicW, graphicH, i), rotation: 0, opacity: 1 },
      content: {
        svg: funnelStageInlineSvg(i),
        colorMode: 'recolorable',
        fill,
        stroke: typeof fill === 'string' ? fill : fill?.color,
        alt: `Funnel stage ${i + 1}`,
      },
      role: 'decoration',
      slotId,
    }
  })

  return [...segs, ...next, ...extras]
}

function isDiagramMatrixLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_matrix/.test(id)
}

export function layoutDiagramMatrix(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')

  const headingY = 56
  const headingH = 72
  const graphicY = headingY + headingH + 28
  const graphicH = Math.min(820, canvasH - graphicY - 48)
  const graphicW = Math.round(graphicH * (MATRIX_GEOM.viewW / MATRIX_GEOM.viewH))
  const graphicX = Math.round((canvasW - graphicW) / 2)
  const overlay = matrixOverlayPlacements(graphicX, graphicY, graphicW, graphicH)
  const colors = [
    paletteColor(palette, 'accent', MATRIX_QUAD_COLORS[0]),
    paletteColor(palette, 'secondary', MATRIX_QUAD_COLORS[1]),
    paletteColor(palette, 'primary', MATRIX_QUAD_COLORS[2]),
    paletteColor(palette, 'highlight', MATRIX_QUAD_COLORS[3]),
  ]
  const arrowFill = paletteColor(palette, 'accent', MATRIX_ARROW_COLOR)

  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^MATRIX_(QUAD_[1-4]|ARROW_[XY]|HUB)$/i.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) => !/^MATRIX_(RING|QUAD_[1-4]|ARROW_[XY]|HUB)$/i.test(String(el.slotId || ''))
  )
  const extras = []
  const textBase = (el) => ({
    ...(el.content || {}),
    letterSpacing: '0',
    padding: 0,
    paddingX: 0,
    stroke: undefined,
    strokeWidth: 0,
  })

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = textBase(el)
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          x: 72,
          y: headingY,
          width: canvasW - 144,
          height: headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 36,
          fontWeight: 800,
          color: textColor,
        },
      }
    }
    const qM = sid.match(/^Q([1-4])_(TITLE|BODY)$/i)
    if (qM) {
      const i = Number(qM[1]) - 1
      const isTitle = String(qM[2]).toUpperCase() === 'TITLE'
      const box = isTitle ? overlay.cells[i].title : overlay.cells[i].body
      return {
        ...el,
        layer: 12,
        placement: { ...box, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: isTitle ? 'flex-end' : 'flex-start',
          fontSize: isTitle ? 22 : 15,
          fontWeight: isTitle ? 800 : 400,
          color: '#ffffff',
          lineHeight: isTitle ? 1.15 : 1.35,
        },
      }
    }
    if (sid.toUpperCase() === 'MATRIX_CENTER') {
      return {
        ...el,
        layer: 14,
        placement: { ...overlay.center, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 16,
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.2,
        },
      }
    }
    if (sid.toUpperCase() === 'MATRIX_Y_LABEL') {
      return {
        ...el,
        layer: 12,
        placement: { ...overlay.yLabel, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: '#ffffff',
          wrap: 'nowrap',
        },
      }
    }
    if (sid.toUpperCase() === 'MATRIX_X_LABEL') {
      return {
        ...el,
        layer: 12,
        placement: { ...overlay.xLabel, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: '#ffffff',
          wrap: 'nowrap',
        },
      }
    }
    return el
  })

  const ensureText = (slotId, placement, content) => {
    if (next.some((el) => String(el.slotId || '').toUpperCase() === slotId)) return
    extras.push({
      id: newShapeId('txt-matrix'),
      type: 'text',
      slotId,
      role: 'caption',
      layer: 12,
      placement: { ...placement, rotation: placement.rotation || 0, opacity: 1 },
      content: { padding: 0, paddingX: 0, ...content },
    })
  }
  ensureText('MATRIX_CENTER', overlay.center, {
    text: 'Insert your desired text here.',
    align: 'center',
    verticalAlign: 'center',
    fontSize: 16,
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.2,
  })
  ensureText('MATRIX_Y_LABEL', overlay.yLabel, {
    text: 'Placeholder',
    align: 'center',
    verticalAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
    wrap: 'nowrap',
  })
  ensureText('MATRIX_X_LABEL', overlay.xLabel, {
    text: 'Placeholder',
    align: 'center',
    verticalAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
    wrap: 'nowrap',
  })

  const quads = [0, 1, 2, 3].map((i) => {
    const slotId = `MATRIX_QUAD_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const place = matrixQuadPlacement(graphicX, graphicY, graphicW, graphicH, i)
    const { borderRadius, ...placement } = place
    return {
      id: prev?.id || newShapeId('shp-matrix-quad'),
      type: 'shape',
      layer: 3,
      placement: { ...placement, rotation: 0, opacity: 1 },
      content: {
        shape: 'rect',
        borderRadius,
        fill: prev?.content?.fill || colors[i],
      },
      role: 'decoration',
      slotId,
    }
  })
  const prevAy = prevBySlot.get('MATRIX_ARROW_Y')
  const prevAx = prevBySlot.get('MATRIX_ARROW_X')
  const arrows = [
    {
      id: prevAy?.id || newShapeId('shp-matrix-ay'),
      type: 'graphic',
      layer: 2,
      placement: { ...matrixArrowPlacement(graphicX, graphicY, graphicW, graphicH, 'y'), rotation: 0, opacity: 1 },
      content: {
        svg: matrixArrowInlineSvg('y'),
        colorMode: 'recolorable',
        fill: prevAy?.content?.fill || arrowFill,
        alt: 'Matrix Y axis',
      },
      role: 'decoration',
      slotId: 'MATRIX_ARROW_Y',
    },
    {
      id: prevAx?.id || newShapeId('shp-matrix-ax'),
      type: 'graphic',
      layer: 2,
      placement: { ...matrixArrowPlacement(graphicX, graphicY, graphicW, graphicH, 'x'), rotation: 0, opacity: 1 },
      content: {
        svg: matrixArrowInlineSvg('x'),
        colorMode: 'recolorable',
        fill: prevAx?.content?.fill || arrowFill,
        alt: 'Matrix X axis',
      },
      role: 'decoration',
      slotId: 'MATRIX_ARROW_X',
    },
  ]
  const prevHub = prevBySlot.get('MATRIX_HUB')
  const hub = {
    id: prevHub?.id || newShapeId('shp-matrix-hub'),
    type: 'shape',
    layer: 8,
    placement: { ...overlay.hub, rotation: 0, opacity: 1 },
    content: {
      shape: 'ellipse',
      fill: prevHub?.content?.fill || '#ffffff',
    },
    role: 'decoration',
    slotId: 'MATRIX_HUB',
  }

  return [...arrows, ...quads, hub, ...next, ...extras]
}

function isDiagramSwotLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_swot/.test(id)
}

export function layoutDiagramSwot(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const frame = swotGraphicBox(canvasW, canvasH)
  const overlay = swotOverlayPlacements(frame)
  const colors = [
    paletteColor(palette, 'accent', SWOT_COLORS[0]),
    paletteColor(palette, 'secondary', SWOT_COLORS[1]),
    paletteColor(palette, 'primary', SWOT_COLORS[2]),
    paletteColor(palette, 'highlight', SWOT_COLORS[3]),
  ]
  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^SWOT_(SEG|ICON)_[1-4]$/i.test(String(el.slotId || '')) || String(el.slotId || '').toUpperCase() === 'SWOT_HUB')
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) => !/^(SWOT_SEG_[1-4]|SWOT_ICON_[1-4]|SWOT_DASH_[1-4]|SWOT_HUB|SWOT_LETTER_[1-4])$/i.test(String(el.slotId || ''))
  )
  const extras = []

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: 48,
          y: frame.headingY,
          width: canvasW - 96,
          height: frame.headingH,
          rotation: 0,
          opacity: 1,
        },
        content: { ...base, align: 'left', verticalAlign: 'center', fontSize: 28, fontWeight: 800, color: textColor, lineHeight: 1.2 },
      }
    }
    const letterM = sid.match(/^SWOT_LETTER_([1-4])$/i)
    if (letterM) {
      const i = Number(letterM[1]) - 1
      return {
        ...el,
        layer: 12,
        placement: { ...overlay.rows[i].letter, rotation: 0, opacity: 1 },
        content: {
          ...base,
          text: el.content?.text || SWOT_LETTERS[i],
          align: 'center',
          verticalAlign: 'center',
          fontSize: 36,
          fontWeight: 800,
          wrap: 'nowrap',
          color: '#ffffff',
        },
      }
    }
    if (sid.toUpperCase() === 'SWOT_HUB_TITLE') {
      return {
        ...el,
        layer: 14,
        placement: { ...overlay.hubTitle, rotation: 0, opacity: 1 },
        content: { ...base, text: el.content?.text || 'SWOT', align: 'center', verticalAlign: 'center', fontSize: 36, fontWeight: 800, wrap: 'nowrap', lineHeight: 1, color: '#111827' },
      }
    }
    if (sid.toUpperCase() === 'SWOT_HUB_SUB') {
      return {
        ...el,
        layer: 14,
        placement: { ...overlay.hubSub, rotation: 0, opacity: 1 },
        content: { ...base, text: el.content?.text || 'Analysis', align: 'center', verticalAlign: 'center', fontSize: 16, fontWeight: 600, lineHeight: 1.15, color: muted },
      }
    }
    const titleM = sid.match(/^Q([1-4])_TITLE$/i)
    if (titleM) {
      const i = Number(titleM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...overlay.rows[i].title, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 20,
          fontWeight: 800,
          color: colors[i],
        },
      }
    }
    const bodyM = sid.match(/^Q([1-4])_BODY$/i)
    if (bodyM) {
      const i = Number(bodyM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...overlay.rows[i].body, rotation: 0, opacity: 1 },
        content: { ...base, align: 'left', verticalAlign: 'flex-start', fontSize: 15, fontWeight: 400, color: muted, lineHeight: 1.35 },
      }
    }
    return el
  })

  const ensure = (slotId, placement, content) => {
    if (next.some((el) => String(el.slotId || '').toUpperCase() === slotId)) return
    extras.push({
      id: newShapeId('txt-swot'),
      type: 'text',
      slotId,
      role: 'caption',
      layer: 12,
      placement: { ...placement, rotation: 0, opacity: 1 },
      content: { padding: 0, paddingX: 0, ...content },
    })
  }
  ensure('SWOT_HUB_TITLE', overlay.hubTitle, { text: 'SWOT', align: 'center', verticalAlign: 'center', fontSize: 36, fontWeight: 800, wrap: 'nowrap', lineHeight: 1, color: '#111827' })
  ensure('SWOT_HUB_SUB', overlay.hubSub, { text: 'Analysis', align: 'center', verticalAlign: 'center', fontSize: 16, fontWeight: 600, lineHeight: 1.15, color: muted })

  const { graphicX, graphicY, graphicW, graphicH } = frame
  const petals = [0, 1, 2, 3].map((i) => {
    const slotId = `SWOT_SEG_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const fill = prev?.content?.fill || colors[i]
    return {
      id: prev?.id || newShapeId('shp-swot-seg'),
      type: 'graphic',
      layer: 3,
      placement: { ...swotPetalPlacement(graphicX, graphicY, graphicW, graphicH, i), rotation: 0, opacity: 1 },
      content: { svg: swotPetalInlineSvg(i), colorMode: 'recolorable', fill, alt: `SWOT ${SWOT_LETTERS[i]}` },
      role: 'decoration',
      slotId,
    }
  })
  const prevHub = prevBySlot.get('SWOT_HUB')
  const hub = {
    id: prevHub?.id || newShapeId('shp-swot-hub'),
    type: 'shape',
    layer: 8,
    placement: { ...overlay.hub, rotation: 0, opacity: 1 },
    content: { shape: 'ellipse', fill: prevHub?.content?.fill || '#ffffff' },
    role: 'decoration',
    slotId: 'SWOT_HUB',
  }
  const icons = [0, 1, 2, 3].map((i) => {
    const slotId = `SWOT_ICON_${i + 1}`
    const prev = prevBySlot.get(slotId)
    const fill = prev?.content?.fill || colors[i]
    return {
      id: prev?.id || newShapeId('shp-swot-icon'),
      type: 'graphic',
      layer: 5,
      placement: { ...overlay.rows[i].icon, rotation: 0, opacity: 1 },
      content: { svg: swotIconInlineSvg(i), colorMode: 'recolorable', fill, alt: SWOT_LABELS[i] },
      role: 'decoration',
      slotId,
    }
  })
  const dashes = [0, 1, 2, 3].map((i) => ({
    id: newShapeId('shp-swot-dash'),
    type: 'graphic',
    layer: 2,
    placement: { ...overlay.rows[i].dash, rotation: 0, opacity: 1 },
    content: { svg: swotDashInlineSvg(), colorMode: 'fixed', alt: '' },
    role: 'decoration',
    slotId: `SWOT_DASH_${i + 1}`,
  }))

  return [...dashes, ...petals, hub, ...icons, ...next, ...extras]
}

function isDiagramVennLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return /diagram_venn/.test(id)
}

function isQuoteGridLayout(layoutId) {
  return /quote_grid/.test(String(layoutId || '').toLowerCase())
}

function isQuotePortraitLayout(layoutId) {
  return /quote_portrait/.test(String(layoutId || '').toLowerCase())
}

function isQuoteTestimonialLayout(layoutId) {
  return /quote_testimonial/.test(String(layoutId || '').toLowerCase())
}

function isStatementLargeLayout(layoutId) {
  return /statement_large/.test(String(layoutId || '').toLowerCase())
}

function isStatementLeftLayout(layoutId) {
  return /statement_left/.test(String(layoutId || '').toLowerCase())
}

function isQuoteAttributionLayout(layoutId) {
  return /quote_attribution_v1|quote_with_attribution/.test(String(layoutId || '').toLowerCase())
}

function isQuoteSingleCardFromSlots(schema) {
  const ids = (schema?.slots || []).map((s) => String(s.id || '').toUpperCase())
  if (ids.some((id) => /^QUOTE_[123]$/.test(id))) return false
  const hasQuote = ids.includes('QUOTE') || ids.includes('STATEMENT')
  const hasPerson = ids.includes('NAME') || ids.includes('ATTRIBUTION') || ids.includes('ROLE')
  const hasPhoto = ids.some((id) => id === 'PORTRAIT_IMAGE' || id === 'AVATAR' || /^AVATAR_\d+$/.test(id))
  return hasQuote && hasPerson && hasPhoto
}

function isAvatarSlotId(slotId) {
  return /^(PORTRAIT_IMAGE|AVATAR|AVATAR_\d+)$/i.test(String(slotId || ''))
}

const QUOTE_PORTRAIT_DECO = /^(QUOTE_CARD|QUOTE_MARK|QUOTE_AVATAR_BG)$/i

function layoutQuoteSingleCard(elements, palette, canvas, geom, opts = {}) {
  if (!Array.isArray(elements)) return elements
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const cardFill = paletteColor(palette, 'cardBg', '#FFFFFF')
  const markFill = paletteColor(palette, 'primary', QUOTE_MARK_COLOR)
  const avatarFill = paletteColor(palette, 'surface', '#D5DCE6')
  const quoteSize = opts.quoteSize || 32
  const quoteWeight = opts.quoteWeight || 700
  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => QUOTE_PORTRAIT_DECO.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) =>
      !QUOTE_PORTRAIT_DECO.test(String(el.slotId || '')) &&
      !/^(HEADING|BODY|EYEBROW)$/i.test(String(el.slotId || ''))
  )
  const hasName = stripped.some((el) => /^NAME(_\d+)?$/i.test(String(el.slotId || '')))
  const cleaned = stripped.filter((el) => {
    const sid = String(el.slotId || '').toUpperCase()
    if (hasName && sid === 'ATTRIBUTION') return false
    return true
  })
  const g = geom
  const next = cleaned.map((el) => {
    const sid = String(el.slotId || '').toUpperCase()
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
      fontStyle: 'normal',
    }
    if (sid === 'QUOTE' || sid === 'STATEMENT') {
      return {
        ...el,
        layer: 10,
        placement: { ...g.quote, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: quoteSize,
          fontWeight: quoteWeight,
          lineHeight: 1.4,
          color: textColor,
          wrap: 'wrap',
        },
      }
    }
    if (sid === 'NAME' || sid === 'AUTHOR_NAME' || sid === 'ATTRIBUTION') {
      return {
        ...el,
        layer: 12,
        placement: { ...g.name, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.2,
          color: textColor,
          wrap: 'wrap',
        },
      }
    }
    if (sid === 'ROLE' || sid === 'AUTHOR_TITLE') {
      return {
        ...el,
        layer: 12,
        placement: { ...g.role, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.3,
          color: muted,
          wrap: 'wrap',
        },
      }
    }
    if (isAvatarSlotId(sid)) {
      const url = el.content?.url || el.content?.src
      return {
        ...el,
        layer: 13,
        placement: { ...g.avatar, rotation: 0, opacity: url ? 1 : 0.02 },
        content: { ...(el.content || {}), fit: 'cover', borderRadius: 999, shadow: undefined, boxShadow: undefined },
      }
    }
    return el
  })

  const hasAvatar = next.some((el) => isAvatarSlotId(el.slotId))
  const prevC = prevBySlot.get('QUOTE_CARD')
  const prevM = prevBySlot.get('QUOTE_MARK')
  const prevA = prevBySlot.get('QUOTE_AVATAR_BG')
  const deco = [
    {
      id: prevC?.id || newShapeId('shp-qpcard'),
      type: 'shape',
      layer: 1,
      placement: { ...g.card, rotation: 0, opacity: 1 },
      content: {
        shape: 'rect',
        fill: prevC?.content?.fill || cardFill,
        borderRadius: 22,
        stroke: QUOTE_CARD_BORDER,
        strokeWidth: 1.5,
        boxShadow: opts.shadow || undefined,
        shadow: opts.shadow || undefined,
        layoutSurface: true,
      },
      role: 'decoration',
      slotId: 'QUOTE_CARD',
    },
    {
      id: prevM?.id || newShapeId('shp-qpmark'),
      type: 'graphic',
      layer: 8,
      placement: { ...g.mark, rotation: 0, opacity: 1 },
      content: {
        svg: quoteMarkInlineSvg(),
        colorMode: 'recolorable',
        fill: prevM?.content?.fill || markFill,
        alt: 'Quote',
      },
      role: 'decoration',
      slotId: 'QUOTE_MARK',
    },
    {
      id: prevA?.id || newShapeId('shp-qpav'),
      type: 'shape',
      layer: 11,
      placement: { ...g.avatar, rotation: 0, opacity: 1 },
      content: { shape: 'ellipse', fill: prevA?.content?.fill || avatarFill },
      role: 'decoration',
      slotId: 'QUOTE_AVATAR_BG',
    },
  ]
  if (!hasAvatar) {
    deco.push({
      id: newShapeId('img-qpav'),
      type: 'image',
      layer: 13,
      placement: { ...g.avatar, rotation: 0, opacity: 1 },
      content: { fit: 'cover', borderRadius: 999, placeholderFill: 'transparent' },
      role: 'image',
      slotId: 'PORTRAIT_IMAGE',
    })
  }
  return [...deco, ...next]
}

export function layoutQuotePortrait(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  return layoutQuoteSingleCard(elements, palette, canvas, quotePortraitGeom(canvasW, canvasH), {
    quoteSize: 32,
    quoteWeight: 700,
  })
}

export function layoutQuoteTestimonial(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  return layoutQuoteSingleCard(elements, palette, canvas, quoteTestimonialGeom(canvasW, canvasH), {
    quoteSize: 26,
    quoteWeight: 600,
    shadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
  })
}

export function layoutStatementLarge(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  return layoutQuoteSingleCard(elements, palette, canvas, quotePortraitGeom(canvasW, canvasH), {
    quoteSize: 36,
    quoteWeight: 700,
  })
}

export function layoutStatementLeft(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  return layoutQuoteSingleCard(elements, palette, canvas, quoteStatementLeftGeom(canvasW, canvasH), {
    quoteSize: 30,
    quoteWeight: 700,
  })
}

export function layoutQuoteAttribution(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  return layoutQuoteSingleCard(elements, palette, canvas, quoteStatementLeftGeom(canvasW, canvasH), {
    quoteSize: 30,
    quoteWeight: 700,
  })
}

const QUOTE_GRID_DECO = /^(QUOTE_CARD_|QUOTE_MARK_)/i

export function layoutQuoteGrid(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const cardFill = paletteColor(palette, 'cardBg', '#FFFFFF')
  const markFill = paletteColor(palette, 'primary', QUOTE_MARK_COLOR)
  const frame = quoteGridFrame(canvasW, canvasH, QUOTE_GRID_N)
  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => QUOTE_GRID_DECO.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter((el) => !QUOTE_GRID_DECO.test(String(el.slotId || '')))
  const geoms = [0, 1, 2].map((i) => quoteGridCardGeom(i, frame))

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
      fontStyle: 'normal',
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: frame.insetX,
          y: frame.insetY,
          width: canvasW - frame.insetX * 2,
          height: frame.headingH,
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1.15,
          color: textColor,
        },
      }
    }
    const quoteM = sid.match(/^QUOTE_([1-3])$/i)
    if (quoteM) {
      const i = Number(quoteM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...geoms[i].quote, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.45,
          color: textColor,
          wrap: 'wrap',
        },
      }
    }
    const nameM = sid.match(/^(NAME|ATTR)_([1-3])$/i)
    if (nameM) {
      const i = Number(nameM[2]) - 1
      return {
        ...el,
        layer: 11,
        placement: { ...geoms[i].name, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          color: textColor,
          wrap: 'wrap',
        },
      }
    }
    const roleM = sid.match(/^ROLE_([1-3])$/i)
    if (roleM) {
      const i = Number(roleM[1]) - 1
      return {
        ...el,
        layer: 11,
        placement: { ...geoms[i].role, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'left',
          verticalAlign: 'flex-start',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.3,
          color: muted,
          wrap: 'wrap',
        },
      }
    }
    const avM = sid.match(/^AVATAR_([1-3])$/i)
    if (avM) {
      const i = Number(avM[1]) - 1
      return {
        ...el,
        layer: 12,
        placement: { ...geoms[i].avatar, rotation: 0, opacity: 1 },
        content: { ...(el.content || {}), fit: 'cover', borderRadius: 999 },
      }
    }
    return el
  })

  const deco = []
  const seenAvatar = new Set(
    next.filter((el) => /^AVATAR_[1-3]$/i.test(String(el.slotId || ''))).map((el) => String(el.slotId).toUpperCase())
  )
  for (let i = 0; i < QUOTE_GRID_N; i += 1) {
    const g = geoms[i]
    const cardId = `QUOTE_CARD_${i + 1}`
    const markId = `QUOTE_MARK_${i + 1}`
    const prevC = prevBySlot.get(cardId)
    const prevM = prevBySlot.get(markId)
    deco.push({
      id: prevC?.id || newShapeId('shp-qcard'),
      type: 'shape',
      layer: 1,
      placement: { ...g.card, rotation: 0, opacity: 1 },
      content: {
        shape: 'rect',
        fill: prevC?.content?.fill || cardFill,
        borderRadius: 18,
        stroke: QUOTE_CARD_BORDER,
        strokeWidth: 1.5,
        layoutSurface: true,
      },
      role: 'decoration',
      slotId: cardId,
    })
    deco.push({
      id: prevM?.id || newShapeId('shp-qmark'),
      type: 'graphic',
      layer: 8,
      placement: { ...g.mark, rotation: 0, opacity: 1 },
      content: {
        svg: quoteMarkInlineSvg(),
        colorMode: 'recolorable',
        fill: prevM?.content?.fill || markFill,
        alt: 'Quote',
      },
      role: 'decoration',
      slotId: markId,
    })
    const avId = `AVATAR_${i + 1}`
    if (!seenAvatar.has(avId)) {
      deco.push({
        id: newShapeId('img-qav'),
        type: 'image',
        layer: 12,
        placement: { ...g.avatar, rotation: 0, opacity: 1 },
        content: { fit: 'cover', borderRadius: 999, placeholderFill: '#E5E7EB' },
        role: 'image',
        slotId: avId,
      })
    }
  }

  return [...deco, ...next]
}

export function layoutDiagramVenn(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const muted = paletteColor(palette, 'muted', '#6B7280')
  const frame = vennFrame(canvasW, canvasH)
  const colors = [
    paletteColor(palette, 'secondary', VENN_COLORS[0]),
    paletteColor(palette, 'accent', VENN_COLORS[1]),
    paletteColor(palette, 'primary', VENN_COLORS[2]),
  ]
  const prevBySlot = new Map(
    (elements || [])
      .filter((el) => /^VENN_(OUTER|MID|CORE)_[1-3]$/i.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter(
    (el) =>
      !/^(VENN_(OUTER|MID|CORE|ICON)_[1-3])$/i.test(String(el.slotId || '')) &&
      String(el.slotId || '').toUpperCase() !== 'CENTER_BODY'
  )
  const geoms = [0, 1, 2].map((i) => vennSetGeom(i, frame))

  const next = stripped.map((el) => {
    const sid = String(el.slotId || '')
    const base = {
      ...(el.content || {}),
      letterSpacing: '0',
      padding: 0,
      paddingX: 0,
      stroke: undefined,
      strokeWidth: 0,
    }
    if (sid.toUpperCase() === 'HEADING') {
      return {
        ...el,
        placement: {
          ...(el.placement || {}),
          x: 56,
          y: frame.headingY,
          width: canvasW - 112,
          height: frame.headingH,
          rotation: 0,
          opacity: 1,
        },
        content: { ...base, align: 'left', verticalAlign: 'center', fontSize: 36, fontWeight: 800, lineHeight: 1.15, color: textColor },
      }
    }
    if (sid.toUpperCase() === 'CENTER_BODY') {
      return null
    }
    const titleM = sid.match(/^Q([1-3])_TITLE$/i)
    if (titleM) {
      const i = Number(titleM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...geoms[i].title, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.2,
          color: textColor,
          wrap: 'wrap',
        },
      }
    }
    const bodyM = sid.match(/^Q([1-3])_BODY$/i)
    if (bodyM) {
      const i = Number(bodyM[1]) - 1
      return {
        ...el,
        layer: 10,
        placement: { ...geoms[i].body, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'flex-start',
          fontSize: 16,
          fontWeight: 400,
          color: muted,
          lineHeight: 1.45,
          wrap: 'wrap',
        },
      }
    }
    return el
  })

  const rings = []
  for (let i = 0; i < VENN_N; i += 1) {
    const g = geoms[i]
    const base = colors[i]
    const outerId = `VENN_OUTER_${i + 1}`
    const midId = `VENN_MID_${i + 1}`
    const coreId = `VENN_CORE_${i + 1}`
    const prevO = prevBySlot.get(outerId)
    const prevM = prevBySlot.get(midId)
    const prevC = prevBySlot.get(coreId)
    rings.push({
      id: prevO?.id || newShapeId('shp-venn-o'),
      type: 'shape',
      layer: 2,
      placement: { ...g.outer, rotation: 0, opacity: 0.88 },
      content: { shape: 'ellipse', fill: prevO?.content?.fill || vennRingColor(base, 'outer') },
      role: 'decoration',
      slotId: outerId,
    })
    rings.push({
      id: prevM?.id || newShapeId('shp-venn-m'),
      type: 'shape',
      layer: 4,
      placement: { ...g.mid, rotation: 0, opacity: 0.94 },
      content: { shape: 'ellipse', fill: prevM?.content?.fill || vennRingColor(base, 'mid') },
      role: 'decoration',
      slotId: midId,
    })
    rings.push({
      id: prevC?.id || newShapeId('shp-venn-c'),
      type: 'graphic',
      layer: 7,
      placement: { ...g.core, rotation: 0, opacity: 1 },
      content: {
        svg: vennCoreInlineSvg(),
        colorMode: 'recolorable',
        fill: prevC?.content?.fill || vennRingColor(base, 'core'),
        alt: `Venn core ${i + 1}`,
      },
      role: 'decoration',
      slotId: coreId,
    })
    rings.push({
      id: newShapeId('shp-venn-i'),
      type: 'graphic',
      layer: 8,
      placement: { ...g.icon, rotation: 0, opacity: 1 },
      content: { svg: vennIconInlineSvg(i), colorMode: 'fixed', alt: '' },
      role: 'decoration',
      slotId: `VENN_ICON_${i + 1}`,
    })
  }

  return [...rings, ...next.filter(Boolean)]
}

export function finalizeTimelineShapes(elements, schema, palette = {}, canvas = {}) {
  const layoutId = schema?.layout_id
  if (isDiagramProcessStepsLayout(layoutId)) {
    return layoutDiagramProcessSteps(elements, schema, palette, canvas)
  }
  if (isDiagramCycleLayout(layoutId)) {
    return layoutDiagramCycle(elements, schema, palette, canvas)
  }
  if (isDiagramFunnelLayout(layoutId)) {
    return layoutDiagramFunnel(elements, schema, palette, canvas)
  }
  if (isDiagramPyramidLayout(layoutId)) {
    return layoutDiagramPyramid(elements, schema, palette, canvas)
  }
  if (isDiagramMatrixLayout(layoutId)) {
    return layoutDiagramMatrix(elements, schema, palette, canvas)
  }
  if (isDiagramSwotLayout(layoutId)) {
    return layoutDiagramSwot(elements, schema, palette, canvas)
  }
  if (isDiagramVennLayout(layoutId)) {
    return layoutDiagramVenn(elements, schema, palette, canvas)
  }
  if (isQuoteGridLayout(layoutId)) {
    return layoutQuoteGrid(elements, schema, palette, canvas)
  }
  if (isQuotePortraitLayout(layoutId)) {
    return layoutQuotePortrait(elements, schema, palette, canvas)
  }
  if (isQuoteTestimonialLayout(layoutId)) {
    return layoutQuoteTestimonial(elements, schema, palette, canvas)
  }
  if (isStatementLargeLayout(layoutId)) {
    return layoutStatementLarge(elements, schema, palette, canvas)
  }
  if (isStatementLeftLayout(layoutId)) {
    return layoutStatementLeft(elements, schema, palette, canvas)
  }
  if (isQuoteAttributionLayout(layoutId) || isQuoteSingleCardFromSlots(schema)) {
    return layoutQuoteAttribution(elements, schema, palette, canvas)
  }
  let next = applyDefaultCardShapes(elements, schema, palette, canvas)
  next = applyProcessLinnerHortiShapes(next, schema, palette, canvas)
  next = applyProcessLinnerNumericShapes(next, schema, palette, canvas)
  next = applyTimelineConnectorShapes(next, schema, palette, canvas)
  return next
}
