import { useState, useEffect, useRef } from 'react'
import CanvasHeader from './components/CanvasHeader'
import CanvasLeftDock from './components/CanvasLeftDock'
import CanvasLeftDrawer from './components/CanvasLeftDrawer'
import CanvasStage from './components/CanvasStage'
import CanvasRightInspector from './components/CanvasRightInspector'
import CanvasBottomBar from './components/CanvasBottomBar'
import CanvasSizeModal from './CanvasSizeModal'
import CanvasExportModal from './CanvasExportModal'
import PptElementContextMenu from '../Slides/AIPptComponents/PptElementContextMenu'
import { PPT_DEFAULT_PLACEMENTS } from '../../constants/pptInsertCatalog'
import { normalizeElementPlacement } from '../../utils/presentationHelpers'
import './CanvasEditor.css'

const DEFAULT_SIZE = { width: 1080, height: 1080 }

function createCanvas(size = DEFAULT_SIZE) {
  return {
    id: `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    width: size.width,
    height: size.height,
    background: '#FFFFFF',
    elements: [],
  }
}

function createElement(payload, canvas, index) {
  const type = payload?.type || 'text'
  const placement = normalizeElementPlacement(
    payload?.placement || payload?.defaultPlacement || PPT_DEFAULT_PLACEMENTS[type] || PPT_DEFAULT_PLACEMENTS.text,
    canvas
  )
  const content = { ...(payload?.content || {}) }
  if (type === 'text' && !content.color && !content.colorRole) content.color = '#172033'
  if (['image', 'icon', 'graphic'].includes(type) && !content.url && content.src) content.url = content.src
  if (['image', 'icon', 'graphic'].includes(type) && content.url && !content.src) content.src = content.url
  return {
    id: `element-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    placement,
    layer: index + 1,
    ...(payload?.presetId ? { presetId: payload.presetId } : {}),
  }
}

