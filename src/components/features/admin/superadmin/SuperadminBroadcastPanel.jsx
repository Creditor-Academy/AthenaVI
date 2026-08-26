import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Mail, Send, Users, Eye, X, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2, LayoutTemplate, Type, Code2, FileText, Inbox, Hash } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import { EMAIL_TEMPLATES } from './broadcastTemplates'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function statusColor(status) {
  if (status === 'sent' || status === 'completed') return '#4ade80'
  if (status === 'failed') return '#f87171'
  if (status === 'sending') return '#38bdf8'
  return 'var(--text-muted)'
}

function recipientLabel(count) {
  if (!count && count !== 0) return '—'
  return `${new Intl.NumberFormat().format(count)} recipients`
}

// ── Template editor helpers ───────────────────────────────────────────────────
// (no longer needed — templates are body-only, header/footer come from backend)

// ── Template picker modal ─────────────────────────────────────────────────────

function TemplatePickerModal({ onSelect, onClose }) {
  const [active, setActive] = useState(EMAIL_TEMPLATES[0].id)
  const activeTemplate = EMAIL_TEMPLATES.find((t) => t.id === active) || EMAIL_TEMPLATES[0]
  const previewHtml = activeTemplate.html

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const insertTemplate = () => {
    onSelect({ ...activeTemplate })
    onClose()
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="template-picker-title"
        style={{
          width: '100%', maxWidth: 880,
          height: 'min(82vh, 720px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px', flexShrink: 0,
        }}>
          <div>
            <h2 id="template-picker-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Choose a starting template
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              This fills the subject and body in the editor. It does not send the email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{
          display: 'flex', gap: 6, padding: '0 20px 14px', flexShrink: 0, flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {EMAIL_TEMPLATES.map((t) => {
            const isActive = active === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                style={{
                  appearance: 'none',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isActive ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  padding: '7px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'color-mix(in srgb, var(--text-muted) 5%, var(--bg-card))' }}>
          <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activeTemplate.description}
            </p>
            {activeTemplate.subject && (
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
                {activeTemplate.subject}
              </p>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: 16, overflow: 'hidden' }}>
            {activeTemplate.id === 'custom' ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                border: '1px dashed var(--border-color)', borderRadius: 12, background: 'var(--bg-card)',
              }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Start from scratch</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inserts an empty subject and body.</p>
              </div>
            ) : (
              <div style={{
                height: '100%', borderRadius: 12, overflow: 'hidden',
                border: '1px solid var(--border-color)', background: '#fff',
              }}>
                <iframe
                  key={activeTemplate.id}
                  srcDoc={previewHtml}
                  title={`${activeTemplate.label} preview`}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </div>

        <div style={{
          flexShrink: 0, padding: '12px 20px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        }}>
          <button type="button" className="sa-btn sa-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--primary"
            onClick={insertTemplate}
            style={{ gap: 7, height: 38, padding: '0 16px' }}
          >
            Insert into editor
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}



function PreviewModal({ html, subject, onClose }) {
  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860,
          height: '92vh',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
          background: 'color-mix(in srgb, var(--bg-card) 95%, transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: 'color-mix(in srgb, var(--primary) 14%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))',
              color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={13} />
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Email preview
              </p>
              {subject && (
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Subject: {subject}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 18%, transparent)'; e.currentTarget.style.color = 'var(--text-main)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 10%, transparent)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Fake email client chrome */}
        <div style={{
          background: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          padding: '8px 16px',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
          ))}
          <span style={{
            flex: 1, marginLeft: 8, background: '#fff',
            border: '1px solid #d1d5db', borderRadius: 6,
            padding: '3px 10px', fontSize: '0.6875rem', color: '#6b7280',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subject || 'Email preview'}
          </span>
        </div>

        {/* iframe */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#fff' }}>
          <iframe
            srcDoc={html}
            title="email preview"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}



function BroadcastRow({ broadcast, isSelected, onClick }) {
  const color = statusColor(broadcast.status)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', border: 'none',
        padding: '9px 12px 9px 14px', cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        borderLeft: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
        background: isSelected
          ? 'color-mix(in srgb, var(--primary) 7%, transparent)'
          : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 4%, transparent)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)',
          lineHeight: 1.3, flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {broadcast.subject || '(no subject)'}
        </span>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.6 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, minWidth: 0 }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color, flexShrink: 0,
        }}>
          {broadcast.status || 'sent'}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recipientLabel(broadcast.recipientCount ?? broadcast.totalRecipients)} · {timeAgo(broadcast.sentAt || broadcast.createdAt)}
        </span>
      </div>
    </button>
  )
}

