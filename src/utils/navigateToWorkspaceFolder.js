/**
 * Resolve workspace/folder context from editor create config.
 */
export function resolveProjectFolderContext(config) {
  if (!config) return null;

  const workspaceId =
    config.workspaceId ||
    config.videoData?.workspaceId ||
    config.createConfig?.workspaceId;

  const folderId =
    config.folderId ||
    config.videoData?.folderId ||
    config.createConfig?.folderId ||
    (config.videoData?.folder && (config.videoData.folder.id || config.videoData.folder._id));

  if (!workspaceId) return null;

  return {
    workspaceId,
    folderId: folderId || null,
    workspaceName:
      config.workspace ||
      config.createConfig?.workspace ||
      config.videoData?.workspaceName ||
      '',
    folderName:
      config.folder ||
      config.createConfig?.folder ||
      config.videoData?.folderName ||
      config.videoData?.folder?.name ||
      ''
  };
}

/**
 * Persist TeamWorkspace navigation and return the dashboard path to open.
 */
export function persistWorkspaceFolderNavigation(config) {
  const context = resolveProjectFolderContext(config);

  if (!context?.workspaceId) {
    try {
      sessionStorage.removeItem('workspaceCurrentLevel');
    } catch {
      /* ignore */
    }
    return '/dashboard/home';
  }

  const payload = context.folderId
    ? {
        type: 'folder',
        id: context.folderId,
        ws: { id: context.workspaceId, name: context.workspaceName },
        folder: { id: context.folderId, name: context.folderName }
      }
    : {
        type: 'workspace',
        id: context.workspaceId,
        ws: { id: context.workspaceId, name: context.workspaceName },
        folder: null
      };

  try {
    sessionStorage.setItem('workspaceCurrentLevel', JSON.stringify(payload));
  } catch {
    /* ignore */
  }

  return '/dashboard/workspace';
}
