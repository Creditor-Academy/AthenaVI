/**
 * Eight Short Texts Image Layout
 * Layout IDs: eight_short_texts_image_v1, eight_short_texts_image_right_v1
 *
 * Features:
 *  - Top Header:
 *    - Category pill badge ("CORE CAPABILITIES")
 *    - Bold Heading ("Eight key points")
 *    - Subtitle ("Strategic operational framework and execution architecture")
 *  - Left Grid (8 Points in 2 Columns × 4 Rows):
 *    - Numbered pill cards (01 to 08) with primary accent colors
 *    - Bold title + descriptive body text
 *    - Sleek card container with rounded corners and subtle border
 *  - Right Side:
 *    - Large featured showcase hero image (HERO_IMAGE) with rounded corners and shadow
 *  - Total Elements: 28 elements (strictly <= 50) with complete placement coordinates.
 */

export const EIGHT_SHORT_TEXTS_IMAGE_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Header Area
  badgeX: 408,
  badgeY: 20,
  badgeW: 180,
  badgeH: 22,

  headingX: 408,
  headingY: 46,
  headingW: 548,
  headingH: 34,

  subtitleX: 408,
  subtitleY: 82,
  subtitleW: 548,
  subtitleH: 22,

  // Grid (Default: on Right for eight_short_texts_image_v1)
  gridStartX: 408,
  gridStartY: 118,
  cardW: 266,
  cardH: 94,
  colGap: 16,
  rowGap: 12,

  // Image (Default: on Left for eight_short_texts_image_v1)
  imageX: 44,
  imageY: 118,
  imageW: 342,
  imageH: 412,
  imageRadius: 16,
}

export function resolveEightShortTextsGeom(isRight = false) {
  if (isRight) {
    return {
      viewW: 1000,
      viewH: 560,
      badgeX: 44,
      badgeY: 20,
      badgeW: 180,
      badgeH: 22,
      headingX: 44,
      headingY: 46,
      headingW: 552,
      headingH: 34,
      subtitleX: 44,
      subtitleY: 82,
      subtitleW: 552,
      subtitleH: 22,
      gridStartX: 44,
      gridStartY: 118,
      cardW: 266,
      cardH: 94,
      colGap: 16,
      rowGap: 12,
      imageX: 614,
      imageY: 118,
      imageW: 342,
      imageH: 412,
      imageRadius: 16,
    }
  }

  return EIGHT_SHORT_TEXTS_IMAGE_GEOM
}

export function isEightShortTextsRightVariant(layoutId, schema = {}) {
  const id = String(layoutId || schema?.layout_id || schema?.layoutId || '').toLowerCase()
  const variant = String(schema?.preview?.gridVariant || schema?.gridVariant || '').toLowerCase()
  return id.includes('right') || variant === 'right'
}

export const EIGHT_SHORT_TEXTS_IMAGE_PALETTE = {
  primary: '#2563EB',
  accent: '#7C3AED',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',
  badgeBg: '#EFF6FF',
}

export const EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS = {
  BADGE: 'CORE CAPABILITIES',
  HEADING: 'Eight key points',
  SUBTITLE: 'Strategic operational framework and execution architecture',

  POINT_1_TITLE: 'Strategic Vision',
  POINT_1_DESC: 'Clear milestones aligned with long-term company objectives.',

  POINT_2_TITLE: 'Scalable Engine',
  POINT_2_DESC: 'High-concurrency infrastructure engineered for rapid growth.',

  POINT_3_TITLE: 'Automated Pipelines',
  POINT_3_DESC: 'Continuous integration driving frictionless deployment.',

  POINT_4_TITLE: 'Data Intelligence',
  POINT_4_DESC: 'Actionable real-time telemetry across distributed nodes.',

  POINT_5_TITLE: 'Enterprise Security',
  POINT_5_DESC: 'End-to-end encryption with granular compliance protocols.',

  POINT_6_TITLE: 'Customer Centricity',
  POINT_6_DESC: 'Intuitive user journeys backed by proactive feedback loops.',

  POINT_7_TITLE: 'Operational Agility',
  POINT_7_DESC: 'Rapid iteration cycles with resilient cross-functional teams.',

  POINT_8_TITLE: 'Global Reliability',
  POINT_8_DESC: '99.99% multi-region uptime with disaster recovery failover.',

  DEFAULT_IMAGE: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
}

