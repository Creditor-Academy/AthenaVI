import { useEffect, useRef, useState } from 'react'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiCloudOff,
  FiCommand,
  FiCopy,
  FiDownload,
  FiEdit3,
  FiGrid,
  FiHelpCircle,
  FiLoader,
  FiMaximize,
  FiPlay,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiSidebar,
  FiSliders,
} from 'react-icons/fi'

const SAVE_BADGE_BY_STATE = {
  saving: { icon: FiLoader, label: 'Saving…', className: 'canva-header-save-badge--saving' },
  loading: { icon: FiLoader, label: 'Loading…', className: 'canva-header-save-badge--saving' },
  saved: { icon: FiCheck, label: 'Saved', className: '' },
  retrying: { icon: FiCloudOff, label: 'Not saved, retrying…', className: 'canva-header-save-badge--error' },
  error: { icon: FiAlertCircle, label: 'Not saved', className: 'canva-header-save-badge--error' },
  conflict: { icon: FiAlertCircle, label: 'Out of sync', className: 'canva-header-save-badge--error' },
}

/** States where clicking the badge does something (retry, or reopen the decision dialog). */
const ACTIONABLE_SAVE_STATES = new Set(['retrying', 'error', 'conflict'])

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || '')
const MOD = IS_MAC ? '⌘' : 'Ctrl'

