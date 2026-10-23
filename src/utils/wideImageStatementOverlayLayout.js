/**
 * Wide Image Statement Overlay
 * Layout ID: wide_image_statement_overlay_v1
 *
 * Full-bleed photo, cinematic gradient (not a flat 50% black),
 * centered subheadline + statement. Same catalog slots.
 */

export function isWideImageStatementOverlayLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'wide_image_statement_overlay_v1' || id === 'wide_image_statement_overlay'
}

export const WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS = {
  SUBHEADLINE: 'Subheadline',
  STATEMENT: 'Great work starts with a clear, unforgettable idea.',
}

export function buildWideImageStatementOverlaySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <radialGradient id="wisoVignette" cx="50%" cy="42%" r="72%">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.08" />
        <stop offset="62%" stop-color="#020617" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0.72" />
      </radialGradient>
      <linearGradient id="wisoWash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.18" />
        <stop offset="38%" stop-color="#020617" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0.62" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#wisoWash)" />
    <rect width="1920" height="1080" fill="url(#wisoVignette)" />
    <rect x="908" y="428" width="104" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.92" />
  </svg>`
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

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function findTextFromElements(elements, ids, fallback) {
  for (const id of ids) {
    const el = elements.find((e) => String(e.slotId || '').toUpperCase() === id)
    const txt = el?.content?.text || el?.text
    if (txt && String(txt).trim()) return String(txt).trim()
  }
  return fallback
}

function findImageUrl(elements, contentBySlotId = {}, content = {}) {
  const el = elements.find((e) => {
    const sid = String(e.slotId || '').toUpperCase()
    return e.type === 'image' || sid === 'BACKGROUND_IMAGE' || sid === 'HERO_IMAGE'
  })
  return (
    el?.content?.url ||
    el?.content?.src ||
    contentBySlotId.BACKGROUND_IMAGE__url ||
    contentBySlotId.BACKGROUND_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null
  )
}

function buildElements({ canvasW, canvasH, statementText, subheadlineText, imageUrl }) {
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)
  const long = statementText.length > 42 || statementText.split(/\r?\n/).filter(Boolean).length > 1
  const statementY = long ? Math.round(456 * sy) : Math.round(480 * sy)
  const statementH = long ? Math.round(220 * sy) : Math.round(140 * sy)

  return [
    {
      id: 'slot-BACKGROUND_IMAGE',
      slotId: 'BACKGROUND_IMAGE',
      type: 'image',
      role: 'background',
      layer: 0,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
      },
    },
    {
      id: 'slot-OVERLAY_SCRIM',
      slotId: 'OVERLAY_SCRIM',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildWideImageStatementOverlaySvg(),
        preserveAspectRatio: 'none',
        colorMode: 'preserve',
      },
    },
    {
      id: 'slot-SUBHEADLINE',
      slotId: 'SUBHEADLINE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(280 * sx),
        y: Math.round(348 * sy),
        width: Math.round(1360 * sx),
        height: Math.round(44 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: String(subheadlineText).toUpperCase(),
        fontSize: Math.round(16 * scale),
        fontWeight: 700,
        color: '#FFFFFF',
        align: 'center',
        verticalAlign: 'center',
        letterSpacing: '0.22em',
        lineHeight: 1.2,
        clipToSlot: true,
        maxLines: 1,
      },
    },
    {
      id: 'slot-STATEMENT',
      slotId: 'STATEMENT',
      type: 'text',
      role: 'quote',
      layer: 10,
      placement: {
        x: Math.round(200 * sx),
        y: statementY,
        width: Math.round(1520 * sx),
        height: statementH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: statementText,
        fontSize: Math.round(long ? 46 * scale : 54 * scale),
        fontWeight: 800,
        color: '#FFFFFF',
        align: 'center',
        verticalAlign: 'flex-start',
        lineHeight: 1.18,
        wrap: 'pre-wrap',
        clipToSlot: true,
        maxLines: 3,
      },
    },
  ]
}

export function layoutWideImageStatementOverlay(docOrElements, schema = {}, palette = {}, canvas = {}) {
  const elements = Array.isArray(docOrElements) ? docOrElements : (docOrElements?.elements || [])
  const canvasW = canvas?.width || docOrElements?.canvas?.width || 1920
  const canvasH = canvas?.height || docOrElements?.canvas?.height || 1080
  const statementText = findTextFromElements(
    elements,
    ['STATEMENT', 'HEADING', 'MAIN_TITLE', 'QUOTE'],
    WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.STATEMENT
  )
  const subheadlineText = findTextFromElements(
    elements,
    ['SUBHEADLINE', 'SUBTITLE', 'EYEBROW'],
    WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.SUBHEADLINE
  )
  const imageUrl = findImageUrl(elements)
  const out = buildElements({ canvasW, canvasH, statementText, subheadlineText, imageUrl })
  if (Array.isArray(docOrElements)) return out
  return { ...docOrElements, elements: out }
}

export function buildWideImageStatementOverlayCanvasElements({ schema, options = {} } = {}) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const statementText = String(
    contentBySlotId.STATEMENT || content.statement || content.title || options.slideTitle || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.STATEMENT
  ).trim()
  const subheadlineText = String(
    contentBySlotId.SUBHEADLINE || content.subheadline || content.subtitle || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.SUBHEADLINE
  ).trim()
  const imageUrl = findImageUrl([], contentBySlotId, content)
  return buildElements({
    canvasW,
    canvasH,
    statementText: statementText || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.STATEMENT,
    subheadlineText: subheadlineText || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.SUBHEADLINE,
    imageUrl,
  })
}

export function wideImageStatementOverlayPreviewSvg(previewHints = {}) {
  const slots = previewHints?.slots || {}
  const rawStatement = slots.STATEMENT?.text || previewHints?.heading || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.STATEMENT
  const rawSub = slots.SUBHEADLINE?.text || previewHints?.subheading || WIDE_IMAGE_STATEMENT_OVERLAY_DEFAULTS.SUBHEADLINE
  const statement = escapeXml(String(rawStatement).replace(/\s+/g, ' ').trim())
  const sub = escapeXml(String(rawSub).toUpperCase())
  const lines = wrapLines(statement, 34, 3)
  const tspans = lines
    .map((line, idx) => `<tspan x="960" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="wisoSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="wisoHillB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="wisoHillF" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>
    <svg x="0" y="0" width="1920" height="1080" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill="url(#wisoSky)" />
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="78" cy="48" rx="28" ry="14" />
        <ellipse cx="98" cy="48" rx="22" ry="12" />
        <ellipse cx="58" cy="50" rx="16" ry="10" />
        <ellipse cx="210" cy="36" rx="34" ry="16" />
        <ellipse cx="236" cy="36" rx="24" ry="13" />
        <ellipse cx="186" cy="38" rx="18" ry="11" />
      </g>
      <path d="M0 128 C40 108 78 118 112 126 C148 116 178 102 220 112 C252 120 280 128 320 118 L320 200 L0 200 Z" fill="url(#wisoHillB)" />
      <path d="M0 152 C36 136 70 148 108 156 C150 144 190 130 236 142 C268 150 296 158 320 150 L320 200 L0 200 Z" fill="url(#wisoHillF)" />
    </svg>
    ${buildWideImageStatementOverlaySvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}
    <text x="960" y="380" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="0.22em">${sub}</text>
    <text x="960" y="520" text-anchor="middle" fill="#FFFFFF" font-size="48" font-weight="800" font-family="system-ui, sans-serif" letter-spacing="-0.03em">${tspans}</text>
  </svg>`
}
