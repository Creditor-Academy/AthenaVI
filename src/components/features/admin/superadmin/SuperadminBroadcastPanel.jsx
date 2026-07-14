import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Mail, Send, Clock, Users, Eye, X, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2, LayoutTemplate, Pencil, RotateCcw } from 'lucide-react'
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

function applyEdits(html, edits) {
  let out = html
  out = out.replace(/background:linear-gradient\(135deg,[^)]+\)/g,
    `background:linear-gradient(135deg,${edits.gradStart},${edits.gradEnd})`)
  if (edits.headerTitle)
    out = out.replace(/(<h1[^>]*>)[^<]*(<\/h1>)/, `$1${edits.headerTitle}$2`)
  if (edits.headerSub)
    out = out.replace(/(<h1[^>]*>[^<]*<\/h1>\s*<p[^>]*>)[^<]*(<\/p>)/, `$1${edits.headerSub}$2`)
  return out
}

function defaultEdits(template) {
  const titleM = template.html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const subM = template.html.match(/<h1[^>]*>[^<]*<\/h1>\s*<p[^>]*>([^<]*)<\/p>/)
  return {
    gradStart: '#0284c7',
    gradEnd: '#7c3aed',
    headerTitle: titleM ? titleM[1] : '',
    headerSub: subM ? subM[1] : '',
  }
}

// ── Template picker modal ─────────────────────────────────────────────────────

