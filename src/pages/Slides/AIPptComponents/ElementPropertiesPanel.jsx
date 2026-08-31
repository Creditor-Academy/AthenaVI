import { FiImage, FiLock, FiUnlock } from 'react-icons/fi'
import { measureTextContentSize } from '../../../utils/canvasTransformUtils'
import { contentPlainText, contentWithSyncedText, normalizeFillValue } from '../../../utils/pptTextContent'
import ColorFillPicker from './insert/ColorFillPicker'
import ElementTransformControls from './ElementTransformControls'
import './pptEditorExtras.css'
import './pptPanelUi.css'

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

function fillSolidColor(fill, fallback = '#1e293b') {
  const normalized = normalizeFillValue(fill, fallback)
  return normalized?.type === 'gradient' ? normalized.stops?.[0]?.color : normalized?.color
}

/**
 * Selected-element property controls for text leftovers and types that
 * do not have a dedicated design section (e.g. graphic).
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
  const isGraphic = element.type === 'graphic'
  const isEmbed = element.type === 'embed'
  const showFill = element.type === 'shape' || isEmbed || isGraphic
  const showBorderAndCorners = showFill && !isDeviceFrame && !isGraphic

  const patchContent = (updates) => onChangeContent?.(updates)
  const patchPlacement = (updates) => onChangePlacement?.(updates)

  return (
    <div className="ppt-props-stack">
      {isText && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Content</h3>
          </header>
          <div className="ppt-props-group-body">
            <textarea
              id={`ppt-el-text-${element.id}`}
              className="ppt-element-props-textarea"
              rows={5}
              value={contentPlainText(c)}
              disabled={disabled}
              placeholder="Write or edit text"
              onChange={(e) => {
                const inputType = e.nativeEvent?.inputType
                if (inputType === 'historyUndo' || inputType === 'historyRedo') return
                onChangeContent?.(contentWithSyncedText(c, e.target.value))
              }}
            />
            <div className="ppt-props-actions">
              <button
                type="button"
                className="ppt-props-action-btn"
                disabled={disabled}
                onClick={() => {
                  const nextH = fitPlacementHeightToDom(element)
                  if (nextH) patchPlacement({ height: nextH })
                }}
              >
                Fit box to text
              </button>
            </div>
          </div>
        </section>
      )}

      {toolbar && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Format</h3>
          </header>
          <div className="ppt-props-group-body">{toolbar}</div>
        </section>
      )}

      {showFill && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Color</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-row ppt-props-row--fill">
              <span className="ppt-props-row-label">
                {isDeviceFrame ? 'Frame' : isGraphic ? 'Fill / border' : 'Fill'}
              </span>
              <div className="ppt-props-row-control">
                <ColorFillPicker
                  title={isDeviceFrame ? 'Frame color' : 'Fill color'}
                  value={normalizeFillValue(
                    isDeviceFrame ? c.stroke || c.frameColor || c.fill : c.stroke || c.frameColor || c.fill,
                    '#1e293b'
                  )}
                  palette={palette}
                  disabled={disabled}
                  fallbackHex="#1e293b"
                  onChange={(fill) => {
                    const color = fillSolidColor(fill, '#1e293b')
                    if (isDeviceFrame) {
                      patchContent({ stroke: color, frameColor: color, fill: color })
                      return
                    }
                    patchContent({ fill, stroke: color })
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {showBorderAndCorners && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Border</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Weight</span>
              <div className="ppt-props-row-control">
                <input
                  type="number"
                  className="ppt-panel-input ppt-panel-input--number"
                  min={0}
                  max={20}
                  value={c.strokeWidth ?? 2}
                  disabled={disabled}
                  aria-label="Border width"
                  onChange={(e) => patchContent({ strokeWidth: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Corners</span>
              <div className="ppt-props-row-control">
                <input
                  type="number"
                  className="ppt-panel-input ppt-panel-input--number"
                  min={0}
                  max={isEmbed ? 32 : 64}
                  value={c.borderRadius ?? (isEmbed ? 8 : 0)}
                  disabled={disabled}
                  aria-label="Corner radius"
                  onChange={(e) => patchContent({ borderRadius: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {isDeviceFrame && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Screen</h3>
          </header>
          <div className="ppt-props-group-body">
            <p className="ppt-props-empty">
              Drag an image from Media onto this frame, or click an image while it is selected.
            </p>
            <div className="ppt-props-actions ppt-props-actions--stack">
              <button
                type="button"
                className="ppt-props-action-btn"
                disabled={disabled}
                onClick={onReplaceImage}
              >
                <FiImage size={15} aria-hidden />
                Replace screen image
              </button>
              {(c.screenUrl || c.url || c.src) && (
                <button
                  type="button"
                  className="ppt-props-action-btn ppt-props-action-btn--ghost"
                  disabled={disabled}
                  onClick={onClearDeviceFrameScreen}
                >
                  Clear screen image
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Transform</h3>
        </header>
        <div className="ppt-props-group-body">
          <ElementTransformControls
            key={element.id}
            placement={p}
            content={c}
            showFlip={element.type === 'image' || element.type === 'icon' || isGraphic}
            disabled={disabled}
            onChangePlacement={patchPlacement}
            onChangeContent={patchContent}
          />
        </div>
      </section>

      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Appearance</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Transparency</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                disabled={disabled}
                aria-label="Transparency"
                onChange={(e) => patchPlacement({ opacity: Number(e.target.value) / 100 })}
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
          <div className="ppt-props-row ppt-props-row--switch">
            <span className="ppt-props-row-label">Lock position</span>
            <button
              type="button"
              className={`ppt-props-lock-btn ${element.locked ? 'is-locked' : ''}`}
              disabled={disabled}
              onClick={onToggleLock}
              aria-pressed={!!element.locked}
            >
              {element.locked ? <FiLock size={14} aria-hidden /> : <FiUnlock size={14} aria-hidden />}
              {element.locked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
          {isText && (
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Wrap text</span>
              <div className="ppt-props-row-control">
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
            </div>
          )}
        </div>
      </section>

      {(element.type === 'image' || element.type === 'icon') && (
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Media</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-actions ppt-props-actions--stack">
              <button
                type="button"
                className="ppt-props-action-btn"
                disabled={disabled}
                onClick={onReplaceImage}
              >
                Replace media
              </button>
              <button
                type="button"
                className="ppt-props-action-btn"
                disabled={disabled}
                onClick={onCropImage}
              >
                Crop / fit settings
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
