/**
 * Metric three cards — 3 vertical metric cards with icons, values, and trend indicators.
 * Layout id: metric_three_cards_v1.
 */

export const MTC_GEOM = {
  viewW: 1000,
  viewH: 560,
  
  // Badge at top
  badgeX: 50,
  badgeY: 40,
  badgeW: 130,
  badgeH: 22,
  badgeIconSize: 14,
  
  // Heading
  headingX: 50,
  headingY: 80,
  headingW: 900,
  headingH: 48,
  
  // Subheading
  subheadingX: 50,
  subheadingY: 133,
  subheadingW: 900,
  subheadingH: 22,
  
  // Three cards (equal width with gaps)
  cardY: 180,
  cardW: 290,
  cardH: 300,
  cardGap: 35,
  card1X: 50,
  card2X: 375,
  card3X: 700,
  
  // Inside each card
  cardIconX: 25,
  cardIconY: 25,
  cardIconSize: 38,
  cardIconBgSize: 56,
  
  cardValueX: 25,
  cardValueY: 105,
  cardValueW: 240,
  cardValueH: 56,
  
  cardLabelX: 25,
  cardLabelY: 168,
  cardLabelW: 240,
  cardLabelH: 26,
  
  cardTrendX: 25,
  cardTrendY: 202,
  cardTrendW: 240,
  cardTrendH: 18,
  
  cardDescX: 25,
  cardDescY: 235,
  cardDescW: 240,
  cardDescH: 52,
}

export const MTC_COLORS = {
  card1: '#3B82F6',  // Blue
  card2: '#8B5CF6',  // Purple
  card3: '#10B981',  // Green
}

export const MTC_DEFAULTS = {
  BADGE: 'KEY METRICS',
  HEADING: 'Key metrics',
  SUBHEADING: 'A quick snapshot of the most important numbers at a glance.',
  
  CARD1_VALUE: '98%',
  CARD1_LABEL: 'Customer satisfaction',
  CARD1_TREND: '+12% vs. last quarter',
  CARD1_DESC: 'More customers are happy with our service and support.',
  
  CARD2_VALUE: '3.2x',
  CARD2_LABEL: 'Average ROI',
  CARD2_TREND: '+18% vs. last quarter',
  CARD2_DESC: 'Our solutions continue to deliver strong returns.',
  
  CARD3_VALUE: '500+',
  CARD3_LABEL: 'Active teams',
  CARD3_TREND: '+22% vs. last quarter',
  CARD3_DESC: 'More teams are joining and growing with us.',
}

export const isMetricThreeCardsLayout = (layoutId) => {
  return /metric_three_cards_v1$/i.test(String(layoutId || ''))
}

export const isMetricThreeCardsTextSlot = (slotId) => {
  const sid = String(slotId || '')
  return sid === 'BADGE'
    || sid === 'HEADING'
    || sid === 'SUBHEADING'
    || sid === 'CARD1_VALUE'
    || sid === 'CARD1_LABEL'
    || sid === 'CARD1_TREND'
    || sid === 'CARD1_DESC'
    || sid === 'CARD2_VALUE'
    || sid === 'CARD2_LABEL'
    || sid === 'CARD2_TREND'
    || sid === 'CARD2_DESC'
    || sid === 'CARD3_VALUE'
    || sid === 'CARD3_LABEL'
    || sid === 'CARD3_TREND'
    || sid === 'CARD3_DESC'
}

const badgeSvg = () => {
  const g = MTC_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.badgeW} ${g.badgeH}" width="100%" height="100%" preserveAspectRatio="none">
    <rect x="0" y="0" width="${g.badgeW}" height="${g.badgeH}" fill="#DBEAFE" rx="6"/>
  </svg>`
}

const badgeIconSvg = () => {
  const size = MTC_GEOM.badgeIconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect x="1" y="4" width="4" height="8" rx="1" fill="#3B82F6"/>
    <rect x="6" y="2" width="4" height="10" rx="1" fill="#3B82F6"/>
    <rect x="11" y="6" width="4" height="6" rx="1" fill="#3B82F6"/>
  </svg>`
}

