/**
 * Canva-style canvas overflow: min-overlap clamp + per-element clip/mask paint.
 * Shared by PPT slide stage and video LiveCanvasRenderer.
 */

export function minOverlapPx(size) {
  const s = Number(size) || 0
  return Math.max(40, s * 0.1)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** True when the element's AABB extends past the canvas edges. */
export function elementOverflowsCanvas(p, canvasW, canvasH) {
  const x = Number(p?.x) || 0
  const y = Number(p?.y) || 0
  const w = Math.max(1, Number(p?.width) || 1)
  const h = Math.max(1, Number(p?.height) || 1)
  return x < -0.5 || y < -0.5 || x + w > canvasW + 0.5 || y + h > canvasH + 0.5
}

/** Element-local % intersection of placement with the canvas. */
export function canvasIntersectionPct(p, canvasW, canvasH) {
  const x = Number(p?.x) || 0
  const y = Number(p?.y) || 0
  const w = Math.max(1, Number(p?.width) || 1)
  const h = Math.max(1, Number(p?.height) || 1)
  const il = Math.max(0, Math.min(100, ((0 - x) / w) * 100))
  const it = Math.max(0, Math.min(100, ((0 - y) / h) * 100))
  const ir = Math.max(0, Math.min(100, ((canvasW - x) / w) * 100))
  const ib = Math.max(0, Math.min(100, ((canvasH - y) / h) * 100))
  const hasIntersection = ir > il && ib > it
  const fullyOnCanvas = il <= 0.01 && it <= 0.01 && ir >= 99.99 && ib >= 99.99
  return { il, it, ir, ib, hasIntersection, fullyOnCanvas }
}

/** Hard-clip to the on-canvas portion (unselected overflow). */
export function onCanvasOnlyClipPath(p, canvasW, canvasH) {
  const { il, it, ir, ib, hasIntersection, fullyOnCanvas } = canvasIntersectionPct(
    p,
    canvasW,
    canvasH
  )
  if (fullyOnCanvas) return undefined
  if (!hasIntersection) return 'inset(100%)'
  return `polygon(${il}% ${it}%, ${ir}% ${it}%, ${ir}% ${ib}%, ${il}% ${ib}%)`
}

/**
 * Alpha mask: on-canvas = full opacity, overhang = `outsideAlpha`.
 * Applied on the live element so selection has no remount / ghost lag.
 */
export function selectedOverflowMaskStyle(p, canvasW, canvasH, outsideAlpha = 0.45) {
  const { il, it, ir, ib, hasIntersection, fullyOnCanvas } = canvasIntersectionPct(
    p,
    canvasW,
    canvasH
  )
  if (fullyOnCanvas || !hasIntersection) return null
  const a = Math.min(1, Math.max(0, outsideAlpha))
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">` +
    `<rect width="100" height="100" fill="white" fill-opacity="${a}"/>` +
    `<rect x="${il}" y="${it}" width="${ir - il}" height="${ib - it}" fill="white"/>` +
    `</svg>`
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
}

/**
 * Allow AABB to hang outside the canvas, but keep at least `minOverlap` px on-canvas.
 */
export function clampPlacementOverflow(x, y, width, height, canvasW, canvasH) {
  const w = Math.max(1, Number(width) || 1)
  const h = Math.max(1, Number(height) || 1)
  const ox = minOverlapPx(w)
  const oy = minOverlapPx(h)
  return {
    x: clamp(x, -w + ox, canvasW - ox),
    y: clamp(y, -h + oy, canvasH - oy),
    width: w,
    height: h,
  }
}

/**
 * Per-element overflow paint styles for the content box (not selection chrome).
 * Selected → translucent overhang mask; unselected → hard on-canvas clip.
 */
export function overflowPaintStyle({
  x,
  y,
  width,
  height,
  canvasW,
  canvasH,
  selected = false,
  editing = false,
  outsideAlpha = 0.45,
} = {}) {
  const p = { x, y, width, height }
  if (editing || !elementOverflowsCanvas(p, canvasW, canvasH)) return null
  if (selected) {
    return selectedOverflowMaskStyle(p, canvasW, canvasH, outsideAlpha)
  }
  const clip = onCanvasOnlyClipPath(p, canvasW, canvasH)
  if (!clip) return null
  return { clipPath: clip, WebkitClipPath: clip }
}
