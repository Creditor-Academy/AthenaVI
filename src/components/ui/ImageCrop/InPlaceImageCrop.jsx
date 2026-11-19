import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  cropAspectValue,
  panPhoto,
  photoZoom,
  resizeFrame,
  scalePhoto,
  unrotateDelta,
  zoomPhoto,
} from '../../../utils/imageCropSession'
import { CROP_UI_ATTR } from './cropUi'
import './imageCrop.css'

const FRAME_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const PHOTO_CORNERS = ['nw', 'ne', 'se', 'sw']


function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target?.isContentEditable)
}

/**
 * Canva-style crop drawn on the design, over the image being cropped (see imageCropSession.js).
 * Render it inside the stage layer whose box is the whole design (canvasW × canvasH units).
 *
 *  - the whole photo shows faded; inside the frame it shows at full strength
 *  - drag the photo (or inside the frame) to choose what shows
 *  - round handles on the photo's corners scale it; white corner / edge handles resize the frame
 *  - mouse wheel zooms; arrows nudge; Enter or a click outside applies; Esc cancels
 *
 * `getStageRect()` returns the on-screen rectangle of that layer (to turn pointer movement into
 * design units). `cssScale` is how much the layer's CSS pixels are scaled on screen (the video
 * editor scales its whole stage), so handles stay the same size on screen.
 */
