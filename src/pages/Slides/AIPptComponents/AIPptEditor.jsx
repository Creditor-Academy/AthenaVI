import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiPlay,
  FiDownload,
  FiShare2,
  FiPlus,
  FiGrid,
  FiType,
  FiImage,
  FiSettings,
  FiZoomIn,
  FiZoomOut,
  FiMousePointer,
  FiSearch,
  FiBarChart2,
  FiFilm,
  FiLayout,
  FiSidebar,
} from 'react-icons/fi'
import { MdUndo, MdRedo, MdDragIndicator, MdOutlineColorLens } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { THEMES } from './AIPptWizard'
import presentationService, {
  PresentationConflictError,
} from '../../../services/presentationService'
import brandKitService from '../../../services/brandKitService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import {
  PPT_CAPS,
  PPT_EXPORT_FORMATS,
  extractSlidesFromPresentation,
  getSlideImage,
  toApiThemeId,
} from '../../../utils/presentationHelpers'

const CANVAS_W = 1920
const CANVAS_H = 1080

function resolveThemeVisual(themeId, themeTokens) {
  const palette = themeTokens?.palette
  if (palette?.bg || palette?.primary || palette?.text) {
    const bg = palette.bg || palette.surface || '#FFFFFF'
    const primary = palette.primary || '#3B82F6'
    const secondary = palette.secondary || primary
    const text = palette.text || '#0F172A'
    const muted = palette.muted || '#64748B'
    return {
      id: 'themeTokens',
      name: themeTokens?.brand?.name || 'Brand Kit',
      outer: `linear-gradient(135deg, ${primary}, ${secondary})`,
      inner: bg,
      title: text,
      body: muted,
      primary,
      secondary,
      accent: palette.accent || secondary,
      background: bg,
    }
  }
  const id = String(themeId || '')
  return (
    THEMES.find((t) => t.id === id || toApiThemeId(t.id) === id) || THEMES[0]
  )
}

