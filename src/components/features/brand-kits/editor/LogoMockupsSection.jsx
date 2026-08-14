import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  MdAutoAwesome,
  MdInfoOutline,
  MdMoreVert,
  MdVisibility,
  MdRefresh,
  MdDownload,
  MdDelete,
  MdClose,
} from 'react-icons/md'
import { FontMetricSelect } from '../TypeSpecEditors'
import { MOCKUP_CATEGORY_LABELS } from '../../../../utils/brandKitHelpers'

function mockupLabel(templates, templateId, fallback) {
  const tpl = (templates || []).find((t) => t.id === templateId)
  return tpl?.label || fallback || templateId || 'Mockup'
}

function MockupGeneratingFrame({ label = 'Creating your mockup…' }) {
  return (
    <div className="bk-mockup-gen-frame" aria-live="polite">
      <div className="bk-mockup-gen-blobs" aria-hidden>
        <span className="bk-mockup-blob bk-mockup-blob--a" />
        <span className="bk-mockup-blob bk-mockup-blob--b" />
        <span className="bk-mockup-blob bk-mockup-blob--c" />
        <span className="bk-mockup-blob bk-mockup-blob--d" />
      </div>
      <div className="bk-mockup-gen-shimmer" aria-hidden />
      <div className="bk-mockup-gen-label">
        <MdAutoAwesome size={16} />
        <span>{label}</span>
      </div>
    </div>
  )
}

function MockupCardMenu({ open, canWrite, onPreview, onRegenerate, onDownload, onDelete }) {
  if (!open) return null
  return (
    <div className="bk-logo-card-menu bk-mockup-card-menu" role="menu">
      <button type="button" role="menuitem" onClick={onPreview}>
        <MdVisibility size={15} /> Preview
      </button>
      {canWrite && (
        <button type="button" role="menuitem" onClick={onRegenerate}>
          <MdRefresh size={15} /> Regenerate
        </button>
      )}
      <button type="button" role="menuitem" onClick={onDownload}>
        <MdDownload size={15} /> Download
      </button>
      {canWrite && (
        <button type="button" role="menuitem" className="is-danger" onClick={onDelete}>
          <MdDelete size={15} /> Delete
        </button>
      )}
    </div>
  )
}

