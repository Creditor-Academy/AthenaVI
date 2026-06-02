/** HeyGen avatar catalog helpers (groups → looks, Avatar IV filter). */

export const AVATAR_IV_ENGINE = 'avatar_iv';
export const AVATAR_V_ENGINE = 'avatar_v';

export function normalizeAvatarEngine(engine) {
  if (!engine) return AVATAR_IV_ENGINE;
  const value = String(engine).toLowerCase();
  return value === AVATAR_V_ENGINE ? AVATAR_V_ENGINE : AVATAR_IV_ENGINE;
}

export function supportsAvatarEngine(item, engine) {
  const normalized = normalizeAvatarEngine(engine);
  const engines = item?.supported_api_engines ?? item?.supportedApiEngines ?? [];
  return Array.isArray(engines) && engines.includes(normalized);
}

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
  return supportsAvatarEngine(item, AVATAR_IV_ENGINE);
}

export function filterAvatarIvLooks(looks) {
  return (looks || []).filter(supportsAvatarIv);
}

export function filterAvatarLooksByEngine(looks, engine) {
  const normalized = normalizeAvatarEngine(engine);
  return (looks || []).filter((look) => supportsAvatarEngine(look, normalized));
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

const AVATAR_KINDS = new Set(['studio_avatar', 'photo_avatar', 'digital_twin']);

/** HeyGen look id (lk_…) — scene.avatarType historically stored the look id. */
export function getSceneAvatarLookId(scene) {
  if (!scene) return null;

  const candidates = [
    scene.avatarLookId,
    scene.presenter?.avatarId,
    scene.avatarType,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_')) continue;
    if (AVATAR_KINDS.has(id)) continue;
    return id;
  }

  return null;
}

/** studio_avatar | photo_avatar | digital_twin */
export function getSceneAvatarKind(scene) {
  if (!scene) return 'studio_avatar';

  return (
    scene.avatarKind ||
    scene.avatarTypeLabel ||
    scene.presenter?.avatarType ||
    (AVATAR_KINDS.has(scene.avatarType) ? scene.avatarType : null) ||
    'studio_avatar'
  );
}

export function buildHeygenAvatarContent(scene, clip = {}) {
  const existing =
    typeof clip.content === 'object' && clip.content !== null ? clip.content : {};
  const previewSrc =
    clip.src && !String(clip.src).startsWith('blob:') ? clip.src : existing.previewSrc || existing.src;
  const lookId = getSceneAvatarLookId(scene) ?? existing.avatarId;

  const content = {
    ...existing,
    provider: 'heygen',
    sceneId: scene.sceneId ?? scene.id,
    avatarId: lookId,
    voiceId: scene.voiceId ?? existing.voiceId,
    script: scene.script ?? existing.script ?? '',
    heygenVideoId: scene.heygenVideoId ?? scene.generation?.heygenVideoId ?? existing.heygenVideoId,
  };

  if (previewSrc && !String(previewSrc).startsWith('blob:')) {
    content.previewSrc = previewSrc;
  }

  return content;
}
