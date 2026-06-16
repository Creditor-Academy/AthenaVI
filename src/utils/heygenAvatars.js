/** HeyGen avatar catalog helpers (groups → looks, Avatar IV filter). */

export const AVATAR_IV_ENGINE = 'avatar_iv';
export const AVATAR_V_ENGINE = 'avatar_v';

export const LOOK_ENGINE_FILTERS = {
  ALL: 'all',
  AVATAR_IV: 'avatar_iv',
  AVATAR_V: 'avatar_v',
  UNKNOWN: 'unknown',
};

export function normalizeAvatarEngine(engine) {
  if (!engine) return AVATAR_IV_ENGINE;
  const value = String(engine).toLowerCase();
  return value === AVATAR_V_ENGINE ? AVATAR_V_ENGINE : AVATAR_IV_ENGINE;
}

export function getLookSupportedEngines(look) {
  const raw =
    look?.supported_api_engines ??
    look?.supportedApiEngines ??
    look?.supportedEngines ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((e) => e === AVATAR_IV_ENGINE || e === AVATAR_V_ENGINE);
}

/** True when HeyGen did not declare engine compatibility on the look. */
export function isUnknownEngineLook(look) {
  return getLookSupportedEngines(look).length === 0;
}

/** True when the look explicitly supports Avatar IV or Avatar V generation. */
export function hasIvOrVEngineSupport(look) {
  return (
    supportsAvatarEngine(look, AVATAR_IV_ENGINE) ||
    supportsAvatarEngine(look, AVATAR_V_ENGINE)
  );
}

/** Looks safe to show in quick-create / generation flows (IV or V only). */
export function getIvOrVLooks(parsed, filter = LOOK_ENGINE_FILTERS.ALL) {
  if (!parsed) return [];

  if (filter === LOOK_ENGINE_FILTERS.AVATAR_IV) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_IV).filter(hasIvOrVEngineSupport);
  }
  if (filter === LOOK_ENGINE_FILTERS.AVATAR_V) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_V).filter(hasIvOrVEngineSupport);
  }

  const seen = new Set();
  const merged = [];
  const ivLooks = looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_IV);
  const vLooks = looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_V);

  [...ivLooks, ...vLooks].forEach((look) => {
    const id = getLookId(look) || look?.id;
    if (!id || seen.has(id) || !hasIvOrVEngineSupport(look)) return;
    seen.add(id);
    merged.push(look);
  });

  return merged;
}

export function groupHasSupportedLooks(parsed) {
  return getIvOrVLooks(parsed, LOOK_ENGINE_FILTERS.ALL).length > 0;
}

export function supportsAvatarEngine(item, engine) {
  const normalized = normalizeAvatarEngine(engine);
  const engines = getLookSupportedEngines(item);
  if (engines.length === 0) return false;
  return engines.includes(normalized);
}

/** Expressiveness only when Avatar IV is confirmed on the look (not unknown-engine fallback). */
export function canUseExpressiveness(look, resolvedEngine = null) {
  const engine = resolvedEngine
    ? normalizeAvatarEngine(resolvedEngine)
    : resolveAvatarEngine(look);
  const kind = look?.avatar_type ?? look?.avatarType ?? look?.avatarKind;
  if (engine !== AVATAR_IV_ENGINE || kind !== 'photo_avatar') return false;
  return supportsAvatarEngine(look, AVATAR_IV_ENGINE);
}

/** Look engine fields saved on scene.presenter for regenerate / expressiveness guards. */
export function getSceneLookEngineContext(scene) {
  const presenter = scene?.presenter || {};
  const supportedEngines = presenter.supportedEngines ?? scene?.supportedEngines ?? [];
  return {
    avatar_type: getSceneAvatarKind(scene),
    supportedEngines: Array.isArray(supportedEngines) ? supportedEngines : [],
    engineUnknown:
      presenter.engineUnknown ??
      scene?.engineUnknown ??
      (Array.isArray(supportedEngines) ? supportedEngines.length === 0 : true),
  };
}