function getRect(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function applyFlipTransform(el, from, to) {
  if (!el || !from || !to || !to.width || !to.height) return
  const dx = from.left - to.left
  const dy = from.top - to.top
  const sx = from.width / to.width
  const sy = from.height / to.height
  el.style.transformOrigin = 'top left'
  el.style.transition = 'none'
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
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
  onLoad,
  onDelete,
  onDownload,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [menuKey, setMenuKey] = useState(null)
  const [modal, setModal] = useState(null)
  // { templateId, label, url, phase: 'loading'|'ready', anim: 'open'|'idle'|'closing' }
  const menuAnchorRef = useRef(null)
  const cardRefs = useRef({})
  const modalPanelRef = useRef(null)
  const modalOpenedForGen = useRef(null)

  useEffect(() => {
    onLoad?.()
  }, [onLoad])

  useEffect(() => {
    if (!menuKey) return undefined
    const onDoc = (e) => {
      if (menuAnchorRef.current && !menuAnchorRef.current.contains(e.target)) {
        setMenuKey(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuKey])

  const templateOptions = useMemo(
    () =>
      (templates || []).map((tpl) => {
        const cat = MOCKUP_CATEGORY_LABELS[tpl.category] || tpl.category
        return {
          value: tpl.id,
          label: cat ? `${tpl.label} · ${cat}` : tpl.label || tpl.id,
        }
      }),
    [templates]
  )

  const selectedTemplate = useMemo(
    () => (templates || []).find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  )

  const freeRemaining = billing?.freeRemaining ?? null
  const freeLimit = billing?.freeLimit ?? null
  const costLabel =
    freeRemaining == null ? null : freeRemaining > 0 ? 'Free' : '4 AC'

  const generatedItems = useMemo(() => {
    const map = new Map()

    for (const item of savedMockups || []) {
      const templateId = String(item.role || item.templateId || item.name || item.id || '')
      if (!templateId) continue
      map.set(templateId, {
        ...item,
        templateId,
        url: item.url || item.presignedUrl || item.src,
        mediaId: item.id || item._id || item.mediaId,
      })
    }

    for (const [templateId, preview] of Object.entries(previews || {})) {
      if (!preview?.url) continue
      const existing = map.get(templateId) || {}
      map.set(templateId, {
        ...existing,
        ...preview,
        templateId,
        url: preview.url,
        mediaId: preview.mediaId || existing.mediaId || existing.id || existing._id,
        role: templateId,
      })
    }

    return [...map.values()].filter((item) => item.url)
  }, [savedMockups, previews])

  // When generation finishes, reveal image inside the open modal
  useEffect(() => {
    if (!modal || modal.phase !== 'loading') return
    const tid = modal.templateId
    if (generatingTemplateId === tid) return
    // still generating something else — wait if we started this gen
    if (generatingTemplateId) return
    const item = generatedItems.find((g) => String(g.templateId) === String(tid))
    const url = item?.url
    if (url) {
      setModal((prev) => (prev ? { ...prev, url, phase: 'ready', anim: 'idle' } : prev))
      modalOpenedForGen.current = null
    } else if (modalOpenedForGen.current === tid && !generatingTemplateId) {
      // generation ended without url — keep modal but stop infinite loading after a beat
      // stay loading only while generating; if failed, close loading state
      setModal((prev) =>
        prev && prev.templateId === tid ? { ...prev, phase: 'ready', url: prev.url || null } : prev
      )
      modalOpenedForGen.current = null
    }
  }, [modal, generatingTemplateId, generatedItems])

  const openFromCard = useCallback((templateId, label, url) => {
    const card = cardRefs.current[templateId]
    const origin = getRect(card)
    setModal({
      templateId,
      label,
      url,
      phase: 'ready',
      anim: 'open',
      origin,
    })
  }, [])

  const startGenerate = useCallback(
    async (templateId) => {
      if (!templateId || !canWrite || !hasLogo || generatingTemplateId) return
      const label = mockupLabel(templates, templateId)
      const card = cardRefs.current[templateId]
      const origin = getRect(card)
      modalOpenedForGen.current = templateId
      setMenuKey(null)
      setModal({
        templateId,
        label,
        url: null,
        phase: 'loading',
        anim: origin ? 'open' : 'idle',
        origin,
      })
      try {
        await onGenerate?.(templateId, true)
      } catch {
        modalOpenedForGen.current = null
        setModal(null)
      }
    },
    [canWrite, hasLogo, generatingTemplateId, templates, onGenerate]
  )

  const closeModal = useCallback(() => {
    setModal((current) => {
      if (!current || current.anim === 'closing') return current
      const panel = modalPanelRef.current
      const card = cardRefs.current[current.templateId]
      const from = getRect(panel)
      const to = getRect(card)

      if (panel && from && to && to.width > 2 && (current.url || current.phase === 'ready')) {
        requestAnimationFrame(() => {
          panel.style.transformOrigin = 'top left'
          panel.style.transition =
            'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease'
          panel.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${Math.max(0.01, to.width / from.width)}, ${Math.max(0.01, to.height / from.height)})`
          panel.style.opacity = '0.25'
          const backdrop = panel.parentElement
          if (backdrop) {
            backdrop.style.transition = 'opacity 0.38s ease'
            backdrop.style.opacity = '0'
          }
          window.setTimeout(() => setModal(null), 400)
        })
        return { ...current, anim: 'closing' }
      }

      if (panel) {
        panel.style.transition = 'transform 0.28s ease, opacity 0.28s ease'
        panel.style.transform = 'scale(0.92)'
        panel.style.opacity = '0'
        const backdrop = panel.parentElement
        if (backdrop) {
          backdrop.style.transition = 'opacity 0.28s ease'
          backdrop.style.opacity = '0'
        }
        window.setTimeout(() => setModal(null), 300)
        return { ...current, anim: 'closing' }
      }
      return null
    })
  }, [])

  // Maximize open animation from card → modal (once per open)
  useEffect(() => {
    if (!modal || modal.anim !== 'open') return undefined
    const panel = modalPanelRef.current
    if (!panel) return undefined
    const origin = modal.origin

    if (origin && origin.width > 2) {
      const to = getRect(panel)
      applyFlipTransform(panel, origin, to)
      void panel.offsetWidth
      panel.style.transition =
        'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    } else {
      panel.style.opacity = '0'
      panel.style.transform = 'scale(0.94)'
      void panel.offsetWidth
      panel.style.transition = 'transform 0.32s ease, opacity 0.32s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    }

    const t = window.setTimeout(() => {
      setModal((prev) => (prev && prev.anim === 'open' ? { ...prev, anim: 'idle' } : prev))
    }, 420)
    return () => window.clearTimeout(t)
    // Only when opening a new modal session — not when phase flips to ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal?.templateId, modal?.anim === 'open'])

  useEffect(() => {
    if (!modal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && modal.anim !== 'closing') closeModal()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modal, closeModal])

  const isBusy = Boolean(generatingTemplateId)
  const canGenerate = canWrite && hasLogo && selectedTemplateId && !isBusy
  const closeMenu = () => setMenuKey(null)

  const modalNode =
    modal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`bk-mockup-morph-backdrop${modal.anim === 'closing' ? ' is-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={modal.label}
            onClick={() => {
              if (modal.anim !== 'closing') closeModal()
            }}
          >
            <button
              type="button"
              className="bk-mockup-morph-close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation()
                closeModal()
              }}
            >
              <MdClose size={20} />
            </button>
            <div
              className="bk-mockup-morph-panel"
              ref={modalPanelRef}
              onClick={(e) => e.stopPropagation()}
            >
              {modal.phase === 'loading' || (!modal.url && generatingTemplateId === modal.templateId) ? (
                <MockupGeneratingFrame
                  label={
                    generatingTemplateId === modal.templateId
                      ? 'Creating your mockup…'
                      : 'Preparing…'
                  }
                />
              ) : modal.url ? (
                <img src={modal.url} alt={modal.label} className="bk-mockup-morph-image" />
              ) : (
                <div className="bk-mockup-morph-empty">
                  <p>Generation finished, but no image was returned. Try again.</p>
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={() => startGenerate(modal.templateId)}
                  >
                    <MdRefresh size={16} /> Retry
                  </button>
                </div>
              )}
              <p className="bk-mockup-morph-caption">{modal.label}</p>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="bk-type-specimen-box bk-imagery-section">
      <div className="bk-type-box-head">
        <div>
          <span className="bk-type-box-tag">Logo in the wild</span>
          <p className="bk-imagery-section-desc">
            Place your brand mark on product photography — choose a surface, generate, and keep
            the best shots in your kit.
          </p>
        </div>
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
        <div className="bk-mockup-create-bar">
          <div className="bk-mockup-create-copy">
            <h3 className="bk-mockup-create-title">Create your brand logo on</h3>
            <p className="bk-mockup-create-sub">
              Pick a product or environment, then generate a studio-ready mockup with your logo.
            </p>
          </div>

          <div className="bk-mockup-create-controls">
            <div className="bk-mockup-create-field">
              <span className="bk-tb-lbl">Create it on</span>
              <FontMetricSelect
                label=""
                value={selectedTemplateId}
                options={[{ value: '', label: 'Select a surface…' }, ...templateOptions]}
                disabled={!canWrite || !templates.length}
                menuLabel="Mockup surface"
                onChange={(value) => setSelectedTemplateId(value)}
              />
            </div>

            {selectedTemplateId ? (
              <button
                type="button"
                className="bk-extract-btn bk-mockup-generate-btn"
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
                onClick={() => startGenerate(selectedTemplateId)}
              >
                <MdAutoAwesome size={16} />
                {isBusy && generatingTemplateId === selectedTemplateId
                  ? 'Generating…'
                  : costLabel
                    ? `Generate · ${costLabel}`
                    : 'Generate'}
              </button>
            ) : null}
          </div>

          {selectedTemplate ? (
            <p className="bk-mockup-selected-hint">
              {selectedTemplate.description ||
                `${selectedTemplate.label} with your primary brand logo`}
            </p>
          ) : null}
        </div>
      )}

      {generatedItems.length > 0 && (
        <div className="bk-mockup-results">
          <div className="bk-type-box-head bk-imagery-subhead">
            <span className="bk-type-box-tag">Generated mockups</span>
            <span className="bk-mockup-results-count">{generatedItems.length}</span>
          </div>

          <div className="bk-mockup-results-grid">
            {generatedItems.map((item) => {
              const templateId = String(item.templateId || item.role || '')
              const key = templateId || item.mediaId || item.id
              const label = mockupLabel(templates, templateId, item.name || item.role)
              const url = item.url || item.presignedUrl || item.src
              const busy = generatingTemplateId === templateId
              const menuOpen = menuKey === key

              return (
                <article
                  key={key}
                  className={`bk-mockup-result-card${busy ? ' is-busy' : ''}`}
                >
                  <div
                    className="bk-mockup-result-preview"
                    ref={(el) => {
                      if (templateId) cardRefs.current[templateId] = el
                    }}
                  >
                    <button
                      type="button"
                      className="bk-mockup-result-hit"
                      onClick={() => openFromCard(templateId, label, url)}
                      aria-label={`Preview ${label}`}
                    >
                      <img src={url} alt={`${label} mockup`} />
                    </button>
                    {busy && modal?.templateId !== templateId && (
                      <div className="bk-mockup-card-loading" aria-live="polite">
                        <div className="bk-mockup-spinner" />
                        <span>Regenerating…</span>
                      </div>
                    )}

                    <div
                      className="bk-logo-card-menu-wrap bk-mockup-result-menu"
                      ref={menuOpen ? menuAnchorRef : null}
                    >
                      <button
                        type="button"
                        className="bk-logo-card-menu-btn"
                        aria-label={`${label} options`}
                        aria-expanded={menuOpen}
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuKey(menuOpen ? null : key)
                        }}
                      >
                        <MdMoreVert size={18} />
                      </button>
                      <MockupCardMenu
                        open={menuOpen}
                        canWrite={canWrite}
                        onPreview={() => {
                          closeMenu()
                          openFromCard(templateId, label, url)
                        }}
                        onRegenerate={() => {
                          closeMenu()
                          startGenerate(templateId)
                        }}
                        onDownload={() => {
                          closeMenu()
                          onDownload?.(item, label)
                        }}
                        onDelete={() => {
                          closeMenu()
                          onDelete?.(item)
                        }}
                      />
                    </div>
                  </div>
                  <div className="bk-mockup-result-meta">
                    <strong>{label}</strong>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !generatedItems.length && templates.length > 0 ? (
        <p className="bk-mockup-empty">
          No mockups yet. Choose a surface above and generate your first shot.
        </p>
      ) : null}

      {modalNode}
    </div>
  )
}
