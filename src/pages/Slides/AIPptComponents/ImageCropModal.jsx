import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FiCheck, FiRotateCcw, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import {
  MAX_CROP_ZOOM,
  centeredCropForAspect,
  cropChanged,
  cropPixelAspect,
  cropZoom,
  dragCrop,
  fitCropToAspect,
  lockCropAspect,
  normalizeCrop,
  zoomCrop,
} from '../../../utils/imageCrop'
import './pptEditorExtras.css'
import './pptPanelUi.css'

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

// 'frame': the shape of the image's box on the slide / canvas (passed as `frameAspect`).
const FRAME_ASPECT = { id: 'frame', label: 'Current', value: 'frame', title: 'The shape of the image box on your design' }
const ASPECTS = [
  { id: 'free', label: 'Free', value: null },
  { id: 'original', label: 'Original', value: 'original' },
  { id: '1:1', label: 'Square', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '3:4', label: '3:4', value: 3 / 4 },
]

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const DEFAULT_STAGE = { width: 560, height: 360 }
/** Share of the stage the frame fills once it settles; the rest shows the photo around it. */
const FRAME_SHARE = 0.7
const FULL = { x: 0, y: 0, width: 1, height: 1 }

/** Where the photo and the frame sit on the stage: the frame centred, the photo around it. */
function layoutFor(crop, imageAspect, stage) {
  const aspect = cropPixelAspect(crop, imageAspect)
  const frameW = Math.min(stage.width * FRAME_SHARE, stage.height * FRAME_SHARE * aspect)
  const frameH = frameW / aspect
  const imgW = frameW / crop.width
  const imgH = frameH / crop.height
  const frameX = (stage.width - frameW) / 2
  const frameY = (stage.height - frameH) / 2
  return { imgX: frameX - crop.x * imgW, imgY: frameY - crop.y * imgH, imgW, imgH }
}

/**
 * Crop + image settings for an image (slide, canvas and video editors), the way Canva does it:
 * the frame is what will show; drag the photo behind it to choose the part that appears, zoom
 * with the slider or the mouse wheel, and drag the frame's handles to change its shape. The
 * photo outside the frame stays visible, faded, so you can see what is being cut.
 *
 * `frameAspect` (width / height of the image's box on the design): the frame opens in that
 * shape, showing exactly what the box shows now (`object-fit: cover` when it isn't cropped yet),
 * and keeps that shape while resizing until another shape is chosen.
 *
 * `onApply({ crop, fit, opacity, naturalWidth, naturalHeight })` — crop is null when the whole
 * image is kept (or an uncropped image is applied without changing the frame).
 */