const cardBgSvg = (color) => {
  const g = MTC_GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.cardW} ${g.cardH}" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="cardGrad_${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.08" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.15" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${g.cardW}" height="${g.cardH}" fill="url(#cardGrad_${color.replace('#','')})" stroke="${color}" stroke-width="1.5" stroke-opacity="0.2" rx="16"/>
  </svg>`
}

const iconBgSvg = (color) => {
  const size = MTC_GEOM.cardIconBgSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="${size}" height="${size}" fill="${color}" fill-opacity="0.15" rx="12"/>
  </svg>`
}

const card1IconSvg = () => {
  const size = MTC_GEOM.cardIconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <circle cx="${size/2}" cy="14" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <path d="M${size/2 - 8} 28 Q${size/2} 24 ${size/2 + 8} 28 L${size/2 + 8} 36 L${size/2 - 8} 36 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`
}

const card2IconSvg = () => {
  const size = MTC_GEOM.cardIconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect x="6" y="6" width="28" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <rect x="10" y="16" width="6" height="12" fill="currentColor"/>
    <rect x="17" y="12" width="6" height="16" fill="currentColor"/>
    <rect x="24" y="20" width="6" height="8" fill="currentColor"/>
  </svg>`
}

const card3IconSvg = () => {
  const size = MTC_GEOM.cardIconSize
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="28" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="20" cy="28" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M15 15 L17.5 22" stroke="currentColor" stroke-width="2"/>
    <path d="M25 15 L22.5 22" stroke="currentColor" stroke-width="2"/>
  </svg>`
}

const trendArrowSvg = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12">
    <path d="M2 8 L6 4 L10 8" fill="none" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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

export const metricThreeCardsChromeSpecs = () => {
  const g = MTC_GEOM
  const specs = []
  
  // Badge background
  specs.push({
    slotId: 'MTC_BADGE_BG',
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
    slotId: 'MTC_BADGE_ICON',
    x: g.badgeX + 10,
    y: g.badgeY + 4,
    w: g.badgeIconSize,
    h: g.badgeIconSize,
    color: '#3B82F6',
    layer: 10,
    kind: 'badgeIcon',
  })
  
  // Three card backgrounds
  const cards = [
    { x: g.card1X, color: MTC_COLORS.card1, id: 1 },
    { x: g.card2X, color: MTC_COLORS.card2, id: 2 },
    { x: g.card3X, color: MTC_COLORS.card3, id: 3 },
  ]
  
  cards.forEach(card => {
    // Card background
    specs.push({
      slotId: `MTC_CARD${card.id}_BG`,
      x: card.x,
      y: g.cardY,
      w: g.cardW,
      h: g.cardH,
      color: card.color,
      layer: 3,
      kind: 'cardBg',
    })
    
    // Icon background circle
    specs.push({
      slotId: `MTC_CARD${card.id}_ICON_BG`,
      x: card.x + g.cardIconX,
      y: g.cardY + g.cardIconY,
      w: g.cardIconBgSize,
      h: g.cardIconBgSize,
      color: card.color,
      layer: 5,
      kind: 'iconBg',
    })
    
    // Icon
    specs.push({
      slotId: `MTC_CARD${card.id}_ICON`,
      x: card.x + g.cardIconX + (g.cardIconBgSize - g.cardIconSize) / 2,
      y: g.cardY + g.cardIconY + (g.cardIconBgSize - g.cardIconSize) / 2,
      w: g.cardIconSize,
      h: g.cardIconSize,
      color: card.color,
      layer: 10,
      kind: `card${card.id}Icon`,
    })
    
    // Trend arrow
    specs.push({
      slotId: `MTC_CARD${card.id}_ARROW`,
      x: card.x + g.cardTrendX,
      y: g.cardY + g.cardTrendY + 4,
      w: 12,
      h: 12,
      color: '#10B981',
      layer: 10,
      kind: 'trendArrow',
    })
  })
  
  return specs
}

export const metricThreeCardsOverlay = (gx, gy, gw, gh) => {
  const g = MTC_GEOM
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
    heading: box(g.headingX, g.headingY, g.headingW, g.headingH),
    subheading: box(g.subheadingX, g.subheadingY, g.subheadingW, g.subheadingH),
  }
  
  // Card text overlays
  const cardXs = [g.card1X, g.card2X, g.card3X]
  cardXs.forEach((cardX, i) => {
    const num = i + 1
    overlays[`card${num}Value`] = box(cardX + g.cardValueX, g.cardY + g.cardValueY, g.cardValueW, g.cardValueH)
    overlays[`card${num}Label`] = box(cardX + g.cardLabelX, g.cardY + g.cardLabelY, g.cardLabelW, g.cardLabelH)
    overlays[`card${num}Trend`] = box(cardX + g.cardTrendX + 18, g.cardY + g.cardTrendY, g.cardTrendW - 18, g.cardTrendH)
    overlays[`card${num}Desc`] = box(cardX + g.cardDescX, g.cardY + g.cardDescY, g.cardDescW, g.cardDescH)
  })
  
  return overlays
}

