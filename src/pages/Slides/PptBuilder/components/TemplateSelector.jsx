import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import LayoutPolishedPreview from '../../../../components/ppt/LayoutPolishedPreview'
import PackSlidePreview from '../../../../components/ppt/PackSlidePreview'
import '../PptBuilder.css'
import '../../AIPptGenerator.css'
import presentationService from '../../../../services/presentationService'
import brandKitService from '../../../../services/brandKitService'
import { dedupeBrandKitList } from '../../../../utils/brandKitHelpers'
import { resolvePresentationWorkspaceContext } from '../../../../utils/presentationContext'
import {
  normalizeDeckPacks,
  normalizeDeckPackDetail,
  resolvePackThumbnailUrl,
  resolvePackColorFallback,
} from '../../../../utils/presentationHelpers'
import { getLayoutPreviewSlots } from '../../../../utils/layoutPreviewSchemas'
import { slideHasCanvasElements } from '../../../../utils/videoTemplateToCanvasElements'

import temp1 from '../../../../assets/Template_Image/theme_petrol.png'
import temp2 from '../../../../assets/Template_Image/theme_stardust.png'
import temp3 from '../../../../assets/Template_Image/theme_chocolate.png'
import temp4 from '../../../../assets/Template_Image/theme_moss.png'
import temp5 from '../../../../assets/Template_Image/theme_blue_steel.png'

const FALLBACK_TEMPLATES = [
  { id: 'blank', name: 'Blank Presentation', type: 'Basic', img: null, createMode: 'blank' },
  {
    id: 'petrol',
    name: 'Petrol Corporate',
    type: 'Professional',
    img: temp1,
    hex1: '#0f172a',
    hex2: '#3b82f6',
    hex3: '#94a3b8',
    createMode: 'blank',
    themeId: 'petrol',
  },
  {
    id: 'stardust',
    name: 'Stardust Minimal',
    type: 'Creative',
    img: temp2,
    hex1: '#1e293b',
    hex2: '#8b5cf6',
    hex3: '#f1f5f9',
    createMode: 'blank',
    themeId: 'stardust',
  },
  {
    id: 'chocolate',
    name: 'Chocolate Warmth',
    type: 'Elegant',
    img: temp3,
    hex1: '#3e2723',
    hex2: '#d7ccc8',
    hex3: '#a1887f',
    createMode: 'blank',
    themeId: 'chocolate',
  },
  {
    id: 'moss',
    name: 'Moss & Mist',
    type: 'Nature',
    img: temp4,
    hex1: '#1b5e20',
    hex2: '#a5d6a7',
    hex3: '#c8e6c9',
    createMode: 'blank',
    themeId: 'moss',
  },
  {
    id: 'blue_steel',
    name: 'Blue Steel Tech',
    type: 'Modern',
    img: temp5,
    hex1: '#263238',
    hex2: '#90a4ae',
    hex3: '#eceff1',
    createMode: 'blank',
    themeId: 'blue_steel',
  },
]

function PackCardThumbnail({ pack }) {
  const thumb = pack.thumbnailUrl || resolvePackThumbnailUrl(pack)
  const { color, accentColor } = resolvePackColorFallback(pack)

  if (thumb) {
    return <img src={thumb} alt="" className="aig-theme-card-image" />
  }

  return (
    <div
      className="aig-theme-card-image"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        boxSizing: 'border-box',
        background: color,
      }}
    >
      <div style={{ height: 6, borderRadius: 999, background: accentColor, width: '42%' }} />
      <div style={{ height: 4, borderRadius: 999, background: accentColor, opacity: 0.55, width: '68%' }} />
      <div style={{ height: 4, borderRadius: 999, background: accentColor, opacity: 0.35, width: '52%' }} />
    </div>
  )
}

function resolveSchemaSlideForPreview(pack, slidePreview) {
  const order = slidePreview?.order ?? 1
  const slides = pack?.schema?.slides || []
  return slides.find((s) => (s.order ?? slides.indexOf(s) + 1) === order) || null
}

function SlidePreviewThumbnail({ slidePreview, schemaSlide, pack, aspectRatio = '16:9', themeId }) {
  const slide = schemaSlide || resolveSchemaSlideForPreview(pack, slidePreview) || slidePreview
  const title = slidePreview?.title || slide?.placeholder?.title || `Slide ${slidePreview?.order ?? ''}`
  const ratio = aspectRatio === '4:3' ? '4 / 3' : '16 / 9'

  if (slideHasCanvasElements(slide) || slide?.layout_id) {
    return (
      <PackSlidePreview
        slide={slide}
        themeId={themeId || pack?.themeId}
        aspectRatio={aspectRatio}
        fill
        showBadge={false}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  const thumb = slidePreview?.thumbnailUrl
  if (thumb) {
    return <img src={thumb} alt="" className="aig-theme-card-image" />
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 12,
        boxSizing: 'border-box',
        background: '#f8fafc',
        aspectRatio: ratio,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', textAlign: 'center' }}>{title}</span>
      {slidePreview?.contentType ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'capitalize',
          }}
        >
          {slidePreview.contentType.replace(/_/g, ' ')}
        </span>
      ) : null}
    </div>
  )
}

