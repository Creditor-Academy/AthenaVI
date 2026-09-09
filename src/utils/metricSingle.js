/**
 * Metric single — Single large metric with circular progress ring.
 * Layout id: metric_single_v1.
 */

export const MS_GEOM = {
  viewW: 1000,
  viewH: 560,
  
  // Icon at top left
  iconX: 50,
  iconY: 50,
  iconSize: 48,
  iconBgSize: 70,
  
  // Heading (top center-left)
  headingX: 140,
  headingY: 50,
  headingW: 450,
  headingH: 40,
  
  // Subheading below heading
  subheadingX: 140,
  subheadingY: 95,
  subheadingW: 450,
  subheadingH: 24,
  
  // Trend indicator (top right)
  trendX: 850,
  trendY: 50,
  trendW: 100,
  trendH: 30,
  trendArrowX: 855,
  trendArrowY: 58,
  
  // Center circle with metric
  circleX: 380,
  circleY: 180,
  circleDiameter: 240,
  circleStrokeWidth: 20,
  
  // Metric value inside circle
  metricX: 380,
  metricY: 265,
  metricW: 240,
  metricH: 80,
  
  // Label below circle
  labelX: 300,
  labelY: 445,
  labelW: 400,
  labelH: 32,
  
  // Decorative circles (bottom left)
  decoCircle1X: 80,
  decoCircle1Y: 450,
  decoCircle1R: 80,
  decoCircle2X: 100,
  decoCircle2Y: 480,
  decoCircle2R: 50,
}

export const MS_COLORS = {
  primary: '#3B82F6',  // Blue
  circle: '#3B82F6',
  circleTrack: '#DBEAFE',
  trend: '#10B981',
  iconBg: '#EFF6FF',
}

export const MS_DEFAULTS = {
  HEADING: 'Performance Overview',
  SUBHEADING: 'Key customer metric at a glance.',
  METRIC_VALUE: '98%',
  LABEL: 'Customer satisfaction',
  TREND: '+12%',
}

export const isMetricSingleLayout = (layoutId) => {
  return /metric_single_v1$/i.test(String(layoutId || ''))
}

export const isMetricSingleTextSlot = (slotId) => {
  const sid = String(slotId || '')
  return sid === 'HEADING'
    || sid === 'SUBHEADING'
    || sid === 'METRIC_VALUE'
    || sid === 'LABEL'
    || sid === 'TREND'
}

const iconBgSvg = () => {
  const g = MS_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.iconBgSize} ${g.iconBgSize}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="${g.iconBgSize}" height="${g.iconBgSize}" fill="${MS_COLORS.iconBg}" rx="14"/>
  </svg>`
}

const iconSvg = () => {
  const size = MS_GEOM.iconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <circle cx="${size/2}" cy="18" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M${size/2 - 10} 34 Q${size/2} 30 ${size/2 + 10} 34 L${size/2 + 10} 44 L${size/2 - 10} 44 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
  </svg>`
}

const circleSvg = () => {
  const g = MS_GEOM
  const r = g.circleDiameter / 2
  const cx = r
  const cy = r
  const viewBox = g.circleDiameter
  
  // Circle track (background) - full circle
  const circumference = 2 * Math.PI * (r - g.circleStrokeWidth / 2)
  
  // Progress circle - 75% complete (270 degrees)
  const progressPercent = 0.75
  const strokeDashoffset = circumference * (1 - progressPercent)
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${MS_COLORS.circle};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${MS_COLORS.circle};stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <!-- Background track -->
    <circle 
      cx="${cx}" 
      cy="${cy}" 
      r="${r - g.circleStrokeWidth / 2}" 
      fill="none" 
      stroke="${MS_COLORS.circleTrack}" 
      stroke-width="${g.circleStrokeWidth}"
    />
    <!-- Progress arc -->
    <circle 
      cx="${cx}" 
      cy="${cy}" 
      r="${r - g.circleStrokeWidth / 2}" 
      fill="none" 
      stroke="url(#circleGradient)" 
      stroke-width="${g.circleStrokeWidth}"
      stroke-linecap="round"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${strokeDashoffset}"
      transform="rotate(-90 ${cx} ${cy})"
    />
  </svg>`
}

const trendArrowSvg = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14">
    <path d="M3 10 L7 4 L11 10" fill="none" stroke="${MS_COLORS.trend}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const decoCirclesSvg = () => {
  const g = MS_GEOM
  const w = 200
  const h = 120
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">
    <circle cx="30" cy="60" r="80" fill="${MS_COLORS.circleTrack}" opacity="0.4"/>
    <circle cx="50" cy="90" r="50" fill="${MS_COLORS.circleTrack}" opacity="0.6"/>
  </svg>`
}

