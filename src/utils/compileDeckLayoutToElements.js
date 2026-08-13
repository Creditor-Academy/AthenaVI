import { resolvePreviewMode } from './deckLayoutRegistry'
import { resolveImagePresentation } from './deckLayoutV2Helpers'
import { parseRegion, regionToBox, getGridDims } from './layoutPreviewUtils'
import {
  buildDeviceFrameCanvasElements,
  findDeviceFrameSlot,
} from './deviceFrameCanvas'
import { buildContentBySlotIdFromSlideContent, mergeContentBySlotId } from './contentSlotMapping'

/** Neutral layout surfaces — structure only, matches LayoutPolishedPreview (not brand theme). */
const LAYOUT_SURFACE = {
  card: 'color-mix(in srgb, #94a3b8 14%, #ffffff)',
  cardBorder: 'color-mix(in srgb, #94a3b8 28%, transparent)',
  cardShadow: '0 1px 2px rgba(15, 23, 42, 0.05), 0 10px 28px rgba(15, 23, 42, 0.04)',
  iconFill: 'color-mix(in srgb, #64748b 18%, transparent)',
  iconRing: 'color-mix(in srgb, #6366f1 32%, transparent)',
  bar: 'color-mix(in srgb, #1f2937 55%, transparent)',
  image: 'linear-gradient(145deg, color-mix(in srgb, #6366f1 8%, #f8fafc) 0%, #e2e8f0 52%, color-mix(in srgb, #6366f1 5%, #cbd5e1) 100%)',
  text: '#1f2937',
  textMuted: '#6b7280',
  textOnImage: '#ffffff',
  textOnImageMuted: 'rgba(255,255,255,0.85)',
  overlayScrim: 'rgba(0,0,0,0.45)',
  surface: '#f8fafc',
  cardBg: 'color-mix(in srgb, #94a3b8 14%, #ffffff)',
  accent: '#6366f1',
  primary: '#2563eb',
  radius: 12,
  radiusSm: 8,
}

const COLOR_ROLE_MAP = {
  text: LAYOUT_SURFACE.text,
  muted: LAYOUT_SURFACE.textMuted,
  primary: LAYOUT_SURFACE.primary,
  accent: LAYOUT_SURFACE.accent,
  surface: LAYOUT_SURFACE.surface,
  cardBg: LAYOUT_SURFACE.cardBg,
  textOnImage: LAYOUT_SURFACE.textOnImage,
  textOnImageMuted: LAYOUT_SURFACE.textOnImageMuted,
  overlayScrim: LAYOUT_SURFACE.overlayScrim,
}

function resolveShapeFill(shapeSpec) {
  if (!shapeSpec) {
    return { shape: 'rounded-rect', fill: LAYOUT_SURFACE.card, borderRadius: LAYOUT_SURFACE.radiusSm }
  }
  const type = shapeSpec.type === 'ellipse' ? 'circle' : shapeSpec.type === 'line' ? 'rect' : 'rounded-rect'
  const borderRadius = shapeSpec.borderRadius ?? (type === 'circle' ? undefined : LAYOUT_SURFACE.radiusSm)
  if (shapeSpec.fill?.color) {
    return { shape: type, fill: shapeSpec.fill.color, borderRadius }
  }
  const role = shapeSpec.fillColorRole || shapeSpec.fill?.colorRole || 'cardBg'
  const fill = COLOR_ROLE_MAP[role] || LAYOUT_SURFACE.card
  return {
    shape: type,
    fill,
    stroke: role === 'cardBg' || role === 'surface' ? LAYOUT_SURFACE.cardBorder : undefined,
    strokeWidth: role === 'cardBg' || role === 'surface' ? 1 : undefined,
    borderRadius,
    shadow: role === 'cardBg' ? LAYOUT_SURFACE.cardShadow : undefined,
    layoutSurface: true,
  }
}

function isOverlayLayout(schema) {
  const layoutId = String(schema?.layout_id || '')
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  if (slots.some((s) => s.id === 'BACKGROUND_IMAGE' || /OVERLAY_SCRIM/i.test(String(s.id || '')))) return true
  return /full_bg|overlay|statement_top|statement_bottom/i.test(layoutId)
}

