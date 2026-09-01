import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import './pptPanelUi.css'

export default function PptConfirmModal({
  open = false,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onClose,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus?.()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="ppt-editor-modal ppt-editor-modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ppt-confirm-title"
        aria-describedby={message ? 'ppt-confirm-message' : undefined}
      >
        <header className="ppt-editor-modal-head">
          <div className="ppt-editor-modal-head-text">
            <h3 id="ppt-confirm-title" className="ppt-editor-modal-title">
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="ppt-editor-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>
        {message ? (
          <p id="ppt-confirm-message" className="ppt-editor-modal-lead">
            {message}
          </p>
        ) : null}
        <footer className="ppt-editor-modal-foot">
          <button
            ref={cancelRef}
            type="button"
            className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`ppt-editor-modal-btn ${
              danger ? 'ppt-editor-modal-btn--danger' : 'ppt-editor-modal-btn--primary'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