export default function InPlaceImageCrop({
  session,
  canvasW,
  canvasH,
  getStageRect,
  cssScale = 1,
  onChange,
  onDone,
  onCancel,
}) {
  const [dragging, setDragging] = useState(null)
  const sessionRef = useRef(session)
  const frameRef = useRef(null)
  const photoRef = useRef(null)
  const listenersRef = useRef(null)
  const handlersRef = useRef({ onChange, onDone, onCancel })
  useLayoutEffect(() => {
    sessionRef.current = session
    handlersRef.current = { onChange, onDone, onCancel }
  })

  const stopDrag = useCallback(() => {
    const l = listenersRef.current
    listenersRef.current = null
    setDragging(null)
    if (!l) return
    window.removeEventListener('pointermove', l.move)
    window.removeEventListener('pointerup', l.up)
    window.removeEventListener('pointercancel', l.up)
  }, [])
  useEffect(() => stopDrag, [stopDrag])

  /** kind: 'pan' | 'photo' (scale from a corner) | 'frame' (resize). */
  const beginDrag = (event, kind, handle = null) => {
    if (event.button > 0) return
    event.preventDefault()
    event.stopPropagation()
    stopDrag()
    const rect = getStageRect?.()
    if (!rect?.width) return
    const start = sessionRef.current
    const unitsPerPx = canvasW / rect.width
    const x0 = event.clientX
    const y0 = event.clientY
    setDragging(kind)
    const move = (e) => {
      const raw = { dx: (e.clientX - x0) * unitsPerPx, dy: (e.clientY - y0) * unitsPerPx }
      const { dx, dy } = unrotateDelta(raw.dx, raw.dy, start.rotation)
      let next
      if (kind === 'pan') next = panPhoto(start, dx, dy, start)
      else if (kind === 'photo') next = scalePhoto(start, handle, dx, dy, start)
      else {
        // A chosen shape stays; Shift keeps the current one in Freeform.
        const aspect =
          cropAspectValue(start.aspectId, start.imageAspect) ||
          (e.shiftKey && handle.length === 2 ? start.frame.width / start.frame.height : null)
        next = resizeFrame(start, handle, dx, dy, aspect, start)
      }
      handlersRef.current.onChange?.(next)
    }
    const up = () => stopDrag()
    listenersRef.current = { move, up }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // Wheel zooms the photo (a non-passive listener, so the page doesn't scroll).
  useEffect(() => {
    const els = [frameRef.current, photoRef.current].filter(Boolean)
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return // the editor's own zoom
      e.preventDefault()
      e.stopPropagation()
      const s = sessionRef.current
      handlersRef.current.onChange?.(zoomPhoto(s, photoZoom(s) * Math.exp(-e.deltaY * 0.0015)))
    }
    els.forEach((el) => el.addEventListener('wheel', onWheel, { passive: false }))
    return () => els.forEach((el) => el.removeEventListener('wheel', onWheel))
  }, [])

  // Keys while cropping belong to the crop (no deleting / nudging the element underneath).
  useEffect(() => {
    const onKey = (e) => {
      const { onDone: done, onCancel: cancel, onChange: change } = handlersRef.current
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        cancel?.()
        return
      }
      if (isTypingTarget(e.target)) return
      const s = sessionRef.current
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopImmediatePropagation()
        done?.()
        return
      }
      const step = (e.shiftKey ? 10 : 1) * (canvasW / 960)
      const arrows = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
      if (arrows[e.key]) {
        e.preventDefault()
        e.stopImmediatePropagation()
        change?.(panPhoto(s, arrows[e.key][0], arrows[e.key][1]))
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
        // Undo while cropping just leaves the crop.
        e.preventDefault()
        e.stopImmediatePropagation()
        cancel?.()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [canvasW])

  // A press anywhere outside the crop UI applies it (like Canva), then does what it does.
  useEffect(() => {
    const onDown = (e) => {
      if (e.target?.closest?.('[data-crop-ui]')) return
      handlersRef.current.onDone?.()
    }
    window.addEventListener('pointerdown', onDown, true)
    return () => window.removeEventListener('pointerdown', onDown, true)
  }, [])

  const { frame, photo, rotation, pivot, flipX, flipY, src } = session
  const pct = (r) => ({
    left: `${(r.x / canvasW) * 100}%`,
    top: `${(r.y / canvasH) * 100}%`,
    width: `${(r.width / canvasW) * 100}%`,
    height: `${(r.height / canvasH) * 100}%`,
  })
  const flip = flipX || flipY ? `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` : undefined
  // The photo inside the frame, positioned relative to the frame.
  const inner = {
    left: `${((photo.x - frame.x) / frame.width) * 100}%`,
    top: `${((photo.y - frame.y) / frame.height) * 100}%`,
    width: `${(photo.width / frame.width) * 100}%`,
    height: `${(photo.height / frame.height) * 100}%`,
    transform: flip,
  }

  return (
    <div
      {...CROP_UI_ATTR}
      className={`ipc-root ${dragging ? `is-dragging is-dragging--${dragging}` : ''}`}
      // Clicks on the crop must not reach the stage (it would deselect / select the page).
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        '--ipc-k': 1 / (cssScale || 1),
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: `${(pivot.x / canvasW) * 100}% ${(pivot.y / canvasH) * 100}%`,
      }}
    >
      <img className="ipc-photo-ghost" src={src} alt="" draggable={false} style={{ ...pct(photo), transform: flip }} />
      <div
        ref={photoRef}
        className="ipc-photo-box"
        style={pct(photo)}
        onPointerDown={(e) => beginDrag(e, 'pan')}
        aria-hidden
      >
        {PHOTO_CORNERS.map((corner) => (
          <span
            key={corner}
            className={`ipc-photo-handle ipc-photo-handle--${corner}`}
            onPointerDown={(e) => beginDrag(e, 'photo', corner)}
            title="Drag to resize the photo"
          />
        ))}
      </div>
      <div
        ref={frameRef}
        className="ipc-frame"
        style={pct(frame)}
        onPointerDown={(e) => beginDrag(e, 'pan')}
        role="group"
        aria-label="Crop: drag to move the photo, drag the white corners to change the frame"
      >
        <span className="ipc-frame-window">
          <img src={src} alt="" draggable={false} style={inner} />
        </span>
        <span className="ipc-frame-grid" aria-hidden />
        {FRAME_HANDLES.map((handle) => (
          <span
            key={handle}
            className={`ipc-frame-handle ipc-frame-handle--${handle}`}
            onPointerDown={(e) => beginDrag(e, 'frame', handle)}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}
