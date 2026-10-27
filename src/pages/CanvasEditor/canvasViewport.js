/**
 * Below this width the header, dock, and stage collapse into each other.
 * The editor shows a notice instead of that layout.
 */
export const CANVAS_MIN_WIDTH = 960

export const NARROW_CANVAS_MESSAGE = 'Canvas Editor works best on a larger screen'

export function canvasViewportSupported(width) {
  return Number(width) >= CANVAS_MIN_WIDTH
}
