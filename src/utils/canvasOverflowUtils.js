/**
 * Canva-style canvas overflow: min-overlap clamp + per-element clip/mask paint.
 * Clip/mask polygons are computed in element-local space so rotation is correct
 * (CSS clip-path/mask rotate with the element).
 */

export function minOverlapPx(size) {
  const s = Number(size) || 0
  return Math.max(40, s * 0.1)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function degToRad(deg) {
  return ((Number(deg) || 0) * Math.PI) / 180
}

function placementBox(p) {
  return {
    x: Number(p?.x) || 0,
    y: Number(p?.y) || 0,
    w: Math.max(1, Number(p?.width) || 1),
    h: Math.max(1, Number(p?.height) || 1),
    rotation: Number(p?.rotation) || 0,
  }
}

/** World-space corners of the (possibly rotated) element. */
export function getElementWorldCorners(p) {
  const { x, y, w, h, rotation } = placementBox(p)
  const cx = x + w / 2
  const cy = y + h / 2
  const local = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
  ]
  if (!rotation) {
    return local.map((pt) => ({ x: cx + pt.x, y: cy + pt.y }))
  }
  const rad = degToRad(rotation)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return local.map((pt) => ({
    x: cx + pt.x * cos - pt.y * sin,
    y: cy + pt.x * sin + pt.y * cos,
  }))
}

/** Canvas point → element-local % (0–100), accounting for rotation about center. */
function worldToLocalPct(wx, wy, p) {
  const { x, y, w, h, rotation } = placementBox(p)
  const cx = x + w / 2
  const cy = y + h / 2
  const dx = wx - cx
  const dy = wy - cy
  const rad = -degToRad(rotation)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const lx = dx * cos - dy * sin
  const ly = dx * sin + dy * cos
  return {
    x: ((lx + w / 2) / w) * 100,
    y: ((ly + h / 2) / h) * 100,
  }
}

function lineIntersect(a, b, c, d) {
  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)
  if (Math.abs(den) < 1e-9) return { x: c.x, y: c.y }
  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  }
}

/** Inside test for clockwise clip edge (y-down / CSS coordinates). */
function isInsideEdge(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-9
}

/** Sutherland–Hodgman polygon clip (clip must be convex). */
function clipPolygon(subject, clipPoly) {
  let output = subject
  for (let i = 0; i < clipPoly.length; i += 1) {
    const a = clipPoly[i]
    const b = clipPoly[(i + 1) % clipPoly.length]
    const input = output
    output = []
    if (!input.length) break
    for (let j = 0; j < input.length; j += 1) {
      const p = input[j]
      const q = input[(j + 1) % input.length]
      const pIn = isInsideEdge(a, b, p)
      const qIn = isInsideEdge(a, b, q)
      if (pIn && qIn) {
        output.push(q)
      } else if (pIn && !qIn) {
        output.push(lineIntersect(a, b, p, q))
      } else if (!pIn && qIn) {
        output.push(lineIntersect(a, b, p, q))
        output.push(q)
      }
    }
  }
  return output
}

/**
 * Intersection of element rect with the canvas, in element-local %.
 * Returns [] when there is no overlap.
 */
export function canvasIntersectionLocalPolygon(p, canvasW, canvasH) {
  const subject = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]
  const canvasLocal = [
    worldToLocalPct(0, 0, p),
    worldToLocalPct(canvasW, 0, p),
    worldToLocalPct(canvasW, canvasH, p),
    worldToLocalPct(0, canvasH, p),
  ]
  const poly = clipPolygon(subject, canvasLocal)
  if (poly.length < 3) return []
  return poly.map((pt) => ({
    x: clamp(pt.x, -50, 150),
    y: clamp(pt.y, -50, 150),
  }))
}

function polygonToCss(poly) {
  return poly.map((pt) => `${pt.x.toFixed(3)}% ${pt.y.toFixed(3)}%`).join(', ')
}

function polygonArea(poly) {
  if (poly.length < 3) return 0
  let area = 0
  for (let i = 0; i < poly.length; i += 1) {
    const j = (i + 1) % poly.length
    area += poly[i].x * poly[j].y - poly[j].x * poly[i].y
  }
  return Math.abs(area) / 2
}

/** True when intersection covers ~the whole element box (no meaningful overhang). */
function polygonNearlyFull(poly) {
  // Unit square in local % has area 100×100 = 10000
  return polygonArea(poly) >= 10000 * 0.992
}

/** True when any part of the (rotated) element extends past the canvas. */
export function elementOverflowsCanvas(p, canvasW, canvasH) {
  const corners = getElementWorldCorners(p)
  return corners.some(
    (c) => c.x < -0.5 || c.y < -0.5 || c.x > canvasW + 0.5 || c.y > canvasH + 0.5
  )
}

/** Legacy axis-aligned intersection (unrotated). Kept for simple callers. */
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

/** Hard-clip to the on-canvas portion (unselected overflow). Rotation-aware. */
export function onCanvasOnlyClipPath(p, canvasW, canvasH) {
  if (!elementOverflowsCanvas(p, canvasW, canvasH)) return undefined
  const poly = canvasIntersectionLocalPolygon(p, canvasW, canvasH)
  if (!poly.length) return 'inset(100%)'
  if (polygonNearlyFull(poly)) return undefined
  return `polygon(${polygonToCss(poly)})`
}

/**
 * Alpha mask: on-canvas = full opacity, overhang = `outsideAlpha`.
 * Rotation-aware (mask is in element-local space).
 */
export function selectedOverflowMaskStyle(p, canvasW, canvasH, outsideAlpha = 0.45) {
  if (!elementOverflowsCanvas(p, canvasW, canvasH)) return null
  const poly = canvasIntersectionLocalPolygon(p, canvasW, canvasH)
  if (!poly.length) {
    // Fully off-canvas but still selected — show dimmed whole element
    const a = Math.min(1, Math.max(0, outsideAlpha))
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">` +
      `<rect width="100" height="100" fill="white" fill-opacity="${a}"/>` +
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
  if (polygonNearlyFull(poly)) return null

  const a = Math.min(1, Math.max(0, outsideAlpha))
  const points = poly.map((pt) => `${pt.x.toFixed(3)},${pt.y.toFixed(3)}`).join(' ')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">` +
    `<rect width="100" height="100" fill="white" fill-opacity="${a}"/>` +
    `<polygon points="${points}" fill="white"/>` +
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
 * Always returns explicit mask/clip clears so rotation changes don't leave stale styles.
 */
export function overflowPaintStyle({
  x,
  y,
  width,
  height,
  rotation = 0,
  canvasW,
  canvasH,
  selected = false,
  editing = false,
  outsideAlpha = 0.45,
} = {}) {
  const clear = {
    maskImage: 'none',
    WebkitMaskImage: 'none',
    clipPath: 'none',
    WebkitClipPath: 'none',
  }
  const p = { x, y, width, height, rotation }
  if (editing || !elementOverflowsCanvas(p, canvasW, canvasH)) return clear
  if (selected) {
    const mask = selectedOverflowMaskStyle(p, canvasW, canvasH, outsideAlpha)
    return mask ? { ...clear, ...mask, clipPath: 'none', WebkitClipPath: 'none' } : clear
  }
  const clip = onCanvasOnlyClipPath(p, canvasW, canvasH)
  if (!clip) return clear
  return { ...clear, clipPath: clip, WebkitClipPath: clip }
}
