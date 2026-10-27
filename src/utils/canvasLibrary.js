import { projectTypeForKind, resolveLibraryKind } from './workspaceLibrary.js'

/** Name of a duplicated design: “Poster” → “Poster (copy)”. */
export function canvasCopyName(name) {
  const base = String(name || '').trim() || 'Untitled Design'
  return `${base} (copy)`
}

/**
 * Body for createCanvas from an existing design.
 * Copies the document and the cover. The folder is required.
 */
export function canvasDuplicateRequest(project) {
  const data = project?.data && typeof project.data === 'object' ? project.data : null
  const folderId = project?.folderId || project?.folder?.id || project?.folder?._id || null
  return {
    name: canvasCopyName(project?.name || data?.docTitle),
    folderId: folderId || null,
    data,
    thumbnail: project?.thumbnail || undefined,
  }
}

/**
 * A library row shaped so the editor router can see CANVAS / PRESENTATION.
 * Search and notifications sometimes omit `type`; kind still has to win.
 */
export function libraryEditorTarget(item) {
  if (!item || typeof item !== 'object') return item
  const kind = resolveLibraryKind(item)
  const type = item.type || item.projectType || projectTypeForKind(kind) || undefined
  return {
    ...item,
    id: item.id || item._id || item.videoId,
    type,
    projectType: item.projectType || type,
    kind,
    category: item.category || kind,
  }
}
