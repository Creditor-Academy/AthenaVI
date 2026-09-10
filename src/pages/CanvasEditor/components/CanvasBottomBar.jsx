import {
  FiZoomIn,
  FiZoomOut,
  FiGrid,
  FiMaximize2,
} from 'react-icons/fi'

export default function CanvasBottomBar({
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  pageCount,
  activeCanvasIndex,
}) {
  return (
    <footer className="canva-bottom-bar">
      <div className="canva-bottom-left">
        <span className="canva-bottom-page-badge">
          Page {activeCanvasIndex + 1} of {pageCount}
        </span>
      </div>

      <div className="canva-bottom-center">
        <button
          type="button"
          className={`canva-bottom-icon-btn ${showGrid ? 'is-active' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Background"
        >
          <FiGrid />
          <span>Grid</span>
        </button>
      </div>

      <div className="canva-bottom-right">
        <div className="canva-bottom-zoom-group">
          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
            title="Zoom Out"
          >
            <FiZoomOut />
          </button>

          <select
            className="canva-bottom-zoom-select"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom Level"
          >
            <option value="0.4">40%</option>
            <option value="0.6">60%</option>
            <option value="0.85">85%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
          </select>

          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
            title="Zoom In"
          >
            <FiZoomIn />
          </button>

          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={() => setZoom(0.85)}
            title="Reset Zoom to 85%"
          >
            <FiMaximize2 />
          </button>
        </div>
      </div>
    </footer>
  )
}
