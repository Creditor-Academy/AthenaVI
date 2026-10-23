import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  MdChevronRight,
  MdAlignHorizontalLeft,
  MdAlignHorizontalCenter,
  MdAlignHorizontalRight,
  MdAlignVerticalTop,
  MdAlignVerticalCenter,
  MdAlignVerticalBottom,
} from 'react-icons/md'

const ALIGN_ITEMS = [
  { id: 'left', label: 'Left', icon: MdAlignHorizontalLeft },
  { id: 'center', label: 'Center', icon: MdAlignHorizontalCenter },
  { id: 'right', label: 'Right', icon: MdAlignHorizontalRight },
  { id: 'top', label: 'Top', icon: MdAlignVerticalTop },
  { id: 'middle', label: 'Middle', icon: MdAlignVerticalCenter },
  { id: 'bottom', label: 'Bottom', icon: MdAlignVerticalBottom },
]

function MenuItem({ label, icon: Icon, shortcut, disabled, danger, onClick }) {
  return (
    <button
      type="button"
      className={`ppt-el-ctx-item${danger ? ' is-danger' : ''}`}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) onClick?.()
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {Icon ? <Icon size={14} style={{ opacity: 0.85 }} /> : null}
        {label}
      </span>
      {shortcut ? <kbd>{shortcut}</kbd> : null}
    </button>
  )
}

function MenuSep() {
  return <div className="ppt-el-ctx-sep" role="separator" />
}

function AlignSubmenu({ disabled, onAlign }) {
  return (
    <div className={`ppt-el-ctx-sub${disabled ? ' is-disabled' : ''}`}>
      <button
        type="button"
        className="ppt-el-ctx-item ppt-el-ctx-sub-trigger"
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <span>Align</span>
        <MdChevronRight size={16} />
      </button>
      {!disabled ? (
        <div className="ppt-el-ctx-sub-panel" role="menu">
          {ALIGN_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              onClick={() => onAlign?.(item.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function LayerOrderSubmenu({ disabled, onBringForward, onSendBackward, onBringToFront, onSendToBack }) {
  if (!onBringForward && !onSendBackward && !onBringToFront && !onSendToBack) return null
  return (
    <div className={`ppt-el-ctx-sub${disabled ? ' is-disabled' : ''}`}>
      <button
        type="button"
        className="ppt-el-ctx-item ppt-el-ctx-sub-trigger"
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <span>Layer Order</span>
        <MdChevronRight size={16} />
      </button>
      {!disabled ? (
        <div className="ppt-el-ctx-sub-panel" role="menu">
          {onBringForward ? <MenuItem label="Bring Forward" shortcut="Ctrl+]" onClick={onBringForward} /> : null}
          {onSendBackward ? <MenuItem label="Send Backward" shortcut="Ctrl+[" onClick={onSendBackward} /> : null}
          {onBringToFront ? <MenuItem label="Bring to Front" shortcut="Ctrl+Shift+]" onClick={onBringToFront} /> : null}
          {onSendToBack ? <MenuItem label="Send to Back" shortcut="Ctrl+Shift+[" onClick={onSendToBack} /> : null}
        </div>
      ) : null}
    </div>
  )
}

export default function PptElementContextMenu({
  x,
  y,
  canGroup = false,
  canUngroup = false,
  locked = false,
  canPaste = false,
  hasSelection = false,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onToggleLock,
  onAlign,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const pad = 8
    const rect = node.getBoundingClientRect()
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad)
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad)
    }
    node.style.left = `${left}px`
    node.style.top = `${top}px`
  }, [x, y])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={ref}
      className="ppt-el-ctx-menu"
      role="menu"
      style={{ left: x, top: y }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <MenuItem label="Cut" shortcut="Ctrl+X" disabled={!hasSelection} onClick={onCut} />
      <MenuItem label="Copy" shortcut="Ctrl+C" disabled={!hasSelection} onClick={onCopy} />
      <MenuItem label="Paste" shortcut="Ctrl+V" disabled={!canPaste} onClick={onPaste} />
      <MenuItem label="Duplicate" shortcut="Ctrl+D" disabled={!hasSelection} onClick={onDuplicate} />
      <MenuItem label="Delete" danger disabled={!hasSelection} onClick={onDelete} />
      {canGroup || canUngroup ? (
        <>
          <MenuSep />
          {canGroup ? (
            <MenuItem label="Group" shortcut="Ctrl+G" onClick={onGroup} />
          ) : null}
          {canUngroup ? (
            <MenuItem label="Ungroup" shortcut="Ctrl+Shift+G" onClick={onUngroup} />
          ) : null}
        </>
      ) : null}
      <MenuSep />
      <MenuItem
        label={locked ? 'Unlock' : 'Lock'}
        shortcut="Ctrl+L"
        disabled={!hasSelection}
        onClick={onToggleLock}
      />
      <LayerOrderSubmenu
        disabled={!hasSelection}
        onBringForward={onBringForward}
        onSendBackward={onSendBackward}
        onBringToFront={onBringToFront}
        onSendToBack={onSendToBack}
      />
      <AlignSubmenu disabled={!hasSelection} onAlign={onAlign} />
    </div>,
    document.body
  )
}
