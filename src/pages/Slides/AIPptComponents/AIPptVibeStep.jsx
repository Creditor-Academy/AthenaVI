import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Palette, ChevronLeft, LayoutTemplate } from 'lucide-react'
import presentationService from '../../../services/presentationService'
import brandKitService from '../../../services/brandKitService'
import PackSlidePreview from '../../../components/ppt/PackSlidePreview'
import {
  normalizeDeckPackDetail,
  resolvePackThumbnailUrl,
  resolvePackColorFallback,
} from '../../../utils/presentationHelpers'
import { slideHasCanvasElements } from '../../../utils/videoTemplateToCanvasElements'

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
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        color: '#64748b',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      Slide {slidePreview?.order ?? ''}
    </div>
  )
}

function BrandKitCard({ kit, detail, selected, onSelect }) {
  const colors = detail?.data?.colors || []
  const logo = (detail?.media || []).find((m) => m.kind === 'logo' && m.url)

  return (
    <button
      type="button"
      className={`aig-vibe-card aig-brandkit-card ${selected ? 'active' : ''}`}
      onClick={() => onSelect(kit.id)}
    >
      <div className="aig-vibe-card-top">
        <span className="aig-vibe-card-title">{kit.name}</span>
        {selected && (
          <span className="aig-vibe-card-check">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="aig-brandkit-card-body">
        {logo ? (
          <img src={logo.url} alt="" className="aig-brandkit-card-logo" />
        ) : (
          <div className="aig-brandkit-card-logo-placeholder">Logo</div>
        )}
        <div className="aig-brandkit-card-swatches">
          {colors.slice(0, 5).map((c) => (
            <span
              key={c.id || c.hex}
              className="aig-brandkit-swatch"
              style={{ background: c.hex }}
              title={c.name || c.hex}
            />
          ))}
        </div>
      </div>
      {kit.isDefault && <span className="aig-vibe-card-badge">Default</span>}
    </button>
  )
}

function selectionModeLabel({ brandKitId, packId }) {
  if (brandKitId && packId) return 'Brand Kit + Template'
  if (brandKitId) return 'Brand Kit + Color Theme'
  return 'Color Theme'
}

export default function AIPptVibeStep({
  workspaceId,
  brandKits = [],
  selectedBrandKitId,
  onSelectBrandKit,
  deckPacks = [],
  selectedPackId,
  onSelectPack,
  themes = [],
  theme,
  onSelectTheme,
  onOpenThemeModal,
  screenSizes = [],
  screenSize,
  onScreenSizeChange,
  stepReady,
}) {
  const [brandKitDetails, setBrandKitDetails] = useState({})
  const [packDetail, setPackDetail] = useState(null)
  const [packDetailLoading, setPackDetailLoading] = useState(false)
  const [packDetailError, setPackDetailError] = useState('')
  const [previewPackId, setPreviewPackId] = useState(null)

  const showColorThemes = !(selectedBrandKitId && selectedPackId)

  const modeLabel = useMemo(
    () =>
      selectionModeLabel({
        brandKitId: selectedBrandKitId,
        packId: selectedPackId,
      }),
    [selectedBrandKitId, selectedPackId]
  )

  useEffect(() => {
    let cancelled = false
    if (!workspaceId || !brandKits.length) {
      setBrandKitDetails({})
      return undefined
    }
    ;(async () => {
      const entries = await Promise.all(
        brandKits.map(async (kit) => {
          try {
            const detail = await brandKitService.get(workspaceId, kit.id)
            return [String(kit.id), detail]
          } catch {
            return [String(kit.id), null]
          }
        })
      )
      if (!cancelled) {
        setBrandKitDetails(Object.fromEntries(entries))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [workspaceId, brandKits])

  const loadPackDetail = useCallback(
    async (packId) => {
      if (!workspaceId || !packId) {
        setPackDetail(null)
        return
      }
      setPackDetailLoading(true)
      setPackDetailError('')
      try {
        const payload = await presentationService.getDeckPack(workspaceId, packId)
        const detail = normalizeDeckPackDetail(payload)
        if (!detail) throw new Error('Pack detail unavailable')
        setPackDetail(detail)
      } catch (err) {
        setPackDetailError(err.message || 'Failed to load pack preview')
        setPackDetail(null)
      } finally {
        setPackDetailLoading(false)
      }
    },
    [workspaceId]
  )

  useEffect(() => {
    if (!selectedPackId) {
      setPreviewPackId(null)
      setPackDetail(null)
      return
    }
    setPreviewPackId(String(selectedPackId))
    loadPackDetail(selectedPackId)
  }, [selectedPackId, loadPackDetail])

  const handleSelectPack = (packId) => {
    const next = packId ? String(packId) : ''
    onSelectPack(next)
    if (next) {
      setPreviewPackId(next)
      loadPackDetail(next)
    } else {
      setPreviewPackId(null)
      setPackDetail(null)
    }
  }

  const activePack =
    packDetail ||
    deckPacks.find((p) => String(p.id) === String(previewPackId || selectedPackId)) ||
    null
  const slidePreviews = activePack?.slidePreviews || []

  return (
    <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
      <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
        <h2 className="aig-step-title">The Vibe</h2>
        <p className="aig-step-subtitle">
          Choose a brand kit, template, and colors — mix Brand Kit + Template, Brand Kit + Theme, or Theme only.
        </p>
        <div className="aig-vibe-mode-pill">{modeLabel}</div>
      </div>

      <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
        <div className="aig-selection-section">
          <h3 className="aig-selection-label">Brand Kit</h3>
          <p className="aig-vibe-section-hint">Optional — applies your logo and colors to the deck.</p>
          <div className="aig-vibe-card-grid">
            <button
              type="button"
              className={`aig-vibe-card aig-vibe-card-none ${!selectedBrandKitId ? 'active' : ''}`}
              onClick={() => onSelectBrandKit('')}
            >
              <span className="aig-vibe-card-title">None</span>
              <span className="aig-vibe-card-sub">Use color theme only</span>
            </button>
            {brandKits.map((kit) => (
              <BrandKitCard
                key={kit.id}
                kit={kit}
                detail={brandKitDetails[String(kit.id)]}
                selected={String(selectedBrandKitId) === String(kit.id)}
                onSelect={(id) => onSelectBrandKit(String(id))}
              />
            ))}
          </div>
          {!brandKits.length && (
            <p className="aig-credit-estimate-hint">No brand kits in this workspace yet.</p>
          )}
        </div>

        <div className="aig-selection-section">
          <h3 className="aig-selection-label">
            <LayoutTemplate size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Templates
          </h3>
          <p className="aig-vibe-section-hint">Deck packs define slide layout and order. Preview slides before selecting.</p>
          <div className="aig-vibe-card-grid aig-vibe-template-grid">
            <button
              type="button"
              className={`aig-vibe-card aig-vibe-card-none aig-template-card ${!selectedPackId ? 'active' : ''}`}
              onClick={() => handleSelectPack('')}
            >
              <div className="aig-template-none-icon">+</div>
              <span className="aig-vibe-card-title">No template</span>
              <span className="aig-vibe-card-sub">AI picks layouts from your prompt</span>
            </button>
            {deckPacks.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className={`aig-new-theme-card-premium aig-template-pack-card ${String(selectedPackId) === String(pack.id) ? 'active' : ''}`}
                onClick={() => handleSelectPack(pack.id)}
              >
                <div className="aig-theme-card-header">
                  <span className="aig-theme-card-title">{pack.name}</span>
                  {String(selectedPackId) === String(pack.id) && (
                    <div className="aig-theme-card-check">
                      <Check size={14} strokeWidth={3} color="#2563eb" />
                    </div>
                  )}
                </div>
                <div className="aig-theme-card-palette">
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    {pack.slideCount ? `${pack.slideCount} slides` : 'Deck pack'}
                    {pack.aspectRatio ? ` · ${pack.aspectRatio}` : ''}
                  </span>
                </div>
                <div className="aig-theme-card-image-wrapper">
                  <PackCardThumbnail pack={pack} />
                </div>
              </button>
            ))}
          </div>
          {!deckPacks.length && (
            <p className="aig-credit-estimate-hint">No deck packs available yet.</p>
          )}

          {previewPackId && (
            <div className="aig-pack-detail aig-vibe-pack-preview">
              <div className="aig-pack-detail-head">
                <button
                  type="button"
                  className="aig-btn-secondary"
                  onClick={() => handleSelectPack('')}
                >
                  <ChevronLeft size={16} /> Clear template
                </button>
                <div className="aig-pack-detail-meta">
                  <strong>{activePack?.name || 'Template preview'}</strong>
                  {activePack?.slideCount ? (
                    <span className="aig-pack-badge">{activePack.slideCount} slides</span>
                  ) : null}
                  {activePack?.aspectRatio ? (
                    <span className="aig-pack-badge">{activePack.aspectRatio}</span>
                  ) : null}
                </div>
              </div>
              {packDetailLoading && (
                <p className="aig-credit-estimate-hint">Loading slide previews…</p>
              )}
              {packDetailError && <p className="aig-credit-estimate-hint">{packDetailError}</p>}
              {!packDetailLoading && !slidePreviews.length && !packDetailError && (
                <p className="aig-credit-estimate-hint">Slide previews will appear after pack loads.</p>
              )}
              <div className="aig-new-theme-grid-5">
                {slidePreviews.map((slidePreview) => (
                  <div
                    key={`${activePack?.id}-${slidePreview.order}`}
                    className="aig-new-theme-card-premium aig-pack-slide-card"
                  >
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
                        aspectRatio={activePack?.aspectRatio || '16:9'}
                        themeId={activePack?.themeId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showColorThemes ? (
          <div className="aig-selection-section">
            <div className="aig-section-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 className="aig-selection-label" style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                  Color Themes
                </h3>
                <p className="aig-vibe-section-hint" style={{ marginTop: 4, marginBottom: 0 }}>
                  {selectedBrandKitId
                    ? 'Combine with your brand kit or pick a catalog theme for accents.'
                    : 'Pick a color theme for your presentation.'}
                </p>
              </div>
              <button type="button" className="aig-view-more-btn" onClick={onOpenThemeModal}>
                <Palette size={14} /> View more
              </button>
            </div>
            <div className="aig-new-theme-grid-5">
              {themes.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`aig-new-theme-card-premium ${theme === t.id ? 'active' : ''}`}
                  onClick={() => onSelectTheme(t.id)}
                >
                  <div className="aig-theme-card-header">
                    <span className="aig-theme-card-title">{t.name}</span>
                    {theme === t.id && (
                      <div className="aig-theme-card-check">
                        <Check size={14} strokeWidth={3} color="#2563eb" />
                      </div>
                    )}
                  </div>
                  <div className="aig-theme-card-palette">
                    <div className="palette-color" style={{ background: t.primary }} />
                    <div className="palette-color" style={{ background: t.secondary }} />
                    <div className="palette-color" style={{ background: t.accent }} />
                    <div className="palette-color" style={{ background: t.background }} />
                  </div>
                  <div
                    className="aig-theme-card-image-wrapper aig-theme-card-mock"
                    style={{ background: t.background, borderColor: t.border }}
                  >
                    <div className="aig-theme-mock-bar" style={{ background: t.primary }} />
                    <div className="aig-theme-mock-title" style={{ background: t.text_primary }} />
                    <div className="aig-theme-mock-line" style={{ background: t.text_secondary }} />
                    <div className="aig-theme-mock-line short" style={{ background: t.text_secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="aig-vibe-theme-hidden-note">
            Color themes are hidden because you selected <strong>Brand Kit + Template</strong>. Colors and logo come from your brand kit.
          </div>
        )}

        <div className="aig-selection-section">
          <h3 className="aig-selection-label">Screen Size</h3>
          <div className="aig-selection-grid">
            {screenSizes.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`aig-aspect-card ${screenSize === s.id ? 'active' : ''}`}
                onClick={() => onScreenSizeChange(s.id)}
              >
                <div className="aig-aspect-preview">
                  <div className="aig-aspect-box" style={{ aspectRatio: s.ratio }} />
                </div>
                <div className="aig-aspect-info">
                  <strong>{s.name}</strong>
                  <span>{s.id}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
