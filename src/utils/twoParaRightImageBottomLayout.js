/**
 * Two Para Right Image Bottom
 * Layout ID: two_para_right_image_bottom_v1
 *
 * Two paragraphs side by side, wide landscape photo along the bottom.
 */

export function isTwoParaRightImageBottomLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'two_para_right_image_bottom_v1' || id === 'two_para_right_image_bottom'
}

export const TWO_PARA_RIGHT_IMAGE_BOTTOM_DEFAULTS = {
  BODY_1: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
  BODY_2: 'Our approach combines research, design, and storytelling so every slide earns attention and every message lands with precision.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  imgX: 120,
  imgY: 520,
  imgW: 1680,
  imgH: 460,
  radius: 28,
  pad: 14,
  body1X: 120,
  body2X: 1020,
  textW: 780,
  barY: 56,
  barW: 56,
  barH: 6,
  bodyY: 88,
  bodyH: 380,
}

export function buildTwoParaRightImageBottomChromeSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, body1X, body2X, barY, barW, barH } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="tpribShadow" x="-10%" y="-8%" width="120%" height="124%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
    </defs>
    <ellipse cx="80" cy="36" rx="220" ry="110" fill="currentColor" opacity="0.07" />
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#tpribShadow)" />
    <rect x="${body1X}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="currentColor" />
    <rect x="${body2X}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="currentColor" />
  </svg>`
}

function findEl(elements, ids) {
  const set = new Set(ids)
  return (elements || []).find((e) => set.has(String(e.slotId || '').toUpperCase()))
}

function textOf(el, fallback) {
  const txt = el?.content?.text || el?.text
  if (txt && String(txt).trim()) return String(txt).trim()
  return fallback
}

function resolveStoredColor(el, fallback) {
  const fill = el?.content?.fill
  if (typeof fill === 'string' && fill && fill !== 'none' && fill !== 'transparent') return fill
  if (fill && typeof fill === 'object' && fill.color) return fill.color
  return fallback
}

function buildElements({ canvasW, canvasH, body1Text, body2Text, imageUrl, accent, textColor, mutedColor, prev = {} }) {
  const sx = canvasW / GEOM.viewW
  const sy = canvasH / GEOM.viewH
  const scale = Math.min(sx, sy)
  const radius = Math.round(GEOM.radius * scale)

  return [
    {
      id: prev.IMAGE_CARD_BG?.id || 'slot-IMAGE_CARD_BG',
      slotId: 'IMAGE_CARD_BG',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildTwoParaRightImageBottomChromeSvg(),
        preserveAspectRatio: 'none',
        colorMode: 'recolorable',
        fill: accent,
        stroke: accent,
      },
    },
    {
      id: prev.HERO_IMAGE?.id || 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 6,
      placement: {
        x: Math.round(GEOM.imgX * sx),
        y: Math.round(GEOM.imgY * sy),
        width: Math.round(GEOM.imgW * sx),
        height: Math.round(GEOM.imgH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        borderRadius: radius,
        alt: '',
      },
    },
    {
      id: prev.BODY_1?.id || 'slot-BODY_1',
      slotId: 'BODY_1',
      type: 'text',
      role: 'body',
      layer: 10,
      placement: {
        x: Math.round(GEOM.body1X * sx),
        y: Math.round(GEOM.bodyY * sy),
        width: Math.round(GEOM.textW * sx),
        height: Math.round(GEOM.bodyH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: body1Text,
        fontSize: Math.round(24 * scale),
        fontWeight: 700,
        color: textColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        clipToSlot: true,
        maxLines: 6,
      },
    },
    {
      id: prev.BODY_2?.id || 'slot-BODY_2',
      slotId: 'BODY_2',
      type: 'text',
      role: 'body',
      layer: 10,
      placement: {
        x: Math.round(GEOM.body2X * sx),
        y: Math.round(GEOM.bodyY * sy),
        width: Math.round(GEOM.textW * sx),
        height: Math.round(GEOM.bodyH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: body2Text,
        fontSize: Math.round(20 * scale),
        fontWeight: 400,
        color: mutedColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.5,
        clipToSlot: true,
        maxLines: 6,
      },
    },
  ]
}

export function layoutTwoParaRightImageBottom(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || '#6366F1'
  const textColor = pal.text || '#0F172A'
  const mutedColor = pal.muted || '#64748B'
  const body1El = findEl(elements, ['BODY_1', 'BODY', 'HEADING'])
  const body2El = findEl(elements, ['BODY_2', 'PARAGRAPH'])
  const imageEl = findEl(elements, ['HERO_IMAGE', 'IMAGE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const out = buildElements({
    canvasW,
    canvasH,
    body1Text: textOf(body1El, TWO_PARA_RIGHT_IMAGE_BOTTOM_DEFAULTS.BODY_1),
    body2Text: textOf(body2El, TWO_PARA_RIGHT_IMAGE_BOTTOM_DEFAULTS.BODY_2),
    imageUrl: imageEl?.content?.url || imageEl?.content?.src || null,
    accent: resolveStoredColor(cardEl, accent),
    textColor,
    mutedColor,
    prev: {
      IMAGE_CARD_BG: cardEl,
      HERO_IMAGE: imageEl,
      BODY_1: body1El,
      BODY_2: body2El,
    },
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildTwoParaRightImageBottomCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  return buildElements({
    canvasW,
    canvasH,
    body1Text: String(contentBySlotId.BODY_1 || content.body || content.title || TWO_PARA_RIGHT_IMAGE_BOTTOM_DEFAULTS.BODY_1).trim(),
    body2Text: String(contentBySlotId.BODY_2 || content.body2 || TWO_PARA_RIGHT_IMAGE_BOTTOM_DEFAULTS.BODY_2).trim(),
    imageUrl:
      contentBySlotId.HERO_IMAGE__url ||
      contentBySlotId.HERO_IMAGE_url ||
      content.imageUrl ||
      content.imageRef?.url ||
      null,
    accent: pal.primary || pal.accent || '#6366F1',
    textColor: pal.text || '#0F172A',
    mutedColor: pal.muted || '#64748B',
  })
}

export function twoParaRightImageBottomPreviewSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, body1X, body2X, barY, barW, barH } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#F8FAFC" />
    <defs>
      <filter id="tpribPrevShadow" x="-8%" y="-12%" width="116%" height="136%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
      <clipPath id="tpribClip"><rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
      <linearGradient id="tpribSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="55%" stop-color="#B7D4E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="tpribHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="40" rx="220" ry="120" fill="#6366F1" opacity="0.07" />
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#tpribPrevShadow)" />
    <g clip-path="url(#tpribClip)">
      <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" fill="url(#tpribSky)" />
      <ellipse cx="${imgX + 360}" cy="${imgY + 120}" rx="110" ry="46" fill="#FFFFFF" opacity="0.94" />
      <ellipse cx="${imgX + 460}" cy="${imgY + 120}" rx="80" ry="36" fill="#FFFFFF" opacity="0.94" />
      <ellipse cx="${imgX + 1100}" cy="${imgY + 90}" rx="130" ry="52" fill="#FFFFFF" opacity="0.92" />
      <path d="M${imgX} ${imgY + 220} C${imgX + 280} ${imgY + 140} ${imgX + 620} ${imgY + 210} ${imgX + 900} ${imgY + 170} C${imgX + 1220} ${imgY + 130} ${imgX + 1480} ${imgY + 210} ${imgX + imgW} ${imgY + 150} L${imgX + imgW} ${imgY + imgH} L${imgX} ${imgY + imgH} Z" fill="url(#tpribHill)" />
    </g>
    <rect x="${body1X}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="#6366F1" />
    <rect x="${body2X}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="#6366F1" />
    <text x="${body1X}" y="124" fill="#0F172A" font-size="24" font-weight="700" font-family="system-ui, sans-serif">We help teams turn complex ideas</text>
    <text x="${body1X}" y="160" fill="#0F172A" font-size="24" font-weight="700" font-family="system-ui, sans-serif">into clear narratives that drive</text>
    <text x="${body1X}" y="196" fill="#0F172A" font-size="24" font-weight="700" font-family="system-ui, sans-serif">decisions and build momentum</text>
    <text x="${body1X}" y="232" fill="#0F172A" font-size="24" font-weight="700" font-family="system-ui, sans-serif">across the organization.</text>
    <text x="${body2X}" y="124" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">Our approach combines research,</text>
    <text x="${body2X}" y="156" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">design, and storytelling so every</text>
    <text x="${body2X}" y="188" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">slide earns attention and every</text>
    <text x="${body2X}" y="220" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">message lands with precision.</text>
  </svg>`
}
