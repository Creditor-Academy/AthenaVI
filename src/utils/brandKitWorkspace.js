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

/** How long the cross-workspace kit lists are shared between callers. */
const KIT_LISTS_TTL_MS = 30_000
let kitListsCache = null

function kitListsCacheKey() {
  return `${brandKitService.cacheEpoch}:${workspaceService.membershipEpoch}`
}

/**
 * Every workspace's kit list, fetched in parallel and shared for a short window — the AI
 * presentation wizard, editor, vibe step and template picker all ask for it on mount, and
 * each call used to fan out to 1 + N requests. Any brand kit write or workspace
 * membership change invalidates it.
 */
function loadKitListsByWorkspace() {
  const key = kitListsCacheKey()
  if (kitListsCache && kitListsCache.key === key && Date.now() - kitListsCache.at < KIT_LISTS_TTL_MS) {
    return kitListsCache.promise
  }
  const promise = (async () => {
    const workspaces = await listBrandKitWorkspaces()
    return Promise.all(
      workspaces.map(async (workspace) => {
        try {
          return { workspace, kits: await brandKitService.list(workspace.id, { includePersonal: false }) }
        } catch {
          return { workspace, kits: [] } // skip workspaces user cannot read
        }
      })
    )
  })()
  const entry = { key, at: Date.now(), promise }
  kitListsCache = entry
  promise.catch(() => {
    if (kitListsCache === entry) kitListsCache = null
  })
  return promise
}

/**
 * Kits usable when creating or editing a presentation.
 * Returns ALL brand kits accessible across all workspaces so any brand kit
 * can be used anywhere in any workspace.
 */
export async function listBrandKitsUsableInWorkspace(workspaceId = null) {
  const lists = await loadKitListsByWorkspace()
  const seen = new Set()
  const merged = []

  const target = workspaceId
    ? lists.find((entry) => String(entry.workspace.id) === String(workspaceId))
    : null
  const ordered = target ? [target, ...lists.filter((entry) => entry !== target)] : lists

  for (const { workspace, kits } of ordered) {
    for (const kit of tagKits(kits, workspace)) {
      const id = String(kit?.id || '')
      if (!id || seen.has(id)) continue
      seen.add(id)
      merged.push(kit)
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

  // No per-workspace GET sweep here: it cost a request per workspace, and the backend
  // clones a kit into any workspace it's fetched from — the id is the best answer left.
  return String(brandKitId)
}
