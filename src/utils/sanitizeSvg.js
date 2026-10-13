/** SVG markup sanitizer for innerHTML sinks (element content.svg, fetched graphic SVGs). */
import DOMPurify from 'dompurify'

/**
 * Strip scripts, event handlers, javascript: URLs and foreignObject (HTML smuggling) from SVG.
 * Returns null when the input is not SVG or nothing usable survives.
 */
export function sanitizeSvgMarkup(raw) {
  const svg = String(raw || '')
  if (!/<svg[\s>]/i.test(svg)) return null
  const clean = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['foreignObject'],
  })
  return /<svg[\s>]/i.test(clean) ? clean : null
}
