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
      console.log('Fetching workspaces...');
      
      const response = await fetch(`${this.baseURL}/workspaces`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('Workspace list response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.status}`);
      }

      const data = await response.json();
      console.log('Workspace list response data:', data);
      
      // Extract workspaces from nested structure
      const workspaces = data.data?.workspaces || data.workspaces || [];
      console.log('Extracted workspaces:', workspaces);
      
      return workspaces;
    } catch (error) {
      console.error('Error in listWorkspaces:', error);
      throw error;
    }
  }

  // Get specific workspace details
  async getWorkspace(workspaceId) {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
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
      
      const response = await fetch('/api/workspace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
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

  // Update workspace
  async updateWorkspace(workspaceId, formData) {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
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
      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
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
      const response = await fetch(`/api/workspace/${workspaceId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
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
      
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/invite`, {
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
      const response = await fetch(`${this.baseURL}/workspace/invitations/accept`, {
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
      return data.data?.workspace || data.workspace;
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

  // Leave workspace (remove self)
  async leaveWorkspace(workspaceId) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/leave`, {
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
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/invitations/${invitationId}`, {
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
}

// Create singleton instance
const workspaceService = new WorkspaceService();

export default workspaceService;