/** Best engine for video create — respects look metadata and user preference. */
export function resolveAvatarEngine(look, preferredEngine = null) {
  const engines = getLookSupportedEngines(look);
  const preferred = preferredEngine ? normalizeAvatarEngine(preferredEngine) : null;

  if (preferred && engines.includes(preferred)) return preferred;
  if (engines.includes(AVATAR_IV_ENGINE)) return AVATAR_IV_ENGINE;
  if (engines.includes(AVATAR_V_ENGINE)) return AVATAR_V_ENGINE;

  const kind = look?.avatar_type ?? look?.avatarType ?? look?.avatarKind;
  if (kind === 'photo_avatar') return AVATAR_IV_ENGINE;
  return AVATAR_V_ENGINE;
}

export function parseAvatarLooksResponse(responseData) {
  const data = responseData?.data ?? responseData ?? {};
  const allLooks = extractHeygenList(responseData, ['avatar_looks', 'looks', 'avatars']);
  const engineBuckets = data.engineBuckets ?? {};

  const bucketIv = Array.isArray(engineBuckets.avatar_iv) ? engineBuckets.avatar_iv : [];
  const bucketV = Array.isArray(engineBuckets.avatar_v) ? engineBuckets.avatar_v : [];
  const bucketUnknown = Array.isArray(engineBuckets.unknown) ? engineBuckets.unknown : [];

  const engineCounts = data.engineCounts ?? {};
  const ivCount =
    engineCounts.avatar_iv ??
    (bucketIv.length || allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_IV_ENGINE)).length);
  const vCount =
    engineCounts.avatar_v ??
    (bucketV.length || allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_V_ENGINE)).length);
  const unknownCount =
    engineCounts.unknown ??
    (bucketUnknown.length || allLooks.filter(isUnknownEngineLook).length);

  return {
    allLooks,
    engineBuckets: {
      avatar_iv: bucketIv,
      avatar_v: bucketV,
      unknown: bucketUnknown,
    },
    engineCounts: {
      avatar_iv: ivCount,
      avatar_v: vCount,
      unknown: unknownCount,
      totalLooks: engineCounts.totalLooks ?? allLooks.length,
    },
    hasMore: !!(data?.has_more ?? responseData?.has_more),
    nextToken:
      data?.token ?? responseData?.token ?? data?.next_token ?? responseData?.next_token ?? null,
  };
}

export function looksForEngineFilter(parsed, filter) {
  const { allLooks, engineBuckets } = parsed;
  if (filter === LOOK_ENGINE_FILTERS.ALL) return allLooks;
  if (filter === LOOK_ENGINE_FILTERS.AVATAR_IV) {
    return engineBuckets.avatar_iv?.length
      ? engineBuckets.avatar_iv
      : allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_IV_ENGINE));
  }
  if (filter === LOOK_ENGINE_FILTERS.AVATAR_V) {
    return engineBuckets.avatar_v?.length
      ? engineBuckets.avatar_v
      : allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_V_ENGINE));
  }
  if (filter === LOOK_ENGINE_FILTERS.UNKNOWN) {
    return engineBuckets.unknown?.length
      ? engineBuckets.unknown
      : allLooks.filter(isUnknownEngineLook);
  }
  return allLooks;
}

export function mergeAvatarLooksPages(prev, nextPage) {
  const seen = new Set(prev.allLooks.map((l) => getLookId(l) || l?.id));
  const mergedLooks = [...prev.allLooks];
  nextPage.allLooks.forEach((look) => {
    const id = getLookId(look) || look?.id;
    if (id && !seen.has(id)) {
      seen.add(id);
      mergedLooks.push(look);
    }
  });

  const mergeBucket = (key) => {
    const a = prev.engineBuckets[key] || [];
    const b = nextPage.engineBuckets[key] || [];
    const bucketSeen = new Set(a.map((l) => getLookId(l) || l?.id));
    const out = [...a];
    b.forEach((look) => {
      const id = getLookId(look) || look?.id;
      if (id && !bucketSeen.has(id)) {
        bucketSeen.add(id);
        out.push(look);
      }
    });
    return out;
  };

  const engineBuckets = {
    avatar_iv: mergeBucket('avatar_iv'),
    avatar_v: mergeBucket('avatar_v'),
    unknown: mergeBucket('unknown'),
  };

  return {
    allLooks: mergedLooks,
    engineBuckets,
    engineCounts: {
      avatar_iv:
        engineBuckets.avatar_iv.length ||
        mergedLooks.filter((l) => supportsAvatarEngine(l, AVATAR_IV_ENGINE)).length,
      avatar_v:
        engineBuckets.avatar_v.length ||
        mergedLooks.filter((l) => supportsAvatarEngine(l, AVATAR_V_ENGINE)).length,
      unknown:
        engineBuckets.unknown.length || mergedLooks.filter(isUnknownEngineLook).length,
      totalLooks: mergedLooks.length,
    },
    hasMore: nextPage.hasMore,
    nextToken: nextPage.nextToken,
  };
}

