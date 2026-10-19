/**
 * Local recovery copy of a canvas that has changes the server hasn't confirmed.
 * Written while the document is dirty, cleared after a confirmed save. On reopen, a draft
 * whose base revision is still the server's revision means those changes never landed.
 *
 * `storage` is injectable for tests; every access is guarded because storage can be
 * full, disabled or missing (private windows, previews).
 */

const KEY_PREFIX = 'athena.canvas.draft.'
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function defaultStorage() {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

export function draftKey(canvasId) {
  return `${KEY_PREFIX}${canvasId}`
}

/** Returns true when the draft was stored. */
export function writeLocalDraft(canvasId, doc, { baseRevision = 0, now = Date.now() } = {}, storage = defaultStorage()) {
  if (!canvasId || !storage) return false
  try {
    storage.setItem(draftKey(canvasId), JSON.stringify({ savedAt: now, baseRevision, doc }))
    return true
  } catch {
    return false
  }
}

export function readLocalDraft(canvasId, { now = Date.now() } = {}, storage = defaultStorage()) {
  if (!canvasId || !storage) return null
  try {
    const raw = storage.getItem(draftKey(canvasId))
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (!draft?.doc || !Array.isArray(draft.doc.canvases)) return null
    if (now - Number(draft.savedAt || 0) > DRAFT_MAX_AGE_MS) {
      storage.removeItem(draftKey(canvasId))
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function clearLocalDraft(canvasId, storage = defaultStorage()) {
  if (!canvasId || !storage) return
  try {
    storage.removeItem(draftKey(canvasId))
  } catch {
    // ignore
  }
}

/**
 * Offer to restore only when the server hasn't accepted a save since the draft's base.
 * A newer server revision means the draft's last save landed (e.g. the keepalive flush on
 * tab close) or someone else saved after it; either way the draft is stale.
 */
export function shouldOfferDraftRestore(draft, serverRevision) {
  if (!draft) return false
  return Number(draft.baseRevision) >= Number(serverRevision)
}
