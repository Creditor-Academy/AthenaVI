import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Clock, CheckCircle, XCircle, MessageSquare, Eye, AlertTriangle } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

/* ── constants ──────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: 'pending',       label: 'Received',      short: 'Received' },
  { id: 'under_review',  label: 'Under review',  short: 'Reviewing' },
  { id: 'in_discussion', label: 'In discussion', short: 'Discussing' },
  { id: 'approved',      label: 'Approved',      short: 'Approved' },
]

const STATUS_TABS = [
  { id: '',              label: 'All' },
  { id: 'pending',       label: 'Pending' },
  { id: 'under_review',  label: 'Under review' },
  { id: 'in_discussion', label: 'In discussion' },
  { id: 'approved',      label: 'Approved' },
  { id: 'rejected',      label: 'Rejected' },
]

const STATUS_META = {
  pending:       { label: 'Pending',       color: '#f59e0b', bg: '#f59e0b' },
  under_review:  { label: 'Under review',  color: '#38bdf8', bg: '#38bdf8' },
  in_discussion: { label: 'In discussion', color: '#a78bfa', bg: '#a78bfa' },
  approved:      { label: 'Approved',      color: '#4ade80', bg: '#22c55e' },
  rejected:      { label: 'Rejected',      color: '#f87171', bg: '#ef4444' },
}

const FINAL_STATUSES = new Set(['approved', 'rejected'])

const ADVANCE_FROM = {
  pending:       { action: 'under_review',  label: 'Start review' },
  under_review:  { action: 'in_discussion', label: 'Move to discussion' },
  in_discussion: null,
}

/* ── pipeline stepper ───────────────────────────────────── */

