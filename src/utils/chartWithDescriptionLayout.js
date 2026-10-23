/**
 * Chart with Description Layout Engine:
 *  - chart_with_description_v1 (Narrative / Description Left, Elevated Bar Chart Card Right)
 *  - chart_with_description_side_v1 (Elevated Bar Chart Card Left, Narrative / Description Right)
 */

export const CWD_CANVAS = {
  w: 1920,
  h: 1080,
}

export const CWD_COLORS = {
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.08), 0 4px 18px rgba(15, 23, 42, 0.04)',
  headingColor: '#0F172A',
  bodyColor: '#64748B',
  accentColor: '#3B82F6',
}

export const CWD_DEFAULTS = {
  HEADING: 'Quarterly performance',
  BODY: 'Detailed breakdown of core segment metrics showing sustained period-over-period growth and healthy margin expansion across target accounts.',
  EYEBROW: 'DATA & ANALYTICS',
  CARD_TITLE: 'Performance by Cohort',
  BADGE: 'Top Tier',
  SUBTITLE: 'Benchmark distribution across operational quarters',
  VALUES: [42, 68, 54, 86],
  LABELS: ['Q1', 'Q2', 'Q3', 'Q4'],
}

export function isChartWithDescriptionLayout(layoutId) {
  const id = String(layoutId || '').trim().toLowerCase()
  return (
    id === 'chart_with_description_v1' ||
    id === 'chart_with_description' ||
    id === 'chart_with_description_side_v1'
  )
}

export function isChartWithDescriptionSideLayout(layoutId, schema = {}) {
  const id = String(layoutId || schema?.layout_id || schema?.id || '').trim().toLowerCase()
  return id === 'chart_with_description_side_v1' || schema?.dataVariant === 'side'
}

