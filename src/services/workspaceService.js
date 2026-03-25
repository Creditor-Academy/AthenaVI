// Workspace API Service
// This service handles all workspace-related API calls

// Check for environment variable in multiple locations
const getApiBaseUrl = () => {
  // Check window environment first (for Vite)
  if (window && window.ATHENAVI_API_URL) {
    return window.ATHENAVI_API_URL;
  }
  
  // Check import.meta (for Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check process.env (for Create React App)
  if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to localhost:9000 (matches backend default port)
  return 'http://localhost:9000/api';
};

const API_BASE_URL = getApiBaseUrl();

class WorkspaceService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token from localStorage or context
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // List all workspaces for the current user
  async listWorkspaces() {
    try {
      const response = await fetch(`${this.baseURL}/workspaces`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.status}`);
      }

      const data = await response.json();
      return data.workspaces || [];
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Create a new team workspace
  async createWorkspace(workspaceData) {
    try {
      const response = await fetch(`${this.baseURL}/workspaces`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: workspaceData.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create workspace: ${response.status}`);
      }

      const data = await response.json();
      return data.workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  // Get workspace by ID
  async getWorkspace(workspaceId) {
    try {
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have access to this workspace');
        }
        if (response.status === 404) {
          throw new Error('Workspace not found');
        }
        throw new Error(`Failed to fetch workspace: ${response.status}`);
      }

      const data = await response.json();
      return data.workspace;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw error;
    }
  }

  // Update workspace (name only - type cannot be changed)
  async updateWorkspace(workspaceId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: updateData.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update workspace: ${response.status}`);
      }

      const data = await response.json();
      return data.workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  }

  // Delete workspace (only TEAM workspaces, only OWNER)
  async deleteWorkspace(workspaceId) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Private workspaces cannot be deleted');
        }
        if (response.status === 403) {
          throw new Error('Only workspace owners can delete workspaces');
        }
        if (response.status === 404) {
          throw new Error('Workspace not found');
        }
        throw new Error(`Failed to delete workspace: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  }

  // List workspace members (OWNER or ADMIN only)
  async listWorkspaceMembers(workspaceId) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members`, {
        method: 'GET',
        headers
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
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: inviteData.email,
          role: inviteData.role // ADMIN or MEMBER (not OWNER)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          throw new Error('User is already a member of this workspace');
        }
        throw new Error(errorData.message || `Failed to invite member: ${response.status}`);
      }

      const data = await response.json();
      return {
        token: data.token,
        expiresAt: data.expiresAt,
        inviteLink: `${window.location.origin}/invite/accept?token=${data.token}`
      };
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  // Accept workspace invitation
  async acceptInvitation(token) {
    try {
      const response = await fetch(`${this.baseURL}/workspaces/invitations/accept`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
      return data.workspace;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Change member role (OWNER only)
  async changeMemberRole(workspaceId, memberId, newRole) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members/${memberId}/role`, {
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
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members/${memberId}`, {
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
}

// Create singleton instance
const workspaceService = new WorkspaceService();

export default workspaceService;