export default function ImageCropModal({
  imageUrl,
  initialCrop = null,
  initialFit = 'cover',
  initialOpacity = 1,
  frameAspect = null,
  showFit = true,
  onApply,
  onClose,
}) {
  const [fit, setFit] = useState(initialFit || 'cover')
  const [opacity, setOpacity] = useState(Math.round((initialOpacity ?? 1) * 100))
  const hasFrame = Number(frameAspect) > 0
  const defaultAspectId = hasFrame ? 'frame' : 'free'
  const aspects = hasFrame ? [FRAME_ASPECT, ...ASPECTS] : ASPECTS
  const [crop, setCrop] = useState(() => normalizeCrop(initialCrop) || FULL)
  // What the image box shows now: where the dialog opens and what Reset goes back to.
  const [startCrop, setStartCrop] = useState(() => normalizeCrop(initialCrop) || FULL)
  const [aspectId, setAspectId] = useState(defaultAspectId)
  const [natural, setNatural] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [stage, setStage] = useState(DEFAULT_STAGE)
  // While a handle is dragged the photo holds still (so the edge follows the pointer);
  // on release everything settles back with the frame centred.
  const [frozen, setFrozen] = useState(null)
  const [dragKind, setDragKind] = useState(null)
  const stageRef = useRef(null)
  const frameRef = useRef(null)
  const listenersRef = useRef(null)

  const imageAspect = natural ? natural.width / natural.height : 1
  const aspectFor = (id) => {
    const a = aspects.find((item) => item.id === id)?.value
    if (a === 'original') return imageAspect
    if (a === 'frame') return Number(frameAspect)
    return a
  }
  const aspectValue = aspectFor(aspectId)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setStage({ width, height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = frozen || layoutFor(crop, imageAspect, stage)
  const frame = {
    x: layout.imgX + crop.x * layout.imgW,
    y: layout.imgY + crop.y * layout.imgH,
    width: crop.width * layout.imgW,
    height: crop.height * layout.imgH,
  }
  const zoom = cropZoom(crop, imageAspect)

  const chooseAspect = (id) => {
    setAspectId(id)
    const value = aspectFor(id)
    if (!value) return
    // The box's own shape keeps the current view as far as it can; presets start centred.
    setCrop((current) =>
      id === 'frame' ? fitCropToAspect(current, value, imageAspect) : centeredCropForAspect(value, imageAspect)
    )
  }

  const setZoom = (next) => setCrop((current) => zoomCrop(current, next, imageAspect))

  const stopDrag = useCallback(() => {
    const listeners = listenersRef.current
    listenersRef.current = null
    setFrozen(null)
    setDragKind(null)
    if (!listeners) return
    window.removeEventListener('pointermove', listeners.move)
    window.removeEventListener('pointerup', listeners.up)
    window.removeEventListener('pointercancel', listeners.up)
  }, [])

  useEffect(() => stopDrag, [stopDrag])

  /** `handle` 'pan' drags the photo behind the frame; a corner / edge id resizes the frame. */
  const beginDrag = (event, handle) => {
    if (!natural || event.button > 0) return
    event.preventDefault()
    event.stopPropagation()
    stopDrag()
    const start = { crop, x: event.clientX, y: event.clientY, imgW: layout.imgW, imgH: layout.imgH }
    if (handle !== 'pan') setFrozen(layout)
    setDragKind(handle === 'pan' ? 'pan' : 'resize')
    frameRef.current?.focus({ preventScroll: true })
    const move = (moveEvent) => {
      const dx = (moveEvent.clientX - start.x) / start.imgW
      const dy = (moveEvent.clientY - start.y) / start.imgH
      if (handle === 'pan') {
        // Dragging the photo right shows more of its left side.
        setCrop(dragCrop(start.crop, 'move', -dx, -dy))
      } else {
        setCrop(dragCrop(start.crop, handle, dx, dy, { aspect: aspectValue, imageAspect }))
      }
    }
    const up = () => stopDrag()
    listenersRef.current = { move, up }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // Wheel zoom (needs a non-passive listener to keep the page from scrolling).
  useEffect(() => {
    const el = stageRef.current
    if (!el || !natural) return undefined
    const onWheel = (event) => {
      event.preventDefault()
      setCrop((current) => zoomCrop(current, cropZoom(current, imageAspect) * Math.exp(-event.deltaY * 0.0015), imageAspect))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [natural, imageAspect])

  const onFrameKeyDown = (event) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      setZoom(zoom * 1.1)
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      setZoom(zoom / 1.1)
      return
    }
    const step = (event.shiftKey ? 0.05 : 0.01) * Math.min(crop.width, crop.height)
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
  const pixelSize = natural
    ? `${Math.round(crop.width * natural.width)} × ${Math.round(crop.height * natural.height)} px`
    : ''
  const ready = natural && !loadError
  const imgRect = { left: layout.imgX, top: layout.imgY, width: layout.imgW, height: layout.imgH }
  const stageClass = ['ppt-crop-stage', dragKind ? `is-dragging is-dragging--${dragKind}` : ''].join(' ')

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
          <div ref={stageRef} className={stageClass}>
            {/* The whole photo, faded: what the crop leaves out. Drag it to move the photo. */}
            <img
              className="ppt-crop-photo ppt-crop-photo--ghost"
              src={imageUrl}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const { naturalWidth: width, naturalHeight: height } = e.currentTarget
                if (!width || !height) return
                setNatural({ width, height })
                if (hasFrame) {
                  const start = fitCropToAspect(initialCrop, Number(frameAspect), width / height)
                  setStartCrop(start)
                  setCrop(start)
                }
              }}
              onError={() => setLoadError(true)}
              onPointerDown={(e) => beginDrag(e, 'pan')}
              style={{ ...imgRect, opacity: ready ? 0.35 * (opacity / 100) : 0 }}
            />
            {ready ? (
              <div
                ref={frameRef}
                className="ppt-crop-box"
                role="slider"
                tabIndex={0}
                aria-label="Visible part of the image: drag to move the photo, arrow keys to nudge, plus and minus to zoom"
                aria-valuetext={`${pixelSize}, zoom ${Math.round(zoom * 100)}%`}
                style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height }}
                onPointerDown={(e) => beginDrag(e, 'pan')}
                onKeyDown={onFrameKeyDown}
              >
                {/* The part that will appear, at full strength. */}
                <span className="ppt-crop-window" aria-hidden>
                  <img
                    className="ppt-crop-photo"
                    src={imageUrl}
                    alt=""
                    draggable={false}
                    style={{
                      left: layout.imgX - frame.x,
                      top: layout.imgY - frame.y,
                      width: layout.imgW,
                      height: layout.imgH,
                      opacity: opacity / 100,
                    }}
                  />
                </span>
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
            ) : null}
            {loadError ? <p className="ppt-crop-error">This image couldn’t be loaded for cropping.</p> : null}
          </div>
          {ready ? (
            <p className="ppt-crop-hint">
              Drag the photo to choose what shows. Scroll or use the slider to zoom. Drag the corners to change the frame.
            </p>
          ) : null}
        </div>

        <div className="ppt-props-stack ppt-crop-modal-controls">
          <div className="ppt-props-row ppt-props-row--slider">
            <span className="ppt-props-row-label">Zoom</span>
            <div className="ppt-props-slider ppt-crop-zoom">
              <button
                type="button"
                className="ppt-crop-zoom-btn"
                aria-label="Zoom out"
                disabled={!ready || zoom <= 1.001}
                onClick={() => setZoom(zoom / 1.2)}
              >
                <FiZoomOut size={14} />
              </button>
              <input
                type="range"
                min={100}
                max={MAX_CROP_ZOOM * 100}
                step={1}
                value={Math.round(zoom * 100)}
                disabled={!ready}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
              />
              <button
                type="button"
                className="ppt-crop-zoom-btn"
                aria-label="Zoom in"
                disabled={!ready || zoom >= MAX_CROP_ZOOM - 0.001}
                onClick={() => setZoom(zoom * 1.2)}
              >
                <FiZoomIn size={14} />
              </button>
              <span className="ppt-props-slider-value">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div className="ppt-props-row ppt-props-row--stack">
            <span className="ppt-props-row-label">
              Frame shape {pixelSize ? <span className="ppt-crop-size">· {pixelSize}</span> : null}
            </span>
            <div className="ppt-crop-ratio-row">
              <div className="ppt-segmented" role="radiogroup" aria-label="Frame shape">
                {aspects.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={aspectId === opt.id}
                    className={`ppt-segmented-btn ${aspectId === opt.id ? 'is-active' : ''}`}
                    disabled={!natural}
                    title={opt.title}
                    onClick={() => chooseAspect(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="ppt-crop-reset"
                title="Back to what the image box shows now"
                onClick={() => {
                  setAspectId(defaultAspectId)
                  setCrop(startCrop)
                }}
                disabled={!cropChanged(crop, startCrop) && aspectId === defaultAspectId}
              >
                <FiRotateCcw size={13} aria-hidden /> Reset
              </button>
            </div>
          </div>

          {showFit ? (
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
          ) : null}

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
              // Opened on an uncropped image and the frame wasn't changed: keep it uncropped.
              const untouched = !normalizeCrop(initialCrop) && !cropChanged(crop, startCrop)
              const finalCrop = aspectValue && cropped ? lockCropAspect(cropped, aspectValue, imageAspect) : cropped
              onApply?.({
                crop: untouched ? null : finalCrop,
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
