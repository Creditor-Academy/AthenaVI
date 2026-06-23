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
  canUploadFileAsHeygenUrl,
  HEYGEN_SOURCE_MAX_BYTES,
  HEYGEN_VOICE_MAX_BYTES,
  uploadFileAsHeygenUrl,
  uploadFormDataWithProgress,
  WORKSPACE_ASSET_MAX_BYTES,
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

const MISSING_ROUTE_STATUSES = new Set([404, 405, 501]);
let avatarUploadRouteAvailable = null;
let voiceUploadRouteAvailable = null;

function isHeygenUploadRouteMissing(status) {
  return MISSING_ROUTE_STATUSES.has(status);
}

function extractVoiceId(result) {
  if (!result || typeof result !== 'object') return null;
  return (
    result.voice_id ||
    result.voiceId ||
    result.voice_clone_id ||
    result.id ||
    result.data?.voice_id ||
    result.data?.voiceId ||
    null
  );
}

async function throwIfHeygenResponseFailed(response, fallbackLabel = 'Request') {
  if (response.ok) return;

  const errorText = await response.text();
  let errorData = {};
  try {
    errorData = errorText ? JSON.parse(errorText) : {};
  } catch {
    errorData = { message: errorText };
  }

  const message =
    errorData.message ||
    errorData.error ||
    (Array.isArray(errorData.errors) && errorData.errors.length
      ? errorData.errors.join(' ')
      : `${fallbackLabel} failed: ${response.status}`);

  if (response.status === 413) {
    throw userError(
      'File is too large to send inside JSON. Upload the file first, then create with file.type "url".'
    );
  }

  if (response.status === 402) {
    throw new InsufficientCreditsError(sanitizeUserFacingMessage(message), errorData);
  }

  if (response.status === 403) {
    throw userError(message || 'You do not have permission for this action. Try signing in again.');
  }

  throw userError(`${fallbackLabel} failed: ${response.status} - ${message}`);
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
      const fileField = payload?.file;
      if (fileField?.type === 'base64' || fileField?.data) {
        throw userError(
          'Do not send training media as base64 in JSON. Upload via POST /api/heygen/avatars/upload first, then use file.type "url".'
        );
      }

      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.CREATE;
      const headers = {
        ...authOnlyHeaders(),
        'Content-Type': 'application/json',
      };

      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      await throwIfHeygenResponseFailed(response, 'Failed to create avatar');

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error in heygenService.createAvatar:', error);
      throw sanitizeThrownError(error);
    }
  }

  /**
   * Probe whether the dedicated HeyGen multipart upload route is deployed.
   * Cached for the session — 404/405/501 means not available.
   */
  async isHeygenUploadRouteAvailable(kind = 'avatar') {
    const cache = kind === 'voice' ? voiceUploadRouteAvailable : avatarUploadRouteAvailable;
    if (cache != null) return cache;

    const endpoint =
      kind === 'voice'
        ? API_CONFIG.ENDPOINTS.HEYGEN.VOICES.UPLOAD
        : API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.UPLOAD;

    let available = false;
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: authOnlyHeaders(),
      });
      available = !isHeygenUploadRouteMissing(response.status);
    } catch {
      available = false;
    }

    if (kind === 'voice') voiceUploadRouteAvailable = available;
    else avatarUploadRouteAvailable = available;
    return available;
  }

  formatLargeUploadBlockedMessage(fileSizeBytes) {
    const sizeMb = Math.max(1, Math.round(fileSizeBytes / (1024 * 1024)));
    const limitMb = Math.round(WORKSPACE_ASSET_MAX_BYTES / (1024 * 1024));
    return (
      `Your file is about ${sizeMb} MB, but large uploads are not enabled on the server yet ` +
      `(only files up to ${limitMb} MB work without it). ` +
      'Use POST /api/heygen/avatars/upload for training videos, or ask your administrator to enable file uploads.'
    );
  }

  /**
   * Upload avatar / voice source via multipart (never base64 in JSON).
   * Prefers POST /api/heygen/avatars|voices/upload; falls back to workspace
   * asset upload for files ≤ 50 MB when the HeyGen upload route is not deployed.
   */
  async uploadHeygenSourceFile(file, kind = 'avatar', { onProgress } = {}) {
    if (!file) {
      throw userError('A file is required for upload.');
    }

    const maxBytes = kind === 'voice' ? HEYGEN_VOICE_MAX_BYTES : HEYGEN_SOURCE_MAX_BYTES;
    if (file.size > maxBytes) {
      const limitMb = Math.round(maxBytes / (1024 * 1024));
      throw userError(`File exceeds the ${limitMb} MB upload limit.`);
    }

    const endpoint =
      kind === 'voice'
        ? API_CONFIG.ENDPOINTS.HEYGEN.VOICES.UPLOAD
        : API_CONFIG.ENDPOINTS.HEYGEN.AVATARS.UPLOAD;

    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = buildUrl(endpoint);
    const headers = authOnlyHeaders();

    let response;
    let responseJson;

    if (onProgress) {
      try {
        const xhrResult = await uploadFormDataWithProgress({
          url: uploadUrl,
          formData,
          headers,
          onProgress,
        });
        response = { ok: true, status: xhrResult.status };
        responseJson = xhrResult.data;
      } catch (xhrError) {
        response = { ok: false, status: xhrError.status || 0 };
        responseJson = xhrError.data || { message: xhrError.message };
      }
    } else {
      response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      });
      responseJson = await response.json().catch(() => ({}));
    }

    if (response.ok) {
      const payload = responseJson.data || responseJson;
      const url = payload.url;
      if (!url) {
        throw userError('Upload succeeded but no file URL was returned.');
      }
      return url;
    }

    const status = response.status;
    const missingHeygenUpload = isHeygenUploadRouteMissing(status);
    if (missingHeygenUpload) {
      if (kind === 'voice') voiceUploadRouteAvailable = false;
      else avatarUploadRouteAvailable = false;
    }

    if (missingHeygenUpload && canUploadFileAsHeygenUrl(file)) {
      console.warn(
        `HeyGen ${kind} upload route unavailable (${status}); using workspace asset upload.`
      );
      const { url } = await uploadFileAsHeygenUrl(file);
      return url;
    }

    if (missingHeygenUpload) {
      throw userError(this.formatLargeUploadBlockedMessage(file.size));
    }

    const errorText = responseJson?.message || JSON.stringify(responseJson);
    console.error('Athena VI upload error:', errorText);
    throw userError(`Failed to upload file: ${status}`);
  }

  /**
   * Avatar create from a local file: multipart upload → small JSON with file URL.
   * Never embeds base64 in the create request.
   */
  async createAvatarFromFile({ type, name, file, onUploadProgress, ...extra }) {
    if (!file) {
      throw userError('A file is required to create this avatar.');
    }
    if (!type || !name) {
      throw userError('Avatar type and name are required.');
    }

    const url = await this.uploadHeygenSourceFile(file, 'avatar', {
      onProgress: onUploadProgress,
    });

    return this.createAvatar({
      type,
      name,
      file: buildHeygenUrlAsset(url),
      ...extra,
    });
  }

  /**
   * Clone voice from a local file: multipart upload → small JSON with audio URL.
   * Never embeds base64 in the clone request.
   */
  async cloneVoiceFromFile({
    voiceName,
    file,
    language,
    removeBackgroundNoise = true,
    onUploadProgress,
    pollUntilReady = true,
    onCloneStatus,
  }) {
    if (!voiceName?.trim()) {
      throw userError('A voice name is required.');
    }
    if (!file) {
      throw userError('An audio sample is required to clone a voice.');
    }

    const url = await this.uploadHeygenSourceFile(file, 'voice', {
      onProgress: onUploadProgress,
    });

    const cloneResult = await this.cloneVoice({
      voice_name: voiceName.trim(),
      voiceName: voiceName.trim(),
      audio: buildHeygenUrlAsset(url),
      remove_background_noise: removeBackgroundNoise,
      removeBackgroundNoise,
      ...(language ? { language } : {}),
    });

    const voiceId = extractVoiceId(cloneResult);
    if (pollUntilReady && voiceId) {
      return this.pollVoiceCloneUntilReady(voiceId, { onProgress: onCloneStatus });
    }
    return cloneResult;
  }

  async pollVoiceCloneUntilReady(
    voiceId,
    { intervalMs = 5000, timeoutMs = 180000, onProgress } = {}
  ) {
    if (!voiceId) {
      throw userError('Voice id is required to check clone status.');
    }

    const deadline = Date.now() + timeoutMs;
    let lastStatus = null;

    while (Date.now() < deadline) {
      const result = await this.getVoiceStatus(voiceId);
      const status = String(result?.status || result?.data?.status || '').toLowerCase();
      lastStatus = status;
      onProgress?.(result, status);

      if (['completed', 'ready', 'success', 'active'].includes(status)) {
        return result;
      }
      if (['failed', 'error', 'rejected'].includes(status)) {
        throw userError(result?.message || 'Voice clone failed. Try a clearer MP3 or WAV sample.');
      }
      if (status && status !== 'processing' && status !== 'pending') {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw userError(
      lastStatus === 'processing' || lastStatus === 'pending'
        ? 'Voice clone is still processing. Check My Voices in a few minutes.'
        : 'Timed out waiting for voice clone to finish.'
    );
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
      const audioField = payload?.audio;
      if (audioField?.type === 'base64' || audioField?.data) {
        throw userError(
          'Do not send clone audio as base64 in JSON. Upload via POST /api/heygen/voices/upload first, then use audio.type "url".'
        );
      }

      const endpoint = API_CONFIG.ENDPOINTS.HEYGEN.VOICES.CLONE;
      console.log('Athena VI: Calling cloneVoice API...', endpoint, payload);
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      await throwIfHeygenResponseFailed(response, 'Failed to clone voice');

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
