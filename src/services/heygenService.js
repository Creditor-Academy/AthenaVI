import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';
import { InsufficientCreditsError } from './creditsService.js';
import {
  AVATAR_IV_ENGINE,
  isLegacyV2Look,
  finalizeVideoCreatePayload,
} from '../utils/heygenAvatars.js';
import { sanitizeUserFacingMessage } from '../utils/userFacingMessage.js';
import {
  buildHeygenUrlAsset,
  HEYGEN_SOURCE_MAX_BYTES,
} from '../utils/heygenAssetUpload.js';

function authOnlyHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function userError(message) {
  return new Error(sanitizeUserFacingMessage(message));
}

function sanitizeThrownError(error) {
  if (error?.message) {
    error.message = sanitizeUserFacingMessage(error.message);
  }
  return error;
}

const LOOKS_QUERY_KEYS = new Set([
  'group_id',
  'avatar_type',
  'ownership',
  'limit',
  'token',
]);

function buildLooksQueryParams(params = {}) {
  const pageParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (!LOOKS_QUERY_KEYS.has(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    pageParams[key] = value;
  }
  if (!pageParams.limit) pageParams.limit = 50;
  return pageParams;
}

function emptyLooksPage() {
  return {
    data: [],
    avatar_looks: [],
    looks: [],
    has_more: false,
    token: null,
  };
}

function extractLooksList(data) {
  if (Array.isArray(data)) return data;
  return data?.data || data?.looks || data?.avatar_looks || [];
}

class HeygenService {
  async getAvatarLooks(params = {}) {
    const { getAllPages = false, allowEmptyGroup = true, ...rawParams } = params;
    const mergedParams = { limit: 50, ...rawParams };
    if (mergedParams.next_token && !mergedParams.token) {
      mergedParams.token = mergedParams.next_token;
      delete mergedParams.next_token;
    }

    const fetchLooksPage = async (pageParams) => {
      const queryParams = new URLSearchParams(buildLooksQueryParams(pageParams)).toString();
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.LOOKS}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (
          allowEmptyGroup &&
          pageParams.group_id &&
          (response.status === 400 || response.status === 404)
        ) {
          return emptyLooksPage();
        }
        throw userError(`Failed to fetch avatar looks: ${response.status}`);
      }

      const responseData = await response.json();
      const payload = responseData.data ?? responseData;
      if (Array.isArray(payload)) {
        return {
          looks: payload,
          avatar_looks: payload,
          lookCount: payload.length,
          has_more: responseData.has_more ?? responseData.hasMore ?? false,
          token: responseData.token ?? responseData.next_token ?? null,
        };
      }
      if (payload && typeof payload === 'object') {
        const looks = payload.looks ?? payload.avatar_looks;
        const lookCount =
          payload.lookCount ??
          payload.look_count ??
          responseData.lookCount ??
          responseData.look_count ??
          (Array.isArray(looks) ? looks.length : undefined);
        if (lookCount != null && payload.lookCount == null) {
          return { ...payload, lookCount };
        }
      }
      return payload;
    };

    try {
      if (mergedParams.group_id && getAllPages) {
        let allLooks = [];
        let hasMore = true;
        let currentToken = mergedParams.token || null;
        const limit = mergedParams.limit || 50;

        while (hasMore) {
          const pageParams = {
            group_id: mergedParams.group_id,
            limit,
          };
          if (currentToken) pageParams.token = currentToken;
          if (mergedParams.avatar_type) pageParams.avatar_type = mergedParams.avatar_type;
          if (mergedParams.ownership) pageParams.ownership = mergedParams.ownership;

          const data = await fetchLooksPage(pageParams);
          allLooks = [...allLooks, ...extractLooksList(data)];

          hasMore = !!(data?.has_more ?? data?.hasMore);
          currentToken = data?.token ?? data?.next_token ?? null;
          if (!currentToken) hasMore = false;
        }

        return {
          data: allLooks,
          avatar_looks: allLooks,
          has_more: false,
          token: null,
        };
      }

      const pageParams = buildLooksQueryParams(mergedParams);
      return fetchLooksPage(pageParams);
    } catch (error) {
      console.error('Error fetching avatar looks:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to fetch avatar groups: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getAvatarGroups:', error);
      throw sanitizeThrownError(error);
    }
  }

  async createAvatar(payload) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE;
      const isFormData = payload instanceof FormData;
      const headers = authOnlyHeaders();
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Athena VI API Error:', errorText);
        throw userError(`Failed to create avatar: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.createAvatar:', error);
      throw sanitizeThrownError(error);
    }
  }

  /**
   * Upload avatar / voice source via multipart (never base64 in JSON).
   */
  async uploadHeygenSourceFile(file, kind = 'avatar') {
    if (!file) {
      throw userError('A file is required for upload.');
    }
    if (file.size > HEYGEN_SOURCE_MAX_BYTES) {
      throw userError('File exceeds the 900 MB upload limit.');
    }

    const endpoint =
      kind === 'voice'
        ? API_CONFIG.ENDPOINTS.HEYGEN.VOICES.UPLOAD
        : API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.UPLOAD;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: authOnlyHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Athena VI upload error:', errorText);
      throw userError(`Failed to upload file: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const payload = data.data || data;
    const url = payload.url;
    if (!url) {
      throw userError('Upload succeeded but no file URL was returned.');
    }
    return url;
  }

  /**
   * Two-step avatar create: multipart upload → small JSON body with file URL.
   */
  async createAvatarFromFile({ type, name, file, ...extra }) {
    if (!file) {
      throw userError('A file is required to create this avatar.');
    }
    if (!type || !name) {
      throw userError('Avatar type and name are required.');
    }

    const url = await this.uploadHeygenSourceFile(file, 'avatar');
    return this.createAvatar({
      type,
      name,
      file: buildHeygenUrlAsset(url),
      ...extra,
    });
  }

  /**
   * Clone voice using a hosted audio URL instead of base64 in the JSON body.
   */
  async cloneVoiceFromFile({ voiceName, file, language, removeBackgroundNoise = true }) {
    if (!voiceName?.trim()) {
      throw userError('A voice name is required.');
    }
    if (!file) {
      throw userError('An audio sample is required to clone a voice.');
    }

    const url = await this.uploadHeygenSourceFile(file, 'voice');
    return this.cloneVoice({
      voice_name: voiceName.trim(),
      voiceName: voiceName.trim(),
      audio: buildHeygenUrlAsset(url),
      remove_background_noise: removeBackgroundNoise,
      removeBackgroundNoise,
      ...(language ? { language } : {}),
    });
  }

  /**
   * Add a new prompt look to an existing personal avatar group.
   * Uses avatar_group_id + reference_image_url; avatar_id (look) is optional when available.
   */
  async createAvatarLook({ name, prompt, avatarGroupId, avatarId, referenceImageUrl }) {
    if (!avatarGroupId) {
      throw userError('Avatar group id is required to create a look');
    }
    if (!referenceImageUrl) {
      throw userError('Reference avatar image is required to create a look');
    }
    if (!name?.trim()) {
      throw userError('Look name is required');
    }
    if (!prompt?.trim()) {
      throw userError('Prompt is required to generate a look');
    }

    const payload = {
      type: 'prompt',
      name: name.trim(),
      prompt: prompt.trim(),
      avatar_group_id: String(avatarGroupId),
      reference_image_url: String(referenceImageUrl),
    };
    if (avatarId) payload.avatar_id = String(avatarId);

    return this.createAvatar(payload);
  }

  buildConsentRerouteUrl(groupId) {
    if (typeof window === 'undefined' || !groupId) return '';
    const params = new URLSearchParams({ consent: 'done', groupId: String(groupId) });
    return `${window.location.origin}/avatars?${params.toString()}`;
  }

  async getAvatarGroup(groupId) {
    if (!groupId) return null;

    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE}/${groupId}`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.warn('heygenService.getAvatarGroup direct fetch failed, falling back to list', error);
    }

    try {
      const listRes = await this.getAvatarGroups({ ownership: 'private', limit: 100 });
      const data = listRes?.data ?? listRes;
      const groups = Array.isArray(data)
        ? data
        : data?.avatar_groups ?? listRes?.avatar_groups ?? [];
      return (
        groups.find(
          (group) => String(group?.id || group?.avatar_group_id) === String(groupId)
        ) ?? null
      );
    } catch (error) {
      console.error('Error in heygenService.getAvatarGroup fallback:', error);
      return null;
    }
  }

  async getAvatarConsent(groupId, rerouteUrl) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE}/${groupId}/consent`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reroute_url: rerouteUrl || this.buildConsentRerouteUrl(groupId),
        }),
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw userError(`Failed to get avatar consent: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getAvatarConsent:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getVoices:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to design voice: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.designVoice:', error);
      throw sanitizeThrownError(error);
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
        throw userError(errorData.message || errorData.error || `Failed to clone voice: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.cloneVoice:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to select voice: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.selectVoice:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to fetch voice status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getVoiceStatus:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to preview speech: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.previewSpeech:', error);
      throw sanitizeThrownError(error);
    }
  }

  // --- HeyGen Video Management (Project-specific) ---

  async generateVideo(workspaceId, projectId, input) {
    try {
      const {
        sceneId,
        avatarId,
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
        outputFormat = 'mp4',
        supportedEngines,
        isLegacyV2,
      } = input;

      const avatarKind = avatarType || 'studio_avatar';
      const avatarEngine = finalizeVideoCreatePayload({
        avatarId,
        avatarType: avatarKind,
        avatarEngine: input.avatarEngine,
        isLegacyV2,
        supportedEngines,
      });

      const payload = {
        sceneId,
        avatarId,
        avatarType: avatarKind,
        avatarEngine,
        title,
        resolution,
        aspectRatio,
        backgroundColor,
        voiceId,
        script,
        voiceSettings,
        removeBackground,
        outputFormat,
      };

      // Expressiveness: photo_avatar + Avatar IV only (backend shouldIncludeExpressiveness).
      if (
        avatarEngine === AVATAR_IV_ENGINE &&
        avatarKind === 'photo_avatar' &&
        expressiveness &&
        !isLegacyV2Look({ id: avatarId, isLegacyV2 })
      ) {
        payload.expressiveness = expressiveness;
      }

      if (import.meta.env?.DEV) {
        console.log('[HeyGen] create video', {
          avatarId,
          avatarType: avatarKind,
          avatarEngine,
          isLegacyV2: isLegacyV2Look({ id: avatarId, isLegacyV2 }),
        });
      }

      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VIDEOS.CREATE(workspaceId, projectId);
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.status === 402) {
        const payload = await response.json().catch(() => ({}));
        throw new InsufficientCreditsError(
          sanitizeUserFacingMessage(payload.message || 'Insufficient workspace credits for video generation'),
          payload
        );
      }

      if (!response.ok) {
        const errText = await response.text();
        throw userError(`Failed to generate video: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.data?.heygenVideo || data.heygenVideo || data;
    } catch (error) {
      console.error('Error in heygenService.generateVideo:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to list avatar videos: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.heygenVideos || data.heygenVideos || [];
    } catch (error) {
      console.error('Error in heygenService.listVideos:', error);
      throw sanitizeThrownError(error);
    }
  }

  /**
   * @param {{ sync?: false | 'status' | 'full' }} [options]
   * - false: fast DB read (between polls)
   * - 'status': refresh HeyGen status (default for generation polling)
   * - 'full': blocks on S3 — export/render only, not canvas polling
   */
  async getVideo(workspaceId, projectId, heygenVideoId, options = {}) {
    try {
      const sync = options.sync ?? 'status';
      const query =
        sync === false ? '?sync=false' : sync === 'full' ? '?sync=full' : '?sync=status';
      const endpoint = `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos/${heygenVideoId}${query}`;
      const response = await fetch(buildUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw userError(`Failed to fetch avatar video: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.heygenVideo || data.heygenVideo;
    } catch (error) {
      console.error('Error in heygenService.getVideo:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to get download URL: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Contains presignedUrl
    } catch (error) {
      console.error('Error in heygenService.downloadVideo:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to fetch video stream: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error in heygenService.getVideoBlobUrl:', error);
      throw sanitizeThrownError(error);
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
        throw userError(`Failed to get S3 location: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.getS3Location:', error);
      throw sanitizeThrownError(error);
    }
  }
}

const heygenService = new HeygenService();
export default heygenService;