function TemplatePickerModal({ onSelect, onClose }) {
  const [active, setActive] = useState(EMAIL_TEMPLATES[0].id)
  const [editing, setEditing] = useState(false)
  const [edits, setEdits] = useState(() => defaultEdits(EMAIL_TEMPLATES[0]))
  const activeTemplate = EMAIL_TEMPLATES.find((t) => t.id === active) || EMAIL_TEMPLATES[0]
  const previewHtml = editing && activeTemplate.id !== 'custom' ? applyEdits(activeTemplate.html, edits) : activeTemplate.html
  const dotColor = (t) => t.accentColor === 'var(--text-muted)' ? '#94a3b8' : t.accentColor

  const switchTemplate = (id) => {
    const t = EMAIL_TEMPLATES.find((x) => x.id === id) || EMAIL_TEMPLATES[0]
    setActive(id); setEdits(defaultEdits(t)); setEditing(false)
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { if (editing) setEditing(false); else onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, editing])

  const EditorField = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 960,
          height: '90vh',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          gridTemplateColumns: '260px 1fr',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 48px 120px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Header spans full width ── */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'color-mix(in srgb, var(--primary) 16%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, var(--primary) 28%, var(--border-color))',
              color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {editing ? <Pencil size={13} /> : <LayoutTemplate size={14} />}
            </span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {editing ? `Customising: ${activeTemplate.label}` : 'Email templates'}
              </p>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {editing ? 'Edit colors & text · live preview on the right' : 'Select a template · preview it · use it'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {editing && (
              <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
                onClick={() => setEdits(defaultEdits(activeTemplate))} style={{ gap: 5 }}>
                <RotateCcw size={11} /> Reset
              </button>
            )}
            <button
              type="button" onClick={() => editing ? setEditing(false) : onClose()} aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 22%, transparent)'; e.currentTarget.style.color = 'var(--text-main)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 10%, transparent)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
          </div>
        </div>

        {/* ── Sidebar: template list OR edit controls ── */}
        {!editing ? (
        <div style={{
          borderRight: '1px solid var(--border-color)',
          overflowY: 'auto',
          background: 'color-mix(in srgb, var(--text-muted) 3%, var(--bg-card))',
          display: 'flex', flexDirection: 'column',
        }}>
          <p style={{
            margin: 0, padding: '12px 14px 8px',
            fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--text-muted)',
          }}>
            Templates
          </p>
          {EMAIL_TEMPLATES.map((t) => {
            const isActive = active === t.id
            const dc = dotColor(t)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTemplate(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  border: 'none',
                  borderLeft: isActive ? `3px solid ${dc}` : '3px solid transparent',
                  borderBottom: '1px solid var(--border-color)',
                  background: isActive
                    ? `color-mix(in srgb, ${dc} 9%, var(--bg-card))`
                    : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 5%, transparent)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                  background: dc,
                  boxShadow: isActive ? `0 0 0 3px color-mix(in srgb, ${dc} 25%, transparent)` : 'none',
                  transition: 'box-shadow 0.15s',
                }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    color: 'var(--text-main)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{t.label}</p>
                  <p style={{
                    margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4,
                  }}>{t.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        ) : (
        /* ── Editor controls ── */
        <div style={{
          borderRight: '1px solid var(--border-color)', overflowY: 'auto',
          background: 'color-mix(in srgb, var(--text-muted) 3%, var(--bg-card))',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Gradient section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Header gradient</p>
            {[['gradStart', 'Start color'], ['gradEnd', 'End color']].map(([key, lbl]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{lbl}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={edits[key]} onChange={(e) => setEdits(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: 34, height: 34, borderRadius: 7, border: '1px solid var(--border-color)', cursor: 'pointer', padding: 2, background: 'var(--bg-card)', flexShrink: 0 }} />
                  <input type="text" value={edits[key]} onChange={(e) => setEdits(p => ({ ...p, [key]: e.target.value }))}
                    className="sa-input" style={{ flex: 1, height: 32, fontSize: '0.75rem', fontFamily: 'monospace' }} />
                </div>
              </div>
            ))}
            <div style={{ height: 26, borderRadius: 7, background: `linear-gradient(135deg,${edits.gradStart},${edits.gradEnd})`, border: '1px solid var(--border-color)' }} />
          </div>
          {/* Header text section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Header text</p>
            {[['headerTitle', 'Title'], ['headerSub', 'Subtitle']].map(([key, lbl]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{lbl}</label>
                <input type="text" value={edits[key]} onChange={(e) => setEdits(p => ({ ...p, [key]: e.target.value }))}
                  className="sa-input" style={{ height: 34, fontSize: '0.8125rem' }} placeholder={lbl} />
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Body copy and CTA text can be edited directly in the compose area after using the template.
          </p>
        </div>
        )}

        {/* ── Preview pane ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Preview area */}
          <div style={{ flex: 1, overflow: 'hidden', background: '#fff', minHeight: 0 }}>
            {activeTemplate.id === 'custom' ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14,
                background: '#f9fafb',
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
                }}>
                  <LayoutTemplate size={28} strokeWidth={1.5} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#374151' }}>Empty canvas</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>Write your email from scratch</p>
              </div>
            ) : (
              <iframe
                key={`${activeTemplate.id}-${editing}-${edits.gradStart}-${edits.gradEnd}`}
                srcDoc={previewHtml}
                title={`${activeTemplate.label} preview`}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                sandbox="allow-same-origin"
              />
            )}
          </div>

          {/* CTA footer */}
          <div style={{
            flexShrink: 0, padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                {activeTemplate.label}
              </p>
              {activeTemplate.subject && (
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Subject: {activeTemplate.subject}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {activeTemplate.id !== 'custom' && !editing && (
                <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
                  onClick={() => setEditing(true)} style={{ gap: 5 }}>
                  <Pencil size={12} /> Customise
                </button>
              )}
              <button
                type="button"
                className="sa-btn sa-btn--primary"
                onClick={() => {
                  const finalHtml = editing ? applyEdits(activeTemplate.html, edits) : activeTemplate.html
                  onSelect({ ...activeTemplate, html: finalHtml })
                  onClose()
                }}
                style={{ gap: 7, height: 40, padding: '0 20px' }}
              >
                <Send size={14} />
                {editing ? 'Use customised' : 'Use template'}
              </button>
            </div>
          </div>
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
        padding: '12px 16px', cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
        background: isSelected
          ? 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 8%, transparent), transparent)'
          : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'color-mix(in srgb, var(--text-muted) 4%, transparent)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3, flex: 1, minWidth: 0 }}>
          {broadcast.subject || '(no subject)'}
        </span>
        <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color, background: `color-mix(in srgb, ${color} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
          borderRadius: 4, padding: '2px 6px',
        }}>
          {broadcast.status || 'sent'}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {recipientLabel(broadcast.recipientCount ?? broadcast.totalRecipients)}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {timeAgo(broadcast.sentAt || broadcast.createdAt)}
        </span>
      </div>
    </button>
  )
}

// ── Confirm overlay ───────────────────────────────────────────────────────────

function ConfirmSend({ subject, recipientCount, onConfirm, onCancel, sending }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'color-mix(in srgb, var(--bg-card) 92%, transparent)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 12,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 14, padding: '28px 32px', maxWidth: 360, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--bg-card)), color-mix(in srgb, var(--primary) 30%, var(--bg-card)))',
          border: '1px solid color-mix(in srgb, var(--primary) 35%, var(--border-color))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)',
        }}>
          <Send size={22} />
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Ready to send?</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;{subject}&rdquo;</strong> will be delivered to
            <strong style={{ color: 'var(--primary)' }}> all active users</strong> on the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
          <button type="button" className="sa-btn" onClick={onCancel} disabled={sending} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="button" className="sa-btn sa-btn--primary" onClick={onConfirm} disabled={sending} style={{ flex: 1 }}>
            {sending ? <><span className="sa-spinner" style={{ width: 14, height: 14 }} /> Sending…</> : 'Send it'}
          </button>
        </div>
      </div>
    </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
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

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--bg-card)), color-mix(in srgb, var(--primary) 28%, var(--bg-card)))',
            border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border-color))',
            color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail size={14} />
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>New broadcast</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setTemplateOpen(true)}
            style={{ gap: 5 }}
          >
            <LayoutTemplate size={12} />
            Templates
          </button>
          <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setPreviewOpen(true)}
            style={{ gap: 5 }}
          >
            <Eye size={12} />
            Preview
          </button>
          <button
            type="button" className="sa-btn sa-btn--sm sa-btn--primary"
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
            style={{ gap: 5 }}
          >
            <Send size={12} />
            Send
          </button>
        </div>
      </div>

      {/* Subject line */}
      <div style={{
        padding: '0 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Subject line…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            color: 'var(--text-main)', font: 'inherit', fontSize: '1rem', fontWeight: 650,
            padding: '14px 0', letterSpacing: '-0.01em',
            caretColor: 'var(--primary)',
          }}
        />
      </div>

      {err && (
        <div className="sa-alert sa-alert--error" style={{ margin: '12px 16px 0', flexShrink: 0 }}>
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{err}
        </div>
      )}

      {/* Body area — always the editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <textarea
          placeholder="Write your HTML email body here…"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            background: 'transparent', color: 'var(--text-main)',
            font: 'inherit', fontSize: '0.8125rem', lineHeight: 1.7,
            padding: '16px', fontFamily: '"Fira Code", "Consolas", monospace',
            caretColor: 'var(--primary)', minHeight: 0,
          }}
        />
      </div>

      {/* Footer: char count + plain text toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderTop: '1px solid var(--border-color)', flexShrink: 0,
        background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
      }}>
        <button
          type="button"
          onClick={() => setShowText(!showText)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', font: 'inherit',
            fontSize: '0.6875rem', color: 'var(--text-muted)', padding: 0,
          }}
        >
          {showText ? 'Hide plain text' : '+ Add plain-text fallback'}
        </button>
        <span style={{ fontSize: '0.6875rem', color: html.length > 10000 ? '#f87171' : 'var(--text-muted)' }}>
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

      {/* Pane header */}
      <div className="sa-card-header" style={{ flexShrink: 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Clock size={14} style={{ color: '#a78bfa' }} />
          Sent broadcasts
        </h3>
        <button type="button" className="sa-btn sa-btn--sm" onClick={() => load(1)} disabled={loading} style={{ gap: 5 }}>
          <RefreshCw size={11} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
          Refresh
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
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* Header */}
      <div className="sa-panel-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 className="sa-panel-title">Email broadcast</h2>
          <p className="sa-panel-desc">Write and send a product email to all active users on the platform.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.75rem', color: 'var(--text-muted)',
            background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
            border: '1px solid var(--border-color)',
            borderRadius: 8, padding: '5px 10px',
          }}>
            <Users size={12} />
            Sends to all users
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr minmax(260px, 340px)',
        gap: 16,
        overflow: 'hidden',
      }}>

        {/* Left: compose */}
        <div className="sa-card" style={{
          minHeight: 0, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <ComposePane onSent={() => setHistoryKey((k) => k + 1)} />
        </div>

        {/* Right: history */}
        <div className="sa-card" style={{
          minHeight: 0, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <HistoryPane refreshKey={historyKey} />
        </div>

      </div>
    </div>
  )
}

export default SuperadminBroadcastPanel
