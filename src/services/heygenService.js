import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class HeygenService {
  async getAvatarLooks(params = {}) {
    try {
      const mergedParams = { limit: 50, ...params };
      if (mergedParams.next_token && !mergedParams.token) {
        mergedParams.token = mergedParams.next_token;
        delete mergedParams.next_token;
      }

      // Automatically fetch all pages for a group_id
      if (mergedParams.group_id && mergedParams.getAllPages !== false) {
        let allLooks = [];
        let hasMore = true;
        let currentToken = mergedParams.token || null;
        const limit = mergedParams.limit || 50;

        while (hasMore) {
          const pageParams = {
            group_id: mergedParams.group_id,
            limit: limit,
          };
          if (currentToken) {
            pageParams.token = currentToken;
          }
          if (mergedParams.avatar_type) pageParams.avatar_type = mergedParams.avatar_type;
          if (mergedParams.ownership) pageParams.ownership = mergedParams.ownership;

          const queryParams = new URLSearchParams(pageParams).toString();
          const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.LOOKS}${queryParams ? `?${queryParams}` : ''}`;

          const response = await fetch(buildUrl(endpoint), {
            method: 'GET',
            headers: getAuthHeaders()
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch avatar looks: ${response.status}`);
          }

          const responseData = await response.json();
          const data = responseData.data || responseData;

          let lookList = [];
          if (Array.isArray(data)) {
            lookList = data;
          } else {
            lookList = data.data || data.looks || data.avatar_looks || [];
          }

          allLooks = [...allLooks, ...lookList];

          hasMore = !!(data.has_more ?? responseData.has_more);
          currentToken = data.token ?? responseData.token ?? data.next_token ?? responseData.next_token ?? null;

          if (!currentToken) {
            hasMore = false;
          }
        }

        return {
          data: allLooks,
          has_more: false,
          token: null
        };
      }

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
      return data.data || data;
    } catch (error) {
      console.error('Error fetching avatar looks:', error);
      throw error;
    }
  }

  async getAvatarGroups(params = {}) {
    try {
      // Backend validates pagination cursor as `token` (not `next_token`).
      const mergedParams = { ...params };
      if (mergedParams.next_token && !mergedParams.token) {
        mergedParams.token = mergedParams.next_token;
        delete mergedParams.next_token;
      }
      const queryParams = new URLSearchParams(mergedParams).toString();
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
      const fullUrl = buildUrl(endpoint);
      console.log('Athena VI: Fetching voices from...', fullUrl);

      const response = await fetch(fullUrl, {
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
      console.log('Athena VI: Calling cloneVoice API...', endpoint, payload);
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: await response.text() };
        }
        console.error('Athena VI: Clone Voice API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `Failed to clone voice: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.cloneVoice:', error);
      throw error;
    }
  }

  async selectVoice(voiceData) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VOICES.SELECT;
      const vId = typeof voiceData === 'string' ? voiceData : (voiceData.voice_id || voiceData.id);
      
      const payload = { 
        voiceId: vId, 
        voice_id: vId
      };
      
      console.log('Athena VI: Calling selectVoice API...', endpoint, payload);
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to select voice: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.selectVoice:', error);
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

  async generateVideo(workspaceId, projectId, input) {
    try {
      const {
        sceneId,
        avatarId,
        avatarEngine = 'avatar_iv',
        avatarType,
        title,
        resolution = '1080p',
        aspectRatio = '16:9',
        backgroundColor = '#008000',
        voiceId,
        script,
        expressiveness = 'medium',
        voiceSettings = {
          speed: 1,
          pitch: 0,
          locale: 'en-US'
        },
        removeBackground = false,
        outputFormat = 'mp4'
      } = input;

      const payload = {
        sceneId,
        avatarId,
        avatarEngine,
        title,
        resolution,
        aspectRatio,
        backgroundColor,
        voiceId,
        script,
        voiceSettings,
        removeBackground,
        outputFormat
      };

      if (avatarType) payload.avatarType = avatarType;
      // Expressiveness is only supported for avatar_iv + photo_avatar.
      if (avatarEngine === 'avatar_iv' && avatarType === 'photo_avatar' && expressiveness) {
        payload.expressiveness = expressiveness;
      }

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

  async getVideoBlobUrl(workspaceId, projectId, heygenVideoId) {
    try {
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}/stream`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video stream: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error in heygenService.getVideoBlobUrl:', error);
      throw error;
    }
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
