import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi'
import { BsStars } from 'react-icons/bs'
import { PPT_PROGRESS_STATUSES, resolveSlideProgressStatus, progressStatusLabel, progressStatusDotClass } from '../../../constants/pptSlideEditorOptions'
import MinimapSlidePreview from './MinimapSlidePreview'
import { resolveSlideStageBackground, DEFAULT_SLIDE_BG } from '../../../utils/presentationHelpers'

function placeMenu(anchor, cursor) {
  const width = 212
  const height = 280
  let left = cursor?.x ?? (anchor ? anchor.right - 8 : 12)
  let top = cursor?.y ?? (anchor ? anchor.bottom + 6 : 12)
  if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8)
  if (top + height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - height - 8)
  return { top, left }
}

export default function MinimapSlideCard({
  slide,
  index,
  total,
  selected = false,
  viewOnly = false,
  canDelete = true,
  atDeckCap = false,
  disabled = false,
  menuOpen = false,
  dropEdge = null,
  dragging = false,
  themeVisual,
  themeId,
  aspectRatio,
  layoutSchemaMap,
  onSelect,
  onOpenMenu,
  onCloseMenu,
  onDuplicate,
  onDelete,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onEditAi,
  onChangeStatus,
  onDragStart,
  onDragEnd,
  itemRef,
}) {
  const moreRef = useRef(null)
  const cursorRef = useRef(null)
  const [pop, setPop] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!menuOpen) return
    setPop(placeMenu(moreRef.current?.getBoundingClientRect?.() || null, cursorRef.current))
    cursorRef.current = null
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDoc = (e) => {
      if (moreRef.current?.contains(e.target)) return
      if (e.target.closest?.('.aig-minimap-slide-menu')) return
      onCloseMenu?.()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseMenu?.()
    }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen, onCloseMenu])

  const openMenu = (e, cursor) => {
    e.preventDefault()
    e.stopPropagation()
    if (viewOnly || disabled) return
    const rect = moreRef.current?.getBoundingClientRect?.()
    cursorRef.current = cursor || null
    setPop(placeMenu(rect, cursor))
    onOpenMenu?.(slide.id)
  }

  const run = (fn) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    onCloseMenu?.()
    fn?.()
  }

  const progressStatus = resolveSlideProgressStatus(slide)
  const statusKey = progressStatusDotClass(progressStatus)
  // Editors always see the chip; reviewers see it when the API includes progressStatus.
  const showProgress =
    !viewOnly || (slide && Object.prototype.hasOwnProperty.call(slide, 'progressStatus'))
  const fallbackBg = themeVisual?.palette?.bg || themeVisual?.background || DEFAULT_SLIDE_BG

  return (
    <div
      ref={itemRef}
      data-minimap-slide={slide.id}
      className={[
        'aig-minimap-item',
        selected ? 'active' : '',
        dragging ? 'is-dragging' : '',
        dropEdge === 'before' ? 'drop-before' : '',
        dropEdge === 'after' ? 'drop-after' : '',
        menuOpen ? 'is-menu-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={!viewOnly && !disabled}
      onClick={() => onSelect?.(slide.id)}
      onContextMenu={(e) => openMenu(e, { x: e.clientX, y: e.clientY })}
      onDragStart={(e) => {
        if (viewOnly || disabled || e.target.closest?.('.aig-minimap-more-btn')) {
          e.preventDefault()
          return
        }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', slide.id)
        e.dataTransfer.setData('application/x-athena-slide', slide.id)
        onCloseMenu?.()
        onDragStart?.(slide.id, e)
      }}
      onDragEnd={() => onDragEnd?.()}
    >
      <span className="aig-minimap-num">{index + 1}</span>
      {showProgress && (
        <span
          className={`ppt-status-dot ppt-status-dot--sm ppt-status-dot--${statusKey}`}
          title={progressStatusLabel(progressStatus)}
          aria-hidden
        />
      )}
      <div
        className="aig-minimap-thumb"
        style={resolveSlideStageBackground(slide, fallbackBg)}
      >
        <MinimapSlidePreview
          slide={slide}
          themeVisual={themeVisual}
          themeId={themeId}
          aspectRatio={aspectRatio}
          fallbackBg={fallbackBg}
          layoutSchemaMap={layoutSchemaMap}
        />
        {!viewOnly && (
          <button
            ref={moreRef}
            type="button"
            className="aig-minimap-more-btn"
            title="Slide options"
            aria-label={`Slide ${index + 1} options`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            disabled={disabled}
            onClick={(e) => openMenu(e, null)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
          >
            <FiMoreHorizontal size={14} />
          </button>
        )}
      </div>

      {menuOpen &&
        createPortal(
          <div
            className="aig-minimap-slide-menu"
            style={{ top: pop.top, left: pop.left }}
            role="menu"
            aria-label={`Slide ${index + 1} options`}
          >
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item"
              disabled={atDeckCap || disabled}
              onClick={run(onDuplicate)}
            >
              <FiCopy size={15} />
              Duplicate
            </button>
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item"
              disabled={atDeckCap || disabled}
              onClick={run(onAddAfter)}
            >
              <FiPlus size={15} />
              Add slide after
            </button>
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item"
              disabled={disabled}
              onClick={run(onEditAi)}
            >
              <BsStars size={15} />
              Edit with AI
            </button>
            <div className="aig-minimap-slide-menu-sep" />
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item"
              disabled={index === 0 || disabled}
              onClick={run(onMoveUp)}
            >
              <FiChevronUp size={15} />
              Move up
            </button>
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item"
              disabled={index >= total - 1 || disabled}
              onClick={run(onMoveDown)}
            >
              <FiChevronDown size={15} />
              Move down
            </button>
            <div className="aig-minimap-slide-menu-sep" />
            {!viewOnly && (
              <>
                <div className="aig-minimap-slide-menu-sep" />
                <div className="aig-minimap-menu-header" style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Status</div>
                {PPT_PROGRESS_STATUSES.map((opt) => (
                  <button
                    key={opt.id ?? 'none'}
                    type="button"
                    role="menuitem"
                    className={`aig-minimap-slide-menu-item ${progressStatus === opt.id ? 'is-active' : ''}`}
                    disabled={disabled}
                    onClick={run(() => onChangeStatus?.(slide.id, opt.id))}
                  >
                    <span className={`ppt-status-dot ppt-status-dot--sm ppt-status-dot--${opt.id || 'NONE'}`} />
                    {opt.label}
                  </button>
                ))}
              </>
            )}
            <div className="aig-minimap-slide-menu-sep" />
            <button
              type="button"
              role="menuitem"
              className="aig-minimap-slide-menu-item is-danger"
              disabled={!canDelete || disabled}
              onClick={run(onDelete)}
            >
              <FiTrash2 size={15} />
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}
