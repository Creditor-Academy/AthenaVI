import { useRef } from 'react'
import { FiX } from 'react-icons/fi'
import { useCanvasDialogFocus } from '../canvasDialogFocus'
import { CANVAS_SHORTCUTS } from '../canvasShortcuts'

/** Lists the shortcuts the editor keyboard handler already implements. */
export default function CanvasShortcutHelp({ onClose }) {
  const dialogRef = useRef(null)
  useCanvasDialogFocus(dialogRef, { onEscape: onClose })

  return (
    <div className="canvas-size-modal-backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="canvas-size-modal canvas-shortcut-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-shortcuts-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="canvas-size-modal-heading">
          <div>
            <span className="canvas-size-modal-eyebrow">Canvas Editor</span>
            <h2 id="canvas-shortcuts-title">Keyboard shortcuts</h2>
          </div>
          <button type="button" className="canvas-size-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>
        <ul className="canvas-shortcut-list">
          {CANVAS_SHORTCUTS.map((item) => (
            <li key={item.keys}>
              <kbd>{item.keys}</kbd>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