function PipelineStepper({ status }) {
  const isRejected = status === 'rejected'
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.id === status)

  return (
    <div style={{ padding: '16px 0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {PIPELINE_STAGES.map((stage, idx) => {
          const isDone = isRejected ? false : currentIdx > idx
          const isCurrent = !isRejected && currentIdx === idx
          const isFuture = isRejected || currentIdx < idx
          const dotColor = isDone ? '#4ade80' : isCurrent ? STATUS_META[stage.id]?.color || 'var(--primary)' : 'var(--border-color)'

          return (
            <div key={stage.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {idx > 0 && (
                <div style={{
                  position: 'absolute', top: 13, right: '50%', width: '100%', height: 2,
                  background: PIPELINE_STAGES[idx - 1] && !isRejected && currentIdx > idx - 1 ? '#4ade80' : 'var(--border-color)',
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', zIndex: 1, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'color-mix(in srgb, #4ade80 18%, var(--bg-card))' : isCurrent ? `color-mix(in srgb, ${dotColor} 18%, var(--bg-card))` : 'var(--bg-card)',
                border: `2px solid ${dotColor}`,
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? `0 0 0 4px color-mix(in srgb, ${dotColor} 18%, transparent)` : 'none',
              }}>
                {isDone ? (
                  <CheckCircle size={14} color="#4ade80" />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCurrent ? dotColor : 'var(--border-color)' }} />
                )}
              </div>
              <div style={{
                marginTop: 7, fontSize: '0.6875rem', fontWeight: isCurrent ? 700 : 500,
                color: isDone ? '#4ade80' : isCurrent ? dotColor : 'var(--text-muted)',
                textAlign: 'center', lineHeight: 1.3,
                opacity: isFuture && !isCurrent ? 0.5 : 1,
              }}>
                {stage.short}
              </div>
            </div>
          )
        })}

        {isRejected && (
          <div style={{ position: 'absolute', right: 0, top: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'color-mix(in srgb, #f87171 18%, var(--bg-card))', border: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={14} color="#f87171" />
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f87171' }}>Rejected</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── status badge ───────────────────────────────────────── */

function StatusBadge({ status, size = 'sm' }) {
  const meta = STATUS_META[status] || { label: status, color: 'var(--text-muted)', bg: 'var(--text-muted)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 9px' : '4px 12px',
      borderRadius: 99,
      fontSize: size === 'sm' ? '0.6875rem' : '0.8125rem',
      fontWeight: 600,
      background: `color-mix(in srgb, ${meta.bg} 15%, transparent)`,
      color: meta.color,
      border: `1px solid color-mix(in srgb, ${meta.bg} 30%, var(--border-color))`,
      flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  )
}

/* ── table skeleton ─────────────────────────────────────── */

function TableSkeleton() {
  return Array.from({ length: 7 }).map((_, i) => (
    <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: '0 0 44px', height: 44, borderRadius: 10, background: 'var(--border-color)', opacity: 0.45 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 13, borderRadius: 4, background: 'var(--border-color)', opacity: 0.45, width: '55%' }} />
        <div style={{ height: 11, borderRadius: 4, background: 'var(--border-color)', opacity: 0.3, width: '35%' }} />
      </div>
      <div style={{ flex: '0 0 90px', height: 22, borderRadius: 99, background: 'var(--border-color)', opacity: 0.35 }} />
    </div>
  ))
}

/* ── detail drawer ──────────────────────────────────────── */

function RequestDrawer({ open, request, onClose, onStatusChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (open) {
      setError('')
      setSuccess('')
    }
  }, [open, request?.requestId])

  const isFinal = FINAL_STATUSES.has(request?.status)

  const handleStatusChange = async (newStatus, shortcut = false) => {
    if (!request?.requestId) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (shortcut) {
        if (newStatus === 'approved') await superadminService.approveEarlyAccessRequest(request.requestId)
        else if (newStatus === 'rejected') await superadminService.rejectEarlyAccessRequest(request.requestId)
      } else {
        await superadminService.updateEarlyAccessStatus(request.requestId, { status: newStatus })
      }
      setSuccess(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`)
      onStatusChange?.()
    } catch (err) {
      setError(err.message || 'Status update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} aria-hidden />
      )}

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: open ? 'translate(-50%, -50%)' : 'translate(-50%, -48%)',
        width: 600, maxWidth: '94vw', height: '84vh', minHeight: '500px',
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', zIndex: 201,
        display: 'flex', flexDirection: 'column', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
      }} role="dialog" aria-modal="true" aria-label="Request details">

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(135deg, var(--bg-card) 0%, color-mix(in srgb, var(--primary) 5%, var(--bg-card)) 100%)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, var(--bg-card)) 0%, color-mix(in srgb, var(--primary) 25%, var(--bg-card)) 100%)', border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color))', color: 'var(--primary, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 15%, transparent)' }}>
            {(request?.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {request?.name || 'Request'}
              </div>
              {request?.status && <StatusBadge status={request.status} size="sm" />}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {request?.email}
            </div>
          </div>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={onClose} aria-label="Close modal" style={{ width: 36, height: 36, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {error && <div className="sa-alert sa-alert--error"><AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{error}</div>}
            {success && <div className="sa-alert sa-alert--success"><CheckCircle size={13} style={{ display: 'inline', marginRight: 6 }} />{success}</div>}

            {request?.message && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={12} /> Message
                </div>
                <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--bg-card) 95%, transparent)', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {request.message}
                </div>
              </div>
            )}

            {!isFinal && (
              <div style={{ background: 'color-mix(in srgb, var(--bg-card) 95%, transparent)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Actions</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Move to stage</div>
                  <select
                    className="sa-select"
                    style={{ height: 32, fontSize: '0.8125rem', padding: '0 10px', width: 'auto', minWidth: 160 }}
                    value={request?.status === 'under_review' || request?.status === 'in_discussion' ? request.status : ''}
                    disabled={loading}
                    onChange={(e) => { if (e.target.value) handleStatusChange(e.target.value) }}
                  >
                    {request?.status !== 'under_review' && request?.status !== 'in_discussion' && (
                      <option value="" disabled>Select stage…</option>
                    )}
                    <option value="under_review">Under review</option>
                    <option value="in_discussion">In discussion</option>
                  </select>
                </div>

                <div style={{ height: 1, background: 'var(--border-color)' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Final decision</div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button type="button" className="sa-btn sa-btn--sm sa-btn--danger" onClick={() => handleStatusChange('rejected', true)} disabled={loading}>
                      {loading ? '…' : 'Reject'}
                    </button>
                    <button type="button" className="sa-btn sa-btn--sm" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderColor: '#22c55e', color: '#fff', boxShadow: '0 2px 6px color-mix(in srgb, #22c55e 25%, transparent)' }} onClick={() => handleStatusChange('approved', true)} disabled={loading}>
                      {loading ? '…' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="sa-profile-grid">
              <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Request ID</span><strong style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{request?.requestId || '—'}</strong></div>
              <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Name</span><strong>{request?.name || '—'}</strong></div>
              <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Email</span><strong style={{ wordBreak: 'break-word' }}>{request?.email || '—'}</strong></div>
              {request?.company && <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Company</span><strong>{request.company}</strong></div>}
              {request?.role && <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Role</span><strong>{request.role}</strong></div>}
              {request?.useCase && <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Use case</span><strong>{request.useCase}</strong></div>}
              <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Submitted</span><strong>{formatDate(request?.createdAt)}</strong></div>
              {request?.reviewedAt && <div className="sa-profile-item"><span style={{ width: 110, flexShrink: 0 }}>Reviewed</span><strong>{formatDate(request.reviewedAt)}</strong></div>}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

/* ── main panel ─────────────────────────────────────────── */

const PAGE_SIZE = 20

function SuperadminEarlyAccessPanel() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [tabCounts, setTabCounts] = useState({})
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const loadRequests = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const data = await superadminService.listEarlyAccessRequests({ page, limit: PAGE_SIZE, status: statusFilter || undefined })
      let rows = data.requests || []
      if (search) {
        const q = search.toLowerCase()
        rows = rows.filter(r =>
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.company?.toLowerCase().includes(q)
        )
      }
      setRequests(rows)
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setListError(err.message || 'Failed to load requests')
      setRequests([])
    } finally {
      setListLoading(false)
    }
  }, [page, statusFilter, search])

  const loadTabCounts = useCallback(async () => {
    try {
      const statuses = ['pending', 'under_review', 'in_discussion', 'approved', 'rejected']
      const results = await Promise.allSettled(
        statuses.map(s => superadminService.listEarlyAccessRequests({ page: 1, limit: 1, status: s }))
      )
      const counts = {}
      statuses.forEach((s, i) => {
        if (results[i].status === 'fulfilled') counts[s] = results[i].value.pagination?.total ?? 0
      })
      setTabCounts(counts)
    } catch (_) {}
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 320)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { loadRequests() }, [loadRequests])
  useEffect(() => { loadTabCounts() }, [loadTabCounts])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const openDrawer = (req) => { setSelectedRequest(req); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => setSelectedRequest(null), 280) }

  const handleStatusChange = () => {
    loadRequests()
    loadTabCounts()
    if (selectedRequest?.requestId) {
      superadminService.getEarlyAccessRequest(selectedRequest.requestId)
        .then(data => setSelectedRequest(data.request || data))
        .catch(() => {})
    }
  }

  const handleTabChange = (status) => { setStatusFilter(status); setPage(1) }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Early access requests</h2>
          <p className="sa-panel-desc">Review and manage early access applications. Status emails are sent automatically on every update.</p>
        </div>
      </div>

      {listError && <div className="sa-alert sa-alert--error">{listError}</div>}

      <div className="sa-card sa-card--flush" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Status tab bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '10px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => {
            const count = tab.id ? tabCounts[tab.id] : undefined
            return (
              <button key={tab.id} type="button" className={`sa-tab${statusFilter === tab.id ? ' sa-tab--active' : ''}`} onClick={() => handleTabChange(tab.id)}>
                {tab.label}
                {count != null && count > 0 && (
                  <span className="sa-card-header-count" style={{ marginLeft: 4 }}>{count}</span>
                )}
              </button>
            )
          })}
          <div style={{ marginLeft: 'auto' }}>
            <div className="sa-list-search" style={{ maxWidth: 240, flex: '0 0 auto', padding: 0 }}>
              <Search className="sa-search-field-icon" size={13} strokeWidth={2} style={{ left: 10 }} aria-hidden />
              <input className="sa-input sa-input--list-search" style={{ paddingLeft: 30 }} type="search" placeholder="Search name, email…" value={searchInput} onChange={e => setSearchInput(e.target.value)} aria-label="Search requests" />
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 120px 130px', gap: 12, padding: '8px 20px', borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
          <span>Applicant</span>
          <span>Company / role</span>
          <span>Use case</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>

        {/* Rows */}
        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {listLoading ? <TableSkeleton /> : requests.length === 0 ? (
            <div className="sa-empty">
              {search ? `No results for "${search}"` : statusFilter ? `No ${STATUS_META[statusFilter]?.label?.toLowerCase() || statusFilter} requests` : 'No requests yet'}
            </div>
          ) : requests.map(req => {
            const isSelected = selectedRequest?.requestId === req.requestId && drawerOpen
            return (
              <button key={req.requestId} type="button"
                onClick={() => openDrawer(req)}
                style={{
                  width: '100%', display: 'block', padding: 0,
                  background: isSelected ? 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 100%)' : 'transparent',
                  border: 'none', outline: 'none', borderBottom: '1px solid var(--border-color)',
                  borderLeft: isSelected ? '3px solid var(--primary,#3b82f6)' : '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)', transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 6%, transparent) 0%, transparent 100%)'; e.currentTarget.style.borderLeft = '3px solid color-mix(in srgb, var(--primary) 50%, var(--border-color))' } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent' } }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 120px 130px', gap: 12, padding: '13px 20px', alignItems: 'center', pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isSelected ? 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, #2563eb) 100%)' : 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, var(--bg-card)) 0%, color-mix(in srgb, var(--primary) 25%, var(--bg-card)) 100%)', color: isSelected ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, border: isSelected ? '2px solid var(--primary)' : '1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color))' }}>
                      {(req.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.email}</div>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.company || '—'}</div>
                    {req.role && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.role}</div>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.useCase || '—'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusBadge status={req.status} />
                  </div>
                </div>
                <div style={{ padding: '0 20px 10px', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {formatDate(req.createdAt)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Pagination */}
        {!listLoading && pagination.totalPages > 1 && (
          <div className="sa-pagination" style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} total</span>
            <div className="sa-toolbar">
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <RequestDrawer open={drawerOpen} request={selectedRequest} onClose={closeDrawer} onStatusChange={handleStatusChange} />
    </div>
  )
}

export default SuperadminEarlyAccessPanel
