export function normalizeProjectName(name) {
  return String(name || '').trim().toLowerCase();
}

export function getProjectDisplayName(project) {
  return String(
    project?.name || project?.title || project?.label || project?.projectTitle || ''
  ).trim();
}

export function resolveProjectFolderId(project) {
  if (!project) return '';
  const folder = project.folder;
  if (typeof folder === 'string' || typeof folder === 'number') {
    return String(folder);
  }
  return String(project.folderId || folder?.id || folder?._id || '');
}

export function filterProjectsInFolder(projects = [], folderId) {
  if (!folderId) return [];
  const targetFolderId = String(folderId);
  return (projects || []).filter(
    (project) => resolveProjectFolderId(project) === targetFolderId
  );
}

export function findDuplicateProjectName(
  name,
  projects = [],
  { excludeProjectId = null, folderId = null } = {}
) {
  const normalized = normalizeProjectName(name);
  if (!normalized) return null;

  const hasFolderMetadata = (projects || []).some(
    (project) => resolveProjectFolderId(project) !== ''
  );
  const scopedProjects =
    folderId != null && folderId !== '' && hasFolderMetadata
      ? filterProjectsInFolder(projects, folderId)
      : projects || [];

  return (
    scopedProjects.find((project) => {
      if (excludeProjectId && String(project.id || project._id) === String(excludeProjectId)) {
        return false;
      }
      return normalizeProjectName(getProjectDisplayName(project)) === normalized;
    }) || null
  );
}

export const DUPLICATE_PROJECT_NAME_MESSAGE =
  'A project with this name already exists in this folder';

/** True when any project in the list has the same normalized name (list should already be folder-scoped). */
export function projectNameExistsInList(name, projects = [], excludeProjectId = null) {
  return Boolean(findDuplicateProjectName(name, projects, { excludeProjectId }));
}

/**
 * Generates a unique project name by appending (1), (2), etc. if the name already exists
 * in the target list of projects or project names within the folder (Canva-style deduplication).
 *
 * Examples:
 * - "Untitled Design", existing: ["Untitled Design"] -> "Untitled Design (1)"
 * - "Untitled Design", existing: ["Untitled Design", "Untitled Design (1)"] -> "Untitled Design (2)"
 * - "Report (1)", existing: ["Report (1)"] -> "Report (2)"
 */
export function generateUniqueProjectName(
  baseName,
  projectsOrNames = [],
  { excludeProjectId = null, folderId = null } = {}
) {
  const rawBase = String(baseName || '').trim() || 'Untitled Project';

  const suffixMatch = rawBase.match(/^(.*?)\s*\((\d+)\)$/);
  const rootName = suffixMatch ? suffixMatch[1].trim() : rawBase;

  const hasFolderMetadata = (projectsOrNames || []).some(
    (item) => item && typeof item === 'object' && resolveProjectFolderId(item) !== ''
  );
  const scopedItems =
    folderId != null && folderId !== '' && hasFolderMetadata
      ? filterProjectsInFolder(projectsOrNames, folderId)
      : projectsOrNames || [];

  const existingNormalized = new Set();
  for (const item of scopedItems) {
    if (typeof item === 'string') {
      const norm = normalizeProjectName(item);
      if (norm) existingNormalized.add(norm);
    } else if (item && typeof item === 'object') {
      if (excludeProjectId && String(item.id || item._id) === String(excludeProjectId)) {
        continue;
      }
      const norm = normalizeProjectName(getProjectDisplayName(item));
      if (norm) existingNormalized.add(norm);
    }
  }

  // Check if rawBase is already unique
  if (!existingNormalized.has(normalizeProjectName(rawBase))) {
    return rawBase;
  }

  // Find next available number: (1), (2), (3)...
  let index = 1;
  while (existingNormalized.has(normalizeProjectName(`${rootName} (${index})`))) {
    index += 1;
  }

  return `${rootName} (${index})`;
}

