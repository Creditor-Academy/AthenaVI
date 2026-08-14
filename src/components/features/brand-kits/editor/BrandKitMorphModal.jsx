import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MdAutoAwesome, MdClose, MdRefresh } from 'react-icons/md'

export function BrandKitGeneratingFrame({ label = 'Creating…' }) {
  return (
    <div className="bk-mockup-gen-frame" aria-live="polite">
      <div className="bk-mockup-gen-blobs" aria-hidden>
        <span className="bk-mockup-blob bk-mockup-blob--a" />
        <span className="bk-mockup-blob bk-mockup-blob--b" />
        <span className="bk-mockup-blob bk-mockup-blob--c" />
        <span className="bk-mockup-blob bk-mockup-blob--d" />
      </div>
      <div className="bk-mockup-gen-shimmer" aria-hidden />
      <div className="bk-mockup-gen-label">
        <MdAutoAwesome size={16} />
        <span>{label}</span>
      </div>
    </div>
  )
}

export function getElementRect(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export function applyFlipTransform(el, from, to) {
  if (!el || !from || !to || !to.width || !to.height) return
  const dx = from.left - to.left
  const dy = from.top - to.top
  const sx = from.width / to.width
  const sy = from.height / to.height
  el.style.transformOrigin = 'top left'
  el.style.transition = 'none'
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
}

/**
 * Morph modal used by Logos + Imagery mockups.
 * modal: { id, label, url, phase: 'loading'|'ready', anim: 'open'|'idle'|'closing', origin, dark?, loadingLabel? }
 */
export default function BrandKitMorphModal({
  modal,
  panelRef,
  onClose,
  onRetry,
  loadingLabel,
  emptyMessage = 'Generation finished, but no image was returned. Try again.',
  imageClassName = '',
  panelClassName = '',
}) {
  const localRef = useRef(null)
  const ref = panelRef || localRef

  useEffect(() => {
    if (!modal || modal.anim !== 'open') return undefined
    const panel = ref.current
    if (!panel) return undefined
    const origin = modal.origin

    if (origin && origin.width > 2) {
      const to = getElementRect(panel)
      applyFlipTransform(panel, origin, to)
      void panel.offsetWidth
      panel.style.transition =
        'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    } else {
      panel.style.opacity = '0'
      panel.style.transform = 'scale(0.94)'
      void panel.offsetWidth
      panel.style.transition = 'transform 0.32s ease, opacity 0.32s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    }

    return undefined
  }, [modal?.id, modal?.anim, modal?.origin, ref])

  useEffect(() => {
    if (!modal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && modal.anim !== 'closing') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modal, onClose])

  if (!modal || typeof document === 'undefined') return null

  const showLoading = modal.phase === 'loading' || (!modal.url && modal.phase !== 'ready')
  const label = loadingLabel || modal.loadingLabel || 'Creating…'

  return createPortal(
    <div
      className={`bk-mockup-morph-backdrop${modal.anim === 'closing' ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={modal.label}
      onClick={() => {
        if (modal.anim !== 'closing') onClose?.()
      }}
    >
      <button
        type="button"
        className="bk-mockup-morph-close"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation()
          onClose?.()
        }}
      >
        <MdClose size={20} />
      </button>
      <div
        className={`bk-mockup-morph-panel${modal.dark ? ' is-dark' : ''} ${panelClassName}`.trim()}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        {showLoading ? (
          <BrandKitGeneratingFrame label={label} />
        ) : modal.url ? (
          <div className={`bk-morph-media${modal.dark ? ' is-dark' : ''}`}>
            <img
              src={modal.url}
              alt={modal.label}
              className={`bk-mockup-morph-image ${imageClassName}`.trim()}
            />
          </div>
        ) : (
          <div className="bk-mockup-morph-empty">
            <p>{emptyMessage}</p>
            {onRetry ? (
              <button type="button" className="bk-extract-btn" onClick={onRetry}>
                <MdRefresh size={16} /> Retry
              </button>
            ) : null}
          </div>
        )}
        <p className="bk-mockup-morph-caption">{modal.label}</p>
      </div>
    </div>,
    document.body
  )
}

/** Run FLIP close toward targetRect (card); calls onDone when finished. */
export function runMorphClose(panel, targetRect, onDone) {
  if (!panel) {
    onDone?.()
    return
  }
  const from = getElementRect(panel)
  const to = targetRect
  if (from && to && to.width > 2) {
    panel.style.transformOrigin = 'top left'
    panel.style.transition =
      'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease'
    panel.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${Math.max(0.01, to.width / from.width)}, ${Math.max(0.01, to.height / from.height)})`
    panel.style.opacity = '0.25'
    const backdrop = panel.parentElement
    if (backdrop) {
      backdrop.style.transition = 'opacity 0.38s ease'
      backdrop.style.opacity = '0'
    }
    window.setTimeout(() => onDone?.(), 400)
    return
  }
  panel.style.transition = 'transform 0.28s ease, opacity 0.28s ease'
  panel.style.transform = 'scale(0.92)'
  panel.style.opacity = '0'
  const backdrop = panel.parentElement
  if (backdrop) {
    backdrop.style.transition = 'opacity 0.28s ease'
    backdrop.style.opacity = '0'
  }
  window.setTimeout(() => onDone?.(), 300)
}
