import brandKitService from '../services/brandKitService.js'
import workspaceService from '../services/workspaceService.js'
import { canWriteBrandKits } from './brandKitHelpers.js'
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
  return raw.map(normalizeWorkspace).filter(Boolean)
}

/**
 * Same default as /dashboard/brandkits historically: personal workspace first.
 */
export async function resolveBrandKitsWorkspaceContext(preferredWorkspaceId = null) {
  return resolvePresentationWorkspaceContext({
    preferredWorkspaceId: preferredWorkspaceId || null,
  })
}

function tagKits(kits, workspace) {
  return (kits || []).map((kit) => ({
    ...kit,
    workspaceId: workspace.id,
    workspaceName: workspace.name || workspace.title || 'Workspace',
  }))
}

/**
 * Kits usable when creating a presentation in `workspaceId`.
 * Always includes kits in that workspace. For OWNER/ADMIN also includes
 * kits from their personal workspace so Brand Kits page kits appear in
 * team PPT flows (copied into the target workspace on generate if needed).
 */
export async function listBrandKitsUsableInWorkspace(workspaceId) {
  if (!workspaceId) return []

  const workspaces = await listBrandKitWorkspaces()
  const target =
    workspaces.find((ws) => String(ws.id) === String(workspaceId)) ||
    normalizeWorkspace({ id: workspaceId, name: 'Workspace' })

  const seen = new Set()
  const merged = []

  const addFrom = async (ws) => {
    if (!ws?.id) return
    try {
      const kits = await brandKitService.list(ws.id)
      for (const kit of tagKits(kits, ws)) {
        const id = String(kit?.id || '')
        if (!id || seen.has(id)) continue
        seen.add(id)
        merged.push(kit)
      }
    } catch {
      // skip workspaces the user cannot read
    }
  }

  await addFrom(target)

  if (canWriteBrandKits(target.role)) {
    const personal = workspaces.find((ws) => ws.isPersonal)
    if (personal && String(personal.id) !== String(target.id)) {
      await addFrom(personal)
    }
  }

  merged.sort((a, b) => {
    if (Boolean(b.isDefault) !== Boolean(a.isDefault)) return b.isDefault ? 1 : -1
    return String(a.name || '').localeCompare(String(b.name || ''))
  })

  return merged
}

/** @deprecated Prefer listBrandKitsUsableInWorkspace(presentationWorkspaceId) */
export async function listAllAccessibleBrandKits() {
  const ctx = await resolveBrandKitsWorkspaceContext()
  return listBrandKitsUsableInWorkspace(ctx.workspaceId)
}

/**
 * Ensure `brandKitId` exists in `targetWorkspaceId`.
 * If the kit lives in another workspace, clone name+data into the target
 * (OWNER/ADMIN write). Media is not copied — colors/fonts/voice are.
 */
export async function ensureBrandKitInWorkspace(
  targetWorkspaceId,
  brandKitId,
  sourceWorkspaceId = null
) {
  if (!targetWorkspaceId || !brandKitId) return null

  const tryGet = async (wsId) => {
    try {
      return await brandKitService.get(wsId, brandKitId)
    } catch {
      return null
    }
  }

  // Already in target workspace
  const inTarget = await tryGet(targetWorkspaceId)
  if (inTarget?.id) return String(inTarget.id)

  const sourceId = sourceWorkspaceId || null
  let detail = sourceId ? await tryGet(sourceId) : null

  if (!detail) {
    const workspaces = await listBrandKitWorkspaces()
    for (const ws of workspaces) {
      if (String(ws.id) === String(targetWorkspaceId)) continue
      detail = await tryGet(ws.id)
      if (detail?.id) break
    }
  }

  if (!detail?.id) {
    throw new Error('Brand kit not found')
  }

  const created = await brandKitService.create(targetWorkspaceId, {
    name: detail.name || 'Brand Kit',
    isDefault: false,
    data: detail.data,
  })

  const newId = created?.id
  if (!newId) {
    throw new Error('Could not copy brand kit into this workspace')
  }
  return String(newId)
}
