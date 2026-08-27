import { useEffect, useRef, useState } from 'react'
import {
  FiMenu,
  FiSearch,
  FiEdit2,
  FiFolder,
  FiCopy,
  FiBellOff,
  FiFileText,
  FiUpload,
  FiShare2,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiSliders,
  FiLogOut,
} from 'react-icons/fi'
import './insertPanels.css'

/**
 * Gamma-style upper-left hamburger file menu.
 */
export default function EditorFileMenu({
  title = 'Untitled Presentation',
  privacy = 'Private',
  canUndo = false,
  canRedo = false,
  onRename,
  onDuplicate,
  onExport,
  onSharePreview,
  onUndo,
  onRedo,
  onExit,
  onFindReplace,
  viewOnly = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (fn) => {
    setOpen(false)
    fn?.()
  }

  const items = [
    { id: 'rename', label: 'Rename presentation', Icon: FiEdit2, action: onRename },
    { id: 'move', label: 'Move to folder', Icon: FiFolder, action: null, disabled: true },
    { id: 'duplicate', label: 'Duplicate', Icon: FiCopy, action: onDuplicate },
    { id: 'share-preview', label: 'Share preview', Icon: FiShare2, action: onSharePreview, hidden: viewOnly || !onSharePreview },
    { id: 'unsub', label: 'Unsubscribe', Icon: FiBellOff, action: null, disabled: true },
    { id: 'template', label: 'Convert to template', Icon: FiFileText, action: null, disabled: true },
    { id: 'export', label: 'Export presentation', Icon: FiUpload, action: onExport },
  ]

  const editItems = [
    {
      id: 'undo',
      label: 'Undo',
      Icon: FiCornerUpLeft,
      shortcut: 'Ctrl+Z',
      action: onUndo,
      disabled: !canUndo,
    },
    {
      id: 'redo',
      label: 'Redo',
      Icon: FiCornerUpRight,
      shortcut: 'Ctrl+Y',
      action: onRedo,
      disabled: !canRedo,
    },
    {
      id: 'find',
      label: 'Find & replace',
      Icon: FiSliders,
      shortcut: 'Ctrl+F',
      action: onFindReplace,
      disabled: !onFindReplace,
    },
  ]

  return (
    <div className="ppt-file-menu" ref={rootRef}>
      <button
        type="button"
        className="ppt-file-menu-trigger"
        aria-label="Presentation menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FiMenu size={18} />
      </button>
      <div className="ppt-file-menu-meta">
        <div className="ppt-file-menu-title">{title}</div>
        <div className="ppt-file-menu-privacy">{privacy}</div>
      </div>

      {open && (
        <div className="ppt-file-menu-dropdown" role="menu">
          <div className="ppt-file-menu-search">
            <FiSearch size={14} />
            <input
              type="search"
              placeholder="Search presentations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </div>

          <div className="ppt-file-menu-section">
            {items.filter((item) => !item.hidden).map((item) => {
              const Icon = item.Icon
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="ppt-file-menu-item"
                  disabled={item.disabled || !item.action}
                  onClick={() => run(item.action)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="ppt-file-menu-section">
            {editItems.map((item) => {
              const Icon = item.Icon
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="ppt-file-menu-item"
                  disabled={item.disabled}
                  onClick={() => run(item.action)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.shortcut && <kbd className="ppt-file-menu-kbd">{item.shortcut}</kbd>}
                </button>
              )
            })}
          </div>

          <div className="ppt-file-menu-section">
            <button
              type="button"
              role="menuitem"
              className="ppt-file-menu-item"
              onClick={() => run(onExit)}
            >
              <FiLogOut size={16} />
              <span>Exit editor</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
