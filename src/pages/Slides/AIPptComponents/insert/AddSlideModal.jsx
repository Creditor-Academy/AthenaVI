import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiSearch, FiX, FiPlus } from 'react-icons/fi'
import LayoutPolishedPreview from '../../../../components/ppt/LayoutPolishedPreview'
import PackSlidePreview from '../../../../components/ppt/PackSlidePreview'
import presentationService from '../../../../services/presentationService'
import {
  normalizeDeckPacks,
  normalizeDeckPackDetail,
  resolvePackThumbnailUrl,
  resolvePackColorFallback,
  PPT_CAPS,
} from '../../../../utils/presentationHelpers'
import {
  buildLayoutSchemaMap,
  enrichLayoutSchemaForPreview,
  getDeckLayoutSchema,
  listDeckLayoutIds,
  mergeCatalogLayoutTemplates,
} from '../../../../utils/deckLayoutRegistry'
import {
  isBrowsePrimaryLayout,
  pickSimilarLayouts,
  templateLayoutId,
} from '../../../../utils/similarLayouts'
import { isCompiledPricingLayout } from '../../../../utils/pricingCompiledPreview'
import './AddSlideModal.css'

/** Internal render size — scaled down to card; large previews keep text readable. */
const PREVIEW_BASE_W = 520
const PREVIEW_BASE_H = 293

/** Matches backend layoutCategories.js category ids. */
const LAYOUT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'simple_slides', label: 'Simple slides' },
  { id: 'grid', label: 'Grid' },
  { id: 'charts_and_data', label: 'Charts and data' },
  { id: 'timeline_and_plans', label: 'Timeline and project plans' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'people_and_team', label: 'People and team' },
  { id: 'quotes_and_testimonials', label: 'Quotes and testimonial' },
  { id: 'device_frames', label: 'Device frames' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'closing', label: 'Closing' },
]

function unwrapTemplateList(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.templates || payload?.items || payload?.data || []
}

function isDeckLayoutTemplate(template) {
  const type = String(template?.type || '').toUpperCase()
  if (type === 'DECK_PACK') return false
  if (type === 'DECK_LAYOUT') return true
  if (template?.schema?.pack_id) return false
  if (template?.schema?.layout_id) return true
  const contentType = String(template?.contentType || '').toLowerCase()
  return contentType === 'layout'
}

function resolveLayoutTemplateId(layoutId, layoutTemplates = []) {
  const key = String(layoutId || '').trim()
  if (!key) return null
  const match = layoutTemplates.find((template) => {
    const id = String(template?.schema?.layout_id || template?.layout_id || '').trim()
    return id === key
  })
  return match?.id || match?.templateId || null
}

function layoutCategoryId(layout) {
  const ct = String(
    layout?.schema?.content_type || layout?.contentType || layout?.rawContentType || ''
  ).toLowerCase()
  const layoutId = String(layout?.schema?.layout_id || layout?.layoutId || '').toLowerCase()
  const fromApi = Array.isArray(layout?.categories) ? layout.categories.find((c) => c !== 'all') : null
  if (fromApi) return fromApi

  if (ct === 'grid') return 'grid'
  if (ct === 'chart' || ct === 'stat') return 'charts_and_data'
  if (ct === 'timeline') return 'timeline_and_plans'
  if (ct === 'pricing' || layoutId.includes('pricing')) return 'pricing'
  if (ct === 'agenda') return 'agenda'
  if (ct === 'closing') return 'closing'
  if (ct === 'team') return 'people_and_team'
  if (ct === 'quote') return 'quotes_and_testimonials'
  if (ct === 'device_frames' || layoutId.startsWith('device_')) return 'device_frames'
  if (ct === 'diagram' || layoutId.startsWith('diagram_')) return 'diagrams'
  if (ct === 'comparison' || ct === 'pros_cons') return 'simple_slides'
  if (['title', 'bullet_list', 'section_divider', 'image+text', 'image_text'].includes(ct)) {
    return 'simple_slides'
  }
  return 'simple_slides'
}

function slideLabel(slide, slideIndex) {
  return (
    slide?.placeholder?.title ||
    slide?.intent ||
    slide?.contentType ||
    `Slide ${slideIndex + 1}`
  )
}

