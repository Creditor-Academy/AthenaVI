import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Send, Users, Edit3, X, AlertTriangle } from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'

export default function ResendBroadcastModal({ broadcast, onResendSuccess, onClose }) {
  const [recipientMode, setRecipientMode] = useState('all')
  const [customEmailsText, setCustomEmailsText] = useState('')
  const [typed, setTyped] = useState('')
  const [resending, setResending] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const parsedEmails = useMemo(() => {
    if (recipientMode === 'all') return []
    return customEmailsText
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'))
  }, [recipientMode, customEmailsText])

  const canResend = typed.trim().toUpperCase() === 'SEND' && (recipientMode === 'all' || parsedEmails.length > 0)

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    setErr('')
    try {
      const payload = {
        emails: recipientMode === 'custom' ? parsedEmails : undefined,
      }
      await superadminService.resendProductEmailBroadcast(broadcast.id || broadcast.broadcastId, payload)
      onResendSuccess?.()
      onClose()
    } catch (e) {
      if (String(broadcast.id || '').startsWith('bc-sample-')) {
        onResendSuccess?.()
        onClose()
      } else {
        setErr(e.message || 'Failed to resend broadcast')
      }
    } finally {
      setResending(false)
    }
  }

  return createPortal(
    <div className="sa-broadcast-backdrop" onClick={onClose}>
      <div className="sa-broadcast-modal sa-broadcast-modal--md" style={{ padding: '28px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sa-broadcast-modal-header-icon" style={{ width: 40, height: 40 }}>
              <Send size={18} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Resend Email Broadcast
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Broadcast: &ldquo;{broadcast.subject}&rdquo;
              </p>
            </div>
          </div>
          <button type="button" className="sa-broadcast-close-btn" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {err && (
          <div className="sa-alert sa-alert--error" style={{ marginBottom: 14 }}>
            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{err}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Choose Target Recipients
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setRecipientMode('all')}
              className={`sa-broadcast-audience-btn${recipientMode === 'all' ? ' sa-broadcast-audience-btn--active' : ''}`}
            >
              <Users size={15} />
              <div>
                <div>All Active Users</div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 400 }}>Platform subscribers</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientMode('custom')}
              className={`sa-broadcast-audience-btn${recipientMode === 'custom' ? ' sa-broadcast-audience-btn--active' : ''}`}
            >
              <Edit3 size={15} />
              <div>
                <div>Custom / Update Emails</div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 400 }}>Specify recipient list</span>
              </div>
            </button>
          </div>
        </div>

        {recipientMode === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Enter Recipient Emails (comma or line separated):
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                {parsedEmails.length} valid email{parsedEmails.length === 1 ? '' : 's'}
              </span>
            </div>
            <textarea
              className="sa-input"
              rows={4}
              placeholder="alice@example.com&#10;bob@example.com, charlie@company.com"
              value={customEmailsText}
              onChange={(e) => setCustomEmailsText(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.8125rem', lineHeight: 1.5 }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Type <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>SEND</strong> to confirm resending:
          </p>
          <input
            type="text"
            className="sa-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canResend && !resending) handleResend() }}
            placeholder="Type SEND…"
            style={{ textAlign: 'center', letterSpacing: '0.05em', fontWeight: 700 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="sa-btn" onClick={onClose} disabled={resending} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--primary"
            onClick={handleResend}
            disabled={!canResend || resending}
            style={{ flex: 1, gap: 6 }}
          >
            {resending ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Resending…</> : <><Send size={13} /> Resend Broadcast</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
