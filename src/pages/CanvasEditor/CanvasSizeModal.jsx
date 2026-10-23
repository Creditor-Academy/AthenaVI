import { useMemo, useState } from 'react'
import { FiCheck, FiArrowRight, FiX, FiRepeat } from 'react-icons/fi'
import {
  CANVAS_SIZE_PRESETS,
  DEFAULT_CANVAS_SIZE,
  matchCanvasSizePreset,
  normalizeCanvasSize,
} from '../../constants/canvasSizePresets'

import instagramPostPreview from '../../assets/ai-img-gen/Instagram_post.png'
import instagramStoryPreview from '../../assets/ai-img-gen/Instagram_Story.png'
import youtubeThumbnailPreview from '../../assets/ai-img-gen/Youtube_thumbnail.png'
import linkedinPostPreview from '../../assets/ai-img-gen/Linkedin_Post.png'
import facebookPostPreview from '../../assets/ai-img-gen/facebook_post.png'
import twitterPostPreview from '../../assets/ai-img-gen/X_Twitter_Post.png'
import formatPortraitPreview from '../../assets/ai-img-gen/format-portrait.jpg'
import infoBoardPreview from '../../assets/ai-img-gen/info-board.jpg'
import formatLandscapePreview from '../../assets/ai-img-gen/format-landscape.jpg'
import canvasAtmospherePreview from '../../assets/ai-img-gen/canvas-atmosphere.png'
import formatSquarePreview from '../../assets/ai-img-gen/format-square.jpg'
import instaLandscapePreview from '../../assets/ai-img-gen/Insta_landscape.png'

import './CanvasEditor.css'

const PRESET_IMAGE_MAP = {
  'instagram-post': instagramPostPreview,
  'instagram-reel': instagramStoryPreview,
  'youtube-banner': youtubeThumbnailPreview,
  'linkedin-post': linkedinPostPreview,
  'facebook-post': facebookPostPreview,
  'twitter-post': twitterPostPreview,
  'flyer': formatPortraitPreview,
  'a4': infoBoardPreview,
  'presentation': formatLandscapePreview,
  'desktop': canvasAtmospherePreview,
  'square': formatSquarePreview,
  'instagram-landscape': instaLandscapePreview,
}

function resolvePresetImage(preset) {
  if (!preset) return formatSquarePreview
  if (PRESET_IMAGE_MAP[preset.id]) return PRESET_IMAGE_MAP[preset.id]
  const ratio = (preset.width || 1) / Math.max(preset.height || 1, 1)
  if (ratio > 1.2) return formatLandscapePreview
  if (ratio < 0.8) return formatPortraitPreview
  return formatSquarePreview
}

export default function CanvasSizeModal({
  onCancel,
  onCreate,
  currentSize = null,
  confirmLabel = 'Create Canvas',
  title = 'Choose canvas size',
  subtitle = 'Pick a format or enter custom dimensions. You can change this later in the editor.',
  eyebrow = 'Canvas Editor',
}) {
  const initial = normalizeCanvasSize(currentSize || DEFAULT_CANVAS_SIZE)
  const matched = matchCanvasSizePreset(initial)
  const [selectedPreset, setSelectedPreset] = useState(matched?.id || CANVAS_SIZE_PRESETS[0]?.id || null)
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

  const handleSwapDimensions = () => {
    setCustomSize((prev) => ({
      width: prev.height,
      height: prev.width,
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

  const activeWidth = selected ? selected.width : customSize.width
  const activeHeight = selected ? selected.height : customSize.height

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
            <FiX size={18} />
          </button>
        </div>

        <div className="canvas-size-tabs">
          {groups.map((group) => {
            const count =
              group === 'All'
                ? CANVAS_SIZE_PRESETS.length
                : CANVAS_SIZE_PRESETS.filter((p) => p.group === group).length
            return (
              <button
                type="button"
                key={group}
                className={`canvas-size-tab ${activeGroup === group ? 'is-active' : ''}`}
                onClick={() => setActiveGroup(group)}
              >
                <span>{group}</span>
                <span className="canvas-size-tab-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="canvas-size-presets">
          <div className="canvas-size-grid">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset === preset.id
              const previewImg = resolvePresetImage(preset)
              return (
                <button
                  type="button"
                  key={preset.id}
                  className={`canvas-size-preset ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedPreset(preset.id)
                    setCustomSize({ width: preset.width, height: preset.height })
                  }}
                >
                  <div className="canvas-size-thumb-wrapper">
                    <div
                      className="canvas-size-thumb-box"
                      style={{ aspectRatio: preset.aspect || '1 / 1' }}
                    >
                      <img
                        src={previewImg}
                        alt={preset.label}
                        className="canvas-size-thumb-img"
                        loading="lazy"
                      />
                      <div className="canvas-size-thumb-overlay" />
                    </div>
                    {preset.tag && (
                      <span className="canvas-size-thumb-tag">{preset.tag}</span>
                    )}
                  </div>

                  <div className="canvas-size-preset-meta">
                    <strong className="canvas-size-preset-name">{preset.label}</strong>
                    <span className="canvas-size-preset-badge">{preset.desc}</span>
                  </div>

                  {isSelected && (
                    <div className="canvas-size-check-badge">
                      <FiCheck size={13} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="canvas-size-custom">
          <div className="canvas-size-custom-head">
            <div className="canvas-size-custom-title-col">
              <strong>Custom Dimensions</strong>
              <span>Specify exact pixel dimensions or print inches</span>
            </div>
            <div className="canvas-size-custom-summary-pill">
              {activeWidth} × {activeHeight} px
            </div>
          </div>

          <div className="canvas-size-custom-fields">
            <label className="canvas-size-field-group">
              <span className="canvas-size-field-label">WIDTH</span>
              <div className="canvas-size-input-wrapper">
                <input
                  type="number"
                  min="1"
                  max="8192"
                  value={unit === 'in' ? (customSize.width / 96).toFixed(2) : customSize.width}
                  onChange={(e) => updateCustom('width', e.target.value)}
                />
              </div>
            </label>

            <button
              type="button"
              className="canvas-size-swap-btn"
              onClick={handleSwapDimensions}
              title="Swap Width and Height"
              aria-label="Swap dimensions"
            >
              <FiRepeat size={14} />
            </button>

            <label className="canvas-size-field-group">
              <span className="canvas-size-field-label">HEIGHT</span>
              <div className="canvas-size-input-wrapper">
                <input
                  type="number"
                  min="1"
                  max="8192"
                  value={unit === 'in' ? (customSize.height / 96).toFixed(2) : customSize.height}
                  onChange={(e) => updateCustom('height', e.target.value)}
                />
              </div>
            </label>

            <div className="canvas-size-unit-selector">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                aria-label="Custom size unit"
              >
                <option value="px">px</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
        </div>

        <div className="canvas-size-modal-actions">
          <button type="button" className="canvas-size-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="canvas-size-create" onClick={handleCreate}>
            <span>{confirmLabel}</span>
            <FiArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}
