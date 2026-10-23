const STORAGE_KEY = 'athena.canvas.editorSession'
const CANVAS_EDITOR_PATH = '/dashboard/canvas-editor'

/**
 * Persist / restore the design-canvas editor session across refresh.
 * URL: /dashboard/canvas-editor?workspaceId=&canvasId=
 */
function readCanvasEditorQuery() {
  try {
    const params = new URLSearchParams(window.location.search || '')
    const workspaceId = params.get('workspaceId')
    const canvasId = params.get('canvasId')
    if (!workspaceId || !canvasId) return null
    return { workspaceId, canvasId, folderId: params.get('folderId') || null }
  } catch {
    return null
  }
}

export function loadCanvasEditorSession() {
  if (typeof window === 'undefined') return null
  let stored = null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    stored = raw ? JSON.parse(raw) : null
  } catch {
    stored = null
  }

  const fromUrl = readCanvasEditorQuery()
  if (fromUrl) {
    // Keep folder/workspace names from storage when it's the same canvas.
    return stored?.canvasId === fromUrl.canvasId ? { ...stored, ...fromUrl } : fromUrl
  }
  return stored?.workspaceId && stored?.canvasId ? stored : null
}

export function saveCanvasEditorSession(ctx) {
  if (typeof window === 'undefined' || !ctx?.workspaceId || !ctx?.canvasId) return
  const payload = {
    workspaceId: ctx.workspaceId,
    canvasId: ctx.canvasId,
    folderId: ctx.folderId || null,
    workspaceName: ctx.workspaceName || '',
    folderName: ctx.folderName || '',
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota
  }

  const params = new URLSearchParams()
  params.set('workspaceId', payload.workspaceId)
  params.set('canvasId', payload.canvasId)
  if (payload.folderId) params.set('folderId', payload.folderId)
  window.history.replaceState(
    { ...(window.history.state || {}), section: 'canvas-editor' },
    '',
    `${CANVAS_EDITOR_PATH}?${params.toString()}`
  )
}

export function clearCanvasEditorSession() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
