import { useState, useEffect } from 'react'
import {
  Send, Users, Eye, Sparkles, LayoutTemplate, Type, Code2,
  FileText, Hash, CheckCircle2, Plus, AlertTriangle
} from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'
import PreviewModal from '../modals/PreviewModal'
import ConfirmSendModal from '../modals/ConfirmSendModal'
import CreateTemplateChooserModal from '../modals/CreateTemplateChooserModal'

const PLACEHOLDER_HTML = `<h2 style="margin:0 0 12px;font-family:sans-serif">Hello!</h2>
<p style="margin:0 0 10px;font-family:sans-serif;color:#555">Write your broadcast content here.</p>
<p style="margin:0;font-family:sans-serif;color:#555">HTML is supported — use headings, links, and basic formatting.</p>`

export default function ComposeTab({ initialData, onSent, onOpenTemplatesTab }) {
  const [subject, setSubject] = useState(initialData?.subject || '')
  const [html, setHtml] = useState(initialData?.html || initialData?.htmlBody || '')
  const [text, setText] = useState(initialData?.text || initialData?.textBody || '')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [starterOpen, setStarterOpen] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(null)

  useEffect(() => {
    if (initialData) {
      if (initialData.subject) setSubject(initialData.subject)
      if (initialData.html || initialData.htmlBody) setHtml(initialData.html || initialData.htmlBody)
      if (initialData.text || initialData.textBody) setText(initialData.text || initialData.textBody)
    }
  }, [initialData])

  const canSend = subject.trim().length > 0 && html.trim().length > 0

  const handleSend = async () => {
    setSending(true)
    setErr('')
    try {
      await superadminService.sendProductEmailBroadcast({
        subject: subject.trim(),
        html: html.trim(),
        text: text.trim() || undefined,
      })
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
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;{sent}&rdquo;</strong> is on its way to all subscribers.
          </p>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--primary"
          onClick={() => { setSent(null); setSubject(''); setHtml(''); setText('') }}
          style={{ gap: 6 }}
        >
          <Plus size={14} /> Write another broadcast
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showConfirm && (
        <ConfirmSendModal
          subject={subject}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
          sending={sending}
        />
      )}

      {previewOpen && (
        <PreviewModal
          html={html || PLACEHOLDER_HTML}
          subject={subject}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {starterOpen && (
        <CreateTemplateChooserModal
          onSelectMode={(mode) => {
            setStarterOpen(false)
            if (mode === 'html') {
              setHtml('<h2>New Broadcast Announcement</h2>\n<p>Write your message here...</p>')
            }
          }}
          onSelectPrebuilt={(tpl) => {
            setStarterOpen(false)
            if (tpl.subject) setSubject(tpl.subject)
            if (tpl.html) setHtml(tpl.html)
          }}
          onClose={() => setStarterOpen(false)}
        />
      )}

      {/* ── Table Toolbar with Audience Pill & Compose Actions ── */}
      <div className="sa-table-toolbar">
        <div className="sa-broadcast-audience-indicator">
          <Users size={15} style={{ color: 'var(--primary)' }} />
          <span>Audience: All active subscribers</span>
        </div>

        <div className="sa-broadcast-toolbar-actions">
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setStarterOpen(true)}
            style={{ gap: 5 }}
            title="Choose a starting layout snippet"
          >
            <Sparkles size={13} /> Starter Layouts
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={onOpenTemplatesTab}
            style={{ gap: 5 }}
            title="Browse CRM Email Templates"
          >
            <LayoutTemplate size={13} /> Saved Templates
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={() => setPreviewOpen(true)}
            style={{ gap: 5 }}
          >
            <Eye size={13} /> Preview
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--primary"
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
            style={{ gap: 6, height: 34, padding: '0 16px' }}
          >
            <Send size={13} /> Send Broadcast
          </button>
        </div>
      </div>

      <div className="sa-broadcast-body sa-scroll">
        <div>
          <label htmlFor="broadcast-subject" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 8,
          }}>
            <Type size={12} /> Subject
          </label>
          <div className="sa-search-field" style={{ width: '100%' }}>
            <Hash className="sa-search-field-icon" size={14} style={{ color: 'var(--primary)', opacity: 0.85 }} aria-hidden />
            <input
              id="broadcast-subject"
              className="sa-input"
              type="text"
              placeholder="What is this announcement about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
            />
          </div>
        </div>

        {err && (
          <div className="sa-alert sa-alert--error" style={{ margin: 0 }}>
            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />{err}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 280 }}>
          <label htmlFor="broadcast-html" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 8, flexShrink: 0,
          }}>
            <Code2 size={12} /> HTML Body
          </label>
          <textarea
            id="broadcast-html"
            placeholder="Write your HTML email body here (or insert a saved template)..."
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="sa-broadcast-code-editor"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShowText(!showText)}
            className="sa-btn sa-btn--sm sa-btn--ghost"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <FileText size={13} />
            {showText ? 'Hide plain text fallback' : 'Add plain text fallback'}
          </button>
          <span className={`sa-broadcast-char-badge${html.length > 10000 ? ' sa-broadcast-char-badge--warn' : ''}`}>
            <Code2 size={12} />
            {html.length.toLocaleString()} chars
          </span>
        </div>

        {showText && (
          <div style={{ flexShrink: 0 }}>
            <textarea
              placeholder="Plain-text fallback (optional)…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="sa-input"
              style={{ width: '100%', minHeight: 90, boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
