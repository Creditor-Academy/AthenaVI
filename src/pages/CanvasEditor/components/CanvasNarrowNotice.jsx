import { useEffect, useState } from 'react'
import { CANVAS_MIN_WIDTH, NARROW_CANVAS_MESSAGE, canvasViewportSupported } from '../canvasViewport'

/** Covers the editor when the window is below the supported width. */
export default function CanvasNarrowNotice() {
  const [width, setWidth] = useState(() => (
    typeof window === 'undefined' ? CANVAS_MIN_WIDTH : window.innerWidth
  ))

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (canvasViewportSupported(width)) return null

  return (
    <div className="canvas-narrow-notice" role="status">
      <p>{NARROW_CANVAS_MESSAGE}</p>
    </div>
  )
}
