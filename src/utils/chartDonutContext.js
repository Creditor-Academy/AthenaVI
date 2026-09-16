/**
 * Chart donut context — Donut chart on left + context panel on right.
 * Layout id: chart_donut_context_v1.
 */

export const CDC_GEOM = {
  viewW: 1000,
  viewH: 560,
  
  // Badge at top left
  badgeX: 50,
  badgeY: 48,
  badgeW: 156,
  badgeH: 28,
  badgeIconSize: 14,
  
  // Donut chart area (left side)
  donutCenterX: 215,
  donutCenterY: 310,
  donutOuterRadius: 150,
  donutInnerRadius: 95,
  
  // Center text in donut (well balanced)
  centerTextY: 288,
  centerLabelY: 342,
  
  // Right side - Context panel (extra wide: 520px, spacious)
  panelX: 440,
  panelY: 48,
  panelW: 520,
  panelH: 488,
  
  // Inside panel - spacious & airy
  panelHeadingX: 36,
  panelHeadingY: 36,
  panelSubheadingX: 36,
  panelSubheadingY: 84,
  panelSubheadingW: 448,
  panelSubheadingH: 65,
  
  // Metric breakdowns in panel (4 metrics) - wide & airy
  metricStartY: 172,
  metricGap: 72,
  metricDotX: 36,
  metricDotSize: 12,
  metricLabelX: 58,
  metricDescX: 58,
  metricDescY: 22,
  metricValueX: 468,
  metricDescH: 42,
}

// Donut segments data (4 segments)
export const CDC_SEGMENTS = [
  { id: 'A', value: 32, startAngle: 0, endAngle: 115.2, color: '#3B82F6', lightColor: '#60A5FA', darkColor: '#1D4ED8', label: 'Metric A' },
  { id: 'B', value: 24, startAngle: 115.2, endAngle: 201.6, color: '#8B5CF6', lightColor: '#A78BFA', darkColor: '#6D28D9', label: 'Metric B' },
  { id: 'C', value: 18, startAngle: 201.6, endAngle: 266.4, color: '#10B981', lightColor: '#34D399', darkColor: '#047857', label: 'Metric C' },
  { id: 'D', value: 26, startAngle: 266.4, endAngle: 360, color: '#64748B', lightColor: '#94A3B8', darkColor: '#334155', label: 'Metric D' },
]

export const CDC_COLORS = {
  metricA: '#3B82F6',  // Blue
  metricB: '#8B5CF6',  // Purple
  metricC: '#10B981',  // Green
  metricD: '#64748B',  // Gray
}

export const CDC_DEFAULTS = {
  BADGE: 'MARKET SHARE',
  CENTER_VALUE: '100%',
  CENTER_LABEL: 'TOTAL',
  PANEL_HEADING: 'Market share',
  PANEL_SUBHEADING: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
  METRIC_A_LABEL: 'Metric A',
  METRIC_A_VALUE: '32%',
  METRIC_A_DESC: 'Represents the largest share of the market, showing strong performance.',
  METRIC_B_LABEL: 'Metric B',
  METRIC_B_VALUE: '24%',
  METRIC_B_DESC: 'Maintains a steady presence with consistent growth over time.',
  METRIC_C_LABEL: 'Metric C',
  METRIC_C_VALUE: '18%',
  METRIC_C_DESC: 'Shows gradual progress and increasing contribution.',
  METRIC_D_LABEL: 'Metric D',
  METRIC_D_VALUE: '26%',
  METRIC_D_DESC: 'Remains a significant part of the market with stable performance.',
}

export const isChartDonutContextLayout = (layoutId) => {
  return /chart_donut_context(_v1|_right_v1)?$/i.test(String(layoutId || ''))
}

export const isChartDonutContextRightLayout = (layoutId) => {
  return /chart_donut_context_right_v1$/i.test(String(layoutId || ''))
}