export default function CanvasEditor({ onBack, initialSize = null }) {
  const startingSize = initialSize || DEFAULT_SIZE
  const [docTitle, setDocTitle] = useState('Untitled Design')
  const [size, setSize] = useState(startingSize)
  const [canvases, setCanvases] = useState(() => [createCanvas(startingSize)])
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0)

  // Selection & Edit State
  const [selected, setSelected] = useState({ canvasId: null, elementId: null })
  const [editing, setEditing] = useState({ canvasId: null, elementId: null })

  // Layout & Dock States
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('text') // 'elements' | 'text' | 'uploads' | 'shapes' | 'brand' | 'canvases' | 'settings'

  // Viewport Zoom & Display States
  const [zoom, setZoom] = useState(0.75)
  const [showGrid, setShowGrid] = useState(false)

  // Modals & Context Menus
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)

  // State History Stack (Undo/Redo)
  const [history, setHistory] = useState(() => [[createCanvas(startingSize)]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isHistoryUpdating = useRef(false)

  const activeCanvas = canvases[activeCanvasIndex] || canvases[0]

  // Synchronize history
  const updateCanvasesWithHistory = (nextCanvases) => {
    setCanvases(nextCanvases)
    if (isHistoryUpdating.current) return
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(nextCanvases)
    if (newHistory.length > 30) newHistory.shift()
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      isHistoryUpdating.current = true
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setCanvases(prev)
      setTimeout(() => {
        isHistoryUpdating.current = false
      }, 50)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      isHistoryUpdating.current = true
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setCanvases(next)
      setTimeout(() => {
        isHistoryUpdating.current = false
      }, 50)
    }
  }

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected.canvasId && selected.elementId) {
          deleteSelected(selected.canvasId)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, historyIndex, selected])

  const applyCanvasSize = (nextSize) => {
    const targetSize = nextSize || size
    setSize(targetSize)
    updateCanvasesWithHistory(
      canvases.map((c) => ({ ...c, width: targetSize.width, height: targetSize.height }))
    )
  }

  const addElement = (payload) => {
    const canvasId = selected.canvasId || activeCanvas.id
    const updated = canvases.map((canvas) => {
      if (canvas.id !== canvasId) return canvas
      return { ...canvas, elements: [...canvas.elements, createElement(payload, canvas, canvas.elements.length)] }
    })
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId, elementId: null })
  }

  const addCanvas = (source = activeCanvas) => {
    const next = createCanvas(size)
    const index = canvases.findIndex((canvas) => canvas.id === source.id)
    const nextCanvases = [...canvases]
    nextCanvases.splice(index + 1, 0, next)
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(index + 1)
    setSelected({ canvasId: next.id, elementId: null })
  }

  const duplicateCanvas = (source) => {
    const copy = {
      ...source,
      id: `canvas-${Date.now()}`,
      elements: source.elements.map((element) => ({
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
    }
    const index = canvases.findIndex((canvas) => canvas.id === source.id)
    const nextCanvases = [...canvases]
    nextCanvases.splice(index + 1, 0, copy)
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(index + 1)
    setSelected({ canvasId: copy.id, elementId: null })
  }

  const deleteCanvas = (canvasId) => {
    if (canvases.length <= 1) return
    const updated = canvases.filter((c) => c.id !== canvasId)
    updateCanvasesWithHistory(updated)
    setActiveCanvasIndex((prev) => Math.max(0, prev - 1))
    setSelected({ canvasId: null, elementId: null })
  }

  const updateElementPlacement = (elementId, patch) => {
    const canvasId = activeCanvas.id
    const updated = canvases.map((canvas) =>
      canvas.id !== canvasId
        ? canvas
        : {
            ...canvas,
            elements: canvas.elements.map((element) =>
              element.id === elementId ? { ...element, placement: { ...element.placement, ...patch } } : element
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }

  const updateElementContent = (elementId, contentPatch) => {
    const canvasId = activeCanvas.id
    const updated = canvases.map((canvas) =>
      canvas.id !== canvasId
        ? canvas
        : {
            ...canvas,
            elements: canvas.elements.map((element) =>
              element.id === elementId ? { ...element, content: { ...element.content, ...contentPatch } } : element
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }

  const updateCanvasBackground = (color) => {
    const updated = canvases.map((canvas) =>
      canvas.id === activeCanvas.id ? { ...canvas, background: color } : canvas
    )
    updateCanvasesWithHistory(updated)
  }

  const deleteSelected = (canvasId = activeCanvas.id) => {
    if (!selected.elementId) return
    const updated = canvases.map((canvas) =>
      canvas.id !== canvasId
        ? canvas
        : {
            ...canvas,
            elements: canvas.elements.filter((element) => element.id !== selected.elementId),
          }
    )
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId, elementId: null })
    setEditing({ canvasId: null, elementId: null })
  }

  const handleQuickAction = (action, elementId) => {
    const canvasId = activeCanvas.id
    const element = activeCanvas.elements.find((el) => el.id === elementId)
    if (!element) return

    if (action === 'delete') {
      deleteSelected(canvasId)
    } else if (action === 'duplicate') {
      const copy = {
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        placement: { ...element.placement, x: element.placement.x + 20, y: element.placement.y + 20 },
      }
      const updated = canvases.map((c) => (c.id === canvasId ? { ...c, elements: [...c.elements, copy] } : c))
      updateCanvasesWithHistory(updated)
      setSelected({ canvasId, elementId: copy.id })
    } else if (action === 'forward') {
      updateElementPlacement(elementId, { layer: (element.layer || 1) + 1 })
    } else if (action === 'backward') {
      updateElementPlacement(elementId, { layer: Math.max(1, (element.layer || 1) - 1) })
    } else if (action === 'lock') {
      updateElementPlacement(elementId, { locked: !element.placement?.locked })
    }
  }

  const selectedElement = activeCanvas?.elements?.find((el) => el.id === selected.elementId)

  return (
    <div className="canvas-editor-page">
      {/* 1. Canva Top Header Navbar */}
      <CanvasHeader
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        onBack={onBack}
        undo={undo}
        redo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onOpenSizeModal={() => setShowSizeModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        activeCanvas={activeCanvas}
      />

      {/* 2. Studio Layout Body */}
      <div className="canvas-editor-studio-body">
        {/* Far Left Icon Dock */}
        <CanvasLeftDock
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />

        {/* Expandable Left Drawer */}
        <CanvasLeftDrawer
          activeTab={activeTab}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onInsertElement={addElement}
          canvases={canvases}
          activeCanvasIndex={activeCanvasIndex}
          setActiveCanvasIndex={setActiveCanvasIndex}
          onAddCanvas={() => addCanvas(activeCanvas)}
          onDuplicateCanvas={duplicateCanvas}
          onDeleteCanvas={deleteCanvas}
          activeCanvas={activeCanvas}
          onUpdateBackground={updateCanvasBackground}
        />

        {/* Center Workspace Stage */}
        <main className="canva-stage-viewport">
          <CanvasStage
            canvases={canvases}
            activeCanvasIndex={activeCanvasIndex}
            setActiveCanvasIndex={setActiveCanvasIndex}
            zoom={zoom}
            showGrid={showGrid}
            selectedId={selected.canvasId === activeCanvas.id ? selected.elementId : null}
            editingId={editing.canvasId === activeCanvas.id ? editing.elementId : null}
            onSelect={(elementId) => {
              setSelected({ canvasId: activeCanvas.id, elementId })
              setEditing({ canvasId: null, elementId: null })
            }}
            onEdit={(elementId) => setEditing({ canvasId: activeCanvas.id, elementId })}
            onMove={(elementId, placement) => updateElementPlacement(elementId, placement)}
            onTextChange={(elementId, text, runs) => {
              updateElementContent(elementId, { text, runs })
              setEditing({ canvasId: null, elementId: null })
            }}
            onQuickAction={handleQuickAction}
            onContextMenu={(e, el) => {
              setContextMenu({ x: e.clientX, y: e.clientY, element: el })
            }}
            onAddCanvas={() => addCanvas(activeCanvas)}
            onDuplicateCanvas={duplicateCanvas}
            onDeleteCanvas={deleteCanvas}
          />

          {/* Canva Bottom Control Bar */}
          <CanvasBottomBar
            zoom={zoom}
            setZoom={setZoom}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            pageCount={canvases.length}
            activeCanvasIndex={activeCanvasIndex}
          />
        </main>

        {/* Right Inspector Sidebar */}
        <CanvasRightInspector
          selectedElement={selectedElement}
          activeCanvas={activeCanvas}
          onUpdatePlacement={updateElementPlacement}
          onUpdateContent={updateElementContent}
          onUpdateBackground={updateCanvasBackground}
          onApplyPresetSize={applyCanvasSize}
          onToggleLock={(elId) => handleQuickAction('lock', elId)}
        />
      </div>

      {/* Modals & Context Menu */}
      {showSizeModal && (
        <CanvasSizeModal
          onCancel={() => setShowSizeModal(false)}
          onCreate={(nextSize) => {
            applyCanvasSize(nextSize)
            setShowSizeModal(false)
          }}
        />
      )}

      {showExportModal && (
        <CanvasExportModal
          canvas={activeCanvas}
          title={docTitle}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {contextMenu && (
        <PptElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          element={contextMenu.element}
          onClose={() => setContextMenu(null)}
          onDuplicate={() => {
            if (contextMenu.element) handleQuickAction('duplicate', contextMenu.element.id)
            setContextMenu(null)
          }}
          onDelete={() => {
            if (contextMenu.element) handleQuickAction('delete', contextMenu.element.id)
            setContextMenu(null)
          }}
          onBringForward={() => {
            if (contextMenu.element) handleQuickAction('forward', contextMenu.element.id)
            setContextMenu(null)
          }}
          onSendBackward={() => {
            if (contextMenu.element) handleQuickAction('backward', contextMenu.element.id)
            setContextMenu(null)
          }}
          onToggleLock={() => {
            if (contextMenu.element) handleQuickAction('lock', contextMenu.element.id)
            setContextMenu(null)
          }}
        />
      )}
    </div>
  )
}