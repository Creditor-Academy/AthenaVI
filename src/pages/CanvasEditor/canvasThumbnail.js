/**
 * Cover image for a canvas library card.
 * Built from the first page (size, background, element geometry and text) and stored
 * on the project as an SVG data URL — no extra asset upload, and it updates only when
 * that page actually looks different.
 */

export const MAX_THUMBNAIL_CHARS = 100000
const MAX_ELEMENTS = 36
const MAX_TEXT = 48

function safeColor(value, fallback) {
  const text = String(value || '').trim()
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text)) return text
  if (/^(?:rgb|hsl)a?\([^)]*\)$/i.test(text)) return text
  if (/^[a-z]{3,20}$/i.test(text)) return text
  return fallback
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function num(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : fallback
}

function elementFill(el) {
  const content = el?.content || {}
  return safeColor(content.fill || content.color || content.background || content.backgroundColor, '#CBD5E1')
}

function pageBackground(page) {
  const background = page?.background
  if (background && typeof background === 'object') {
    return safeColor(background.color || background.value || background.fill, '#FFFFFF')
  }
  return safeColor(background, '#FFFFFF')
}

/** Stable fingerprint of the first page's visible cover. Lock flags are not included. */
export function previewSignature(canvases) {
  const page = canvases?.[0]
  if (!page) return ''
  return JSON.stringify({
    id: page.id,
    w: page.width,
    h: page.height,
    bg: page.background ?? null,
    elements: (page.elements || []).map((el) => ({
      id: el.id,
      type: el.type,
      layer: el.layer ?? 0,
      x: el.placement?.x ?? 0,
      y: el.placement?.y ?? 0,
      w: el.placement?.width ?? 0,
      h: el.placement?.height ?? 0,
      fill: el.content?.fill || el.content?.color || null,
      text: typeof el.content?.text === 'string' ? el.content.text.slice(0, 80) : '',
      url: el.content?.url || el.content?.src || '',
    })),
  })
}

function coverElements(page, { withText, limit }) {
  return [...(page?.elements || [])]
    .sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
    .slice(0, limit)
    .map((el) => ({ el, withText }))
}

/**
 * SVG cover of one page. `withText` / `limit` shrink the markup if a busy page
 * would exceed the API's thumbnail length.
 */
export function buildCoverSvg(page, { maxEdge = 480, withText = true, limit = MAX_ELEMENTS } = {}) {
  const srcW = Math.max(1, num(page?.width, 1080))
  const srcH = Math.max(1, num(page?.height, 1080))
  const scale = maxEdge / Math.max(srcW, srcH)
  const width = Math.max(1, Math.round(srcW * scale))
  const height = Math.max(1, Math.round(srcH * scale))
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${srcW} ${srcH}">`,
    `<rect width="100%" height="100%" fill="${escapeXml(pageBackground(page))}"/>`,
  ]

  for (const { el } of coverElements(page, { withText, limit })) {
    const placement = el.placement || {}
    const x = num(placement.x)
    const y = num(placement.y)
    const w = Math.max(1, num(placement.width, 1))
    const h = Math.max(1, num(placement.height, 1))
    const type = el.type
    if ((type === 'text' || type === 'textbox') && withText) {
      const line = String(el.content?.text || '').split('\n')[0].slice(0, MAX_TEXT)
      if (!line) continue
      const size = Math.max(12, Math.min(num(el.content?.fontSize, 32), h * 0.8))
      const color = escapeXml(safeColor(el.content?.color, '#172033'))
      parts.push(
        `<text x="${x + 4}" y="${y + size}" fill="${color}" font-size="${size}" font-family="sans-serif">${escapeXml(line)}</text>`
      )
      continue
    }
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${escapeXml(elementFill(el))}"/>`
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

/** Small SVG cover for a page card or an inactive page. Not stored. */
export function pageCoverDataUrl(page, options = {}) {
  if (!page) return null
  const svg = buildCoverSvg(page, { maxEdge: 160, withText: true, limit: 12, ...options })
  if (!svg) return null
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** `data:image/svg+xml` URL small enough to store on the project row. */
export function thumbnailDataUrl(page) {
  if (!page) return null
  const attempts = [
    { withText: true, limit: MAX_ELEMENTS },
    { withText: false, limit: MAX_ELEMENTS },
    { withText: false, limit: 12 },
  ]
  for (const attempt of attempts) {
    const svg = buildCoverSvg(page, attempt)
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    if (url.length <= MAX_THUMBNAIL_CHARS) return url
  }
  return null
}

/**
 * Cover to send with create or a later meta update.
 * `changed` is false when the first page looks the same as `previousSignature`.
 */
export function nextThumbnail(canvases, previousSignature = null) {
  const signature = previewSignature(canvases)
  if (!signature || signature === previousSignature) {
    return { signature, url: null, changed: false }
  }
  const url = thumbnailDataUrl(canvases[0])
  if (!url) return { signature, url: null, changed: false }
  return { signature, url, changed: true }
}