export const isChartDonutContextTextSlot = (slotId) => {
  const sid = String(slotId || '')
  return sid === 'BADGE'
    || sid === 'CENTER_VALUE'
    || sid === 'CENTER_LABEL'
    || sid === 'PANEL_HEADING'
    || sid === 'PANEL_SUBHEADING'
    || sid === 'METRIC_A_LABEL'
    || sid === 'METRIC_A_VALUE'
    || sid === 'METRIC_A_DESC'
    || sid === 'METRIC_B_LABEL'
    || sid === 'METRIC_B_VALUE'
    || sid === 'METRIC_B_DESC'
    || sid === 'METRIC_C_LABEL'
    || sid === 'METRIC_C_VALUE'
    || sid === 'METRIC_C_DESC'
    || sid === 'METRIC_D_LABEL'
    || sid === 'METRIC_D_VALUE'
    || sid === 'METRIC_D_DESC'
}

const panelBgSvg = () => {
  const g = CDC_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.panelW} ${g.panelH}" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="cdcPanelShadow" x="-10%" y="-5%" width="120%" height="115%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="rgba(15, 23, 42, 0.08)"/>
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(15, 23, 42, 0.04)"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="${g.panelW}" height="${g.panelH}" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2" rx="20" filter="url(#cdcPanelShadow)"/>
  </svg>`
}

const badgeSvg = () => {
  const g = CDC_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.badgeW} ${g.badgeH}" width="100%" height="100%" preserveAspectRatio="none">
    <rect x="0" y="0" width="${g.badgeW}" height="${g.badgeH}" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.25)" stroke-width="1" rx="8"/>
  </svg>`
}

const badgeIconSvg = () => {
  const size = CDC_GEOM.badgeIconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="rgba(59, 130, 246, 0.2)"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="3" fill="#2563EB"/>
  </svg>`
}

const centerPlateSvg = (size) => {
  const r = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">
    <defs>
      <filter id="cdcCenterPlateShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(15, 23, 42, 0.08)"/>
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(15, 23, 42, 0.04)"/>
      </filter>
    </defs>
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cdcCenterPlateShadow)"/>
    <circle cx="${r}" cy="${r}" r="${r - 12}" fill="none" stroke="#F1F5F9" stroke-width="2"/>
  </svg>`
}

const donutSegmentPath = (centerX, centerY, innerR, outerR, startAngle, endAngle) => {
  const toRad = (deg) => (deg - 90) * Math.PI / 180
  const x1 = centerX + outerR * Math.cos(toRad(startAngle))
  const y1 = centerY + outerR * Math.sin(toRad(startAngle))
  const x2 = centerX + outerR * Math.cos(toRad(endAngle))
  const y2 = centerY + outerR * Math.sin(toRad(endAngle))
  const x3 = centerX + innerR * Math.cos(toRad(endAngle))
  const y3 = centerY + innerR * Math.sin(toRad(endAngle))
  const x4 = centerX + innerR * Math.cos(toRad(startAngle))
  const y4 = centerY + innerR * Math.sin(toRad(startAngle))
  
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`
}

const donutSegmentSvg = (segment, width, height) => {
  const g = CDC_GEOM
  const centerX = g.donutOuterRadius
  const centerY = g.donutOuterRadius
  const viewBoxSize = g.donutOuterRadius * 2
  const innerR = g.donutInnerRadius
  const outerR = g.donutOuterRadius
  const midR = (innerR + outerR) / 2
  const toRad = (deg) => (deg - 90) * Math.PI / 180

  const gapDeg = 2.4
  const span = segment.endAngle - segment.startAngle
  const actualGap = span > 10 ? gapDeg : Math.max(0.5, span * 0.1)
  const sAngle = segment.startAngle + actualGap / 2
  const eAngle = segment.endAngle - actualGap / 2
  const midAngle = (segment.startAngle + segment.endAngle) / 2

  const labelX = centerX + midR * Math.cos(toRad(midAngle))
  const labelY = centerY + midR * Math.sin(toRad(midAngle))

  const light = segment.lightColor || '#60A5FA'
  const base = segment.color || '#3B82F6'
  const dark = segment.darkColor || '#1D4ED8'

  // 3D base depth (shifted down 5px)
  const basePath = donutSegmentPath(centerX, centerY + 5, innerR, outerR, sAngle, eAngle)
  // Top face
  const topPath = donutSegmentPath(centerX, centerY, innerR, outerR, sAngle, eAngle)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="cdc_grad_${segment.id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="100%" stop-color="${base}"/>
      </linearGradient>
      <filter id="cdc_text_shadow_${segment.id}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0, 0, 0, 0.45)"/>
      </filter>
    </defs>
    <!-- 3D bottom base extrusion -->
    <path d="${basePath}" fill="${dark}" opacity="0.95"/>
    <!-- Top Face with rich gradient & crisp rim stroke -->
    <path d="${topPath}" fill="url(#cdc_grad_${segment.id})" stroke="#FFFFFF" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- Bold percentage label right on the slice face -->
    <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" fill="#FFFFFF" font-size="15.5" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" dominant-baseline="central" filter="url(#cdc_text_shadow_${segment.id})">${segment.value}%</text>
  </svg>`
}

