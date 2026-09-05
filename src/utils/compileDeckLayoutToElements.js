import { resolvePreviewMode } from './deckLayoutRegistry'
import { resolveImagePresentation } from './deckLayoutV2Helpers'
import { parseRegion, regionToBox, getGridDims } from './layoutPreviewUtils'
import {
  buildDeviceFrameCanvasElements,
  findDeviceFrameSlot,
} from './deviceFrameCanvas'
import { buildContentBySlotIdFromSlideContent, mergeContentBySlotId } from './contentSlotMapping'
import { fontSizeForTextSlot, resolveTypeScaleFontSize, fitTextToSlot } from './canvasTypography'
import {
  compileLayoutGeometry,
  getSlotPlacement,
  geometrySnapshot,
  validateLayoutGeometry,
} from './compileLayoutGeometry'
import { finalizeTimelineShapes } from './timelineShapeFinalize'
import { isPricingFourPlansLayout } from './pricingFourPlans.js'
import { isPricingFourPlansFeaturedLayout } from './pricingFourPlansFeatured.js'
import { isPricingFourParaLayout } from './pricingFourPara.js'
import { isPricingFourParaCardsLayout } from './pricingFourParaCards.js'
import { isCatalogPlaceholderText } from './catalogPlaceholder'
import { normalizeChartContent } from './chartContentNormalize'

/**
 * Merge theme tokens into compile options so editor preview matches AI output.
 */
export function buildThemeCompileOptions(themeTokens = null, overrides = {}) {
  const palette =
    overrides.palette ||
    themeTokens?.palette ||
    null
  const fonts = overrides.fonts || themeTokens?.fonts || null
  const typeScale = overrides.typeScale || themeTokens?.typeScale || null
  return {
    ...overrides,
    palette,
    fonts,
    typeScale,
    fontFamily:
      overrides.fontFamily ||
      fonts?.body ||
      fonts?.heading ||
      null,
  }
}

function themedImagePlaceholder(palette) {
  if (!palette || typeof palette !== 'object') return LAYOUT_SURFACE.image
  const primary = palette.primary || palette.accent || '#6366f1'
  const surface = palette.surface || palette.bg || '#f8fafc'
  return `linear-gradient(145deg, color-mix(in srgb, ${primary} 10%, ${surface}) 0%, color-mix(in srgb, ${primary} 4%, #e2e8f0) 100%)`
}

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

function colorRoleMapFromPalette(palette = {}) {
  if (!palette || typeof palette !== 'object' || Object.keys(palette).length === 0) {
    return COLOR_ROLE_MAP
  }
  return {
    bg: palette.bg || palette.surface || COLOR_ROLE_MAP.surface,
    text: palette.text || COLOR_ROLE_MAP.text,
    muted: palette.muted || palette.textMuted || COLOR_ROLE_MAP.muted,
    primary: palette.primary || COLOR_ROLE_MAP.primary,
    accent: palette.accent || COLOR_ROLE_MAP.accent,
    surface: palette.surface || palette.bg || COLOR_ROLE_MAP.surface,
    cardBg: palette.cardBg || palette.surface || COLOR_ROLE_MAP.cardBg,
    textOnImage: palette.textOnImage || COLOR_ROLE_MAP.textOnImage,
    textOnImageMuted: palette.textOnImageMuted || COLOR_ROLE_MAP.textOnImageMuted,
    overlayScrim: palette.overlayScrim || COLOR_ROLE_MAP.overlayScrim,
  }
}

function resolveFontFamily(options = {}, role = 'body') {
  const fonts = options.fonts || {}
  if (role === 'heading' || role === 'title' || role === 'stat') {
    return fonts.heading || fonts.display || options.fontFamily || null
  }
  return fonts.body || options.fontFamily || null
}

function resolveShapeFill(shapeSpec, palette = null) {
  const colorMap = palette ? colorRoleMapFromPalette(palette) : COLOR_ROLE_MAP
  if (!shapeSpec) {
    return { shape: 'rounded-rect', fill: colorMap.cardBg || LAYOUT_SURFACE.card, borderRadius: LAYOUT_SURFACE.radiusSm }
  }
  const type = shapeSpec.type === 'ellipse' ? 'circle' : shapeSpec.type === 'line' ? 'rect' : 'rounded-rect'
  const borderRadius = shapeSpec.borderRadius ?? (type === 'circle' ? undefined : LAYOUT_SURFACE.radiusSm)
  if (shapeSpec.fill?.color) {
    return { shape: type, fill: shapeSpec.fill.color, borderRadius }
  }
  const role = shapeSpec.fillColorRole || shapeSpec.fill?.colorRole || 'cardBg'
  const fill = colorMap[role] || palette?.[role] || LAYOUT_SURFACE.card
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
      adjusted.r2 -= 0.75
    }
    if (oreg.r2 === adjusted.r1 && shouldSplitSharedRow(otherRole, role)) {
      adjusted.r1 += 0.75
    }
  }

  if (adjusted.r2 < adjusted.r1) adjusted.r2 = adjusted.r1 + 0.5
  return adjusted
}

