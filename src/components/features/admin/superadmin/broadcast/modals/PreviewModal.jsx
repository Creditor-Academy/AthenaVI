import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Eye, X } from 'lucide-react'

export default function PreviewModal({ html, subject, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="sa-broadcast-backdrop" onClick={onClose}>
      <div className="sa-broadcast-modal sa-broadcast-modal--lg" style={{ height: '92vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="sa-broadcast-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="sa-broadcast-modal-header-icon" style={{ width: 28, height: 28, borderRadius: 7 }}>
              <Eye size={13} />
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Email Preview
              </p>
              {subject && (
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Subject: {subject}
                </p>
              )}
            </div>
          </div>
          <button type="button" className="sa-broadcast-close-btn" onClick={onClose} aria-label="Close preview">
            <X size={15} />
          </button>
        </div>

        <div className="sa-broadcast-preview-chrome">
          <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--red" />
          <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--yellow" />
          <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--green" />
          <span className="sa-broadcast-preview-bar">
            {subject || 'Email preview'}
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#fff' }}>
          <iframe
            srcDoc={html}
            title="email preview"
            className="sa-broadcast-preview-frame"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
