import { useEffect, useRef, useState } from 'react'
import { MdFlip, MdRotateLeft, MdRotateRight } from 'react-icons/md'
import { normalizeAngle } from '../../../utils/canvasTransformUtils'

function wrapDegrees(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return normalizeAngle(Math.round(n))
}

function readFlipH(content = {}) {
  return content.flipHorizontal === true || content.scaleX === -1
}

function readFlipV(content = {}) {
  return content.flipVertical === true || content.scaleY === -1
}

/**
 * Flip (images) + rotate (images and text) controls for the design panel.
 * Optimistic local state + refs so rapid clicks never read stale props.
 * Props are ignored until they catch up (prevents flip/rotate revert flicker).
 */
export default function ElementTransformControls({
  placement = {},
  content = {},
  showFlip = false,
  disabled = false,
  onChangePlacement,
  onChangeContent,
}) {
  const propRotation = wrapDegrees(placement.rotation)
  const propFlipH = readFlipH(content)
  const propFlipV = readFlipV(content)

  const rotationRef = useRef(propRotation)
  const flipHRef = useRef(propFlipH)
  const flipVRef = useRef(propFlipV)
  const rotationDirtyRef = useRef(false)
  const flipHDirtyRef = useRef(false)
  const flipVDirtyRef = useRef(false)

  const [flipH, setFlipH] = useState(propFlipH)
  const [flipV, setFlipV] = useState(propFlipV)
  const [draft, setDraft] = useState(String(propRotation))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (rotationDirtyRef.current) {
      if (propRotation === rotationRef.current) {
        rotationDirtyRef.current = false
        return
      }
      // Hold optimistic value until props catch up (ignore stale echoes)
      return
    }
    if (focused) return
    if (propRotation === rotationRef.current) return
    rotationRef.current = propRotation
    setDraft(String(propRotation))
  }, [propRotation, focused])

  useEffect(() => {
    if (flipHDirtyRef.current) {
      if (propFlipH === flipHRef.current) {
        flipHDirtyRef.current = false
        return
      }
      return
    }
    if (propFlipH === flipHRef.current) return
    flipHRef.current = propFlipH
    setFlipH(propFlipH)
  }, [propFlipH])

  useEffect(() => {
    if (flipVDirtyRef.current) {
      if (propFlipV === flipVRef.current) {
        flipVDirtyRef.current = false
        return
      }
      return
    }
    if (propFlipV === flipVRef.current) return
    flipVRef.current = propFlipV
    setFlipV(propFlipV)
  }, [propFlipV])

  // Safety: clear dirty locks after props have had time to catch up
  useEffect(() => {
    if (!rotationDirtyRef.current && !flipHDirtyRef.current && !flipVDirtyRef.current) {
      return undefined
    }
    const t = window.setTimeout(() => {
      if (propRotation === rotationRef.current) rotationDirtyRef.current = false
      if (propFlipH === flipHRef.current) flipHDirtyRef.current = false
      if (propFlipV === flipVRef.current) flipVDirtyRef.current = false
    }, 800)
    return () => window.clearTimeout(t)
  }, [propRotation, propFlipH, propFlipV])

  const commitRotation = (next) => {
    const wrapped = wrapDegrees(next)
    rotationDirtyRef.current = true
    rotationRef.current = wrapped
    setDraft(String(wrapped))
    onChangePlacement?.({ rotation: wrapped })
  }

  const nudgeRotation = (delta) => {
    commitRotation(rotationRef.current + delta)
  }

  const toggleFlip = (axis) => {
    if (axis === 'h') {
      const next = !flipHRef.current
      flipHDirtyRef.current = true
      flipHRef.current = next
      setFlipH(next)
      onChangeContent?.({
        flipHorizontal: next,
        scaleX: next ? -1 : 1,
      })
      return
    }
    const next = !flipVRef.current
    flipVDirtyRef.current = true
    flipVRef.current = next
    setFlipV(next)
    onChangeContent?.({
      flipVertical: next,
      scaleY: next ? -1 : 1,
    })
  }

  return (
    <div className="ppt-transform-controls">
      {showFlip && (
        <div className="ppt-props-row ppt-props-row--stack">
          <span className="ppt-props-row-label">Flip</span>
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

      <div className="ppt-props-row">
        <span className="ppt-props-row-label">Rotate</span>
        <div className="ppt-transform-rotate-row">
          <button
            type="button"
            className="ppt-transform-rotate-icon"
            disabled={disabled}
            title="Rotate 90° left"
            aria-label="Rotate 90 degrees left"
            onClick={() => nudgeRotation(-90)}
          >
            <MdRotateLeft size={16} />
          </button>
          <button
            type="button"
            className="ppt-transform-rotate-step"
            disabled={disabled}
            title="Decrease 1°"
            aria-label="Decrease rotation by 1 degree"
            onClick={() => nudgeRotation(-1)}
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            className="ppt-transform-rotate-input"
            value={draft}
            disabled={disabled}
            aria-label="Rotation degrees"
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              commitRotation(draft === '' || draft === '-' ? rotationRef.current : draft)
            }}
            onChange={(e) => {
              const raw = e.target.value.trim()
              if (raw === '' || raw === '-' || /^-?\d{1,4}$/.test(raw)) {
                setDraft(raw)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                nudgeRotation(1)
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                nudgeRotation(-1)
              } else if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
          />
          <span className="ppt-transform-rotate-unit">°</span>
          <button
            type="button"
            className="ppt-transform-rotate-step"
            disabled={disabled}
            title="Increase 1°"
            aria-label="Increase rotation by 1 degree"
            onClick={() => nudgeRotation(1)}
          >
            +
          </button>
          <button
            type="button"
            className="ppt-transform-rotate-icon"
            disabled={disabled}
            title="Rotate 90° right"
            aria-label="Rotate 90 degrees right"
            onClick={() => nudgeRotation(90)}
          >
            <MdRotateRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