function buildSlidePickPayload(pack, slide, slideIndex, layoutTemplates, layoutSchemaMap = {}) {
  const layoutTemplateId = resolveLayoutTemplateId(slide?.layout_id, layoutTemplates)
  const layoutId = String(slide?.layout_id || '').trim() || null
  const title = slideLabel(slide, slideIndex)
  const schema =
    (layoutId && layoutSchemaMap[layoutId]) ||
    getDeckLayoutSchema(layoutId) ||
    null
  return {
    source: 'pack',
    packId: pack.id,
    layoutTemplateId,
    layoutId,
    schema,
    name: `${pack.name} · ${title}`,
    seed: slideHasCanvasElements(slide)
      ? { title, elements: slide.elements?.elements || [] }
      : null,
  }
}

function buildLayoutSchemaMapWithFallbacks(layoutTemplates, templatePacks) {
  const map = buildLayoutSchemaMap(layoutTemplates.map((layout) => ({ schema: layout.schema })))

  for (const pack of templatePacks) {
    const slides = pack.schema?.slides || []
    for (const slide of slides) {
      const layoutId = String(slide?.layout_id || '').trim()
      if (!layoutId || map[layoutId]) continue
      const registered = getDeckLayoutSchema(layoutId)
      if (registered) map[layoutId] = registered
    }
  }

  // Prefer code catalog over stale DB templates for known layouts.
  for (const layoutId of listDeckLayoutIds()) {
    const registered = getDeckLayoutSchema(layoutId)
    if (registered?.slots?.length) map[layoutId] = registered
  }

  return map
}

function resolveSchemaSlide(pack, slidePreview, slideIndex) {
  const slides = pack?.schema?.slides || []
  const order = slidePreview?.order ?? slideIndex + 1
  return (
    slides.find((s) => (s.order ?? slides.indexOf(s) + 1) === order) ||
    slides[slideIndex] ||
    {
      layout_id: slidePreview?.layoutId || slidePreview?.layout_id,
      order,
      content_type: slidePreview?.contentType,
    }
  )
}

function packSlideItems(pack) {
  if (pack?.slidePreviews?.length) {
    return pack.slidePreviews.map((sp, index) => ({
      key: `${pack.id}-${sp.order ?? index + 1}`,
      preview: sp,
      schemaSlide: resolveSchemaSlide(pack, sp, index),
      index,
    }))
  }
  return (pack?.schema?.slides || []).map((slide, index) => ({
    key: `${pack.id}-${slide.order ?? index}`,
    preview: {
      order: slide.order ?? index + 1,
      title: slideLabel(slide, index),
      contentType: slide.content_type || slide.contentType,
      layoutId: slide.layout_id,
      thumbnailUrl: null,
    },
    schemaSlide: slide,
    index,
  }))
}

