import { MdWarning } from 'react-icons/md'
import '../../../components/ui/ConfirmDialog/ConfirmDialog.css'

/**
 * Shown when leaving the canvas editor with changes the autosave hasn't stored yet.
 * status: 'ask' | 'saving' | 'failed'
 */
export default function CanvasLeaveDialog({ status, canSave, onSave, onDiscard, onCancel }) {
  if (!status) return null

  const saving = status === 'saving'
  const failed = status === 'failed'

  const title = failed ? "Couldn't save your changes" : 'Save changes before leaving?'
  const message = !canSave
    ? "This design isn't saved to a workspace folder, so your changes will be lost if you leave."
    : failed
      ? 'Check your connection and try again, or leave without saving your latest changes.'
      : "Your latest changes haven't been saved yet."

  return (
    <div className="confirm-dialog-overlay" onClick={saving ? undefined : onCancel} role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-leave-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog-icon-wrap${failed ? ' confirm-dialog-icon-wrap--danger' : ''}`}>
          <MdWarning
            className={`confirm-dialog-icon${failed ? ' confirm-dialog-icon--danger' : ''}`}
            aria-hidden="true"
          />
        </div>
        <h3 id="canvas-leave-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onDiscard} disabled={saving}>
            {canSave ? "Don't save" : 'Leave'}
          </button>
          {canSave && (
            <button type="button" className="btn-primary" onClick={onSave} disabled={saving} autoFocus>
              {saving ? 'Saving…' : failed ? 'Try again' : 'Save & exit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
