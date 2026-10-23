import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search, RefreshCw, Plus, LayoutTemplate, Palette, Code2,
  FileText, Eye, Edit3, Send, Trash2, AlertTriangle, Sparkles
} from 'lucide-react'
import superadminService from '../../../../../../services/superadminService'
import { EMAIL_TEMPLATES } from '../../broadcastTemplates'
import { timeAgo } from '../broadcastUtils'
import PreviewModal from '../modals/PreviewModal'
import CreateTemplateChooserModal from '../modals/CreateTemplateChooserModal'
import TemplateEditorModal from '../modals/TemplateEditorModal'

// Pre-existing templates built into Virtual Studio
const BUILT_IN_TEMPLATES = EMAIL_TEMPLATES
  .filter((t) => t.id !== 'custom')
  .map((t) => ({
    id: `preset-${t.id}`,
    name: t.label,
    subject: t.subject || '',
    type: 'html',
    htmlBody: t.html,
    textBody: t.description || '',
    isPreset: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { name: 'Virtual Studio System' },
  }))

export default function TemplatesTab({ onUseInCompose, onTemplatesUpdated }) {
  const [dbTemplates, setDbTemplates] = useState([])
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
      const res = await superadminService.listEmailTemplates({ limit: 100 })
      const list = res.templates || []
      setDbTemplates(list)
    } catch (e) {
      setErr(e.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Combine DB custom templates with 5 built-in pre-existing templates
  const allTemplates = useMemo(() => {
    const customNames = new Set(dbTemplates.map((t) => t.name.toLowerCase()))
    const activePresets = BUILT_IN_TEMPLATES.filter((p) => !customNames.has(p.name.toLowerCase()))
    const combined = [...dbTemplates, ...activePresets]

    return combined.filter((tpl) => {
      if (typeFilter && tpl.type !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const nameMatch = (tpl.name || '').toLowerCase().includes(q)
        const subMatch = (tpl.subject || '').toLowerCase().includes(q)
        if (!nameMatch && !subMatch) return false
      }
      return true
    })
  }, [dbTemplates, typeFilter, search])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this email template?')) return
    setDeletingId(id)
    try {
      await superadminService.deleteEmailTemplate(id)
      setDbTemplates((prev) => prev.filter((t) => t.id !== id))
      onTemplatesUpdated?.()
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
          <Palette size={11} /> Visual Design
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
          onSave={() => {
            loadTemplates()
            onTemplatesUpdated?.()
          }}
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

      {/* ── Table Toolbar with Search, Filter Tabs, and Create Action ── */}
      <div className="sa-table-toolbar">
        <div className="sa-search-field" style={{ minWidth: 220, maxWidth: 320 }}>
          <Search className="sa-search-field-icon" size={14} aria-hidden />
          <input
            className="sa-input"
            type="text"
            placeholder="Search email templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-filter-tabs" role="tablist" aria-label="Filter template types">
          {[
            { id: '', label: 'All Templates' },
            { id: 'design', label: 'Design' },
            { id: 'html', label: 'HTML' },
            { id: 'text', label: 'Plain Text' },
          ].map(({ id, label }) => {
            const active = typeFilter === id
            const count = id === ''
              ? allTemplates.length
              : allTemplates.filter(t => t.type === id).length
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`sa-filter-tab${active ? ' active' : ''}`}
                onClick={() => setTypeFilter(id)}
              >
                <span>{label}</span>
                {allTemplates.length > 0 && <span className="sa-filter-count">{count}</span>}
              </button>
            )
          })}
        </div>

        <div className="sa-broadcast-toolbar-actions">
          <button
            type="button"
            className="sa-btn sa-btn--sm sa-btn--ghost"
            onClick={loadTemplates}
            disabled={loading}
            aria-label="Refresh templates"
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

        {loading && allTemplates.length === 0 && (
          <div className="sa-loading" style={{ padding: '60px 0' }}><span className="sa-spinner" /> Loading templates…</div>
        )}

        {!loading && allTemplates.length === 0 && !err && (
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

        {allTemplates.length > 0 && (
          <div className="sa-broadcast-template-grid">
            {allTemplates.map((tpl) => (
              <div key={tpl.id} className="sa-broadcast-template-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 className="sa-broadcast-template-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {tpl.name}
                    </h4>
                    <p className="sa-broadcast-template-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
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
                    onClick={() => {
                      if (tpl.isPreset) {
                        setActiveEditorTemplate({
                          name: tpl.name,
                          subject: tpl.subject,
                          type: tpl.type,
                          htmlBody: tpl.htmlBody,
                          textBody: tpl.textBody,
                        })
                      } else {
                        setActiveEditorTemplate(tpl)
                      }
                    }}
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
                  {!tpl.isPreset && (
                    <button
                      type="button"
                      className="sa-btn sa-btn--sm sa-btn--ghost"
                      onClick={(e) => handleDelete(tpl.id, e)}
                      disabled={deletingId === tpl.id}
                      title="Delete template"
                      style={{ width: 30, height: 30, padding: 0, color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
