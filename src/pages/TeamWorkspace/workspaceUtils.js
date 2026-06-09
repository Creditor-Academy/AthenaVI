import { formatFolderSize, getProjectBytes } from '../../utils/formatSize.js';
import {
  buildWorkspaceUserLookup,
  getAuthDisplayName,
  pickUserRef,
  resolveUserDisplayName
} from '../../utils/workspaceUsers.js';
import workspaceService from '../../services/workspaceService.js';

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

export function normalizeId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    return String(value.id || value._id || value.userId || value.user_id || value.sub || '');
  }
  return String(value);
}

export function extractUserId(userObj) {
  if (!userObj) return '';
  return normalizeId(
    userObj.id || userObj._id || userObj.userId || userObj.user_id || userObj.sub || ''
  );
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

export function readRole(workspace) {
  const role =
    workspace.role ||
    workspace.userRole ||
    workspace.membershipRole ||
    workspace.myRole ||
    workspace.memberRole ||
    workspace.currentUserRole ||
    workspace.membership?.role ||
    workspace.access?.role ||
    workspace.permission ||
    'MEMBER';
  return String(role).toUpperCase();
}

// ---------------------------------------------------------------------------
// Workspace normalization
// ---------------------------------------------------------------------------

export function normalizeWorkspace(rawWorkspace, currentUserId, authUser) {
  const id = rawWorkspace.id || rawWorkspace._id;
  const typeRaw = String(rawWorkspace.type || '').toUpperCase();
  const isPersonal = Boolean(rawWorkspace.isPersonal) || typeRaw === 'PRIVATE' || typeRaw === 'PERSONAL';

  const ownerId = normalizeId(
    rawWorkspace.ownerId ||
    rawWorkspace.ownerUserId ||
    rawWorkspace.owner_id ||
    rawWorkspace.owner?.id ||
    rawWorkspace.owner?._id ||
    rawWorkspace.owner
  );

  const creatorId = normalizeId(
    rawWorkspace.createdBy ||
    rawWorkspace.createdById ||
    rawWorkspace.creatorId ||
    rawWorkspace.creator?.id ||
    rawWorkspace.creator?._id
  );

  const role = readRole(rawWorkspace);

  const ownerInMembers = Array.isArray(rawWorkspace.members)
    ? rawWorkspace.members.some((member) => {
      const memberId = normalizeId(
        member.userId || member.user?.id || member.user?._id || member.user || member.id || member._id
      );
      return memberId === currentUserId && String(member.role || '').toUpperCase() === 'OWNER';
    })
    : false;

  const isOwner =
    isPersonal ||
    role === 'OWNER' ||
    (Boolean(currentUserId) && ownerId === currentUserId) ||
    ownerInMembers ||
    (Boolean(currentUserId) && creatorId === currentUserId);

  const effectiveRole = isPersonal ? 'OWNER' : (isOwner ? 'OWNER' : role || 'MEMBER');

  const ownerName = isPersonal || (Boolean(currentUserId) && ownerId === currentUserId)
    ? (getAuthDisplayName(authUser) || 'You')
    : (rawWorkspace.owner?.name || rawWorkspace.owner?.username || rawWorkspace.owner?.email || rawWorkspace.ownerName || 'Unknown');

  return {
    ...rawWorkspace,
    id,
    name: (() => {
      if (isPersonal) {
        if (rawWorkspace.name && rawWorkspace.name !== 'Personal' && rawWorkspace.name !== 'Personal Workspace') {
          return rawWorkspace.name;
        }
        const fullName = authUser?.name || rawWorkspace.owner?.name || '';
        let firstName = fullName.trim().split(/\s+/)[0];
        if (!firstName && (authUser?.email || rawWorkspace.owner?.email)) {
          const email = authUser?.email || rawWorkspace.owner?.email;
          firstName = email.split('@')[0].split(/[._-]/)[0];
        }
        if (firstName) {
          firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
          return `${firstName}'s Personal`;
        }
        return "Your Personal";
      }
      return rawWorkspace.name || rawWorkspace.title || 'Untitled Workspace';
    })(),
    type: isPersonal ? 'personal' : 'workspace',
    userRole: effectiveRole,
    ownerId: ownerId || (isOwner ? currentUserId : ''),
    ownerName,
    members: Array.isArray(rawWorkspace.members) ? rawWorkspace.members : [],
    folders: []
  };
}

export async function enrichWorkspaceMembers(workspace) {
  if (!workspace || workspace.type === 'personal') return workspace;

  const membersHaveNames = (workspace.members || []).some(
    (member) => member.user?.name || member.user?.email || member.name || member.email
  );
  if (membersHaveNames) return workspace;

  try {
    const members = await workspaceService.listWorkspaceMembers(workspace.id);
    return { ...workspace, members: members || workspace.members };
  } catch {
    return workspace;
  }
}

// ---------------------------------------------------------------------------
// Video / Folder normalization
// ---------------------------------------------------------------------------

export function normalizeVideo(video, currentUserId, authUser, userLookup) {
  const lookup = userLookup || new Map();
  const createdBy = resolveUserDisplayName(
    pickUserRef(video, 'creator'),
    lookup,
    currentUserId,
    authUser
  );
  const lastModifiedBy = resolveUserDisplayName(
    pickUserRef(video, 'updater'),
    lookup,
    currentUserId,
    authUser
  );

  const createdAt =
    video.createdAt || video.created_at || video.dateCreated || video.created || null;
  const updatedAt =
    video.updatedAt || video.lastModifiedAt || video.modifiedAt || video.updated_at || createdAt || null;
  const sizeBytes = getProjectBytes(video);

  return {
    ...video,
    id: video.id || video._id,
    name: video.name || video.title || 'Untitled Video',
    createdBy,
    createdAt,
    lastModifiedBy,
    lastModifiedAt: updatedAt,
    lastEditedBy: lastModifiedBy,
    lastEditedAt: updatedAt,
    sizeBytes: sizeBytes ?? video.sizeBytes ?? null
  };
}

export function normalizeFolder(folder, currentUserId, authUser, userLookup) {
  const lookup = userLookup || new Map();
  const createdBy = resolveUserDisplayName(
    pickUserRef(folder, 'creator'),
    lookup,
    currentUserId,
    authUser
  );
  const lastModifiedBy = resolveUserDisplayName(
    pickUserRef(folder, 'updater'),
    lookup,
    currentUserId,
    authUser
  );

  const createdAt =
    folder.createdAt || folder.created_at || folder.dateCreated || folder.created || null;
  const updatedAt =
    folder.updatedAt || folder.lastModifiedAt || folder.modifiedAt || folder.updated_at || createdAt || null;

  const videos = Array.isArray(folder.videos)
    ? folder.videos.map((video) => normalizeVideo(video, currentUserId, authUser, lookup))
    : [];

  return {
    ...folder,
    id: folder.id || folder._id,
    name: folder.name || folder.title || 'Untitled Folder',
    createdBy,
    createdAt,
    lastModifiedBy,
    lastModifiedAt: updatedAt,
    videos,
    displaySize: formatFolderSize({ ...folder, videos })
  };
}

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------

export function workspaceCanEdit(workspace) {
  const role = String(workspace?.userRole || '').toUpperCase();
  return workspace?.type === 'personal' || role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER';
}

export function workspaceCanManageContributors(workspace) {
  const role = String(workspace?.userRole || '').toUpperCase();
  return workspace?.type === 'workspace' && (role === 'OWNER' || role === 'ADMIN');
}
