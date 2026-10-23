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
  onFitZoom = null,
}) {
  return (
    <footer className="canva-bottom-bar">
      <div className="canva-bottom-controls">
        <span className="canva-bottom-page-badge">
          Page {activeCanvasIndex + 1} of {pageCount}
        </span>

        <div className="canva-bottom-divider" />

        <button
          type="button"
          className={`canva-bottom-icon-btn ${showGrid ? 'is-active' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Background"
        >
          <FiGrid size={13} />
          <span>Grid</span>
        </button>

        <div className="canva-bottom-divider" />

        <div className="canva-bottom-zoom-group">
          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={() => setZoom((z) => Math.max(0.15, Number((z - 0.1).toFixed(2))))}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <FiZoomOut size={13} />
          </button>

          <select
            className="canva-bottom-zoom-select"
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            aria-label="Zoom Level"
          >
            <option value="25">25%</option>
            <option value="40">40%</option>
            <option value="50">50%</option>
            <option value="60">60%</option>
            <option value="75">75%</option>
            <option value="85">85%</option>
            <option value="100">100%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
          </select>

          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <FiZoomIn size={13} />
          </button>

          <button
            type="button"
            className="canva-bottom-zoom-btn"
            onClick={onFitZoom ? onFitZoom : () => setZoom(0.85)}
            title="Fit Canvas to Screen"
            aria-label="Fit to screen"
          >
            <FiMaximize2 size={13} />
          </button>
        </div>
      </div>
    </footer>
  )
}
