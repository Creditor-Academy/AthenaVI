import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi'
import { MdRotateRight } from 'react-icons/md'
import PptCanvasElement from '../../Slides/AIPptComponents/PptCanvasElement'
import PptCanvasGuidesOverlay from '../../Slides/AIPptComponents/PptCanvasGuidesOverlay'
import { computePptSmartGuides } from '../../../utils/pptSmartGuides'
import { collectPptMoveIds } from '../../../utils/pptGroupUtils'
import {
  overflowPaintStyle,
  clampPlacementOverflow,
} from '../../../utils/canvasOverflowUtils'
import { exceedsDragThreshold } from '../../../utils/pointerDrag'
import {
  pointerAngleFromCenter,
  snapAngleStep,
  normalizeAngle,
} from '../../../utils/canvasTransformUtils'
import {
  parseCanvasDragData,
  resolveDropImageSrc,
  resolveDropAssetId,
} from '../../../utils/editorDragDrop'
import {
  isPptDeviceFrameElement,
} from '../../../components/ppt/DeviceFrameVisual'
import { resolveFillCss } from '../../../utils/presentationHelpers'

const DEFAULT_PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#172033',
  title: '#172033',
  accent: '#2563EB',
}

const RESIZE_MIN_WIDTH = 20
const RESIZE_MIN_HEIGHT = 20
const TEXT_MIN_HEIGHT = 20
const TEXT_BORDER_DRAG_PX = 8

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

function isCanvasElementLocked(el) {
  return Boolean(el?.locked || el?.placement?.locked)
}

function cssPxToCanvas(cssPx, stageEl, canvasSize) {
  const rect = stageEl?.getBoundingClientRect()
  if (!rect?.height) return cssPx
  return (cssPx / rect.height) * canvasSize
}

function minOverlapPx(size) {
  return Math.max(8, Math.round((size || 40) * 0.08))
}

