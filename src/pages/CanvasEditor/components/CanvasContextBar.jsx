import { useState } from 'react'
import { FiCopy, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi'
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
}) {
  const [showAlignPopup, setShowAlignPopup] = useState(false)

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

          {(type === 'image' || type === 'icon') && (
            <>
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
            </>
          )}

          <ElementTransformControls
            placement={p}
            content={c}
            showFlip={type === 'image' || type === 'icon'}
            disabled={locked}
            onChangePlacement={(placement) => onUpdatePlacement(selectedElement.id, placement)}
            onChangeContent={(content) => onUpdateContent(selectedElement.id, content)}
          />

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