const TEXT_ROLES = new Set([
  'heading',
  'subheading',
  'body',
  'caption',
  'stat',
  'stat_label',
  'quote',
  'attribution',
  'cta',
  'contact',
  'eyebrow',
  'divider',
])

function boxToPlacement(box, canvasW, canvasH) {
  return {
    x: Math.round((box.x / 100) * canvasW),
    y: Math.round((box.y / 100) * canvasH),
    width: Math.max(Math.round((box.w / 100) * canvasW), 40),
    height: Math.max(Math.round((box.h / 100) * canvasH), 24),
  }
}

function shouldSplitSharedRow(upperRole, lowerRole) {
  if (TEXT_ROLES.has(upperRole) && TEXT_ROLES.has(lowerRole)) return true
  if (upperRole === 'heading' && lowerRole === 'body') return true
  if (upperRole === 'chart' && (lowerRole === 'caption' || TEXT_ROLES.has(lowerRole))) return true
  if (upperRole === 'image' && TEXT_ROLES.has(lowerRole)) return true
  return false
}

/** Trim shared grid rows so adjacent slots do not occupy the same row twice. */
export function adjustSlotRegion(reg, slot, allSlots) {
  const adjusted = { ...reg }
  const role = slot?.role || 'body'

  for (const other of allSlots) {
    if (other.id === slot.id) continue
    const oreg = parseRegion(other.region)
    if (!oreg) continue
    const otherRole = other.role || 'body'

    if (oreg.r1 === adjusted.r2 && shouldSplitSharedRow(role, otherRole)) {
      adjusted.r2 -= 0.42
    }
    if (oreg.r2 === adjusted.r1 && shouldSplitSharedRow(otherRole, role)) {
      adjusted.r1 += 0.42
    }
  }

  if (adjusted.r2 < adjusted.r1) adjusted.r2 = adjusted.r1 + 0.5
  return adjusted
}

function insetForRole(role, slotId) {
  const id = String(slotId || '').toLowerCase()
  if (role === 'background' || /_bg$|card_bg|panel_bg/.test(id)) return 0.15
  if (role === 'chart') return 1.2
  if (role === 'image') return 0.35
  if (role === 'caption' || role === 'stat_label') return 0.85
  if (role === 'heading' || role === 'subheading') return 1
  return 1.1
}

/** Center small icon circles inside their slot (insight cards, avatars). */
function centerIconPlacement(placement) {
  const size = Math.round(Math.min(placement.width, placement.height) * 0.36)
  return {
    x: Math.round(placement.x + (placement.width - size) / 2),
    y: Math.round(placement.y + (placement.height - size) / 2),
    width: Math.max(size, 28),
    height: Math.max(size, 28),
  }
}

function textPaddingForRole(role) {
  if (role === 'heading' || role === 'quote') return { x: 12, y: 8 }
  if (role === 'caption' || role === 'stat_label' || role === 'eyebrow') return { x: 8, y: 4 }
  return { x: 10, y: 6 }
}

function layerForSlot(slot) {
  if (slot?.layer != null) return Number(slot.layer)
  const role = slot?.role || ''
  const id = String(slot?.id || '').toLowerCase()
  if (role === 'background') return 0
  if (/_bg$|_card_bg|_panel_bg|card_bg|panel_bg/.test(id)) return 1
  if (role === 'decoration') return 6
  if (role === 'image' || role === 'chart' || role === 'table') return 12
  const reg = parseRegion(slot?.region)
  return 24 + (reg?.r1 || 0)
}

function fontSizeForTextSlot(slot, placement) {
  const role = slot?.role || 'body'
  const maxLines =
    slot?.max_lines ||
    (role === 'heading' || role === 'quote' ? 2 : role === 'caption' || role === 'stat_label' ? 2 : 4)
  const lineHeight = role === 'stat' ? 1.1 : 1.32
  const maxByHeight = placement.height / (maxLines * lineHeight) - 2
  const roleCap = (() => {
    const h = Math.max(placement.height, 24)
    switch (role) {
      case 'heading':
      case 'quote':
        return Math.min(44, Math.max(24, h * 0.34))
      case 'subheading':
        return Math.min(32, Math.max(18, h * 0.3))
      case 'stat':
        return Math.min(72, Math.max(24, h * 0.5))
      case 'caption':
      case 'stat_label':
      case 'eyebrow':
        return Math.min(20, Math.max(12, h * 0.28))
      default:
        return Math.min(24, Math.max(14, h * 0.32))
    }
  })()
  return Math.max(12, Math.min(roleCap, maxByHeight))
}