/** Preview URL from a HeyGen look row. */
export function getLookPreviewUrl(look) {
  return (
    look?.preview_image_url ??
    look?.thumbnail_url ??
    look?.normal_image_url ??
    look?.image_url ??
    null
  );
}

/** Training / generation status when HeyGen exposes it. */
export function getLookTrainingStatus(look) {
  return look?.status ?? look?.training_status ?? look?.generation_status ?? null;
}

/** True when the look has a usable preview (poll until this is true). */
export function isLookReadyForUse(look) {
  if (!look) return false;
  const status = String(getLookTrainingStatus(look) || '').toLowerCase();
  if (status === 'failed' || status === 'error') return false;
  const preview = getLookPreviewUrl(look);
  if (!preview) return false;
  if (status === 'processing' || status === 'pending' || status === 'pending_consent') {
    return false;
  }
  return true;
}

export function mapLookTile(look, fallbackName = 'Look', fallbackImage = null) {
  const id = getLookId(look);
  const image = getLookPreviewUrl(look) || fallbackImage;
  return {
    id,
    name: look?.avatar_name ?? look?.name ?? fallbackName,
    image,
    status: getLookTrainingStatus(look),
    ready: isLookReadyForUse(look),
  };
}

export const LOOK_POLL_INTERVAL_MS = 10_000;
export const LOOK_MAX_WAIT_MS = 5 * 60_000;
export const LOOK_TYPICAL_WAIT_LABEL = '2–5 minutes';

/** Wrap user look prompt so HeyGen keeps identity tied to the reference avatar. */
export function buildPersonalAvatarLookPrompt(userPrompt, avatarName = 'your avatar') {
  const trimmed = String(userPrompt || '').trim();
  if (!trimmed) return '';

  const name = String(avatarName || 'your avatar').trim() || 'your avatar';
  const hasReferencePhrase = /reference avatar|same (person|identity|likeness|face)|identical to/i.test(trimmed);

  if (hasReferencePhrase) {
    return `${trimmed}. Same person as the reference avatar (${name}) — preserve facial identity and likeness.`;
  }

  return [
    `Create a new look for the same person as the reference avatar (${name}).`,
    'The face, identity, and likeness must remain the same as the reference avatar.',
    trimmed,
    'Same person as the reference avatar — identical facial features and identity.',
  ].join(' ');
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
    if (/^[0-9a-fA-F]{32}$/.test(id)) continue;
    if (id.startsWith('lk_') || id.length > 0) return id;
  }
  return null;
}

/** True when id is a HeyGen avatar group (ag_… or group UUID), not a look (lk_…). */
export function isAvatarGroupId(id) {
  if (!id) return false;
  const value = String(id);
  if (value.startsWith('lk_')) return false;
  if (value.startsWith('group-') || value.startsWith('group-more-')) return false;
  return true;
}

export function getGroupId(group) {
  const candidates = [group?.avatar_group_id, group?.group_id, group?.id];
  for (const raw of candidates) {
    if (!raw) continue;
    const id = String(raw);
    if (!isAvatarGroupId(id)) continue;
    return id;
  }
  return null;
}

export function mapAvatarGroup(group) {
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
  const supportedEngines = getLookSupportedEngines(look);
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
    supportedEngines,
    engineUnknown: supportedEngines.length === 0,
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
    if (/^[0-9a-fA-F]{32}$/.test(id)) continue;
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

export function parseAvatarCreateResponse(response, fallbackName = '') {
  const group = response?.avatar_group || response?.avatarGroup;
  const item = response?.avatar_item || response?.avatarItem;
  const groupId = getGroupId(group) || response?.avatar_group_id || null;
  const lookId = getLookId(item) || getLookId(response) || null;

  return {
    groupId,
    lookId,
    name: group?.name || item?.name || response?.name || fallbackName,
    previewImage:
      item?.preview_image_url ||
      item?.thumbnail_url ||
      group?.preview_image_url ||
      group?.thumbnail_url ||
      null,
  };
}
