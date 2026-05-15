import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class HeygenService {
  async getAvatarLooks(params = {}) {
    try {
      const mergedParams = { limit: 50, ...params };
      const queryParams = new URLSearchParams(mergedParams).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.LOOKS}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatar looks: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Backend might wrap it in .data
    } catch (error) {
      console.error('Error fetching avatar looks:', error);
      throw error;
    }
  }

  async getAvatarGroups(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.GROUPS}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatar groups: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getAvatarGroups:', error);
      throw error;
    }
  }

  async createAvatar(payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE;
      const isFormData = payload instanceof FormData;
      
      const headers = getAuthHeaders();
      if (isFormData) {
        // Remove Content-Type so browser sets it with boundary
        delete headers['Content-Type'];
      }

      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: headers,
        body: isFormData ? payload : JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Athena VI API Error:', errorText);
        throw new Error(`Failed to create avatar: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.createAvatar:', error);
      throw error;
    }
  }

  async getAvatarConsent(groupId, rerouteUrl = '') {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE}/${groupId}/consent`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reroute_url: rerouteUrl })
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to get avatar consent: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getAvatarConsent:', error);
      throw error;
    }
  }

  async getVoices(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.VOICES.LIST}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getVoices:', error);
      throw error;
    }
  }

  async designVoice(payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VOICES.DESIGN;
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to design voice: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.designVoice:', error);
      throw error;
    }
  }

  async cloneVoice(payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VOICES.CLONE;
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to clone voice: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.cloneVoice:', error);
      throw error;
    }
  }

  async getVoiceStatus(voiceId) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.VOICES.STATUS}/${voiceId}`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getVoiceStatus:', error);
      throw error;
    }
  }

  async previewSpeech(payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VOICES.PREVIEW;
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to preview speech: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.previewSpeech:', error);
      throw error;
    }
  }

  // --- HeyGen Video Management (Project-specific) ---

  async generateVideo(workspaceId, projectId, payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VIDEOS.CREATE(workspaceId, projectId);
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to generate video: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data?.heygenVideo || data.heygenVideo || data;
    } catch (error) {
      console.error('Error in heygenService.generateVideo:', error);
      throw error;
    }
  }

  async listVideos(workspaceId, projectId) {
    try {
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to list HeyGen videos: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.heygenVideos || data.heygenVideos || [];
    } catch (error) {
      console.error('Error in heygenService.listVideos:', error);
      throw error;
    }
  }

  async getVideo(workspaceId, projectId, heygenVideoId) {
    try {
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch HeyGen video: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.heygenVideo || data.heygenVideo;
    } catch (error) {
      console.error('Error in heygenService.getVideo:', error);
      throw error;
    }
  }

  async downloadVideo(workspaceId, projectId, heygenVideoId, expiresIn = 300) {
    try {
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}/download?expiresIn=${expiresIn}`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Contains presignedUrl
    } catch (error) {
      console.error('Error in heygenService.downloadVideo:', error);
      throw error;
    }
  }

  getStreamUrl(workspaceId, projectId, heygenVideoId) {
    const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}/stream`;
    return buildUrl(endpoint);
  }

  async getS3Location(workspaceId, projectId, heygenVideoId) {
    try {
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}/s3-location`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get S3 location: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getS3Location:', error);
      throw error;
    }
  }
}

const heygenService = new HeygenService();
export default heygenService;
