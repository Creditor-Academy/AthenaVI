import { useState, useRef } from 'react'
import { Mail, Send, AlertTriangle, CheckCircle, Users } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

/* ── helpers ─────────────────────────────────────────────── */

function ResultCard({ result }) {
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
            <strong
              className="sa-heygen-tile-value"
              style={{ color: '#4ade80' }}
            >
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

/* ── preview modal ────────────────────────────────────────── */

function HtmlPreview({ html, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Email HTML preview"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          width: 'min(700px, 96vw)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          className="sa-card-header"
          style={{ flexShrink: 0 }}
        >
          <h3 style={{ margin: 0 }}>HTML Preview</h3>
          <button
            type="button"
            className="sa-btn sa-btn--sm"
            onClick={onClose}
            aria-label="Close preview"
          >
            Close
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          <iframe
            title="Email HTML preview"
            srcDoc={html}
            sandbox="allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              border: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── confirm dialog ───────────────────────────────────────── */

function ConfirmDialog({ subject, recipientEstimate, onConfirm, onCancel, loading }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm broadcast"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border-color))',
          borderRadius: 14,
          width: 'min(440px, 96vw)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'color-mix(in srgb, #f59e0b 15%, transparent)',
              border: '1px solid color-mix(in srgb, #f59e0b 30%, var(--border-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#f59e0b',
            }}
          >
            <Send size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Send broadcast email?</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              This action cannot be undone.
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.8125rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Subject: </span>
            <span style={{ wordBreak: 'break-word' }}>{subject}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <Users size={12} />
            <span>
              Will be sent to all users with product emails enabled
            </span>
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
        <button
          type="button"
          className="sa-btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="sa-btn sa-btn--primary"
          style={{
            background: valid
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : undefined,
            borderColor: valid ? '#f59e0b' : undefined,
          }}
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
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [plainText, setPlainText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

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
      setResult(data)
      setShowConfirm(false)
      // reset form
      setSubject('')
      setHtml('')
      setPlainText('')
    } catch (err) {
      setShowConfirm(false)
      setError(err.message || 'Broadcast failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewBroadcast = () => {
    setResult(null)
    setError('')
    setTimeout(() => subjectRef.current?.focus(), 50)
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Product email broadcast</h2>
          <p className="sa-panel-desc">
            Send a one-time product email to all users who have opted in to product communications.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary)',
            flexShrink: 0,
          }}
        >
          <Mail size={13} />
          Email only · no inbox notification
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* How it works info strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in srgb, #38bdf8 8%, transparent)',
            border: '1px solid color-mix(in srgb, #38bdf8 25%, var(--border-color))',
            fontSize: '0.8125rem',
            color: 'color-mix(in srgb, #38bdf8 90%, var(--text-main))',
            marginBottom: 4,
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Only users with <strong>product emails</strong> enabled in their notification settings will receive this.
            This cannot be undone once sent.
          </span>
        </div>

        {/* Success result */}
        {result && (
          <>
            <ResultCard result={result} />
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="sa-btn sa-btn--primary"
                onClick={handleNewBroadcast}
              >
                <Mail size={13} />
                Compose new broadcast
              </button>
            </div>
          </>
        )}

        {/* Compose form — hidden after success */}
        {!result && (
          <form
            className="sa-card"
            style={{ marginTop: 8 }}
            onSubmit={(e) => {
              e.preventDefault()
              if (canSubmit) setShowConfirm(true)
            }}
          >
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

              {/* Subject */}
              <div className="sa-field">
                <label htmlFor="broadcast-subject">
                  Subject <span style={{ color: '#f87171' }}>*</span>
                </label>
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
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                  {subject.length}/200
                </span>
              </div>

              {/* HTML body */}
              <div className="sa-field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label htmlFor="broadcast-html" style={{ marginBottom: 0 }}>
                    HTML body <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  {canPreview && (
                    <button
                      type="button"
                      className="sa-btn sa-btn--sm sa-btn--ghost"
                      onClick={() => setShowPreview(true)}
                      disabled={loading}
                    >
                      Preview
                    </button>
                  )}
                </div>
                <textarea
                  id="broadcast-html"
                  className="sa-input"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: 220,
                    resize: 'vertical',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.8125rem',
                    padding: '10px 12px',
                    height: 'auto',
                  }}
                  placeholder={'<p>Hello,</p>\n<p>We\'re excited to share…</p>'}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  required
                  disabled={loading}
                  spellCheck={false}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                  Full HTML is supported. Use inline styles for maximum email client compatibility.
                </span>
              </div>

              {/* Plain text (optional) */}
              <div className="sa-field">
                <label htmlFor="broadcast-text">
                  Plain text fallback{' '}
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="broadcast-text"
                  className="sa-input"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: 80,
                    resize: 'vertical',
                    fontSize: '0.8125rem',
                    padding: '10px 12px',
                    height: 'auto',
                  }}
                  placeholder="Plain-text version for email clients that don't render HTML…"
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Submit row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                  paddingTop: 4,
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                {canPreview && (
                  <button
                    type="button"
                    className="sa-btn"
                    onClick={() => setShowPreview(true)}
                    disabled={loading}
                  >
                    Preview HTML
                  </button>
                )}
                <button
                  type="submit"
                  className="sa-btn sa-btn--primary"
                  disabled={!canSubmit || loading}
                >
                  <Send size={13} />
                  {loading ? 'Sending…' : 'Send broadcast…'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* HTML preview modal */}
      {showPreview && (
        <HtmlPreview html={html} onClose={() => setShowPreview(false)} />
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          subject={subject}
          onConfirm={handleSendConfirmed}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

export default SuperadminBroadcastPanel
