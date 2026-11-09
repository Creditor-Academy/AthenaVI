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

/** Corners of a placement as drawn (rotated about its centre). */
function placementCorners(p) {
  const x = p.x || 0
  const y = p.y || 0
  const w = p.width || 100
  const h = p.height || 40
  const rotation = Number(p.rotation) || 0
  if (!rotation) {
    return [
      [x, y],
      [x + w, y + h],
    ]
  }
  const cx = x + w / 2
  const cy = y + h / 2
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([dx, dy]) => [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos])
}

/** Box around the elements as drawn — rotated elements count with their rotated corners. */
export function getPptUnionBounds(elements) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    for (const [px, py] of placementCorners(el.placement || {})) {
      minX = Math.min(minX, px)
      minY = Math.min(minY, py)
      maxX = Math.max(maxX, px)
      maxY = Math.max(maxY, py)
    }
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

export function createPptGroup(elements, selectedIds, groupId = `group_${Date.now()}`) {
  const children = elements.filter(
    (el) =>
      selectedIds.includes(el.id) &&
      !isPptGroupedChild(el) &&
      !isPptGroup(el)
  )
  if (children.length < 2) return elements

  const bounds = getPptUnionBounds(children)
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

/**
 * A group's frame is the box around its children. The stored frame went stale whenever a
 * child changed on its own (typing grows a text box, a font size change, resizing a child),
 * so children spilled outside the group's outline. Returns the same array when nothing changed.
 */
export function syncPptGroupBounds(elements = []) {
  if (!elements.some(isPptGroup)) return elements
  const byId = new Map(elements.map((el) => [el.id, el]))
  let changed = false
  const next = elements.map((el) => {
    if (!isPptGroup(el)) return el
    const children = (el.childIds || []).map((id) => byId.get(id)).filter(Boolean)
    if (!children.length) return el
    const b = getPptUnionBounds(children)
    const bounds = {
      x: Math.round(b.x),
      y: Math.round(b.y),
      width: Math.round(b.width),
      height: Math.round(b.height),
    }
    const p = el.placement || {}
    if (p.x === bounds.x && p.y === bounds.y && p.width === bounds.width && p.height === bounds.height) {
      return el
    }
    changed = true
    return { ...el, placement: { ...p, ...bounds } }
  })
  return changed ? next : elements
}

/**
 * Start state for resizing a group: each unlocked child's placement, its font settings, and —
 * via `minHeightFor(child, start)` — the height a text child's text needs at its start width.
 */
export function startPptGroupResize(group, elements = [], { minHeightFor } = {}) {
  if (!isPptGroup(group)) return null
  const starts = {}
  const minHeights = {}
  const fonts = {}
  for (const id of group.childIds || []) {
    const child = elements.find((el) => el.id === id)
    if (!child || child.locked) continue
    const p = child.placement || {}
    starts[id] = {
      ...p,
      x: p.x || 0,
      y: p.y || 0,
      width: p.width || 100,
      height: p.height || 40,
    }
    const minHeight = minHeightFor?.(child, starts[id])
    if (minHeight > 0) minHeights[id] = minHeight
    const c = child.content || {}
    const font = {}
    for (const key of ['fontSize', 'letterSpacing', 'padding', 'paddingX']) {
      if (typeof c[key] === 'number' && Number.isFinite(c[key])) font[key] = c[key]
    }
    if (Object.keys(font).length) fonts[id] = font
  }
  return Object.keys(starts).length ? { starts, minHeights, fonts } : null
}

const MIN_GROUP_SCALE = 0.1
const MAX_GROUP_SCALE = 10

/** One scale factor for a group resize: side handles follow their axis, corners the larger change. */
export function groupScaleForResize(handle, start, next) {
  const sw = start?.width > 0 ? next.width / start.width : 1
  const sh = start?.height > 0 ? next.height / start.height : 1
  const h = String(handle || '')
  let scale
  if (h === 'e' || h === 'w') scale = sw
  else if (h === 'n' || h === 's') scale = sh
  else scale = Math.abs(sw - 1) >= Math.abs(sh - 1) ? sw : sh
  if (!Number.isFinite(scale)) return 1
  return Math.min(MAX_GROUP_SCALE, Math.max(MIN_GROUP_SCALE, scale))
}

const roundTenth = (value) => Math.round(value * 10) / 10

/**
 * Placement patches for a group scaled by `scale` from `start` (the edge or corner opposite the
 * handle stays put). The whole group scales evenly — positions, sizes and font sizes — so text
 * keeps its line breaks and children never run into each other. A patch's `__content` carries
 * the scaled font settings (apply with applyPptElementPatch). Text children stay at least as
 * tall as their text needs.
 */
export function resizePptGroupPatches(state, groupId, start, scale, handle) {
  const s = Number.isFinite(scale) && scale > 0 ? scale : 1
  const h = String(handle || '')
  const width = start.width * s
  const height = start.height * s
  const frame = {
    ...start,
    x: h.includes('w') ? start.x + start.width - width : start.x,
    y: h.includes('n') ? start.y + start.height - height : start.y,
    width,
    height,
  }
  const patches = {}
  for (const [id, p] of Object.entries(state?.starts || {})) {
    const minHeight = state.minHeights?.[id] || 0
    const patch = {
      ...p,
      x: Math.round(frame.x + (p.x - start.x) * s),
      y: Math.round(frame.y + (p.y - start.y) * s),
      width: Math.max(1, Math.round(p.width * s)),
      height: Math.max(1, Math.round(Math.max(p.height, minHeight) * s)),
    }
    const font = state.fonts?.[id]
    if (font) {
      const content = {}
      for (const [key, value] of Object.entries(font)) {
        content[key] = key === 'fontSize' ? Math.max(4, roundTenth(value * s)) : roundTenth(value * s)
      }
      patch.__content = content
    }
    patches[id] = patch
  }
  const children = Object.values(patches).map((placement) => ({ placement }))
  const bounds = children.length ? getPptUnionBounds(children) : frame
  patches[groupId] = {
    ...frame,
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  }
  return patches
}

const GROUP_SCALING_FLAG = 'pptGroupScaling'

/** Marks a group resize in progress (fonts change every frame; boxes are sized by the resize). */
export function setPptGroupScaling(active) {
  if (typeof document === 'undefined') return
  if (active) document.documentElement.dataset[GROUP_SCALING_FLAG] = '1'
  else delete document.documentElement.dataset[GROUP_SCALING_FLAG]
}

export function isPptGroupScaling() {
  return typeof document !== 'undefined' && document.documentElement.dataset[GROUP_SCALING_FLAG] === '1'
}

/**
 * Elements in the order the slide stacks them, back → front: by `layer` (the z-index the canvas
 * paints with), and for equal layers by their place in the list (later is painted on top).
 * Layer controls must work on this order: the saved list order often differs from it on
 * generated slides, so moving by list position jumped several layers or did nothing.
 */
export function pptStackOrder(elements = []) {
  return elements
    .map((el, index) => ({ el, index }))
    .sort((a, b) => (Number(a.el?.layer) || 0) - (Number(b.el?.layer) || 0) || a.index - b.index)
    .map(({ el }) => el)
}

/** A layer above every element on the slide (new and pasted elements go on top). */
export function nextPptLayer(elements = []) {
  return elements.reduce((max, el) => Math.max(max, Number(el?.layer) || 0), 0) + 1
}

/**
 * Stacking order (back → front) after the Layers panel moved one entry. `frontToBackIds` is the
 * panel's new order, top = front. A moved group takes its children with it, just below it, so
 * its contents move as one piece. Elements missing from the list stay at the back.
 */
export function pptOrderFromLayerList(elements = [], frontToBackIds = [], movedId = null) {
  const byId = new Map(elements.map((el) => [el.id, el]))
  let order = [...frontToBackIds]
    .reverse()
    .map((id) => byId.get(id))
    .filter(Boolean)
  const listed = new Set(order.map((el) => el.id))
  const missing = pptStackOrder(elements).filter((el) => !listed.has(el.id))
  order = [...missing, ...order]
  const moved = movedId ? byId.get(movedId) : null
  if (moved && isPptGroup(moved)) {
    const childIds = new Set(expandPptSelectionIds(elements, [movedId]).filter((id) => id !== movedId))
    if (childIds.size) {
      const children = pptStackOrder(elements).filter((el) => childIds.has(el.id))
      order = order.filter((el) => !childIds.has(el.id))
      const at = order.findIndex((el) => el.id === movedId)
      order.splice(at, 0, ...children)
    }
  }
  return order
}

/**
 * New stacking order (back → front) after moving the selection (an id or a list of ids) one
 * step forward/back or to the front/back, as one block. A group moves together with its
 * children — moving only the group entry, which draws nothing, left its contents where they
 * were. Returns null when nothing changes.
 */
export function reorderPptElements(elements = [], selection, direction) {
  const ids = (Array.isArray(selection) ? selection : [selection]).filter(Boolean)
  const blockIds = new Set(expandPptSelectionIds(elements, ids))
  if (!elements.some((el) => blockIds.has(el.id))) return null
  const block = elements.filter((el) => blockIds.has(el.id))
  const rest = elements.filter((el) => !blockIds.has(el.id))
  const firstIndex = elements.findIndex((el) => blockIds.has(el.id))
  const current = elements.slice(0, firstIndex).filter((el) => !blockIds.has(el.id)).length
  const target =
    direction === 'toFront'
      ? rest.length
      : direction === 'toBack'
        ? 0
        : direction === 'forward'
          ? Math.min(rest.length, current + 1)
          : Math.max(0, current - 1)
  const next = [...rest.slice(0, target), ...block, ...rest.slice(target)]
  return next.every((el, i) => el === elements[i]) ? null : next
}

export function normalizeRotation(deg) {
  const r = (((Number(deg) || 0) % 360) + 360) % 360
  return Math.round(r * 100) / 100 || 0
}

/**
 * Patches for a group turned by `delta` degrees about the centre of `start` (its frame):
 * every child moves around that centre and turns by the same amount, so the group rotates as
 * one piece. The group itself only records its angle (shown in the Design panel); its frame
 * stays axis-aligned around the rotated children. Previously only the empty frame turned.
 */
export function rotatePptGroupPatches(state, groupId, start, delta) {
  const d = Number(delta) || 0
  const cx = start.x + start.width / 2
  const cy = start.y + start.height / 2
  const rad = (d * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const patches = {}
  for (const [id, p] of Object.entries(state?.starts || {})) {
    const ox = p.x + p.width / 2 - cx
    const oy = p.y + p.height / 2 - cy
    const nx = cx + ox * cos - oy * sin
    const ny = cy + ox * sin + oy * cos
    patches[id] = {
      ...p,
      x: Math.round(nx - p.width / 2) || 0,
      y: Math.round(ny - p.height / 2) || 0,
      rotation: normalizeRotation((Number(p.rotation) || 0) + d),
    }
  }
  const children = Object.values(patches).map((placement) => ({ placement }))
  const bounds = children.length ? getPptUnionBounds(children) : start
  patches[groupId] = {
    ...start,
    rotation: normalizeRotation((Number(start.rotation) || 0) + d),
    x: Math.round(bounds.x) || 0,
    y: Math.round(bounds.y) || 0,
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  }
  return patches
}

/**
 * Child placement patches for a change made to a group in the Design panel: a new angle turns
 * the children with it, a new transparency applies to every child. The group draws nothing
 * itself, so these changes had no visible effect before.
 */
export function groupPlacementChildPatches(elements = [], group, patch = {}) {
  if (!isPptGroup(group) || !patch) return {}
  const state = startPptGroupResize(group, elements)
  if (!state) return {}
  const out = {}
  const current = group.placement || {}
  if (patch.rotation != null && Number(patch.rotation) !== (Number(current.rotation) || 0)) {
    const delta = Number(patch.rotation) - (Number(current.rotation) || 0)
    const frame = getPptUnionBounds(Object.values(state.starts).map((placement) => ({ placement })))
    const rotated = rotatePptGroupPatches(state, group.id, { ...frame, rotation: current.rotation || 0 }, delta)
    for (const id of Object.keys(state.starts)) out[id] = rotated[id]
  }
  if (patch.opacity != null && Number.isFinite(Number(patch.opacity))) {
    for (const id of Object.keys(state.starts)) {
      out[id] = { ...(out[id] || state.starts[id]), opacity: Number(patch.opacity) }
    }
  }
  return out
}

/** Apply a placement patch from a drag/resize; `__content` (group scaling) goes to content. */
export function applyPptElementPatch(el, patch) {
  if (!patch) return el
  const { __content, ...placement } = patch
  const next = { ...el, placement: { ...el.placement, ...placement } }
  if (__content) next.content = { ...(el.content || {}), ...__content }
  return next
}

/** True when any patch also changes content (group scaling changes font sizes). */
export function placementPatchesChangeContent(patches = {}) {
  return Object.values(patches).some((patch) => patch && patch.__content)
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
