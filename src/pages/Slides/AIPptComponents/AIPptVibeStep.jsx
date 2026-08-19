import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  LayoutTemplate,
  Palette,
  Sparkles,
  X,
  Search,
} from 'lucide-react'
import presentationService from '../../../services/presentationService'
import brandKitService from '../../../services/brandKitService'
import {
  normalizeDeckPackDetail,
  resolvePackThumbnailUrl,
  resolvePackColorFallback,
} from '../../../utils/presentationHelpers'

const FIXED_ASPECT = '16:9'

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

function ColorStripeCard({
  title,
  subtitle,
  colors = [],
  selected,
  onSelect,
  badge,
}) {
  const cleaned = colors.filter(Boolean)
  // Match brand-kit tiles: 4 vertical bands (last slightly wider)
  const fallback = ['#64748b', '#e2e8f0', '#94a3b8', '#0f172a']
  const source = cleaned.length ? cleaned : fallback
  const palette = source.slice(0, 4)
  while (palette.length < 4) {
    palette.push(fallback[palette.length] || '#e2e8f0')
  }

  return (
    <button
      type="button"
      className={`aig-color-stripe-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {badge ? <span className="aig-color-stripe-badge">{badge}</span> : null}
      <div className="aig-color-stripe-preview" aria-hidden>
        {palette.map((hex, index) => (
          <div
            key={`${hex}-${index}`}
            className={`aig-color-stripe-band ${index === palette.length - 1 ? 'is-wide' : ''}`}
            style={{ backgroundColor: hex }}
          />
        ))}
        {selected && (
          <span className="aig-template-drawer-badge">
            <Check size={12} strokeWidth={3} /> Selected
          </span>
        )}
      </div>
      <div className="aig-color-stripe-body">
        <strong className="aig-color-stripe-name">{title || 'Untitled'}</strong>
        <span className="aig-color-stripe-sub">{subtitle}</span>
      </div>
    </button>
  )
}

function brandKitColors(detail) {
  const colors = detail?.data?.colors || []
  const hexes = colors.map((c) => c.hex).filter(Boolean)
  // Prefer first 4 palette entries — same strip count as theme cards
  return hexes.slice(0, 4)
}

function themeColors(theme) {
  // Same strip roles as brand kits: primary, light/bg, mid, dark/text
  return [
    theme.primary,
    theme.background || theme.background_secondary || '#FFFFFF',
    theme.secondary || theme.accent,
    theme.text_primary || theme.title || '#0F172A',
  ].filter(Boolean)
}

function GlassChoiceTile({ selected, configured, onClick, icon: Icon, title, subtitle, meta }) {
  return (
    <button
      type="button"
      className={`aig-glass-tile ${selected ? 'selected' : ''} ${configured ? 'configured' : ''}`}
      onClick={onClick}
    >
      <span className="aig-glass-tile-check" aria-hidden>
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="aig-glass-tile-icon" aria-hidden>
        <Icon size={22} />
      </span>
      <strong>{title}</strong>
      <span>{subtitle}</span>
      {meta ? <em className="aig-glass-tile-meta">{meta}</em> : null}
    </button>
  )
}

function packMatchesAspect(pack, aspectRatio = FIXED_ASPECT) {
  const packRatio = String(pack.aspectRatio || '').trim()
  if (!packRatio) return true
  return packRatio === aspectRatio
}

function selectionSummary(activeChoice) {
  if (activeChoice === 'brand') return 'Brand Kit'
  if (activeChoice === 'palette') return 'Palette'
  if (activeChoice === 'template') return 'Template'
  return 'Choose one option'
}

/**
 * drawer: null | 'brand' | 'palette' | 'template'
 * User can configure any one or combination via the three tiles.
 */
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
  onThemeModeChange,
  onOpenThemeModal: _onOpenThemeModal,
  screenSize,
  onScreenSizeChange,
  stepReady,
}) {
  const [drawer, setDrawer] = useState(null) // 'brand' | 'palette' | 'template'
  // Only one of Brand Kit / Palette / Template can be active
  const [activeChoice, setActiveChoice] = useState(() => {
    if (selectedPackId) return 'template'
    if (selectedBrandKitId) return 'brand'
    return 'palette'
  })

  useEffect(() => {
    onThemeModeChange?.(activeChoice)
  }, [activeChoice, onThemeModeChange])
  const [searchQuery, setSearchQuery] = useState('')
  const [brandKitDetails, setBrandKitDetails] = useState({})
  const [packDetail, setPackDetail] = useState(null)

  // AI PPT generation is always 16:9
  useEffect(() => {
    if (screenSize !== FIXED_ASPECT) {
      onScreenSizeChange?.(FIXED_ASPECT)
    }
  }, [screenSize, onScreenSizeChange])

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
      if (!cancelled) setBrandKitDetails(Object.fromEntries(entries))
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
      try {
        const payload = await presentationService.getDeckPack(workspaceId, packId)
        setPackDetail(normalizeDeckPackDetail(payload))
      } catch {
        setPackDetail(null)
      }
    },
    [workspaceId]
  )

  useEffect(() => {
    if (selectedPackId) loadPackDetail(selectedPackId)
    else setPackDetail(null)
  }, [selectedPackId, loadPackDetail])

  useEffect(() => {
    if (!drawer) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawer(null)
    }
    window.addEventListener('keydown', onKey)

    // Prevent the wizard page behind the drawer from stealing wheel scroll
    const container = document.querySelector('.aig-container')
    const prevContainerOverflow = container?.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    if (container) container.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      if (container) container.style.overflow = prevContainerOverflow || ''
      document.body.style.overflow = prevBodyOverflow
    }
  }, [drawer])

  const openDrawer = (type) => {
    setSearchQuery('')
    setDrawer(type)
  }

  const closeDrawer = useCallback((event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    setDrawer(null)
  }, [])

  const selectBrandKit = (id) => {
    onSelectBrandKit(String(id))
    onSelectPack('')
    setActiveChoice('brand')
    setDrawer(null)
  }

  const selectPalette = (id) => {
    onSelectTheme(id)
    onSelectBrandKit('')
    onSelectPack('')
    setActiveChoice('palette')
    setDrawer(null)
  }

  const selectTemplate = (id) => {
    onSelectPack(String(id))
    onSelectBrandKit('')
    setActiveChoice('template')
    setDrawer(null)
  }

  const filteredBrandKits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return brandKits
    return brandKits.filter((kit) => (kit.name || '').toLowerCase().includes(q))
  }, [brandKits, searchQuery])

  const filteredThemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return themes
    return themes.filter((t) =>
      `${t.name} ${t.vibe || ''}`.toLowerCase().includes(q)
    )
  }, [themes, searchQuery])

  const filteredPacks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return (deckPacks || []).filter((pack) => {
      if (!packMatchesAspect(pack, FIXED_ASPECT)) return false
      if (!q) return true
      return (
        (pack.name || '').toLowerCase().includes(q) ||
        (pack.category || '').toLowerCase().includes(q)
      )
    })
  }, [deckPacks, searchQuery])

  const selectedBrandKit = brandKits.find(
    (k) => String(k.id) === String(selectedBrandKitId)
  )
  const selectedTheme = themes.find((t) => t.id === theme)
  const selectedPack =
    packDetail ||
    deckPacks.find((p) => String(p.id) === String(selectedPackId)) ||
    null

  const brandConfigured = activeChoice === 'brand' && Boolean(selectedBrandKitId)
  const paletteConfigured = activeChoice === 'palette' && Boolean(theme)
  const templateConfigured = activeChoice === 'template' && Boolean(selectedPackId)

  const modeLabel = selectionSummary(activeChoice)

  const drawerTitle =
    drawer === 'brand'
      ? 'Brand kits'
      : drawer === 'palette'
        ? 'Theme palette'
        : drawer === 'template'
          ? 'Templates'
          : ''

  const drawerSubtitle =
    drawer === 'brand'
      ? 'Tap a kit to apply it'
      : drawer === 'palette'
        ? 'Tap a palette to apply it'
        : drawer === 'template'
          ? `Tap a ${FIXED_ASPECT} template to apply it`
          : ''

  return (
    <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
      <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
        <h2 className="aig-step-title">The Vibe</h2>
        <p className="aig-step-subtitle">
          Choose only one — Brand Kit, Palette, or Template.
        </p>
        <div className="aig-vibe-mode-pill">{modeLabel}</div>
      </div>

      <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
        <section className="aig-vibe-block">
          <div className="aig-vibe-block-head">
            <h3>Theme</h3>
            <p>Select one option. Choosing another will replace your current selection.</p>
          </div>

          <div className="aig-glass-tile-grid aig-glass-tile-grid--3">
            <GlassChoiceTile
              selected={drawer === 'brand' || brandConfigured}
              configured={brandConfigured}
              onClick={() => openDrawer('brand')}
              icon={Sparkles}
              title="Use Brand Kit"
              subtitle="Logo and brand colors"
              meta={brandConfigured ? selectedBrandKit?.name : null}
            />
            <GlassChoiceTile
              selected={drawer === 'palette' || paletteConfigured}
              configured={paletteConfigured}
              onClick={() => openDrawer('palette')}
              icon={Palette}
              title="Palette"
              subtitle="Discover color themes"
              meta={paletteConfigured ? selectedTheme?.name : null}
            />
            <GlassChoiceTile
              selected={drawer === 'template' || templateConfigured}
              configured={templateConfigured}
              onClick={() => openDrawer('template')}
              icon={LayoutTemplate}
              title="Template"
              subtitle="Start from a deck pack"
              meta={templateConfigured ? selectedPack?.name : null}
            />
          </div>

          {(brandConfigured || paletteConfigured || templateConfigured) && (
            <div className="aig-vibe-summary-row fade-in">
              {brandConfigured && (
                <button
                  type="button"
                  className="aig-vibe-summary-chip"
                  onClick={() => openDrawer('brand')}
                >
                  Brand: {selectedBrandKit?.name || 'Selected'}
                </button>
              )}
              {paletteConfigured && (
                <button
                  type="button"
                  className="aig-vibe-summary-chip"
                  onClick={() => openDrawer('palette')}
                >
                  Palette: {selectedTheme?.name || theme}
                </button>
              )}
              {templateConfigured && (
                <button
                  type="button"
                  className="aig-vibe-summary-chip"
                  onClick={() => openDrawer('template')}
                >
                  Template: {selectedPack?.name || 'Selected'}
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {drawer &&
        createPortal(
          <>
            <div
              className="aig-template-drawer-backdrop"
              onClick={closeDrawer}
              aria-hidden
            />
            <aside
              className="aig-template-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={drawerTitle}
            >
              <div className="aig-template-drawer-header">
                <div>
                  <h2>{drawerTitle}</h2>
                  <p>{drawerSubtitle}</p>
                </div>
                <button
                  type="button"
                  className="aig-template-drawer-close"
                  onClick={closeDrawer}
                  aria-label="Close sidebar"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>

              <div className="aig-template-drawer-tools">
                <label className="aig-template-drawer-search">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder={
                      drawer === 'brand'
                        ? 'Search brand kits...'
                        : drawer === 'palette'
                          ? 'Search themes...'
                          : 'Search templates...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              <div
                className={`aig-template-drawer-body${
                  drawer === 'brand' || drawer === 'palette'
                    ? ' aig-template-drawer-body--palettes'
                    : ''
                }`}
              >
                {drawer === 'brand' && (
                  <>
                    {!filteredBrandKits.length && (
                      <div className="aig-template-drawer-empty">
                        No brand kits in this workspace yet.
                      </div>
                    )}
                    {filteredBrandKits.map((kit) => (
                      <ColorStripeCard
                        key={kit.id}
                        title={kit.name}
                        subtitle={kit.isDefault ? 'Default brand kit' : 'Brand kit'}
                        colors={brandKitColors(brandKitDetails[String(kit.id)])}
                        selected={
                          activeChoice === 'brand' &&
                          String(selectedBrandKitId) === String(kit.id)
                        }
                        onSelect={() => selectBrandKit(kit.id)}
                        badge={kit.isDefault ? 'Default' : null}
                      />
                    ))}
                  </>
                )}

                {drawer === 'palette' && (
                  <>
                    {!filteredThemes.length && (
                      <div className="aig-template-drawer-empty">No themes match your search.</div>
                    )}
                    {filteredThemes.map((t) => (
                      <ColorStripeCard
                        key={t.id}
                        title={t.name}
                        subtitle="Theme palette"
                        colors={themeColors(t)}
                        selected={activeChoice === 'palette' && theme === t.id}
                        onSelect={() => selectPalette(t.id)}
                      />
                    ))}
                  </>
                )}

                {drawer === 'template' && (
                  <>
                    {!filteredPacks.length && (
                      <div className="aig-template-drawer-empty">
                        No templates available for 16:9 yet.
                      </div>
                    )}
                    {filteredPacks.map((pack) => {
                      const isSelected =
                        activeChoice === 'template' &&
                        String(selectedPackId) === String(pack.id)
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          className={`aig-template-drawer-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => selectTemplate(pack.id)}
                        >
                          <div className="aig-template-drawer-card-preview">
                            <PackCardThumbnail pack={pack} />
                            {isSelected && (
                              <span className="aig-template-drawer-badge">Selected</span>
                            )}
                          </div>
                          <div className="aig-template-drawer-card-body">
                            <strong>{pack.name}</strong>
                            <span>
                              {[
                                pack.slideCount ? `${pack.slideCount} slides` : 'Deck pack',
                                FIXED_ASPECT,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  )
}
