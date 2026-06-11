import { useState, useEffect, useCallback } from 'react';
import workspaceService from '../../services/workspaceService.js';
import creditsService from '../../services/creditsService.js';
import { formatFolderSize } from '../../utils/formatSize.js';
import { buildWorkspaceUserLookup } from '../../utils/workspaceUsers.js';
import {
  normalizeWorkspace,
  normalizeFolder,
  normalizeVideo,
  enrichWorkspaceMembers
} from './workspaceUtils.js';

export function useWorkspaceData({ currentUserId, authUser, authLoading }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localAdditions, setLocalAdditions] = useState(() => {
    const saved = sessionStorage.getItem('workspaceLocalAdditions');
    return saved ? JSON.parse(saved) : { workspaces: [], folders: {}, videos: {} };
  });

  const [members, setMembers] = useState([]);
  const [invitees, setInvitees] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Persist localAdditions
  useEffect(() => {
    sessionStorage.setItem('workspaceLocalAdditions', JSON.stringify(localAdditions));
  }, [localAdditions]);

  // ------------------------------------------------------------------
  // loadWorkspaces
  // ------------------------------------------------------------------
  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const rawWorkspaces = await workspaceService.listWorkspaces();
      const mapped = (rawWorkspaces || []).map((ws) =>
        normalizeWorkspace(ws, currentUserId, authUser)
      );

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
                  normalizeVideo(
                    {
                      ...p,
                      workspaceId: enrichedWorkspace.id,
                      folderId: p.folderId || (p.folder && (p.folder.id || p.folder._id))
                    },
                    currentUserId,
                    authUser,
                    userLookup
                  )
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

      const withCredits = await Promise.all(
        withFolders.map(async (workspace) => {
          if (workspace.type === 'personal') return workspace;
          try {
            const balance = await creditsService.getWorkspaceBalance(workspace.id);
            return {
              ...workspace,
              workspaceCredits: Number(balance.workspaceCredits ?? 0),
            };
          } catch (error) {
            console.warn(`Failed to load credits for workspace ${workspace.id}:`, error);
            return workspace;
          }
        })
      );

      // Read localAdditions fresh from state via callback to avoid stale closure
      setLocalAdditions((currentLocalAdditions) => {
        let merged = withCredits.map((workspace) => {
          const localWorkspaceMeta = currentLocalAdditions.workspaces.find(
            (localWorkspace) =>
              String(localWorkspace.id) === String(workspace.id) && localWorkspace.createdByCurrentUser
          );
          if (!localWorkspaceMeta) return workspace;
          return {
            ...workspace,
            name: localWorkspaceMeta.name || workspace.name,
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

        currentLocalAdditions.workspaces.forEach((localWorkspace) => {
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
          const localFolders = currentLocalAdditions.folders[workspace.id] || [];
          const mergedFolders = [...(workspace.folders || [])];

          localFolders.forEach((localFolder) => {
            if (!mergedFolders.some((existing) => String(existing.id) === String(localFolder.id))) {
              mergedFolders.push(localFolder);
            }
          });

          const foldersWithLocalVideos = mergedFolders.map((folder) => {
            const localVideos = currentLocalAdditions.videos[folder.id] || [];
            const mergedVideos = [...(folder.videos || [])];

            localVideos.forEach((localVideo) => {
              if (!mergedVideos.some((video) => String(video.id) === String(localVideo.id))) {
                mergedVideos.push(localVideo);
              }
            });

            return { ...folder, videos: mergedVideos };
          });

          return { ...workspace, folders: foldersWithLocalVideos };
        });

        setWorkspaces(merged);
        return currentLocalAdditions; // unchanged
      });
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
  }, [currentUserId, authUser]);

  // ------------------------------------------------------------------
  // loadInvitations
  // ------------------------------------------------------------------
  const loadInvitations = useCallback(async () => {
    try {
      const items = await workspaceService.getInvitations();
      setInvitations(items || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    }
  }, []);

  // ------------------------------------------------------------------
  // loadContributorsForWorkspace
  // ------------------------------------------------------------------
  const loadContributorsForWorkspace = useCallback(async (workspace) => {
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
  }, []);

  // ------------------------------------------------------------------
  // Bootstrap on auth ready
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!authLoading) {
      loadWorkspaces();
      loadInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser?.id, authUser?._id]);

  return {
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
  };
}
