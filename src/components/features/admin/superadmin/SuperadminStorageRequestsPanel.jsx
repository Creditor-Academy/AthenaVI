import { useCallback, useEffect, useState } from 'react'
import { HardDrive, ChevronLeft, ChevronRight, X } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatBytes, formatDate, storageStatusLabel } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

const PAGE_SIZE = 20
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function RejectModal({ request, onClose, onRejected }) {
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReject = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await superadminService.rejectStorageRequest(request.requestId, {
        reviewNote: reviewNote.trim() || undefined,
      })
      onRejected()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to reject request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300 }} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reject storage request"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(440px, 92vw)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          zIndex: 301,
          padding: '22px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650 }}>Reject upgrade request</h3>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {request.user?.name || request.user?.email || 'User'} requested{' '}
          {formatBytes(request.requestedAdditionalBytes)} additional storage.
        </p>
        {error && <div className="sa-alert sa-alert--error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleReject}>
          <div className="sa-field">
            <label htmlFor="reject-note">Message to user (optional)</label>
            <textarea
              id="reject-note"
              className="sa-reason-input"
              rows={3}
              maxLength={500}
              placeholder="Reason shown in their inbox notification…"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="sa-btn sa-btn--sm sa-btn--danger" disabled={loading}>
              {loading ? 'Rejecting…' : 'Reject request'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function SuperadminStorageRequestsPanel() {
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await superadminService.listStorageRequests({
        page,
        limit: PAGE_SIZE,
        status,
      })
      setRequests(data.requests || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setRequests([])
      setError(err.message || 'Failed to load storage requests')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    setPage(1)
  }, [status])

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Storage upgrade queue</h2>
          <p className="sa-panel-desc">
            Review user storage upgrade requests. Grant storage from the Users panel to approve; reject here to notify the user.
          </p>
        </div>
      </div>

      {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
      {error && <div className="sa-alert sa-alert--error">{error}</div>}

      <div className="sa-card sa-card--flush" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="sa-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <h3>
            Requests{' '}
            <span className="sa-card-header-count">{pagination.total ?? 0}</span>
          </h3>
          <select
            className="sa-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 120px 100px 100px',
          gap: 12,
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          <span>User</span>
          <span>Request</span>
          <span>Status</span>
          <span>Submitted</span>
          <span style={{ textAlign: 'right' }}>Action</span>
        </div>

        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div className="sa-loading" style={{ padding: 40 }}>
              <span className="sa-spinner" /> Loading requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="sa-empty" style={{ padding: '48px 20px' }}>
              <HardDrive className="sa-empty-icon" size={36} />
              No {status} storage requests.
            </div>
          ) : (
            requests.map((req) => {
              const statusKey = String(req.status || '').toLowerCase()
              const statusColors = {
                pending: '#f59e0b',
                approved: '#22c55e',
                rejected: '#ef4444',
              }
              const color = statusColors[statusKey] || 'var(--text-muted)'
              return (
                <div
                  key={req.requestId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 120px 100px 100px',
                    gap: 12,
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    alignItems: 'center',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {req.user?.name || 'No name'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.user?.email || '—'}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>+{formatBytes(req.requestedAdditionalBytes)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.tierLabel || req.reason || '—'}
                    </div>
                    {req.workspaceName && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Workspace: {req.workspaceName}
                      </div>
                    )}
                  </div>
                  <span
                    className="sa-badge"
                    style={{
                      background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      color,
                      width: 'fit-content',
                    }}
                  >
                    {storageStatusLabel(req.status)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {req.submittedAt ? formatDate(req.submittedAt).split(',')[0] : '—'}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    {statusKey === 'pending' ? (
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--danger"
                        onClick={() => setRejectTarget(req)}
                      >
                        Reject
                      </button>
                    ) : req.reviewNote ? (
                      <span title={req.reviewNote} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Note
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!loading && requests.length > 0 && (
          <div className="sa-pagination" style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
            <div className="sa-toolbar">
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => {
            setActionMessage('Storage upgrade request rejected. User has been notified.')
            loadRequests()
          }}
        />
      )}
    </div>
  )
}

export default SuperadminStorageRequestsPanel
