import { buildClipShapeSvgProps, clipShapeSvgElementProps } from '../../utils/shapeClipSvg'

/**
 * Renders a CSS polygon() clipPath shape as SVG (filled or outlined).
 * Falls back to null when clipPath is not a parseable polygon.
 */
export default function ClipShapeSvg({
  clipPath,
  fill = '#475569',
  stroke = '#475569',
  strokeWidth = 3,
  outlined = false,
  strokeDasharray,
  style = {},
  className = '',
}) {
  const svgProps = buildClipShapeSvgProps({
    clipPath,
    fill,
    stroke,
    strokeWidth,
    outlined,
    strokeDasharray,
  })
  const el = clipShapeSvgElementProps(svgProps)
  if (!el) return null

  return (
    <svg className={className} {...el.svg} style={{ ...el.svg.style, ...style }} aria-hidden>
      <polygon {...el.polygon} />
    </svg>
  )
}
