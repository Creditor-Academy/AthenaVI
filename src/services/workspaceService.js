import { buildUrl, getAuthHeaders } from '../config/api.js';

class WorkspaceService {
  constructor() {
    this.baseURL = ''; // Not used anymore as we use buildUrl
  }

  // List all workspaces for the current user
  async listWorkspaces() {
    try {
      console.log('Fetching workspaces...');

      const response = await fetch(buildUrl('/api/workspaces'), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      console.log('Workspace list response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.status}`);
      }

      const data = await response.json();
      console.log('Workspace list response data:', data);

      // Extract workspaces from nested structure
      const workspaces = data.data?.workspaces || data.workspaces || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      // Normalize _id to id for consistency
      const normalized = workspaces.map(ws => ({ ...ws, id: ws.id || ws._id }));
      console.log('Extracted workspaces:', normalized);

      // DEBUG: Log raw field names from first workspace to identify API shape
      if (workspaces.length > 0) {
        const sample = workspaces[0];
        console.log('=== WORKSPACE API DEBUG ===');
        console.log('All keys on workspace[0]:', Object.keys(sample));
        console.log('Full workspace[0] raw:', JSON.stringify(sample, null, 2));
        console.log('Stored user from localStorage:', localStorage.getItem('user'));
        console.log('=== END DEBUG ===');
      }

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
      return data.data?.workspace || data.workspace;
    } catch (error) {
      console.error('Error in getWorkspace:', error);
      throw error;
    }
  }

  // Create new team workspace
  async createWorkspace(name) {
    try {
      console.log('Creating workspace with name:', name);

      const response = await fetch(buildUrl('/api/workspaces'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(typeof name === 'object' ? name : { name })
      });

      console.log('Create workspace response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create workspace error response:', errorData);
        throw new Error(errorData.message || `Failed to create workspace: ${response.status}`);
      }

      const data = await response.json();
      console.log('Create workspace success response:', data);

      // Extract workspace from nested structure
      const workspace = data.data?.workspace || data.workspace;
      if (!workspace) {
        throw new Error('Workspace not found in response');
      }

      return workspace;
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
      return { ...folder, id: folder.id || folder._id };
    } catch (error) {
      console.error('Error in createFolder:', error);
      throw error;
    }
  }

  // List all folders in a workspace
  async listFolders(workspaceId) {
    try {
      console.log('listFolders: calling', buildUrl(`/api/workspaces/${workspaceId}/folders`));
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/folders`), {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      console.log('listFolders: response status', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Failed to fetch folders: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('listFolders: raw response data', JSON.stringify(data));
      const folders = data.data?.folders || data.folders || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      // Normalize _id to id for consistency
      return folders.map(f => ({ ...f, id: f.id || f._id }));
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
      return { ...folder, id: folder.id || folder._id };
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
        throw new Error(`Failed to update workspace: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.workspace || data.workspace;
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
      return data.members || [];
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }

  // Invite member to workspace (OWNER or ADMIN only)
  async inviteMember(workspaceId, inviteData) {
    try {
      console.log('📧 Sending invitation to:', inviteData.email);
      console.log('🏢 For workspace:', workspaceId);
      console.log('👤 Role:', inviteData.role);

      // Ensure role is uppercase according to API docs
      const role = inviteData.role ? inviteData.role.toUpperCase() : 'MEMBER';

      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/invite`), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: inviteData.email,
          role: role // ADMIN or MEMBER (not OWNER)
        })
      });

      console.log('📡 Invite API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Invite failed:', errorData);

        if (response.status === 409) {
          throw new Error('User is already a member of this workspace');
        }
        throw new Error(errorData.message || `Failed to send invitation: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Invitation sent successfully:', data);

      // According to your API docs, this returns empty object {}
      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('🚨 Error sending invitation:', error);
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
      return data.data?.workspace || data.workspace;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }
  // Change member role (OWNER only)
  async changeMemberRole(workspaceId, memberId, newRole) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/members/${memberId}/role`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole })
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
      return data.member;
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

  // Leave workspace (remove self)
  async leaveWorkspace(workspaceId) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(buildUrl(`/api/workspaces/${workspaceId}/leave`), {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to leave workspace: ${response.status}`);
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
        throw new Error(`Failed to remove invitation: ${response.status}`);
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
        // Fetch full workspace details to get folders and videos
        const details = await this.getWorkspace(workspace.id);
        
        // Handle flattened videos if they exist at workspace level
        const wsVideos = details.videos || [];
        wsVideos.forEach(v => allVideos.push({ ...v, workspaceName: details.name, workspaceId: details.id }));

        // Handle videos nested in folders
        const wsFolders = details.folders || [];
        wsFolders.forEach(folder => {
          const folderVideos = folder.videos || [];
          folderVideos.forEach(v => allVideos.push({ 
            ...v, 
            workspaceName: details.name, 
            workspaceId: details.id,
            folderName: folder.name,
            folderId: folder.id
          }));
        });
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
      return data.data?.video || data.video;
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
}

// Create singleton instance
const workspaceService = new WorkspaceService();

export default workspaceService;
