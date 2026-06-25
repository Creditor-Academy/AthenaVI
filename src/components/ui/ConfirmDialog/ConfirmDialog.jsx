import { MdWarning } from 'react-icons/md'
import './ConfirmDialog.css'

const ConfirmDialog = ({ dialog, onCancel }) => {
  if (!dialog) return null

  const {
    message,
    onConfirm,
    title = 'Please confirm',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
  } = dialog

  const isDanger = variant === 'danger'

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`confirm-dialog-icon-wrap${isDanger ? ' confirm-dialog-icon-wrap--danger' : ''}`}
        >
          <MdWarning
            className={`confirm-dialog-icon${isDanger ? ' confirm-dialog-icon--danger' : ''}`}
            aria-hidden="true"
          />
        </div>
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={async () => {
              onCancel()
              if (onConfirm) await onConfirm()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
