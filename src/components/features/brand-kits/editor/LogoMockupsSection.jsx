import { useEffect, useMemo, useState } from 'react'
import {
  MdAutoAwesome,
  MdInfoOutline,
  MdRefresh,
  MdCheck,
} from 'react-icons/md'
import { SectionHead } from '../SectionHead'
import {
  MOCKUP_CATEGORY_LABELS,
  MOCKUP_CATEGORY_ORDER,
} from '../../../../utils/brandKitHelpers'

function MockupPlaceholder({ templateId, label }) {
  const initial = String(label || templateId || '?')
    .slice(0, 1)
    .toUpperCase()
  return (
    <div className={`bk-mockup-placeholder bk-mockup-placeholder--${templateId || 'generic'}`}>
      <span className="bk-mockup-placeholder-glyph" aria-hidden>
        {initial}
      </span>
      <span className="bk-mockup-placeholder-label">{label || templateId}</span>
    </div>
  )
}

export default function LogoMockupsSection({
  canWrite,
  hasLogo,
  templates = [],
  billing = null,
  savedMockups = [],
  loading = false,
  generatingTemplateId = null,
  previews = {},
  onGenerate,
  onSave,
  onLoad,
}) {
  const [category, setCategory] = useState('all')

  useEffect(() => {
    onLoad?.()
  }, [onLoad])

  const categories = useMemo(() => {
    const present = new Set((templates || []).map((t) => t.category).filter(Boolean))
    return MOCKUP_CATEGORY_ORDER.filter((c) => present.has(c))
  }, [templates])

  const filtered = useMemo(() => {
    if (category === 'all') return templates || []
    return (templates || []).filter((t) => t.category === category)
  }, [templates, category])

  const freeRemaining = billing?.freeRemaining ?? null
  const freeLimit = billing?.freeLimit ?? null
  const costLabel =
    freeRemaining == null
      ? null
      : freeRemaining > 0
        ? 'Free'
        : '4 AC'

  const savedByTemplate = useMemo(() => {
    const map = {}
    for (const m of savedMockups || []) {
      const key = m.role || m.templateId || m.name
      if (key) map[String(key)] = m
    }
    return map
  }, [savedMockups])

  return (
    <section className="customize-card bk-mockup-section">
      <div className="bk-type-header-row" style={{ marginBottom: 16 }}>
        <SectionHead
          icon={MdAutoAwesome}
          title="Logo in the wild"
          hint="AI product photos with your brand logo on mugs, apparel, signage, and more."
        />
        <div className="bk-mockup-header-meta">
          {freeRemaining != null && freeLimit != null && (
            <span className="bk-mockup-free-badge">
              {freeRemaining} of {freeLimit} free
            </span>
          )}
          {!hasLogo && (
            <span className="bk-mockup-need-logo">
              <MdInfoOutline size={14} /> Upload a logo first
            </span>
          )}
        </div>
      </div>

      {loading && !templates.length ? (
        <p className="bk-mockup-loading">Loading mockup catalog…</p>
      ) : (
        <>
          <div className="bk-mockup-category-tabs" role="tablist" aria-label="Mockup categories">
            <button
              type="button"
              role="tab"
              aria-selected={category === 'all'}
              className={`bk-mockup-cat-tab ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                className={`bk-mockup-cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {MOCKUP_CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div className="bk-mockup-grid">
            {filtered.map((tpl) => {
              const id = tpl.id
              const preview = previews[id]
              const saved = savedByTemplate[id]
              const displayUrl = preview?.url || saved?.url || saved?.presignedUrl || saved?.src
              const isBusy = generatingTemplateId === id
              const canGenerate = canWrite && hasLogo && !generatingTemplateId

              return (
                <article key={id} className={`bk-mockup-card ${isBusy ? 'is-busy' : ''}`}>
                  <div className="bk-mockup-card-preview">
                    {displayUrl ? (
                      <img src={displayUrl} alt={`${tpl.label} mockup`} />
                    ) : (
                      <MockupPlaceholder templateId={id} label={tpl.label} />
                    )}
                    {isBusy && (
                      <div className="bk-mockup-card-loading" aria-live="polite">
                        <div className="bk-mockup-spinner" />
                        <span>Generating… this can take up to 90s</span>
                      </div>
                    )}
                    {displayUrl && (preview?.saved || saved) && (
                      <span className="bk-mockup-preview-chip bk-mockup-preview-chip--saved">
                        <MdCheck size={12} /> Saved
                      </span>
                    )}
                    {preview?.saved === false && displayUrl && !saved && (
                      <span className="bk-mockup-preview-chip">Preview</span>
                    )}
                  </div>

                  <div className="bk-mockup-card-body">
                    <div>
                      <h4 className="bk-mockup-card-title">{tpl.label}</h4>
                      <p className="bk-mockup-card-desc">
                        {tpl.description || `${tpl.label} with your logo`}
                      </p>
                    </div>

                    <div className="bk-mockup-card-actions">
                      <button
                        type="button"
                        className="bk-extract-btn"
                        disabled={!canGenerate}
                        title={
                          !hasLogo
                            ? 'Upload a logo first'
                            : !canWrite
                              ? 'Only owners and admins can generate'
                              : costLabel
                                ? `Generate & save (${costLabel})`
                                : 'Generate and save mockup'
                        }
                        onClick={() => onGenerate?.(id, true)}
                      >
                        <MdAutoAwesome size={14} />
                        {isBusy
                          ? 'Generating…'
                          : costLabel
                            ? `Generate · ${costLabel}`
                            : 'Generate'}
                      </button>

                      {(preview?.url || saved) && canWrite && (
                        <button
                          type="button"
                          className="bk-mockup-secondary-btn"
                          disabled={!canGenerate}
                          onClick={() => onGenerate?.(id, true)}
                          title="Regenerate and save to kit (uses free slot or credits)"
                        >
                          <MdRefresh size={14} />
                          Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {!filtered.length && (
            <p className="bk-mockup-empty">No templates in this category.</p>
          )}
        </>
      )}

      {(savedMockups || []).length > 0 && (
        <div className="bk-mockup-saved-block">
          <h4 className="media-section-label">Saved mockups</h4>
          <div className="bk-mockup-saved-grid">
            {savedMockups.map((item) => {
              const id = item.id || item._id || item.role || item.templateId
              const url = item.url || item.presignedUrl || item.src
              const label = item.role || item.templateId || item.name || 'Mockup'
              return (
                <div key={id} className="bk-mockup-saved-card">
                  {url ? <img src={url} alt={label} /> : <MockupPlaceholder label={label} />}
                  <span className="bk-mockup-saved-label">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
