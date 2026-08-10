import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import './pptEditorExtras.css'

export default function ImageCropModal({ imageUrl, onApply, onClose }) {
  const [fit, setFit] = useState('cover')
  const [opacity, setOpacity] = useState(100)

  if (!imageUrl) return null

  return (
    <div className="ppt-crop-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="ppt-crop-modal" role="dialog" aria-label="Crop image">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong>Image settings</strong>
          <button type="button" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>
        <div className="ppt-crop-preview">
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              objectFit: fit,
              opacity: opacity / 100,
              width: '100%',
            }}
          />
        </div>
        <div className="ppt-element-props-grid" style={{ marginTop: 16 }}>
          <div className="ppt-element-props-row">
            <span>Fit</span>
            <select value={fit} onChange={(e) => setFit(e.target.value)}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </div>
          <div className="ppt-element-props-row">
            <span>Opacity</span>
            <input
              type="range"
              min={10}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
            <span>{opacity}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply?.({ fit, opacity: opacity / 100 })
              onClose?.()
            }}
          >
            <FiCheck size={14} /> Apply
          </button>
        </div>
      </div>
    </div>
  )
}
