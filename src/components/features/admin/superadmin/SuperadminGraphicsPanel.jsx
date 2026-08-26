import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Upload,
  Pencil,
  Trash2,
  Archive,
  CheckCircle2,
  X,
  ArrowUp,
  Sparkles,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import '../../../../pages/AdminPortal/SuperadminGraphicsPortal.css'

const TYPES = [
  { id: 'decorative', label: 'Decorative' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'icon', label: 'Icon' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'pattern', label: 'Pattern' },
]

const CATEGORY_OPTIONS = [
  { id: 'blobs', label: 'Blobs' },
  { id: 'frames', label: 'Frames' },
  { id: 'dividers', label: 'Dividers' },
  { id: 'ornaments', label: 'Ornaments' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'icons', label: 'Icons' },
  { id: 'illustrations', label: 'Illustrations' },
]

const STYLE_OPTIONS = ['Organic', 'Minimal', 'Geometric', 'Playful', 'Corporate', 'Elegant']
const MOOD_OPTIONS = ['Calm', 'Friendly', 'Bold', 'Energetic', 'Professional', 'Warm']

const USAGE_OPTIONS = [
  { id: 'bullet', label: 'Bullet' },
  { id: 'list', label: 'List' },
  { id: 'cover', label: 'Cover' },
  { id: 'content', label: 'Content' },
  { id: 'data', label: 'Data' },
  { id: 'cta', label: 'CTA' },
  { id: 'background', label: 'Background' },
  { id: 'editor', label: 'Editor' },
  { id: 'corner', label: 'Corner' },
]

