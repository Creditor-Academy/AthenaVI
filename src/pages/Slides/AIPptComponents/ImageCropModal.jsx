import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import './pptEditorExtras.css'
import './pptPanelUi.css'

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

export default function ImageCropModal({ imageUrl, onApply, onClose }) {
  const [fit, setFit] = useState('cover')
  const [opacity, setOpacity] = useState(100)

  if (!imageUrl) return null

  return (
    <div
      className="ppt-crop-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ppt-crop-modal" role="dialog" aria-labelledby="ppt-crop-modal-title">
        <header className="ppt-crop-modal-head">
          <h2 id="ppt-crop-modal-title" className="ppt-crop-modal-title">
            Image settings
          </h2>
          <button
            type="button"
            className="ppt-crop-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>

        <div className="ppt-crop-preview">
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              objectFit: fit,
              opacity: opacity / 100,
            }}
          />
        </div>

        <div className="ppt-props-stack ppt-crop-modal-controls">
          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">Fit</span>
            <div className="ppt-segmented" role="radiogroup" aria-label="Image fit">
              {FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={fit === opt.value}
                  className={`ppt-segmented-btn ${fit === opt.value ? 'is-active' : ''}`}
                  onClick={() => setFit(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Opacity</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={10}
                max={100}
                value={opacity}
                aria-label="Opacity"
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
        </div>

        <footer className="ppt-crop-modal-footer">
          <button type="button" className="ppt-crop-modal-btn ppt-crop-modal-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ppt-crop-modal-btn ppt-crop-modal-btn--primary"
            onClick={() => {
              onApply?.({ fit, opacity: opacity / 100 })
              onClose?.()
            }}
          >
            <FiCheck size={15} aria-hidden />
            Apply
          </button>
        </footer>
      </div>
    </div>
  )
}
