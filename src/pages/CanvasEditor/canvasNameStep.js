import {
  findDuplicateProjectName,
  generateUniqueProjectName,
} from '../../utils/projectNameValidation.js'

export const DEFAULT_DESIGN_NAME = 'Untitled Design'
export const MAX_DESIGN_NAME_LENGTH = 255 // matches the backend canvas name limit

/** "Untitled Design", or "Untitled Design (n)" when that name is already taken in the folder. */
export function defaultDesignName(projects = []) {
  return generateUniqueProjectName(DEFAULT_DESIGN_NAME, projects)
}

/**
 * Validation state for the name step.
 * While the folder's projects are still loading (or failed to load) duplicates can't be judged
 * client-side, so Continue stays disabled while loading and relies on the server check on failure.
 */
export function evaluateDesignName({
  name,
  projects = [],
  loading = false,
  loadFailed = false,
  serverSaysDuplicate = false,
}) {
  const trimmed = String(name ?? '').trim()
  const tooLong = trimmed.length > MAX_DESIGN_NAME_LENGTH
  const knownDuplicate =
    !loading && !loadFailed && Boolean(trimmed) && Boolean(findDuplicateProjectName(trimmed, projects))
  const duplicate = knownDuplicate || serverSaysDuplicate
  return {
    trimmed,
    empty: !trimmed,
    tooLong,
    duplicate,
    canContinue: Boolean(trimmed) && !tooLong && !duplicate && !loading,
  }
}