/** Check if layout ID is Eight Short Texts Image */
export function isEightShortTextsImageLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return (
    id === 'eight_short_texts_image_v1' ||
    id === 'eight_short_texts_image_right_v1' ||
    id === 'eight_short_texts'
  )
}

/** Build Card Frame Graphic SVG with Numbered Badge */
export function buildPointCardSvg(w, h, numStr, color = '#2563EB') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" fill="none">
    <!-- Card Frame -->
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    
    <!-- Left Indicator Strip -->
    <rect x="1" y="16" width="3.5" height="${h - 32}" rx="1.75" fill="${color}" />

    <!-- Number Badge Pill -->
    <rect x="14" y="16" width="34" height="34" rx="8" fill="${color}" fill-opacity="0.1" />
    <text x="31" y="38" text-anchor="middle" fill="${color}" font-size="13" font-weight="800" font-family="Inter, sans-serif">${numStr}</text>
  </svg>`
}

/** Main Layout Compiler for Eight Short Texts Image */
export function layoutEightShortTextsImage(elements = [], schema = {}, palette = {}, canvas = {}) {
  const isRight = isEightShortTextsRightVariant(schema?.layout_id || schema?.id || schema?.layoutId, schema)
  const g = resolveEightShortTextsGeom(isRight)
  const canvasW = canvas?.width || 1000
  const canvasH = canvas?.height || 560
  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH

  const safeElements = Array.isArray(elements) ? elements : []
  const prevBySlot = new Map()
  safeElements.forEach((el) => {
    const sid = String(el.slotId || el.id || '').toUpperCase()
    if (sid) prevBySlot.set(sid, el)
  })

  const slots = Array.isArray(schema?.slots) ? schema.slots : []

  const getPrevText = (slotId, fallback) => {
    const prev = prevBySlot.get(slotId)
    if (prev?.content?.text !== undefined && prev?.content?.text !== null) return prev.content.text
    if (prev?.content?.html) return prev.content.html.replace(/<[^>]*>/g, '')
    const fromSlot = slots.find((s) => String(s.id).toUpperCase() === slotId)
    if (fromSlot?.placeholder_text) return fromSlot.placeholder_text
    return fallback
  }

  const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`
  const newElements = []

  const pushElement = (el) => {
    const rawRect = el.rect || el.placement || {}
    const x = Math.round(rawRect.x || 0)
    const y = Math.round(rawRect.y || 0)
    const width = Math.max(1, Math.round(rawRect.width || 10))
    const height = Math.max(1, Math.round(rawRect.height || 10))

    newElements.push({
      ...el,
      placement: {
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity: 1,
      },
      rect: {
        x,
        y,
        width,
        height,
      },
    })
  }

  const primaryColor = palette?.primary || EIGHT_SHORT_TEXTS_IMAGE_PALETTE.primary
  const accentColor = palette?.accent || EIGHT_SHORT_TEXTS_IMAGE_PALETTE.accent
  const textColor = palette?.text || EIGHT_SHORT_TEXTS_IMAGE_PALETTE.textDark
  const mutedColor = palette?.muted || EIGHT_SHORT_TEXTS_IMAGE_PALETTE.textMuted

  // 1. Top Category Pill Badge
  pushElement({
    id: prevBySlot.get('TAG_BADGE')?.id || newId('est-badge'),
    type: 'text',
    slotId: 'TAG_BADGE',
    layer: 10,
    rect: {
      x: g.badgeX * scaleX,
      y: g.badgeY * scaleY,
      width: g.badgeW * scaleX,
      height: g.badgeH * scaleY,
    },
    content: {
      text: getPrevText('TAG_BADGE', EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.BADGE),
      fontSize: 11,
      fontWeight: 700,
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      clipToSlot: false,
    },
  })

  // 2. Heading
  const headingText =
    getPrevText('HEADING', '') ||
    getPrevText('TITLE', '') ||
    EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.HEADING

  pushElement({
    id: prevBySlot.get('HEADING')?.id || newId('est-heading'),
    type: 'text',
    slotId: 'HEADING',
    layer: 10,
    rect: {
      x: g.headingX * scaleX,
      y: g.headingY * scaleY,
      width: g.headingW * scaleX,
      height: g.headingH * scaleY,
    },
    content: {
      text: headingText,
      fontSize: 28,
      fontWeight: 800,
      color: textColor,
      clipToSlot: false,
    },
  })

  // 3. Subtitle
  const subtitleText =
    getPrevText('SUBTITLE', '') ||
    EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.SUBTITLE

  pushElement({
    id: prevBySlot.get('SUBTITLE')?.id || newId('est-sub'),
    type: 'text',
    slotId: 'SUBTITLE',
    layer: 10,
    rect: {
      x: g.subtitleX * scaleX,
      y: g.subtitleY * scaleY,
      width: g.subtitleW * scaleX,
      height: g.subtitleH * scaleY,
    },
    content: {
      text: subtitleText,
      fontSize: 14,
      fontWeight: 500,
      color: mutedColor,
      clipToSlot: false,
    },
  })

  // 4. 8 Numbered Feature Cards (2 columns x 4 rows)
  for (let i = 1; i <= 8; i += 1) {
    const colIdx = (i - 1) % 2
    const rowIdx = Math.floor((i - 1) / 2)

    const cardX = g.gridStartX + colIdx * (g.cardW + g.colGap)
    const cardY = g.gridStartY + rowIdx * (g.cardH + g.rowGap)

    const numStr = String(i).padStart(2, '0')
    const itemColor = i % 2 === 1 ? primaryColor : accentColor

    const cardSlotId = `POINT_${i}_CARD`
    const titleSlotId = `POINT_${i}_TITLE`
    const legacyLabelSlotId = `POINT_${i}_LABEL`
    const descSlotId = `POINT_${i}_DESC`

    // Card Surface Graphic
    const prevCard = prevBySlot.get(cardSlotId)
    const activeColor = prevCard?.content?.fill || itemColor

    pushElement({
      id: prevCard?.id || newId(`est-c${i}-bg`),
      type: 'graphic',
      slotId: cardSlotId,
      layer: 2,
      rect: {
        x: cardX * scaleX,
        y: cardY * scaleY,
        width: g.cardW * scaleX,
        height: g.cardH * scaleY,
      },
      content: {
        svg: buildPointCardSvg(g.cardW, g.cardH, numStr, activeColor),
        colorMode: 'recolorable',
        fill: activeColor,
      },
    })

    // Point Title
    const titleText =
      getPrevText(titleSlotId, '') ||
      getPrevText(legacyLabelSlotId, '') ||
      EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_TITLE`]

    pushElement({
      id: prevBySlot.get(titleSlotId)?.id || prevBySlot.get(legacyLabelSlotId)?.id || newId(`est-c${i}-title`),
      type: 'text',
      slotId: titleSlotId,
      layer: 10,
      rect: {
        x: (cardX + 56) * scaleX,
        y: (cardY + 14) * scaleY,
        width: (g.cardW - 68) * scaleX,
        height: 22 * scaleY,
      },
      content: {
        text: titleText,
        fontSize: 14,
        fontWeight: 700,
        color: textColor,
        clipToSlot: false,
      },
    })

    // Point Description
    const descText =
      getPrevText(descSlotId, '') ||
      EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_DESC`]

    pushElement({
      id: prevBySlot.get(descSlotId)?.id || newId(`est-c${i}-desc`),
      type: 'text',
      slotId: descSlotId,
      layer: 10,
      rect: {
        x: (cardX + 56) * scaleX,
        y: (cardY + 38) * scaleY,
        width: (g.cardW - 68) * scaleX,
        height: 44 * scaleY,
      },
      content: {
        text: descText,
        fontSize: 11.5,
        fontWeight: 400,
        color: mutedColor,
        lineHeight: 1.35,
        clipToSlot: false,
      },
    })
  }

  // 5. Right Featured Hero Image (HERO_IMAGE)
  const prevImage = prevBySlot.get('HERO_IMAGE') || prevBySlot.get('IMAGE_1')
  const imageUrl =
    prevImage?.content?.url ||
    prevImage?.url ||
    EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.DEFAULT_IMAGE

  pushElement({
    id: prevImage?.id || newId('est-hero-img'),
    type: 'image',
    slotId: 'HERO_IMAGE',
    layer: 4,
    rect: {
      x: g.imageX * scaleX,
      y: g.imageY * scaleY,
      width: g.imageW * scaleX,
      height: g.imageH * scaleY,
    },
    content: {
      url: imageUrl,
      fit: 'cover',
      borderRadius: g.imageRadius,
    },
  })

  return newElements
}

