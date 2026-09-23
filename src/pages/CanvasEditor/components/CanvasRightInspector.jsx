import { useState } from 'react'
import { FiLock, FiUnlock, FiTrash2 } from 'react-icons/fi'
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react'
import DesignContextPanel from '../../Slides/AIPptComponents/insert/DesignContextPanel'
import ColorFillPicker from '../../Slides/AIPptComponents/insert/ColorFillPicker'
import { CANVAS_SIZE_PRESETS } from '../../../constants/canvasSizePresets'

const DEFAULT_PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#172033',
  title: '#172033',
  accent: '#2563EB',
}

function isLocked(el) {
  return Boolean(el?.locked || el?.placement?.locked)
}

function layerLabel(el) {
  const type = el?.type || 'element'
  const name = el?.content?.text || el?.content?.alt || el?.content?.label
  if (typeof name === 'string' && name.trim()) {
    return name.trim().slice(0, 28)
  }
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const SIZE_PRESETS_SHORT = (CANVAS_SIZE_PRESETS || []).slice(0, 8)

export default function CanvasRightInspector({
  selectedElement,
  activeCanvas,
  elements = [],
  usedFontFamilies = [],
  onUpdatePlacement,
  onUpdateContent,
  onUpdateBackground,
  onApplyPresetSize,
  onToggleLock,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onAlignSelection,
  onSelectElement,
  onDeleteElement,
  onReplaceImage,
  onCropImage,
  onClearDeviceFrameScreen,
  onToggleImageAsBackground,
}) {
  const [activeTab, setActiveTab] = useState('style')
  const p = selectedElement?.placement || {}
  const locked = isLocked(selectedElement)
  const type = selectedElement?.type || 'text'
  const designFocus =
    type === 'textbox' ? 'text' : type === 'icon' ? 'image' : type

  const patchPlacement = (patch) => {
    if (!selectedElement) return
    onUpdatePlacement(selectedElement.id, patch)
  }

  const layers = [...(elements || [])].sort((a, b) => (b.layer || 0) - (a.layer || 0))

  return (
    <aside className="canva-inspector">
      <header className="canva-inspector-header">
        <div className="canva-inspector-header-top">
          <h3>
            {selectedElement
              ? `${type.charAt(0).toUpperCase() + type.slice(1)} Settings`
              : 'Canvas Settings'}
          </h3>
          {selectedElement && (
            <div className="canva-inspector-header-actions">
              <button
                type="button"
                className={`canva-inspector-tool-btn ${locked ? 'is-locked' : ''}`}
                onClick={() => onToggleLock(selectedElement.id)}
                title={locked ? 'Unlock element' : 'Lock element'}
              >
                {locked ? <FiLock /> : <FiUnlock />}
              </button>
            </div>
          )}
        </div>

        <div className="canva-inspector-nav-tabs">
          <button
            type="button"
            className={`canva-inspector-nav-tab ${activeTab === 'style' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            {selectedElement ? 'Style' : 'Canvas'}
          </button>
          {selectedElement && (
            <button
              type="button"
              className={`canva-inspector-nav-tab ${activeTab === 'position' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('position')}
            >
              Position
            </button>
          )}
          <button
            type="button"
            className={`canva-inspector-nav-tab ${activeTab === 'layers' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('layers')}
          >
            Layers
          </button>
        </div>
      </header>

      <div className="canva-inspector-body">
        {activeTab === 'layers' ? (
          <div className="canva-inspector-stack">
            <div className="canva-inspector-group">
              <label className="canva-inspector-group-title">Page layers</label>
              <div className="canva-layers-list">
                {layers.length === 0 ? (
                  <p className="canva-inspector-empty">No layers yet — insert from the left panel.</p>
                ) : (
                  layers.map((el, i) => (
                    <div
                      key={el.id}
                      className={`canva-layer-row ${selectedElement?.id === el.id ? 'is-selected' : ''}`}
                      onClick={() => onSelectElement?.(el.id)}
                    >
                      <span className="canva-layer-num">{layers.length - i}</span>
                      <span className="canva-layer-type">{layerLabel(el)}</span>
                      {isLocked(el) ? <FiLock className="canva-layer-lock" /> : null}
                      <button
                        type="button"
                        className="canva-layer-delete"
                        title="Delete layer"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteElement?.(el.id)
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : selectedElement ? (
          <div className="canva-inspector-stack">
            {activeTab === 'style' ? (
              <div className="canva-inspector-design">
                <DesignContextPanel
                  focus={designFocus}
                  element={selectedElement}
                  palette={DEFAULT_PALETTE}
                  usedFontFamilies={usedFontFamilies}
                  disabled={locked}
                  onChangeElementContent={(content) =>
                    onUpdateContent(selectedElement.id, content)
                  }
                  onChangeElementPlacement={(placement) =>
                    onUpdatePlacement(selectedElement.id, placement)
                  }
                  onToggleElementLock={() => onToggleLock(selectedElement.id)}
                  onReplaceImage={onReplaceImage}
                  onCropImage={onCropImage}
                  onClearDeviceFrameScreen={onClearDeviceFrameScreen}
                  onToggleImageAsBackground={onToggleImageAsBackground}
                />
              </div>
            ) : (
              <>
                <div className="canva-inspector-group">
                  <label className="canva-inspector-group-title">Dimensions</label>
                  <div className="canva-inspector-grid-2">
                    <div className="canva-inspector-num-field">
                      <span>Width</span>
                      <input
                        type="number"
                        value={Math.round(p.width || 100)}
                        disabled={locked}
                        onChange={(e) =>
                          patchPlacement({ width: Math.max(10, Number(e.target.value)) })
                        }
                      />
                    </div>
                    <div className="canva-inspector-num-field">
                      <span>Height</span>
                      <input
                        type="number"
                        value={Math.round(p.height || 40)}
                        disabled={locked}
                        onChange={(e) =>
                          patchPlacement({ height: Math.max(10, Number(e.target.value)) })
                        }
                      />
                    </div>
                  </div>
                  <div className="canva-inspector-grid-2" style={{ marginTop: 8 }}>
                    <div className="canva-inspector-num-field">
                      <span>X</span>
                      <input
                        type="number"
                        value={Math.round(p.x || 0)}
                        disabled={locked}
                        onChange={(e) => patchPlacement({ x: Number(e.target.value) })}
                      />
                    </div>
                    <div className="canva-inspector-num-field">
                      <span>Y</span>
                      <input
                        type="number"
                        value={Math.round(p.y || 0)}
                        disabled={locked}
                        onChange={(e) => patchPlacement({ y: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="canva-inspector-group">
                  <label className="canva-inspector-group-title">Align to page</label>
                  <div className="canva-inspector-align-grid">
                    {[
                      ['left', AlignHorizontalJustifyStart, 'Left'],
                      ['center', AlignHorizontalJustifyCenter, 'Center'],
                      ['right', AlignHorizontalJustifyEnd, 'Right'],
                      ['top', AlignVerticalJustifyStart, 'Top'],
                      ['middle', AlignVerticalJustifyCenter, 'Middle'],
                      ['bottom', AlignVerticalJustifyEnd, 'Bottom'],
                    ].map(([id, Icon, label]) => (
                      <button
                        type="button"
                        key={id}
                        className="canva-inspector-align-btn"
                        disabled={locked}
                        onClick={() => onAlignSelection?.(id)}
                        title={`Align ${label}`}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="canva-inspector-group">
                  <label className="canva-inspector-group-title">Layer order</label>
                  <div className="canva-inspector-layers-stack">
                    <button
                      type="button"
                      className="canva-inspector-layer-btn"
                      onClick={() => onBringForward?.([selectedElement.id])}
                    >
                      Bring Forward
                    </button>
                    <button
                      type="button"
                      className="canva-inspector-layer-btn"
                      onClick={() => onSendBackward?.([selectedElement.id])}
                    >
                      Send Backward
                    </button>
                    <button
                      type="button"
                      className="canva-inspector-layer-btn"
                      onClick={() => onBringToFront?.([selectedElement.id])}
                    >
                      Bring to Front
                    </button>
                    <button
                      type="button"
                      className="canva-inspector-layer-btn"
                      onClick={() => onSendToBack?.([selectedElement.id])}
                    >
                      Send to Back
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="canva-inspector-stack">
            <div className="canva-inspector-group">
              <label className="canva-inspector-group-title">Canvas background</label>
              <ColorFillPicker
                value={
                  activeCanvas?.background && typeof activeCanvas.background === 'object'
                    ? activeCanvas.background
                    : { type: 'solid', color: activeCanvas?.background || '#FFFFFF' }
                }
                palette={DEFAULT_PALETTE}
                onChange={(fill) => onUpdateBackground(fill)}
              />
            </div>

            <div className="canva-inspector-group">
              <label className="canva-inspector-group-title">Quick dimensions</label>
              <div className="canva-inspector-presets-grid">
                {SIZE_PRESETS_SHORT.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    className="canva-inspector-preset-card"
                    onClick={() => onApplyPresetSize(preset)}
                  >
                    <strong>{preset.label}</strong>
                    <small>
                      {preset.width} × {preset.height}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
