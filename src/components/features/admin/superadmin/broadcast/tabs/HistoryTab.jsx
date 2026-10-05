import { useState, useEffect, useCallback } from 'react'
import { Inbox, RefreshCw, Mail, Eye, Copy, AlertTriangle } from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'
import { formatDate } from '../../superadminUtils'
import { statusColor } from '../broadcastUtils'
import BroadcastDetailModal from '../modals/BroadcastDetailModal'
import ResendBroadcastModal from '../modals/ResendBroadcastModal'
import PreviewModal from '../modals/PreviewModal'

export default function HistoryTab({ refreshKey, onReuseInCompose }) {
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [resendBroadcast, setResendBroadcast] = useState(null)
  const [previewHtmlItem, setPreviewHtmlItem] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setErr('')
    try {
      const data = await superadminService.listProductEmailBroadcasts({ page: p, limit: 50 })
      const list = data.broadcasts || data.items || data.data || []
      setBroadcasts(p === 1 ? list : (prev) => [...prev, ...list])
      setHasMore(list.length === 50)
      setPage(p)
    } catch (e) {
      setErr(e.message || 'Failed to load broadcasts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load, refreshKey])

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (statusFilter !== 'all') {
      const s = (b.status || 'SENT').toUpperCase()
      if (statusFilter === 'sent' && s !== 'SENT' && s !== 'COMPLETED') return false
      if (statusFilter === 'failed' && s !== 'FAILED') return false
      if (statusFilter === 'processing' && s !== 'PROCESSING' && s !== 'QUEUED') return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const subjectMatch = (b.subject || '').toLowerCase().includes(q)
      const senderMatch = typeof b.sentBy === 'object'
        ? (b.sentBy?.name || b.sentBy?.email || '').toLowerCase().includes(q)
        : (b.sentBy || '').toLowerCase().includes(q)
      if (!subjectMatch && !senderMatch) return false
    }
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {selectedId && (
        <BroadcastDetailModal broadcastId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {resendBroadcast && (
        <ResendBroadcastModal
          broadcast={resendBroadcast}
          onResendSuccess={() => load(1)}
          onClose={() => setResendBroadcast(null)}
        />
      )}

      {previewHtmlItem && (
        <PreviewModal
          html={previewHtmlItem.htmlBody || previewHtmlItem.html}
          subject={previewHtmlItem.subject}
          onClose={() => setPreviewHtmlItem(null)}
        />
      )}

      {/* ── Table Toolbar with Search, Status Filter Tabs, and Refresh ── */}
      <div className="sa-table-toolbar">
        <div className="sa-search-field" style={{ minWidth: 220, maxWidth: 320 }}>
          <Search className="sa-search-field-icon" size={14} aria-hidden />
          <input
            className="sa-input"
            type="text"
            placeholder="Search broadcasts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-filter-tabs" role="tablist" aria-label="Filter broadcast status">
          {[
            { id: 'all', label: 'All Dispatches' },
            { id: 'sent', label: 'Completed' },
            { id: 'processing', label: 'Processing' },
            { id: 'failed', label: 'Failed' },
          ].map(({ id, label }) => {
            const active = statusFilter === id
            const count = id === 'all'
              ? broadcasts.length
              : broadcasts.filter(b => {
                  const s = (b.status || 'SENT').toUpperCase()
                  if (id === 'sent') return s === 'SENT' || s === 'COMPLETED'
                  if (id === 'failed') return s === 'FAILED'
                  if (id === 'processing') return s === 'PROCESSING' || s === 'QUEUED'
                  return true
                }).length
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`sa-filter-tab${active ? ' active' : ''}`}
                onClick={() => setStatusFilter(id)}
              >
                <span>{label}</span>
                {broadcasts.length > 0 && <span className="sa-filter-count">{count}</span>}
              </button>
            )
          })}
        </div>

        <div className="sa-broadcast-toolbar-actions">
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => load(1)}
            disabled={loading}
            aria-label="Refresh broadcasts"
            title="Refresh"
            style={{ gap: 6 }}
          >
            <RefreshCw size={13} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="sa-table-scroll sa-scroll" style={{ flex: 1, minHeight: 0 }}>
        {err && <div className="sa-alert sa-alert--error" style={{ margin: 16 }}><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}

        {loading && broadcasts.length === 0 && (
          <div className="sa-loading" style={{ padding: '60px 0' }}><span className="sa-spinner" /> Loading broadcast history…</div>
        )}

        {!loading && filteredBroadcasts.length === 0 && !err && (
          <div className="sa-empty" style={{ padding: '60px 0' }}>
            <Mail className="sa-empty-icon" size={42} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>No broadcasts found</p>
            <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Dispatched announcements will appear here with delivery details and resend options.'}
            </p>
          </div>
        )}

        {filteredBroadcasts.length > 0 && (
          <table className="sa-table-modern">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Subject & Campaign</th>
                <th style={{ width: '20%' }}>Dispatched At</th>
                <th style={{ width: '16%' }}>Recipients</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBroadcasts.map((b, i) => {
                const sc = statusColor(b.status)
                const senderName = typeof b.sentBy === 'object' ? (b.sentBy.name || b.sentBy.email) : b.sentBy
                return (
                  <tr key={b.id || b.broadcastId || i}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 650, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                          {b.subject || '(No Subject)'}
                        </span>
                        {senderName && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            by {senderName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatDate(b.sentAt || b.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                        <strong>{new Intl.NumberFormat().format(b.sentCount ?? b.recipientCount ?? 0)}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> / {new Intl.NumberFormat().format(b.recipientCount ?? 0)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="sa-broadcast-status-badge"
                        style={{
                          color: sc,
                          background: `color-mix(in srgb, ${sc} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${sc} 25%, transparent)`,
                        }}
                      >
                        {b.status || 'SENT'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="sa-btn sa-btn--sm sa-btn--ghost"
                          onClick={() => setSelectedId(b.id || b.broadcastId)}
                          title="View broadcast details & recipients"
                          style={{ padding: '0 10px', height: 28, fontSize: '0.75rem', gap: 4 }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="sa-btn sa-btn--sm sa-btn--primary"
                          onClick={() => setResendBroadcast(b)}
                          title="Resend to subscribers or custom email addresses"
                          style={{ padding: '0 10px', height: 28, fontSize: '0.75rem', gap: 4 }}
                        >
                          <RefreshCw size={12} /> Resend
                        </button>
                        {onReuseInCompose && (
                          <button
                            type="button"
                            className="sa-btn sa-btn--sm sa-btn--ghost"
                            onClick={() => onReuseInCompose(b)}
                            title="Copy into Compose tab"
                            style={{ padding: '0 8px', height: 28, fontSize: '0.75rem' }}
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {hasMore && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={() => load(page + 1)} disabled={loading}>
              Load more broadcasts
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
