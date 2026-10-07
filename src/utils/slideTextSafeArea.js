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
