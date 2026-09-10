import { useState } from 'react'
import { FiCheck, FiArrowRight } from 'react-icons/fi'

const SIZE_PRESETS = [
  { id: 'instagram-post', label: 'Instagram Post', group: 'Social', width: 1080, height: 1080, aspect: '1 / 1', desc: '1080 × 1080 px' },
  { id: 'instagram-reel', label: 'Story / Reel', group: 'Social', width: 1080, height: 1920, aspect: '9 / 16', desc: '1080 × 1920 px' },
  { id: 'youtube-banner', label: 'YouTube Banner', group: 'Social', width: 2560, height: 1440, aspect: '16 / 9', desc: '2560 × 1440 px' },
  { id: 'linkedin-post', label: 'LinkedIn Post', group: 'Social', width: 1200, height: 627, aspect: '1200 / 627', desc: '1200 × 627 px' },
  { id: 'flyer', label: 'Flyer', group: 'Print', width: 1275, height: 1650, aspect: '1275 / 1650', desc: '1275 × 1650 px' },
  { id: 'a4', label: 'A4 Document', group: 'Print', width: 794, height: 1123, aspect: '794 / 1123', desc: '794 × 1123 px' },
  { id: 'presentation', label: 'Presentation 16:9', group: 'Global', width: 1920, height: 1080, aspect: '16 / 9', desc: '1920 × 1080 px' },
  { id: 'desktop', label: 'Desktop Canvas', group: 'Global', width: 1440, height: 900, aspect: '16 / 10', desc: '1440 × 900 px' },
  { id: 'square', label: 'Square Canvas', group: 'Global', width: 1200, height: 1200, aspect: '1 / 1', desc: '1200 × 1200 px' },
]

const DEFAULT_SIZE = { width: 1200, height: 800 }

export default function CanvasSizeModal({ onCancel, onCreate }) {
  const [selectedPreset, setSelectedPreset] = useState(SIZE_PRESETS[0].id)
  const [unit, setUnit] = useState('px')
  const [customSize, setCustomSize] = useState(DEFAULT_SIZE)
  const [activeGroup, setActiveGroup] = useState('All')

  const selected = SIZE_PRESETS.find((preset) => preset.id === selectedPreset)

  const updateCustom = (key, value) => {
    const numeric = Math.max(1, Number(value) || 1)
    setCustomSize((current) => ({
      ...current,
      [key]: unit === 'in' ? Math.round(numeric * 96) : numeric,
    }))
    setSelectedPreset(null)
  }

  const groups = ['All', 'Social', 'Print', 'Global']
  const filteredPresets = activeGroup === 'All' ? SIZE_PRESETS : SIZE_PRESETS.filter((p) => p.group === activeGroup)

  return (
    <div className="canvas-size-modal-backdrop" onClick={onCancel}>
      <section className="canvas-size-modal" role="dialog" aria-modal="true" aria-labelledby="canvas-size-title" onClick={(e) => e.stopPropagation()}>
        <div className="canvas-size-modal-heading">
          <div>
            <span className="canvas-size-modal-eyebrow">Canvas Studio</span>
            <h2 id="canvas-size-title">Choose Canvas Dimensions</h2>
            <p className="canvas-size-modal-subtitle">Select a popular layout format or enter your custom design specs.</p>
          </div>
          <button type="button" className="canvas-size-close" onClick={onCancel} aria-label="Close">×</button>
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
                onClick={() => setSelectedPreset(preset.id)}
              >
                <div className="canvas-size-preview-container">
                  <div
                    className="canvas-size-preview-box"
                    style={{ aspectRatio: preset.aspect }}
                  />
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
          <button type="button" className="canvas-size-cancel" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="canvas-size-create"
            onClick={() => onCreate(selected || customSize)}
          >
            Create Canvas <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}
