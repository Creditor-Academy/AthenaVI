import {
  extractHeygenList,
  getLookDefaultVoiceId,
  getLookPreviewUrl,
} from '../../utils/heygenAvatars';

/**
 * Build voice_id → avatar preview image from HeyGen look rows (default_voice_id).
 */
export function buildVoiceAvatarImageMap(looks) {
  const map = new Map();
  for (const look of looks || []) {
    const voiceId = getLookDefaultVoiceId(look);
    const image = getLookPreviewUrl(look);
    if (!voiceId || !image || map.has(voiceId)) continue;
    map.set(voiceId, image);
  }
  return map;
}

export function extractVoiceImageFromRow(voice) {
  if (!voice || typeof voice !== 'object') return null;
  return (
    voice.preview_image_url ||
    voice.avatar_image_url ||
    voice.thumbnail_url ||
    voice.image_url ||
    voice.avatar?.preview_image_url ||
    voice.avatar?.thumbnail_url ||
    null
  );
}

/**
 * Load public (or private) avatar looks and index by default voice id.
 */
export async function fetchVoiceAvatarImageMap(heygenService, options = {}) {
  const { ownership = 'public', limit = 100, maxPages = 4 } = options;
  const allLooks = [];
  let token = null;
  let page = 0;

  while (page < maxPages) {
    const params = { ownership, limit };
    if (token) params.token = token;

    const response = await heygenService.getAvatarLooks(params);
    const looks = extractHeygenList(response, ['avatar_looks', 'looks', 'data']);
    allLooks.push(...looks);

    const hasMore = !!(response?.has_more ?? response?.hasMore);
    token = response?.token ?? response?.next_token ?? null;
    page += 1;
    if (!hasMore || !token) break;
  }

  return buildVoiceAvatarImageMap(allLooks);
}

export function resolveVoiceImage(voice, imageMap) {
  const id = voice?.id || voice?.voice_id;
  const fromMap = id && imageMap?.get ? imageMap.get(String(id)) : null;
  return voice?.image || fromMap || extractVoiceImageFromRow(voice?.raw || voice) || null;
}
