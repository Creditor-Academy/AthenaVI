/**
 * What a key press does during a slideshow (Present plan, Phases 1.8 and 2.5).
 * Pure, so the key map is tested without a browser (slideshowKeys.test.mjs).
 *
 * @param {{ key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, onButton?: boolean }} e
 *   `onButton`: the key went to a toolbar button reached with Tab (it takes Space itself).
 * @returns {'tab'|'escape'|'next'|'prev'|'first'|'last'|'spotlight'|'notes'|null}
 */
export function slideshowKeyAction(e) {
  const key = String(e?.key || '')
  if (key === 'Tab') return 'tab'
  // Ctrl / Cmd / Alt combinations belong to the browser (reload, zoom, switching tabs).
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  switch (key) {
    case 'Escape':
      return 'escape'
    // Presentation clickers send PageDown / PageUp.
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      return 'next'
    case ' ':
    case 'Spacebar':
      return e.onButton ? null : 'next'
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      return 'prev'
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    case 'f':
    case 'F':
      return 'spotlight'
    case 's':
    case 'S':
      return 'notes'
    default:
      return null
  }
}

/** Index after `action`, kept inside the deck. Null when the action doesn't move. */
export function targetIndex(action, index, count) {
  const last = Math.max(0, count - 1)
  switch (action) {
    case 'next':
      return Math.min(last, index + 1)
    case 'prev':
      return Math.max(0, index - 1)
    case 'first':
      return 0
    case 'last':
      return last
    default:
      return null
  }
}

/** The slide index kept inside the deck (slides can be removed while presenting). */
export function clampIndex(index, count) {
  return Math.min(Math.max(0, Number(index) || 0), Math.max(0, count - 1))
}
