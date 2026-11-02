/**
 * Editor-only "danger zone" guide: shades the slide margins where text risks
 * being cropped or crowding the edge on projectors and exports. Rendered only
 * for the person editing — never in preview, share links, present mode or exports.
 */
import { slideTextSafeRect } from '../../../utils/slideTextSafeArea.js'

export default function PptCanvasTextSafeAreaOverlay({ canvasW, canvasH, warnCount = 0 }) {
  if (!canvasW || !canvasH) return null
  const safe = slideTextSafeRect(canvasW, canvasH)
  const pct = (v, total) => `${(v / total) * 100}%`
  const top = pct(safe.y, canvasH)
  const bottom = pct(canvasH - safe.y - safe.height, canvasH)
  const left = pct(safe.x, canvasW)
  const right = pct(canvasW - safe.x - safe.width, canvasW)
  const warning = warnCount > 0

  return (
    <div
      className={`ppt-canvas-text-safe-area${warning ? ' is-warning' : ''}`}
      data-editor-only="danger-zone"
      aria-hidden
    >
      {/* Four margin bands; the corners belong to the top/bottom bands. */}
      <div className="ppt-danger-band" style={{ top: 0, left: 0, right: 0, height: top }} />
      <div className="ppt-danger-band" style={{ bottom: 0, left: 0, right: 0, height: bottom }} />
      <div className="ppt-danger-band" style={{ top, bottom, left: 0, width: left }} />
      <div className="ppt-danger-band" style={{ top, bottom, right: 0, width: right }} />
      <div
        className="ppt-canvas-text-safe-area__rect"
        style={{
          left,
          top,
          width: pct(safe.width, canvasW),
          height: pct(safe.height, canvasH),
        }}
      />
      {/* Bottom-right edge: titles and headers usually sit top-left. */}
      <span className="ppt-danger-zone-label" style={{ right, bottom }}>
        {warning
          ? `${warnCount} text ${warnCount === 1 ? 'box is' : 'boxes are'} in the danger zone`
          : 'Danger zone · keep text inside'}
      </span>
    </div>
  )
}
