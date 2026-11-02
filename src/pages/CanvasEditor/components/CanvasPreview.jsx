import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { CanvasPageRender } from '../CanvasExportFrame'
import { useCanvasDialogFocus } from '../canvasDialogFocus'

const CHROME_TOP = 64
const CHROME_BOTTOM = 76
const SIDE_GUTTER = 48

function fitScale(page, viewport) {
  const w = page?.width || 1080
  const h = page?.height || 1080
  const availW = Math.max(120, viewport.width - SIDE_GUTTER * 2)
  const availH = Math.max(120, viewport.height - CHROME_TOP - CHROME_BOTTOM)
  return Math.min(availW / w, availH / h)
}

function readViewport() {
  return { width: window.innerWidth, height: window.innerHeight }
}

/**
 * Full-screen, read-only view of the design — exactly what export renders,
 * without selection, guides or the grid. Arrow keys / buttons change page.
 */
export default function CanvasPreview({ pages, startIndex = 0, title, onClose }) {
  const rootRef = useRef(null)
  const closeRef = useRef(null)
  const count = pages?.length || 0
  const [index, setIndex] = useState(() => Math.min(Math.max(0, startIndex), Math.max(0, count - 1)))
  const [viewport, setViewport] = useState(readViewport)

  useCanvasDialogFocus(rootRef, { onEscape: onClose, initialFocusRef: closeRef })

  useEffect(() => {
    const onResize = () => setViewport(readViewport())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        setIndex((i) => Math.min(count - 1, i + 1))
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      } else if (event.key === 'Home') {
        event.preventDefault()
        setIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        setIndex(count - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  if (!count) return null
  const page = pages[Math.min(index, count - 1)]
  const scale = fitScale(page, viewport)
  const w = (page.width || 1080) * scale
  const h = (page.height || 1080) * scale

  return createPortal(
    <div
      ref={rootRef}
      className="canva-preview"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${title || 'design'}`}
    >
      <div className="canva-preview-top">
        <span className="canva-preview-title" title={title}>{title || 'Untitled Design'}</span>
        <span className="canva-preview-hint">
          {count > 1 ? 'Esc to close · ← → to change page' : 'Esc to close'}
        </span>
        <button ref={closeRef} type="button" className="canva-preview-close" onClick={onClose}>
          <FiX aria-hidden />
          <span>Close preview</span>
        </button>
      </div>

      <div className="canva-preview-stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="canva-preview-page" style={{ width: w, height: h }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <CanvasPageRender page={page} />
          </div>
        </div>
      </div>

      {count > 1 ? (
        <div className="canva-preview-nav">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="Previous page"
          >
            <FiChevronLeft aria-hidden />
          </button>
          <span aria-live="polite">
            Page {index + 1} of {count}
          </span>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(count - 1, i + 1))}
            disabled={index === count - 1}
            aria-label="Next page"
          >
            <FiChevronRight aria-hidden />
          </button>
        </div>
      ) : null}
    </div>,
    document.body
  )
}
