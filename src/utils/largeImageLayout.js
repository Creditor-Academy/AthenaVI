/**
 * Large Image
 * Layout ID: large_image_v1
 *
 * A single framed landscape photo with a caption bar underneath.
 * Distinct from Two Large Image Cards.
 */

export function isLargeImageLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'large_image_v1' || id === 'large_image'
}

export const LARGE_IMAGE_DEFAULTS = {
  CAPTION: 'Image caption',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  imgX: 140,
  imgY: 72,
  imgW: 1640,
  imgH: 820,
  radius: 32,
  pad: 16,
  capX: 220,
  capY: 932,
  capW: 1480,
  capH: 88,
  barX: 140,
  barY: 962,
  barW: 56,
  barH: 6,
}

export function buildLargeImageChromeSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, barX, barY, barW, barH } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 10
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="liShadow" x="-8%" y="-8%" width="116%" height="120%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
    </defs>
    <path d="M1480 0 H1920 V280 H1620 C 1540 140 1500 40 1480 0 Z" fill="currentColor" opacity="0.05" />
    <circle cx="1760" cy="120" r="130" fill="currentColor" opacity="0.07" />
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#liShadow)" />
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="currentColor" />
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

function paletteColors(palette) {
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  return {
    accent: pal.primary || pal.accent || '#6366F1',
    mutedColor: pal.muted || pal.textMuted || '#64748B',
  }
}

function buildElements({ canvasW, canvasH, caption, imageUrl, accent, mutedColor, prev = {} }) {
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
        svg: buildLargeImageChromeSvg(),
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
      id: prev.CAPTION?.id || 'slot-CAPTION',
      slotId: 'CAPTION',
      type: 'text',
      role: 'caption',
      layer: 10,
      placement: {
        x: Math.round(GEOM.capX * sx),
        y: Math.round(GEOM.capY * sy),
        width: Math.round(GEOM.capW * sx),
        height: Math.round(GEOM.capH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: caption,
        fontSize: Math.round(18 * scale),
        fontWeight: 500,
        color: mutedColor,
        align: 'left',
        verticalAlign: 'center',
        lineHeight: 1.35,
        clipToSlot: true,
        maxLines: 2,
      },
    },
  ]
}

export function layoutLargeImage(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const { accent, mutedColor } = paletteColors(palette)
  const captionEl = findEl(elements, ['CAPTION', 'BODY', 'SUBTITLE'])
  const imageEl = findEl(elements, ['HERO_IMAGE', 'IMAGE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const out = buildElements({
    canvasW,
    canvasH,
    caption: textOf(captionEl, LARGE_IMAGE_DEFAULTS.CAPTION),
    imageUrl: imageEl?.content?.url || imageEl?.content?.src || null,
    accent: resolveStoredColor(cardEl, accent),
    mutedColor,
    prev: { IMAGE_CARD_BG: cardEl, HERO_IMAGE: imageEl, CAPTION: captionEl },
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildLargeImageCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const bySlot = options.contentBySlotId || {}
  const { accent, mutedColor } = paletteColors(options.palette || {})
  return buildElements({
    canvasW,
    canvasH,
    caption: String(bySlot.CAPTION || content.caption || content.body || LARGE_IMAGE_DEFAULTS.CAPTION).trim(),
    imageUrl:
      bySlot.HERO_IMAGE__url ||
      bySlot.HERO_IMAGE_url ||
      content.imageUrl ||
      content.imageRef?.url ||
      null,
    accent,
    mutedColor,
  })
}

export function largeImagePreviewSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, capX, capY } = GEOM
  const chrome = buildLargeImageChromeSvg()
    .replace(/currentColor/g, '#6366F1')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#FFFFFF" />
    ${chrome}
    <defs>
      <clipPath id="liClip"><rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
      <linearGradient id="liSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="55%" stop-color="#B7D4E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="liHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <g clip-path="url(#liClip)">
      <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" fill="url(#liSky)" />
      <ellipse cx="${imgX + 280}" cy="${imgY + 180}" rx="120" ry="50" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${imgX + 390}" cy="${imgY + 180}" rx="80" ry="38" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${imgX + 980}" cy="${imgY + 140}" rx="140" ry="52" fill="#FFFFFF" opacity="0.9" />
      <path d="M${imgX} ${imgY + 480} C${imgX + 360} ${imgY + 360} ${imgX + 720} ${imgY + 520} ${imgX + 1080} ${imgY + 420} C${imgX + 1320} ${imgY + 360} ${imgX + 1480} ${imgY + 480} ${imgX + imgW} ${imgY + 400} L${imgX + imgW} ${imgY + imgH} L${imgX} ${imgY + imgH} Z" fill="url(#liHill)" />
    </g>
    <text x="${capX}" y="${capY + 52}" fill="#64748B" font-size="28" font-weight="500" font-family="system-ui, sans-serif">Image caption</text>
  </svg>`
}
