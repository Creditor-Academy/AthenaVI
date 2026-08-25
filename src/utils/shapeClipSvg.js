/**
 * Parse CSS clip-path polygon(...) into SVG polygon points (0–100 viewBox).
 */

export function parsePolygonClipPath(clipPath) {
  if (!clipPath || typeof clipPath !== 'string') return null
  const m = clipPath.match(/polygon\s*\(\s*([^)]+)\s*\)/i)
  if (!m) return null
  const points = []
  const parts = m[1].split(',').map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    const nums = part.match(/(-?[\d.]+)\s*%?/g)
    if (!nums || nums.length < 2) continue
    const x = parseFloat(nums[0])
    const y = parseFloat(nums[1])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    points.push(`${x},${y}`)
  }
  return points.length >= 3 ? points.join(' ') : null
}

/**
 * Build SVG render props for a clipPath shape (filled or outlined).
 */
export function buildClipShapeSvgProps({
  clipPath,
  fill = '#475569',
  stroke = '#475569',
  strokeWidth = 3,
  outlined = false,
}) {
  const points = parsePolygonClipPath(clipPath)
  if (!points) return null
  return {
    viewBox: '0 0 100 100',
    points,
    fill: outlined ? 'none' : fill,
    stroke: outlined ? stroke || fill : 'none',
    strokeWidth: outlined ? Math.max(1.5, Number(strokeWidth) || 3) : 0,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  }
}

/** React-friendly SVG element factory props for canvas / panel previews. */
export function clipShapeSvgElementProps(svgProps, { pad = 4 } = {}) {
  if (!svgProps) return null
  const sw = svgProps.strokeWidth || 0
  // Inset stroke so outlines aren't clipped by the viewBox edge
  const inset = outlinedInset(sw, pad)
  return {
    svg: {
      viewBox: `0 0 100 100`,
      preserveAspectRatio: 'none',
      style: { width: '100%', height: '100%', display: 'block', overflow: 'visible' },
    },
    polygon: {
      points: svgProps.points,
      fill: svgProps.fill,
      stroke: svgProps.stroke,
      strokeWidth: sw,
      strokeLinejoin: svgProps.strokeLinejoin || 'round',
      strokeLinecap: svgProps.strokeLinecap || 'round',
      vectorEffect: 'non-scaling-stroke',
      // Scale polygon slightly inward when stroked so edges stay visible
      transform: inset > 0 ? `translate(${inset} ${inset}) scale(${(100 - inset * 2) / 100})` : undefined,
      transformOrigin: '0 0',
    },
  }
}

function outlinedInset(strokeWidth, pad) {
  if (!strokeWidth || strokeWidth <= 0) return 0
  return Math.min(8, Math.max(pad * 0.15, strokeWidth * 0.35))
}
