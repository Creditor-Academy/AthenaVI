/**
 * Undo/redo history for the Canvas Editor as a plain immutable value:
 * `{ stack, index, doc }`, where `stack` holds whole `canvases` arrays and `doc` is
 * `stack[index]`. The editor keeps this in a ref so handlers memoised with empty deps
 * never read a stale copy.
 */

export const HISTORY_LIMIT = 30

function at(stack, index) {
  return { stack, index, doc: stack[index] }
}

export function createHistory(present) {
  return at([present], 0)
}

export function currentEntry(history) {
  return history.doc
}

/** Record a new present. Drops the redo branch and the oldest snapshots past `limit`. */
export function pushHistory(history, next, limit = HISTORY_LIMIT) {
  if (next === currentEntry(history)) return history
  const stack = history.stack.slice(0, history.index + 1)
  stack.push(next)
  const overflow = Math.max(0, stack.length - limit)
  const trimmed = overflow ? stack.slice(overflow) : stack
  return at(trimmed, trimmed.length - 1)
}

export function undoHistory(history) {
  return history.index > 0 ? at(history.stack, history.index - 1) : history
}

export function redoHistory(history) {
  return history.index < history.stack.length - 1 ? at(history.stack, history.index + 1) : history
}

export function canUndo(history) {
  return history.index > 0
}

export function canRedo(history) {
  return history.index < history.stack.length - 1
}

/** Apply `mapSnapshot` to every snapshot (e.g. swapping an uploaded image's URL). */
export function mapHistory(history, mapSnapshot) {
  let changed = false
  const stack = history.stack.map((snapshot) => {
    const next = mapSnapshot(snapshot)
    if (next !== snapshot) changed = true
    return next
  })
  return changed ? at(stack, history.index) : history
}
