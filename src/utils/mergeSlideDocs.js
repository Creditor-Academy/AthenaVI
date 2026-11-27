/**
 * Three-way merge of a slide's elements doc (CANVAS_FIX_PLAN_25NOV2026, D-1 / D-3).
 *
 *   base   – the server's copy this tab last had (what local edits started from)
 *   local  – this tab's current copy (may hold edits not saved yet)
 *   server – the server's newer copy (another tab, person or a server action changed it)
 *
 * Rules, per element id and per doc-level key (background, transition…):
 * - changed here only → keep ours; changed there only → keep theirs; changed on both → ours wins;
 * - added on either side → kept;
 * - deleted on one side → deleted, unless the other side changed it (then kept: never lose an edit).
 * Without a base, nothing is known to be deleted, so the result is the union with ours winning.
 */

function same(a, b) {
  if (a === b) return true
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

function byId(list) {
  const map = new Map()
  for (const el of Array.isArray(list) ? list : []) {
    if (el && el.id != null) map.set(el.id, el)
  }
  return map
}

function mergeElements(baseList, localList, serverList, hasBase) {
  const base = byId(baseList)
  const local = byId(localList)
  const server = byId(serverList)
  const out = []
  const seen = new Set()

  const decide = (id) => {
    const b = base.get(id)
    const l = local.get(id)
    const s = server.get(id)
    if (l && s) {
      if (!hasBase || !b) return l
      return same(l, b) ? s : l
    }
    if (l && !s) {
      // Only here: added here, or deleted there. Deleted there and untouched here → drop.
      if (hasBase && b && same(l, b)) return null
      return l
    }
    if (!l && s) {
      // Only there: added there, or deleted here. Deleted here and untouched there → drop.
      if (hasBase && b && same(s, b)) return null
      return s
    }
    return null
  }

  // Server order first (it already holds the other side's additions), then local-only ones.
  for (const list of [serverList, localList]) {
    for (const el of Array.isArray(list) ? list : []) {
      if (!el || el.id == null || seen.has(el.id)) continue
      seen.add(el.id)
      const kept = decide(el.id)
      if (kept) out.push(kept)
    }
  }
  return out
}

const NOT_MERGED_KEYS = new Set(['elements', 'revision'])

/**
 * @returns the merged doc. `revision` is taken from `server` (the copy the next save builds on).
 */
export function mergeSlideDocs(base, local, server) {
  if (!server) return local
  if (!local) return server
  const hasBase = Boolean(base && Array.isArray(base.elements))
  const merged = {}
  const keys = new Set([...Object.keys(server), ...Object.keys(local), ...(hasBase ? Object.keys(base) : [])])
  for (const key of keys) {
    if (NOT_MERGED_KEYS.has(key)) continue
    const l = local[key]
    const s = server[key]
    const b = hasBase ? base[key] : undefined
    let value
    if (!hasBase) value = l !== undefined ? l : s
    else if (same(l, b)) value = s
    else value = l
    if (value !== undefined) merged[key] = value
  }
  merged.elements = mergeElements(base?.elements, local.elements, server.elements, hasBase)
  if (server.revision !== undefined) merged.revision = server.revision
  return merged
}
