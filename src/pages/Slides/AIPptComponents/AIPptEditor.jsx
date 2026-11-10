import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EditorErrorBoundary from '../../../components/ui/EditorErrorBoundary/EditorErrorBoundary.jsx'
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
  FiExternalLink,
  FiCheck,
  FiRefreshCw,
} from 'react-icons/fi'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { MdDragIndicator, MdOutlineColorLens, MdRotateRight } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { THEMES } from '../../../constants/pptWizardThemes'
import InsertToolbar from './insert/InsertToolbar'
import EditorFileMenu from './insert/EditorFileMenu'
import EditorRightRail from './insert/EditorRightRail'
import AddSlideModal from './insert/AddSlideModal'
import PptCanvasElement from './PptCanvasElement'
import PptCanvasGuidesOverlay from './PptCanvasGuidesOverlay'
import PptCanvasTextSafeAreaOverlay from './PptCanvasTextSafeAreaOverlay'
import { textElementsInDangerZone } from '../../../utils/slideTextSafeArea.js'
import PresentMode from './PresentMode'
import SharePresentationModal from './SharePresentationModal'
import ExportPresentationModal from './ExportPresentationModal'
import ConvertToTemplateModal from './ConvertToTemplateModal'
import ImageCropModal from './ImageCropModal'
import PptQuickMenu from './PptQuickMenu'
import PptElementContextMenu from './PptElementContextMenu'
import SlideEditAiPanel from './SlideEditAiPanel'
import MinimapSlideCard from './MinimapSlideCard'
import MinimapInsertGap from './MinimapInsertGap'
import PptConfirmModal from './PptConfirmModal'
import PptDeckOpenBoot from './PptDeckOpenBoot'
import { usePptEditorHistory } from '../../../hooks/usePptEditorHistory'
import { usePptElementMutations } from './usePptElementMutations'
import { computePptSmartGuides } from '../../../utils/pptSmartGuides'
import {
  canPptGroup,
  canPptUngroup,
  applyPptElementPatch,
  collectPptMoveIds,
  expandPptSelectionIds,
  groupPlacementChildPatches,
  isPptGroup,
  nextPptLayer,
  pptOrderFromLayerList,
  pptStackOrder,
  reorderPptElements,
  groupScaleForResize,
  placementPatchesChangeContent,
  resizePptGroupPatches,
  rotatePptGroupPatches,
  setPptGroupScaling,
  startPptGroupResize,
} from '../../../utils/pptGroupUtils'
import { groupEffectChildPatches } from '../../../utils/elementEffects'
import { isPptHitThroughElement } from '../../../utils/pptHitThrough'
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
import workspaceService from '../../../services/workspaceService'
import { normalizeWorkspace, extractUserId } from '../../TeamWorkspace/workspaceUtils'
import {
  beginAssignSlide,
  canManageAssignment,
  finishAssignSlide,
  optimisticAssigneeFromMembers,
  rollbackAssignSlide,
} from '../../../utils/assignmentFlow'
import { extractShareToken, getOrCreateViewerSessionId } from '../../../utils/pptShareSession'
import { savePresentationEditorSession } from '../../../utils/presentationEditorSession'
import PptPresenceAvatars from './PptPresenceAvatars'
import usePptPresence from './usePptPresence'
import usePresentationPresenter from './usePresentationPresenter'
import brandKitService from '../../../services/brandKitService'
import { listBrandKitsUsableInWorkspace } from '../../../utils/brandKitWorkspace'
import { dedupeBrandKitList, primaryLogoUrlFromKit, brandKitInitials } from '../../../utils/brandKitHelpers'
import assetService from '../../../services/assetService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import {
  PPT_CAPS,
  buildCanvasDoc,
  extractElementFromMutation,
  extractSlideFromMutation,
  extractSlidesFromPresentation,
  extractDeckPackId,
  extractAppliedBrandKitId,
  extractGenerationPrompt,
  getSlideImage,
  normalizeElementPresets,
  normalizeApiShape,
  normalizeElementPlacement,
  normalizeSlideForEditor,
  resolveCanvasSize,
  resolveSlideStageBackground,
  resolveThemeColor,
  patchFromBackgroundFill,
  toApiThemeId,
} from '../../../utils/presentationHelpers'
import { resolveThemeVisual } from '../../../utils/pptThemeVisual'
import { coercePlainText } from '../../../utils/pptTextContent'
import { deckTitleFromSlides, exportDeckTitle, isDefaultDeckTitle } from '../../../utils/deckTitle'
import { cropChanged, normalizeCrop, placementForCrop } from '../../../utils/imageCrop'
import {
  imageFilesFromDataTransfer,
  imagePlacementForPage,
  isImageFile,
  readImageSize,
} from '../../../utils/imageUploadFormat'
import {
  copiedElementsText,
  useBlockStrayFileDrops,
  useEditorClipboard,
} from '../../../hooks/useEditorClipboard'
import {
  createTextHeightFloor,
  findSiblingShell,
  keepTextBoxTallEnough,
  textBoxShrinksToFit,
} from '../../../utils/textBoxEditing'
import { compileDeckLayoutToElements, buildThemeCompileOptions } from '../../../utils/compileDeckLayoutToElements'
import { resolveStageElements } from '../../../utils/slideStageElements'
import { resolveLayoutSchemaById } from '../../../utils/deckLayoutRegistry'
import {
  layoutSchemaHasCanvasElements,
  resolveLayoutCanvasElementsDoc,
} from '../../../utils/videoTemplateToCanvasElements'
import {
  applyCompiledLayoutToSlide,
  fetchLayoutSchemaMap,
  rebindSlideContentLocally,
  repairPresentationLayoutSlides,
} from '../../../utils/layoutCanvasService'
import { rethemeSlidesGraphicElements } from '../../../utils/rethemeGraphicElements'
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
import { logCanvasGreySuspects } from '../../../utils/canvasRenderDebug'
import { hydrateSlidesGraphicElements } from '../../../utils/hydrateGraphicElements'
import { resetSlideLoadQueue } from '../../../utils/slideLoadQueue'
import { takePreviewHandoff } from '../../../utils/deckPreviewCapture'
import SlideContentGate from './SlideContentGate'
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
  contentUsesInnerClipOrMask,
} from '../../../utils/canvasOverflowUtils'
import {
  clearImageMediaPatch,
  isLayoutBoundImageSlot,
} from '../../../components/ppt/EmptyImagePlaceholder'
import './pptEditorExtras.css'
import '../AIPptGenerator.css'

import { confirmDialog, promptDialog } from '../../../utils/appDialog'
const CANVAS_SAVE_DEBOUNCE_MS = 600

function isOptimisticSlideId(id) {
  const value = String(id || '')
  return value.startsWith('new-slide-') || value.startsWith('dup-slide-')
}

function createdSlideIdFromPayload(payload) {
  const slide = extractSlideFromMutation(payload)
  return (
    slide?.id ||
    payload?.id ||
    payload?.slideId ||
    payload?.slide?.id ||
    payload?.data?.id ||
    payload?._id ||
    null
  )
}

function normalizePlacementPatches(elementIdOrPatches, placement) {
  if (
    elementIdOrPatches &&
    typeof elementIdOrPatches === 'object' &&
    placement == null
  ) {
    return elementIdOrPatches
  }
  if (typeof elementIdOrPatches === 'string' && placement) {
    return { [elementIdOrPatches]: placement }
  }
  return {}
}

const TEXT_BORDER_DRAG_PX = 8
const TEXT_MIN_HEIGHT = 24

// Slide background keys to clear when another background kind is chosen. The full-canvas save
// replaces the stored doc, so it must be built from the slide *without* these, or the old
// image / gradient is written back and returns on reload.
const NO_BACKGROUND_IMAGE = {
  backgroundImage: undefined,
  backgroundImageFit: undefined,
  backgroundImageElementId: undefined,
}
const NO_BACKGROUND_GRADIENT = {
  backgroundGradientStart: undefined,
  backgroundGradientEnd: undefined,
  backgroundGradientAngle: undefined,
  backgroundGradientKind: undefined,
  backgroundGradientStops: undefined,
  backgroundFill: undefined,
}
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

/**
 * Layout device frames are chrome-only (`layoutSurface`): the screen picture is a separate
 * image element placed inside the frame. Returns that element so Replace / drop fill it.
 */
