/**
 * Grid Bento Three Layout Engine (Frontend)
 * Layout IDs:
 *  - grid_bento_three_v1
 *  - grid_bento_three
 *  - grid_three_asymmetric_v1
 *
 * Executive Bento Showcase:
 *  - Top Slide Header:
 *    - Pill Badge ("CURATED SHOWCASE")
 *    - Main Heading ("Three-part bento overview")
 *    - Subtitle ("Key flagship highlights and tailored solutions.")
 *  - 3 Bento Cards (matching reference layout):
 *    - Card 1 (Top Hero - Full Width):
 *      - Left: Category Tag ("FOOD & CULINARY"), Headline ("Wake Up and Smell the Coffee"), Description, CTA Pill ("Learn more →")
 *      - Right: Clean layout visual placeholder container (soft teal tint, no external photos yet)
 *    - Card 2 (Bottom Left - Half Width):
 *      - Category Tag ("ECO & SUSTAINABILITY"), Headline ("Purify the air in your home"), Description, CTA Pill ("Learn more →")
 *      - Right: Clean layout visual placeholder container (soft sky blue tint)
 *    - Card 3 (Bottom Right - Half Width):
 *      - Category Tag ("HEALTH & WELLNESS"), Headline ("Experience the fluidity of the gel"), Description, CTA Pill ("Learn more →")
 *      - Right: Clean layout visual placeholder container (soft blush rose tint)
 *  - Total Elements: ~21 elements (strictly <= 50) with complete placement coordinates.
 */

export const GRID_BENTO_THREE_GEOM = {
  viewW: 1000,
  viewH: 560,

  // Slide Header Area
  badgeX: 44,
  badgeY: 20,
  badgeW: 190,
  badgeH: 22,

  headingX: 44,
  headingY: 46,
  headingW: 912,
  headingH: 34,

  subtitleX: 44,
  subtitleY: 82,
  subtitleW: 912,
  subtitleH: 22,

  // Card 1: Top Hero Card (Full Width)
  card1: {
    x: 44,
    y: 116,
    w: 912,
    h: 188,
    radius: 18,
    // Content left
    tagX: 68,
    tagY: 136,
    tagW: 160,
    tagH: 22,
    titleX: 68,
    titleY: 164,
    titleW: 470,
    titleH: 30,
    bodyX: 68,
    bodyY: 198,
    bodyW: 470,
    bodyH: 42,
    ctaX: 68,
    ctaY: 248,
    ctaW: 120,
    ctaH: 34,
    // Visual placeholder right
    visualX: 560,
    visualY: 130,
    visualW: 376,
    visualH: 160,
    visualRadius: 14,
  },

  // Card 2: Bottom Left Card (Half Width)
  card2: {
    x: 44,
    y: 318,
    w: 448,
    h: 216,
    radius: 18,
    tagX: 66,
    tagY: 336,
    tagW: 150,
    tagH: 22,
    titleX: 66,
    titleY: 364,
    titleW: 224,
    titleH: 48,
    bodyX: 66,
    bodyY: 418,
    bodyW: 224,
    bodyH: 50,
    ctaX: 66,
    ctaY: 478,
    ctaW: 114,
    ctaH: 32,
    visualX: 304,
    visualY: 334,
    visualW: 172,
    visualH: 184,
    visualRadius: 14,
  },

  // Card 3: Bottom Right Card (Half Width)
  card3: {
    x: 508,
    y: 318,
    w: 448,
    h: 216,
    radius: 18,
    tagX: 530,
    tagY: 336,
    tagW: 150,
    tagH: 22,
    titleX: 530,
    titleY: 364,
    titleW: 224,
    titleH: 48,
    bodyX: 530,
    bodyY: 418,
    bodyW: 224,
    bodyH: 50,
    ctaX: 530,
    ctaY: 478,
    ctaW: 114,
    ctaH: 32,
    visualX: 768,
    visualY: 334,
    visualW: 172,
    visualH: 184,
    visualRadius: 14,
  },
}

