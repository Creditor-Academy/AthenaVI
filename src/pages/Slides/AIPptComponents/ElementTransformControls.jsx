import { MdFlip, MdRotateLeft, MdRotateRight } from 'react-icons/md'
import { normalizeAngle } from '../../../utils/canvasTransformUtils'

/**
 * Flip (images) + rotate (images and text) controls for the design panel.
 */
export default function ElementTransformControls({
  placement = {},
  content = {},
  showFlip = false,
  disabled = false,
  onChangePlacement,
  onChangeContent,
}) {
  const rotation = Math.round(Number(placement.rotation) || 0)
  const flipH = content.flipHorizontal === true || content.scaleX === -1
  const flipV = content.flipVertical === true || content.scaleY === -1

  const setRotation = (next) => {
    onChangePlacement?.({ ...placement, rotation: normalizeAngle(Number(next) || 0) })
  }

  const toggleFlip = (axis) => {
    if (axis === 'h') {
      onChangeContent?.({ ...content, flipHorizontal: !flipH, scaleX: flipH ? 1 : -1 })
      return
    }
    onChangeContent?.({ ...content, flipVertical: !flipV, scaleY: flipV ? 1 : -1 })
  }

  return (
    <>
      {showFlip && (
        <div className="ppt-element-props-row ppt-element-props-row--stack">
          <span>Flip</span>
          <div className="ppt-transform-flip-row">
            <button
              type="button"
              className={`ppt-transform-flip-btn ${flipH ? 'is-active' : ''}`}
              disabled={disabled}
              onClick={() => toggleFlip('h')}
              title="Flip horizontal"
              aria-pressed={flipH}
            >
              <MdFlip size={15} />
              Horizontal
            </button>
            <button
              type="button"
              className={`ppt-transform-flip-btn ${flipV ? 'is-active' : ''}`}
              disabled={disabled}
              onClick={() => toggleFlip('v')}
              title="Flip vertical"
              aria-pressed={flipV}
            >
              <span className="ppt-transform-flip-icon-v" aria-hidden>
                <MdFlip size={15} />
              </span>
              Vertical
            </button>
          </div>
        </div>
      )}

      <div className="ppt-element-props-row">
        <span>Rotate</span>
        <div className="ppt-transform-rotate-row">
          <button
            type="button"
            className="ppt-transform-rotate-icon"
            disabled={disabled}
            title="Rotate 90° left"
            aria-label="Rotate 90 degrees left"
            onClick={() => setRotation(rotation - 90)}
          >
            <MdRotateLeft size={16} />
          </button>
          <input
            type="number"
            className="ppt-transform-rotate-input"
            min={0}
            max={359}
            step={1}
            value={rotation}
            disabled={disabled}
            aria-label="Rotation degrees"
            onChange={(e) => setRotation(e.target.value)}
          />
          <span className="ppt-transform-rotate-unit">°</span>
          <button
            type="button"
            className="ppt-transform-rotate-icon"
            disabled={disabled}
            title="Rotate 90° right"
            aria-label="Rotate 90 degrees right"
            onClick={() => setRotation(rotation + 90)}
          >
            <MdRotateRight size={16} />
          </button>
        </div>
      </div>
    </>
  )
}
