import { extractUserId, readRole } from '../pages/TeamWorkspace/workspaceUtils.js';
import { isTeamWorkspaceType } from './creditTransactions.js';

export function canManageAsset(asset, workspace, currentUserId) {
  if (!asset || !workspace) return false;

  const userId = String(currentUserId || '');
  const type = String(workspace.type || workspace.workspaceType || '').toUpperCase();
  const isPersonal =
    workspace.isPersonal ||
    type === 'PRIVATE' ||
    type === 'PERSONAL' ||
    workspace.type === 'personal';

  if (isPersonal || !isTeamWorkspaceType(type)) {
    const role = readRole(workspace);
    const ownerId = String(workspace.ownerId || workspace.owner?.id || '');
    return role === 'OWNER' || (ownerId && ownerId === userId);
  }

  const role = readRole(workspace);
  if (role === 'OWNER' || role === 'ADMIN') return true;

  const uploaderId = String(asset.uploadedBy || asset.uploader?.id || asset.raw?.uploadedBy || '');
  return uploaderId && uploaderId === userId;
}

export function shouldShowUploader(workspace) {
  const type = String(workspace?.type || workspace?.workspaceType || '').toUpperCase();
  return isTeamWorkspaceType(type) || workspace?.type === 'workspace';
}
