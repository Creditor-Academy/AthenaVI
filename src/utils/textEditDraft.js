/**
 * The text being typed in a slide text box, before the edit is committed.
 *
 * A text box commits only when editing ends (click outside, Escape). Until then the typed text
 * lives only in the box, so a reload or a closed tab lost it, and the editor's save status
 * couldn't see it. The box being edited registers a reader here; the editor saves the draft
 * shortly after typing stops (without disturbing the caret), counts it as unsaved until then,
 * and includes it when the page is closed.
 */

let active = null
const listeners = new Set()

function emit() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // A listener's failure must not stop typing.
    }
  })
}

/**
 * The box being edited registers `{ elementId, read }`. `read()` returns `{ text, runs }` when
 * the text was changed, else null. Returns the unregister function.
 */
export function registerTextEditDraft(entry) {
  active = entry
  emit()
  return () => {
    if (active === entry) {
      active = null
      emit()
    }
  }
}

/** The box was typed in. */
export function notifyTextEditDraft() {
  emit()
}

/** `{ elementId, text, runs }` for the box being edited, when its text was changed; else null. */
export function activeTextEditDraft() {
  if (!active) return null
  const draft = active.read?.()
  return draft ? { elementId: active.elementId, ...draft } : null
}

export function subscribeTextEditDraft(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
