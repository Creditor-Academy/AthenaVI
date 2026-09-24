/**
 * Four Images Text Mosaic
 * Layout ID: four_images_text_mosaic_v1
 *
 * Heading top-left; interlocking mosaic — one tall hero photo on the left,
 * a landscape tile top-right, and two squares along the bottom-right.
 * Each photo has a caption band along its bottom edge.
 */

export function isFourImagesTextMosaicLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'four_images_text_mosaic_v1' || id === 'four_images_text_mosaic'
}

export const FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS = {
  HEADING: 'Gallery',
  LABELS: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
}

const TILES = [
  { x: 72, y: 196, w: 928, h: 812, r: 28 },
  { x: 1024, y: 196, w: 824, h: 392, r: 28 },
  { x: 1024, y: 612, w: 400, h: 396, r: 28 },
  { x: 1448, y: 612, w: 400, h: 396, r: 28 },
]

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  headX: 88,
  barY: 52,
  barW: 56,
  barH: 6,
  headY: 72,
  headW: 1744,
  headH: 108,
  bandH: 64,
  labelPad: 24,
}

const TYPE = {
  heading: { size: 36, weight: 800, lh: 1.15 },
  label: { size: 16, weight: 700, lh: 1.25 },
}

export function buildFourImagesTextMosaicChromeSvg() {
  const { headX, barY, barW, barH, bandH } = GEOM
  const cards = TILES.map((t, i) => `
    <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="${t.r}" fill="#FFFFFF" filter="url(#fitmShadow)" />
    <clipPath id="fitmBand${i}"><rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="${t.r}" /></clipPath>
    <rect x="${t.x}" y="${t.y + t.h - bandH}" width="${t.w}" height="${bandH}" fill="#FFFFFF" opacity="0.94" clip-path="url(#fitmBand${i})" />
  `).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <filter id="fitmShadow" x="-8%" y="-8%" width="116%" height="124%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#94A3B8" flood-opacity="0.22" />
      </filter>
    </defs>
    <rect width="1920" height="1080" fill="currentColor" opacity="0.04" />
    <circle cx="1848" cy="64" r="132" fill="currentColor" opacity="0.06" />
    <circle cx="1848" cy="64" r="76" fill="none" stroke="currentColor" stroke-width="2" opacity="0.16" />
    <rect x="${headX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="currentColor" />
    ${cards}
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

function textEl({ slotId, prev, x, y, w, h, text, fontSize, fontWeight, color, lineHeight, maxLines, sx, sy, scale, role }) {
  return {
    id: prev?.id || `slot-${slotId}`,
    slotId,
    type: 'text',
    role,
    layer: 10,
    placement: {
      x: Math.round(x * sx),
      y: Math.round(y * sy),
      width: Math.round(w * sx),
      height: Math.round(h * sy),
      rotation: 0,
      opacity: 1,
    },
    content: {
      text,
      fontSize: Math.round(fontSize * scale),
      fontWeight,
      color,
      align: 'left',
      verticalAlign: 'center',
      lineHeight,
      clipToSlot: true,
      maxLines,
    },
  }
}

function paletteColors(palette) {
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  return {
    accent: pal.primary || pal.accent || '#6366F1',
    textColor: pal.text || '#0F172A',
  }
}

function buildElements({ canvasW, canvasH, heading, labels, imageUrls, accent, textColor, prev = {} }) {
  const sx = canvasW / GEOM.viewW
  const sy = canvasH / GEOM.viewH
  const scale = Math.min(sx, sy)
  const { bandH, labelPad } = GEOM

  const tileEls = TILES.flatMap((t, i) => {
    const n = i + 1
    const imgSlot = `IMAGE_${n}`
    const labelSlot = `IMAGE_${n}_LABEL`
    const url = imageUrls[i]
    const imgH = t.h - bandH
    return [
      {
        id: prev[imgSlot]?.id || `slot-${imgSlot}`,
        slotId: imgSlot,
        type: 'image',
        role: 'image',
        layer: 6,
        placement: {
          x: Math.round(t.x * sx),
          y: Math.round(t.y * sy),
          width: Math.round(t.w * sx),
          height: Math.round(imgH * sy),
          rotation: 0,
          opacity: 1,
        },
        content: {
          ...(url ? { url, src: url } : {}),
          fit: 'cover',
          borderRadius: Math.round(t.r * scale),
          alt: '',
        },
      },
      textEl({
        slotId: labelSlot,
        prev: prev[labelSlot],
        x: t.x + labelPad,
        y: t.y + imgH + 8,
        w: t.w - labelPad * 2,
        h: bandH - 16,
        text: labels[i],
        fontSize: TYPE.label.size,
        fontWeight: TYPE.label.weight,
        color: textColor,
        lineHeight: TYPE.label.lh,
        maxLines: 1,
        role: 'caption',
        sx, sy, scale,
      }),
    ]
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
        svg: buildFourImagesTextMosaicChromeSvg(),
        preserveAspectRatio: 'none',
        colorMode: 'recolorable',
        fill: accent,
        stroke: accent,
      },
    },
    textEl({
      slotId: 'HEADING',
      prev: prev.HEADING,
      x: GEOM.headX,
      y: GEOM.headY,
      w: GEOM.headW,
      h: GEOM.headH,
      text: heading,
      fontSize: TYPE.heading.size,
      fontWeight: TYPE.heading.weight,
      color: textColor,
      lineHeight: TYPE.heading.lh,
      maxLines: 2,
      role: 'heading',
      sx, sy, scale,
    }),
    ...tileEls,
  ]
}

