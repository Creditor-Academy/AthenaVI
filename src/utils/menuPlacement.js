const MENU_GAP = 6
const VIEWPORT_PAD = 8

/**
 * Place a popup menu so all of it is on screen.
 * `anchor` is the button's rect, `cursor` a right-click point, `size` the menu's measured size.
 * Opens below the button or cursor when it fits, otherwise above it, otherwise pinned inside
 * the window with `maxHeight` so the menu scrolls.
 */
export function placeMenu(anchor, cursor, size = {}, viewport = {}) {
  const vw = viewport.width ?? window.innerWidth
  const vh = viewport.height ?? window.innerHeight
  const width = size.width || 212
  const height = size.height || 480
  const maxHeight = Math.max(120, vh - VIEWPORT_PAD * 2)
  const h = Math.min(height, maxHeight)

  let left = cursor?.x ?? (anchor ? anchor.right - 8 : 12)
  if (left + width > vw - VIEWPORT_PAD) left = vw - width - VIEWPORT_PAD
  left = Math.max(VIEWPORT_PAD, left)

  const below = cursor ? cursor.y : anchor ? anchor.bottom + MENU_GAP : 12
  const aboveEdge = cursor ? cursor.y : anchor ? anchor.top - MENU_GAP : vh
  let top
  if (below + h <= vh - VIEWPORT_PAD) top = below
  else if (aboveEdge - h >= VIEWPORT_PAD) top = aboveEdge - h
  else top = vh - h - VIEWPORT_PAD
  top = Math.max(VIEWPORT_PAD, top)

  return { top, left, maxHeight }
}
