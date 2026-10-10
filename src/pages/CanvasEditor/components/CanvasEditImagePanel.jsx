import { useState } from 'react'
import { FiChevronLeft, FiMinus, FiPlus } from 'react-icons/fi'
import {
  MdTune,
  MdLayers,
  MdAutoFixHigh,
  MdZoomOutMap,
  MdPersonOutline,
  MdBrush,
  MdMovieCreation,
  MdWallpaper,
} from 'react-icons/md'

const TOOLS = [
  { id: 'adjust', label: 'Adjust', Icon: MdTune, enabled: true },
  { id: 'magicLayers', label: 'Magic Layers', Icon: MdLayers, enabled: false },
  { id: 'magicEdit', label: 'Magic Edit', Icon: MdAutoFixHigh, enabled: false },
  { id: 'upscale', label: 'Upscale', Icon: MdZoomOutMap, enabled: false },
  { id: 'bgRemover', label: 'BG Remover', Icon: MdPersonOutline, enabled: false },
  { id: 'magicEraser', label: 'Magic Eraser', Icon: MdBrush, enabled: false },
  { id: 'imageToVideo', label: 'Image to Video', Icon: MdMovieCreation, enabled: false },
  { id: 'bgGenerator', label: 'BG Generator', Icon: MdWallpaper, enabled: false },
]

const FILTER_PRESETS = [
  { id: 'natural', label: 'Natural', value: null },
  { id: 'warm', label: 'Warm', value: 'sepia(0.28) saturate(1.35) brightness(1.04)' },
  { id: 'cool', label: 'Cool', value: 'saturate(1.15) brightness(1.02) hue-rotate(-12deg)' },
  { id: 'vivid', label: 'Vivid', value: 'saturate(1.6) contrast(1.12) brightness(1.05)' },
  { id: 'vintage', label: 'Vintage', value: 'sepia(0.4) contrast(1.15) brightness(0.95) saturate(1.2)' },
  { id: 'bw', label: 'B&W', value: 'grayscale(1) contrast(1.15) brightness(1.05)' },
  { id: 'noir', label: 'Noir', value: 'grayscale(1) contrast(1.65) brightness(0.88)' },
  { id: 'cinematic', label: 'Cinematic', value: 'contrast(1.2) saturate(1.25) hue-rotate(-6deg) brightness(0.96)' },
  { id: 'retro', label: 'Retro', value: 'sepia(0.22) contrast(0.92) brightness(1.1) saturate(0.85)' },
  { id: 'dramatic', label: 'Dramatic', value: 'contrast(1.38) brightness(0.95) saturate(1.2)' },
  { id: 'golden', label: 'Golden', value: 'sepia(0.38) saturate(1.55) brightness(1.08) hue-rotate(-4deg)' },
  { id: 'rosy', label: 'Rosy', value: 'sepia(0.18) saturate(1.3) brightness(1.05) hue-rotate(330deg)' },
  { id: 'cyber', label: 'Cyber', value: 'contrast(1.25) saturate(1.85) hue-rotate(45deg)' },
  { id: 'pastel', label: 'Pastel', value: 'saturate(0.65) brightness(1.12) contrast(0.94)' },
]

const SHADOW_PRESETS = [
  { id: 'none', label: 'None', value: null },
  { id: 'soft', label: 'Soft', value: '0 4px 14px rgba(15, 23, 42, 0.18)' },
  { id: 'medium', label: 'Medium', value: '0 10px 24px rgba(15, 23, 42, 0.28)' },
  { id: 'strong', label: 'Strong', value: '0 18px 36px rgba(15, 23, 42, 0.4)' },
]

