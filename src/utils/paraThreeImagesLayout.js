/**
 * Para Three Images
 * Layout ID: para_three_images_v1
 *
 * Accent dash + lead paragraph across the top, three rounded portrait photos in a row below.
 * Horizontal / staggered twins keep their own engine.
 */

export function isParaThreeImagesLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'para_three_images_v1' || id === 'para_three_images'
}

export const PARA_THREE_IMAGES_DEFAULTS = {
  BODY: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  textX: 120,
  textW: 1400,
  barY: 88,
  barW: 56,
  barH: 6,
  bodyY: 120,
  bodyH: 170,
  imgXs: [120, 700, 1280],
  imgY: 340,
  imgW: 520,
  imgH: 640,
  radius: 28,
  pad: 12,
}

export function buildParaThreeImagesChromeSvg() {
  const { textX, barY, barW, barH, imgXs, imgY, imgW, imgH, radius, pad } = GEOM
  const frames = imgXs
    .map((x) => `<rect x="${x - pad}" y="${imgY - pad}" width="${imgW + pad * 2}" height="${imgH + pad * 2}" rx="${radius + 8}" fill="#FFFFFF" filter="url(#pthiShadow)" />`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="pthiShadow" x="-12%" y="-10%" width="124%" height="128%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
    </defs>
    <ellipse cx="1840" cy="40" rx="260" ry="120" fill="currentColor" opacity="0.06" />
    ${frames}
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

function buildElements({ canvasW, canvasH, bodyText, imageUrls, accent, textColor, prev = {} }) {
  const sx = canvasW / GEOM.viewW
  const sy = canvasH / GEOM.viewH
  const scale = Math.min(sx, sy)
  const radius = Math.round(GEOM.radius * scale)

  const images = GEOM.imgXs.map((x, i) => {
    const slotId = `IMAGE_${i + 1}`
    const url = imageUrls[i]
    return {
      id: prev[slotId]?.id || `slot-${slotId}`,
      slotId,
      type: 'image',
      role: 'image',
      layer: 6,
      placement: {
        x: Math.round(x * sx),
        y: Math.round(GEOM.imgY * sy),
        width: Math.round(GEOM.imgW * sx),
        height: Math.round(GEOM.imgH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(url ? { url, src: url } : {}),
        fit: 'cover',
        borderRadius: radius,
        alt: '',
      },
    }
  })

  return [
    {
      id: prev.IMAGE_CARD_BG?.id || 'slot-IMAGE_CARD_BG',
      slotId: 'IMAGE_CARD_BG',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildParaThreeImagesChromeSvg(),
        preserveAspectRatio: 'none',
        colorMode: 'recolorable',
        fill: accent,
        stroke: accent,
      },
    },
    ...images,
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
        fontSize: Math.round(28 * scale),
        fontWeight: 600,
        color: textColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        clipToSlot: true,
        maxLines: 4,
      },
    },
  ]
}

export function layoutParaThreeImages(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || '#6366F1'
  const textColor = pal.text || '#0F172A'
  const bodyEl = findEl(elements, ['BODY', 'HEADING', 'PARAGRAPH'])
  const imageEls = [1, 2, 3].map((n) => findEl(elements, [`IMAGE_${n}`]))
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const out = buildElements({
    canvasW,
    canvasH,
    bodyText: textOf(bodyEl, PARA_THREE_IMAGES_DEFAULTS.BODY),
    imageUrls: imageEls.map((el) => el?.content?.url || el?.content?.src || null),
    accent: resolveStoredColor(cardEl, accent),
    textColor,
    prev: {
      IMAGE_CARD_BG: cardEl,
      BODY: bodyEl,
      IMAGE_1: imageEls[0],
      IMAGE_2: imageEls[1],
      IMAGE_3: imageEls[2],
    },
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildParaThreeImagesCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  const urls = Array.isArray(content.imageUrls) ? content.imageUrls : []
  return buildElements({
    canvasW,
    canvasH,
    bodyText: String(contentBySlotId.BODY || content.body || PARA_THREE_IMAGES_DEFAULTS.BODY).trim(),
    imageUrls: [1, 2, 3].map((n, i) =>
      contentBySlotId[`IMAGE_${n}__url`] || contentBySlotId[`IMAGE_${n}_url`] || urls[i] || null
    ),
    accent: pal.primary || pal.accent || '#6366F1',
    textColor: pal.text || '#0F172A',
  })
}

export function paraThreeImagesPreviewSvg() {
  const { textX, barY, barW, barH, bodyY, imgXs, imgY, imgW, imgH, radius, pad } = GEOM
  const cards = imgXs
    .map((x, i) => `
    <rect x="${x - pad}" y="${imgY - pad}" width="${imgW + pad * 2}" height="${imgH + pad * 2}" rx="${radius + 8}" fill="#FFFFFF" filter="url(#pthiPrevShadow)" />
    <clipPath id="pthiClip${i}"><rect x="${x}" y="${imgY}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
    <g clip-path="url(#pthiClip${i})">
      <rect x="${x}" y="${imgY}" width="${imgW}" height="${imgH}" fill="url(#pthiSky)" />
      <ellipse cx="${x + 140 + i * 60}" cy="${imgY + 150}" rx="80" ry="36" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${x + 210 + i * 60}" cy="${imgY + 150}" rx="56" ry="28" fill="#FFFFFF" opacity="0.95" />
      <path d="M${x} ${imgY + 400} C${x + 120} ${imgY + 320} ${x + 240} ${imgY + 390} ${x + 360} ${imgY + 360} C${x + 440} ${imgY + 340} ${x + 480} ${imgY + 380} ${x + imgW} ${imgY + 350} L${x + imgW} ${imgY + imgH} L${x} ${imgY + imgH} Z" fill="url(#pthiHill)" />
    </g>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#FFFFFF" />
    <defs>
      <filter id="pthiPrevShadow" x="-12%" y="-10%" width="124%" height="128%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
      <linearGradient id="pthiSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="pthiHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <ellipse cx="1840" cy="40" rx="260" ry="120" fill="#6366F1" opacity="0.06" />
    ${cards}
    <rect x="${textX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="#6366F1" />
    <text x="${textX}" y="${bodyY + 36}" fill="#0F172A" font-size="28" font-weight="600" font-family="system-ui, sans-serif">We help teams turn complex ideas into clear narratives that drive decisions</text>
    <text x="${textX}" y="${bodyY + 75}" fill="#0F172A" font-size="28" font-weight="600" font-family="system-ui, sans-serif">and build momentum across the organization.</text>
  </svg>`
}