function textAlignForRole(role) {
  if (role === 'stat' || role === 'stat_label') return 'center'
  if (role === 'caption') return 'center'
  return 'left'
}

function fontWeightForRole(role) {
  if (role === 'heading' || role === 'stat') return 500
  return 400
}

function resolveSlotText(slot, contentBySlotId, schema) {
  const slotId = slot?.id
  const placeholder = slot?.placeholder_text != null ? String(slot.placeholder_text).trim() : ''

  if (slotId && contentBySlotId?.[slotId] != null) {
    const merged = String(contentBySlotId[slotId]).trim()
    if (merged && !isLikelyBadMergedText(merged, slot, schema)) {
      return merged
    }
  }

  if (placeholder) return placeholder
  return ''
}

/** Reject backend/AI text that duplicated the layout or slide title into every slot. */
function isLikelyBadMergedText(text, slot, schema) {
  const value = String(text || '').trim().toLowerCase()
  if (!value) return true

  const layoutId = String(schema?.layout_id || '')
    .replace(/_/g, ' ')
    .replace(/\s+v\d+$/i, '')
    .trim()
    .toLowerCase()
  const placeholder = String(slot?.placeholder_text || '').trim().toLowerCase()

  if (layoutId && value === layoutId) return true
  if (layoutId && value.replace(/\s+/g, ' ') === layoutId.replace(/\s+/g, ' ')) return true

  if ((slot?.role === 'caption' || slot?.role === 'body' || slot?.role === 'stat_label') && layoutId) {
    if (value.includes('insights chart') || value.includes('grid insights')) return true
    if (layoutId.split(/\s+/).every((word) => word.length > 2 && value.includes(word))) return true
  }

  if (placeholder && value === placeholder) return false
  if (placeholder && (slot?.role === 'caption' || slot?.role === 'stat_label') && value.length > placeholder.length + 12) {
    return true
  }

  return false
}

function resolveChartContent(slot, schema, palette, contentBySlotId) {
  const preview = schema?.preview || {}
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  const slotId = String(slot?.id || '').toUpperCase()
  const mode = resolvePreviewMode(schema)
  const saved = contentBySlotId?.[`${slot.id}__chart`]

  let chartType =
    saved?.chartType ||
    slot?.chart_type ||
    slot?.chartType ||
    preview?.chartType ||
    preview?.chart_type

  if (!chartType) {
    if (
      mode === 'chart_split' ||
      /exponential|line_chart|line-chart/.test(layoutId) ||
      /^LINE_/.test(slotId)
    ) {
      chartType = 'line-points'
    } else if (/BAR_CHART|bar_chart|^BAR_/.test(slotId) || mode === 'grid_insights_chart') {
      chartType = 'column-grouped'
    } else if (/^DONUT/.test(slotId) || /pie|donut/.test(layoutId)) {
      chartType = 'donut'
    } else if (/area/.test(layoutId)) {
      chartType = 'area'
    } else if (/kpi|stat/.test(layoutId) && slotId.includes('KPI')) {
      chartType = 'kpi'
    } else {
      chartType = 'column-grouped'
    }
  }

  const labels =
    saved?.data?.labels ||
    saved?.labels ||
    preview?.chartLabels ||
    ['Q1', 'Q2', 'Q3', 'Q4']
  const values =
    saved?.data?.series?.[0]?.values ||
    saved?.data?.values ||
    saved?.values ||
    preview?.chartValues ||
    [12, 19, 14, 22]

  return {
    chartType,
    colors: [LAYOUT_SURFACE.bar],
    showGrid: true,
    showLabels: true,
    premium: true,
    data: {
      labels: Array.isArray(labels) ? labels : ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        {
          name: saved?.data?.series?.[0]?.name || 'Series',
          values: (Array.isArray(values) ? values : [12, 19, 14, 22]).map(Number),
        },
      ],
    },
  }
}

