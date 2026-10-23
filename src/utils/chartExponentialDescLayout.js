/**
 * Chart Exponential Desc Layout Engine:
 *  - chart_exponential_desc_v1 (Narrative Left, Elevated Exponential Chart Card Right)
 *  - chart_exponential_desc_side_v1 (Elevated Exponential Chart Card Left, Narrative Right)
 */

export const CED_CANVAS = {
  w: 1920,
  h: 1080,
}

export const CED_COLORS = {
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.09), 0 4px 18px rgba(15, 23, 42, 0.04)',
  headingColor: '#0F172A',
  bodyColor: '#64748B',
  accentColor: '#6366F1',
  trendBg: 'rgba(16, 185, 129, 0.12)',
  trendBorder: 'rgba(16, 185, 129, 0.25)',
  trendColor: '#059669',
  statBg: 'rgba(99, 102, 241, 0.06)',
  statBorder: 'rgba(99, 102, 241, 0.22)',
}

export const CED_DEFAULTS = {
  HEADING: 'Growth trajectory',
  BODY: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
  SUBTITLE: 'Compound quarterly trajectory across core cohorts',
  STAT_VALUE: '16.6x',
  STAT_LABEL: 'Run-rate velocity multiplier',
  EYEBROW: 'Performance Metrics',
  CARD_TITLE: 'Exponential Trajectory',
  TREND_BADGE: '+240%',
  VALUES: [300, 800, 2500, 5000],
  LABELS: ['Q1', 'Q2', 'Q3', 'Q4'],
}

export function isChartExponentialDescLayout(layoutId) {
  const id = String(layoutId || '').trim().toLowerCase()
  return (
    id === 'chart_exponential_desc_v1' ||
    id === 'chart_exponential_desc' ||
    id === 'chart_exponential_desc_side_v1'
  )
}

export function isChartExponentialDescSideLayout(layoutId, schema = {}) {
  const id = String(layoutId || schema?.layout_id || schema?.id || '').trim().toLowerCase()
  return id === 'chart_exponential_desc_side_v1' || schema?.dataVariant === 'side'
}