// ── Confirm overlay ───────────────────────────────────────────────────────────

function ConfirmSend({ subject, onConfirm, onCancel, sending }) {
  const [typed, setTyped] = useState('')
  const confirmed = typed.trim().toUpperCase() === 'SEND'

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '32px', maxWidth: 400, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)',
        }}>
          <Send size={22} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Ready to send?
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;{subject}&rdquo;</strong> will be delivered to{' '}
            <strong style={{ color: 'var(--primary)' }}>all active users</strong> on the platform.
          </p>
        </div>

        {/* Type to confirm */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Type <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>SEND</strong> to confirm
          </p>
          <input
            type="text"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && confirmed && !sending) onConfirm() }}
            placeholder="Type SEND…"
            style={{
              width: '100%', boxSizing: 'border-box',
              height: 40, padding: '0 12px',
              borderRadius: 8,
              border: `1px solid ${confirmed ? 'color-mix(in srgb, var(--primary) 50%, var(--border-color))' : 'var(--border-color)'}`,
              background: confirmed ? 'color-mix(in srgb, var(--primary) 6%, var(--bg-card))' : 'var(--bg-card)',
              color: 'var(--text-main)', font: 'inherit', fontSize: '0.875rem',
              textAlign: 'center', letterSpacing: '0.05em',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button type="button" className="sa-btn" onClick={onCancel} disabled={sending} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--primary"
            onClick={onConfirm}
            disabled={!confirmed || sending}
            style={{ flex: 1, gap: 6 }}
          >
            {sending
              ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Sending…</>
              : <><Send size={13} /> Send it</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Success state ─────────────────────────────────────────────────────────────

function SendSuccess({ subject, onDismiss }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 32, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, color-mix(in srgb, #4ade80 14%, var(--bg-card)), color-mix(in srgb, #4ade80 24%, var(--bg-card)))',
        border: '1px solid color-mix(in srgb, #4ade80 30%, var(--border-color))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#4ade80',
      }}>
        <CheckCircle2 size={30} />
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)' }}>Broadcast sent</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-main)' }}>&ldquo;{subject}&rdquo;</strong> is on its way to all users.
        </p>
      </div>
      <button type="button" className="sa-btn sa-btn--ghost" onClick={onDismiss}>
        Write another
      </button>
    </div>
  )
}

// ── Broadcast detail modal ────────────────────────────────────────────────────

const DETAIL_TABS = ['Overview', 'Recipients']

