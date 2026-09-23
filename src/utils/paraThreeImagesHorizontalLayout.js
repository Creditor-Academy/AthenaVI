/**
 * Para Three Images Horizontal
 * Layout ID: para_three_images_horizontal_v1
 *
 * Lead paragraph on the left; three landscape photos stacked as horizontal strips on a soft tinted panel.
 */

export function isParaThreeImagesHorizontalLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'para_three_images_horizontal_v1' || id === 'para_three_images_horizontal'
}

export const PARA_THREE_IMAGES_HORIZONTAL_DEFAULTS = {
  BODY: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  textX: 120,
  textW: 640,
  barY: 380,
  barW: 56,
  barH: 6,
  bodyY: 412,
  bodyH: 300,
  panelX: 836,
  panelY: 40,
  panelW: 1044,
  panelH: 1000,
  panelR: 48,
  imgX: 900,
  imgW: 916,
  imgYs: [96, 400, 704],
  imgH: 280,
  radius: 24,
  pad: 10,
}

export function buildParaThreeImagesHorizontalChromeSvg() {
  const { textX, barY, barW, barH, panelX, panelY, panelW, panelH, panelR, imgX, imgW, imgYs, imgH, radius, pad } = GEOM
  const frames = imgYs
    .map((y) => `<rect x="${imgX - pad}" y="${y - pad}" width="${imgW + pad * 2}" height="${imgH + pad * 2}" rx="${radius + 6}" fill="#FFFFFF" filter="url(#pthhShadow)" />`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="pthhShadow" x="-6%" y="-16%" width="112%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#94A3B8" flood-opacity="0.2" />
      </filter>
    </defs>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${panelR}" fill="currentColor" opacity="0.07" />
    <circle cx="160" cy="980" r="120" fill="currentColor" opacity="0.05" />
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

  const images = GEOM.imgYs.map((y, i) => {
    const slotId = `IMAGE_${i + 1}`
    const url = imageUrls[i]
    return {
      id: prev[slotId]?.id || `slot-${slotId}`,
      slotId,
      type: 'image',
      role: 'image',
      layer: 6,
      placement: {
        x: Math.round(GEOM.imgX * sx),
        y: Math.round(y * sy),
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
        svg: buildParaThreeImagesHorizontalChromeSvg(),
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
        fontSize: Math.round(30 * scale),
        fontWeight: 600,
        color: textColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        clipToSlot: true,
        maxLines: 6,
      },
    },
  ]
}

export function layoutParaThreeImagesHorizontal(docOrElements, schema = {}, palette = {}, canvas = {}) {
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
    bodyText: textOf(bodyEl, PARA_THREE_IMAGES_HORIZONTAL_DEFAULTS.BODY),
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

export function buildParaThreeImagesHorizontalCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  const urls = Array.isArray(content.imageUrls) ? content.imageUrls : []
  return buildElements({
    canvasW,
    canvasH,
    bodyText: String(contentBySlotId.BODY || content.body || PARA_THREE_IMAGES_HORIZONTAL_DEFAULTS.BODY).trim(),
    imageUrls: [1, 2, 3].map((n, i) =>
      contentBySlotId[`IMAGE_${n}__url`] || contentBySlotId[`IMAGE_${n}_url`] || urls[i] || null
    ),
    accent: pal.primary || pal.accent || '#6366F1',
    textColor: pal.text || '#0F172A',
  })
}

export function paraThreeImagesHorizontalPreviewSvg() {
  const { textX, barY, barW, barH, bodyY, panelX, panelY, panelW, panelH, panelR, imgX, imgW, imgYs, imgH, radius, pad } = GEOM
  const strips = imgYs
    .map((y, i) => `
    <rect x="${imgX - pad}" y="${y - pad}" width="${imgW + pad * 2}" height="${imgH + pad * 2}" rx="${radius + 6}" fill="#FFFFFF" filter="url(#pthhPrevShadow)" />
    <clipPath id="pthhClip${i}"><rect x="${imgX}" y="${y}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
    <g clip-path="url(#pthhClip${i})">
      <rect x="${imgX}" y="${y}" width="${imgW}" height="${imgH}" fill="url(#pthhSky)" />
      <ellipse cx="${imgX + 220 + i * 180}" cy="${y + 80}" rx="90" ry="34" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${imgX + 300 + i * 180}" cy="${y + 80}" rx="60" ry="26" fill="#FFFFFF" opacity="0.95" />
      <path d="M${imgX} ${y + 190} C${imgX + 200} ${y + 140} ${imgX + 420} ${y + 190} ${imgX + 620} ${y + 160} C${imgX + 760} ${y + 140} ${imgX + 840} ${y + 180} ${imgX + imgW} ${y + 150} L${imgX + imgW} ${y + imgH} L${imgX} ${y + imgH} Z" fill="url(#pthhHill)" />
    </g>`)
    .join('')
  const lines = [
    'We help teams turn complex ideas',
    'into clear narratives that drive',
    'decisions and build momentum',
    'across the organization.',
  ]
  const text = lines
    .map((l, i) => `<text x="${textX}" y="${bodyY + 36 + i * 42}" fill="#0F172A" font-size="30" font-weight="600" font-family="system-ui, sans-serif">${l}</text>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#FFFFFF" />
    <defs>
      <filter id="pthhPrevShadow" x="-6%" y="-16%" width="112%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#94A3B8" flood-opacity="0.2" />
      </filter>
      <linearGradient id="pthhSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="pthhHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${panelR}" fill="#6366F1" opacity="0.07" />
    <circle cx="160" cy="980" r="120" fill="#6366F1" opacity="0.05" />
    ${strips}
    <rect x="${textX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="#6366F1" />
    ${text}
  </svg>`
}
