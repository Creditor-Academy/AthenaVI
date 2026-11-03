import { useCallback, useEffect, useRef, useState } from 'react'
import { FiCheck, FiRotateCcw, FiX } from 'react-icons/fi'
import {
  centeredCropForAspect,
  dragCrop,
  lockCropAspect,
  normalizeCrop,
} from '../../../utils/imageCrop'
import './pptEditorExtras.css'
import './pptPanelUi.css'

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

const ASPECTS = [
  { id: 'free', label: 'Free', value: null },
  { id: 'original', label: 'Original', value: 'original' },
  { id: '1:1', label: 'Square', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '3:4', label: '3:4', value: 3 / 4 },
]

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const STAGE_MAX_W = 560
const STAGE_MAX_H = 340
const FULL = { x: 0, y: 0, width: 1, height: 1 }

/**
 * Crop + image settings for an image element (slide editor and canvas editor).
 * Drag inside the box to move it, drag a handle to resize; arrow keys nudge it.
 * `onApply({ crop, fit, opacity, naturalWidth, naturalHeight })` — crop is null when the
 * whole image is kept.
 */
export default function ImageCropModal({
  imageUrl,
  initialCrop = null,
  initialFit = 'cover',
  initialOpacity = 1,
  onApply,
  onClose,
}) {
  const [fit, setFit] = useState(initialFit || 'cover')
  const [opacity, setOpacity] = useState(Math.round((initialOpacity ?? 1) * 100))
  const [crop, setCrop] = useState(() => normalizeCrop(initialCrop) || FULL)
  const [aspectId, setAspectId] = useState('free')
  const [natural, setNatural] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const stageRef = useRef(null)
  const dragRef = useRef(null)
  const boxRef = useRef(null)

  const imageAspect = natural ? natural.width / natural.height : 1
  const aspectValue = (() => {
    const a = ASPECTS.find((item) => item.id === aspectId)?.value
    return a === 'original' ? imageAspect : a
  })()

  const stageSize = natural
    ? (() => {
        const width = Math.min(STAGE_MAX_W, STAGE_MAX_H * imageAspect)
        return { width, height: width / imageAspect }
      })()
    : { width: STAGE_MAX_W, height: STAGE_MAX_H }

  const chooseAspect = (id) => {
    setAspectId(id)
    const a = ASPECTS.find((item) => item.id === id)?.value
    const value = a === 'original' ? imageAspect : a
    if (value) setCrop(centeredCropForAspect(value, imageAspect))
  }

  const listenersRef = useRef(null)
  const stopDrag = useCallback(() => {
    const listeners = listenersRef.current
    listenersRef.current = null
    dragRef.current = null
    if (!listeners) return
    window.removeEventListener('pointermove', listeners.move)
    window.removeEventListener('pointerup', listeners.up)
    window.removeEventListener('pointercancel', listeners.up)
  }, [])

  useEffect(() => stopDrag, [stopDrag])

  const beginDrag = (event, handle) => {
    if (!stageRef.current) return
    event.preventDefault()
    event.stopPropagation()
    stopDrag()
    const rect = stageRef.current.getBoundingClientRect()
    dragRef.current = {
      handle,
      start: crop,
      startX: event.clientX,
      startY: event.clientY,
      stageW: rect.width || 1,
      stageH: rect.height || 1,
      aspect: aspectValue,
      imageAspect,
    }
    boxRef.current?.focus({ preventScroll: true })
    const move = (moveEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = (moveEvent.clientX - drag.startX) / drag.stageW
      const dy = (moveEvent.clientY - drag.startY) / drag.stageH
      setCrop(dragCrop(drag.start, drag.handle, dx, dy, { aspect: drag.aspect, imageAspect: drag.imageAspect }))
    }
    const up = () => stopDrag()
    listenersRef.current = { move, up }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const onBoxKeyDown = (event) => {
    const step = event.shiftKey ? 0.05 : 0.01
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    setCrop((current) => dragCrop(current, 'move', move[0], move[1]))
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!imageUrl) return null

  const cropped = normalizeCrop(crop)
  const pct = (n) => `${n * 100}%`
  const pixelSize = natural
    ? `${Math.round(crop.width * natural.width)} × ${Math.round(crop.height * natural.height)} px`
    : ''

  return (
    <div
      className="ppt-crop-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ppt-crop-modal" role="dialog" aria-modal="true" aria-labelledby="ppt-crop-modal-title">
        <header className="ppt-crop-modal-head">
          <h2 id="ppt-crop-modal-title" className="ppt-crop-modal-title">
            Crop image
          </h2>
          <button type="button" className="ppt-crop-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className="ppt-crop-workspace">
          <div ref={stageRef} className="ppt-crop-stage" style={{ width: stageSize.width, height: stageSize.height }}>
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const { naturalWidth: width, naturalHeight: height } = e.currentTarget
                if (width && height) setNatural({ width, height })
              }}
              onError={() => setLoadError(true)}
              style={{ opacity: opacity / 100 }}
            />
            {natural && !loadError ? (
              <>
                <div className="ppt-crop-shade" style={{ left: 0, top: 0, width: '100%', height: pct(crop.y) }} />
                <div className="ppt-crop-shade" style={{ left: 0, top: pct(crop.y + crop.height), width: '100%', bottom: 0 }} />
                <div className="ppt-crop-shade" style={{ left: 0, top: pct(crop.y), width: pct(crop.x), height: pct(crop.height) }} />
                <div
                  className="ppt-crop-shade"
                  style={{ left: pct(crop.x + crop.width), top: pct(crop.y), right: 0, height: pct(crop.height) }}
                />
                <div
                  ref={boxRef}
                  className="ppt-crop-box"
                  role="slider"
                  tabIndex={0}
                  aria-label="Crop area — drag to move, arrow keys to nudge"
                  aria-valuetext={pixelSize}
                  style={{ left: pct(crop.x), top: pct(crop.y), width: pct(crop.width), height: pct(crop.height) }}
                  onPointerDown={(e) => beginDrag(e, 'move')}
                  onKeyDown={onBoxKeyDown}
                >
                  <span className="ppt-crop-grid" aria-hidden />
                  {HANDLES.map((handle) => (
                    <span
                      key={handle}
                      className={`ppt-crop-handle ppt-crop-handle--${handle}`}
                      onPointerDown={(e) => beginDrag(e, handle)}
                      aria-hidden
                    />
                  ))}
                </div>
              </>
            ) : null}
            {loadError ? <p className="ppt-crop-error">This image couldn’t be loaded for cropping.</p> : null}
          </div>
        </div>

        <div className="ppt-props-stack ppt-crop-modal-controls">
          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">
              Crop ratio {pixelSize ? <span className="ppt-crop-size">· {pixelSize}</span> : null}
            </span>
            <div className="ppt-crop-ratio-row">
              <div className="ppt-segmented" role="radiogroup" aria-label="Crop ratio">
                {ASPECTS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={aspectId === opt.id}
                    className={`ppt-segmented-btn ${aspectId === opt.id ? 'is-active' : ''}`}
                    disabled={!natural}
                    onClick={() => chooseAspect(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="ppt-crop-reset"
                onClick={() => {
                  setAspectId('free')
                  setCrop(FULL)
                }}
                disabled={!cropped}
              >
                <FiRotateCcw size={13} aria-hidden /> Reset
              </button>
            </div>
          </div>

          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">Fit {cropped ? '(used when the image isn’t cropped)' : ''}</span>
            <div className="ppt-segmented" role="radiogroup" aria-label="Image fit">
              {FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={fit === opt.value}
                  className={`ppt-segmented-btn ${fit === opt.value ? 'is-active' : ''}`}
                  onClick={() => setFit(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Opacity</span>
            <div className="ppt-props-slider">
              <input
                type="range"
                min={10}
                max={100}
                value={opacity}
                aria-label="Opacity"
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
              <span className="ppt-props-slider-value">{opacity}%</span>
            </div>
          </div>
        </div>

        <footer className="ppt-crop-modal-footer">
          <button type="button" className="ppt-crop-modal-btn ppt-crop-modal-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ppt-crop-modal-btn ppt-crop-modal-btn--primary"
            disabled={loadError}
            onClick={() => {
              onApply?.({
                crop: aspectValue && cropped ? lockCropAspect(cropped, aspectValue, imageAspect) : cropped,
                fit,
                opacity: opacity / 100,
                naturalWidth: natural?.width || null,
                naturalHeight: natural?.height || null,
              })
              onClose?.()
            }}
          >
            <FiCheck size={15} aria-hidden />
            Apply
          </button>
        </footer>
      </div>
    </div>
  )
}
