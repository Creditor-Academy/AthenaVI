import { useCallback, useEffect, useRef } from 'react'
import { PPT_CAPS, buildCanvasDoc } from '../../../utils/presentationHelpers'
import {
  canPptGroup,
  canPptUngroup,
  createPptGroup,
  expandPptSelectionIds,
  nextPptLayer,
  pptStackOrder,
  ungroupPptElement,
} from '../../../utils/pptGroupUtils'
import { alignPptElements } from '../../../utils/pptAlignUtils'
import {
  findSmartSwapTarget,
  smartSwapElements,
  smartTidyElements,
} from '../../../utils/pptSmartFormat'

const ELEMENT_PATCH_DEBOUNCE_MS = 320

/**
 * Shared element mutation handlers for AIPptEditor.
 */
export function usePptElementMutations({
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
  applySlideUpdate: _applySlideUpdate,
  queueCanvasSave,
  pushHistory,
  // A slide added in this session has a temporary id until the server answers; edits made
  // meanwhile keep that id. These map it to the real id when the save is sent (QA P-1).
  resolveSlideId = (id) => id,
  isUnsavedSlideId = () => false,
  // Called for every slide an edit touches (the editor keeps those edits when a reload races them).
  markSlideEdited,
  // Told when an edit would put more than PPT_CAPS.ELEMENTS_PER_SLIDE elements on a slide. The
  // server refuses such a slide, so the edit is not made (it used to be, and then never saved).
  onElementCapReached,
}) {
  const localSlidesRef = useRef(localSlides)
  /** The slide `id` refers to, under its temporary or its real id. */
  const isSlide = useCallback(
    (slide, id) => slide?.id === id || slide?.id === resolveSlideId(id),
    [resolveSlideId]
  )
  const patchTimersRef = useRef({})
  const pendingPatchRef = useRef({})
  const clipboardRef = useRef([])

  /** True when `adding` more elements still fit on the slide; otherwise reports the cap. */
  const fitsElementCap = useCallback(
    (slide, adding) => {
      const count = slide?.elements?.elements?.length || 0
      if (count + adding <= PPT_CAPS.ELEMENTS_PER_SLIDE) return true
      onElementCapReached?.(PPT_CAPS.ELEMENTS_PER_SLIDE)
      return false
    },
    [onElementCapReached]
  )

  useEffect(() => {
    localSlidesRef.current = localSlides
  }, [localSlides])

  const getSlide = useCallback(
    () => localSlidesRef.current.find((s) => s.id === selectedSlideId) || localSlidesRef.current[0],
    [selectedSlideId]
  )

  const updateElements = useCallback(
    (slideId, mutator, { history = true } = {}) => {
      if (history) {
        pushHistory?.({
          slides: localSlidesRef.current,
          selectedSlideId,
          selectedElementId,
        })
      }
      markSlideEdited?.(slideId)
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (!isSlide(s, slideId)) return s
          const elements = mutator(s.elements?.elements || [])
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
        localSlidesRef.current = next
        return next
      })
      const latest = localSlidesRef.current.find((s) => isSlide(s, slideId))
      if (latest?.elements) queueCanvasSave?.(slideId, latest.elements)
    },
    [selectedSlideId, selectedElementId, aspectRatio, pushHistory, setLocalSlides, queueCanvasSave, markSlideEdited, isSlide]
  )

  const cancelPendingPatches = useCallback(() => {
    Object.values(patchTimersRef.current).forEach((t) => clearTimeout(t))
    patchTimersRef.current = {}
    pendingPatchRef.current = {}
  }, [])

  const patchElement = useCallback(
    (elementId, patch, { slideId = selectedSlideId, history = true } = {}) => {
      if (!slideId || isGenerating) return

      const key = `${slideId}:${elementId}`
      const startingBurst = !patchTimersRef.current[key]
      if (history && startingBurst) {
        pushHistory?.({
          slides: localSlidesRef.current,
          selectedSlideId,
          selectedElementId,
        })
      }

      markSlideEdited?.(slideId)
      // Always merge against latest state so rapid rotate/flip clicks don't clobber each other
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (!isSlide(s, slideId)) return s
          const nextElements = (s.elements?.elements || []).map((el) => {
            if (el.id !== elementId) return el
            return {
              ...el,
              ...(patch.content ? { content: { ...el.content, ...patch.content } } : {}),
              ...(patch.placement
                ? { placement: { ...el.placement, ...patch.placement } }
                : {}),
              ...(patch.locked != null ? { locked: patch.locked } : {}),
            }
          })
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements: nextElements }) }
        })
        localSlidesRef.current = next
        return next
      })

      if (!workspaceId || !presentationId) return

      const prevPending = pendingPatchRef.current[key] || {}
      const merged = {
        ...(prevPending.content || patch.content
          ? {
              content: {
                ...(prevPending.content || {}),
                ...(patch.content || {}),
              },
            }
          : {}),
        ...(prevPending.placement || patch.placement
          ? {
              placement: {
                ...(prevPending.placement || {}),
                ...(patch.placement || {}),
              },
            }
          : {}),
        ...(patch.locked != null || prevPending.locked != null
          ? { locked: patch.locked != null ? patch.locked : prevPending.locked }
          : {}),
      }
      pendingPatchRef.current[key] = merged

      if (patchTimersRef.current[key]) clearTimeout(patchTimersRef.current[key])
      patchTimersRef.current[key] = setTimeout(async () => {
        const pending = pendingPatchRef.current[key]
        delete pendingPatchRef.current[key]
        delete patchTimersRef.current[key]
        if (!pending) return

        // Send full placement/content from latest local element so partial patches
        // never wipe x/y/size or other content fields on the server.
        const slide = localSlidesRef.current.find((s) => isSlide(s, slideId))
        const el = slide?.elements?.elements?.find((e) => e.id === elementId)
        if (!el) return

        // The slide's id now (it may have been created on the server since the edit). Still
        // being created: its canvas save waits for it (queueCanvasSave), instead of a PATCH
        // to an id the server doesn't know.
        const persistId = resolveSlideId(slideId)
        if (isUnsavedSlideId(persistId)) {
          queueCanvasSave?.(slideId, slide.elements)
          return
        }

        const payload = {}
        if (pending.placement) payload.placement = { ...(el.placement || {}) }
        if (pending.content) payload.content = { ...(el.content || {}) }
        if (pending.locked != null) payload.locked = el.locked

        try {
          await presentationService.updateElement(
            workspaceId,
            presentationId,
            persistId,
            elementId,
            payload
          )
          // Do not applySlideUpdate — delayed responses race newer local edits
        } catch {
          const latest = localSlidesRef.current.find((s) => isSlide(s, slideId))
          if (latest?.elements) queueCanvasSave?.(persistId, latest.elements)
        }
      }, ELEMENT_PATCH_DEBOUNCE_MS)
    },
    [
      selectedSlideId,
      isGenerating,
      aspectRatio,
      workspaceId,
      presentationId,
      selectedElementId,
      pushHistory,
      setLocalSlides,
      queueCanvasSave,
      resolveSlideId,
      isUnsavedSlideId,
      markSlideEdited,
      isSlide,
    ]
  )

  // Copies go on top of the slide (above its highest layer, not "element count + 1", which put
  // them behind generated elements), keeping the originals' stacking among themselves.
  const cloneElementsWithOffset = (sources, slideElements = []) => {
    const layerStart = nextPptLayer(slideElements) - 1
    const stamp = Date.now()
    const idMap = new Map()
    const clones = pptStackOrder(sources).map((source, index) => {
      const id = `el-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`
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

  const duplicateElement = useCallback(
    (ids = []) => {
      const slide = getSlide()
      if (!slide || isGenerating) return
      const requested = (ids.length ? ids : [selectedElementId]).filter(Boolean)
      const expanded = expandPptSelectionIds(slide.elements?.elements || [], requested)
      const sources = (slide.elements?.elements || []).filter((el) => expanded.includes(el.id))
      if (!sources.length) return
      if (!fitsElementCap(slide, sources.length)) return

      pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
      const clones = cloneElementsWithOffset(sources, slide.elements?.elements || [])
      updateElements(slide.id, (els) => [...els, ...clones], { history: false })
      const last = clones[clones.length - 1]
      if (last) setSelectedElementId(last.id)
      setMultiSelectIds?.(clones.map((c) => c.id))
    },
    [
      getSlide,
      selectedElementId,
      isGenerating,
      selectedSlideId,
      pushHistory,
      updateElements,
      setSelectedElementId,
      setMultiSelectIds,
      fitsElementCap,
    ]
  )

  const copySelection = useCallback(
    (ids = []) => {
      const slide = getSlide()
      if (!slide) return false
      const requested = (ids.length ? ids : [selectedElementId]).filter(Boolean)
      const expanded = expandPptSelectionIds(slide.elements?.elements || [], requested)
      if (!expanded.length) return false
      const selected = (slide.elements?.elements || []).filter((el) => expanded.includes(el.id))
      if (!selected.length) return false
      clipboardRef.current = JSON.parse(JSON.stringify(selected))
      return true
    },
    [getSlide, selectedElementId]
  )

  const hasClipboard = useCallback(() => clipboardRef.current.length > 0, [])

  const pasteClipboard = useCallback(() => {
    const slide = getSlide()
    if (!slide || isGenerating || !clipboardRef.current?.length) return
    if (!fitsElementCap(slide, clipboardRef.current.length)) return
    pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
    const clones = cloneElementsWithOffset(clipboardRef.current, slide.elements?.elements || [])
    updateElements(slide.id, (els) => [...els, ...clones], { history: false })
    const last = clones[clones.length - 1]
    if (last) setSelectedElementId(last.id)
    setMultiSelectIds?.(clones.map((c) => c.id))
  }, [
    getSlide,
    isGenerating,
    selectedSlideId,
    selectedElementId,
    pushHistory,
    updateElements,
    setSelectedElementId,
    setMultiSelectIds,
    fitsElementCap,
  ])

  const cutSelection = useCallback(
    (ids = [], onDelete) => {
      if (!copySelection(ids)) return
      onDelete?.(ids)
    },
    [copySelection]
  )

  const toggleLock = useCallback(
    (ids = []) => {
      const slide = getSlide()
      const idList = (ids.length ? ids : [selectedElementId]).filter(Boolean)
      if (!idList.length || !slide) return
      const selected = (slide.elements?.elements || []).filter((e) => idList.includes(e.id))
      if (!selected.length) return
      const shouldLock = selected.some((e) => !e.locked)
      if (idList.length === 1) {
        patchElement(idList[0], { locked: shouldLock })
        return
      }
      pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
      updateElements(
        slide.id,
        (els) => els.map((el) => (idList.includes(el.id) ? { ...el, locked: shouldLock } : el)),
        { history: false }
      )
    },
    [
      selectedElementId,
      selectedSlideId,
      getSlide,
      patchElement,
      pushHistory,
      updateElements,
    ]
  )

  const groupSelection = useCallback(
    (selectedIds) => {
      const slide = getSlide()
      if (!slide || !canPptGroup(slide.elements?.elements || [], selectedIds)) return
      // A group is one more element on the slide, next to its children.
      if (!fitsElementCap(slide, 1)) return
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      // The id is decided here: the updater runs later, so reading an id back from it always
      // missed and the new group was never selected (the handles stayed on one child).
      const groupId = `group_${Date.now()}`
      updateElements(slide.id, (els) => createPptGroup(els, selectedIds, groupId), { history: false })
      setSelectedElementId(groupId)
      setMultiSelectIds?.([groupId])
    },
    [
      getSlide,
      localSlides,
      selectedSlideId,
      selectedElementId,
      pushHistory,
      updateElements,
      setSelectedElementId,
      setMultiSelectIds,
      fitsElementCap,
    ]
  )

  const ungroupSelection = useCallback(
    (ids = []) => {
      const slide = getSlide()
      const targetId = (ids.length ? ids[0] : selectedElementId) || null
      if (!slide || !targetId || !canPptUngroup(slide.elements?.elements || [], [targetId])) return
      const group = (slide.elements?.elements || []).find((el) => el.id === targetId)
      const childIds = [...(group?.childIds || [])]
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      updateElements(slide.id, (els) => ungroupPptElement(els, targetId), { history: false })
      setSelectedElementId(childIds[0] || null)
      setMultiSelectIds?.(childIds)
    },
    [
      getSlide,
      selectedElementId,
      localSlides,
      selectedSlideId,
      pushHistory,
      updateElements,
      setSelectedElementId,
      setMultiSelectIds,
    ]
  )

  const alignSelection = useCallback(
    (ids, alignment) => {
      const slide = getSlide()
      if (!slide || !alignment) return
      const selectedIds = (ids?.length ? ids : [selectedElementId]).filter(Boolean)
      if (!selectedIds.length) return
      const canvas = slide.elements?.canvas || { width: 1920, height: 1080 }
      pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
      updateElements(
        slide.id,
        (els) => alignPptElements(els, selectedIds, alignment, canvas),
        { history: false }
      )
    },
    [
      getSlide,
      selectedElementId,
      selectedSlideId,
      pushHistory,
      updateElements,
    ]
  )

  const smartTidy = useCallback(
    (selectedIds) => {
      const slide = getSlide()
      if (!slide) return
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      updateElements(
        slide.id,
        (els) => smartTidyElements(els, selectedIds?.length ? selectedIds : [selectedElementId]),
        { history: false }
      )
    },
    [getSlide, localSlides, selectedSlideId, selectedElementId, pushHistory, updateElements]
  )

  const smartSwap = useCallback(() => {
    const slide = getSlide()
    if (!slide || !selectedElementId) return
    const target = findSmartSwapTarget(slide.elements?.elements || [], selectedElementId)
    if (!target) return
    pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
    updateElements(
      slide.id,
      (els) => smartSwapElements(els, selectedElementId, target.id),
      { history: false }
    )
  }, [
    getSlide,
    selectedElementId,
    localSlides,
    selectedSlideId,
    pushHistory,
    updateElements,
  ])

  const updateSpeakerNotes = useCallback(
    (slideId, notes) => {
      markSlideEdited?.(slideId)
      setLocalSlides((prev) =>
        prev.map((s) =>
          isSlide(s, slideId)
            ? {
                ...s,
                speakerNotes: notes,
                elements: { ...(s.elements || {}), speakerNotes: notes },
              }
            : s
        )
      )
      if (workspaceId && presentationId) {
        const persistId = resolveSlideId(slideId)
        if (isUnsavedSlideId(persistId)) {
          // Not on the server yet: the canvas save (which carries the notes) waits for it.
          const latest = localSlidesRef.current.find((s) => isSlide(s, slideId))
          if (latest?.elements) queueCanvasSave?.(slideId, latest.elements)
        } else {
          presentationService
            .patchSlide(workspaceId, presentationId, persistId, { speakerNotes: notes })
            .catch(() => {})
        }
      }
    },
    [workspaceId, presentationId, setLocalSlides, resolveSlideId, isUnsavedSlideId, queueCanvasSave, markSlideEdited, isSlide]
  )

  return {
    patchElement,
    cancelPendingPatches,
    duplicateElement,
    copySelection,
    pasteClipboard,
    hasClipboard,
    cutSelection,
    toggleLock,
    groupSelection,
    ungroupSelection,
    alignSelection,
    smartTidy,
    smartSwap,
    updateSpeakerNotes,
    updateElements,
    /** True while a debounced element PATCH is waiting or in-flight for this slide. */
    hasPendingPatchesForSlide: (slideId) =>
      Object.keys(pendingPatchRef.current).some((k) => k.startsWith(`${slideId}:`)),
    /** Slides with a debounced element PATCH not sent yet (keys are `slideId:elementId`). */
    pendingPatchSlideIds: () =>
      [...new Set(Object.keys(pendingPatchRef.current).map((k) => k.slice(0, k.indexOf(':'))))],
  }
}