function canvasSurfaceStyle(canvas, zoom) {
  const bg = canvas.background
  const fillCss =
    bg && typeof bg === 'object' ? resolveFillCss(bg) : bg || '#FFFFFF'
  return {
    width: `${canvas.width * zoom}px`,
    height: `${canvas.height * zoom}px`,
    aspectRatio: `${canvas.width} / ${canvas.height}`,
    backgroundColor: fillCss,
    backgroundImage: canvas.backgroundImage
      ? `url(${canvas.backgroundImage})`
      : undefined,
    backgroundSize: canvas.backgroundImageFit || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function applyResizeFromHandle(handle, start, dx, dy, canvasW, canvasH, minH) {
  const minW = RESIZE_MIN_WIDTH
  const minHeight = minH || RESIZE_MIN_HEIGHT
  let { x, y, width, height } = start
  const right = (start.x || 0) + (start.width || 100)
  const bottom = (start.y || 0) + (start.height || 40)
  const aspect = start.width > 0 && start.height > 0 ? start.width / start.height : 1
  const maxDim = Math.max(canvasW, canvasH) * 3

  if (handle === 'e') {
    width = clamp((start.width || 100) + dx, minW, maxDim)
  } else if (handle === 'w') {
    const nextX = (start.x || 0) + dx
    width = clamp(right - nextX, minW, maxDim)
    x = right - width
  } else if (handle === 's') {
    height = clamp((start.height || 40) + dy, minHeight, maxDim)
  } else if (handle === 'n') {
    const nextY = (start.y || 0) + dy
    height = clamp(bottom - nextY, minHeight, maxDim)
    y = bottom - height
  } else {
    // Corner: maintain aspect ratio
    let scaleX
    let scaleY
    if (handle === 'se') {
      scaleX = ((start.width || 100) + dx) / (start.width || 100)
      scaleY = ((start.height || 40) + dy) / (start.height || 40)
    } else if (handle === 'sw') {
      scaleX = ((start.width || 100) - dx) / (start.width || 100)
      scaleY = ((start.height || 40) + dy) / (start.height || 40)
    } else if (handle === 'ne') {
      scaleX = ((start.width || 100) + dx) / (start.width || 100)
      scaleY = ((start.height || 40) - dy) / (start.height || 40)
    } else {
      // nw
      scaleX = ((start.width || 100) - dx) / (start.width || 100)
      scaleY = ((start.height || 40) - dy) / (start.height || 40)
    }

    const scale =
      Math.abs(dx) * (1 / Math.max(start.width || 100, 1)) >=
      Math.abs(dy) * (1 / Math.max(start.height || 40, 1))
        ? scaleX
        : scaleY

    let nextW = Math.max(minW, (start.width || 100) * scale)
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
      x = start.x || 0
      y = start.y || 0
    } else if (handle === 'sw') {
      width = nextW
      height = nextH
      x = right - width
      y = start.y || 0
    } else if (handle === 'ne') {
      width = nextW
      height = nextH
      x = start.x || 0
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

function InteractiveCanvasElementShell({
  el,
  canvasW,
  canvasH,
  selected,
  isPrimary = false,
  selectedIds = [],
  editable = true,
  locked = false,
  editing = false,
  stageRef,
  allElements = [],
  onSelect,
  onContextMenu,
  onPlacementLive,
  onPlacementCommit,
  onGuidesChange,
  onStartTextEdit,
  onFillImage,
  onFillDeviceFrame,
  children,
}) {
  const p = el.placement || {}
  const dragRef = useRef(null)
  const shellRef = useRef(null)
  const lastPlacementRef = useRef(null)
  const lastPatchesRef = useRef(null)
  const isText = isTextElement(el)
  const isImageSlot = el.type === 'image' || el.type === 'icon'
  const isDeviceFrame = isPptDeviceFrameElement(el)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const fillHandler = isDeviceFrame ? onFillDeviceFrame : isImageSlot ? onFillImage : null
  const [rotateBadge, setRotateBadge] = useState(null)
  const acceptsImageFill =
    editable && !locked && typeof fillHandler === 'function' && (isDeviceFrame || isImageSlot)

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
        let nextX = (start.x || 0) + dx
        let nextY = (start.y || 0) + dy
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
      const patches = { [el.id]: next }
      if (drag.mode === 'move' && drag.moveIds?.length) {
        const primaryStart = drag.startPlacement
        const totalDx = next.x - (primaryStart.x || 0)
        const totalDy = next.y - (primaryStart.y || 0)
        for (const id of drag.moveIds) {
          if (id === el.id) continue
          const startP = drag.startPlacements?.[id]
          if (!startP) continue
          let nx = (startP.x || 0) + totalDx
          let ny = (startP.y || 0) + totalDy
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

  const applyDroppedImage = (payload) => {
    if (!fillHandler) return
    fillHandler(el.id, payload)
    onSelect?.(el.id)
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

  const beginDrag = (e, mode, handle = null) => {
    if (!editable || !stageRef?.current || locked || editing) return
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
    ...(el.type === 'group' ? { pointerEvents: 'none', background: 'transparent' } : null),
    ...((p.opacity ?? 1) === 0 || ((p.width || 0) <= 2 && (p.height || 0) <= 2)
      ? { pointerEvents: 'none' }
      : null),
  }

  const inSelectedGroup = Boolean(el.groupId && selectedIds.includes(el.groupId))
  const isGroupEl = el.type === 'group'
  const showChrome = selected && editable && !locked && !editing && isPrimary && !inSelectedGroup

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
        onContextMenu?.(e, el.id)
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        if (!editable || locked || editing) return
        if (e.target.closest?.('.ppt-canvas-el-resize, .ppt-text-drag, .ppt-canvas-el-rotate')) return
        if (e.target.closest?.('.ppt-table-cell-input, .ppt-text-editable')) return
        if (isText) return
        if (!selected) {
          onSelect?.(el.id, e)
        }
        beginDrag(e, 'move')
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

      {/* Permanent Selection Bounding Box Outline */}
      {selected && !editing && !inSelectedGroup && !isGroupEl && (
        <div
          className="ppt-canvas-el-selection-box"
          style={{
            position: 'absolute',
            inset: 0,
            border: locked ? '1.5px dashed #94a3b8' : '2px solid #3b82f6',
            borderRadius: p.borderRadius ? `${p.borderRadius}px` : '0px',
            pointerEvents: 'none',
            zIndex: 3,
            boxSizing: 'border-box',
          }}
        />
      )}

      {showChrome && (
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

export default function CanvasStage({
  canvases,
  activeCanvasIndex,
  setActiveCanvasIndex,
  zoom,
  showGrid,
  selectedId,
  editingId,
  multiSelectIds = [],
  onSelect,
  onEdit,
  onPlacementLive,
  onPlacementCommit,
  onTextChange,
  onTableCellChange,
  onFillImage,
  onFillDeviceFrame,
  onQuickAction,
  onContextMenu,
  onAddCanvas,
  onDuplicateCanvas,
  onDeleteCanvas,
}) {
  const surfaceRef = useRef(null)
  const [smartGuides, setSmartGuides] = useState([])

  const activeCanvas = canvases[activeCanvasIndex] || canvases[0]

  const selectedIds = multiSelectIds.length
    ? multiSelectIds
    : selectedId
      ? [selectedId]
      : []

  const selectedElement = activeCanvas.elements.find((el) => el.id === selectedId)

  return (
    <div className="canva-stage-container">
      {canvases.map((canvas, index) => {
        const isCurrent = index === activeCanvasIndex
        if (!isCurrent && canvases.length > 1) return null

        return (
          <div key={canvas.id} className="canva-page-block">
            {/* Page Header Meta */}
            <div className="canva-page-meta">
              <div className="canva-page-meta-title">
                <strong>Page {index + 1} of {canvases.length}</strong>
                <span>{canvas.width} × {canvas.height} px</span>
              </div>
              <div className="canva-page-meta-actions">
                <button
                  type="button"
                  onClick={() => onDuplicateCanvas(canvas)}
                  title="Duplicate page"
                >
                  <FiCopy />
                </button>
                {canvases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteCanvas(canvas.id)}
                    title="Delete page"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>

            {/* Canvas Surface Card */}
            <div className="canva-surface-wrapper">
              <div
                ref={surfaceRef}
                className={`canva-surface ${showGrid ? 'has-grid-bg' : ''}`}
                style={canvasSurfaceStyle(canvas, zoom)}
                onClick={(e) => {
                  if (
                    e.target.closest?.(
                      '[data-element-id], .ppt-canvas-el-chrome, .ppt-canvas-el-handles, .ppt-canvas-el-resize, .ppt-canvas-el-rotate, .ppt-text-drag'
                    )
                  ) {
                    return
                  }
                  onSelect(null)
                }}
                onContextMenu={(e) => {
                  if (e.target.closest?.('[data-element-id]')) return
                  e.preventDefault()
                  e.stopPropagation()
                  onContextMenu?.(e, null)
                }}
              >
                {canvas.elements.map((element, elIdx) => {
                  const isSelected =
                    selectedIds.includes(element.id) ||
                    Boolean(element.groupId && selectedIds.includes(element.groupId))
                  const isPrimary = selectedId === element.id

                  return (
                    <InteractiveCanvasElementShell
                      key={element.id || `el-${elIdx}`}
                      el={element}
                      canvasW={canvas.width}
                      canvasH={canvas.height}
                      selected={isSelected}
                      isPrimary={isPrimary}
                      selectedIds={selectedIds}
                      editable={true}
                      locked={isCanvasElementLocked(element)}
                      editing={editingId === element.id}
                      stageRef={surfaceRef}
                      allElements={canvas.elements}
                      onSelect={onSelect}
                      onContextMenu={onContextMenu}
                      onPlacementLive={onPlacementLive}
                      onPlacementCommit={onPlacementCommit}
                      onGuidesChange={setSmartGuides}
                      onStartTextEdit={onEdit}
                      onFillImage={onFillImage}
                      onFillDeviceFrame={onFillDeviceFrame}
                    >
                      <PptCanvasElement
                        el={element}
                        palette={DEFAULT_PALETTE}
                        canvasW={canvas.width}
                        showEmptyTextHint
                        selected={isSelected}
                        editable={
                          element.type === 'text' ||
                          element.type === 'textbox' ||
                          element.type === 'table' ||
                          isSelected
                        }
                        editingText={editingId === element.id}
                        onStartTextEdit={() => {
                          onSelect?.(element.id)
                          onEdit?.(element.id)
                        }}
                        onEndTextEdit={(text, runs) => onTextChange(element.id, text, runs)}
                        onHeightChange={(cssHeight, { commit = false, allowShrink = false } = {}) => {
                          const y = element.placement?.y || 0
                          const curH = element.placement?.height || 40
                          const rawH = Math.round(
                            cssPxToCanvas(cssHeight, surfaceRef.current, canvas.height)
                          )
                          const slotMaxH =
                            element.content?.slotMaxHeight || element.placement?.height || curH
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
                          const next = { ...(element.placement || {}), height: nextH }
                          const placed = clampPlacementOverflow(
                            next.x || 0,
                            next.y || 0,
                            next.width || 100,
                            next.height,
                            canvas.width,
                            canvas.height
                          )
                          const committed = { ...next, ...placed, height: nextH }
                          onPlacementLive?.({ [element.id]: committed })
                          if (commit) onPlacementCommit?.({ [element.id]: committed })
                        }}
                        onTableCellChange={(ri, ci, val) =>
                          onTableCellChange?.(element.id, ri, ci, val)
                        }
                        onTableActivate={() => onSelect?.(element.id)}
                      />
                    </InteractiveCanvasElementShell>
                  )
                })}

                <PptCanvasGuidesOverlay
                  guides={smartGuides}
                  canvasW={canvas.width}
                  canvasH={canvas.height}
                />

                {!canvas.elements.length && (
                  <div className="canva-surface-empty">
                    <p>Select text, shapes, or images from the left panel to build your design</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Add Page Button */}
            <div className="canva-add-page-footer">
              <button type="button" className="canva-add-page-pill-btn" onClick={onAddCanvas}>
                <FiPlus /> Add Page
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
