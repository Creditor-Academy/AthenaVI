import { useMemo, useState } from 'react'
import { FiCheck, FiArrowRight } from 'react-icons/fi'
import {
  CANVAS_SIZE_PRESETS,
  DEFAULT_CANVAS_SIZE,
  matchCanvasSizePreset,
  normalizeCanvasSize,
} from '../../constants/canvasSizePresets'
import './CanvasEditor.css'

export default function CanvasSizeModal({
  onCancel,
  onCreate,
  currentSize = null,
  confirmLabel = 'Create Canvas',
  title = 'Choose Canvas Dimensions',
  subtitle = 'Select a layout format or enter custom design specs. You can change this later in the editor.',
  eyebrow = 'Canvas Studio',
}) {
  const initial = normalizeCanvasSize(currentSize || DEFAULT_CANVAS_SIZE)
  const matched = matchCanvasSizePreset(initial)
  const [selectedPreset, setSelectedPreset] = useState(matched?.id || null)
  const [unit, setUnit] = useState('px')
  const [customSize, setCustomSize] = useState(initial)
  const [activeGroup, setActiveGroup] = useState('All')

  const selected = useMemo(
    () => CANVAS_SIZE_PRESETS.find((preset) => preset.id === selectedPreset) || null,
    [selectedPreset]
  )

  const updateCustom = (key, value) => {
    const numeric = Math.max(1, Number(value) || 1)
    setCustomSize((current) => ({
      ...current,
      [key]: unit === 'in' ? Math.round(numeric * 96) : numeric,
    }))
    setSelectedPreset(null)
  }

  const groups = ['All', 'Social', 'Print', 'Global']
  const filteredPresets =
    activeGroup === 'All'
      ? CANVAS_SIZE_PRESETS
      : CANVAS_SIZE_PRESETS.filter((preset) => preset.group === activeGroup)

  const handleCreate = () => {
    onCreate(normalizeCanvasSize(selected || customSize))
  }

  return (
    <div className="canvas-size-modal-backdrop" onClick={onCancel}>
      <section
        className="canvas-size-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-size-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="canvas-size-modal-heading">
          <div>
            <span className="canvas-size-modal-eyebrow">{eyebrow}</span>
            <h2 id="canvas-size-title">{title}</h2>
            <p className="canvas-size-modal-subtitle">{subtitle}</p>
          </div>
          <button type="button" className="canvas-size-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="canvas-size-tabs">
          {groups.map((group) => (
            <button
              type="button"
              key={group}
              className={`canvas-size-tab ${activeGroup === group ? 'is-active' : ''}`}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="canvas-size-presets">
          <div className="canvas-size-grid">
            {filteredPresets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`canvas-size-preset ${selectedPreset === preset.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedPreset(preset.id)
                  setCustomSize({ width: preset.width, height: preset.height })
                }}
              >
                <div className="canvas-size-preview-container">
                  <div className="canvas-size-preview-box" style={{ aspectRatio: preset.aspect }} />
                </div>
                <div className="canvas-size-preset-meta">
                  <strong>{preset.label}</strong>
                  <span className="canvas-size-preset-badge">{preset.desc}</span>
                </div>
                {selectedPreset === preset.id && (
                  <div className="canvas-size-check-badge">
                    <FiCheck />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="canvas-size-custom">
          <div className="canvas-size-custom-head">
            <strong>Custom Dimensions</strong>
            <span>Specify custom pixels or inches</span>
          </div>
          <div className="canvas-size-custom-fields">
            <label>
              Width
              <input
                type="number"
                min="1"
                value={unit === 'in' ? (customSize.width / 96).toFixed(2) : customSize.width}
                onChange={(e) => updateCustom('width', e.target.value)}
              />
            </label>
            <span className="canvas-size-times">×</span>
            <label>
              Height
              <input
                type="number"
                min="1"
                value={unit === 'in' ? (customSize.height / 96).toFixed(2) : customSize.height}
                onChange={(e) => updateCustom('height', e.target.value)}
              />
            </label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Custom size unit">
              <option value="px">px</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

        <div className="canvas-size-modal-actions">
          <button type="button" className="canvas-size-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="canvas-size-create" onClick={handleCreate}>
            {confirmLabel} <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}
