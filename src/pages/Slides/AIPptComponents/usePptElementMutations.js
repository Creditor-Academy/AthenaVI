import { useCallback, useEffect, useRef } from 'react'
import { buildCanvasDoc } from '../../../utils/presentationHelpers'
import {
  canPptGroup,
  canPptUngroup,
  createPptGroup,
  ungroupPptElement,
} from '../../../utils/pptGroupUtils'
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
    },
    [selectedSlideId, selectedElementId, aspectRatio, pushHistory, setLocalSlides]
  )

  const patchElement = useCallback(
    (elementId, patch, { slideId = selectedSlideId } = {}) => {
      if (!slideId || isGenerating) return

      const key = `${slideId}:${elementId}`
      const startingBurst = !patchTimersRef.current[key]
      if (startingBurst) {
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

  const duplicateElement = useCallback(() => {
    const slide = getSlide()
    if (!slide || !selectedElementId || isGenerating) return
    const source = slide.elements?.elements?.find((el) => el.id === selectedElementId)
    if (!source) return

    pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })

    const clone = {
      ...source,
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      placement: {
        ...source.placement,
        x: (source.placement?.x || 0) + 24,
        y: (source.placement?.y || 0) + 24,
      },
      layer: (slide.elements?.elements?.length || 0) + 1,
    }

    updateElements(
      slide.id,
      (els) => [...els, clone],
      { history: false }
    )
    setSelectedElementId(clone.id)
  }, [
    getSlide,
    selectedElementId,
    isGenerating,
    selectedSlideId,
    pushHistory,
    updateElements,
    setSelectedElementId,
  ])

  const copySelection = useCallback(
    (ids = []) => {
      const slide = getSlide()
      if (!slide) return false
      const idSet = new Set(ids.filter(Boolean))
      if (!idSet.size && selectedElementId) idSet.add(selectedElementId)
      if (!idSet.size) return false
      const selected = (slide.elements?.elements || []).filter((el) => idSet.has(el.id))
      if (!selected.length) return false
      clipboardRef.current = JSON.parse(JSON.stringify(selected))
      return true
    },
    [getSlide, selectedElementId]
  )

  const pasteClipboard = useCallback(() => {
    const slide = getSlide()
    if (!slide || isGenerating || !clipboardRef.current?.length) return
    pushHistory?.({ slides: localSlidesRef.current, selectedSlideId, selectedElementId })
    const stamp = Date.now()
    const clones = clipboardRef.current.map((source, index) => ({
      ...source,
      id: `el-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      placement: {
        ...source.placement,
        x: (source.placement?.x || 0) + 24,
        y: (source.placement?.y || 0) + 24,
      },
      layer: (slide.elements?.elements?.length || 0) + 1 + index,
    }))
    updateElements(slide.id, (els) => [...els, ...clones], { history: false })
    const last = clones[clones.length - 1]
    if (last) setSelectedElementId(last.id)
  }, [
    getSlide,
    isGenerating,
    selectedSlideId,
    selectedElementId,
    pushHistory,
    updateElements,
    setSelectedElementId,
  ])

  const cutSelection = useCallback(
    (ids = [], onDelete) => {
      if (!copySelection(ids)) return
      onDelete?.()
    },
    [copySelection]
  )

  const toggleLock = useCallback(() => {
    if (!selectedElementId) return
    const slide = getSlide()
    const el = slide?.elements?.elements?.find((e) => e.id === selectedElementId)
    patchElement(selectedElementId, { locked: !el?.locked })
  }, [selectedElementId, getSlide, patchElement])

  const groupSelection = useCallback(
    (selectedIds) => {
      const slide = getSlide()
      if (!slide || !canPptGroup(slide.elements?.elements || [], selectedIds)) return
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      updateElements(slide.id, (els) => createPptGroup(els, selectedIds), { history: false })
    },
    [getSlide, localSlides, selectedSlideId, selectedElementId, pushHistory, updateElements]
  )

  const ungroupSelection = useCallback(() => {
    const slide = getSlide()
    if (!slide || !canPptUngroup(slide.elements?.elements || [], [selectedElementId])) return
    pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
    updateElements(
      slide.id,
      (els) => ungroupPptElement(els, selectedElementId),
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
        prev.map((s) => (s.id === slideId ? { ...s, speakerNotes: notes } : s))
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
    duplicateElement,
    copySelection,
    pasteClipboard,
    cutSelection,
    toggleLock,
    groupSelection,
    ungroupSelection,
    smartTidy,
    smartSwap,
    updateSpeakerNotes,
    updateElements,
    /** True while a debounced element PATCH is waiting or in-flight for this slide. */
    hasPendingPatchesForSlide: (slideId) =>
      Object.keys(pendingPatchRef.current).some((k) => k.startsWith(`${slideId}:`)),
  }
}
