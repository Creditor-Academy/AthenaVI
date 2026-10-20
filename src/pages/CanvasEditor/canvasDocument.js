/**
 * Pure helpers for the Canvas Editor document ({ canvases, docTitle, size }).
 * No React. App imports use explicit `.js` paths; run the tests through `npm test`, whose
 * resolve hook handles the extensionless imports inside those app modules.
 *
 * Every function returns a new array when it changes something and the same reference
 * when it doesn't: the editor's dirty check and undo history compare by identity.
 */

export {
  HISTORY_LIMIT,
  createHistory,
  currentEntry,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  mapHistory,
} from './canvasHistory.js'

import { PPT_DEFAULT_PLACEMENTS } from '../../constants/pptInsertCatalog.js'
import { normalizeElementPlacement } from '../../utils/presentationHelpers.js'

export const CANVAS_DOC_VERSION = 1
export const DEFAULT_SIZE = { width: 1080, height: 1080 }

/** Mirrors the server caps in AthenaVI_backend canvas.validations.js. */
export const MAX_PAGES = 40
export const MAX_ELEMENTS_PER_PAGE = 200
export const MAX_PAGE_DIMENSION = 7680

/** Max depth walked when rewriting URLs inside element content. */
const MAX_URL_WALK_DEPTH = 8

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createPage(size = DEFAULT_SIZE, { id } = {}) {
  return {
    id: id || makeId('canvas'),
    width: size.width,
    height: size.height,
    background: '#FFFFFF',
    elements: [],
  }
}

/** A new single-page document. History must be seeded from this same array. */
export function createDocument(size = DEFAULT_SIZE) {
  return [createPage(size)]
}

// ── Caps ────────────────────────────────────────────────────────────────────

export function canAddPages(canvases, count = 1) {
  return canvases.length + count <= MAX_PAGES
}

export function canAddElements(page, count = 1) {
  return (page?.elements?.length || 0) + count <= MAX_ELEMENTS_PER_PAGE
}

// ── Pages ───────────────────────────────────────────────────────────────────

/** Append a page after the last one. Returns the same array when the page cap is reached. */
export function addPage(canvases, size) {
  if (!canAddPages(canvases)) return canvases
  return [...canvases, createPage(size)]
}

