import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiPlay,
  FiDownload,
  FiShare2,
  FiPlus,
  FiGrid,
  FiImage,
  FiZoomIn,
  FiZoomOut,
  FiSidebar,
  FiCode,
} from 'react-icons/fi'
import { MdDragIndicator, MdOutlineColorLens } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { THEMES } from './AIPptWizard'
import InsertToolbar from './insert/InsertToolbar'
import EditorFileMenu from './insert/EditorFileMenu'
import EditorRightRail from './insert/EditorRightRail'
import AddSlideModal from './insert/AddSlideModal'
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
import { PPT_DEFAULT_PLACEMENTS } from '../../../constants/pptInsertCatalog'

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
          alignItems: c.align === 'center' ? 'center' : 'flex-start',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.25,
        }}
      >
        {c.text || ''}
      </div>
    )
  }

  if (el.type === 'image' || el.type === 'icon') {
    const c = el.content || {}
    const url = c.url || c.src || c.thumbnailUrl || c.previewUrl
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
        style={{ ...style, objectFit: c.fit || (el.type === 'icon' ? 'contain' : 'cover') }}
        onError={(e) => {
          e.currentTarget.style.opacity = '0.35'
        }}
      />
    )
  }

  if (el.type === 'shape') {
    const c = el.content || {}
    const shape = c.shape || 'rect'
    const fill = c.fill || 'rgba(148,163,184,0.35)'
    const stroke = c.stroke
    const strokeWidth = c.strokeWidth || 3
    const clipPaths = {
      'triangle-up': 'polygon(50% 0%, 0% 100%, 100% 100%)',
      'triangle-down': 'polygon(0% 0%, 100% 0%, 50% 100%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    }
    const clip = clipPaths[shape]
    const radius =
      shape === 'ellipse' || shape === 'circle'
        ? '50%'
        : shape === 'pill'
          ? 999
          : shape === 'rounded-rect'
            ? 12
            : 0

    if (clip) {
      if (stroke && (fill === 'transparent' || c.variant === 'outlined')) {
        const svgPaths = {
          'triangle-up': 'M50 4 L96 96 L4 96 Z',
          'triangle-down': 'M4 4 L96 4 L50 96 Z',
          diamond: 'M50 4 L96 50 L50 96 L4 50 Z',
          star: 'M50 4 L61 38 L96 38 L68 58 L79 92 L50 72 L21 92 L32 58 L4 38 L39 38 Z',
          pentagon: 'M50 4 L96 38 L79 96 L21 96 L4 38 Z',
          hexagon: 'M25 4 L75 4 L96 50 L75 96 L25 96 L4 50 Z',
        }
        return (
          <svg viewBox="0 0 100 100" style={{ ...style, display: 'block' }} preserveAspectRatio="none">
            <path
              d={svgPaths[shape]}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 1.2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )
      }
      return (
        <div
          style={{
            ...style,
            background: fill,
            clipPath: clip,
          }}
        />
      )
    }

    return (
      <div
        style={{
          ...style,
          background: fill === 'transparent' ? 'transparent' : fill,
          borderRadius: radius,
          border:
            shape === 'line'
              ? `2px solid ${c.line || fill || '#94a3b8'}`
              : stroke
                ? `${strokeWidth}px solid ${stroke}`
                : undefined,
          boxSizing: 'border-box',
        }}
      />
    )
  }

  if (el.type === 'chart') {
    const c = el.content || {}
    const series = c.data?.series?.[0]?.values || [12, 19, 14, 22]
    const max = Math.max(...series, 1)
    const colors = c.colors || ['#7C3AED', '#A78BFA', '#FDBA74']
    return (
      <div className="aig-canvas-chart" style={style}>
        <div className="aig-canvas-embed-label">{c.chartType || 'chart'}</div>
        <div className="aig-canvas-chart-bars">
          {series.slice(0, 8).map((v, i) => (
            <span
              key={i}
              style={{
                height: `${Math.max(8, (Number(v) / max) * 100)}%`,
                background: colors[i % colors.length],
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (el.type === 'table') {
    const c = el.content || {}
    const cells = c.cells || []
    return (
      <div className="aig-canvas-table" style={style}>
        <table className="aig-canvas-table-grid">
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) =>
                  c.hasHeader && ri === 0 ? (
                    <th key={ci}>{cell}</th>
                  ) : (
                    <td key={ci}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (el.type === 'embed' || el.type === 'link') {
    const c = el.content || {}
    return (
      <div className="aig-canvas-embed" style={style}>
        <div className="aig-canvas-embed-label">
          <FiCode size={12} style={{ marginRight: 4 }} />
          {c.title || c.provider || 'Embed'}
        </div>
        <div className="aig-canvas-embed-url">{c.url || ''}</div>
      </div>
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
          elements.map((el, i) => <CanvasElement key={el.id || `el-${i}`} el={el} />)
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
  const [selectedSlideId, setSelectedSlideId] = useState(null)
  const [themeTokens, setThemeTokens] = useState(null)
  const [brandKits, setBrandKits] = useState([])
  const [brandKitOpen, setBrandKitOpen] = useState(false)
  const [applyingBrandKit, setApplyingBrandKit] = useState(false)
  const [deckTitle, setDeckTitle] = useState(config.title || 'Untitled Presentation')
  const [addSlideOpen, setAddSlideOpen] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(null)
  const exportMenuRef = useRef(null)
  const brandKitMenuRef = useRef(null)

  useEffect(() => {
    if (config.title) setDeckTitle(config.title)
  }, [config.title])

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
          const kits = await brandKitService.list(workspaceId).catch(() => [])
          if (!cancelled) {
            setBrandKits(kits || [])
          }
        } catch {
          // kits optional for first load
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

  const openAddSlideModal = (afterIndex = null) => {
    if (atDeckCap || isGenerating || busy) return
    setAddAfterIndex(afterIndex == null ? localSlides.length - 1 : afterIndex)
    setAddSlideOpen(true)
  }

  const handleAddSlide = async (index, options = {}) => {
    if (atDeckCap || isGenerating) return

    const seed = options.seed || null
    const templateId = options.templateId || null
    const title = seed?.title || options.name || 'Blank Slide'
    const description = seed?.description ?? 'Double click to add content.'
    const seedElements = Array.isArray(seed?.elements) ? seed.elements : []

    if (!workspaceId || !presentationId) {
      const newSlide = {
        id: `new-slide-${Date.now()}`,
        title,
        description,
        elements: {
          version: 1,
          canvas: { width: CANVAS_W, height: CANVAS_H },
          elements: seedElements,
        },
      }
      const updated = [...localSlides]
      updated.splice(index + 1, 0, newSlide)
      setLocalSlides(updated)
      setSelectedSlideId(newSlide.id)
      return
    }

    setBusy(true)
    setError('')
    try {
      const afterSlideId = localSlides[index]?.id
      const created = await presentationService.addSlide(workspaceId, presentationId, {
        afterSlideId: afterSlideId || undefined,
        ...(title ? { title } : {}),
      })
      const newSlideId =
        created?.id ||
        created?.slideId ||
        created?.slide?.id ||
        created?._id ||
        null

      if (templateId && newSlideId) {
        try {
          await presentationService.applyLayout(
            workspaceId,
            presentationId,
            newSlideId,
            templateId
          )
        } catch {
          // Layout apply optional — blank slide still created
        }
      }

      await reloadPresentation()

      // Seed layout elements when backend has no layout catalog match
      if (seedElements.length && newSlideId) {
        try {
          const canvasDoc = {
            version: 1,
            canvas: { width: CANVAS_W, height: CANVAS_H },
            elements: seedElements,
          }
          await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            newSlideId,
            canvasDoc
          )
          await reloadPresentation()
        } catch {
          // Keep slide even if seed canvas fails
        }
      }

      if (newSlideId) setSelectedSlideId(newSlideId)
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

  const handlePickAddSlide = async (pick) => {
    setAddSlideOpen(false)
    const index = addAfterIndex == null ? localSlides.length - 1 : addAfterIndex
    if (pick?.source === 'template') {
      await handleAddSlide(index, {
        templateId: pick.templateId,
        name: pick.name || 'Template slide',
      })
      return
    }
    await handleAddSlide(index, {
      seed: pick?.seed || null,
      name: pick?.name || pick?.seed?.title || 'Blank Slide',
    })
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

  const handleInsertElement = async (payload) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const existing = slide?.elements?.elements || []
    if (existing.length >= PPT_CAPS.ELEMENTS_PER_SLIDE) {
      setError(`Max ${PPT_CAPS.ELEMENTS_PER_SLIDE} elements per slide`)
      return
    }

    const type = payload?.type || 'text'
    const placement =
      payload.placement || PPT_DEFAULT_PLACEMENTS[type] || PPT_DEFAULT_PLACEMENTS.text
    const content = { ...(payload.content || {}) }
    // Normalize media URLs so the canvas always has something to render
    if ((type === 'image' || type === 'icon') && !content.url && content.src) {
      content.url = content.src
    }
    if ((type === 'image' || type === 'icon') && content.url && !content.src) {
      content.src = content.url
    }

    const newEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content,
      placement,
      layer: existing.length,
      ...(payload.presetId ? { presetId: payload.presetId } : {}),
    }

    const nextElementsDoc = {
      version: slide?.elements?.version || 1,
      canvas: slide?.elements?.canvas || { width: CANVAS_W, height: CANVAS_H },
      elements: [...existing, newEl],
    }

    // Optimistic: show on the slide immediately (fixes “image not appearing”)
    setLocalSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, elements: nextElementsDoc } : s))
    )
    setSelectedSlideId(slideId)

    if (!workspaceId || !presentationId) return

    setBusy(true)
    setError('')
    try {
      // Prefer full canvas save so custom image/shape/chart content is kept
      await presentationService.saveCanvas(
        workspaceId,
        presentationId,
        slideId,
        nextElementsDoc
      )
      try {
        const data = await presentationService.getPresentation(workspaceId, presentationId)
        const slides = extractSlidesFromPresentation(data)
        const remote = slides.find((s) => s.id === slideId)
        const remoteEls = remote?.elements?.elements || []
        const stillHasMedia =
          type !== 'image' && type !== 'icon'
            ? true
            : remoteEls.some(
                (el) =>
                  (el.content?.url || el.content?.src) === (content.url || content.src)
              )
        if (stillHasMedia && remoteEls.length >= nextElementsDoc.elements.length) {
          setLocalSlides(slides)
          setThemeTokens(
            data?.deck?.themeTokens ||
              data?.themeTokens ||
              data?.presentation?.deck?.themeTokens ||
              null
          )
        }
        // else keep optimistic local canvas — backend dropped rich content
      } catch {
        // keep optimistic state
      }
    } catch (err) {
      // Fallback: try insertElement API, then keep optimistic UI either way
      try {
        await presentationService.insertElement(workspaceId, presentationId, slideId, {
          type,
          ...(payload.presetId ? { presetId: payload.presetId } : {}),
          content,
          placement,
        })
      } catch (insertErr) {
        if (payload.presetId) {
          try {
            await presentationService.insertElement(workspaceId, presentationId, slideId, {
              presetId: payload.presetId,
            })
          } catch {
            setError(
              insertErr.message ||
                err.message ||
                'Could not sync to server — element kept locally on this slide'
            )
          }
        } else {
          setError(
            insertErr.message ||
              err.message ||
              'Could not sync to server — element kept locally on this slide'
          )
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const handleChangeTransition = async (transitionId) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const nextElements = {
      version: slide?.elements?.version || 1,
      canvas: slide?.elements?.canvas || { width: CANVAS_W, height: CANVAS_H },
      elements: slide?.elements?.elements || [],
      transition: transitionId,
      ...(slide?.elements?.contributorStatus
        ? { contributorStatus: slide.elements.contributorStatus }
        : {}),
    }

    setLocalSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? { ...s, transition: transitionId, elements: nextElements }
          : s
      )
    )

    if (!workspaceId || !presentationId) return

    try {
      await Promise.allSettled([
        presentationService.patchSlide(workspaceId, presentationId, slideId, {
          transition: transitionId,
        }),
        presentationService.saveCanvas(workspaceId, presentationId, slideId, nextElements),
      ])
    } catch {
      // Keep optimistic local selection even if sync fails
    }
  }

  const handleChangeSlideStatus = async (statusId) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const nextElements = {
      version: slide?.elements?.version || 1,
      canvas: slide?.elements?.canvas || { width: CANVAS_W, height: CANVAS_H },
      elements: slide?.elements?.elements || [],
      contributorStatus: statusId,
      ...(slide?.elements?.transition ? { transition: slide.elements.transition } : {}),
    }

    setLocalSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? { ...s, contributorStatus: statusId, elements: nextElements }
          : s
      )
    )

    if (!workspaceId || !presentationId) return

    try {
      await Promise.allSettled([
        presentationService.patchSlide(workspaceId, presentationId, slideId, {
          contributorStatus: statusId,
        }),
        presentationService.saveCanvas(workspaceId, presentationId, slideId, nextElements),
      ])
    } catch {
      // Keep optimistic local selection
    }
  }

  const selectedSlide =
    localSlides.find((s) => s.id === selectedSlideId) || localSlides[0] || null

  const generationPrompt =
    config.prompt ||
    config.generationPrompt ||
    config.outline ||
    [config.title, config.tone, config.audience].filter(Boolean).join(' · ')

  const handleRename = () => {
    const next = window.prompt('Rename presentation', deckTitle || 'Untitled Presentation')
    if (next == null) return
    const trimmed = next.trim().slice(0, 255)
    if (!trimmed) return
    setDeckTitle(trimmed)
  }

  const handleDuplicateDeck = async () => {
    setError('Duplicate deck is not available yet — duplicate individual slides from the slide actions.')
  }

  const openMediaForBackground = () => {
    setError('Use Media → Unsplash / Upload, then place the image. Dedicated slide background control is next.')
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

      <nav className="aig-editor-nav aig-editor-nav--gamma">
        <div className="aig-editor-nav-left">
          <EditorFileMenu
            title={deckTitle}
            privacy="Private"
            canUndo={false}
            canRedo={false}
            onRename={handleRename}
            onDuplicate={handleDuplicateDeck}
            onExport={() => setExportOpen(true)}
            onExit={onBack}
          />
          {presentationId && <span className="aig-editor-badge">Saved</span>}
        </div>

        <div className="aig-editor-nav-center">
          <InsertToolbar
            orientation="horizontal"
            disabled={isGenerating || busy}
            workspaceId={workspaceId}
            brandKits={brandKits}
            onInsert={handleInsertElement}
          />
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
        <main
          className="aig-editor-main-scroll aig-editor-main-scroll--with-rail"
          style={{ marginLeft: showMinimap ? '260px' : '0' }}
        >
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
                    onClick={() => openAddSlideModal(idx)}
                  >
                    <FiPlus size={14} /> {atDeckCap ? 'Max 40' : 'Add'}
                  </button>
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

        <EditorRightRail
          zoom={100}
          deckStatus={deckStatus}
          generationPrompt={generationPrompt}
          slide={selectedSlide}
          themeVisual={themeVisual}
          disabled={isGenerating || busy}
          onResetBackground={() =>
            setError('Background reset will apply once slide theme editing is connected.')
          }
          onAddBackgroundImage={openMediaForBackground}
          onChangeTransition={handleChangeTransition}
          onChangeSlideStatus={handleChangeSlideStatus}
        />

        {showMinimap ? (
          <aside className="aig-editor-minimap">
            <div className="aig-minimap-header">
              <button
                className="aig-minimap-add-btn"
                type="button"
                disabled={atDeckCap || isGenerating || busy}
                onClick={() => openAddSlideModal(localSlides.length - 1)}
                title="Add a new slide"
              >
                <FiPlus size={16} /> {atDeckCap ? 'Deck full (40)' : 'Add slide'}
              </button>
              <button
                className="aig-minimap-outline-btn"
                type="button"
                onClick={() => setShowMinimap(false)}
                title="Hide outline"
                aria-label="Hide outline"
              >
                <FiSidebar size={16} />
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
                  <span
                    className={`ppt-status-dot ppt-status-dot--sm ppt-status-dot--${
                      slide.contributorStatus || slide.elements?.contributorStatus || 'none'
                    }`}
                    title={
                      {
                        none: 'No status',
                        todo: 'To do',
                        'in-progress': 'In progress',
                        done: 'Done',
                      }[slide.contributorStatus || slide.elements?.contributorStatus || 'none']
                    }
                    aria-hidden
                  />
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
        ) : (
          <div className="aig-editor-minimap-toggle">
            <button
              className="aig-minimap-outline-btn aig-minimap-outline-btn--alone"
              type="button"
              onClick={() => setShowMinimap(true)}
              title="Show outline"
              aria-label="Show outline"
            >
              <FiSidebar size={16} />
            </button>
          </div>
        )}
      </div>

      <AddSlideModal
        open={addSlideOpen}
        onClose={() => setAddSlideOpen(false)}
        workspaceId={workspaceId}
        disabled={busy || isGenerating || atDeckCap}
        onPick={handlePickAddSlide}
      />
    </div>
  )
}
