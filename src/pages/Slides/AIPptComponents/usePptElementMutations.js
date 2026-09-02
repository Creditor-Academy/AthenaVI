import { useCallback, useEffect, useRef } from 'react'
import { buildCanvasDoc } from '../../../utils/presentationHelpers'
import {
  canPptGroup,
  canPptUngroup,
  createPptGroup,
  expandPptSelectionIds,
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
}) {
  const localSlidesRef = useRef(localSlides)
  const patchTimersRef = useRef({})
  const pendingPatchRef = useRef({})
  const clipboardRef = useRef([])

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
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (s.id !== slideId) return s
          const elements = mutator(s.elements?.elements || [])
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
        localSlidesRef.current = next
        return next
      })
      const latest = localSlidesRef.current.find((s) => s.id === slideId)
      if (latest?.elements) queueCanvasSave?.(slideId, latest.elements)
    },
    [selectedSlideId, selectedElementId, aspectRatio, pushHistory, setLocalSlides, queueCanvasSave]
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

      // Always merge against latest state so rapid rotate/flip clicks don't clobber each other
      setLocalSlides((prev) => {
        const next = prev.map((s) => {
          if (s.id !== slideId) return s
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
        const slide = localSlidesRef.current.find((s) => s.id === slideId)
        const el = slide?.elements?.elements?.find((e) => e.id === elementId)
        if (!el) return

        const payload = {}
        if (pending.placement) payload.placement = { ...(el.placement || {}) }
        if (pending.content) payload.content = { ...(el.content || {}) }
        if (pending.locked != null) payload.locked = el.locked

        try {
          await presentationService.updateElement(
            workspaceId,
            presentationId,
            slideId,
            elementId,
            payload
          )
          // Do not applySlideUpdate — delayed responses race newer local edits
        } catch {
          const latest = localSlidesRef.current.find((s) => s.id === slideId)
          if (latest?.elements) queueCanvasSave?.(slideId, latest.elements)
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
    ]
  )

  const cloneElementsWithOffset = (sources, layerStart) => {
    const stamp = Date.now()
    const idMap = new Map()
    const clones = sources.map((source, index) => {
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

      pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
      const clones = cloneElementsWithOffset(sources, slide.elements?.elements?.length || 0)
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
    pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
    const clones = cloneElementsWithOffset(
      clipboardRef.current,
      slide.elements?.elements?.length || 0
    )
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
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      let createdId = null
      updateElements(
        slide.id,
        (els) => {
          const next = createPptGroup(els, selectedIds)
          const created = next.find((el) => el.type === 'group' && !els.some((o) => o.id === el.id))
          createdId = created?.id || null
          return next
        },
        { history: false }
      )
      if (createdId) {
        setSelectedElementId(null)
        setMultiSelectIds?.([])
      }
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
      setLocalSlides((prev) =>
        prev.map((s) =>
          s.id === slideId
            ? {
                ...s,
                speakerNotes: notes,
                elements: { ...(s.elements || {}), speakerNotes: notes },
              }
            : s
        )
      )
      if (workspaceId && presentationId) {
        presentationService
          .patchSlide(workspaceId, presentationId, slideId, { speakerNotes: notes })
          .catch(() => {})
      }
    },
    [workspaceId, presentationId, setLocalSlides]
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
  }
}