export function layoutFourImagesTextMosaic(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const { accent, textColor } = paletteColors(palette)
  const headingEl = findEl(elements, ['HEADING', 'TITLE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG'])
  const prev = { IMAGE_CARD_BG: cardEl, HEADING: headingEl }
  const labels = [1, 2, 3, 4].map((n, i) => {
    const el = findEl(elements, [`IMAGE_${n}_LABEL`, `LABEL_${n}`])
    prev[`IMAGE_${n}_LABEL`] = el
    return textOf(el, FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS.LABELS[i])
  })
  const imageEls = [1, 2, 3, 4].map((n) => findEl(elements, [`IMAGE_${n}`]))
  imageEls.forEach((el, i) => { prev[`IMAGE_${i + 1}`] = el })
  const out = buildElements({
    canvasW,
    canvasH,
    heading: textOf(headingEl, FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS.HEADING),
    labels,
    imageUrls: imageEls.map((el) => el?.content?.url || el?.content?.src || null),
    accent: resolveStoredColor(cardEl, accent),
    textColor,
    prev,
  })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildFourImagesTextMosaicCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const bySlot = options.contentBySlotId || {}
  const { accent, textColor } = paletteColors(options.palette || {})
  const urls = Array.isArray(content.imageUrls) ? content.imageUrls : []
  const items = Array.isArray(content.items) ? content.items : []
  return buildElements({
    canvasW,
    canvasH,
    heading: String(bySlot.HEADING || content.heading || content.title || FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS.HEADING).trim(),
    labels: [1, 2, 3, 4].map((n, i) =>
      String(bySlot[`IMAGE_${n}_LABEL`] || items[i]?.title || items[i]?.label || FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS.LABELS[i]).trim()
    ),
    imageUrls: [1, 2, 3, 4].map((n, i) =>
      bySlot[`IMAGE_${n}__url`] || bySlot[`IMAGE_${n}_url`] || urls[i] || null
    ),
    accent,
    textColor,
  })
}

export function fourImagesTextMosaicPreviewSvg() {
  const { labelPad, bandH, headX, headY } = GEOM
  const labels = FOUR_IMAGES_TEXT_MOSAIC_DEFAULTS.LABELS
  const photos = TILES.map((t, i) => {
    const imgH = t.h - bandH
    return `
    <clipPath id="fitmPrevClip${i}"><rect x="${t.x}" y="${t.y}" width="${t.w}" height="${imgH}" rx="${t.r}" /></clipPath>
    <g clip-path="url(#fitmPrevClip${i})">
      <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${imgH}" fill="url(#fitmPrevSky)" />
      <ellipse cx="${t.x + 140 + i * 50}" cy="${t.y + 70}" rx="70" ry="28" fill="#FFFFFF" opacity="0.95" />
      <ellipse cx="${t.x + 200 + i * 50}" cy="${t.y + 70}" rx="48" ry="22" fill="#FFFFFF" opacity="0.95" />
      <path d="M${t.x} ${t.y + imgH * 0.55} C${t.x + t.w * 0.25} ${t.y + imgH * 0.4} ${t.x + t.w * 0.5} ${t.y + imgH * 0.62} ${t.x + t.w * 0.75} ${t.y + imgH * 0.48} C${t.x + t.w * 0.9} ${t.y + imgH * 0.4} ${t.x + t.w} ${t.y + imgH * 0.52} ${t.x + t.w} ${t.y + imgH * 0.5} L${t.x + t.w} ${t.y + imgH} L${t.x} ${t.y + imgH} Z" fill="url(#fitmPrevHill)" />
    </g>
    <text x="${t.x + labelPad}" y="${t.y + imgH + 38}" fill="#0F172A" font-size="28" font-weight="700" font-family="system-ui, sans-serif">${labels[i]}</text>`
  }).join('')
  const chrome = buildFourImagesTextMosaicChromeSvg()
    .replace(/currentColor/g, '#6366F1')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#FFFFFF" />
    <defs>
      <linearGradient id="fitmPrevSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="fitmPrevHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    ${chrome}
    ${photos}
    <text x="${headX}" y="${headY + 52}" fill="#0F172A" font-size="56" font-weight="800" font-family="system-ui, sans-serif">Gallery</text>
  </svg>`
}
