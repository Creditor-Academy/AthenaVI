import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { LayoutTemplate, X, Palette, Code2, FileText, Plus, Trash2, Check, AlertTriangle } from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'
import { generateDesignHtml } from '../broadcastUtils'

export default function TemplateEditorModal({ template, onSave, onClose }) {
  const isEditing = Boolean(template?.id)
  const [mode, setMode] = useState(template?.type || 'design')
  const [name, setName] = useState(template?.name || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [rawHtml, setRawHtml] = useState(template?.htmlBody || '')
  const [textBody, setTextBody] = useState(template?.textBody || '')

  const [designState, setDesignState] = useState(() => {
    if (template?.type === 'design' && template.textBody) {
      try {
        const parsed = JSON.parse(template.textBody)
        if (parsed && typeof parsed === 'object') return parsed
      } catch (e) {}
    }
    return {
      headline: template?.name || 'What\'s New in Athena Studio',
      bannerUrl: '',
      greeting: 'Hi there,',
      bodyText: 'We are thrilled to share our latest product updates with you.',
      highlights: [
        { title: 'New Feature Launch', desc: 'Experience faster workflow and redesigned studio controls.' },
      ],
      ctaText: 'Explore Now',
      ctaUrl: 'https://athena.ai',
      ctaColor: '#2563eb',
      footerNote: 'Feel free to reply directly to this email with any feedback or questions.',
    }
  })

  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const currentHtml = useMemo(() => {
    if (mode === 'design') {
      return generateDesignHtml(designState)
    }
    if (mode === 'text') {
      const escaped = (textBody || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')
      return `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap">${escaped}</div>`
    }
    return rawHtml
  }, [mode, designState, textBody, rawHtml])

  const handleHighlightChange = (index, field, value) => {
    setDesignState((prev) => {
      const next = [...prev.highlights]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, highlights: next }
    })
  }

  const addHighlight = () => {
    setDesignState((prev) => ({
      ...prev,
      highlights: [...prev.highlights, { title: '', desc: '' }],
    }))
  }

  const removeHighlight = (index) => {
    setDesignState((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setErr('Please provide a template name')
      return
    }

    setSaving(true)
    setErr('')

    try {
      let finalHtml = ''
      let finalText = ''

      if (mode === 'design') {
        finalHtml = generateDesignHtml(designState)
        finalText = JSON.stringify(designState)
      } else if (mode === 'text') {
        finalHtml = currentHtml
        finalText = textBody
      } else {
        finalHtml = rawHtml
        finalText = textBody || null
      }

      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        htmlBody: finalHtml,
        textBody: finalText,
        type: mode,
      }

      if (isEditing) {
        await superadminService.updateEmailTemplate(template.id, payload)
      } else {
        await superadminService.createEmailTemplate(payload)
      }

      onSave?.()
      onClose()
    } catch (e) {
      setErr(e.message || 'Failed to save email template')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="sa-broadcast-backdrop" onClick={onClose}>
      <div className="sa-broadcast-modal sa-broadcast-modal--xl" onClick={(e) => e.stopPropagation()}>
        <div className="sa-broadcast-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sa-broadcast-modal-header-icon">
              <LayoutTemplate size={18} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isEditing ? `Edit Template: ${template.name}` : 'Template Editor'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Customize template content, preview in real-time, and save for team broadcast campaigns.
              </p>
            </div>
          </div>
          <button type="button" className="sa-broadcast-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', borderBottom: '1px solid var(--border-color)',
          background: 'color-mix(in srgb, var(--text-muted) 3%, var(--bg-card))',
          gap: 16, flexWrap: 'wrap', flexShrink: 0,
        }}>
          <div className="sa-broadcast-mode-switcher">
            {[
              { id: 'design', label: 'Visual Design', icon: Palette },
              { id: 'html', label: 'HTML Code', icon: Code2 },
              { id: 'text', label: 'Plain Text', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`sa-broadcast-mode-btn${mode === id ? ' sa-broadcast-mode-btn--active' : ''}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 260, maxWidth: 520 }}>
            <input
              type="text"
              className="sa-input"
              placeholder="Template Name (e.g. Product Update)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1, fontSize: '0.8125rem' }}
            />
            <input
              type="text"
              className="sa-input"
              placeholder="Default Subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ flex: 1, fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {err && (
          <div className="sa-alert sa-alert--error" style={{ margin: '12px 24px 0' }}>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />{err}
          </div>
        )}

        <div className="sa-broadcast-editor-grid">
          <div className="sa-broadcast-editor-left sa-scroll">
            {mode === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Headline Title
                  </label>
                  <input
                    type="text"
                    className="sa-input"
                    placeholder="e.g. What's New in Athena Studio"
                    value={designState.headline}
                    onChange={(e) => setDesignState((prev) => ({ ...prev, headline: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Banner Image URL (optional)
                  </label>
                  <input
                    type="url"
                    className="sa-input"
                    placeholder="https://example.com/banner.png"
                    value={designState.bannerUrl}
                    onChange={(e) => setDesignState((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Greeting
                  </label>
                  <input
                    type="text"
                    className="sa-input"
                    placeholder="Hi there,"
                    value={designState.greeting}
                    onChange={(e) => setDesignState((prev) => ({ ...prev, greeting: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Intro Paragraph(s)
                  </label>
                  <textarea
                    className="sa-input"
                    rows={4}
                    placeholder="Write the main announcement text..."
                    value={designState.bodyText}
                    onChange={(e) => setDesignState((prev) => ({ ...prev, bodyText: e.target.value }))}
                    style={{ resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Key Highlights / Feature Cards
                    </label>
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="sa-btn sa-btn--sm sa-btn--ghost"
                      style={{ padding: '2px 8px', fontSize: '0.75rem', gap: 4 }}
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  {designState.highlights.map((h, idx) => (
                    <div key={idx} className="sa-broadcast-highlight-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          Highlight #{idx + 1}
                        </span>
                        {designState.highlights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHighlight(idx)}
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2 }}
                            title="Remove highlight"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="sa-input"
                        placeholder="Title (e.g. Fast Rendering)"
                        value={h.title}
                        onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="sa-input"
                        placeholder="Description"
                        value={h.desc}
                        onChange={(e) => handleHighlightChange(idx, 'desc', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Button Text
                    </label>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="Explore Now"
                      value={designState.ctaText}
                      onChange={(e) => setDesignState((prev) => ({ ...prev, ctaText: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Button Link URL
                    </label>
                    <input
                      type="url"
                      className="sa-input"
                      placeholder="https://..."
                      value={designState.ctaUrl}
                      onChange={(e) => setDesignState((prev) => ({ ...prev, ctaUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Footer Note
                  </label>
                  <textarea
                    className="sa-input"
                    rows={2}
                    placeholder="Closing message or help note..."
                    value={designState.footerNote}
                    onChange={(e) => setDesignState((prev) => ({ ...prev, footerNote: e.target.value }))}
                    style={{ resize: 'vertical', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            )}

            {mode === 'html' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Raw HTML Code
                  </label>
                  <span className="sa-broadcast-char-badge">
                    {rawHtml.length.toLocaleString()} characters
                  </span>
                </div>
                <textarea
                  className="sa-broadcast-code-editor"
                  placeholder="<h2>Announcement Title</h2><p>Your HTML content here...</p>"
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  style={{ flex: 1, minHeight: 340 }}
                />
              </div>
            )}

            {mode === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Plain Text Content
                </label>
                <textarea
                  className="sa-input"
                  placeholder="Write plain text email..."
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  style={{ flex: 1, minHeight: 340, fontSize: '0.85rem', lineHeight: 1.6, resize: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Right: Live preview */}
          <div className="sa-broadcast-editor-right">
            <div className="sa-broadcast-preview-chrome">
              <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--red" />
              <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--yellow" />
              <span className="sa-broadcast-preview-dot sa-broadcast-preview-dot--green" />
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, marginLeft: 8 }}>
                Live HTML Preview
              </span>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#fff' }}>
              <iframe
                srcDoc={currentHtml || '<p style="padding:20px;color:#999;font-family:sans-serif">Preview will appear here as you type...</p>'}
                title="live template preview"
                className="sa-broadcast-preview-frame"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>

        <div className="sa-broadcast-modal-footer">
          <button type="button" className="sa-btn sa-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{ gap: 6, padding: '0 20px', height: 38 }}
          >
            {saving ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Saving…</> : <><Check size={14} /> {isEditing ? 'Save Changes' : 'Create Template'}</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
