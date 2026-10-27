import { useState } from 'react'
import { MdWarning, MdRestore } from 'react-icons/md'
import { SAVE_ERROR } from '../canvasSaveErrors'
import '../../../components/ui/ConfirmDialog/ConfirmDialog.css'

function formatSavedAt(savedAt) {
  if (!savedAt) return ''
  try {
    return new Date(savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}

/**
 * Save problems the editor can't resolve on its own, plus the offer to restore a local copy.
 * kind: 'draft' | SAVE_ERROR.CONFLICT | SAVE_ERROR.AUTH | SAVE_ERROR.NOT_FOUND | null
 */
export default function CanvasRecoveryDialog({
  kind,
  draftSavedAt,
  onLoadLatest,
  onKeepMine,
  onRetry,
  onLeave,
  onRestoreDraft,
  onDiscardDraft,
  onClose,
}) {
  const [busy, setBusy] = useState(false)
  if (!kind) return null

  const run = (action) => async () => {
    setBusy(true)
    try {
      await action?.()
    } finally {
      setBusy(false)
    }
  }

  let title
  let message
  let actions
  let danger = true
  // Only the draft offer can be dismissed by clicking outside; the rest need a decision.
  let dismissable = false

  if (kind === 'draft') {
    const when = formatSavedAt(draftSavedAt)
    danger = false
    dismissable = true
    title = 'Restore unsaved changes?'
    message = `This device has changes to this design${when ? ` from ${when}` : ''} that never reached the server.`
    actions = (
      <>
        <button type="button" className="btn-secondary" onClick={onDiscardDraft} disabled={busy}>
          Discard them
        </button>
        <button type="button" className="btn-primary" onClick={onRestoreDraft} disabled={busy} autoFocus>
          Restore
        </button>
      </>
    )
  } else if (kind === SAVE_ERROR.CONFLICT) {
    title = 'This design changed somewhere else'
    message =
      'Someone (or another tab) saved this design after you opened it, so your latest changes were not saved. ' +
      'Load their version and lose your recent changes, or keep yours and replace theirs.'
    actions = (
      <>
        <button type="button" className="btn-secondary" onClick={run(onLoadLatest)} disabled={busy}>
          Load latest
        </button>
        <button type="button" className="btn-danger" onClick={run(onKeepMine)} disabled={busy} autoFocus>
          {busy ? 'Saving…' : 'Keep mine'}
        </button>
      </>
    )
  } else if (kind === SAVE_ERROR.AUTH) {
    title = 'Your session expired'
    message =
      'Changes are not being saved. Sign in again in another tab, then try again. ' +
      'Until then your changes are kept on this device.'
    actions = (
      <>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
          Keep editing
        </button>
        <button type="button" className="btn-primary" onClick={run(onRetry)} disabled={busy} autoFocus>
          {busy ? 'Saving…' : 'Try again'}
        </button>
      </>
    )
  } else if (kind === SAVE_ERROR.NOT_FOUND) {
    title = 'This design is no longer available'
    message = 'It was deleted, or you no longer have access to it. Changes can’t be saved.'
    actions = (
      <button type="button" className="btn-primary" onClick={onLeave} autoFocus>
        Go back
      </button>
    )
  } else {
    return null
  }

  const Icon = kind === 'draft' ? MdRestore : MdWarning

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={dismissable && !busy ? onClose : undefined}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="canvas-recovery-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog-icon-wrap${danger ? ' confirm-dialog-icon-wrap--danger' : ''}`}>
          <Icon
            className={`confirm-dialog-icon${danger ? ' confirm-dialog-icon--danger' : ''}`}
            aria-hidden="true"
          />
        </div>
        <h3 id="canvas-recovery-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">{actions}</div>
      </div>
    </div>
  )
}
