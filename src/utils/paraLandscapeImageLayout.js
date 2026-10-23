/**
 * Para Landscape Image
 * Layout ID: para_landscape_image_v1
 *
 * Accent dash, heading, body, then a wide rounded photo.
 * Top/bottom twins keep their own engines.
 */

export function isParaLandscapeImageLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'para_landscape_image_v1' || id === 'para_landscape_image'
}

export const PARA_LANDSCAPE_IMAGE_DEFAULTS = {
  HEADING: 'Describe this slide',
  BODY: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  textX: 120,
  textW: 1680,
  barY: 64,
  barW: 64,
  barH: 6,
  headingY: 92,
  headingH: 120,
  bodyY: 236,
  bodyH: 140,
  imgX: 120,
  imgY: 420,
  imgW: 1680,
  imgH: 560,
  radius: 32,
  pad: 14,
}

export function buildParaLandscapeImageChromeSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, textX, barY, barW, barH } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="pliShadow" x="-8%" y="-10%" width="116%" height="128%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.2" />
      </filter>
    </defs>
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#pliShadow)" />
    <rect x="${textX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="currentColor" />
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

function buildElements({ canvasW, canvasH, headingText, bodyText, imageUrl, accent, textColor, mutedColor, prev = {} }) {
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
        svg: buildParaLandscapeImageChromeSvg(),
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
      id: prev.HEADING?.id || 'slot-HEADING',
      slotId: 'HEADING',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(GEOM.textX * sx),
        y: Math.round(GEOM.headingY * sy),
        width: Math.round(GEOM.textW * sx),
        height: Math.round(GEOM.headingH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: headingText,
        fontSize: Math.round(40 * scale),
        fontWeight: 800,
        color: textColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.15,
        clipToSlot: true,
        maxLines: 2,
      },
    },
    {
      id: prev.BODY?.id || 'slot-BODY',
      slotId: 'BODY',
      type: 'text',
      role: 'body',
      layer: 10,
      placement: {
        x: Math.round(GEOM.textX * sx),
        y: Math.round(GEOM.bodyY * sy),
        width: Math.round(GEOM.textW * sx),
        height: Math.round(GEOM.bodyH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: bodyText,
        fontSize: Math.round(20 * scale),
        fontWeight: 400,
        color: mutedColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        clipToSlot: true,
        maxLines: 4,
      },
    },
  ]
}

export function layoutParaLandscapeImage(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || '#6366F1'
  const textColor = pal.text || '#0F172A'
  const mutedColor = pal.muted || '#64748B'
  const headingEl = findEl(elements, ['HEADING', 'TITLE', 'MAIN_TITLE'])
  const bodyEl = findEl(elements, ['BODY', 'PARAGRAPH'])
  const imageEl = findEl(elements, ['HERO_IMAGE', 'IMAGE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const out = buildElements({
    canvasW,
    canvasH,
    headingText: textOf(headingEl, PARA_LANDSCAPE_IMAGE_DEFAULTS.HEADING),
    bodyText: textOf(bodyEl, PARA_LANDSCAPE_IMAGE_DEFAULTS.BODY),
    imageUrl: imageEl?.content?.url || imageEl?.content?.src || null,
    accent: resolveStoredColor(cardEl, accent),
    textColor,
    mutedColor,
    prev: {
      IMAGE_CARD_BG: cardEl,
      HERO_IMAGE: imageEl,
      HEADING: headingEl,
      BODY: bodyEl,
    },
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildParaLandscapeImageCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  return buildElements({
    canvasW,
    canvasH,
    headingText: String(contentBySlotId.HEADING || content.title || PARA_LANDSCAPE_IMAGE_DEFAULTS.HEADING).trim(),
    bodyText: String(contentBySlotId.BODY || content.body || PARA_LANDSCAPE_IMAGE_DEFAULTS.BODY).trim(),
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

export function paraLandscapeImagePreviewSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, textX, barY, barW, barH, headingY } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#FFFFFF" />
    <defs>
      <filter id="pliPrevShadow" x="-8%" y="-10%" width="116%" height="128%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.2" />
      </filter>
      <clipPath id="pliClip"><rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
      <linearGradient id="pliSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="pliHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <rect x="${textX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="#6366F1" />
    <text x="${textX}" y="${headingY + 48}" fill="#0F172A" font-size="40" font-weight="800" font-family="system-ui, sans-serif">Describe this slide</text>
    <text x="${textX}" y="276" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">We help teams turn complex ideas into clear narratives that drive</text>
    <text x="${textX}" y="308" fill="#64748B" font-size="20" font-family="system-ui, sans-serif">decisions and build momentum across the organization.</text>
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#pliPrevShadow)" />
    <g clip-path="url(#pliClip)">
      <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" fill="url(#pliSky)" />
      <ellipse cx="${imgX + 360}" cy="${imgY + 140}" rx="110" ry="46" fill="#FFFFFF" opacity="0.94" />
      <ellipse cx="${imgX + 450}" cy="${imgY + 140}" rx="80" ry="36" fill="#FFFFFF" opacity="0.94" />
      <ellipse cx="${imgX + 1100}" cy="${imgY + 110}" rx="130" ry="52" fill="#FFFFFF" opacity="0.92" />
      <path d="M${imgX} ${imgY + 280} C${imgX + 280} ${imgY + 180} ${imgX + 620} ${imgY + 260} ${imgX + 900} ${imgY + 220} C${imgX + 1220} ${imgY + 180} ${imgX + 1480} ${imgY + 260} ${imgX + imgW} ${imgY + 200} L${imgX + imgW} ${imgY + imgH} L${imgX} ${imgY + imgH} Z" fill="url(#pliHill)" />
    </g>
  </svg>`
}
