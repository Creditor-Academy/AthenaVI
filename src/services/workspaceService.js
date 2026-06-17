import { buildUrl, getAuthHeaders } from '../config/api.js';

class WorkspaceService {
  constructor() {
    this.baseURL = ''; // Not used anymore as we use buildUrl
  }

  normalizeId(item) {
    if (!item || typeof item !== 'object') return item;
    return { ...item, id: item.id || item._id };
  }

  normalizeWorkspaceRole(role) {
    const value = String(role || 'MEMBER').toUpperCase();
    if (value === 'EDITOR' || value === 'VIEWER') return 'MEMBER';
    if (value === 'OWNER' || value === 'ADMIN' || value === 'MEMBER') return value;
    return 'MEMBER';
  }

  getCurrentUserId() {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return String(parsed?.id || parsed?._id || parsed?.userId || parsed?.user_id || parsed?.sub || '');
    } catch {
      return '';
    }
  }

  async readErrorMessage(response, fallbackMessage) {
    const errorData = await response.json().catch(() => ({}));
    return errorData.message || fallbackMessage;
  }

  // List all workspaces for the current user
  async listWorkspaces() {
    try {
      const response = await fetch(buildUrl('/api/workspaces'), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to fetch workspaces: ${response.status}`));
      }

      const data = await response.json();

      const workspaces = data.data?.workspaces || data.workspaces || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      const normalized = workspaces.map((ws) => this.normalizeId(ws));

      return normalized;
    } catch (error) {
      console.error('Error in listWorkspaces:', error);
      throw error;
    }
  }

  // Get specific workspace details
  async getWorkspace(workspaceId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to get workspace: ${response.status}`);
      }

      const data = await response.json();
      const workspace = data.data?.workspace || data.workspace;
      return this.normalizeId(workspace);
    } catch (error) {
      console.error('Error in getWorkspace:', error);
      throw error;
    }
  }

  // Create new team workspace
  async createWorkspace(name) {
    try {
      const response = await fetch(buildUrl('/api/workspaces'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(typeof name === 'object' ? name : { name })
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to create workspace: ${response.status}`));
      }

      const data = await response.json();
      const workspace = data.data?.workspace || data.workspace;
      if (!workspace) {
        throw new Error('Workspace not found in response');
      }

      return this.normalizeId(workspace);
    } catch (error) {
      console.error('Error in createWorkspace:', error);
      throw error;
    }
  }

  // Create new folder in workspace
  async createFolder(workspaceId, name) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/folders`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create folder: ${response.status}`);
      }

      const data = await response.json();
      const folder = data.data?.folder || data.folder || data.data || data;
      return this.normalizeId(folder);
    } catch (error) {
      console.error('Error in createFolder:', error);
      throw error;
    }
  }

  // List all folders in a workspace
  async listFolders(workspaceId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/folders`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to fetch folders: ${response.status}`));
      }

      const data = await response.json();
      const folders = data.data?.folders || data.folders || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      return folders.map((f) => this.normalizeId(f));
    } catch (error) {
      console.error('Error in listFolders:', error);
      throw error;
    }
  }

  // Rename a folder
  async renameFolder(workspaceId, folderId, name) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/folders/${folderId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Failed to rename folder: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const folder = data.data?.folder || data.folder || data.data || data;
      return this.normalizeId(folder);
    } catch (error) {
      console.error('Error in renameFolder:', error);
      throw error;
    }
  }

  // Delete a folder
  async deleteFolder(workspaceId, folderId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/folders/${folderId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete folder: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFolder:', error);
      throw error;
    }
  }

  // Update workspace
  async updateWorkspace(workspaceId, formData) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to update workspace: ${response.status}`));
      }

      const data = await response.json();
      const workspace = data.data?.workspace || data.workspace;
      if (!workspace) {
        throw new Error('Workspace not found in response');
      }
      return this.normalizeId(workspace);
    } catch (error) {
      console.error('Error in updateWorkspace:', error);
      throw error;
    }
  }

  // Delete workspace (TEAM only)
  async deleteWorkspace(workspaceId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workspace: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWorkspace:', error);
      throw error;
    }
  }

  // Get workspace members
  async listWorkspaceMembers(workspaceId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/members`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only owners and admins can view workspace members');
        }
        throw new Error(`Failed to fetch workspace members: ${response.status}`);
      }

      const data = await response.json();
      const members = data.data?.members || data.members || [];
      return members.map((m) => this.normalizeId(m));
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }

  // Invite member to workspace (OWNER or ADMIN only)
  async inviteMember(workspaceId, inviteData) {
    try {
      const role = this.normalizeWorkspaceRole(inviteData.role);
      if (role === 'OWNER') {
        throw new Error('Invitation role must be ADMIN or MEMBER.');
      }

      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/invite`), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: inviteData.email,
          role
        })
      });

      if (!response.ok) {
        const errMsg = await this.readErrorMessage(response, `Failed to send invitation: ${response.status}`);
        if (response.status === 409) {
          throw new Error(errMsg || 'User is already a member or has a pending invitation');
        }
        throw new Error(errMsg);
      }

      await response.json().catch(() => ({}));

      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  // Accept workspace invitation
  async acceptInvitation(token) {
    try {
      const response = await fetch(buildUrl('/api/workspaces/invitations/accept'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid or expired invitation');
        }
        throw new Error(errorData.message || `Failed to accept invitation: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeId(data.data?.workspace || data.workspace);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }
  // Change member role (OWNER only)
  async changeMemberRole(workspaceId, memberId, newRole) {
    try {
      const role = this.normalizeWorkspaceRole(newRole);
      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/members/${memberId}/role`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error(errorData.message || 'Cannot change role');
        }
        if (response.status === 403) {
          throw new Error('Only workspace owners can change member roles');
        }
        if (response.status === 404) {
          throw new Error('Member not found');
        }
        throw new Error(errorData.message || `Failed to change member role: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeId(data.data?.member || data.member);
    } catch (error) {
      console.error('Error changing member role:', error);
      throw error;
    }
  }

  // Remove member from workspace (OWNER/ADMIN or self)
  async removeMember(workspaceId, memberId) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/members/${memberId}`), {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error(errorData.message || 'Cannot remove member');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to remove this member');
        }
        if (response.status === 404) {
          throw new Error('Member not found');
        }
        throw new Error(errorData.message || `Failed to remove member: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Leave workspace (remove self). Uses documented self-removal route when possible.
  async leaveWorkspace(workspaceOrId) {
    try {
      const workspace = typeof workspaceOrId === 'object' && workspaceOrId !== null ? workspaceOrId : null;
      const workspaceId = workspace?.id || workspace?._id || workspaceOrId;
      const currentUserId = this.getCurrentUserId();

      let memberId = '';
      if (workspace && Array.isArray(workspace.members) && currentUserId) {
        const ownMember = workspace.members.find((member) => {
          const memberUserId = String(member.userId || member.user?.id || member.user?._id || '');
          return memberUserId && memberUserId === currentUserId;
        });
        memberId = String(ownMember?.id || ownMember?._id || ownMember?.memberId || '');
      }

      const headers = getAuthHeaders();

      if (workspaceId && memberId) {
        const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/members/${memberId}`), {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          return true;
        }
      }

      // Compatibility fallback for older backend implementations.
      const fallbackResponse = await fetch(buildUrl(`/api/workspaces/${workspaceId}/leave`), {
        method: 'POST',
        headers
      });

      if (!fallbackResponse.ok) {
        throw new Error(await this.readErrorMessage(fallbackResponse, `Failed to leave workspace: ${fallbackResponse.status}`));
      }

      return true;
    } catch (error) {
      console.error('Error in leaveWorkspace:', error);
      throw error;
    }
  }

  // Cancel/remove invitation
  async removeInvitation(workspaceId, invitationId) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/invitations/${invitationId}`), {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to remove invitation: ${response.status}`));
      }

      return true;
    } catch (error) {
      console.error('Error in removeInvitation:', error);
      throw error;
    }
  }

  // --- Video Management ---

  // Aggregate all videos across all workspaces
  async listAllVideosAcrossWorkspaces() {
    try {
      const workspaces = await this.listWorkspaces();
      const allVideos = [];

      for (const workspace of workspaces) {
        try {
          // Use the new projects endpoint
          const projects = await this.listProjects(workspace.id);
          projects.forEach(p => allVideos.push({
            ...p,
            workspaceName: workspace.name,
            workspaceId: workspace.id,
            folderId: p.folderId || (p.folder && (p.folder.id || p.folder._id)),
            folderName: p.folder?.name
          }));
        } catch (err) {
          console.warn(`Failed to fetch projects for workspace ${workspace.id}`, err);
        }
      }

      return allVideos;
    } catch (error) {
      console.error('Error in listAllVideosAcrossWorkspaces:', error);
      throw error;
    }
  }

  // Rename a video
  async renameVideo(workspaceId, videoId, newTitle) {
    try {
      // Assuming a standard endpoint structure. Adjust if backend differs.
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/videos/${videoId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) {
        throw new Error(`Failed to rename video: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeId(data.data?.video || data.video);
    } catch (error) {
      console.error('Error in renameVideo:', error);
      throw error;
    }
  }

  // Delete a video
  async deleteVideo(workspaceId, videoId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/videos/${videoId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete video: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      throw error;
    }
  }

  async createVideo(workspaceId, payload) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/videos`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create video: ${response.status}`);
      }

      const data = await response.json();
      const video = data.data?.video || data.video || data.data || data;
      return this.normalizeId(video);
    } catch (error) {
      console.error('Error in createVideo:', error);
      throw error;
    }
  }

  // --- Project Management ---

  async createProject(workspaceId, payload) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create project: ${response.status}`);
      }

      const data = await response.json();
      const project = data.data?.project || data.project || data.data || data;
      return this.normalizeId(project);
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  async listProjects(workspaceId, folderId = null) {
    try {
      let endpoint = `/api/workspaces/${workspaceId}/projects`;
      if (folderId) {
        endpoint += `?folderId=${encodeURIComponent(folderId)}`;
      }
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to fetch projects: ${response.status}`));
      }

      const data = await response.json();
      const projects = data.data?.projects || data.projects || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      return projects.map((p) => this.normalizeId(p));
    } catch (error) {
      console.error('Error in listProjects:', error);
      throw error;
    }
  }

  async getProject(workspaceId, projectId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to get project: ${response.status}`);
      }

      const data = await response.json();
      const project = data.data?.project || data.project;
      return this.normalizeId(project);
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  }

  async updateProject(workspaceId, projectId, updateData) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeId(data.data?.project || data.project);
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  }

  async saveProjectState(workspaceId, projectId, stateData) {
    try {
      // Allow passing just the data object, or an object with { data: ... }
      const payload = stateData.data ? stateData : { data: stateData };
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/data`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const details = errorData.errors
          ? ` — ${JSON.stringify(errorData.errors)}`
          : errorData.details
            ? ` — ${JSON.stringify(errorData.details)}`
            : '';
        throw new Error(
          (errorData.message || `Failed to save project state: ${response.status}`) + details
        );
      }

      const data = await response.json();
      return this.normalizeId(data.data?.project || data.project);
    } catch (error) {
      console.error('Error in saveProjectState:', error);
      throw error;
    }
  }

  async moveProjectFolder(workspaceId, projectId, newFolderId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/move-folder`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ folderId: newFolderId })
      });

      if (!response.ok) {
        throw new Error(`Failed to move project: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeId(data.data?.project || data.project);
    } catch (error) {
      console.error('Error in moveProjectFolder:', error);
      throw error;
    }
  }

  async deleteProject(workspaceId, projectId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }

  // --- Render Management ---

  async createRender(workspaceId, projectId, options = { forceRebuild: false }) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/renders`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ forceRebuild: options.forceRebuild })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create render: ${response.status}`);
      }

      const data = await response.json();
      const render = data.data?.render || data.render || data.data || data;
      return this.normalizeId(render);
    } catch (error) {
      console.error('Error in createRender:', error);
      throw error;
    }
  }

  async listRenders(workspaceId, projectId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/renders`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response, `Failed to fetch renders: ${response.status}`));
      }

      const data = await response.json();
      const renders = data.data?.renders || data.renders || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      return renders.map((r) => this.normalizeId(r));
    } catch (error) {
      console.error('Error in listRenders:', error);
      throw error;
    }
  }

  async getRender(workspaceId, projectId, renderId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/renders/${renderId}`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to get render: ${response.status}`);
      }

      const data = await response.json();
      const render = data.data?.render || data.render;
      return this.normalizeId(render);
    } catch (error) {
      console.error('Error in getRender:', error);
      throw error;
    }
  }

  async downloadRender(workspaceId, projectId, renderId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/renders/${renderId}/download`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to get render download url: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Contains { presignedUrl, expiresInSeconds, render }
    } catch (error) {
      console.error('Error in downloadRender:', error);
      throw error;
    }
  }

  // --- Speech generation (voice-only narration) ---

  async createSpeechGeneration(workspaceId, projectId, payload) {
    const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/speech`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to generate speech: ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return data.data || data;
  }

  async getSpeechGeneration(workspaceId, projectId, speechId) {
    const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/speech/${speechId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch speech: ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return data.data || data;
  }

  async downloadSpeech(workspaceId, projectId, speechId, expiresIn = 300) {
    const response = await fetch(
      buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/speech/${speechId}/download?expiresIn=${expiresIn}`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to download speech: ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return data.data || data;
  }

  /**
   * Authenticated speech stream -> blob url.
   * Note: blob urls are session-only; do not persist them to backend JSON.
   */
  async getSpeechStreamBlobUrl(workspaceId, projectId, speechId) {
    const response = await fetch(
      buildUrl(`/api/workspaces/${workspaceId}/projects/${projectId}/speech/${speechId}/stream`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Failed to stream speech: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async getInvitations() {
    // NOTE: The API has no "list my received invitations" endpoint.
    // Invitations are only accepted via the email link (POST /api/workspaces/invitations/accept).
    // This method intentionally returns an empty array.
    return [];
  }

  async listWorkspaceInvitations(workspaceId) {
    try {
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/invitations`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) return [];
        throw new Error(`Failed to fetch workspace invitations: ${response.status}`);
      }

      const data = await response.json();
      const invitations = data.data?.invitations || data.invitations || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      return invitations.map((inv) => this.normalizeId(inv));
    } catch (error) {
      console.error('Error in listWorkspaceInvitations:', error);
      return [];
    }
  }

  async listTemplatesByAspectRatio(aspectRatio) {
    try {
      const response = await fetch(buildUrl(`/api/templates?aspectRatio=${encodeURIComponent(aspectRatio)}`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const data = await response.json();
      const templates = data.data?.templates || data.templates || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      return templates.map((tpl) => this.normalizeId(tpl));
    } catch (error) {
      console.error('Error in listTemplatesByAspectRatio:', error);
      return [];
    }
  }
}

// Create singleton instance
const workspaceService = new WorkspaceService();

export default workspaceService;
