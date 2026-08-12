import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MdFolderOpen,
  MdCreateNewFolder,
  MdWorkspaces,
  MdMovieCreation,
  MdVideoLibrary,
  MdInfo,
  MdExitToApp,
  MdHistory
} from 'react-icons/md';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sanitizeUserFacingMessage } from '../../utils/userFacingMessage';
import WorkspaceHeader from '../../components/features/workspace/workspace/WorkspaceHeader.jsx';
import WorkspaceSection from '../../components/features/workspace/workspace/WorkspaceSection.jsx';
import { WorkspaceCard, FolderCard, VideoCard, CreateWorkspaceCard, CreateFolderCard, CreateVideoCard } from '../../components/features/workspace/workspace/ViewCards.jsx';
import { WorkspaceRow, FolderRow, VideoRow } from '../../components/features/workspace/workspace/ViewRows.jsx';
import WorkspaceLibrary from '../../components/features/workspace/workspace/WorkspaceLibrary.jsx';
import CreateWorkspaceModal from '../../components/features/workspace/workspace/CreateWorkspaceModal.jsx';
import CreateFolderModal from '../../components/features/workspace/workspace/CreateFolderModal.jsx';
import RenameModal from '../../components/features/workspace/workspace/RenameModal.jsx';
import ItemDetailsModal from '../../components/features/workspace/workspace/ItemDetailsModal.jsx';
import MoveProjectModal from '../../components/features/workspace/workspace/MoveProjectModal.jsx';
import AllocateCreditsModal from '../../components/features/workspace/workspace/AllocateCreditsModal.jsx';
import WorkspaceCreditsUsageModal from '../../components/features/workspace/workspace/WorkspaceCreditsUsageModal.jsx';
import WorkspaceStorageBreadcrumb from '../../components/features/workspace/workspace/WorkspaceStorageBreadcrumb.jsx';
import TeamWorkspaceSkeleton from '../page-skeleton/TeamWorkspaceSkeleton';

import { extractUserId, normalizeWorkspace, normalizeFolder, normalizeVideo, workspaceCanEdit, workspaceCanManageContributors } from './workspaceUtils.js';
import { resolveLibraryKind } from '../../utils/workspaceLibrary.js';
import { useWorkspaceData } from './useWorkspaceData.js';
import { useWorkspaceActions } from './useWorkspaceActions.js';
import InvitationsPanel from './InvitationsPanel.jsx';
import ContributorsPanel from './ContributorsPanel.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import Toast from '../../components/ui/Toast/Toast';
import { consumeDashboardSearchContext } from '../../utils/dashboardSearchNavigate.js';

import { buildWorkspaceUserLookup, getAuthDisplayName } from '../../utils/workspaceUsers.js';
import { formatFolderSize } from '../../utils/formatSize.js';
import creditsService from '../../services/creditsService.js';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';
import '../../components/features/workspace/workspace/PremiumModal.css';