const metricDotSvg = (color) => {
  const size = CDC_GEOM.metricDotSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="currentColor"/>
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

export const chartDonutContextChromeSpecs = (segments = CDC_SEGMENTS) => {
  const g = CDC_GEOM
  const specs = []
  
  // Badge background
  specs.push({
    slotId: 'CDC_BADGE_BG',
    x: g.badgeX,
    y: g.badgeY,
    w: g.badgeW,
    h: g.badgeH,
    color: '#DBEAFE',
    layer: 3,
    kind: 'badge',
  })
  
  // Badge icon
  specs.push({
    slotId: 'CDC_BADGE_ICON',
    x: g.badgeX + 10,
    y: g.badgeY + 4,
    w: g.badgeIconSize,
    h: g.badgeIconSize,
    color: '#3B82F6',
    layer: 10,
    kind: 'badgeIcon',
  })
  
  // Panel background
  specs.push({
    slotId: 'CDC_PANEL_BG',
    x: g.panelX,
    y: g.panelY,
    w: g.panelW,
    h: g.panelH,
    color: '#F0F9FF',
    layer: 3,
    kind: 'panelBg',
  })
  
  // Donut segments (4 segments) - constrained to donut area only
  segments.forEach((segment) => {
    const donutLeft = g.donutCenterX - g.donutOuterRadius
    const donutTop = g.donutCenterY - g.donutOuterRadius
    const donutSize = g.donutOuterRadius * 2
    
    specs.push({
      slotId: `CDC_SEGMENT_${segment.id}`,
      x: donutLeft,
      y: donutTop,
      w: donutSize,
      h: donutSize,
      color: segment.color,
      layer: 5,
      kind: 'donutSegment',
      segmentData: segment,
    })
  })

  // Center gauge plate disc inside the donut hole
  const plateRadius = g.donutInnerRadius - 6
  specs.push({
    slotId: 'CDC_CENTER_PLATE',
    x: g.donutCenterX - plateRadius,
    y: g.donutCenterY - plateRadius,
    w: plateRadius * 2,
    h: plateRadius * 2,
    color: '#FFFFFF',
    layer: 6,
    kind: 'centerPlate',
  })
  
  // Metric dots in panel (4 metrics)
  segments.forEach((segment, i) => {
    specs.push({
      slotId: `CDC_METRIC_DOT_${segment.id}`,
      x: g.panelX + g.metricDotX,
      y: g.panelY + g.metricStartY + (i * g.metricGap) + 3,
      w: g.metricDotSize,
      h: g.metricDotSize,
      color: segment.color,
      layer: 10,
      kind: 'metricDot',
    })
  })
  
  return specs
}

// Mirrored version for right-side donut
export const chartDonutContextRightChromeSpecs = (segments = CDC_SEGMENTS) => {
  const specs = chartDonutContextChromeSpecs(segments)
  const g = CDC_GEOM
  const donutNewCenterX = 770 // Right side
  const plateRadius = g.donutInnerRadius - 6
  
  // Mirror positions horizontally
  return specs.map(spec => {
    const mirrored = { ...spec }
    
    // Mirror badge
    if (spec.slotId === 'CDC_BADGE_BG' || spec.slotId === 'CDC_BADGE_ICON') {
      mirrored.x = g.viewW - spec.x - spec.w
    }
    
    // Mirror panel
    if (spec.slotId === 'CDC_PANEL_BG') {
      mirrored.x = 40 // Left side instead of right
    }
    
    // Mirror donut
    if (spec.slotId.startsWith('CDC_SEGMENT_')) {
      const donutLeft = donutNewCenterX - g.donutOuterRadius
      mirrored.x = donutLeft
    }

    // Mirror center plate
    if (spec.slotId === 'CDC_CENTER_PLATE') {
      mirrored.x = donutNewCenterX - plateRadius
    }
    
    // Mirror metric dots
    if (spec.slotId.startsWith('CDC_METRIC_DOT_')) {
      mirrored.x = 40 + g.metricDotX
    }
    
    return mirrored
  })
}

export const chartDonutContextOverlay = (gx, gy, gw, gh) => {
  const g = CDC_GEOM
  const sx = gw / g.viewW
  const sy = gh / g.viewH
  const box = (x, y, w, h) => ({
    x: Math.round(gx + x * sx),
    y: Math.round(gy + y * sy),
    width: Math.max(12, Math.round(w * sx)),
    height: Math.max(10, Math.round(h * sy)),
  })
  
  const overlays = {
    badge: box(g.badgeX + g.badgeIconSize + 14, g.badgeY, g.badgeW - g.badgeIconSize - 20, g.badgeH),
    
    // Center text in donut (well centered on the plate with ample width to never wrap)
    centerValue: box(g.donutCenterX - 85, g.donutCenterY - 26, 170, 36),
    centerLabel: box(g.donutCenterX - 85, g.donutCenterY + 12, 170, 20),
    
    // Context panel
    panelHeading: box(g.panelX + g.panelHeadingX, g.panelY + g.panelHeadingY, 420, 38),
    panelSubheading: box(g.panelX + g.panelSubheadingX, g.panelY + g.panelSubheadingY, g.panelSubheadingW, g.panelSubheadingH),
  }
  
  // Metric breakdowns in panel (4 metrics)
  CDC_SEGMENTS.forEach((segment, i) => {
    const y = g.panelY + g.metricStartY + (i * g.metricGap)
    overlays[`metric${segment.id}Label`] = box(g.panelX + g.metricLabelX, y, 320, 22)
    overlays[`metric${segment.id}Value`] = box(g.panelX + g.metricValueX - 40, y, 50, 24)
    overlays[`metric${segment.id}Desc`] = box(g.panelX + g.metricDescX, y + g.metricDescY, 410, g.metricDescH || 42)
  })
  
  return overlays
}

// Mirrored overlay for right-side donut
export const chartDonutContextRightOverlay = (gx, gy, gw, gh) => {
  const g = CDC_GEOM
  const sx = gw / g.viewW
  const sy = gh / g.viewH
  const box = (x, y, w, h) => ({
    x: Math.round(gx + x * sx),
    y: Math.round(gy + y * sy),
    width: Math.max(12, Math.round(w * sx)),
    height: Math.max(10, Math.round(h * sy)),
  })
  
  const donutNewCenterX = 770 // Right side
  const panelNewX = 40 // Left side
  
  const overlays = {
    badge: box(g.viewW - g.badgeX - g.badgeW + g.badgeIconSize + 14, g.badgeY, g.badgeW - g.badgeIconSize - 20, g.badgeH),
    
    // Center text in donut (right side)
    centerValue: box(donutNewCenterX - 85, g.donutCenterY - 26, 170, 36),
    centerLabel: box(donutNewCenterX - 85, g.donutCenterY + 12, 170, 20),
    
    // Context panel (left side)
    panelHeading: box(panelNewX + g.panelHeadingX, g.panelY + g.panelHeadingY, 420, 38),
    panelSubheading: box(panelNewX + g.panelSubheadingX, g.panelY + g.panelSubheadingY, g.panelSubheadingW, g.panelSubheadingH),
  }
  
  // Metric breakdowns in panel (left side)
  CDC_SEGMENTS.forEach((segment, i) => {
    const y = g.panelY + g.metricStartY + (i * g.metricGap)
    overlays[`metric${segment.id}Label`] = box(panelNewX + g.metricLabelX, y, 320, 22)
    overlays[`metric${segment.id}Value`] = box(panelNewX + g.metricValueX - 40, y, 50, 24)
    overlays[`metric${segment.id}Desc`] = box(panelNewX + g.metricDescX, y + g.metricDescY, 410, g.metricDescH || 42)
  })
  
  return overlays
}

export const specToChartDonutContextContent = (spec) => {
  if (spec.kind === 'badge') return { svg: badgeSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'badgeIcon') return { svg: badgeIconSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'panelBg') return { svg: panelBgSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'centerPlate') return { svg: centerPlateSvg(spec.w), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'metricDot') return { svg: metricDotSvg(spec.color), colorMode: 'recolor', fill: spec.color }
  if (spec.kind === 'donutSegment' && spec.segmentData) {
    return { svg: donutSegmentSvg(spec.segmentData, spec.w, spec.h), colorMode: 'fixed', fill: spec.color }
  }
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
    : (CDC_DEFAULTS[sid] || existing)
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

export const layoutChartDonutContext = (elements, schema, palette = {}, canvas = {}) => {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const sx = canvasW / CDC_GEOM.viewW
  const sy = canvasH / CDC_GEOM.viewH
  
  // Detect if this is the mirrored "right" layout
  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId
  const isRightLayout = isChartDonutContextRightLayout(layoutId)
  
  const overlay = isRightLayout 
    ? chartDonutContextRightOverlay(0, 0, canvasW, canvasH)
    : chartDonutContextOverlay(0, 0, canvasW, canvasH)
    
  const chromeRe = /^CDC_/i
  
  const prevBySlot = new Map(
    elements.filter((el) => chromeRe.test(String(el.slotId || ''))).map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  
  const filtered = elements.filter((el) => !chromeRe.test(String(el.slotId || '')) && isChartDonutContextTextSlot(el.slotId))
  const bySlot = new Map(filtered.map((el) => [String(el.slotId || ''), el]))

  const placeText = (slotId, box, style, role) => {
    const prev = bySlot.get(slotId) || bySlot.get(slotId.toUpperCase())
    return {
      id: prev?.id || newId('txt-cdc'),
      type: 'text',
      slotId,
      role: prev?.role || role || 'body',
      layer: 12,
      placement: { x: box.x, y: box.y, width: box.width, height: box.height, rotation: 0, opacity: 1 },
      content: filledContent(prev, slotId, style),
    }
  }

  // Extract metric values to compute dynamic segment angles and labels
  const getMetricVal = (id, fallback) => {
    const prev = bySlot.get(`METRIC_${id}_VALUE`)
    const txt = plainTextFromContent(prev?.content)
    if (txt && txt.trim()) {
      const parsed = parseFloat(txt.replace(/[^\d.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
    return fallback
  }

  const valA = getMetricVal('A', 32)
  const valB = getMetricVal('B', 24)
  const valC = getMetricVal('C', 18)
  const valD = getMetricVal('D', 26)
  const totalVal = valA + valB + valC + valD || 100

  const spanA = (valA / totalVal) * 360
  const spanB = (valB / totalVal) * 360
  const spanC = (valC / totalVal) * 360
  const spanD = 360 - (spanA + spanB + spanC)

  const dynamicSegments = [
    { id: 'A', value: Math.round((valA / totalVal) * 100), startAngle: 0, endAngle: spanA, color: '#3B82F6', lightColor: '#60A5FA', darkColor: '#1D4ED8', label: 'Metric A' },
    { id: 'B', value: Math.round((valB / totalVal) * 100), startAngle: spanA, endAngle: spanA + spanB, color: '#8B5CF6', lightColor: '#A78BFA', darkColor: '#6D28D9', label: 'Metric B' },
    { id: 'C', value: Math.round((valC / totalVal) * 100), startAngle: spanA + spanB, endAngle: spanA + spanB + spanC, color: '#10B981', lightColor: '#34D399', darkColor: '#047857', label: 'Metric C' },
    { id: 'D', value: Math.round((valD / totalVal) * 100), startAngle: spanA + spanB + spanC, endAngle: 360, color: '#64748B', lightColor: '#94A3B8', darkColor: '#334155', label: 'Metric D' },
  ]

  const next = [
    placeText('BADGE', overlay.badge, {
      align: 'left', verticalAlign: 'center', fontSize: 10.5, fontWeight: 800, color: '#2563EB', clipToSlot: true, lineHeight: 1, letterSpacing: '0.08em', textTransform: 'uppercase',
    }, 'caption'),
    
    // Center text in donut (clean single line value + uppercase letterspaced label)
    placeText('CENTER_VALUE', overlay.centerValue, {
      align: 'center', verticalAlign: 'center', fontSize: 34, fontWeight: 900, color: headingInk(palette), clipToSlot: false, lineHeight: 1.0, wrap: 'nowrap',
    }, 'heading'),
    placeText('CENTER_LABEL', overlay.centerLabel, {
      align: 'center', verticalAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#64748B', clipToSlot: false, lineHeight: 1.0, letterSpacing: '0.12em', textTransform: 'uppercase', wrap: 'nowrap',
    }, 'caption'),
    
    // Context panel
    placeText('PANEL_HEADING', overlay.panelHeading, {
      align: 'left', verticalAlign: 'top', fontSize: 34, fontWeight: 800, color: headingInk(palette), clipToSlot: true, lineHeight: 1.15,
    }, 'heading'),
    placeText('PANEL_SUBHEADING', overlay.panelSubheading, {
      align: 'left', verticalAlign: 'top', fontSize: 14, fontWeight: 400, color: '#64748B', clipToSlot: true, lineHeight: 1.55, wrap: 'wrap',
    }, 'body'),
  ]
  
  // Metric breakdowns in panel (4 metrics)
  dynamicSegments.forEach((segment) => {
    next.push(
      placeText(`METRIC_${segment.id}_LABEL`, overlay[`metric${segment.id}Label`], {
        align: 'left', verticalAlign: 'center', fontSize: 16, fontWeight: 700, color: headingInk(palette), clipToSlot: true, lineHeight: 1.2,
      }, 'caption'),
      placeText(`METRIC_${segment.id}_VALUE`, overlay[`metric${segment.id}Value`], {
        align: 'right', verticalAlign: 'center', fontSize: 24, fontWeight: 900, color: headingInk(palette), clipToSlot: true, lineHeight: 1,
      }, 'caption'),
      placeText(`METRIC_${segment.id}_DESC`, overlay[`metric${segment.id}Desc`], {
        align: 'left', verticalAlign: 'top', fontSize: 12.5, fontWeight: 400, color: '#64748B', clipToSlot: true, lineHeight: 1.45, wrap: 'wrap',
      }, 'body')
    )
  })

  const chromeSpecs = isRightLayout 
    ? chartDonutContextRightChromeSpecs(dynamicSegments) 
    : chartDonutContextChromeSpecs(dynamicSegments)

  const chrome = chromeSpecs.map((spec) => {
    const prev = prevBySlot.get(spec.slotId.toUpperCase())
    const graphic = specToChartDonutContextContent(spec)
    if (!graphic) return null
    return {
      id: prev?.id || newId('shp-cdc'),
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
