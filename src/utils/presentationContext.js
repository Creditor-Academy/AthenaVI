import workspaceService from '../services/workspaceService.js'

function resolveWorkspaceRole(ws) {
  const raw =
    ws?.myRole ||
    ws?.memberRole ||
    ws?.role ||
    ws?.currentUserRole ||
    (ws?.isPersonal || String(ws?.type || '').toUpperCase() === 'PRIVATE'
      ? 'OWNER'
      : 'MEMBER')
  return workspaceService.normalizeWorkspaceRole(raw)
}

function normalizeWorkspace(ws) {
  if (!ws) return null
  const id = ws.id || ws._id
  const typeRaw = String(ws.type || ws.workspaceType || '').toUpperCase()
  const isPersonal =
    Boolean(ws.isPersonal) || typeRaw === 'PRIVATE' || typeRaw === 'PERSONAL'
  return { ...ws, id, isPersonal, typeRaw, role: resolveWorkspaceRole(ws) }
}

/**
 * Resolve a workspace + folder for presentation create flows.
 * Prefers personal workspace and first folder; creates "Presentations" folder if none.
 */
export async function resolvePresentationWorkspaceContext({
  preferredWorkspaceId = null,
  preferredFolderId = null,
} = {}) {
  const workspaces = (await workspaceService.listWorkspaces()) || []
  const normalized = workspaces.map(normalizeWorkspace).filter((ws) => ws?.id)

  if (!normalized.length) {
    throw new Error('No workspace found. Create a workspace before starting a presentation.')
  }

  const workspace =
    normalized.find((ws) => String(ws.id) === String(preferredWorkspaceId)) ||
    normalized.find((ws) => ws.isPersonal) ||
    normalized[0]

  const workspaceId = workspace.id
  let folders = (await workspaceService.listFolders(workspaceId)) || []
  folders = folders.map((f) => ({ ...f, id: f.id || f._id }))

  if (!folders.length) {
    const created = await workspaceService.createFolder(workspaceId, 'Presentations')
    folders = [{ ...created, id: created.id || created._id }]
  }

  const folder =
    folders.find((f) => String(f.id) === String(preferredFolderId)) || folders[0]

  return {
    workspaceId,
    folderId: folder.id,
    workspace,
    folder,
    workspaces: normalized,
    folders,
  }
}
