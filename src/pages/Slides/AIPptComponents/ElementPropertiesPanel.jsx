import { FiLock, FiUnlock } from 'react-icons/fi'
import { measureTextContentSize } from '../../../utils/canvasTransformUtils'
import {
  applyElementTextFill,
  contentFillValue,
  contentPlainText,
  contentWithSyncedText,
  normalizeFillValue,
} from '../../../utils/pptTextContent'
import ColorFillPicker from './insert/ColorFillPicker'
import './pptEditorExtras.css'

const TEXT_TYPES = new Set(['text', 'textbox'])

function fitPlacementHeightToDom(element) {
  const frame = document.querySelector(`[data-element-id="${element.id}"]`)
  if (!frame) return null
  const textEl =
    frame.querySelector('.ppt-text-display, .ppt-text-editable') || frame
  const measured = measureTextContentSize(textEl, { paddingX: 0, paddingY: 4 })
  if (!measured) return null
  const framePx = frame.getBoundingClientRect().height || 1
  const current = Number(element.placement?.height) || 40
  return Math.max(24, Math.round((measured.height / framePx) * current))
}

/**
 * Selected-element property controls (opacity, borders, corners, colors).
 */
export default function ElementPropertiesPanel({
  element,
  palette,
  onChangeContent,
  onChangePlacement,
  onToggleLock,
  onReplaceImage,
  onCropImage,
  disabled = false,
}) {
  if (!element) {
    return <p className="ppt-slide-panel-hint">Select an element to edit properties.</p>
  }

  const p = element.placement || {}
  const c = element.content || {}
  const opacity = p.opacity != null ? Math.round(p.opacity * 100) : 100
  const isText = TEXT_TYPES.has(element.type)

  const patchContent = (updates) => onChangeContent?.({ ...c, ...updates })
  const patchPlacement = (updates) =>
    onChangePlacement?.({ ...p, ...updates })

  return (
    <div className="ppt-element-props-grid">
      <div className="ppt-element-props-row">
        <span>Type</span>
        <strong>{element.type}</strong>
      </div>

      {isText && (
        <>
          <label className="ppt-element-props-field" htmlFor={`ppt-el-text-${element.id}`}>
            Text
          </label>
          <textarea
            id={`ppt-el-text-${element.id}`}
            className="ppt-element-props-textarea"
            rows={5}
            value={contentPlainText(c)}
            disabled={disabled}
            onChange={(e) => onChangeContent?.(contentWithSyncedText(c, e.target.value))}
          />
          <div className="ppt-element-props-color">
            <span className="ppt-element-props-field">Color</span>
            <ColorFillPicker
              key={element.id}
              inline
              title="Text color"
              value={contentFillValue(c, palette, element.id)}
              palette={palette}
              disabled={disabled}
              fallbackHex="#0F172A"
              onChange={(fill) => onChangeContent?.(applyElementTextFill(element, fill))}
            />
            <p className="ppt-fill-hint">
              Highlight words on the slide to recolor only those words. With no selection, the whole text box changes.
            </p>
          </div>
          <button
            type="button"
            className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
            disabled={disabled}
            onClick={() => {
              const nextH = fitPlacementHeightToDom(element)
              if (nextH) patchPlacement({ height: nextH })
            }}
          >
            Fit box to text
          </button>
        </>
      )}

      <div className="ppt-element-props-row">
        <span>Opacity</span>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          disabled={disabled}
          onChange={(e) => patchPlacement({ opacity: Number(e.target.value) / 100 })}
        />
        <span>{opacity}%</span>
      </div>

      <div className="ppt-element-props-row">
        <span>Lock position</span>
        <button type="button" disabled={disabled} onClick={onToggleLock} title="Lock/unlock">
          {element.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
          {element.locked ? ' Locked' : ' Unlocked'}
        </button>
      </div>

      {(element.type === 'shape' || element.type === 'embed') && (
        <>
          <div className="ppt-element-props-row">
            <span>Fill / border</span>
            <ColorFillPicker
              title="Fill color"
              value={normalizeFillValue(c.fill || c.stroke, '#94a3b8')}
              palette={palette}
              disabled={disabled}
              fallbackHex="#94a3b8"
              onChange={(fill) => {
                const stroke = fill?.type === 'gradient' ? fill.stops?.[0]?.color : fill?.color
                patchContent({ fill, stroke })
              }}
            />
          </div>
          <div className="ppt-element-props-row">
            <span>Border width</span>
            <input
              type="number"
              min={0}
              max={20}
              value={c.strokeWidth ?? 2}
              disabled={disabled}
              onChange={(e) => patchContent({ strokeWidth: Number(e.target.value) })}
            />
          </div>
          <div className="ppt-element-props-row">
            <span>Rounded corners</span>
            <input
              type="number"
              min={0}
              max={64}
              value={c.borderRadius ?? 0}
              disabled={disabled}
              onChange={(e) => patchContent({ borderRadius: Number(e.target.value) })}
            />
          </div>
        </>
      )}

      {isText && (
        <div className="ppt-element-props-row">
          <span>Wrap text</span>
          <select
            value={c.wrap || 'pre-wrap'}
            disabled={disabled}
            onChange={(e) => patchContent({ wrap: e.target.value })}
          >
            <option value="pre-wrap">Wrap</option>
            <option value="nowrap">No wrap</option>
          </select>
        </div>
      )}

      {(element.type === 'image' || element.type === 'icon') && (
        <>
          <button
            type="button"
            className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
            disabled={disabled}
            onClick={onReplaceImage}
          >
            Replace media
          </button>
          <button
            type="button"
            className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
            disabled={disabled}
            onClick={onCropImage}
          >
            Crop / fit settings
          </button>
        </>
      )}

      {element.type === 'embed' && (
        <div className="ppt-element-props-row">
          <span>Embed radius</span>
          <input
            type="number"
            min={0}
            max={32}
            value={c.borderRadius ?? 8}
            disabled={disabled}
            onChange={(e) => patchContent({ borderRadius: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  )
}