function insetForRole(role, slotId, reg = null, COLS = 12, ROWS = 10) {
  const id = String(slotId || '').toLowerCase()
  // Full-bleed / hero media: 0 on flush canvas edges; soft inset on open edges.
  if (/^background_image$|^hero_image$/i.test(String(slotId || ''))) {
    if (!reg) return 0
    const soft = 0.6
    return {
      left: reg.c1 <= 1 ? 0 : soft,
      right: reg.c2 >= COLS ? 0 : soft,
      top: reg.r1 <= 1 ? 0 : soft,
      bottom: reg.r2 >= ROWS ? 0 : soft,
    }
  }
  if (/^metric_card_\d+_bg$/i.test(id)) return 0.55
  // Text inside masonry/metric cards — generous pad so copy never hugs edges
  if (/^metric_(title|body)_\d+$|^stat_\d+_(value|label)$/i.test(id)) {
    return { left: 2.4, right: 2.4, top: 2.0, bottom: 2.0 }
  }
  if (role === 'background' || /_bg$|card_bg|panel_bg/.test(id)) return 0.15
  if (role === 'chart') return 1.2
  if (role === 'image') {
    // Standalone metric image: slight inset from neighbors, no nested card needed
    if (/^metric_image_\d+$/i.test(id)) {
      return { left: 0.35, right: 0.35, top: 0.35, bottom: 0.35 }
    }
    if (/^image_\d+$|^col_\d+_image$|^point_image$/i.test(id)) {
      return { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5 }
    }
    if (reg) {
      const soft = 0.5
      return {
        left: reg.c1 <= 1 ? 0 : soft,
        right: reg.c2 >= COLS ? 0 : soft,
        top: reg.r1 <= 1 ? 0 : soft,
        bottom: reg.r2 >= ROWS ? 0 : soft,
      }
    }
    return 0
  }
  if (role === 'stat') return { left: 1.6, right: 1.2, top: 1.2, bottom: 1.2 }
  if (role === 'caption' || role === 'stat_label') return { left: 1.2, right: 1.4, top: 1.2, bottom: 1.2 }
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

function textPaddingForRole(role, slot = null) {
  const slotPad = slot?.contentPadding
  if (slotPad != null) {
    if (typeof slotPad === 'number') return { x: slotPad, y: slotPad }
    return { x: slotPad.x ?? slotPad.horizontal ?? 8, y: slotPad.y ?? slotPad.vertical ?? 8 }
  }
  return { x: 8, y: 8 }
}

const COLUMN_STACK_GAP_PX = 14
const COLUMN_STACK_MIN_TITLE = 36
const COLUMN_STACK_MIN_BODY = 48

function columnStackKey(slotId) {
  const m = String(slotId || '').match(
    /^(CARD|COL|ROW|FEATURE)_(\d+)_(TITLE|SUBTITLE|BODY|TEXT)$/i
  )
  if (!m) return null
  return `${m[1].toUpperCase()}_${m[2]}`
}

function columnStackPartWeight(part, text) {
  const len = String(text || '').trim().length
  const p = String(part || '').toUpperCase()
  if (p === 'TITLE' || p === 'SUBTITLE') return Math.max(1, Math.min(4, Math.ceil(len / 18) || 1))
  return Math.max(2, Math.min(10, Math.ceil(len / 40) || 2))
}

/** Re-pack CARD/COL/ROW title+body stacks within their original column band. */
function packColumnTextStacks(elements) {
  if (!Array.isArray(elements) || !elements.length) return elements
  const groups = new Map()
  for (const el of elements) {
    if (!el || el.type !== 'text' || !el.placement) continue
    const key = columnStackKey(el.slotId)
    if (!key) continue
    const part =
      String(el.slotId)
        .match(/_(TITLE|SUBTITLE|BODY|TEXT)$/i)?.[1]
        ?.toUpperCase() || 'BODY'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ el, part })
  }

  for (const items of groups.values()) {
    if (items.length < 2) continue
    items.sort((a, b) => (a.el.placement?.y || 0) - (b.el.placement?.y || 0))
    const first = items[0].el.placement
    const last = items[items.length - 1].el.placement
    const bandTop = Number(first.y) || 0
    const bandBottom = (Number(last.y) || 0) + (Number(last.height) || 0)
    const bandH = Math.max(0, bandBottom - bandTop)
    if (bandH < 40) continue

    const gapsTotal = COLUMN_STACK_GAP_PX * (items.length - 1)
    const usable = Math.max(0, bandH - gapsTotal)
    const weights = items.map(({ el, part }) => columnStackPartWeight(part, el.content?.text))
    const weightSum = weights.reduce((a, b) => a + b, 0) || items.length
    let heights = items.map(({ part }, i) => {
      const minH =
        part === 'TITLE' || part === 'SUBTITLE' ? COLUMN_STACK_MIN_TITLE : COLUMN_STACK_MIN_BODY
      return Math.max(minH, Math.round((weights[i] / weightSum) * usable))
    })
    let sumH = heights.reduce((a, b) => a + b, 0)
    if (sumH > usable && sumH > 0) {
      const scale = usable / sumH
      heights = heights.map((h) => Math.max(28, Math.round(h * scale)))
      sumH = heights.reduce((a, b) => a + b, 0)
      heights[heights.length - 1] += Math.max(0, usable - sumH)
    }

    let y = bandTop
    items.forEach(({ el }, i) => {
      el.placement = {
        ...el.placement,
        y: Math.round(y),
        height: Math.max(28, heights[i]),
      }
      y += heights[i] + COLUMN_STACK_GAP_PX
    })
  }
  return elements
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

