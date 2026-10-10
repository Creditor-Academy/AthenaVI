import { useEffect, useId, useRef, useState } from 'react'
import { PauseCircle, PlayCircle, Trash2, X, AlertTriangle } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import {
  PAUSE_REASON_MAX,
  isUserPaused,
  lifecycleBlockedReason,
  isDeleteConfirmed,
  mapLifecycleError,
  lifecycleSuccessMessage,
} from './userLifecycle'
import { formatShortDate } from './superadminUtils'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/SuperadminCreateUser.css'

function DeleteUserDialog({ user, onCancel, onConfirm, busy, error }) {
  const [typed, setTyped] = useState('')
  const inputRef = useRef(null)
  const titleId = useId()
  const confirmed = isDeleteConfirmed(user, typed)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  const submit = (e) => {
    e.preventDefault()
    if (confirmed && !busy) onConfirm(typed.trim())
  }

  return (
    <div className="cu-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel() }}>
      <div className="cu-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="cu-header">
          <div className="cu-header-icon cu-header-icon--danger" aria-hidden="true"><Trash2 size={18} /></div>
          <div className="cu-header-text">
            <h3 id={titleId}>Delete user permanently</h3>
            <p>{user.name || user.email}</p>
          </div>
          <button type="button" className="cu-close" onClick={onCancel} disabled={busy} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <form className="cu-form" onSubmit={submit} noValidate>
          {error && <div className="sa-alert sa-alert--error" role="alert">{error}</div>}

          <div className="cu-warning" role="note">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>
              This permanently deletes the account, its workspaces, projects, uploaded files and credit history.
              <strong> It cannot be undone.</strong> To keep the data, pause the service instead.
            </span>
          </div>

          <div className="cu-field">
            <label htmlFor={`${titleId}-confirm`}>
              Type <strong>{user.email}</strong> to confirm
            </label>
            <input
              ref={inputRef}
              id={`${titleId}-confirm`}
              className="sa-input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={busy}
            />
          </div>

          <footer className="cu-footer">
            <button type="button" className="sa-btn sa-btn--ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button
              type="submit"
              className="sa-btn sa-btn--danger"
              style={{
                minWidth: '180px',
                width: 'auto',
                whiteSpace: 'nowrap',
                padding: '0 18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              disabled={!confirmed || busy}
            >
              <Trash2 size={14} />
              {busy ? 'Deleting…' : 'Delete User Permanently'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

/**
 * Pause / resume service and delete, shown on a user's profile tab.
 * The parent owns list state: it receives `onUserUpdated(userId, patch)` and `onUserDeleted(userId)`.
 */
export default function UserLifecycleCard({ user, currentUserId, onUserUpdated, onUserDeleted, showToast }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pausing, setPausing] = useState(false)
  const [reason, setReason] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const busyRef = useRef(false)

  const paused = isUserPaused(user)
  const blocked = lifecycleBlockedReason(user, currentUserId)

  const run = async (action, request, onSuccess) => {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(true)
    try {
      const result = await request()
      onSuccess(result)
      showToast?.(lifecycleSuccessMessage(action, user), 'success')
      return true
    } catch (err) {
      const message = mapLifecycleError(err, action)
      if (action === 'delete') setDeleteError(message)
      else setError(message)
      showToast?.(message, 'error')
      return false
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const handlePause = async () => {
    setError('')
    const ok = await run(
      'pause',
      () => superadminService.pauseUser(user.id, { reason: reason.trim() }),
      (result) => onUserUpdated?.(user.id, { pausedAt: result?.user?.pausedAt ?? new Date().toISOString(), pauseReason: result?.user?.pauseReason ?? (reason.trim() || null) })
    )
    if (ok) {
      setPausing(false)
      setReason('')
    }
  }

  const handleResume = async () => {
    setError('')
    await run('resume', () => superadminService.resumeUser(user.id), () =>
      onUserUpdated?.(user.id, { pausedAt: null, pauseReason: null })
    )
  }

  const handleDelete = async (typedEmail) => {
    setDeleteError('')
    await run(
      'delete',
      () => superadminService.deleteUser(user.id, { confirmEmail: typedEmail }),
      () => {
        setDeleteOpen(false)
        onUserDeleted?.(user.id)
      }
    )
  }

  return (
    <>
      <div className="sa-action-card" style={{ marginTop: 16, padding: '0 0 12px' }}>
        <div className="sa-action-card-head" style={{ justifyContent: 'space-between', padding: '12px 12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {paused ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
            <span>Service status</span>
          </div>
          <span className={`sa-badge ${paused ? 'sa-badge--warn' : 'sa-badge--ok'}`}>{paused ? 'Paused' : 'Active'}</span>
        </div>

        {error && <div className="sa-alert sa-alert--error" style={{ margin: '0 12px 8px' }} role="alert">{error}</div>}

        <p style={{ margin: '0 12px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {paused
            ? `Paused ${user.pausedAt ? formatShortDate(user.pausedAt) : ''}${user.pauseReason ? ` — ${user.pauseReason}` : ''}. The user is signed out and cannot sign in until you resume service. Their data is kept.`
            : 'Pausing signs the user out of every device and blocks sign-in. Their data is kept and service can be resumed any time.'}
        </p>

        {blocked && (
          <p style={{ margin: '0 12px 12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{blocked}</p>
        )}

        {pausing && !paused && (
          <div className="cu-field" style={{ margin: '0 12px 12px' }}>
            <label htmlFor="pause-reason">Reason (optional, internal)</label>
            <textarea
              id="pause-reason"
              className="sa-input"
              rows={2}
              maxLength={PAUSE_REASON_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 12px' }}>
          {paused ? (
            <button type="button" className="sa-btn sa-btn--sm sa-btn--primary" disabled={busy || Boolean(blocked)} onClick={handleResume}>
              {busy ? 'Resuming…' : 'Resume service'}
            </button>
          ) : pausing ? (
            <>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={busy} onClick={() => { setPausing(false); setReason('') }}>
                Cancel
              </button>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--primary" disabled={busy} onClick={handlePause}>
                {busy ? 'Pausing…' : 'Confirm pause'}
              </button>
            </>
          ) : (
            <button type="button" className="sa-btn sa-btn--sm" disabled={busy || Boolean(blocked)} onClick={() => setPausing(true)}>
              Pause service
            </button>
          )}
        </div>
      </div>

      <div className="sa-action-card cu-danger-zone" style={{ marginTop: 16, padding: '0 0 12px' }}>
        <div className="sa-action-card-head" style={{ padding: '12px 12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Trash2 size={14} />
            <span>Delete user</span>
          </div>
        </div>
        <p style={{ margin: '0 12px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Permanently removes the account and all of its data. This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px' }}>
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--danger cu-btn-delete-user"
            style={{
              minWidth: '110px',
              width: 'auto',
              whiteSpace: 'nowrap',
              padding: '0 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            disabled={busy || Boolean(blocked)}
            onClick={() => { setDeleteError(''); setDeleteOpen(true) }}
          >
            <Trash2 size={13} />
            Delete User
          </button>
        </div>
      </div>

      {deleteOpen && (
        <DeleteUserDialog
          user={user}
          busy={busy}
          error={deleteError}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
