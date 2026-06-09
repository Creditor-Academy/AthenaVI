import { useCallback } from 'react';
import workspaceService from '../../services/workspaceService.js';
import { formatFolderSize } from '../../utils/formatSize.js';
import { buildWorkspaceUserLookup, getAuthDisplayName } from '../../utils/workspaceUsers.js';
import {
  normalizeWorkspace,
  normalizeFolder,
  normalizeVideo,
  workspaceCanEdit
} from './workspaceUtils.js';

/**
 * All user-triggered mutation handlers for the workspace page.
 *
 * Depends on state setters and helpers passed in from the parent component/hook.
 */
export function useWorkspaceActions({
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
}) {

  // ------------------------------------------------------------------
  // Create workspace
  // ------------------------------------------------------------------
  const handleCreateWorkspace = useCallback(async ({ name, invites }) => {
    try {
      const createdWorkspace = await workspaceService.createWorkspace(name);
      const mappedWorkspace = {
        ...normalizeWorkspace(createdWorkspace, currentUserId, authUser),
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

      showToast('Workspace created successfully', 'success');
      return mappedWorkspace;
    } catch (error) {
      showToast(error.message || 'Failed to create workspace', 'error');
      throw error;
    }
  }, [currentUserId, authUser, setWorkspaces, setLocalAdditions, showToast]);

  // ------------------------------------------------------------------
  // Create folder
  // ------------------------------------------------------------------
  const handleCreateFolder = useCallback(async (folderName, selectedWorkspace) => {
    if (!selectedWorkspace) return;

    const workspace = workspaces.find((item) => String(item.id) === String(selectedWorkspace.id));
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
  }, [workspaces, currentUserId, authUser, setWorkspaces, setLocalAdditions, showToast]);

  // ------------------------------------------------------------------
  // Accept / Decline invitation
  // ------------------------------------------------------------------
  const handleAcceptInvitation = useCallback(async (invitationToken) => {
    try {
      await workspaceService.acceptInvitation(invitationToken);
      setInvitations((prev) => prev.filter((inv) => (inv.token || inv.id) !== invitationToken));
      await loadWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }, [setInvitations, loadWorkspaces]);

  const handleDeclineInvitation = useCallback(async (invitation) => {
    try {
      if (invitation?.workspaceId && invitation?.id) {
        await workspaceService.removeInvitation(invitation.workspaceId, invitation.id).catch(() => null);
      }
      setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
    } catch (error) {
      console.error(error);
    }
  }, [setInvitations]);

  // ------------------------------------------------------------------
  // Rename
  // ------------------------------------------------------------------
  const renameItem = useCallback((type, id) => {
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
  }, [workspaces, setRenameTarget]);

  const handleRename = useCallback(async (newName, renameTarget) => {
    if (!renameTarget) return;
    const { type, id } = renameTarget;

    if (type === 'workspace') {
      const targetWorkspace = workspaces.find((workspace) => String(workspace.id) === String(id));
      if (!targetWorkspace) return;
      if (String(targetWorkspace.userRole || '').toUpperCase() !== 'OWNER') {
        throw new Error('Only the owner can rename this workspace.');
      }

      await workspaceService.updateWorkspace(id, { name: newName });
      setWorkspaces((prev) =>
        prev.map((workspace) => (String(workspace.id) === String(id) ? { ...workspace, name: newName } : workspace))
      );

      setLocalAdditions((prev) => {
        const otherWorkspaces = (prev.workspaces || []).filter((ws) => String(ws.id) !== String(id));
        const targetWs = workspaces.find((ws) => String(ws.id) === String(id));
        const updated = { ...targetWs, name: newName, createdByCurrentUser: true };
        return { ...prev, workspaces: [...otherWorkspaces, updated] };
      });

      setCurrentLevel((prev) => {
        if (prev.ws && String(prev.ws.id) === String(id)) {
          return { ...prev, ws: { ...prev.ws, name: newName } };
        }
        return prev;
      });
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
  }, [workspaces, activeWorkspace, authUser, setWorkspaces, setLocalAdditions, setCurrentLevel, showToast]);

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------
  const deleteItem = useCallback((type, id, workspaceContext = null) => {
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
                      ? { ...folder, videos: (folder.videos || []).filter((video) => String(video.id) !== String(id)) }
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
  }, [workspaces, activeWorkspace, activeFolder, currentLevel, setWorkspaces, setLocalAdditions, setCurrentLevel, showToast, openConfirmDialog]);

  // ------------------------------------------------------------------
  // Leave shared workspace
  // ------------------------------------------------------------------
  const handleLeaveSharedWorkspace = useCallback((workspace) => {
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
  }, [currentLevel, setWorkspaces, setCurrentLevel, showToast, openConfirmDialog]);

  // ------------------------------------------------------------------
  // Manage workspace contributors
  // ------------------------------------------------------------------
  const handleManageWorkspace = useCallback(async (workspace) => {
    setContributorsPanel({ open: true, workspace });
    setShowAddContributors(false);
    setInviteInputs([{ email: '', role: 'MEMBER' }]);
    setActiveMemberMenuId(null);
    await loadContributorsForWorkspace(workspace);
  }, [setContributorsPanel, setShowAddContributors, setInviteInputs, setActiveMemberMenuId, loadContributorsForWorkspace]);

  const handleAddInviteInput = useCallback(() => {
    setInviteInputs((prev) => [...prev, { email: '', role: 'MEMBER' }]);
  }, [setInviteInputs]);

  const handleUpdateInviteInput = useCallback((index, field, value) => {
    setInviteInputs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, [setInviteInputs]);

  const handleRemoveInviteInput = useCallback((index) => {
    setInviteInputs((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ email: '', role: 'MEMBER' }]
    );
  }, [setInviteInputs]);

  const handleSendInvites = useCallback(async () => {
    if (!contributorsPanel.workspace) return;
    const validInputs = inviteInputs.filter((input) => input.email.trim());
    if (validInputs.length === 0) {
      showToast('Please enter at least one email address', 'error');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let lastError = null;

    for (const input of validInputs) {
      try {
        await workspaceService.inviteMember(contributorsPanel.workspace.id, {
          email: input.email.trim(),
          role: input.role
        });
        successCount++;
      } catch (err) {
        failCount++;
        lastError = err;
      }
    }

    if (successCount > 0) {
      showToast(`Successfully invited ${successCount} member(s)`, 'success');
    }
    if (failCount > 0) {
      showToast(`Failed to invite ${failCount} member(s): ${lastError?.message || 'Error'}`, 'error');
    }

    setInviteInputs([{ email: '', role: 'MEMBER' }]);
    setShowAddContributors(false);
    await loadContributorsForWorkspace(contributorsPanel.workspace);
  }, [contributorsPanel, inviteInputs, showToast, setInviteInputs, setShowAddContributors, loadContributorsForWorkspace]);

  const handleChangeMemberRole = useCallback(async (memberId, role) => {
    if (!contributorsPanel.workspace) return;
    try {
      await workspaceService.changeMemberRole(contributorsPanel.workspace.id, memberId, role);
      await loadContributorsForWorkspace(contributorsPanel.workspace);
      showToast('Member role updated', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to change role', 'error');
    }
  }, [contributorsPanel, loadContributorsForWorkspace, showToast]);

  const handleRemoveMember = useCallback((memberId) => {
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
  }, [contributorsPanel, loadContributorsForWorkspace, showToast, openConfirmDialog]);

  // ------------------------------------------------------------------
  // Move project
  // ------------------------------------------------------------------
  const handleMoveProject = useCallback(async (targetFolderId, moveTargetVideo, moveTargetWorkspace) => {
    if (!moveTargetVideo || !moveTargetWorkspace) return;
    try {
      await workspaceService.moveProjectFolder(moveTargetWorkspace.id, moveTargetVideo.id, targetFolderId);

      setWorkspaces((prev) =>
        prev.map((workspace) => {
          if (String(workspace.id) !== String(moveTargetWorkspace.id)) return workspace;

          const updatedFolders = workspace.folders.map((folder) => ({
            ...folder,
            videos: (folder.videos || []).filter((v) => String(v.id) !== String(moveTargetVideo.id))
          }));

          const updatedFoldersWithAdded = updatedFolders.map((folder) => {
            if (String(folder.id) !== String(targetFolderId)) return folder;
            const alreadyExists = (folder.videos || []).some((v) => String(v.id) === String(moveTargetVideo.id));
            const updatedVideo = { ...moveTargetVideo, folderId: targetFolderId };
            return {
              ...folder,
              videos: alreadyExists ? folder.videos : [...(folder.videos || []), updatedVideo]
            };
          });

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
      setMoveTargetVideo(null);
      setMoveTargetWorkspace(null);
    } catch (err) {
      showToast(err.message || 'Failed to move video', 'error');
      throw err;
    }
  }, [setWorkspaces, showToast, setMoveTargetVideo, setMoveTargetWorkspace]);

  return {
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
    handleChangeMemberRole,
    handleRemoveMember,
    handleMoveProject
  };
}
