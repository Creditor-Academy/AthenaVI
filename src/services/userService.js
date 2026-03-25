// User API Service
// This service handles all user-related API calls

// Import from existing API config to maintain consistency
import { buildUrl, getAuthHeaders } from '../config/api.js'

class UserService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
  }

  // Get user profile (only essential fields)
  async getUserProfile() {
    try {
      console.log('Fetching user profile from:', buildUrl('/api/user/profile'))
      
      const headers = getAuthHeaders()
      console.log('Request headers:', headers)
      console.log('Token from localStorage:', localStorage.getItem('accessToken'))
      
      const response = await fetch(buildUrl('/api/user/profile'), {
        method: 'GET',
        headers: headers
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required - Please log in again');
        }
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw response data:', data);
      console.log('Raw response data keys:', Object.keys(data));
      console.log('Data.profile:', data.profile);
      console.log('Data.user:', data.user);
      console.log('Data.data:', data.data);
      
      // Backend returns: {success: true, data: {profile: {...}}}
      // We need to extract the profile object from data.profile
      const profileData = data.data?.profile || data.profile || data.user || data.data || data || {
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        profileImage: data.profileImage || null
      };
      console.log('Processed profile data:', profileData);
      console.log('Profile data keys:', Object.keys(profileData));
      return profileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile (name, phoneNumber only)
  async updateUserProfile(profileData) {
    try {
      console.log('Updating user profile:', profileData);
      
      const response = await fetch(buildUrl('/api/user/profile'), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: profileData.name,
          phoneNumber: profileData.phoneNumber
        })
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid profile data');
        }
        throw new Error(`Failed to update user profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update response data:', data);
      
      // Backend returns data in profile field, not user field
      return data.profile || {
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        profileImage: data.profileImage || null
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file) {
    try {
      console.log('Uploading profile image:', file.name);
      
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData - browser will set it with boundary

      const response = await fetch(buildUrl('/api/user/upload/profile-image'), {
        method: 'POST',
        headers: headers,
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid file format or size');
        }
        if (response.status === 500) {
          // Try to get detailed error message for 500 errors
          const errorData = await response.json().catch(() => ({}));
          console.log('500 Error Details:', errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        throw new Error(`Failed to upload profile image: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      console.log('Upload response data keys:', Object.keys(data));
      console.log('Upload response data.data:', data.data);
      console.log('Upload response data.data.profile:', data.data?.profile);
      console.log('Upload response data.data.profileImage:', data.data?.profile?.profileImage);
      return data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage() {
    try {
      console.log('Deleting profile image...');
      
      const response = await fetch(buildUrl('/api/user/profile-image'), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete profile image');
        }
        throw new Error(`Failed to delete profile image: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete response data:', data);
      return data;
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      console.log('Fetching all users...');
      
      const response = await fetch(buildUrl('/api/user/getall'), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('Get all users response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('Get all users response data:', data);
      return data.users || data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Test API connection
  async testConnection() {
    try {
      console.log('Testing API connection to:', this.baseURL);
      console.log('Full URL being tested:', buildUrl('/'));
      
      const response = await fetch(buildUrl('/'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Test response status:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        console.log('Test response body:', text);
        return true;
      } else {
        console.log('Test response not ok:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return false;
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;