function hexLum(hex) {
  const s = String(hex || '').replace('#', '')
  if (s.length !== 6) return 1
  const r = parseInt(s.slice(0, 2), 16) / 255
  const g = parseInt(s.slice(2, 4), 16) / 255
  const b = parseInt(s.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function isDark(palette = {}) {
  const bg = palette.bg || palette.background || palette.slideBg || '#ffffff'
  return hexLum(bg) < 0.45
}

function headingInk(palette = {}) {
  return isDark(palette) ? '#F8FAFC' : CWD_COLORS.headingColor
}

function bodyInk(palette = {}) {
  return isDark(palette) ? '#94A3B8' : CWD_COLORS.bodyColor
}

function accentInk(palette = {}) {
  if (palette.accent && String(palette.accent).startsWith('#')) return palette.accent
  if (palette.primary && String(palette.primary).startsWith('#')) return palette.primary
  return CWD_COLORS.accentColor
}

const cardBgColor = (palette = {}) => {
  if (isDark(palette)) return palette.cardBg || '#1E293B'
  return CWD_COLORS.cardBg
}

const cardBorderColor = (palette = {}) => {
  if (isDark(palette)) return 'rgba(51, 65, 85, 0.7)'
  return CWD_COLORS.cardBorder
}

const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function layoutChartWithDescription(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || CWD_CANVAS.w
  const canvasH = canvas.height || CWD_CANVAS.h
  const sx = canvasW / CWD_CANVAS.w
  const sy = canvasH / CWD_CANVAS.h

  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId
  const isSide = isChartWithDescriptionSideLayout(layoutId, schema)

  const bySlot = new Map(
    elements.map((el) => {
      const raw = String(el.slotId || el.id || '')
      const clean = raw.replace(/^slot-/, '').toUpperCase()
      return [clean, el]
    })
  )

  // Column Boundaries
  // Standard (Default): Description on Left (x: 108..780), Card on Right (x: 860..1812)
  // Side: Card on Left (x: 108..1060), Description on Right (x: 1120..1812)
  const textX = isSide ? Math.round(1120 * sx) : Math.round(108 * sx)
  const textW = Math.round(680 * sx)

  const cardX = isSide ? Math.round(108 * sx) : Math.round(860 * sx)
  const cardW = Math.round(952 * sx)
  const cardY = Math.round(120 * sy)
  const cardH = Math.round(840 * sy)

  const accentColor = accentInk(palette)
  const headingColor = headingInk(palette)
  const bodyColor = bodyInk(palette)
  const darkTheme = isDark(palette)

  // --- 1. Left Narrative Section (Description on the Left) ---
  // Category Eyebrow (y: 160)
  const prevEyebrow = bySlot.get('CHART_EYEBROW') || bySlot.get('TAG_BADGE')
  const eyebrowEl = {
    id: prevEyebrow?.id || newId('txt-cwd-eyebrow'),
    type: 'text',
    slotId: 'CHART_EYEBROW',
    role: 'caption',
    layer: 10,
    placement: {
      x: textX,
      y: Math.round(160 * sy),
      width: textW,
      height: Math.round(28 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevEyebrow?.content?.text || CWD_DEFAULTS.EYEBROW,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(13 * sy),
      fontWeight: 800,
      color: accentColor,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: 1.1,
      wrap: 'nowrap',
    },
  }

  // Heading (y: 216, height: 116) - ample clearance
  const prevHeading = bySlot.get('HEADING')
  const rawHeading = String(prevHeading?.content?.text || CWD_DEFAULTS.HEADING).replace(/\r?\n+/g, ' ').trim()
  const headingEl = {
    id: prevHeading?.id || newId('txt-cwd-heading'),
    type: 'text',
    slotId: 'HEADING',
    role: 'heading',
    layer: 10,
    placement: {
      x: textX,
      y: Math.round(216 * sy),
      width: textW,
      height: Math.round(116 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: rawHeading && rawHeading.toLowerCase() !== 'double-click to edit' ? rawHeading : CWD_DEFAULTS.HEADING,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(42 * sy),
      fontWeight: 800,
      color: headingColor,
      lineHeight: 1.15,
      wrap: 'wrap',
    },
  }

  // Sub Heading / Body Paragraph (y: 470, height: 130) - generous 138px gap below heading
  const prevBody = bySlot.get('BODY')
  const rawBody = String(prevBody?.content?.text || CWD_DEFAULTS.BODY).trim()
  const bodyEl = {
    id: prevBody?.id || newId('txt-cwd-body'),
    type: 'text',
    slotId: 'BODY',
    role: 'body',
    layer: 10,
    placement: {
      x: textX,
      y: Math.round(470 * sy),
      width: textW - Math.round(40 * sx),
      height: Math.round(130 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: rawBody && rawBody.toLowerCase() !== 'double-click to edit' ? rawBody : CWD_DEFAULTS.BODY,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(18 * sy),
      fontWeight: 400,
      color: bodyColor,
      lineHeight: 1.65,
      wrap: 'wrap',
    },
  }

  // Feature Points / Bullet Callout List (y: 670, height: 160) - 70px gap below body
  const prevPoint1 = bySlot.get('POINT_1')
  const point1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${textW} 56" width="100%" height="100%">
    <rect x="0" y="0" width="${textW - 40}" height="52" rx="10" fill="${darkTheme ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.8)'}" stroke="${darkTheme ? 'rgba(51, 65, 85, 0.8)' : '#E2E8F0'}" stroke-width="1"/>
    <circle cx="24" cy="26" r="8" fill="${accentColor}" opacity="0.15"/>
    <circle cx="24" cy="26" r="4" fill="${accentColor}"/>
    <text x="44" y="31" fill="${headingColor}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">Predictable quarterly growth rate</text>
    <text x="${textW - 100}" y="31" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800">+38% YoY</text>
  </svg>`
  const pointEl = {
    id: prevPoint1?.id || newId('shp-cwd-point1'),
    type: 'graphic',
    slotId: 'CHART_DESC_HIGHLIGHT',
    role: 'decoration',
    layer: 8,
    placement: {
      x: textX,
      y: Math.round(670 * sy),
      width: textW,
      height: Math.round(56 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: point1Svg,
      alt: 'Growth Metric Highlight',
    },
  }

  // --- 2. Right Column: Elevated Bar Chart Card Container ---
  const prevCardBg = bySlot.get('CHART_CARD_BG') || bySlot.get('EXPO_CARD_BG')
  const cardBgEl = {
    id: prevCardBg?.id || newId('shp-cwd-cardbg'),
    type: 'shape',
    slotId: 'CHART_CARD_BG',
    role: 'container',
    layer: 4,
    placement: {
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      fill: cardBgColor(palette),
      stroke: cardBorderColor(palette),
      strokeWidth: 1,
      borderRadius: Math.round(20 * sx),
      boxShadow: CWD_COLORS.cardShadow,
    },
  }

  // Inside Card Header: Title + Pulse Dot + Category Chip
  const cardHeaderW = cardW - Math.round(72 * sx)
  const cardHeaderX = cardX + Math.round(36 * sx)
  const cardHeaderY = cardY + Math.round(30 * sy)
  const cardHeaderH = Math.round(42 * sy)
  const cardHeaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardHeaderW} 42" width="100%" height="100%">
    <circle cx="6" cy="21" r="4.5" fill="${accentColor}" />
    <circle cx="6" cy="21" r="8" fill="${accentColor}" opacity="0.2" />
    <text x="22" y="26" fill="${headingColor}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" letter-spacing="0.06em">${CWD_DEFAULTS.CARD_TITLE.toUpperCase()}</text>
    <rect x="${cardHeaderW - 96}" y="6" width="96" height="30" rx="15" fill="${darkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="1" />
    <text x="${cardHeaderW - 48}" y="25" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">${CWD_DEFAULTS.BADGE.toUpperCase()}</text>
  </svg>`
  const cardHeaderEl = {
    id: newId('grp-cwd-header'),
    type: 'graphic',
    slotId: 'CHART_CARD_HEADER',
    role: 'decoration',
    layer: 8,
    placement: {
      x: cardHeaderX,
      y: cardHeaderY,
      width: cardHeaderW,
      height: cardHeaderH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: cardHeaderSvg,
      alt: 'Card Header',
    },
  }

  // Main Bar Chart Slot inside card
  const prevChart = bySlot.get('MAIN_CHART') || bySlot.get('BAR_CHART') || bySlot.get('LINE_CHART')
  const chartInnerX = cardX + Math.round(36 * sx)
  const chartInnerY = cardY + Math.round(86 * sy)
  const chartInnerW = cardW - Math.round(72 * sx)
  const chartInnerH = cardH - Math.round(166 * sy)

  const chartEl = {
    id: prevChart?.id || newId('cht-cwd-bar'),
    type: 'chart',
    slotId: 'MAIN_CHART',
    role: 'chart',
    layer: 8,
    placement: {
      x: chartInnerX,
      y: chartInnerY,
      width: chartInnerW,
      height: chartInnerH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(prevChart?.content || {}),
      chartType: 'column',
      labels: prevChart?.content?.labels?.length ? prevChart.content.labels : CWD_DEFAULTS.LABELS,
      values: prevChart?.content?.values?.length ? prevChart.content.values : CWD_DEFAULTS.VALUES,
      colors: [accentColor, palette.primary || '#2563EB', '#06B6D4', '#10B981'],
      premium: true,
      showGrid: true,
      showLabels: true,
    },
  }

  // Card Subtitle / Footer
  const cardFooterY = cardY + cardH - Math.round(52 * sy)
  const cardFooterH = Math.round(32 * sy)
  const cardFooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardHeaderW} 32" width="100%" height="100%">
    <line x1="0" y1="0" x2="${cardHeaderW}" y2="0" stroke="${darkTheme ? 'rgba(51,65,85,0.6)' : '#E2E8F0'}" stroke-width="1"/>
    <circle cx="4" cy="18" r="2.5" fill="${accentColor}" opacity="0.7"/>
    <text x="14" y="22" fill="${bodyColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">${CWD_DEFAULTS.SUBTITLE}</text>
    <rect x="${cardHeaderW - 68}" y="8" width="68" height="20" rx="4" fill="${darkTheme ? 'rgba(51,65,85,0.4)' : '#F1F5F9'}" />
    <text x="${cardHeaderW - 34}" y="22" fill="${headingColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Q1 — Q4</text>
  </svg>`
  const cardFooterEl = {
    id: newId('grp-cwd-footer'),
    type: 'graphic',
    slotId: 'CHART_CARD_SUBTITLE',
    role: 'decoration',
    layer: 8,
    placement: {
      x: cardHeaderX,
      y: cardFooterY,
      width: cardHeaderW,
      height: cardFooterH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: cardFooterSvg,
      alt: 'Card Footer',
    },
  }

  return [
    eyebrowEl,
    headingEl,
    bodyEl,
    pointEl,
    cardBgEl,
    cardHeaderEl,
    chartEl,
    cardFooterEl,
  ]
}
