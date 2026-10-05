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
  const [selectedId, setSelectedId] = useState(null)
  const [resendBroadcast, setResendBroadcast] = useState(null)
  const [previewHtmlItem, setPreviewHtmlItem] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setErr('')
    try {
      const data = await superadminService.listProductEmailBroadcasts({ page: p, limit: 20 })
      const list = data.broadcasts || data.items || data.data || []
      setBroadcasts(p === 1 ? list : (prev) => [...prev, ...list])
      setHasMore(list.length === 20)
      setPage(p)
    } catch (e) {
      setErr(e.message || 'Failed to load broadcasts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load, refreshKey])

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

      <div className="sa-broadcast-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Inbox size={16} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Broadcast History
          </h3>
        </div>
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
          Refresh
        </button>
      </div>

      <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
        {err && <div className="sa-alert sa-alert--error"><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}

        {loading && broadcasts.length === 0 && (
          <div className="sa-loading" style={{ padding: '60px 0' }}><span className="sa-spinner" /> Loading broadcasts…</div>
        )}

        {!loading && broadcasts.length === 0 && !err && (
          <div className="sa-empty" style={{ padding: '60px 0' }}>
            <Mail className="sa-empty-icon" size={42} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>No broadcasts sent yet.</p>
            <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Dispatched announcements will appear here with delivery details and resend options.
            </p>
          </div>
        )}

        {broadcasts.length > 0 && (
          <div className="sa-broadcast-history-table">
            <div className="sa-broadcast-table-row sa-broadcast-table-row--header">
              {['Subject', 'Sent Date', 'Recipients', 'Status', 'Actions'].map((h, i) => (
                <span key={h} style={{ textAlign: i === 4 ? 'right' : 'left' }}>
                  {h}
                </span>
              ))}
            </div>

            {broadcasts.map((b, i) => {
              const sc = statusColor(b.status)
              return (
                <div
                  key={b.id || b.broadcastId || i}
                  className={`sa-broadcast-table-row${i % 2 === 1 ? ' sa-broadcast-table-row--stripe' : ''}`}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.subject || '(No Subject)'}
                    </p>
                    {b.sentBy && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        by {typeof b.sentBy === 'object' ? (b.sentBy.name || b.sentBy.email) : b.sentBy}
                      </p>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(b.sentAt || b.createdAt)}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                    <strong>{new Intl.NumberFormat().format(b.sentCount ?? b.recipientCount ?? 0)}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}> / {new Intl.NumberFormat().format(b.recipientCount ?? 0)}</span>
                  </div>

                  <div>
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
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="sa-btn sa-btn--sm sa-btn--ghost"
                      onClick={() => setSelectedId(b.id || b.broadcastId)}
                      title="View broadcast details & recipients"
                      style={{ padding: '0 10px', height: 30, fontSize: '0.75rem', gap: 4 }}
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      type="button"
                      className="sa-btn sa-btn--sm sa-btn--primary"
                      onClick={() => setResendBroadcast(b)}
                      title="Resend to subscribers or custom email addresses"
                      style={{ padding: '0 10px', height: 30, fontSize: '0.75rem', gap: 4 }}
                    >
                      <RefreshCw size={12} /> Resend
                    </button>
                    {onReuseInCompose && (
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--ghost"
                        onClick={() => onReuseInCompose(b)}
                        title="Copy into Compose tab"
                        style={{ padding: '0 8px', height: 30, fontSize: '0.75rem' }}
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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
