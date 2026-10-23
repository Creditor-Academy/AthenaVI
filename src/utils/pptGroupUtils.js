/** Group / ungroup utilities for PPT canvas elements. */

export function isPptGroup(el) {
  return el?.type === 'group' && Array.isArray(el.childIds)
}

export function isPptGroupedChild(el) {
  return !!el?.groupId
}

export function getPptRootElements(elements = []) {
  return elements.filter((el) => !isPptGroupedChild(el))
}

export function getPptGroupChildren(elements = [], group) {
  const ids = new Set(group?.childIds || [])
  return elements.filter((el) => ids.has(el.id))
}

export function canPptGroup(elements, selectedIds) {
  const selected = elements.filter(
    (el) =>
      selectedIds.includes(el.id) &&
      !isPptGroupedChild(el) &&
      !isPptGroup(el) &&
      !el.locked
  )
  return selected.length >= 2
}

export function canPptUngroup(elements, selectedIds) {
  if (selectedIds.length !== 1) return false
  const el = elements.find((e) => e.id === selectedIds[0])
  return isPptGroup(el)
}

/** Expand selected ids so groups include their children. */
export function expandPptSelectionIds(elements = [], selectedIds = []) {
  const idSet = new Set((selectedIds || []).filter(Boolean))
  for (const el of elements) {
    if (idSet.has(el.id) && isPptGroup(el)) {
      for (const cid of el.childIds || []) idSet.add(cid)
    }
  }
  return [...idSet]
}

/** Ids that should move together when dragging one of the selected elements. */
export function collectPptMoveIds(elements = [], selectedIds = [], draggedId) {
  const seed = new Set((selectedIds || []).filter(Boolean))
  if (draggedId) seed.add(draggedId)
  const dragged = elements.find((el) => el.id === draggedId)
  if (dragged?.groupId) {
    seed.add(dragged.groupId)
  }
  return expandPptSelectionIds(elements, [...seed]).filter((id) => {
    const el = elements.find((e) => e.id === id)
    return el && !el.locked
  })
}

export function getPptUnionBounds(elements) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    const p = el.placement || {}
    const x = p.x || 0
    const y = p.y || 0
    const w = p.width || 100
    const h = p.height || 40
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + w)
    maxY = Math.max(maxY, y + h)
  }

  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 100, height: 100 }
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}

export function createPptGroup(elements, selectedIds) {
  const children = elements.filter(
    (el) =>
      selectedIds.includes(el.id) &&
      !isPptGroupedChild(el) &&
      !isPptGroup(el)
  )
  if (children.length < 2) return elements

  const bounds = getPptUnionBounds(children)
  const groupId = `group_${Date.now()}`
  const childIds = children.map((c) => c.id)
  const maxLayer = Math.max(...children.map((c) => c.layer ?? 0))

  const group = {
    id: groupId,
    type: 'group',
    childIds,
    placement: {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    },
    layer: maxLayer,
    locked: false,
    content: {},
  }

  return elements
    .map((el) => {
      if (childIds.includes(el.id)) {
        return { ...el, groupId }
      }
      return el
    })
    .concat(group)
}

export function ungroupPptElement(elements, groupId) {
  const group = elements.find((el) => el.id === groupId && isPptGroup(el))
  if (!group) return elements

  const childIds = new Set(group.childIds || [])
  return elements
    .filter((el) => el.id !== groupId)
    .map((el) => {
      if (childIds.has(el.id)) {
        const { groupId: _gid, ...rest } = el
        return rest
      }
      return el
    })
}
