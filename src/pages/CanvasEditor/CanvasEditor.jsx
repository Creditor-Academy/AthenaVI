import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import canvasService from '../../services/canvasService'
import assetService from '../../services/assetService'
import CanvasHeader from './components/CanvasHeader'
import CanvasLeaveDialog from './components/CanvasLeaveDialog'
import CanvasRecoveryDialog from './components/CanvasRecoveryDialog'
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
import {
  DEFAULT_SIZE,
  MAX_ELEMENTS_PER_PAGE,
  MAX_PAGES,
  createDocument,
  createElement,
  canAddElements,
  canAddPages,
  addPage,
  duplicatePage,
  deletePage,
  movePage,
  resizeDocument,
  insertElements,
  cloneElementsWithOffset,
  collectIds,
  isLocalUrl,
  replaceUrlInDocument,
  serializeForSave,
  hydrateFromServer,
  readRevision,
} from './canvasDocument'
import {
  createHistory,
  currentEntry,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  mapHistory,
} from './canvasHistory'
import {
  SAVE_ERROR,
  classifySaveError,
  describeSaveError,
  haltsAutosave,
  isRetryable,
  retryDelayMs,
} from './canvasSaveErrors'
import {
  writeLocalDraft,
  readLocalDraft,
  clearLocalDraft,
  shouldOfferDraftRestore,
} from './canvasLocalDraft'
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

const AUTOSAVE_DEBOUNCE_MS = 1000
const DRAFT_DEBOUNCE_MS = 300
const NOTICE_MS = 6000
/** Browsers cap keepalive request bodies at 64 KB; stay under it. */
const KEEPALIVE_MAX_CHARS = 60000
const ELEMENT_CAP_NOTICE = `A page can hold at most ${MAX_ELEMENTS_PER_PAGE} elements. Add a new page for more.`
const PAGE_CAP_NOTICE = `A design can have at most ${MAX_PAGES} pages.`
const MISSING_LOCATION_MESSAGE =
  'Choose a workspace folder before creating a design, so there is somewhere to save it.'

function isCanvasElementLocked(el) {
  return Boolean(el?.locked || el?.placement?.locked)
}

function clearTimerRef(ref) {
  if (ref.current) {
    clearTimeout(ref.current)
    ref.current = null
  }
}