function ShadowThumb({ src, shadow, label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`cep-thumb ${active ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="cep-thumb-frame cep-thumb-frame--shadow">
        {src ? (
          <img src={src} alt="" style={{ boxShadow: shadow || undefined }} />
        ) : (
          <span className="cep-thumb-empty" />
        )}
      </span>
      <span className="cep-thumb-label">{label}</span>
    </button>
  )
}

function ImageThumb({ src, filter, label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`cep-thumb ${active ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="cep-thumb-frame">
        {src ? (
          <img src={src} alt="" style={{ filter: filter || undefined }} />
        ) : (
          <span className="cep-thumb-empty" />
        )}
      </span>
      <span className="cep-thumb-label">{label}</span>
    </button>
  )
}

/**
 * "Edit image" left-panel tools — mirrors Canva's layout (Tools / Style Match /
 * Filters / Apps). Only Adjust and Filters are wired to real behavior (plain
 * CSS filters, applied via content.cssFilter) since this app has no AI
 * image-editing backend yet. The AI tiles (Magic Layers, Magic Edit, Upscale,
 * BG Remover, Magic Eraser, Image to Video, BG Generator) are shown for layout
 * parity but disabled — wiring them to real AI would need the existing
 * imageGenService generate/context pipeline confirmed against a real request
 * first, which hasn't been verified, so they're left as "coming soon" rather
 * than risk a silently-broken (and credit-consuming) AI call.
 */
export default function CanvasEditImagePanel({ element, disabled = false, onChangeContent }) {
  const [view, setView] = useState('home')
  const c = element?.content || {}
  const src = c.url || c.src || c.thumbnailUrl
  const adjust = c.adjust || { brightness: 100, contrast: 100, saturate: 100 }

  const patch = (updates) => onChangeContent?.({ ...c, ...updates })

  const applyAdjust = (next) => {
    const merged = { ...adjust, ...next }
    const filter = `brightness(${merged.brightness}%) contrast(${merged.contrast}%) saturate(${merged.saturate}%)`
    patch({ adjust: merged, cssFilter: filter })
  }

  const applyFilterPreset = (preset) => {
    patch({ cssFilter: preset.value, adjust: null, activeFilter: preset.id })
  }

  if (view === 'adjust') {
    return (
      <div className="cep-panel">
        <button type="button" className="cep-back" onClick={() => setView('home')}>
          <FiChevronLeft size={15} /> Adjust
        </button>

        {['brightness', 'contrast', 'saturate'].map((key) => (
          <div className="cep-slider-row" key={key}>
            <div className="cep-slider-head">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span>{adjust[key]}%</span>
            </div>
            <div className="cep-slider-control">
              <button type="button" disabled={disabled} onClick={() => applyAdjust({ [key]: Math.max(0, adjust[key] - 5) })}>
                <FiMinus size={12} />
              </button>
              <input
                type="range"
                min={0}
                max={200}
                disabled={disabled}
                value={adjust[key]}
                onChange={(e) => applyAdjust({ [key]: Number(e.target.value) })}
              />
              <button type="button" disabled={disabled} onClick={() => applyAdjust({ [key]: Math.min(200, adjust[key] + 5) })}>
                <FiPlus size={12} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="cep-reset-btn"
          disabled={disabled}
          onClick={() => patch({ adjust: null, cssFilter: null, activeFilter: null })}
        >
          Reset
        </button>
      </div>
    )
  }

  return (
    <div className="cep-panel">
      <div className="cep-section">
        <div className="cep-section-head">
          <span>Tools</span>
        </div>
        <div className="cep-tools-grid">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className="cep-tool-tile"
              disabled={disabled || !tool.enabled}
              title={tool.enabled ? tool.label : `${tool.label} — coming soon`}
              onClick={() => tool.enabled && setView(tool.id)}
            >
              <span className="cep-tool-icon">
                <tool.Icon size={20} />
              </span>
              <span className="cep-tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cep-section">
        <div className="cep-section-head">
          <span>Filters</span>
        </div>
        <div className="cep-thumb-row">
          {FILTER_PRESETS.map((preset) => (
            <ImageThumb
              key={preset.id}
              src={src}
              filter={preset.value}
              label={preset.label}
              active={(c.activeFilter || 'natural') === preset.id}
              disabled={disabled}
              onClick={() => applyFilterPreset(preset)}
            />
          ))}
        </div>
      </div>

      <div className="cep-section">
        <div className="cep-section-head">
          <span>Shadow</span>
        </div>
        <div className="cep-thumb-row">
          {SHADOW_PRESETS.map((preset) => (
            <ShadowThumb
              key={preset.id}
              src={src}
              shadow={preset.value}
              label={preset.label}
              active={(c.boxShadow || null) === preset.value}
              disabled={disabled}
              onClick={() => patch({ boxShadow: preset.value, shadow: preset.value })}
            />
          ))}
        </div>
      </div>

      <div className="cep-section">
        <div className="cep-section-head">
          <span>Apps</span>
        </div>
        <p className="cep-coming-soon">Coming soon.</p>
      </div>
    </div>
  )
}
