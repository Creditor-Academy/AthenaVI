import { FiLock, FiUnlock } from 'react-icons/fi'
import { measureTextContentSize } from '../../../utils/canvasTransformUtils'
import { contentPlainText, contentWithSyncedText, normalizeFillValue } from '../../../utils/pptTextContent'
import ColorFillPicker from './insert/ColorFillPicker'
import ElementTransformControls from './ElementTransformControls'
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
  onClearDeviceFrameScreen,
  onCropImage,
  toolbar = null,
  disabled = false,
}) {
  if (!element) {
    return <p className="ppt-slide-panel-hint">Select an element to edit properties.</p>
  }

  const p = element.placement || {}
  const c = element.content || {}
  const opacity = p.opacity != null ? Math.round(p.opacity * 100) : 100
  const isText = TEXT_TYPES.has(element.type)
  const isDeviceFrame = Boolean(c.deviceFrame || c.shape === 'device-frame')

  const patchContent = (updates) => onChangeContent?.({ ...c, ...updates })
  const patchPlacement = (updates) =>
    onChangePlacement?.({ ...p, ...updates })

  return (
    <div className="ppt-element-props-grid">
      {isText && (
        <textarea
          id={`ppt-el-text-${element.id}`}
          className="ppt-element-props-textarea"
          rows={5}
          value={contentPlainText(c)}
          disabled={disabled}
          placeholder="Write or edit text"
          onChange={(e) => onChangeContent?.(contentWithSyncedText(c, e.target.value))}
        />
      )}

      {toolbar}

      {!isText && (
        <div className="ppt-element-props-row">
          <span>Type</span>
          <strong>{element.type}</strong>
        </div>
      )}

      {isText && (
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
      )}

      <ElementTransformControls
        placement={p}
        content={c}
        showFlip={element.type === 'image' || element.type === 'icon' || element.type === 'graphic'}
        disabled={disabled}
        onChangePlacement={patchPlacement}
        onChangeContent={patchContent}
      />

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
        <button
          type="button"
          className={`ppt-lock-btn ${element.locked ? 'is-locked' : ''}`}
          disabled={disabled}
          onClick={onToggleLock}
          title="Lock/unlock"
        >
          {element.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
          {element.locked ? 'Locked' : 'Unlocked'}
        </button>
      </div>

      {(element.type === 'shape' || element.type === 'embed') && (
        <>
          <div className="ppt-element-props-row">
            <span>{isDeviceFrame ? 'Frame color' : 'Fill / border'}</span>
            <ColorFillPicker
              title={isDeviceFrame ? 'Frame color' : 'Fill color'}
              value={normalizeFillValue(c.stroke || c.frameColor || c.fill, '#1e293b')}
              palette={palette}
              disabled={disabled}
              fallbackHex="#1e293b"
              onChange={(fill) => {
                const color = fill?.type === 'gradient' ? fill.stops?.[0]?.color : fill?.color
                if (isDeviceFrame) {
                  patchContent({ stroke: color, frameColor: color, fill: color })
                  return
                }
                patchContent({ fill, stroke: color })
              }}
            />
          </div>
          {!isDeviceFrame && (
            <>
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
          {isDeviceFrame && (
            <>
              <p className="ppt-slide-panel-hint" style={{ margin: 0 }}>
                Drag an image from Media onto this frame, or click an image while it is selected.
              </p>
              <button
                type="button"
                className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
                disabled={disabled}
                onClick={onReplaceImage}
              >
                Replace screen image
              </button>
              {(c.screenUrl || c.url || c.src) && (
                <button
                  type="button"
                  className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
                  disabled={disabled}
                  onClick={onClearDeviceFrameScreen}
                >
                  Clear screen image
                </button>
              )}
            </>
          )}
        </>
      )}

      {isText && (
        <div className="ppt-element-props-row">
          <span>Wrap text</span>
          <select
            className="ppt-ui-select ppt-element-props-select"
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