/** Vector SVG Preview for Modal Thumbnail */
export function eightShortTextsImagePreviewSvg(options = {}) {
  const isRight = typeof options === 'boolean' ? options : (options?.isRight === true || options?.imagePosition === 'right')
  const g = resolveEightShortTextsGeom(isRight)
  const { width = 1000, height = 560 } = typeof options === 'object' ? options : {}

  const p1 = '#2563EB'
  const p2 = '#7C3AED'

  let cardsSvg = ''
  for (let i = 1; i <= 8; i += 1) {
    const colIdx = (i - 1) % 2
    const rowIdx = Math.floor((i - 1) / 2)
    const x = g.gridStartX + colIdx * (g.cardW + g.colGap)
    const y = g.gridStartY + rowIdx * (g.cardH + g.rowGap)
    const num = String(i).padStart(2, '0')
    const c = i % 2 === 1 ? p1 : p2

    cardsSvg += `
      <g transform="translate(${x}, ${y})">
        <rect width="${g.cardW}" height="${g.cardH}" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
        <rect x="1" y="16" width="3" height="${g.cardH - 32}" rx="1.5" fill="${c}" />
        <rect x="14" y="16" width="34" height="34" rx="8" fill="${c}" fill-opacity="0.12" />
        <text x="31" y="38" text-anchor="middle" fill="${c}" font-size="13" font-weight="800" font-family="Inter, sans-serif">${num}</text>
        <rect x="56" y="18" width="120" height="12" rx="3" fill="#0F172A" />
        <rect x="56" y="38" width="180" height="8" rx="2" fill="#94A3B8" />
        <rect x="56" y="50" width="140" height="8" rx="2" fill="#CBD5E1" />
      </g>
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" width="${width}" height="${height}">
    <rect width="1000" height="560" fill="#F8FAFC" />

    <!-- Top Badge -->
    <rect x="${g.badgeX}" y="${g.badgeY}" width="160" height="22" rx="11" fill="#2563EB" fill-opacity="0.12" />
    <text x="${g.badgeX + 10}" y="${g.badgeY + 15}" fill="#2563EB" font-size="10" font-weight="700" font-family="Inter, sans-serif" letter-spacing="0.08em">CORE CAPABILITIES</text>

    <!-- Heading & Subtitle -->
    <text x="${g.headingX}" y="${g.headingY + 24}" fill="#0F172A" font-size="28" font-weight="800" font-family="Inter, sans-serif">Eight key points</text>
    <text x="${g.subtitleX}" y="${g.subtitleY + 15}" fill="#64748B" font-size="14" font-weight="500" font-family="Inter, sans-serif">Strategic operational framework and execution architecture</text>

    <!-- 8 Cards Grid -->
    ${cardsSvg}

    <!-- Right Hero Image Frame -->
    <g transform="translate(${g.imageX}, ${g.imageY})">
      <rect width="${g.imageW}" height="${g.imageH}" rx="${g.imageRadius}" fill="#E2E8F0" />
      <!-- Image Graphic Overlay -->
      <path d="M 0 40 L ${g.imageW} 0 L ${g.imageW} ${g.imageH} L 0 ${g.imageH} Z" fill="#3B82F6" fill-opacity="0.15" />
      <circle cx="${g.imageW / 2}" cy="${g.imageH / 2 - 20}" r="36" fill="#FFFFFF" fill-opacity="0.9" />
      <!-- Landscape Icon -->
      <g transform="translate(${g.imageW / 2 - 16}, ${g.imageH / 2 - 36})" color="#2563EB">
        <rect x="0" y="0" width="32" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2" />
        <circle cx="9" cy="9" r="3" fill="currentColor" />
        <path d="M4 26l8-10 6 7 6-8 4 11H4z" fill="currentColor" fill-opacity="0.7" />
      </g>
      <!-- Bottom Badge -->
      <rect x="24" y="${g.imageH - 52}" width="${g.imageW - 48}" height="32" rx="8" fill="#FFFFFF" fill-opacity="0.95" />
      <text x="${g.imageW / 2}" y="${g.imageH - 32}" text-anchor="middle" fill="#1E293B" font-size="12" font-weight="700" font-family="Inter, sans-serif">Featured Architecture</text>
    </g>
  </svg>`
}
