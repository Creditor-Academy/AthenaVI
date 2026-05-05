import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMail, MdClose, MdCheck, MdAdd, MdFolderOpen, MdVideoLibrary } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceHeader from '../../components/features/workspace/workspace/WorkspaceHeader.jsx';
import WorkspaceSection from '../../components/features/workspace/workspace/WorkspaceSection.jsx';
import { WorkspaceCard, FolderCard, VideoCard } from '../../components/features/workspace/workspace/ViewCards.jsx';
import { WorkspaceRow, FolderRow, VideoRow } from '../../components/features/workspace/workspace/ViewRows.jsx';
import CreateWorkspaceModal from '../../components/features/workspace/workspace/CreateWorkspaceModal.jsx';
import CreateFolderModal from '../../components/features/workspace/workspace/CreateFolderModal.jsx';
import RenameModal from '../../components/features/workspace/workspace/RenameModal.jsx';
import workspaceService from '../../services/workspaceService.js';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';

/** Stable string id for API comparisons (handles nested { id, _id }). */
function normalizeUserId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    return String(value.id || value._id || value.userId || value.user_id || value.sub || '');
  }
  return String(value);
}

/** Extract user ID from an auth user object, trying all common field names. */
function extractUserId(userObj) {
  if (!userObj) return '';
  return normalizeUserId(
    userObj.id || userObj._id || userObj.userId || userObj.user_id || userObj.sub || ''
  );
}

function memberRoleIsOwner(role) {
  return String(role ?? '').toUpperCase() === 'OWNER';
}

function sameWorkspaceId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

/** Collect ALL role values from a workspace object and check if any is OWNER. */
function detectOwnerRole(ws) {
  const candidates = [
    ws.role, ws.userRole, ws.membershipRole, ws.myRole,
    ws.memberRole, ws.currentUserRole, ws.membership?.role,
    ws.access?.role, ws.permission
  ].filter(Boolean).map(r => String(r).toUpperCase());
  return candidates.includes('OWNER');
}

/** Get the best non-OWNER role from workspace fields. */
function detectNonOwnerRole(ws) {
  const candidates = [
    ws.role, ws.userRole, ws.membershipRole, ws.myRole,
    ws.memberRole, ws.currentUserRole, ws.membership?.role
  ].filter(Boolean).map(r => String(r).toUpperCase());
  if (candidates.includes('ADMIN')) return 'ADMIN';
  return 'MEMBER';
}