/** Copy a page (new page and element ids) directly below it. */
export function duplicatePage(canvases, pageId) {
  const index = canvases.findIndex((page) => page.id === pageId)
  if (index < 0 || !canAddPages(canvases)) return { canvases, page: null }
  const source = canvases[index]
  const stamp = Date.now()
  const idMap = new Map(
    source.elements.map((element, i) => [
      element.id,
      `element-${stamp}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    ])
  )
  const page = {
    ...source,
    id: makeId('canvas'),
    elements: source.elements.map((element) => ({
      ...element,
      id: idMap.get(element.id),
      ...(element.groupId ? { groupId: idMap.get(element.groupId) || element.groupId } : {}),
      ...(Array.isArray(element.childIds)
        ? { childIds: element.childIds.map((cid) => idMap.get(cid) || cid) }
        : {}),
    })),
  }
  const next = [...canvases]
  next.splice(index + 1, 0, page)
  return { canvases: next, page }
}

/** Remove a page. The last remaining page can't be deleted. */
export function deletePage(canvases, pageId) {
  if (canvases.length <= 1) return canvases
  const next = canvases.filter((page) => page.id !== pageId)
  return next.length === canvases.length ? canvases : next
}

/**
 * Which page stays selected after a delete.
 * Deleting a page above the selection shifts the index; deleting the selection
 * lands on the page that slides into that slot.
 */
export function activeIndexAfterPageDelete(canvases, activeIndex, removedId) {
  const removedIndex = canvases.findIndex((page) => page.id === removedId)
  if (removedIndex < 0 || canvases.length <= 1) return Math.max(0, activeIndex)
  const nextLength = canvases.length - 1
  if (activeIndex > removedIndex) return activeIndex - 1
  if (activeIndex === removedIndex) return Math.min(removedIndex, nextLength - 1)
  return activeIndex
}

export function movePage(canvases, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= canvases.length ||
    toIndex >= canvases.length
  ) {
    return canvases
  }
  const next = [...canvases]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function resizeDocument(canvases, size) {
  return canvases.map((page) => ({ ...page, width: size.width, height: size.height }))
}

// ── Elements ────────────────────────────────────────────────────────────────

/** Append elements to a page. Returns the same array when the page would exceed its cap. */
export function insertElements(canvases, pageId, elements) {
  const page = canvases.find((item) => item.id === pageId)
  if (!page || !elements.length || !canAddElements(page, elements.length)) return canvases
  return canvases.map((item) =>
    item.id === pageId ? { ...item, elements: [...item.elements, ...elements] } : item
  )
}

/**
 * Build an element from an insert payload: catalogue placement for its type, centred on
 * the page, with the content defaults the stage renderers expect.
 */
export function createElement(payload, page, index, { id } = {}) {
  const type = payload?.type || 'text'
  const raw = normalizeElementPlacement(
    payload?.placement || payload?.defaultPlacement || PPT_DEFAULT_PLACEMENTS[type] || PPT_DEFAULT_PLACEMENTS.text,
    page
  )
  const placement = {
    ...raw,
    x: Math.round((page.width - raw.width) / 2),
    y: Math.round((page.height - raw.height) / 2),
  }
  const content = { ...(payload?.content || {}) }
  if (type === 'text' && !content.color && !content.colorRole) content.color = '#172033'
  if (['image', 'icon', 'graphic'].includes(type)) {
    if (!content.url && content.src) content.url = content.src
    if (content.url && !content.src) content.src = content.url
    if (content.strokeWidth == null) content.strokeWidth = 0
  }
  return {
    id: id || makeId('element'),
    type,
    content,
    placement,
    layer: index + 1,
    ...(payload?.presetId ? { presetId: payload.presetId } : {}),
  }
}

/** Clone elements with an offset for paste / duplicate operations. */
export function cloneElementsWithOffset(sources, layerStart) {
  const stamp = Date.now()
  const idMap = new Map()
  const clones = sources.map((source, index) => {
    const id = `element-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`
    idMap.set(source.id, id)
    return {
      ...source,
      id,
      placement: {
        ...source.placement,
        x: (source.placement?.x || 0) + 24,
        y: (source.placement?.y || 0) + 24,
      },
      layer: layerStart + 1 + index,
    }
  })
  return clones.map((clone) => {
    const next = { ...clone }
    if (Array.isArray(clone.childIds)) {
      next.childIds = clone.childIds.map((cid) => idMap.get(cid) || cid)
    }
    if (clone.groupId && idMap.has(clone.groupId)) {
      next.groupId = idMap.get(clone.groupId)
    }
    return next
  })
}

/** Page ids and element ids present in a document, for pruning stale selection. */
export function collectIds(canvases) {
  const pageIds = new Set()
  const elementIds = new Set()
  for (const page of canvases) {
    pageIds.add(page.id)
    for (const element of page.elements || []) elementIds.add(element.id)
  }
  return { pageIds, elementIds }
}

// ── Local (unsaved) image URLs ──────────────────────────────────────────────

/** `blob:` URLs only live in the tab that made them; they must never reach the server. */
export function isLocalUrl(value) {
  return typeof value === 'string' && value.trim().toLowerCase().startsWith('blob:')
}

function rewriteStrings(value, rewrite, depth = 0) {
  if (typeof value === 'string') return rewrite(value)
  if (depth >= MAX_URL_WALK_DEPTH || !value || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((item) => {
      const result = rewriteStrings(item, rewrite, depth + 1)
      if (result !== item) changed = true
      return result
    })
    return changed ? next : value
  }
  let changed = false
  const next = {}
  for (const [key, item] of Object.entries(value)) {
    const result = rewriteStrings(item, rewrite, depth + 1)
    if (result !== item) changed = true
    next[key] = result
  }
  return changed ? next : value
}

/**
 * Rewrite every string in the document (element content and page fields such as
 * `backgroundImage`) through `rewrite`. `contentPatch(element)` is merged into the
 * content of elements that changed.
 */
function rewriteDocumentStrings(canvases, rewrite, contentPatch = null) {
  let changed = false
  const next = canvases.map((page) => {
    let pageChanged = false
    const elements = (page.elements || []).map((element) => {
      const content = rewriteStrings(element.content, rewrite)
      if (content === element.content) return element
      pageChanged = true
      return { ...element, content: contentPatch ? { ...content, ...contentPatch } : content }
    })
    const { elements: _elements, ...pageFields } = page
    const rewrittenFields = rewriteStrings(pageFields, rewrite)
    if (!pageChanged && rewrittenFields === pageFields) return page
    changed = true
    return { ...rewrittenFields, elements: pageChanged ? elements : page.elements }
  })
  return changed ? next : canvases
}

/**
 * Swap one URL for another everywhere it appears. Used when a local upload finishes
 * (`toUrl` is the stored asset URL) or fails (`toUrl` is null).
 */
export function replaceUrlInDocument(canvases, fromUrl, toUrl, contentPatch = null) {
  if (!fromUrl) return canvases
  return rewriteDocumentStrings(canvases, (value) => (value === fromUrl ? toUrl : value), contentPatch)
}

/** Null out every `blob:` URL. */
export function stripLocalUrls(canvases) {
  return rewriteDocumentStrings(canvases, (value) => (isLocalUrl(value) ? null : value))
}

export function collectLocalUrls(canvases) {
  const found = new Set()
  rewriteDocumentStrings(canvases, (value) => {
    if (isLocalUrl(value)) found.add(value)
    return value
  })
  return [...found]
}

// ── Save / load ─────────────────────────────────────────────────────────────

/** The payload PATCHed to /canvases/:id/data. Local URLs are stripped, never sent. */
export function serializeForSave({ canvases, docTitle, size }) {
  return {
    version: CANVAS_DOC_VERSION,
    docTitle,
    size,
    canvases: stripLocalUrls(canvases),
  }
}

/** Revision of a server document. Documents saved before revisions existed count as 0. */
export function readRevision(data) {
  const revision = Number(data?.revision)
  return Number.isInteger(revision) && revision >= 0 ? revision : 0
}

/**
 * Turn a GET /canvases/:id response into editor state. Dead `blob:` URLs left by older
 * builds are stripped so the editor shows an empty image instead of a broken one.
 */
export function hydrateFromServer(project, fallbackSize = DEFAULT_SIZE, fallbackTitle = 'Untitled Design') {
  const data = project?.data || {}
  const pages =
    Array.isArray(data.canvases) && data.canvases.length > 0
      ? data.canvases.map((page) => (Array.isArray(page.elements) ? page : { ...page, elements: [] }))
      : createDocument(fallbackSize)
  return {
    canvases: stripLocalUrls(pages),
    docTitle: project?.name || data.docTitle || fallbackTitle,
    size: data.size || fallbackSize,
    revision: readRevision(data),
  }
}

/** Client-side mirror of the server caps, so a save is never sent just to be refused. */
export function validateForSave(doc) {
  const errors = []
  const pages = doc?.canvases || []
  if (!pages.length) errors.push('A design needs at least one page.')
  if (pages.length > MAX_PAGES) errors.push(`A design can have at most ${MAX_PAGES} pages.`)
  pages.forEach((page, index) => {
    if ((page.elements?.length || 0) > MAX_ELEMENTS_PER_PAGE) {
      errors.push(`Page ${index + 1} has more than ${MAX_ELEMENTS_PER_PAGE} elements.`)
    }
    if (
      !(page.width >= 1 && page.width <= MAX_PAGE_DIMENSION) ||
      !(page.height >= 1 && page.height <= MAX_PAGE_DIMENSION)
    ) {
      errors.push(`Page ${index + 1} must be between 1 and ${MAX_PAGE_DIMENSION} px on each side.`)
    }
  })
  if (collectLocalUrls(pages).length) {
    errors.push('Some images are still uploading.')
  }
  return { ok: errors.length === 0, errors }
}
