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
 * Resolve a workspace + folder for presentation / image create flows.
 * Uses preferred IDs when provided (no silent personal fallback).
 * With no preferred workspace, falls back to personal then first workspace.
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

  const preferredId = preferredWorkspaceId ? String(preferredWorkspaceId) : ''
  let workspace = preferredId
    ? normalized.find((ws) => String(ws.id) === preferredId)
    : null

  if (preferredId && !workspace) {
    throw new Error('The selected workspace is no longer available. Pick another location and try again.')
  }

  if (!workspace) {
    workspace = normalized.find((ws) => ws.isPersonal) || normalized[0]
  }

  const workspaceId = workspace.id
  let folders = (await workspaceService.listFolders(workspaceId)) || []
  folders = folders.map((f) => ({ ...f, id: f.id || f._id }))

  if (!folders.length) {
    const created = await workspaceService.createFolder(workspaceId, 'Presentations')
    folders = [{ ...created, id: created.id || created._id }]
  }

  const preferredFolder = preferredFolderId
    ? folders.find((f) => String(f.id) === String(preferredFolderId))
    : null
  const folder = preferredFolder || folders[0]

  return {
    workspaceId,
    folderId: folder.id,
    workspace,
    folder,
    workspaces: normalized,
    folders,
  }
}