export function isChartExponentialDescSlot(slotId) {
  const sid = String(slotId || '').replace(/^slot-/, '').toUpperCase()
  return (
    sid === 'HEADING' ||
    sid === 'BODY' ||
    sid === 'LINE_CHART' ||
    sid === 'MAIN_CHART' ||
    sid === 'EXPO_EYEBROW' ||
    sid === 'EXPO_STAT' ||
    sid === 'EXPO_STAT_VALUE' ||
    sid === 'EXPO_STAT_LABEL' ||
    sid === 'EXPO_STAT_TEXT' ||
    sid === 'EXPO_CARD_BG' ||
    sid === 'EXPO_CARD_HEADER' ||
    sid === 'EXPO_CARD_SUBTITLE'
  )
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

const isDark = (palette = {}) => {
  const bg = palette.bg || palette.background || palette.slideBg || '#ffffff'
  return hexLum(bg) < 0.45
}

const isVibrant = (hex) => {
  if (!hex || typeof hex !== 'string') return false
  const s = hex.replace('#', '')
  if (s.length !== 6) return false
  const r = parseInt(s.slice(0, 2), 16)
  const g = parseInt(s.slice(2, 4), 16)
  const b = parseInt(s.slice(4, 6), 16)
  const delta = Math.max(r, g, b) - Math.min(r, g, b)
  return delta >= 36
}

const headingInk = (palette = {}) => {
  if (isDark(palette)) return palette.text || '#F8FAFC'
  return palette.text || CED_COLORS.headingColor
}

const bodyInk = (palette = {}) => {
  if (isDark(palette)) return palette.muted || '#94A3B8'
  return palette.muted || CED_COLORS.bodyColor
}

const accentInk = (palette = {}) => {
  if (palette.accent && isVibrant(palette.accent)) return palette.accent
  if (palette.primary && isVibrant(palette.primary)) return palette.primary
  if (palette.accent) return palette.accent
  if (palette.primary) return palette.primary
  return CED_COLORS.accentColor
}

const cardBgColor = (palette = {}) => {
  if (isDark(palette)) return palette.cardBg || '#1E293B'
  return CED_COLORS.cardBg
}

const cardBorderColor = (palette = {}) => {
  if (isDark(palette)) return 'rgba(51, 65, 85, 0.7)'
  return CED_COLORS.cardBorder
}

const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function layoutChartExponentialDesc(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || CED_CANVAS.w
  const canvasH = canvas.height || CED_CANVAS.h
  const sx = canvasW / CED_CANVAS.w
  const sy = canvasH / CED_CANVAS.h

  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId
  const isSide = isChartExponentialDescSideLayout(layoutId, schema)

  const bySlot = new Map(
    elements.map((el) => {
      const raw = String(el.slotId || el.id || '')
      const clean = raw.replace(/^slot-/, '').toUpperCase()
      return [clean, el]
    })
  )

  // Column Boundaries
  // Standard: Text on Left (x: 108..780), Card on Right (x: 860..1812)
  // Side: Card on Left (x: 108..1060), Text on Right (x: 1140..1812)
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

  // --- 1. Left Narrative Section ---
  // Category Eyebrow (y: 160)
  const prevEyebrow = bySlot.get('EXPO_EYEBROW')
  const eyebrowEl = {
    id: prevEyebrow?.id || newId('txt-ced-eyebrow'),
    type: 'text',
    slotId: 'EXPO_EYEBROW',
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
      text: prevEyebrow?.content?.text || CED_DEFAULTS.EYEBROW,
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
  const rawHeading = String(prevHeading?.content?.text || CED_DEFAULTS.HEADING).replace(/\r?\n+/g, ' ').trim()
  const headingEl = {
    id: prevHeading?.id || newId('txt-ced-heading'),
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
      text: rawHeading || CED_DEFAULTS.HEADING,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(42 * sy),
      fontWeight: 800,
      color: headingColor,
      lineHeight: 1.15,
      wrap: 'wrap',
    },
  }

  // Sub Heading / Body Paragraph (y: 470, height: 120) - 138px gap away from heading
  const prevBody = bySlot.get('BODY')
  const bodyEl = {
    id: prevBody?.id || newId('txt-ced-body'),
    type: 'text',
    slotId: 'BODY',
    role: 'body',
    layer: 10,
    placement: {
      x: textX,
      y: Math.round(470 * sy),
      width: textW - Math.round(40 * sx),
      height: Math.round(120 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevBody?.content?.text || CED_DEFAULTS.BODY,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(17.5 * sy),
      fontWeight: 400,
      color: bodyColor,
      lineHeight: 1.65,
      wrap: 'wrap',
    },
  }

  // Metric Highlight Callout Card "that 16 bar" (y: 710, height: 106, width: 540) - 120px gap away from sub heading
  const prevStat = bySlot.get('EXPO_STAT') || bySlot.get('EXPO_STAT_VALUE')
  const prevStatLabel = bySlot.get('EXPO_STAT_LABEL')
  
  let statValue = CED_DEFAULTS.STAT_VALUE
  let statLabel = CED_DEFAULTS.STAT_LABEL
  if (prevStat?.content?.text) {
    const raw = String(prevStat.content.text).trim()
    if (raw.includes('—')) {
      const parts = raw.split('—').map((s) => s.trim())
      statValue = parts[0] || statValue
      statLabel = parts[1] || statLabel
    } else if (raw.includes('-') && !raw.startsWith('-')) {
      const parts = raw.split('-').map((s) => s.trim())
      statValue = parts[0] || statValue
      statLabel = parts[1] || statLabel
    } else {
      statValue = raw
    }
  }
  if (prevStatLabel?.content?.text) {
    statLabel = prevStatLabel.content.text
  }

  const statW = Math.round(540 * sx)
  const statH = Math.round(106 * sy)
  const divX = Math.round(190 * sx)
  
  const statSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${statW} ${statH}" width="100%" height="100%">
    <defs>
      <linearGradient id="statGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="${darkTheme ? '0.14' : '0.06'}" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="${darkTheme ? '0.04' : '0.02'}" />
      </linearGradient>
    </defs>
    <rect width="${statW}" height="${statH}" rx="${Math.round(16 * sx)}" fill="url(#statGrad)" stroke="${accentColor}" stroke-opacity="${darkTheme ? '0.35' : '0.22'}" stroke-width="1.2"/>
    <line x1="${divX}" y1="${Math.round(22 * sy)}" x2="${divX}" y2="${Math.round(84 * sy)}" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`

  const statBgEl = {
    id: newId('shp-ced-statbg'),
    type: 'graphic',
    slotId: 'EXPO_STAT_BG',
    role: 'decoration',
    layer: 8,
    placement: {
      x: textX,
      y: Math.round(710 * sy),
      width: statW,
      height: statH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: statSvg,
      alt: 'Velocity Callout Card',
    },
  }

  const statValEl = {
    id: prevStat?.id || newId('txt-ced-statval'),
    type: 'text',
    slotId: 'EXPO_STAT',
    role: 'stat',
    layer: 10,
    placement: {
      x: textX + Math.round(24 * sx),
      y: Math.round(722 * sy),
      width: Math.round(160 * sx),
      height: Math.round(80 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: statValue,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(40 * sy),
      fontWeight: 900,
      color: accentColor,
      lineHeight: 1.1,
    },
  }

  const statLabelEl = {
    id: prevStatLabel?.id || newId('txt-ced-statlbl'),
    type: 'text',
    slotId: 'EXPO_STAT_LABEL',
    role: 'caption',
    layer: 10,
    placement: {
      x: textX + Math.round(212 * sx),
      y: Math.round(722 * sy),
      width: Math.round(310 * sx),
      height: Math.round(80 * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: statLabel,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(14 * sy),
      fontWeight: 600,
      color: darkTheme ? '#CBD5E1' : '#334155',
      lineHeight: 1.4,
      wrap: 'wrap',
    },
  }

  // --- 2. Right Column: Elevated Chart Card Container ---
  const prevCardBg = bySlot.get('EXPO_CARD_BG')
  const cardBgEl = {
    id: prevCardBg?.id || newId('shp-ced-cardbg'),
    type: 'shape',
    slotId: 'EXPO_CARD_BG',
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
      boxShadow: CED_COLORS.cardShadow,
    },
  }

  // Inside Card Header: Title + Pulse Dot + Trend Spark Chip
  const cardHeaderW = cardW - Math.round(72 * sx)
  const cardHeaderX = cardX + Math.round(36 * sx)
  const cardHeaderY = cardY + Math.round(30 * sy)
  const cardHeaderH = Math.round(42 * sy)
  const cardHeaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardHeaderW} 42" width="100%" height="100%">
    <circle cx="6" cy="21" r="4.5" fill="${accentColor}" />
    <circle cx="6" cy="21" r="8" fill="${accentColor}" opacity="0.2" />
    <text x="22" y="26" fill="${headingColor}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" letter-spacing="0.06em">${CED_DEFAULTS.CARD_TITLE.toUpperCase()}</text>
    <rect x="${cardHeaderW - 110}" y="6" width="110" height="30" rx="15" fill="${CED_COLORS.trendBg}" stroke="${CED_COLORS.trendBorder}" stroke-width="1" />
    <path d="M ${cardHeaderW - 95} 23 L ${cardHeaderW - 89} 17 L ${cardHeaderW - 85} 20 L ${cardHeaderW - 79} 14" fill="none" stroke="${CED_COLORS.trendColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M ${cardHeaderW - 82} 14 L ${cardHeaderW - 79} 14 L ${cardHeaderW - 79} 17" fill="none" stroke="${CED_COLORS.trendColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <text x="${cardHeaderW - 44}" y="25" fill="${CED_COLORS.trendColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">${CED_DEFAULTS.TREND_BADGE}</text>
  </svg>`
  const cardHeaderEl = {
    id: newId('grp-ced-header'),
    type: 'graphic',
    slotId: 'EXPO_CARD_HEADER',
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

  // Chart Slot inside card
  const prevChart = bySlot.get('LINE_CHART') || bySlot.get('MAIN_CHART')
  const chartInnerX = cardX + Math.round(36 * sx)
  const chartInnerY = cardY + Math.round(86 * sy)
  const chartInnerW = cardW - Math.round(72 * sx)
  const chartInnerH = cardH - Math.round(166 * sy)

  const chartEl = {
    id: prevChart?.id || newId('cht-ced-line'),
    type: 'chart',
    slotId: 'LINE_CHART',
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
      chartType: 'area',
      curve: 'smooth',
      showGradient: true,
      labels: prevChart?.content?.labels?.length ? prevChart.content.labels : CED_DEFAULTS.LABELS,
      values: prevChart?.content?.values?.length ? prevChart.content.values : CED_DEFAULTS.VALUES,
      colors: [accentColor],
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
    <text x="14" y="22" fill="${bodyColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">${CED_DEFAULTS.SUBTITLE}</text>
    <rect x="${cardHeaderW - 68}" y="8" width="68" height="20" rx="4" fill="${darkTheme ? 'rgba(51,65,85,0.4)' : '#F1F5F9'}" />
    <text x="${cardHeaderW - 34}" y="22" fill="${headingColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Q1 — Q4</text>
  </svg>`
  const cardFooterEl = {
    id: newId('grp-ced-footer'),
    type: 'graphic',
    slotId: 'EXPO_CARD_SUBTITLE',
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
    statBgEl,
    statValEl,
    statLabelEl,
    cardBgEl,
    cardHeaderEl,
    chartEl,
    cardFooterEl,
  ]
}
