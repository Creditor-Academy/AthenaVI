import { FiCheck, FiImage, FiMaximize, FiRotateCcw, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import {
  CROP_ASPECTS,
  CROP_MAX_ZOOM,
  cropSessionChanged,
  photoZoom,
  resetCropSession,
  setFrameAspect,
  zoomPhoto,
} from '../../../utils/imageCropSession'
import { CROP_UI_ATTR } from './cropUi'
import './imageCrop.css'

function AspectIcon({ aspect }) {
  if (aspect.id === 'free') return <FiMaximize size={16} aria-hidden />
  if (aspect.id === 'original') return <FiImage size={16} aria-hidden />
  const box = 20
  const w = aspect.value >= 1 ? box : box * aspect.value
  const h = aspect.value >= 1 ? box / aspect.value : box
  return <span className="icp-aspect-shape" style={{ width: w, height: h }} aria-hidden />
}

/**
 * Crop options for the properties area while an image is being cropped on the design:
 * frame shape, zoom, reset, and Cancel / Done. Edits go through `onChange(session)`.
 */
export default function ImageCropPanel({ session, onChange, onDone, onCancel }) {
  if (!session) return null
  const zoom = photoZoom(session)
  const changed = cropSessionChanged(session) || session.aspectId !== 'free'
  const { natural, frame, photo } = session
  const visibleW = Math.round((frame.width / photo.width) * natural.width)
  const visibleH = Math.round((frame.height / photo.height) * natural.height)

  return (
    <div {...CROP_UI_ATTR} className="icp-panel" role="region" aria-label="Crop image">
      <section>
        <h4 className="icp-section-title">Frame shape</h4>
        <div className="icp-aspects" role="radiogroup" aria-label="Frame shape">
          {CROP_ASPECTS.map((aspect) => (
            <button
              key={aspect.id}
              type="button"
              role="radio"
              aria-checked={session.aspectId === aspect.id}
              className={`icp-aspect ${session.aspectId === aspect.id ? 'is-active' : ''}`}
              onClick={() => onChange(setFrameAspect(session, aspect.id))}
            >
              <span className="icp-aspect-icon">
                <AspectIcon aspect={aspect} />
              </span>
              {aspect.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="icp-section-title">Zoom</h4>
        <div className="icp-zoom">
          <button
            type="button"
            className="icp-icon-btn"
            aria-label="Zoom out"
            disabled={zoom <= 1.001}
            onClick={() => onChange(zoomPhoto(session, zoom / 1.2))}
          >
            <FiZoomOut size={14} />
          </button>
          <input
            type="range"
            min={100}
            max={CROP_MAX_ZOOM * 100}
            step={1}
            value={Math.round(zoom * 100)}
            aria-label="Zoom"
            onChange={(e) => onChange(zoomPhoto(session, Number(e.target.value) / 100))}
          />
          <button
            type="button"
            className="icp-icon-btn"
            aria-label="Zoom in"
            disabled={zoom >= CROP_MAX_ZOOM - 0.001}
            onClick={() => onChange(zoomPhoto(session, zoom * 1.2))}
          >
            <FiZoomIn size={14} />
          </button>
          <span className="icp-zoom-value">{Math.round(zoom * 100)}%</span>
        </div>
      </section>

      <div className="icp-meta">
        <span>
          Showing {visibleW} × {visibleH} px of the photo
        </span>
        <button
          type="button"
          className="icp-reset"
          disabled={!changed}
          onClick={() => onChange(resetCropSession(session))}
        >
          <FiRotateCcw size={13} aria-hidden /> Reset
        </button>
      </div>

      <ul className="icp-tips">
        <li>
          <span className="icp-tip-key icp-tip-key--hand" aria-hidden />
          Drag the photo to choose what shows.
        </li>
        <li>
          <span className="icp-tip-key" aria-hidden />
          Drag a round corner, scroll or use Zoom to resize the photo.
        </li>
        <li>
          <span className="icp-tip-key icp-tip-key--bracket" aria-hidden />
          Drag the white corners or edges to change the frame. Hold Shift to keep its shape.
        </li>
      </ul>

      <div className="icp-footer">
        <button type="button" className="icp-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="icp-btn icp-btn--primary" onClick={onDone}>
          <FiCheck size={14} aria-hidden style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Done
        </button>
      </div>
    </div>
  )
}