function buildTextElement(slot, placement, options) {
  const { contentBySlotId, schema } = options
  const role = slot.role || 'body'
  const text = resolveSlotText(slot, contentBySlotId, schema)
  const ty = slot.typography || {}
  const overlay = isOverlayLayout(schema)
  const fontSize = ty.fontSize || fontSizeForTextSlot(slot, placement)
  const verticalAlign = role === 'stat' || role === 'stat_label' ? 'center' : 'flex-start'
  let colorRole = ty.colorRole || null
  if (!colorRole) {
    if (overlay && (role === 'caption' || role === 'eyebrow' || role === 'subheading' || role === 'body')) {
      colorRole = 'textOnImageMuted'
    } else if (overlay) {
      colorRole = 'textOnImage'
    } else if (role === 'caption' || role === 'eyebrow' || role === 'stat_label' || role === 'body') {
      colorRole = 'muted'
    } else {
      colorRole = 'text'
    }
  }
  const color = COLOR_ROLE_MAP[colorRole] || LAYOUT_SURFACE.text
  const align = ty.align || textAlignForRole(role)
  const pad = textPaddingForRole(role)

  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'text',
    role,
    layer: layerForSlot(slot),
    placement,
    content: {
      text,
      fontSize,
      bold: ty.fontWeight != null ? Number(ty.fontWeight) >= 600 : false,
      fontWeight: ty.fontWeight != null ? Number(ty.fontWeight) : fontWeightForRole(role),
      italic: role === 'quote',
      align,
      verticalAlign,
      color,
      colorRole,
      fontFamily: 'Inter',
      lineHeight: ty.lineHeight || (role === 'stat' ? 1.08 : role === 'heading' ? 1.18 : 1.42),
      letterSpacing: ty.letterSpacing != null ? `${ty.letterSpacing}em` : role === 'heading' ? '-0.02em' : role === 'caption' ? '0.01em' : undefined,
      wrap: 'pre-wrap',
      padding: pad.y,
      paddingX: pad.x,
    },
  }
}

function buildBackgroundElement(slot, placement) {
  const resolved = resolveShapeFill(slot.shape)
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'shape',
    role: slot.role,
    layer: layerForSlot(slot),
    placement,
    content: {
      shape: resolved.shape,
      fill: resolved.fill,
      stroke: resolved.stroke,
      strokeWidth: resolved.strokeWidth,
      borderRadius: resolved.borderRadius,
      shadow: resolved.shadow,
      layoutSurface: resolved.layoutSurface ?? true,
    },
  }
}

function buildDecorationElement(slot, placement) {
  const id = String(slot.id || '').toLowerCase()
  if (slot.shape) {
    const resolved = resolveShapeFill(slot.shape)
    return {
      id: `slot-${slot.id}`,
      slotId: slot.id,
      type: 'shape',
      role: slot.role,
      layer: layerForSlot(slot),
      placement: slot.shape?.type === 'ellipse' ? centerIconPlacement(placement) : placement,
      content: {
        shape: resolved.shape,
        fill: resolved.fill,
        stroke: resolved.stroke || ( /icon|avatar|logo/.test(id) ? LAYOUT_SURFACE.iconRing : undefined),
        strokeWidth: resolved.strokeWidth || (/icon|avatar|logo/.test(id) ? 1.5 : undefined),
        borderRadius: resolved.borderRadius,
        shadow: resolved.shadow,
        layoutSurface: true,
      },
    }
  }
  if (/icon|avatar|logo/.test(id)) {
    return {
      id: `slot-${slot.id}`,
      slotId: slot.id,
      type: 'shape',
      role: slot.role,
      layer: layerForSlot(slot),
      placement: centerIconPlacement(placement),
      content: {
        shape: 'circle',
        fill: LAYOUT_SURFACE.iconFill,
        stroke: LAYOUT_SURFACE.iconRing,
        strokeWidth: 1.5,
        layoutSurface: true,
      },
    }
  }
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'shape',
    role: slot.role,
    layer: layerForSlot(slot),
    placement,
    content: {
      shape: /circle|avatar/.test(id) ? 'circle' : 'rounded-rect',
      fill: LAYOUT_SURFACE.card,
      stroke: LAYOUT_SURFACE.cardBorder,
      strokeWidth: 1,
      borderRadius: LAYOUT_SURFACE.radiusSm,
      layoutSurface: true,
    },
  }
}

