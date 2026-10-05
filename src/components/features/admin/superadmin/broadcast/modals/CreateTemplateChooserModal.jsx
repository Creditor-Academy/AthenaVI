import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Palette, Code2, FileText, ArrowRight } from 'lucide-react'

export default function CreateTemplateChooserModal({ onSelectMode, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="sa-broadcast-backdrop" onClick={onClose}>
      <div
        className="sa-broadcast-modal sa-broadcast-modal--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sa-broadcast-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sa-broadcast-modal-header-icon">
              <Plus size={18} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Create New Email Template
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Choose your preferred creation method to build and customize your email template.
              </p>
            </div>
          </div>
          <button type="button" className="sa-broadcast-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="sa-scroll" style={{ padding: '28px 32px' }}>
          <div className="sa-broadcast-create-flow-grid">
            {/* Visual Design Card */}
            <div
              className="sa-broadcast-create-card"
              onClick={() => onSelectMode('design')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="sa-broadcast-create-card-icon sa-broadcast-create-card-icon--design">
                  <Palette size={22} />
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#8b5cf6', background: 'color-mix(in srgb, #8b5cf6 12%, transparent)', padding: '3px 8px', borderRadius: 6 }}>
                  Visual Builder
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <h3 className="sa-broadcast-create-card-title">Visual Design</h3>
                <p className="sa-broadcast-create-card-desc" style={{ marginTop: 6 }}>
                  Build structured CRM email templates with customizable banner images, greetings, feature highlight cards, and CTA buttons.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 650, color: '#8b5cf6', marginTop: 'auto', paddingTop: 14 }}>
                <span>Launch Visual Editor</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* HTML Code Card */}
            <div
              className="sa-broadcast-create-card"
              onClick={() => onSelectMode('html')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="sa-broadcast-create-card-icon sa-broadcast-create-card-icon--html">
                  <Code2 size={22} />
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 12%, transparent)', padding: '3px 8px', borderRadius: 6 }}>
                  Raw Code
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <h3 className="sa-broadcast-create-card-title">HTML Code</h3>
                <p className="sa-broadcast-create-card-desc" style={{ marginTop: 6 }}>
                  Full control to write or paste raw responsive HTML, inline CSS styling, custom tables, and embed codes with live preview.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 650, color: 'var(--primary)', marginTop: 'auto', paddingTop: 14 }}>
                <span>Open Code Editor</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Plain Text Card */}
            <div
              className="sa-broadcast-create-card"
              onClick={() => onSelectMode('text')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="sa-broadcast-create-card-icon sa-broadcast-create-card-icon--text">
                  <FileText size={22} />
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10b981', background: 'color-mix(in srgb, #10b981 12%, transparent)', padding: '3px 8px', borderRadius: 6 }}>
                  Minimalist
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <h3 className="sa-broadcast-create-card-title">Plain Text</h3>
                <p className="sa-broadcast-create-card-desc" style={{ marginTop: 6 }}>
                  Clean, minimalist plain-text message optimized for maximum deliverability and 1-on-1 personal announcement style.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 650, color: '#10b981', marginTop: 'auto', paddingTop: 14 }}>
                <span>Write Plain Text</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
