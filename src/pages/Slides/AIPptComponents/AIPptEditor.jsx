import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiPlay,
  FiDownload,
  FiShare2,
  FiPlus,
  FiGrid,
  FiImage,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { MdDragIndicator, MdOutlineColorLens, MdRotateRight } from 'react-icons/md'
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
import PptDeckOpenBoot from './PptDeckOpenBoot'
import { usePptEditorHistory } from '../../../hooks/usePptEditorHistory'
import { usePptElementMutations } from './usePptElementMutations'
import { computePptSmartGuides } from '../../../utils/pptSmartGuides'
import { exceedsDragThreshold } from '../../../utils/pointerDrag'
import {
  normalizeAngle,
  pointerAngleFromCenter,
  snapAngleStep,
} from '../../../utils/canvasTransformUtils'
import { useAuth } from '../../../contexts/AuthContext'
import presentationService, {
  PresentationConflictError,
} from '../../../services/presentationService'
import { extractShareToken, getOrCreateViewerSessionId } from '../../../utils/pptShareSession'
import PptPresenceAvatars from './PptPresenceAvatars'
import usePptPresence from './usePptPresence'
import brandKitService from '../../../services/brandKitService'
import { dedupeBrandKitList } from '../../../utils/brandKitHelpers'
import assetService from '../../../services/assetService'
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
  patchFromBackgroundFill,
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
import { contentPlainText, contentWithSyncedText, setPptTextSelection } from '../../../utils/pptTextContent'
import { PPT_DEFAULT_PLACEMENTS } from '../../../constants/pptInsertCatalog'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
  themeFontFamilies,
  uniqueFontFamilies,
} from '../../../utils/googleFonts'
import {
  logCanvasGreySuspects,
  shouldPaintElement,
} from '../../../utils/canvasRenderDebug'
import { hydrateSlidesGraphicElements } from '../../../utils/hydrateGraphicElements'
import { syncPresentationThumbnailFromSlides } from '../../../utils/presentationThumbSync'
import {
  parseCanvasDragData,
  resolveDropImageSrc,
  resolveDropAssetId,
} from '../../../utils/editorDragDrop'
import {
  isPptDeviceFrameElement,
  buildDeviceFrameScreenPatch,
  clearDeviceFrameScreenPatch,
} from '../../../components/ppt/DeviceFrameVisual'
import {
  minOverlapPx,
  clampPlacementOverflow,
  overflowPaintStyle,
} from '../../../utils/canvasOverflowUtils'
import {
  clearImageMediaPatch,
  isLayoutBoundImageSlot,
} from '../../../components/ppt/EmptyImagePlaceholder'
import './pptEditorExtras.css'
import '../AIPptGenerator.css'

const CANVAS_SAVE_DEBOUNCE_MS = 600
const TEXT_BORDER_DRAG_PX = 8
const TEXT_MIN_HEIGHT = 24
const RESIZE_MIN_WIDTH = 40
const RESIZE_MIN_HEIGHT = 40

const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', corner: true },
  { id: 'n', cursor: 'ns-resize', corner: false },
  { id: 'ne', cursor: 'nesw-resize', corner: true },
  { id: 'e', cursor: 'ew-resize', corner: false },
  { id: 'se', cursor: 'nwse-resize', corner: true },
  { id: 's', cursor: 'ns-resize', corner: false },
  { id: 'sw', cursor: 'nesw-resize', corner: true },
  { id: 'w', cursor: 'ew-resize', corner: false },
]

function resizeCursorForHandle(handle) {
  return RESIZE_HANDLES.find((item) => item.id === handle)?.cursor || 'nwse-resize'
}

function lockDragCursor(cursor) {
  const root = document.documentElement
  root.classList.add('ppt-drag-cursor-lock')
  root.style.setProperty('--ppt-drag-cursor', cursor)
}

function unlockDragCursor() {
  const root = document.documentElement
  root.classList.remove('ppt-drag-cursor-lock')
  root.style.removeProperty('--ppt-drag-cursor')
}

function isTextElement(el) {
  return el?.type === 'text' || el?.type === 'textbox'
}

function applyResizeFromHandle(handle, start, dx, dy, canvasW, canvasH, minH) {
  const minW = RESIZE_MIN_WIDTH
  const minHeight = minH
  let { x, y, width, height } = start
  const right = start.x + start.width
  const bottom = start.y + start.height
  const aspect = start.width > 0 && start.height > 0 ? start.width / start.height : 1
  // Generous max so users can grow past the slide; final overflow clamp keeps min overlap
  const maxDim = Math.max(canvasW, canvasH) * 3

  if (handle === 'e') {
    width = clamp(start.width + dx, minW, maxDim)
  } else if (handle === 'w') {
    const nextX = start.x + dx
    width = clamp(right - nextX, minW, maxDim)
    x = right - width
  } else if (handle === 's') {
    height = clamp(start.height + dy, minHeight, maxDim)
  } else if (handle === 'n') {
    const nextY = start.y + dy
    height = clamp(bottom - nextY, minHeight, maxDim)
    y = bottom - height
  } else {
    // Corner: keep aspect ratio; opposite corner stays fixed
    let scaleX
    let scaleY
    if (handle === 'se') {
      scaleX = (start.width + dx) / start.width
      scaleY = (start.height + dy) / start.height
    } else if (handle === 'sw') {
      scaleX = (start.width - dx) / start.width
      scaleY = (start.height + dy) / start.height
    } else if (handle === 'ne') {
      scaleX = (start.width + dx) / start.width
      scaleY = (start.height - dy) / start.height
    } else {
      // nw
      scaleX = (start.width - dx) / start.width
      scaleY = (start.height - dy) / start.height
    }

    const scale =
      Math.abs(dx) * (1 / Math.max(start.width, 1)) >= Math.abs(dy) * (1 / Math.max(start.height, 1))
        ? scaleX
        : scaleY

    let nextW = Math.max(minW, start.width * scale)
    let nextH = nextW / aspect
    if (nextH < minHeight) {
      nextH = minHeight
      nextW = nextH * aspect
    }
    nextW = Math.min(nextW, maxDim)
    nextH = nextW / aspect
    if (nextH > maxDim) {
      nextH = maxDim
      nextW = nextH * aspect
    }

    if (handle === 'se') {
      width = nextW
      height = nextH
      x = start.x
      y = start.y
    } else if (handle === 'sw') {
      width = nextW
      height = nextH
      x = right - width
      y = start.y
    } else if (handle === 'ne') {
      width = nextW
      height = nextH
      x = start.x
      y = bottom - height
    } else {
      // nw
      width = nextW
      height = nextH
      x = right - width
      y = bottom - height
    }
  }

  width = clamp(width, minW, maxDim)
  height = clamp(height, minHeight, maxDim)
  const placed = clampPlacementOverflow(x, y, width, height, canvasW, canvasH)
  return { ...start, ...placed }
}

function cssPxToCanvas(cssPx, stageEl, canvasSize) {
  const rect = stageEl?.getBoundingClientRect()
  if (!rect?.height) return cssPx
  return (cssPx / rect.height) * canvasSize
}

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

/** Map pointer → canvas px. Do not clamp to slide so overflow drag/resize works. */
function pointerToCanvas(clientX, clientY, stageEl, canvasW, canvasH) {
  if (!stageEl) return { x: 0, y: 0 }
  const rect = stageEl.getBoundingClientRect()
  if (!rect.width || !rect.height) return { x: 0, y: 0 }
  return {
    x: ((clientX - rect.left) / rect.width) * canvasW,
    y: ((clientY - rect.top) / rect.height) * canvasH,
  }
}