function RecipientsTab({ broadcastId }) {
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async (p = 1, status = statusFilter) => {
    setLoading(true)
    setErr('')
    try {
      const data = await superadminService.listProductEmailBroadcastRecipients(broadcastId, { page: p, limit: 50, status: status || undefined })
      const list = data.recipients || data.items || data.data || []
      setRecipients(p === 1 ? list : (prev) => [...prev, ...list])
      setHasMore(list.length === 50)
      setPage(p)
    } catch (e) {
      setErr(e.message || 'Failed to load recipients')
    } finally {
      setLoading(false)
    }
  }, [broadcastId, statusFilter])

  useEffect(() => { load(1) }, [broadcastId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (s) => {
    setStatusFilter(s)
    setRecipients([])
    load(1, s)
  }

  const rcColor = (s) => {
    if (s === 'sent' || s === 'delivered') return '#4ade80'
    if (s === 'failed' || s === 'bounced') return '#f87171'
    if (s === 'pending') return '#f59e0b'
    return 'var(--text-muted)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['', 'SENT', 'FAILED'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => handleFilter(s)}
            style={{
              height: 26, padding: '0 10px', borderRadius: 6, border: '1px solid',
              fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
              borderColor: statusFilter === s ? 'var(--primary)' : 'var(--border-color)',
              background: statusFilter === s ? 'color-mix(in srgb, var(--primary) 14%, var(--bg-card))' : 'transparent',
              color: statusFilter === s ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.12s',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {err && <div className="sa-alert sa-alert--error"><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}

      {loading && recipients.length === 0 && (
        <div className="sa-loading" style={{ padding: '24px 0' }}><span className="sa-spinner" /> Loading recipients…</div>
      )}

      {!loading && recipients.length === 0 && !err && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          No recipients found.
        </div>
      )}

      {/* Recipient rows */}
      {recipients.length > 0 && (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto',
            padding: '7px 14px', gap: 12,
            background: 'color-mix(in srgb, var(--bg-card) 70%, transparent)',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {['Recipient', 'Status', 'Sent at'].map((h) => (
              <span key={h} style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{h}</span>
            ))}
          </div>
          {recipients.map((r, i) => {
            const name = r.name || r.userName || ''
            const email = r.email || r.userEmail || ''
            const status = r.status || r.deliveryStatus || ''
            const sc = rcColor(status)
            return (
              <div key={r.id || r.userId || i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                padding: '9px 14px', gap: 12, alignItems: 'center',
                borderBottom: i < recipients.length - 1 ? '1px solid var(--border-color)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--text-muted) 2%, transparent)',
              }}>
                <div style={{ minWidth: 0 }}>
                  {name && <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>}
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
                </div>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: sc,
                  background: `color-mix(in srgb, ${sc} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${sc} 22%, transparent)`,
                  borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap',
                }}>
                  {status || '—'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {r.sentAt || r.deliveredAt ? timeAgo(r.sentAt || r.deliveredAt) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={() => load(page + 1)} disabled={loading}>
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

function BroadcastDetailModal({ broadcastId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!broadcastId) return
    setLoading(true)
    setErr('')
    setDetail(null)
    superadminService.getProductEmailBroadcast(broadcastId)
      .then((d) => setDetail(d.broadcast || d))
      .catch((e) => setErr(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [broadcastId])

  const color = detail ? statusColor(detail.status) : 'var(--text-muted)'

  return createPortal(
    <>
      {previewOpen && detail?.html && (
        <PreviewModal html={detail.html} subject={detail.subject} onClose={() => setPreviewOpen(false)} />
      )}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560,
            maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Modal header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 5%, var(--bg-card)), var(--bg-card))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--bg-card)), color-mix(in srgb, var(--primary) 28%, var(--bg-card)))',
                border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color))',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={15} />
              </span>
              <div>
                <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {detail?.subject || (loading ? 'Loading…' : 'Broadcast detail')}
                </p>
                {detail && (
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {formatDate(detail.sentAt || detail.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 20%, transparent)'; e.currentTarget.style.color = 'var(--text-main)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 10%, transparent)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="sa-tab-bar" style={{ flexShrink: 0 }}>
            {DETAIL_TABS.map((t) => (
              <button key={t} type="button" className={`sa-tab${activeTab === t ? ' sa-tab--active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {loading && activeTab === 'Overview' && <div className="sa-loading" style={{ padding: '40px 0' }}><span className="sa-spinner" /> Loading…</div>}
            {err && <div className="sa-alert sa-alert--error"><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}

            {activeTab === 'Overview' && detail && !loading && (
              <>
                {/* Status + recipient hero row */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: 10,
                    border: `1px solid color-mix(in srgb, ${color} 25%, var(--border-color))`,
                    background: `color-mix(in srgb, ${color} 6%, var(--bg-card))`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status</span>
                      <strong style={{ fontSize: '0.9375rem', color, letterSpacing: '-0.01em' }}>{detail.status || 'sent'}</strong>
                    </div>
                  </div>
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: 10,
                    border: '1px solid color-mix(in srgb, var(--primary) 22%, var(--border-color))',
                    background: 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'color-mix(in srgb, var(--primary) 16%, transparent)',
                      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={15} />
                    </span>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Recipients</span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                        {new Intl.NumberFormat().format(detail.recipientCount ?? detail.totalRecipients ?? 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Detail rows */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
                  {[
                    { label: 'Subject', value: detail.subject },
                    { label: 'Sent at', value: formatDate(detail.sentAt || detail.createdAt) },
                    { label: 'Broadcast ID', value: detail.id || detail.broadcastId },
                    ...(detail.sentBy ? [{ label: 'Sent by', value: typeof detail.sentBy === 'object' ? (detail.sentBy.name || detail.sentBy.email || detail.sentBy.id || JSON.stringify(detail.sentBy)) : detail.sentBy }] : []),
                    ...(detail.failedCount != null ? [{ label: 'Failed deliveries', value: String(detail.failedCount) }] : []),
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
                      padding: '11px 14px',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                      background: i % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--text-muted) 2%, transparent)',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-main)', textAlign: 'right', wordBreak: 'break-all' }}>
                        {value != null && typeof value === 'object' ? JSON.stringify(value) : (value || '—')}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Preview button */}
                {detail.html && (
                  <button
                    type="button"
                    className="sa-btn sa-btn--ghost"
                    onClick={() => setPreviewOpen(true)}
                    style={{ gap: 7, alignSelf: 'stretch', justifyContent: 'center', height: 40 }}
                  >
                    <Eye size={14} />
                    Preview email HTML
                  </button>
                )}
              </>
            )}

            {activeTab === 'Recipients' && (
              <RecipientsTab broadcastId={broadcastId} />
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Compose pane ──────────────────────────────────────────────────────────────

const PLACEHOLDER_HTML = `<h2 style="margin:0 0 12px;font-family:sans-serif">Hello!</h2>
<p style="margin:0 0 10px;font-family:sans-serif;color:#555">Write your broadcast content here.</p>
<p style="margin:0;font-family:sans-serif;color:#555">HTML is supported — use headings, links, and basic formatting.</p>`

function ComposePane({ onSent }) {
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [text, setText] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(null)

  const canSend = subject.trim().length > 0 && html.trim().length > 0

  const handleSend = async () => {
    setSending(true)
    setErr('')
    try {
      await superadminService.sendProductEmailBroadcast({ subject: subject.trim(), html: html.trim(), text: text.trim() || undefined })
      setSent(subject.trim())
      setShowConfirm(false)
      onSent?.()
    } catch (e) {
      setErr(e.message || 'Failed to send broadcast')
      setShowConfirm(false)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return <SendSuccess subject={sent} onDismiss={() => { setSent(null); setSubject(''); setHtml(''); setText('') }} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showConfirm && (
        <ConfirmSend subject={subject} onConfirm={handleSend} onCancel={() => setShowConfirm(false)} sending={sending} />
      )}
      {previewOpen && (
        <PreviewModal html={html || PLACEHOLDER_HTML} subject={subject} onClose={() => setPreviewOpen(false)} />
      )}
      {templateOpen && (
        <TemplatePickerModal
          onSelect={(t) => {
            if (t.subject) setSubject(t.subject)
            if (t.html !== undefined) setHtml(t.html)
          }}
          onClose={() => setTemplateOpen(false)}
        />
      )}

      {/* Composer header + actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '16px 18px 14px', flexShrink: 0,
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, var(--bg-card)) 0%, var(--bg-card) 70%)',
        borderBottom: '1px solid color-mix(in srgb, var(--primary) 18%, var(--border-color))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, var(--bg-card)), color-mix(in srgb, var(--primary) 38%, var(--bg-card)))',
            border: '1px solid color-mix(in srgb, var(--primary) 35%, var(--border-color))',
            color: 'var(--primary)',
          }}>
            <Mail size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 className="sa-panel-title" style={{ fontSize: '1.05rem' }}>Email broadcast</h2>
            <span style={{
              marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)',
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--primary) 22%, transparent)',
              borderRadius: 999, padding: '2px 8px',
            }}>
              <Users size={11} />
              All active users
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setTemplateOpen(true)}
            style={{ gap: 5 }}
          >
            <LayoutTemplate size={13} />
            Templates
          </button>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setPreviewOpen(true)}
            style={{ gap: 5 }}
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            type="button" className="sa-btn sa-btn--sm sa-btn--primary"
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
            style={{ gap: 5 }}
          >
            <Send size={13} />
            Send
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 18px 0', flexShrink: 0 }}>
        <label htmlFor="broadcast-subject" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: 8,
        }}>
          <Type size={12} />
          Subject
        </label>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid color-mix(in srgb, var(--primary) 22%, var(--border-color))',
          borderRadius: 10,
          background: 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))',
          padding: '0 12px',
        }}>
          <Hash size={14} style={{ color: 'var(--primary)', flexShrink: 0, opacity: 0.85 }} />
          <input
            id="broadcast-subject"
            type="text"
            aria-label="Subject"
            placeholder="What is this email about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            style={{
              flex: 1, minWidth: 0, boxSizing: 'border-box',
              border: 'none', outline: 'none',
              background: 'transparent',
              color: 'var(--text-main)', font: 'inherit', fontSize: '0.95rem', fontWeight: 600,
              padding: '11px 0', letterSpacing: '-0.01em',
              caretColor: 'var(--primary)',
            }}
          />
        </div>
      </div>

      {err && (
        <div className="sa-alert sa-alert--error" style={{ margin: '10px 18px 0', flexShrink: 0 }}>
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{err}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: '12px 18px 0' }}>
        <label htmlFor="broadcast-html" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: 8, flexShrink: 0,
        }}>
          <Code2 size={12} />
          HTML body
        </label>
        <textarea
          id="broadcast-html"
          aria-label="HTML body"
          placeholder="Write your HTML email body here…"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          style={{
            flex: 1, width: '100%', boxSizing: 'border-box',
            border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--border-color))',
            borderRadius: 10, outline: 'none', resize: 'none',
            background: 'color-mix(in srgb, var(--primary) 4%, var(--bg-card))',
            color: 'var(--text-main)',
            fontSize: '0.8125rem', lineHeight: 1.7,
            padding: '12px 14px', fontFamily: '"Fira Code", "Consolas", monospace',
            caretColor: 'var(--primary)', minHeight: 0,
          }}
        />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px 12px', flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => setShowText(!showText)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--border-color))',
            borderRadius: 8, cursor: 'pointer', font: 'inherit',
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', padding: '5px 10px',
          }}
        >
          <FileText size={13} />
          {showText ? 'Hide plain text' : 'Add plain-text fallback'}
        </button>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.7rem', fontWeight: 600,
          color: html.length > 10000 ? '#f87171' : 'var(--text-muted)',
        }}>
          <Code2 size={12} />
          {html.length.toLocaleString()} chars
        </span>
      </div>

      {/* Plain text fallback */}
      {showText && (
        <div style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
          <textarea
            placeholder="Plain-text fallback (optional)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%', border: 'none', outline: 'none', resize: 'none',
              background: 'color-mix(in srgb, var(--text-muted) 4%, transparent)',
              color: 'var(--text-main)', font: 'inherit',
              fontSize: '0.8125rem', lineHeight: 1.6,
              padding: 16, minHeight: 100, boxSizing: 'border-box',
              caretColor: 'var(--primary)',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ── History pane ──────────────────────────────────────────────────────────────

function HistoryPane({ refreshKey }) {
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [selectedId, setSelectedId] = useState(null)
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

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 14px 10px', flexShrink: 0,
      }}>
        <h3 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-main)' }}>
          <Inbox size={14} style={{ color: 'var(--primary)' }} />
          Sent
        </h3>
        <button
          type="button"
          className="sa-btn sa-btn--sm sa-btn--ghost"
          onClick={() => load(1)}
          disabled={loading}
          aria-label="Refresh broadcasts"
          title="Refresh"
          style={{ gap: 0, padding: '4px 7px' }}
        >
          <RefreshCw size={12} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
        </button>
      </div>

      {/* Always-visible list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {err && <div className="sa-alert sa-alert--error" style={{ margin: 12 }}><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}
        {loading && broadcasts.length === 0 && (
          <div className="sa-loading"><span className="sa-spinner" /> Loading…</div>
        )}
        {!loading && broadcasts.length === 0 && !err && (
          <div className="sa-empty">
            <Mail className="sa-empty-icon" size={36} />
            <p style={{ marginTop: 10 }}>No broadcasts sent yet.</p>
            <p style={{ marginTop: 4, fontSize: '0.75rem' }}>Your sent emails will appear here.</p>
          </div>
        )}
        {broadcasts.map((b) => (
          <BroadcastRow
            key={b.id || b.broadcastId}
            broadcast={b}
            isSelected={false}
            onClick={() => setSelectedId(b.id || b.broadcastId)}
          />
        ))}
        {hasMore && (
          <div style={{ padding: 12, textAlign: 'center' }}>
            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={() => load(page + 1)} disabled={loading}>
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

function SuperadminBroadcastPanel() {
  const [historyKey, setHistoryKey] = useState(0)

  return (
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 0 }}>
      <div className="sa-card" style={{
        flex: 1, minHeight: 0, overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        transition: 'none',
      }}>
        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ComposePane onSent={() => setHistoryKey((k) => k + 1)} />
        </div>
        <div style={{
          minHeight: 0, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)',
          background: 'color-mix(in srgb, var(--text-muted) 3%, var(--bg-card))',
        }}>
          <HistoryPane refreshKey={historyKey} />
        </div>
      </div>
    </div>
  )
}

export default SuperadminBroadcastPanel
