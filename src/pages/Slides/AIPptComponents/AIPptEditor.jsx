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
} from 'react-icons/fi'
import { MdDragIndicator, MdOutlineColorLens } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { THEMES } from './AIPptWizard'
import InsertToolbar from './insert/InsertToolbar'
import EditorFileMenu from './insert/EditorFileMenu'
import EditorRightRail from './insert/EditorRightRail'
import AddSlideModal from './insert/AddSlideModal'
import PptCanvasElement from './PptCanvasElement'
import PptCanvasGuidesOverlay from './PptCanvasGuidesOverlay'
import PresentMode from './PresentMode'
import SharePresentationModal from './SharePresentationModal'
import ExportPresentationModal from './ExportPresentationModal'
import ImageCropModal from './ImageCropModal'
import PptQuickMenu from './PptQuickMenu'
import SlideEditAiPanel from './SlideEditAiPanel'
import MinimapSlidePreview from './MinimapSlidePreview'
import { usePptEditorHistory } from '../../../hooks/usePptEditorHistory'
import { usePptElementMutations } from './usePptElementMutations'
import { computePptSmartGuides } from '../../../utils/pptSmartGuides'
import { useAuth } from '../../../contexts/AuthContext'
import presentationService, {
  PresentationConflictError,
} from '../../../services/presentationService'
import { extractShareToken, getOrCreateViewerSessionId } from '../../../utils/pptShareSession'
import PptPresenceAvatars from './PptPresenceAvatars'
import usePptPresence from './usePptPresence'
import brandKitService from '../../../services/brandKitService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import {
  PPT_CAPS,
  buildCanvasDoc,
  extractElementFromMutation,
  extractSlideFromMutation,
  extractSlidesFromPresentation,
  extractDeckPackId,
  getSlideImage,
  isSlideBackgroundElement,
  normalizeElementPresets,
  normalizeApiShape,
  normalizeElementPlacement,
  normalizeSlideForEditor,
  resolveCanvasSize,
  resolveSlideStageBackground,
  resolveThemeColor,
  toApiThemeId,
  buildWizardThemeTokens,
} from '../../../utils/presentationHelpers'
import { compileDeckLayoutToElements, buildThemeCompileOptions } from '../../../utils/compileDeckLayoutToElements'
import { resolveLayoutSchemaById } from '../../../utils/deckLayoutRegistry'
import {
  layoutSchemaHasCanvasElements,
  resolveLayoutCanvasElementsDoc,
} from '../../../utils/videoTemplateToCanvasElements'
import {
  applyCompiledLayoutToSlide,
  fetchLayoutSchemaMap,
  repairPresentationLayoutSlides,
} from '../../../utils/layoutCanvasService'
import { PPT_DEFAULT_PLACEMENTS } from '../../../constants/pptInsertCatalog'
import { ensureThemeFontsLoaded, themeFontFamilies } from '../../../utils/googleFonts'
import {
  logCanvasGreySuspects,
  shouldPaintElement,
} from '../../../utils/canvasRenderDebug'
import './pptEditorExtras.css'
import '../AIPptGenerator.css'

const CANVAS_SAVE_DEBOUNCE_MS = 600
const DEFAULT_SLIDE_BG = '#FFFFFF'
const DEFAULT_TEXT_COLOR = '#0F172A'

function resolveThemeVisual(themeId, themeTokens) {
  const palette = themeTokens?.palette
  if (palette?.bg || palette?.primary || palette?.text) {
    const bg = palette.bg || palette.surface || DEFAULT_SLIDE_BG
    const primary = palette.primary || '#3B82F6'
    const secondary = palette.secondary || primary
    const text = palette.text || '#0F172A'
    const muted = palette.muted || '#64748B'
    return {
      id: 'themeTokens',
      name: themeTokens?.brand?.name || 'Brand Kit',
      outer: bg,
      inner: bg,
      title: text,
      body: muted,
      primary,
      secondary,
      accent: palette.accent || secondary,
      background: bg,
      palette,
    }
  }
  const id = String(themeTokens?.wizardColorThemeId || themeId || '')
  const fallback = THEMES.find((t) => t.id === id || toApiThemeId(t.id) === id) || THEMES[0]
  const builtTokens = buildWizardThemeTokens(fallback.id, THEMES)
  const fallbackPalette = builtTokens?.palette || null
  const bg = fallback.background || fallbackPalette?.bg || DEFAULT_SLIDE_BG
  return {
    ...fallback,
    outer: bg,
    inner: bg,
    background: bg,
    palette: fallbackPalette,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pointerToCanvas(clientX, clientY, stageEl, canvasW, canvasH) {
  if (!stageEl) return { x: 0, y: 0 }
  const rect = stageEl.getBoundingClientRect()
  return {
    x: clamp(((clientX - rect.left) / rect.width) * canvasW, 0, canvasW),
    y: clamp(((clientY - rect.top) / rect.height) * canvasH, 0, canvasH),
  }
}

function placementFrameStyle(p, canvasW, canvasH, { layer = 0, rotation = 0, opacity = 1 } = {}) {
  return {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    opacity: opacity != null ? opacity : 1,
    zIndex: layer || 0,
  }
}

function InteractiveElementShell({
  el,
  canvasW,
  canvasH,
  selected,
  editable,
  locked,
  stageRef,
  allElements,
  onSelect,
  onPlacementLive,
  onPlacementCommit,
  onGuidesChange,
  onStartTextEdit,
  children,
}) {
  const p = el.placement || {}
  const dragRef = useRef(null)
  const lastPlacementRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      const drag = dragRef.current
      if (!drag || !stageRef?.current || locked) return
      const pt = pointerToCanvas(e.clientX, e.clientY, stageRef.current, canvasW, canvasH)
      const dx = pt.x - drag.originX
      const dy = pt.y - drag.originY
      const start = drag.startPlacement
      let next = { ...start }

      if (drag.mode === 'move') {
        next.x = clamp(start.x + dx, 0, canvasW - (start.width || 40))
        next.y = clamp(start.y + dy, 0, canvasH - (start.height || 40))
        const { guides, snapDx, snapDy } = computePptSmartGuides(
          {
            x: next.x,
            y: next.y,
            width: next.width,
            height: next.height,
          },
          allElements || [],
          { width: canvasW, height: canvasH },
          el.id
        )
        next.x += snapDx
        next.y += snapDy
        onGuidesChange?.(guides)
      } else if (drag.mode === 'resize') {
        next.width = clamp(start.width + dx, 40, canvasW - start.x)
        next.height = clamp(start.height + dy, 24, canvasH - start.y)
      }

      lastPlacementRef.current = next
      onPlacementLive?.(el.id, next)
    }

    const onUp = () => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      onGuidesChange?.([])
      onPlacementCommit?.(el.id, lastPlacementRef.current || drag.startPlacement)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [canvasW, canvasH, el.id, allElements, locked, onGuidesChange, onPlacementCommit, onPlacementLive, stageRef])

  const beginDrag = (e, mode) => {
    if (!editable || !selected || !stageRef?.current || locked) return
    e.preventDefault()
    e.stopPropagation()
    const origin = pointerToCanvas(
      e.clientX,
      e.clientY,
      stageRef.current,
      canvasW,
      canvasH
    )
    const startPlacement = {
      x: p.x || 0,
      y: p.y || 0,
      width: p.width || 100,
      height: p.height || 40,
      rotation: p.rotation || 0,
      opacity: p.opacity != null ? p.opacity : 1,
    }
    lastPlacementRef.current = startPlacement
    dragRef.current = {
      mode,
      originX: origin.x,
      originY: origin.y,
      startPlacement,
    }
  }

  const frameStyle = {
    ...placementFrameStyle(p, canvasW, canvasH, {
      layer: el.layer,
      rotation: p.rotation,
      opacity: p.opacity,
    }),
    outline: selected ? '2px solid #3B82F6' : undefined,
    outlineOffset: selected ? 2 : undefined,
    cursor: editable && selected && !locked ? 'move' : 'pointer',
    touchAction: 'none',
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-element-id={el.id}
      className={locked ? 'ppt-canvas-el-locked' : undefined}
      style={frameStyle}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(el.id)
      }}
      onDoubleClick={(e) => {
        if (!editable || locked || el.type !== 'text') return
        e.stopPropagation()
        onSelect?.(el.id)
        onStartTextEdit?.(el.id)
      }}
      onPointerDown={(e) => {
        if (!editable || !selected) return
        if (e.target.closest?.('.ppt-canvas-el-resize')) return
        if (e.target.closest?.('.ppt-text-display, .ppt-text-editable, .ppt-table-cell-input')) return
        beginDrag(e, 'move')
      }}
      onKeyDown={(e) => {
        if (
          e.target.closest?.('.ppt-text-editable, .ppt-table-cell-input, input, textarea') ||
          e.target?.isContentEditable
        ) {
          return
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(el.id)
        }
      }}
    >
      <div className="ppt-canvas-el-body">{children}</div>
      {selected && editable && (
        <span
          className="ppt-canvas-el-resize"
          onPointerDown={(e) => beginDrag(e, 'resize')}
          aria-hidden
        />
      )}
    </div>
  )
}

