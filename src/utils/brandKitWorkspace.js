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

  const addFrom = async (ws, options) => {
    if (!ws?.id) return
    try {
      const kits = await brandKitService.list(ws.id, { includePersonal: false })
      for (const kit of tagKits(kits, ws, options)) {
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
      await addFrom(personal, { inheritDefault: false })
    }
  }

  // Target workspace is added first, so same-name personal clones drop.
  const unique = dedupeBrandKitList(merged, { byName: true })

  unique.sort((a, b) => {
    if (Boolean(b.isDefault) !== Boolean(a.isDefault)) return b.isDefault ? 1 : -1
    return String(a.name || '').localeCompare(String(b.name || ''))
  })

  return unique
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

  // Reuse a same-name kit already in the target instead of cloning again.
  try {
    const existing = await brandKitService.list(targetWorkspaceId)
    const nameKey = String(detail.name || '').trim().toLowerCase()
    const match = nameKey
      ? (existing || []).find(
          (kit) => String(kit.name || '').trim().toLowerCase() === nameKey
        )
      : null
    if (match?.id) return String(match.id)
  } catch {
    // fall through to create
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
