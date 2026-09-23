/**
 * Three Para Image
 * Layout ID: three_para_image_v1
 *
 * Three numbered paragraphs stacked on the left, rounded photo on the right.
 */

export function isThreeParaImageLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'three_para_image_v1' || id === 'three_para_image'
}

export const THREE_PARA_IMAGE_DEFAULTS = {
  BODY_1: 'We help teams turn complex ideas into clear narratives that drive decisions.',
  BODY_2: 'Our approach combines research, design, and storytelling so every slide earns attention.',
  BODY_3: 'The result is a deck that lands with precision and keeps momentum after the meeting.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  imgX: 1008,
  imgY: 140,
  imgW: 792,
  imgH: 800,
  radius: 40,
  pad: 16,
  textX: 108,
  textW: 800,
  numW: 72,
  blockTops: [170, 440, 710],
  blockH: 220,
  dividerYs: [410, 680],
}

const BODY_X_OFFSET = 96

export function buildThreeParaImageChromeSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, textX, textW, blockTops, dividerYs } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  const nums = blockTops
    .map((y, i) => `<text x="${textX}" y="${y + 30}" font-size="30" font-weight="800" font-family="system-ui, sans-serif" fill="currentColor">0${i + 1}</text>`)
    .join('')
  const dividers = dividerYs
    .map((y) => `<rect x="${textX}" y="${y}" width="${textW}" height="2" rx="1" fill="currentColor" opacity="0.14" />`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="tpiShadow" x="-10%" y="-8%" width="120%" height="124%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
    </defs>
    <ellipse cx="80" cy="40" rx="220" ry="120" fill="currentColor" opacity="0.07" />
    <ellipse cx="1840" cy="1040" rx="260" ry="150" fill="currentColor" opacity="0.06" />
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#tpiShadow)" />
    ${nums}
    ${dividers}
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

function buildElements({ canvasW, canvasH, bodies, imageUrl, accent, textColor, prev = {} }) {
  const sx = canvasW / GEOM.viewW
  const sy = canvasH / GEOM.viewH
  const scale = Math.min(sx, sy)
  const radius = Math.round(GEOM.radius * scale)

  const bodyEls = bodies.map((text, i) => {
    const slotId = `BODY_${i + 1}`
    return {
      id: prev[slotId]?.id || `slot-${slotId}`,
      slotId,
      type: 'text',
      role: 'body',
      layer: 10,
      placement: {
        x: Math.round((GEOM.textX + BODY_X_OFFSET) * sx),
        y: Math.round((GEOM.blockTops[i] + 2) * sy),
        width: Math.round((GEOM.textW - BODY_X_OFFSET) * sx),
        height: Math.round(GEOM.blockH * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text,
        fontSize: Math.round(22 * scale),
        fontWeight: 500,
        color: textColor,
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.5,
        clipToSlot: true,
        maxLines: 5,
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
        svg: buildThreeParaImageChromeSvg(),
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
    ...bodyEls,
  ]
}

export function layoutThreeParaImage(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || '#6366F1'
  const textColor = pal.text || '#0F172A'
  const bodyEls = [1, 2, 3].map((n) => findEl(elements, [`BODY_${n}`]))
  const imageEl = findEl(elements, ['HERO_IMAGE', 'IMAGE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const out = buildElements({
    canvasW,
    canvasH,
    bodies: bodyEls.map((el, i) => textOf(el, THREE_PARA_IMAGE_DEFAULTS[`BODY_${i + 1}`])),
    imageUrl: imageEl?.content?.url || imageEl?.content?.src || null,
    accent: resolveStoredColor(cardEl, accent),
    textColor,
    prev: {
      IMAGE_CARD_BG: cardEl,
      HERO_IMAGE: imageEl,
      BODY_1: bodyEls[0],
      BODY_2: bodyEls[1],
      BODY_3: bodyEls[2],
    },
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildThreeParaImageCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  return buildElements({
    canvasW,
    canvasH,
    bodies: [1, 2, 3].map((n) =>
      String(contentBySlotId[`BODY_${n}`] || THREE_PARA_IMAGE_DEFAULTS[`BODY_${n}`]).trim()
    ),
    imageUrl:
      contentBySlotId.HERO_IMAGE__url ||
      contentBySlotId.HERO_IMAGE_url ||
      content.imageUrl ||
      content.imageRef?.url ||
      null,
    accent: pal.primary || pal.accent || '#6366F1',
    textColor: pal.text || '#0F172A',
  })
}

export function threeParaImagePreviewSvg() {
  const { imgX, imgY, imgW, imgH, radius, pad, textX, textW, blockTops, dividerYs } = GEOM
  const frameX = imgX - pad
  const frameY = imgY - pad
  const frameW = imgW + pad * 2
  const frameH = imgH + pad * 2
  const frameR = radius + 8
  const bx = textX + BODY_X_OFFSET
  const lines = [
    ['We help teams turn complex ideas into', 'clear narratives that drive decisions.'],
    ['Our approach combines research, design,', 'and storytelling so every slide earns attention.'],
    ['The result is a deck that lands with', 'precision and keeps momentum after the meeting.'],
  ]
  const blocks = blockTops
    .map((y, i) => `
    <text x="${textX}" y="${y + 30}" fill="#6366F1" font-size="30" font-weight="800" font-family="system-ui, sans-serif">0${i + 1}</text>
    <text x="${bx}" y="${y + 26}" fill="#0F172A" font-size="22" font-weight="500" font-family="system-ui, sans-serif">${lines[i][0]}</text>
    <text x="${bx}" y="${y + 59}" fill="#0F172A" font-size="22" font-weight="500" font-family="system-ui, sans-serif">${lines[i][1]}</text>`)
    .join('')
  const dividers = dividerYs
    .map((y) => `<rect x="${textX}" y="${y}" width="${textW}" height="2" rx="1" fill="#6366F1" opacity="0.14" />`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#F8FAFC" />
    <defs>
      <filter id="tpiPrevShadow" x="-10%" y="-8%" width="120%" height="124%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.18" />
      </filter>
      <clipPath id="tpiClip"><rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="${radius}" /></clipPath>
      <linearGradient id="tpiSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="55%" stop-color="#B7D4E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="tpiHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="40" rx="220" ry="120" fill="#6366F1" opacity="0.08" />
    <ellipse cx="1840" cy="1040" rx="260" ry="150" fill="#6366F1" opacity="0.06" />
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${frameR}" fill="#FFFFFF" filter="url(#tpiPrevShadow)" />
    <g clip-path="url(#tpiClip)">
      <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" fill="url(#tpiSky)" />
      <ellipse cx="${imgX + 180}" cy="${imgY + 160}" rx="90" ry="42" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${imgX + 260}" cy="${imgY + 160}" rx="64" ry="32" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${imgX + 520}" cy="${imgY + 120}" rx="110" ry="46" fill="#FFFFFF" opacity="0.92" />
      <path d="M${imgX} ${imgY + 420} C${imgX + 180} ${imgY + 320} ${imgX + 360} ${imgY + 400} ${imgX + 540} ${imgY + 360} C${imgX + 660} ${imgY + 330} ${imgX + 720} ${imgY + 400} ${imgX + imgW} ${imgY + 340} L${imgX + imgW} ${imgY + imgH} L${imgX} ${imgY + imgH} Z" fill="url(#tpiHill)" />
    </g>
    ${blocks}
    ${dividers}
  </svg>`
}
