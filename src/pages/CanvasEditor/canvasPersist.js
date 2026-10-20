/**
 * Persistence rules for the canvas editor that don't need React.
 *
 * A new design is stored on a Project row, and that row requires a folder.
 * Create is blocked until the user picks one — there is no silent default folder.
 * Reopening an existing design only needs the workspace and the canvas id.
 */

export const FOLDER_REQUIRED_MESSAGE =
  'Choose a workspace folder before creating a design, so there is somewhere to save it.'

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