export default function CanvasEditor({
  onBack,
  initialSize = null,
  title = null,
  initialTitle = 'Untitled Design',
  workspaceId = null,
  folderId = null,
  canvasId: initialCanvasId = null,
  onCanvasCreated = null,
}) {
  const startingSize = initialSize || DEFAULT_SIZE
  const [docTitle, setDocTitle] = useState(title || initialTitle)
  const [size, setSize] = useState(startingSize)
  const [canvases, setCanvases] = useState(() => createDocument(startingSize))
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0)

  // Selection & Edit State
  const [selected, setSelected] = useState({ canvasId: null, elementId: null })
  const [editing, setEditing] = useState({ canvasId: null, elementId: null })
  const [multiSelectIds, setMultiSelectIds] = useState([])

  // Layout & Dock States
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('text')

  // Calculate zoom that fits the canvas inside the available unobstructed viewport
  const calculateFitZoom = useCallback(
    (isDrawerOpen = drawerOpen, isInspectorOpen = inspectorOpen, currentSize = size) => {
      if (typeof window === 'undefined') return 0.75
      const leftPad = isDrawerOpen ? 490 : 96
      const rightPad = isInspectorOpen ? 350 : 36
      const topPad = 80
      const bottomPad = 80

      const availW = Math.max(280, window.innerWidth - leftPad - rightPad)
      const availH = Math.max(280, window.innerHeight - topPad - bottomPad)

      const canvasW = currentSize?.width || DEFAULT_SIZE.width
      const canvasH = currentSize?.height || DEFAULT_SIZE.height

      const scaleX = (availW * 0.88) / canvasW
      const scaleY = (availH * 0.88) / canvasH

      const fit = Math.min(scaleX, scaleY)
      return Math.max(0.15, Math.min(2.0, Math.round(fit * 100) / 100))
    },
    [drawerOpen, inspectorOpen, size]
  )

  // Viewport Zoom & Display States
  const [zoom, setZoom] = useState(() => calculateFitZoom(true, true, startingSize))
  const [showGrid, setShowGrid] = useState(false)

  // Automatically recalculate zoom whenever drawer or inspector expands/collapses or canvas size changes
  useEffect(() => {
    const nextZoom = calculateFitZoom(drawerOpen, inspectorOpen, size)
    setZoom(nextZoom)
  }, [drawerOpen, inspectorOpen, size, calculateFitZoom])

  // Recalculate zoom on window resize
  useEffect(() => {
    const onResize = () => {
      setZoom(calculateFitZoom(drawerOpen, inspectorOpen, size))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [drawerOpen, inspectorOpen, size, calculateFitZoom])

  // Modals & Context Menus
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)

  // ── Undo / redo history ─────────────────────────────────────────────────
  // Kept in a ref, not state: most mutation handlers are memoised with empty deps, and a
  // state copy would be stale inside them. Seeded with the same array as `canvases`, so
  // undoing back to the start never swaps the page for one with a different id.
  const historyRef = useRef(null)
  if (historyRef.current === null) historyRef.current = createHistory(canvases)
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false })
  const syncHistoryFlags = useCallback(() => {
    const undoable = canUndo(historyRef.current)
    const redoable = canRedo(historyRef.current)
    setHistoryFlags((prev) =>
      prev.canUndo === undoable && prev.canRedo === redoable ? prev : { canUndo: undoable, canRedo: redoable }
    )
  }, [])

  // Clipboard
  const clipboardRef = useRef([])

  // Short message for things the user needs to know about (caps reached, failed uploads).
  const [notice, setNotice] = useState(null)
  const noticeTimerRef = useRef(null)
  const showNotice = useCallback((message) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    setNotice(message)
    noticeTimerRef.current = setTimeout(() => setNotice(null), NOTICE_MS)
  }, [])

  // ── Backend persistence (save within the workspace folder the canvas was created in) ──
  // A design is always stored in a workspace folder; without one there is nowhere to save it,
  // so the editor refuses to open rather than letting the user work on something that will vanish.
  const missingLocation = !workspaceId || (!initialCanvasId && !folderId)
  const canPersist = !missingLocation
  const [canvasId, setCanvasId] = useState(initialCanvasId)
  // idle | loading | saving | saved | retrying | error | conflict
  const [saveState, setSaveState] = useState('idle')
  const [saveError, setSaveError] = useState(null) // { kind, message } of the last failed save
  // null | { kind: 'draft', draft } | { kind: SAVE_ERROR.CONFLICT | AUTH | NOT_FOUND }
  const [recovery, setRecovery] = useState(null)
  const canvasIdRef = useRef(canvasId)
  useEffect(() => { canvasIdRef.current = canvasId }, [canvasId])
  const hydratedRef = useRef(false)
  // Reopening an existing canvas: show a loading screen instead of the 1080x1080 default.
  const [hydrating, setHydrating] = useState(Boolean(initialCanvasId && workspaceId))
  const [loadError, setLoadError] = useState(missingLocation ? MISSING_LOCATION_MESSAGE : '')
  // Refs survive React StrictMode's dev-only mount/unmount/mount, so the load/create runs once.
  const hydrateStartedRef = useRef(false)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  const saveTimerRef = useRef(null)
  const savingRef = useRef(false)
  const pendingSaveRef = useRef(false)
  // Server revision this editor last loaded or saved. Sent with every save so the server
  // refuses (409) instead of overwriting a newer save from another tab or person.
  const revisionRef = useRef(0)
  const retryTimerRef = useRef(null)
  const retryAttemptRef = useRef(0)
  // Conflict, deleted design or expired session: autosave stays off until the user picks a way out.
  const saveHaltedRef = useRef(false)
  // blob: URL → upload promise, for images dropped from the desktop that aren't stored yet.
  const pendingUploadsRef = useRef(new Map())

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
  // The document as last confirmed by the server (state is immutable, so identity compare works).
  const savedSnapshotRef = useRef({ canvases, docTitle, size })
  const currentSaveRef = useRef(null)
  const hydratePromiseRef = useRef(null)

  const isDirty = useCallback(() => {
    const saved = savedSnapshotRef.current
    return (
      pendingUploadsRef.current.size > 0 ||
      docTitleRef.current !== lastSyncedTitleRef.current ||
      canvasesRef.current !== saved.canvases ||
      docTitleRef.current !== saved.docTitle ||
      sizeRef.current !== saved.size
    )
  }, [])

  const persistRef = useRef(null)
  const createRef = useRef(null)
  const creatingRef = useRef(null)

  const handleSaveFailure = useCallback((error) => {
    const kind = classifySaveError(error)
    console.error('Failed to save canvas:', error)
    setSaveError({ kind, message: describeSaveError(kind, error) })
    if (haltsAutosave(kind)) {
      saveHaltedRef.current = true
      pendingSaveRef.current = false
      setSaveState(kind === SAVE_ERROR.CONFLICT ? 'conflict' : 'error')
      setRecovery({ kind })
    } else if (isRetryable(kind)) {
      setSaveState('retrying')
      const delay = retryDelayMs(retryAttemptRef.current)
      retryAttemptRef.current += 1
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null
        persistRef.current?.()
      }, delay)
    } else {
      // The server refused this document; sending it again would fail the same way.
      // The next edit tries again (e.g. after the user removes elements over the cap).
      setSaveState('error')
    }
  }, [])

  const persistCanvasData = useCallback(() => {
    if (!canPersist || saveHaltedRef.current) return Promise.resolve()
    // The create request failed earlier: retrying a save means retrying the create.
    if (!canvasIdRef.current) return hydratedRef.current ? createRef.current?.() : Promise.resolve()
    if (savingRef.current) {
      pendingSaveRef.current = true
      return currentSaveRef.current
    }
    clearTimerRef(retryTimerRef)
    savingRef.current = true
    setSaveState('saving')
    const id = canvasIdRef.current
    const snapshot = {
      canvases: canvasesRef.current,
      docTitle: docTitleRef.current,
      size: sizeRef.current,
    }

    const run = (async () => {
      try {
        const saved = await canvasService.saveCanvasData(workspaceId, id, serializeForSave(snapshot), {
          baseRevision: revisionRef.current,
        })
        revisionRef.current = readRevision(saved?.data) || revisionRef.current + 1
        savedSnapshotRef.current = snapshot
        // Library cards show the project name, so keep it in step with the header title.
        // Only marked synced once the server confirms; a failure is retried with the next save.
        if (snapshot.docTitle !== lastSyncedTitleRef.current) {
          await canvasService.updateCanvasMeta(workspaceId, id, {
            name: snapshot.docTitle || 'Untitled Design',
          })
          lastSyncedTitleRef.current = snapshot.docTitle
        }
        retryAttemptRef.current = 0
        setSaveError(null)
        setSaveState('saved')
        if (!isDirty()) clearLocalDraft(id)
      } catch (error) {
        handleSaveFailure(error)
      } finally {
        savingRef.current = false
      }
      if (pendingSaveRef.current && !saveHaltedRef.current) {
        pendingSaveRef.current = false
        await persistCanvasData()
      }
    })()

    currentSaveRef.current = run
    return run
  }, [workspaceId, canPersist, isDirty, handleSaveFailure])
  persistRef.current = persistCanvasData

  /** Save anything not yet on the server right now. Resolves true when nothing is left unsaved. */
  const flushPendingSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (hydratePromiseRef.current) await hydratePromiseRef.current
    // Uploads swap their blob: URL for the stored one, which is itself an edit to save.
    if (pendingUploadsRef.current.size) await Promise.allSettled([...pendingUploadsRef.current.values()])
    if (currentSaveRef.current) await currentSaveRef.current
    if (isDirty()) await persistCanvasData()
    return !isDirty()
  }, [isDirty, persistCanvasData])

  /** Header retry / "Try again": start a fresh save now. */
  const resumeSaving = useCallback(() => {
    clearTimerRef(retryTimerRef)
    retryAttemptRef.current = 0
    saveHaltedRef.current = false
    setRecovery(null)
    return persistCanvasData()
  }, [persistCanvasData])

  /** Replace the editor state with a document fetched from the server. */
  const applyServerDocument = useCallback((project) => {
    const loaded = hydrateFromServer(project, startingSize, initialTitle)
    savedSnapshotRef.current = { canvases: loaded.canvases, docTitle: loaded.docTitle, size: loaded.size }
    canvasesRef.current = loaded.canvases
    docTitleRef.current = loaded.docTitle
    sizeRef.current = loaded.size
    lastSyncedTitleRef.current = loaded.docTitle
    revisionRef.current = loaded.revision
    historyRef.current = createHistory(loaded.canvases)
    syncHistoryFlags()
    setDocTitle(loaded.docTitle)
    setSize(loaded.size)
    setCanvases(loaded.canvases)
    setActiveCanvasIndex(0)
    setSelected({ canvasId: null, elementId: null })
    setEditing({ canvasId: null, elementId: null })
    setMultiSelectIds([])
    return loaded
    // startingSize/initialTitle are only fallbacks for an empty stored document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncHistoryFlags])

  /** Fetch the stored design, and offer this device's unsaved copy if the server never got it. */
  const loadStoredDesign = useCallback(async () => {
    const id = canvasIdRef.current || initialCanvasId
    const project = await canvasService.getCanvas(workspaceId, id)
    if (!mountedRef.current) return
    const loaded = applyServerDocument(project)
    canvasIdRef.current = project.id
    setCanvasId(project.id)
    const draft = readLocalDraft(project.id)
    if (draft && shouldOfferDraftRestore(draft, loaded.revision)) {
      setRecovery({ kind: 'draft', draft })
    } else if (draft) {
      clearLocalDraft(project.id)
    }
  }, [workspaceId, initialCanvasId, applyServerDocument])

  /** Initial open, and the Retry button on the load-error screen. */
  const openStoredDesign = useCallback(async () => {
    setLoadError('')
    setHydrating(true)
    setSaveState('loading')
    try {
      await loadStoredDesign()
      if (mountedRef.current) setSaveState('saved')
    } catch (error) {
      console.error('Failed to load canvas:', error)
      if (mountedRef.current) {
        setSaveState('error')
        setLoadError(
          classifySaveError(error) === SAVE_ERROR.NOT_FOUND
            ? 'This design was deleted or you no longer have access to it.'
            : error?.message || 'Failed to load this design.'
        )
      }
    } finally {
      hydratedRef.current = true
      if (mountedRef.current) setHydrating(false)
    }
  }, [loadStoredDesign])

  /** Create the backend record for a new design in the folder it was launched from. */
  const createStoredDesign = useCallback(() => {
    if (creatingRef.current) return creatingRef.current
    const run = (async () => {
      setSaveState('saving')
      try {
        const sentCanvases = canvasesRef.current
        const sentTitle = docTitleRef.current || initialTitle
        const sentSize = sizeRef.current
        const created = await canvasService.createCanvas(workspaceId, {
          name: sentTitle,
          folderId,
          data: serializeForSave({ canvases: sentCanvases, docTitle: sentTitle, size: sentSize }),
        })
        if (!mountedRef.current) return
        const createdName = created.name || created.title || sentTitle
        // Keep a title typed while the request was in flight; otherwise adopt the
        // (possibly de-duplicated) name the server stored.
        if (docTitleRef.current === sentTitle) {
          setDocTitle(createdName)
          docTitleRef.current = createdName
        }
        savedSnapshotRef.current = { canvases: sentCanvases, docTitle: createdName, size: sentSize }
        lastSyncedTitleRef.current = createdName
        revisionRef.current = readRevision(created.data) || 1
        canvasIdRef.current = created.id
        setCanvasId(created.id)
        retryAttemptRef.current = 0
        setSaveError(null)
        setSaveState('saved')
        onCanvasCreated?.(created)
        // Edits made while the create request was in flight haven't been saved yet.
        if (isDirty()) await persistRef.current?.()
      } catch (error) {
        if (mountedRef.current) handleSaveFailure(error)
      } finally {
        hydratedRef.current = true
        creatingRef.current = null
      }
    })()
    creatingRef.current = run
    return run
    // initialTitle / folderId / onCanvasCreated are fixed for the life of this editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, isDirty, handleSaveFailure])
  createRef.current = createStoredDesign

  // Load an existing canvas (reopen), or create the backend record for a brand-new one
  // in the folder it was launched from, so it's saved where the user created it.
  useEffect(() => {
    if (missingLocation) {
      hydratedRef.current = true
      return undefined
    }

    // StrictMode runs this effect twice in dev; a second create would leave an orphan project
    // with a duplicate name, so only the first run does the work.
    if (hydrateStartedRef.current) return undefined
    hydrateStartedRef.current = true

    hydratePromiseRef.current = (initialCanvasId ? openStoredDesign() : createStoredDesign()).finally(() => {
      hydratePromiseRef.current = null
    })
    return undefined
    // Runs once on mount — the effect below handles ongoing autosave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced autosave whenever the document changes, once it's hydrated/created, plus a
  // local recovery copy so a crash or closed tab never loses more than the debounce window.
  useEffect(() => {
    if (!canPersist || !hydratedRef.current || !canvasIdRef.current) return undefined
    // Nothing new since the last server save (e.g. the document we just loaded).
    const saved = savedSnapshotRef.current
    if (canvases === saved.canvases && docTitle === saved.docTitle && size === saved.size) {
      return undefined
    }

    const draftTimer = setTimeout(() => {
      writeLocalDraft(canvasIdRef.current, serializeForSave({ canvases, docTitle, size }), {
        baseRevision: revisionRef.current,
      })
    }, DRAFT_DEBOUNCE_MS)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      persistCanvasData()
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      clearTimeout(draftTimer)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [canvases, docTitle, size, canPersist, persistCanvasData])

  // Back online: don't wait out the backoff.
  useEffect(() => {
    const onOnline = () => {
      if (!retryTimerRef.current) return
      clearTimerRef(retryTimerRef)
      retryAttemptRef.current = 0
      persistRef.current?.()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  /**
   * Last-chance save when the editor goes away without the Back button (tab close, refresh,
   * browser back, another dashboard section): keep a local copy and fire a keepalive request.
   */
  const flushOnExit = useCallback(() => {
    if (!canPersist || !canvasIdRef.current || saveHaltedRef.current || !isDirty()) return
    const id = canvasIdRef.current
    const payload = serializeForSave({
      canvases: canvasesRef.current,
      docTitle: docTitleRef.current,
      size: sizeRef.current,
    })
    writeLocalDraft(id, payload, { baseRevision: revisionRef.current })
    // With a save in flight its revision isn't known yet. This payload is newer, so let it
    // win either way rather than have one of the two refused.
    const baseRevision = savingRef.current ? undefined : revisionRef.current
    if (JSON.stringify({ data: payload, baseRevision }).length > KEEPALIVE_MAX_CHARS) return
    canvasService
      .saveCanvasData(workspaceId, id, payload, { baseRevision, keepalive: true })
      .catch(() => {
        // Nothing can be shown any more; the local copy is offered on next open.
      })
  }, [workspaceId, canPersist, isDirty])
  const flushOnExitRef = useRef(flushOnExit)
  flushOnExitRef.current = flushOnExit

  useEffect(() => {
    const onPageHide = () => flushOnExitRef.current()
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [])

  // Unmount (StrictMode's dev remount included: nothing is dirty then, so it's a no-op).
  useEffect(() => () => {
    flushOnExitRef.current()
    clearTimerRef(retryTimerRef)
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
  }, [])

  // ── Leaving the editor ───────────────────────────────────────────────────
  const [leavePrompt, setLeavePrompt] = useState(null) // null | 'ask' | 'saving' | 'failed'

  // Browser refresh / tab close with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const handleBack = async () => {
    // Saving is stopped until the user resolves the conflict / session / deleted-design dialog.
    if (saveHaltedRef.current && saveError) {
      setRecovery({ kind: saveError.kind })
      return
    }
    // An autosave already on its way counts as saved — just let it land.
    if (savingRef.current && currentSaveRef.current) await currentSaveRef.current
    if (!isDirty()) {
      onBack?.()
      return
    }
    setLeavePrompt('ask')
  }

  const handleSaveAndLeave = async () => {
    setLeavePrompt('saving')
    const saved = await flushPendingSave()
    if (saved) {
      setLeavePrompt(null)
      onBack?.()
    } else {
      setLeavePrompt('failed')
    }
  }

  const handleLeaveWithoutSaving = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    clearTimerRef(retryTimerRef)
    pendingSaveRef.current = false
    // Mark as clean so neither the beforeunload guard nor the exit flush fires on the way out.
    savedSnapshotRef.current = {
      canvases: canvasesRef.current,
      docTitle: docTitleRef.current,
      size: sizeRef.current,
    }
    lastSyncedTitleRef.current = docTitleRef.current
    pendingUploadsRef.current.clear()
    clearLocalDraft(canvasIdRef.current)
    setLeavePrompt(null)
    setRecovery(null)
    onBack?.()
  }

  // ── Save problems that need a decision ───────────────────────────────────
  /** Conflict: drop local changes and load what the server has. */
  const handleLoadLatest = async () => {
    clearTimerRef(retryTimerRef)
    pendingSaveRef.current = false
    try {
      await loadStoredDesign()
      clearLocalDraft(canvasIdRef.current)
      saveHaltedRef.current = false
      setRecovery(null)
      setSaveError(null)
      setSaveState('saved')
    } catch (error) {
      showNotice(`Couldn't load the latest version: ${error?.message || 'request failed'}`)
    }
  }

  /** Conflict: overwrite the server copy with this editor's document. */
  const handleKeepMine = async () => {
    try {
      const latest = await canvasService.getCanvas(workspaceId, canvasIdRef.current)
      revisionRef.current = readRevision(latest?.data)
    } catch (error) {
      showNotice(`Couldn't reach the server: ${error?.message || 'request failed'}`)
      return
    }
    await resumeSaving()
  }

  const handleRestoreDraft = () => {
    const doc = recovery?.draft?.doc
    setRecovery(null)
    if (!doc?.canvases?.length) return
    canvasesRef.current = doc.canvases
    setCanvases(doc.canvases)
    historyRef.current = pushHistory(historyRef.current, doc.canvases)
    syncHistoryFlags()
    if (doc.docTitle) setDocTitle(doc.docTitle)
    if (doc.size) setSize(doc.size)
    setActiveCanvasIndex(0)
  }

  const handleDiscardDraft = () => {
    clearLocalDraft(canvasIdRef.current)
    setRecovery(null)
  }

  // Derived: effective selection ids (multi-select or single)
  const canvasSelectionIds = multiSelectIds.length
    ? multiSelectIds
    : [selected.elementId].filter(Boolean)

  // ── History ──────────────────────────────────────────────────────────────
  const updateCanvasesWithHistory = useCallback((nextCanvases) => {
    if (nextCanvases === canvasesRef.current) return
    canvasesRef.current = nextCanvases
    setCanvases(nextCanvases)
    historyRef.current = pushHistory(historyRef.current, nextCanvases)
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const restoreHistory = useCallback((nextHistory) => {
    if (nextHistory === historyRef.current) return
    historyRef.current = nextHistory
    const doc = currentEntry(nextHistory)
    canvasesRef.current = doc
    setCanvases(doc)
    syncHistoryFlags()
    // Pages and elements that no longer exist can't stay selected or open for editing.
    const { pageIds, elementIds } = collectIds(doc)
    setActiveCanvasIndex((index) => Math.min(index, doc.length - 1))
    setSelected((prev) =>
      (prev.canvasId && !pageIds.has(prev.canvasId)) || (prev.elementId && !elementIds.has(prev.elementId))
        ? { canvasId: null, elementId: null }
        : prev
    )
    setEditing((prev) =>
      prev.elementId && !elementIds.has(prev.elementId) ? { canvasId: null, elementId: null } : prev
    )
    setMultiSelectIds((prev) => {
      const next = prev.filter((id) => elementIds.has(id))
      return next.length === prev.length ? prev : next
    })
    // Resizing is undoable, so keep the document size in step with the pages.
    const first = doc[0]
    if (first) {
      setSize((prev) =>
        prev.width === first.width && prev.height === first.height
          ? prev
          : { width: first.width, height: first.height }
      )
    }
  }, [syncHistoryFlags])

  const undo = useCallback(() => restoreHistory(undoHistory(historyRef.current)), [restoreHistory])
  const redo = useCallback(() => restoreHistory(redoHistory(historyRef.current)), [restoreHistory])

  /**
   * Store an image dropped from the desktop. It shows straight away from a blob: URL; once
   * uploaded, that URL is swapped for the stored one everywhere, undo history included, so
   * neither a save nor an undo can bring back a URL that dies with this tab.
   */
  const uploadLocalImage = useCallback((file, localUrl) => {
    const swap = (toUrl, contentPatch = null) => {
      const wasCurrent = canvasesRef.current === currentEntry(historyRef.current)
      historyRef.current = mapHistory(historyRef.current, (snapshot) =>
        replaceUrlInDocument(snapshot, localUrl, toUrl, contentPatch)
      )
      const next = wasCurrent
        ? currentEntry(historyRef.current)
        : replaceUrlInDocument(canvasesRef.current, localUrl, toUrl, contentPatch)
      if (next !== canvasesRef.current) {
        canvasesRef.current = next
        setCanvases(next)
      }
    }

    const task = (async () => {
      try {
        const asset = await assetService.uploadAsset(workspaceId, file)
        const storedUrl = assetService.resolveAssetUrl(asset)
        if (!storedUrl) throw new Error('the upload finished without a file URL')
        const assetId = asset?.id || asset?._id
        swap(storedUrl, assetId ? { assetId } : null)
      } catch (error) {
        swap(null)
        showNotice(`Couldn't upload ${file?.name || 'that image'}: ${error?.message || 'upload failed'}`)
      } finally {
        pendingUploadsRef.current.delete(localUrl)
        URL.revokeObjectURL(localUrl)
      }
    })()
    pendingUploadsRef.current.set(localUrl, task)
    return task
  }, [workspaceId, showNotice])
  const uploadLocalImageRef = useRef(uploadLocalImage)
  uploadLocalImageRef.current = uploadLocalImage

  // ── Canvas & Element CRUD ───────────────────────────────────────────────
  const applyCanvasSize = (nextSize) => {
    const targetSize = nextSize || size
    setSize(targetSize)
    updateCanvasesWithHistory(resizeDocument(canvases, targetSize))
  }

  const addElement = (payload) => {
    const canvasId = selected.canvasId || activeCanvas.id
    const page = canvases.find((canvas) => canvas.id === canvasId)
    if (!page) return
    if (!canAddElements(page)) {
      showNotice(ELEMENT_CAP_NOTICE)
      return
    }
    const element = createElement(payload, page, page.elements.length)
    updateCanvasesWithHistory(insertElements(canvases, canvasId, [element]))
    setSelected({ canvasId, elementId: element.id })
    setMultiSelectIds([])
  }

  // New pages always go below the last page, matching the size of the page they came from.
  const addCanvas = (source = activeCanvas) => {
    if (!canAddPages(canvases)) {
      showNotice(PAGE_CAP_NOTICE)
      return
    }
    const nextCanvases = addPage(
      canvases,
      source ? { width: source.width || size.width, height: source.height || size.height } : size
    )
    const next = nextCanvases[nextCanvases.length - 1]
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(nextCanvases.length - 1)
    setSelected({ canvasId: next.id, elementId: null })
    setMultiSelectIds([])
  }

  // The copy goes directly below the page it was copied from.
  const duplicateCanvas = (source) => {
    const { canvases: nextCanvases, page: copy } = duplicatePage(canvases, source.id)
    if (!copy) {
      if (!canAddPages(canvases)) showNotice(PAGE_CAP_NOTICE)
      return
    }
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(nextCanvases.indexOf(copy))
    setSelected({ canvasId: copy.id, elementId: null })
    setMultiSelectIds([])
  }

  const deleteCanvas = (canvasId) => {
    const updated = deletePage(canvases, canvasId)
    if (updated === canvases) return
    updateCanvasesWithHistory(updated)
    setActiveCanvasIndex((prev) => Math.max(0, prev - 1))
    setSelected({ canvasId: null, elementId: null })
    setMultiSelectIds([])
  }

  const moveCanvas = (fromIndex, direction) => {
    const toIndex = fromIndex + direction
    const nextCanvases = movePage(canvases, fromIndex, toIndex)
    if (nextCanvases === canvases) return
    updateCanvasesWithHistory(nextCanvases)
    setActiveCanvasIndex(toIndex)
    setSelected({ canvasId: nextCanvases[toIndex].id, elementId: null })
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
    if (!canAddElements(canvas, clipboardRef.current.length)) {
      showNotice(ELEMENT_CAP_NOTICE)
      return
    }
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
    if (!canAddElements(canvas, sources.length)) {
      showNotice(ELEMENT_CAP_NOTICE)
      return
    }
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
    // A file dropped from the desktop: show it now from a blob: URL, store it in the background.
    let localUrl = null
    if (payload.file && (!url || isLocalUrl(url))) {
      localUrl = url || URL.createObjectURL(payload.file)
      url = localUrl
    }
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
      if (localUrl) uploadLocalImageRef.current(payload.file, localUrl)
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
    if (localUrl) uploadLocalImageRef.current(payload.file, localUrl)
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
    setInspectorOpen(true)
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
  }, [undo, redo, copySelection, cutSelection, pasteClipboard, duplicateSelection, deleteElements, groupSelection, ungroupSelection, toggleLock, bringForward, sendBackward, bringToFront, sendToBack, updateCanvasesWithHistory])

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
        setZoom(calculateFitZoom())
        break
      default:
        break
    }
  }, [undo, redo, duplicateSelection, copySelection, pasteClipboard, groupSelection, ungroupSelection, toggleLock, smartTidy, smartSwap, bringForward, sendBackward, bringToFront, sendToBack, calculateFitZoom])

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

  // Don't flash the empty 1080x1080 default while the saved design is still being fetched.
  if (hydrating || loadError) {
    return (
      <div className="canvas-editor-page canvas-editor-loading" role="status" aria-live="polite">
        {loadError ? (
          <div className="canvas-editor-loading-card">
            <p className="canvas-editor-loading-title">Couldn&apos;t open this design</p>
            <p className="canvas-editor-loading-sub">{loadError}</p>
            <div className="canvas-editor-loading-actions">
              {initialCanvasId && !missingLocation && (
                <button type="button" className="canva-header-secondary-btn" onClick={openStoredDesign}>
                  Try again
                </button>
              )}
              <button type="button" className="canva-header-primary-btn" onClick={onBack}>
                Go back
              </button>
            </div>
          </div>
        ) : (
          <div className="canvas-editor-loading-card">
            <span className="canvas-editor-spinner" aria-hidden="true" />
            <p className="canvas-editor-loading-title">Loading your design…</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="canvas-editor-page">
      {/* 1. Canva Top Header Navbar */}
      <CanvasLeaveDialog
        status={leavePrompt}
        canSave={canPersist}
        failureMessage={saveError?.message || ''}
        onSave={handleSaveAndLeave}
        onDiscard={handleLeaveWithoutSaving}
        onCancel={() => setLeavePrompt(null)}
      />

      <CanvasRecoveryDialog
        kind={recovery?.kind || null}
        draftSavedAt={recovery?.draft?.savedAt}
        onLoadLatest={handleLoadLatest}
        onKeepMine={handleKeepMine}
        onRetry={resumeSaving}
        onLeave={handleLeaveWithoutSaving}
        onRestoreDraft={handleRestoreDraft}
        onDiscardDraft={handleDiscardDraft}
        onClose={() => setRecovery(null)}
      />

      {notice && (
        <div className="canvas-editor-notice" role="status" aria-live="polite">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <CanvasHeader
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        onBack={handleBack}
        undo={undo}
        redo={redo}
        canUndo={historyFlags.canUndo}
        canRedo={historyFlags.canRedo}
        onOpenSizeModal={() => setShowSizeModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        activeCanvas={activeCanvas}
        saveState={canPersist ? saveState : null}
        saveMessage={saveError?.message || ''}
        onSaveBadgeClick={() => {
          if (saveHaltedRef.current && saveError) setRecovery({ kind: saveError.kind })
          else if (saveState === 'error' || saveState === 'retrying') resumeSaving()
        }}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
      />

      {/* 2. Studio Layout Body */}
      <div className="canvas-editor-studio-body">
        {/* Far Left Icon Dock (Floating) */}
        <CanvasLeftDock
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />

        {/* Expandable Left Drawer (Floating) */}
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
          editImageElement={selectedElement}
          onChangeEditImageContent={(content) => {
            if (selectedElement) updateElementContent(selectedElement.id, content)
          }}
        />

        {/* Center Workspace Stage with dynamic padding to prevent overlap */}
        <main
          className="canva-stage-viewport"
          style={{
            '--stage-pad-left': `${drawerOpen ? 490 : 96}px`,
            '--stage-pad-right': `${inspectorOpen ? 350 : 36}px`,
          }}
        >
          <CanvasStage
            canvases={canvases}
            activeCanvasIndex={activeCanvasIndex}
            setActiveCanvasIndex={(index) => {
              setActiveCanvasIndex(index)
              setSelected({ canvasId: null, elementId: null })
              setEditing({ canvasId: null, elementId: null })
              setMultiSelectIds([])
            }}
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
            onMoveCanvas={moveCanvas}
          />

          {/* Canva Bottom Control Bar (Floating) */}
          <CanvasBottomBar
            zoom={zoom}
            setZoom={setZoom}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            pageCount={canvases.length}
            activeCanvasIndex={activeCanvasIndex}
            onFitZoom={() => setZoom(calculateFitZoom())}
          />
        </main>

        {/* Right Inspector Sidebar (Floating) */}
        {inspectorOpen && (
          <CanvasRightInspector
            selectedElement={selectedElement}
            activeCanvas={activeCanvas}
            elements={activeCanvas?.elements || []}
            usedFontFamilies={usedFontFamilies}
            onClose={() => setInspectorOpen(false)}
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
        )}
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