function buildImageElement(slot, placement, contentBySlotId) {
  const slotId = slot.id
  const url = contentBySlotId?.[`${slotId}__url`] || contentBySlotId?.[`${slotId}_url`]
  const presentation = resolveImagePresentation(slot)
  const borderRadius = slot.borderRadius != null ? slot.borderRadius : presentation.borderRadius
  const shadow = slot.shadow ?? presentation.shadow
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'image',
    role: 'image',
    layer: layerForSlot(slot),
    placement,
    content: {
      ...(url ? { url, src: url } : {}),
      fit: slot.fit || 'cover',
      alt: '',
      placeholderFill: LAYOUT_SURFACE.image,
      borderRadius,
      ...(shadow ? { boxShadow: shadow, shadow } : {}),
    },
  }
}

function buildChartElement(slot, placement, options) {
  const { palette, contentBySlotId, schema } = options
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'chart',
    role: 'chart',
    layer: layerForSlot(slot),
    placement,
    content: resolveChartContent(slot, schema, palette, contentBySlotId),
  }
}

function buildTableElement(slot, placement, contentBySlotId = {}, slideContent = null) {
  const saved = contentBySlotId?.[`${slot.id}__table`] || slideContent?.table
  const headers = Array.isArray(saved?.headers) ? saved.headers : ['Column A', 'Column B', 'Column C']
  const rows = Array.isArray(saved?.rows) ? saved.rows : [
    ['Row 1', '—', '—'],
    ['Row 2', '—', '—'],
    ['Row 3', '—', '—'],
  ]
  const cells = [headers, ...rows]
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'table',
    role: 'table',
    layer: layerForSlot(slot),
    placement,
    content: {
      rows: cells.length,
      cols: headers.length,
      hasHeader: true,
      cells,
    },
  }
}

function isAiOnlyShapeSlot(slot) {
  if (!slot) return false
  const id = String(slot?.id || '')
  const role = String(slot?.role || '').toLowerCase()
  // Card backgrounds and device frames are compiled explicitly
  if (/^METRIC_CARD_\d+_BG$/.test(id)) return false
  if (/^TEXT_HALF_BG$/i.test(id)) return false
  if (/_(FRAME|_BG)$/i.test(id) && slot.shape) return false
  if (slot.aiOnly === true) return true
  if (/_BG$|CARD_BG|OVERLAY_SCRIM|CTA_BG/i.test(id)) return true
  if (role === 'divider') return true
  if (role === 'decoration' && slot.shape && !/logo|frame/i.test(id)) return true
  if (role === 'background' && id !== 'BACKGROUND_IMAGE' && slot.shape) return true
  if (/^ICON_\d+$/.test(id)) return true
  return false
}

function isDeviceFrameSlot(slot) {
  const id = String(slot?.id || '')
  return /FRAME$/i.test(id) && slot?.shapeHint?.pairsWithSlotId
}

function applyTextOverImageContrast(elements, palette = LAYOUT_SURFACE) {
  const images = elements.filter((el) => el.type === 'image')
  if (!images.length) return elements

  return elements.map((el) => {
    if (el.type !== 'text') return el
    const placement = el.placement || {}
    const textArea = Math.max(1, (placement.width ?? 1) * (placement.height ?? 1))
    let maxOverlap = 0
    for (const img of images) {
      const p = img.placement || {}
      const overlapW = Math.max(0, Math.min((placement.x ?? 0) + (placement.width ?? 0), (p.x ?? 0) + (p.width ?? 0)) - Math.max(placement.x ?? 0, p.x ?? 0))
      const overlapH = Math.max(0, Math.min((placement.y ?? 0) + (placement.height ?? 0), (p.y ?? 0) + (p.height ?? 0)) - Math.max(placement.y ?? 0, p.y ?? 0))
      maxOverlap = Math.max(maxOverlap, (overlapW * overlapH) / textArea)
    }
    if (maxOverlap <= 0.25) return el

    const role = String(el.role || '').toLowerCase()
    const slotId = String(el.slotId || '').toLowerCase()
    const isMuted =
      role === 'body' ||
      role === 'caption' ||
      role === 'stat_label' ||
      role === 'subheading' ||
      slotId.includes('body') ||
      slotId.includes('bullet')
    const colorRole = isMuted ? 'textOnImageMuted' : 'textOnImage'
    return {
      ...el,
      content: {
        ...(el.content || {}),
        colorRole,
        color: COLOR_ROLE_MAP[colorRole] || el.content?.color,
      },
    }
  })
}