export const specToMetricThreeCardsContent = (spec) => {
  if (spec.kind === 'badge') return { svg: badgeSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'badgeIcon') return { svg: badgeIconSvg(), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'cardBg') return { svg: cardBgSvg(spec.color), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'iconBg') return { svg: iconBgSvg(spec.color), colorMode: 'fixed', fill: spec.color }
  if (spec.kind === 'card1Icon') return { svg: card1IconSvg(), colorMode: 'recolor', fill: spec.color }
  if (spec.kind === 'card2Icon') return { svg: card2IconSvg(), colorMode: 'recolor', fill: spec.color }
  if (spec.kind === 'card3Icon') return { svg: card3IconSvg(), colorMode: 'recolor', fill: spec.color }
  if (spec.kind === 'trendArrow') return { svg: trendArrowSvg(), colorMode: 'fixed', fill: spec.color }
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
    : (MTC_DEFAULTS[sid] || existing)
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

export const layoutMetricThreeCards = (elements, schema, palette = {}, canvas = {}) => {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const sx = canvasW / MTC_GEOM.viewW
  const sy = canvasH / MTC_GEOM.viewH
  const overlay = metricThreeCardsOverlay(0, 0, canvasW, canvasH)
  const chromeRe = /^MTC_/i
  
  const prevBySlot = new Map(
    elements.filter((el) => chromeRe.test(String(el.slotId || ''))).map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  
  const filtered = elements.filter((el) => !chromeRe.test(String(el.slotId || '')) && isMetricThreeCardsTextSlot(el.slotId))
  const bySlot = new Map(filtered.map((el) => [String(el.slotId || ''), el]))

  const placeText = (slotId, box, style, role) => {
    const prev = bySlot.get(slotId) || bySlot.get(slotId.toUpperCase())
    return {
      id: prev?.id || newId('txt-mtc'),
      type: 'text',
      slotId,
      role: prev?.role || role || 'body',
      layer: 12,
      placement: { x: box.x, y: box.y, width: box.width, height: box.height, rotation: 0, opacity: 1 },
      content: filledContent(prev, slotId, style),
    }
  }

  const next = [
    placeText('BADGE', overlay.badge, {
      align: 'center', verticalAlign: 'center', fontSize: 9, fontWeight: 700, color: '#2563EB', clipToSlot: true, lineHeight: 1, letterSpacing: '1px',
    }, 'caption'),
    placeText('HEADING', overlay.heading, {
      align: 'left', verticalAlign: 'top', fontSize: 44, fontWeight: 800, color: headingInk(palette), clipToSlot: true, lineHeight: 1.1,
    }, 'heading'),
    placeText('SUBHEADING', overlay.subheading, {
      align: 'left', verticalAlign: 'top', fontSize: 14, fontWeight: 400, color: '#94A3B8', clipToSlot: true, lineHeight: 1.4,
    }, 'subheading'),
  ]
  
  // Card text elements
  for (let i = 1; i <= 3; i++) {
    next.push(
      placeText(`CARD${i}_VALUE`, overlay[`card${i}Value`], {
        align: 'left', verticalAlign: 'center', fontSize: 52, fontWeight: 900, color: headingInk(palette), clipToSlot: true, lineHeight: 1,
      }, 'heading'),
      placeText(`CARD${i}_LABEL`, overlay[`card${i}Label`], {
        align: 'left', verticalAlign: 'center', fontSize: 16, fontWeight: 600, color: '#475569', clipToSlot: true, lineHeight: 1.3,
      }, 'caption'),
      placeText(`CARD${i}_TREND`, overlay[`card${i}Trend`], {
        align: 'left', verticalAlign: 'center', fontSize: 12, fontWeight: 500, color: '#10B981', clipToSlot: true, lineHeight: 1,
      }, 'caption'),
      placeText(`CARD${i}_DESC`, overlay[`card${i}Desc`], {
        align: 'left', verticalAlign: 'top', fontSize: 13, fontWeight: 400, color: '#64748B', clipToSlot: true, lineHeight: 1.4, wrap: 'wrap',
      }, 'body')
    )
  }

  const chrome = metricThreeCardsChromeSpecs().map((spec) => {
    const prev = prevBySlot.get(spec.slotId.toUpperCase())
    const graphic = specToMetricThreeCardsContent(spec)
    if (!graphic) return null
    return {
      id: prev?.id || newId('shp-mtc'),
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
