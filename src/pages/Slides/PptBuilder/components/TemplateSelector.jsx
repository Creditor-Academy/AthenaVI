import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import '../PptBuilder.css'
import '../../AIPptGenerator.css'
import presentationService from '../../../../services/presentationService'
import brandKitService from '../../../../services/brandKitService'
import { resolvePresentationWorkspaceContext } from '../../../../utils/presentationContext'
import { normalizeDeckPacks } from '../../../../utils/presentationHelpers'

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
        setBrandKits(kits || [])
        const defaultKit = (kits || []).find((k) => k.isDefault) || (kits || [])[0]
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

  const items = tab === 'packs' ? packs : templates

  return (
    <main className="aig-main-fullscreen">
      <div className="aig-top-nav">
        <button className="aig-btn-secondary" onClick={onBack} type="button">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
        <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
          <h2 className="aig-step-title">Select a Template</h2>
          <p className="aig-step-subtitle">
            Start blank, from a single layout, or from a multi-slide deck pack.
          </p>
          {loadError && <p className="aig-credit-estimate-hint">{loadError}</p>}
        </div>

        <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
          <div className="aig-selection-section">
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
                  onClick={() => setTab('layouts')}
                >
                  Layouts
                </button>
                <button
                  type="button"
                  className={`aig-pill-small ${tab === 'packs' ? 'active' : ''}`}
                  onClick={() => setTab('packs')}
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
                    handleSelect(
                      tab === 'packs'
                        ? {
                            id: t.id,
                            name: t.name,
                            type: 'Pack',
                            img: t.preview?.thumbnailUrl || t.preview?.imageUrl || null,
                            createMode: 'pack',
                            packId: t.id,
                            themeId: t.themeId,
                          }
                        : t
                    )
                  }
                >
                  <div className="aig-theme-card-header">
                    <span className="aig-theme-card-title">{t.name}</span>
                  </div>

                  {tab === 'packs' && t.slideCount && (
                    <div className="aig-theme-card-palette">
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        {t.slideCount} slides
                        {t.themeId ? ` · ${t.themeId}` : ''}
                      </span>
                    </div>
                  )}

                  {tab !== 'packs' && t.id !== 'blank' && (t.hex1 || t.hex2 || t.hex3) && (
                    <div className="aig-theme-card-palette">
                      {t.hex1 && <div className="palette-color" style={{ background: t.hex1 }}></div>}
                      {t.hex2 && <div className="palette-color" style={{ background: t.hex2 }}></div>}
                      {t.hex3 && <div className="palette-color" style={{ background: t.hex3 }}></div>}
                    </div>
                  )}

                  <div className="aig-theme-card-image-wrapper">
                    {t.img ? (
                      <img src={t.img} alt={t.name} className="aig-theme-card-image" />
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
                          fontSize: tab === 'packs' ? 14 : 24,
                          fontWeight: 600,
                          padding: 12,
                          textAlign: 'center',
                        }}
                      >
                        {tab === 'packs' ? 'Deck Pack' : '+'}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