/** Dropdown with roving focus: ↑/↓ move, Home/End jump, Esc closes back to the trigger. */
function HeaderMenu({ label, icon: Icon, items, heading }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return undefined
    menuRef.current?.querySelector('[role^="menuitem"]:not(:disabled)')?.focus()
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const onMenuKeyDown = (e) => {
    const entries = [...(menuRef.current?.querySelectorAll('[role^="menuitem"]:not(:disabled)') || [])]
    const at = entries.indexOf(document.activeElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      entries[(at + 1) % entries.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      entries[(at - 1 + entries.length) % entries.length]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      entries[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      entries[entries.length - 1]?.focus()
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div className="canva-header-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`canva-header-menu-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        {Icon ? <Icon aria-hidden /> : null}
        <span>{label}</span>
        <FiChevronDown className="canva-header-menu-caret" aria-hidden />
      </button>

      {open && (
        <div ref={menuRef} className="canva-header-menu-list" role="menu" aria-label={label} onKeyDown={onMenuKeyDown}>
          {heading ? <div className="canva-header-menu-heading">{heading}</div> : null}
          {items.map((item, i) => {
            if (!item) return null
            if (item.divider) return <div key={`d${i}`} className="canva-header-menu-divider" role="separator" />
            const ItemIcon = item.icon
            const checkable = typeof item.checked === 'boolean'
            return (
              <button
                key={item.id}
                type="button"
                role={checkable ? 'menuitemcheckbox' : 'menuitem'}
                aria-checked={checkable ? item.checked : undefined}
                className="canva-header-menu-item"
                disabled={item.disabled}
                title={item.hint}
                onClick={() => {
                  close(!item.opensDialog)
                  item.onSelect()
                }}
              >
                <span className="canva-header-menu-icon" aria-hidden>
                  {checkable ? (item.checked ? <FiCheck /> : null) : ItemIcon ? <ItemIcon /> : null}
                </span>
                <span className="canva-header-menu-label">{item.label}</span>
                {item.shortcut ? <kbd className="canva-header-menu-kbd">{item.shortcut}</kbd> : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CanvasHeader({
  docTitle,
  setDocTitle,
  onBack,
  undo,
  redo,
  canUndo,
  canRedo,
  onOpenSizeModal,
  onOpenExportModal,
  activeCanvas,
  pageCount = 1,
  saveState = null,
  saveMessage = '',
  onSaveBadgeClick = null,
  inspectorOpen = false,
  onToggleInspector = null,
  onOpenShortcuts = null,
  showGrid = false,
  onToggleGrid = null,
  onPreview = null,
  onSaveNow = null,
  onMakeCopy = null,
  copying = false,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(docTitle)
  const badge = (saveState && SAVE_BADGE_BY_STATE[saveState]) || SAVE_BADGE_BY_STATE.saved
  const BadgeIcon = badge.icon
  const badgeText = saveMessage || badge.label
  const width = activeCanvas?.width || 1200
  const height = activeCanvas?.height || 800
  const sizeLabel = `${width} × ${height} px`
  const pagesLabel = `${pageCount} page${pageCount === 1 ? '' : 's'}`

  const startRename = () => {
    setDraftTitle(docTitle || '')
    setIsEditingTitle(true)
  }
  // Empty names fall back to the previous one; Escape abandons the edit.
  const commitRename = () => {
    const next = draftTitle.trim()
    if (next && next !== docTitle) setDocTitle(next)
    setIsEditingTitle(false)
  }

  const fileItems = [
    { id: 'rename', label: 'Rename', icon: FiEdit3, onSelect: startRename, opensDialog: true },
    { id: 'resize', label: 'Resize design…', icon: FiMaximize, onSelect: onOpenSizeModal, opensDialog: true },
    onMakeCopy && {
      id: 'copy',
      label: copying ? 'Making a copy…' : 'Make a copy',
      icon: FiCopy,
      onSelect: onMakeCopy,
      disabled: copying,
      hint: 'Saves a copy of this design in the same folder',
    },
    onSaveNow && { id: 'save', label: 'Save now', icon: FiSave, shortcut: `${MOD}+S`, onSelect: onSaveNow },
    { divider: true },
    onToggleGrid && { id: 'grid', label: 'Show grid', checked: showGrid, onSelect: onToggleGrid },
    onToggleInspector && { id: 'inspector', label: 'Show inspector', checked: inspectorOpen, onSelect: onToggleInspector },
    { divider: true },
    onPreview && { id: 'preview', label: 'Preview', icon: FiPlay, onSelect: onPreview, opensDialog: true },
    { id: 'export', label: 'Download / export…', icon: FiDownload, onSelect: onOpenExportModal, opensDialog: true },
    onOpenShortcuts && { id: 'shortcuts', label: 'Keyboard shortcuts', icon: FiCommand, shortcut: '?', onSelect: onOpenShortcuts, opensDialog: true },
    { divider: true },
    { id: 'back', label: 'Back to workspace', icon: FiArrowLeft, onSelect: onBack, opensDialog: true },
  ]

  return (
    <header className="canva-header">
      {/* Left: navigation, file actions, history, save state */}
      <div className="canva-header-left">
        <button
          type="button"
          className="canva-header-back-btn"
          onClick={onBack}
          title="Back to workspace"
          aria-label="Back to workspace"
        >
          <FiArrowLeft />
        </button>

        <HeaderMenu
          label="File"
          items={fileItems}
          heading={
            <>
              <strong>{docTitle || 'Untitled Design'}</strong>
              <span>
                {sizeLabel} · {pagesLabel}
              </span>
            </>
          }
        />

        <div className="canva-header-divider" />

        <div className="canva-header-history-group" role="group" aria-label="History">
          <button
            type="button"
            className="canva-header-icon-btn"
            onClick={undo}
            disabled={!canUndo}
            title={`Undo (${MOD}+Z)`}
            aria-label="Undo"
          >
            <FiRotateCcw />
          </button>
          <button
            type="button"
            className="canva-header-icon-btn"
            onClick={redo}
            disabled={!canRedo}
            title={`Redo (${MOD}+Shift+Z)`}
            aria-label="Redo"
          >
            <FiRotateCw />
          </button>
        </div>

        {onSaveBadgeClick && ACTIONABLE_SAVE_STATES.has(saveState) ? (
          <button
            type="button"
            className={`canva-header-save-badge canva-header-save-badge--action ${badge.className}`.trim()}
            onClick={onSaveBadgeClick}
            title={saveMessage ? `${saveMessage} Click to try again.` : 'Click to try again.'}
            aria-live="polite"
          >
            <BadgeIcon className="canva-header-check-icon" />
            <span>{badgeText}</span>
          </button>
        ) : saveState ? (
          <div
            className={`canva-header-save-badge ${badge.className}`.trim()}
            title={saveMessage || (saveState === 'saved' ? 'All changes saved' : undefined)}
            aria-live="polite"
          >
            <BadgeIcon className="canva-header-check-icon" />
            <span>{badgeText}</span>
          </div>
        ) : null}
      </div>

      {/* Center: design name + format */}
      <div className="canva-header-center">
        {isEditingTitle ? (
          <input
            type="text"
            className="canva-header-title-input"
            value={draftTitle}
            autoFocus
            aria-label="Design name"
            maxLength={120}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                e.stopPropagation()
                setIsEditingTitle(false)
              }
            }}
          />
        ) : (
          <button type="button" className="canva-header-title-btn" onClick={startRename} title="Rename design">
            <span className="canva-header-title-text">{docTitle || 'Untitled Design'}</span>
            <FiEdit3 className="canva-header-title-icon" aria-hidden />
          </button>
        )}
        <button
          type="button"
          className="canva-header-meta-btn"
          onClick={onOpenSizeModal}
          title="Resize design"
        >
          {sizeLabel} · {pagesLabel}
        </button>
      </div>

      {/* Right: view + output */}
      <div className="canva-header-right">
        {onToggleInspector && (
          <button
            type="button"
            className={`canva-header-tool-btn${inspectorOpen ? ' is-active' : ''}`}
            onClick={onToggleInspector}
            aria-pressed={inspectorOpen}
            title={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
          >
            {inspectorOpen ? <FiSidebar aria-hidden /> : <FiSliders aria-hidden />}
            <span className="canva-header-btn-label">Inspector</span>
          </button>
        )}

        {onOpenShortcuts && (
          <button
            type="button"
            className="canva-header-tool-btn canva-header-tool-btn--icon"
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <FiHelpCircle aria-hidden />
          </button>
        )}

        <div className="canva-header-divider" />

        {onPreview && (
          <button type="button" className="canva-header-secondary-btn" onClick={onPreview} title="Preview full screen">
            <FiPlay aria-hidden />
            <span className="canva-header-btn-label">Preview</span>
          </button>
        )}

        <button type="button" className="canva-header-primary-btn" onClick={onOpenExportModal} title="Download as PNG, JPG, WebP or PDF">
          <FiDownload aria-hidden />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}
