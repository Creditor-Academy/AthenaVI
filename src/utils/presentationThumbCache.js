/**
 * Persistent presentation thumbnail cache (IndexedDB).
 * Survives reloads so My Work cards don't re-fetch full decks every visit.
 */

const DB_NAME = 'athenavi-ppt-thumbs'
const DB_VERSION = 1
const STORE = 'thumbs'
const MAX_ENTRIES = 200

/** @type {Promise<IDBDatabase>|null} */
let dbPromise = null

function cacheKey(workspaceId, presentationId) {
  return `${String(workspaceId || '')}:${String(presentationId || '')}`
}

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'))
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error || new Error('Failed to open thumb cache'))
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' })
        store.createIndex('byAccessedAt', 'accessedAt')
      }
    }
    request.onsuccess = () => resolve(request.result)
  }).catch((err) => {
    dbPromise = null
    throw err
  })
  return dbPromise
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, fn) {
  const db = await openDb()
  const tx = db.transaction(STORE, mode)
  const store = tx.objectStore(STORE)
  const result = await fn(store, tx)
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error || new Error('Thumb cache transaction aborted'))
  })
  return result
}

function stampOf(value) {
  if (value == null || value === '') return 0
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : 0
}

/**
 * @param {string} workspaceId
 * @param {string} presentationId
 * @param {string|number|Date|null} [updatedAt] - invalidate if newer than cached
 * @returns {Promise<{ imageUrl?: string|null, aspectRatio?: string, slide?: object|null, updatedAt?: number }|null>}
 */
export async function getCachedPresentationThumb(workspaceId, presentationId, updatedAt = null) {
  if (!workspaceId || !presentationId) return null
  try {
    const key = cacheKey(workspaceId, presentationId)
    const row = await withStore('readonly', (store) => idbRequest(store.get(key)))
    if (!row) return null
    const incoming = stampOf(updatedAt)
    if (incoming && row.updatedAt && incoming > row.updatedAt) return null

    // Touch access time (best-effort, don't block readers)
    withStore('readwrite', (store) =>
      idbRequest(store.put({ ...row, accessedAt: Date.now() }))
    ).catch(() => {})

    return {
      imageUrl: row.imageUrl || null,
      aspectRatio: row.aspectRatio || '16:9',
      slide: row.slide || null,
      updatedAt: row.updatedAt || 0,
    }
  } catch {
    return null
  }
}

/**
 * Persist a resolved thumbnail. Prefer imageUrl; slide snapshot is optional fallback.
 * @param {object} params
 */
export async function setCachedPresentationThumb({
  workspaceId,
  presentationId,
  imageUrl = null,
  aspectRatio = '16:9',
  slide = null,
  updatedAt = null,
}) {
  if (!workspaceId || !presentationId) return
  if (!imageUrl && !slide) return
  try {
    const key = cacheKey(workspaceId, presentationId)
    const now = Date.now()
    const entry = {
      key,
      workspaceId,
      presentationId,
      imageUrl: imageUrl || null,
      aspectRatio: aspectRatio || '16:9',
      slide: imageUrl ? null : slide,
      updatedAt: stampOf(updatedAt) || now,
      accessedAt: now,
    }
    await withStore('readwrite', (store) =>
      new Promise((resolve, reject) => {
        const putReq = store.put(entry)
        putReq.onerror = () => reject(putReq.error)
        putReq.onsuccess = () => {
          const allReq = store.getAll()
          allReq.onerror = () => reject(allReq.error)
          allReq.onsuccess = () => {
            const all = allReq.result || []
            if (all.length > MAX_ENTRIES) {
              all
                .sort((a, b) => (a.accessedAt || 0) - (b.accessedAt || 0))
                .slice(0, all.length - MAX_ENTRIES)
                .forEach((row) => store.delete(row.key))
            }
            resolve()
          }
        }
      })
    )
  } catch {
    // Cache is best-effort
  }
}

export async function clearCachedPresentationThumb(workspaceId, presentationId) {
  if (!workspaceId || !presentationId) return
  try {
    const key = cacheKey(workspaceId, presentationId)
    await withStore('readwrite', (store) => idbRequest(store.delete(key)))
  } catch {
    // ignore
  }
}

/** In-memory promise map for deduping concurrent loads in one session. */
const memoryLoads = new Map()

export function getMemoryThumbLoad(key) {
  return memoryLoads.get(key) || null
}

export function setMemoryThumbLoad(key, promise) {
  memoryLoads.set(key, promise)
  return promise
}

export function clearMemoryThumbLoad(key) {
  memoryLoads.delete(key)
}

export function presentationThumbMemoryKey(workspaceId, presentationId) {
  return cacheKey(workspaceId, presentationId)
}
