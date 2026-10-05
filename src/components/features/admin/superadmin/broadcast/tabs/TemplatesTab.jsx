import { useState, useEffect, useCallback } from 'react'
import {
  Search, RefreshCw, Plus, LayoutTemplate, Palette, Code2,
  FileText, Eye, Edit3, Send, Trash2, AlertTriangle
} from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'
import { timeAgo } from '../broadcastUtils'
import PreviewModal from '../modals/PreviewModal'
import CreateTemplateChooserModal from '../modals/CreateTemplateChooserModal'
import TemplateEditorModal from '../modals/TemplateEditorModal'

export default function TemplatesTab({ onUseInCompose }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [chooserOpen, setChooserOpen] = useState(false)
  const [activeEditorTemplate, setActiveEditorTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await superadminService.listEmailTemplates({
        search: search || undefined,
        type: typeFilter || undefined,
        limit: 100,
      })
      setTemplates(res.templates || [])
    } catch (e) {
      setErr(e.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this email template?')) return
    setDeletingId(id)
    try {
      await superadminService.deleteEmailTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete template')
    } finally {
      setDeletingId(null)
    }
  }

  const handleStartMode = (mode) => {
    setChooserOpen(false)
    setActiveEditorTemplate({
      name: '',
      subject: '',
      type: mode,
      htmlBody: mode === 'html' ? '<h2>Hello!</h2>\n<p>Write your HTML template content here...</p>' : '',
      textBody: '',
    })
  }

  const handleStartPrebuilt = (tpl) => {
    setChooserOpen(false)
    setActiveEditorTemplate({
      name: tpl.label,
      subject: tpl.subject || '',
      type: 'html',
      htmlBody: tpl.html || '',
      textBody: '',
    })
  }

  const renderTypeBadge = (type) => {
    if (type === 'design') {
      return (
        <span className="sa-broadcast-type-badge sa-broadcast-type-badge--design">
          <Palette size={11} /> Design
        </span>
      )
    }
    if (type === 'text') {
      return (
        <span className="sa-broadcast-type-badge sa-broadcast-type-badge--text">
          <FileText size={11} /> Plain Text
        </span>
      )
    }
    return (
      <span className="sa-broadcast-type-badge sa-broadcast-type-badge--html">
        <Code2 size={11} /> HTML Code
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {chooserOpen && (
        <CreateTemplateChooserModal
          onSelectMode={handleStartMode}
          onSelectPrebuilt={handleStartPrebuilt}
          onClose={() => setChooserOpen(false)}
        />
      )}

      {activeEditorTemplate !== null && (
        <TemplateEditorModal
          template={activeEditorTemplate}
          onSave={loadTemplates}
          onClose={() => setActiveEditorTemplate(null)}
        />
      )}

      {previewTemplate && (
        <PreviewModal
          html={previewTemplate.htmlBody}
          subject={previewTemplate.subject || previewTemplate.name}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      <div className="sa-broadcast-toolbar">
        <div className="sa-search-field" style={{ minWidth: 240, maxWidth: 360 }}>
          <Search className="sa-search-field-icon" size={14} aria-hidden />
          <input
            className="sa-input"
            type="text"
            placeholder="Search email templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: '', label: 'All Types' },
            { id: 'design', label: 'Design' },
            { id: 'html', label: 'HTML' },
            { id: 'text', label: 'Text' },
          ].map(({ id, label }) => {
            const active = typeFilter === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTypeFilter(id)}
                style={{
                  height: 32, padding: '0 12px', borderRadius: 6, border: '1px solid',
                  fontSize: '0.75rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
                  borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                  background: active ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="sa-broadcast-toolbar-actions">
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={loadTemplates}
            title="Refresh templates"
            style={{ width: 34, height: 34, padding: 0 }}
          >
            <RefreshCw size={13} style={loading ? { animation: 'sa-spin 0.7s linear infinite' } : undefined} />
          </button>
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--primary"
            onClick={() => setChooserOpen(true)}
            style={{ gap: 6, height: 34, padding: '0 14px' }}
          >
            <Plus size={14} /> Create Template
          </button>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
        {err && <div className="sa-alert sa-alert--error"><AlertTriangle size={13} style={{ marginRight: 6 }} />{err}</div>}

        {loading && templates.length === 0 && (
          <div className="sa-loading" style={{ padding: '60px 0' }}><span className="sa-spinner" /> Loading templates…</div>
        )}

        {!loading && templates.length === 0 && !err && (
          <div className="sa-empty" style={{ padding: '60px 0' }}>
            <LayoutTemplate className="sa-empty-icon" size={42} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>No email templates found</p>
            <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Create reusable CRM-style templates for product announcements, release notes, and user emails.
            </p>
            <button
              type="button"
              className="sa-btn sa-btn--primary"
              onClick={() => setChooserOpen(true)}
              style={{ marginTop: 16, gap: 6 }}
            >
              <Plus size={14} /> Create your first template
            </button>
          </div>
        )}

        {templates.length > 0 && (
          <div className="sa-broadcast-template-grid">
            {templates.map((tpl) => (
              <div key={tpl.id} className="sa-broadcast-template-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <h4 className="sa-broadcast-template-title">
                      {tpl.name}
                    </h4>
                    <p className="sa-broadcast-template-subject">
                      {tpl.subject ? `Subject: ${tpl.subject}` : '(No default subject)'}
                    </p>
                  </div>
                  {renderTypeBadge(tpl.type)}
                </div>

                <div className="sa-broadcast-template-meta">
                  <span>Updated {timeAgo(tpl.updatedAt || tpl.createdAt)}</span>
                  {tpl.createdBy?.name && <span>by {tpl.createdBy.name}</span>}
                </div>

                <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
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
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    onClick={() => setActiveEditorTemplate(tpl)}
                    style={{ flex: 1, gap: 4, height: 30, fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--primary"
                    onClick={() => onUseInCompose?.(tpl)}
                    style={{ flex: 1.3, gap: 4, height: 30, fontSize: '0.75rem' }}
                  >
                    <Send size={12} /> Use
                  </button>
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    onClick={(e) => handleDelete(tpl.id, e)}
                    disabled={deletingId === tpl.id}
                    title="Delete template"
                    style={{ width: 30, height: 30, padding: 0, color: '#f87171' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
