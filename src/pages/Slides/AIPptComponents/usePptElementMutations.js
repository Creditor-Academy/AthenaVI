import { useCallback } from 'react'
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
import { applyVariablesToSlides } from './PptVariablesPanel'

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
  applySlideUpdate,
  queueCanvasSave,
  pushHistory,
}) {
  const getSlide = useCallback(
    () => localSlides.find((s) => s.id === selectedSlideId) || localSlides[0],
    [localSlides, selectedSlideId]
  )

  const updateElements = useCallback(
    (slideId, mutator, { history = true } = {}) => {
      if (history) {
        pushHistory?.({
          slides: localSlides,
          selectedSlideId,
          selectedElementId,
        })
      }
      setLocalSlides((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) return s
          const elements = mutator(s.elements?.elements || [])
          return { ...s, elements: buildCanvasDoc(s, { aspectRatio, elements }) }
        })
      )
    },
    [localSlides, selectedSlideId, selectedElementId, aspectRatio, pushHistory, setLocalSlides]
  )

  const patchElement = useCallback(
    async (elementId, patch, { slideId = selectedSlideId } = {}) => {
      if (!slideId || isGenerating) return
      const slide = localSlides.find((s) => s.id === slideId)
      if (!slide) return

      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })

      const nextElements = (slide.elements?.elements || []).map((el) => {
        if (el.id !== elementId) return el
        return {
          ...el,
          ...(patch.content ? { content: { ...el.content, ...patch.content } } : {}),
          ...(patch.placement ? { placement: { ...el.placement, ...patch.placement } } : {}),
          ...(patch.locked != null ? { locked: patch.locked } : {}),
        }
      })

      const nextDoc = buildCanvasDoc(slide, { aspectRatio, elements: nextElements })
      setLocalSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, elements: nextDoc } : s))
      )

      if (!workspaceId || !presentationId) return

      try {
        const result = await presentationService.updateElement(
          workspaceId,
          presentationId,
          slideId,
          elementId,
          patch
        )
        const slideFromApi = result?.slide || result
        if (slideFromApi?.id) applySlideUpdate?.(slideFromApi)
      } catch {
        queueCanvasSave?.(slideId, nextDoc)
      }
    },
    [
      selectedSlideId,
      localSlides,
      isGenerating,
      aspectRatio,
      workspaceId,
      presentationId,
      selectedElementId,
      pushHistory,
      setLocalSlides,
      applySlideUpdate,
      queueCanvasSave,
    ]
  )

  const duplicateElement = useCallback(() => {
    const slide = getSlide()
    if (!slide || !selectedElementId || isGenerating) return
    const source = slide.elements?.elements?.find((el) => el.id === selectedElementId)
    if (!source) return

    pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })

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
    localSlides,
    selectedSlideId,
    pushHistory,
    updateElements,
    setSelectedElementId,
  ])

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

  const syncVariables = useCallback(
    (variables) => {
      pushHistory?.({ slides: localSlides, selectedSlideId, selectedElementId })
      setLocalSlides((prev) => applyVariablesToSlides(prev, variables))
    },
    [localSlides, selectedSlideId, selectedElementId, pushHistory, setLocalSlides]
  )

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
    toggleLock,
    groupSelection,
    ungroupSelection,
    smartTidy,
    smartSwap,
    syncVariables,
    updateSpeakerNotes,
    updateElements,
  }
}