export const GRID_BENTO_THEMES = [
  {
    tag: 'FOOD & CULINARY',
    primary: '#0D9488', // Emerald/Teal
    accent: '#14B8A6',
    tint: '#F0FDFA',
    border: '#CCFBF1',
    cardBg: '#FFFFFF',
    visualGradStart: '#E6FFFA',
    visualGradEnd: '#CCFBF1',
  },
  {
    tag: 'ECO & SUSTAINABILITY',
    primary: '#0284C7', // Sky Blue
    accent: '#38BDF8',
    tint: '#F0F9FF',
    border: '#BAE6FD',
    cardBg: '#FFFFFF',
    visualGradStart: '#F0F9FF',
    visualGradEnd: '#E0F2FE',
  },
  {
    tag: 'HEALTH & WELLNESS',
    primary: '#E11D48', // Rose / Blush
    accent: '#FB7185',
    tint: '#FFF1F2',
    border: '#FECDD3',
    cardBg: '#FFFFFF',
    visualGradStart: '#FFF1F2',
    visualGradEnd: '#FFE4E6',
  },
]

export const GRID_BENTO_THREE_DEFAULTS = {
  BADGE: 'CURATED SHOWCASE',
  HEADING: 'Three-part bento overview',
  SUBTITLE: 'Flagship product experiences, botanical purity, and sensory wellness highlights.',

  CARD_1_TAG: 'FOOD & CULINARY',
  CARD_1_TITLE: 'Wake Up and Smell the Coffee',
  CARD_1_BODY: 'Artisan morning rituals crafted with sustainably harvested beans and rich aromatic depth.',
  CARD_1_CTA: 'Learn more →',

  CARD_2_TAG: 'ECO & SUSTAINABILITY',
  CARD_2_TITLE: 'Purify the air in your home',
  CARD_2_BODY: 'Clean living botanicals designed to cultivate restorative atmospheres and indoor vitality.',
  CARD_2_CTA: 'Learn more →',

  CARD_3_TAG: 'HEALTH & WELLNESS',
  CARD_3_TITLE: 'Experience the fluidity of the gel',
  CARD_3_BODY: 'Lightweight, ultra-hydrating formulations engineered for daily cellular renewal.',
  CARD_3_CTA: 'Learn more →',
}

export function isGridBentoThreeLayout(layoutId) {
  const id = String(layoutId || '').trim().toLowerCase()
  return (
    id === 'grid_bento_three_v1' ||
    id === 'grid_bento_three' ||
    id === 'grid_three_asymmetric_v1'
  )
}

/**
 * Builds SVG card background with subtle gradient accents, delicate border, and soft drop shadow.
 */
export function buildBentoCardShapeSvg(cardIdx, width, height, radius = 18) {
  const theme = GRID_BENTO_THEMES[cardIdx] || GRID_BENTO_THEMES[0]
  const { primary, accent, tint, border } = theme

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="bgrad-${cardIdx}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="70%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="${tint}" stop-opacity="0.8" />
      </linearGradient>
      <filter id="bshad-${cardIdx}" x="-4%" y="-6%" width="108%" height="116%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.04" />
      </filter>
    </defs>
    <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="${radius}" fill="url(#bgrad-${cardIdx})" stroke="${border}" stroke-width="1.5" filter="url(#bshad-${cardIdx})" />
    <!-- Top-left accent highlight bar -->
    <path d="M 2 20 Q 2 2 20 2 L 60 2 Q 2 2 2 60 Z" fill="${primary}" opacity="0.08" />
  </svg>`
}

/**
 * Builds the visual placeholder layout container (no photo baked in, sleek layout structure).
 */
export function buildBentoVisualPlaceholderSvg(cardIdx, width, height, radius = 14) {
  const theme = GRID_BENTO_THEMES[cardIdx] || GRID_BENTO_THEMES[0]
  const { primary, border, visualGradStart, visualGradEnd } = theme

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="vgrad-${cardIdx}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${visualGradStart}" />
        <stop offset="100%" stop-color="${visualGradEnd}" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius}" fill="url(#vgrad-${cardIdx})" stroke="${border}" stroke-width="1.2" />
    <!-- Layout grid composition markers -->
    <line x1="${width * 0.33}" y1="8" x2="${width * 0.33}" y2="${height - 8}" stroke="${primary}" stroke-width="1" stroke-dasharray="3,3" opacity="0.18" />
    <line x1="${width * 0.66}" y1="8" x2="${width * 0.66}" y2="${height - 8}" stroke="${primary}" stroke-width="1" stroke-dasharray="3,3" opacity="0.18" />
    <line x1="8" y1="${height * 0.5}" x2="${width - 8}" y2="${height * 0.5}" stroke="${primary}" stroke-width="1" stroke-dasharray="3,3" opacity="0.18" />
    <!-- Visual slot camera / asset container glyph -->
    <g transform="translate(${width / 2 - 16}, ${height / 2 - 16})" opacity="0.45">
      <rect x="2" y="5" width="28" height="22" rx="4" fill="none" stroke="${primary}" stroke-width="2" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="${primary}" stroke-width="2" />
      <path d="M 10 5 L 12 2 L 20 2 L 22 5 Z" fill="none" stroke="${primary}" stroke-width="2" />
    </g>
    <!-- Label badge -->
    <g transform="translate(${width / 2 - 40}, ${height - 28})">
      <rect width="80" height="18" rx="9" fill="#FFFFFF" opacity="0.85" />
      <text x="40" y="12.5" text-anchor="middle" fill="${primary}" font-size="8.5" font-weight="700" font-family="Inter, system-ui, sans-serif" letter-spacing="0.08em">VISUAL SLOT</text>
    </g>
  </svg>`
}

