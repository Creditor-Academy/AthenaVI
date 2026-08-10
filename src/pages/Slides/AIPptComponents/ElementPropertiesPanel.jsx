import { FiLock, FiUnlock } from 'react-icons/fi'
import './pptEditorExtras.css'

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

  const patchContent = (updates) => onChangeContent?.({ ...c, ...updates })
  const patchPlacement = (updates) =>
    onChangePlacement?.({ ...p, ...updates })

  return (
    <div className="ppt-element-props-grid">
      <div className="ppt-element-props-row">
        <span>Type</span>
        <strong>{element.type}</strong>
      </div>

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
            <input
              type="color"
              value={String(c.fill || c.stroke || '#94a3b8').startsWith('#') ? c.fill || c.stroke : '#94a3b8'}
              disabled={disabled}
              onChange={(e) => patchContent({ fill: e.target.value, stroke: e.target.value })}
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

      {element.type === 'text' && (
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
