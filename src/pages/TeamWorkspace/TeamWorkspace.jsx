import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  MdMail,
  MdClose,
  MdCheck,
  MdAdd,
  MdFolderOpen,
  MdVideoLibrary,
  MdInfo,
  MdExitToApp,
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdWarning
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceHeader from '../../components/features/workspace/workspace/WorkspaceHeader.jsx';
import WorkspaceSection from '../../components/features/workspace/workspace/WorkspaceSection.jsx';
import { WorkspaceCard, FolderCard, VideoCard } from '../../components/features/workspace/workspace/ViewCards.jsx';
import { WorkspaceRow, FolderRow, VideoRow, formatOnlyDate } from '../../components/features/workspace/workspace/ViewRows.jsx';
import CreateWorkspaceModal from '../../components/features/workspace/workspace/CreateWorkspaceModal.jsx';
import CreateFolderModal from '../../components/features/workspace/workspace/CreateFolderModal.jsx';
import RenameModal from '../../components/features/workspace/workspace/RenameModal.jsx';
import ItemDetailsModal from '../../components/features/workspace/workspace/ItemDetailsModal.jsx';
import MoveProjectModal from '../../components/features/workspace/workspace/MoveProjectModal.jsx';
import TeamWorkspaceSkeleton from '../page-skeleton/TeamWorkspaceSkeleton';
import workspaceService from '../../services/workspaceService.js';
import { formatFolderSize, getProjectBytes } from '../../utils/formatSize.js';
import {
  buildWorkspaceUserLookup,
  getAuthDisplayName,
  pickUserRef,
  resolveUserDisplayName
} from '../../utils/workspaceUsers.js';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';

function normalizeId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    return String(value.id || value._id || value.userId || value.user_id || value.sub || '');
  }
  return String(value);
}

function extractUserId(userObj) {
  if (!userObj) return '';
  return normalizeId(
    userObj.id || userObj._id || userObj.userId || userObj.user_id || userObj.sub || ''
  );
}

function readRole(workspace) {
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

function normalizeWorkspace(rawWorkspace, currentUserId, authUser) {
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
    name: rawWorkspace.name || rawWorkspace.title || 'Untitled Workspace',
    type: isPersonal ? 'personal' : 'workspace',
    userRole: effectiveRole,
    ownerId: ownerId || (isOwner ? currentUserId : ''),
    ownerName,
    members: Array.isArray(rawWorkspace.members) ? rawWorkspace.members : [],
    folders: []
  };
}