function SlideStage({
  slide,
  themeVisual,
  aspectRatio,
  selectedElementId,
  editingTextId,
  editable = false,
  smartGuides = [],
  onSelectElement,
  onPlacementLive,
  onPlacementCommit,
  onGuidesChange,
  onStartTextEdit,
  onEndTextEdit,
  onTableCellChange,
  onImageAuthError,
}) {
  const stageRef = useRef(null)
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const elements = (slide?.elements?.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url
  const palette = themeVisual?.palette || null
  const slideBgStyle = resolveSlideStageBackground(
    slide,
    themeVisual?.palette?.bg || themeVisual?.background || DEFAULT_SLIDE_BG,
    palette
  )

  useEffect(() => {
    logCanvasGreySuspects(slide, {
      canvasW: canvas.width,
      canvasH: canvas.height,
      label: 'SlideStage',
    })
  }, [slide, canvas.width, canvas.height])

  return (
    <div
      className="aig-editor-canvas aig-editor-canvas--stage"
      style={{
        ...slideBgStyle,
        aspectRatio: `${canvas.width} / ${canvas.height}`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectElement?.(null)
      }}
    >
      <div
        ref={stageRef}
        className="aig-slide-stage"
        style={{
          ...slideBgStyle,
          color: themeVisual.body,
        }}
      >
        <PptCanvasGuidesOverlay guides={smartGuides} canvasW={canvas.width} canvasH={canvas.height} />
        {hasElements ? (
          elements.map((el, i) => (
            <InteractiveElementShell
              key={el.id || `el-${i}`}
              el={el}
              canvasW={canvas.width}
              canvasH={canvas.height}
              selected={selectedElementId === el.id}
              editable={editable}
              locked={!!el.locked}
              stageRef={stageRef}
              allElements={elements}
              onSelect={onSelectElement}
              onStartTextEdit={onStartTextEdit}
              onPlacementLive={onPlacementLive}
              onPlacementCommit={onPlacementCommit}
              onGuidesChange={onGuidesChange}
            >
              <PptCanvasElement
                el={el}
                palette={palette}
                editable={
                  editable &&
                  (el.type === 'text' || el.type === 'table' || selectedElementId === el.id)
                }
                editingText={editingTextId === el.id}
                onStartTextEdit={() => {
                  onSelectElement?.(el.id)
                  onStartTextEdit?.(el.id)
                }}
                onEndTextEdit={(text) => onEndTextEdit?.(el.id, text)}
                onTableCellChange={(ri, ci, val) => onTableCellChange?.(el.id, ri, ci, val)}
                onTableActivate={() => onSelectElement?.(el.id)}
                onImageAuthError={onImageAuthError}
              />
            </InteractiveElementShell>
          ))
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
  viewOnly = false,
  initialDeck = null,
  canOpenInEditor = false,
  onOpenInEditor,
  generatingBanner = '',
  presenceToken = '',
  onContentUpdated,
}) {
  const workspaceId = workspaceIdProp || config.workspaceId
  const presentationId = presentationIdProp || config.presentationId
  const { user } = useAuth()

  const [localSlides, setLocalSlides] = useState(() => {
    if (viewOnly && initialDeck) {
      const fromDeck = extractSlidesFromPresentation(initialDeck)
      if (fromDeck.length) return fromDeck
    }
    return outline || []
  })
  const [showMinimap, setShowMinimap] = useState(true)
  const [deckStatus, setDeckStatus] = useState('READY')
  const [aspectRatio, setAspectRatio] = useState(config.screenSize || config.aspectRatio || '16:9')
  const [loading, setLoading] = useState(
    viewOnly ? !initialDeck : Boolean(workspaceId && presentationId)
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState(null)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [themeTokens, setThemeTokens] = useState(null)
  const [elementPresets, setElementPresets] = useState([])
  const [brandKits, setBrandKits] = useState([])
  const [brandKitOpen, setBrandKitOpen] = useState(false)
  const [applyingBrandKit, setApplyingBrandKit] = useState(false)
  const [deckTitle, setDeckTitle] = useState(config.title || 'Untitled Presentation')
  const [deckPackId, setDeckPackId] = useState(config.packId || null)
  const [addSlideOpen, setAddSlideOpen] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(null)
  const [canvasZoom, setCanvasZoom] = useState(100)
  const [smartGuides, setSmartGuides] = useState([])
  const [editingTextId, setEditingTextId] = useState(null)
  const [presentOpen, setPresentOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [viewOnlyNotice, setViewOnlyNotice] = useState(false)
  const [shareToken, setShareToken] = useState(() => presenceToken || '')
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)
  const [slideAiEditId, setSlideAiEditId] = useState(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [deckVariables, setDeckVariables] = useState([])
  const [slideStyles, setSlideStyles] = useState({
    headerFont: 'Inter',
    bodyFont: 'Inter',
    headerSize: 44,
    bodySize: 22,
  })
  const [multiSelectIds, setMultiSelectIds] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [layoutSchemaMap, setLayoutSchemaMap] = useState({})
  const brandKitMenuRef = useRef(null)
  const canvasSaveTimers = useRef({})
  const elementPatchTimers = useRef({})
  const imageRefreshInFlight = useRef(new Set())
  const layoutRepairPassRef = useRef('')
  const mainScrollRef = useRef(null)
  const slideContainerRefs = useRef({})

  const history = usePptEditorHistory()

  useEffect(() => {
    if (config.title) setDeckTitle(config.title)
  }, [config.title])

  useEffect(() => {
    if (viewOnly || !workspaceId) {
      setLayoutSchemaMap({})
      return
    }
    let cancelled = false
    fetchLayoutSchemaMap(workspaceId).then((map) => {
      if (!cancelled) setLayoutSchemaMap(map || {})
    })
    return () => {
      cancelled = true
    }
  }, [viewOnly, workspaceId])

  useEffect(() => {
    layoutRepairPassRef.current = ''
  }, [presentationId, layoutSchemaMap])

  const themeVisual = useMemo(
    () => resolveThemeVisual(themeTokens?.wizardColorThemeId || config.theme, themeTokens),
    [config.theme, themeTokens]
  )

  const themeCompileOptions = useMemo(
    () => buildThemeCompileOptions(themeTokens, { palette: themeVisual?.palette }),
    [themeTokens, themeVisual?.palette]
  )

  useEffect(() => {
    ensureThemeFontsLoaded(themeTokens)
  }, [themeTokens])

  useEffect(() => {
    if (!themeTokens?.fonts) return
    const { headerFont, bodyFont } = themeFontFamilies(themeTokens)
    setSlideStyles((prev) => ({
      ...prev,
      headerFont,
      bodyFont,
    }))
  }, [themeTokens])

  const isGenerating = String(deckStatus).toUpperCase() === 'GENERATING'
  const atDeckCap = localSlides.length >= PPT_CAPS.DECK_MAX_SLIDES
  const selectedSlide =
    localSlides.find((s) => s.id === selectedSlideId) || localSlides[0] || null
  const selectedElement =
    selectedSlide?.elements?.elements?.find((el) => el.id === selectedElementId) || null

  useEffect(() => {
    if (!selectedSlideId) return
    const node = slideContainerRefs.current[selectedSlideId]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedSlideId])
  const designFocus = (() => {
    const type = String(selectedElement?.type || '').toLowerCase()
    if (type) return type
    return selectedSlideId ? 'slide' : 'slide'
  })()
  const selectedElementCount = selectedSlide?.elements?.elements?.length || 0
  const atElementCap = selectedElementCount >= PPT_CAPS.ELEMENTS_PER_SLIDE
  const selectedSlideIndex = Math.max(
    0,
    localSlides.findIndex((s) => s.id === (selectedSlideId || selectedSlide?.id))
  )
  const askOwner = useCallback(() => {
    if (viewOnly) setViewOnlyNotice(true)
  }, [viewOnly])
  const { viewers, viewerCount, contentUpdatedAt } = usePptPresence({
    token: shareToken,
    workspaceId: viewOnly ? undefined : workspaceId,
    presentationId: viewOnly ? undefined : presentationId,
    slideIndex: selectedSlideIndex,
    enabled: viewOnly
      ? Boolean(shareToken) && !loading
      : Boolean(workspaceId && presentationId) && !loading,
    onShareToken: setShareToken,
  })
  const selfViewer = !viewOnly && user
    ? {
        id: user.id || user._id || user.userId || 'owner',
        userId: user.id || user._id || user.userId,
        email: user.email,
        viewerSessionId: getOrCreateViewerSessionId(),
        displayName: user.name || user.displayName || user.fullName || user.email || 'You',
        avatarUrl: user.profileImage || user.avatarUrl || user.avatar || user.photoUrl,
        slideIndex: selectedSlideIndex,
      }
    : null

  const applySlideUpdate = useCallback((slidePayload, indexHint = 0) => {
    if (!slidePayload) return
    const normalized = normalizeSlideForEditor(slidePayload, indexHint, aspectRatio)
    setLocalSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === normalized.id)
      if (idx === -1) return prev
      const current = prev[idx]
      const currentEls = current?.elements?.elements || []
      const incomingEls = normalized?.elements?.elements || []
      const mergedElements =
        incomingEls.length > 0
          ? incomingEls
          : currentEls.length > 0
            ? currentEls
            : incomingEls

      const next = [...prev]
      next[idx] = {
        ...current,
        ...normalized,
        backgroundColor:
          normalized.backgroundColor ?? current.backgroundColor ?? DEFAULT_SLIDE_BG,
        backgroundGradientStart:
          normalized.backgroundGradientStart ?? current.backgroundGradientStart,
        backgroundGradientEnd:
          normalized.backgroundGradientEnd ?? current.backgroundGradientEnd,
        backgroundImage: normalized.backgroundImage ?? current.backgroundImage,
        backgroundImageFit: normalized.backgroundImageFit ?? current.backgroundImageFit,
        backgroundImageElementId:
          normalized.backgroundImageElementId ?? current.backgroundImageElementId,
        elements: {
          ...(current?.elements || {}),
          ...(normalized?.elements || {}),
          elements: mergedElements,
        },
      }
      return next
    })
  }, [aspectRatio])

  const reloadPresentation = useCallback(async () => {
    if (viewOnly) return null
    if (!workspaceId || !presentationId) return
    const data = await presentationService.getPresentation(workspaceId, presentationId)
    let slides = extractSlidesFromPresentation(data)
    const nextAspect =
      data?.aspectRatio ||
      data?.deck?.aspectRatio ||
      data?.presentation?.aspectRatio ||
      config.screenSize ||
      config.aspectRatio ||
      '16:9'
    const resolvedAspect = nextAspect === '9:16' ? '16:9' : nextAspect
    setAspectRatio(resolvedAspect)

    const deckStatusRaw =
      data?.deck?.status ||
      data?.status ||
      data?.presentation?.deck?.status ||
      data?.presentation?.status ||
      'READY'
    const generating = String(deckStatusRaw).toUpperCase() === 'GENERATING'
    const tokens =
      data?.deck?.themeTokens ||
      data?.themeTokens ||
      data?.presentation?.deck?.themeTokens ||
      null

    if (!generating && Object.keys(layoutSchemaMap).length) {
      const packId = extractDeckPackId(data) || deckPackId
      const didRepair = await repairPresentationLayoutSlides({
        workspaceId,
        presentationId,
        slides,
        layoutSchemaMap,
        aspectRatio: resolvedAspect,
        palette: tokens?.palette || null,
        themeTokens: tokens,
        deckPackId: packId,
      })
      if (didRepair) {
        const refreshed = await presentationService.getPresentation(workspaceId, presentationId)
        slides = extractSlidesFromPresentation(refreshed)
      }
    }

    setLocalSlides(slides)
    setThemeTokens(tokens)
    setDeckStatus(deckStatusRaw)
    setDeckPackId(extractDeckPackId(data) || deckPackId)
    if (data?.title || data?.presentation?.title) {
      setDeckTitle(data?.title || data?.presentation?.title)
    }
    if (slides[0]?.id) setSelectedSlideId((prev) => prev || slides[0].id)
    return data
  }, [workspaceId, presentationId, config.screenSize, config.aspectRatio, layoutSchemaMap, viewOnly])

  useEffect(() => {
    if (viewOnly) return
    if (!workspaceId || !presentationId || !localSlides.length) return
    if (!Object.keys(layoutSchemaMap).length) return
    if (isGenerating) return

    const passKey = `${presentationId}:${localSlides.length}:${deckStatus}`
    if (layoutRepairPassRef.current === passKey) return

    let cancelled = false
    ;(async () => {
      const didRepair = await repairPresentationLayoutSlides({
        workspaceId,
        presentationId,
        slides: localSlides,
        layoutSchemaMap,
        aspectRatio,
        palette: themeTokens?.palette || themeVisual?.palette || null,
        themeTokens,
        deckPackId,
      })
      if (cancelled) return
      layoutRepairPassRef.current = passKey
      if (didRepair) {
        const data = await presentationService.getPresentation(workspaceId, presentationId)
        if (!cancelled) {
          setLocalSlides(extractSlidesFromPresentation(data))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    workspaceId,
    presentationId,
    localSlides,
    layoutSchemaMap,
    isGenerating,
    deckStatus,
    aspectRatio,
    themeTokens,
    themeVisual?.palette,
    viewOnly,
    deckPackId,
  ])

  const refreshSlide = useCallback(
    async (slideId) => {
      if (!workspaceId || !presentationId || !slideId) return null
      const raw = await presentationService.getSlide(workspaceId, presentationId, slideId)
      const slide = extractSlideFromMutation(raw) || raw
      applySlideUpdate(slide)
      return slide
    },
    [workspaceId, presentationId, applySlideUpdate]
  )

  const queueCanvasSave = useCallback(
    (slideId, canvasDoc) => {
      if (!workspaceId || !presentationId || !slideId || isGenerating || viewOnly) return
      if (canvasSaveTimers.current[slideId]) {
        clearTimeout(canvasSaveTimers.current[slideId])
      }
      canvasSaveTimers.current[slideId] = setTimeout(async () => {
        try {
          const result = await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            slideId,
            canvasDoc
          )
          const slide = extractSlideFromMutation(result)
          if (slide) applySlideUpdate(slide)
        } catch (err) {
          if (err instanceof PresentationConflictError) {
            setError('Presentation is generating — canvas edits are locked.')
          } else {
            setError(err.message || 'Failed to save canvas')
          }
        }
      }, CANVAS_SAVE_DEBOUNCE_MS)
    },
    [workspaceId, presentationId, isGenerating, viewOnly, applySlideUpdate]
  )

  const pushHistorySnapshot = useCallback(() => {
    history.pushSnapshot({
      slides: localSlides,
      selectedSlideId,
      selectedElementId,
    })
  }, [history, localSlides, selectedSlideId, selectedElementId])

  const restoreHistorySnapshot = useCallback((snapshot) => {
    if (!snapshot) return
    setLocalSlides(snapshot.slides)
    setSelectedSlideId(snapshot.selectedSlideId)
    setSelectedElementId(snapshot.selectedElementId)
  }, [])

  const elementMutations = usePptElementMutations({
    localSlides,
    setLocalSlides,
    selectedSlideId,
    selectedElementId,
    setSelectedElementId,
    aspectRatio,
    workspaceId,
    presentationId,
    isGenerating,
    presentationService,
    applySlideUpdate,
    queueCanvasSave,
    pushHistory: pushHistorySnapshot,
  })

  const handleUndo = useCallback(() => {
    restoreHistorySnapshot(
      history.undo({ slides: localSlides, selectedSlideId, selectedElementId })
    )
  }, [history, localSlides, selectedSlideId, selectedElementId, restoreHistorySnapshot])

  const handleRedo = useCallback(() => {
    restoreHistorySnapshot(
      history.redo({ slides: localSlides, selectedSlideId, selectedElementId })
    )
  }, [history, localSlides, selectedSlideId, selectedElementId, restoreHistorySnapshot])

  const handleChangeElementContent = useCallback(
    (elementId, content) => elementMutations.patchElement(elementId, { content }),
    [elementMutations]
  )

  const handleChangeElementPlacement = useCallback(
    (elementId, placement) => elementMutations.patchElement(elementId, { placement }),
    [elementMutations]
  )

  const handleEndTextEdit = useCallback(
    (elementId, text) => {
      setEditingTextId(null)
      const el = selectedSlide?.elements?.elements?.find((e) => e.id === elementId)
      elementMutations.patchElement(elementId, {
        content: { ...(el?.content || {}), text },
      })
    },
    [elementMutations, selectedSlide]
  )

  const handleTableCellChange = useCallback(
    (elementId, rowIndex, colIndex, value) => {
      const el = selectedSlide?.elements?.elements?.find((e) => e.id === elementId)
      if (!el) return
      const baseCells = Array.isArray(el.content?.cells)
        ? el.content.cells
        : Array.isArray(el.content?.rows)
          ? el.content.rows
          : []
      const cells = baseCells.map((row, ri) =>
        ri === rowIndex ? (row || []).map((cell, ci) => (ci === colIndex ? value : cell)) : [...(row || [])]
      )
      elementMutations.patchElement(elementId, {
        content: {
          ...el.content,
          cells,
          rows: cells.length,
          cols: cells[0]?.length || 0,
        },
      })
    },
    [selectedSlide, elementMutations]
  )

  const handleQuickCommand = useCallback(
    (cmd) => {
      const ids = multiSelectIds.length ? multiSelectIds : [selectedElementId].filter(Boolean)
      switch (cmd) {
        case 'undo':
          if (viewOnly) { askOwner(); break }
          handleUndo()
          break
        case 'redo':
          if (viewOnly) { askOwner(); break }
          handleRedo()
          break
        case 'duplicate':
          if (viewOnly) { askOwner(); break }
          elementMutations.duplicateElement()
          break
        case 'group':
          if (viewOnly) { askOwner(); break }
          elementMutations.groupSelection(ids)
          break
        case 'ungroup':
          if (viewOnly) { askOwner(); break }
          elementMutations.ungroupSelection()
          break
        case 'lock':
          if (viewOnly) { askOwner(); break }
          elementMutations.toggleLock()
          break
        case 'present':
          setPresentOpen(true)
          break
        case 'share':
          if (viewOnly) { askOwner(); break }
          setShareOpen(true)
          break
        case 'export':
          if (viewOnly) { askOwner(); break }
          setExportModalOpen(true)
          break
        case 'smart-tidy':
          if (viewOnly) { askOwner(); break }
          elementMutations.smartTidy(ids)
          break
        case 'smart-swap':
          if (viewOnly) { askOwner(); break }
          elementMutations.smartSwap()
          break
        case 'zoom-in':
          setCanvasZoom((z) => Math.min(200, z + 10))
          break
        case 'zoom-out':
          setCanvasZoom((z) => Math.max(40, z - 10))
          break
        case 'zoom-fit':
          setCanvasZoom(100)
          break
        default:
          break
      }
    },
    [handleUndo, handleRedo, elementMutations, multiSelectIds, selectedElementId, viewOnly, askOwner]
  )

  const handleCropApply = useCallback(
    ({ fit, opacity }) => {
      if (!selectedElementId || !selectedElement) return
      elementMutations.patchElement(selectedElementId, {
        content: { ...selectedElement.content, fit, opacity },
        placement: {
          ...selectedElement.placement,
          opacity: opacity ?? selectedElement.placement?.opacity,
        },
      })
    },
    [selectedElementId, selectedElement, elementMutations]
  )

  const handleBackgroundGradientChange = useCallback(
    ({ start, end }) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId) return
      setLocalSlides((prev) =>
        prev.map((s) =>
          s.id === slideId
            ? {
                ...s,
                backgroundGradientStart: start ?? undefined,
                backgroundGradientEnd: end ?? undefined,
                ...(start == null && end == null
                  ? { backgroundGradientStart: undefined, backgroundGradientEnd: undefined }
                  : {}),
              }
            : s
        )
      )
    },
    [selectedSlideId, localSlides]
  )

  const handleBackgroundColorChange = useCallback(
    (color) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId) return
      setLocalSlides((prev) =>
        prev.map((s) =>
          s.id === slideId
            ? {
                ...s,
                backgroundColor: color,
                backgroundGradientStart: undefined,
                backgroundGradientEnd: undefined,
                backgroundImage: undefined,
                backgroundImageFit: undefined,
                backgroundImageElementId: undefined,
                elements: buildCanvasDoc(s, {
                  aspectRatio,
                  elements: (s.elements?.elements || []).map((el) =>
                    el.content?.useAsBackground
                      ? { ...el, content: { ...el.content, useAsBackground: false } }
                      : el
                  ),
                }),
              }
            : s
        )
      )
      if (workspaceId && presentationId) {
        const slide = localSlides.find((s) => s.id === slideId)
        const nextDoc = buildCanvasDoc(slide, {
          aspectRatio,
          elements: (slide?.elements?.elements || []).map((el) =>
            el.content?.useAsBackground
              ? { ...el, content: { ...el.content, useAsBackground: false } }
              : el
          ),
        })
        presentationService
          .patchSlide(workspaceId, presentationId, slideId, {
            backgroundColor: color,
            backgroundImage: null,
            backgroundImageFit: null,
            backgroundImageElementId: null,
            backgroundGradientStart: null,
            backgroundGradientEnd: null,
          })
          .catch(() => {})
        queueCanvasSave(slideId, nextDoc)
      }
    },
    [selectedSlideId, localSlides, workspaceId, presentationId, aspectRatio, queueCanvasSave]
  )

  const handleToggleImageAsBackground = useCallback(
    (elementId, enabled) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || !elementId) return

      const slide = localSlides.find((s) => s.id === slideId)
      const el = slide?.elements?.elements?.find((item) => item.id === elementId)
      if (!el || (el.type !== 'image' && el.type !== 'icon')) return

      const imageUrl = el.content?.url || el.content?.src || el.content?.thumbnailUrl
      if (enabled && !imageUrl) {
        setError('Add an image before using it as the slide background.')
        return
      }

      const nextElements = (slide?.elements?.elements || []).map((item) => {
        if (item.id === elementId) {
          return {
            ...item,
            content: { ...item.content, useAsBackground: enabled },
          }
        }
        if (enabled && item.content?.useAsBackground) {
          return { ...item, content: { ...item.content, useAsBackground: false } }
        }
        return item
      })
      const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: nextElements })

      const slidePatch = enabled
        ? {
            backgroundImage: imageUrl,
            backgroundImageFit: el.content?.fit || 'cover',
            backgroundImageElementId: elementId,
            backgroundGradientStart: undefined,
            backgroundGradientEnd: undefined,
          }
        : slide?.backgroundImageElementId === elementId
          ? {
              backgroundImage: undefined,
              backgroundImageFit: undefined,
              backgroundImageElementId: undefined,
            }
          : {}

      setLocalSlides((prev) =>
        prev.map((s) =>
          s.id === slideId ? { ...s, ...slidePatch, elements: nextDoc } : s
        )
      )

      if (!workspaceId || !presentationId) return

      presentationService
        .patchSlide(workspaceId, presentationId, slideId, {
          ...(enabled
            ? {
                backgroundImage: imageUrl,
                backgroundImageFit: el.content?.fit || 'cover',
                backgroundImageElementId: elementId,
                backgroundGradientStart: null,
                backgroundGradientEnd: null,
              }
            : slide?.backgroundImageElementId === elementId
              ? {
                  backgroundImage: null,
                  backgroundImageFit: null,
                  backgroundImageElementId: null,
                }
              : {}),
        })
        .catch(() => {})

      queueCanvasSave(slideId, nextDoc)
    },
    [
      selectedSlideId,
      localSlides,
      aspectRatio,
      workspaceId,
      presentationId,
      queueCanvasSave,
    ]
  )

  const handleChangeElementContentWithBackground = useCallback(
    (elementId, content) => {
      handleChangeElementContent(elementId, content)
      const slide = localSlides.find((s) => s.id === selectedSlideId)
      if (slide?.backgroundImageElementId !== elementId) return
      if (content?.fit && content.fit !== slide.backgroundImageFit) {
        setLocalSlides((prev) =>
          prev.map((s) =>
            s.id === selectedSlideId ? { ...s, backgroundImageFit: content.fit } : s
          )
        )
        if (workspaceId && presentationId && selectedSlideId) {
          presentationService
            .patchSlide(workspaceId, presentationId, selectedSlideId, {
              backgroundImageFit: content.fit,
            })
            .catch(() => {})
        }
      }
    },
    [
      handleChangeElementContent,
      localSlides,
      selectedSlideId,
      workspaceId,
      presentationId,
    ]
  )

  const handlePlacementLive = useCallback(
    (slideId, elementId, placement) => {
      setLocalSlides((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) return s
          const elements = (s.elements?.elements || []).map((el) =>
            el.id === elementId ? { ...el, placement: { ...el.placement, ...placement } } : el
          )
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
      )
    },
    [aspectRatio]
  )

  const handlePlacementCommit = useCallback(
    (slideId, elementId, placement) => {
      if (!workspaceId || !presentationId || isGenerating) return
      const key = `${slideId}:${elementId}`
      if (elementPatchTimers.current[key]) {
        clearTimeout(elementPatchTimers.current[key])
      }
      elementPatchTimers.current[key] = setTimeout(async () => {
        try {
          const result = await presentationService.updateElement(
            workspaceId,
            presentationId,
            slideId,
            elementId,
            { placement }
          )
          const slideFromApi = extractSlideFromMutation(result)
          if (slideFromApi) applySlideUpdate(slideFromApi)
        } catch (err) {
          if (err instanceof PresentationConflictError) {
            setError('Presentation is generating — canvas edits are locked.')
            return
          }
          const slide = localSlides.find((s) => s.id === slideId)
          if (!slide) return
          const elements = (slide.elements?.elements || []).map((el) =>
            el.id === elementId ? { ...el, placement: { ...el.placement, ...placement } } : el
          )
          queueCanvasSave(slideId, buildCanvasDoc(slide, { aspectRatio, elements }))
        }
      }, CANVAS_SAVE_DEBOUNCE_MS)
    },
    [
      workspaceId,
      presentationId,
      isGenerating,
      localSlides,
      aspectRatio,
      applySlideUpdate,
      queueCanvasSave,
    ]
  )

  useEffect(() => {
    if (!workspaceId || !presentationId) {
      setLocalSlides(outline || [])
      setLoading(false)
      return undefined
    }
    if (viewOnly) return undefined

    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        await reloadPresentation()
        const [kits, presetsPayload] = await Promise.all([
          brandKitService.list(workspaceId).catch(() => []),
          presentationService.listElementPresets(workspaceId).catch(() => null),
        ])
        if (cancelled) return
        setBrandKits(kits || [])
        if (presetsPayload) {
          setElementPresets(normalizeElementPresets(presetsPayload).presets)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load presentation')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      Object.values(canvasSaveTimers.current).forEach((t) => clearTimeout(t))
      Object.values(elementPatchTimers.current).forEach((t) => clearTimeout(t))
    }
  }, [workspaceId, presentationId, outline, reloadPresentation, viewOnly])

  useEffect(() => {
    if (presenceToken) setShareToken(presenceToken)
  }, [presenceToken])

  useEffect(() => {
    if (viewOnly || !workspaceId || !presentationId) return undefined
    let cancelled = false
    presentationService
      .getShareLink(workspaceId, presentationId)
      .then((data) => {
        if (cancelled) return
        const share = data?.share || data || {}
        const token = extractShareToken(share.token || data?.token || share.url || data?.url)
        if (token) setShareToken(token)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [viewOnly, workspaceId, presentationId])

  useEffect(() => {
    if (!viewOnly || !initialDeck) return
    const slides = extractSlidesFromPresentation(initialDeck)
    const nextAspect =
      initialDeck?.aspectRatio ||
      initialDeck?.deck?.aspectRatio ||
      initialDeck?.presentation?.aspectRatio ||
      config.screenSize ||
      config.aspectRatio ||
      '16:9'
    setAspectRatio(nextAspect === '9:16' ? '16:9' : nextAspect)
    setLocalSlides(slides)
    setThemeTokens(
      initialDeck?.deck?.themeTokens ||
        initialDeck?.themeTokens ||
        initialDeck?.presentation?.deck?.themeTokens ||
        null
    )
    setDeckStatus(
      initialDeck?.deck?.status ||
        initialDeck?.status ||
        initialDeck?.presentation?.deck?.status ||
        initialDeck?.presentation?.status ||
        'READY'
    )
    if (initialDeck?.title || initialDeck?.presentation?.title) {
      setDeckTitle(initialDeck?.title || initialDeck?.presentation?.title)
    }
    if (slides[0]?.id) setSelectedSlideId((prev) => prev || slides[0].id)
    setLoading(false)
  }, [viewOnly, initialDeck, config.screenSize, config.aspectRatio])

  useEffect(() => {
    if (contentUpdatedAt) onContentUpdated?.(contentUpdatedAt)
  }, [contentUpdatedAt, onContentUpdated])

  useEffect(() => {
    const onDocClick = (e) => {
      if (brandKitMenuRef.current && !brandKitMenuRef.current.contains(e.target)) {
        setBrandKitOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleApplyBrandKit = async (brandKitId) => {
    if (viewOnly) {
      askOwner()
      return
    }
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
    const layoutId = options.layoutId || null
    const layoutSchema = options.schema || null
    const title = seed?.title || options.name || 'Blank Slide'
    const description = seed?.description ?? 'Double click to add content.'
    let seedElements = Array.isArray(seed?.elements) ? seed.elements : []

    if (!workspaceId || !presentationId) {
      const canvas = resolveCanvasSize(null, aspectRatio)
      const schema =
        layoutSchema ||
        (layoutId ? resolveLayoutSchemaById(layoutId, layoutSchemaMap) : null)
      if (!seedElements.length && layoutSchemaHasCanvasElements(schema)) {
        seedElements = resolveLayoutCanvasElementsDoc(schema)?.elements || []
      } else if (!seedElements.length && schema?.slots?.length) {
        seedElements = compileDeckLayoutToElements(schema, {
          canvas,
          ...themeCompileOptions,
          slideTitle: title,
        })
      }
      const newSlide = {
        id: `new-slide-${Date.now()}`,
        title,
        description,
        layoutId: layoutId || schema?.layout_id || null,
        elements: {
          version: 1,
          canvas,
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
        ...(layoutId ? { layoutId } : {}),
      })
      const newSlideId =
        created?.id ||
        created?.slideId ||
        created?.slide?.id ||
        created?._id ||
        null

      let mergeFromElements = []
      const hasSlotLayout = Boolean(layoutSchema?.slots?.length)
      const hasCanvasLayout = layoutSchemaHasCanvasElements(layoutSchema)
      const hasLayoutTarget = templateId || layoutId || hasSlotLayout || hasCanvasLayout

      if (templateId && newSlideId) {
        try {
          const applyResult = await presentationService.applyLayout(
            workspaceId,
            presentationId,
            newSlideId,
            templateId
          )
          const appliedSlide = extractSlideFromMutation(applyResult)
          mergeFromElements = appliedSlide?.elements?.elements || []
        } catch {
          // Backend apply-layout may be incomplete — client compile below is the source of truth.
        }
      }

      if (seedElements.length && newSlideId) {
        try {
          const canvasDoc = buildCanvasDoc(
            { elements: { version: 1, elements: seedElements } },
            { aspectRatio, elements: seedElements }
          )
          await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            newSlideId,
            canvasDoc
          )
        } catch {
          // Keep slide even if seed canvas fails
        }
      } else if (hasLayoutTarget && newSlideId) {
        try {
          await applyCompiledLayoutToSlide({
            workspaceId,
            presentationId,
            slideId: newSlideId,
            templateId,
            layoutId,
            schema: layoutSchema,
            layoutSchemaMap,
            aspectRatio,
            ...themeCompileOptions,
            slideTitle: title,
            mergeFromElements,
          })
        } catch (err) {
          setError(err.message || 'Failed to apply layout structure')
        }
      }

      await reloadPresentation()

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
    let index = addAfterIndex == null ? localSlides.length - 1 : addAfterIndex

    if (pick?.source === 'pack-all' && Array.isArray(pick.slides) && pick.slides.length) {
      let added = 0
      for (const slidePick of pick.slides) {
        if (localSlides.length + added >= PPT_CAPS.DECK_MAX_SLIDES) break
        await handleAddSlide(index, {
          templateId: slidePick.layoutTemplateId || null,
          layoutId: slidePick.layoutId || null,
          schema: slidePick.schema || null,
          name: slidePick.name || 'Slide',
        })
        index += 1
        added += 1
      }
      return
    }

    if (pick?.source === 'blank') {
      await handleAddSlide(index, { name: pick.name || 'Blank slide' })
      return
    }
    if (pick?.source === 'layout' || pick?.source === 'template') {
      await handleAddSlide(index, {
        templateId: pick.templateId,
        layoutId: pick.layoutId || null,
        schema: pick.schema || null,
        name: pick.name || 'Slide',
      })
      return
    }
    if (pick?.source === 'pack') {
      await handleAddSlide(index, {
        templateId: pick.layoutTemplateId || null,
        layoutId: pick.layoutId || null,
        schema: pick.schema || null,
        name: pick.name || 'Slide',
        seed: pick.seed || null,
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

  const handleSlideAiEdit = async (slide, { prompt, actionId, target = 'full' } = {}) => {
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
        target,
        overwriteManualEdits,
        ...(prompt ? { prompt } : {}),
        ...(actionId ? { action: actionId } : {}),
      })
      await presentationService.pollUntilReady(workspaceId, presentationId, {
        intervalMs: 2000,
      })
      await reloadPresentation()
      setSlideAiEditId(null)
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Cannot overwrite — confirm overwrite or wait for generation to finish.')
      } else if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits')
      } else {
        setError(err.message || 'AI edit failed')
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
    const placement = normalizeElementPlacement(
      payload.placement ||
        payload.defaultPlacement ||
        PPT_DEFAULT_PLACEMENTS[type] ||
        PPT_DEFAULT_PLACEMENTS.text,
      resolveCanvasSize(slide, aspectRatio)
    )
    const content = { ...(payload.content || {}) }
    if (type === 'text' && !content.color && !content.colorRole) {
      content.color = DEFAULT_TEXT_COLOR
    }
    if ((type === 'image' || type === 'icon') && !content.url && content.src) {
      content.url = content.src
    }
    if ((type === 'image' || type === 'icon') && content.url && !content.src) {
      content.src = content.url
    }

    const localEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content,
      placement,
      layer: existing.length + 1,
      ...(payload.presetId ? { presetId: payload.presetId } : {}),
      ...(payload.role ? { role: payload.role } : {}),
    }
    const optimisticDoc = buildCanvasDoc(slide, {
      aspectRatio,
      elements: [...existing, localEl],
    })

    setSelectedSlideId(slideId)
    setSelectedElementId(localEl.id)
    setError('')
    setLocalSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? { ...s, elements: optimisticDoc, backgroundColor: s.backgroundColor || DEFAULT_SLIDE_BG }
          : s
      )
    )

    if (!workspaceId || !presentationId) return

    setBusy(true)
    try {
      const body =
        payload.presetId && !payload.content && !payload.placement
          ? { presetId: payload.presetId }
          : {
              type,
              placement,
              content,
              layer: existing.length + 1,
              ...(payload.presetId ? { presetId: payload.presetId } : {}),
              ...(payload.role ? { role: payload.role } : {}),
            }

      const result = await presentationService.insertElement(
        workspaceId,
        presentationId,
        slideId,
        body
      )
      const slideFromApi = extractSlideFromMutation(result)
      const elementFromApi = extractElementFromMutation(result)
      if (elementFromApi?.id) {
        setLocalSlides((prev) =>
          prev.map((s) => {
            if (s.id !== slideId) return s
            const els = (s.elements?.elements || []).map((el) =>
              el.id === localEl.id ? { ...el, ...elementFromApi, id: elementFromApi.id } : el
            )
            const hasServerEl = els.some((el) => el.id === elementFromApi.id)
            const nextEls = hasServerEl
              ? els
              : [...els.filter((el) => el.id !== localEl.id), elementFromApi]
            return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements: nextEls }) }
          })
        )
        setSelectedElementId(elementFromApi.id)
      }
      if (slideFromApi) {
        applySlideUpdate(slideFromApi)
      } else if (!elementFromApi?.id) {
        await refreshSlide(slideId)
      }
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Presentation is generating — edits are locked until it finishes.')
      } else if (err?.status === 400) {
        setError(err.message || `Max ${PPT_CAPS.ELEMENTS_PER_SLIDE} elements per slide`)
      } else {
        // Fallback: full canvas replace so rich local content is not lost
        try {
          const localEl = {
            id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            content,
            placement,
            layer: existing.length + 1,
            ...(payload.presetId ? { presetId: payload.presetId } : {}),
          }
          const canvasDoc = buildCanvasDoc(slide, {
            aspectRatio,
            elements: [...existing, localEl],
          })
          const saved = await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            slideId,
            canvasDoc
          )
          const slideFromApi = extractSlideFromMutation(saved)
          if (slideFromApi) applySlideUpdate(slideFromApi)
          else await refreshSlide(slideId)
          setSelectedElementId(localEl.id)
        } catch (saveErr) {
          setError(saveErr.message || err.message || 'Failed to insert element')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteElement = useCallback(async () => {
    const slideId = selectedSlideId || localSlides[0]?.id
    const elementId = selectedElementId
    if (!slideId || !elementId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const existing = slide?.elements?.elements || []
    const nextElements = existing.filter((el) => el.id !== elementId)
    const clearingBackground = slide?.backgroundImageElementId === elementId
    const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: nextElements })
    setLocalSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? {
              ...s,
              elements: nextDoc,
              ...(clearingBackground
                ? {
                    backgroundImage: undefined,
                    backgroundImageFit: undefined,
                    backgroundImageElementId: undefined,
                  }
                : {}),
            }
          : s
      )
    )
    setSelectedElementId(null)

    if (!workspaceId || !presentationId) return

    if (clearingBackground) {
      presentationService
        .patchSlide(workspaceId, presentationId, slideId, {
          backgroundImage: null,
          backgroundImageFit: null,
          backgroundImageElementId: null,
        })
        .catch(() => {})
    }

    try {
      const result = await presentationService.deleteElement(
        workspaceId,
        presentationId,
        slideId,
        elementId
      )
      const slideFromApi = extractSlideFromMutation(result)
      if (slideFromApi) applySlideUpdate(slideFromApi)
    } catch (err) {
      setError(err.message || 'Failed to delete element')
      await refreshSlide(slideId).catch(() => {})
    }
  }, [
    selectedSlideId,
    selectedElementId,
    localSlides,
    isGenerating,
    aspectRatio,
    workspaceId,
    presentationId,
    applySlideUpdate,
    refreshSlide,
  ])

  const handleReorderSelected = useCallback(
    async (direction) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      const elementId = selectedElementId
      if (!slideId || !elementId || isGenerating) return

      const slide = localSlides.find((s) => s.id === slideId)
      const existing = [...(slide?.elements?.elements || [])]
      const idx = existing.findIndex((el) => el.id === elementId)
      if (idx < 0) return
      const swapWith = direction === 'forward' ? idx + 1 : idx - 1
      if (swapWith < 0 || swapWith >= existing.length) return
      ;[existing[idx], existing[swapWith]] = [existing[swapWith], existing[idx]]
      const elementIds = existing.map((el) => el.id)
      const nextDoc = buildCanvasDoc(slide, {
        aspectRatio,
        elements: existing.map((el, i) => ({ ...el, layer: i + 1 })),
      })
      setLocalSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, elements: nextDoc } : s))
      )

      if (!workspaceId || !presentationId) return
      try {
        const result = await presentationService.reorderElements(
          workspaceId,
          presentationId,
          slideId,
          elementIds
        )
        const slideFromApi = extractSlideFromMutation(result)
        if (slideFromApi) applySlideUpdate(slideFromApi)
      } catch (err) {
        setError(err.message || 'Failed to reorder elements')
        await refreshSlide(slideId).catch(() => {})
      }
    },
    [
      selectedSlideId,
      selectedElementId,
      localSlides,
      isGenerating,
      aspectRatio,
      workspaceId,
      presentationId,
      applySlideUpdate,
      refreshSlide,
    ]
  )

  const handleImageAuthError = useCallback(
    async (elementId) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || !workspaceId || !presentationId) return
      const key = `${slideId}:${elementId || '*'}`
      if (imageRefreshInFlight.current.has(key)) return
      imageRefreshInFlight.current.add(key)
      try {
        await refreshSlide(slideId)
      } catch {
        // ignore refresh failures; image stays dimmed by browser
      } finally {
        imageRefreshInFlight.current.delete(key)
      }
    },
    [selectedSlideId, localSlides, workspaceId, presentationId, refreshSlide]
  )

  const handleMediaAttached = useCallback(
    async (result) => {
      const slide = extractSlideFromMutation(result)
      if (slide) {
        applySlideUpdate(slide)
        return
      }
      const slideId = selectedSlideId || localSlides[0]?.id
      if (slideId) await refreshSlide(slideId)
    },
    [applySlideUpdate, refreshSlide, selectedSlideId, localSlides]
  )

  const handleApplyLayout = useCallback(
    async (templateId) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || !templateId || !workspaceId || !presentationId || isGenerating) return
      setBusy(true)
      setError('')
      try {
        const slide = localSlides.find((s) => s.id === slideId)
        let mergeFromElements = slide?.elements?.elements || []

        try {
          const result = await presentationService.applyLayout(
            workspaceId,
            presentationId,
            slideId,
            templateId
          )
          const updated = extractSlideFromMutation(result)
          if (updated?.elements?.elements?.length) {
            mergeFromElements = updated.elements.elements
          }
        } catch {
          // Client compile below replaces broken backend layout structure.
        }

        const layoutId = slide?.layoutId || null

        await applyCompiledLayoutToSlide({
          workspaceId,
          presentationId,
          slideId,
          templateId,
          layoutId,
          layoutSchemaMap,
          aspectRatio,
          ...themeCompileOptions,
          slideTitle: slide?.title || '',
          mergeFromElements,
        })

        await refreshSlide(slideId)
        setSelectedElementId(null)
      } catch (err) {
        if (err instanceof PresentationConflictError) {
          setError('Cannot apply layout while generating.')
        } else {
          setError(err.message || 'Failed to apply layout')
        }
      } finally {
        setBusy(false)
      }
    },
    [
      selectedSlideId,
      localSlides,
      workspaceId,
      presentationId,
      isGenerating,
      refreshSlide,
      layoutSchemaMap,
      aspectRatio,
      themeVisual?.palette,
    ]
  )

  useEffect(() => {
    const onKey = (e) => {
      const tag = String(e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return

      const mod = e.ctrlKey || e.metaKey

      if (viewOnly) {
        const allowed =
          (mod && (e.key === '=' || e.key === '+' || e.key === '-')) ||
          (mod && e.key === 'Enter')
        if (!allowed && (mod || e.key === 'Delete' || e.key === 'Backspace' || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '[', ']'].includes(e.key))) {
          e.preventDefault()
          askOwner()
        }
        if (mod && e.key === 'Enter') {
          e.preventDefault()
          setPresentOpen(true)
        }
        if (mod && (e.key === '=' || e.key === '+')) {
          e.preventDefault()
          setCanvasZoom((z) => Math.min(200, z + 10))
        }
        if (mod && e.key === '-') {
          e.preventDefault()
          setCanvasZoom((z) => Math.max(40, z - 10))
        }
        return
      }

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }
      if ((mod && e.key === 'y') || (mod && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        handleRedo()
        return
      }
      if (mod && e.key === 'd') {
        e.preventDefault()
        elementMutations.duplicateElement()
        return
      }
      if (mod && e.key === 'g' && !e.shiftKey) {
        e.preventDefault()
        elementMutations.groupSelection(
          multiSelectIds.length ? multiSelectIds : [selectedElementId].filter(Boolean)
        )
        return
      }
      if (mod && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        elementMutations.ungroupSelection()
        return
      }
      if (mod && e.key === 'l') {
        e.preventDefault()
        elementMutations.toggleLock()
        return
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault()
        setPresentOpen(true)
        return
      }
      if (mod && e.key === 'k') {
        e.preventDefault()
        setQuickMenuOpen(true)
        return
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        setCanvasZoom((z) => Math.min(200, z + 10))
        return
      }
      if (mod && e.key === '-') {
        e.preventDefault()
        setCanvasZoom((z) => Math.max(40, z - 10))
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault()
        handleDeleteElement()
      }
      if (e.key === ']' && selectedElementId) {
        e.preventDefault()
        handleReorderSelected('forward')
      }
      if (e.key === '[' && selectedElementId) {
        e.preventDefault()
        handleReorderSelected('back')
      }
      if (selectedElementId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const el = selectedSlide?.elements?.elements?.find((x) => x.id === selectedElementId)
        if (!el?.placement || el.locked) return
        const p = el.placement
        const delta = {
          ArrowUp: { y: (p.y || 0) - step },
          ArrowDown: { y: (p.y || 0) + step },
          ArrowLeft: { x: (p.x || 0) - step },
          ArrowRight: { x: (p.x || 0) + step },
        }[e.key]
        handlePlacementCommit(selectedSlideId, selectedElementId, { ...p, ...delta })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    selectedElementId,
    selectedSlideId,
    selectedSlide,
    multiSelectIds,
    handleDeleteElement,
    handleReorderSelected,
    handleUndo,
    handleRedo,
    handlePlacementCommit,
    elementMutations,
    viewOnly,
    askOwner,
  ])

  const handleChangeTransition = async (transitionId) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const nextElements = {
      ...buildCanvasDoc(slide, { aspectRatio }),
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
      await presentationService.patchSlide(workspaceId, presentationId, slideId, {
        transition: transitionId,
      })
      queueCanvasSave(slideId, nextElements)
    } catch {
      // Keep optimistic local selection even if sync fails
    }
  }

  const handleChangeSlideStatus = async (statusId) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const nextElements = {
      ...buildCanvasDoc(slide, { aspectRatio }),
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
      await presentationService.patchSlide(workspaceId, presentationId, slideId, {
        contributorStatus: statusId,
      })
      queueCanvasSave(slideId, nextElements)
    } catch {
      // Keep optimistic local selection
    }
  }

  const generationPrompt =
    config.prompt ||
    config.generationPrompt ||
    config.outline ||
    [config.title, config.tone, config.audience].filter(Boolean).join(' · ')

  const handleRename = () => {
    if (viewOnly) {
      askOwner()
      return
    }
    const next = window.prompt('Rename presentation', deckTitle || 'Untitled Presentation')
    if (next == null) return
    const trimmed = next.trim().slice(0, 255)
    if (!trimmed) return
    setDeckTitle(trimmed)
  }

  const handleDuplicateDeck = async () => {
    if (viewOnly) {
      askOwner()
      return
    }
    if (!workspaceId || !presentationId || isGenerating) {
      setError('Duplicate deck requires a saved presentation')
      return
    }
    setBusy(true)
    try {
      const result = await presentationService.duplicatePresentation(workspaceId, presentationId)
      const newId = result?.presentationId || result?.id
      if (newId) {
        window.location.href = `/dashboard/editor?workspaceId=${workspaceId}&presentationId=${newId}`
      }
    } catch (err) {
      setError(err.message || 'Failed to duplicate deck')
    } finally {
      setBusy(false)
    }
  }

  const openMediaForBackground = () => {
    setError('Use Media panel to insert images, or select an image and use Replace media.')
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
          {viewOnly
            ? generatingBanner || 'Updating… newer slides will appear as they finish'
            : 'Generating… structure and canvas edits are locked'}
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
            privacy={viewOnly ? 'View only' : 'Private'}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            viewOnly={viewOnly}
            onRename={handleRename}
            onDuplicate={handleDuplicateDeck}
            onExport={() => (viewOnly ? askOwner() : setExportModalOpen(true))}
            onSharePreview={() => setShareOpen(true)}
            onUndo={viewOnly ? askOwner : handleUndo}
            onRedo={viewOnly ? askOwner : handleRedo}
            onExit={onBack}
          />
          {presentationId && <span className="aig-editor-badge">Saved</span>}
        </div>

        <div className="aig-editor-nav-center">
          <InsertToolbar
            orientation="horizontal"
            disabled={isGenerating || busy || atElementCap}
            viewOnly={viewOnly}
            onViewOnlyAttempt={askOwner}
            workspaceId={viewOnly ? undefined : workspaceId}
            presentationId={presentationId}
            slideId={selectedSlide?.id}
            targetElementId={
              selectedSlide?.elements?.elements?.find((el) => el.id === selectedElementId)
                ?.type === 'image'
                ? selectedElementId
                : null
            }
            brandKits={brandKits}
            elementPresets={elementPresets}
            onInsert={handleInsertElement}
            onMediaAttached={handleMediaAttached}
            insertDisabledReason={
              atElementCap
                ? `Max ${PPT_CAPS.ELEMENTS_PER_SLIDE} elements per slide`
                : undefined
            }
          />
        </div>

        <div className="aig-editor-nav-right">
          {!viewOnly && (
            <PptPresenceAvatars
              viewers={viewers}
              viewerCount={viewerCount}
              selfViewer={selfViewer}
            />
          )}
          {viewOnly && canOpenInEditor && (
            <button className="aig-editor-btn-secondary" type="button" onClick={onOpenInEditor}>
              Open in editor
            </button>
          )}
          {!viewOnly && (
          <div className="aig-export-menu" ref={brandKitMenuRef}>
            <button
              className="aig-editor-btn-secondary"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (viewOnly) {
                  askOwner()
                  return
                }
                setBrandKitOpen((v) => !v)
              }}
              disabled={!viewOnly && (!presentationId || busy || isGenerating || applyingBrandKit)}
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
          )}
          {!viewOnly && (
            <button className="aig-editor-btn-secondary" type="button" onClick={() => setShareOpen(true)}>
              <FiShare2 size={16} /> Share
            </button>
          )}
          <button
            className="aig-editor-btn-secondary"
            type="button"
            onClick={() => (viewOnly ? askOwner() : setExportModalOpen(true))}
            disabled={!viewOnly && (!presentationId || busy)}
          >
            <FiDownload size={16} /> Export
          </button>
          <button className="aig-editor-btn-primary" type="button" onClick={() => setPresentOpen(true)}>
            <FiPlay size={16} /> Present
          </button>
        </div>
      </nav>

      <PptQuickMenu
        open={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        onCommand={handleQuickCommand}
      />

      <div className="aig-editor-workspace gamma-layout">
        <main
          ref={mainScrollRef}
          className={`aig-editor-main-scroll ${sidebarOpen ? 'is-sidebar-open' : ''}`}
          style={{
            marginLeft: showMinimap ? '260px' : '0',
            '--ppt-canvas-zoom': canvasZoom / 100,
          }}
        >
          <div className="aig-editor-scroll-container">
            {localSlides.map((slide, idx) => (
              <div
                key={slide.id}
                ref={(node) => {
                  if (node) slideContainerRefs.current[slide.id] = node
                  else delete slideContainerRefs.current[slide.id]
                }}
                className={`aig-scroll-slide-container ${selectedSlideId === slide.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedSlideId(slide.id)
                  setSelectedElementId(null)
                  setEditingTextId(null)
                }}
              >
                <div className="aig-scroll-slide-wrapper">
                  {!viewOnly && (
                  <div className="aig-scroll-slide-hover-actions">
                    <button className="aig-slide-action-btn" title="Drag" type="button">
                      <MdDragIndicator size={16} />
                    </button>
                    <button
                      className={`aig-slide-action-btn ${slideAiEditId === slide.id ? 'is-active' : ''}`}
                      title="Edit with AI"
                      type="button"
                      disabled={!viewOnly && (busy || isGenerating)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (viewOnly) {
                          askOwner()
                          return
                        }
                        setSelectedSlideId(slide.id)
                        setSelectedElementId(null)
                        setEditingTextId(null)
                        setSlideAiEditId((prev) => (prev === slide.id ? null : slide.id))
                      }}
                    >
                      <BsStars size={16} />
                    </button>
                    <button
                      className="aig-slide-action-btn"
                      title="Duplicate"
                      type="button"
                      disabled={!viewOnly && (busy || isGenerating || atDeckCap)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (viewOnly) {
                          askOwner()
                          return
                        }
                        handleDuplicateSlide(slide.id)
                      }}
                    >
                      <FiGrid size={16} />
                    </button>
                  </div>
                  )}

                  <SlideStage
                    slide={slide}
                    themeVisual={themeVisual}
                    aspectRatio={aspectRatio}
                    editable={!viewOnly && !isGenerating && !busy && selectedSlideId === slide.id}
                    selectedElementId={
                      selectedSlideId === slide.id ? selectedElementId : null
                    }
                    editingTextId={selectedSlideId === slide.id ? editingTextId : null}
                    smartGuides={selectedSlideId === slide.id ? smartGuides : []}
                    onSelectElement={(id) => {
                      if (viewOnly) return
                      setSelectedSlideId(slide.id)
                      setSelectedElementId(id)
                      setEditingTextId((prev) => (prev === id ? prev : null))
                    }}
                    onPlacementLive={(elementId, placement) =>
                      handlePlacementLive(slide.id, elementId, placement)
                    }
                    onPlacementCommit={(elementId, placement) =>
                      handlePlacementCommit(slide.id, elementId, placement)
                    }
                    onGuidesChange={selectedSlideId === slide.id ? setSmartGuides : undefined}
                    onStartTextEdit={setEditingTextId}
                    onEndTextEdit={handleEndTextEdit}
                    onTableCellChange={handleTableCellChange}
                    onImageAuthError={handleImageAuthError}
                  />

                  <SlideEditAiPanel
                    open={slideAiEditId === slide.id}
                    slideTitle={slide.title || slide.content?.title || `Slide ${idx + 1}`}
                    disabled={viewOnly || isGenerating || busy}
                    busy={busy && slideAiEditId === slide.id}
                    onClose={() => setSlideAiEditId(null)}
                    onSubmit={(payload) => handleSlideAiEdit(slide, payload)}
                  />
                </div>

                {!viewOnly && (
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
                )}
              </div>
            ))}
          </div>

          <div className="aig-canvas-controls">
            <button
              className="aig-canvas-ctrl-btn"
              type="button"
              onClick={() => setCanvasZoom((z) => Math.max(40, z - 10))}
            >
              <FiZoomOut size={14} />
            </button>
            <span className="aig-canvas-zoom-level">{canvasZoom}%</span>
            <button
              className="aig-canvas-ctrl-btn"
              type="button"
              onClick={() => setCanvasZoom((z) => Math.min(200, z + 10))}
            >
              <FiZoomIn size={14} />
            </button>
            <div className="aig-canvas-ctrl-divider"></div>
            <button className="aig-canvas-ctrl-btn" type="button" onClick={() => setCanvasZoom(100)}>
              Fit
            </button>
          </div>
        </main>

        <EditorRightRail
          zoom={canvasZoom}
          deckStatus={deckStatus}
          generationPrompt={generationPrompt}
          slide={selectedSlide}
          themeVisual={themeVisual}
          workspaceId={workspaceId}
          presentationId={presentationId}
          disabled={isGenerating || busy}
          viewOnly={viewOnly}
          onViewOnlyAttempt={askOwner}
          designFocus={designFocus}
          onOpenChange={setSidebarOpen}
          selectedElement={selectedElement}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onBringForward={() => handleReorderSelected('forward')}
          onSendBackward={() => handleReorderSelected('back')}
          onDeleteElement={handleDeleteElement}
          onApplyLayout={handleApplyLayout}
          onResetBackground={() => handleBackgroundColorChange(DEFAULT_SLIDE_BG)}
          onAddBackgroundImage={openMediaForBackground}
          onChangeTransition={handleChangeTransition}
          onChangeSlideStatus={handleChangeSlideStatus}
          onChangeElementContent={handleChangeElementContentWithBackground}
          onChangeElementPlacement={handleChangeElementPlacement}
          onToggleElementLock={() => elementMutations.toggleLock()}
          onReplaceImage={() => setError('Use Media panel with a selected image to replace.')}
          onCropImage={() => setCropModalOpen(true)}
          onToggleImageAsBackground={handleToggleImageAsBackground}
          onSpeakerNotesChange={elementMutations.updateSpeakerNotes}
          deckVariables={deckVariables}
          onVariablesChange={setDeckVariables}
          onSyncVariables={elementMutations.syncVariables}
          slideStyles={slideStyles}
          onSlideStylesChange={setSlideStyles}
          onBackgroundGradientChange={handleBackgroundGradientChange}
          onBackgroundColorChange={handleBackgroundColorChange}
        />

        {showMinimap ? (
          <aside className="aig-editor-minimap">
            <div className="aig-minimap-header">
              {!viewOnly && (
              <button
                className="aig-minimap-add-btn"
                type="button"
                disabled={atDeckCap || isGenerating || busy}
                onClick={() => openAddSlideModal(localSlides.length - 1)}
                title="Add a new slide"
              >
                <FiPlus size={16} /> {atDeckCap ? 'Deck full (40)' : 'Add slide'}
              </button>
              )}
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
                  onClick={() => {
                    setSelectedSlideId(slide.id)
                    setSelectedElementId(null)
                    setEditingTextId(null)
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (viewOnly) return
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
                  <div className="aig-minimap-thumb" style={resolveSlideStageBackground(slide, themeVisual?.palette?.bg || themeVisual?.background || DEFAULT_SLIDE_BG)}>
                    <MinimapSlidePreview
                      slide={slide}
                      themeVisual={themeVisual}
                      themeId={config.theme}
                      aspectRatio={aspectRatio}
                      fallbackBg={themeVisual?.palette?.bg || themeVisual?.background || DEFAULT_SLIDE_BG}
                      layoutSchemaMap={layoutSchemaMap}
                    />
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
        slideCount={localSlides.length}
        disabled={busy || isGenerating || atDeckCap}
        onPick={handlePickAddSlide}
      />

      {presentOpen && (
        <PresentMode
          slides={localSlides}
          themeVisual={themeVisual}
          aspectRatio={aspectRatio}
          initialSlideIndex={Math.max(
            0,
            localSlides.findIndex((s) => s.id === selectedSlideId)
          )}
          onClose={() => setPresentOpen(false)}
        />
      )}

      {shareOpen && (
        <SharePresentationModal
          workspaceId={workspaceId}
          presentationId={presentationId}
          title={deckTitle}
          deckStatus={deckStatus}
          onClose={() => setShareOpen(false)}
          onShareToken={setShareToken}
        />
      )}

      {viewOnlyNotice && (
        <div className="ppt-editor-modal-overlay" onClick={() => setViewOnlyNotice(false)}>
          <div className="ppt-editor-modal" role="dialog" aria-label="View only">
            <header className="ppt-editor-modal-head">
              <div className="ppt-editor-modal-head-text">
                <h3 className="ppt-editor-modal-title">This presentation is view-only</h3>
              </div>
              <button
                type="button"
                className="ppt-editor-modal-close"
                onClick={() => setViewOnlyNotice(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p className="ppt-editor-modal-lead">
              Ask the owner to add you to their workspace.
            </p>
            <footer className="ppt-editor-modal-foot">
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                onClick={() => setViewOnlyNotice(false)}
              >
                Got it
              </button>
            </footer>
          </div>
        </div>
      )}

      {exportModalOpen && (
        <ExportPresentationModal
          workspaceId={workspaceId}
          presentationId={presentationId}
          title={deckTitle}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {cropModalOpen && selectedElement && (
        <ImageCropModal
          imageUrl={selectedElement.content?.url || selectedElement.content?.src}
          onApply={handleCropApply}
          onClose={() => setCropModalOpen(false)}
        />
      )}
    </div>
  )
}
