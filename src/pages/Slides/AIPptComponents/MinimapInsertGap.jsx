import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus } from 'react-icons/fi'
import { MdOutlineAnimation } from 'react-icons/md'
import SlideTransitionPicker from './insert/SlideTransitionPicker'

function placePopover(anchor) {
  const popW = 300
  const popH = 460
  const rect = anchor.getBoundingClientRect()
  let left = rect.right + 10
  let top = rect.top + rect.height / 2
  if (left + popW > window.innerWidth - 8) {
    left = Math.max(8, rect.left - popW - 10)
  }
  const half = popH / 2
  if (top - half < 8) top = 8 + half
  if (top + half > window.innerHeight - 8) top = window.innerHeight - 8 - half
  return { top, left }
}

export default function MinimapInsertGap({
  compact = false,
  disabled = false,
  addDisabled = false,
  showTransition = false,
  hasTransition = false,
  transitionValue = 'none',
  transitionOpen = false,
  onAdd,
  onToggleTransition,
  onPickTransition,
  onCloseTransition,
}) {
  const gapRef = useRef(null)
  const [pop, setPop] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!transitionOpen || !gapRef.current) return
    setPop(placePopover(gapRef.current))
  }, [transitionOpen])

  useEffect(() => {
    if (!transitionOpen) return undefined
    const reposition = () => {
      if (gapRef.current) setPop(placePopover(gapRef.current))
    }
    const onDoc = (e) => {
      if (gapRef.current?.contains(e.target)) return
      if (e.target.closest?.('.aig-minimap-transition-pop')) return
      onCloseTransition?.()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseTransition?.()
    }
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [transitionOpen, onCloseTransition])

  const className = [
    'aig-minimap-gap',
    compact ? 'aig-minimap-gap--compact' : '',
    transitionOpen ? 'is-open' : '',
    hasTransition ? 'has-transition' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={gapRef}
      className={className}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="aig-minimap-gap-line" aria-hidden />
      <div className="aig-minimap-gap-actions">
        <button
          type="button"
          className="aig-minimap-gap-btn"
          disabled={addDisabled}
          title="Add slide"
          aria-label="Add slide here"
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.()
          }}
        >
          <FiPlus size={compact ? 12 : 14} />
        </button>
        {showTransition && (
          <button
            type="button"
            className="aig-minimap-gap-btn aig-minimap-gap-btn--transition"
            disabled={disabled}
            title="Slide transition"
            aria-label="Set transition between slides"
            aria-expanded={transitionOpen}
            onClick={(e) => {
              e.stopPropagation()
              onToggleTransition?.()
            }}
          >
            <MdOutlineAnimation size={compact ? 13 : 15} />
          </button>
        )}
      </div>
      {transitionOpen &&
        showTransition &&
        createPortal(
          <div
            className="aig-minimap-transition-pop"
            style={{ top: pop.top, left: pop.left }}
            role="dialog"
            aria-label="Slide transition"
          >
            <p className="aig-minimap-transition-pop-title">Transition</p>
            <SlideTransitionPicker
              compact
              value={transitionValue}
              disabled={disabled}
              onChange={(id) => onPickTransition?.(id)}
            />
          </div>,
          document.body
        )}
    </div>
  )
}