export default function TemplateSelector({
  onSelect,
  onBack,
  disabled = false,
  initialWorkspaceId,
  initialFolderId,
}) {
  const [stepReady, setStepReady] = useState(false)
  const [tab, setTab] = useState('layouts')
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES)
  const [packs, setPacks] = useState([])
  const [brandKits, setBrandKits] = useState([])
  const [selectedBrandKitId, setSelectedBrandKitId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [workspaceId, setWorkspaceId] = useState(null)

  const [selectedPack, setSelectedPack] = useState(null)
  const [packDetail, setPackDetail] = useState(null)
  const [packDetailLoading, setPackDetailLoading] = useState(false)
  const [packDetailError, setPackDetailError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setStepReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ctx = await resolvePresentationWorkspaceContext({
          preferredWorkspaceId: initialWorkspaceId,
          preferredFolderId: initialFolderId,
        })

        if (!cancelled) setWorkspaceId(ctx.workspaceId)

        const [templatesPayload, packsPayload, kits] = await Promise.all([
          presentationService.listTemplates(ctx.workspaceId).catch(() => null),
          presentationService.listDeckPacks(ctx.workspaceId).catch(() => null),
          brandKitService.list(ctx.workspaceId).catch(() => []),
        ])

        if (cancelled) return

        const list =
          templatesPayload?.templates ||
          templatesPayload?.items ||
          (Array.isArray(templatesPayload) ? templatesPayload : [])

        if (list.length) {
          setTemplates([
            { id: 'blank', name: 'Blank Presentation', type: 'Basic', img: null, createMode: 'blank' },
            ...list.map((t) => ({
              id: t.id || t.templateId,
              name: t.name || t.label || 'Layout',
              type: t.contentType || t.variant || 'Layout',
              img: t.previewUrl || t.thumbnailUrl || null,
              schema: t.schema || null,
              hex1: t.swatches?.[0],
              hex2: t.swatches?.[1],
              hex3: t.swatches?.[2],
              createMode: 'template',
              templateId: t.id || t.templateId,
              fromCatalog: true,
            })),
          ])
        }

        setPacks(normalizeDeckPacks(packsPayload))
        const uniqueKits = dedupeBrandKitList(kits || [], { byName: true })
        setBrandKits(uniqueKits)
        const defaultKit = uniqueKits.find((k) => k.isDefault) || uniqueKits[0]
        if (defaultKit?.id) setSelectedBrandKitId(String(defaultKit.id))
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Using local template previews')
          setTemplates(FALLBACK_TEMPLATES)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialWorkspaceId, initialFolderId])

  const handleSelect = (item) => {
    onSelect({
      ...item,
      brandKitId: selectedBrandKitId || null,
    })
  }

  const openPackDetail = useCallback(
    async (pack) => {
      setSelectedPack(pack)
      setPackDetail(null)
      setPackDetailError('')
      if (!workspaceId || !pack?.id) return

      setPackDetailLoading(true)
      try {
        const payload = await presentationService.getDeckPack(workspaceId, pack.id)
        const detail = normalizeDeckPackDetail(payload)
        if (!detail) throw new Error('Pack detail unavailable')
        setPackDetail(detail)
      } catch (err) {
        if (err.status === 404) {
          setPackDetailError('Presentation deck pack not found')
        } else if (err.status === 401) {
          setPackDetailError('Session expired — refresh and try again')
        } else {
          setPackDetailError(err.message || 'Failed to load pack')
        }
      } finally {
        setPackDetailLoading(false)
      }
    },
    [workspaceId]
  )

  const closePackDetail = () => {
    setSelectedPack(null)
    setPackDetail(null)
    setPackDetailError('')
  }

  const confirmPackCreate = () => {
    const pack = packDetail || selectedPack
    if (!pack?.id) return
    handleSelect({
      id: pack.id,
      name: pack.name,
      type: 'Pack',
      img: pack.thumbnailUrl || resolvePackThumbnailUrl(pack),
      createMode: 'pack',
      packId: pack.id,
      themeId: pack.themeId,
      aspectRatio: pack.aspectRatio || '16:9',
    })
  }

  const items = tab === 'packs' ? packs : templates
  const activePack = packDetail || selectedPack
  const slidePreviews = activePack?.slidePreviews || []

  return (
    <main className="aig-main-fullscreen">
      <div className="aig-top-nav">
        <button className="aig-btn-secondary" onClick={onBack} type="button">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
        <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
          <h2 className="aig-step-title">
            {tab === 'packs' && selectedPack ? activePack?.name || 'Deck Pack' : 'Select a Template'}
          </h2>
          <p className="aig-step-subtitle">
            {tab === 'packs' && selectedPack
              ? 'Review slides, then create your deck from this pack.'
              : 'Start blank, from a single layout, or from a multi-slide deck pack.'}
          </p>
          {(loadError || packDetailError) && (
            <p className="aig-credit-estimate-hint">{packDetailError || loadError}</p>
          )}
        </div>

        <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
          <div className="aig-selection-section">
            {!(tab === 'packs' && selectedPack) && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div className="aig-pill-grid" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`aig-pill-small ${tab === 'layouts' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('layouts')
                      closePackDetail()
                    }}
                  >
                    Layouts
                  </button>
                  <button
                    type="button"
                    className={`aig-pill-small ${tab === 'packs' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('packs')
                      closePackDetail()
                    }}
                  >
                    Deck Packs
                  </button>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#475569',
                    marginLeft: 'auto',
                  }}
                >
                  Brand Kit
                  <select
                    value={selectedBrandKitId}
                    onChange={(e) => setSelectedBrandKitId(e.target.value)}
                    disabled={disabled}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      minWidth: 180,
                    }}
                  >
                    <option value="">None</option>
                    {brandKits.map((kit) => (
                      <option key={kit.id} value={kit.id}>
                        {kit.name}
                        {kit.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {tab === 'packs' && selectedPack ? (
              <div className="aig-pack-detail">
                <div className="aig-pack-detail-head">
                  <button
                    type="button"
                    className="aig-btn-secondary"
                    onClick={closePackDetail}
                    disabled={disabled}
                  >
                    <ChevronLeft size={16} /> All packs
                  </button>
                  <div className="aig-pack-detail-meta">
                    {activePack?.slideCount ? (
                      <span className="aig-pack-badge">{activePack.slideCount} slides</span>
                    ) : null}
                    {activePack?.aspectRatio ? (
                      <span className="aig-pack-badge">{activePack.aspectRatio}</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="aig-btn-primary"
                    disabled={disabled || packDetailLoading || !activePack?.id}
                    onClick={confirmPackCreate}
                  >
                    Create deck
                  </button>
                </div>

                {packDetailLoading && (
                  <p className="aig-credit-estimate-hint">Loading pack slides…</p>
                )}

                {!packDetailLoading && !slidePreviews.length && !packDetailError && (
                  <p className="aig-credit-estimate-hint">
                    No slide previews yet — you can still create from this pack.
                  </p>
                )}

                <div className="aig-new-theme-grid-5">
                  {slidePreviews.map((slidePreview) => (
                    <div key={`${activePack.id}-${slidePreview.order}`} className="aig-new-theme-card-premium aig-pack-slide-card">
                      <div className="aig-theme-card-header">
                        <span className="aig-theme-card-title">
                          {slidePreview.title || `Slide ${slidePreview.order}`}
                        </span>
                        {slidePreview.contentType ? (
                          <span className="aig-pack-slide-type">{slidePreview.contentType}</span>
                        ) : null}
                      </div>
                      <div className="aig-theme-card-image-wrapper">
                        <SlidePreviewThumbnail
                          slidePreview={slidePreview}
                          schemaSlide={resolveSchemaSlideForPreview(activePack, slidePreview)}
                          pack={activePack}
                          aspectRatio={activePack.aspectRatio || '16:9'}
                          themeId={activePack.themeId}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {tab === 'packs' && !packs.length && (
                  <p className="aig-credit-estimate-hint">No deck packs available yet.</p>
                )}

                <div className="aig-new-theme-grid-5">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="aig-new-theme-card-premium"
                      disabled={disabled}
                      onClick={() =>
                        tab === 'packs'
                          ? openPackDetail(t)
                          : handleSelect(t)
                      }
                    >
                      <div className="aig-theme-card-header">
                        <span className="aig-theme-card-title">{t.name}</span>
                      </div>

                      {tab === 'packs' && (
                        <div className="aig-theme-card-palette">
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                            {t.slideCount ? `${t.slideCount} slides` : 'Deck pack'}
                            {t.aspectRatio ? ` · ${t.aspectRatio}` : ''}
                          </span>
                        </div>
                      )}

                      {tab === 'packs' && t.meta?.description ? (
                        <p className="aig-pack-card-sub">{t.meta.description}</p>
                      ) : null}

                      {tab !== 'packs' && t.id !== 'blank' && (t.hex1 || t.hex2 || t.hex3) && (
                        <div className="aig-theme-card-palette">
                          {t.hex1 && <div className="palette-color" style={{ background: t.hex1 }}></div>}
                          {t.hex2 && <div className="palette-color" style={{ background: t.hex2 }}></div>}
                          {t.hex3 && <div className="palette-color" style={{ background: t.hex3 }}></div>}
                        </div>
                      )}

                      <div className="aig-theme-card-image-wrapper">
                        {tab === 'packs' ? (
                          <PackCardThumbnail pack={t} />
                        ) : t.img ? (
                          <img src={t.img} alt={t.name} className="aig-theme-card-image" />
                        ) : tab !== 'packs' && getLayoutPreviewSlots({ schema: t.schema }).length > 0 ? (
                          <LayoutPolishedPreview schema={t.schema} fill style={{ borderRadius: 8 }} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f8fafc',
                              color: '#94a3b8',
                              fontSize: 24,
                              fontWeight: 600,
                              padding: 12,
                              textAlign: 'center',
                            }}
                          >
                            +
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
