import { useCallback, useRef, useState } from 'react';
import workspaceService from '../../services/workspaceService.js';
import imageGenService from '../../services/imageGenService.js';
import invitationFlowService from '../../services/invitationFlowService.js';
import inboxService from '../../services/inboxService.js';
import { savePendingInvitation } from '../../utils/inviteNavigation.js';
import { formatFolderSize } from '../../utils/formatSize.js';
import { buildWorkspaceUserLookup, getAuthDisplayName } from '../../utils/workspaceUsers.js';
import {
  normalizeWorkspace,
  normalizeFolder,
  normalizeVideo,
  workspaceCanEdit,
  hasConflictingName,
  findVideoLocation,
  getAllWorkspaceNames,
} from './workspaceUtils.js';
import {
  DUPLICATE_PROJECT_NAME_MESSAGE,
  findDuplicateProjectName,
  getProjectDisplayName,
} from '../../utils/projectNameValidation.js';

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
  loadContributorsForWorkspace,
  onLibraryChange,
}) {
  const [inviteSending, setInviteSending] = useState(false);

  // ------------------------------------------------------------------
  // Create workspace
  // ------------------------------------------------------------------
  const handleCreateWorkspace = useCallback(async ({ name, invites }) => {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      throw new Error('Workspace name is required');
    }

    const duplicateWorkspace = hasConflictingName(
      trimmedName,
      getAllWorkspaceNames(workspaces)
    );
    if (duplicateWorkspace) {
      throw new Error('This workspace name already exists');
    }

    try {
      const createdWorkspace = await workspaceService.createWorkspace(trimmedName);
      const mappedWorkspace = {
        ...normalizeWorkspace(createdWorkspace, currentUserId, authUser),
        userRole: 'OWNER',
        type: 'workspace',
        folders: []
      };

      const inviteList = (Array.isArray(invites) ? invites : [])
        .map((email) => String(email || '').trim())
        .filter(Boolean);

      let failedInvites = [];
      if (inviteList.length > 0) {
        const results = await Promise.all(
          inviteList.map((email) =>
            workspaceService
              .inviteMember(mappedWorkspace.id, { email, role: 'MEMBER' })
              .then(() => null)
              .catch(() => email)
          )
        );
        failedInvites = results.filter(Boolean);
      }

      setWorkspaces((prev) => [...prev, mappedWorkspace]);

      setLocalAdditions((prev) => ({
        ...prev,
        workspaces: [
          ...prev.workspaces.filter((workspace) => String(workspace.id) !== String(mappedWorkspace.id)),
          { ...mappedWorkspace, createdByCurrentUser: true }
        ]
      }));

      if (failedInvites.length > 0) {
        showToast(
          `Workspace created, but ${failedInvites.length} invite${failedInvites.length === 1 ? '' : 's'} could not be sent (${failedInvites.join(', ')})`,
          'error'
        );
      } else {
        showToast('Workspace created successfully', 'success');
      }
      return mappedWorkspace;
    } catch (error) {
      showToast(error.message || 'Failed to create workspace', 'error');
      throw error;
    }
  }, [currentUserId, authUser, workspaces, setWorkspaces, setLocalAdditions, showToast]);

  // ------------------------------------------------------------------
  // Create folder
  // ------------------------------------------------------------------
  const handleCreateFolder = useCallback(async (folderName, selectedWorkspace) => {
    if (!selectedWorkspace) return;

    const workspace = workspaces.find((item) => String(item.id) === String(selectedWorkspace.id));
    if (!workspaceCanEdit(workspace)) {
      throw new Error('You do not have permission to create folders in this workspace.');
    }

    const duplicateFolder = hasConflictingName(folderName, workspace?.folders?.map((folder) => folder.name));
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
  const handleAcceptInvitation = useCallback(async (invitationOrToken) => {
    const invitation = typeof invitationOrToken === 'object' ? invitationOrToken : null;
    const token = invitation?.token || invitationOrToken;

    if (!token) {
      showToast('Invalid invitation', 'error');
      return;
    }

    savePendingInvitation({
      token,
      email: invitation?.email || '',
      notificationId: invitation?.notificationId || null,
      workspaceId: invitation?.workspaceId || invitation?.workspace?.id || null,
      workspaceName: invitation?.workspaceName || invitation?.workspace?.name || '',
    });

    try {
      const workspace = await invitationFlowService.completePendingInvitation();
      setInvitations((prev) => prev.filter((inv) => (inv.token || inv.id) !== token));
      await loadWorkspaces();
      showToast(
        `Joined ${workspace?.name || invitation?.workspaceName || 'workspace'} successfully`,
        'success'
      );
      invitationFlowService.redirectAfterInvite(
        workspace || invitation?.workspace || {
          id: invitation?.workspaceId,
          name: invitation?.workspaceName,
        }
      );
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to accept invitation', 'error');
    }
  }, [setInvitations, loadWorkspaces, showToast]);

  const handleDeclineInvitation = useCallback(async (invitation) => {
    try {
      if (invitation?.notificationId) {
        await inboxService.dismiss(invitation.notificationId);
      }
      setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
      showToast('Invitation declined', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to decline invitation', 'error');
    }
  }, [setInvitations, showToast]);

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
    } else if (type === 'video' || type === 'image-thread') {
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

      const duplicateWorkspace = hasConflictingName(
        newName,
        getAllWorkspaceNames(workspaces),
        { excludeName: targetWorkspace.name }
      );
      if (duplicateWorkspace) {
        throw new Error('This workspace name already exists');
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

      const duplicateFolder = hasConflictingName(
        newName,
        parentWorkspace.folders?.map((folder) => folder.name),
        { excludeName: parentWorkspace.folders?.find((folder) => String(folder.id) === String(id))?.name }
      );
      if (duplicateFolder) {
        throw new Error(`A folder named "${newName}" already exists in this workspace.`);
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

    if (type === 'image-thread') {
      const videoLocation = findVideoLocation(workspaces, id);
      const parentWorkspace = videoLocation?.workspace || activeWorkspace;
      if (!parentWorkspace || !workspaceCanEdit(parentWorkspace)) {
        throw new Error('You do not have permission to rename this chat.');
      }
      const videosInScope = videoLocation?.videos || [];
      const duplicate = findDuplicateProjectName(newName, videosInScope, {
        excludeProjectId: id,
      });
      if (duplicate) {
        throw new Error(`A project named "${newName}" already exists in this folder.`);
      }
      await imageGenService.renameThread(parentWorkspace.id, id, newName);
      showToast('Chat renamed', 'success');
      onLibraryChange?.();
      return;
    }

    if (type === 'video') {
      const videoLocation = findVideoLocation(workspaces, id);
      const parentWorkspace = videoLocation?.workspace || activeWorkspace;
      if (!parentWorkspace || !workspaceCanEdit(parentWorkspace)) {
        throw new Error('You do not have permission to rename this video.');
      }

      const videosInScope = videoLocation?.videos || [];
      const duplicateProject = findDuplicateProjectName(newName, videosInScope, {
        excludeProjectId: id,
      });
      if (duplicateProject) {
        throw new Error(`A project named "${newName}" already exists in this folder.`);
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
  }, [workspaces, activeWorkspace, authUser, setWorkspaces, setLocalAdditions, setCurrentLevel, showToast, onLibraryChange]);

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------
  const refreshWorkspaceData = useCallback(async () => {
    if (typeof loadWorkspaces === 'function') {
      await loadWorkspaces();
    }
  }, [loadWorkspaces]);

  // Removals in flight, keyed `${kind}:${id}` — repeat clicks while one runs are ignored.
  const pendingRemovalsRef = useRef(new Set());

  /**
   * Shared delete/leave flow: one request per item at a time, immediate "in progress"
   * feedback, the success toast as soon as the server confirms, and a background refresh
   * that can't turn a successful delete into a "Failed to …" toast.
   */
  const runRemoval = useCallback(async (key, { request, onRemoved, pending, success, alreadyGone, failure }) => {
    if (pendingRemovalsRef.current.has(key)) return;
    pendingRemovalsRef.current.add(key);
    showToast(pending, 'info');
    let removed = false;
    try {
      const result = await request();
      onRemoved();
      removed = true;
      showToast(result?.alreadyDeleted && alreadyGone ? alreadyGone : success, 'success');
    } catch (error) {
      showToast(error?.message || failure, 'error');
    } finally {
      pendingRemovalsRef.current.delete(key);
    }
    if (removed) {
      refreshWorkspaceData().catch((error) => console.warn('Workspace refresh after removal failed:', error));
    }
  }, [showToast, refreshWorkspaceData]);

  const removeWorkspaceFromView = useCallback((workspaceId) => {
    const isGone = (item) => String(item.id) === String(workspaceId);
    setWorkspaces((prev) => prev.filter((item) => !isGone(item)));
    setLocalAdditions((prev) => ({
      ...prev,
      workspaces: (prev.workspaces || []).filter((item) => !isGone(item)),
    }));
    setCurrentLevel((prev) =>
      String(prev?.id) === String(workspaceId) || String(prev?.ws?.id) === String(workspaceId)
        ? { type: 'root', id: null }
        : prev
    );
  }, [setWorkspaces, setLocalAdditions, setCurrentLevel]);

  const confirmLeaveWorkspace = useCallback((workspace, message) => {
    openConfirmDialog(message, () =>
      runRemoval(`workspace:${workspace.id}`, {
        request: () => workspaceService.leaveWorkspace(workspace),
        onRemoved: () => removeWorkspaceFromView(workspace.id),
        pending: 'Leaving workspace…',
        success: `You left "${workspace.name}"`,
        failure: "Couldn't leave this workspace. Please try again.",
      })
    );
  }, [openConfirmDialog, runRemoval, removeWorkspaceFromView]);

  const deleteItem = useCallback((type, id, workspaceContext = null) => {
    if (type === 'workspace') {
      const workspace = workspaces.find((item) => String(item.id) === String(id));
      if (!workspace) return;

      if (workspace.type === 'personal') {
        showToast('Your personal workspace cannot be deleted.', 'error');
        return;
      }

      if (String(workspace.userRole || '').toUpperCase() !== 'OWNER') {
        confirmLeaveWorkspace(
          workspace,
          'Only the owner can delete this workspace. Do you want to leave it instead?'
        );
        return;
      }

      openConfirmDialog(
        `Delete "${workspace.name}"? All folders and projects inside it will be permanently deleted. This cannot be undone.`,
        () =>
          runRemoval(`workspace:${workspace.id}`, {
            request: () => workspaceService.deleteWorkspace(workspace.id),
            onRemoved: () => removeWorkspaceFromView(workspace.id),
            pending: 'Deleting workspace…',
            success: `Workspace "${workspace.name}" deleted`,
            alreadyGone: 'This workspace was already deleted',
            failure: "Couldn't delete this workspace. Please try again.",
          })
      );
      return;
    }

    if (type === 'folder') {
      const parentWorkspace =
        workspaceContext ||
        activeWorkspace ||
        workspaces.find((workspace) => (workspace.folders || []).some((folder) => String(folder.id) === String(id)));

      if (!parentWorkspace || !workspaceCanEdit(parentWorkspace)) {
        showToast("You don't have permission to delete this folder.", 'error');
        return;
      }

      const folderName = (parentWorkspace.folders || []).find((folder) => String(folder.id) === String(id))?.name;
      openConfirmDialog(
        `Delete ${folderName ? `"${folderName}"` : 'this folder'} and everything inside it? This cannot be undone.`,
        () =>
          runRemoval(`folder:${id}`, {
            request: () => workspaceService.deleteFolder(parentWorkspace.id, id),
            onRemoved: () => {
              const keep = (folder) => String(folder.id) !== String(id);
              setWorkspaces((prev) =>
                prev.map((workspace) =>
                  String(workspace.id) === String(parentWorkspace.id)
                    ? { ...workspace, folders: (workspace.folders || []).filter(keep) }
                    : workspace
                )
              );
              setLocalAdditions((prev) => ({
                ...prev,
                folders: {
                  ...prev.folders,
                  [parentWorkspace.id]: (prev.folders?.[parentWorkspace.id] || []).filter(keep),
                },
              }));
              setCurrentLevel((prev) =>
                String(prev?.id) === String(id)
                  ? { type: 'workspace', id: parentWorkspace.id, ws: parentWorkspace }
                  : prev
              );
              onLibraryChange?.();
            },
            pending: 'Deleting folder…',
            success: folderName ? `Folder "${folderName}" deleted` : 'Folder deleted',
            alreadyGone: 'This folder was already deleted',
            failure: "Couldn't delete this folder. Please try again.",
          })
      );
      return;
    }

    if (type === 'image-thread') {
      const parentWorkspace = workspaceContext || activeWorkspace;
      if (!parentWorkspace || !workspaceCanEdit(parentWorkspace)) {
        showToast("You don't have permission to delete this chat.", 'error');
        return;
      }
      openConfirmDialog(
        'Remove this image chat from the folder? Generated images stay in your assets.',
        () =>
          runRemoval(`image-thread:${id}`, {
            request: () => imageGenService.deleteThread(parentWorkspace.id, id),
            onRemoved: () => onLibraryChange?.(),
            pending: 'Removing chat…',
            success: 'Chat removed',
            failure: "Couldn't remove this chat. Please try again.",
          })
      );
      return;
    }

    if (type === 'video') {
      // Resolve where the project actually lives — callers pass the workspace, and the
      // project may sit outside any folder (activeFolder is null then).
      const location = findVideoLocation(workspaces, id);
      const parentWorkspace = location?.workspace || workspaceContext || activeWorkspace;
      if (!parentWorkspace || !workspaceCanEdit(parentWorkspace)) {
        showToast("You don't have permission to delete this project.", 'error');
        return;
      }

      const projectName = (location?.videos || []).find((video) => String(video.id) === String(id))?.name;
      openConfirmDialog(
        `Delete ${projectName ? `"${projectName}"` : 'this project'}? This cannot be undone.`,
        () =>
          runRemoval(`video:${id}`, {
            request: () => workspaceService.deleteProject(parentWorkspace.id, id),
            onRemoved: () => {
              const without = (list) => (list || []).filter((video) => String(video.id) !== String(id));
              setWorkspaces((prev) =>
                prev.map((workspace) =>
                  String(workspace.id) === String(parentWorkspace.id)
                    ? {
                      ...workspace,
                      videos: without(workspace.videos),
                      folders: (workspace.folders || []).map((folder) => ({ ...folder, videos: without(folder.videos) })),
                    }
                    : workspace
                )
              );
              setLocalAdditions((prev) => ({
                ...prev,
                videos: Object.fromEntries(
                  Object.entries(prev.videos || {}).map(([folderId, list]) => [folderId, without(list)])
                ),
              }));
              onLibraryChange?.();
            },
            pending: 'Deleting project…',
            success: projectName ? `"${projectName}" deleted` : 'Project deleted',
            alreadyGone: 'This project was already deleted',
            failure: "Couldn't delete this project. Please try again.",
          })
      );
    }
  }, [workspaces, activeWorkspace, setWorkspaces, setLocalAdditions, setCurrentLevel, showToast, openConfirmDialog, runRemoval, removeWorkspaceFromView, confirmLeaveWorkspace, onLibraryChange]);

  // ------------------------------------------------------------------
  // Leave shared workspace
  // ------------------------------------------------------------------
  const handleLeaveSharedWorkspace = useCallback((workspace) => {
    confirmLeaveWorkspace(
      workspace,
      `Leave "${workspace.name}"? You'll lose access to its folders and projects.`
    );
  }, [confirmLeaveWorkspace]);

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
    if (!contributorsPanel.workspace || inviteSending) return;
    const validInputs = inviteInputs.filter((input) => input.email.trim());
    if (validInputs.length === 0) {
      showToast('Please enter at least one email address', 'error');
      return;
    }

    setInviteSending(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = null;

    try {
      for (const input of validInputs) {
        try {
          await workspaceService.inviteMember(contributorsPanel.workspace.id, {
            email: input.email.trim(),
            role: input.role,
          });
          successCount++;
        } catch (err) {
          failCount++;
          lastError = err;
        }
      }

      if (successCount > 0) {
        showToast(`Successfully invited ${successCount} member(s)`, 'success');
        setInviteInputs([{ email: '', role: 'MEMBER' }]);
        setShowAddContributors(false);
        await loadContributorsForWorkspace(contributorsPanel.workspace);
      }
      if (failCount > 0) {
        showToast(`Failed to invite ${failCount} member(s): ${lastError?.message || 'Error'}`, 'error');
      }
    } finally {
      setInviteSending(false);
    }
  }, [
    contributorsPanel,
    inviteInputs,
    inviteSending,
    showToast,
    setInviteInputs,
    setShowAddContributors,
    loadContributorsForWorkspace,
  ]);

  const handleChangeMemberRole = useCallback(async (memberId, role) => {
    if (!contributorsPanel.workspace) return;
    try {
      await workspaceService.changeMemberRole(contributorsPanel.workspace.id, memberId, role);
      await loadContributorsForWorkspace(contributorsPanel.workspace);
      const roleLabel = { OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member' }[String(role).toUpperCase()] || role;
      showToast(`Role changed to ${roleLabel}`, 'success');
    } catch (error) {
      showToast(error.message || 'Failed to change role', 'error');
    }
  }, [contributorsPanel, loadContributorsForWorkspace, showToast]);

  const handleRemoveMember = useCallback((memberId) => {
    if (!contributorsPanel.workspace) return;
    openConfirmDialog('Remove this member from workspace?', async () => {
      try {
        await workspaceService.removeMember(contributorsPanel.workspace.id, memberId);
        // Keep the workspace card's member count in step without a full reload.
        setWorkspaces((prev) =>
          prev.map((workspace) =>
            String(workspace.id) === String(contributorsPanel.workspace.id) && workspace.memberCount != null
              ? { ...workspace, memberCount: Math.max(1, Number(workspace.memberCount) - 1) }
              : workspace
          )
        );
        await loadContributorsForWorkspace(contributorsPanel.workspace);
        showToast('Member removed successfully', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to remove member', 'error');
      }
    });
  }, [contributorsPanel, loadContributorsForWorkspace, showToast, openConfirmDialog, setWorkspaces]);

  // ------------------------------------------------------------------
  // Move project
  // ------------------------------------------------------------------
  const handleMoveProject = useCallback(async (targetFolderId, moveTargetVideo, moveTargetWorkspace) => {
    if (!moveTargetVideo || !moveTargetWorkspace) return;
    try {
      if (moveTargetVideo.kind === 'image' || moveTargetVideo.category === 'image') {
        if (!targetFolderId) {
          throw new Error('Image chats must live in a folder.');
        }
        await imageGenService.moveThread(moveTargetWorkspace.id, moveTargetVideo.id, targetFolderId);
        showToast('Chat moved', 'success');
        setMoveTargetVideo(null);
        setMoveTargetWorkspace(null);
        onLibraryChange?.();
        return;
      }

      const targetFolder = moveTargetWorkspace.folders?.find(
        (folder) => String(folder.id) === String(targetFolderId)
      );
      const duplicate = findDuplicateProjectName(
        getProjectDisplayName(moveTargetVideo),
        targetFolder?.videos || [],
        { excludeProjectId: moveTargetVideo.id }
      );
      if (duplicate) {
        throw new Error(DUPLICATE_PROJECT_NAME_MESSAGE);
      }

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
    inviteSending,
    handleChangeMemberRole,
    handleRemoveMember,
    handleMoveProject
  };
}
