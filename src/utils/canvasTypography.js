/** Reference slide width — canvas-relative type scales like Replit vw on the slide box. */
export const CANVAS_REF_WIDTH = 1920

/** vw-equivalent fractions of canvas width (5.5vw headline ≈ 0.055 × 1920 ≈ 106px). */
const ROLE_VW = {
  heading: 0.055,
  quote: 0.05,
  subheading: 0.035,
  body: 0.018,
  stat: 0.1,
  caption: 0.012,
  stat_label: 0.014,
  eyebrow: 0.012,
  cta: 0.022,
  attribution: 0.014,
}

function vwForSlot(role, slotId = '') {
  const id = String(slotId || '').toLowerCase()
  if (id === 'stat_value' || /^stat_\d+_value$/.test(id) || id === 'section_number') return 0.1
  if (id === 'stat_label' || /^stat_\d+_label$/.test(id)) return 0.016
  if (id.includes('title') && !id.includes('subtitle')) return 0.052
  if (id.includes('subtitle')) return 0.028
  return ROLE_VW[String(role || 'body').toLowerCase()] ?? ROLE_VW.body
}

/**
 * Canvas-relative font size: vw-style scale from slide width, capped by slot height + max_lines.
 */
export function fontSizeForTextSlot(slot, placement, canvasWidth = CANVAS_REF_WIDTH) {
  const role = String(slot?.role || 'body').toLowerCase()
  const slotId = slot?.id || ''
  const cw = Math.max(Number(canvasWidth) || CANVAS_REF_WIDTH, 320)
  const fromCanvas = cw * vwForSlot(role, slotId)

  const maxLines =
    slot?.max_lines ||
    (role === 'stat'
      ? 1
      : role === 'heading' || role === 'quote'
        ? 2
        : role === 'caption' || role === 'stat_label'
          ? 2
          : 4)
  const lineHeight = role === 'stat' ? 1.1 : 1.32
  const height = Math.max(Number(placement?.height) || 0, 24)
  const maxByHeight = height / (maxLines * lineHeight) - 2

  const minSize = role === 'stat' ? 20 : 12
  const cap = role === 'stat' ? Math.min(220, fromCanvas) : fromCanvas

  return Math.round(Math.max(minSize, Math.min(cap, maxByHeight)))
}

export function resolveTypeScaleFontSize(role, typeScale = {}) {
  const r = String(role || '').toLowerCase()
  const map = {
    heading: typeScale.title ?? typeScale.display,
    quote: typeScale.subtitle ?? typeScale.title,
    subheading: typeScale.subtitle,
    body: typeScale.body,
    caption: typeScale.caption,
    stat_label: typeScale.caption,
    eyebrow: typeScale.caption,
    stat: typeScale.stat ?? typeScale.display,
    cta: typeScale.subtitle,
  }
  const size = map[r]
  return size != null && Number(size) > 0 ? Number(size) : null
}

function estimateLineCount(text, charsPerLine) {
  const lines = String(text || '').split(/\r?\n/)
  let total = 0
  for (const line of lines) {
    const len = line.trim().length
    total += Math.max(1, Math.ceil(len / Math.max(charsPerLine, 1)))
  }
  return total
}

function truncateToLines(text, maxLines) {
  const raw = String(text ?? '')
  if (maxLines <= 0) return ''
  const lines = raw.split(/\r?\n/)
  if (lines.length <= maxLines) return raw
  return lines.slice(0, maxLines).join('\n')
}

function truncateToWords(text, maxWords) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return String(text ?? '')
  return words.slice(0, maxWords).join(' ')
}

/**
 * Fit text content inside a slot without changing slot geometry.
 * Reduces font size, then line-height, then truncates as fallback.
 */
export function fitTextToSlot(text, slot, placement, options = {}) {
  const role = String(slot?.role || 'body').toLowerCase()
  const ty = slot?.typography || {}
  const pad = options.contentPadding || { x: 8, y: 8 }
  const innerW = Math.max(1, (placement?.width || 0) - (pad.x || 0) * 2)
  const innerH = Math.max(1, (placement?.height || 0) - (pad.y || 0) * 2)
  const canvasWidth = options.canvas?.width || options.canvasWidth || CANVAS_REF_WIDTH

  const maxLines =
    slot?.max_lines ||
    (role === 'stat'
      ? 1
      : role === 'heading' || role === 'quote'
        ? 2
        : role === 'caption' || role === 'stat_label'
          ? 2
          : 4)

  let fontSize =
    ty.fontSize != null
      ? Number(ty.fontSize)
      : resolveTypeScaleFontSize(role, options.typeScale) ??
        fontSizeForTextSlot(slot, placement, canvasWidth)

  const minSize = role === 'stat' ? 20 : 12
  const maxWords = slot?.max_words || null
  let lineHeight = ty.lineHeight || (role === 'stat' ? 1.08 : role === 'heading' ? 1.18 : 1.42)
  let content = String(text ?? '')

  if (maxWords && maxWords > 0) {
    content = truncateToWords(content, maxWords)
  }

  const charsPerLine = Math.max(8, Math.floor(innerW / (fontSize * 0.52)))

  for (let attempt = 0; attempt < 24; attempt++) {
    const lines = estimateLineCount(content, charsPerLine)
    const requiredH = lines * fontSize * lineHeight
    if (lines <= maxLines && requiredH <= innerH) break

    if (fontSize > minSize) {
      fontSize = Math.max(minSize, fontSize - 1)
      continue
    }

    if (lineHeight > 1.05) {
      lineHeight = Math.max(1.05, lineHeight - 0.04)
      continue
    }

    content = truncateToLines(content, maxLines)
    break
  }

  return {
    text: content,
    fontSize: Math.round(fontSize),
    lineHeight,
  }
}
