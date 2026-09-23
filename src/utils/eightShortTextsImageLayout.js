/**
 * Eight Short Texts Image
 * Layout IDs: eight_short_texts_image_v1, eight_short_texts_image_right_v1
 *
 * Tall photo + 8 numbered points in two columns. Recolorable row chrome.
 */

export const EIGHT_SHORT_TEXTS_IMAGE_GEOM = {
  viewW: 1000,
  viewH: 560,
  badgeX: 404,
  badgeY: 22,
  badgeW: 220,
  badgeH: 18,
  headingX: 404,
  headingY: 44,
  headingW: 560,
  headingH: 32,
  subtitleX: 404,
  subtitleY: 78,
  subtitleW: 560,
  subtitleH: 20,
  gridStartX: 404,
  gridStartY: 108,
  cardW: 272,
  cardH: 100,
  colGap: 16,
  rowGap: 8,
  imageX: 28,
  imageY: 28,
  imageW: 352,
  imageH: 504,
  imageRadius: 18,
}

export function resolveEightShortTextsGeom(isRight = false) {
  if (isRight) {
    return {
      ...EIGHT_SHORT_TEXTS_IMAGE_GEOM,
      badgeX: 28,
      headingX: 28,
      subtitleX: 28,
      gridStartX: 28,
      imageX: 620,
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
  primary: '#148A80',
  accent: '#148A80',
  textDark: '#111827',
  textMuted: '#6B7280',
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
}

export function isEightShortTextsImageLayout(layoutId) {
  const id = String(layoutId || '').toLowerCase()
  return (
    id === 'eight_short_texts_image_v1' ||
    id === 'eight_short_texts_image_right_v1' ||
    id === 'eight_short_texts'
  )
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrapLines(text, maxChars, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)
  return lines.slice(0, maxLines)
}

export function buildPointCardSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
    <rect width="${w}" height="${h}" fill="#FBFBFA" pointer-events="all" />
    <rect x="0" y="${h - 1}" width="${w}" height="1" fill="currentColor" fill-opacity="0.16" />
  </svg>`
}

function resolveStoredColor(el, fallback) {
  const fill = el?.content?.fill
  if (typeof fill === 'string' && fill && fill !== 'none' && fill !== 'transparent') return fill
  if (fill && typeof fill === 'object' && fill.color) return fill.color
  return fallback
}

export function layoutEightShortTextsImage(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const isRight = isEightShortTextsRightVariant(schema?.layout_id || schema?.id || schema?.layoutId, schema)
  const g = resolveEightShortTextsGeom(isRight)
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1000
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 560
  const scaleX = canvasW / g.viewW
  const scaleY = canvasH / g.viewH
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || EIGHT_SHORT_TEXTS_IMAGE_PALETTE.primary

  const prevBySlot = new Map()
  elements.forEach((el) => {
    const sid = String(el.slotId || '').toUpperCase()
    if (sid) prevBySlot.set(sid, el)
  })

  const getPrevText = (slotId, fallback) => {
    const prev = prevBySlot.get(slotId)
    const txt = prev?.content?.text || prev?.text
    if (txt && String(txt).trim()) return String(txt).trim()
    return fallback
  }

  const newElements = []
  const pushText = (config) => {
    const placement = {
      x: Math.round(config.x),
      y: Math.round(config.y),
      width: Math.max(1, Math.round(config.width)),
      height: Math.max(1, Math.round(config.height)),
      rotation: 0,
      opacity: 1,
    }
    newElements.push({
      id: config.id,
      type: 'text',
      slotId: config.slotId,
      role: config.role || 'body',
      layer: 10,
      placement,
      rect: { ...placement },
      content: {
        text: config.text,
        fontSize: config.fontSize,
        fontWeight: config.fontWeight || 500,
        color: config.color,
        align: 'left',
        lineHeight: config.lineHeight || 1.2,
        letterSpacing: config.letterSpacing || 'normal',
        clipToSlot: true,
        maxLines: config.maxLines || 2,
      },
    })
  }
  const pushGraphic = (config) => {
    const placement = {
      x: Math.round(config.x),
      y: Math.round(config.y),
      width: Math.max(1, Math.round(config.width)),
      height: Math.max(1, Math.round(config.height)),
      rotation: 0,
      opacity: 1,
    }
    newElements.push({
      id: config.id,
      type: 'graphic',
      slotId: config.slotId,
      role: 'decoration',
      layer: config.layer || 2,
      placement,
      rect: { ...placement },
      content: {
        svg: config.svg,
        preserveAspectRatio: 'none',
        colorMode: 'recolorable',
        fill: config.fill,
        stroke: config.fill,
      },
    })
  }

  pushText({
    id: prevBySlot.get('TAG_BADGE')?.id || 'est_badge',
    slotId: 'TAG_BADGE',
    role: 'caption',
    text: String(getPrevText('TAG_BADGE', EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.BADGE)).toUpperCase(),
    x: g.badgeX * scaleX,
    y: g.badgeY * scaleY,
    width: g.badgeW * scaleX,
    height: g.badgeH * scaleY,
    fontSize: 11,
    fontWeight: 700,
    color: accent,
    letterSpacing: '0.16em',
    maxLines: 1,
  })

  pushText({
    id: prevBySlot.get('HEADING')?.id || 'est_heading',
    slotId: 'HEADING',
    role: 'heading',
    text: getPrevText('HEADING', '') || getPrevText('TITLE', '') || EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.HEADING,
    x: g.headingX * scaleX,
    y: g.headingY * scaleY,
    width: g.headingW * scaleX,
    height: g.headingH * scaleY,
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    maxLines: 1,
  })

  pushText({
    id: prevBySlot.get('SUBTITLE')?.id || 'est_sub',
    slotId: 'SUBTITLE',
    role: 'subheading',
    text: getPrevText('SUBTITLE', EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.SUBTITLE),
    x: g.subtitleX * scaleX,
    y: g.subtitleY * scaleY,
    width: g.subtitleW * scaleX,
    height: g.subtitleH * scaleY,
    fontSize: 13,
    fontWeight: 400,
    color: '#6B7280',
    maxLines: 1,
  })

  for (let i = 1; i <= 8; i += 1) {
    const colIdx = (i - 1) % 2
    const rowIdx = Math.floor((i - 1) / 2)
    const cardX = g.gridStartX + colIdx * (g.cardW + g.colGap)
    const cardY = g.gridStartY + rowIdx * (g.cardH + g.rowGap)
    const numStr = String(i).padStart(2, '0')
    const cardSlotId = `POINT_${i}_CARD`
    const titleSlotId = `POINT_${i}_TITLE`
    const descSlotId = `POINT_${i}_DESC`
    const prevCard = prevBySlot.get(cardSlotId)
    const rowColor = resolveStoredColor(prevCard, accent)

    pushGraphic({
      id: prevCard?.id || `est_c${i}`,
      slotId: cardSlotId,
      layer: 2,
      x: cardX * scaleX,
      y: cardY * scaleY,
      width: g.cardW * scaleX,
      height: g.cardH * scaleY,
      fill: rowColor,
      svg: buildPointCardSvg(g.cardW, g.cardH),
    })

    pushText({
      id: prevBySlot.get(`POINT_${i}_NUM`)?.id || `est_n${i}`,
      slotId: `POINT_${i}_NUM`,
      role: 'caption',
      text: numStr,
      x: (cardX + 4) * scaleX,
      y: (cardY + 14) * scaleY,
      width: 36 * scaleX,
      height: 22 * scaleY,
      fontSize: 13,
      fontWeight: 700,
      color: rowColor,
      maxLines: 1,
    })

    pushText({
      id: prevBySlot.get(titleSlotId)?.id || prevBySlot.get(`POINT_${i}_LABEL`)?.id || `est_t${i}`,
      slotId: titleSlotId,
      role: 'heading',
      text:
        getPrevText(titleSlotId, '') ||
        getPrevText(`POINT_${i}_LABEL`, '') ||
        EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_TITLE`],
      x: (cardX + 42) * scaleX,
      y: (cardY + 12) * scaleY,
      width: (g.cardW - 50) * scaleX,
      height: 22 * scaleY,
      fontSize: 14,
      fontWeight: 700,
      color: '#111827',
      maxLines: 1,
    })

    pushText({
      id: prevBySlot.get(descSlotId)?.id || `est_d${i}`,
      slotId: descSlotId,
      role: 'body',
      text: getPrevText(descSlotId, EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_DESC`]),
      x: (cardX + 42) * scaleX,
      y: (cardY + 36) * scaleY,
      width: (g.cardW - 50) * scaleX,
      height: 52 * scaleY,
      fontSize: 12,
      fontWeight: 400,
      color: '#6B7280',
      lineHeight: 1.35,
      maxLines: 2,
    })
  }

  const prevImage = prevBySlot.get('HERO_IMAGE') || prevBySlot.get('IMAGE_1')
  const imageUrl = prevImage?.content?.url || prevImage?.content?.src || prevImage?.url || null
  const imgPlace = {
    x: Math.round(g.imageX * scaleX),
    y: Math.round(g.imageY * scaleY),
    width: Math.max(1, Math.round(g.imageW * scaleX)),
    height: Math.max(1, Math.round(g.imageH * scaleY)),
    rotation: 0,
    opacity: 1,
  }
  newElements.push({
    id: prevImage?.id || 'est_hero',
    type: 'image',
    slotId: 'HERO_IMAGE',
    role: 'image',
    layer: 4,
    placement: imgPlace,
    rect: { ...imgPlace },
    content: {
      ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
      fit: 'cover',
      borderRadius: Math.round(g.imageRadius * Math.min(scaleX, scaleY)),
    },
  })

  if (Array.isArray(docOrElements)) return newElements
  return { ...docOrElements, elements: newElements }
}

export function eightShortTextsImagePreviewSvg(options = {}) {
  const isRight = typeof options === 'boolean' ? options : (options?.isRight === true || options?.imagePosition === 'right')
  const g = resolveEightShortTextsGeom(isRight)
  const accent = EIGHT_SHORT_TEXTS_IMAGE_PALETTE.primary
  let cardsSvg = ''
  for (let i = 1; i <= 8; i += 1) {
    const colIdx = (i - 1) % 2
    const rowIdx = Math.floor((i - 1) / 2)
    const x = g.gridStartX + colIdx * (g.cardW + g.colGap)
    const y = g.gridStartY + rowIdx * (g.cardH + g.rowGap)
    const num = String(i).padStart(2, '0')
    const title = wrapLines(EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_TITLE`], 18, 1)[0]
    const desc = wrapLines(EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS[`POINT_${i}_DESC`], 28, 2)
    cardsSvg += `
      <g transform="translate(${x}, ${y})" color="${accent}">
        <line x1="0" y1="${g.cardH - 1}" x2="${g.cardW}" y2="${g.cardH - 1}" stroke="currentColor" stroke-opacity="0.16" />
        <text x="4" y="28" fill="${accent}" font-size="13" font-weight="700" font-family="Inter, Arial, sans-serif">${num}</text>
        <text x="42" y="26" fill="#111827" font-size="13" font-weight="700" font-family="Inter, Arial, sans-serif">${escapeXml(title)}</text>
        ${desc
          .map(
            (line, li) =>
              `<text x="42" y="${46 + li * 14}" fill="#6B7280" font-size="11" font-weight="400" font-family="Inter, Arial, sans-serif">${escapeXml(line)}</text>`
          )
          .join('')}
      </g>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" width="100%" height="100%">
    <rect width="1000" height="560" fill="#FBFBFA" />
    <text x="${g.badgeX}" y="${g.badgeY + 14}" fill="${accent}" font-size="11" font-weight="700" font-family="Inter, Arial, sans-serif" letter-spacing="0.16em">${EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.BADGE}</text>
    <text x="${g.headingX}" y="${g.headingY + 24}" fill="#111827" font-size="24" font-weight="700" font-family="Inter, Arial, sans-serif">${EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.HEADING}</text>
    <text x="${g.subtitleX}" y="${g.subtitleY + 14}" fill="#6B7280" font-size="12" font-weight="400" font-family="Inter, Arial, sans-serif">${EIGHT_SHORT_TEXTS_IMAGE_DEFAULTS.SUBTITLE}</text>
    ${cardsSvg}
    <g transform="translate(${g.imageX}, ${g.imageY})">
      <rect width="${g.imageW}" height="${g.imageH}" rx="${g.imageRadius}" fill="#D7E3EA" />
      <path d="M0 220 C80 180 160 250 240 200 C300 170 340 210 ${g.imageW} 190 L${g.imageW} ${g.imageH} L0 ${g.imageH} Z" fill="#8FBF8E" />
      <ellipse cx="90" cy="90" rx="36" ry="16" fill="#FFFFFF" fill-opacity="0.9" />
      <ellipse cx="250" cy="70" rx="44" ry="18" fill="#FFFFFF" fill-opacity="0.85" />
    </g>
  </svg>`
}
