import { useCallback, useEffect, useState } from 'react'
import { HardDrive, ChevronLeft, ChevronRight, X, Check, Database, Clock, CheckCircle2, XCircle, Sparkles, Search, Filter } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatBytes, formatDate, storageStatusLabel } from './superadminUtils'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import { AdminTableRowsSkeleton } from './skeletons/AdminSkeletons'

const PAGE_SIZE = 20
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function GrantModal({ request, onClose, onGranted }) {
  const [reason, setReason] = useState(`Storage upgrade request approved`)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGrant = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await superadminService.grantUserStorage(request.user.id, {
        additionalBytes: request.requestedAdditionalBytes,
        reason: reason.trim() || undefined,
      })
      onGranted()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to grant storage')
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
        aria-label="Grant storage request"
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
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 650, color: 'var(--text-main)' }}>Grant storage request</h3>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Grant{' '}
          <strong style={{ color: 'var(--text-main)' }}>{formatBytes(request.requestedAdditionalBytes)}</strong>{' '}
          additional storage to{' '}
          <strong style={{ color: 'var(--text-main)' }}>{request.user?.name || request.user?.email || 'User'}</strong>.
        </p>
        {error && <div className="sa-alert sa-alert--error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleGrant}>
          <div className="sa-field">
            <label htmlFor="grant-reason">Message to user (optional)</label>
            <textarea
              id="grant-reason"
              className="sa-reason-input"
              rows={3}
              maxLength={500}
              placeholder="Reason shown in their inbox notification…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="sa-btn sa-btn--sm sa-btn--primary"
              disabled={loading}
              style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }}
            >
              {loading ? 'Granting…' : 'Grant storage'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

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
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [grantTarget, setGrantTarget] = useState(null)
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

  const [search, setSearch] = useState('')

  // Derived metrics for KPI cards
  const totalRequestsCount = pagination.total ?? requests.length
  const pendingRequestsCount = requests.filter(r => (r.status || '').toLowerCase() === 'pending').length
  const approvedRequestsCount = requests.filter(r => (r.status || '').toLowerCase() === 'approved').length
  const rejectedRequestsCount = requests.filter(r => (r.status || '').toLowerCase() === 'rejected').length
  const totalBytesRequested = requests.reduce((acc, r) => acc + (Number(r.requestedAdditionalBytes) || 0), 0)

  // Filtered requests by search
  const displayedRequests = requests.filter(r => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (r.user?.name || '').toLowerCase().includes(q) ||
      (r.user?.email || '').toLowerCase().includes(q) ||
      (r.workspaceName || '').toLowerCase().includes(q) ||
      (r.tierLabel || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="sa-panel">
      {/* ── Page Header ── */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">Storage Upgrade Queue</h2>
          <p className="sa-panel-desc">
            Review user and workspace storage upgrade requests. Grant additional storage tiers or reject requests directly with custom user notifications.
          </p>
        </div>
      </div>

      {actionMessage && <div className="sa-alert sa-alert--success">{actionMessage}</div>}
      {error && <div className="sa-alert sa-alert--error">{error}</div>}

      {/* ── KPI Stats Cards Row (AstryAi Style) ── */}
      <div className="sa-kpi-grid">
        <div className="sa-kpi-card sa-kpi-card--blue">
          <div className="sa-kpi-card-grain" aria-hidden="true" />
          <div className="sa-kpi-header">
            <span className="sa-kpi-label">Total Requests</span>
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-value">{totalRequestsCount}</span>
            <span className="sa-kpi-detail">All submissions</span>
          </div>
          <div className="sa-kpi-corner-icon" aria-hidden="true">
            <Database size={70} strokeWidth={1.5} />
          </div>
        </div>

        <div className="sa-kpi-card sa-kpi-card--amber">
          <div className="sa-kpi-card-grain" aria-hidden="true" />
          <div className="sa-kpi-header">
            <span className="sa-kpi-label">Pending Review</span>
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-value">{pendingRequestsCount}</span>
            <span className="sa-kpi-detail">Awaiting approval</span>
          </div>
          <div className="sa-kpi-corner-icon" aria-hidden="true">
            <Clock size={70} strokeWidth={1.5} />
          </div>
        </div>

        <div className="sa-kpi-card sa-kpi-card--emerald">
          <div className="sa-kpi-card-grain" aria-hidden="true" />
          <div className="sa-kpi-header">
            <span className="sa-kpi-label">Approved Upgrades</span>
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-value">{approvedRequestsCount}</span>
            <span className="sa-kpi-detail">Storage expanded</span>
          </div>
          <div className="sa-kpi-corner-icon" aria-hidden="true">
            <CheckCircle2 size={70} strokeWidth={1.5} />
          </div>
        </div>

        <div className="sa-kpi-card sa-kpi-card--purple">
          <div className="sa-kpi-card-grain" aria-hidden="true" />
          <div className="sa-kpi-header">
            <span className="sa-kpi-label">Volume Requested</span>
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-value">{formatBytes(totalBytesRequested)}</span>
            <span className="sa-kpi-detail">Total requested storage</span>
          </div>
          <div className="sa-kpi-corner-icon" aria-hidden="true">
            <HardDrive size={70} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── Main Data Table Card Container ── */}
      <div className="sa-table-card">
        {/* Toolbar with Filter Tabs and Search */}
        <div className="sa-table-toolbar">
          <div className="sa-filter-tabs" role="tablist" aria-label="Filter storage requests by status">
            <button
              type="button"
              role="tab"
              aria-selected={status === ''}
              className={`sa-filter-tab ${status === '' ? 'active' : ''}`}
              onClick={() => setStatus('')}
            >
              All Requests
              <span className="sa-filter-count">{totalRequestsCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={status === 'pending'}
              className={`sa-filter-tab ${status === 'pending' ? 'active' : ''}`}
              onClick={() => setStatus('pending')}
            >
              Pending
              <span className="sa-filter-count">{pendingRequestsCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={status === 'approved'}
              className={`sa-filter-tab ${status === 'approved' ? 'active' : ''}`}
              onClick={() => setStatus('approved')}
            >
              Approved
              <span className="sa-filter-count">{approvedRequestsCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={status === 'rejected'}
              className={`sa-filter-tab ${status === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatus('rejected')}
            >
              Rejected
              <span className="sa-filter-count">{rejectedRequestsCount}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <div className="sa-search-field" style={{ width: 'min(280px, 100%)' }}>
              <Search className="sa-search-field-icon" size={14} aria-hidden />
              <input
                className="sa-input"
                type="search"
                placeholder="Search user or workspace…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search storage requests"
              />
            </div>
          </div>
        </div>

        {/* Table Content (Scrollable data rows, sticky headers) */}
        <div className="sa-table-scroll sa-scroll">
          <table className="sa-table-modern">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Requester</th>
                <th style={{ width: '22%' }}>Details &amp; Workspace</th>
                <th style={{ width: '16%' }}>Storage</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '10%' }}>Submitted</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableRowsSkeleton rows={6} variant="storage" />
              ) : displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="sa-empty">
                      No {status ? status : ''} storage upgrade requests found.
                    </div>
                  </td>
                </tr>
              ) : (
                displayedRequests.map((req) => {
                  const statusKey = String(req.status || '').toLowerCase()
                  const statusColors = {
                    pending: '#f59e0b',
                    approved: '#22c55e',
                    rejected: '#ef4444',
                  }
                  const color = statusColors[statusKey] || 'var(--text-muted)'
                  const firstLetter = (req.user?.name || req.user?.email || '?')[0].toUpperCase()

                  return (
                    <tr key={req.requestId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, var(--bg-card)) 0%, color-mix(in srgb, var(--primary) 25%, var(--bg-card)) 100%)',
                            border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color))',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}>
                            {firstLetter}
                          </div>
                          <div>
                            <div style={{ fontWeight: 650, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                              {req.user?.name || 'Anonymous User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {req.user?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {req.tierLabel || req.reason || 'Additional quota'}
                          </div>
                          {req.workspaceName && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Workspace: {req.workspaceName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 750,
                          fontSize: '0.875rem',
                          color: 'var(--primary)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          +{formatBytes(req.requestedAdditionalBytes)}
                        </span>
                      </td>
                      <td>
                        <span
                          className="sa-badge"
                          style={{
                            background: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                            border: `1px solid color-mix(in srgb, ${color} 30%, var(--border-color))`,
                            gap: 4,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                          {storageStatusLabel(req.status)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {req.submittedAt ? formatDate(req.submittedAt).split(',')[0] : '—'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {statusKey === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="sa-btn sa-btn--sm"
                              style={{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' }}
                              onClick={() => setGrantTarget(req)}
                              title="Grant requested storage"
                            >
                              <Check size={13} style={{ marginRight: 3 }} />
                              Grant
                            </button>
                            <button
                              type="button"
                              className="sa-btn sa-btn--sm sa-btn--danger"
                              onClick={() => setRejectTarget(req)}
                              title="Reject request"
                            >
                              Reject
                            </button>
                          </div>
                        ) : req.reviewNote ? (
                          <span title={req.reviewNote} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {req.reviewNote.slice(0, 16)}…
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pinned Pagination Footer */}
        {!loading && requests.length > 0 && (
          <div className="sa-pagination">
            <span>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong> ({pagination.total || requests.length} requests)
            </span>
            <div className="sa-toolbar">
              <button
                type="button"
                className="sa-btn sa-btn--sm sa-btn--ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                className="sa-btn sa-btn--sm sa-btn--ghost"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                Next <ChevronRight size={14} />
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

      {grantTarget && (
        <GrantModal
          request={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={() => {
            setActionMessage(`Storage granted to ${grantTarget.user?.name || grantTarget.user?.email || 'user'}. They have been notified.`)
            loadRequests()
          }}
        />
      )}
    </div>
  )
}

export default SuperadminStorageRequestsPanel
