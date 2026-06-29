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