function findDeviceFrameScreenImage(frame, elements = []) {
  if (!frame?.content?.layoutSurface) return null
  const p = frame.placement || {}
  const inside = (el) => {
    const q = el.placement || {}
    const cx = (q.x || 0) + (q.width || 0) / 2
    const cy = (q.y || 0) + (q.height || 0) / 2
    return cx >= (p.x || 0) && cx <= (p.x || 0) + (p.width || 0) && cy >= (p.y || 0) && cy <= (p.y || 0) + (p.height || 0)
  }
  return (
    elements
      .filter((el) => el.id !== frame.id && el.type === 'image' && inside(el))
      .sort((a, b) => (b.layer || 0) - (a.layer || 0))[0] || null
  )
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
  isPrimary = false,
  selectedIds = [],
  editable,
  locked,
  editing,
  stageRef,
  chromeHost,
  allElements,
  onSelect,
  onContextMenu,
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
  const lastPatchesRef = useRef(null)
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
        if (drag.textFloor) {
          // Never crop text: the box stops at (or grows to) the height its text needs.
          const fitted = keepTextBoxTallEnough(next, start, drag.handle, drag.textFloor(next.width))
          if (fitted !== next) {
            next = {
              ...fitted,
              ...clampPlacementOverflow(fitted.x, fitted.y, fitted.width, fitted.height, canvasW, canvasH),
            }
          }
        }
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

      const patches =
        drag.mode === 'resize' && drag.groupResize
          ? resizePptGroupPatches(
              drag.groupResize,
              el.id,
              start,
              groupScaleForResize(drag.handle, start, next),
              drag.handle
            )
          : drag.mode === 'rotate' && drag.groupResize
            ? // Turning a group turns its children about the group's centre (not just the frame).
              rotatePptGroupPatches(drag.groupResize, el.id, start, (next.rotation || 0) - (start.rotation || 0))
            : { [el.id]: next }
      next = patches[el.id]
      lastPlacementRef.current = next
      if (drag.mode === 'move' && drag.moveIds?.length) {
        const primaryStart = drag.startPlacement
        const totalDx = next.x - (primaryStart.x || 0)
        const totalDy = next.y - (primaryStart.y || 0)
        for (const id of drag.moveIds) {
          if (id === el.id) continue
          const startP = drag.startPlacements?.[id]
          if (!startP) continue
          let nx = startP.x + totalDx
          let ny = startP.y + totalDy
          ;({ x: nx, y: ny } = clampPlacementOverflow(
            nx,
            ny,
            startP.width || 40,
            startP.height || 40,
            canvasW,
            canvasH
          ))
          patches[id] = { ...startP, x: nx, y: ny }
        }
      }
      lastPatchesRef.current = patches
      onPlacementLive?.(patches)
    }

    const onUp = (e) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      if (drag.groupResize) setPptGroupScaling(false)
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
      onPlacementCommit?.(lastPatchesRef.current || { [el.id]: lastPlacementRef.current || drag.startPlacement })
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
  }, [canvasW, canvasH, el.id, allElements, locked, isText, onGuidesChange, onPlacementCommit, onPlacementLive, stageRef, selectedIds])

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
    const moveIds =
      mode === 'move' ? collectPptMoveIds(allElements || [], selectedIds, el.id) : [el.id]
    const startPlacements = {}
    for (const id of moveIds) {
      const item = (allElements || []).find((itemEl) => itemEl.id === id)
      const ip = item?.placement || (id === el.id ? startPlacement : null)
      if (!ip) continue
      startPlacements[id] = {
        x: ip.x || 0,
        y: ip.y || 0,
        width: ip.width || 100,
        height: ip.height || 40,
        rotation: ip.rotation || 0,
        opacity: ip.opacity != null ? ip.opacity : 1,
      }
    }
    lastPatchesRef.current = { [el.id]: startPlacement }
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
      startPlacements,
      moveIds,
      moved: mode === 'resize' || mode === 'rotate',
      captureTarget: e.currentTarget,
      centerX,
      centerY,
      startPointerAngle: pointerAngleFromCenter(e.clientX, e.clientY, centerX, centerY),
      textFloor:
        // Every text box, including layout text that shrinks to fit, stops at the height its
        // text needs at its current size — resizing never crops lines away.
        mode === 'resize' && isText ? createTextHeightFloor(shellRef.current, startPlacement.width) : null,
      // Resizing a group resizes its children with it (text never shorter than its text).
      groupResize:
        (mode === 'resize' || mode === 'rotate') && isPptGroup(el)
          ? startPptGroupResize(el, allElements || [], {
              minHeightFor: (child, start) =>
                mode === 'resize' && isTextElement(child)
                  ? createTextHeightFloor(findSiblingShell(shellRef.current, child.id), start.width)?.(start.width)
                  : null,
            })
          : null,
    }
    if (dragRef.current.groupResize) setPptGroupScaling(true)
  }

  // A shell removed mid-resize (undo, page switch) must not leave the group-scaling flag on.
  useEffect(
    () => () => {
      if (dragRef.current?.groupResize) setPptGroupScaling(false)
    },
    []
  )

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
    if (isImageFile(file)) {
      const blobUrl = URL.createObjectURL(file)
      applyDroppedImage({
        url: blobUrl,
        src: blobUrl,
        alt: file.name,
        file,
      })
    }
  }

  const paintHitGraphic =
    el.type === 'graphic' && typeof el.content?.svg === 'string' && el.content.svg.includes('<svg')
  const hitThrough = isPptHitThroughElement(el)

  // A group's angle lives on its children; its frame stays axis-aligned around them.
  const frameRotation = el.type === 'group' ? 0 : p.rotation
  const frameStyle = {
    ...placementFrameStyle(p, canvasW, canvasH, {
      layer: el.layer,
      rotation: frameRotation,
      opacity: p.opacity,
    }),
    ...overflowPaintStyle({
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      rotation: frameRotation,
      canvasW,
      canvasH,
      selected,
      editing,
      outsideAlpha: 0.45,
      skipOverflowMask: contentUsesInnerClipOrMask(el.content),
    }),
    cursor: isText || !editable || locked ? 'pointer' : selected ? 'move' : 'pointer',
    touchAction: 'none',
    overflow: 'visible',
    outline: 'none',
    ...(paintHitGraphic || hitThrough ? { pointerEvents: 'none' } : null),
    ...(el.type === 'group' ? { pointerEvents: 'none', background: 'transparent' } : null),
    ...((p.opacity ?? 1) === 0 || ((p.width || 0) <= 2 && (p.height || 0) <= 2)
      ? { pointerEvents: 'none' }
      : null),
  }

  const inSelectedGroup = Boolean(el.groupId && selectedIds.includes(el.groupId))
  const isGroupEl = el.type === 'group'
  const showChrome = selected && editable && !locked && !editing && isPrimary && !inSelectedGroup
  const showOutline = selected && !editing && !showChrome && !inSelectedGroup && !isGroupEl
  const chromeFrameStyle = {
    ...placementFrameStyle(p, canvasW, canvasH, {
      layer: (el.layer || 0) + 1000,
      rotation: frameRotation,
      opacity: 1,
    }),
    outline: isPrimary && !locked ? '2px solid #3B82F6' : '2px solid #93c5fd',
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
        onSelect?.(el.id, e)
      }}
      onDoubleClick={(e) => {
        if (!editable || locked || !isText) return
        if (e.shiftKey || e.ctrlKey || e.metaKey) return
        e.stopPropagation()
        onSelect?.(el.id, e)
        onStartTextEdit?.(el.id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu?.(el.id, e)
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDown={(e) => {
        if (e.button === 2) return
        if (!editable || !selected || editing) return
        if (e.target.closest?.('.ppt-canvas-el-resize, .ppt-text-drag, .ppt-canvas-el-rotate')) return
        // Text moves from its body once selected (see EditableText); never from other parts.
        if (isText && !e.target.closest?.('.ppt-text-display')) return
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
      <div className={`ppt-canvas-el-body${isDeviceFrame ? ' ppt-canvas-el-body--device-frame' : ''}${el.content?.clipToSlot === false || el.role === 'heading' || el.role === 'title' || String(el.slotId || '').toUpperCase().includes('HEADING') || String(el.slotId || '').toUpperCase().includes('TITLE') ? ' ppt-canvas-el-body--no-clip' : ''}`}>{children}</div>
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
      {(showChrome || showOutline) &&
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
      {showOutline && !chromeHost ? (
        <div className="ppt-canvas-el-chrome" data-chrome-for={el.id} style={chromeFrameStyle} />
      ) : null}
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

const DANGER_ZONE_PREF_KEY = 'athena:ppt-show-danger-zone'

function readDangerZonePref() {
  try {
    return localStorage.getItem(DANGER_ZONE_PREF_KEY) !== '0'
  } catch {
    return true
  }
}

function writeDangerZonePref(on) {
  try {
    localStorage.setItem(DANGER_ZONE_PREF_KEY, on ? '1' : '0')
  } catch {
    /* private mode / blocked storage — the toggle still works for this session */
  }
}

function SlideStage({
  slide,
  themeVisual,
  aspectRatio,
  selectedElementId,
  selectedElementIds = [],
  editingTextId,
  editable = false,
  smartGuides = [],
  onSelectElement,
  onContextMenuElement,
  onPlacementLive,
  onPlacementCommit,
  onGuidesChange,
  onStartTextEdit,
  onEndTextEdit,
  onTableCellChange,
  onImageAuthError,
  onFillDeviceFrame,
  onFillImage,
  onDropImageFiles,
  showEmptyTextHint = false,
  showDangerZone = false,
}) {
  const stageRef = useRef(null)
  const [chromeHost, setChromeHost] = useState(null)
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const selectedIds =
    selectedElementIds?.length
      ? selectedElementIds
      : selectedElementId
        ? [selectedElementId]
        : []
  const palette = themeVisual?.palette || null
  // Same preparation Present uses (resolveStageElements), so both show the same slide.
  const elements = resolveStageElements(slide, canvas, palette)
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url
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
      onContextMenu={(e) => {
        if (e.target.closest?.('[data-element-id]')) return
        e.preventDefault()
      }}
      // Image files dropped on the slide (not on an image box, which takes the picture itself)
      // are added as new images where they were dropped.
      onDragOver={(e) => {
        if (!editable || !onDropImageFiles) return
        const types = Array.from(e.dataTransfer?.types || [])
        if (!types.includes('Files') || types.includes('application/json')) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={(e) => {
        if (!editable || !onDropImageFiles) return
        const files = imageFilesFromDataTransfer(e.dataTransfer)
        if (!files.length) return
        e.preventDefault()
        const point = stageRef.current
          ? pointerToCanvas(e.clientX, e.clientY, stageRef.current, canvas.width, canvas.height)
          : null
        onDropImageFiles(files, point)
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
                {coercePlainText(slide.title || slide.content?.title)}
              </h1>
              {(() => {
                const body = coercePlainText(
                  slide.subtitle ||
                    slide.content?.subtitle ||
                    slide.content?.body ||
                    (typeof slide.content === 'string' ? slide.content : '')
                )
                return body ? <p className="aig-slide-mock-body">{body}</p> : null
              })()}
              {Array.isArray(slide.description) && slide.description.length ? (
                <div className="aig-slide-mock-text" style={{ color: themeVisual.body }}>
                  <ul style={{ paddingLeft: '32px', margin: 0 }}>
                    {slide.description.map((pt, i) => {
                      const line = coercePlainText(pt)
                      return line ? (
                        <li key={i} style={{ marginBottom: '12px' }}>
                          {line}
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              ) : coercePlainText(slide.description) ? (
                <div className="aig-slide-mock-text" style={{ color: themeVisual.body }}>
                  <p style={{ margin: 0 }}>{coercePlainText(slide.description)}</p>
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
        {showDangerZone ? (
          <PptCanvasTextSafeAreaOverlay
            canvasW={canvas.width}
            canvasH={canvas.height}
            warnCount={textElementsInDangerZone(elements, canvas.width, canvas.height).length}
          />
        ) : null}
        <PptCanvasGuidesOverlay guides={smartGuides} canvasW={canvas.width} canvasH={canvas.height} />
        {hasElements
          ? elements.map((el, i) => (
              <InteractiveElementShell
                key={el.id || `el-${i}`}
                el={el}
                canvasW={canvas.width}
                canvasH={canvas.height}
                selected={
                  selectedIds.includes(el.id) ||
                  Boolean(el.groupId && selectedIds.includes(el.groupId))
                }
                isPrimary={selectedElementId === el.id}
                selectedIds={selectedIds}
                editable={editable}
                locked={!!el.locked}
                editing={editingTextId === el.id}
                stageRef={stageRef}
                chromeHost={chromeHost}
                allElements={elements}
                onSelect={onSelectElement}
                onContextMenu={onContextMenuElement}
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
                  selected={
                    selectedIds.includes(el.id) ||
                    Boolean(el.groupId && selectedIds.includes(el.groupId))
                  }
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
                    // Layout-bound text keeps its slot height (it shrinks its font instead).
                    // User-made boxes grow with their text up to the slide bottom; capping them
                    // at the current height left extra lines clipped once editing ended.
                    // Only text that still shrinks its font to fit is capped at its slot; once the
                    // user sets a font size (fit: false) it grows like any other box.
                    const slotMaxH = textBoxShrinksToFit(el)
                      ? el.content?.slotMaxHeight || el.placement?.height || curH
                      : canvas.height
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
        aria-hidden={!selectedIds.length}
      />
    </div>
  )
}

function AIPptEditor({
  outline = [],
  config = {},
  workspaceId: workspaceIdProp,
  presentationId: presentationIdProp,
  onBack,
  viewOnly = false,
  initialDeck = null,
  canOpenInEditor = false,
  canComment = false,
  canResolveComments = false,
  shareSession = null,
  onOpenInEditor,
  generatingBanner = '',
  presenceToken = '',
  onContentUpdated,
}) {
  const workspaceId = workspaceIdProp || config.workspaceId
  const presentationId = presentationIdProp || config.presentationId
  const { user, canAccessSuperadminPortal } = useAuth()

  const [localSlides, setLocalSlides] = useState(() => {
    if (viewOnly && initialDeck) {
      const fromDeck = extractSlidesFromPresentation(initialDeck)
      if (fromDeck.length) return fromDeck
    }
    return outline || []
  })
  const [showMinimap, setShowMinimap] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 1100
  )
  const [deckStatus, setDeckStatus] = useState('READY')
  const [aspectRatio, setAspectRatio] = useState(config.screenSize || config.aspectRatio || '16:9')
  const [loading, setLoading] = useState(
    viewOnly ? !initialDeck : Boolean(workspaceId && presentationId)
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [convertTemplateOpen, setConvertTemplateOpen] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState(null)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [themeTokens, setThemeTokens] = useState(null)
  const [fontCssUrl, setFontCssUrl] = useState(null)
  const [elementPresets, setElementPresets] = useState([])
  const [brandKits, setBrandKits] = useState([])
  const [brandKitOpen, setBrandKitOpen] = useState(false)
  const [applyingBrandKit, setApplyingBrandKit] = useState(false)
  const [appliedBrandKitId, setAppliedBrandKitId] = useState(
    () => extractAppliedBrandKitId(initialDeck, config)
  )
  const [deckTitle, setDeckTitle] = useState(config.title || 'Untitled Presentation')
  const [deckPackId, setDeckPackId] = useState(config.packId || null)
  const [workspaceInfo, setWorkspaceInfo] = useState(null)
  const [assigneeBusy, setAssigneeBusy] = useState(false)
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState(
    () => extractGenerationPrompt(initialDeck, config)
  )
  const [addSlideOpen, setAddSlideOpen] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(null)
  const [minimapTransitionAfterIndex, setMinimapTransitionAfterIndex] = useState(null)
  const [minimapMenuSlideId, setMinimapMenuSlideId] = useState(null)
  const [minimapDragId, setMinimapDragId] = useState(null)
  const [minimapDropIndex, setMinimapDropIndexState] = useState(null)
  // Mirrors the state so a drop never acts on a value from an older render.
  const minimapDropIndexRef = useRef(null)
  const setMinimapDropIndex = useCallback((next) => {
    const value = typeof next === 'function' ? next(minimapDropIndexRef.current) : next
    minimapDropIndexRef.current = value
    setMinimapDropIndexState(value)
  }, [])
  const [canvasZoom, setCanvasZoom] = useState(100)
  // Editor-only margin guide; a per-user preference, never saved into the deck.
  const [showDangerZone, setShowDangerZone] = useState(readDangerZonePref)
  const toggleDangerZone = useCallback(() => {
    setShowDangerZone((on) => {
      const next = !on
      writeDangerZonePref(next)
      return next
    })
  }, [])
  const [smartGuides, setSmartGuides] = useState([])
  const [editingTextId, setEditingTextId] = useState(null)
  const [presentOpen, setPresentOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [viewOnlyNotice, setViewOnlyNotice] = useState(false)
  const [shareToken, setShareToken] = useState(() => presenceToken || '')
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)
  const [slideAiEditId, setSlideAiEditId] = useState(null)
  // Slides with a regenerate in flight — only these are locked; the rest stay editable.
  const [regeneratingSlideIds, setRegeneratingSlideIds] = useState(() => new Set())
  const regeneratingSlideIdsRef = useRef(regeneratingSlideIds)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [deleteSlideId, setDeleteSlideId] = useState(null)
  const [slideStyles, setSlideStyles] = useState({
    headerFont: 'Inter',
    bodyFont: 'Inter',
    headerSize: 44,
    bodySize: 22,
  })
  const [multiSelectIds, setMultiSelectIds] = useState([])
  const [elementContextMenu, setElementContextMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [layoutSchemaMap, setLayoutSchemaMap] = useState({})
  const brandKitMenuRef = useRef(null)
  const brandKitLogoFetchRef = useRef(new Set())
  const canvasSaveTimers = useRef({})
  const elementPatchTimers = useRef({})
  const pendingPlacementRef = useRef({})
  const nudgeBurstTimerRef = useRef(null)
  const localSlidesRef = useRef(localSlides)
  const selectedSlideIdRef = useRef(null)
  const selectedElementIdRef = useRef(null)
  const multiSelectIdsRef = useRef([])
  const elementMutationsRef = useRef(null)
  const layoutRepairPassRef = useRef('')
  const slideContainerRefs = useRef({})
  const minimapItemRefs = useRef({})
  const slideSelectSourceRef = useRef(null)
  const keyCtxRef = useRef({})
  const placementHistoryArmedRef = useRef(true)
  const skipTextCommitRef = useRef(false)
  const slidePersistQueueRef = useRef(Promise.resolve())
  const slideIdMapRef = useRef({})
  const minimapDragIdRef = useRef(null)

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
    multiSelectIdsRef.current = multiSelectIds
  }, [multiSelectIds])

  useEffect(() => {
    history.reset()
  }, [workspaceId, presentationId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (config.title) setDeckTitle(config.title)
  }, [config.title])

  // Assignee picker is TEAM-only and gated to OWNER/ADMIN — the editor otherwise
  // has no reason to know the caller's workspace role, so fetch it just for this.
  useEffect(() => {
    if (viewOnly || !workspaceId) {
      setWorkspaceInfo(null)
      return undefined
    }
    let cancelled = false
    workspaceService
      .getWorkspace(workspaceId)
      .then((raw) => {
        if (cancelled || !raw) return
        setWorkspaceInfo(normalizeWorkspace(raw, extractUserId(user), user))
      })
      .catch(() => {
        if (!cancelled) setWorkspaceInfo(null)
      })
    return () => {
      cancelled = true
    }
  }, [viewOnly, workspaceId, user])

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

  const isGeneratingEarly = String(deckStatus).toUpperCase() === 'GENERATING'
  useEffect(() => {
    if (viewOnly || isGeneratingEarly) return
    if (!Object.keys(layoutSchemaMap).length) return
    setLocalSlides((prev) => {
      if (!prev?.length) return prev
      let changed = false
      const next = prev.map((slide) => {
        const layoutId = slide.layoutId || slide.layout_id
        if (!layoutId) return slide
        const schema = layoutSchemaMap[layoutId] || resolveLayoutSchemaById(layoutId)
        const patched = rebindSlideContentLocally(slide, schema, {
          aspectRatio,
          themeTokens,
          palette: themeTokens?.palette || null,
        })
        if (patched !== slide) changed = true
        return patched
      })
      if (!changed) return prev
      localSlidesRef.current = next
      return next
    })
  }, [layoutSchemaMap, aspectRatio, themeTokens, viewOnly, isGeneratingEarly, deckStatus])

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
  const canvasSelectionIds = multiSelectIds.length
    ? multiSelectIds
    : [selectedElementId].filter(Boolean)
  const canvasElements = selectedSlide?.elements?.elements || []
  const canGroupSelection = canPptGroup(canvasElements, canvasSelectionIds)
  const canUngroupSelection = canPptUngroup(canvasElements, canvasSelectionIds)
  const selectionLocked =
    canvasSelectionIds.length > 0 &&
    canvasSelectionIds.every((id) => Boolean(canvasElements.find((el) => el.id === id)?.locked))
  const pendingDeleteSlide = localSlides.find((s) => s.id === deleteSlideId) || null
  const pendingDeleteTitle =
    pendingDeleteSlide?.title || pendingDeleteSlide?.content?.title || ''

  const selectSlide = useCallback((slideId, source = 'program') => {
    if (!slideId) return
    slideSelectSourceRef.current = source
    if (slideId === selectedSlideIdRef.current) {
      if (source === 'sidebar') {
        slideContainerRefs.current[slideId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    setSelectedSlideId(slideId)
    if (source === 'sidebar' || source === 'canvas') {
      setSelectedElementId(null)
      setEditingTextId(null)
      setMultiSelectIds([])
    }
  }, [])

  useEffect(() => {
    if (!selectedSlideId) return
    const source = slideSelectSourceRef.current
    slideSelectSourceRef.current = null
    if (!source) return

    const canvasNode = slideContainerRefs.current[selectedSlideId]
    const thumb = minimapItemRefs.current[selectedSlideId]

    if (source === 'canvas') {
      thumb?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      return
    }

    if (source === 'sidebar' || source === 'program') {
      if (source === 'program') {
        thumb?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      }
      canvasNode?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedSlideId, showMinimap])
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
  const selectCanvasElement = useCallback((slideId, id, event) => {
    if (viewOnly) return
    if (slideId && slideId !== selectedSlideIdRef.current) {
      setSelectedSlideId(slideId)
    }
    setElementContextMenu(null)
    if (!id) {
      setSelectedElementId(null)
      setMultiSelectIds((prev) => (prev.length ? [] : prev))
      setEditingTextId(null)
      return
    }
    const additive = !!(event?.shiftKey || event?.ctrlKey || event?.metaKey)
    const slide =
      localSlidesRef.current.find((s) => s.id === slideId) ||
      localSlidesRef.current.find((s) => s.id === selectedSlideIdRef.current)
    const els = slide?.elements?.elements || []
    const clicked = els.find((e) => e.id === id)
    const targetId = !additive && clicked?.groupId ? clicked.groupId : id

    if (additive) {
      setMultiSelectIds((prev) => {
        const curPrimary = selectedElementIdRef.current
        const base = prev.length ? prev : curPrimary ? [curPrimary] : []
        if (base.includes(targetId)) {
          const next = base.filter((x) => x !== targetId)
          setSelectedElementId(next[next.length - 1] || null)
          return next
        }
        setSelectedElementId(targetId)
        return [...base, targetId]
      })
      setEditingTextId(null)
      return
    }

    const currentMulti = multiSelectIdsRef.current
    const alreadySingle =
      selectedElementIdRef.current === targetId &&
      (currentMulti.length === 0 ||
        (currentMulti.length === 1 && currentMulti[0] === targetId))
    if (alreadySingle) return

    setSelectedElementId(targetId)
    setMultiSelectIds([targetId])
    setEditingTextId((prev) => (prev === targetId ? prev : null))
  }, [viewOnly])

  // `exact`: act on that element itself (a row in the Layers panel), not the group it is in.
  const openElementContextMenu = useCallback((slideId, id, event, { exact = false } = {}) => {
    if (viewOnly || !id || !event) return
    const els =
      (localSlidesRef.current.find((s) => s.id === slideId)?.elements?.elements || [])
    const clicked = els.find((e) => e.id === id)
    const targetId = clicked?.groupId && !exact ? clicked.groupId : id
    const current = multiSelectIdsRef.current.length
      ? multiSelectIdsRef.current
      : [selectedElementIdRef.current].filter(Boolean)
    if (!current.includes(targetId) && !current.includes(id)) {
      setSelectedSlideId(slideId)
      setSelectedElementId(targetId)
      setMultiSelectIds([targetId])
      setEditingTextId(null)
    } else if (slideId) {
      setSelectedSlideId(slideId)
    }
    setElementContextMenu({ x: event.clientX, y: event.clientY, slideId })
  }, [viewOnly])

  const askOwner = useCallback(() => {
    if (viewOnly) setViewOnlyNotice(true)
  }, [viewOnly])
  const previewCanComment = Boolean(
    canComment || shareSession?.canComment || shareSession?.linkRole === 'reviewer'
  )
  const previewCanResolve = Boolean(canResolveComments || shareSession?.canResolveComments)
  const { viewers, viewerCount, contentUpdatedAt, commentsUpdatedAt, presenter: guestPresenter } =
    usePptPresence({
      token: shareToken,
      workspaceId: viewOnly ? undefined : workspaceId,
      presentationId: viewOnly ? undefined : presentationId,
      slideIndex: selectedSlideIndex,
      enabled: viewOnly
        ? Boolean(shareToken) && !loading
        // Paused while Present is live for members — the dedicated presenter
        // hook below owns the same PUT presence route in that window.
        : Boolean(workspaceId && presentationId) && !loading && !presentOpen,
      onShareToken: setShareToken,
    })

  const presentIndexRef = useRef(0)
  const memberPresenter = usePresentationPresenter({
    workspaceId,
    presentationId,
    enabled: presentOpen && !viewOnly && Boolean(workspaceId && presentationId),
    getSlideIndex: () => presentIndexRef.current,
  })
  const presentPresence = viewOnly
    ? {
        presenter: guestPresenter,
        isPresenting: false,
        conflict: null,
        canPresent: false,
      }
    : {
        presenter: memberPresenter.presenter,
        isPresenting: memberPresenter.isPresenting,
        conflict: memberPresenter.conflict,
        canPresent: true,
        onStartPresenting: memberPresenter.startPresenting,
        onStopPresenting: memberPresenter.stopPresenting,
      }
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

    slides = rethemeSlidesGraphicElements(slides, tokens)

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

    // Paint slide shells immediately, then hydrate graphics one slide at a time.
    resetSlideLoadQueue()
    setLocalSlides(slides)
    localSlidesRef.current = slides
    slides = await hydrateSlidesGraphicElements(slides, {
      sequential: true,
      onSlideHydrated: (hydrated, idx) => {
        setLocalSlides((prev) => {
          const base = Array.isArray(prev) && prev.length ? prev : slides
          const next = [...base]
          next[idx] = hydrated
          localSlidesRef.current = next
          return next
        })
      },
    })
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
    const nextPrompt = extractGenerationPrompt(data, config)
    if (nextPrompt) setGenerationPrompt(nextPrompt)
    const nextBrandKitId = extractAppliedBrandKitId(data, config)
    if (nextBrandKitId) setAppliedBrandKitId(nextBrandKitId)
    if (data?.title || data?.presentation?.title) {
      setDeckTitle(data?.title || data?.presentation?.title)
    }
    if (slides[0]?.id) setSelectedSlideId((prev) => prev || slides[0].id)

    const resolvedFolderId =
      data?.folderId ||
      data?.project?.folderId ||
      data?.presentation?.folderId ||
      data?.deck?.folderId ||
      config?.folderId ||
      null
    if (workspaceId && presentationId) {
      savePresentationEditorSession({
        outline: [],
        config: {
          ...config,
          title: data?.title || data?.presentation?.title || config?.title,
          workspaceId,
          presentationId,
          folderId: resolvedFolderId,
        },
        workspaceId,
        presentationId,
        folderId: resolvedFolderId,
      })
    }

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
  }, [workspaceId, presentationId, config, viewOnly])

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

    if (localSlides.some((slide) => isOptimisticSlideId(slide.id))) return undefined

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
      if (regeneratingSlideIdsRef.current.has(slideId)) return
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

  const enqueueSlidePersist = useCallback((task) => {
    slidePersistQueueRef.current = slidePersistQueueRef.current
      .then(() => task())
      .catch(() => {})
  }, [])

  const resolvePersistedSlideId = useCallback((id) => {
    let current = id
    const seen = new Set()
    while (slideIdMapRef.current[current] && !seen.has(current)) {
      seen.add(current)
      current = slideIdMapRef.current[current]
    }
    return current
  }, [])

  const flushPendingCanvasSaves = useCallback(async ({
    onlySlideId = null,
    editedOnly = false,
    alsoSlideIds = [],
  } = {}) => {
    if (!workspaceId || !presentationId || viewOnly || isGenerating) return
    const timers = canvasSaveTimers.current
    // Slides with a save timer (pending, or already fired) were edited in this session.
    const edited = new Set(
      [...Object.keys(timers), ...alsoSlideIds].flatMap((id) => [id, resolvePersistedSlideId(id)])
    )
    if (onlySlideId) {
      // Single slide: only save if an edit is actually pending.
      if (!timers[onlySlideId]) return
      clearTimeout(timers[onlySlideId])
      delete timers[onlySlideId]
    } else {
      Object.keys(timers).forEach((slideId) => {
        clearTimeout(timers[slideId])
        delete timers[slideId]
      })
    }
    const slides = localSlidesRef.current || []
    const saves = slides
      .filter((s) => (onlySlideId ? s?.id === onlySlideId : true))
      .filter((s) => !editedOnly || edited.has(s?.id) || edited.has(resolvePersistedSlideId(s?.id)))
      // Regenerating slides are server-owned until they settle (canvas PUT returns 409).
      .filter((s) => !regeneratingSlideIdsRef.current.has(s?.id))
      .filter((s) => s?.id && s?.elements && !isOptimisticSlideId(s.id))
      .map((s) => {
        const id = resolvePersistedSlideId(s.id)
        if (isOptimisticSlideId(id)) return null
        return presentationService.saveCanvas(workspaceId, presentationId, id, s.elements)
      })
      .filter(Boolean)
    if (saves.length) await Promise.all(saves)
  }, [workspaceId, presentationId, viewOnly, isGenerating, resolvePersistedSlideId])

  // Export reads the saved deck, so every edit must be on the server first:
  // 1. element edits still waiting on their debounce are cancelled — their slides get a full
  //    canvas save below, which carries the same (latest) state;
  // 2. writes already on their way finish, so none can land after the save;
  // 3. queued slide changes (add / reorder / delete) finish;
  // 4. every slide edited in this session is saved with its latest canvas.
  // 5. the presentation's title is synced with the backend so export filenames match.
  const saveBeforeExport = useCallback(async () => {
    const waitingSlideIds = new Set(elementMutationsRef.current?.pendingPatchSlideIds?.() || [])
    elementMutationsRef.current?.cancelPendingPatches?.()
    Object.keys(elementPatchTimers.current).forEach((key) => {
      clearTimeout(elementPatchTimers.current[key])
      waitingSlideIds.add(key.slice(0, key.indexOf(':')))
    })
    elementPatchTimers.current = {}
    pendingPlacementRef.current = {}

    // An "Untitled" deck is named after its first slide's title (also the export file name).
    // Naming is a nicety: it must never stop the export (it used to throw on canvas-doc slides).
    let effectiveTitle = null
    if (isDefaultDeckTitle(deckTitle)) {
      const slideTitle = deckTitleFromSlides(localSlidesRef.current || localSlides)
      if (slideTitle) {
        effectiveTitle = slideTitle
        setDeckTitle(slideTitle)
      }
    }

    if (workspaceId && presentationId && effectiveTitle) {
      try {
        await workspaceService.updateProject(workspaceId, presentationId, { name: effectiveTitle })
      } catch (err) {
        console.error('Failed to sync presentation title before export:', err)
      }
    }

    await presentationService.waitForPendingWrites()
    await slidePersistQueueRef.current
    await flushPendingCanvasSaves({ editedOnly: true, alsoSlideIds: [...waitingSlideIds] })
    await presentationService.waitForPendingWrites()
  }, [flushPendingCanvasSaves, deckTitle, workspaceId, presentationId, localSlides])

  const handleOpenConvertTemplate = useCallback(() => {
    if (viewOnly) {
      askOwner()
      return
    }
    if (!presentationId) {
      setError('Save the presentation before converting to a template.')
      return
    }
    setConvertTemplateOpen(true)
  }, [viewOnly, presentationId, askOwner])

  const remapSlideId = useCallback((tempId, realId) => {
    if (!tempId || !realId || tempId === realId) return
    slideIdMapRef.current[tempId] = realId
    setLocalSlides((prev) => {
      const next = prev.map((slide) => (slide.id === tempId ? { ...slide, id: realId } : slide))
      localSlidesRef.current = next
      return next
    })
    slideSelectSourceRef.current = 'canvas'
    setSelectedSlideId((prev) => (prev === tempId ? realId : prev))
    if (minimapItemRefs.current[tempId]) {
      minimapItemRefs.current[realId] = minimapItemRefs.current[tempId]
      delete minimapItemRefs.current[tempId]
    }
    if (slideContainerRefs.current[tempId]) {
      slideContainerRefs.current[realId] = slideContainerRefs.current[tempId]
      delete slideContainerRefs.current[tempId]
    }
  }, [])

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
    setMultiSelectIds,
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

  const insertImageFilesRef = useRef(null)
  const editorClipboard = useEditorClipboard({
    enabled: !viewOnly && !isGenerating,
    hasElements: () => Boolean(elementMutationsRef.current?.hasClipboard?.()),
    onPasteElements: () => elementMutationsRef.current?.pasteClipboard?.(),
    onPasteImages: (files) => insertImageFilesRef.current?.(files),
  })
  useBlockStrayFileDrops(true)
  /** Plain text of the copied elements, for pasting into other apps. */
  const selectionClipboardText = useCallback(
    (ids) => {
      const slide =
        localSlidesRef.current.find((s) => s.id === selectedSlideIdRef.current) ||
        localSlidesRef.current.find((s) => s.id === selectedSlideId)
      const els = slide?.elements?.elements || []
      const expanded = expandPptSelectionIds(els, ids)
      return copiedElementsText(els.filter((el) => expanded.includes(el.id)))
    },
    [selectedSlideId]
  )

  const handleUndo = useCallback(() => {
    restoreHistorySnapshot(history.undo(currentHistorySnapshot()))
  }, [history, currentHistorySnapshot, restoreHistorySnapshot])

  const handleRedo = useCallback(() => {
    restoreHistorySnapshot(history.redo(currentHistorySnapshot()))
  }, [history, currentHistorySnapshot, restoreHistorySnapshot])

  const handleChangeElementContent = useCallback(
    (elementId, content) => {
      const slide =
        localSlidesRef.current.find((s) => s.id === selectedSlideIdRef.current) ||
        localSlidesRef.current.find((s) => s.id === selectedSlideId)
      const elements = slide?.elements?.elements || []
      const el = elements.find((item) => item.id === elementId)
      // An effect on a group (which draws nothing) is drawn by the elements inside it.
      const childPatches = isPptGroup(el) ? groupEffectChildPatches(elements, el, content) : {}
      const childIds = Object.keys(childPatches)
      if (!childIds.length) {
        elementMutations.patchElement(elementId, { content })
        return
      }
      pushHistorySnapshot()
      elementMutations.patchElement(elementId, { content }, { history: false })
      for (const id of childIds) {
        elementMutations.patchElement(id, { content: childPatches[id] }, { history: false })
      }
    },
    [elementMutations, pushHistorySnapshot, selectedSlideId]
  )

  const handleChangeElementPlacement = useCallback(
    (elementId, placement) => {
      const slide =
        localSlidesRef.current.find((s) => s.id === selectedSlideIdRef.current) ||
        localSlidesRef.current.find((s) => s.id === selectedSlideId)
      const elements = slide?.elements?.elements || []
      const el = elements.find((item) => item.id === elementId)
      // A group draws nothing itself: turning it or changing its transparency must reach the
      // elements inside, or only the empty frame changes.
      const childPatches = isPptGroup(el) ? groupPlacementChildPatches(elements, el, placement) : {}
      const childIds = Object.keys(childPatches)
      if (!childIds.length) {
        elementMutations.patchElement(elementId, { placement })
        return
      }
      pushHistorySnapshot()
      elementMutations.patchElement(elementId, { placement }, { history: false })
      for (const id of childIds) {
        elementMutations.patchElement(id, { placement: childPatches[id] }, { history: false })
      }
    },
    [elementMutations, pushHistorySnapshot, selectedSlideId]
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
      // Lets the text element know the edit was kept (undo deliberately drops it).
      return true
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

  const reorderSelectedRef = useRef(null)
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
          elementMutations.duplicateElement(ids)
          break
        case 'copy':
          if (viewOnly) { askOwner(); break }
          if (elementMutations.copySelection(ids)) editorClipboard.copyFromMenu(selectionClipboardText(ids))
          break
        case 'paste':
          if (viewOnly) { askOwner(); break }
          elementMutations.pasteClipboard()
          break
        case 'bring-forward':
        case 'send-backward':
        case 'bring-front':
        case 'send-back':
          if (viewOnly) { askOwner(); break }
          // Defined further down this component; reached through a ref.
          reorderSelectedRef.current?.(
            { 'bring-forward': 'forward', 'send-backward': 'back', 'bring-front': 'toFront', 'send-back': 'toBack' }[cmd]
          )
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
          elementMutations.ungroupSelection(ids)
          break
        case 'lock':
          if (viewOnly) { askOwner(); break }
          elementMutations.toggleLock(ids)
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
    [handleUndo, handleRedo, elementMutations, multiSelectIds, selectedElementId, selectedSlide, viewOnly, askOwner, editorClipboard, selectionClipboardText]
  )

  const handleCropApply = useCallback(
    ({ crop, fit, opacity, naturalWidth, naturalHeight }) => {
      if (!selectedElementId || !selectedElement) return
      const nextCrop = normalizeCrop(crop)
      // patchElement merges content, so a removed crop must be sent as null.
      // Opacity stays on the image only (also writing it to the frame squared it: 50% → 25%).
      elementMutations.patchElement(selectedElementId, {
        content: { ...selectedElement.content, fit, opacity, crop: nextCrop },
        placement: cropChanged(selectedElement.content?.crop, nextCrop)
          ? placementForCrop(selectedElement.placement, nextCrop, naturalWidth, naturalHeight)
          : selectedElement.placement,
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
          const next = { ...s, ...NO_BACKGROUND_IMAGE, ...patch }
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
          { ...slide, ...NO_BACKGROUND_IMAGE, ...patch },
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
                ...NO_BACKGROUND_GRADIENT,
                ...NO_BACKGROUND_IMAGE,
                elements: buildCanvasDoc(
                  { ...s, ...NO_BACKGROUND_GRADIENT, ...NO_BACKGROUND_IMAGE, backgroundColor: color },
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
          { ...slide, ...NO_BACKGROUND_GRADIENT, ...NO_BACKGROUND_IMAGE, backgroundColor: color },
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
      const slidePatch = enabled
        ? {
            ...NO_BACKGROUND_GRADIENT,
            backgroundImage: imageUrl,
            backgroundImageFit: el.content?.fit || 'cover',
            backgroundImageElementId: elementId,
          }
        : slide?.backgroundImageElementId === elementId
          ? NO_BACKGROUND_IMAGE
          : {}
      // Built from the patched slide: the canvas save replaces the stored doc wholesale.
      const nextDoc = buildCanvasDoc({ ...slide, ...slidePatch }, { aspectRatio, elements: nextElements })

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
                backgroundGradientAngle: null,
                backgroundGradientKind: null,
                backgroundGradientStops: null,
                backgroundFill: null,
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
    (slideId, elementIdOrPatches, placement) => {
      const patches = normalizePlacementPatches(elementIdOrPatches, placement)
      const ids = Object.keys(patches)
      if (!ids.length) return
      if (placementHistoryArmedRef.current) {
        placementHistoryArmedRef.current = false
        pushHistorySnapshot()
      }
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (s.id !== slideId) return s
          const elements = (s.elements?.elements || []).map((el) => applyPptElementPatch(el, patches[el.id]))
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
        localSlidesRef.current = next
        return next
      })
    },
    [aspectRatio, pushHistorySnapshot]
  )

  const handlePlacementCommit = useCallback(
    (slideId, elementIdOrPatches, placement) => {
      const patches = normalizePlacementPatches(elementIdOrPatches, placement)
      const ids = Object.keys(patches)
      if (!ids.length) return
      placementHistoryArmedRef.current = true
      if (!workspaceId || !presentationId || isGenerating || viewOnly) return

      // A group resize also scales its children's fonts: save the whole slide, not just placements.
      if (placementPatchesChangeContent(patches)) {
        const slide = localSlidesRef.current.find((s) => s.id === slideId)
        if (slide?.elements) queueCanvasSave(slideId, slide.elements)
        return
      }

      if (ids.length > 1) {
        for (const elementId of ids) {
          const key = `${slideId}:${elementId}`
          if (elementPatchTimers.current[key]) {
            clearTimeout(elementPatchTimers.current[key])
            delete elementPatchTimers.current[key]
          }
          delete pendingPlacementRef.current[key]
        }
        const batchKey = `${slideId}:__batch__`
        if (elementPatchTimers.current[batchKey]) {
          clearTimeout(elementPatchTimers.current[batchKey])
        }
        elementPatchTimers.current[batchKey] = setTimeout(async () => {
          delete elementPatchTimers.current[batchKey]
          const slide = localSlidesRef.current.find((s) => s.id === slideId)
          if (!slide?.elements) return
          const batchPatches = (slide.elements.elements || [])
            .filter((el) => ids.includes(el.id) && el.placement)
            .map((el) => ({ id: el.id, placement: el.placement }))
          if (!batchPatches.length) return
          try {
            await presentationService.batchUpdateElements(
              workspaceId,
              presentationId,
              slideId,
              batchPatches
            )
          } catch (err) {
            if (err instanceof PresentationConflictError) {
              setError('Presentation is generating — canvas edits are locked.')
              return
            }
            queueCanvasSave(slideId, slide.elements)
          }
        }, 320)
        return
      }

      const scheduleOne = (elementId, nextPlacement) => {
        const key = `${slideId}:${elementId}`
        pendingPlacementRef.current[key] = nextPlacement
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
      }

      for (const elementId of ids) {
        scheduleOne(elementId, patches[elementId])
      }
    },
    [workspaceId, presentationId, isGenerating, viewOnly, aspectRatio, queueCanvasSave]
  )

  /** Immediate local nudge + debounced persist (Canva-style keyboard move). */
  const nudgeSelectedElements = useCallback(
    (dx, dy, ids) => {
      const slideId = selectedSlideId
      if (!slideId || isGenerating || viewOnly || !ids?.length) return

      const slide = localSlidesRef.current.find((s) => s.id === slideId)
      if (!slide) return
      const idSet = new Set(
        collectPptMoveIds(slide.elements?.elements || [], ids.filter(Boolean), ids[0])
      )
      if (!idSet.size) return
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

      const patches = {}
      for (const { elementId, placement } of committed) {
        patches[elementId] = placement
      }
      handlePlacementCommit(slideId, patches)
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
        const handoff = takePreviewHandoff(presentationId)
        if (!cancelled && handoff?.slides?.length) {
          setLocalSlides(handoff.slides)
          localSlidesRef.current = handoff.slides
          if (handoff.themeTokens) setThemeTokens(handoff.themeTokens)
          if (handoff.fontCssUrl) setFontCssUrl(handoff.fontCssUrl)
          if (handoff.aspectRatio) {
            const a = handoff.aspectRatio === '9:16' ? '16:9' : handoff.aspectRatio
            setAspectRatio(a)
          }
          if (handoff.title) setDeckTitle(handoff.title)
          if (handoff.status) setDeckStatus(handoff.status)
          if (handoff.slides[0]?.id) setSelectedSlideId(handoff.slides[0].id)
          setLoading(false)
        }
        await reloadPresentation()
        const [kits, presetsPayload] = await Promise.all([
          listBrandKitsUsableInWorkspace(workspaceId).catch(() => []),
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
        const viewer = data?.viewer || data?.share?.viewer
        const reviewer = data?.reviewer || data?.share?.reviewer
        const token =
          extractShareToken(viewer?.token || viewer?.url) ||
          extractShareToken(reviewer?.token || reviewer?.url) ||
          extractShareToken(data?.share?.token || data?.token || data?.url)
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
    const nextPrompt = extractGenerationPrompt(initialDeck, config)
    if (nextPrompt) setGenerationPrompt(nextPrompt)
    const nextBrandKitId = extractAppliedBrandKitId(initialDeck, config)
    if (nextBrandKitId) setAppliedBrandKitId(nextBrandKitId)
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

  useEffect(() => {
    if (!brandKitOpen || viewOnly || !workspaceId || !brandKits.length) return undefined
    const missing = brandKits.filter((kit) => {
      if (primaryLogoUrlFromKit(kit)) return false
      return !brandKitLogoFetchRef.current.has(String(kit.id))
    })
    if (!missing.length) return undefined

    missing.forEach((kit) => brandKitLogoFetchRef.current.add(String(kit.id)))
    let cancelled = false
    Promise.all(
      missing.map((kit) =>
        brandKitService.get(kit.workspaceId || workspaceId, kit.id).catch(() => null)
      )
    ).then((details) => {
      if (cancelled) return
      const byId = new Map(
        details.filter(Boolean).map((detail) => [String(detail.id), detail])
      )
      if (!byId.size) return
      setBrandKits((prev) =>
        prev.map((kit) => {
          const detail = byId.get(String(kit.id))
          if (!detail) return kit
          return {
            ...kit,
            ...detail,
            media: Array.isArray(detail.media) && detail.media.length ? detail.media : kit.media,
          }
        })
      )
    })
    return () => {
      cancelled = true
    }
  }, [brandKitOpen, viewOnly, workspaceId, brandKits])

  const handleApplyBrandKit = async (brandKitId) => {
    if (viewOnly) {
      askOwner()
      return
    }
    if (!workspaceId || !presentationId || !brandKitId || isGenerating) return
    setApplyingBrandKit(true)
    setBrandKitOpen(false)
    setAppliedBrandKitId(String(brandKitId))
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

  // Assign/unassign is workflow-only (never gates who can open/edit) and only
  // exists on TEAM workspaces; OWNER/ADMIN can act, everyone else sees the avatar.
  const isTeamWorkspace = workspaceInfo?.type === 'workspace'
  const canManageAssignee = canManageAssignment(workspaceInfo)

  const loadWorkspaceMembers = () => {
    if (!canManageAssignee || workspaceMembers.length || membersLoading) return
    setMembersLoading(true)
    workspaceService
      .listWorkspaceMembers(workspaceId)
      .then((list) => setWorkspaceMembers(list || []))
      .catch(() => setWorkspaceMembers([]))
      .finally(() => setMembersLoading(false))
  }

  // Assignee is per-slide (a slide-level workflow tag), not per-deck — mirrors how
  // progressStatus/handleChangeSlideStatus above works, right down to the optimistic
  // update + rollback, but assignment gets its own dedicated endpoint (see spec: never
  // piggyback assigneeId onto the generic slide/project PATCH routes).
  const handleAssignSlideTo = async (userId) => {
    const slideId = selectedSlide?.id
    if (!workspaceId || !presentationId || !slideId || assigneeBusy) return
    setAssigneeBusy(true)
    setError('')
    const { previousAssignee } = beginAssignSlide(localSlides, slideId, userId, workspaceMembers)
    const optimisticUser = optimisticAssigneeFromMembers(workspaceMembers, userId)

    setLocalSlides((prev) => beginAssignSlide(prev, slideId, userId, workspaceMembers).slides)

    try {
      const result = await presentationService.updateSlideAssignee(workspaceId, presentationId, slideId, userId)
      const updatedSlide = extractSlideFromMutation(result)
      if (updatedSlide) {
        applySlideUpdate(updatedSlide)
      } else {
        setLocalSlides((prev) => finishAssignSlide(prev, slideId, userId, optimisticUser))
      }
    } catch (err) {
      setLocalSlides((prev) => rollbackAssignSlide(prev, slideId, previousAssignee))
      setError(err.message || 'Failed to update slide assignee')
    } finally {
      setAssigneeBusy(false)
    }
  }

  const openAddSlideModal = (afterIndex = null) => {
    if (atDeckCap || isGenerating || busy) return
    setMinimapTransitionAfterIndex(null)
    setAddAfterIndex(afterIndex == null ? localSlides.length - 1 : afterIndex)
    setAddSlideOpen(true)
  }

  const handleAddSlide = (index, options = {}) => {
    if (localSlidesRef.current.length >= PPT_CAPS.DECK_MAX_SLIDES || isGenerating) return

    const seed = options.seed || null
    const layoutId = options.layoutId || null
    const layoutSchema = options.schema || null
    const title = seed?.title || options.name || 'Blank Slide'
    const description = seed?.description ?? 'Double click to add content.'
    let seedElements = Array.isArray(seed?.elements) ? seed.elements : []
    const canvas = resolveCanvasSize(null, aspectRatio)
    const schema =
      layoutSchema ||
      (layoutId ? resolveLayoutSchemaById(layoutId, layoutSchemaMap) : null)
    if (!seedElements.length && schema?.slots?.length) {
      seedElements = compileDeckLayoutToElements(schema, {
        canvas,
        ...themeCompileOptions,
        slideTitle: title,
      })
    } else if (!seedElements.length && layoutSchemaHasCanvasElements(schema)) {
      seedElements = resolveLayoutCanvasElementsDoc(schema)?.elements || []
    }

    const tempId = `new-slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newSlide = {
      id: tempId,
      title,
      description,
      layoutId: layoutId || schema?.layout_id || null,
      elements: {
        version: 1,
        canvas,
        elements: seedElements,
      },
      transition: 'none',
      progressStatus: null,
      status: 'READY',
    }

    pushHistorySnapshot()
    setError('')
    setLocalSlides((prev) => {
      const next = [...prev]
      const insertAt = Math.max(0, Math.min(index + 1, next.length))
      next.splice(insertAt, 0, newSlide)
      localSlidesRef.current = next
      return next
    })
    selectSlide(tempId, 'sidebar')

    if (!workspaceId || !presentationId) return

    enqueueSlidePersist(async () => {
      if (!localSlidesRef.current.some((slide) => slide.id === tempId)) return
      try {
        const currentIdx = localSlidesRef.current.findIndex((slide) => slide.id === tempId)
        const prevSlide = currentIdx > 0 ? localSlidesRef.current[currentIdx - 1] : null
        const nextSlide =
          currentIdx >= 0 && currentIdx < localSlidesRef.current.length - 1
            ? localSlidesRef.current[currentIdx + 1]
            : null
        const afterSlideId =
          prevSlide && !isOptimisticSlideId(prevSlide.id) ? prevSlide.id : undefined
        const beforeSlideId =
          !afterSlideId && nextSlide && !isOptimisticSlideId(nextSlide.id)
            ? nextSlide.id
            : undefined
        const created = await presentationService.addSlide(workspaceId, presentationId, {
          afterSlideId,
          beforeSlideId,
          ...(title ? { title } : {}),
          ...(layoutId ? { layoutId } : {}),
        })
        const newSlideId = createdSlideIdFromPayload(created)
        if (!newSlideId) throw new Error('Failed to add slide')
        if (!localSlidesRef.current.some((slide) => slide.id === tempId)) {
          presentationService
            .deleteSlide(workspaceId, presentationId, newSlideId)
            .catch(() => {})
          return
        }
        remapSlideId(tempId, newSlideId)
        const latest = localSlidesRef.current.find((slide) => slide.id === newSlideId)
        if (latest?.elements) {
          await presentationService.saveCanvas(
            workspaceId,
            presentationId,
            newSlideId,
            latest.elements
          )
        }
      } catch (err) {
        setLocalSlides((prev) => {
          const next = prev.filter((slide) => slide.id !== tempId)
          localSlidesRef.current = next
          return next
        })
        setSelectedSlideId((prev) =>
          prev === tempId ? localSlidesRef.current[Math.max(0, index)]?.id || prev : prev
        )
        if (err instanceof PresentationConflictError) {
          setError('Presentation is generating — edits are locked until it finishes.')
        } else {
          setError(err.message || 'Failed to add slide')
        }
      }
    })
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

  const handleDuplicateSlide = (slideId) => {
    if (localSlidesRef.current.length >= PPT_CAPS.DECK_MAX_SLIDES || isGenerating) return
    const source = localSlidesRef.current.find((slide) => slide.id === slideId)
    if (!source) return

    const sourceIndex = localSlidesRef.current.findIndex((slide) => slide.id === slideId)
    const tempId = `dup-slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const clone = {
      ...JSON.parse(JSON.stringify(source)),
      id: tempId,
      status: 'READY',
      manuallyEdited: true,
    }

    pushHistorySnapshot()
    setError('')
    setLocalSlides((prev) => {
      const next = [...prev]
      next.splice(sourceIndex + 1, 0, clone)
      localSlidesRef.current = next
      return next
    })
    selectSlide(tempId, 'sidebar')

    if (!workspaceId || !presentationId) return

    enqueueSlidePersist(async () => {
      if (!localSlidesRef.current.some((slide) => slide.id === tempId)) return
      const persistSourceId = resolvePersistedSlideId(slideId)
      if (isOptimisticSlideId(persistSourceId)) return
      try {
        const created = await presentationService.duplicateSlide(
          workspaceId,
          presentationId,
          persistSourceId
        )
        const newSlideId = createdSlideIdFromPayload(created)
        if (!newSlideId) throw new Error('Failed to duplicate slide')
        if (!localSlidesRef.current.some((slide) => slide.id === tempId)) {
          presentationService
            .deleteSlide(workspaceId, presentationId, newSlideId)
            .catch(() => {})
          return
        }
        remapSlideId(tempId, newSlideId)
      } catch (err) {
        setLocalSlides((prev) => {
          const next = prev.filter((slide) => slide.id !== tempId)
          localSlidesRef.current = next
          return next
        })
        setSelectedSlideId((prev) => (prev === tempId ? persistSourceId : prev))
        setError(err.message || 'Failed to duplicate slide')
      }
    })
  }

  const handleDeleteSlide = (slideId) => {
    if (isGenerating || localSlidesRef.current.length <= 1) return
    setDeleteSlideId(slideId)
  }

  const confirmDeleteSlide = () => {
    const slideId = deleteSlideId
    setDeleteSlideId(null)
    if (!slideId || isGenerating || localSlidesRef.current.length <= 1) return

    const current = localSlidesRef.current
    const idx = current.findIndex((slide) => slide.id === slideId)
    if (idx < 0) return
    const fallbackId = (current[idx + 1] || current[idx - 1])?.id

    pushHistorySnapshot()
    setError('')
    setLocalSlides((prev) => {
      const next = prev.filter((slide) => slide.id !== slideId)
      localSlidesRef.current = next
      return next
    })
    if (selectedSlideIdRef.current === slideId) {
      selectSlide(fallbackId, 'sidebar')
    }

    if (!workspaceId || !presentationId) return

    enqueueSlidePersist(async () => {
      const persistId = resolvePersistedSlideId(slideId)
      if (isOptimisticSlideId(persistId)) return
      try {
        await presentationService.deleteSlide(workspaceId, presentationId, persistId)
      } catch (err) {
        setError(err.message || 'Failed to delete slide')
      }
    })
  }

  const persistSlideOrder = useCallback(() => {
    enqueueSlidePersist(async () => {
      if (!workspaceId || !presentationId) return
      const ids = localSlidesRef.current.map((slide) => resolvePersistedSlideId(slide.id))
      if (ids.length < 2 || ids.some(isOptimisticSlideId)) return
      try {
        await presentationService.reorderSlides(workspaceId, presentationId, ids)
      } catch (err) {
        setError(err.message || 'Failed to reorder slides')
      }
    })
  }, [workspaceId, presentationId, enqueueSlidePersist, resolvePersistedSlideId])

  const handleReorderSlides = useCallback(
    (fromIndex, dropIndex) => {
      const slides = localSlidesRef.current
      if (fromIndex == null || dropIndex == null) return
      if (fromIndex < 0 || fromIndex >= slides.length) return
      let insertAt = dropIndex
      if (fromIndex < dropIndex) insertAt -= 1
      insertAt = Math.max(0, Math.min(insertAt, slides.length - 1))
      if (insertAt === fromIndex) return

      pushHistorySnapshot()
      setMinimapMenuSlideId(null)
      setLocalSlides((prev) => {
        const next = [...prev]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(insertAt, 0, moved)
        localSlidesRef.current = next
        return next
      })
      persistSlideOrder()
    },
    [persistSlideOrder, pushHistorySnapshot]
  )

  const setSlideRegenerating = (slideId, on) => {
    setRegeneratingSlideIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(slideId)
      else next.delete(slideId)
      regeneratingSlideIdsRef.current = next
      return next
    })
  }

  // Regenerate (no prompt) or AI-edit (prompt + actionId) one slide; other slides stay editable.
  const handleSlideAiEdit = async (slide, { prompt, actionId, target = 'full' } = {}) => {
    if (!workspaceId || !presentationId || isGenerating) return
    if (regeneratingSlideIdsRef.current.has(slide.id)) return
    let overwriteManualEdits = false
    if (slide.manuallyEdited) {
      const ok = await confirmDialog(
        'This slide was edited manually. Regenerate and overwrite your changes?',
        { title: 'Overwrite manual edits?', confirmLabel: 'Overwrite', variant: 'danger' }
      )
      if (!ok) return
      overwriteManualEdits = true
    }
    try {
      // Persist this slide's pending edit first so the server works from the latest state.
      await flushPendingCanvasSaves({ onlySlideId: slide.id })
    } catch {
      // Overwrite is confirmed above; a failed flush shouldn't block the regenerate.
    }
    setSlideRegenerating(slide.id, true)
    setSlideAiEditId((prev) => (prev === slide.id ? null : prev))
    // A slide added in this session may still be known by its temporary id locally.
    const serverSlideId = resolvePersistedSlideId(slide.id)
    // Server limit; longer prompts were rejected outright (400) instead of being processed.
    const promptText = prompt ? String(prompt).slice(0, 2000) : ''
    const requestRegenerate = (overwrite) =>
      presentationService.regenerateSlide(workspaceId, presentationId, serverSlideId, {
        target,
        overwriteManualEdits: overwrite,
        ...(promptText ? { prompt: promptText } : {}),
        ...(actionId ? { action: actionId } : {}),
      })
    try {
      try {
        await requestRegenerate(overwriteManualEdits)
      } catch (err) {
        // The local "manually edited" flag is only read at load, but every edit in this
        // session marks the slide as edited on the server, which then refuses with 409.
        // Ask now (as we would have up front) and retry instead of failing silently.
        if (
          overwriteManualEdits ||
          !(err instanceof PresentationConflictError) ||
          !/manual edit/i.test(String(err.message || ''))
        ) {
          throw err
        }
        const ok = await confirmDialog(
          'This slide was edited manually. Regenerate and overwrite your changes?',
          { title: 'Overwrite manual edits?', confirmLabel: 'Overwrite', variant: 'danger' }
        )
        if (!ok) return
        setLocalSlides((prev) =>
          prev.map((s) => (s.id === slide.id ? { ...s, manuallyEdited: true } : s))
        )
        await requestRegenerate(true)
      }
      await presentationService.pollSlideUntilSettled(workspaceId, presentationId, serverSlideId, {
        intervalMs: 2000,
      })
      // Swap in just this slide so unsaved work on other slides is untouched.
      await refreshSlide(serverSlideId)
    } catch (err) {
      if (err?.status === 'FAILED') {
        // Refresh so the slide shows its failed state + Regenerate action instead of stale content.
        await refreshSlide(serverSlideId).catch(() => {})
        setError('Slide regeneration failed — try again.')
      } else if (err instanceof PresentationConflictError) {
        setError('Cannot overwrite — confirm overwrite or wait for generation to finish.')
      } else if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits')
      } else {
        setError(err.message || 'AI edit failed')
      }
    } finally {
      setSlideRegenerating(slide.id, false)
    }
  }

  const handleInsertElement = async (payload) => {
    // Latest slides, not this render's: inserts can arrive after an upload finishes, and a stale
    // copy would drop edits made while the file was uploading.
    const latestSlides = localSlidesRef.current
    const slideId = selectedSlideIdRef.current || selectedSlideId || latestSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = latestSlides.find((s) => s.id === slideId)
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
    if (['image', 'icon', 'graphic'].includes(type)) {
      if (!content.url && content.src) content.url = content.src
      if (content.url && !content.src) content.src = content.url
      if (content.strokeWidth == null) content.strokeWidth = 0
    }

    const localEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content,
      placement,
      // On top of everything on the slide ("count + 1" put it behind higher generated layers).
      layer: nextPptLayer(existing),
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
    setLocalSlides((prev) => {
      const next = prev.map((s) =>
        s.id === slideId
          ? { ...s, elements: optimisticDoc, backgroundColor: s.backgroundColor || DEFAULT_SLIDE_BG }
          : s
      )
      localSlidesRef.current = next
      return next
    })

    if (!workspaceId || !presentationId) return

    const persistInserted = async () => {
      try {
        const body =
          payload.presetId && !payload.content && !payload.placement
            ? { presetId: payload.presetId }
            : {
                type,
                placement,
                content,
                layer: nextPptLayer(existing),
                ...(payload.presetId ? { presetId: payload.presetId } : {}),
                ...(payload.role ? { role: payload.role } : {}),
              }

        const result = await presentationService.insertElement(
          workspaceId,
          presentationId,
          slideId,
          body
        )
        const elementFromApi = extractElementFromMutation(result)
        if (elementFromApi?.id) {
          setLocalSlides((prev) => {
            const next = prev.map((s) => {
              if (s.id !== slideId) return s
              const els = (s.elements?.elements || []).map((el) =>
                el.id === localEl.id ? { ...el, id: elementFromApi.id } : el
              )
              return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements: els }) }
            })
            localSlidesRef.current = next
            return next
          })
          setSelectedElementId((prev) => (prev === localEl.id ? elementFromApi.id : prev))
        }
        const latest = localSlidesRef.current.find((s) => s.id === slideId)
        if (latest?.elements) queueCanvasSave(slideId, latest.elements)
      } catch (err) {
        if (err instanceof PresentationConflictError) {
          setError('Presentation is generating — edits are locked until it finishes.')
          return
        }
        if (err?.status === 400) {
          setError(err.message || `Max ${PPT_CAPS.ELEMENTS_PER_SLIDE} elements per slide`)
          return
        }
        const latest = localSlidesRef.current.find((s) => s.id === slideId)
        if (latest?.elements) queueCanvasSave(slideId, latest.elements)
      }
    }

    void persistInserted()
  }

  const insertElementRef = useRef(null)
  insertElementRef.current = handleInsertElement

  /** Images pasted from the clipboard or dropped on the slide: uploaded, then added as new images. */
  const insertImageFiles = useCallback(
    async (files, { center = null } = {}) => {
      if (viewOnly || isGenerating || !files?.length) return
      if (!workspaceId) {
        setError('Workspace required to upload')
        return
      }
      const slide = localSlidesRef.current.find((s) => s.id === selectedSlideId) || localSlidesRef.current[0]
      if (!slide) return
      const page = resolveCanvasSize(slide, aspectRatio)
      setError('')
      setBusy(true)
      try {
        for (const [i, file] of files.slice(0, 10).entries()) {
          const size = await readImageSize(file)
          let asset
          try {
            asset = await assetService.uploadAsset(workspaceId, file)
          } catch (err) {
            setError(`Couldn't add ${file.name || 'that image'}: ${err?.message || 'upload failed'}`)
            continue
          }
          const url = asset?.url || asset?.cdnUrl || asset?.src || asset?.downloadUrl || ''
          if (!url) {
            setError(`Couldn't add ${file.name || 'that image'}: the upload returned no file URL`)
            continue
          }
          const step = i * 24
          const at = center ? { x: center.x + step, y: center.y + step } : step ? { x: page.width / 2 + step, y: page.height / 2 + step } : null
          const s3Key = asset?.key || asset?.s3Key
          await insertElementRef.current?.({
            type: 'image',
            placement: imagePlacementForPage(size, page, at),
            content: {
              url,
              src: url,
              alt: asset?.name || file.name || '',
              fit: 'cover',
              ...(asset?.id || asset?._id ? { assetId: asset.id || asset._id } : {}),
              ...(s3Key ? { s3Key } : {}),
            },
          })
        }
      } finally {
        setBusy(false)
      }
    },
    [viewOnly, isGenerating, workspaceId, selectedSlideId, aspectRatio]
  )
  insertImageFilesRef.current = insertImageFiles

  const handleDeleteElement = useCallback(async (elementIdArg) => {
    const slideId = selectedSlideId || localSlides[0]?.id
    const requested = Array.isArray(elementIdArg)
      ? elementIdArg.filter(Boolean)
      : typeof elementIdArg === 'string'
        ? [elementIdArg]
        : (multiSelectIds.length ? multiSelectIds : [selectedElementId].filter(Boolean))
    const elementId = requested[0]
    if (!slideId || !elementId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    const existing = slide?.elements?.elements || []
    const elements = Array.isArray(existing) ? existing : []

    if (requested.length > 1) {
      const hardDelete = new Set()
      for (const id of requested) {
        const target = elements.find((el) => el.id === id)
        if (!target) continue
        if (isLayoutBoundImageSlot(target)) {
          const hasMedia = Boolean(
            target.content?.url ||
              target.content?.src ||
              target.content?.thumbnailUrl ||
              target.content?.previewUrl
          )
          if (hasMedia) {
            await elementMutations.patchElement(id, { content: clearImageMediaPatch() })
          }
          continue
        }
        hardDelete.add(id)
        if (isPptGroup(target)) {
          for (const cid of target.childIds || []) hardDelete.add(cid)
        }
      }
      if (!hardDelete.size) {
        setSelectedElementId(null)
        setMultiSelectIds([])
        return
      }
      pushHistorySnapshot()
      const nextElements = elements
        .filter((el) => !hardDelete.has(el.id))
        .map((el) => {
          if (!isPptGroup(el)) return el
          const childIds = (el.childIds || []).filter((cid) => !hardDelete.has(cid))
          return { ...el, childIds }
        })
        .filter((el) => !(isPptGroup(el) && (el.childIds || []).length < 2))
      const clearingBackground = hardDelete.has(slide?.backgroundImageElementId)
      const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: nextElements })
      setLocalSlides((prev) => {
        const next = prev.map((s) =>
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
        localSlidesRef.current = next
        return next
      })
      setSelectedElementId(null)
      setMultiSelectIds([])
      if (!workspaceId || !presentationId) return
      queueCanvasSave(slideId, nextDoc)
      return
    }

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
    const removeIds = new Set([elementId])
    if (isPptGroup(target)) {
      for (const cid of target.childIds || []) removeIds.add(cid)
    }
    const nextElements = elements.filter((el) => !removeIds.has(el.id))
    const clearingBackground = removeIds.has(slide?.backgroundImageElementId)
    const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: nextElements })
    setLocalSlides((prev) => {
      const next = prev.map((s) =>
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
      localSlidesRef.current = next
      return next
    })
    setSelectedElementId(null)
    setMultiSelectIds([])

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
      if (removeIds.size === 1) {
        await presentationService.deleteElement(
          workspaceId,
          presentationId,
          slideId,
          elementId
        )
      } else {
        queueCanvasSave(slideId, nextDoc)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete element')
      const latest = localSlidesRef.current.find((s) => s.id === slideId)
      if (latest?.elements) queueCanvasSave(slideId, latest.elements)
    }
  }, [
    selectedSlideId,
    selectedElementId,
    multiSelectIds,
    localSlides,
    isGenerating,
    aspectRatio,
    workspaceId,
    presentationId,
    queueCanvasSave,
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
      setLocalSlides((prev) => {
        const next = prev.map((s) => (s.id === slideId ? { ...s, elements: nextDoc } : s))
        localSlidesRef.current = next
        return next
      })

      if (!workspaceId || !presentationId) return
      queueCanvasSave(slideId, nextDoc)
      presentationService
        .reorderElements(
          workspaceId,
          presentationId,
          slideId,
          layered.map((el) => el.id)
        )
        .catch(() => {
          queueCanvasSave(slideId, nextDoc)
        })
    },
    [
      localSlides,
      isGenerating,
      aspectRatio,
      workspaceId,
      presentationId,
      queueCanvasSave,
      pushHistorySnapshot,
    ]
  )

  // Bring forward / send backward / to front / to back for the whole selection, one step in the
  // order the slide is drawn (by layer) — not in the saved list order, which on generated slides
  // differs from it, so one click jumped several layers or seemed to do nothing.
  const handleReorderSelected = useCallback(
    async (direction) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      const ids = multiSelectIds.length ? multiSelectIds : [selectedElementId].filter(Boolean)
      if (!slideId || !ids.length || isGenerating) return

      const slide = localSlides.find((s) => s.id === slideId)
      const stacked = pptStackOrder(slide?.elements?.elements || [])
      const next = reorderPptElements(stacked, ids, direction)
      if (!next) return

      await persistElementOrder(slideId, next)
    },
    [
      selectedSlideId,
      selectedElementId,
      multiSelectIds,
      localSlides,
      isGenerating,
      persistElementOrder,
    ]
  )

  reorderSelectedRef.current = handleReorderSelected

  // A drag in the Layers panel (top = front). A dragged group brings its contents along.
  const handleReorderLayers = useCallback(
    (frontToBackIds, movedId) => {
      const slideId = selectedSlideId || localSlides[0]?.id
      if (!slideId || isGenerating || !frontToBackIds?.length) return

      const slide = localSlides.find((s) => s.id === slideId)
      const existing = slide?.elements?.elements || []
      persistElementOrder(slideId, pptOrderFromLayerList(existing, frontToBackIds, movedId))
    },
    [selectedSlideId, localSlides, isGenerating, persistElementOrder]
  )

  // Which layer moves are possible for the selection (greys out "Bring forward" at the top, …).
  // Text boxes on the current slide that reach into the danger zone (shown on the rail button).
  const dangerZoneCount = useMemo(() => {
    if (!selectedSlide) return 0
    const canvas = resolveCanvasSize(selectedSlide, aspectRatio)
    return textElementsInDangerZone(selectedSlide.elements?.elements || [], canvas.width, canvas.height).length
  }, [selectedSlide, aspectRatio])

  const layerMoves = useMemo(() => {
    const ids = multiSelectIds.length ? multiSelectIds : [selectedElementId].filter(Boolean)
    const stacked = pptStackOrder(selectedSlide?.elements?.elements || [])
    const can = (direction) => ids.length > 0 && reorderPptElements(stacked, ids, direction) != null
    return { forward: can('forward'), back: can('back') }
  }, [multiSelectIds, selectedElementId, selectedSlide])

  const handleImageAuthError = useCallback(() => {
    // Preview <img> in the design panel can 403 a signed URL on select.
    // Refreshing the whole slide here blanks the canvas; leave the broken
    // bitmap in place instead.
  }, [])

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

      if (imagePayload.file) {
        if (!workspaceId) {
          setError('Workspace required to upload')
          return
        }
        try {
          const asset = await assetService.uploadAsset(workspaceId, imagePayload.file)
          url =
            asset?.url ||
            asset?.cdnUrl ||
            asset?.src ||
            asset?.downloadUrl ||
            url
          assetId = asset?.id || asset?._id || assetId
        } catch (err) {
          // Saving the temporary blob: preview made the picture vanish after a reload.
          setError(`Couldn't upload ${imagePayload.file.name || 'that image'}: ${err?.message || 'upload failed'}`)
          return
        }
      }

      const frameSlide = localSlidesRef.current.find((sl) =>
        (sl.elements?.elements || []).some((el) => el.id === elementId)
      )
      const frameElements = frameSlide?.elements?.elements || []
      const screen = findDeviceFrameScreenImage(
        frameElements.find((el) => el.id === elementId),
        frameElements
      )
      if (screen && url) {
        // Layout frames only draw chrome; the picture belongs on their screen image element.
        await elementMutations.patchElement(screen.id, {
          content: {
            url,
            src: url,
            s3Key: imagePayload.s3Key || imagePayload.key || null,
            crop: null,
            fit: 'cover',
            ...(assetId ? { assetId } : {}),
            ...(imagePayload.alt != null ? { alt: imagePayload.alt } : {}),
          },
        })
        setSelectedElementId(screen.id)
        return
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
      let s3Key = imagePayload.s3Key || imagePayload.key || null

      if (imagePayload.file) {
        if (!workspaceId) {
          setError('Workspace required to upload')
          return
        }
        try {
          const asset = await assetService.uploadAsset(workspaceId, imagePayload.file)
          url =
            asset?.url ||
            asset?.cdnUrl ||
            asset?.src ||
            asset?.downloadUrl ||
            url
          assetId = asset?.id || asset?._id || assetId
          s3Key = asset?.key || asset?.s3Key || s3Key
        } catch (err) {
          // Saving the temporary blob: preview made the picture vanish after a reload.
          setError(`Couldn't upload ${imagePayload.file.name || 'that image'}: ${err?.message || 'upload failed'}`)
          return
        }
      }

      if (!url) return
      await elementMutations.patchElement(elementId, {
        content: {
          url,
          src: url,
          // The previous image's key must not survive: the server signs `s3Key` before `url`,
          // so a stale key brought the old picture back on reload/export. null = derive from url.
          s3Key,
          // A crop belongs to the old picture.
          crop: null,
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

  const replaceImageInputRef = useRef(null)
  const replaceImageTargetRef = useRef(null)

  const handleReplaceImage = useCallback(() => {
    if (!selectedElementId || viewOnly || isGenerating) return
    const screen = findDeviceFrameScreenImage(selectedElement, selectedSlide?.elements?.elements || [])
    replaceImageTargetRef.current = screen
      ? { id: screen.id, deviceFrame: false }
      : { id: selectedElementId, deviceFrame: isPptDeviceFrameElement(selectedElement) }
    replaceImageInputRef.current?.click()
  }, [selectedElementId, selectedElement, selectedSlide, viewOnly, isGenerating])

  const handleReplaceImageFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      const target = replaceImageTargetRef.current
      replaceImageTargetRef.current = null
      if (!file || !target?.id) return
      if (!file.type?.startsWith('image/')) {
        setError('Choose an image file to replace this image.')
        return
      }
      if (!workspaceId) {
        setError('Workspace required to upload')
        return
      }
      setError('')
      setBusy(true)
      try {
        // Upload first: the fill handlers would otherwise persist a temporary blob URL.
        const asset = await assetService.uploadAsset(workspaceId, file)
        const url = asset?.url || asset?.cdnUrl || asset?.src || asset?.downloadUrl || ''
        if (!url) throw new Error('Upload succeeded but no URL returned')
        const payload = {
          url,
          src: url,
          alt: asset?.name || file.name,
          assetId: asset?.id || asset?._id,
          s3Key: asset?.key || asset?.s3Key || null,
        }
        if (target.deviceFrame) {
          await handleFillDeviceFrame(target.id, payload)
        } else {
          await handleFillImage(target.id, payload)
        }
      } catch (err) {
        setError(err.message || 'Failed to replace image')
      } finally {
        setBusy(false)
      }
    },
    [workspaceId, handleFillDeviceFrame, handleFillImage]
  )

  const handleClearDeviceFrameScreen = useCallback(() => {
    if (!selectedElementId || !isPptDeviceFrameElement(selectedElement)) return
    elementMutations.patchElement(selectedElementId, {
      content: clearDeviceFrameScreenPatch(),
    })
  }, [selectedElementId, selectedElement, elementMutations])

  const handleApplyLayout = useCallback(
    async (templateId) => {
      const slideId = selectedSlideId || localSlidesRef.current[0]?.id
      if (!slideId || !templateId || isGenerating) return
      const slide = localSlidesRef.current.find((s) => s.id === slideId)
      if (!slide) return

      const originalElements = slide?.elements?.elements || []
      const originalContent =
        slide?.content && typeof slide.content === 'object' ? { ...slide.content } : {}
      if (slide?.imageRef && !originalContent.imageRef) {
        originalContent.imageRef = slide.imageRef
      }

      pushHistorySnapshot()
      setError('')
      setSelectedElementId(null)

      try {
        const canvasDoc = await applyCompiledLayoutToSlide({
          workspaceId,
          presentationId,
          slideId,
          templateId,
          layoutId: slide?.layoutId || slide?.layout_id || null,
          layoutSchemaMap,
          aspectRatio,
          ...themeCompileOptions,
          slideTitle: slide?.title || originalContent.title || '',
          slideContent: originalContent,
          mergeFromElements: originalElements,
          skipSave: true,
        })
        if (canvasDoc) {
          setLocalSlides((prev) => {
            const next = prev.map((s) =>
              s.id === slideId ? { ...s, elements: canvasDoc, layoutId: s.layoutId } : s
            )
            localSlidesRef.current = next
            return next
          })
          if (workspaceId && presentationId) queueCanvasSave(slideId, canvasDoc)
        }

        if (workspaceId && presentationId) {
          presentationService
            .applyLayout(workspaceId, presentationId, slideId, templateId)
            .catch(() => {})
        }
      } catch (err) {
        if (err instanceof PresentationConflictError) {
          setError('Cannot apply layout while generating.')
        } else {
          setError(err.message || 'Failed to apply layout')
        }
      }
    },
    [
      selectedSlideId,
      workspaceId,
      presentationId,
      isGenerating,
      layoutSchemaMap,
      aspectRatio,
      themeCompileOptions,
      queueCanvasSave,
      pushHistorySnapshot,
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
    editorClipboard,
    selectionClipboardText,
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
        setElementContextMenu(null)
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
        ctx.elementMutations.duplicateElement(selectionIds)
        return
      }
      // Copy/cut/paste go through the browser's clipboard events (see useEditorClipboard), so
      // an image copied in another app can be pasted, and copied elements still paste here.
      if (mod && key === 'c') {
        if (ctx.elementMutations.copySelection(selectionIds)) {
          ctx.editorClipboard.noteElementCopy(ctx.selectionClipboardText(selectionIds))
        }
        return
      }
      if (mod && key === 'x') {
        if (selectionIds.length) {
          ctx.editorClipboard.noteElementCopy(ctx.selectionClipboardText(selectionIds))
          ctx.elementMutations.cutSelection(selectionIds, ctx.handleDeleteElement)
        }
        return
      }
      if (mod && key === 'v') {
        ctx.editorClipboard.expectPaste()
        return
      }
      if (mod && key === 'g' && !e.shiftKey) {
        e.preventDefault()
        ctx.elementMutations.groupSelection(selectionIds)
        return
      }
      if (mod && key === 'g' && e.shiftKey) {
        e.preventDefault()
        ctx.elementMutations.ungroupSelection(selectionIds)
        return
      }
      if (mod && key === 'l') {
        e.preventDefault()
        ctx.elementMutations.toggleLock(selectionIds)
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

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectionIds.length) {
        e.preventDefault()
        ctx.handleDeleteElement(selectionIds)
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

  const handleChangeTransition = async (transitionId, targetSlideId) => {
    const slideId = targetSlideId || selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const slide = localSlides.find((s) => s.id === slideId)
    if (!slide) return
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

    queueCanvasSave(slideId, nextElements)
    presentationService
      .patchSlide(workspaceId, presentationId, slideId, {
        transition: transitionId,
      })
      .catch(() => {})
  }

  const closeMinimapTransition = useCallback(() => {
    setMinimapTransitionAfterIndex(null)
  }, [])

  const closeMinimapMenu = useCallback(() => {
    setMinimapMenuSlideId(null)
  }, [])

  const handleChangeSlideStatus = async (statusId, targetSlideId) => {
    const slideId = targetSlideId || selectedSlideId || localSlides[0]?.id
    if (!slideId || isGenerating) return

    const progressStatus =
      statusId == null || statusId === 'none' || statusId === 'NONE' ? null : statusId

    setLocalSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, progressStatus } : s))
    )

    if (!workspaceId || !presentationId) return

    // Progress-only PATCH — do not canvas-save (avoids flipping manuallyEdited).
    presentationService
      .patchSlide(workspaceId, presentationId, slideId, {
        progressStatus,
      })
      .catch(() => {})
  }

  const handleRename = async () => {
    if (viewOnly) {
      askOwner()
      return
    }
    const next = await promptDialog('Rename presentation', deckTitle || 'Untitled Presentation', {
      title: 'Rename presentation',
      confirmLabel: 'Rename',
      maxLength: 255,
    })
    if (next == null) return
    const trimmed = next.trim().slice(0, 255)
    if (!trimmed) return
    setDeckTitle(trimmed)
    if (workspaceId && presentationId) {
      try {
        await workspaceService.updateProject(workspaceId, presentationId, { name: trimmed })
      } catch (err) {
        console.error('Failed to persist presentation rename:', err)
      }
    }
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

  // Slide design → Background → Add image: pick a file, upload it, and use it as this
  // slide's background (it replaces any colour/gradient background).
  const backgroundImageInputRef = useRef(null)
  const backgroundImageSlideRef = useRef(null)
  const openMediaForBackground = useCallback(() => {
    if (viewOnly || isGenerating) return
    backgroundImageSlideRef.current = selectedSlideId || localSlides[0]?.id || null
    backgroundImageInputRef.current?.click()
  }, [viewOnly, isGenerating, selectedSlideId, localSlides])

  const handleBackgroundImageFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      const slideId = backgroundImageSlideRef.current
      backgroundImageSlideRef.current = null
      if (!file || !slideId) return
      if (!file.type?.startsWith('image/')) {
        setError('Choose an image file for the slide background.')
        return
      }
      if (!workspaceId) {
        setError('Workspace required to upload')
        return
      }
      setError('')
      setBusy(true)
      try {
        const asset = await assetService.uploadAsset(workspaceId, file)
        const url = asset?.url || asset?.cdnUrl || asset?.src || asset?.downloadUrl || ''
        if (!url) throw new Error('Upload succeeded but no URL returned')
        const slide = localSlidesRef.current.find((s) => s.id === slideId)
        if (!slide) return
        const slidePatch = {
          ...NO_BACKGROUND_GRADIENT,
          backgroundImage: url,
          backgroundImageFit: 'cover',
          backgroundImageElementId: undefined,
        }
        // An image element previously used as the background stops being one.
        const nextElements = (slide.elements?.elements || []).map((el) =>
          el.content?.useAsBackground ? { ...el, content: { ...el.content, useAsBackground: false } } : el
        )
        const nextDoc = buildCanvasDoc({ ...slide, ...slidePatch }, { aspectRatio, elements: nextElements })
        pushHistorySnapshot()
        setLocalSlides((prev) =>
          prev.map((s) => (s.id === slideId ? { ...s, ...slidePatch, elements: nextDoc } : s))
        )
        if (presentationId) {
          presentationService
            .patchSlide(workspaceId, presentationId, slideId, {
              backgroundImage: url,
              backgroundImageFit: 'cover',
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
      } catch (err) {
        setError(err.message || 'Could not set the background image')
      } finally {
        setBusy(false)
      }
    },
    [workspaceId, presentationId, aspectRatio, queueCanvasSave, pushHistorySnapshot]
  )

  if (loading) {
    return <PptDeckOpenBoot title={deckTitle} />
  }

  return (
    <EditorErrorBoundary label="PPT editor">
    <div className="aig-editor-container fade-in">
      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleReplaceImageFile}
      />
      <input
        ref={backgroundImageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleBackgroundImageFile}
      />
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
            onConvertToTemplate={
              canAccessSuperadminPortal && !viewOnly
                ? handleOpenConvertTemplate
                : undefined
            }
          />
          {presentationId && <span className="aig-editor-badge">Saved</span>}
        </div>

        <svg className="aig-ai-star-grad" aria-hidden>
          <defs>
            <linearGradient id="aigAiStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--primary-dark)" />
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
          <PptPresenceAvatars
            viewers={viewers}
            viewerCount={viewerCount}
            selfViewer={selfViewer}
          />
          {viewOnly && canOpenInEditor && (
            <button
              className="aig-editor-btn-secondary"
              type="button"
              onClick={onOpenInEditor}
              title="Open in editor"
              aria-label="Open in editor"
            >
              <FiExternalLink size={16} />
              <span className="aig-editor-btn-label">Open in editor</span>
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
              aria-label="Apply Brand Kit"
            >
              <MdOutlineColorLens size={16} />
              <span className="aig-editor-btn-label">{applyingBrandKit ? 'Applying…' : 'Brand Kit'}</span>
            </button>
            {brandKitOpen && (
              <div className="aig-export-dropdown aig-brandkit-dropdown" role="menu">
                {!brandKits.length && (
                  <p className="aig-brandkit-empty">No brand kits in this workspace</p>
                )}
                {brandKits.map((kit) => {
                  const selected = String(appliedBrandKitId) === String(kit.id)
                  const logoUrl = primaryLogoUrlFromKit(kit)
                  return (
                    <button
                      key={kit.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      className={`aig-brandkit-option ${selected ? 'is-selected' : ''}`}
                      onClick={() => handleApplyBrandKit(kit.id)}
                    >
                      <span className="aig-brandkit-option-logo" aria-hidden>
                        {logoUrl ? (
                          <img src={logoUrl} alt="" />
                        ) : (
                          <span>{brandKitInitials(kit.name)}</span>
                        )}
                      </span>
                      <span className="aig-brandkit-option-copy">
                        <span className="aig-brandkit-option-name">{kit.name}</span>
                        {kit.isDefault ? (
                          <span className="aig-brandkit-option-meta">Default</span>
                        ) : null}
                      </span>
                      {selected ? (
                        <FiCheck className="aig-brandkit-option-check" size={16} aria-hidden />
                      ) : (
                        <span className="aig-brandkit-option-check" aria-hidden />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          )}
          {!viewOnly && (
            <button
              className="aig-editor-btn-secondary"
              type="button"
              onClick={() => setShareOpen(true)}
              title="Share"
              aria-label="Share"
            >
              <FiShare2 size={16} />
              <span className="aig-editor-btn-label">Share</span>
            </button>
          )}
          <button
            className="aig-editor-btn-secondary"
            type="button"
            onClick={() => (viewOnly ? askOwner() : setExportModalOpen(true))}
            disabled={!viewOnly && (!presentationId || busy)}
            title="Export"
            aria-label="Export"
          >
            <FiDownload size={16} />
            <span className="aig-editor-btn-label">Export</span>
          </button>
          <button
            className="aig-editor-btn-primary"
            type="button"
            onClick={() => setPresentOpen(true)}
            title="Present"
            aria-label="Present"
          >
            <FiPlay size={16} />
            <span className="aig-editor-btn-label">Present</span>
          </button>
        </div>
      </nav>

      <PptQuickMenu
        open={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        onCommand={handleQuickCommand}
      />
      {elementContextMenu && !viewOnly ? (
        <PptElementContextMenu
          x={elementContextMenu.x}
          y={elementContextMenu.y}
          canGroup={canGroupSelection}
          canUngroup={canUngroupSelection}
          locked={selectionLocked}
          canPaste={elementMutations.hasClipboard()}
          hasSelection={canvasSelectionIds.length > 0}
          onClose={() => setElementContextMenu(null)}
          onCut={() => {
            const text = selectionClipboardText(canvasSelectionIds)
            elementMutations.cutSelection(canvasSelectionIds, handleDeleteElement)
            editorClipboard.copyFromMenu(text)
            setElementContextMenu(null)
          }}
          onCopy={() => {
            if (elementMutations.copySelection(canvasSelectionIds)) {
              editorClipboard.copyFromMenu(selectionClipboardText(canvasSelectionIds))
            }
            setElementContextMenu(null)
          }}
          onPaste={() => {
            elementMutations.pasteClipboard()
            setElementContextMenu(null)
          }}
          onDuplicate={() => {
            elementMutations.duplicateElement(canvasSelectionIds)
            setElementContextMenu(null)
          }}
          onDelete={() => {
            handleDeleteElement(canvasSelectionIds)
            setElementContextMenu(null)
          }}
          onGroup={() => {
            elementMutations.groupSelection(canvasSelectionIds)
            setElementContextMenu(null)
          }}
          onUngroup={() => {
            elementMutations.ungroupSelection(canvasSelectionIds)
            setElementContextMenu(null)
          }}
          onToggleLock={() => {
            elementMutations.toggleLock(canvasSelectionIds)
            setElementContextMenu(null)
          }}
          onAlign={(alignment) => {
            elementMutations.alignSelection(canvasSelectionIds, alignment)
            setElementContextMenu(null)
          }}
          onBringForward={() => {
            handleReorderSelected('forward')
            setElementContextMenu(null)
          }}
          onSendBackward={() => {
            handleReorderSelected('back')
            setElementContextMenu(null)
          }}
          onBringToFront={() => {
            handleReorderSelected('toFront')
            setElementContextMenu(null)
          }}
          onSendToBack={() => {
            handleReorderSelected('toBack')
            setElementContextMenu(null)
          }}
          canBringForward={layerMoves.forward}
          canSendBackward={layerMoves.back}
        />
      ) : null}

      <div
        className="aig-editor-workspace gamma-layout"
        style={{
          // Theme fonts for text that has none (stage + sidebar thumbnails).
          '--ppt-font-heading': slideStyles?.headerFont ? `"${slideStyles.headerFont}", sans-serif` : undefined,
          '--ppt-font-body': slideStyles?.bodyFont ? `"${slideStyles.bodyFont}", sans-serif` : undefined,
        }}
      >
        <main
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
            setElementContextMenu(null)
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
                onClick={() => selectSlide(slide.id, 'canvas')}
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
                      title="Regenerate slide"
                      type="button"
                      disabled={!viewOnly && (busy || isGenerating || regeneratingSlideIds.has(slide.id))}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (viewOnly) {
                          askOwner()
                          return
                        }
                        handleSlideAiEdit(slide, { target: 'full' })
                      }}
                    >
                      <FiRefreshCw size={15} />
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

                  {regeneratingSlideIds.has(slide.id) && (
                    <div
                      className="aig-slide-regenerating-overlay"
                      role="status"
                      aria-label="Regenerating slide"
                      style={{
                        position: 'absolute', inset: 0, zIndex: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(2px)',
                        color: '#334155', borderRadius: 0,
                      }}
                    >
                      {/* Circular arrow spinning a full 360° while the slide regenerates. */}
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <g>
                          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                          <polyline points="21 3 21 9 15 9" />
                          <animateTransform attributeName="transform" type="rotate"
                            from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                        </g>
                      </svg>
                    </div>
                  )}

                  {slide.status === 'FAILED' && !regeneratingSlideIds.has(slide.id) && (
                    <div
                      className="aig-slide-failed-banner"
                      style={{
                        position: 'absolute', top: 10, left: 10, right: 10, zIndex: 5,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)',
                        backdropFilter: 'blur(6px)', fontSize: 12.5, color: '#b91c1c',
                      }}
                    >
                      <span>This slide failed to generate and is showing placeholder content.</span>
                      {!viewOnly && (
                        <button
                          type="button"
                          disabled={busy || isGenerating}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSlideAiEdit(slide, { target: 'full' })
                          }}
                          style={{
                            flexShrink: 0, border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 6,
                            background: '#fff', color: '#b91c1c', fontWeight: 600, fontSize: 12,
                            padding: '4px 10px', cursor: busy || isGenerating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Regenerate
                        </button>
                      )}
                    </div>
                  )}

                  <SlideContentGate
                    slide={slide}
                    priority={selectedSlideId === slide.id || idx === 0}
                  >
                    <SlideStage
                      slide={slide}
                      themeVisual={themeVisual}
                      aspectRatio={aspectRatio}
                      editable={
                        !viewOnly &&
                        !isGenerating &&
                        !busy &&
                        !regeneratingSlideIds.has(slide.id) &&
                        selectedSlideId === slide.id
                      }
                      // Edit hint only on the slide being edited — other slides render empty boxes blank.
                      showEmptyTextHint={!viewOnly && !isGenerating && selectedSlideId === slide.id}
                      // Only the person editing sees it, and only on the slide they're working on.
                      showDangerZone={
                        showDangerZone &&
                        !viewOnly &&
                        !presentOpen &&
                        !isGenerating &&
                        selectedSlideId === slide.id
                      }
                      selectedElementId={
                        selectedSlideId === slide.id ? selectedElementId : null
                      }
                      selectedElementIds={
                        selectedSlideId === slide.id
                          ? multiSelectIds.length
                            ? multiSelectIds
                            : selectedElementId
                              ? [selectedElementId]
                              : []
                          : []
                      }
                      editingTextId={selectedSlideId === slide.id ? editingTextId : null}
                      smartGuides={selectedSlideId === slide.id ? smartGuides : []}
                      onSelectElement={(id, event) => {
                        if (viewOnly) return
                        selectCanvasElement(slide.id, id, event)
                      }}
                      onContextMenuElement={(id, event) => {
                        if (viewOnly) return
                        openElementContextMenu(slide.id, id, event)
                      }}
                      onPlacementLive={(elementIdOrPatches, placement) =>
                        handlePlacementLive(slide.id, elementIdOrPatches, placement)
                      }
                      onPlacementCommit={(elementIdOrPatches, placement) =>
                        handlePlacementCommit(slide.id, elementIdOrPatches, placement)
                      }
                      onGuidesChange={selectedSlideId === slide.id ? setSmartGuides : undefined}
                      onStartTextEdit={handleStartTextEdit}
                      onEndTextEdit={handleEndTextEdit}
                      onTableCellChange={handleTableCellChange}
                      onImageAuthError={handleImageAuthError}
                      onFillDeviceFrame={handleFillDeviceFrame}
                      onFillImage={handleFillImage}
                      onDropImageFiles={
                        selectedSlideId === slide.id
                          ? (files, point) => insertImageFiles(files, { center: point })
                          : undefined
                      }
                    />
                  </SlideContentGate>

                  <SlideEditAiPanel
                    open={slideAiEditId === slide.id}
                    slideTitle={
                      coercePlainText(slide.title || slide.content?.title) || `Slide ${idx + 1}`
                    }
                    disabled={viewOnly || isGenerating || busy}
                    busy={regeneratingSlideIds.has(slide.id)}
                    onClose={() => setSlideAiEditId(null)}
                    onSubmit={(payload) => handleSlideAiEdit(slide, payload)}
                    onRegenerate={() => handleSlideAiEdit(slide, { target: 'full' })}
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
          showDangerZone={showDangerZone}
          onToggleDangerZone={toggleDangerZone}
          dangerZoneCount={dangerZoneCount}
          deckStatus={deckStatus}
          generationPrompt={generationPrompt}
          slide={selectedSlide}
          themeVisual={themeVisual}
          workspaceId={workspaceId}
          presentationId={presentationId}
          disabled={isGenerating || busy}
          viewOnly={viewOnly}
          canComment={previewCanComment}
          canResolveComments={previewCanResolve}
          shareToken={shareToken}
          commentsUpdatedAt={commentsUpdatedAt}
          shareIsAnonymous={shareSession?.self?.isAnonymous !== false}
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
          onLayerContextMenu={(id, e) => openElementContextMenu(selectedSlide?.id, id, e, { exact: true })}
          onApplyLayout={handleApplyLayout}
          onResetBackground={() => handleBackgroundColorChange(DEFAULT_SLIDE_BG)}
          onAddBackgroundImage={openMediaForBackground}
          onChangeTransition={handleChangeTransition}
          onChangeSlideStatus={handleChangeSlideStatus}
          onChangeElementContent={handleChangeElementContentWithBackground}
          onChangeElementPlacement={handleChangeElementPlacement}
          layoutSchemaMap={layoutSchemaMap}
          aspectRatio={aspectRatio || '16:9'}
          onToggleElementLock={() => elementMutations.toggleLock(canvasSelectionIds)}
          onReplaceImage={handleReplaceImage}
          onClearDeviceFrameScreen={handleClearDeviceFrameScreen}
          onCropImage={() => setCropModalOpen(true)}
          onToggleImageAsBackground={handleToggleImageAsBackground}
          onSpeakerNotesChange={elementMutations.updateSpeakerNotes}
          slideStyles={slideStyles}
          onSlideStylesChange={setSlideStyles}
          onBackgroundGradientChange={handleBackgroundGradientChange}
          onBackgroundColorChange={handleBackgroundColorChange}
          usedFontFamilies={usedFontFamilies}
          isTeamWorkspace={isTeamWorkspace}
          canManageAssignee={canManageAssignee}
          assignee={selectedSlide?.assignee ?? null}
          assignedBy={selectedSlide?.assignedBy ?? null}
          assignedAt={selectedSlide?.assignedAt ?? null}
          assigneeSlideLabel={
            selectedSlide ? `Slide ${localSlides.findIndex((s) => s.id === selectedSlide.id) + 1}` : ''
          }
          assigneeBusy={assigneeBusy}
          workspaceMembers={workspaceMembers}
          membersLoading={membersLoading}
          onLoadAssigneeMembers={loadWorkspaceMembers}
          onAssignTo={handleAssignSlideTo}
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
                    onClick={() => {
                      setMinimapTransitionAfterIndex(null)
                      setMinimapMenuSlideId(null)
                      setShowMinimap(false)
                    }}
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
              <div
                className={`aig-minimap-scroll ${minimapDragId ? 'is-reordering' : ''}`}
                onDragOver={(e) => {
                  if (!minimapDragIdRef.current) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  const items = [...e.currentTarget.querySelectorAll('[data-minimap-slide]')]
                  const fromIndex = localSlidesRef.current.findIndex((s) => s.id === minimapDragIdRef.current)
                  // The card under the pointer is the target: the dragged slide takes its place
                  // (after it when moving down, before it when moving up). Previously only the
                  // lower half of the next card counted, so most drops were silently no-ops.
                  let overIndex = items.length - 1
                  for (let i = 0; i < items.length; i += 1) {
                    const rect = items[i].getBoundingClientRect()
                    if (e.clientY < rect.bottom) {
                      overIndex = i
                      break
                    }
                  }
                  const nextIndex =
                    fromIndex < 0 || overIndex === fromIndex
                      ? null
                      : overIndex > fromIndex
                        ? overIndex + 1
                        : overIndex
                  setMinimapDropIndex((prev) => (prev === nextIndex ? prev : nextIndex))
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const fromId =
                    minimapDragIdRef.current ||
                    e.dataTransfer.getData('application/x-athena-slide') ||
                    e.dataTransfer.getData('text/plain')
                  const fromIndex = localSlidesRef.current.findIndex((s) => s.id === fromId)
                  handleReorderSlides(fromIndex, minimapDropIndexRef.current)
                  minimapDragIdRef.current = null
                  setMinimapDragId(null)
                  setMinimapDropIndex(null)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setMinimapDropIndex(null)
                }}
              >
                {localSlides.map((slide, idx) => {
                  const nextSlide = localSlides[idx + 1]
                  const nextTransition =
                    nextSlide?.transition || nextSlide?.elements?.transition || 'none'
                  const betweenSlides = Boolean(nextSlide)
                  const dropEdge =
                    minimapDragId && minimapDropIndex === idx
                      ? 'before'
                      : minimapDragId &&
                          minimapDropIndex === localSlides.length &&
                          idx === localSlides.length - 1
                        ? 'after'
                        : null
                  return (
                    <Fragment key={slide.id}>
                      <MinimapSlideCard
                        slide={slide}
                        index={idx}
                        total={localSlides.length}
                        selected={selectedSlideId === slide.id}
                        viewOnly={viewOnly}
                        canDelete={localSlides.length > 1}
                        atDeckCap={atDeckCap}
                        disabled={isGenerating}
                        menuOpen={minimapMenuSlideId === slide.id}
                        dropEdge={dropEdge}
                        dragging={minimapDragId === slide.id}
                        themeVisual={themeVisual}
                        themeId={config.theme}
                        aspectRatio={aspectRatio}
                        layoutSchemaMap={layoutSchemaMap}
                        itemRef={(node) => {
                          if (node) minimapItemRefs.current[slide.id] = node
                          else delete minimapItemRefs.current[slide.id]
                        }}
                        onSelect={(id) => selectSlide(id, 'sidebar')}
                        onOpenMenu={(id) => {
                          setMinimapTransitionAfterIndex(null)
                          setMinimapMenuSlideId(id)
                        }}
                        onCloseMenu={closeMinimapMenu}
                        onDuplicate={() => handleDuplicateSlide(slide.id)}
                        onDelete={() => handleDeleteSlide(slide.id)}
                        onAddAfter={() => openAddSlideModal(idx)}
                        onMoveUp={() => handleReorderSlides(idx, idx - 1)}
                        onMoveDown={() => handleReorderSlides(idx, idx + 2)}
                        onEditAi={() => {
                          selectSlide(slide.id, 'sidebar')
                          setSelectedElementId(null)
                          setEditingTextId(null)
                          setSlideAiEditId((prev) => (prev === slide.id ? null : slide.id))
                        }}
                        onRegenerate={() => handleSlideAiEdit(slide, { target: 'full' })}
                        regenerating={regeneratingSlideIds.has(slide.id)}
                        onChangeStatus={(id, status) => handleChangeSlideStatus(status, id)}
                        onDragStart={(id) => {
                          minimapDragIdRef.current = id
                          setMinimapDragId(id)
                        }}
                        onDragEnd={() => {
                          minimapDragIdRef.current = null
                          setMinimapDragId(null)
                          setMinimapDropIndex(null)
                        }}
                      />
                      {!viewOnly && (
                        <MinimapInsertGap
                          disabled={isGenerating || busy}
                          addDisabled={atDeckCap || isGenerating || busy}
                          showTransition={betweenSlides}
                          hasTransition={betweenSlides && nextTransition !== 'none'}
                          transitionValue={nextTransition}
                          transitionOpen={minimapTransitionAfterIndex === idx}
                          onAdd={() => openAddSlideModal(idx)}
                          onToggleTransition={() =>
                            setMinimapTransitionAfterIndex((openIdx) => (openIdx === idx ? null : idx))
                          }
                          onPickTransition={(transitionId) => {
                            if (nextSlide?.id) handleChangeTransition(transitionId, nextSlide.id)
                            setMinimapTransitionAfterIndex(null)
                          }}
                          onCloseTransition={closeMinimapTransition}
                        />
                      )}
                    </Fragment>
                  )
                })}
              </div>
            ) : (
              <div className="aig-minimap-rail-slides">
                {localSlides.map((slide, idx) => (
                  <Fragment key={slide.id}>
                    <button
                      type="button"
                      className={`aig-minimap-rail-num ${selectedSlideId === slide.id ? 'is-active' : ''}`}
                      ref={(node) => {
                        if (node) minimapItemRefs.current[slide.id] = node
                        else delete minimapItemRefs.current[slide.id]
                      }}
                      title={`Slide ${idx + 1}`}
                      aria-label={`Slide ${idx + 1}`}
                      aria-current={selectedSlideId === slide.id ? 'true' : undefined}
                      onClick={() => selectSlide(slide.id, 'sidebar')}
                    >
                      {idx + 1}
                    </button>
                    {!viewOnly && (
                      <MinimapInsertGap
                        compact
                        addDisabled={atDeckCap || isGenerating || busy}
                        onAdd={() => openAddSlideModal(idx)}
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <PptConfirmModal
        open={Boolean(deleteSlideId)}
        title="Delete this slide?"
        message={
          pendingDeleteTitle
            ? `“${pendingDeleteTitle}” will be removed from this presentation.`
            : 'This slide will be removed from the presentation.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onClose={() => setDeleteSlideId(null)}
        onConfirm={confirmDeleteSlide}
      />

      <AddSlideModal
        open={addSlideOpen}
        onClose={() => setAddSlideOpen(false)}
        workspaceId={workspaceId}
        slideCount={localSlides.length}
        disabled={busy || isGenerating || atDeckCap}
        onPick={handlePickAddSlide}
        aspectRatio={aspectRatio}
        themeVisual={themeVisual}
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
          chrome={viewOnly ? 'audience' : 'presenter'}
          presence={presentPresence}
          onIndexChange={(i) => {
            presentIndexRef.current = i
          }}
          // Present is mounted outside the workspace that sets the deck's theme fonts.
          fontVars={{
            '--ppt-font-heading': slideStyles?.headerFont ? `"${slideStyles.headerFont}", sans-serif` : undefined,
            '--ppt-font-body': slideStyles?.bodyFont ? `"${slideStyles.bodyFont}", sans-serif` : undefined,
          }}
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
          title={exportDeckTitle(deckTitle, localSlides)}
          slideCount={localSlides.length}
          onBeforeExport={saveBeforeExport}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {convertTemplateOpen && presentationId && (
        <ConvertToTemplateModal
          presentationId={presentationId}
          defaultName={deckTitle}
          defaultThemeId={
            toApiThemeId(themeTokens?.wizardColorThemeId || config.theme) ||
            themeTokens?.wizardColorThemeId ||
            ''
          }
          slideCount={localSlides.length}
          onBeforePublish={flushPendingCanvasSaves}
          onClose={() => setConvertTemplateOpen(false)}
        />
      )}

      {cropModalOpen && selectedElement && (
        <ImageCropModal
          imageUrl={selectedElement.content?.url || selectedElement.content?.src}
          initialCrop={selectedElement.content?.crop}
          initialFit={selectedElement.content?.fit}
          initialOpacity={selectedElement.content?.opacity}
          onApply={handleCropApply}
          onClose={() => setCropModalOpen(false)}
        />
      )}
    </div>
    </EditorErrorBoundary>
  )
}

export default AIPptEditor
