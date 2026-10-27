import { resolveLibraryKind } from './workspaceLibrary.js'

/**
 * Which editor a library row opens.
 * A CANVAS project type always opens the canvas editor, even when the row
 * was labeled as a video. A canvas kind never opens in the presentation editor.
 */
export function editorSurfaceForLibraryItem(item) {
  const kind = resolveLibraryKind(item)
  if (kind === 'canvas') return 'canvas'
  if (kind === 'presentation') return 'presentation'
  if (kind === 'image') return 'image'
  return 'video'
}

/**
 * Which create flow a dashboard option starts.
 * `image-editor` is the canvas builder, not the PPT editor.
 */
export function createSurfaceForOption(optionId) {
  if (optionId === 'image-editor') return 'canvas'
  if (optionId === 'ppt-ai' || optionId === 'ppt-builder') return 'presentation'
  if (optionId === 'image-ai') return 'image'
  if (optionId === 'avatar-video') return 'video'
  return null
}
