import { useMemo, useState } from 'react'
import './pptEditorExtras.css'

const BASE_COMMANDS = [
  { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
  { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
  { id: 'duplicate', label: 'Duplicate element', shortcut: 'Ctrl+D' },
  { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
  { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
  { id: 'group', label: 'Group selection', shortcut: 'Ctrl+G' },
  { id: 'ungroup', label: 'Ungroup', shortcut: 'Ctrl+Shift+G' },
  { id: 'lock', label: 'Lock / unlock element', shortcut: 'Ctrl+L' },
  { id: 'nudge', label: 'Nudge selection 1px', shortcut: 'Arrows' },
  { id: 'nudge-more', label: 'Nudge selection 10px', shortcut: 'Shift+Arrows' },
  { id: 'bring-forward', label: 'Bring forward', shortcut: ']' },
  { id: 'send-backward', label: 'Send backward', shortcut: '[' },
  { id: 'bring-front', label: 'Bring to front', shortcut: 'Ctrl+Shift+]' },
  { id: 'send-back', label: 'Send to back', shortcut: 'Ctrl+Shift+[' },
  { id: 'select-all', label: 'Select all', shortcut: 'Ctrl+A' },
  { id: 'present', label: 'Present', shortcut: 'Ctrl+Enter' },
  { id: 'share', label: 'Share presentation' },
  { id: 'export', label: 'Export presentation' },
  { id: 'smart-tidy', label: 'Smart tidy selection' },
  { id: 'smart-swap', label: 'Smart swap same-type blocks' },
  { id: 'speaker-notes', label: 'Toggle speaker notes' },
  { id: 'zoom-in', label: 'Zoom in', shortcut: 'Ctrl++' },
  { id: 'zoom-out', label: 'Zoom out', shortcut: 'Ctrl+-' },
  { id: 'zoom-fit', label: 'Fit to screen' },
]

export default function PptQuickMenu({ open, onClose, onCommand }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BASE_COMMANDS
    return BASE_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        (c.shortcut && c.shortcut.toLowerCase().includes(q))
    )
  }, [query])

  if (!open) return null

  return (
    <div className="ppt-quick-menu-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="ppt-quick-menu" role="dialog" aria-label="Quick menu">
        <input
          autoFocus
          placeholder="Type a command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose?.()
            if (e.key === 'Enter' && filtered[0]) {
              onCommand?.(filtered[0].id)
              onClose?.()
            }
          }}
        />
        {filtered.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            className="ppt-quick-menu-item"
            onClick={() => {
              onCommand?.(cmd.id)
              onClose?.()
            }}
          >
            {cmd.label}
            {cmd.shortcut && (
              <span style={{ float: 'right', color: '#94a3b8', fontSize: 12 }}>{cmd.shortcut}</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="ppt-slide-panel-hint" style={{ padding: 12 }}>
            No commands match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