const TeamWorkspace = ({ onCreate, onEdit, onOpenImage }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const currentUserId = extractUserId(authUser);

  // ------------------------------------------------------------------
  // Navigation state
  // ------------------------------------------------------------------
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
    const saved = sessionStorage.getItem('workspaceActiveRootTab');
    return saved === 'workspace' ? 'workspace' : 'recents';
  });

  // ------------------------------------------------------------------
  // Modal / panel state
  // ------------------------------------------------------------------
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedWorkspaceForFolder, setSelectedWorkspaceForFolder] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [contributorsPanel, setContributorsPanel] = useState({ open: false, workspace: null });
  const [showAddContributors, setShowAddContributors] = useState(false);
  const [inviteInputs, setInviteInputs] = useState([{ email: '', role: 'MEMBER' }]);
  const [activeMemberMenuId, setActiveMemberMenuId] = useState(null);
  const [moveTargetVideo, setMoveTargetVideo] = useState(null);
  const [moveTargetWorkspace, setMoveTargetWorkspace] = useState(null);
  const [allocateCreditsWorkspace, setAllocateCreditsWorkspace] = useState(null);
  const [creditsUsageWorkspace, setCreditsUsageWorkspace] = useState(null);
  const [personalCredits, setPersonalCredits] = useState(null);

  useEffect(() => {
    consumeDashboardSearchContext('workspace');
  }, []);

  // ------------------------------------------------------------------
  // Toast & confirm dialog
  // ------------------------------------------------------------------
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message: sanitizeUserFacingMessage(message), type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const openConfirmDialog = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
  }, []);

  // ------------------------------------------------------------------
  // Data layer
  // ------------------------------------------------------------------
  const {
    workspaces,
    setWorkspaces,
    invitations,
    setInvitations,
    loading,
    localAdditions,
    setLocalAdditions,
    members,
    invitees,
    membersLoading,
    loadWorkspaces,
    loadInvitations,
    loadContributorsForWorkspace
  } = useWorkspaceData({ currentUserId, authUser, authLoading });

  // ------------------------------------------------------------------
  // Derived / memoised values
  // ------------------------------------------------------------------
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

  const personalWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.type === 'personal'),
    [workspaces]
  );

  const myWorkspaces = useMemo(
    () => workspaces.filter(
      (workspace) => workspace.type === 'workspace' && String(workspace.userRole || '').toUpperCase() === 'OWNER'
    ),
    [workspaces]
  );

  const sharedWithMe = useMemo(
    () => workspaces.filter(
      (workspace) => workspace.type === 'workspace' && String(workspace.userRole || '').toUpperCase() !== 'OWNER'
    ),
    [workspaces]
  );

  // Flattened, most-recently-modified videos across every workspace/folder,
  // purely derived from data useWorkspaceData already loaded — no new API calls.
  const recentVideoEntries = useMemo(() => {
    const entries = [];

    workspaces.forEach((workspace) => {
      (workspace.videos || []).forEach((video) => {
        entries.push({ video, workspace, folder: null });
      });
      (workspace.folders || []).forEach((folder) => {
        (folder.videos || []).forEach((video) => {
          entries.push({ video, workspace, folder });
        });
      });
    });

    const getTimestamp = (entry) => {
      const raw = entry.video.lastModifiedAt || entry.video.lastEditedAt || entry.video.createdAt;
      const parsed = raw ? new Date(raw).getTime() : 0;
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return entries
      .sort((a, b) => getTimestamp(b) - getTimestamp(a))
      .slice(0, 24);
  }, [workspaces]);

  const totalAvailableCredits = useMemo(() => {
    const personal = Number(personalCredits ?? 0);
    const workspaceTotal = workspaces.reduce((sum, workspace) => {
      if (workspace.type !== 'workspace') return sum;
      return sum + Number(workspace.workspaceCredits ?? 0);
    }, 0);
    return personal + workspaceTotal;
  }, [personalCredits, workspaces]);

  useEffect(() => {
    let cancelled = false;

    creditsService.getPersonalBalance()
      .then((data) => {
        if (!cancelled) {
          setPersonalCredits(Number(data.personalCredits ?? 0));
        }
      })
      .catch((error) => {
        console.warn('Failed to load personal credits for workspace header:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------------
  // Actions layer
  // ------------------------------------------------------------------
  const {
    handleCreateWorkspace,
    handleCreateFolder,
    handleAcceptInvitation,
    handleDeclineInvitation,
    renameItem,
    handleRename,
    deleteItem,
    handleLeaveSharedWorkspace,
    handleManageWorkspace,
    handleAddInviteInput,
    handleUpdateInviteInput,
    handleRemoveInviteInput,
    handleSendInvites,
    inviteSending,
    handleChangeMemberRole,
    handleRemoveMember,
    handleMoveProject: handleMoveProjectAction
  } = useWorkspaceActions({
    workspaces,
    setWorkspaces,
    setInvitations,
    setLocalAdditions,
    localAdditions,
    currentUserId,
    authUser,
    activeWorkspace,
    activeFolder,
    currentLevel,
    setCurrentLevel,
    setRenameTarget,
    contributorsPanel,
    inviteInputs,
    setInviteInputs,
    setActiveMemberMenuId,
    setMoveTargetVideo,
    setMoveTargetWorkspace,
    setContributorsPanel,
    setShowAddContributors,
    showToast,
    openConfirmDialog,
    loadWorkspaces,
    loadContributorsForWorkspace
  });

  // Wrap handleCreateFolder to inject the currently selected workspace
  const handleCreateFolderForSelected = useCallback(
    (folderName) => handleCreateFolder(folderName, selectedWorkspaceForFolder),
    [handleCreateFolder, selectedWorkspaceForFolder]
  );

  // Wrap handleMoveProject to inject current move targets
  const handleMoveProject = useCallback(
    (targetFolderId) => handleMoveProjectAction(targetFolderId, moveTargetVideo, moveTargetWorkspace),
    [handleMoveProjectAction, moveTargetVideo, moveTargetWorkspace]
  );

  // ------------------------------------------------------------------
  // Session-storage sync effects
  // ------------------------------------------------------------------
  useEffect(() => {
    try {
      const serialized = {
        type: currentLevel.type,
        id: currentLevel.id,
        ws: currentLevel.ws
          ? { id: currentLevel.ws.id, name: currentLevel.ws.name, type: currentLevel.ws.type, userRole: currentLevel.ws.userRole }
          : null,
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

  // Restore view/sort preferences
  useEffect(() => {
    const savedView = localStorage.getItem('workspaceViewMode');
    const savedSort = localStorage.getItem('workspaceSortBy');
    if (savedView) setViewMode(savedView);
    if (savedSort) setSortBy(savedSort);
  }, []);

  // Sync resolved workspace/folder back to currentLevel once data is loaded
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
          return { ...prev, ws: resolvedWs, folder: resolvedFolder || prev.folder };
        });
      }
    }
  }, [workspaces, loading, currentLevel]);

  // Global event listeners for items created from elsewhere (e.g. CreateVideoModal)
  useEffect(() => {
    const onWorkspaceCreated = (event) => {
      const created = event.detail?.workspace;
      if (!created) return;
      const normalized = { ...normalizeWorkspace(created, currentUserId, authUser), userRole: 'OWNER', folders: [] };
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
              if ((folder.videos || []).some((v) => String(v.id) === String(normalizedVideo.id))) return folder;
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

  // ------------------------------------------------------------------
  // View/sort helpers
  // ------------------------------------------------------------------
  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('workspaceViewMode', mode);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    localStorage.setItem('workspaceSortBy', sort);
  };

  const sortItems = (items) =>
    [...items].sort((a, b) => {
      if (sortBy === 'name_asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (sortBy === 'name_desc') return String(b.name || '').localeCompare(String(a.name || ''));
      return 0;
    });

  const openCreateVideoModal = (context = {}) => {
    if (onCreate) onCreate(context);
  };

  const openLibraryItem = useCallback(
    (item, workspace, folder = null) => {
      const kind = resolveLibraryKind(item);
      const payload = {
        ...item,
        workspaceId: workspace.id,
        workspace: workspace.name,
        folderId: item.folderId || folder?.id || null,
        folder: folder?.name || item.folderName || item.folder?.name || '',
        type:
          item.type ||
          item.projectType ||
          (kind === 'presentation' ? 'PRESENTATION' : kind === 'video' ? 'VIDEO' : item.type),
        kind,
        category: kind,
      };

      if (kind === 'image') {
        onOpenImage?.(payload);
        return;
      }
      onEdit?.(payload);
    },
    [onEdit, onOpenImage]
  );

  const renderLibraryPanel = (workspace, folder = null) => {
    if (!workspace?.id) return null;
    const canEdit = workspaceCanEdit(workspace);
    const createCtx = {
      initialWorkspaceId: workspace.id,
      initialFolderId: folder?.id || null,
      workspaceId: workspace.id,
      folderId: folder?.id || null,
    };

    return (
      <WorkspaceLibrary
        workspace={workspace}
        folder={folder}
        viewMode={viewMode}
        sortItems={sortItems}
        onOpenItem={(item) => openLibraryItem(item, workspace, folder)}
        onCreateVideo={
          canEdit ? () => openCreateVideoModal(createCtx) : null
        }
        onCreatePresentation={
          canEdit
            ? () =>
                openCreateVideoModal({
                  ...createCtx,
                  preferredCreateOption: 'ppt-ai',
                })
            : null
        }
        onCreateImage={
          canEdit
            ? () =>
                openCreateVideoModal({
                  ...createCtx,
                  preferredCreateOption: 'image-ai',
                })
            : null
        }
        onDetails={(item) =>
          setDetailsTarget({
            type: resolveLibraryKind(item) === 'image' ? 'image' : 'video',
            item,
          })
        }
        onRename={(item) => renameItem('video', item.id, workspace)}
        onMove={(item) => {
          setMoveTargetVideo(item);
          setMoveTargetWorkspace(workspace);
        }}
        onDelete={(item) => deleteItem('video', item.id, workspace)}
      />
    );
  };

  const handleNavigateBack = useCallback(() => {
    if (currentLevel.type === 'folder' && activeWorkspace) {
      setCurrentLevel({ type: 'workspace', id: activeWorkspace.id, ws: activeWorkspace });
      return;
    }
    if (currentLevel.type === 'workspace') {
      setCurrentLevel({ type: 'root', id: null });
    }
  }, [currentLevel.type, activeWorkspace]);

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  const isOwnedTeamWorkspace = (workspace) =>
    workspace?.type === 'workspace' && String(workspace.userRole || '').toUpperCase() === 'OWNER';

  const handleOpenAllocateCredits = useCallback((workspace) => {
    setAllocateCreditsWorkspace(workspace);
  }, []);

  const handleOpenCreditsUsage = useCallback((workspace) => {
    setCreditsUsageWorkspace(workspace);
  }, []);

  const renderWorkspaceItems = (items, { allowAllocate = false, showCreateCard = false, onCreateWorkspace } = {}) => {
    const sorted = sortItems(items);
    const Component = viewMode === 'tile' ? WorkspaceCard : WorkspaceRow;
    const itemElements = sorted.map((workspace) => (
      <Component
        key={workspace.id}
        workspace={workspace}
        onClick={() => setCurrentLevel({ type: 'workspace', id: workspace.id, ws: workspace })}
        showAllocateCredits={allowAllocate && isOwnedTeamWorkspace(workspace)}
        onAllocateCredits={handleOpenAllocateCredits}
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'workspace', item: workspace }),
          onRename:
            String(workspace.userRole).toUpperCase() === 'OWNER'
              ? () => renameItem('workspace', workspace.id)
              : null,
          onMembers:
            workspace.type === 'workspace' && workspaceCanManageContributors(workspace)
              ? () => handleManageWorkspace(workspace)
              : null,
          showCreditsTransfer: allowAllocate && isOwnedTeamWorkspace(workspace),
          onCreditsTransfer: () => handleOpenAllocateCredits(workspace),
          showCreditsUsage: workspace.type === 'workspace',
          onCreditsUsage: () => handleOpenCreditsUsage(workspace),
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

    if (viewMode === 'tile' && showCreateCard && onCreateWorkspace) {
      return [
        <CreateWorkspaceCard key="create-workspace-tile" onClick={onCreateWorkspace} />,
        ...itemElements
      ];
    }

    return itemElements;
  };

  const renderFolderItems = (folders, workspace) => {
    const sorted = sortItems(folders);
    const Component = viewMode === 'tile' ? FolderCard : FolderRow;
    const canEdit = workspaceCanEdit(workspace);
    const itemElements = sorted.map((folder) => (
      <Component
        key={folder.id}
        folder={folder}
        onClick={() => setCurrentLevel({ type: 'folder', id: folder.id, folder, ws: workspace })}
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'folder', item: folder }),
          onRename: canEdit ? () => renameItem('folder', folder.id, workspace) : null,
          onDelete: canEdit ? () => deleteItem('folder', folder.id, workspace) : null
        }}
      />
    ));

    if (viewMode === 'tile' && canEdit) {
      return [
        <CreateFolderCard
          key="create-folder-tile"
          onClick={() => {
            setSelectedWorkspaceForFolder(workspace);
            setIsCreateFolderOpen(true);
          }}
        />,
        ...itemElements
      ];
    }

    return itemElements;
  };

  const renderVideoItems = (videos, workspace, folder = null) => {
    const sorted = sortItems(videos);
    const Component = viewMode === 'tile' ? VideoCard : VideoRow;
    const canEdit = workspaceCanEdit(workspace);
    const itemElements = sorted.map((video) => (
      <Component
        key={video.id}
        video={video}
        onClick={() =>
          onEdit &&
          onEdit({
            ...video,
            workspaceId: workspace.id,
            workspace: workspace.name,
            folderId: video.folderId || folder?.id || null,
            folder: folder?.name || video.folderName || video.folder?.name || ''
          })
        }
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'video', item: video }),
          onRename: canEdit ? () => renameItem('video', video.id, workspace) : null,
          onMove: canEdit
            ? () => { setMoveTargetVideo(video); setMoveTargetWorkspace(workspace); }
            : null,
          onDelete: canEdit ? () => deleteItem('video', video.id, workspace) : null
        }}
      />
    ));

    if (viewMode === 'tile' && canEdit) {
      return [
        <CreateVideoCard
          key="create-video-tile"
          onClick={() => openCreateVideoModal({ initialWorkspaceId: workspace.id, initialFolderId: folder?.id })}
        />,
        ...itemElements
      ];
    }

    return itemElements;
  };

  const renderRecentVideoItems = (entries) => {
    const Component = viewMode === 'tile' ? VideoCard : VideoRow;
    const itemElements = entries.map(({ video, workspace, folder }) => (
      <Component
        key={video.id}
        video={video}
        onClick={() =>
          onEdit &&
          onEdit({
            ...video,
            workspaceId: workspace.id,
            workspace: workspace.name,
            folderId: video.folderId || folder?.id || null,
            folder: folder?.name || video.folderName || video.folder?.name || ''
          })
        }
        contextProps={{
          onDetails: () => setDetailsTarget({ type: 'video', item: video }),
          onRename: workspaceCanEdit(workspace) ? () => renameItem('video', video.id, workspace) : null,
          onMove: workspaceCanEdit(workspace)
            ? () => { setMoveTargetVideo(video); setMoveTargetWorkspace(workspace); }
            : null,
          onDelete: workspaceCanEdit(workspace) ? () => deleteItem('video', video.id, workspace) : null
        }}
      />
    ));

    if (viewMode === 'tile') {
      return [
        <CreateVideoCard
          key="create-recent-video-tile"
          onClick={() => openCreateVideoModal()}
        />,
        ...itemElements
      ];
    }

    return itemElements;
  };

  // ------------------------------------------------------------------
  // Level renderers
  // ------------------------------------------------------------------
  const renderRoot = () => (
    <div>
      <div className="workspace-root-tabs-wrapper">
        <div className="workspace-root-tabs">
          <button
            className={`workspace-root-tab ${activeRootTab === 'recents' ? 'active' : ''}`}
            onClick={() => setActiveRootTab('recents')}
          >
            <MdHistory size={18} /> Recents
            <span className="tab-count-badge">{recentVideoEntries.length}</span>
          </button>
          <button
            className={`workspace-root-tab ${activeRootTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveRootTab('workspace')}
          >
            <MdWorkspaces size={18} /> Workspace
            <span className="tab-count-badge">
              {(personalWorkspace ? 1 : 0) + myWorkspaces.length + sharedWithMe.length}
            </span>
          </button>
        </div>
      </div>

      {activeRootTab === 'recents' && (
        <WorkspaceSection
          title="Recents"
          count={recentVideoEntries.length}
          viewMode={viewMode}
          listClassName="project-list-view"
          emptyMessage="No recent videos yet."
          emptyIcon={MdHistory}
          showHeader={false}
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
          {renderRecentVideoItems(recentVideoEntries)}
        </WorkspaceSection>
      )}

      {activeRootTab === 'workspace' && (
        <>
          <WorkspaceSection title="Personal Workspace" count={personalWorkspace ? 1 : 0} viewMode={viewMode} showCountBadge={false}>
            {personalWorkspace && renderWorkspaceItems([personalWorkspace])}
          </WorkspaceSection>

          <WorkspaceSection
            title="My Workspaces"
            count={myWorkspaces.length}
            viewMode={viewMode}
            emptyMessage="You do not have any custom workspaces yet."
            emptyActionLabel="Create your first workspace"
            emptyActionIcon={MdWorkspaces}
            emptyActionClass="workspace-create-action-btn"
            onEmptyAction={() => setIsCreateWorkspaceOpen(true)}
            showCreateButton={viewMode === 'list'}
            createButtonLabel="New Workspace"
            createButtonIcon={MdWorkspaces}
            createButtonClass="workspace-create-action-btn"
            onCreateClick={() => setIsCreateWorkspaceOpen(true)}
          >
            {viewMode === 'list' && (
              <div className="list-header">
                <div className="col" />
                <div className="col">Name</div>
                <div className="col">Credits</div>
                <div className="col">Owner</div>
                <div className="col">Date modified</div>
                <div className="col">Members</div>
                <div className="col" />
              </div>
            )}
            {renderWorkspaceItems(myWorkspaces, {
              allowAllocate: true,
              showCreateCard: true,
              onCreateWorkspace: () => setIsCreateWorkspaceOpen(true)
            })}
          </WorkspaceSection>

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
                <div className="col">Credits</div>
                <div className="col">Owner</div>
                <div className="col">Date modified</div>
                <div className="col">Members</div>
                <div className="col" />
              </div>
            )}
            {renderWorkspaceItems(sharedWithMe)}
          </WorkspaceSection>
        </>
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
        <div className="workspace-breadcrumbs workspace-breadcrumbs--with-storage">
          <div className="workspace-breadcrumbs__trail">
            <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>
              Workspaces
            </span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span>{workspace.name}</span>
          </div>
          <WorkspaceStorageBreadcrumb workspaceId={workspace.id} />
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
          emptyActionLabel="Create your first folder"
          emptyActionIcon={MdCreateNewFolder}
          emptyActionClass="workspace-create-action-btn"
          onEmptyAction={
            canEdit
              ? () => { setSelectedWorkspaceForFolder(workspace); setIsCreateFolderOpen(true); }
              : null
          }
          showCreateButton={canEdit && viewMode === 'list'}
          createButtonLabel="New Folder"
          createButtonIcon={MdCreateNewFolder}
          createButtonClass="workspace-create-action-btn"
          onCreateClick={() => { setSelectedWorkspaceForFolder(workspace); setIsCreateFolderOpen(true); }}
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16 }}
          >
            <MdExitToApp size={16} /> Leave Workspace
          </button>
        )}

        <CreateFolderModal
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={handleCreateFolderForSelected}
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
        <div className="workspace-breadcrumbs workspace-breadcrumbs--with-storage">
          <div className="workspace-breadcrumbs__trail">
            <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>
              Workspaces
            </span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span
              className="breadcrumb-link"
              onClick={() => setCurrentLevel({ type: 'workspace', id: workspace.id, ws: workspace })}
            >
              {workspace.name}
            </span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span>{folder.name}</span>
          </div>
          <WorkspaceStorageBreadcrumb workspaceId={workspace.id} />
        </div>

        {!canEdit && (
          <div className="workspace-permission-note" style={{ marginBottom: 16 }}>
            <MdInfo size={18} />
            <span>You have {role} access. Creating content is disabled in this workspace.</span>
          </div>
        )}

        {renderLibraryPanel(workspace, folder)}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------------
  return (
    <div className="team-workspace-container">
      <WorkspaceHeader
        viewMode={viewMode}
        onViewChange={handleViewChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onCreateClick={() => openCreateVideoModal()}
        invitationCount={invitations.length}
        onInviteClick={() => setShowNotifications(true)}
        totalCredits={totalAvailableCredits}
        creditsLoading={personalCredits === null}
        showBack={currentLevel.type !== 'root'}
        onBack={handleNavigateBack}
        backLabel={
          currentLevel.type === 'folder'
            ? `Back to ${activeWorkspace?.name || 'workspace'}`
            : 'Back to workspaces'
        }
      />

      <div className="workspace-content-area" style={{ flex: 1 }}>
        {loading && workspaces.length === 0 ? (
          <TeamWorkspaceSkeleton viewMode={viewMode} activeRootTab={activeRootTab} />
        ) : (
          <>
            {currentLevel.type === 'root' && renderRoot()}
            {currentLevel.type === 'workspace' && renderWorkspaceLevel()}
            {currentLevel.type === 'folder' && renderFolderLevel()}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onCreate={async (params) => {
          await handleCreateWorkspace(params);
          setActiveRootTab('workspace');
        }}
        workspaces={workspaces}
      />

      <RenameModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={(newName) => handleRename(newName, renameTarget)}
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
        currentFolderId={
          moveTargetVideo?.folderId ||
          (moveTargetVideo?.folder && (moveTargetVideo.folder.id || moveTargetVideo.folder._id)) ||
          null
        }
        videoTitle={moveTargetVideo?.name || moveTargetVideo?.title || ''}
      />

      <AllocateCreditsModal
        isOpen={!!allocateCreditsWorkspace}
        workspace={allocateCreditsWorkspace}
        onClose={() => setAllocateCreditsWorkspace(null)}
        onSuccess={({ workspaceId, amount, mode, personalCredits: nextPersonal }) => {
          const workspaceName = allocateCreditsWorkspace?.name || 'workspace'
          const message =
            mode === 'deallocate'
              ? `Returned ${amount.toLocaleString()} credits from ${workspaceName} to your personal balance.`
              : `Allocated ${amount.toLocaleString()} credits to ${workspaceName}.`
          showToast(message)
          if (nextPersonal != null) {
            setPersonalCredits(Number(nextPersonal));
          }
          setWorkspaces((prev) =>
            prev.map((ws) =>
              String(ws.id) === String(workspaceId)
                ? {
                    ...ws,
                    workspaceCredits:
                      (Number(ws.workspaceCredits) || 0) + (mode === 'deallocate' ? -amount : amount),
                  }
                : ws
            )
          )
        }}
      />

      <WorkspaceCreditsUsageModal
        isOpen={!!creditsUsageWorkspace}
        workspace={creditsUsageWorkspace}
        onClose={() => setCreditsUsageWorkspace(null)}
      />

      {/* Panels */}
      <InvitationsPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        invitations={invitations}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
      />

      <ContributorsPanel
        open={contributorsPanel.open}
        workspace={contributorsPanel.workspace}
        onClose={() => setContributorsPanel({ open: false, workspace: null })}
        members={members}
        invitees={invitees}
        membersLoading={membersLoading}
        showAddContributors={showAddContributors}
        setShowAddContributors={setShowAddContributors}
        inviteInputs={inviteInputs}
        activeMemberMenuId={activeMemberMenuId}
        setActiveMemberMenuId={setActiveMemberMenuId}
        onAddInput={handleAddInviteInput}
        onUpdateInput={handleUpdateInviteInput}
        onRemoveInput={handleRemoveInviteInput}
        onSendInvites={handleSendInvites}
        inviteSending={inviteSending}
        onChangeMemberRole={handleChangeMemberRole}
        onRemoveMember={handleRemoveMember}
        loadContributors={loadContributorsForWorkspace}
      />

      <ConfirmDialog
        dialog={confirmDialog}
        onCancel={() => setConfirmDialog(null)}
      />

      <Toast toast={toast} />
    </div>
  );
};

export default TeamWorkspace;
