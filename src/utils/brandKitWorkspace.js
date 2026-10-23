import brandKitService from '../services/brandKitService.js'
import workspaceService from '../services/workspaceService.js'
import { canWriteBrandKits, dedupeBrandKitList } from './brandKitHelpers.js'
import { resolvePresentationWorkspaceContext } from './presentationContext.js'

function normalizeWorkspace(ws) {
  if (!ws) return null
  const id = ws.id || ws._id
  if (!id) return null
  const typeRaw = String(ws.type || ws.workspaceType || '').toUpperCase()
  const isPersonal =
    Boolean(ws.isPersonal) || typeRaw === 'PRIVATE' || typeRaw === 'PERSONAL'
  const role = workspaceService.normalizeWorkspaceRole(
    ws.myRole ||
      ws.memberRole ||
      ws.role ||
      ws.currentUserRole ||
      (isPersonal ? 'OWNER' : 'MEMBER')
  )
  return {
    ...ws,
    id,
    name: ws.name || ws.title || 'Workspace',
    isPersonal,
    role,
  }
}

/** Workspaces the user can open for Brand Kit management (read all; write OWNER/ADMIN). */
export async function listBrandKitWorkspaces() {
  const raw = (await workspaceService.listWorkspaces()) || []
  const seen = new Set()
  const unique = []
  for (const ws of raw.map(normalizeWorkspace).filter(Boolean)) {
    const id = String(ws.id)
    if (seen.has(id)) continue
    seen.add(id)
    unique.push(ws)
  }
  return unique
}

/**
 * Same default as /dashboard/brandkits historically: personal workspace first.
 */
export async function resolveBrandKitsWorkspaceContext(preferredWorkspaceId = null) {
  return resolvePresentationWorkspaceContext({
    preferredWorkspaceId: preferredWorkspaceId || null,
  })
}

function tagKits(kits, workspace, { inheritDefault = true } = {}) {
  return (kits || []).map((kit) => ({
    ...kit,
    originWorkspaceId: kit.originWorkspaceId || kit.workspaceId || null,
    workspaceId: workspace.id,
    workspaceName: workspace.name || workspace.title || 'Workspace',
    isDefault: inheritDefault ? Boolean(kit.isDefault) : false,
  }))
}

/**
 * Kits usable when creating or editing a presentation.
 * Returns ALL brand kits accessible across all workspaces so any brand kit
 * can be used anywhere in any workspace.
 */
export async function listBrandKitsUsableInWorkspace(workspaceId = null) {
  const workspaces = await listBrandKitWorkspaces()
  const seen = new Set()
  const merged = []

  const targetWs = workspaceId
    ? workspaces.find((ws) => String(ws.id) === String(workspaceId))
    : null

  const orderedWorkspaces = targetWs
    ? [targetWs, ...workspaces.filter((ws) => String(ws.id) !== String(workspaceId))]
    : workspaces

  for (const ws of orderedWorkspaces) {
    if (!ws?.id) continue
    try {
      const kits = await brandKitService.list(ws.id, { includePersonal: false })
      for (const kit of tagKits(kits, ws)) {
        const id = String(kit?.id || '')
        if (!id || seen.has(id)) continue
        seen.add(id)
        merged.push(kit)
      }
    } catch {
      // skip workspaces user cannot read
    }
  }

  const unique = dedupeBrandKitList(merged, { byName: true })

  unique.sort((a, b) => {
    if (Boolean(b.isDefault) !== Boolean(a.isDefault)) return b.isDefault ? 1 : -1
    return String(a.name || '').localeCompare(String(b.name || ''))
  })

  return unique
}

/** @deprecated Prefer listBrandKitsUsableInWorkspace() */
export async function listAllAccessibleBrandKits() {
  return listBrandKitsUsableInWorkspace()
}

/**
 * Ensure `brandKitId` exists across workspaces.
 * Searches all accessible workspaces for the brand kit.
 */
export async function ensureBrandKitInWorkspace(
  targetWorkspaceId,
  brandKitId,
  sourceWorkspaceId = null
) {
  if (!brandKitId) return null

  const tryGet = async (wsId) => {
    if (!wsId) return null
    try {
      return await brandKitService.get(wsId, brandKitId)
    } catch {
      return null
    }
  }

  if (targetWorkspaceId) {
    const inTarget = await tryGet(targetWorkspaceId)
    if (inTarget?.id) return String(inTarget.id)
  }

  if (sourceWorkspaceId) {
    const inSource = await tryGet(sourceWorkspaceId)
    if (inSource?.id) return String(inSource.id)
  }

  const workspaces = await listBrandKitWorkspaces()
  for (const ws of workspaces) {
    const found = await tryGet(ws.id)
    if (found?.id) return String(found.id)
  }

  return String(brandKitId)
}
