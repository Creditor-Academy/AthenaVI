/** Text-only safe area guide (images are not constrained). */
import { slideTextSafeRect } from '../../../utils/slideTextSafeArea.js'

export default function PptCanvasTextSafeAreaOverlay({ canvasW, canvasH }) {
  if (!canvasW || !canvasH) return null
  const safe = slideTextSafeRect(canvasW, canvasH)
  return (
    <div className="ppt-canvas-text-safe-area" aria-hidden title="Text safe area">
      <div
        className="ppt-canvas-text-safe-area__rect"
        style={{
          left: `${(safe.x / canvasW) * 100}%`,
          top: `${(safe.y / canvasH) * 100}%`,
          width: `${(safe.width / canvasW) * 100}%`,
          height: `${(safe.height / canvasH) * 100}%`,
        }}
      />
    </div>
  )
}
