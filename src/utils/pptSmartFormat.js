/** Smart swap and smart tidy for PPT canvas blocks. */

import { getElementBounds } from './pptSmartGuides'

const GAP = 24

/** Swap positions of two elements of the same type. */
export function smartSwapElements(elements, idA, idB) {
  const a = elements.find((el) => el.id === idA)
  const b = elements.find((el) => el.id === idB)
  if (!a || !b || a.type !== b.type) return elements

  const placementA = { ...a.placement }
  const placementB = { ...b.placement }

  return elements.map((el) => {
    if (el.id === idA) return { ...el, placement: placementB }
    if (el.id === idB) return { ...el, placement: placementA }
    return el
  })
}

/** Auto-align selected elements in a tidy grid/row. */
export function smartTidyElements(elements, selectedIds) {
  const selected = elements.filter((el) => selectedIds.includes(el.id))
  if (selected.length < 2) return elements

  const bounds = selected.map(getElementBounds)
  const minX = Math.min(...bounds.map((b) => b.left))
  const minY = Math.min(...bounds.map((b) => b.top))
  const avgW =
    bounds.reduce((sum, b) => sum + b.width, 0) / bounds.length
  const cols = Math.ceil(Math.sqrt(selected.length))

  const placementMap = new Map()
  selected.forEach((el, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    placementMap.set(el.id, {
      ...el.placement,
      x: Math.round(minX + col * (avgW + GAP)),
      y: Math.round(minY + row * (bounds[0].height + GAP)),
    })
  })

  return elements.map((el) => {
    const next = placementMap.get(el.id)
    return next ? { ...el, placement: next } : el
  })
}

/** Find another element of the same type to swap with. */
export function findSmartSwapTarget(elements, elementId) {
  const source = elements.find((el) => el.id === elementId)
  if (!source) return null
  return elements.find(
    (el) => el.id !== elementId && el.type === source.type && !el.groupId
  )
}