function CanvasElement({ el }) {
  const p = el.placement || {}
  const style = {
    position: 'absolute',
    left: `${((p.x || 0) / CANVAS_W) * 100}%`,
    top: `${((p.y || 0) / CANVAS_H) * 100}%`,
    width: `${((p.width || 100) / CANVAS_W) * 100}%`,
    height: `${((p.height || 40) / CANVAS_H) * 100}%`,
    transform: p.rotation ? `rotate(${p.rotation}deg)` : undefined,
    opacity: p.opacity != null ? p.opacity : 1,
    overflow: 'hidden',
  }

  if (el.type === 'text') {
    const c = el.content || {}
    return (
      <div
        style={{
          ...style,
          color: c.color || 'inherit',
          fontSize: c.fontSize ? `${Math.max(10, c.fontSize * 0.45)}px` : '16px',
          fontWeight: c.bold ? 700 : 400,
          fontStyle: c.italic ? 'italic' : 'normal',
          textAlign: c.align || 'left',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {c.text || ''}
      </div>
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src
    if (!url) {
      return (
        <div style={{ ...style, background: 'rgba(148,163,184,0.16)' }}>
          <div className="aig-canvas-image-fallback">
            <FiImage size={18} />
          </div>
        </div>
      )
    }
    return (
      <img
        src={url}
        alt={c.alt || ''}
        style={{ ...style, objectFit: c.fit || 'cover' }}
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden'
        }}
      />
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const shape = c.shape || 'rect'
    return (
      <div
        style={{
          ...style,
          background: c.fill || 'rgba(148,163,184,0.35)',
          borderRadius: shape === 'ellipse' ? '50%' : 0,
          border:
            shape === 'line'
              ? `2px solid ${c.line || c.fill || '#94a3b8'}`
              : undefined,
        }}
      />
    )
  }

  return <div style={style} />
}

function SlideStage({ slide, themeVisual }) {
  const elements = slide?.elements?.elements || []
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url

  return (
    <div className="aig-editor-canvas aig-editor-canvas--stage" style={{ background: themeVisual.outer }}>
      <div
        className="aig-slide-stage"
        style={{
          background: themeVisual.inner,
          color: themeVisual.body,
        }}
      >
        {hasElements ? (
          elements.map((el) => <CanvasElement key={el.id} el={el} />)
        ) : (
          <div className="aig-slide-mock">
            <h1 className="aig-slide-mock-title" style={{ color: themeVisual.title }}>
              {slide.title}
            </h1>
            <div className="aig-slide-mock-text" style={{ color: themeVisual.body }}>
              {Array.isArray(slide.description) ? (
                <ul style={{ paddingLeft: '32px', margin: 0 }}>
                  {slide.description.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '12px' }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>{slide.description}</p>
              )}
            </div>

            {fallbackImage && (
              <div className="aig-slide-mock-visual">
                <img src={fallbackImage} alt="" className="aig-slide-mock-image" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIPptEditor({
  outline = [],
  config = {},
  workspaceId: workspaceIdProp,
  presentationId: presentationIdProp,
  onBack,
}) {
  const workspaceId = workspaceIdProp || config.workspaceId
  const presentationId = presentationIdProp || config.presentationId

  const [localSlides, setLocalSlides] = useState(outline || [])
  const [showMinimap, setShowMinimap] = useState(true)
  const [deckStatus, setDeckStatus] = useState('READY')
  const [loading, setLoading] = useState(Boolean(workspaceId && presentationId))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [elementPresets, setElementPresets] = useState([])
  const [selectedSlideId, setSelectedSlideId] = useState(null)
  const [themeTokens, setThemeTokens] = useState(null)
  const [brandKits, setBrandKits] = useState([])
  const [brandKitOpen, setBrandKitOpen] = useState(false)
  const [applyingBrandKit, setApplyingBrandKit] = useState(false)
  const exportMenuRef = useRef(null)
  const brandKitMenuRef = useRef(null)

  const themeVisual = useMemo(
    () => resolveThemeVisual(config.theme, themeTokens),
    [config.theme, themeTokens]
  )

  const isGenerating = String(deckStatus).toUpperCase() === 'GENERATING'
  const atDeckCap = localSlides.length >= PPT_CAPS.DECK_MAX_SLIDES

  const reloadPresentation = useCallback(async () => {
    if (!workspaceId || !presentationId) return
    const data = await presentationService.getPresentation(workspaceId, presentationId)
    const slides = extractSlidesFromPresentation(data)
    setLocalSlides(slides)
    setThemeTokens(
      data?.deck?.themeTokens ||
        data?.themeTokens ||
        data?.presentation?.deck?.themeTokens ||
        null
    )
    setDeckStatus(
      data?.deck?.status ||
        data?.status ||
        data?.presentation?.deck?.status ||
        data?.presentation?.status ||
        'READY'
    )
    if (slides[0]?.id) setSelectedSlideId((prev) => prev || slides[0].id)
    return data
  }, [workspaceId, presentationId])

  useEffect(() => {
    if (!workspaceId || !presentationId) {
      setLocalSlides(outline || [])
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        await reloadPresentation()
        try {
          const [presetsPayload, kits] = await Promise.all([
            presentationService.listElementPresets(workspaceId).catch(() => null),
            brandKitService.list(workspaceId).catch(() => []),
          ])
          const presets =
            presetsPayload?.elements ||
            presetsPayload?.presets ||
            presetsPayload?.items ||
            (Array.isArray(presetsPayload) ? presetsPayload : [])
          if (!cancelled) {
            setElementPresets(presets)
            setBrandKits(kits || [])
          }
        } catch {
          // Palette / kits optional for first load
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load presentation')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [workspaceId, presentationId, outline, reloadPresentation])

  useEffect(() => {
    const onDocClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportOpen(false)
      }
      if (brandKitMenuRef.current && !brandKitMenuRef.current.contains(e.target)) {
        setBrandKitOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleApplyBrandKit = async (brandKitId) => {
    if (!workspaceId || !presentationId || !brandKitId || isGenerating) return
    setApplyingBrandKit(true)
    setBrandKitOpen(false)
    setError('')
    try {
      await presentationService.applyBrandKit(workspaceId, presentationId, brandKitId)
      await reloadPresentation()
    } catch (err) {
      if (err?.status === 403) {
        setError(err.message || 'Not allowed to apply this brand kit')
      } else if (err instanceof PresentationConflictError) {
        setError(err.message || 'Cannot apply brand kit while generating')
      } else {
        setError(err.message || 'Failed to apply brand kit')
      }
    } finally {
      setApplyingBrandKit(false)
    }
  }

  const handleAddSlide = async (index) => {
    if (atDeckCap || isGenerating) return

    if (!workspaceId || !presentationId) {
      const newSlide = {
        id: `new-slide-${Date.now()}`,
        title: 'Blank Slide',
        description: 'Double click to add content.',
        elements: { version: 1, canvas: { width: CANVAS_W, height: CANVAS_H }, elements: [] },
      }
      const updated = [...localSlides]
      updated.splice(index + 1, 0, newSlide)
      setLocalSlides(updated)
      return
    }

    setBusy(true)
    setError('')
    try {
      const afterSlideId = localSlides[index]?.id
      await presentationService.addSlide(workspaceId, presentationId, {
        afterSlideId: afterSlideId || undefined,
      })
      await reloadPresentation()
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Presentation is generating — edits are locked until it finishes.')
      } else {
        setError(err.message || 'Failed to add slide')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDuplicateSlide = async (slideId) => {
    if (atDeckCap || isGenerating || !workspaceId || !presentationId) return
    setBusy(true)
    try {
      await presentationService.duplicateSlide(workspaceId, presentationId, slideId)
      await reloadPresentation()
    } catch (err) {
      setError(err.message || 'Failed to duplicate slide')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteSlide = async (slideId) => {
    if (isGenerating || !workspaceId || !presentationId || localSlides.length <= 1) return
    if (!window.confirm('Delete this slide?')) return
    setBusy(true)
    try {
      await presentationService.deleteSlide(workspaceId, presentationId, slideId)
      await reloadPresentation()
    } catch (err) {
      setError(err.message || 'Failed to delete slide')
    } finally {
      setBusy(false)
    }
  }

  const handleRegenerate = async (slide) => {
    if (!workspaceId || !presentationId || isGenerating) return
    let overwriteManualEdits = false
    if (slide.manuallyEdited) {
      const ok = window.confirm(
        'This slide was edited manually. Regenerate and overwrite your changes?'
      )
      if (!ok) return
      overwriteManualEdits = true
    }
    setBusy(true)
    try {
      await presentationService.regenerateSlide(workspaceId, presentationId, slide.id, {
        target: 'full',
        overwriteManualEdits,
      })
      await presentationService.pollUntilReady(workspaceId, presentationId, {
        intervalMs: 2000,
      })
      await reloadPresentation()
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Cannot overwrite — confirm overwrite or wait for generation to finish.')
      } else if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits')
      } else {
        setError(err.message || 'Regenerate failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleInsertPreset = async (presetId) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || !workspaceId || !presentationId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const count = slide?.elements?.elements?.length || 0
    if (count >= PPT_CAPS.ELEMENTS_PER_SLIDE) {
      setError(`Max ${PPT_CAPS.ELEMENTS_PER_SLIDE} elements per slide`)
      return
    }

    setBusy(true)
    try {
      await presentationService.insertElement(workspaceId, presentationId, slideId, {
        presetId,
      })
      await reloadPresentation()
    } catch (err) {
      setError(err.message || 'Failed to insert element')
    } finally {
      setBusy(false)
    }
  }

  const handleExport = async (format) => {
    if (!workspaceId || !presentationId) {
      setError('Export requires a saved presentation')
      return
    }
    setExportOpen(false)
    setExportStatus(`Exporting ${format}…`)
    setError('')
    try {
      const started = await presentationService.startExport(workspaceId, presentationId, {
        format,
        slideId: null,
      })
      const exportId =
        started?.exportId ||
        started?.id ||
        started?.export?.id ||
        started?._id
      if (!exportId) throw new Error('Export started but no exportId returned')

      const ready = await presentationService.pollExportUntilReady(
        workspaceId,
        presentationId,
        exportId,
        {
          onProgress: (s) => {
            const st = s?.status || 'PROCESSING'
            setExportStatus(`Export ${format}: ${st}`)
          },
        }
      )

      const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
        setExportStatus(`${format} ready`)
      } else {
        setExportStatus('Export finished but no download URL was returned')
      }
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits to export')
      } else {
        setError(err.message || 'Export failed')
      }
      setExportStatus('')
    }
  }

  if (loading) {
    return (
      <div className="aig-editor-container fade-in" style={{ placeItems: 'center', display: 'grid' }}>
        <div className="aig-spinner" />
        <p>Loading presentation…</p>
      </div>
    )
  }

  return (
    <div className="aig-editor-container fade-in">
      {isGenerating && (
        <div className="aig-generating-lock" role="status">
          Generating… structure and canvas edits are locked
        </div>
      )}

      {error && (
        <div className="aig-flow-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      <nav className="aig-editor-nav">
        <div className="aig-editor-nav-left">
          <button className="aig-home-btn" onClick={onBack}>
            Exit Editor
          </button>
          <div className="aig-editor-title">
            {config.title || 'Untitled Presentation'}
            {presentationId && <span className="aig-editor-badge">Saved</span>}
          </div>
        </div>
        <div className="aig-editor-nav-center">
          <button className="aig-editor-btn-icon" title="Undo" type="button">
            <MdUndo size={16} />
          </button>
          <button className="aig-editor-btn-icon" title="Redo" type="button">
            <MdRedo size={16} />
          </button>
          <div className="aig-editor-nav-divider"></div>
          <button className="aig-editor-btn-icon active" title="Select" type="button">
            <FiMousePointer size={16} />
          </button>
          <button
            className="aig-editor-btn-icon"
            title="Add Text"
            type="button"
            disabled={isGenerating || busy}
            onClick={() => handleInsertPreset('text_title')}
          >
            <FiType size={16} />
          </button>
          <button
            className="aig-editor-btn-icon"
            title="Add Media"
            type="button"
            disabled={isGenerating || busy}
            onClick={() => handleInsertPreset('image')}
          >
            <FiImage size={16} />
          </button>
        </div>
        <div className="aig-editor-nav-right">
          {exportStatus && <span className="aig-credit-estimate-hint">{exportStatus}</span>}
          <div className="aig-export-menu" ref={brandKitMenuRef}>
            <button
              className="aig-editor-btn-secondary"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setBrandKitOpen((v) => !v)
                setExportOpen(false)
              }}
              disabled={!presentationId || busy || isGenerating || applyingBrandKit}
              title="Apply Brand Kit"
            >
              <MdOutlineColorLens size={16} />
              {applyingBrandKit ? 'Applying…' : 'Brand Kit'}
            </button>
            {brandKitOpen && (
              <div className="aig-export-dropdown">
                {!brandKits.length && (
                  <button type="button" disabled>
                    No brand kits
                  </button>
                )}
                {brandKits.map((kit) => (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => handleApplyBrandKit(kit.id)}
                  >
                    {kit.name}
                    {kit.isDefault ? ' · Default' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="aig-editor-btn-secondary" type="button">
            <FiShare2 size={16} /> Share
          </button>
          <div className="aig-export-menu" ref={exportMenuRef}>
            <button
              className="aig-editor-btn-secondary"
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              disabled={!presentationId || busy}
            >
              <FiDownload size={16} /> Export
            </button>
            {exportOpen && (
              <div className="aig-export-dropdown">
                {PPT_EXPORT_FORMATS.map((fmt) => (
                  <button key={fmt} type="button" onClick={() => handleExport(fmt)}>
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="aig-editor-btn-primary" type="button">
            <FiPlay size={16} /> Present
          </button>
        </div>
      </nav>

      <div className="aig-editor-workspace gamma-layout">
        <main className="aig-editor-main-scroll" style={{ marginLeft: showMinimap ? '260px' : '0' }}>
          <div className="aig-editor-scroll-container">
            {localSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`aig-scroll-slide-container ${selectedSlideId === slide.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedSlideId(slide.id)}
              >
                <div className="aig-scroll-slide-wrapper">
                  <div className="aig-scroll-slide-hover-actions">
                    <button className="aig-slide-action-btn" title="Drag" type="button">
                      <MdDragIndicator size={16} />
                    </button>
                    <button
                      className="aig-slide-action-btn"
                      title="Edit with AI"
                      type="button"
                      disabled={busy || isGenerating}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegenerate(slide)
                      }}
                    >
                      <BsStars size={16} />
                    </button>
                    <button
                      className="aig-slide-action-btn"
                      title="Duplicate"
                      type="button"
                      disabled={busy || isGenerating || atDeckCap}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateSlide(slide.id)
                      }}
                    >
                      <FiGrid size={16} />
                    </button>
                  </div>

                  <SlideStage slide={slide} themeVisual={themeVisual} />
                </div>

                <div className="aig-scroll-add-slide-divider">
                  <button
                    className="aig-add-slide-btn"
                    type="button"
                    disabled={atDeckCap || isGenerating || busy}
                  >
                    <FiPlus size={14} /> {atDeckCap ? 'Max 40' : 'Add'}
                  </button>
                  {!atDeckCap && (
                    <div className="aig-add-slide-dropdown">
                      <div
                        className="aig-dropdown-item"
                        onClick={() => handleAddSlide(idx)}
                      >
                        <span className="aig-dropdown-icon">📄</span> Blank Slide
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="aig-canvas-controls">
            <button className="aig-canvas-ctrl-btn" type="button">
              <FiZoomOut size={14} />
            </button>
            <span className="aig-canvas-zoom-level">100%</span>
            <button className="aig-canvas-ctrl-btn" type="button">
              <FiZoomIn size={14} />
            </button>
            <div className="aig-canvas-ctrl-divider"></div>
            <button className="aig-canvas-ctrl-btn" type="button">
              Fit
            </button>
          </div>
        </main>

        <div className="aig-floating-toolbar">
          <button className="aig-float-btn" title="Search" type="button">
            <FiSearch size={18} />
          </button>
          <button
            className="aig-float-btn"
            title="Typography"
            type="button"
            style={{ color: '#3b82f6' }}
            disabled={isGenerating}
            onClick={() => handleInsertPreset('text_title')}
          >
            <FiType size={18} />
          </button>
          <button
            className="aig-float-btn"
            title="Images"
            type="button"
            style={{ color: '#3b82f6' }}
            disabled={isGenerating}
            onClick={() => handleInsertPreset('image')}
          >
            <FiImage size={18} />
          </button>
          <button className="aig-float-btn" title="Layouts" type="button" style={{ color: '#3b82f6' }}>
            <FiLayout size={18} />
          </button>
          <button className="aig-float-btn" title="Theme" type="button" style={{ color: '#3b82f6' }}>
            <MdOutlineColorLens size={18} />
          </button>
          <button
            className="aig-float-btn"
            title="Charts"
            type="button"
            style={{ color: '#3b82f6' }}
            disabled={isGenerating}
            onClick={() => handleInsertPreset('chart')}
          >
            <FiBarChart2 size={18} />
          </button>
          <button className="aig-float-btn" title="Video" type="button" style={{ color: '#3b82f6' }}>
            <FiFilm size={18} />
          </button>
          <button className="aig-float-btn" title="Forms" type="button" style={{ color: '#3b82f6' }}>
            <FiGrid size={18} />
          </button>

          <div className="aig-float-divider"></div>

          <button className="aig-float-btn-special" title="Edit Options" type="button">
            <FiSettings size={18} />
          </button>

          {elementPresets.length > 0 && (
            <div className="aig-preset-chip-row">
              {elementPresets.slice(0, 6).map((preset) => {
                const presetId = preset.presetId || preset.id
                return (
                  <button
                    key={presetId}
                    type="button"
                    className="aig-preset-chip"
                    disabled={isGenerating || busy}
                    onClick={() => handleInsertPreset(presetId)}
                    title={preset.label || presetId}
                  >
                    {preset.label || presetId}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="aig-editor-minimap-toggle">
          <button
            className={`aig-float-btn ${showMinimap ? 'active' : ''}`}
            onClick={() => setShowMinimap(!showMinimap)}
            title="Toggle Outline"
            type="button"
          >
            <FiSidebar size={18} />
          </button>
        </div>

        {showMinimap && (
          <aside className="aig-editor-minimap">
            <div className="aig-minimap-header">
              <button
                className="aig-minimap-add-btn"
                type="button"
                disabled={atDeckCap || isGenerating || busy}
                onClick={() => handleAddSlide(localSlides.length - 1)}
              >
                <FiPlus size={16} /> {atDeckCap ? 'Deck full (40)' : 'New Slide'}
              </button>
            </div>
            <div className="aig-minimap-scroll">
              {localSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`aig-minimap-item ${selectedSlideId === slide.id ? 'active' : ''}`}
                  onClick={() => setSelectedSlideId(slide.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    handleDeleteSlide(slide.id)
                  }}
                >
                  <span className="aig-minimap-num">{idx + 1}</span>
                  <div className="aig-minimap-thumb" style={{ background: themeVisual.outer }}>
                    <div className="aig-minimap-thumb-inner" style={{ background: themeVisual.inner }}>
                      <div className="aig-minimap-thumb-title" style={{ color: themeVisual.title }}>
                        {slide.title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