const hexLum = (hex) => {
  const s = String(hex || '').replace('#', '')
  if (s.length !== 6) return 1
  const r = parseInt(s.slice(0, 2), 16) / 255
  const g = parseInt(s.slice(2, 4), 16) / 255
  const b = parseInt(s.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const headingInk = (palette = {}) => {
  const bg = palette.bg || palette.background || palette.slideBg
    || (palette.colors && (palette.colors.bg || palette.colors.background)) || '#ffffff'
  return hexLum(bg) < 0.45 ? '#F3F4F6' : '#111827'
}

export const metricSingleChromeSpecs = () => {
  const g = MS_GEOM
  const specs = []
  
  // Icon background
  specs.push({
    slotId: 'MS_ICON_BG',
    x: g.iconX,
    y: g.iconY,
    w: g.iconBgSize,
    h: g.iconBgSize,
    color: MS_COLORS.iconBg,
    layer: 3,
    kind: 'iconBg',
  })
  
  // Icon
  specs.push({
    slotId: 'MS_ICON',
    x: g.iconX + (g.iconBgSize - g.iconSize) / 2,
    y: g.iconY + (g.iconBgSize - g.iconSize) / 2,
    w: g.iconSize,
    h: g.iconSize,
    color: MS_COLORS.primary,
    layer: 10,
    kind: 'icon',
  })
  
  // Circle with progress
  specs.push({
    slotId: 'MS_CIRCLE',
    x: g.circleX,
    y: g.circleY,
    w: g.circleDiameter,
    h: g.circleDiameter,
    color: MS_COLORS.circle,
    layer: 5,
    kind: 'circle',
  })
  
  // Trend arrow
  specs.push({
    slotId: 'MS_TREND_ARROW',
    x: g.trendArrowX,
    y: g.trendArrowY,
    w: 14,
    h: 14,
    color: MS_COLORS.trend,
    layer: 10,
    kind: 'trendArrow',
  })
  
  // Decorative circles
  specs.push({
    slotId: 'MS_DECO_CIRCLES',
    x: 0,
    y: 440,
    w: 200,
    h: 120,
    color: MS_COLORS.circleTrack,
    layer: 2,
    kind: 'decoCircles',
  })
  
  return specs
}

export const metricSingleOverlay = (gx, gy, gw, gh) => {
  const g = MS_GEOM
  const sx = gw / g.viewW
  const sy = gh / g.viewH
  const box = (x, y, w, h) => ({
    x: Math.round(gx + x * sx),
    y: Math.round(gy + y * sy),
    width: Math.max(12, Math.round(w * sx)),
    height: Math.max(10, Math.round(h * sy)),
  })
  
  return {
    heading: box(g.headingX, g.headingY, g.headingW, g.headingH),
    subheading: box(g.subheadingX, g.subheadingY, g.subheadingW, g.subheadingH),
    metricValue: box(g.metricX, g.metricY, g.metricW, g.metricH),
    label: box(g.labelX, g.labelY, g.labelW, g.labelH),
    trend: box(g.trendX + 20, g.trendY, g.trendW - 20, g.trendH),
  }
}

export const specToMetricSingleContent = (spec) => {
  if (spec.kind === 'iconBg') return { svg: iconBgSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'icon') return { svg: iconSvg(), colorMode: 'recolor', fill: spec.color }
  if (spec.kind === 'circle') return { svg: circleSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'trendArrow') return { svg: trendArrowSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'decoCircles') return { svg: decoCirclesSvg(), colorMode: 'fixed', fill: spec.color }
  return null
}

const plainTextFromContent = (content = {}) => {
  if (typeof content.text === 'string' && content.text.trim()) return content.text
  if (Array.isArray(content.runs)) {
    const joined = content.runs.map((r) => r.text || '').join('')
    if (joined.trim()) return joined
  }
  return ''
}

const filledContent = (el, slotId, style) => {
  const sid = String(slotId || '')
  const existing = plainTextFromContent(el?.content)
  const text = existing && existing.toLowerCase() !== 'double-click to edit'
    ? existing
    : (MS_DEFAULTS[sid] || existing)
  return {
    ...(el?.content || {}),
    ...style,
    text,
    runs: null,
    listType: null,
    letterSpacing: style.letterSpacing !== undefined ? style.letterSpacing : '0',
    padding: 0,
    paddingX: 0,
    stroke: undefined,
    strokeWidth: 0,
  }
}

const newId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export const layoutMetricSingle = (elements, schema, palette = {}, canvas = {}) => {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const sx = canvasW / MS_GEOM.viewW
  const sy = canvasH / MS_GEOM.viewH
  const overlay = metricSingleOverlay(0, 0, canvasW, canvasH)
  const chromeRe = /^MS_/i
  
  const prevBySlot = new Map(
    elements.filter((el) => chromeRe.test(String(el.slotId || ''))).map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  
  const filtered = elements.filter((el) => !chromeRe.test(String(el.slotId || '')) && isMetricSingleTextSlot(el.slotId))
  const bySlot = new Map(filtered.map((el) => [String(el.slotId || ''), el]))

  const placeText = (slotId, box, style, role) => {
    const prev = bySlot.get(slotId) || bySlot.get(slotId.toUpperCase())
    return {
      id: prev?.id || newId('txt-ms'),
      type: 'text',
      slotId,
      role: prev?.role || role || 'body',
      layer: 12,
      placement: { x: box.x, y: box.y, width: box.width, height: box.height, rotation: 0, opacity: 1 },
      content: filledContent(prev, slotId, style),
    }
  }

  const next = [
    placeText('HEADING', overlay.heading, {
      align: 'left', verticalAlign: 'center', fontSize: 36, fontWeight: 800, color: headingInk(palette), clipToSlot: true, lineHeight: 1.1,
    }, 'heading'),
    placeText('SUBHEADING', overlay.subheading, {
      align: 'left', verticalAlign: 'center', fontSize: 14, fontWeight: 400, color: '#94A3B8', clipToSlot: true, lineHeight: 1.4,
    }, 'subheading'),
    placeText('METRIC_VALUE', overlay.metricValue, {
      align: 'center', verticalAlign: 'center', fontSize: 72, fontWeight: 900, color: MS_COLORS.primary, clipToSlot: true, lineHeight: 1,
    }, 'heading'),
    placeText('LABEL', overlay.label, {
      align: 'center', verticalAlign: 'center', fontSize: 20, fontWeight: 600, color: '#64748B', clipToSlot: true, lineHeight: 1.3,
    }, 'caption'),
    placeText('TREND', overlay.trend, {
      align: 'left', verticalAlign: 'center', fontSize: 18, fontWeight: 700, color: MS_COLORS.trend, clipToSlot: true, lineHeight: 1,
    }, 'caption'),
  ]

  const chrome = metricSingleChromeSpecs().map((spec) => {
    const prev = prevBySlot.get(spec.slotId.toUpperCase())
    const graphic = specToMetricSingleContent(spec)
    if (!graphic) return null
    return {
      id: prev?.id || newId('shp-ms'),
      type: 'graphic',
      layer: spec.layer || 4,
      placement: {
        x: Math.round(spec.x * sx),
        y: Math.round(spec.y * sy),
        width: Math.max(4, Math.round(spec.w * sx)),
        height: Math.max(4, Math.round(spec.h * sy)),
        rotation: 0,
        opacity: 1,
      },
      content: { svg: graphic.svg, colorMode: graphic.colorMode, fill: graphic.fill, alt: spec.slotId },
      role: 'decoration',
      slotId: spec.slotId,
    }
  }).filter(Boolean)
  
  return [...chrome, ...next]
}