async function enrichWorkspaceMembers(workspace) {
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

function normalizeVideo(video, currentUserId, authUser, userLookup) {
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

function normalizeFolder(folder, currentUserId, authUser, userLookup) {
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


function workspaceCanEdit(workspace) {
  const role = String(workspace?.userRole || '').toUpperCase();
  return workspace?.type === 'personal' || role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER';
}

function workspaceCanManageContributors(workspace) {
  const role = String(workspace?.userRole || '').toUpperCase();
  return workspace?.type === 'workspace' && (role === 'OWNER' || role === 'ADMIN');
}

const TeamWorkspace = ({ onCreate, onEdit }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const currentUserId = extractUserId(authUser);

  const [workspaces, setWorkspaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      const saved = sessionStorage.getItem('workspaceCurrentLevel');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          type: parsed.type || 'root',
          id: parsed.id || null,
          ws: parsed.ws || null,
          folder: parsed.folder || null
        };
      }
    } catch (e) {
      console.error('Failed to parse workspace level from sessionStorage:', e);
    }
    return { type: 'root', id: null };
  });

  const [viewMode, setViewMode] = useState('tile');
  const [sortBy, setSortBy] = useState('name_asc');
  const [activeRootTab, setActiveRootTab] = useState(() => {
    return sessionStorage.getItem('workspaceActiveRootTab') || 'my-workspaces';
  });

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedWorkspaceForFolder, setSelectedWorkspaceForFolder] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [localAdditions, setLocalAdditions] = useState(() => {
    const saved = sessionStorage.getItem('workspaceLocalAdditions');
    return saved ? JSON.parse(saved) : { workspaces: [], folders: {}, videos: {} };
  });

  const [contributorsPanel, setContributorsPanel] = useState({ open: false, workspace: null });
  const [members, setMembers] = useState([]);
  const [invitees, setInvitees] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [renameWorkspaceName, setRenameWorkspaceName] = useState('');
  const [moveTargetVideo, setMoveTargetVideo] = useState(null);
  const [moveTargetWorkspace, setMoveTargetWorkspace] = useState(null);

  // Toast & confirm dialog system
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const openConfirmDialog = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  const activeWorkspace = useMemo(() => {
    if (currentLevel.type === 'root') return null;
    const wsId = currentLevel.ws?.id || currentLevel.id;
    const found = workspaces.find((w) => String(w.id) === String(wsId));
    return found || currentLevel.ws;
  }, [workspaces, currentLevel]);

  const activeFolder = useMemo(() => {
    if (currentLevel.type !== 'folder') return null;
    const fId = currentLevel.folder?.id || currentLevel.id;
    const found = activeWorkspace?.folders?.find((f) => String(f.id) === String(fId));
    return found || currentLevel.folder;
  }, [activeWorkspace, currentLevel]);

  // Sync full resolved workspace/folder back to currentLevel once loaded
  useEffect(() => {
    if (loading || workspaces.length === 0) return;

    const wsId = currentLevel.ws?.id || currentLevel.id;
    const resolvedWs = workspaces.find((w) => String(w.id) === String(wsId));
    
    if (resolvedWs) {
      const isWsSkeleton = !currentLevel.ws || !currentLevel.ws.folders;
      let resolvedFolder = null;
      let isFolderSkeleton = false;

      if (currentLevel.type === 'folder') {
        const fId = currentLevel.folder?.id || currentLevel.id;
        resolvedFolder = resolvedWs.folders?.find((f) => String(f.id) === String(fId));
        isFolderSkeleton = !currentLevel.folder || !currentLevel.folder.videos;
      }

      if (isWsSkeleton || isFolderSkeleton) {
        setCurrentLevel((prev) => {
          if (prev.type === 'root') return prev;
          return {
            ...prev,
            ws: resolvedWs,
            folder: resolvedFolder || prev.folder
          };
        });
      }
    }
  }, [workspaces, loading, currentLevel]);

  useEffect(() => {
    try {
      const serialized = {
        type: currentLevel.type,
        id: currentLevel.id,
        ws: currentLevel.ws ? { id: currentLevel.ws.id, name: currentLevel.ws.name, type: currentLevel.ws.type, userRole: currentLevel.ws.userRole } : null,
        folder: currentLevel.folder ? { id: currentLevel.folder.id, name: currentLevel.folder.name } : null
      };
      sessionStorage.setItem('workspaceCurrentLevel', JSON.stringify(serialized));
    } catch (e) {
      console.error('Failed to save workspace level to sessionStorage:', e);
    }
  }, [currentLevel]);

  useEffect(() => {
    sessionStorage.setItem('workspaceActiveRootTab', activeRootTab);
  }, [activeRootTab]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('workspaceLocalAdditions', JSON.stringify(localAdditions));
  }, [localAdditions]);

  useEffect(() => {
    const savedView = localStorage.getItem('workspaceViewMode');
    const savedSort = localStorage.getItem('workspaceSortBy');
    if (savedView) setViewMode(savedView);
    if (savedSort) setSortBy(savedSort);

    if (!authLoading) {
      loadWorkspaces();
      loadInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser?.id, authUser?._id]);

  useEffect(() => {
    const onWorkspaceCreated = (event) => {
      const created = event.detail?.workspace;
      if (!created) return;
      const normalized = {
        ...normalizeWorkspace(created, currentUserId),
        userRole: 'OWNER',
        folders: []
      };
      setWorkspaces((prev) => {
        if (prev.some((ws) => String(ws.id) === String(normalized.id))) return prev;
        return [...prev, normalized];
      });
      setLocalAdditions((prev) => ({
        ...prev,
        workspaces: [
          ...prev.workspaces.filter((ws) => String(ws.id) !== String(normalized.id)),
          { ...normalized, createdByCurrentUser: true }
        ]
      }));
    };

    const onFolderCreated = (event) => {
      const createdFolder = event.detail?.folder;
      const workspaceId = event.detail?.workspaceId;
      if (!createdFolder || !workspaceId) return;
      setWorkspaces((prev) => {
        const ws = prev.find((item) => String(item.id) === String(workspaceId));
        const lookup = buildWorkspaceUserLookup(ws, currentUserId, authUser);
        const normalizedFolder = normalizeFolder(createdFolder, currentUserId, authUser, lookup);

        setLocalAdditions((localPrev) => ({
          ...localPrev,
          folders: {
            ...localPrev.folders,
            [workspaceId]: [
              ...(localPrev.folders[workspaceId] || []).filter(
                (folder) => String(folder.id) !== String(normalizedFolder.id)
              ),
              normalizedFolder
            ]
          }
        }));

        return prev.map((item) => {
          if (String(item.id) !== String(workspaceId)) return item;
          if (item.folders.some((folder) => String(folder.id) === String(normalizedFolder.id))) return item;
          return { ...item, folders: [...item.folders, normalizedFolder] };
        });
      });
    };

    const onVideoCreated = (event) => {
      const workspaceId = event.detail?.workspaceId;
      const folderId = event.detail?.folderId;
      const video = event.detail?.video;
      if (!workspaceId || !folderId || !video) return;

      setWorkspaces((prev) => {
        const ws = prev.find((item) => String(item.id) === String(workspaceId));
        const lookup = buildWorkspaceUserLookup(ws, currentUserId, authUser);
        const normalizedVideo = normalizeVideo({ ...video, workspaceId }, currentUserId, authUser, lookup);
        const editorName = getAuthDisplayName(authUser) || 'You';

        return prev.map((item) => {
          if (String(item.id) !== String(workspaceId)) return item;
          return {
            ...item,
            folders: item.folders.map((folder) => {
              if (String(folder.id) !== String(folderId)) return folder;
              if ((folder.videos || []).some((v) => String(v.id) === String(normalizedVideo.id))) {
                return folder;
              }
              const videos = [...(folder.videos || []), normalizedVideo];
              return {
                ...folder,
                videos,
                lastModifiedBy: editorName,
                lastModifiedAt: new Date().toISOString(),
                displaySize: formatFolderSize({ ...folder, videos })
              };
            })
          };
        });
      });
    };

    window.addEventListener('workspace:created', onWorkspaceCreated);
    window.addEventListener('workspace:folder-created', onFolderCreated);
    window.addEventListener('workspace:video-created', onVideoCreated);

    return () => {
      window.removeEventListener('workspace:created', onWorkspaceCreated);
      window.removeEventListener('workspace:folder-created', onFolderCreated);
      window.removeEventListener('workspace:video-created', onVideoCreated);
    };
  }, [authUser?.email, authUser?.name, currentUserId]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const rawWorkspaces = await workspaceService.listWorkspaces();
      const mapped = (rawWorkspaces || []).map((ws) => normalizeWorkspace(ws, currentUserId, authUser));

      const withFolders = await Promise.all(
        mapped.map(async (workspace) => {
          try {
            const enrichedWorkspace = await enrichWorkspaceMembers(workspace);
            const userLookup = buildWorkspaceUserLookup(enrichedWorkspace, currentUserId, authUser);

            const [folders, projects] = await Promise.all([
              workspaceService.listFolders(enrichedWorkspace.id),
              workspaceService.listProjects(enrichedWorkspace.id)
            ]);

            const normalizedFolders = (folders || []).map((f) =>
              normalizeFolder(f, currentUserId, authUser, userLookup)
            );

            normalizedFolders.forEach((folder) => {
              const folderVideos = (projects || [])
                .filter((p) => {
                  const pFolderId = p.folderId || (p.folder && (p.folder.id || p.folder._id));
                  return String(pFolderId) === String(folder.id);
                })
                .map((p) =>
                  normalizeVideo({ ...p, workspaceId: enrichedWorkspace.id }, currentUserId, authUser, userLookup)
                );
              folder.videos = folderVideos;
              folder.displaySize = formatFolderSize(folder);
            });

            return {
              ...enrichedWorkspace,
              folders: normalizedFolders,
              videos: (projects || [])
                .filter((p) => {
                  const pFolderId = p.folderId || (p.folder && (p.folder.id || p.folder._id));
                  return !pFolderId;
                })
                .map((p) =>
                  normalizeVideo({ ...p, workspaceId: enrichedWorkspace.id }, currentUserId, authUser, userLookup)
                )
            };
          } catch (err) {
            console.error(`Failed to load folders/projects for workspace ${workspace.id}:`, err);
            return workspace;
          }
        })
      );

      let merged = withFolders.map((workspace) => {
        const localWorkspaceMeta = localAdditions.workspaces.find(
          (localWorkspace) => String(localWorkspace.id) === String(workspace.id) && localWorkspace.createdByCurrentUser
        );
        if (!localWorkspaceMeta) return workspace;
        return {
          ...workspace,
          type: 'workspace',
          userRole: 'OWNER',
          ownerId: currentUserId || workspace.ownerId,
          ownerName: authUser?.name || 'You'
        };
      });

      if (!merged.some((workspace) => workspace.type === 'personal')) {
        merged.unshift({
          id: 'personal-default',
          name: 'Personal Workspace',
          type: 'personal',
          ownerId: currentUserId || 'self',
          ownerName: authUser?.name || 'You',
          members: [],
          folders: [],
          userRole: 'OWNER'
        });
      }

      localAdditions.workspaces.forEach((localWorkspace) => {
        if (!merged.some((workspace) => String(workspace.id) === String(localWorkspace.id))) {
          merged.push({
            ...localWorkspace,
            userRole: 'OWNER',
            type: localWorkspace.type === 'personal' ? 'personal' : 'workspace',
            folders: localWorkspace.folders || []
          });
        }
      });

      merged = merged.map((workspace) => {
        const localFolders = localAdditions.folders[workspace.id] || [];
        const mergedFolders = [...(workspace.folders || [])];

        localFolders.forEach((localFolder) => {
          if (!mergedFolders.some((existing) => String(existing.id) === String(localFolder.id))) {
            mergedFolders.push(localFolder);
          }
        });

        const foldersWithLocalVideos = mergedFolders.map((folder) => {
          const localVideos = localAdditions.videos[folder.id] || [];
          const mergedVideos = [...(folder.videos || [])];

          localVideos.forEach((localVideo) => {
            if (!mergedVideos.some((video) => String(video.id) === String(localVideo.id))) {
              mergedVideos.push(localVideo);
            }
          });

          return {
            ...folder,
            videos: mergedVideos
          };
        });

        return {
          ...workspace,
          folders: foldersWithLocalVideos
        };
      });

      setWorkspaces(merged);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setWorkspaces([
        {
          id: 'personal-fallback',
          name: 'Personal Workspace',
          type: 'personal',
          ownerId: currentUserId || 'self',
          ownerName: authUser?.name || 'You',
          members: [],
          folders: [],
          userRole: 'OWNER'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const items = await workspaceService.getInvitations();
      setInvitations(items || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    }
  };

  const loadContributorsForWorkspace = async (workspace) => {
    if (!workspace) return;
    setMembersLoading(true);
    try {
      const [workspaceMembers, workspaceInvitees] = await Promise.all([
        workspaceService.listWorkspaceMembers(workspace.id).catch(() => []),
        workspaceService.listWorkspaceInvitations(workspace.id).catch(() => [])
      ]);
      setMembers(workspaceMembers || []);
      setInvitees(workspaceInvitees || []);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('workspaceViewMode', mode);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    localStorage.setItem('workspaceSortBy', sort);
  };

  const personalWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.type === 'personal'),
    [workspaces]
  );

  const myWorkspaces = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.type === 'workspace' && String(workspace.userRole || '').toUpperCase() === 'OWNER'
      ),
    [workspaces]
  );

  const sharedWithMe = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.type === 'workspace' && String(workspace.userRole || '').toUpperCase() !== 'OWNER'
      ),
    [workspaces]
  );

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'name_asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (sortBy === 'name_desc') return String(b.name || '').localeCompare(String(a.name || ''));
      return 0;
    });
  };

  const openCreateVideoModal = (context = {}) => {
    if (onCreate) {
      onCreate(context);
    }
  };

  const handleCreateWorkspace = async ({ name, invites }) => {
    try {
      const createdWorkspace = await workspaceService.createWorkspace(name);
      const mappedWorkspace = {
        ...normalizeWorkspace(createdWorkspace, currentUserId),
        userRole: 'OWNER',
        type: 'workspace',
        folders: []
      };

      setWorkspaces((prev) => [...prev, mappedWorkspace]);

      setLocalAdditions((prev) => ({
        ...prev,
        workspaces: [
          ...prev.workspaces.filter((workspace) => String(workspace.id) !== String(mappedWorkspace.id)),
          { ...mappedWorkspace, createdByCurrentUser: true }
        ]
      }));

      if (invites && invites.length > 0) {
        for (const email of invites) {
          await workspaceService.inviteMember(mappedWorkspace.id, { email, role: 'MEMBER' }).catch(() => null);
        }
      }

      setActiveRootTab('my-workspaces');
      showToast('Workspace created successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to create workspace', 'error');
      throw error;
    }
  };

  const handleCreateFolder = async (folderName) => {
    if (!selectedWorkspaceForFolder) return;

    const workspace = workspaces.find((item) => String(item.id) === String(selectedWorkspaceForFolder.id));
    if (!workspaceCanEdit(workspace)) {
      throw new Error('You do not have permission to create folders in this workspace.');
    }

    const duplicateFolder = workspace?.folders?.some(
      (folder) => String(folder.name || '').toLowerCase() === String(folderName || '').toLowerCase()
    );
    if (duplicateFolder) {
      throw new Error(`A folder named "${folderName}" already exists in this workspace.`);
    }

    try {
      const createdFolder = await workspaceService.createFolder(workspace.id, folderName);
      const userLookup = buildWorkspaceUserLookup(workspace, currentUserId, authUser);
      const normalizedFolder = normalizeFolder(createdFolder, currentUserId, authUser, userLookup);

      setWorkspaces((prev) =>
        prev.map((item) =>
          String(item.id) === String(workspace.id)
            ? { ...item, folders: [...item.folders, normalizedFolder] }
            : item
        )
      );

      setLocalAdditions((prev) => ({
        ...prev,
        folders: {
          ...prev.folders,
          [workspace.id]: [
            ...(prev.folders[workspace.id] || []).filter((folder) => String(folder.id) !== String(normalizedFolder.id)),
            normalizedFolder
          ]
        }
      }));
      showToast('Folder created successfully', 'success');
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  };

  const handleAcceptInvitation = async (invitationToken) => {
    try {
      await workspaceService.acceptInvitation(invitationToken);
      // invitationToken may be invitation.token or invitation.id; remove whichever matches
      setInvitations((prev) => prev.filter((inv) => (inv.token || inv.id) !== invitationToken));
      await loadWorkspaces();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeclineInvitation = async (invitation) => {
    try {
      if (invitation?.workspaceId && invitation?.id) {
        await workspaceService.removeInvitation(invitation.workspaceId, invitation.id).catch(() => null);
      }
      setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
    } catch (error) {
      console.error(error);
    }
  };

  const renameItem = (type, id) => {
    let currentName = '';

    if (type === 'workspace') {
      currentName = workspaces.find((workspace) => String(workspace.id) === String(id))?.name || '';
    } else if (type === 'folder') {
      currentName = workspaces
        .flatMap((workspace) => workspace.folders)
        .find((folder) => String(folder.id) === String(id))?.name || '';
    } else if (type === 'video') {
      currentName = workspaces
        .flatMap((workspace) => workspace.folders)
        .flatMap((folder) => folder.videos || [])
        .find((video) => String(video.id) === String(id))?.name || '';
    }

    setRenameTarget({ type, id, name: currentName });
  };

  const handleRename = async (newName) => {
    if (!renameTarget) return;

    const { type, id } = renameTarget;

    if (type === 'workspace') {
      const targetWorkspace = workspaces.find((workspace) => String(workspace.id) === String(id));
      if (!targetWorkspace || targetWorkspace.type === 'personal') return;
      if (String(targetWorkspace.userRole || '').toUpperCase() !== 'OWNER') {
        throw new Error('Only the owner can rename this workspace.');
      }

      await workspaceService.updateWorkspace(id, { name: newName });
      setWorkspaces((prev) => prev.map((workspace) => (String(workspace.id) === String(id) ? { ...workspace, name: newName } : workspace)));
      showToast('Workspace renamed successfully', 'success');
    }

    if (type === 'folder') {
      const parentWorkspace =
        activeWorkspace ||
        workspaces.find((workspace) => workspace.folders.some((folder) => String(folder.id) === String(id)));

      if (!workspaceCanEdit(parentWorkspace)) {
        throw new Error('You do not have permission to rename this folder.');
      }

      await workspaceService.renameFolder(parentWorkspace.id, id, newName);
      setWorkspaces((prev) =>
        prev.map((workspace) => ({
          ...workspace,
          folders: workspace.folders.map((folder) =>
            String(folder.id) === String(id)
              ? {
                  ...folder,
                  name: newName,
                  lastModifiedBy: authUser?.name || authUser?.email || 'You',
                  lastModifiedAt: new Date().toLocaleString()
                }
              : folder
          )
        }))
      );
      showToast('Folder renamed successfully', 'success');
    }

    if (type === 'video') {
      const parentWorkspace = activeWorkspace;
      if (!workspaceCanEdit(parentWorkspace)) {
        throw new Error('You do not have permission to rename this video.');
      }

      await workspaceService.updateProject(parentWorkspace.id, id, { name: newName });
      setWorkspaces((prev) =>
        prev.map((workspace) => ({
          ...workspace,
          folders: workspace.folders.map((folder) => ({
            ...folder,
            videos: (folder.videos || []).map((video) =>
              String(video.id) === String(id)
                ? {
                    ...video,
                    name: newName,
                    lastModifiedBy: authUser?.name || authUser?.email || 'You',
                    lastModifiedAt: new Date().toISOString(),
                    lastEditedBy: authUser?.name || authUser?.email || 'You',
                    lastEditedAt: new Date().toISOString()
                  }
                : video
            )
          }))
        }))
      );
      showToast('Video renamed successfully', 'success');
    }
  };

  const deleteItem = (type, id, workspaceContext = null) => {
    if (type === 'workspace') {
      const workspace = workspaces.find((item) => String(item.id) === String(id));
      if (!workspace) return;

      if (workspace.type === 'personal') {
        showToast('Personal Workspace cannot be deleted.', 'error');
        return;
      }

      if (String(workspace.userRole || '').toUpperCase() !== 'OWNER') {
        openConfirmDialog('You are not the owner of this workspace. Do you want to leave it?', async () => {
          try {
            await workspaceService.leaveWorkspace(workspace);
            setWorkspaces((prev) => prev.filter((item) => String(item.id) !== String(workspace.id)));
            setLocalAdditions((prev) => ({
              ...prev,
              workspaces: prev.workspaces.filter((item) => String(item.id) !== String(workspace.id))
            }));
            if (String(currentLevel.id) === String(workspace.id)) {
              setCurrentLevel({ type: 'root', id: null });
            }
            showToast('Left workspace successfully', 'success');
          } catch (error) {
            showToast(error.message || 'Failed to leave workspace', 'error');
          }
        });
      } else {
        openConfirmDialog('This will permanently delete all folders and videos inside. This cannot be undone.', async () => {
          try {
            await workspaceService.deleteWorkspace(workspace.id);
            setWorkspaces((prev) => prev.filter((item) => String(item.id) !== String(workspace.id)));
            setLocalAdditions((prev) => ({
              ...prev,
              workspaces: prev.workspaces.filter((item) => String(item.id) !== String(workspace.id))
            }));
            if (String(currentLevel.id) === String(workspace.id)) {
              setCurrentLevel({ type: 'root', id: null });
            }
            showToast('Workspace deleted successfully', 'success');
          } catch (error) {
            showToast(error.message || 'Failed to delete workspace', 'error');
          }
        });
      }
      return;
    }

    if (type === 'folder') {
      const parentWorkspace =
        workspaceContext ||
        activeWorkspace ||
        workspaces.find((workspace) => workspace.folders.some((folder) => String(folder.id) === String(id)));

      if (!workspaceCanEdit(parentWorkspace)) {
        showToast('You do not have permission to delete this folder.', 'error');
        return;
      }

      openConfirmDialog('Delete this folder and all videos inside it?', async () => {
        try {
          await workspaceService.deleteFolder(parentWorkspace.id, id);
          setWorkspaces((prev) =>
            prev.map((workspace) =>
              String(workspace.id) === String(parentWorkspace.id)
                ? { ...workspace, folders: workspace.folders.filter((folder) => String(folder.id) !== String(id)) }
                : workspace
            )
          );
          setLocalAdditions((prev) => ({
            ...prev,
            folders: {
              ...prev.folders,
              [parentWorkspace.id]: (prev.folders[parentWorkspace.id] || []).filter(
                (folder) => String(folder.id) !== String(id)
              )
            }
          }));
          if (String(currentLevel.id) === String(id)) {
            setCurrentLevel({ type: 'workspace', id: parentWorkspace.id, ws: parentWorkspace });
          }
          showToast('Folder deleted successfully', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete folder', 'error');
        }
      });
      return;
    }

    if (type === 'video') {
      const parentWorkspace = activeWorkspace;
      const parentFolder = activeFolder;
      if (!workspaceCanEdit(parentWorkspace)) {
        showToast('You do not have permission to delete this project.', 'error');
        return;
      }

      openConfirmDialog('Delete this project?', async () => {
        try {
          await workspaceService.deleteProject(parentWorkspace.id, id);
          setWorkspaces((prev) =>
            prev.map((workspace) =>
              String(workspace.id) === String(parentWorkspace.id)
                ? {
                    ...workspace,
                    folders: workspace.folders.map((folder) =>
                      String(folder.id) === String(parentFolder.id)
                        ? {
                            ...folder,
                            videos: (folder.videos || []).filter((video) => String(video.id) !== String(id))
                          }
                        : folder
                    )
                  }
                : workspace
            )
          );
          setLocalAdditions((prev) => ({
            ...prev,
            videos: {
              ...prev.videos,
              [parentFolder.id]: (prev.videos[parentFolder.id] || []).filter((video) => String(video.id) !== String(id))
            }
          }));
          showToast('Video deleted successfully', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete video', 'error');
        }
      });
    }
  };

  const handleManageWorkspace = async (workspace) => {
    setContributorsPanel({ open: true, workspace });
    setRenameWorkspaceName(workspace.name || '');
    await loadContributorsForWorkspace(workspace);
  };

  const handleRenameWorkspaceInsidePanel = async () => {
    const workspace = contributorsPanel.workspace;
    if (!workspace) return;
    const newName = renameWorkspaceName.trim();
    if (!newName) {
      showToast('Workspace name cannot be empty', 'error');
      return;
    }
    if (newName === workspace.name) {
      return;
    }

    try {
      await workspaceService.updateWorkspace(workspace.id, { name: newName });
      
      setWorkspaces((prev) =>
        prev.map((item) => (String(item.id) === String(workspace.id) ? { ...item, name: newName } : item))
      );

      setContributorsPanel((prev) => ({
        ...prev,
        workspace: prev.workspace ? { ...prev.workspace, name: newName } : null
      }));

      showToast('Workspace renamed successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to rename workspace', 'error');
    }
  };

  const handleInviteContributor = async () => {
    if (!contributorsPanel.workspace || !inviteEmail.trim()) return;
    try {
      await workspaceService.inviteMember(contributorsPanel.workspace.id, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteEmail('');
      await loadContributorsForWorkspace(contributorsPanel.workspace);
      showToast('Member invited successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to invite member', 'error');
    }
  };

  const handleChangeMemberRole = async (memberId, role) => {
    if (!contributorsPanel.workspace) return;
    try {
      await workspaceService.changeMemberRole(contributorsPanel.workspace.id, memberId, role);
      await loadContributorsForWorkspace(contributorsPanel.workspace);
      showToast('Member role updated', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to change role', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!contributorsPanel.workspace) return;
    openConfirmDialog('Remove this member from workspace?', async () => {
      try {
        await workspaceService.removeMember(contributorsPanel.workspace.id, memberId);
        await loadContributorsForWorkspace(contributorsPanel.workspace);
        showToast('Member removed successfully', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to remove member', 'error');
      }
    });
  };

  const handleLeaveSharedWorkspace = async (workspace) => {
    openConfirmDialog(`Leave workspace "${workspace.name}"?`, async () => {
      try {
        await workspaceService.leaveWorkspace(workspace);
        setWorkspaces((prev) => prev.filter((item) => String(item.id) !== String(workspace.id)));
        if (String(currentLevel.id) === String(workspace.id)) {
          setCurrentLevel({ type: 'root', id: null });
        }
        showToast('Left workspace successfully', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to leave workspace', 'error');
      }
    });
  };

  const renderWorkspaceItems = (items) => {
    const sorted = sortItems(items);

    if (viewMode === 'tile') {
      return sorted.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onClick={() => setCurrentLevel({ type: 'workspace', id: workspace.id, ws: workspace })}
          contextProps={{
            onDetails: () => setDetailsTarget({ type: 'workspace', item: workspace }),
            onManageWorkspace:
              workspace.type === 'workspace' && String(workspace.userRole).toUpperCase() === 'OWNER'
                ? () => handleManageWorkspace(workspace)
                : null,
            onDelete:
              workspace.type === 'personal'
                ? null
                : () => {
                    if (String(workspace.userRole).toUpperCase() === 'OWNER') {
                      deleteItem('workspace', workspace.id, workspace);
                    } else {
                      handleLeaveSharedWorkspace(workspace);
                    }
                  }
          }}
        />
      ));
    }

    return sorted.map((workspace) => (
      <WorkspaceRow
        key={workspace.id}
        workspace={workspace}
        onClick={() => setCurrentLevel({ type: 'workspace', id: workspace.id, ws: workspace })}
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'workspace', item: workspace }),
          onManageWorkspace:
            workspace.type === 'workspace' && String(workspace.userRole).toUpperCase() === 'OWNER'
              ? () => handleManageWorkspace(workspace)
              : null,
          onDelete:
            workspace.type === 'personal'
              ? null
              : () => {
                  if (String(workspace.userRole).toUpperCase() === 'OWNER') {
                    deleteItem('workspace', workspace.id, workspace);
                  } else {
                    handleLeaveSharedWorkspace(workspace);
                  }
                }
        }}
      />
    ));
  };

  const renderFolderItems = (folders, workspace) => {
    const sorted = sortItems(folders);

    if (viewMode === 'tile') {
      return sorted.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onClick={() => setCurrentLevel({ type: 'folder', id: folder.id, folder, ws: workspace })}
          contextProps={{
            onDetails: () => setDetailsTarget({ type: 'folder', item: folder }),
            onRename: workspaceCanEdit(workspace) ? () => renameItem('folder', folder.id, workspace) : null,
            onDelete: workspaceCanEdit(workspace) ? () => deleteItem('folder', folder.id, workspace) : null
          }}
        />
      ));
    }

    return sorted.map((folder) => (
      <FolderRow
        key={folder.id}
        folder={folder}
        onClick={() => setCurrentLevel({ type: 'folder', id: folder.id, folder, ws: workspace })}
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'folder', item: folder }),
          onRename: workspaceCanEdit(workspace) ? () => renameItem('folder', folder.id, workspace) : null,
          onDelete: workspaceCanEdit(workspace) ? () => deleteItem('folder', folder.id, workspace) : null
        }}
      />
    ));
  };

  const handleMoveProject = async (targetFolderId) => {
    if (!moveTargetVideo || !moveTargetWorkspace) return;
    try {
      await workspaceService.moveProjectFolder(moveTargetWorkspace.id, moveTargetVideo.id, targetFolderId);
      
      setWorkspaces((prev) =>
        prev.map((workspace) => {
          if (String(workspace.id) !== String(moveTargetWorkspace.id)) return workspace;

          // Remove video from old folder
          const updatedFolders = workspace.folders.map((folder) => {
            return {
              ...folder,
              videos: (folder.videos || []).filter((v) => String(v.id) !== String(moveTargetVideo.id))
            };
          });

          // Add video to new folder (if targetFolderId is set)
          const updatedFoldersWithAdded = updatedFolders.map((folder) => {
            if (String(folder.id) !== String(targetFolderId)) return folder;
            const alreadyExists = (folder.videos || []).some((v) => String(v.id) === String(moveTargetVideo.id));
            const updatedVideo = { ...moveTargetVideo, folderId: targetFolderId };
            return {
              ...folder,
              videos: alreadyExists ? folder.videos : [...(folder.videos || []), updatedVideo]
            };
          });

          // Filter out from root videos
          let updatedRootVideos = (workspace.videos || []).filter((v) => String(v.id) !== String(moveTargetVideo.id));
          if (!targetFolderId) {
            const alreadyExists = updatedRootVideos.some((v) => String(v.id) === String(moveTargetVideo.id));
            const updatedVideo = { ...moveTargetVideo, folderId: null };
            updatedRootVideos = alreadyExists ? updatedRootVideos : [...updatedRootVideos, updatedVideo];
          }

          return {
            ...workspace,
            folders: updatedFoldersWithAdded,
            videos: updatedRootVideos
          };
        })
      );

      showToast('Video moved successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to move video', 'error');
      throw err;
    }
  };

  const renderVideoItems = (videos, workspace) => {
    const sorted = sortItems(videos);

    if (viewMode === 'tile') {
      return sorted.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={() => onEdit && onEdit({ ...video, workspaceId: workspace.id })}
          contextProps={{
            onDetails: () => setDetailsTarget({ type: 'video', item: video }),
            onRename: workspaceCanEdit(workspace) ? () => renameItem('video', video.id, workspace) : null,
            onMove: workspaceCanEdit(workspace) ? () => { setMoveTargetVideo(video); setMoveTargetWorkspace(workspace); } : null,
            onDelete: workspaceCanEdit(workspace) ? () => deleteItem('video', video.id, workspace) : null
          }}
        />
      ));
    }

    return sorted.map((video) => (
      <VideoRow
        key={video.id}
        video={video}
        onClick={() => onEdit && onEdit({ ...video, workspaceId: workspace.id })}
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'video', item: video }),
          onRename: workspaceCanEdit(workspace) ? () => renameItem('video', video.id, workspace) : null,
          onMove: workspaceCanEdit(workspace) ? () => { setMoveTargetVideo(video); setMoveTargetWorkspace(workspace); } : null,
          onDelete: workspaceCanEdit(workspace) ? () => deleteItem('video', video.id, workspace) : null
        }}
      />
    ));
  };

  const renderRoot = () => (
    <div>
      <WorkspaceSection title="Personal Workspace" count={personalWorkspace ? 1 : 0} viewMode={viewMode}>
        {personalWorkspace && renderWorkspaceItems([personalWorkspace])}
      </WorkspaceSection>

      <div className="workspace-root-tabs-wrapper">
        <div className="workspace-root-tabs">
          <button
            className={`workspace-root-tab ${activeRootTab === 'my-workspaces' ? 'active' : ''}`}
            onClick={() => setActiveRootTab('my-workspaces')}
          >
            <MdFolderOpen size={18} /> My Workspaces
          </button>
          <button
            className={`workspace-root-tab ${activeRootTab === 'shared-with-me' ? 'active' : ''}`}
            onClick={() => setActiveRootTab('shared-with-me')}
          >
            <MdMail size={18} /> Shared with Me
          </button>
        </div>
      </div>

      {activeRootTab === 'my-workspaces' && (
        <WorkspaceSection
          title="My Workspaces"
          count={myWorkspaces.length}
          viewMode={viewMode}
          emptyMessage="You do not have any custom workspaces yet."
          emptyActionLabel="Create Workspace"
          onEmptyAction={() => setIsCreateWorkspaceOpen(true)}
          showCreateButton={true}
          onCreateClick={() => setIsCreateWorkspaceOpen(true)}
        >
          {viewMode === 'list' && (
            <div className="list-header">
              <div className="col" />
              <div className="col">Name</div>
              <div className="col">Owner</div>
              <div className="col">Date modified</div>
              <div className="col">Members</div>
              <div className="col" />
            </div>
          )}
          {renderWorkspaceItems(myWorkspaces)}
        </WorkspaceSection>
      )}

      {activeRootTab === 'shared-with-me' && (
        <WorkspaceSection
          title="Shared with Me"
          count={sharedWithMe.length}
          viewMode={viewMode}
          emptyMessage="No workspaces have been shared with you yet."
        >
          {viewMode === 'list' && (
            <div className="list-header">
              <div className="col" />
              <div className="col">Name</div>
              <div className="col">Owner</div>
              <div className="col">Date modified</div>
              <div className="col">Members</div>
              <div className="col" />
            </div>
          )}
          {renderWorkspaceItems(sharedWithMe)}
        </WorkspaceSection>
      )}
    </div>
  );

  const renderWorkspaceLevel = () => {
    const workspace = activeWorkspace;
    if (!workspace) return null;

    const canEdit = workspaceCanEdit(workspace);
    const role = String(workspace.userRole || 'MEMBER').toUpperCase();

    return (
      <div>
        <div className="workspace-breadcrumbs">
          <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>
            Workspaces
          </span>
          <span className="breadcrumb-separator">&gt;</span>
          <span>{workspace.name}</span>
        </div>

        {!canEdit && (
          <div className="workspace-permission-note" style={{ marginBottom: 16 }}>
            <MdInfo size={18} />
            <span>You have {role} access. Creating folders and videos is disabled.</span>
          </div>
        )}

        <WorkspaceSection
          title="Folders"
          count={(workspace.folders || []).length}
          viewMode={viewMode}
          listClassName="folder-list-view"
          emptyMessage="No folders yet"
          emptyIcon={MdFolderOpen}
          emptyActionLabel="Create Folder"
          onEmptyAction={
            canEdit
              ? () => {
                  setSelectedWorkspaceForFolder(workspace);
                  setIsCreateFolderOpen(true);
                }
              : null
          }
          showCreateButton={canEdit}
          createButtonLabel="Create Folder"
          onCreateClick={() => {
            setSelectedWorkspaceForFolder(workspace);
            setIsCreateFolderOpen(true);
          }}
        >
          {viewMode === 'list' && (
            <div className="list-header folder-list-header">
              <div className="col" />
              <div className="col">Name</div>
              <div className="col">Owner</div>
              <div className="col">Date created</div>
              <div className="col">Modified by</div>
              <div className="col">Modified at</div>
              <div className="col">Size</div>
              <div className="col" />
            </div>
          )}
          {renderFolderItems(workspace.folders || [], workspace)}
        </WorkspaceSection>

        {workspace.type === 'workspace' && String(workspace.userRole || '').toUpperCase() !== 'OWNER' && (
          <button
            type="button"
            className="btn-secondary add-btn-small"
            onClick={() => handleLeaveSharedWorkspace(workspace)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <MdExitToApp size={16} /> Leave Workspace
          </button>
        )}

        <CreateFolderModal
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={handleCreateFolder}
          existingFolders={selectedWorkspaceForFolder?.folders || []}
        />
      </div>
    );
  };

  const renderFolderLevel = () => {
    const workspace = activeWorkspace;
    const folder = activeFolder;
    if (!workspace || !folder) return null;

    const canEdit = workspaceCanEdit(workspace);
    const role = String(workspace.userRole || 'MEMBER').toUpperCase();

    return (
      <div>
        <div className="workspace-breadcrumbs">
          <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>
            Workspaces
          </span>
          <span className="breadcrumb-separator">&gt;</span>
          <span
            className="breadcrumb-link"
            onClick={() => setCurrentLevel({ type: 'workspace', id: workspace.id, ws: workspace })}
          >
            {workspace.name}
          </span>
          <span className="breadcrumb-separator">&gt;</span>
          <span>{folder.name}</span>
        </div>

        {!canEdit && (
          <div className="workspace-permission-note" style={{ marginBottom: 16 }}>
            <MdInfo size={18} />
            <span>You have {role} access. Creating videos is disabled in this workspace.</span>
          </div>
        )}

        <WorkspaceSection
          title="Videos"
          count={(folder.videos || []).length}
          viewMode={viewMode}
          listClassName="project-list-view"
          emptyMessage="No videos yet"
          emptyIcon={MdVideoLibrary}
          emptyActionLabel="Create Video"
          onEmptyAction={
            canEdit
              ? () =>
                  openCreateVideoModal({
                    initialWorkspaceId: workspace.id,
                    initialFolderId: folder.id
                  })
              : null
          }
          showCreateButton={canEdit}
          createButtonLabel="Create Video"
          onCreateClick={() =>
            openCreateVideoModal({
              initialWorkspaceId: workspace.id,
              initialFolderId: folder.id
            })
          }
        >
          {viewMode === 'list' && (
            <div className="list-header project-list-header">
              <div className="col" />
              <div className="col">Name</div>
              <div className="col">Owner</div>
              <div className="col">Date created</div>
              <div className="col">Modified by</div>
              <div className="col">Modified at</div>
              <div className="col">Size</div>
              <div className="col" />
            </div>
          )}
          {renderVideoItems(folder.videos || [], workspace)}
        </WorkspaceSection>
      </div>
    );
  };

  return (
    <div
      className="team-workspace-container"
    >
      <WorkspaceHeader
        viewMode={viewMode}
        onViewChange={handleViewChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onCreateClick={() => openCreateVideoModal()}
        invitationCount={invitations.length}
        onInviteClick={() => setShowNotifications(true)}
      />

      <div className="workspace-content-area" style={{ flex: 1 }}>
        {loading && workspaces.length === 0 ? (
          <TeamWorkspaceSkeleton />
        ) : (
          <>
            {currentLevel.type === 'root' && renderRoot()}
            {currentLevel.type === 'workspace' && renderWorkspaceLevel()}
            {currentLevel.type === 'folder' && renderFolderLevel()}
          </>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onCreate={handleCreateWorkspace}
        workspaces={workspaces}
      />

      <RenameModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
        currentName={renameTarget?.name || ''}
        itemType={renameTarget?.type || 'workspace'}
      />

      <ItemDetailsModal
        isOpen={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        itemType={detailsTarget?.type}
        item={detailsTarget?.item}
      />

      <MoveProjectModal
        isOpen={!!moveTargetVideo}
        onClose={() => { setMoveTargetVideo(null); setMoveTargetWorkspace(null); }}
        onMove={handleMoveProject}
        folders={moveTargetWorkspace?.folders || []}
        currentFolderId={moveTargetVideo?.folderId || (moveTargetVideo?.folder && (moveTargetVideo.folder.id || moveTargetVideo.folder._id)) || null}
        videoTitle={moveTargetVideo?.name || moveTargetVideo?.title || ''}
      />

      <AnimatePresence>
        {showNotifications && (
          <div
            className="notifications-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setShowNotifications(false)}
          >
            <div
              className="notifications-panel"
              style={{
                width: '400px',
                background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-color)',
                height: '100vh',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdMail /> Invitations
                </h2>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <MdClose size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {invitations.length > 0 ? (
                  invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        background: 'var(--bg-card)'
                      }}
                    >
                      <h4 style={{ margin: '0 0 4px 0' }}>{invitation.workspaceName || invitation.workspace?.name || 'Workspace'}</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Invited by {invitation.invitedBy || invitation.owner?.name || 'Owner'} | Role: {invitation.role || 'MEMBER'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleAcceptInvitation(invitation.token || invitation.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--success-green)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          <MdCheck /> Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(invitation)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          <MdClose /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No pending invitations</div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contributorsPanel.open && contributorsPanel.workspace && (
          <div
            className="notifications-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setContributorsPanel({ open: false, workspace: null })}
          >
            <div
              style={{
                width: '460px',
                background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-color)',
                height: '100vh',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Manage Workspace</h2>
                <button
                  onClick={() => setContributorsPanel({ open: false, workspace: null })}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <MdClose size={20} />
                </button>
              </div>

              {String(contributorsPanel.workspace.userRole).toUpperCase() === 'OWNER' ? (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>Workspace Settings</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={renameWorkspaceName}
                      onChange={(e) => setRenameWorkspaceName(e.target.value)}
                      placeholder="Workspace name"
                      style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', padding: '0 10px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleRenameWorkspaceInsidePanel}
                      style={{ height: 36, padding: '0 16px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Rename
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Workspace: {contributorsPanel.workspace.name}
                </div>
              )}

              {workspaceCanManageContributors(contributorsPanel.workspace) && (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>Invite Contributor</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email address"
                      style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', padding: '0 10px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      style={{ width: 100, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button className="btn-primary" type="button" onClick={handleInviteContributor}>
                      <MdAdd size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Members</div>
                {membersLoading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading members...</div>
                ) : members.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>No members found.</div>
                ) : (
                  members.map((member) => {
                    const memberId = member.id || member.userId || member.user?.id || member.user?._id;
                    const label = member.user?.name || member.user?.email || member.name || member.email || 'Member';
                    const rawRole = String(member.role || 'MEMBER').toUpperCase();
                    const role = rawRole === 'EDITOR' || rawRole === 'VIEWER' ? 'MEMBER' : rawRole;

                    return (
                      <div key={memberId} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdPerson size={18} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{label}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{member.user?.email || member.email || ''}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {role === 'OWNER' ? (
                              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)', paddingRight: 8 }}>Owner</span>
                            ) : (
                              <select
                                value={role}
                                onChange={(e) => handleChangeMemberRole(memberId, e.target.value)}
                                disabled={String(contributorsPanel.workspace?.userRole).toUpperCase() !== 'OWNER'}
                                style={{ height: 32, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                              </select>
                            )}
                            {role !== 'OWNER' && workspaceCanManageContributors(contributorsPanel.workspace) && (
                              <button className="btn-secondary add-btn-small" onClick={() => handleRemoveMember(memberId)}>
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div style={{ fontWeight: 600, margin: '16px 0 8px' }}>Invitees</div>
                {invitees.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>No pending invitees.</div>
                ) : (
                  invitees.map((invitee) => (
                    <div key={invitee.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{invitee.email || invitee.inviteeEmail || 'Invitee'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            Role: {String(invitee.role || 'MEMBER').toUpperCase()} | Status: {String(invitee.status || 'PENDING').toUpperCase()}
                          </div>
                        </div>
                        {workspaceCanManageContributors(contributorsPanel.workspace) && (
                          <button
                            className="btn-secondary add-btn-small"
                            onClick={() => workspaceService.removeInvitation(contributorsPanel.workspace.id, invitee.id).then(() => loadContributorsForWorkspace(contributorsPanel.workspace))}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm dialog */}
      {confirmDialog && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10100,
            backdropFilter: 'blur(4px)', animation: 'twFadeIn 0.18s ease'
          }}
          onClick={() => setConfirmDialog(null)}
        >
          <div
            style={{
              width: 'min(420px, 92vw)', background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', borderRadius: '14px',
              boxShadow: '0 18px 45px rgba(15,23,42,0.22)', padding: '22px',
              textAlign: 'center', animation: 'twSlideUp 0.2s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
              background: 'rgba(var(--primary-rgb),0.12)', display: 'grid', placeItems: 'center'
            }}>
              <MdWarning style={{ fontSize: 24, color: 'var(--primary)' }} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
              Please confirm
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.45 }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  const onConfirm = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (onConfirm) await onConfirm();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10200, display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 10, color: '#fff', fontSize: 14,
          fontWeight: 600, boxShadow: '0 12px 30px rgba(15,23,42,0.28)',
          background: toast.type === 'success' ? '#16a34a' : '#dc2626',
          maxWidth: 'min(480px, calc(100vw - 32px))', whiteSpace: 'nowrap',
          animation: 'twSlideDown 0.25s ease'
        }}>
          {toast.type === 'success'
            ? <MdCheckCircle style={{ fontSize: 20, flexShrink: 0 }} />
            : <MdCancel style={{ fontSize: 20, flexShrink: 0 }} />
          }
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes twFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes twSlideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes twSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TeamWorkspace;
