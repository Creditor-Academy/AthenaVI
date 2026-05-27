/** HeyGen avatar catalog helpers (groups → looks, Avatar IV filter). */

export const AVATAR_IV_ENGINE = 'avatar_iv';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x400?text=Avatar';

export function extractHeygenList(response, keys = []) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
}

export function supportsAvatarIv(item) {
  const engines = item?.supported_api_engines ?? item?.supportedApiEngines ?? [];
  return Array.isArray(engines) && engines.includes(AVATAR_IV_ENGINE);
}

export function filterAvatarIvLooks(looks) {
  return (looks || []).filter(supportsAvatarIv);
}

/** Look row id (lk_…) — never use group id (ag_…) for video create. */
export function getLookId(look) {
  const candidates = [look?.id, look?.look_id, look?.avatar_look_id, look?.avatar_id];
  for (const raw of candidates) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_')) continue;
    if (id.startsWith('lk_') || id.length > 0) return id;
  }
  return null;
}

export function getGroupId(group) {
  return group?.avatar_group_id ?? group?.group_id ?? group?.id ?? null;
}

export function mapAvatarGroup(group, index = 0) {
  const id = getGroupId(group);
  return {
    id,
    name: group?.name ?? group?.group_name ?? 'AI Presenter',
    image:
      group?.preview_image_url ??
      group?.thumbnail_url ??
      group?.normal_image_url ??
      group?.image_url ??
      PLACEHOLDER_IMAGE,
    subtitle: group?.description ?? group?.style ?? '',
  };
}

export function mapAvatarLook(look, fallbackName = 'Look') {
  const id = getLookId(look);
  return {
    id,
    groupId: look?.avatar_group_id ?? look?.group_id ?? null,
    name: look?.avatar_name ?? look?.name ?? fallbackName,
    image:
      look?.preview_image_url ??
      look?.thumbnail_url ??
      look?.normal_image_url ??
      look?.image_url ??
      PLACEHOLDER_IMAGE,
    avatarType: look?.avatar_type ?? look?.avatarType ?? null,
    supportedEngines: look?.supported_api_engines ?? look?.supportedApiEngines ?? [],
  };
}

export function formatAvatarTypeLabel(type) {
  if (!type) return '';
  const labels = {
    studio_avatar: 'Studio',
    photo_avatar: 'Photo',
    digital_twin: 'Digital Twin',
  };
  return labels[type] || type.replace(/_/g, ' ');
}

export function buildHeygenAvatarContent(scene, clip = {}) {
  const existing =
    typeof clip.content === 'object' && clip.content !== null ? clip.content : {};
  const previewSrc =
    clip.src && !String(clip.src).startsWith('blob:') ? clip.src : existing.src;

  return {
    ...existing,
    provider: 'heygen',
    sceneId: scene.sceneId ?? scene.id,
    avatarId: scene.avatarType ?? existing.avatarId,
    voiceId: scene.voiceId ?? existing.voiceId,
    script: scene.script ?? existing.script ?? '',
    heygenVideoId: scene.heygenVideoId ?? existing.heygenVideoId,
    ...(previewSrc ? { src: previewSrc } : {}),
  };
}