function fontSizeForTextSlotFromOptions(slot, placement, options = {}) {
  const role = slot?.role || 'body'
  const ty = slot?.typography || {}
  let size = ty.fontSize != null ? Number(ty.fontSize) : null
  if (size == null) {
    const fromScale = resolveTypeScaleFontSize(role, options.typeScale)
    if (fromScale != null) size = fromScale
  }
  if (size == null) {
    const canvasW = options.canvas?.width || 1920
    size = fontSizeForTextSlot(slot, placement, canvasW)
  }
  // Keep stats fully visible inside their card height
  if (role === 'stat') {
    const h = Number(placement?.height) || 0
    if (h > 0) {
      const maxByHeight = Math.max(22, Math.floor(h * 0.55))
      size = Math.min(size, maxByHeight)
    }
  }
  return size
}

function textAlignForRole(role) {
  if (role === 'caption') return 'center'
  return 'left'
}

function fontWeightForRole(role) {
  if (role === 'stat') return 900
  if (role === 'heading') return 800
  return 400
}

function lookupSlotValue(contentBySlotId, slotId) {
  if (!contentBySlotId || slotId == null) return undefined
  if (contentBySlotId[slotId] != null) return contentBySlotId[slotId]
  const key = String(slotId)
  if (contentBySlotId[key] != null) return contentBySlotId[key]
  const upper = key.toUpperCase()
  const lower = key.toLowerCase()
  if (contentBySlotId[upper] != null) return contentBySlotId[upper]
  if (contentBySlotId[lower] != null) return contentBySlotId[lower]
  const found = Object.keys(contentBySlotId).find((k) => k.toLowerCase() === lower)
  return found ? contentBySlotId[found] : undefined
}

function resolveSlotText(slot, contentBySlotId, schema, options = {}) {
  const slotId = slot?.id
  const role = String(slot?.role || '')
  const placeholder = slot?.placeholder_text != null ? String(slot.placeholder_text).trim() : ''
  const content = options.content && typeof options.content === 'object' ? options.content : null
  const hasSlideContent = Boolean(content && (content.title || content.body || content.summary || content.bullets))

  const mapped = lookupSlotValue(contentBySlotId, slotId)
  if (mapped != null) {
    const merged = String(mapped).trim()
    if (merged && !isCatalogPlaceholderText(merged) && !isLikelyBadMergedText(merged, slot, schema)) {
      return merged
    }
  }

  // Keep metric/stat/member catalog samples so empty authoring still looks designed.
  const memberSlot = /^MEMBER_\d+_(NAME|ROLE|EMAIL|BIO|BODY|DESC)$/i.test(String(slotId || ''))
  const keepPricingThreePlans = /pricing_three_plans_v1$/i.test(String(schema?.layout_id || ''))
    && !/featured|highlight/i.test(String(schema?.layout_id || ''))
  const keepPricingThreePlansFeatured = /pricing_three_plans_featured_v1$/i.test(String(schema?.layout_id || ''))
  const keepPricingThreeHighlight = /pricing_three_highlight_v1$/i.test(String(schema?.layout_id || ''))
    && !/split/i.test(String(schema?.layout_id || ''))
  const keepPricingThreeHighlightSplit = /pricing_three_highlight_split_v1$/i.test(String(schema?.layout_id || ''))
  const keepPricingFourPlans = /pricing_four_plans_v1$/i.test(String(schema?.layout_id || ''))
    && !/featured/i.test(String(schema?.layout_id || ''))
  const keepPricingFourPlansFeatured = /pricing_four_plans_featured_v1$/i.test(String(schema?.layout_id || ''))
  const keepPricingFourPara = /pricing_four_para_v1$/i.test(String(schema?.layout_id || ''))
    && !/cards/i.test(String(schema?.layout_id || ''))
  const keepPricingFourParaCards = /pricing_four_para_cards_v1$/i.test(String(schema?.layout_id || ''))
  if (
    placeholder &&
    (!hasSlideContent || role === 'stat' || role === 'stat_label' || memberSlot || keepPricingThreePlans || keepPricingThreePlansFeatured || keepPricingThreeHighlight || keepPricingThreeHighlightSplit || keepPricingFourPlans || keepPricingFourPlansFeatured || keepPricingFourPara || keepPricingFourParaCards)
  ) {
    return placeholder
  }
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
    if (value.length < 80 && layoutId.split(/\s+/).every((word) => word.length > 2 && value.includes(word))) return true
  }

  if (placeholder && value === placeholder) return true
  if (isCatalogPlaceholderText(text)) return true
  if (placeholder && (slot?.role === 'caption' || slot?.role === 'stat_label') && value.length > placeholder.length + 12) {
    return true
  }

  return false
}