/**
 * Builds CTA Pill Button SVG
 */
export function buildCtaButtonSvg(cardIdx, width, height) {
  const theme = GRID_BENTO_THEMES[cardIdx] || GRID_BENTO_THEMES[0]
  const { primary, border } = theme

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${height / 2}" fill="#FFFFFF" stroke="${border}" stroke-width="1.2" />
  </svg>`
}

/**
 * Layout compiler generating standard canvas elements for Grid Bento Three.
 */
export function layoutGridBentoThree(elements = [], schema = {}, palette = {}, canvas = {}) {
  const geom = GRID_BENTO_THREE_GEOM
  const defaults = GRID_BENTO_THREE_DEFAULTS

  const canvasW = canvas?.width || 1000
  const canvasH = canvas?.height || 560
  const scaleX = canvasW / geom.viewW
  const scaleY = canvasH / geom.viewH

  // Extract existing text content or use defaults
  const contentMap = {}
  for (const el of elements) {
    const sid = el.slotId || el.slot_id
    if (sid) {
      if (typeof el.content?.text === 'string' && el.content.text.trim()) {
        contentMap[sid] = el.content.text
      } else if (typeof el.text === 'string' && el.text.trim()) {
        contentMap[sid] = el.text
      }
    }
  }

  const getSlot = (id, fallback) => contentMap[id] || defaults[id] || fallback

  const badgeText = getSlot('BADGE', defaults.BADGE)
  const headingText = getSlot('HEADING', defaults.HEADING)
  const subtitleText = getSlot('SUBTITLE', defaults.SUBTITLE)

  const card1Tag = getSlot('CARD_1_TAG', defaults.CARD_1_TAG)
  const card1Title = getSlot('CARD_1_TITLE', defaults.CARD_1_TITLE)
  const card1Body = getSlot('CARD_1_BODY', defaults.CARD_1_BODY)
  const card1Cta = getSlot('CARD_1_CTA', defaults.CARD_1_CTA)

  const card2Tag = getSlot('CARD_2_TAG', defaults.CARD_2_TAG)
  const card2Title = getSlot('CARD_2_TITLE', defaults.CARD_2_TITLE)
  const card2Body = getSlot('CARD_2_BODY', defaults.CARD_2_BODY)
  const card2Cta = getSlot('CARD_2_CTA', defaults.CARD_2_CTA)

  const card3Tag = getSlot('CARD_3_TAG', defaults.CARD_3_TAG)
  const card3Title = getSlot('CARD_3_TITLE', defaults.CARD_3_TITLE)
  const card3Body = getSlot('CARD_3_BODY', defaults.CARD_3_BODY)
  const card3Cta = getSlot('CARD_3_CTA', defaults.CARD_3_CTA)

  const finalElements = []

  const pushElement = (el) => {
    const rx = el.placement?.x ?? el.rect?.x ?? el.x ?? 0
    const ry = el.placement?.y ?? el.rect?.y ?? el.y ?? 0
    const rw = el.placement?.width ?? el.rect?.width ?? el.width ?? 100
    const rh = el.placement?.height ?? el.rect?.height ?? el.height ?? 50
    const placement = {
      x: Math.round(rx),
      y: Math.round(ry),
      width: Math.max(1, Math.round(rw)),
      height: Math.max(1, Math.round(rh)),
      rotation: el.placement?.rotation ?? 0,
      opacity: el.placement?.opacity != null ? el.placement.opacity : 1,
    }
    const rect = {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    }
    const out = {
      ...el,
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      placement,
      rect,
    }
    if (el.type === 'text') {
      out.content = {
        text: el.text || el.content?.text || '',
        fontSize: el.fontSize || el.content?.fontSize || 14,
        fontWeight: el.fontWeight || el.content?.fontWeight || 400,
        color: el.color || el.content?.color || '#0F172A',
        lineHeight: el.lineHeight || el.content?.lineHeight || 1.4,
        letterSpacing: el.letterSpacing || el.content?.letterSpacing || 'normal',
        clipToSlot: false,
        ...(el.content || {}),
      }
    } else if (el.type === 'shape') {
      out.content = {
        svg: el.svgContent || el.content?.svg || '',
        colorMode: 'recolorable',
        ...(el.content || {}),
      }
    }
    finalElements.push(out)
  }

  // 1. Slide Header Elements
  pushElement({
    id: 'bento_header_badge',
    type: 'text',
    slotId: 'BADGE',
    layer: 10,
    text: badgeText,
    x: geom.badgeX * scaleX,
    y: geom.badgeY * scaleY,
    width: geom.badgeW * scaleX,
    height: geom.badgeH * scaleY,
    fontSize: 11,
    fontWeight: 700,
    color: '#0D9488',
    lineHeight: 1.2,
    letterSpacing: '0.08em',
    role: 'eyebrow',
  })

  pushElement({
    id: 'bento_header_heading',
    type: 'text',
    slotId: 'HEADING',
    layer: 10,
    text: headingText,
    x: geom.headingX * scaleX,
    y: geom.headingY * scaleY,
    width: geom.headingW * scaleX,
    height: geom.headingH * scaleY,
    fontSize: 28,
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.15,
    role: 'heading',
  })

  pushElement({
    id: 'bento_header_subtitle',
    type: 'text',
    slotId: 'SUBTITLE',
    layer: 10,
    text: subtitleText,
    x: geom.subtitleX * scaleX,
    y: geom.subtitleY * scaleY,
    width: geom.subtitleW * scaleX,
    height: geom.subtitleH * scaleY,
    fontSize: 14,
    fontWeight: 400,
    color: '#64748B',
    lineHeight: 1.4,
    role: 'subheading',
  })

  // 2. Card 1 (Top Hero Card)
  pushElement({
    id: 'bento_card_1_bg',
    type: 'shape',
    role: 'card',
    slotId: 'CARD_1_BG',
    layer: 2,
    x: geom.card1.x * scaleX,
    y: geom.card1.y * scaleY,
    width: geom.card1.w * scaleX,
    height: geom.card1.h * scaleY,
    svgContent: buildBentoCardShapeSvg(0, geom.card1.w, geom.card1.h, geom.card1.radius),
  })

  pushElement({
    id: 'bento_card_1_tag',
    type: 'text',
    slotId: 'CARD_1_TAG',
    layer: 10,
    text: card1Tag,
    x: geom.card1.tagX * scaleX,
    y: geom.card1.tagY * scaleY,
    width: geom.card1.tagW * scaleX,
    height: geom.card1.tagH * scaleY,
    fontSize: 11,
    fontWeight: 800,
    color: GRID_BENTO_THEMES[0].primary,
    letterSpacing: '0.07em',
  })

  pushElement({
    id: 'bento_card_1_title',
    type: 'text',
    slotId: 'CARD_1_TITLE',
    layer: 10,
    text: card1Title,
    x: geom.card1.titleX * scaleX,
    y: geom.card1.titleY * scaleY,
    width: geom.card1.titleW * scaleX,
    height: geom.card1.titleH * scaleY,
    fontSize: 22,
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.2,
  })

  pushElement({
    id: 'bento_card_1_body',
    type: 'text',
    slotId: 'CARD_1_BODY',
    layer: 10,
    text: card1Body,
    x: geom.card1.bodyX * scaleX,
    y: geom.card1.bodyY * scaleY,
    width: geom.card1.bodyW * scaleX,
    height: geom.card1.bodyH * scaleY,
    fontSize: 13,
    fontWeight: 400,
    color: '#475569',
    lineHeight: 1.45,
  })

  pushElement({
    id: 'bento_card_1_cta',
    type: 'text',
    slotId: 'CARD_1_CTA',
    layer: 10,
    text: card1Cta,
    x: geom.card1.ctaX * scaleX,
    y: geom.card1.ctaY * scaleY,
    width: geom.card1.ctaW * scaleX,
    height: geom.card1.ctaH * scaleY,
    fontSize: 12,
    fontWeight: 700,
    color: GRID_BENTO_THEMES[0].primary,
  })

  pushElement({
    id: 'bento_card_1_visual',
    type: 'shape',
    role: 'visual',
    slotId: 'IMAGE_1',
    layer: 4,
    x: geom.card1.visualX * scaleX,
    y: geom.card1.visualY * scaleY,
    width: geom.card1.visualW * scaleX,
    height: geom.card1.visualH * scaleY,
    svgContent: buildBentoVisualPlaceholderSvg(0, geom.card1.visualW, geom.card1.visualH, geom.card1.visualRadius),
  })

  // 3. Card 2 (Bottom Left Card)
  pushElement({
    id: 'bento_card_2_bg',
    type: 'shape',
    role: 'card',
    slotId: 'CARD_2_BG',
    layer: 2,
    x: geom.card2.x * scaleX,
    y: geom.card2.y * scaleY,
    width: geom.card2.w * scaleX,
    height: geom.card2.h * scaleY,
    svgContent: buildBentoCardShapeSvg(1, geom.card2.w, geom.card2.h, geom.card2.radius),
  })

  pushElement({
    id: 'bento_card_2_tag',
    type: 'text',
    slotId: 'CARD_2_TAG',
    layer: 10,
    text: card2Tag,
    x: geom.card2.tagX * scaleX,
    y: geom.card2.tagY * scaleY,
    width: geom.card2.tagW * scaleX,
    height: geom.card2.tagH * scaleY,
    fontSize: 10.5,
    fontWeight: 800,
    color: GRID_BENTO_THEMES[1].primary,
    letterSpacing: '0.07em',
  })

  pushElement({
    id: 'bento_card_2_title',
    type: 'text',
    slotId: 'CARD_2_TITLE',
    layer: 10,
    text: card2Title,
    x: geom.card2.titleX * scaleX,
    y: geom.card2.titleY * scaleY,
    width: geom.card2.titleW * scaleX,
    height: geom.card2.titleH * scaleY,
    fontSize: 18,
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.25,
  })

  pushElement({
    id: 'bento_card_2_body',
    type: 'text',
    slotId: 'CARD_2_BODY',
    layer: 10,
    text: card2Body,
    x: geom.card2.bodyX * scaleX,
    y: geom.card2.bodyY * scaleY,
    width: geom.card2.bodyW * scaleX,
    height: geom.card2.bodyH * scaleY,
    fontSize: 12,
    fontWeight: 400,
    color: '#475569',
    lineHeight: 1.4,
  })

  pushElement({
    id: 'bento_card_2_cta',
    type: 'text',
    slotId: 'CARD_2_CTA',
    layer: 10,
    text: card2Cta,
    x: geom.card2.ctaX * scaleX,
    y: geom.card2.ctaY * scaleY,
    width: geom.card2.ctaW * scaleX,
    height: geom.card2.ctaH * scaleY,
    fontSize: 12,
    fontWeight: 700,
    color: GRID_BENTO_THEMES[1].primary,
  })

  pushElement({
    id: 'bento_card_2_visual',
    type: 'shape',
    role: 'visual',
    slotId: 'IMAGE_2',
    layer: 4,
    x: geom.card2.visualX * scaleX,
    y: geom.card2.visualY * scaleY,
    width: geom.card2.visualW * scaleX,
    height: geom.card2.visualH * scaleY,
    svgContent: buildBentoVisualPlaceholderSvg(1, geom.card2.visualW, geom.card2.visualH, geom.card2.visualRadius),
  })

  // 4. Card 3 (Bottom Right Card)
  pushElement({
    id: 'bento_card_3_bg',
    type: 'shape',
    role: 'card',
    slotId: 'CARD_3_BG',
    layer: 2,
    x: geom.card3.x * scaleX,
    y: geom.card3.y * scaleY,
    width: geom.card3.w * scaleX,
    height: geom.card3.h * scaleY,
    svgContent: buildBentoCardShapeSvg(2, geom.card3.w, geom.card3.h, geom.card3.radius),
  })

  pushElement({
    id: 'bento_card_3_tag',
    type: 'text',
    slotId: 'CARD_3_TAG',
    layer: 10,
    text: card3Tag,
    x: geom.card3.tagX * scaleX,
    y: geom.card3.tagY * scaleY,
    width: geom.card3.tagW * scaleX,
    height: geom.card3.tagH * scaleY,
    fontSize: 10.5,
    fontWeight: 800,
    color: GRID_BENTO_THEMES[2].primary,
    letterSpacing: '0.07em',
  })

  pushElement({
    id: 'bento_card_3_title',
    type: 'text',
    slotId: 'CARD_3_TITLE',
    layer: 10,
    text: card3Title,
    x: geom.card3.titleX * scaleX,
    y: geom.card3.titleY * scaleY,
    width: geom.card3.titleW * scaleX,
    height: geom.card3.titleH * scaleY,
    fontSize: 18,
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.25,
  })

  pushElement({
    id: 'bento_card_3_body',
    type: 'text',
    slotId: 'CARD_3_BODY',
    layer: 10,
    text: card3Body,
    x: geom.card3.bodyX * scaleX,
    y: geom.card3.bodyY * scaleY,
    width: geom.card3.bodyW * scaleX,
    height: geom.card3.bodyH * scaleY,
    fontSize: 12,
    fontWeight: 400,
    color: '#475569',
    lineHeight: 1.4,
  })

  pushElement({
    id: 'bento_card_3_cta',
    type: 'text',
    slotId: 'CARD_3_CTA',
    layer: 10,
    text: card3Cta,
    x: geom.card3.ctaX * scaleX,
    y: geom.card3.ctaY * scaleY,
    width: geom.card3.ctaW * scaleX,
    height: geom.card3.ctaH * scaleY,
    fontSize: 12,
    fontWeight: 700,
    color: GRID_BENTO_THEMES[2].primary,
  })

  pushElement({
    id: 'bento_card_3_visual',
    type: 'shape',
    role: 'visual',
    slotId: 'IMAGE_3',
    layer: 4,
    x: geom.card3.visualX * scaleX,
    y: geom.card3.visualY * scaleY,
    width: geom.card3.visualW * scaleX,
    height: geom.card3.visualH * scaleY,
    svgContent: buildBentoVisualPlaceholderSvg(2, geom.card3.visualW, geom.card3.visualH, geom.card3.visualRadius),
  })

  return finalElements
}

/**
 * Generates standalone pixel-perfect SVG preview for catalog cards.
 */
export function gridBentoThreePreviewSvg(options = {}) {
  const geom = GRID_BENTO_THREE_GEOM
  const defaults = GRID_BENTO_THREE_DEFAULTS

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geom.viewW} ${geom.viewH}" width="100%" height="100%">
    <defs>
      <!-- Subtle drop shadows -->
      <filter id="bento-card-shad" x="-3%" y="-4%" width="106%" height="112%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.05" />
      </filter>
      <!-- Gradient Card 1 (Teal) -->
      <linearGradient id="bgrad-0" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#F0FDFA" stop-opacity="0.8" />
      </linearGradient>
      <!-- Gradient Card 2 (Sky) -->
      <linearGradient id="bgrad-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#F0F9FF" stop-opacity="0.8" />
      </linearGradient>
      <!-- Gradient Card 3 (Blush) -->
      <linearGradient id="bgrad-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#FFF1F2" stop-opacity="0.8" />
      </linearGradient>
    </defs>

    <!-- Slide Background -->
    <rect width="100%" height="100%" fill="#F8FAFC" />

    <!-- Slide Header -->
    <g transform="translate(${geom.badgeX}, ${geom.badgeY})">
      <rect width="140" height="20" rx="10" fill="#CCFBF1" />
      <text x="70" y="14" text-anchor="middle" fill="#0D9488" font-size="10" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">${defaults.BADGE}</text>
    </g>
    <text x="${geom.headingX}" y="${geom.headingY + 24}" fill="#0F172A" font-size="26" font-weight="800" font-family="Inter, system-ui, sans-serif">${defaults.HEADING}</text>
    <text x="${geom.subtitleX}" y="${geom.subtitleY + 16}" fill="#64748B" font-size="13" font-weight="400" font-family="Inter, system-ui, sans-serif">${defaults.SUBTITLE}</text>

    <!-- Card 1: Top Hero Bento -->
    <g>
      <rect x="${geom.card1.x}" y="${geom.card1.y}" width="${geom.card1.w}" height="${geom.card1.h}" rx="${geom.card1.radius}" fill="url(#bgrad-0)" stroke="#CCFBF1" stroke-width="1.5" filter="url(#bento-card-shad)" />
      <!-- Content Left -->
      <g transform="translate(${geom.card1.tagX}, ${geom.card1.tagY})">
        <rect width="116" height="20" rx="6" fill="#F0FDFA" stroke="#CCFBF1" stroke-width="1" />
        <text x="58" y="14" text-anchor="middle" fill="#0D9488" font-size="9.5" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">${defaults.CARD_1_TAG}</text>
      </g>
      <text x="${geom.card1.titleX}" y="${geom.card1.titleY + 20}" fill="#0F172A" font-size="21" font-weight="800" font-family="Inter, system-ui, sans-serif">${defaults.CARD_1_TITLE}</text>
      <text x="${geom.card1.bodyX}" y="${geom.card1.bodyY + 15}" fill="#475569" font-size="12.5" font-weight="400" font-family="Inter, system-ui, sans-serif">${defaults.CARD_1_BODY}</text>
      <!-- CTA Pill -->
      <g transform="translate(${geom.card1.ctaX}, ${geom.card1.ctaY})">
        <rect width="${geom.card1.ctaW}" height="${geom.card1.ctaH}" rx="17" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.2" />
        <text x="${geom.card1.ctaW / 2}" y="21" text-anchor="middle" fill="#0D9488" font-size="12" font-weight="700" font-family="Inter, system-ui, sans-serif">${defaults.CARD_1_CTA}</text>
      </g>
      <!-- Visual Placeholder Right -->
      <g transform="translate(${geom.card1.visualX}, ${geom.card1.visualY})">
        <rect width="${geom.card1.visualW}" height="${geom.card1.visualH}" rx="${geom.card1.visualRadius}" fill="#E6FFFA" stroke="#CCFBF1" stroke-width="1.2" />
        <!-- Grid guidelines -->
        <line x1="${geom.card1.visualW * 0.33}" y1="8" x2="${geom.card1.visualW * 0.33}" y2="${geom.card1.visualH - 8}" stroke="#0D9488" stroke-width="1" stroke-dasharray="3,3" opacity="0.25" />
        <line x1="${geom.card1.visualW * 0.66}" y1="8" x2="${geom.card1.visualW * 0.66}" y2="${geom.card1.visualH - 8}" stroke="#0D9488" stroke-width="1" stroke-dasharray="3,3" opacity="0.25" />
        <!-- Camera Icon -->
        <g transform="translate(${geom.card1.visualW / 2 - 14}, ${geom.card1.visualH / 2 - 18})" opacity="0.5">
          <rect x="2" y="5" width="24" height="18" rx="3" fill="none" stroke="#0D9488" stroke-width="2" />
          <circle cx="14" cy="14" r="5" fill="none" stroke="#0D9488" stroke-width="2" />
          <path d="M 9 5 L 11 2 L 17 2 L 19 5 Z" fill="none" stroke="#0D9488" stroke-width="2" />
        </g>
        <rect x="${geom.card1.visualW / 2 - 42}" y="${geom.card1.visualH - 26}" width="84" height="18" rx="9" fill="#FFFFFF" opacity="0.85" />
        <text x="${geom.card1.visualW / 2}" y="${geom.card1.visualH - 14}" text-anchor="middle" fill="#0D9488" font-size="9" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">VISUAL SLOT</text>
      </g>
    </g>

    <!-- Card 2: Bottom Left Bento -->
    <g>
      <rect x="${geom.card2.x}" y="${geom.card2.y}" width="${geom.card2.w}" height="${geom.card2.h}" rx="${geom.card2.radius}" fill="url(#bgrad-1)" stroke="#BAE6FD" stroke-width="1.5" filter="url(#bento-card-shad)" />
      <!-- Content Left -->
      <g transform="translate(${geom.card2.tagX}, ${geom.card2.tagY})">
        <rect width="124" height="20" rx="6" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1" />
        <text x="62" y="14" text-anchor="middle" fill="#0284C7" font-size="9" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">${defaults.CARD_2_TAG}</text>
      </g>
      <text x="${geom.card2.titleX}" y="${geom.card2.titleY + 18}" fill="#0F172A" font-size="17" font-weight="800" font-family="Inter, system-ui, sans-serif">${defaults.CARD_2_TITLE}</text>
      <text x="${geom.card2.bodyX}" y="${geom.card2.bodyY + 15}" fill="#475569" font-size="11.5" font-weight="400" font-family="Inter, system-ui, sans-serif">${defaults.CARD_2_BODY}</text>
      <!-- CTA Pill -->
      <g transform="translate(${geom.card2.ctaX}, ${geom.card2.ctaY})">
        <rect width="${geom.card2.ctaW}" height="${geom.card2.ctaH}" rx="16" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.2" />
        <text x="${geom.card2.ctaW / 2}" y="20" text-anchor="middle" fill="#0284C7" font-size="11.5" font-weight="700" font-family="Inter, system-ui, sans-serif">${defaults.CARD_2_CTA}</text>
      </g>
      <!-- Visual Placeholder Right -->
      <g transform="translate(${geom.card2.visualX}, ${geom.card2.visualY})">
        <rect width="${geom.card2.visualW}" height="${geom.card2.visualH}" rx="${geom.card2.visualRadius}" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.2" />
        <g transform="translate(${geom.card2.visualW / 2 - 14}, ${geom.card2.visualH / 2 - 18})" opacity="0.5">
          <rect x="2" y="5" width="24" height="18" rx="3" fill="none" stroke="#0284C7" stroke-width="2" />
          <circle cx="14" cy="14" r="5" fill="none" stroke="#0284C7" stroke-width="2" />
          <path d="M 9 5 L 11 2 L 17 2 L 19 5 Z" fill="none" stroke="#0284C7" stroke-width="2" />
        </g>
        <rect x="${geom.card2.visualW / 2 - 40}" y="${geom.card2.visualH - 26}" width="80" height="18" rx="9" fill="#FFFFFF" opacity="0.85" />
        <text x="${geom.card2.visualW / 2}" y="${geom.card2.visualH - 14}" text-anchor="middle" fill="#0284C7" font-size="8.5" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">VISUAL SLOT</text>
      </g>
    </g>

    <!-- Card 3: Bottom Right Bento -->
    <g>
      <rect x="${geom.card3.x}" y="${geom.card3.y}" width="${geom.card3.w}" height="${geom.card3.h}" rx="${geom.card3.radius}" fill="url(#bgrad-2)" stroke="#FECDD3" stroke-width="1.5" filter="url(#bento-card-shad)" />
      <!-- Content Left -->
      <g transform="translate(${geom.card3.tagX}, ${geom.card3.tagY})">
        <rect width="124" height="20" rx="6" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1" />
        <text x="62" y="14" text-anchor="middle" fill="#E11D48" font-size="9" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">${defaults.CARD_3_TAG}</text>
      </g>
      <text x="${geom.card3.titleX}" y="${geom.card3.titleY + 18}" fill="#0F172A" font-size="17" font-weight="800" font-family="Inter, system-ui, sans-serif">${defaults.CARD_3_TITLE}</text>
      <text x="${geom.card3.bodyX}" y="${geom.card3.bodyY + 15}" fill="#475569" font-size="11.5" font-weight="400" font-family="Inter, system-ui, sans-serif">${defaults.CARD_3_BODY}</text>
      <!-- CTA Pill -->
      <g transform="translate(${geom.card3.ctaX}, ${geom.card3.ctaY})">
        <rect width="${geom.card3.ctaW}" height="${geom.card3.ctaH}" rx="16" fill="#FFFFFF" stroke="#E11D48" stroke-width="1.2" />
        <text x="${geom.card3.ctaW / 2}" y="20" text-anchor="middle" fill="#E11D48" font-size="11.5" font-weight="700" font-family="Inter, system-ui, sans-serif">${defaults.CARD_3_CTA}</text>
      </g>
      <!-- Visual Placeholder Right -->
      <g transform="translate(${geom.card3.visualX}, ${geom.card3.visualY})">
        <rect width="${geom.card3.visualW}" height="${geom.card3.visualH}" rx="${geom.card3.visualRadius}" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1.2" />
        <g transform="translate(${geom.card3.visualW / 2 - 14}, ${geom.card3.visualH / 2 - 18})" opacity="0.5">
          <rect x="2" y="5" width="24" height="18" rx="3" fill="none" stroke="#E11D48" stroke-width="2" />
          <circle cx="14" cy="14" r="5" fill="none" stroke="#E11D48" stroke-width="2" />
          <path d="M 9 5 L 11 2 L 17 2 L 19 5 Z" fill="none" stroke="#E11D48" stroke-width="2" />
        </g>
        <rect x="${geom.card3.visualW / 2 - 40}" y="${geom.card3.visualH - 26}" width="80" height="18" rx="9" fill="#FFFFFF" opacity="0.85" />
        <text x="${geom.card3.visualW / 2}" y="${geom.card3.visualH - 14}" text-anchor="middle" fill="#E11D48" font-size="8.5" font-weight="800" font-family="Inter, system-ui, sans-serif" letter-spacing="0.06em">VISUAL SLOT</text>
      </g>
    </g>
  </svg>`
}