const TeamWorkspace = ({ onCreate }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const user = authUser ?? { id: '', name: 'Guest', email: '', plan: 'free' };
  const userPlan = user.plan || 'free';

  // Global State
  const [workspaces, setWorkspaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLevel, setCurrentLevel] = useState({ type: 'root', id: null });

  // UI State
  const [viewMode, setViewMode] = useState('tile');
  const [sortBy, setSortBy] = useState('name_asc');
  const [activeRootTab, setActiveRootTab] = useState('my-workspaces');

  // Modals Data
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedWorkspaceForFolder, setSelectedWorkspaceForFolder] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // { type, id, name }

  // Local Session Persistence (to keep items across navigation)
  const [localAdditions, setLocalAdditions] = useState(() => {
    const saved = sessionStorage.getItem('workspaceLocalAdditions');
    return saved ? JSON.parse(saved) : { workspaces: [], folders: {}, videos: {} };
  });

  useEffect(() => {
    sessionStorage.setItem('workspaceLocalAdditions', JSON.stringify(localAdditions));
  }, [localAdditions]);

  // Initial load: wait for auth so ownership matches the real user (not a placeholder id).
  useEffect(() => {
    const savedView = localStorage.getItem('workspaceViewMode');
    const savedSort = localStorage.getItem('workspaceSortBy');
    if (savedView) setViewMode(savedView);
    if (savedSort) setSortBy(savedSort);

    if (authLoading) return;

    loadWorkspaces();
    loadInvitations();
    // Intentionally omit loadWorkspaces/loadInvitations — they close over latest auth user each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when user id is known or auth finishes
  }, [authLoading, authUser?.id, authUser?._id]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const workspaceList = await workspaceService.listWorkspaces();
      console.log('Raw workspace list from API:', workspaceList);

      const currentUserId = extractUserId(authUser);

      if (!currentUserId) {
        console.warn('[TeamWorkspace] Could not extract user ID from authUser. authUser keys:', authUser ? Object.keys(authUser) : 'null', 'authUser:', JSON.stringify(authUser));
      }

      // Map API workspaces to local shape and fetch folders for each
      const mappedWorkspaces = await Promise.all(workspaceList.map(async (ws) => {
        const wsOwnerId = normalizeUserId(
          ws.ownerId ||
            ws.ownerUserId ||
            ws.owner_id ||
            ws.owner?.id ||
            ws.owner?._id ||
            ws.owner
        );
        const isPrivate = ws.type === 'PRIVATE';

        // Check ALL role fields — don't use || chain which stops at first truthy value
        const isOwnerByApiRole = detectOwnerRole(ws);

        const createdById = normalizeUserId(
          ws.createdBy || ws.createdById || ws.creatorId || ws.creator?.id || ws.creator?._id
        );
        const isCreator = Boolean(currentUserId && createdById && createdById === currentUserId);

        const ownerInMembers = Array.isArray(ws.members) && ws.members.some(m => {
          const memberId = normalizeUserId(
            m.userId || m.user?.id || m.user?._id || m.user || m.id || m._id
          );
          return memberId === currentUserId && memberRoleIsOwner(m.role);
        });
        const isOwner =
          isPrivate ||
          isOwnerByApiRole ||
          (Boolean(currentUserId) && wsOwnerId === currentUserId) ||
          ownerInMembers ||
          isCreator;
        
        // Fetch folders for this workspace
        let folders = [];
        try {
          folders = await workspaceService.listFolders(ws.id || ws._id);
        } catch (error) {
          console.error(`Failed to fetch folders for workspace ${ws.name}:`, error);
          folders = [];
        }
        
        console.log('Workspace ownership check:', {
          wsName: ws.name,
          wsOwnerId,
          currentUserId,
          isPrivate,
          isOwnerByApiRole,
          ownerInMembers,
          isCreator,
          isOwner,
          foldersCount: folders.length,
          rawKeys: Object.keys(ws)
        });

        return {
          id: ws.id || ws._id,
          name: ws.name,
          type: isPrivate ? 'personal' : 'workspace',
          ownerId: wsOwnerId || (isOwner ? currentUserId : ''),
          members: ws.members || [],
          folders: folders || [],
          userRole: isOwner ? 'OWNER' : detectNonOwnerRole(ws)
        };
      }));
      
      console.log('Mapped workspaces:', mappedWorkspaces);
      console.log('Current user ID:', currentUserId);

      // Workspaces created in this session: API list may omit owner/role; keep them under "My Workspaces"
      const mappedWithLocalOwner = mappedWorkspaces.map((ws) => {
        const localMeta = localAdditions.workspaces.find(
          (l) => sameWorkspaceId(l.id, ws.id) && l.createdByCurrentUser
        );
        if (!localMeta) return ws;
        const oid = normalizeUserId(
          localMeta.ownerId || extractUserId(authUser) || ws.ownerId
        );
        return {
          ...ws,
          type: 'workspace',
          userRole: 'OWNER',
          ownerId: oid || ws.ownerId
        };
      });

      // Ensure there's a personal workspace if API didn't return one
      if (!mappedWithLocalOwner.find(w => w.type === 'personal')) {
        mappedWithLocalOwner.unshift({
          id: 'personal-default',
          name: 'My Personal Space',
          type: 'personal',
          ownerId: 'user-1',
          members: [],
          folders: [],
          userRole: 'OWNER'
        });
      }

      // Merge with local additions
      let allWorkspaces = [...mappedWithLocalOwner];
      
      // Add locally created workspaces
      localAdditions.workspaces.forEach(localWS => {
        if (!allWorkspaces.find(ws => sameWorkspaceId(ws.id, localWS.id))) {
          allWorkspaces.push({
            ...localWS,
            folders: localWS.folders || [],
            userRole: 'OWNER'
          });
        }
      });

      // Inject local folders and videos
      allWorkspaces = allWorkspaces.map(ws => {
        const localFolders = localAdditions.folders[ws.id] || [];
        const existingFolders = Array.isArray(ws.folders) && ws.folders.length > 0 && ws.folders[0].id !== 'f-1' 
          ? ws.folders 
          : [];
        
        let mergedFolders = [...existingFolders, ...localFolders];

        // Also inject local videos into these folders
        mergedFolders = mergedFolders.map(f => {
          const localVideos = localAdditions.videos[f.id] || [];
          return {
            ...f,
            videos: [...(f.videos || []), ...localVideos]
          };
        });
        
        return {
          ...ws,
          folders: mergedFolders
        };
      });

      setWorkspaces(allWorkspaces);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      // Fallback to mock state if API fails
      setWorkspaces([
        {
          id: 'personal-fallback',
          name: 'My Personal Space',
          type: 'personal',
          ownerId: 'user-1',
          members: [],
          folders: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      if (typeof workspaceService.getInvitations === 'function') {
        const invs = await workspaceService.getInvitations();
        setInvitations(invs || []);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setInvitations([]);
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

  const currentUserId = extractUserId(user);
  const personalWorkspace = workspaces.find(w => w.type === 'personal');
  const isWorkspaceOwner = (w) =>
    memberRoleIsOwner(w.userRole) || (Boolean(currentUserId) && normalizeUserId(w.ownerId) === currentUserId);

  const myWorkspaces = workspaces.filter(
    (w) => w.type === 'workspace'
  );
  const sharedWithMe = [];

  // Debug logging for filtering
  useEffect(() => {
    if (workspaces.length > 0) {
      console.log('Filtering debug:', {
        userId: user.id,
        workspaces: workspaces.map(w => ({ id: w.id, name: w.name, ownerId: w.ownerId, userRole: w.userRole }))
      });
    }
  }, [workspaces, user.id]);

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });
  };

  // Mutators
  const handleCreateWorkspace = async ({ name, invites }) => {
    try {
      setLoading(true);
      const newWorkspace = await workspaceService.createWorkspace(name);

      const mappedNew = {
        id: newWorkspace.id || newWorkspace._id,
        name: newWorkspace.name,
        type: 'workspace',
        ownerId: extractUserId(user),
        members: [],
        folders: [],
        userRole: 'OWNER'
      };

      setWorkspaces([...workspaces, mappedNew]);

      setLocalAdditions((prev) => ({
        ...prev,
        workspaces: [
          ...prev.workspaces.filter((w) => !sameWorkspaceId(w.id, mappedNew.id)),
          { ...mappedNew, createdByCurrentUser: true }
        ]
      }));

      // Invite members
      if (invites && invites.length > 0) {
        for (const email of invites) {
          try {
            await workspaceService.inviteMember(newWorkspace.id, { email, role: 'MEMBER' });
          } catch (e) {
            console.error(`Failed to invite ${email}`, e);
          }
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    if (!selectedWorkspaceForFolder) {
      throw new Error('No workspace selected for folder creation');
    }

    // Validation: Check for duplicate folder name in current workspace
    const existingWS = workspaces.find(w => w.id === selectedWorkspaceForFolder.id);
    const isDuplicate = existingWS?.folders?.some(f => f.name.toLowerCase() === folderName.toLowerCase());
    
    if (isDuplicate) {
      throw new Error(`A folder named "${folderName}" already exists in this workspace.`);
    }

    try {
      // Call the backend API to create folder
      await workspaceService.createFolder(selectedWorkspaceForFolder.id, folderName);
      
      // Refresh workspaces to get updated folder list
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await workspaceService.acceptInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      loadWorkspaces(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      if (typeof workspaceService.removeInvitation === 'function') {
        // Placeholder params - service doesn't specify how to fetch workspaceId from invitation easily here
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renameItem = (type, id) => {
    let currentName = '';
    if (type === 'workspace') {
      currentName = workspaces.find(w => w.id === id)?.name || '';
    } else if (type === 'folder') {
      currentName = workspaces.flatMap(w => w.folders).find(f => f.id === id)?.name || '';
    } else if (type === 'video') {
      currentName = workspaces.flatMap(w => w.folders).flatMap(f => f.videos || []).find(v => v.id === id)?.name || '';
    }
    setRenameTarget({ type, id, name: currentName });
  };

  const handleRename = async (newName) => {
    if (!renameTarget) return;
    const { type, id } = renameTarget;

    if (type === 'workspace') {
      await workspaceService.updateWorkspace(id, { name: newName });
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    } else if (type === 'folder') {
      const parentWsId = currentLevel.ws?.id || workspaces.find(w => w.folders.some(f => f.id === id))?.id;
      if (parentWsId && !id.startsWith('f-local-')) {
        await workspaceService.renameFolder(parentWsId, id, newName);
      }
      setWorkspaces(prev => prev.map(w => ({
        ...w,
        folders: w.folders.map(f => f.id === id ? { ...f, name: newName } : f)
      })));
    } else if (type === 'video') {
      const parentWsId = currentLevel.ws?.id;
      if (parentWsId && !id.startsWith('v-local-')) {
        await workspaceService.renameVideo(parentWsId, id, newName);
      }
      setWorkspaces(prev => prev.map(w => ({
        ...w,
        folders: w.folders.map(f => ({
          ...f,
          videos: (f.videos || []).map(v => v.id === id ? { ...v, name: newName } : v)
        }))
      })));
    }
  };

  const deleteItem = async (type, id) => {
    if (type === 'workspace') {
      try {
        if (!id.startsWith('ws-local-')) {
          await workspaceService.deleteWorkspace(id);
        }
        setWorkspaces(workspaces.filter(w => w.id !== id));
        // Remove from local if exists
        setLocalAdditions(prev => ({
          ...prev,
          workspaces: prev.workspaces.filter(w => !sameWorkspaceId(w.id, id))
        }));
        if (currentLevel.id === id) setCurrentLevel({ type: 'root', id: null });
      } catch (err) {
        console.error('API Delete Failed:', err);
        // If it fails with 404, maybe it's just not in the DB, so we still remove locally
        setWorkspaces(workspaces.filter(w => w.id !== id));
        if (currentLevel.id === id) setCurrentLevel({ type: 'root', id: null });
      }
    } else if (type === 'folder') {
      const parentWsId = currentLevel.ws?.id || workspaces.find(w => w.folders.some(f => f.id === id))?.id;
      
      try {
        // Call backend API to delete folder if it's not a local folder
        if (parentWsId && !id.startsWith('f-local-')) {
          await workspaceService.deleteFolder(parentWsId, id);
        }
      } catch (error) {
        console.error('Failed to delete folder:', error);
        // Continue with local state update even if API fails
      }
      
      setLocalAdditions(prev => {
        const newFolders = { ...prev.folders };
        if (parentWsId && newFolders[parentWsId]) {
          newFolders[parentWsId] = newFolders[parentWsId].filter(f => f.id !== id);
        }
        return { ...prev, folders: newFolders };
      });

      setWorkspaces(prev => prev.map(w => {
        if (w.id === parentWsId) {
          return { ...w, folders: w.folders.filter(f => f.id !== id) };
        }
        return w;
      }));

      if (currentLevel.id === id) {
        setCurrentLevel({ type: 'workspace', id: parentWsId, ws: currentLevel.ws });
      }
    } else if (type === 'video') {
      const parentFolderId = currentLevel.folder?.id || workspaces.flatMap(w => w.folders).find(f => f.videos.some(v => v.id === id))?.id;
      const parentWsId = currentLevel.ws?.id;

      setLocalAdditions(prev => {
        const newVideos = { ...prev.videos };
        if (parentFolderId && newVideos[parentFolderId]) {
          newVideos[parentFolderId] = newVideos[parentFolderId].filter(v => v.id !== id);
        }
        return { ...prev, videos: newVideos };
      });

      setWorkspaces(prev => prev.map(w => {
        if (w.id === parentWsId) {
          return {
            ...w,
            folders: w.folders.map(f => {
              if (f.id === parentFolderId) {
                return { ...f, videos: f.videos.filter(v => v.id !== id) };
              }
              return f;
            })
          };
        }
        return w;
      }));
    }
  };

  // Render Helpers
  const renderWorkspaceItems = (items) => {
    const sorted = sortItems(items);
    if (viewMode === 'tile') {
      return sorted.map(ws => (
        <WorkspaceCard
          key={ws.id}
          workspace={ws}
          onClick={() => setCurrentLevel({ type: 'workspace', id: ws.id, ws })}
          contextProps={{
            onRename: () => renameItem('workspace', ws.id),
            onAddMembers: ws.type === 'workspace' ? () => alert('Add Members Modal') : null,
            onDelete: ws.type !== 'personal' ? () => deleteItem('workspace', ws.id) : null
          }}
        />
      ));
    }
    return sorted.map(ws => (
      <WorkspaceRow
        key={ws.id}
        workspace={ws}
        onClick={() => setCurrentLevel({ type: 'workspace', id: ws.id, ws })}
        contextProps={{
          onRename: () => renameItem('workspace', ws.id),
          onAddMembers: ws.type === 'workspace' ? () => alert('Add Members Modal') : null,
          onDelete: ws.type !== 'personal' ? () => deleteItem('workspace', ws.id) : null
        }}
      />
    ));
  };

  const renderFolderItems = (folders) => {
    const sorted = sortItems(folders);
    if (viewMode === 'tile') {
      return sorted.map(f => (
        <FolderCard
          key={f.id}
          folder={f}
          onClick={() => setCurrentLevel({ type: 'folder', id: f.id, folder: f, ws: currentLevel.ws })}
          contextProps={{
            onRename: () => renameItem('folder', f.id),
            onDelete: () => deleteItem('folder', f.id)
          }}
        />
      ));
    }
    return sorted.map(f => (
      <FolderRow
        key={f.id}
        folder={f}
        onClick={() => setCurrentLevel({ type: 'folder', id: f.id, folder: f, ws: currentLevel.ws })}
        contextProps={{
          onRename: () => renameItem('folder', f.id),
          onDelete: () => deleteItem('folder', f.id)
        }}
      />
    ));
  };

  const renderVideoItems = (videos) => {
    const sorted = sortItems(videos);
    if (viewMode === 'tile') {
      return sorted.map(v => (
        <VideoCard
          key={v.id}
          video={v}
          onClick={() => alert(`Play video ${v.name}`)}
          contextProps={{
            onRename: () => renameItem('video', v.id),
            onDelete: () => deleteItem('video', v.id)
          }}
        />
      ));
    }
    return sorted.map(v => (
      <VideoRow
        key={v.id}
        video={v}
        onClick={() => alert(`Play video ${v.name}`)}
        contextProps={{
          onRename: () => renameItem('video', v.id),
          onDelete: () => deleteItem('video', v.id)
        }}
      />
    ));
  };

  const renderRoot = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <WorkspaceSection
        title="Personal Workspace"
        count={personalWorkspace ? 1 : 0}
        viewMode={viewMode}
      >
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
          emptyMessage="You don't have any custom workspaces yet."
          emptyActionLabel="Create Workspace"
          onEmptyAction={() => setIsCreateWorkspaceOpen(true)}
          showCreateButton={true}
          onCreateClick={() => setIsCreateWorkspaceOpen(true)}
        >
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
          {renderWorkspaceItems(sharedWithMe)}
        </WorkspaceSection>
      )}
    </motion.div>
  );

  const renderWorkspaceLevel = () => {
    const ws = workspaces.find(w => w.id === currentLevel.ws?.id);
    if (!ws) return null;

    return (
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <div className="workspace-breadcrumbs">
          <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>Workspaces</span>
          <span className="breadcrumb-separator">/</span>
          <span>{ws.name}</span>
        </div>
        <WorkspaceSection
          title="Folders"
          count={ws.folders.length}
          viewMode={viewMode}
          emptyMessage="No folder exist"
          emptyIcon={MdFolderOpen}
          emptyActionLabel="Create Folder"
          onEmptyAction={() => {
            setSelectedWorkspaceForFolder(ws);
            setIsCreateFolderOpen(true);
          }}
          showCreateButton={true}
          createButtonLabel="Create Folder"
          onCreateClick={() => {
            setSelectedWorkspaceForFolder(ws);
            setIsCreateFolderOpen(true);
          }}
        >
          {renderFolderItems(ws.folders)}
        </WorkspaceSection>
        
        <CreateFolderModal 
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={handleCreateFolder}
          existingFolders={selectedWorkspaceForFolder?.folders || []}
        />
      </motion.div>
    );
  };

  const renderFolderLevel = () => {
    const ws = workspaces.find(w => w.id === currentLevel.ws?.id);
    const folder = ws?.folders.find(f => f.id === currentLevel.folder?.id);
    if (!ws || !folder) return null;

    return (
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <div className="workspace-breadcrumbs">
          <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'root', id: null })}>Workspaces</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link" onClick={() => setCurrentLevel({ type: 'workspace', id: ws.id, ws })}>{ws.name}</span>
          <span className="breadcrumb-separator">/</span>
          <span>{folder.name}</span>
        </div>
        <WorkspaceSection
          title="Videos"
          count={folder.videos.length}
          viewMode={viewMode}
          emptyMessage="No video exist"
          emptyIcon={MdVideoLibrary}
          emptyActionLabel="Create Video"
          onEmptyAction={() => onCreate && onCreate()}
          showCreateButton={true}
          onCreateClick={() => onCreate && onCreate()}
        >
          {renderVideoItems(folder.videos)}
        </WorkspaceSection>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="team-workspace-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <WorkspaceHeader
        viewMode={viewMode}
        onViewChange={handleViewChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onCreateClick={() => onCreate && onCreate()}
        invitationCount={invitations.length}
        onInviteClick={() => setShowNotifications(true)}
      />

      <div className="workspace-content-area" style={{ flex: 1 }}>
        {loading && workspaces.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading workspaces...</p>
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

      {/* Notifications Panel Restored */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="notifications-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              className="notifications-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              style={{ width: '400px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', height: '100vh', padding: '24px', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MdMail /> Invitations</h2>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><MdClose size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {invitations.length > 0 ? (
                  invitations.map(inv => (
                    <div key={inv.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', marginBottom: '12px', background: 'var(--bg-card)' }}>
                      <h4 style={{ margin: '0 0 4px 0' }}>{inv.workspaceName}</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Invited by {inv.invitedBy} • Role: {inv.role}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAcceptInvitation(inv.id)} style={{ padding: '6px 12px', background: 'var(--success-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: 1 }}><MdCheck /> Accept</button>
                        <button onClick={() => handleDeclineInvitation(inv.id)} style={{ padding: '6px 12px', background: 'var(--bg-surface)', color: 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: 1 }}><MdClose /> Decline</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No pending invitations</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default TeamWorkspace;