/** Scale a fixed-size preview canvas to fit thumbnail cards (centered, readable text). */
function ScaledPreview({ children, baseWidth = PREVIEW_BASE_W, baseHeight = PREVIEW_BASE_H }) {
  const hostRef = useRef(null)
  const [transform, setTransform] = useState({ scale: 0.5, x: 0, y: 0 })

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined
    const update = () => {
      const width = node.clientWidth || 1
      const height = node.clientHeight || 1
      const scale = Math.min(width / baseWidth, height / baseHeight)
      const scaledW = baseWidth * scale
      const scaledH = baseHeight * scale
      setTransform({
        scale,
        x: Math.max(0, (width - scaledW) / 2),
        y: Math.max(0, (height - scaledH) / 2),
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [baseWidth, baseHeight])

  return (
    <div ref={hostRef} className="ppt-add-slide-preview-scaler">
      <div
        className="ppt-add-slide-preview-scaler-inner"
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function GalleryPreview({ schema, previewUrl, fallbackName, themeId, aspectRatio = '16:9' }) {
  const compiledPricing = isCompiledPricingLayout(schema?.layout_id || schema?.layoutId)
  if (previewUrl && !compiledPricing) {
    return <img src={previewUrl} alt="" className="ppt-add-slide-card-image" />
  }
  if (schema?.slots?.length || layoutSchemaHasCanvasElements(schema) || schema?.preview?.mode === 'canvas_elements') {
    return (
      <ScaledPreview>
        <LayoutPolishedPreview
          schema={schema}
          large
          fill
          aspectRatio={aspectRatio}
          style={{ width: PREVIEW_BASE_W, height: PREVIEW_BASE_H }}
        />
      </ScaledPreview>
    )
  }
  return <span className="ppt-add-slide-card-fallback">{fallbackName}</span>
}

function PackSlideGalleryPreview({ slide, layoutSchemaMap, themeId, aspectRatio, index = 0 }) {
  const layoutId = String(slide?.layout_id || '').trim()
  const hasSchema =
    layoutId &&
    (layoutSchemaMap[layoutId] || getDeckLayoutSchema(layoutId))

  if (!hasSchema) {
    return (
      <div className="ppt-add-slide-slide-fallback">
        <span>{slideLabel(slide, index)}</span>
      </div>
    )
  }

  return (
    <ScaledPreview>
      <PackSlidePreview
        slide={slide}
        layoutSchemaMap={layoutSchemaMap}
        themeId={themeId}
        aspectRatio={aspectRatio}
        index={index}
        large
        fill
        showBadge={false}
        style={{ width: PREVIEW_BASE_W, height: PREVIEW_BASE_H }}
      />
    </ScaledPreview>
  )
}

/**
 * Templates (multi-slide packs) / Layouts (single-slide structures) picker for Add slide.
 */
export default function AddSlideModal({
  open,
  onClose,
  workspaceId,
  disabled = false,
  onPick,
  slideCount = 0,
}) {
  const [tab, setTab] = useState('templates')
  const [query, setQuery] = useState('')
  const [layoutCategory, setLayoutCategory] = useState('all')
  const [templatePacks, setTemplatePacks] = useState([])
  const [layoutTemplates, setLayoutTemplates] = useState([])
  const [selectedPack, setSelectedPack] = useState(null)
  const [packDetailLoading, setPackDetailLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
      setTab('templates')
      setLayoutCategory('all')
      setSelectedPack(null)
      setLoadError('')
      return undefined
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (selectedPack) {
        setSelectedPack(null)
        return
      }
      onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose, selectedPack])

  useEffect(() => {
    if (!open || !workspaceId) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [templatesPayload, packsPayload] = await Promise.all([
          presentationService.listTemplates(workspaceId).catch(() => null),
          presentationService.listDeckPacks(workspaceId).catch(() => null),
        ])
        if (cancelled) return

        const templates = unwrapTemplateList(templatesPayload)
        const layouts = templates
          .filter(isDeckLayoutTemplate)
          .map((template) => ({
            id: template.id || template.templateId,
            templateId: template.id || template.templateId,
            name: template.name || template.label || template.schema?.layout_id || 'Layout',
            rawContentType: template?.contentType || template?.schema?.content_type || template?.variant,
            schema: template.schema || null,
            previewUrl: template.previewUrl || template.thumbnailUrl || null,
          }))
          .filter((template) => template.id)

        setLayoutTemplates(layouts)
        setTemplatePacks(normalizeDeckPacks(packsPayload))
      } catch (err) {
        if (!cancelled) {
          setLayoutTemplates([])
          setTemplatePacks([])
          setLoadError(err.message || 'Failed to load templates')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, workspaceId])

  const layoutSchemaMap = useMemo(
    () => buildLayoutSchemaMapWithFallbacks(layoutTemplates, templatePacks),
    [layoutTemplates, templatePacks]
  )

  const allGalleryLayouts = useMemo(
    () => mergeCatalogLayoutTemplates(layoutTemplates),
    [layoutTemplates]
  )

  const fullLayoutSchemaMap = useMemo(() => {
    const map = { ...layoutSchemaMap }
    for (const row of allGalleryLayouts) {
      const id = String(row?.schema?.layout_id || row?.layoutId || '').trim()
      if (id && row.schema) map[id] = row.schema
    }
    return map
  }, [allGalleryLayouts, layoutSchemaMap])

  const filteredPacks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templatePacks
    return templatePacks.filter((pack) => {
      const haystack = [
        pack.name,
        pack.packId,
        pack.themeId,
        pack.meta?.description,
        pack.meta?.useCase,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [templatePacks, query])

  const filteredLayouts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allGalleryLayouts.filter((layout) => {
      if (layoutCategory !== 'all' && layoutCategoryId(layout) !== layoutCategory) return false
      if (!q) return true
      const haystack = [layout.name, layout.rawContentType, layout.schema?.layout_id, layout.layoutId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [allGalleryLayouts, query, layoutCategory])

  const layoutPairs = useMemo(() => {
    const byId = new Map()
    for (const row of allGalleryLayouts) {
      const id = String(row?.schema?.layout_id || row?.layoutId || '').trim()
      if (id) byId.set(id, row)
    }

    const matchedIds = new Set(
      filteredLayouts
        .map((row) => String(row?.schema?.layout_id || row?.layoutId || '').trim())
        .filter(Boolean)
    )

    const visited = new Set()
    const groups = []
    const q = query.trim()

    const resolveRow = (rowLike) => {
      if (!rowLike) return null
      if (typeof rowLike === 'string') return byId.get(rowLike) || null
      const id = templateLayoutId(rowLike) || String(rowLike.layoutId || '').trim()
      return byId.get(id) || rowLike
    }

    const seeds = [
      ...filteredLayouts.filter((row) => isBrowsePrimaryLayout(row.schema || row)),
      ...filteredLayouts.filter((row) => !isBrowsePrimaryLayout(row.schema || row)),
    ]

    for (const layout of seeds) {
      const seedId = String(layout?.schema?.layout_id || layout?.layoutId || '').trim()
      if (!seedId || visited.has(seedId)) continue

      const peers = pickSimilarLayouts(
        { layoutId: seedId },
        allGalleryLayouts,
        fullLayoutSchemaMap,
        2
      )

      const group = []
      const tryAdd = (rowLike) => {
        const row = resolveRow(rowLike)
        const id = String(
          row?.schema?.layout_id || row?.layoutId || templateLayoutId(row) || ''
        ).trim()
        if (!id || visited.has(id) || !byId.has(id)) return
        if (layoutCategory !== 'all' && layoutCategoryId(row) !== layoutCategory) return
        // Keep family together when search hits one member.
        if (!matchedIds.has(id) && !(q && matchedIds.has(seedId))) return
        visited.add(id)
        group.push(byId.get(id))
      }

      tryAdd(layout)
      for (const peer of peers) tryAdd(peer)
      if (group.length) groups.push(group)
    }

    return groups
  }, [allGalleryLayouts, filteredLayouts, fullLayoutSchemaMap, layoutCategory, query])

  const layoutResultCount = useMemo(
    () => layoutPairs.reduce((sum, group) => sum + group.length, 0),
    [layoutPairs]
  )

  const layoutResultLabel = useMemo(() => {
    const n = layoutResultCount
    if (loading) return null
    const cat =
      layoutCategory === 'all'
        ? null
        : LAYOUT_CATEGORIES.find((c) => c.id === layoutCategory)?.label
    const suffix = cat ? ` in ${cat}` : ''
    return `${n} layout${n === 1 ? '' : 's'}${suffix}`
  }, [layoutResultCount, layoutCategory, loading])

  const remainingSlots = Math.max(0, PPT_CAPS.DECK_MAX_SLIDES - slideCount)

  const openTemplatePack = async (pack) => {
    setSelectedPack(pack)
    if (!workspaceId || !pack?.id) return

    setPackDetailLoading(true)
    setLoadError('')
    try {
      const detail = await presentationService.getDeckPack(workspaceId, pack.id)
      const full = normalizeDeckPackDetail(detail)
      if (full) setSelectedPack(full)
    } catch (err) {
      if (err.status === 404) {
        setLoadError('Presentation deck pack not found')
        setSelectedPack(null)
      } else {
        setLoadError(err.message || 'Failed to load pack')
      }
    } finally {
      setPackDetailLoading(false)
    }
  }

  if (!open) return null

  const pickBlankSlide = () => {
    onPick?.({ source: 'blank', name: 'Blank slide' })
  }

  const pickLayout = (layout) => {
    const layoutId = layout.schema?.layout_id || layout.layoutId || templateLayoutId(layout) || null
    const schema =
      (layoutId && getDeckLayoutSchema(layoutId)) || layout.schema || null
    onPick?.({
      source: 'layout',
      templateId: layout.templateId || layout.id,
      layoutId,
      schema,
      name: layout.name || layout.label || layoutId || 'Layout',
    })
  }

  const pickPackSlide = (pack, schemaSlide, slideIndex) => {
    onPick?.(buildSlidePickPayload(pack, schemaSlide, slideIndex, layoutTemplates, layoutSchemaMap))
  }

  const pickAllPackSlides = (pack) => {
    const items = packSlideItems(pack)
    if (!items.length) return
    const allowed = Math.min(items.length, remainingSlots)
    onPick?.({
      source: 'pack-all',
      packId: pack.id,
      slides: items.slice(0, allowed).map(({ schemaSlide, index }) =>
        buildSlidePickPayload(pack, schemaSlide, index, layoutTemplates, layoutSchemaMap)
      ),
    })
  }

  const renderPackCover = (pack) => {
    const thumb = pack.thumbnailUrl || resolvePackThumbnailUrl(pack)
    if (thumb) {
      return <img src={thumb} alt="" className="ppt-add-slide-card-image" />
    }

    const { color, accentColor } = resolvePackColorFallback(pack)
    return (
      <div
        className="ppt-add-slide-card-fallback ppt-add-slide-card-fallback--pack"
        style={{ background: color }}
      >
        <span style={{ color: accentColor }}>{pack.name}</span>
      </div>
    )
  }

  const selectedSlideItems = selectedPack ? packSlideItems(selectedPack) : []

  const modal = (
    <div className="ppt-add-slide-overlay" role="presentation" onClick={onClose}>
      <div
        className="ppt-add-slide-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add a slide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ppt-add-slide-modal-head">
          <div className="ppt-add-slide-head-copy">
            <h2 className="ppt-add-slide-title">Add a slide</h2>
            <div className="ppt-add-slide-tabs" role="tablist" aria-label="Add slide source">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'templates'}
                className={`ppt-add-slide-tab ${tab === 'templates' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('templates')
                  setSelectedPack(null)
                }}
              >
                Templates
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'layouts'}
                className={`ppt-add-slide-tab ${tab === 'layouts' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('layouts')
                  setSelectedPack(null)
                }}
              >
                Layouts
              </button>
            </div>
          </div>
          <button type="button" className="ppt-add-slide-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        {!selectedPack && (
          <div className="ppt-add-slide-toolbar">
            <div className="ppt-add-slide-search">
              <FiSearch size={16} aria-hidden />
              <input
                type="search"
                placeholder={tab === 'layouts' ? 'Search layouts' : 'Search templates'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {tab === 'layouts' && (
              <div className="ppt-add-slide-categories" role="tablist" aria-label="Layout categories">
                {LAYOUT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={layoutCategory === category.id}
                    className={`ppt-add-slide-category ${layoutCategory === category.id ? 'is-active' : ''}`}
                    onClick={() => setLayoutCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}

            {tab === 'layouts' && layoutResultLabel ? (
              <div className="ppt-add-slide-result-count" aria-live="polite">
                {layoutResultLabel}
              </div>
            ) : null}
          </div>
        )}

        <div className="ppt-add-slide-body">
          {tab === 'templates' && !selectedPack && (
            <>
              {loading && <div className="ppt-add-slide-loading">Loading templates…</div>}
              {loadError && !loading ? <div className="ppt-add-slide-empty">{loadError}</div> : null}
              <div className="ppt-add-slide-grid ppt-add-slide-grid--templates">
                <button
                  type="button"
                  className="ppt-add-slide-card"
                  disabled={disabled}
                  onClick={pickBlankSlide}
                >
                  <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--blank">
                    <FiPlus size={28} />
                  </div>
                  <div className="ppt-add-slide-card-name">Blank slide</div>
                </button>

                {filteredPacks.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className="ppt-add-slide-card"
                    disabled={disabled}
                      onClick={() => openTemplatePack(pack)}
                  >
                    <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--layout">
                      {renderPackCover(pack)}
                    </div>
                    <div className="ppt-add-slide-card-name">{pack.name}</div>
                  </button>
                ))}

                {!loading && !filteredPacks.length && (
                  <div className="ppt-add-slide-empty">No templates match your search</div>
                )}
              </div>
            </>
          )}

          {tab === 'templates' && selectedPack && (
            <div className="ppt-add-slide-pack-detail">
              <div className="ppt-add-slide-pack-detail-head">
                <button
                  type="button"
                  className="ppt-add-slide-back-icon"
                  onClick={() => setSelectedPack(null)}
                  aria-label="Back to templates"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="ppt-add-slide-pack-detail-title">{selectedPack.name}</div>
                <button
                  type="button"
                  className="ppt-add-slide-add-all"
                  disabled={
                    disabled ||
                    !selectedSlideItems.length ||
                    remainingSlots <= 0
                  }
                  onClick={() => pickAllPackSlides(selectedPack)}
                >
                  <FiPlus size={14} />
                  Add all slides
                </button>
              </div>

              {packDetailLoading && (
                <div className="ppt-add-slide-loading">Loading template slides…</div>
              )}

              {!packDetailLoading && !selectedSlideItems.length && (
                <div className="ppt-add-slide-empty">
                  This template has no slides yet.
                </div>
              )}

              <div className="ppt-add-slide-grid ppt-add-slide-grid--pack-slides">
                {selectedSlideItems.map(({ key, preview, schemaSlide, index }) => (
                  <button
                    key={key}
                    type="button"
                    className="ppt-add-slide-card ppt-add-slide-card--slide-only"
                    disabled={disabled || remainingSlots <= 0}
                    title={preview.title || slideLabel(schemaSlide, index)}
                    onClick={() => pickPackSlide(selectedPack, schemaSlide, index)}
                  >
                    <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--layout ppt-add-slide-card-thumb--slide">
                      {preview.thumbnailUrl ? (
                        <img
                          src={preview.thumbnailUrl}
                          alt=""
                          className="ppt-add-slide-card-image"
                        />
                      ) : (
                        <PackSlideGalleryPreview
                          slide={schemaSlide}
                          layoutSchemaMap={layoutSchemaMap}
                          themeId={selectedPack.themeId}
                          aspectRatio={selectedPack.aspectRatio || '16:9'}
                          index={index}
                        />
                      )}
                    </div>
                    <div className="ppt-add-slide-card-name">
                      {preview.title || slideLabel(schemaSlide, index)}
                    </div>
                  </button>
                ))}
              </div>

              {remainingSlots <= 0 && (
                <div className="ppt-add-slide-empty">Deck is full — remove slides to add more.</div>
              )}
            </div>
          )}

          {tab === 'layouts' && (
            <>
              {loading && <div className="ppt-add-slide-loading">Loading layouts…</div>}
              <div className="ppt-add-slide-layout-groups">
                {layoutPairs.map((group) => {
                  const groupKey = group
                    .map((row) => row?.schema?.layout_id || row?.layoutId || row?.id)
                    .join('|')
                  return (
                    <div
                      key={groupKey}
                      className={`ppt-add-slide-layout-pair ppt-add-slide-layout-pair--${Math.min(group.length, 3)}`}
                      role="group"
                    >
                      {group.map((layout) => {
                        const previewSchema = layout.schema
                          ? enrichLayoutSchemaForPreview(layout.schema)
                          : null
                        const cardKey =
                          layout.schema?.layout_id || layout.layoutId || layout.id
                        return (
                          <button
                            key={cardKey}
                            type="button"
                            className="ppt-add-slide-card"
                            disabled={disabled}
                            onClick={() => pickLayout(layout)}
                          >
                            <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--layout">
                              <GalleryPreview
                                schema={previewSchema}
                                previewUrl={layout.previewUrl}
                                fallbackName={layout.name}
                              />
                            </div>
                            <div className="ppt-add-slide-card-name" title={layout.name}>
                              {layout.name}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              {!loading && !layoutPairs.length && (
                <div className="ppt-add-slide-empty">No layouts match your filters</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