function resolveChartContent(slot, schema, palette, contentBySlotId, slideContent = null) {
  const preview = schema?.preview || {}
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  const slotId = String(slot?.id || '').toUpperCase()
  const mode = resolvePreviewMode(schema)
  const barColor = palette?.primary || palette?.accent || LAYOUT_SURFACE.bar
  const saved = contentBySlotId?.[`${slot.id}__chart`]
  if (saved) {
    return normalizeChartContent(
      {
        chartType: saved.chartType || saved.data?.chartType || 'column-grouped',
        labels: saved.labels || saved.data?.labels || [],
        series: saved.data?.series || saved.series || [{ name: 'Series', values: saved.values || [] }],
        values: saved.values,
        colors: [barColor],
        premium: true,
        showGrid: true,
        showLabels: true,
      },
      palette
    )
  }

  const chartMatch = slotId.match(/^CHART_(\d+)$/)
  let chart = null
  if (chartMatch) {
    const idx = Number(chartMatch[1]) - 1
    if (Array.isArray(slideContent?.charts) && slideContent.charts[idx]) {
      chart = slideContent.charts[idx]
    } else if (idx === 0 && slideContent?.chart) {
      chart = slideContent.chart
    } else if (idx === 1 && slideContent?.chart2) {
      chart = slideContent.chart2
    }
  } else {
    chart = slideContent?.chart && typeof slideContent.chart === 'object' ? slideContent.chart : null
  }

  // Multi-chart layouts: never drop CHART_2/CHART_3 — use distinct sample data for empty slots
  if (chartMatch && !chart) {
    const idx = Number(chartMatch[1]) - 1
    chart = sampleChartDataset(idx, layoutId)
  }

  let chartType =
    chart?.type ||
    chart?.chartType ||
    slot?.chart_type ||
    slot?.chartType ||
    preview?.chartType ||
    preview?.chart_type

  if (!chartType) {
    if (/^DONUT/.test(slotId) || /pie|donut/.test(layoutId)) {
      chartType = 'donut'
    } else if (/area/.test(layoutId)) {
      chartType = 'area'
    } else if (
      /exponential|line_chart|line-chart/.test(layoutId) ||
      /^LINE_/.test(slotId)
    ) {
      chartType = 'line-points'
    } else if (/BAR_CHART|bar_chart|^BAR_/.test(slotId) || mode === 'grid_insights_chart') {
      chartType = 'column-grouped'
    } else if (/kpi|stat/.test(layoutId) && slotId.includes('KPI')) {
      chartType = 'kpi'
    } else {
      chartType = 'column-grouped'
    }
  }

  const labels =
    (Array.isArray(chart?.labels) ? chart.labels : null) ||
    preview?.chartLabels ||
    []
  const values =
    chart?.series?.[0]?.values ||
    chart?.data ||
    chart?.values ||
    preview?.chartValues ||
    []

  return normalizeChartContent(
    {
      chartType,
      labels: Array.isArray(labels) && labels.length ? labels : [],
      series: [{ name: saved?.data?.series?.[0]?.name || chart?.series?.[0]?.name || 'Series', values: (Array.isArray(values) ? values : []).map(Number).filter((v) => !Number.isNaN(v)) }],
      values,
      colors: [barColor],
      premium: true,
      showGrid: true,
      showLabels: true,
    },
    palette
  )
}

/** Distinct demo datasets so empty CHART_1/2/3 slots all render in authoring. */
function sampleChartDataset(index = 0, layoutId = '') {
  const i = Math.max(0, Number(index) || 0)
  if (/donut|pie/.test(String(layoutId || ''))) {
    const sets = [
      { labels: ['A', 'B', 'C', 'D'], values: [40, 25, 20, 15] },
      { labels: ['A', 'B', 'C', 'D'], values: [30, 30, 25, 15] },
      { labels: ['A', 'B', 'C', 'D'], values: [50, 20, 18, 12] },
    ]
    return sets[i % sets.length]
  }
  const sets = [
    { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [42, 58, 51, 67] },
    { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [28, 36, 44, 39] },
    { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [55, 48, 62, 71] },
  ]
  return sets[i % sets.length]
}