const STATUS_PILLS = [
  { id: '', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
]

const VIEW_MODES = [
  { id: 'library', label: 'Library' },
  { id: 'getillustrations', label: 'GetIllustrations Free' },
]

const GI_KINDS = [
  { id: 'illustration', label: 'Illustrations' },
  { id: 'icon', label: 'Icons' },
]

const MAX_SVG_BYTES = 1.5 * 1024 * 1024

const ICON_DEFAULT_USAGE = ['bullet', 'list', 'editor', 'content']
const DECOR_DEFAULT_USAGE = ['editor', 'corner', 'content']

const emptyForm = {
  name: '',
  description: '',
  type: 'decorative',
  category: 'ornaments',
  tags: [],
  style: 'Organic',
  moods: 'Calm',
  usage: DECOR_DEFAULT_USAGE,
  colorMode: 'fixed',
  containsText: false,
}

function parseList(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function isIconGraphic(row = {}) {
  const type = String(row.type || '').toLowerCase()
  const category = String(row.category || '').toLowerCase()
  return type === 'icon' || category === 'icons' || category === 'icon'
}

function GraphicPreview({ src, variant = 'default' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src) return <div className="sg-preview-empty">No preview</div>
  if (failed) {
    return <div className="sg-preview-empty">Preview unavailable</div>
  }
  return (
    <img
      src={src}
      alt=""
      className={`sg-preview-img ${variant === 'icon' ? 'sg-preview-img--icon' : ''}`.trim()}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState('')

  const commit = (raw) => {
    const next = String(raw || '')
      .split(/[,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    if (!next.length) return
    const merged = [...tags]
    next.forEach((t) => {
      if (!merged.some((x) => x.toLowerCase() === t.toLowerCase())) merged.push(t)
    })
    onChange(merged)
    setDraft('')
  }

  return (
    <div className="sg-tags">
      {tags.map((tag) => (
        <span key={tag} className="sg-tag">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        placeholder={tags.length ? 'Add tag' : 'botanical, wellness, organic'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit(draft)
          } else if (e.key === 'Backspace' && !draft && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={() => commit(draft)}
      />
    </div>
  )
}

export default function SuperadminGraphicsPanel() {
  const modalFileRef = useRef(null)
  const [viewMode, setViewMode] = useState('library')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    colorMode: '',
    status: '',
  })
  const [dragOver, setDragOver] = useState(false)
  const [pageDragOver, setPageDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [saving, setSaving] = useState(false)

  // GetIllustrations free catalog
  const [giKind, setGiKind] = useState('illustration')
  const [giCategoryId, setGiCategoryId] = useState('')
  const [giPackId, setGiPackId] = useState('')
  const [giQ, setGiQ] = useState('')
  const [giPage, setGiPage] = useState(1)
  const [giItems, setGiItems] = useState([])
  const [giCategories, setGiCategories] = useState([])
  const [giTotal, setGiTotal] = useState(0)
  const [giTotalPages, setGiTotalPages] = useState(1)
  const [giConfigured, setGiConfigured] = useState(true)
  const [giRateLimit, setGiRateLimit] = useState(null)
  const [giLoading, setGiLoading] = useState(false)
  const [giError, setGiError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await superadminService.listGraphics({ q, ...filters, limit: 80 })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof SuperadminApiError ? err.message : err.message || 'Failed to load graphics')
    } finally {
      setLoading(false)
    }
  }, [q, filters])

  const loadGi = useCallback(async () => {
    setGiLoading(true)
    setGiError('')
    try {
      const params = {
        kind: giKind,
        q: giQ,
        page: giPage,
        limit: 48,
      }
      if (giKind === 'illustration' && giCategoryId) params.categoryId = giCategoryId
      if (giKind === 'icon' && giPackId) params.packId = giPackId

      const data = await superadminService.listGetIllustrationsFree(params)
      setGiConfigured(data.configured !== false)
      setGiItems(data.items || [])
      setGiCategories(data.categories || [])
      setGiTotal(data.total || 0)
      setGiTotalPages(data.totalPages || 1)
      setGiRateLimit(data.rateLimit || null)
      if (giKind === 'icon' && data.selectedPackId) {
        setGiPackId((prev) => prev || data.selectedPackId)
      }
    } catch (err) {
      setGiError(
        err instanceof SuperadminApiError ? err.message : err.message || 'Failed to load GetIllustrations'
      )
    } finally {
      setGiLoading(false)
    }
  }, [giKind, giCategoryId, giPackId, giQ, giPage])

  useEffect(() => {
    if (viewMode === 'library') load()
  }, [viewMode, load])

  useEffect(() => {
    if (viewMode === 'getillustrations') loadGi()
  }, [viewMode, loadGi])

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  const acceptFile = (nextFile, { openModal = true } = {}) => {
    if (!nextFile) return
    const mime = String(nextFile.type || '')
    if (mime && mime !== 'image/svg+xml' && !nextFile.name?.toLowerCase().endsWith('.svg')) {
      const msg = 'Only SVG files are allowed'
      if (modalOpen) setModalError(msg)
      else setError(msg)
      return
    }
    if (nextFile.size > MAX_SVG_BYTES) {
      const msg = 'SVG must be 1.5 MB or smaller'
      if (modalOpen) setModalError(msg)
      else setError(msg)
      return
    }
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFile(nextFile)
    setFilePreview(URL.createObjectURL(nextFile))
    setForm((prev) => ({
      ...prev,
      name: prev.name || nextFile.name.replace(/\.svg$/i, ''),
    }))
    setModalError('')
    setError('')
    if (openModal) {
      setEditingId(null)
      setModalOpen(true)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFile(null)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview('')
    setModalError('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setFile(null)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview('')
    setModalError('')
    setForm({
      name: row.name || '',
      description: row.description || '',
      type: row.type || 'decorative',
      category: row.category || 'ornaments',
      tags: parseList(row.tags),
      style: row.style || 'Organic',
      moods: parseList(row.moods)[0] || row.moods || 'Calm',
      usage: parseList(row.usage).length ? parseList(row.usage) : ['editor'],
      colorMode: row.colorMode || 'fixed',
      containsText: Boolean(row.containsText),
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalError('')
  }

  const toggleUsage = (id) => {
    setForm((prev) => {
      const set = new Set(prev.usage || [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, usage: [...set] }
    })
  }

  const save = async ({ publishAfter } = {}) => {
    setModalError('')
    if (!form.name?.trim()) {
      setModalError('Name is required')
      return
    }
    if (!editingId && !file) {
      setModalError('Upload an SVG file first')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        type: form.type,
        category: form.category,
        tags: form.tags,
        style: form.style,
        moods: form.moods,
        usage: form.usage,
        colorMode: form.colorMode,
        containsText: form.containsText,
      }

      if (editingId) {
        await superadminService.updateGraphic(editingId, payload)
        if (publishAfter) await superadminService.publishGraphic(editingId)
      } else {
        const created = await superadminService.uploadGraphic({ file, ...payload })
        const id = created?.graphic?.id || created?.id
        if (publishAfter && id) await superadminService.publishGraphic(id)
        setFile(null)
      }
      closeModal()
      await load()
    } catch (err) {
      setModalError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (id, fn) => {
    setBusyId(id)
    setError('')
    try {
      await fn()
      await load()
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setBusyId('')
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { draft: 0, published: 0, archived: 0 }
    items.forEach((row) => {
      if (counts[row.status] != null) counts[row.status] += 1
    })
    return counts
  }, [items])

  const editingRow = editingId ? items.find((i) => i.id === editingId) : null
  const previewSrc = filePreview || editingRow?.previewUrl || editingRow?.fileUrl || ''
  const modalIsIcon = isIconGraphic({
    type: form.type,
    category: form.category,
    ...(editingRow || {}),
  })
  const showEmpty = !loading && items.length === 0
  const giActiveCategoryId = giKind === 'icon' ? giPackId : giCategoryId
  const showGiEmpty = !giLoading && giItems.length === 0

  return (
    <div className="sg-portal">
      <div className="sg-top">
        <div className="sg-top-row">
          <div>
            <p className="sg-kicker">
              <Sparkles size={12} aria-hidden /> Platform catalog
            </p>
            <h1 className="sg-title">Graphics Library</h1>
            <p className="sg-subtitle">
              {viewMode === 'library'
                ? 'Upload and publish SVG decorations for the PPT editor and AI slides. Only published graphics appear in Insert → Graphics.'
                : 'Browse free GetIllustrations assets by category (illustrations) or pack (icons). Free-tier clean assets only.'}
            </p>
          </div>
          {viewMode === 'library' ? (
            <button type="button" className="sg-primary-cta" onClick={openCreate}>
              <Plus size={18} strokeWidth={2.5} /> Add Graphic
            </button>
          ) : null}
        </div>

        <div className="sg-mode-tabs" role="tablist" aria-label="Graphics source">
          {VIEW_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={viewMode === m.id}
              className={`sg-mode-tab ${viewMode === m.id ? 'is-active' : ''}`}
              onClick={() => setViewMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {viewMode === 'library' ? (
          <div className="sg-controls">
            <label className="sg-search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder="Search name, tags, description…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>

            <div className="sg-status-pills" role="tablist" aria-label="Status filter">
              {STATUS_PILLS.map((s) => (
                <button
                  key={s.id || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={filters.status === s.id}
                  className={`sg-pill ${filters.status === s.id ? 'is-active' : ''}`}
                  onClick={() => setFilters((prev) => ({ ...prev, status: s.id }))}
                >
                  {s.label}
                  {s.id && statusCounts[s.id] > 0 ? ` · ${statusCounts[s.id]}` : ''}
                </button>
              ))}
            </div>

            <select
              className="sg-select"
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className="sg-select"
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              aria-label="Type"
            >
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              className="sg-select"
              value={filters.colorMode}
              onChange={(e) => setFilters((prev) => ({ ...prev, colorMode: e.target.value }))}
              aria-label="Color mode"
            >
              <option value="">Any color</option>
              <option value="recolorable">Recolorable</option>
              <option value="fixed">Fixed colors</option>
            </select>

            <span className="sg-count">{total} graphic{total === 1 ? '' : 's'}</span>
          </div>
        ) : (
          <div className="sg-controls sg-controls--gi">
            <div className="sg-status-pills" role="tablist" aria-label="Asset kind">
              {GI_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="tab"
                  aria-selected={giKind === k.id}
                  className={`sg-pill ${giKind === k.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setGiKind(k.id)
                    setGiPage(1)
                    setGiCategoryId('')
                    setGiPackId('')
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <label className="sg-search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder={
                  giKind === 'icon' ? 'Filter icons in pack…' : 'Search free illustrations…'
                }
                value={giQ}
                onChange={(e) => {
                  setGiQ(e.target.value)
                  setGiPage(1)
                }}
              />
            </label>

            <span className="sg-count">
              {giTotal} free {giKind === 'icon' ? 'icon' : 'illustration'}
              {giTotal === 1 ? '' : 's'}
            </span>
            {giRateLimit?.remaining != null ? (
              <span className="sg-count sg-count--muted" title="Monthly API remaining">
                API {giRateLimit.remaining}/{giRateLimit.limit ?? '—'}
              </span>
            ) : null}
          </div>
        )}

        {viewMode === 'library' && error ? <p className="sg-alert">{error}</p> : null}
        {viewMode === 'getillustrations' && giError ? <p className="sg-alert">{giError}</p> : null}
        {viewMode === 'getillustrations' && !giConfigured ? (
          <p className="sg-alert">
            Set <code>GETILLUSTRATIONS_API_KEY</code> on the backend to browse free assets.
          </p>
        ) : null}
      </div>

      <div className="sg-body">
        {viewMode === 'getillustrations' ? (
          <div className="sg-gi-layout">
            <aside className="sg-gi-cats" aria-label="Categories">
              <p className="sg-gi-cats-title">
                {giKind === 'icon' ? 'Free icon packs' : 'Categories'}
              </p>
              {giKind === 'illustration' ? (
                <button
                  type="button"
                  className={`sg-gi-cat ${!giCategoryId ? 'is-active' : ''}`}
                  onClick={() => {
                    setGiPage(1)
                    setGiCategoryId('')
                  }}
                >
                  All free
                </button>
              ) : null}
              {giCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`sg-gi-cat ${giActiveCategoryId === c.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setGiPage(1)
                    if (giKind === 'illustration') setGiCategoryId(c.id)
                    else setGiPackId(c.id)
                  }}
                >
                  <span>{c.name}</span>
                  {c.count != null ? <em>{c.count}</em> : null}
                </button>
              ))}
            </aside>

            <div className="sg-gi-main">
              {giLoading ? (
                <p className="sg-loading">Loading free GetIllustrations catalog…</p>
              ) : showGiEmpty ? (
                <div className="sg-hero-empty">
                  <div className="sg-hero-art" aria-hidden>
                    <ExternalLink size={34} strokeWidth={1.75} />
                  </div>
                  <h3>No free assets in this filter</h3>
                  <p>Try another category or pack, or clear the search.</p>
                </div>
              ) : (
                <>
                  <div className="sg-grid">
                    {giItems.map((row) => {
                      const iconish = row.kind === 'icon'
                      return (
                        <article
                          key={`${row.kind}-${row.packId}-${row.id}`}
                          className={`sg-card ${iconish ? 'sg-card--icon' : ''}`}
                        >
                          <div className={`sg-card-preview ${iconish ? 'sg-card-preview--icon' : ''}`}>
                            <span className="sg-card-badge sg-card-badge--published">free</span>
                            <GraphicPreview
                              src={row.thumbnailUrl || row.imageUrl}
                              variant={iconish ? 'icon' : 'default'}
                            />
                          </div>
                          <div className="sg-card-body">
                            <strong title={row.name}>{row.name}</strong>
                            <span className="sg-card-meta">
                              {row.categoryName || row.packName || row.kind}
                              {row.svgAvailable ? ' · SVG' : ''}
                            </span>
                          </div>
                          <div className="sg-card-actions">
                            {row.imageUrl ? (
                              <a
                                className="sg-btn sg-btn--sm"
                                href={row.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink size={13} /> Open
                              </a>
                            ) : null}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                  {giTotalPages > 1 ? (
                    <div className="sg-gi-pager">
                      <button
                        type="button"
                        className="sg-btn sg-btn--sm"
                        disabled={giPage <= 1 || giLoading}
                        onClick={() => setGiPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <span>
                        Page {giPage} / {giTotalPages}
                      </span>
                      <button
                        type="button"
                        className="sg-btn sg-btn--sm"
                        disabled={giPage >= giTotalPages || giLoading}
                        onClick={() => setGiPage((p) => p + 1)}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : loading ? (
          <p className="sg-loading">Loading graphics…</p>
        ) : showEmpty ? (
          <div
            className={`sg-hero-empty ${pageDragOver ? 'is-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setPageDragOver(true)
            }}
            onDragLeave={() => setPageDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setPageDragOver(false)
              acceptFile(e.dataTransfer.files?.[0])
            }}
          >
            <div className="sg-hero-art" aria-hidden>
              <Upload size={34} strokeWidth={1.75} />
            </div>
            <h3>No graphics in the library yet</h3>
            <p>
              Drop an SVG here or open the upload window to add decorations for covers, content
              slides, and CTAs.
            </p>
            <div className="sg-hero-actions">
              <button type="button" className="sg-btn sg-btn--primary" onClick={openCreate}>
                <Plus size={16} /> Add Graphic
              </button>
            </div>
          </div>
        ) : (
          <div className="sg-grid">
            {items.map((row) => {
              const iconish = isIconGraphic(row)
              return (
                <article key={row.id} className={`sg-card ${iconish ? 'sg-card--icon' : ''}`}>
                  <div className={`sg-card-preview ${iconish ? 'sg-card-preview--icon' : ''}`}>
                    <span className={`sg-card-badge sg-card-badge--${row.status}`}>{row.status}</span>
                    <GraphicPreview src={row.previewUrl || row.fileUrl} variant={iconish ? 'icon' : 'default'} />
                  </div>
                  <div className="sg-card-body">
                    <strong title={row.name}>{row.name}</strong>
                    <span className="sg-card-meta">
                      {row.category} · {row.colorMode}
                    </span>
                  </div>
                  <div className="sg-card-actions">
                    <button type="button" className="sg-btn sg-btn--sm" onClick={() => openEdit(row)}>
                      <Pencil size={13} /> Edit
                    </button>
                    {row.status !== 'published' ? (
                      <button
                        type="button"
                        className="sg-btn sg-btn--sm sg-btn--primary"
                        disabled={busyId === row.id}
                        onClick={() => runAction(row.id, () => superadminService.publishGraphic(row.id))}
                      >
                        <CheckCircle2 size={13} /> Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="sg-btn sg-btn--sm"
                        disabled={busyId === row.id}
                        onClick={() => runAction(row.id, () => superadminService.unpublishGraphic(row.id))}
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      type="button"
                      className="sg-btn sg-btn--sm"
                      disabled={busyId === row.id}
                      onClick={() => runAction(row.id, () => superadminService.archiveGraphic(row.id))}
                    >
                      <Archive size={13} />
                    </button>
                    <button
                      type="button"
                      className="sg-btn sg-btn--sm sg-btn--danger"
                      disabled={busyId === row.id}
                      onClick={() => {
                        if (!window.confirm(`Delete “${row.name}”?`)) return
                        runAction(row.id, () => superadminService.deleteGraphic(row.id))
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="sg-modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="sg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sg-add-graphic-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sg-modal-header">
              <div>
                <h3 id="sg-add-graphic-title">{editingId ? 'Edit Graphic' : 'Add Graphic'}</h3>
                <p>Upload and organize a graphic for the presentation library</p>
              </div>
              <button type="button" className="sg-modal-close" aria-label="Close" onClick={closeModal}>
                <X size={18} />
              </button>
            </header>

            <div className="sg-modal-body">
              {modalError && <p className="sg-modal-error">{modalError}</p>}

              <section className="sg-modal-section">
                <h4 className="sg-section-label">Graphic</h4>
                {previewSrc ? (
                  <div className={`sg-upload-zone has-file ${modalIsIcon ? 'has-file--icon' : ''}`}>
                    <div className="sg-upload-preview">
                      <div className={`sg-upload-preview-art ${modalIsIcon ? 'sg-upload-preview-art--icon' : ''}`}>
                        <GraphicPreview src={previewSrc} variant={modalIsIcon ? 'icon' : 'default'} />
                      </div>
                      {!editingId && (
                        <div className="sg-upload-preview-actions">
                          <button
                            type="button"
                            className="sg-btn sg-btn--sm"
                            onClick={() => modalFileRef.current?.click()}
                          >
                            Replace SVG
                          </button>
                          <button
                            type="button"
                            className="sg-btn sg-btn--sm sg-btn--ghost"
                            onClick={() => {
                              setFile(null)
                              if (filePreview) URL.revokeObjectURL(filePreview)
                              setFilePreview('')
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {file?.name && <p className="sg-upload-meta">{file.name}</p>}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`sg-upload-zone ${dragOver ? 'is-over' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                      acceptFile(e.dataTransfer.files?.[0], { openModal: false })
                    }}
                    onClick={() => modalFileRef.current?.click()}
                  >
                    <div className="sg-upload-icon" aria-hidden>
                      <ArrowUp size={20} strokeWidth={2.25} />
                    </div>
                    <p className="sg-upload-title">Upload SVG</p>
                    <p className="sg-upload-hint">
                      Drag &amp; drop your SVG here or{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          modalFileRef.current?.click()
                        }}
                      >
                        Browse files
                      </button>
                    </p>
                    <p className="sg-upload-meta">SVG · Max 1.5 MB</p>
                  </div>
                )}
                <input
                  ref={modalFileRef}
                  type="file"
                  accept="image/svg+xml,.svg"
                  hidden
                  onChange={(e) => {
                    acceptFile(e.target.files?.[0], { openModal: false })
                    e.target.value = ''
                  }}
                />
              </section>

              <section className="sg-modal-section">
                <h4 className="sg-section-label">Details</h4>
                <div className="sg-form-grid">
                  <label className="sg-field sg-field--full">
                    <span className="sg-field-label">
                      Name <span className="sg-req">*</span>
                    </span>
                    <input
                      value={form.name}
                      placeholder="Botanical Sparkle"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>

                  <label className="sg-field">
                    <span className="sg-field-label">
                      Category <span className="sg-req">*</span>
                    </span>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sg-field">
                    <span className="sg-field-label">
                      Type <span className="sg-req">*</span>
                    </span>
                    <select
                      value={form.type}
                      onChange={(e) => {
                        const type = e.target.value
                        setForm((prev) => {
                          const next = { ...prev, type }
                          if (type === 'icon') {
                            next.category = prev.category === 'ornaments' ? 'icons' : prev.category
                            next.colorMode = 'recolorable'
                            next.usage = ICON_DEFAULT_USAGE
                          } else if (prev.type === 'icon') {
                            next.usage = DECOR_DEFAULT_USAGE
                            next.colorMode = 'fixed'
                          }
                          return next
                        })
                      }}
                    >
                      {TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="sg-field sg-field--full">
                    <span className="sg-field-label">Tags</span>
                    <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
                  </div>

                  <label className="sg-field">
                    <span className="sg-field-label">Style</span>
                    <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                      {STYLE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sg-field">
                    <span className="sg-field-label">Mood</span>
                    <select value={form.moods} onChange={(e) => setForm({ ...form, moods: e.target.value })}>
                      {MOOD_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sg-field sg-field--full">
                    <span className="sg-field-label">Description</span>
                    <textarea
                      rows={2}
                      value={form.description}
                      placeholder="Optional notes for curators"
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              <section className="sg-modal-section">
                <h4 className="sg-section-label">Design behavior</h4>

                <div className="sg-choice-group">
                  <span className="sg-choice-label">Color behavior</span>
                  <div className="sg-choice-row">
                    <label className="sg-radio">
                      <input
                        type="radio"
                        name="colorMode"
                        checked={form.colorMode === 'fixed'}
                        onChange={() => setForm({ ...form, colorMode: 'fixed' })}
                      />
                      Fixed colors
                    </label>
                    <label className="sg-radio">
                      <input
                        type="radio"
                        name="colorMode"
                        checked={form.colorMode === 'recolorable'}
                        onChange={() => setForm({ ...form, colorMode: 'recolorable' })}
                      />
                      Recolorable
                    </label>
                  </div>
                  <p className="sg-upload-meta" style={{ marginTop: 0 }}>
                    Use Fixed for multi-color illustrations. Recolorable is only for single-color SVGs that use currentColor.
                  </p>
                </div>

                <div className="sg-choice-group">
                  <span className="sg-choice-label">Contains text?</span>
                  <div className="sg-choice-row">
                    <label className="sg-radio">
                      <input
                        type="radio"
                        name="containsText"
                        checked={!form.containsText}
                        onChange={() => setForm({ ...form, containsText: false })}
                      />
                      No
                    </label>
                    <label className="sg-radio">
                      <input
                        type="radio"
                        name="containsText"
                        checked={form.containsText}
                        onChange={() => setForm({ ...form, containsText: true })}
                      />
                      Yes
                    </label>
                  </div>
                </div>

                <div className="sg-choice-group">
                  <span className="sg-choice-label">Recommended for</span>
                  <div className="sg-usage-grid">
                    {USAGE_OPTIONS.map((u) => {
                      const on = (form.usage || []).includes(u.id)
                      return (
                        <label key={u.id} className={`sg-usage-chip ${on ? 'is-on' : ''}`}>
                          <input type="checkbox" checked={on} onChange={() => toggleUsage(u.id)} />
                          {u.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </section>
            </div>

            <footer className="sg-modal-footer">
              <button type="button" className="sg-btn sg-btn--ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="sg-btn" onClick={() => save()} disabled={saving}>
                Save as Draft
              </button>
              <button
                type="button"
                className="sg-btn sg-btn--primary"
                onClick={() => save({ publishAfter: true })}
                disabled={saving}
              >
                Publish
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
