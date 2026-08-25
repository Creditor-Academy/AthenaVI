const STORAGE_PREFIX = 'athena.ppt.recentArtStyles'
export const PPT_RECENT_ART_STYLE_LIMIT = 4

function storageKey(userKey) {
  return `${STORAGE_PREFIX}:${userKey || 'local'}`
}

export function normalizeArtStyleId(value) {
  return String(value || '').trim()
}

export function mergeRecentArtStyles(...lists) {
  const seen = new Set()
  const out = []
  lists.flat().forEach((value) => {
    const id = normalizeArtStyleId(value)
    if (!id || seen.has(id)) return
    seen.add(id)
    out.push(id)
  })
  return out.slice(0, PPT_RECENT_ART_STYLE_LIMIT)
}

export function readRecentArtStyles(userKey) {
  try {
    const raw = localStorage.getItem(storageKey(userKey))
    const parsed = raw ? JSON.parse(raw) : []
    return mergeRecentArtStyles(Array.isArray(parsed) ? parsed : [])
  } catch {
    return []
  }
}

export function writeRecentArtStyles(userKey, ids) {
  const next = mergeRecentArtStyles(ids)
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
  return next
}

export function rememberArtStyle(userKey, styleId) {
  return writeRecentArtStyles(userKey, mergeRecentArtStyles([styleId], readRecentArtStyles(userKey)))
}

export function extractImageStyleId(item, knownIds) {
  if (!item || typeof item !== 'object') return ''
  const candidates = [
    item.generationFlow?.selections?.imageStyle,
    item.generationFlow?.imageStyle,
    item.selections?.imageStyle,
    item.imageStyle,
    item.mediaStyle,
    item.config?.mediaStyle,
    item.config?.imageStyle,
    item.outline?.imageStyle,
    item.metadata?.imageStyle,
    item.wizard?.imageStyle,
  ]
  for (const candidate of candidates) {
    const id = normalizeArtStyleId(candidate)
    if (id && (!knownIds || knownIds.has(id))) return id
  }
  return ''
}

function presentationRows(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.presentations)) return payload.presentations
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.presentations)) return payload.data.presentations
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

export function recentIdsFromPresentations(payload, knownIds) {
  const rows = [...presentationRows(payload)].sort((a, b) => {
    const aTime = new Date(a?.updatedAt || a?.lastModifiedAt || a?.createdAt || 0).getTime()
    const bTime = new Date(b?.updatedAt || b?.lastModifiedAt || b?.createdAt || 0).getTime()
    return bTime - aTime
  })

  const ids = []
  for (const row of rows) {
    const id = extractImageStyleId(row, knownIds)
    if (!id || ids.includes(id)) continue
    ids.push(id)
    if (ids.length >= PPT_RECENT_ART_STYLE_LIMIT) break
  }
  return ids
}
