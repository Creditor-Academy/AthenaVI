import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMail, MdClose, MdCheck, MdAdd, MdFolderOpen, MdVideoLibrary } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader.jsx';
import WorkspaceSection from '../components/workspace/WorkspaceSection.jsx';
import { WorkspaceCard, FolderCard, VideoCard } from '../components/workspace/ViewCards.jsx';
import { WorkspaceRow, FolderRow, VideoRow } from '../components/workspace/ViewRows.jsx';
import CreateWorkspaceModal from '../components/workspace/CreateWorkspaceModal.jsx';
import CreateFolderModal from '../components/workspace/CreateFolderModal.jsx';
import GlobalCreateModal from '../components/workspace/GlobalCreateModal.jsx';
import workspaceService from '../services/workspaceService.js';
import '../components/workspace/WorkspaceStyles.css';

const MOCK_FOLDERS = [
  {
    id: 'f-1',
    name: 'Drafts',
    createdBy: 'You',
    videos: [
      { id: 'v-1', name: 'Welcome Video', lastEditedBy: 'You', lastEditedAt: '2026-03-25' }
    ]
  }
];

const TeamWorkspace = () => {
  const auth = useAuth() || {};
  // Use a more distinct fallback ID to make debugging easier if auth fails
  const user = auth.user || { id: 'no-auth-id', name: 'Guest', email: '', plan: 'free' };
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

  // Modals Data
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedWorkspaceForFolder, setSelectedWorkspaceForFolder] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Local Session Persistence (to keep items across navigation)
  const [localAdditions, setLocalAdditions] = useState(() => {
    const saved = sessionStorage.getItem('workspaceLocalAdditions');
    return saved ? JSON.parse(saved) : { workspaces: [], folders: {}, videos: {} };
  });

  useEffect(() => {
    sessionStorage.setItem('workspaceLocalAdditions', JSON.stringify(localAdditions));
  }, [localAdditions]);

  // Initial Load
  useEffect(() => {
    const savedView = localStorage.getItem('workspaceViewMode');
    const savedSort = localStorage.getItem('workspaceSortBy');
    if (savedView) setViewMode(savedView);
    if (savedSort) setSortBy(savedSort);

    loadWorkspaces();
    loadInvitations();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const workspaceList = await workspaceService.listWorkspaces();
      console.log('Raw workspace list from API:', workspaceList);

      // Map API workspaces to local shape and inject mock folders/videos as requested
      const mappedWorkspaces = workspaceList.map(ws => ({
        id: ws.id,
        name: ws.name,
        type: ws.type === 'PRIVATE' ? 'personal' : 'workspace',
        ownerId: ws.ownerId || ws.owner?.id || user.id,
        members: ws.members || [],
        folders: ws.folders && ws.folders.length > 0 ? ws.folders : MOCK_FOLDERS,
        userRole: ws.ownerId === user.id || ws.owner?.id === user.id || ws.type === 'PRIVATE' ? 'OWNER' : 'MEMBER'
      }));
      
      console.log('Mapped workspaces:', mappedWorkspaces);
      console.log('Current user ID:', user.id);

      // Ensure there's a personal workspace if API didn't return one
      if (!mappedWorkspaces.find(w => w.type === 'personal')) {
        mappedWorkspaces.unshift({
          id: 'personal-default',
          name: 'My Personal Space',
          type: 'personal',
          ownerId: 'user-1',
          members: [],
          folders: MOCK_FOLDERS,
          userRole: 'OWNER'
        });
      }

      // Merge with local additions
      let allWorkspaces = [...mappedWorkspaces];
      
      // Add locally created workspaces
      localAdditions.workspaces.forEach(localWS => {
        if (!allWorkspaces.find(ws => ws.id === localWS.id)) {
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
          folders: mergedFolders.length > 0 ? mergedFolders : MOCK_FOLDERS
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
          folders: MOCK_FOLDERS
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

  // Sections Filtering (Owner mapping depends on logic, defaulting to userRole logic)
  const personalWorkspace = workspaces.find(w => w.type === 'personal');
  const myWorkspaces = workspaces.filter(w => 
    w.type === 'workspace' && 
    (w.userRole === 'OWNER' || w.ownerId === user.id)
  );
  const sharedWithMe = workspaces.filter(w => 
    w.type === 'workspace' && 
    w.userRole !== 'OWNER' && 
    w.ownerId !== user.id
  );

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
        id: newWorkspace.id,
        name: newWorkspace.name,
        type: 'workspace',
        ownerId: user.id,
        members: [],
        folders: [],
        userRole: 'OWNER'
      };

      setWorkspaces([...workspaces, mappedNew]);

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
    // Validation: Check for duplicate folder name in current workspace
    if (selectedWorkspaceForFolder) {
      const existingWS = workspaces.find(w => w.id === selectedWorkspaceForFolder.id);
      const isDuplicate = existingWS?.folders?.some(f => f.name.toLowerCase() === folderName.toLowerCase());
      
      if (isDuplicate) {
        throw new Error(`A folder named "${folderName}" already exists in this workspace.`);
      }

      const newFolder = {
        id: `f-local-${Date.now()}`,
        name: folderName,
        createdBy: 'You',
        videos: []
      };

      setLocalAdditions(prev => ({
        ...prev,
        folders: {
          ...prev.folders,
          [selectedWorkspaceForFolder.id]: [...(prev.folders[selectedWorkspaceForFolder.id] || []), newFolder]
        }
      }));
      
      // Update UI immediately
      setTimeout(() => loadWorkspaces(), 100);
    }
  };

  const handleGlobalCreate = async ({ videoName, workspaceId, folderId, newFolderName, newWorkspaceName }) => {
    let targetWorkspaceId = workspaceId;
    let targetFolderId = folderId;

    // 1. Handle New Workspace Validation
    if (newWorkspaceName) {
      const isDuplicateWS = workspaces.some(w => w.name.toLowerCase() === newWorkspaceName.toLowerCase());
      if (isDuplicateWS) {
        throw new Error(`A workspace named "${newWorkspaceName}" already exists.`);
      }

      const newWS = {
        id: `ws-local-${Date.now()}`,
        name: newWorkspaceName,
        type: 'workspace',
        ownerId: user.id,
        members: [],
        folders: []
      };
      setLocalAdditions(prev => ({ ...prev, workspaces: [...prev.workspaces, newWS] }));
      targetWorkspaceId = newWS.id;
    }

    // 2. Handle New Folder Validation
    if (newFolderName) {
      const wsContext = workspaces.find(w => w.id === targetWorkspaceId) || 
                        localAdditions.workspaces.find(w => w.id === targetWorkspaceId);
      
      const isDuplicateFolder = wsContext?.folders?.some(f => f.name.toLowerCase() === newFolderName.toLowerCase()) ||
                                localAdditions.folders[targetWorkspaceId]?.some(f => f.name.toLowerCase() === newFolderName.toLowerCase());

      if (isDuplicateFolder) {
        throw new Error(`A folder named "${newFolderName}" already exists in this workspace.`);
      }

      const newFolder = {
        id: `f-local-${Date.now()}`,
        name: newFolderName,
        createdBy: 'You',
        videos: []
      };
      setLocalAdditions(prev => ({
        ...prev,
        folders: {
          ...prev.folders,
          [targetWorkspaceId]: [...(prev.folders[targetWorkspaceId] || []), newFolder]
        }
      }));
      targetFolderId = newFolder.id;
    }

    // 3. Handle Video Validation
    if (videoName) {
      const allFolders = workspaces.flatMap(w => w.folders || []);
      const folderContext = allFolders.find(f => f.id === targetFolderId) || 
                           Object.values(localAdditions.folders).flat().find(f => f.id === targetFolderId);
      
      const isDuplicateVideo = folderContext?.videos?.some(v => v.name.toLowerCase() === videoName.toLowerCase()) ||
                               localAdditions.videos[targetFolderId]?.some(v => v.name.toLowerCase() === videoName.toLowerCase());

      if (isDuplicateVideo) {
        throw new Error(`A video named "${videoName}" already exists in this folder.`);
      }

      const newVideo = {
        id: `v-local-${Date.now()}`,
        name: videoName,
        lastEditedBy: 'You',
        lastEditedAt: new Date().toISOString().split('T')[0]
      };

      setLocalAdditions(prev => ({
        ...prev,
        videos: {
          ...prev.videos,
          [targetFolderId]: [...(prev.videos[targetFolderId] || []), newVideo]
        }
      }));
    }

    // Trigger UI reload or immediate local update
    setTimeout(() => loadWorkspaces(), 200);
    setIsGlobalCreateOpen(false);
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

  const renameItem = (type, id) => console.log(`Rename ${type} ${id}`);

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
          workspaces: prev.workspaces.filter(w => w.id !== id)
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
            onAddMembers: ws.type === 'workspace' && ws.userRole === 'OWNER' ? () => alert('Add Members Modal') : null,
            onDelete: ws.type !== 'personal' && ws.userRole === 'OWNER' ? () => deleteItem('workspace', ws.id) : null
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
          onAddMembers: ws.type === 'workspace' && ws.userRole === 'OWNER' ? () => alert('Add Members Modal') : null,
          onDelete: ws.type !== 'personal' && ws.userRole === 'OWNER' ? () => deleteItem('workspace', ws.id) : null
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

      <WorkspaceSection
        title="Shared with Me"
        count={sharedWithMe.length}
        viewMode={viewMode}
        emptyMessage="No workspaces have been shared with you yet."
      >
        {renderWorkspaceItems(sharedWithMe)}
      </WorkspaceSection>
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
          onEmptyAction={() => setIsGlobalCreateOpen(true)}
          showCreateButton={true}
          onCreateClick={() => setIsGlobalCreateOpen(true)}
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
        onCreateClick={() => setIsGlobalCreateOpen(true)}
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

      <GlobalCreateModal
        isOpen={isGlobalCreateOpen}
        onClose={() => setIsGlobalCreateOpen(false)}
        onCreateVideo={handleGlobalCreate}
        workspaces={workspaces}
        initialWorkspaceId={currentLevel.ws?.id || ''}
        initialFolderId={currentLevel.folder?.id || ''}
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
