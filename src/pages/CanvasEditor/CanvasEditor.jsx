import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import canvasService from '../../services/canvasService'
import CanvasHeader from './components/CanvasHeader'
import CanvasLeftDock from './components/CanvasLeftDock'
import CanvasLeftDrawer from './components/CanvasLeftDrawer'
import CanvasStage from './components/CanvasStage'
import CanvasRightInspector from './components/CanvasRightInspector'
import CanvasBottomBar from './components/CanvasBottomBar'
import CanvasSizeModal from './CanvasSizeModal'
import CanvasExportModal from './CanvasExportModal'
import PptElementContextMenu from '../Slides/AIPptComponents/PptElementContextMenu'
import PptQuickMenu from '../Slides/AIPptComponents/PptQuickMenu'
import ImageCropModal from '../Slides/AIPptComponents/ImageCropModal'
import { PPT_DEFAULT_PLACEMENTS } from '../../constants/pptInsertCatalog'
import { normalizeElementPlacement } from '../../utils/presentationHelpers'
import {
  canPptGroup,
  canPptUngroup,
  createPptGroup,
  ungroupPptElement,
  expandPptSelectionIds,
  collectPptMoveIds,
  isPptGroup,
} from '../../utils/pptGroupUtils'
import { alignPptElements } from '../../utils/pptAlignUtils'
import {
  smartTidyElements,
  smartSwapElements,
  findSmartSwapTarget,
} from '../../utils/pptSmartFormat'
import { contentWithSyncedText } from '../../utils/pptTextContent'
import {
  isPptDeviceFrameElement,
  buildDeviceFrameScreenPatch,
  clearDeviceFrameScreenPatch,
} from '../../components/ppt/DeviceFrameVisual'
import '../Slides/AIPptComponents/pptEditorExtras.css'
import '../Slides/AIPptGenerator.css'
import './CanvasEditor.css'

const DEFAULT_SIZE = { width: 1080, height: 1080 }

function isCanvasElementLocked(el) {
  return Boolean(el?.locked || el?.placement?.locked)
}

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
  const raw = normalizeElementPlacement(
    payload?.placement || payload?.defaultPlacement || PPT_DEFAULT_PLACEMENTS[type] || PPT_DEFAULT_PLACEMENTS.text,
    canvas
  )
  // Center the element on the canvas instead of placing at top-left
  const placement = {
    ...raw,
    x: Math.round((canvas.width - raw.width) / 2),
    y: Math.round((canvas.height - raw.height) / 2),
  }
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

/** Clone elements with an offset for paste / duplicate operations. */
function cloneElementsWithOffset(sources, layerStart) {
  const stamp = Date.now()
  const idMap = new Map()
  const clones = sources.map((source, index) => {
    const id = `element-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`
    idMap.set(source.id, id)
    return {
      ...source,
      id,
      placement: {
        ...source.placement,
        x: (source.placement?.x || 0) + 24,
        y: (source.placement?.y || 0) + 24,
      },
      layer: layerStart + 1 + index,
    }
  })
  return clones.map((clone) => {
    const next = { ...clone }
    if (Array.isArray(clone.childIds)) {
      next.childIds = clone.childIds.map((cid) => idMap.get(cid) || cid)
    }
    if (clone.groupId && idMap.has(clone.groupId)) {
      next.groupId = idMap.get(clone.groupId)
    }
    return next
  })
}