function buildTextElement(slot, placement, options) {
  const { contentBySlotId, schema } = options
  const role = slot.role || 'body'
  let text = resolveSlotText(slot, contentBySlotId, schema, options)
  const ty = slot.typography || {}
  const overlay = isOverlayLayout(schema)
  const pad = textPaddingForRole(role, slot)
  const fitted = fitTextToSlot(text, slot, placement, {
    ...options,
    contentPadding: pad,
  })
  text = fitted.text
  const fontSize = fitted.fontSize
  const verticalAlign = role === 'stat' || role === 'stat_label' ? 'center' : 'flex-start'
  const colorMap = colorRoleMapFromPalette(options.palette)
  let colorRole = ty.colorRole || null
  if (!colorRole) {
    if (role === 'stat') {
      colorRole = 'accent'
    } else if (overlay && (role === 'caption' || role === 'eyebrow' || role === 'subheading' || role === 'body')) {
      colorRole = 'textOnImageMuted'
    } else if (overlay) {
      colorRole = 'textOnImage'
    } else if (role === 'caption' || role === 'eyebrow' || role === 'stat_label' || role === 'body') {
      colorRole = 'muted'
    } else {
      colorRole = 'text'
    }
  }
  if (role === 'stat' && (!colorRole || colorRole === 'text' || colorRole === 'muted')) {
    colorRole = 'accent'
  }
  if (overlay && (colorRole === 'text' || colorRole === 'muted')) {
    colorRole =
      role === 'body' || role === 'caption' || role === 'subheading' ? 'textOnImageMuted' : 'textOnImage'
  }
  const color = colorMap[colorRole] || colorMap.text
  const align = ty.align || textAlignForRole(role)

  // Strip raw markdown so editor preview matches backend rich-run rendering.
  let runs = undefined
  if (typeof text === 'string' && (text.includes('**') || text.includes('__'))) {
    const textRole = overlay ? 'textOnImage' : 'text'
    const mutedRole = overlay ? 'textOnImageMuted' : 'muted'
    const lines = text.split('\n')
    runs = []
    lines.forEach((line, index) => {
      if (index > 0) runs.push({ text: '\n', colorRole: mutedRole })
      const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length)
      parts.forEach((part) => {
        const bold = part.match(/^\*\*(.+)\*\*$/)
        if (bold) runs.push({ text: bold[1], fontWeight: 700, colorRole: textRole })
        else runs.push({ text: part.replace(/__(.+?)__/g, '$1'), colorRole: mutedRole })
      })
    })
    text = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1')
  }

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
      fontFamily: resolveFontFamily(options, role),
      lineHeight: fitted.lineHeight || ty.lineHeight || (role === 'stat' ? 1.08 : role === 'heading' ? 1.18 : 1.42),
      letterSpacing: ty.letterSpacing != null ? `${ty.letterSpacing}em` : role === 'heading' ? '-0.02em' : role === 'caption' ? '0.01em' : undefined,
      wrap: 'pre-wrap',
      padding: pad.y,
      paddingX: pad.x,
      clipToSlot: slot.clipToSlot !== false,
      slotMaxHeight: placement.height,
      ...(runs ? { runs } : {}),
    },
  }
}

function isFullCanvasPlacement(placement, canvasW, canvasH) {
  const p = placement || {}
  return (
    (p.x ?? 0) <= 2 &&
    (p.y ?? 0) <= 2 &&
    (p.width ?? 0) >= canvasW * 0.95 &&
    (p.height ?? 0) >= canvasH * 0.95
  )
}

function applyThemeSlideBackground(elements, palette, canvasW, canvasH) {
  if (!palette?.bg) return elements
  const hasFullBg = elements.some((el) => {
    if (el.type !== 'shape') return false
    const role = String(el.role || '').toLowerCase()
    return (
      (role === 'design_bg' || role === 'background') &&
      isFullCanvasPlacement(el.placement, canvasW, canvasH)
    )
  })
  if (hasFullBg) return elements
  return [
    {
      id: `shp-theme-bg-${Math.random().toString(36).slice(2, 9)}`,
      type: 'shape',
      layer: 0,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        shape: 'rect',
        fill: { type: 'solid', color: palette.bg, colorRole: 'bg' },
      },
      role: 'design_bg',
    },
    ...elements,
  ]
}

