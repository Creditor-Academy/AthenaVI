/** Alignment guide overlay for PPT canvas drag. */

export default function PptCanvasGuidesOverlay({ guides = [], canvasW, canvasH }) {
  if (!guides.length || !canvasW || !canvasH) return null

  return (
    <div className="ppt-canvas-guides-overlay" aria-hidden>
      {guides.map((g, i) =>
        g.type === 'v' ? (
          <span
            key={`v-${i}`}
            className="ppt-canvas-guide-v"
            style={{ left: `${(g.x / canvasW) * 100}%` }}
          />
        ) : (
          <span
            key={`h-${i}`}
            className="ppt-canvas-guide-h"
            style={{ top: `${(g.y / canvasH) * 100}%` }}
          />
        )
      )}
    </div>
  )
}
