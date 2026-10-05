import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Palette, Code2, FileText, ArrowRight, Eye, Check } from 'lucide-react'
import { EMAIL_TEMPLATES } from '../../broadcastTemplates'
import PreviewModal from './PreviewModal'

export default function CreateTemplateChooserModal({ onSelectMode, onSelectPrebuilt, onClose }) {
  const [previewTemplate, setPreviewTemplate] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const prebuiltList = EMAIL_TEMPLATES.filter(t => t.id !== 'custom')

  return createPortal(
    <>
      {previewTemplate && (
        <PreviewModal
          html={previewTemplate.html}
          subject={previewTemplate.subject || previewTemplate.label}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
      <div className="sa-broadcast-backdrop" onClick={onClose}>
        <div
          className="sa-broadcast-modal sa-broadcast-modal--xl"
          style={{ maxHeight: '90vh' }}
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
                  Select how you would like to build your template or start with a pre-built design.
                </p>
              </div>
            </div>
            <button type="button" className="sa-broadcast-close-btn" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 1: 3 Creation Options */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  1. Choose Creation Method (Start from scratch)
                </span>
              </div>

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
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#8b5cf6', background: 'color-mix(in srgb, #8b5cf6 12%, transparent)', padding: '2px 8px', borderRadius: 6 }}>
                      Visual Builder
                    </span>
                  </div>
                  <div>
                    <h3 className="sa-broadcast-create-card-title">Visual Design</h3>
                    <p className="sa-broadcast-create-card-desc" style={{ marginTop: 4 }}>
                      Build structured email templates with customizable banners, titles, feature highlight cards, and CTA buttons.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#8b5cf6', marginTop: 'auto', paddingTop: 6 }}>
                    <span>Launch Visual Editor</span>
                    <ArrowRight size={13} />
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
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 12%, transparent)', padding: '2px 8px', borderRadius: 6 }}>
                      Raw Code
                    </span>
                  </div>
                  <div>
                    <h3 className="sa-broadcast-create-card-title">HTML Code</h3>
                    <p className="sa-broadcast-create-card-desc" style={{ marginTop: 4 }}>
                      Full control to write or paste raw HTML, responsive inline styling, and custom email components with real-time preview.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', marginTop: 'auto', paddingTop: 6 }}>
                    <span>Open Code Editor</span>
                    <ArrowRight size={13} />
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
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10b981', background: 'color-mix(in srgb, #10b981 12%, transparent)', padding: '2px 8px', borderRadius: 6 }}>
                      Minimalist
                    </span>
                  </div>
                  <div>
                    <h3 className="sa-broadcast-create-card-title">Plain Text</h3>
                    <p className="sa-broadcast-create-card-desc" style={{ marginTop: 4 }}>
                      Simple, high-deliverability plain text message for direct personal updates and announcements.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: '#10b981', marginTop: 'auto', paddingTop: 6 }}>
                    <span>Write Plain Text</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Pre-built Templates Gallery */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  2. Or Start with a Pre-Built Template
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {prebuiltList.length} ready-made layouts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {prebuiltList.map((tpl) => (
                  <div key={tpl.id} className="sa-broadcast-prebuilt-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {tpl.label}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {tpl.description}
                        </p>
                      </div>
                      <span className="sa-broadcast-type-badge sa-broadcast-type-badge--html" style={{ flexShrink: 0 }}>
                        Template
                      </span>
                    </div>

                    {tpl.subject && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-main)', background: 'color-mix(in srgb, var(--text-muted) 4%, var(--bg-card))', padding: '5px 8px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subject: </span>{tpl.subject}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--ghost"
                        onClick={() => setPreviewTemplate(tpl)}
                        style={{ flex: 1, gap: 4, height: 30, fontSize: '0.75rem' }}
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        type="button"
                        className="sa-btn sa-btn--sm sa-btn--primary"
                        onClick={() => onSelectPrebuilt(tpl)}
                        style={{ flex: 1.3, gap: 4, height: 30, fontSize: '0.75rem' }}
                      >
                        <Check size={12} /> Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
