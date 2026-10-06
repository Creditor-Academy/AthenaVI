import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Send } from 'lucide-react'

export default function ConfirmSendModal({ subject, onConfirm, onCancel, sending }) {
  const [typed, setTyped] = useState('')
  const confirmed = typed.trim().toUpperCase() === 'SEND'

  return createPortal(
    <div className="sa-broadcast-backdrop">
      <div className="sa-broadcast-modal sa-broadcast-modal--sm" style={{ padding: '32px', textAlign: 'center', alignItems: 'center', gap: 16 }}>
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
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)' }}>
            Ready to dispatch broadcast?
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;{subject}&rdquo;</strong> will be delivered to{' '}
            <strong style={{ color: 'var(--primary)' }}>all active subscribers</strong> on the platform.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Type <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>SEND</strong> to confirm
          </p>
          <input
            type="text"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && confirmed && !sending) onConfirm() }}
            placeholder="Type SEND…"
            className="sa-input"
            style={{ textAlign: 'center', letterSpacing: '0.05em', height: 40 }}
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
              : <><Send size={13} /> Send now</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
