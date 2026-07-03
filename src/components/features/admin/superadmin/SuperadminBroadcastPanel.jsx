import { useState, useRef, useEffect } from 'react'
import { Mail, Send, AlertTriangle, CheckCircle, Users, Clock, Eye, AlertCircle, ChevronLeft, ChevronRight, History } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

/* ── helpers ─────────────────────────────────────────────── */

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── compose form after success ────────────────────────── */

function ResultCard({ result, onNewBroadcast, onViewDetails }) {
  const allOk = result.failedCount === 0
  return (
    <div
      className="sa-card"
      style={{
        marginTop: 16,
        borderColor: allOk
          ? 'color-mix(in srgb, #22c55e 35%, var(--border-color))'
          : 'color-mix(in srgb, #f59e0b 35%, var(--border-color))',
      }}
    >
      <div className="sa-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={15} color="#4ade80" />
          <h3 style={{ margin: 0 }}>Broadcast sent</h3>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--sm"
          onClick={() => onViewDetails(result.broadcastId)}
        >
          <Eye size={12} />
          View details
        </button>
      </div>
      <div className="sa-card-body">
        <div className="sa-heygen-tiles">
          <div className="sa-heygen-tile">
            <span className="sa-heygen-tile-label">Recipients</span>
            <strong className="sa-heygen-tile-value">
              {new Intl.NumberFormat().format(result.recipientCount)}
            </strong>
            <span className="sa-heygen-tile-note">users opted in to product emails</span>
          </div>
          <div className="sa-heygen-tile">
            <span className="sa-heygen-tile-label">Sent</span>
            <strong className="sa-heygen-tile-value" style={{ color: '#4ade80' }}>
              {new Intl.NumberFormat().format(result.sentCount)}
            </strong>
          </div>
          <div className="sa-heygen-tile">
            <span className="sa-heygen-tile-label">Failed</span>
            <strong
              className="sa-heygen-tile-value"
              style={{ color: result.failedCount > 0 ? '#f87171' : 'var(--text-main)' }}
            >
              {new Intl.NumberFormat().format(result.failedCount)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── broadcast history list ─────────────────────────────── */

function BroadcastStatusBadge({ sentCount, failedCount }) {
  const hasFailed = failedCount > 0
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 99,
        fontSize: '0.6875rem',
        fontWeight: 600,
        background: hasFailed
          ? 'color-mix(in srgb, #f59e0b 15%, transparent)'
          : 'color-mix(in srgb, #22c55e 15%, transparent)',
        color: hasFailed ? '#f59e0b' : '#4ade80',
        border: `1px solid ${hasFailed ? 'color-mix(in srgb, #f59e0b 30%, var(--border-color))' : 'color-mix(in srgb, #22c55e 30%, var(--border-color))'}`,
      }}
    >
      {hasFailed ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
      {hasFailed ? `${failedCount} failed` : 'All sent'}
    </span>
  )
}

function BroadcastHistoryView({ onSelectBroadcast }) {
  const [broadcasts, setBroadcasts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPage = (page) => {
    setLoading(true)
    setError('')
    superadminService.listProductEmailBroadcasts({ page, limit: 15 })
      .then((data) => {
        setBroadcasts(data.broadcasts)
        setPagination(data.pagination)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load history')
        setLoading(false)
      })
  }

  useEffect(() => { fetchPage(1) }, [])

  return (
    <div className="sa-card" style={{ marginTop: 8 }}>
      <div className="sa-card-header">
        <h3 style={{ margin: 0 }}>Broadcast history</h3>
        {!loading && <span className="sa-card-header-count">{pagination.total} total</span>}
      </div>
      <div className="sa-card-body" style={{ padding: 0, minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
        {loading && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
        )}
        {!loading && error && (
          <div style={{ padding: 24 }}>
            <div className="sa-alert sa-alert--error">
              <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{error}
            </div>
          </div>
        )}
        {!loading && !error && broadcasts.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No broadcasts sent yet
          </div>
        )}
        {!loading && !error && broadcasts.length > 0 && broadcasts.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelectBroadcast(b.id)}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '13px 20px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.12s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.subject}
              </div>
              <BroadcastStatusBadge sentCount={b.sentCount} failedCount={b.failedCount} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={11} />{new Intl.NumberFormat().format(b.recipientCount)} recipients
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />{formatDate(b.createdAt)}
              </span>
              {b.sentBy && (
                <span style={{ marginLeft: 'auto' }}>by {b.sentBy.name || b.sentBy.email}</span>
              )}
            </div>
          </button>
        ))}
      </div>
      {!loading && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="sa-btn sa-btn--sm" disabled={pagination.page <= 1} onClick={() => fetchPage(pagination.page - 1)}><ChevronLeft size={13} /></button>
            <button type="button" className="sa-btn sa-btn--sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchPage(pagination.page + 1)}><ChevronRight size={13} /></button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── broadcast detail modal ─────────────────────────────── */

function RecipientStatusBadge({ status }) {
  const ok = status === 'SENT'
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 99,
        fontSize: '0.625rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        background: ok ? 'color-mix(in srgb, #22c55e 15%, transparent)' : 'color-mix(in srgb, #f87171 15%, transparent)',
        color: ok ? '#4ade80' : '#f87171',
        border: `1px solid ${ok ? 'color-mix(in srgb, #22c55e 25%, var(--border-color))' : 'color-mix(in srgb, #f87171 25%, var(--border-color))'}`,
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  )
}

function BroadcastDetailModal({ broadcastId, onClose }) {
  const [broadcast, setBroadcast] = useState(null)
  const [recipients, setRecipients] = useState([])
  const [recipientPagination, setRecipientPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [loadingBroadcast, setLoadingBroadcast] = useState(true)
  const [loadingRecipients, setLoadingRecipients] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [htmlPreview, setHtmlPreview] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingBroadcast(true)
    superadminService.getProductEmailBroadcast(broadcastId)
      .then((data) => {
        if (!cancelled) {
          setBroadcast(data.broadcast)
          setLoadingBroadcast(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load broadcast')
          setLoadingBroadcast(false)
        }
      })
    return () => { cancelled = true }
  }, [broadcastId])

  useEffect(() => {
    if (activeTab !== 'recipients') return
    let cancelled = false
    setLoadingRecipients(true)
    superadminService.listProductEmailBroadcastRecipients(broadcastId, {
      page: recipientPagination.page,
      limit: 50,
      status: statusFilter || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setRecipients(data.recipients)
          setRecipientPagination(data.pagination)
          setLoadingRecipients(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingRecipients(false)
      })
    return () => { cancelled = true }
  }, [broadcastId, activeTab, recipientPagination.page, statusFilter])

  const handleStatusFilter = (val) => {
    setStatusFilter(val)
    setRecipientPagination((p) => ({ ...p, page: 1 }))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Broadcast details"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          width: 'min(720px, 96vw)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div className="sa-card-header" style={{ flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {loadingBroadcast ? 'Loading…' : (broadcast?.subject || 'Broadcast details')}
            </h3>
            {broadcast && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Sent {formatDate(broadcast.createdAt)}
                {broadcast.sentBy && ` · by ${broadcast.sentBy.name || broadcast.sentBy.email}`}
              </div>
            )}
          </div>
          <button type="button" className="sa-btn sa-btn--sm" onClick={onClose} aria-label="Close">Close</button>
        </div>

        {/* Tabs */}
        <div className="sa-tab-bar" style={{ flexShrink: 0 }}>
          <button type="button" className={`sa-tab${activeTab === 'overview' ? ' sa-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button type="button" className={`sa-tab${activeTab === 'recipients' ? ' sa-tab--active' : ''}`} onClick={() => setActiveTab('recipients')}>Recipients</button>
          <button type="button" className={`sa-tab${activeTab === 'content' ? ' sa-tab--active' : ''}`} onClick={() => setActiveTab('content')}>Email content</button>
        </div>

        <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {error && (
            <div className="sa-tab-pane">
              <div className="sa-alert sa-alert--error">
                <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
                {error}
              </div>
            </div>
          )}

          {/* ── overview tab ── */}
          {!error && activeTab === 'overview' && (
            <div className="sa-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loadingBroadcast ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
              ) : broadcast && (
                <>
                  <div className="sa-heygen-tiles">
                    <div className="sa-heygen-tile">
                      <span className="sa-heygen-tile-label">Recipients</span>
                      <strong className="sa-heygen-tile-value">{new Intl.NumberFormat().format(broadcast.recipientCount)}</strong>
                    </div>
                    <div className="sa-heygen-tile">
                      <span className="sa-heygen-tile-label">Sent</span>
                      <strong className="sa-heygen-tile-value" style={{ color: '#4ade80' }}>{new Intl.NumberFormat().format(broadcast.sentCount)}</strong>
                    </div>
                    <div className="sa-heygen-tile">
                      <span className="sa-heygen-tile-label">Failed</span>
                      <strong className="sa-heygen-tile-value" style={{ color: broadcast.failedCount > 0 ? '#f87171' : 'var(--text-main)' }}>{new Intl.NumberFormat().format(broadcast.failedCount)}</strong>
                    </div>
                    <div className="sa-heygen-tile">
                      <span className="sa-heygen-tile-label">Delivery rate</span>
                      <strong className="sa-heygen-tile-value">
                        {broadcast.recipientCount > 0
                          ? `${Math.round((broadcast.sentCount / broadcast.recipientCount) * 100)}%`
                          : '—'}
                      </strong>
                    </div>
                  </div>
                  <div className="sa-profile-grid">
                    <div className="sa-profile-item">
                      <span style={{ width: 110, flexShrink: 0 }}>Subject</span>
                      <strong>{broadcast.subject}</strong>
                    </div>
                    <div className="sa-profile-item">
                      <span style={{ width: 110, flexShrink: 0 }}>Sent at</span>
                      <strong>{formatDate(broadcast.createdAt)}</strong>
                    </div>
                    <div className="sa-profile-item">
                      <span style={{ width: 110, flexShrink: 0 }}>Sent by</span>
                      <strong>{broadcast.sentBy ? (broadcast.sentBy.name || broadcast.sentBy.email) : '—'}</strong>
                    </div>
                    <div className="sa-profile-item">
                      <span style={{ width: 110, flexShrink: 0 }}>Status</span>
                      <BroadcastStatusBadge sentCount={broadcast.sentCount} failedCount={broadcast.failedCount} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── recipients tab ── */}
          {!error && activeTab === 'recipients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* filter bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4 }}>Status:</span>
                {['', 'SENT', 'FAILED'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`sa-btn sa-btn--sm${statusFilter === s ? ' sa-tab--active' : ''}`}
                    onClick={() => handleStatusFilter(s)}
                    style={{ padding: '0 10px' }}
                  >
                    {s || 'All'}
                  </button>
                ))}
                {!loadingRecipients && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {recipientPagination.total} total
                  </span>
                )}
              </div>

              {/* list */}
              {loadingRecipients ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
              ) : recipients.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No recipients found</div>
              ) : (
                <div>
                  {recipients.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name || '—'}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.email}
                        </div>
                        {r.status === 'FAILED' && r.error && (
                          <div style={{ fontSize: '0.6875rem', color: '#f87171', marginTop: 2 }}>
                            Error: {r.error}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <RecipientStatusBadge status={r.status} />
                        {r.sentAt && (
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                            {formatDate(r.sentAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* pagination */}
              {recipientPagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Page {recipientPagination.page} of {recipientPagination.totalPages}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="sa-btn sa-btn--sm" disabled={recipientPagination.page <= 1} onClick={() => setRecipientPagination((p) => ({ ...p, page: p.page - 1 }))}>
                      <ChevronLeft size={13} />
                    </button>
                    <button type="button" className="sa-btn sa-btn--sm" disabled={recipientPagination.page >= recipientPagination.totalPages} onClick={() => setRecipientPagination((p) => ({ ...p, page: p.page + 1 }))}>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── content tab ── */}
          {!error && activeTab === 'content' && (
            <div className="sa-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingBroadcast ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
              ) : broadcast && (
                <>
                  {broadcast.htmlBody && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HTML body</span>
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={() => setHtmlPreview(true)}>
                          <Eye size={12} /> Preview
                        </button>
                      </div>
                      <pre style={{ background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)', borderRadius: 8, padding: 12, fontSize: '0.75rem', overflowX: 'auto', maxHeight: 260, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {broadcast.htmlBody}
                      </pre>
                    </div>
                  )}
                  {broadcast.textBody && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Plain text fallback</div>
                      <pre style={{ background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)', borderRadius: 8, padding: 12, fontSize: '0.75rem', overflowX: 'auto', maxHeight: 160, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {broadcast.textBody}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HTML preview inline modal */}
      {htmlPreview && broadcast?.htmlBody && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Email HTML preview"
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setHtmlPreview(false) }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, width: 'min(700px, 96vw)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="sa-card-header" style={{ flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>HTML Preview</h3>
              <button type="button" className="sa-btn sa-btn--sm" onClick={() => setHtmlPreview(false)}>Close</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
              <iframe title="Email HTML preview" srcDoc={broadcast.htmlBody} sandbox="allow-same-origin" style={{ width: '100%', height: '100%', minHeight: 400, border: 'none', background: '#fff' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── preview modal for compose ───────────────────────────── */

function HtmlPreview({ html, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Email HTML preview"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, width: 'min(700px, 96vw)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="sa-card-header" style={{ flexShrink: 0 }}>
          <h3 style={{ margin: 0 }}>HTML Preview</h3>
          <button type="button" className="sa-btn sa-btn--sm" onClick={onClose} aria-label="Close preview">Close</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          <iframe title="Email HTML preview" srcDoc={html} sandbox="allow-same-origin" style={{ width: '100%', height: '100%', minHeight: 400, border: 'none', background: '#fff' }} />
        </div>
      </div>
    </div>
  )
}

/* ── confirm dialog ───────────────────────────────────────── */

function ConfirmDialog({ subject, onConfirm, onCancel, loading }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm broadcast"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
    >
      <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border-color))', borderRadius: 14, width: 'min(440px, 96vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'color-mix(in srgb, #f59e0b 15%, transparent)', border: '1px solid color-mix(in srgb, #f59e0b 30%, var(--border-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#f59e0b' }}>
            <Send size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Send broadcast email?</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>This action cannot be undone.</div>
          </div>
        </div>

        <div style={{ background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Subject: </span>
            <span style={{ wordBreak: 'break-word' }}>{subject}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <Users size={12} />
            <span>Will be sent to all users with product emails enabled</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Type <strong style={{ color: 'var(--text-main)' }}>SEND</strong> to confirm.
        </p>

        <ConfirmTypebox onConfirm={onConfirm} onCancel={onCancel} loading={loading} />
      </div>
    </div>
  )
}

function ConfirmTypebox({ onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState('')
  const valid = typed.trim().toUpperCase() === 'SEND'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        className="sa-input"
        style={{ width: '100%', boxSizing: 'border-box' }}
        placeholder='Type SEND to confirm'
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoFocus
        aria-label="Type SEND to confirm"
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="sa-btn" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          type="button"
          className="sa-btn sa-btn--primary"
          style={{ background: valid ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined, borderColor: valid ? '#f59e0b' : undefined }}
          onClick={onConfirm}
          disabled={!valid || loading}
        >
          {loading ? 'Sending…' : 'Send broadcast'}
        </button>
      </div>
    </div>
  )
}

/* ── main panel ───────────────────────────────────────────── */

function SuperadminBroadcastPanel() {
  // compose state
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [plainText, setPlainText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sendResult, setSendResult] = useState(null)

  // view state
  const [view, setView] = useState('compose') // 'compose' | 'history'

  // modals
  const [detailBroadcastId, setDetailBroadcastId] = useState(null)

  const subjectRef = useRef(null)

  const canPreview = html.trim().length > 0
  const canSubmit = subject.trim().length > 0 && html.trim().length > 0


  const handleSendConfirmed = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await superadminService.sendProductEmailBroadcast({
        subject: subject.trim(),
        html: html.trim(),
        text: plainText.trim() || undefined,
      })
      setSendResult(data)
      setShowConfirm(false)
      setSubject('')
      setHtml('')
      setPlainText('')
      setView('compose')
    } catch (err) {
      setShowConfirm(false)
      setError(err.message || 'Broadcast failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewBroadcast = () => {
    setSendResult(null)
    setError('')
    setTimeout(() => subjectRef.current?.focus(), 50)
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Product email broadcast</h2>
          <p className="sa-panel-desc">Send a one-time product email to all users who have opted in to product communications.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* toggle tabs */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)', borderRadius: 9, padding: 3, gap: 2 }}>
            <button
              type="button"
              onClick={() => setView('compose')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 13px', borderRadius: 7, border: 'none',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: view === 'compose' ? 'var(--bg-card)' : 'transparent',
                color: view === 'compose' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: view === 'compose' ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              <Mail size={13} />
              Compose
            </button>
            <button
              type="button"
              onClick={() => setView('history')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 13px', borderRadius: 7, border: 'none',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: view === 'history' ? 'var(--bg-card)' : 'transparent',
                color: view === 'history' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: view === 'history' ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              <History size={13} />
              History
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
            <Mail size={14} />
            Email only · no inbox notification
          </div>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* info strip — only on compose */}
        {view === 'compose' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'color-mix(in srgb, #38bdf8 8%, transparent)', border: '1px solid color-mix(in srgb, #38bdf8 25%, var(--border-color))', fontSize: '0.8125rem', color: 'color-mix(in srgb, #38bdf8 90%, var(--text-main))', marginBottom: 4 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Only users with <strong>product emails</strong> enabled in their notification settings will receive this. This cannot be undone once sent.
            </span>
          </div>
        )}

        {/* ── compose view ── */}
        {view === 'compose' && (
          <>
            {/* send result card */}
            {sendResult && (
              <>
                <ResultCard result={sendResult} onNewBroadcast={handleNewBroadcast} onViewDetails={(id) => setDetailBroadcastId(id)} />
                <div style={{ marginTop: 12 }}>
                  <button type="button" className="sa-btn sa-btn--primary" onClick={handleNewBroadcast}>
                    <Mail size={13} />
                    Compose new broadcast
                  </button>
                </div>
              </>
            )}

            {/* compose form */}
            {!sendResult && (
              <form className="sa-card" style={{ marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); if (canSubmit) setShowConfirm(true) }}>
                <div className="sa-card-header">
                  <h3 style={{ margin: 0 }}>Compose</h3>
                </div>
                <div className="sa-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && (
                    <div className="sa-alert sa-alert--error">
                      <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
                      {error}
                    </div>
                  )}

                  <div className="sa-field">
                    <label htmlFor="broadcast-subject">Subject <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      id="broadcast-subject"
                      ref={subjectRef}
                      className="sa-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      type="text"
                      placeholder="e.g. New feature: Avatar Studio improvements"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                      required
                      disabled={loading}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{subject.length}/200</span>
                  </div>

                  <div className="sa-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label htmlFor="broadcast-html" style={{ marginBottom: 0 }}>HTML body <span style={{ color: '#f87171' }}>*</span></label>
                      {canPreview && (
                        <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={() => setShowPreview(true)} disabled={loading}>Preview</button>
                      )}
                    </div>
                    <textarea
                      id="broadcast-html"
                      className="sa-input"
                      style={{ width: '100%', boxSizing: 'border-box', minHeight: 220, resize: 'vertical', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem', padding: '10px 12px', height: 'auto' }}
                      placeholder={'<p>Hello,</p>\n<p>We\'re excited to share…</p>'}
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      required
                      disabled={loading}
                      spellCheck={false}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>Full HTML is supported. Use inline styles for maximum email client compatibility.</span>
                  </div>

                  <div className="sa-field">
                    <label htmlFor="broadcast-text">
                      Plain text fallback{' '}
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                      id="broadcast-text"
                      className="sa-input"
                      style={{ width: '100%', boxSizing: 'border-box', minHeight: 80, resize: 'vertical', fontSize: '0.8125rem', padding: '10px 12px', height: 'auto' }}
                      placeholder="Plain-text version for email clients that don't render HTML…"
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border-color)' }}>
                    {canPreview && (
                      <button type="button" className="sa-btn" onClick={() => setShowPreview(true)} disabled={loading}>Preview HTML</button>
                    )}
                    <button type="submit" className="sa-btn sa-btn--primary" disabled={!canSubmit || loading}>
                      <Send size={13} />
                      {loading ? 'Sending…' : 'Send broadcast…'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── history view ── */}
        {view === 'history' && (
          <BroadcastHistoryView onSelectBroadcast={(id) => setDetailBroadcastId(id)} />
        )}
      </div>

      {showPreview && <HtmlPreview html={html} onClose={() => setShowPreview(false)} />}
      {showConfirm && <ConfirmDialog subject={subject} onConfirm={handleSendConfirmed} onCancel={() => setShowConfirm(false)} loading={loading} />}
      {detailBroadcastId && <BroadcastDetailModal broadcastId={detailBroadcastId} onClose={() => setDetailBroadcastId(null)} />}
    </div>
  )
}

export default SuperadminBroadcastPanel