export default function CanvasEditor({
  onBack,
  initialSize = null,
  title = null,
  initialTitle = 'Untitled Design',
  workspaceId = null,
  folderId = null,
  canvasId: initialCanvasId = null,
}) {
  const startingSize = initialSize || DEFAULT_SIZE
  const [docTitle, setDocTitle] = useState(title || initialTitle)
  const [size, setSize] = useState(startingSize)
  const [canvases, setCanvases] = useState(() => [createCanvas(startingSize)])
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0)

  // Selection & Edit State
  const [selected, setSelected] = useState({ canvasId: null, elementId: null })
  const [editing, setEditing] = useState({ canvasId: null, elementId: null })
  const [multiSelectIds, setMultiSelectIds] = useState([])

  // Layout & Dock States
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('text')

  // Viewport Zoom & Display States
  const [zoom, setZoom] = useState(0.75)
  const [showGrid, setShowGrid] = useState(false)

  // Modals & Context Menus
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)

  // State History Stack (Undo/Redo)
  const [history, setHistory] = useState(() => [[createCanvas(startingSize)]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isHistoryUpdating = useRef(false)

  // Clipboard
  const clipboardRef = useRef([])

  // ── Backend persistence (save within the workspace folder the canvas was created in) ──
  const [canvasId, setCanvasId] = useState(initialCanvasId)
  const [saveState, setSaveState] = useState('idle') // idle | loading | saving | saved | error
  const canPersist = Boolean(workspaceId)
  const canvasIdRef = useRef(canvasId)
  useEffect(() => { canvasIdRef.current = canvasId }, [canvasId])
  const hydratedRef = useRef(false)
  const saveTimerRef = useRef(null)
  const savingRef = useRef(false)
  const pendingSaveRef = useRef(false)

  // Keep refs in sync for keyboard handler closure
  const multiSelectIdsRef = useRef([])
  useEffect(() => { multiSelectIdsRef.current = multiSelectIds }, [multiSelectIds])

  const selectedRef = useRef(selected)
  useEffect(() => { selectedRef.current = selected }, [selected])

  const canvasesRef = useRef(canvases)
  useEffect(() => { canvasesRef.current = canvases }, [canvases])

  const activeCanvasIndexRef = useRef(activeCanvasIndex)
  useEffect(() => { activeCanvasIndexRef.current = activeCanvasIndex }, [activeCanvasIndex])

  const editingRef = useRef(editing)
  useEffect(() => { editingRef.current = editing }, [editing])

  const activeCanvas = canvases[activeCanvasIndex] || canvases[0]

  const docTitleRef = useRef(docTitle)
  useEffect(() => { docTitleRef.current = docTitle }, [docTitle])
  const sizeRef = useRef(size)
  useEffect(() => { sizeRef.current = size }, [size])
  const lastSyncedTitleRef = useRef(docTitle)

  const persistCanvasData = useCallback(async () => {
    if (!canPersist || !canvasIdRef.current) return
    if (savingRef.current) {
      pendingSaveRef.current = true
      return
    }
    savingRef.current = true
    setSaveState('saving')
    try {
      await canvasService.saveCanvasData(workspaceId, canvasIdRef.current, {
        version: 1,
        docTitle: docTitleRef.current,
        size: sizeRef.current,
        canvases: canvasesRef.current,
      })
      if (docTitleRef.current !== lastSyncedTitleRef.current) {
        const nextTitle = docTitleRef.current
        lastSyncedTitleRef.current = nextTitle
        canvasService
          .updateCanvasMeta(workspaceId, canvasIdRef.current, { name: nextTitle || 'Untitled Design' })
          .catch((error) => console.error('Failed to rename canvas:', error))
      }
      setSaveState('saved')
    } catch (error) {
      console.error('Failed to save canvas:', error)
      setSaveState('error')
    } finally {
      savingRef.current = false
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false
        persistCanvasData()
      }
    }
  }, [workspaceId, canPersist])

  // Load an existing canvas (reopen), or create the backend record for a brand-new one
  // in the folder it was launched from, so it's saved where the user created it.
  useEffect(() => {
    if (!canPersist) {
      hydratedRef.current = true
      return undefined
    }

    let cancelled = false

    async function hydrate() {
      setSaveState('loading')
      try {
        if (initialCanvasId) {
          const doc = await canvasService.getCanvas(workspaceId, initialCanvasId)
          if (cancelled) return
          const data = doc?.data || {}
          const loadedCanvases =
            Array.isArray(data.canvases) && data.canvases.length > 0
              ? data.canvases
              : [createCanvas(startingSize)]
          const loadedTitle = doc?.name || data.docTitle || initialTitle
          setDocTitle(loadedTitle)
          lastSyncedTitleRef.current = loadedTitle
          setSize(data.size || startingSize)
          setCanvases(loadedCanvases)
          setHistory([loadedCanvases])
          setHistoryIndex(0)
          setCanvasId(doc.id)
          setSaveState('saved')
        } else if (folderId) {
          const created = await canvasService.createCanvas(workspaceId, {
            name: docTitleRef.current || initialTitle,
            folderId,
            data: {
              version: 1,
              docTitle: docTitleRef.current || initialTitle,
              size: sizeRef.current,
              canvases: canvasesRef.current,
            },
          })
          if (cancelled) return
          setCanvasId(created.id)
          setSaveState('saved')
        } else {
          setSaveState('idle')
        }
      } catch (error) {
        console.error('Failed to load/create canvas:', error)
        if (!cancelled) setSaveState('error')
      } finally {
        if (!cancelled) hydratedRef.current = true
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
    // Runs once on mount — the effect below handles ongoing autosave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced autosave whenever the document changes, once it's hydrated/created.
  useEffect(() => {
    if (!canPersist || !hydratedRef.current || !canvasIdRef.current) return undefined

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      persistCanvasData()
    }, 1000)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [canvases, docTitle, size, canPersist, persistCanvasData])

  // Derived: effective selection ids (multi-select or single)
  const canvasSelectionIds = multiSelectIds.length
    ? multiSelectIds
    : [selected.elementId].filter(Boolean)

  // ── History ──────────────────────────────────────────────────────────────
  const updateCanvasesWithHistory = (nextCanvases) => {
    setCanvases(nextCanvases)
    if (isHistoryUpdating.current) return
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(nextCanvases)
    if (newHistory.length > 30) newHistory.shift()
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = useCallback(() => {
    setHistory((prevHistory) => {
      setHistoryIndex((prevIdx) => {
        if (prevIdx > 0) {
          isHistoryUpdating.current = true
          const prev = prevHistory[prevIdx - 1]
          setCanvases(prev)
          setTimeout(() => { isHistoryUpdating.current = false }, 50)
          return prevIdx - 1
        }
        return prevIdx
      })
      return prevHistory
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prevHistory) => {
      setHistoryIndex((prevIdx) => {
        if (prevIdx < prevHistory.length - 1) {
          isHistoryUpdating.current = true
          const next = prevHistory[prevIdx + 1]
          setCanvases(next)
          setTimeout(() => { isHistoryUpdating.current = false }, 50)
          return prevIdx + 1
        }
        return prevIdx
      })
      return prevHistory
    })
  }, [])

  // ── Canvas & Element CRUD ───────────────────────────────────────────────
  const applyCanvasSize = (nextSize) => {
    const targetSize = nextSize || size
    setSize(targetSize)
    updateCanvasesWithHistory(
      canvases.map((c) => ({ ...c, width: targetSize.width, height: targetSize.height }))
    )
  }

  const addElement = (payload) => {
    const canvasId = selected.canvasId || activeCanvas.id
    let insertedId = null
    const updated = canvases.map((canvas) => {
      if (canvas.id !== canvasId) return canvas
      const next = createElement(payload, canvas, canvas.elements.length)
      insertedId = next.id
      return { ...canvas, elements: [...canvas.elements, next] }
    })
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId, elementId: insertedId })
    setMultiSelectIds([])
  }

  const addCanvas = (source = activeCanvas) => {
    const next = createCanvas(
      source ? { width: source.width || size.width, height: source.height || size.height } : size
    )
    const index = canvases.findIndex((canvas) => canvas.id === source?.id)
    const nextCanvases = [...canvases]
    const insertIdx = index >= 0 ? index + 1 : nextCanvases.length
    nextCanvases.splice(insertIdx, 0, next)
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(insertIdx)
    setSelected({ canvasId: next.id, elementId: null })
    setMultiSelectIds([])
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
    setMultiSelectIds([])
  }

  const deleteCanvas = (canvasId) => {
    if (canvases.length <= 1) return
    const updated = canvases.filter((c) => c.id !== canvasId)
    updateCanvasesWithHistory(updated)
    setActiveCanvasIndex((prev) => Math.max(0, prev - 1))
    setSelected({ canvasId: null, elementId: null })
    setMultiSelectIds([])
  }

  const handlePlacementLive = (patches) => {
    const canvasId = activeCanvas.id
    setCanvases((prevCanvases) =>
      prevCanvases.map((c) => {
        if (c.id !== canvasId) return c
        return {
          ...c,
          elements: c.elements.map((el) => {
            const patch = patches[el.id]
            return patch ? { ...el, placement: { ...el.placement, ...patch } } : el
          }),
        }
      })
    )
  }

  const handlePlacementCommit = (patches) => {
    const canvasId = activeCanvas.id
    const updated = canvasesRef.current.map((c) => {
      if (c.id !== canvasId) return c
      return {
        ...c,
        elements: c.elements.map((el) => {
          const patch = patches[el.id]
          return patch ? { ...el, placement: { ...el.placement, ...patch } } : el
        }),
      }
    })
    updateCanvasesWithHistory(updated)
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

  /** Batch-update placements for multiple element IDs by the same delta. */
  const batchUpdatePlacements = (elementIds, patchFn) => {
    const canvasId = activeCanvas.id
    const idSet = new Set(elementIds)
    const updated = canvases.map((canvas) =>
      canvas.id !== canvasId
        ? canvas
        : {
            ...canvas,
            elements: canvas.elements.map((el) =>
              idSet.has(el.id) ? { ...el, placement: { ...el.placement, ...patchFn(el) } } : el
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

  const updateCanvasBackground = (fill) => {
    const value =
      fill?.type === 'solid'
        ? fill.color || '#FFFFFF'
        : fill && typeof fill === 'object'
          ? fill
          : fill || '#FFFFFF'
    const updated = canvases.map((canvas) =>
      canvas.id === activeCanvas.id ? { ...canvas, background: value } : canvas
    )
    updateCanvasesWithHistory(updated)
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteElements = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const expanded = expandPptSelectionIds(canvas.elements, ids)
    const deleteSet = new Set(expanded)
    // Also delete group children if a group is being deleted
    for (const el of canvas.elements) {
      if (deleteSet.has(el.id) && isPptGroup(el)) {
        for (const cid of el.childIds || []) deleteSet.add(cid)
      }
    }
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : { ...c, elements: c.elements.filter((el) => !deleteSet.has(el.id)) }
    )
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId: canvas.id, elementId: null })
    setEditing({ canvasId: null, elementId: null })
    setMultiSelectIds([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const deleteSelected = useCallback((canvasId) => {
    const ids = multiSelectIdsRef.current.length
      ? multiSelectIdsRef.current
      : [selectedRef.current.elementId].filter(Boolean)
    if (!ids.length) return
    deleteElements(ids)
  }, [deleteElements])

  // ── Clipboard ───────────────────────────────────────────────────────────
  const copySelection = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return false
    const expanded = expandPptSelectionIds(canvas.elements, ids)
    const selected = canvas.elements.filter((el) => expanded.includes(el.id))
    if (!selected.length) return false
    clipboardRef.current = JSON.parse(JSON.stringify(selected))
    return true
  }, [])

  const pasteClipboard = useCallback(() => {
    if (!clipboardRef.current?.length) return
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const clones = cloneElementsWithOffset(clipboardRef.current, canvas.elements.length)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: [...c.elements, ...clones] }
    )
    updateCanvasesWithHistory(updated)
    const last = clones[clones.length - 1]
    if (last) setSelected({ canvasId: canvas.id, elementId: last.id })
    setMultiSelectIds(clones.map((c) => c.id))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const duplicateSelection = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const expanded = expandPptSelectionIds(canvas.elements, ids)
    const sources = canvas.elements.filter((el) => expanded.includes(el.id))
    if (!sources.length) return
    const clones = cloneElementsWithOffset(sources, canvas.elements.length)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: [...c.elements, ...clones] }
    )
    updateCanvasesWithHistory(updated)
    const last = clones[clones.length - 1]
    if (last) setSelected({ canvasId: canvas.id, elementId: last.id })
    setMultiSelectIds(clones.map((c) => c.id))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cutSelection = useCallback((ids) => {
    if (!copySelection(ids)) return
    deleteElements(ids)
  }, [copySelection, deleteElements])

  // ── Group / Ungroup ─────────────────────────────────────────────────────
  const groupSelection = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas || !canPptGroup(canvas.elements, ids)) return
    const nextElements = createPptGroup(canvas.elements, ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: nextElements }
    )
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId: canvas.id, elementId: null })
    setMultiSelectIds([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const ungroupSelection = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const targetId = ids[0]
    if (!canvas || !targetId || !canPptUngroup(canvas.elements, [targetId])) return
    const group = canvas.elements.find((el) => el.id === targetId)
    const childIds = [...(group?.childIds || [])]
    const nextElements = ungroupPptElement(canvas.elements, targetId)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: nextElements }
    )
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId: canvas.id, elementId: childIds[0] || null })
    setMultiSelectIds(childIds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lock / Unlock ───────────────────────────────────────────────────────
  const toggleLock = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas || !ids.length) return
    const targets = canvas.elements.filter((e) => ids.includes(e.id))
    if (!targets.length) return
    const shouldLock = targets.some((e) => !isCanvasElementLocked(e))
    const idSet = new Set(ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((el) =>
              idSet.has(el.id)
                ? {
                    ...el,
                    locked: shouldLock,
                    placement: { ...el.placement, locked: shouldLock },
                  }
                : el
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Alignment ───────────────────────────────────────────────────────────
  const alignSelection = useCallback((ids, alignment) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas || !alignment || !ids.length) return
    const nextElements = alignPptElements(
      canvas.elements,
      ids,
      alignment,
      { width: canvas.width, height: canvas.height }
    )
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: nextElements }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Layer ordering ──────────────────────────────────────────────────────
  const bringForward = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const idSet = new Set(ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((el) =>
              idSet.has(el.id) ? { ...el, layer: (el.layer || 1) + 1 } : el
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendBackward = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const idSet = new Set(ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((el) =>
              idSet.has(el.id) ? { ...el, layer: Math.max(1, (el.layer || 1) - 1) } : el
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const bringToFront = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const maxLayer = Math.max(...canvas.elements.map((el) => el.layer || 1), 0)
    const idSet = new Set(ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((el) =>
              idSet.has(el.id) ? { ...el, layer: maxLayer + 1 } : el
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendToBack = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas) return
    const idSet = new Set(ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((el) =>
              idSet.has(el.id) ? { ...el, layer: 1 } : el
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTableCellChange = useCallback((elementId, rowIndex, colIndex, value) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const el = canvas?.elements?.find((item) => item.id === elementId)
    if (!el) return
    const baseCells = Array.isArray(el.content?.cells)
      ? el.content.cells
      : Array.isArray(el.content?.rows)
        ? el.content.rows
        : []
    const cells = baseCells.map((row, ri) =>
      ri === rowIndex ? (row || []).map((cell, ci) => (ci === colIndex ? value : cell)) : [...(row || [])]
    )
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((item) =>
              item.id === elementId
                ? {
                    ...item,
                    content: {
                      ...item.content,
                      cells,
                      rows: cells.length,
                      cols: cells[0]?.length || 0,
                    },
                  }
                : item
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFillImage = useCallback((elementId, payload = {}) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const el = canvas?.elements?.find((item) => item.id === elementId)
    if (!el) return
    let url = payload.url || payload.src || ''
    if (!url && payload.file) url = URL.createObjectURL(payload.file)
    if (!url) return

    if (isPptDeviceFrameElement(el)) {
      const patch = buildDeviceFrameScreenPatch(url, payload)
      if (!patch) return
      const updated = canvasesRef.current.map((c) =>
        c.id !== canvas.id
          ? c
          : {
              ...c,
              elements: c.elements.map((item) =>
                item.id === elementId ? { ...item, content: { ...item.content, ...patch } } : item
              ),
            }
      )
      updateCanvasesWithHistory(updated)
      setSelected({ canvasId: canvas.id, elementId })
      return
    }

    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((item) =>
              item.id === elementId
                ? {
                    ...item,
                    content: {
                      ...item.content,
                      url,
                      src: url,
                      fit: item.content?.fit || 'cover',
                      ...(payload.assetId ? { assetId: payload.assetId } : {}),
                      ...(payload.alt != null ? { alt: payload.alt } : {}),
                    },
                  }
                : item
            ),
          }
    )
    updateCanvasesWithHistory(updated)
    setSelected({ canvasId: canvas.id, elementId })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearDeviceFrameScreen = useCallback(() => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const elementId = selectedRef.current.elementId
    const el = canvas?.elements?.find((item) => item.id === elementId)
    if (!el || !isPptDeviceFrameElement(el)) return
    const patch = clearDeviceFrameScreenPatch()
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((item) =>
              item.id === elementId ? { ...item, content: { ...item.content, ...patch } } : item
            ),
          }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleImageAsBackground = useCallback((elementId, enabled) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const el = canvas?.elements?.find((item) => item.id === elementId)
    if (!el) return
    const imageUrl = el.content?.url || el.content?.src
    if (enabled && !imageUrl) return
    const updated = canvasesRef.current.map((c) => {
      if (c.id !== canvas.id) return c
      return {
        ...c,
        backgroundImage: enabled
          ? imageUrl
          : c.backgroundImageElementId === elementId
            ? null
            : c.backgroundImage,
        backgroundImageFit: enabled ? el.content?.fit || 'cover' : undefined,
        backgroundImageElementId: enabled ? elementId : null,
        elements: c.elements.map((item) => {
          if (item.id === elementId) {
            return { ...item, content: { ...item.content, useAsBackground: enabled } }
          }
          if (enabled && item.content?.useAsBackground) {
            return { ...item, content: { ...item.content, useAsBackground: false } }
          }
          return item
        }),
      }
    })
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCropApply = useCallback(({ fit, opacity }) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const elementId = selectedRef.current.elementId
    const el = canvas?.elements?.find((item) => item.id === elementId)
    if (!el) return
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id
        ? c
        : {
            ...c,
            elements: c.elements.map((item) =>
              item.id === elementId
                ? {
                    ...item,
                    content: { ...item.content, fit, opacity },
                    placement: { ...item.placement, opacity: opacity ?? item.placement?.opacity },
                  }
                : item
            ),
          }
    )
    updateCanvasesWithHistory(updated)
    setCropModalOpen(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const smartTidy = useCallback((ids) => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    if (!canvas || ids.length < 2) return
    const nextElements = smartTidyElements(canvas.elements, ids)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: nextElements }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const smartSwap = useCallback(() => {
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const elementId = selectedRef.current.elementId
    if (!canvas || !elementId) return
    const target = findSmartSwapTarget(canvas.elements, elementId)
    if (!target) return
    const nextElements = smartSwapElements(canvas.elements, elementId, target.id)
    const updated = canvasesRef.current.map((c) =>
      c.id !== canvas.id ? c : { ...c, elements: nextElements }
    )
    updateCanvasesWithHistory(updated)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openMediaForReplace = useCallback(() => {
    setActiveTab('uploads')
    setDrawerOpen(true)
  }, [])

  // ── Quick Action (from floating bar / legacy) ───────────────────────────
  const handleQuickAction = (action, elementId) => {
    const canvasId = activeCanvas.id
    const element = activeCanvas.elements.find((el) => el.id === elementId)
    if (!element) return

    if (action === 'delete') {
      deleteElements([elementId])
    } else if (action === 'duplicate') {
      duplicateSelection([elementId])
    } else if (action === 'forward') {
      bringForward([elementId])
    } else if (action === 'backward') {
      sendBackward([elementId])
    } else if (action === 'lock') {
      toggleLock([elementId])
    }
  }

  // ── Selection with multi-select (Shift/Ctrl click) ─────────────────────
  const handleSelect = useCallback((elementId, event) => {
    const canvasId = (canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0])?.id
    setContextMenu(null)

    if (!elementId) {
      setSelected({ canvasId, elementId: null })
      setMultiSelectIds([])
      setEditing({ canvasId: null, elementId: null })
      return
    }

    const additive = !!(event?.shiftKey || event?.ctrlKey || event?.metaKey)
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const clicked = canvas?.elements?.find((e) => e.id === elementId)
    const targetId = !additive && clicked?.groupId ? clicked.groupId : elementId

    if (additive) {
      setMultiSelectIds((prev) => {
        const curPrimary = selectedRef.current.elementId
        const base = prev.length ? prev : curPrimary ? [curPrimary] : []
        if (base.includes(targetId)) {
          const next = base.filter((x) => x !== targetId)
          setSelected({ canvasId, elementId: next[next.length - 1] || null })
          return next
        }
        setSelected({ canvasId, elementId: targetId })
        return [...base, targetId]
      })
      setEditing({ canvasId: null, elementId: null })
      return
    }

    setSelected({ canvasId, elementId: targetId })
    setMultiSelectIds([targetId])
    setEditing({ canvasId: null, elementId: null })
  }, [])

  const handleContextMenu = useCallback((event, elementId) => {
    if (!event) return
    event.preventDefault()
    event.stopPropagation()
    const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
    const canvasId = canvas?.id
    if (elementId) {
      const clicked = canvas?.elements?.find((e) => e.id === elementId)
      const targetId = !clicked ? elementId : clicked.groupId ? clicked.groupId : elementId
      const current = multiSelectIdsRef.current.length
        ? multiSelectIdsRef.current
        : [selectedRef.current.elementId].filter(Boolean)
      if (!current.includes(targetId) && !current.includes(elementId)) {
        setSelected({ canvasId, elementId: targetId })
        setMultiSelectIds([targetId])
        setEditing({ canvasId: null, elementId: null })
      }
    }
    setContextMenu({ x: event.clientX, y: event.clientY })
  }, [])

  // ── Comprehensive Keyboard Shortcuts ────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement
      const tag = String((e.target?.tagName || active?.tagName || '')).toLowerCase()
      const inFormField = tag === 'input' || tag === 'textarea' || tag === 'select'
      const inCanvasContent = Boolean(
        e.target?.closest?.(
          '.ppt-text-editable, .ppt-table-cell-input, .ppt-table-data-cell, [contenteditable="true"]'
        ) ||
        active?.closest?.(
          '.ppt-text-editable, .ppt-table-cell-input, .ppt-table-data-cell, [contenteditable="true"]'
        )
      )
      const inCanvasTextEdit = Boolean(editingRef.current.elementId) && (
        e.target?.isContentEditable ||
        active?.isContentEditable ||
        inCanvasContent
      )

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = String(e.key || '').toLowerCase()
      const ids = multiSelectIdsRef.current.length
        ? multiSelectIdsRef.current
        : [selectedRef.current.elementId].filter(Boolean)

      if (ctrl && (key === 'z' || key === 'y')) {
        if ((inFormField || inCanvasTextEdit) && !inCanvasContent) return
        e.preventDefault()
        if (key === 'z' && !shift) undo()
        else redo()
        return
      }

      if (ctrl && key === 'k') {
        e.preventDefault()
        setQuickMenuOpen(true)
        return
      }

      if (ctrl && (key === '=' || key === '+')) {
        e.preventDefault()
        setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))
        return
      }
      if (ctrl && key === '-') {
        e.preventDefault()
        setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))
        return
      }

      const typing = inFormField || inCanvasTextEdit
      if (typing) {
        if (e.key === 'Escape' && editingRef.current.elementId) {
          e.preventDefault()
          setEditing({ canvasId: null, elementId: null })
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setEditing({ canvasId: null, elementId: null })
        setSelected((prev) => ({ canvasId: prev.canvasId, elementId: null }))
        setMultiSelectIds([])
        setContextMenu(null)
        setQuickMenuOpen(false)
        return
      }

      if (ctrl && e.key === 'c') {
        e.preventDefault()
        if (ids.length) copySelection(ids)
        return
      }
      if (ctrl && e.key === 'x') {
        e.preventDefault()
        if (ids.length) cutSelection(ids)
        return
      }
      if (ctrl && e.key === 'v') {
        e.preventDefault()
        pasteClipboard()
        return
      }
      if (ctrl && e.key === 'd') {
        e.preventDefault()
        if (ids.length) duplicateSelection(ids)
        return
      }
      if (ctrl && e.key === 'a') {
        e.preventDefault()
        const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
        if (canvas?.elements?.length) {
          const allIds = canvas.elements.map((el) => el.id)
          setMultiSelectIds(allIds)
          setSelected({ canvasId: canvas.id, elementId: allIds[0] })
        }
        return
      }
      if (ctrl && e.key === 'g') {
        e.preventDefault()
        if (shift) {
          if (ids.length) ungroupSelection(ids)
        } else if (ids.length >= 2) {
          groupSelection(ids)
        }
        return
      }
      if (ctrl && e.key === 'l') {
        e.preventDefault()
        if (ids.length) toggleLock(ids)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ids.length) {
          e.preventDefault()
          deleteElements(ids)
        }
        return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!ids.length) return
        e.preventDefault()
        const step = shift ? 10 : 1
        const dx = e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0
        const dy = e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0
        const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
        if (!canvas) return
        const moveIds = new Set(collectPptMoveIds(canvas.elements, ids, ids[0]))
        const updated = canvasesRef.current.map((c) =>
          c.id !== canvas.id
            ? c
            : {
                ...c,
                elements: c.elements.map((el) =>
                  moveIds.has(el.id) && !isCanvasElementLocked(el)
                    ? {
                        ...el,
                        placement: {
                          ...el.placement,
                          x: (el.placement.x || 0) + dx,
                          y: (el.placement.y || 0) + dy,
                        },
                      }
                    : el
                ),
              }
        )
        updateCanvasesWithHistory(updated)
        return
      }
      if (e.key === ']' || e.code === 'BracketRight') {
        if (!ids.length) return
        e.preventDefault()
        if (ctrl && shift) bringToFront(ids)
        else bringForward(ids)
        return
      }
      if (e.key === '[' || e.code === 'BracketLeft') {
        if (!ids.length) return
        e.preventDefault()
        if (ctrl && shift) sendToBack(ids)
        else sendBackward(ids)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, copySelection, cutSelection, pasteClipboard, duplicateSelection, deleteElements, groupSelection, ungroupSelection, toggleLock, bringForward, sendBackward, bringToFront, sendToBack])

  const handleQuickCommand = useCallback((cmd) => {
    const ids = multiSelectIdsRef.current.length
      ? multiSelectIdsRef.current
      : [selectedRef.current.elementId].filter(Boolean)
    switch (cmd) {
      case 'undo':
        undo()
        break
      case 'redo':
        redo()
        break
      case 'duplicate':
        if (ids.length) duplicateSelection(ids)
        break
      case 'copy':
        if (ids.length) copySelection(ids)
        break
      case 'paste':
        pasteClipboard()
        break
      case 'select-all': {
        const canvas = canvasesRef.current[activeCanvasIndexRef.current] || canvasesRef.current[0]
        const allIds = (canvas?.elements || []).map((el) => el.id)
        if (allIds.length) {
          setMultiSelectIds(allIds)
          setSelected({ canvasId: canvas.id, elementId: allIds[0] })
        }
        break
      }
      case 'group':
        if (ids.length >= 2) groupSelection(ids)
        break
      case 'ungroup':
        if (ids.length) ungroupSelection(ids)
        break
      case 'lock':
        if (ids.length) toggleLock(ids)
        break
      case 'export':
      case 'share':
        setShowExportModal(true)
        break
      case 'smart-tidy':
        smartTidy(ids)
        break
      case 'smart-swap':
        smartSwap()
        break
      case 'bring-forward':
        if (ids.length) bringForward(ids)
        break
      case 'send-backward':
        if (ids.length) sendBackward(ids)
        break
      case 'bring-front':
        if (ids.length) bringToFront(ids)
        break
      case 'send-back':
        if (ids.length) sendToBack(ids)
        break
      case 'zoom-in':
        setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))
        break
      case 'zoom-out':
        setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))
        break
      case 'zoom-fit':
        setZoom(0.85)
        break
      default:
        break
    }
  }, [undo, redo, duplicateSelection, copySelection, pasteClipboard, groupSelection, ungroupSelection, toggleLock, smartTidy, smartSwap, bringForward, sendBackward, bringToFront, sendToBack])

  // ── Derived state for context menu ──────────────────────────────────────
  const selectedElement = activeCanvas?.elements?.find((el) => el.id === selected.elementId)
  const canGroupSelection = canPptGroup(activeCanvas.elements, canvasSelectionIds)
  const canUngroupSelection = canPptUngroup(activeCanvas.elements, canvasSelectionIds)
  const selectionLocked = canvasSelectionIds.length > 0 &&
    canvasSelectionIds.every((id) => {
      const el = activeCanvas.elements.find((e) => e.id === id)
      return isCanvasElementLocked(el)
    })
  const usedFontFamilies = useMemo(() => {
    const fonts = new Set()
    canvases.forEach((canvas) => {
      canvas.elements.forEach((el) => {
        if (el.content?.fontFamily) fonts.add(el.content.fontFamily)
      })
    })
    return [...fonts]
  }, [canvases])

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
        saveState={canPersist ? saveState : null}
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
          workspaceId={workspaceId}
          fillElementId={
            selectedElement &&
            (selectedElement.type === 'image' ||
              selectedElement.type === 'icon' ||
              isPptDeviceFrameElement(selectedElement))
              ? selectedElement.id
              : null
          }
          onFillElement={(payload) => {
            if (selectedElement) handleFillImage(selectedElement.id, payload)
          }}
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
            multiSelectIds={multiSelectIds}
            onSelect={handleSelect}
            onEdit={(elementId) => setEditing({ canvasId: activeCanvas.id, elementId })}
            onPlacementLive={handlePlacementLive}
            onPlacementCommit={handlePlacementCommit}
            onTextChange={(elementId, text, runs) => {
              const canvas = canvasesRef.current[activeCanvasIndexRef.current]
              const el = canvas?.elements?.find((item) => item.id === elementId)
              const next = contentWithSyncedText(el?.content || {}, text, runs)
              updateElementContent(elementId, next)
              setEditing({ canvasId: null, elementId: null })
            }}
            onTableCellChange={handleTableCellChange}
            onFillImage={handleFillImage}
            onFillDeviceFrame={handleFillImage}
            onQuickAction={handleQuickAction}
            onContextMenu={handleContextMenu}
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
          elements={activeCanvas?.elements || []}
          usedFontFamilies={usedFontFamilies}
          onUpdatePlacement={updateElementPlacement}
          onUpdateContent={updateElementContent}
          onUpdateBackground={updateCanvasBackground}
          onApplyPresetSize={applyCanvasSize}
          onToggleLock={(elId) => toggleLock([elId])}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onAlignSelection={(alignment) => alignSelection(canvasSelectionIds, alignment)}
          onSelectElement={(id) => handleSelect(id)}
          onDeleteElement={(id) => deleteElements([id])}
          onReplaceImage={openMediaForReplace}
          onCropImage={() => setCropModalOpen(true)}
          onClearDeviceFrameScreen={handleClearDeviceFrameScreen}
          onToggleImageAsBackground={handleToggleImageAsBackground}
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

      {cropModalOpen && selectedElement && (
        <ImageCropModal
          imageUrl={selectedElement.content?.url || selectedElement.content?.src}
          onApply={handleCropApply}
          onClose={() => setCropModalOpen(false)}
        />
      )}

      <PptQuickMenu
        open={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        onCommand={handleQuickCommand}
      />

      {contextMenu && (
        <PptElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          canGroup={canGroupSelection}
          canUngroup={canUngroupSelection}
          locked={selectionLocked}
          canPaste={clipboardRef.current.length > 0}
          hasSelection={canvasSelectionIds.length > 0}
          onClose={() => setContextMenu(null)}
          onCut={() => {
            cutSelection(canvasSelectionIds)
            setContextMenu(null)
          }}
          onCopy={() => {
            copySelection(canvasSelectionIds)
            setContextMenu(null)
          }}
          onPaste={() => {
            pasteClipboard()
            setContextMenu(null)
          }}
          onDuplicate={() => {
            duplicateSelection(canvasSelectionIds)
            setContextMenu(null)
          }}
          onDelete={() => {
            deleteElements(canvasSelectionIds)
            setContextMenu(null)
          }}
          onGroup={() => {
            groupSelection(canvasSelectionIds)
            setContextMenu(null)
          }}
          onUngroup={() => {
            ungroupSelection(canvasSelectionIds)
            setContextMenu(null)
          }}
          onToggleLock={() => {
            toggleLock(canvasSelectionIds)
            setContextMenu(null)
          }}
          onBringForward={() => {
            bringForward(canvasSelectionIds)
            setContextMenu(null)
          }}
          onSendBackward={() => {
            sendBackward(canvasSelectionIds)
            setContextMenu(null)
          }}
          onBringToFront={() => {
            bringToFront(canvasSelectionIds)
            setContextMenu(null)
          }}
          onSendToBack={() => {
            sendToBack(canvasSelectionIds)
            setContextMenu(null)
          }}
          onAlign={(alignment) => {
            alignSelection(canvasSelectionIds, alignment)
            setContextMenu(null)
          }}
        />
      )}
    </div>
  )
}