/**
 * Para Title Right Image Overlay
 * Layout ID: para_title_right_image_overlay_v1
 *
 * Full-bleed photo, right cinematic fade, accent dash + heading + body.
 * Same slots as the boxed twin. Heading and body do not overlap.
 */

export function isParaTitleRightImageOverlayLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'para_title_right_image_overlay_v1' || id === 'para_title_right_image_overlay'
}

export const PARA_TITLE_RIGHT_IMAGE_OVERLAY_DEFAULTS = {
  HEADING: 'Describe this slide',
  BODY: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
}

const GEOM = {
  viewW: 1920,
  viewH: 1080,
  textX: 940,
  textW: 860,
  barY: 268,
  barW: 64,
  barH: 6,
  headingY: 296,
  headingH: 168,
  bodyY: 500,
  bodyH: 300,
}

export function buildParaTitleRightImageOverlaySvg() {
  const { textX, barY, barW, barH } = GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ptrioFade" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.78" />
        <stop offset="42%" stop-color="#020617" stop-opacity="0.52" />
        <stop offset="72%" stop-color="#020617" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#ptrioFade)" />
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

function buildElements({ canvasW, canvasH, headingText, bodyText, imageUrl, accent, prev = {} }) {
  const sx = canvasW / GEOM.viewW
  const sy = canvasH / GEOM.viewH
  const scale = Math.min(sx, sy)

  return [
    {
      id: prev.HERO_IMAGE?.id || 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 0,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
      },
    },
    {
      id: prev.IMAGE_CARD_BG?.id || 'slot-IMAGE_CARD_BG',
      slotId: 'IMAGE_CARD_BG',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildParaTitleRightImageOverlaySvg(),
        preserveAspectRatio: 'none',
        colorMode: 'recolorable',
        fill: accent,
        stroke: accent,
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
        fontSize: Math.round(36 * scale),
        fontWeight: 800,
        color: '#FFFFFF',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.12,
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
        color: '#E2E8F0',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        clipToSlot: true,
        maxLines: 5,
      },
    },
  ]
}

export function layoutParaTitleRightImageOverlay(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const pal = palette?.primary ? palette : (palette?.palette || palette || {})
  const accent = pal.primary || pal.accent || '#FFFFFF'
  const headingEl = findEl(elements, ['HEADING', 'TITLE', 'MAIN_TITLE'])
  const bodyEl = findEl(elements, ['BODY', 'PARAGRAPH'])
  const imageEl = findEl(elements, ['HERO_IMAGE', 'IMAGE', 'BACKGROUND_IMAGE'])
  const cardEl = findEl(elements, ['IMAGE_CARD_BG', 'OVERLAY_SCRIM'])
  const out = buildElements({
    canvasW,
    canvasH,
    headingText: textOf(headingEl, PARA_TITLE_RIGHT_IMAGE_OVERLAY_DEFAULTS.HEADING),
    bodyText: textOf(bodyEl, PARA_TITLE_RIGHT_IMAGE_OVERLAY_DEFAULTS.BODY),
    imageUrl: imageEl?.content?.url || imageEl?.content?.src || null,
    accent: resolveStoredColor(cardEl, accent),
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

export function buildParaTitleRightImageOverlayCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const pal = options.palette || {}
  return buildElements({
    canvasW,
    canvasH,
    headingText: String(contentBySlotId.HEADING || content.title || PARA_TITLE_RIGHT_IMAGE_OVERLAY_DEFAULTS.HEADING).trim(),
    bodyText: String(contentBySlotId.BODY || content.body || PARA_TITLE_RIGHT_IMAGE_OVERLAY_DEFAULTS.BODY).trim(),
    imageUrl:
      contentBySlotId.HERO_IMAGE__url ||
      contentBySlotId.HERO_IMAGE_url ||
      content.imageUrl ||
      content.imageRef?.url ||
      null,
    accent: pal.primary || pal.accent || '#FFFFFF',
  })
}

export function paraTitleRightImageOverlayPreviewSvg() {
  const { textX, headingY } = GEOM
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="ptrioSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7EC8E8" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="ptrioHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#ptrioSky)" />
    <ellipse cx="480" cy="280" rx="110" ry="48" fill="#FFFFFF" opacity="0.94" />
    <ellipse cx="560" cy="280" rx="80" ry="38" fill="#FFFFFF" opacity="0.94" />
    <ellipse cx="1280" cy="220" rx="90" ry="40" fill="#FFFFFF" opacity="0.9" />
    <path d="M0 640 C360 520 720 620 1080 560 C1400 510 1680 620 1920 540 L1920 1080 L0 1080 Z" fill="url(#ptrioHill)" />
    ${buildParaTitleRightImageOverlaySvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}
    <text x="${textX}" y="${headingY + 44}" fill="#FFFFFF" font-size="36" font-weight="800" font-family="system-ui, sans-serif">Describe this slide</text>
    <text x="${textX}" y="548" fill="#E2E8F0" font-size="20" font-family="system-ui, sans-serif">We help teams turn complex ideas into</text>
    <text x="${textX}" y="580" fill="#E2E8F0" font-size="20" font-family="system-ui, sans-serif">clear narratives that drive decisions and</text>
    <text x="${textX}" y="612" fill="#E2E8F0" font-size="20" font-family="system-ui, sans-serif">build momentum across the organization.</text>
  </svg>`
}