function buildBackgroundElement(slot, placement, options = {}) {
  const resolved = resolveShapeFill(slot.shape, options.palette)
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

function buildDecorationElement(slot, placement, options = {}) {
  const id = String(slot.id || '').toLowerCase()
  if (slot.shape) {
    const resolved = resolveShapeFill(slot.shape, options.palette)
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

function resolveSplitImageEdgeFade(schema, slot, allSlots) {
  if (!slot?.region || !Array.isArray(allSlots)) return null
  const contentType = String(schema?.content_type || '').toLowerCase()
  const layoutId = String(schema?.layout_id || '').toLowerCase()
  if (contentType !== 'title' && !/^title_/.test(layoutId)) return null

  const imgReg = parseRegion(slot.region)
  if (!imgReg) return null
  const textRoles = new Set(['heading', 'subheading', 'body', 'caption', 'stat', 'stat_label', 'quote', 'eyebrow'])
  const textSlots = allSlots.filter((s) => s.id !== slot.id && textRoles.has(String(s.role || '').toLowerCase()))
  if (!textSlots.length) return null
  let textColSum = 0
  let textCount = 0
  for (const ts of textSlots) {
    const tr = parseRegion(ts.region)
    if (!tr) continue
    textColSum += (tr.c1 + tr.c2) / 2
    textCount += 1
  }
  if (!textCount) return null
  const textCenter = textColSum / textCount
  const imgCenter = (imgReg.c1 + imgReg.c2) / 2
  if (imgCenter > textCenter && imgReg.c1 >= 6) return { side: 'left', width: 0.3 }
  if (imgCenter < textCenter && imgReg.c2 <= 7) return { side: 'right', width: 0.3 }
  return null
}

function resolveImageUrl(slot, contentBySlotId, options = {}) {
  const slotId = slot?.id
  const mapped =
    lookupSlotValue(contentBySlotId, `${slotId}__url`) ||
    lookupSlotValue(contentBySlotId, `${slotId}_url`)
  if (mapped) return String(mapped)
  const content = options.content || {}
  const map = content.slotImageUrls
  if (map && typeof map === 'object') {
    if (map[slotId]) return map[slotId]
    if (map[String(slotId).toUpperCase()]) return map[String(slotId).toUpperCase()]
    if (map[String(slotId).toLowerCase()]) return map[String(slotId).toLowerCase()]
  }
  const imageSlots = (options.schema?.slots || []).filter((s) => {
    const r = String(s.role || '').toLowerCase()
    const sid = String(s.id || '').toUpperCase()
    return r === 'image' || sid === 'BACKGROUND_IMAGE' || sid === 'HERO_IMAGE'
  })
  const hero =
    content.imageRef?.url ||
    content.imageRef?.src ||
    content.imageUrl ||
    (Array.isArray(content.imageUrls) ? content.imageUrls[0] : null)
  if (hero && (imageSlots.length <= 1 || /^(HERO_IMAGE|BACKGROUND_IMAGE)$/i.test(String(slotId)))) {
    return hero
  }
  return null
}

function buildImageElement(slot, placement, contentBySlotId, options = {}) {
  const url = resolveImageUrl(slot, contentBySlotId, options)
  const presentation = resolveImagePresentation(slot)
  const edgeFade = resolveSplitImageEdgeFade(options.schema, slot, options.schema?.slots)
  const imageMask = slot.imageMask && typeof slot.imageMask === 'object' ? slot.imageMask : null
  const shaped = Boolean(imageMask && imageMask.type && imageMask.type !== 'edgeFade')
  const isFullBleedBg = String(slot.id || '').toUpperCase() === 'BACKGROUND_IMAGE'
  const borderRadius =
    edgeFade != null || shaped || isFullBleedBg
      ? 0
      : slot.borderRadius != null
        ? slot.borderRadius
        : presentation.borderRadius
  const shadow =
    edgeFade != null || shaped || isFullBleedBg
      ? undefined
      : slot.shadow ?? presentation.shadow
  const colorMap = colorRoleMapFromPalette(options.palette)
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'image',
    role: isFullBleedBg ? 'background' : 'image',
    layer: layerForSlot(slot),
    placement,
    content: {
      ...(url ? { url, src: url } : {}),
      fit: slot.fit || 'cover',
      alt: '',
      placeholderFill: themedImagePlaceholder(options.palette),
      skeletonColor: colorMap.surface || colorMap.cardBg,
      borderRadius,
      ...(shadow ? { boxShadow: shadow, shadow } : {}),
      ...(edgeFade ? { edgeFade } : {}),
      ...(imageMask && !edgeFade ? { imageMask } : {}),
    },
  }
}

function buildChartElement(slot, placement, options) {
  const { palette, contentBySlotId, schema } = options
  const content = resolveChartContent(slot, schema, palette, contentBySlotId, options.content)
  if (!content) return null
  return {
    id: `slot-${slot.id}`,
    slotId: slot.id,
    type: 'chart',
    role: 'chart',
    layer: layerForSlot(slot),
    placement,
    content,
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
  if (/^CARD_\d+_BG$/i.test(id)) return false
  if (/^TEXT_HALF_BG$/i.test(id)) return false
  if (/^STEP_\d+_CIRCLE$/i.test(id) || slot.shapeHint?.kind === 'stepCircle') return false
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

function parseHexColor(hex) {
  const raw = String(hex || '').trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
    a: 1,
  }
}

function parseRgbaColor(color) {
  const raw = String(color || '').trim()
  const m = raw.match(/^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)$/i)
  if (!m) return null
  return {
    r: Math.max(0, Math.min(255, Number(m[1]))),
    g: Math.max(0, Math.min(255, Number(m[2]))),
    b: Math.max(0, Math.min(255, Number(m[3]))),
    a: Math.max(0, Math.min(1, Number(m[4]))),
  }
}

function relativeLuminance({ r, g, b }) {
  const toLinear = (ch) => {
    const c = ch / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const rl = toLinear(r)
  const gl = toLinear(g)
  const bl = toLinear(b)
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatioHex(hexA, hexB) {
  const a = parseHexColor(hexA)
  const b = parseHexColor(hexB)
  if (!a || !b) return null
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

function compositeRgbaOnHex(fg, bgHex) {
  const bg = parseHexColor(bgHex)
  if (!bg) return null
  const a = fg?.a == null ? 1 : fg.a
  if (a >= 1) return `#${[fg.r, fg.g, fg.b]
    .map((n) => Math.round(n).toString(16).padStart(2, '0'))
    .join('')}`
  const r = a * fg.r + (1 - a) * bg.r
  const g = a * fg.g + (1 - a) * bg.g
  const b = a * fg.b + (1 - a) * bg.b
  return `#${[r, g, b]
    .map((n) => Math.round(n).toString(16).padStart(2, '0'))
    .join('')}`
}

function applyReadableTextContrastForPreview(elements, palette, schema) {
  const bgHex = palette?.bg || palette?.surface || null
  if (!bgHex) return elements

  const overlay = isOverlayLayout(schema)

  const bgLum = parseHexColor(bgHex)
  if (!bgLum) return elements

  return elements.map((el) => {
    if (el.type !== 'text' && el.type !== 'textbox') return el
    if (
      /^CYCLE_NUM_[1-4]$/i.test(String(el.slotId || '')) ||
      /^FUNNEL_NUM_[1-4]$/i.test(String(el.slotId || '')) ||
      /^PYRAMID_NUM_[1-5]$/i.test(String(el.slotId || '')) ||
      /^SWOT_LETTER_[1-4]$/i.test(String(el.slotId || '')) ||
      /^SWOT_HUB_(TITLE|SUB)$/i.test(String(el.slotId || '')) ||
      /^funnel_[1-5]_title$/i.test(String(el.slotId || '')) ||
      /^Q[1-4]_(TITLE|BODY)$/i.test(String(el.slotId || '')) ||
      /^MATRIX_(CENTER|X_LABEL|Y_LABEL)$/i.test(String(el.slotId || '')) ||
      /^MEMBER_\d+_(NAME|ROLE|BIO|BODY|DESC|EMAIL)$/i.test(String(el.slotId || '')) ||
      (isPricingFourPlansLayout(schema?.layout_id) && /^PLAN_\d+_/i.test(String(el.slotId || ''))) ||
      (isPricingFourPlansFeaturedLayout(schema?.layout_id) && /^PLAN_\d+_/i.test(String(el.slotId || ''))) ||
      (isPricingFourParaLayout(schema?.layout_id) && (/^PLAN_\d+_/i.test(String(el.slotId || '')) || String(el.slotId || '').toUpperCase() === 'BODY')) ||
      (isPricingFourParaCardsLayout(schema?.layout_id) && (/^PLAN_\d+_/i.test(String(el.slotId || '')) || String(el.slotId || '').toUpperCase() === 'BODY'))
    ) return el
    const colorRole = String(el.content?.colorRole || '').toLowerCase()
    const rawColor = el.content?.color
    if (!rawColor) return el

    // If we are explicitly in an overlay layout and the renderer used text-on-image tokens,
    // let the existing logic + overlay scrim handle readability.
    if (
      overlay &&
      (colorRole === 'textonimage' || colorRole === 'textonimagemuted' || colorRole.includes('textonimage'))
    ) {
      return el
    }

    const hex = parseHexColor(rawColor)
    const rgba = parseRgbaColor(rawColor)
    let fgHex = hex ? rawColor : null
    if (!fgHex && rgba) {
      const composite = compositeRgbaOnHex(rgba, bgHex)
      if (composite) fgHex = composite
    }
    if (!fgHex) return el

    const ratio = contrastRatioHex(fgHex, bgHex)
    if (ratio != null && ratio >= 4.5) return el

    // Repair: choose between token "text" and "muted" based on contrast against background.
    const candText = palette?.text || COLOR_ROLE_MAP.text
    const candMuted = palette?.muted || COLOR_ROLE_MAP.textMuted
    const candRoles = [
      { role: 'text', hex: candText },
      { role: 'muted', hex: candMuted },
    ]
    const scored = candRoles
      .map((c) => ({ ...c, ratio: contrastRatioHex(c.hex, bgHex) }))
      .filter((c) => c.ratio != null)
      .sort((a, b) => b.ratio - a.ratio)

    if (!scored.length) return el
    const best = scored[0]
    const bestRole = best.role
    const bestColor = best.hex

    return {
      ...el,
      content: {
        ...(el.content || {}),
        colorRole: bestRole,
        color: bestColor,
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
  const canvas = { width: canvasW, height: canvasH }
  const geometryMap = compileLayoutGeometry(schema, canvas)
  const contentBySlotId = mergeContentBySlotId(
    buildContentBySlotIdFromSlideContent(options.content, schema),
    options.contentBySlotId || {}
  )

  const palette = options.palette || LAYOUT_SURFACE
  const colorMap = colorRoleMapFromPalette(options.palette)

  const elements = slots.flatMap((slot) => {
    if (isDeviceFrameSlot(slot)) return []
    if (isAiOnlyShapeSlot(slot)) return []

    const placement = getSlotPlacement(geometryMap, slot.id, slot)
    if (!placement) return []
    const role = slot.role || 'body'
    const compileOptions = { ...options, schema, contentBySlotId }
    const slotIdUpper = String(slot.id || '').toUpperCase()

    // BACKGROUND_IMAGE / HERO_IMAGE must compile as images (not shapes) so URLs bind.
    if (slotIdUpper === 'BACKGROUND_IMAGE' || slotIdUpper === 'HERO_IMAGE') {
      return [buildImageElement(slot, placement, contentBySlotId, compileOptions)]
    }

    if (/^STEP_\d+_CIRCLE$/i.test(String(slot.id || '')) || slot.shapeHint?.kind === 'stepCircle') {
      const size = Math.min(placement.width || 64, placement.height || 64, 64)
      const cx = (placement.x ?? 0) + (placement.width || size) / 2
      const cy = (placement.y ?? 0) + (placement.height || size) / 2
      const stepNum = String(slot.id).match(/(\d+)/)?.[1] || ''
      const accent = colorMap.accent || colorMap.primary || '#6366F1'
      const text = colorMap.text || '#0F172A'
      const out = [
        {
          id: `shp-step-${Math.random().toString(36).slice(2, 9)}`,
          type: 'shape',
          slotId: slot.id,
          layer: layerForSlot(slot),
          placement: {
            x: Math.round(cx - size / 2),
            y: Math.round(cy - size / 2),
            width: size,
            height: size,
            rotation: 0,
            opacity: 1,
          },
          content: { shape: 'ellipse', fill: accent, layoutSurface: true },
          role: 'decoration',
        },
      ]
      if (stepNum) {
        out.push({
          id: `txt-step-num-${Math.random().toString(36).slice(2, 9)}`,
          type: 'text',
          slotId: `${slot.id}_NUM`,
          layer: layerForSlot(slot) + 1,
          placement: {
            x: Math.round(cx - size / 2),
            y: Math.round(cy + size / 2 + 4),
            width: size,
            height: 28,
            rotation: 0,
            opacity: 1,
          },
          content: {
            text: String(stepNum),
            align: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: text,
          },
          role: 'caption',
        })
      }
      return out
    }

    if (role === 'background' || /^METRIC_CARD_\d+_BG$|^TEXT_HALF_BG$|^SURFACE_|_bg$|_card_bg|_panel_bg/i.test(String(slot.id || ''))) {
      return [buildBackgroundElement(slot, placement, compileOptions)]
    }
    if (role === 'decoration') {
      if (slot.shape) return [buildBackgroundElement(slot, placement, compileOptions)]
      return [buildDecorationElement(slot, placement, compileOptions)]
    }
    if (role === 'image') {
      const frameSlot = findDeviceFrameSlot(slots, slot.id)
      if (frameSlot) {
        const imageEl = buildImageElement(slot, placement, contentBySlotId, compileOptions)
        const framePlacement =
          getSlotPlacement(geometryMap, frameSlot.id, frameSlot) ||
          getSlotPlacement(geometryMap, frameSlot.id)
        if (!framePlacement) return [imageEl]
        return buildDeviceFrameCanvasElements({
          frameSlot,
          imageSlot: slot,
          framePlacement,
          imageContent: imageEl.content,
          layerBase: layerForSlot(frameSlot),
          themeTokens: compileOptions?.themeTokens || compileOptions?.theme || null,
        })
      }
      return [buildImageElement(slot, placement, contentBySlotId, compileOptions)]
    }
    if (role === 'chart') {
      const chartEl = buildChartElement(slot, placement, compileOptions)
      return chartEl ? [chartEl] : []
    }
    if (role === 'table') {
      return [buildTableElement(slot, placement, contentBySlotId, options.content)]
    }
    if (TEXT_ROLES.has(role)) {
      return [buildTextElement(slot, placement, compileOptions)]
    }
    return [buildTextElement(slot, placement, compileOptions)]
  })

  const themedPalette = colorMap.textOnImage
    ? { ...palette, ...colorMap }
    : palette
  let result = applyTextOverImageContrast(
    elements.sort((a, b) => (a.layer || 0) - (b.layer || 0)),
    themedPalette
  )
  result = finalizeTimelineShapes(result, schema, colorMap, { width: canvasW, height: canvasH })
  result = applyThemeSlideBackground(result, themedPalette, canvasW, canvasH)
  result = applyReadableTextContrastForPreview(result, colorRoleMapFromPalette(options.palette), schema)
  if (options.packColumnStacks === true) {
    result = packColumnTextStacks(result)
  }
  const hasLoadedOverlayImage = result.some((e) => {
    if (e.type !== 'image' || !e.content?.url) return false
    const slotId = String(e.slotId || '').toUpperCase()
    const role = String(e.role || '').toLowerCase()
    if (slotId === 'BACKGROUND_IMAGE' || role === 'background') return true
    const p = e.placement || {}
    return (p.width || 0) * (p.height || 0) >= canvasW * canvasH * 0.7
  })
  if (
    isOverlayLayout(schema) &&
    hasLoadedOverlayImage &&
    !result.some((e) => e.slotId === 'OVERLAY_SCRIM' || e.role === 'design_overlay')
  ) {
    result = [
      {
        id: `shp-overlay-${Math.random().toString(36).slice(2, 9)}`,
        type: 'shape',
        slotId: 'OVERLAY_SCRIM',
        layer: 1,
        placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
        content: {
          shape: 'rect',
          fill: themedPalette.overlayScrim || 'rgba(0,0,0,0.5)',
          opacity: 0.5,
        },
        role: 'design_overlay',
      },
      ...result,
    ]
  }
  if (options.debugGeometry) {
    const snapshot = geometrySnapshot(schema, geometryMap, canvas)
    const validation = validateLayoutGeometry(schema, result, geometryMap, canvas)
    const drift = snapshot.slots.filter(
      (s) =>
        Math.abs(s.difference.x) > 1 ||
        Math.abs(s.difference.y) > 1 ||
        Math.abs(s.difference.width) > 1 ||
        Math.abs(s.difference.height) > 1
    )
    if (drift.length || !validation.pass) {
      console.debug('[layout-geometry]', schema?.layout_id, { snapshot, validation })
    }
  }

  return result
}

export { geometrySnapshot, validateLayoutGeometry, compileLayoutGeometry }

export function isTextLayoutRole(role) {
  return TEXT_ROLES.has(role)
}

export function hasOverlappingTextPlacements(elements = []) {
  const textEls = (elements || []).filter((el) => {
    if (el.type !== 'text') return false
    const opacity = el.placement?.opacity ?? el.content?.opacity ?? 1
    if (opacity <= 0) return false
    const x = el.placement?.x ?? 0
    const y = el.placement?.y ?? 0
    if (x < -40 || y < -40) return false
    return true
  })
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
