/**
 * Persistence rules for the canvas editor that don't need React.
 *
 * A new design is stored on a Project row, and that row requires a folder.
 * Create is blocked until the user picks one — there is no silent default folder.
 * Reopening an existing design only needs the workspace and the canvas id.
 */

export const FOLDER_REQUIRED_MESSAGE =
  'Choose a workspace folder before creating a design, so there is somewhere to save it.'

export const LOAD_NOT_FOUND_MESSAGE =
  'This design was deleted or you no longer have access to it.'

export const LOAD_AUTH_MESSAGE =
  'Your session expired, so this design could not be opened.'

export const LOAD_FAILED_MESSAGE = 'Failed to load this design.'

/**
 * Copy for the failed-to-open screen.
 * Deleted designs and expired sessions are not retried; network and server failures are.
 */
export function describeLoadFailure(kind, error) {
  if (kind === 'not-found') return { message: LOAD_NOT_FOUND_MESSAGE, canRetry: false }
  if (kind === 'auth') return { message: LOAD_AUTH_MESSAGE, canRetry: false }
  const message = String(error?.message || '').trim() || LOAD_FAILED_MESSAGE
  return { message, canRetry: true }
}

/**
 * What the editor shows before the document is on screen.
 * `ready` is the editor itself, including a blank page when the stored design is empty.
 */
export function resolveCanvasLoadView({ hydrating = false, loadError = '', canRetry = false } = {}) {
  if (loadError) {
    return {
      screen: 'error',
      title: "Couldn't open this design",
      message: loadError,
      canRetry: Boolean(canRetry),
    }
  }
  if (hydrating) {
    return {
      screen: 'loading',
      title: 'Loading your design…',
      message: '',
      canRetry: false,
    }
  }
  return { screen: 'ready', title: '', message: '', canRetry: false }
}

export function canOpenCanvasEditor({ workspaceId, folderId, canvasId } = {}) {
  if (!workspaceId) return false
  if (canvasId) return true
  return Boolean(folderId)
}

/**
 * Leave-editor flush, in the order the editor must run it.
 * Resolves true only after an in-flight or debounced save has landed and the
 * document is clean — callers navigate only then.
 */
export async function flushCanvasSave({
  clearDebounce,
  awaitHydrate,
  awaitUploads,
  awaitInFlight,
  isDirty,
  persist,
} = {}) {
  clearDebounce?.()
  if (awaitHydrate) await awaitHydrate()
  if (awaitUploads) await awaitUploads()
  if (awaitInFlight) await awaitInFlight()
  if (isDirty?.()) await persist?.()
  return !isDirty?.()
}

/** Fields that must survive close → refresh → reopen. */
export function reopenView({ canvases, docTitle, size } = {}) {
  return {
    title: docTitle || '',
    size: size ? { width: size.width, height: size.height } : null,
    pages: (canvases || []).map((page) => ({
      id: page.id,
      width: page.width,
      height: page.height,
      background: page.background ?? null,
      elements: (page.elements || []).map((element) => ({
        id: element.id,
        type: element.type,
        layer: element.layer ?? null,
        locked: Boolean(element.locked || element.placement?.locked),
        x: element.placement?.x ?? null,
        y: element.placement?.y ?? null,
        width: element.placement?.width ?? null,
        height: element.placement?.height ?? null,
      })),
    })),
  }
}
