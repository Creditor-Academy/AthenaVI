import { useRef, useState } from 'react'
import { FiPlus, FiCopy, FiTrash2, FiMove, FiLock, FiUnlock } from 'react-icons/fi'
import PptCanvasElement from '../../Slides/AIPptComponents/PptCanvasElement'
import PptCanvasGuidesOverlay from '../../Slides/AIPptComponents/PptCanvasGuidesOverlay'
import { computePptSmartGuides } from '../../../utils/pptSmartGuides'

const DEFAULT_PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#172033',
  title: '#172033',
  accent: '#2563EB',
}

export default function CanvasStage({
  canvases,
  activeCanvasIndex,
  setActiveCanvasIndex,
  zoom,
  showGrid,
  selectedId,
  editingId,
  onSelect,
  onEdit,
  onMove,
  onTextChange,
  onQuickAction,
  onContextMenu,
  onAddCanvas,
  onDuplicateCanvas,
  onDeleteCanvas,
}) {
  const surfaceRef = useRef(null)
  const dragRef = useRef(null)
  const [smartGuides, setSmartGuides] = useState(null)

  const activeCanvas = canvases[activeCanvasIndex] || canvases[0]

  const beginMove = (event, element) => {
    if (event.button !== 0 || element.placement?.locked) return
    event.stopPropagation()
    onSelect(element.id)
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!rect) return

    dragRef.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      placement: element.placement,
      scaleX: activeCanvas.width / rect.width,
      scaleY: activeCanvas.height / rect.height,
    }

    const move = (e) => {
      const drag = dragRef.current
      if (!drag) return
      const rawX = Math.max(0, drag.placement.x + (e.clientX - drag.startX) * drag.scaleX)
      const rawY = Math.max(0, drag.placement.y + (e.clientY - drag.startY) * drag.scaleY)

      const targetPlacement = { ...drag.placement, x: rawX, y: rawY }

      const otherPlacements = activeCanvas.elements
        .filter((el) => el.id !== element.id)
        .map((el) => el.placement)
        .filter(Boolean)

      const guidesResult = computePptSmartGuides(
        targetPlacement,
        otherPlacements,
        activeCanvas,
        element.id
      )

      let finalPlacement = targetPlacement
      if (guidesResult?.snapDx || guidesResult?.snapDy) {
        finalPlacement = {
          ...targetPlacement,
          x: targetPlacement.x - (guidesResult.snapDx || 0),
          y: targetPlacement.y - (guidesResult.snapDy || 0),
        }
      }

      setSmartGuides(guidesResult?.guides || null)
      onMove(drag.id, finalPlacement)
    }

    const end = () => {
      dragRef.current = null
      setSmartGuides(null)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', end)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', end)
  }

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
                style={{
                  width: `${canvas.width * zoom}px`,
                  height: `${canvas.height * zoom}px`,
                  aspectRatio: `${canvas.width} / ${canvas.height}`,
                  background: canvas.background || '#FFFFFF',
                }}
                onClick={() => onSelect(null)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  onContextMenu(e, null)
                }}
              >
                {canvas.elements.map((element) => (
                  <div
                    key={element.id}
                    data-element-id={element.id}
                    className={`canva-element ${selectedId === element.id ? 'is-selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${(element.placement.x / canvas.width) * 100}%`,
                      top: `${(element.placement.y / canvas.height) * 100}%`,
                      width: `${(element.placement.width / canvas.width) * 100}%`,
                      height: `${(element.placement.height / canvas.height) * 100}%`,
                      transform: element.placement.angle ? `rotate(${element.placement.angle}deg)` : undefined,
                      zIndex: element.layer || 1,
                    }}
                    onMouseDown={(event) => beginMove(event, element)}
                    onClick={(event) => {
                      event.stopPropagation()
                      setActiveCanvasIndex(index)
                      onSelect(element.id)
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation()
                      if (element.type === 'text' || element.type === 'textbox') onEdit(element.id)
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onSelect(element.id)
                      onContextMenu(e, element)
                    }}
                  >
                    <PptCanvasElement
                      el={element}
                      palette={DEFAULT_PALETTE}
                      selected={selectedId === element.id}
                      editable={element.type === 'text' || element.type === 'textbox' || selectedId === element.id}
                      editingText={editingId === element.id}
                      onEndTextEdit={(text, runs) => onTextChange(element.id, text, runs)}
                    />
                  </div>
                ))}

                {smartGuides && smartGuides.length > 0 && (
                  <PptCanvasGuidesOverlay
                    guides={smartGuides}
                    canvasW={canvas.width}
                    canvasH={canvas.height}
                  />
                )}

                {!canvas.elements.length && (
                  <div className="canva-surface-empty">
                    <p>Select text, shapes, or images from the left panel to build your design</p>
                  </div>
                )}
              </div>

              {selectedElement && isCurrent && (
                <div
                  className="canva-floating-quick-menu"
                  style={{
                    position: 'absolute',
                    top: -46,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onQuickAction('duplicate', selectedElement.id)}
                    title="Duplicate element"
                  >
                    <FiCopy />
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickAction('lock', selectedElement.id)}
                    title="Lock/unlock element"
                  >
                    {selectedElement.placement?.locked ? <FiLock /> : <FiUnlock />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickAction('delete', selectedElement.id)}
                    title="Delete element"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
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