function placementFrameStyle(p, canvasW, canvasH, { layer = 0, rotation = 0, opacity = 1 } = {}) {
  const deg = Number(rotation) || 0
  return {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    transform: deg ? `rotate(${deg}deg)` : undefined,
    transformOrigin: 'center center',
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
  editing,
  stageRef,
  chromeHost,
  allElements,
  onSelect,
  onPlacementLive,
  onPlacementCommit,
  onGuidesChange,
  onStartTextEdit,
  onFillDeviceFrame,
  onFillImage,
  children,
}) {
  const p = el.placement || {}
  const dragRef = useRef(null)
  const shellRef = useRef(null)
  const lastPlacementRef = useRef(null)
  const isText = isTextElement(el)
  const isImageSlot = el.type === 'image'
  const isDeviceFrame = isPptDeviceFrameElement(el)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const fillHandler = isDeviceFrame
    ? onFillDeviceFrame
    : isImageSlot
      ? onFillImage
      : null
  const [rotateBadge, setRotateBadge] = useState(null)
  const acceptsImageFill = editable && !locked && typeof fillHandler === 'function' && (isDeviceFrame || isImageSlot)

  useEffect(() => {
    const onMove = (e) => {
      const drag = dragRef.current
      if (!drag || !stageRef?.current || locked) return
      if (drag.mode === 'move' && !drag.moved) {
        if (!exceedsDragThreshold(drag.startClientX, drag.startClientY, e.clientX, e.clientY)) return
        drag.moved = true
      }
      const pt = pointerToCanvas(e.clientX, e.clientY, stageRef.current, canvasW, canvasH)
      const dx = pt.x - drag.originX
      const dy = pt.y - drag.originY
      const start = drag.startPlacement
      let next = { ...start }

      if (drag.mode === 'move') {
        const w = start.width || 40
        const h = start.height || 40
        let nextX = start.x + dx
        let nextY = start.y + dy
        ;({ x: nextX, y: nextY } = clampPlacementOverflow(
          nextX,
          nextY,
          w,
          h,
          canvasW,
          canvasH
        ))
        next.x = nextX
        next.y = nextY
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
        ;({ x: next.x, y: next.y } = clampPlacementOverflow(
          next.x,
          next.y,
          next.width || w,
          next.height || h,
          canvasW,
          canvasH
        ))
        onGuidesChange?.(guides)
      } else if (drag.mode === 'resize') {
        const minH = isText ? TEXT_MIN_HEIGHT : RESIZE_MIN_HEIGHT
        next = applyResizeFromHandle(drag.handle, start, dx, dy, canvasW, canvasH, minH)
      } else if (drag.mode === 'rotate') {
        const pointerAngle = pointerAngleFromCenter(e.clientX, e.clientY, drag.centerX, drag.centerY)
        const raw = (start.rotation || 0) + (pointerAngle - drag.startPointerAngle)
        const snapped = snapAngleStep(raw, { step: 90, threshold: 12 })
        next.rotation = snapped
        drag.moved = true
        setRotateBadge({
          x: e.clientX,
          y: e.clientY - 18,
          angle: normalizeAngle(snapped),
          snapped: snapped % 90 === 0,
        })
      }

      lastPlacementRef.current = next
      onPlacementLive?.(el.id, next)
    }

    const onUp = (e) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      unlockDragCursor()
      try {
        if (e?.pointerId != null && drag.captureTarget?.hasPointerCapture?.(e.pointerId)) {
          drag.captureTarget.releasePointerCapture(e.pointerId)
        }
      } catch {
        // ignore release errors
      }
      onGuidesChange?.([])
      setRotateBadge(null)
      if (!drag.moved) return
      onPlacementCommit?.(el.id, lastPlacementRef.current || drag.startPlacement)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      unlockDragCursor()
    }
  }, [canvasW, canvasH, el.id, allElements, locked, isText, onGuidesChange, onPlacementCommit, onPlacementLive, stageRef])

  const beginDrag = (e, mode, handle = null) => {
    if (!editable || !selected || !stageRef?.current || locked || editing) return
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
    const cursor =
      mode === 'resize' ? resizeCursorForHandle(handle) : mode === 'rotate' ? 'grabbing' : 'move'
    lockDragCursor(cursor)
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId)
    } catch {
      // ignore capture errors
    }
    const shellRect = shellRef.current?.getBoundingClientRect()
    const centerX = shellRect ? shellRect.left + shellRect.width / 2 : e.clientX
    const centerY = shellRect ? shellRect.top + shellRect.height / 2 : e.clientY
    dragRef.current = {
      mode,
      handle,
      originX: origin.x,
      originY: origin.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPlacement,
      moved: mode === 'resize' || mode === 'rotate',
      captureTarget: e.currentTarget,
      centerX,
      centerY,
      startPointerAngle: pointerAngleFromCenter(e.clientX, e.clientY, centerX, centerY),
    }
  }

  const handleDragOver = (e) => {
    if (!acceptsImageFill) return
    const types = Array.from(e.dataTransfer?.types || [])
    if (!types.includes('application/json') && !types.includes('Files')) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDropTarget(true)
  }

  const handleDragLeave = (e) => {
    if (!acceptsImageFill) return
    e.preventDefault()
    setIsDropTarget(false)
  }

  const applyDroppedImage = (payload) => {
    if (!fillHandler) return
    fillHandler(el.id, payload)
    onSelect?.(el.id)
  }

  const handleDrop = (e) => {
    if (!acceptsImageFill) return
    e.preventDefault()
    e.stopPropagation()
    setIsDropTarget(false)

    const data = parseCanvasDragData(e)
    if (data?.type === 'image') {
      const src = resolveDropImageSrc(data.content)
      if (src) {
        applyDroppedImage({
          url: src,
          src,
          assetId: resolveDropAssetId(data.content),
          alt: data.content?.alt || data.content?.name || '',
        })
      }
      return
    }

    const file = e.dataTransfer.files?.[0]
    if (file?.type?.startsWith('image/')) {
      const blobUrl = URL.createObjectURL(file)
      applyDroppedImage({
        url: blobUrl,
        src: blobUrl,
        alt: file.name,
        file,
      })
    }
  }

  const frameStyle = {
    ...placementFrameStyle(p, canvasW, canvasH, {
      layer: el.layer,
      rotation: p.rotation,
      opacity: p.opacity,
    }),
    ...overflowPaintStyle({
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      rotation: p.rotation,
      canvasW,
      canvasH,
      selected,
      editing,
      outsideAlpha: 0.45,
    }),
    cursor: isText || !editable || locked ? 'pointer' : selected ? 'move' : 'pointer',
    touchAction: 'none',
    overflow: 'visible',
    outline: 'none',
  }

  const showChrome = selected && editable && !locked && !editing
  const chromeFrameStyle = {
    ...placementFrameStyle(p, canvasW, canvasH, {
      layer: (el.layer || 0) + 1000,
      rotation: p.rotation,
      opacity: 1,
    }),
    outline: '2px solid #3B82F6',
    outlineOffset: 2,
    pointerEvents: 'none',
  }

  const handlesNode = showChrome ? (
    <div className="ppt-canvas-el-handles">
      <div aria-hidden>
        {RESIZE_HANDLES.map((handle) => (
          <span
            key={handle.id}
            className={`ppt-canvas-el-resize ppt-canvas-el-resize--${handle.id}`}
            style={{ cursor: handle.cursor }}
            onPointerDown={(e) => beginDrag(e, 'resize', handle.id)}
          />
        ))}
        <span className="ppt-canvas-el-rotate-line" />
      </div>
      <button
        type="button"
        className="ppt-canvas-el-rotate"
        title="Rotate"
        aria-label="Rotate"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => beginDrag(e, 'rotate')}
      >
        <MdRotateRight size={12} />
      </button>
    </div>
  ) : null

  return (
    <div
      ref={shellRef}
      role="button"
      tabIndex={0}
      data-element-id={el.id}
      className={[
        locked ? 'ppt-canvas-el-locked' : '',
        isText && editing ? 'is-editing-text' : '',
        isDropTarget ? 'ppt-canvas-el--drop-target' : '',
        acceptsImageFill ? 'ppt-canvas-el--accepts-fill' : '',
        selected && !editing ? 'ppt-canvas-el--selected' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined}
      style={frameStyle}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(el.id)
      }}
      onDoubleClick={(e) => {
        if (!editable || locked || !isText) return
        e.stopPropagation()
        onSelect?.(el.id)
        onStartTextEdit?.(el.id)
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDown={(e) => {
        if (!editable || !selected || editing) return
        if (e.target.closest?.('.ppt-canvas-el-resize, .ppt-text-drag, .ppt-canvas-el-rotate')) return
        if (isText) return
        if (e.target.closest?.('.ppt-table-cell-input')) return
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
      {isText && selected && editable && !locked && !editing && (
        <>
          <span
            className="ppt-text-drag ppt-text-drag--top"
            style={{ height: TEXT_BORDER_DRAG_PX }}
            onPointerDown={(e) => beginDrag(e, 'move')}
            aria-hidden
          />
          <span
            className="ppt-text-drag ppt-text-drag--bottom"
            style={{ height: TEXT_BORDER_DRAG_PX }}
            onPointerDown={(e) => beginDrag(e, 'move')}
            aria-hidden
          />
          <span
            className="ppt-text-drag ppt-text-drag--left"
            style={{ width: TEXT_BORDER_DRAG_PX }}
            onPointerDown={(e) => beginDrag(e, 'move')}
            aria-hidden
          />
          <span
            className="ppt-text-drag ppt-text-drag--right"
            style={{ width: TEXT_BORDER_DRAG_PX }}
            onPointerDown={(e) => beginDrag(e, 'move')}
            aria-hidden
          />
        </>
      )}
      {/* Fallback handles when chrome host is unavailable */}
      {showChrome && !chromeHost ? handlesNode : null}
      {showChrome &&
        chromeHost &&
        createPortal(
          <div
            className="ppt-canvas-el-chrome"
            data-chrome-for={el.id}
            style={chromeFrameStyle}
          >
            {handlesNode}
          </div>,
          chromeHost
        )}
      {rotateBadge &&
        createPortal(
          <div
            className={`ppt-rotate-angle-badge ${rotateBadge.snapped ? 'is-snapped' : ''}`}
            style={{ left: rotateBadge.x, top: rotateBadge.y }}
          >
            {Math.round(rotateBadge.angle)}°
          </div>,
          document.body
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
  onFillDeviceFrame,
  onFillImage,
  showEmptyTextHint = false,
}) {
  const stageRef = useRef(null)
  const [chromeHost, setChromeHost] = useState(null)
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
        // Empty slide / chrome (not an element) clears selection — Canva-style
        if (e.target.closest?.('[data-element-id], .ppt-canvas-el-chrome, .ppt-canvas-el-handles, .ppt-canvas-el-resize, .ppt-canvas-el-rotate, .ppt-text-drag')) {
          return
        }
        onSelectElement?.(null)
      }}
    >
      <div className="aig-slide-stage-clip" style={slideBgStyle}>
        <div
          ref={stageRef}
          className="aig-slide-stage"
          style={{
            ...slideBgStyle,
            color: themeVisual.body,
          }}
        >
          {!hasElements ? (
            <div className="aig-slide-mock">
              <h1 className="aig-slide-mock-title" style={{ color: themeVisual.title }}>
                {slide.title}
              </h1>
              {slide.subtitle || slide.content ? (
                <p className="aig-slide-mock-body">{slide.subtitle || slide.content}</p>
              ) : null}
              {Array.isArray(slide.description) && slide.description.length ? (
                <div className="aig-slide-mock-text" style={{ color: themeVisual.body }}>
                  <ul style={{ paddingLeft: '32px', margin: 0 }}>
                    {slide.description.map((pt, i) => (
                      <li key={i} style={{ marginBottom: '12px' }}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : slide.description ? (
                <div className="aig-slide-mock-text" style={{ color: themeVisual.body }}>
                  <p style={{ margin: 0 }}>{slide.description}</p>
                </div>
              ) : null}
              {fallbackImage ? (
                <div className="aig-slide-mock-visual">
                  <img className="aig-slide-mock-image" src={fallbackImage} alt="" />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {/* Elements live outside the hard clip so selected overflow can paint
          immediately (per-element clip/mask — no ghost remount on select). */}
      <div className="aig-slide-stage-elements" style={{ color: themeVisual.body }}>
        <PptCanvasGuidesOverlay guides={smartGuides} canvasW={canvas.width} canvasH={canvas.height} />
        {hasElements
          ? elements.map((el, i) => (
              <InteractiveElementShell
                key={el.id || `el-${i}`}
                el={el}
                canvasW={canvas.width}
                canvasH={canvas.height}
                selected={selectedElementId === el.id}
                editable={editable}
                locked={!!el.locked}
                editing={editingTextId === el.id}
                stageRef={stageRef}
                chromeHost={chromeHost}
                allElements={elements}
                onSelect={onSelectElement}
                onStartTextEdit={onStartTextEdit}
                onPlacementLive={onPlacementLive}
                onPlacementCommit={onPlacementCommit}
                onGuidesChange={onGuidesChange}
                onFillDeviceFrame={onFillDeviceFrame}
                onFillImage={onFillImage}
              >
                <PptCanvasElement
                  el={el}
                  palette={palette}
                  selected={selectedElementId === el.id}
                  canvasW={canvas.width}
                  showEmptyTextHint={showEmptyTextHint}
                  editable={
                    editable &&
                    (el.type === 'text' ||
                      el.type === 'textbox' ||
                      el.type === 'table' ||
                      selectedElementId === el.id)
                  }
                  editingText={editingTextId === el.id}
                  onStartTextEdit={() => {
                    onSelectElement?.(el.id)
                    onStartTextEdit?.(el.id)
                  }}
                  onEndTextEdit={(text, runs) => onEndTextEdit?.(el.id, text, runs)}
                  onHeightChange={(cssHeight, { commit = false, allowShrink = false } = {}) => {
                    if (!editable) return
                    const y = el.placement?.y || 0
                    const curH = el.placement?.height || 40
                    const rawH = Math.round(
                      cssPxToCanvas(cssHeight, stageRef.current, canvas.height)
                    )
                    const slotMaxH = el.content?.slotMaxHeight || el.placement?.height || curH
                    const maxH = Math.max(
                      TEXT_MIN_HEIGHT,
                      Math.min(slotMaxH, canvas.height - y + minOverlapPx(curH) * 8)
                    )
                    const nextH = Math.max(TEXT_MIN_HEIGHT, Math.min(maxH, rawH))
                    if (allowShrink) {
                      if (Math.abs(nextH - curH) <= 2) return
                    } else if (nextH <= curH + 2) {
                      return
                    }
                    const next = { ...(el.placement || {}), height: nextH }
                    const placed = clampPlacementOverflow(
                      next.x || 0,
                      next.y || 0,
                      next.width || 100,
                      next.height,
                      canvas.width,
                      canvas.height
                    )
                    const committed = { ...next, ...placed, height: nextH }
                    onPlacementLive?.(el.id, committed)
                    if (commit) onPlacementCommit?.(el.id, committed)
                  }}
                  onTableCellChange={(ri, ci, val) => onTableCellChange?.(el.id, ri, ci, val)}
                  onTableActivate={() => onSelectElement?.(el.id)}
                  onImageAuthError={onImageAuthError}
                />
              </InteractiveElementShell>
            ))
          : null}
      </div>
      <div
        ref={setChromeHost}
        className="aig-slide-stage-chrome"
        aria-hidden={!selectedElementId}
      />
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
  const [fontCssUrl, setFontCssUrl] = useState(null)
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
  const pendingPlacementRef = useRef({})
  const nudgeBurstTimerRef = useRef(null)
  const localSlidesRef = useRef(localSlides)
  const selectedSlideIdRef = useRef(null)
  const selectedElementIdRef = useRef(null)
  const elementMutationsRef = useRef(null)
  const imageRefreshInFlight = useRef(new Set())
  const layoutRepairPassRef = useRef('')
  const mainScrollRef = useRef(null)
  const slideContainerRefs = useRef({})
  const keyCtxRef = useRef({})
  const placementHistoryArmedRef = useRef(true)
  const skipTextCommitRef = useRef(false)

  const history = usePptEditorHistory()

  useEffect(() => {
    localSlidesRef.current = localSlides
  }, [localSlides])

  useEffect(() => {
    selectedSlideIdRef.current = selectedSlideId
  }, [selectedSlideId])

  useEffect(() => {
    selectedElementIdRef.current = selectedElementId
  }, [selectedElementId])

  useEffect(() => {
    history.reset()
  }, [workspaceId, presentationId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const layoutSchemaMapRef = useRef(layoutSchemaMap)
  const deckPackIdRef = useRef(deckPackId)
  const bootLoadKeyRef = useRef('')

  useEffect(() => {
    layoutSchemaMapRef.current = layoutSchemaMap
  }, [layoutSchemaMap])

  useEffect(() => {
    deckPackIdRef.current = deckPackId
  }, [deckPackId])

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
    if (fontCssUrl) {
      ensureFontCssUrl(fontCssUrl)
    } else {
      ensureThemeFontsLoaded(themeTokens)
    }
    ensureElementFontsLoaded(collectSlideFontFamilies(localSlides))
  }, [fontCssUrl, themeTokens, localSlides])

  const usedFontFamilies = useMemo(() => {
    return uniqueFontFamilies([
      ...collectSlideFontFamilies(localSlides),
      slideStyles?.headerFont,
      slideStyles?.bodyFont,
    ])
  }, [localSlides, slideStyles?.headerFont, slideStyles?.bodyFont])

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

      // While flip/rotate/nudge patches are pending, never let a server echo
      // replace optimistic element transforms with stale placement/content.
      const preserveLocalElements =
        elementMutationsRef.current?.hasPendingPatchesForSlide?.(normalized.id) ||
        Object.keys(pendingPlacementRef.current).some((k) =>
          k.startsWith(`${normalized.id}:`)
        )

      const mergedElements = preserveLocalElements
        ? currentEls
        : incomingEls.length > 0
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
        backgroundGradientAngle:
          normalized.backgroundGradientAngle ?? current.backgroundGradientAngle,
        backgroundGradientKind:
          normalized.backgroundGradientKind ?? current.backgroundGradientKind,
        backgroundGradientStops:
          normalized.backgroundGradientStops ?? current.backgroundGradientStops,
        backgroundFill: normalized.backgroundFill ?? current.backgroundFill,
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
      localSlidesRef.current = next
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

    if (!generating && Object.keys(layoutSchemaMapRef.current || {}).length) {
      const packId = extractDeckPackId(data) || deckPackIdRef.current
      const didRepair = await repairPresentationLayoutSlides({
        workspaceId,
        presentationId,
        slides,
        layoutSchemaMap: layoutSchemaMapRef.current,
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

    slides = await hydrateSlidesGraphicElements(slides)

    setLocalSlides(slides)
    localSlidesRef.current = slides
    setThemeTokens(tokens)
    setFontCssUrl(
      data?.fontCssUrl ||
        data?.deck?.fontCssUrl ||
        data?.presentation?.fontCssUrl ||
        null
    )
    setDeckStatus(deckStatusRaw)
    setDeckPackId(extractDeckPackId(data) || deckPackIdRef.current)
    if (data?.title || data?.presentation?.title) {
      setDeckTitle(data?.title || data?.presentation?.title)
    }
    if (slides[0]?.id) setSelectedSlideId((prev) => prev || slides[0].id)
    if (!generating && !viewOnly && slides.length) {
      syncPresentationThumbnailFromSlides({
        workspaceId,
        presentationId,
        slides,
        updatedAt: data?.updatedAt || data?.lastModifiedAt || null,
        aspectRatio: resolvedAspect,
      })
    }
    return data
  }, [workspaceId, presentationId, config.screenSize, config.aspectRatio, viewOnly])

  useEffect(() => {
    if (viewOnly || isGenerating) return undefined
    if (!workspaceId || !presentationId || !localSlides.length) return undefined
    if (String(deckStatus || '').toUpperCase() === 'GENERATING') return undefined

    const timer = setTimeout(() => {
      syncPresentationThumbnailFromSlides({
        workspaceId,
        presentationId,
        slides: localSlides,
        aspectRatio,
      })
    }, 1200)
    return () => clearTimeout(timer)
  }, [
    viewOnly,
    isGenerating,
    workspaceId,
    presentationId,
    localSlides,
    aspectRatio,
    deckStatus,
  ])

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
    (slideId, _canvasDoc) => {
      if (!workspaceId || !presentationId || !slideId || isGenerating || viewOnly) return
      if (canvasSaveTimers.current[slideId]) {
        clearTimeout(canvasSaveTimers.current[slideId])
      }
      canvasSaveTimers.current[slideId] = setTimeout(async () => {
        // Always persist the latest local canvas — never a stale snapshot from schedule time
        const slide = localSlidesRef.current.find((s) => s.id === slideId)
        const canvasDoc = slide?.elements
        if (!canvasDoc) return
        try {
          await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            slideId,
            canvasDoc
          )
          // Do not applySlideUpdate — server echo races rapid flip/rotate/nudge
        } catch (err) {
          if (err instanceof PresentationConflictError) {
            setError('Presentation is generating — canvas edits are locked.')
          } else {
            setError(err.message || 'Failed to save canvas')
          }
        }
      }, CANVAS_SAVE_DEBOUNCE_MS)
    },
    [workspaceId, presentationId, isGenerating, viewOnly]
  )

  const pushHistorySnapshot = useCallback(
    (snapshot) => {
      history.pushSnapshot(
        snapshot || {
          slides: localSlidesRef.current,
          selectedSlideId: selectedSlideIdRef.current,
          selectedElementId: selectedElementIdRef.current,
        }
      )
    },
    [history]
  )

  const currentHistorySnapshot = useCallback(
    () => ({
      slides: localSlidesRef.current,
      selectedSlideId: selectedSlideIdRef.current,
      selectedElementId: selectedElementIdRef.current,
    }),
    []
  )

  const restoreHistorySnapshot = useCallback(
    (snapshot) => {
      if (!snapshot?.slides) return

      Object.values(elementPatchTimers.current).forEach((t) => clearTimeout(t))
      Object.values(canvasSaveTimers.current).forEach((t) => clearTimeout(t))
      elementPatchTimers.current = {}
      canvasSaveTimers.current = {}
      pendingPlacementRef.current = {}
      if (nudgeBurstTimerRef.current) {
        clearTimeout(nudgeBurstTimerRef.current)
        nudgeBurstTimerRef.current = null
      }
      placementHistoryArmedRef.current = true
      elementMutationsRef.current?.cancelPendingPatches?.()
      skipTextCommitRef.current = true
      // Drop in-progress text edit without committing — otherwise the empty
      // contenteditable would immediately re-patch and wipe the restored text.
      setEditingTextId(null)
      setPptTextSelection(null)

      setLocalSlides(snapshot.slides)
      localSlidesRef.current = snapshot.slides
      setSelectedSlideId(snapshot.selectedSlideId)
      setSelectedElementId(snapshot.selectedElementId)

      queueMicrotask(() => {
        skipTextCommitRef.current = false
      })

      ;(snapshot.slides || []).forEach((slide) => {
        if (slide?.id && slide.elements) queueCanvasSave(slide.id, slide.elements)
      })
    },
    [queueCanvasSave]
  )

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
  elementMutationsRef.current = elementMutations

  const handleUndo = useCallback(() => {
    restoreHistorySnapshot(history.undo(currentHistorySnapshot()))
  }, [history, currentHistorySnapshot, restoreHistorySnapshot])

  const handleRedo = useCallback(() => {
    restoreHistorySnapshot(history.redo(currentHistorySnapshot()))
  }, [history, currentHistorySnapshot, restoreHistorySnapshot])

  const handleChangeElementContent = useCallback(
    (elementId, content) => elementMutations.patchElement(elementId, { content }),
    [elementMutations]
  )

  const handleChangeElementPlacement = useCallback(
    (elementId, placement) => elementMutations.patchElement(elementId, { placement }),
    [elementMutations]
  )

  const handleStartTextEdit = useCallback(
    (elementId) => {
      if (!elementId) return
      if (elementId !== editingTextId) {
        pushHistorySnapshot()
      }
      setEditingTextId(elementId)
    },
    [editingTextId, pushHistorySnapshot]
  )

  const handleEndTextEdit = useCallback(
    (elementId, text, runs) => {
      setEditingTextId(null)
      setPptTextSelection(null)
      if (skipTextCommitRef.current) return
      const el = selectedSlide?.elements?.elements?.find((e) => e.id === elementId)
      if (!el) return
      const nextContent = contentWithSyncedText(el.content, text, runs)
      if (contentPlainText(el.content) === contentPlainText(nextContent)) return
      elementMutations.patchElement(
        elementId,
        { content: nextContent },
        { history: false }
      )
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
        case 'copy':
          if (viewOnly) { askOwner(); break }
          elementMutations.copySelection(ids)
          break
        case 'paste':
          if (viewOnly) { askOwner(); break }
          elementMutations.pasteClipboard()
          break
        case 'select-all': {
          if (viewOnly) { askOwner(); break }
          const allIds = (selectedSlide?.elements?.elements || []).map((el) => el.id)
          if (allIds.length) {
            setMultiSelectIds(allIds)
            setSelectedElementId(allIds[0])
          }
          break
        }
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
    [handleUndo, handleRedo, elementMutations, multiSelectIds, selectedElementId, selectedSlide, viewOnly, askOwner]
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
    (payload) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId) return
      const fill =
        payload?.type === 'solid' || payload?.type === 'gradient'
          ? payload
          : payload?.start == null && payload?.end == null
            ? { type: 'solid', color: DEFAULT_SLIDE_BG }
            : {
                type: 'gradient',
                kind: 'linear',
                angle: 135,
                stops: [
                  { color: payload.start || '#E0F2FE', at: 0 },
                  { color: payload.end || '#FFFFFF', at: 1 },
                ],
              }
      const patch = patchFromBackgroundFill(fill, DEFAULT_SLIDE_BG)
      pushHistorySnapshot()
      setLocalSlides((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) return s
          const next = { ...s, ...patch }
          next.elements = buildCanvasDoc(next, {
            aspectRatio,
            elements: s.elements?.elements,
          })
          return next
        })
      )
      if (workspaceId && presentationId) {
        const slide = localSlides.find((s) => s.id === slideId)
        const nextDoc = buildCanvasDoc(
          { ...slide, ...patch },
          { aspectRatio, elements: slide?.elements?.elements }
        )
        presentationService
          .patchSlide(workspaceId, presentationId, slideId, {
            ...Object.fromEntries(
              Object.entries(patch).map(([key, value]) => [key, value === undefined ? null : value])
            ),
            backgroundImage: null,
            backgroundImageFit: null,
            backgroundImageElementId: null,
          })
          .catch(() => {})
        queueCanvasSave(slideId, nextDoc)
      }
    },
    [selectedSlideId, localSlides, workspaceId, presentationId, aspectRatio, queueCanvasSave, pushHistorySnapshot]
  )

  const handleBackgroundColorChange = useCallback(
    (color) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId) return
      pushHistorySnapshot()
      setLocalSlides((prev) =>
        prev.map((s) =>
          s.id === slideId
            ? {
                ...s,
                backgroundColor: color,
                backgroundGradientStart: undefined,
                backgroundGradientEnd: undefined,
                backgroundGradientAngle: undefined,
                backgroundGradientKind: undefined,
                backgroundGradientStops: undefined,
                backgroundFill: undefined,
                backgroundImage: undefined,
                backgroundImageFit: undefined,
                backgroundImageElementId: undefined,
                elements: buildCanvasDoc(
                  { ...s, backgroundColor: color },
                  {
                    aspectRatio,
                    backgroundColor: color,
                    elements: (s.elements?.elements || []).map((el) =>
                      el.content?.useAsBackground
                        ? { ...el, content: { ...el.content, useAsBackground: false } }
                        : el
                    ),
                  }
                ),
              }
            : s
        )
      )
      if (workspaceId && presentationId) {
        const slide = localSlides.find((s) => s.id === slideId)
        const nextDoc = buildCanvasDoc(
          { ...slide, backgroundColor: color },
          {
            aspectRatio,
            backgroundColor: color,
            elements: (slide?.elements?.elements || []).map((el) =>
              el.content?.useAsBackground
                ? { ...el, content: { ...el.content, useAsBackground: false } }
                : el
            ),
          }
        )
        presentationService
          .patchSlide(workspaceId, presentationId, slideId, {
            backgroundColor: color,
            backgroundImage: null,
            backgroundImageFit: null,
            backgroundImageElementId: null,
            backgroundGradientStart: null,
            backgroundGradientEnd: null,
            backgroundGradientAngle: null,
            backgroundGradientKind: null,
            backgroundGradientStops: null,
            backgroundFill: null,
          })
          .catch(() => {})
        queueCanvasSave(slideId, nextDoc)
      }
    },
    [selectedSlideId, localSlides, workspaceId, presentationId, aspectRatio, queueCanvasSave, pushHistorySnapshot]
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

      pushHistorySnapshot()
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
      pushHistorySnapshot,
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
      if (placementHistoryArmedRef.current) {
        placementHistoryArmedRef.current = false
        pushHistorySnapshot()
      }
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (s.id !== slideId) return s
          const elements = (s.elements?.elements || []).map((el) =>
            el.id === elementId ? { ...el, placement: { ...el.placement, ...placement } } : el
          )
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
        localSlidesRef.current = next
        return next
      })
    },
    [aspectRatio, pushHistorySnapshot]
  )

  const handlePlacementCommit = useCallback(
    (slideId, elementId, placement) => {
      placementHistoryArmedRef.current = true
      if (!workspaceId || !presentationId || isGenerating || viewOnly) return
      const key = `${slideId}:${elementId}`
      pendingPlacementRef.current[key] = placement
      if (elementPatchTimers.current[key]) {
        clearTimeout(elementPatchTimers.current[key])
      }
      elementPatchTimers.current[key] = setTimeout(async () => {
        const latest = pendingPlacementRef.current[key]
        delete pendingPlacementRef.current[key]
        delete elementPatchTimers.current[key]
        if (!latest) return
        try {
          await presentationService.updateElement(
            workspaceId,
            presentationId,
            slideId,
            elementId,
            { placement: latest }
          )
          // Do not applySlideUpdate — delayed responses race newer local nudges/drags
        } catch (err) {
          if (err instanceof PresentationConflictError) {
            setError('Presentation is generating — canvas edits are locked.')
            return
          }
          const slide = localSlidesRef.current.find((s) => s.id === slideId)
          if (!slide) return
          const elements = (slide.elements?.elements || []).map((el) =>
            el.id === elementId ? { ...el, placement: { ...el.placement, ...latest } } : el
          )
          queueCanvasSave(slideId, buildCanvasDoc(slide, { aspectRatio, elements }))
        }
      }, 320)
    },
    [workspaceId, presentationId, isGenerating, viewOnly, aspectRatio, queueCanvasSave]
  )

  /** Immediate local nudge + debounced persist (Canva-style keyboard move). */
  const nudgeSelectedElements = useCallback(
    (dx, dy, ids) => {
      const slideId = selectedSlideId
      if (!slideId || isGenerating || viewOnly || !ids?.length) return

      const idSet = new Set(ids.filter(Boolean))
      if (!idSet.size) return

      const slide = localSlidesRef.current.find((s) => s.id === slideId)
      if (!slide) return
      const canvas = slide.elements?.canvas || { width: 1920, height: 1080 }
      const committed = []
      const elements = (slide.elements?.elements || []).map((el) => {
        if (!idSet.has(el.id) || !el.placement || el.locked) return el
        const p = el.placement
        const placed = clampPlacementOverflow(
          (p.x || 0) + dx,
          (p.y || 0) + dy,
          p.width || 100,
          p.height || 40,
          canvas.width || 1920,
          canvas.height || 1080
        )
        const placement = {
          ...p,
          x: Math.round(placed.x),
          y: Math.round(placed.y),
        }
        committed.push({ elementId: el.id, placement })
        return { ...el, placement }
      })
      if (!committed.length) return

      // One history entry per continuous nudge burst
      if (!nudgeBurstTimerRef.current) {
        history.pushSnapshot({
          slides: localSlidesRef.current,
          selectedSlideId,
          selectedElementId,
        })
      } else {
        clearTimeout(nudgeBurstTimerRef.current)
      }
      nudgeBurstTimerRef.current = setTimeout(() => {
        nudgeBurstTimerRef.current = null
      }, 450)

      const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements })
      setLocalSlides((prev) => {
        const next = prev.map((s) => (s.id === slideId ? { ...s, elements: nextDoc } : s))
        localSlidesRef.current = next
        return next
      })

      for (const { elementId, placement } of committed) {
        handlePlacementCommit(slideId, elementId, placement)
      }
    },
    [
      selectedSlideId,
      selectedElementId,
      isGenerating,
      viewOnly,
      aspectRatio,
      history,
      handlePlacementCommit,
    ]
  )

  useEffect(() => {
    if (!workspaceId || !presentationId) {
      setLocalSlides(outline || [])
      setLoading(false)
      bootLoadKeyRef.current = ''
      return undefined
    }
    if (viewOnly) return undefined

    const loadKey = `${workspaceId}:${presentationId}`
    const isNewDeck = bootLoadKeyRef.current !== loadKey
    bootLoadKeyRef.current = loadKey

    let cancelled = false
    // Only show the full-screen boot UI when opening a (new) presentation —
    // never flash it again when layout schemas / callbacks settle.
    if (isNewDeck) setLoading(true)

    ;(async () => {
      try {
        await reloadPresentation()
        const [kits, presetsPayload] = await Promise.all([
          brandKitService.list(workspaceId).catch(() => []),
          presentationService.listElementPresets(workspaceId).catch(() => null),
        ])
        if (cancelled) return
        setBrandKits(dedupeBrandKitList(kits || [], { byName: true }))
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
      if (nudgeBurstTimerRef.current) clearTimeout(nudgeBurstTimerRef.current)
      pendingPlacementRef.current = {}
    }
    // Intentionally omit reloadPresentation / outline — those identities churn and
    // were causing a second full-screen "Loading presentation…" flash.
  }, [workspaceId, presentationId, viewOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewOnly || !localSlides.length) return undefined
    let cancelled = false
    hydrateSlidesGraphicElements(localSlides).then((next) => {
      if (!cancelled) setLocalSlides(next)
    })
    return () => {
      cancelled = true
    }
  }, [viewOnly])

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
    setFontCssUrl(
      initialDeck?.fontCssUrl ||
        initialDeck?.deck?.fontCssUrl ||
        initialDeck?.presentation?.fontCssUrl ||
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
    if ((type === 'image' || type === 'icon' || type === 'graphic') && !content.url && content.src) {
      content.url = content.src
    }
    if ((type === 'image' || type === 'icon' || type === 'graphic') && content.url && !content.src) {
      content.src = content.url
    }

    const localEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content,
      placement,
      layer: existing.length + 1,
      ...(payload.presetId ? { presetId: payload.presetId } : {}),
      ...(payload.role ? { role: payload.role } : type === 'graphic' ? { role: 'decoration' } : {}),
    }
    pushHistorySnapshot()
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

  const handleDeleteElement = useCallback(async (elementIdArg) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    const elementId = typeof elementIdArg === 'string' ? elementIdArg : selectedElementId
    if (!slideId || !elementId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const existing = slide?.elements?.elements || []
    const elements = Array.isArray(existing) ? existing : []
    const target = elements.find((el) => el.id === elementId)

    // Layout image slots: clear media so the empty placeholder stays in place.
    if (isLayoutBoundImageSlot(target)) {
      const hasMedia = Boolean(
        target.content?.url ||
          target.content?.src ||
          target.content?.thumbnailUrl ||
          target.content?.previewUrl
      )
      if (!hasMedia) return

      const clearingBackground =
        slide?.backgroundImageElementId === elementId || target.content?.useAsBackground

      await elementMutations.patchElement(elementId, { content: clearImageMediaPatch() })

      const slotId = target.slotId
      const slotKey = String(slotId || '')
      const prevContent = slide?.content && typeof slide.content === 'object' ? slide.content : {}
      const prevUrls =
        prevContent.slotImageUrls && typeof prevContent.slotImageUrls === 'object'
          ? { ...prevContent.slotImageUrls }
          : {}
      let urlsChanged = false
      for (const key of Object.keys(prevUrls)) {
        if (String(key).toUpperCase() === slotKey.toUpperCase()) {
          delete prevUrls[key]
          urlsChanged = true
        }
      }
      const sidUpper = slotKey.toUpperCase()
      const clearHero =
        sidUpper === 'HERO_IMAGE' ||
        sidUpper === 'BACKGROUND_IMAGE' ||
        target.role === 'background'

      if (urlsChanged || clearHero || clearingBackground) {
        const nextContent = { ...prevContent }
        if (urlsChanged) nextContent.slotImageUrls = prevUrls
        if (clearHero) {
          nextContent.imageRef = null
          nextContent.imageUrl = null
        }
        setLocalSlides((prev) =>
          prev.map((s) => {
            if (s.id !== slideId) return s
            return {
              ...s,
              content: nextContent,
              ...(clearingBackground
                ? {
                    backgroundImage: undefined,
                    backgroundImageFit: undefined,
                    backgroundImageElementId: undefined,
                  }
                : {}),
            }
          })
        )
        if (workspaceId && presentationId) {
          const patch = { content: nextContent }
          if (clearingBackground) {
            patch.backgroundImage = null
            patch.backgroundImageFit = null
            patch.backgroundImageElementId = null
          }
          presentationService.patchSlide(workspaceId, presentationId, slideId, patch).catch(() => {})
        }
      }
      return
    }

    if (!target) return
    pushHistorySnapshot()
    const nextElements = elements.filter((el) => el.id !== elementId)
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
    elementMutations,
    pushHistorySnapshot,
  ])

  const persistElementOrder = useCallback(
    async (slideId, nextElements) => {
      const slide = localSlides.find((s) => s.id === slideId)
      if (!slide || isGenerating) return

      const layered = nextElements.map((el, i) => ({ ...el, layer: i + 1 }))
      const current = slide.elements?.elements || []
      const unchanged =
        current.length === layered.length &&
        current.every(
          (el, i) => el.id === layered[i].id && (el.layer || 0) === layered[i].layer
        )
      if (unchanged) return

      pushHistorySnapshot()
      const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: layered })
      setLocalSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, elements: nextDoc } : s))
      )

      if (!workspaceId || !presentationId) return
      try {
        const result = await presentationService.reorderElements(
          workspaceId,
          presentationId,
          slideId,
          layered.map((el) => el.id)
        )
        const slideFromApi = extractSlideFromMutation(result)
        if (slideFromApi) applySlideUpdate(slideFromApi)
      } catch (err) {
        setError(err.message || 'Failed to reorder elements')
        await refreshSlide(slideId).catch(() => {})
      }
    },
    [
      localSlides,
      isGenerating,
      aspectRatio,
      workspaceId,
      presentationId,
      applySlideUpdate,
      refreshSlide,
      pushHistorySnapshot,
    ]
  )

  const handleReorderSelected = useCallback(
    async (direction) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      const elementId = selectedElementId
      if (!slideId || !elementId || isGenerating) return

      const slide = localSlides.find((s) => s.id === slideId)
      const existing = [...(slide?.elements?.elements || [])]
      const idx = existing.findIndex((el) => el.id === elementId)
      if (idx < 0) return

      let next = existing
      if (direction === 'toFront') {
        if (idx >= existing.length - 1) return
        const [item] = existing.splice(idx, 1)
        existing.push(item)
        next = existing
      } else if (direction === 'toBack') {
        if (idx <= 0) return
        const [item] = existing.splice(idx, 1)
        existing.unshift(item)
        next = existing
      } else {
        const swapWith = direction === 'forward' ? idx + 1 : idx - 1
        if (swapWith < 0 || swapWith >= existing.length) return
        ;[existing[idx], existing[swapWith]] = [existing[swapWith], existing[idx]]
        next = existing
      }

      await persistElementOrder(slideId, next)
    },
    [
      selectedSlideId,
      selectedElementId,
      localSlides,
      isGenerating,
      persistElementOrder,
    ]
  )

  const handleReorderLayers = useCallback(
    (frontToBackIds) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || isGenerating || !frontToBackIds?.length) return

      const slide = localSlides.find((s) => s.id === slideId)
      const existing = slide?.elements?.elements || []
      const byId = new Map(existing.map((el) => [el.id, el]))
      const backToFront = [...frontToBackIds]
        .reverse()
        .map((id) => byId.get(id))
        .filter(Boolean)
      const seen = new Set(backToFront.map((el) => el.id))
      for (const el of existing) {
        if (!seen.has(el.id)) backToFront.unshift(el)
      }
      persistElementOrder(slideId, backToFront)
    },
    [selectedSlideId, localSlides, isGenerating, persistElementOrder]
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

  const handleFillDeviceFrame = useCallback(
    async (elementId, imagePayload = {}) => {
      if (!elementId || viewOnly || isGenerating) return
      let url = imagePayload.url || imagePayload.src || ''
      let assetId = imagePayload.assetId || undefined

      if (imagePayload.file && workspaceId) {
        try {
          const asset = await assetService.uploadAsset(workspaceId, imagePayload.file)
          url =
            asset?.url ||
            asset?.cdnUrl ||
            asset?.src ||
            asset?.downloadUrl ||
            url
          assetId = asset?.id || asset?._id || assetId
        } catch {
          // Keep blob/preview URL if upload fails
        }
      }

      const patch = buildDeviceFrameScreenPatch(url, {
        assetId,
        alt: imagePayload.alt,
        provider: imagePayload.provider,
      })
      if (!patch) return
      await elementMutations.patchElement(elementId, { content: patch })
      setSelectedElementId(elementId)
    },
    [viewOnly, isGenerating, workspaceId, elementMutations]
  )

  const handleFillImage = useCallback(
    async (elementId, imagePayload = {}) => {
      if (!elementId || viewOnly || isGenerating) return
      let url = imagePayload.url || imagePayload.src || ''
      let assetId = imagePayload.assetId || undefined

      if (imagePayload.file && workspaceId) {
        try {
          const asset = await assetService.uploadAsset(workspaceId, imagePayload.file)
          url =
            asset?.url ||
            asset?.cdnUrl ||
            asset?.src ||
            asset?.downloadUrl ||
            url
          assetId = asset?.id || asset?._id || assetId
        } catch {
          // Keep blob/preview URL if upload fails
        }
      }

      if (!url) return
      await elementMutations.patchElement(elementId, {
        content: {
          url,
          src: url,
          fit: 'cover',
          ...(assetId ? { assetId } : {}),
          ...(imagePayload.alt != null ? { alt: imagePayload.alt } : {}),
          ...(imagePayload.provider ? { provider: imagePayload.provider } : {}),
        },
      })
      setSelectedElementId(elementId)
    },
    [viewOnly, isGenerating, workspaceId, elementMutations]
  )

  const handleClearDeviceFrameScreen = useCallback(() => {
    if (!selectedElementId || !isPptDeviceFrameElement(selectedElement)) return
    elementMutations.patchElement(selectedElementId, {
      content: clearDeviceFrameScreenPatch(),
    })
  }, [selectedElementId, selectedElement, elementMutations])

  const handleApplyLayout = useCallback(
    async (templateId) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || !templateId || !workspaceId || !presentationId || isGenerating) return
      setBusy(true)
      setError('')
      try {
        const slide = localSlides.find((s) => s.id === slideId)
        const originalElements = slide?.elements?.elements || []
        const originalContent =
          slide?.content && typeof slide.content === 'object' ? { ...slide.content } : {}
        if (slide?.imageRef && !originalContent.imageRef) {
          originalContent.imageRef = slide.imageRef
        }
        let appliedLayoutId = slide?.layoutId || slide?.layout_id || null

        try {
          const result = await presentationService.applyLayout(
            workspaceId,
            presentationId,
            slideId,
            templateId
          )
          const updated = extractSlideFromMutation(result)
          if (updated?.layoutId || updated?.layout_id) {
            appliedLayoutId = updated.layoutId || updated.layout_id
          }
        } catch {
          // Client compile below replaces broken backend layout structure.
        }

        await applyCompiledLayoutToSlide({
          workspaceId,
          presentationId,
          slideId,
          templateId,
          layoutId: appliedLayoutId,
          layoutSchemaMap,
          aspectRatio,
          ...themeCompileOptions,
          slideTitle: slide?.title || originalContent.title || '',
          slideContent: originalContent,
          mergeFromElements: originalElements,
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

  // Keep keyboard ctx fresh without rebinding the listener every nudge (key-repeat lag).
  keyCtxRef.current = {
    viewOnly,
    editingTextId,
    selectedElementId,
    selectedSlideId,
    multiSelectIds,
    selectedSlide,
    askOwner,
    handleUndo,
    handleRedo,
    handleDeleteElement,
    handleReorderSelected,
    nudgeSelectedElements,
    elementMutations,
  }

  useEffect(() => {
    const onKey = (e) => {
      const ctx = keyCtxRef.current
      const active = document.activeElement
      const tag = String((e.target?.tagName || active?.tagName || '')).toLowerCase()
      const inFormField = tag === 'input' || tag === 'textarea' || tag === 'select'
      const inSlideContentField = Boolean(
        e.target?.closest?.(
          '.ppt-text-editable, .ppt-element-props-textarea, .ppt-table-cell-input, .ppt-table-data-cell'
        ) ||
        active?.closest?.(
          '.ppt-text-editable, .ppt-element-props-textarea, .ppt-table-cell-input, .ppt-table-data-cell'
        )
      )
      const inCanvasTextEdit =
        Boolean(ctx.editingTextId) &&
        (e.target?.isContentEditable ||
          active?.isContentEditable ||
          e.target?.closest?.('.ppt-text-editable, .ppt-table-cell-input, [contenteditable="true"]') ||
          active?.closest?.('.ppt-text-editable, .ppt-table-cell-input, [contenteditable="true"]'))

      const mod = e.ctrlKey || e.metaKey
      const key = String(e.key || '').toLowerCase()

      // Slide text uses editor history. Native undo on controlled fields flashes
      // restored text then React overwrites it with the empty value.
      if (mod && (key === 'z' || key === 'y')) {
        if ((inFormField || inCanvasTextEdit) && !inSlideContentField) return
        if (ctx.viewOnly) {
          e.preventDefault()
          ctx.askOwner()
          return
        }
        e.preventDefault()
        e.stopPropagation()
        if (key === 'z' && !e.shiftKey) ctx.handleUndo()
        else ctx.handleRedo()
        return
      }

      const typing = inFormField || inCanvasTextEdit

      if (typing) {
        if (e.key === 'Escape' && ctx.editingTextId) {
          e.preventDefault()
          setEditingTextId(null)
        }
        return
      }
      const selectionIds = ctx.multiSelectIds.length
        ? ctx.multiSelectIds
        : [ctx.selectedElementId].filter(Boolean)

      if (ctx.viewOnly) {
        const allowed =
          (mod && (key === '=' || key === '+' || key === '-')) ||
          (mod && key === 'enter')
        if (
          !allowed &&
          (mod ||
            e.key === 'Delete' ||
            e.key === 'Backspace' ||
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '[', ']'].includes(e.key))
        ) {
          e.preventDefault()
          ctx.askOwner()
        }
        if (mod && key === 'enter') {
          e.preventDefault()
          setPresentOpen(true)
        }
        if (mod && (key === '=' || key === '+')) {
          e.preventDefault()
          setCanvasZoom((z) => Math.min(200, z + 10))
        }
        if (mod && key === '-') {
          e.preventDefault()
          setCanvasZoom((z) => Math.max(40, z - 10))
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setEditingTextId(null)
        setSelectedElementId(null)
        setMultiSelectIds([])
        setQuickMenuOpen(false)
        return
      }

      if (
        ctx.selectedElementId &&
        (e.code === 'BracketRight' || e.code === 'BracketLeft' || e.key === ']' || e.key === '[')
      ) {
        const forward = e.code === 'BracketRight' || e.key === ']'
        const extreme = (mod && e.shiftKey) || (mod && e.altKey)
        e.preventDefault()
        if (extreme) {
          ctx.handleReorderSelected(forward ? 'toFront' : 'toBack')
        } else {
          ctx.handleReorderSelected(forward ? 'forward' : 'back')
        }
        return
      }

      if (mod && key === 'a') {
        e.preventDefault()
        const ids = (ctx.selectedSlide?.elements?.elements || []).map((el) => el.id)
        if (ids.length) {
          setMultiSelectIds(ids)
          setSelectedElementId(ids[0])
        }
        return
      }
      if (mod && key === 'd') {
        e.preventDefault()
        ctx.elementMutations.duplicateElement()
        return
      }
      if (mod && key === 'c') {
        e.preventDefault()
        ctx.elementMutations.copySelection(selectionIds)
        return
      }
      if (mod && key === 'x') {
        e.preventDefault()
        ctx.elementMutations.cutSelection(selectionIds, ctx.handleDeleteElement)
        return
      }
      if (mod && key === 'v') {
        e.preventDefault()
        ctx.elementMutations.pasteClipboard()
        return
      }
      if (mod && key === 'g' && !e.shiftKey) {
        e.preventDefault()
        ctx.elementMutations.groupSelection(selectionIds)
        return
      }
      if (mod && key === 'g' && e.shiftKey) {
        e.preventDefault()
        ctx.elementMutations.ungroupSelection()
        return
      }
      if (mod && key === 'l') {
        e.preventDefault()
        ctx.elementMutations.toggleLock()
        return
      }
      if (mod && key === 'enter') {
        e.preventDefault()
        setPresentOpen(true)
        return
      }
      if (mod && key === 'k') {
        e.preventDefault()
        setQuickMenuOpen(true)
        return
      }
      if (mod && (key === '=' || key === '+')) {
        e.preventDefault()
        setCanvasZoom((z) => Math.min(200, z + 10))
        return
      }
      if (mod && key === '-') {
        e.preventDefault()
        setCanvasZoom((z) => Math.max(40, z - 10))
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && ctx.selectedElementId) {
        e.preventDefault()
        ctx.handleDeleteElement()
        return
      }

      // Arrow nudge: immediate local move (1px / Shift 10px)
      if (
        selectionIds.length &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        ctx.nudgeSelectedElements(dx, dy, selectionIds)
      }
    }
    document.addEventListener('keydown', onKey, true)
    const onPointerUp = () => {
      placementHistoryArmedRef.current = true
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

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
    return <PptDeckOpenBoot title={deckTitle} />
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

        <svg className="aig-ai-star-grad" aria-hidden>
          <defs>
            <linearGradient id="aigAiStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary, #3b82f6)" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="aig-editor-nav-center">
          <InsertToolbar
            orientation="horizontal"
            clearanceLeft={showMinimap ? 276 : 88}
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
            fillElementId={
              (() => {
                const selected = selectedSlide?.elements?.elements?.find(
                  (el) => el.id === selectedElementId
                )
                if (!selected) return null
                if (isPptDeviceFrameElement(selected) || selected.type === 'image') {
                  return selectedElementId
                }
                return null
              })()
            }
            onFillElement={(content) => {
              if (!selectedElementId) return
              const selected = selectedSlide?.elements?.elements?.find(
                (el) => el.id === selectedElementId
              )
              if (isPptDeviceFrameElement(selected)) {
                handleFillDeviceFrame(selectedElementId, content)
              } else if (selected?.type === 'image') {
                handleFillImage(selectedElementId, content)
              }
            }}
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
          className={`aig-editor-main-scroll ${sidebarOpen ? 'is-sidebar-open' : ''} ${showMinimap ? 'is-minimap-open' : ''}`}
          style={{
            '--ppt-canvas-zoom': canvasZoom / 100,
          }}
          onMouseDown={(e) => {
            // Click outside any slide canvas clears the selected element
            if (e.target.closest?.('.aig-editor-canvas--stage, [data-element-id], .ppt-canvas-el-chrome, .aig-scroll-slide-hover-actions, .aig-canvas-controls, button, input, textarea, [contenteditable="true"]')) {
              return
            }
            setSelectedElementId(null)
            setEditingTextId(null)
            setMultiSelectIds([])
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
                      className={`aig-slide-action-btn aig-slide-action-btn--ai ${slideAiEditId === slide.id ? 'is-active' : ''}`}
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
                    showEmptyTextHint={!viewOnly && !isGenerating}
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
                    onStartTextEdit={handleStartTextEdit}
                    onEndTextEdit={handleEndTextEdit}
                    onTableCellChange={handleTableCellChange}
                    onImageAuthError={handleImageAuthError}
                    onFillDeviceFrame={handleFillDeviceFrame}
                    onFillImage={handleFillImage}
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
        </main>

        <div className="aig-canvas-controls" aria-label="Canvas zoom">
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
          onReorderLayers={handleReorderLayers}
          onApplyLayout={handleApplyLayout}
          onResetBackground={() => handleBackgroundColorChange(DEFAULT_SLIDE_BG)}
          onAddBackgroundImage={openMediaForBackground}
          onChangeTransition={handleChangeTransition}
          onChangeSlideStatus={handleChangeSlideStatus}
          onChangeElementContent={handleChangeElementContentWithBackground}
          onChangeElementPlacement={handleChangeElementPlacement}
          layoutSchemaMap={layoutSchemaMap}
          aspectRatio={aspectRatio || '16:9'}
          onToggleElementLock={() => elementMutations.toggleLock()}
          onReplaceImage={() =>
            setError(
              isPptDeviceFrameElement(selectedElement)
                ? 'Open Media and click or drag an image onto the selected device frame.'
                : 'Use Media panel with a selected image to replace.'
            )
          }
          onClearDeviceFrameScreen={handleClearDeviceFrameScreen}
          onCropImage={() => setCropModalOpen(true)}
          onToggleImageAsBackground={handleToggleImageAsBackground}
          onSpeakerNotesChange={elementMutations.updateSpeakerNotes}
          slideStyles={slideStyles}
          onSlideStylesChange={setSlideStyles}
          onBackgroundGradientChange={handleBackgroundGradientChange}
          onBackgroundColorChange={handleBackgroundColorChange}
          usedFontFamilies={usedFontFamilies}
        />

        <aside
          className={`aig-editor-minimap aig-editor-minimap--float ${showMinimap ? 'is-open' : ''}`}
          aria-label="Slides sidebar"
        >
          <div className="aig-minimap-shell">
            <div className="aig-minimap-head">
              {showMinimap ? (
                <div className="aig-minimap-head-row">
                  <strong>Slides</strong>
                  <span className="aig-minimap-panel-count">{localSlides.length}</span>
                  <span className="aig-minimap-head-spacer" />
                  {!viewOnly && (
                    <button
                      className="aig-minimap-collapse-btn"
                      type="button"
                      disabled={atDeckCap || isGenerating || busy}
                      onClick={() => openAddSlideModal(localSlides.length - 1)}
                      title="Add slide"
                      aria-label="Add slide"
                    >
                      <FiPlus size={16} />
                    </button>
                  )}
                  <button
                    className="aig-minimap-collapse-btn"
                    type="button"
                    onClick={() => setShowMinimap(false)}
                    title="Collapse slides"
                    aria-label="Collapse slides"
                    aria-expanded
                  >
                    <PanelLeftClose size={16} strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="aig-minimap-head-collapsed">
                  <button
                    className="aig-minimap-collapse-btn"
                    type="button"
                    onClick={() => setShowMinimap(true)}
                    title="Expand slides"
                    aria-label="Expand slides"
                    aria-expanded={false}
                  >
                    <PanelLeftOpen size={16} strokeWidth={1.75} aria-hidden />
                  </button>
                  {!viewOnly && (
                    <button
                      className="aig-minimap-collapse-btn"
                      type="button"
                      disabled={atDeckCap || isGenerating || busy}
                      onClick={() => openAddSlideModal(localSlides.length - 1)}
                      title="Add slide"
                      aria-label="Add slide"
                    >
                      <FiPlus size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {showMinimap ? (
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
            ) : (
              <div className="aig-minimap-rail-slides">
                {localSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`aig-minimap-rail-num ${selectedSlideId === slide.id ? 'is-active' : ''}`}
                    title={`Slide ${idx + 1}`}
                    aria-label={`Slide ${idx + 1}`}
                    aria-current={selectedSlideId === slide.id ? 'true' : undefined}
                    onClick={() => {
                      setSelectedSlideId(slide.id)
                      setSelectedElementId(null)
                      setEditingTextId(null)
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
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