/**
 * Compile DECK_LAYOUT schema slots into canvas elements (1920×1080 space).
 */
export function compileDeckLayoutToElements(schema, options = {}) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  if (!slots.length) return []

  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const { COLS, ROWS } = getGridDims(slots)
  const contentBySlotId = mergeContentBySlotId(
    buildContentBySlotIdFromSlideContent(options.content, schema),
    options.contentBySlotId || {}
  )

  const elements = slots.flatMap((slot) => {
    if (isDeviceFrameSlot(slot)) return []
    if (isAiOnlyShapeSlot(slot)) return []

    const reg = parseRegion(slot.region)
    if (!reg) return []

    const adjusted = adjustSlotRegion(reg, slot, slots)
    const inset = insetForRole(slot.role, slot.id)
    const box = regionToBox(adjusted, COLS, ROWS, inset)
    const placement = boxToPlacement(box, canvasW, canvasH)
    const role = slot.role || 'body'
    const compileOptions = { ...options, schema, contentBySlotId }

    if (role === 'background' || /^METRIC_CARD_\d+_BG$|^TEXT_HALF_BG$|^SURFACE_|_bg$|_card_bg|_panel_bg/i.test(String(slot.id || ''))) {
      return [buildBackgroundElement(slot, placement)]
    }
    if (role === 'decoration' && slot.shape) {
      return [buildBackgroundElement(slot, placement)]
    }
    if (role === 'image') {
      const frameSlot = findDeviceFrameSlot(slots, slot.id)
      if (frameSlot) {
        const imageEl = buildImageElement(slot, placement, contentBySlotId)
        const frameReg = parseRegion(frameSlot.region)
        const framePlacement = boxToPlacement(
          regionToBox(frameReg, COLS, ROWS, 0.2),
          canvasW,
          canvasH
        )
        return buildDeviceFrameCanvasElements({
          frameSlot,
          imageSlot: slot,
          framePlacement,
          imageContent: imageEl.content,
          layerBase: layerForSlot(frameSlot),
        })
      }
      return [buildImageElement(slot, placement, contentBySlotId)]
    }
    if (role === 'chart') {
      return [buildChartElement(slot, placement, compileOptions)]
    }
    if (role === 'table') {
      return [buildTableElement(slot, placement, contentBySlotId, options.content)]
    }
    if (TEXT_ROLES.has(role)) {
      return [buildTextElement(slot, placement, compileOptions)]
    }
    return [buildTextElement(slot, placement, compileOptions)]
  })

  const palette = options.palette || LAYOUT_SURFACE
  return applyTextOverImageContrast(
    elements.sort((a, b) => (a.layer || 0) - (b.layer || 0)),
    palette
  )
}

export function isTextLayoutRole(role) {
  return TEXT_ROLES.has(role)
}

export function hasOverlappingTextPlacements(elements = []) {
  const textEls = (elements || []).filter((el) => el.type === 'text')
  for (let i = 0; i < textEls.length; i += 1) {
    const a = textEls[i].placement || {}
    for (let j = i + 1; j < textEls.length; j += 1) {
      const b = textEls[j].placement || {}
      const overlapX = (a.x ?? 0) < (b.x ?? 0) + (b.width ?? 0) && (b.x ?? 0) < (a.x ?? 0) + (a.width ?? 0)
      const overlapY = (a.y ?? 0) < (b.y ?? 0) + (b.height ?? 0) && (b.y ?? 0) < (a.y ?? 0) + (a.height ?? 0)
      if (overlapX && overlapY) {
        const overlapArea =
          Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
          Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
        const minArea = Math.min((a.width ?? 1) * (a.height ?? 1), (b.width ?? 1) * (b.height ?? 1))
        if (overlapArea > minArea * 0.15) return true
      }
    }
  }
  return false
}
