import { useState } from 'react'
import { FiCopy, FiTrash2, FiLock, FiUnlock, FiEdit2, FiMinus, FiPlus, FiSquare } from 'react-icons/fi'
import { MdFlip } from 'react-icons/md'
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react'
import ElementToolbar from '../../Slides/AIPptComponents/insert/ElementToolbar'
import ElementTransformControls from '../../Slides/AIPptComponents/ElementTransformControls'
import ColorFillPicker from '../../Slides/AIPptComponents/insert/ColorFillPicker'
import { normalizeFillValue } from '../../../utils/pptTextContent'

function fillSolidColor(fill, fallback) {
  const normalized = normalizeFillValue(fill, fallback)
  return normalized?.type === 'gradient' ? normalized.stops?.[0]?.color || fallback : normalized?.color || fallback
}

const SHADOW_PRESETS = [
  { id: 'none', label: 'None', value: null },
  { id: 'soft', label: 'Soft', value: '0 4px 14px rgba(15, 23, 42, 0.18)' },
  { id: 'medium', label: 'Medium', value: '0 10px 24px rgba(15, 23, 42, 0.28)' },
  { id: 'strong', label: 'Strong', value: '0 18px 36px rgba(15, 23, 42, 0.4)' },
]

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

export default function CanvasContextBar({
  selectedElement,
  multiSelectIds = [],
  usedFontFamilies = [],
  onUpdateContent,
  onUpdatePlacement,
  onToggleLock,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  canGroup,
  canUngroup,
  onAlignSelection,
  onReplaceImage,
  onCropImage,
  onEditImage,
}) {
  const [showAlignPopup, setShowAlignPopup] = useState(false)
  const [showEffectsPopup, setShowEffectsPopup] = useState(false)

  if (!selectedElement && multiSelectIds.length <= 1) return null

  const isMulti = multiSelectIds.length > 1
  const locked = isLocked(selectedElement)
  const type = selectedElement?.type || 'text'
  const c = selectedElement?.content || {}
  const p = selectedElement?.placement || {}

  return (
    <div className="canva-context-bar">
      {isMulti ? (
        <div className="canva-context-bar-group">
          <span className="canva-context-bar-label">{multiSelectIds.length} elements selected</span>
          {canGroup && (
            <button type="button" className="canva-context-bar-pill-btn" onClick={onGroup}>
              Group
            </button>
          )}
          {canUngroup && (
            <button type="button" className="canva-context-bar-pill-btn" onClick={onUngroup}>
              Ungroup
            </button>
          )}

          <div className="canva-context-bar-divider" />

          <div className="canva-context-bar-popover-wrapper">
            <button
              type="button"
              className="canva-context-bar-btn"
              onClick={() => setShowAlignPopup(!showAlignPopup)}
              title="Align elements"
            >
              <AlignHorizontalJustifyCenter size={15} />
              <span>Align</span>
            </button>
            {showAlignPopup && (
              <div className="canva-context-bar-dropdown">
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
                    onClick={() => {
                      onAlignSelection(id)
                      setShowAlignPopup(false)
                    }}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="canva-context-bar-divider" />

          <button
            type="button"
            className="canva-context-bar-icon-btn"
            onClick={onDuplicate}
            title="Duplicate (Ctrl+D)"
          >
            <FiCopy />
          </button>
          <button
            type="button"
            className="canva-context-bar-icon-btn is-danger"
            onClick={onDelete}
            title="Delete (Delete)"
          >
            <FiTrash2 />
          </button>
        </div>
      ) : (
        <div className="canva-context-bar-group">
          {(type === 'text' || type === 'textbox') && (
            <ElementToolbar
              element={selectedElement}
              palette={DEFAULT_PALETTE}
              usedFontFamilies={usedFontFamilies}
              disabled={locked}
              variant="floating"
              onChange={(content) => onUpdateContent(selectedElement.id, content)}
            />
          )}

          {type === 'shape' && (
            <div className="canva-context-bar-fill">
              <ColorFillPicker
                title="Fill"
                compact
                value={normalizeFillValue(c.fill, '#3B82F6')}
                palette={DEFAULT_PALETTE}
                disabled={locked}
                fallbackHex="#3B82F6"
                onChange={(fill) => onUpdateContent(selectedElement.id, { fill })}
              />
            </div>
          )}

          {(type === 'image' || type === 'icon') ? (
            <>
              <button
                type="button"
                className="canva-context-bar-btn"
                disabled={locked}
                onClick={onEditImage}
              >
                <FiEdit2 size={13} style={{ marginRight: 2 }} />
                Edit
              </button>
              <button
                type="button"
                className="canva-context-bar-btn"
                disabled={locked}
                onClick={onReplaceImage}
              >
                Replace
              </button>
              <button
                type="button"
                className="canva-context-bar-btn"
                disabled={locked}
                onClick={onCropImage}
              >
                Crop
              </button>

              <div className="canva-context-bar-divider" />

              <button
                type="button"
                className={`canva-context-bar-icon-btn ${c.flipHorizontal === true || c.scaleX === -1 ? 'is-active' : ''}`}
                disabled={locked}
                title="Flip horizontal"
                onClick={() => {
                  const next = !(c.flipHorizontal === true || c.scaleX === -1)
                  onUpdateContent(selectedElement.id, { flipHorizontal: next, scaleX: next ? -1 : 1 })
                }}
              >
                <MdFlip size={14} />
              </button>
              <button
                type="button"
                className={`canva-context-bar-icon-btn ${c.flipVertical === true || c.scaleY === -1 ? 'is-active' : ''}`}
                disabled={locked}
                title="Flip vertical"
                onClick={() => {
                  const next = !(c.flipVertical === true || c.scaleY === -1)
                  onUpdateContent(selectedElement.id, { flipVertical: next, scaleY: next ? -1 : 1 })
                }}
              >
                <span style={{ display: 'inline-flex', transform: 'rotate(90deg)' }}>
                  <MdFlip size={14} />
                </span>
              </button>

              <div className="canva-context-bar-divider" />

              <ColorFillPicker
                title="Border color"
                compact
                value={normalizeFillValue(c.stroke, '#000000')}
                palette={DEFAULT_PALETTE}
                disabled={locked}
                fallbackHex="#000000"
                onChange={(fill) => onUpdateContent(selectedElement.id, { stroke: fill })}
              />
              <div className="canva-context-bar-stepper" title="Border width">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    onUpdateContent(selectedElement.id, { strokeWidth: Math.max(0, (Number(c.strokeWidth) || 0) - 1) })
                  }
                >
                  <FiMinus size={11} />
                </button>
                <input
                  type="number"
                  min={0}
                  max={40}
                  disabled={locked}
                  value={c.strokeWidth ?? 0}
                  onChange={(e) =>
                    onUpdateContent(selectedElement.id, { strokeWidth: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
                <button
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    onUpdateContent(selectedElement.id, { strokeWidth: Math.min(40, (Number(c.strokeWidth) || 0) + 1) })
                  }
                >
                  <FiPlus size={11} />
                </button>
              </div>

              <div className="canva-context-bar-divider" />

              <div className="canva-context-bar-stepper" title="Corner radius">
                <FiSquare size={11} style={{ opacity: 0.6, marginLeft: 6 }} />
                <input
                  type="number"
                  min={0}
                  max={999}
                  disabled={locked}
                  value={c.borderRadius ?? 0}
                  onChange={(e) =>
                    onUpdateContent(selectedElement.id, { borderRadius: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </div>

              <div className="canva-context-bar-divider" />

              <div className="canva-context-bar-opacity" title="Opacity">
                <input
                  type="range"
                  min={0}
                  max={100}
                  disabled={locked}
                  value={p.opacity != null ? Math.round(p.opacity * 100) : 100}
                  onChange={(e) => onUpdatePlacement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                />
                <span>{p.opacity != null ? Math.round(p.opacity * 100) : 100}%</span>
              </div>

              <div className="canva-context-bar-divider" />

              <div className="canva-context-bar-popover-wrapper">
                <button
                  type="button"
                  className="canva-context-bar-btn"
                  disabled={locked}
                  onClick={() => setShowEffectsPopup(!showEffectsPopup)}
                >
                  Effects
                </button>
                {showEffectsPopup && (
                  <div className="canva-context-bar-dropdown">
                    {SHADOW_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onUpdateContent(selectedElement.id, { boxShadow: preset.value, shadow: preset.value })
                          setShowEffectsPopup(false)
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <ElementTransformControls
              placement={p}
              content={c}
              showFlip={false}
              disabled={locked}
              onChangePlacement={(placement) => onUpdatePlacement(selectedElement.id, placement)}
              onChangeContent={(content) => onUpdateContent(selectedElement.id, content)}
            />
          )}

          <div className="canva-context-bar-divider" />

          <button
            type="button"
            className={`canva-context-bar-icon-btn ${locked ? 'is-active' : ''}`}
            onClick={() => onToggleLock(selectedElement.id)}
            title={locked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
          >
            {locked ? <FiLock /> : <FiUnlock />}
          </button>
          <button
            type="button"
            className="canva-context-bar-icon-btn"
            onClick={onDuplicate}
            title="Duplicate (Ctrl+D)"
          >
            <FiCopy />
          </button>
          <button
            type="button"
            className="canva-context-bar-icon-btn is-danger"
            onClick={onDelete}
            title="Delete (Delete)"
          >
            <FiTrash2 />
          </button>
        </div>
      )}
    </div>
  )
}
