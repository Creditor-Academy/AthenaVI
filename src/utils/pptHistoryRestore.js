/**
 * Undo / redo restores a whole-deck snapshot. Only slides whose canvas actually changes must be
 * saved: saving every slide wrote this tab's copy of all of them over the server, deleting
 * changes made elsewhere (another tab or person) on slides the undo never touched
 * (CANVAS_FIX_PLAN_25NOV2026, N-1).
 */

function canvasKey(slide) {
  try {
    return JSON.stringify(slide?.elements ?? null)
  } catch {
    return null
  }
}

/**
 * Ids of the restored slides that need a canvas save.
 * @param {object[]} beforeSlides  local slides just before the restore
 * @param {object[]} restoredSlides slides from the snapshot (ids already resolved)
 * @param {Iterable<string>} pendingIds slides whose not-yet-sent saves the restore cancelled
 * @param {(id: string) => string} [resolveId] maps a temporary slide id to its server id
 */
export function slidesToSaveAfterRestore(beforeSlides, restoredSlides, pendingIds = [], resolveId = (id) => id) {
  const before = new Map()
  for (const slide of beforeSlides || []) {
    if (slide?.id) before.set(resolveId(slide.id), slide)
  }
  const pending = new Set([...(pendingIds || [])].filter(Boolean).map((id) => resolveId(id)))

  const ids = []
  for (const slide of restoredSlides || []) {
    if (!slide?.id || !slide.elements) continue
    const id = resolveId(slide.id)
    const previous = before.get(id)
    const changed = !previous || canvasKey(previous) !== canvasKey(slide)
    // A cancelled save carried an edit the server may not have yet, even when the restored
    // canvas equals the local one.
    if (changed || pending.has(id)) ids.push(slide.id)
  }
  return ids
}

/**
 * How the slide list changes when a snapshot is restored (D-5), so the server is told too:
 * - `removed`: slides on the server now that the snapshot doesn't have (undo of add) → delete;
 * - `recreated`: slides the snapshot has that are gone from the server (undo of delete) → add again;
 * - `orderChanged`: the remaining slides are in another order (undo of reorder) → reorder.
 * Temporary ids (slides still being created) are left to the add request already on its way.
 */
export function slideListChanges(beforeIds, afterIds, isTemporaryId = () => false) {
  const before = (beforeIds || []).filter(Boolean)
  const after = (afterIds || []).filter(Boolean)
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const removed = before.filter((id) => !afterSet.has(id) && !isTemporaryId(id))
  const recreated = after.filter((id) => !beforeSet.has(id) && !isTemporaryId(id))
  const keptBefore = before.filter((id) => afterSet.has(id))
  const keptAfter = after.filter((id) => beforeSet.has(id))
  const orderChanged = keptBefore.some((id, i) => keptAfter[i] !== id)
  return { removed, recreated, orderChanged }
}
