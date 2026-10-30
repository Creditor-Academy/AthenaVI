import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MdWarning, MdEdit } from 'react-icons/md'
import { ToastContainer } from '../Toast/Toast'
import { registerDialogHost } from '../../../utils/appDialog'
import '../ConfirmDialog/ConfirmDialog.css'
import './AppDialogHost.css'

/** Longer messages stay up longer; errors linger a little more than the rest. */
function toastDuration(message, type) {
  const base = type === 'error' ? 4500 : 3000
  return Math.min(9000, base + String(message).length * 35)
}

function DialogView({ dialog, onResolve }) {
  const [value, setValue] = useState(dialog.defaultValue ?? '')
  const inputRef = useRef(null)
  const isPrompt = dialog.kind === 'prompt'
  const isDanger = dialog.variant === 'danger'

  useEffect(() => {
    if (isPrompt) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isPrompt])

  const cancel = useCallback(() => onResolve(isPrompt ? null : false), [onResolve, isPrompt])
  const submit = () => onResolve(isPrompt ? value : true)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cancel()
      }
    }
    // Capture so the dialog wins over editor shortcuts listening on window.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cancel])

  const Icon = isPrompt ? MdEdit : MdWarning

  return createPortal(
    <div className="confirm-dialog-overlay app-dialog-overlay" onMouseDown={cancel} role="presentation">
      <div
        className="confirm-dialog"
        role={isPrompt ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-message"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog-icon-wrap${isDanger ? ' confirm-dialog-icon-wrap--danger' : ''}`}>
          <Icon
            className={`confirm-dialog-icon${isDanger ? ' confirm-dialog-icon--danger' : ''}`}
            aria-hidden="true"
          />
        </div>
        <h3 id="app-dialog-title" className="confirm-dialog-title">
          {dialog.title || (isPrompt ? 'Enter a value' : 'Please confirm')}
        </h3>
        <p id="app-dialog-message" className="confirm-dialog-message">
          {dialog.message}
        </p>
        {isPrompt && (
          <input
            ref={inputRef}
            className="app-dialog-input"
            type="text"
            value={value}
            maxLength={dialog.maxLength}
            placeholder={dialog.placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
          />
        )}
        <div className="confirm-dialog-actions">
          <button type="button" className="app-dialog-btn app-dialog-btn--secondary" onClick={cancel}>
            {dialog.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`app-dialog-btn ${isDanger ? 'app-dialog-btn--danger' : 'app-dialog-btn--primary'}`}
            onClick={submit}
            autoFocus={!isPrompt}
          >
            {dialog.confirmLabel || (isPrompt ? 'Save' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function AppDialogHost() {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const queueRef = useRef([])
  const activeRef = useRef(null)

  const showNext = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = queueRef.current.shift() || null
    setDialog(activeRef.current)
  }, [])

  const enqueue = useCallback(
    (entry) =>
      new Promise((resolve) => {
        queueRef.current.push({ ...entry, resolve })
        showNext()
      }),
    [showNext]
  )

  const resolveActive = useCallback(
    (result) => {
      const current = activeRef.current
      activeRef.current = null
      setDialog(null)
      current?.resolve(result)
      // Let the closing dialog unmount before the next one (e.g. confirm, then prompt) opens.
      setTimeout(showNext, 0)
    },
    [showNext]
  )

  useEffect(
    () =>
      registerDialogHost({
        notify: (message, type) => {
          const id = `${Date.now()}-${Math.random()}`
          setToasts((prev) => [
            ...prev.slice(-3),
            { id, message, type, duration: toastDuration(message, type) },
          ])
        },
        confirm: (message, options) => enqueue({ kind: 'confirm', message, ...options }),
        prompt: (message, defaultValue, options) =>
          enqueue({ kind: 'prompt', message, defaultValue, ...options }),
      }),
    [enqueue]
  )

  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {dialog && <DialogView key={`${dialog.kind}:${dialog.message}`} dialog={dialog} onResolve={resolveActive} />}
    </>
  )
}
