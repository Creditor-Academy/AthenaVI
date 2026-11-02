/** Text-only slide safe area (danger zone). Images are not constrained. */
export const SLIDE_TEXT_SAFE_INSET_X = 96
export const SLIDE_TEXT_SAFE_INSET_Y = 54

export function slideTextSafeRect(canvasW = 1920, canvasH = 1080) {
  const w = Math.max(320, Number(canvasW) || 1920)
  const h = Math.max(240, Number(canvasH) || 1080)
  const insetX = Math.min(SLIDE_TEXT_SAFE_INSET_X, Math.floor(w * 0.12))
  const insetY = Math.min(SLIDE_TEXT_SAFE_INSET_Y, Math.floor(h * 0.12))
  return {
    x: insetX,
    y: insetY,
    width: Math.max(80, w - insetX * 2),
    height: Math.max(80, h - insetY * 2),
  }
}

/** Placements within this many canvas px of the edge still count as inside. */
const DANGER_ZONE_TOLERANCE = 1

function isTextLike(el) {
  return el?.type === 'text' || el?.type === 'textbox'
}

/**
 * Ids of text elements whose box reaches into the danger zone (outside the
 * text safe area). Used only for the editor-side warning — never for export.
 */
export function textElementsInDangerZone(elements, canvasW = 1920, canvasH = 1080) {
  if (!Array.isArray(elements) || !elements.length) return []
  const safe = slideTextSafeRect(canvasW, canvasH)
  const right = safe.x + safe.width
  const bottom = safe.y + safe.height
  const ids = []
  for (const el of elements) {
    if (!isTextLike(el) || el.hidden) continue
    const p = el.placement || {}
    const x = Number(p.x)
    const y = Number(p.y)
    const w = Number(p.width)
    const h = Number(p.height)
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) continue
    if (
      x < safe.x - DANGER_ZONE_TOLERANCE ||
      y < safe.y - DANGER_ZONE_TOLERANCE ||
      x + w > right + DANGER_ZONE_TOLERANCE ||
      y + h > bottom + DANGER_ZONE_TOLERANCE
    ) {
      ids.push(el.id)
    }
  }
  return ids
}
