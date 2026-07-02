/** HeyGen avatar catalog helpers (groups → looks, Avatar IV filter). */

import { getCenteredAvatarPlacement } from './heygenVideo.js';

export const AVATAR_IV_ENGINE = 'avatar_iv';
export const AVATAR_V_ENGINE = 'avatar_v';
export const LEGACY_V2_ENGINE = 'legacy_v2';

export const LOOK_ENGINE_FILTERS = {
  ALL: 'all',
  AVATAR_IV: 'avatar_iv',
  AVATAR_V: 'avatar_v',
  LEGACY_V2: 'legacy_v2',
  UNKNOWN: 'unknown',
};

export function normalizeAvatarEngine(engine) {
  if (!engine) return AVATAR_IV_ENGINE;
  const value = String(engine).toLowerCase();
  if (value === LEGACY_V2_ENGINE) return LEGACY_V2_ENGINE;
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

export function lookInEngineBucket(look, bucketKey, parsed) {
  const bucket = parsed?.engineBuckets?.[bucketKey];
  if (!Array.isArray(bucket)) return false;
  const id = getLookId(look) || look?.id;
  if (!id) return false;
  return bucket.some((item) => (getLookId(item) || item?.id) === id);
}

/** Expressive studio looks routed to HeyGen v2 (empty supported_api_engines). */
export function isLegacyV2Look(look, parsed = null) {
  if (!look) return false;
  if (look.isLegacyV2 || look.generatableEngine === LEGACY_V2_ENGINE) return true;
  if (parsed && lookInEngineBucket(look, 'legacy_v2', parsed)) return true;
  const id = String(getLookId(look) || look?.id || '');
  if (/_expressive/i.test(id)) return true;
  return /_expressive\d*_public$/i.test(id);
}

/** True when HeyGen transparent WebM (alpha) is allowed for this look. */
export function supportsTransparentWebm(look) {
  if (!look) return false;
  if (look.usesLegacyV2Video === true) return false;
  if (String(look.videoApi || '').toLowerCase() === 'v2') return false;
  if (isLegacyV2Look(look)) return false;
  return true;
}

export function isGeneratableLook(look, parsed = null) {
  if (!look) return false;
  if (isLegacyV2Look(look, parsed)) return true;
  return hasIvOrVEngineSupport(look);
}

/** Looks available for video generation (IV, V, and expressive legacy_v2). */
export function getGeneratableLooks(parsed, filter = LOOK_ENGINE_FILTERS.ALL) {
  if (!parsed) return [];

  if (filter === LOOK_ENGINE_FILTERS.LEGACY_V2) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.LEGACY_V2);
  }
  if (filter === LOOK_ENGINE_FILTERS.AVATAR_IV) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_IV).filter(hasIvOrVEngineSupport);
  }
  if (filter === LOOK_ENGINE_FILTERS.AVATAR_V) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_V).filter(hasIvOrVEngineSupport);
  }
  if (filter === LOOK_ENGINE_FILTERS.UNKNOWN) {
    return looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.UNKNOWN);
  }

  const seen = new Set();
  const merged = [];
  [
    ...looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_IV),
    ...looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.AVATAR_V),
    ...looksForEngineFilter(parsed, LOOK_ENGINE_FILTERS.LEGACY_V2),
  ].forEach((look) => {
    const id = getLookId(look) || look?.id;
    if (!id || seen.has(id) || !isGeneratableLook(look, parsed)) return;
    seen.add(id);
    merged.push(look);
  });
  return merged;
}

/** @deprecated Use getGeneratableLooks — kept for existing imports. */
export function getIvOrVLooks(parsed, filter = LOOK_ENGINE_FILTERS.ALL) {
  return getGeneratableLooks(parsed, filter);
}

export function groupHasSupportedLooks(parsed) {
  return getGeneratableLooks(parsed, LOOK_ENGINE_FILTERS.ALL).length > 0;
}

export function getGeneratableLookCount(parsed) {
  if (!parsed) return 0;
  const declared = getParsedLookCount(parsed);
  if (declared > 0) return declared;
  const counts = parsed.engineCounts ?? {};
  return (counts.avatar_iv ?? 0) + (counts.avatar_v ?? 0) + (counts.legacy_v2 ?? 0);
}

export function supportsAvatarEngine(item, engine) {
  const normalized = normalizeAvatarEngine(engine);
  const engines = getLookSupportedEngines(item);
  if (engines.length === 0) return false;
  return engines.includes(normalized);
}

/** Expressiveness only when Avatar IV is confirmed on the look (not unknown-engine fallback). */
export function canUseExpressiveness(look, resolvedEngine = null) {
  if (isLegacyV2Look(look)) return false;
  const engine = resolvedEngine
    ? normalizeAvatarEngine(resolvedEngine)
    : resolveAvatarEngine(look);
  if (engine === LEGACY_V2_ENGINE) return false;
  const kind = look?.avatar_type ?? look?.avatarType ?? look?.avatarKind;
  if (engine !== AVATAR_IV_ENGINE || kind !== 'photo_avatar') return false;
  return supportsAvatarEngine(look, AVATAR_IV_ENGINE);
}

/** Look engine fields saved on scene.presenter for regenerate / expressiveness guards. */
export function getSceneLookEngineContext(scene) {
  const presenter = scene?.presenter || {};
  const lookId = getSceneAvatarLookId(scene);
  const supportedEngines = presenter.supportedEngines ?? scene?.supportedEngines ?? [];
  const isLegacyV2 =
    presenter.isLegacyV2 ?? scene?.isLegacyV2 ?? isLegacyV2Look({ id: lookId });
  return {
    id: lookId,
    avatar_type: getSceneAvatarKind(scene),
    supportedEngines: Array.isArray(supportedEngines) ? supportedEngines : [],
    isLegacyV2,
    engineUnknown:
      presenter.engineUnknown ??
      scene?.engineUnknown ??
      (Array.isArray(supportedEngines) ? supportedEngines.length === 0 : true),
  };
}

/** Best engine for video create — respects look metadata and user preference. */
export function resolveAvatarEngine(look, preferredEngine = null, parsed = null) {
  return resolveVideoAvatarEngine({
    avatarLookId: getLookId(look) || look?.id,
    avatarType: look?.avatar_type ?? look?.avatarType,
    avatarEngine: preferredEngine,
    supportedEngines: look?.supportedEngines ?? getLookSupportedEngines(look),
    isLegacyV2: look?.isLegacyV2 ?? isLegacyV2Look(look, parsed),
    parsed,
  });
}

/**
 * Engine for video create + persisted presenter (API only accepts avatar_iv | avatar_v).
 * Expressive looks: send avatar_iv — backend resolveVideoPlanForLook routes to HeyGen v2.
 * Avatar V only for photo_avatar looks that explicitly list avatar_v in supported_api_engines.
 */
export function resolveVideoAvatarEngine(context = {}) {
  const lookId = context.avatarLookId || context.avatarId || context.id;
  const avatarType = context.avatarType ?? context.avatar_type ?? null;

  const look = {
    id: lookId,
    avatar_type: avatarType,
    supportedEngines: context.supportedEngines,
    supported_api_engines: context.supportedEngines,
    isLegacyV2: context.isLegacyV2,
  };

  if (isLegacyV2Look(look, context.parsed)) {
    return AVATAR_IV_ENGINE;
  }

  if (!avatarType || avatarType === 'studio_avatar') {
    return AVATAR_IV_ENGINE;
  }

  const engines = getLookSupportedEngines(look);

  if (engines.length === 0) {
    return AVATAR_IV_ENGINE;
  }

  if (engines.includes(AVATAR_IV_ENGINE)) {
    return AVATAR_IV_ENGINE;
  }

  if (engines.includes(AVATAR_V_ENGINE)) {
    return AVATAR_V_ENGINE;
  }

  return AVATAR_IV_ENGINE;
}

/**
 * Engine stored on scene.presenter — API only allows avatar_iv | avatar_v.
 * Expressive routing is preserved via isLegacyV2; backend picks HeyGen v2 from avatarId.
 */
export function persistPresenterAvatarEngine(
  engine,
  { avatarId, avatarType, isLegacyV2 } = {}
) {
  const kind = avatarType || 'studio_avatar';

  if (isLegacyV2Look({ id: avatarId, isLegacyV2 }) || engine === LEGACY_V2_ENGINE) {
    return AVATAR_IV_ENGINE;
  }

  const normalized = normalizeAvatarEngine(engine);
  if (normalized === AVATAR_V_ENGINE && kind === 'studio_avatar') {
    return AVATAR_IV_ENGINE;
  }

  return normalized === AVATAR_V_ENGINE ? AVATAR_V_ENGINE : AVATAR_IV_ENGINE;
}

/** Sanitize engine before POST .../heygen/videos — never send avatar_v for studio/expressive. */
export function finalizeVideoCreatePayload({
  avatarId,
  avatarType,
  avatarEngine,
  isLegacyV2,
  supportedEngines,
}) {
  return persistPresenterAvatarEngine(
    resolveVideoAvatarEngine({
      avatarLookId: avatarId,
      avatarId,
      avatarType: avatarType || 'studio_avatar',
      avatarEngine,
      isLegacyV2,
      supportedEngines,
    }),
    { avatarId, avatarType: avatarType || 'studio_avatar', isLegacyV2 }
  );
}

export function parseAvatarLooksResponse(responseData) {
  const root = responseData ?? {};
  const nested = root?.data && !Array.isArray(root.data) ? root.data : null;
  const data = nested ?? root;

  let allLooks = extractHeygenList(responseData, ['avatar_looks', 'looks', 'avatars']);
  if (allLooks.length === 0) {
    allLooks = extractHeygenList(data, ['avatar_looks', 'looks', 'avatars']);
  }
  if (allLooks.length === 0) {
    const singleLook = data.look ?? root.look ?? data.avatar_look ?? root.avatar_look;
    if (singleLook && typeof singleLook === 'object') {
      allLooks = [singleLook];
    }
  }

  const engineBuckets = data.engineBuckets ?? root.engineBuckets ?? {};

  const bucketIv = Array.isArray(engineBuckets.avatar_iv) ? engineBuckets.avatar_iv : [];
  const bucketV = Array.isArray(engineBuckets.avatar_v) ? engineBuckets.avatar_v : [];
  const bucketLegacyV2 = Array.isArray(engineBuckets.legacy_v2) ? engineBuckets.legacy_v2 : [];
  const bucketUnknown = Array.isArray(engineBuckets.unknown) ? engineBuckets.unknown : [];

  const engineCounts = data.engineCounts ?? root.engineCounts ?? {};
  const ivCount =
    engineCounts.avatar_iv ??
    (bucketIv.length || allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_IV_ENGINE)).length);
  const vCount =
    engineCounts.avatar_v ??
    (bucketV.length || allLooks.filter((l) => supportsAvatarEngine(l, AVATAR_V_ENGINE)).length);
  const legacyV2Count =
    engineCounts.legacy_v2 ??
    (bucketLegacyV2.length || allLooks.filter((l) => isLegacyV2Look(l)).length);
  const unknownCount =
    engineCounts.unknown ??
    (bucketUnknown.length || allLooks.filter(isUnknownEngineLook).length);

  const totalLooks =
    data.lookCount ??
    data.look_count ??
    root.lookCount ??
    root.look_count ??
    engineCounts.totalLooks ??
    engineCounts.total_looks ??
    allLooks.length;

  return {
    allLooks,
    lookCount: Number(totalLooks) || allLooks.length,
    engineBuckets: {
      avatar_iv: bucketIv,
      avatar_v: bucketV,
      legacy_v2: bucketLegacyV2,
      unknown: bucketUnknown,
    },
    engineCounts: {
      avatar_iv: ivCount,
      avatar_v: vCount,
      legacy_v2: legacyV2Count,
      unknown: unknownCount,
      totalLooks: Number(totalLooks) || allLooks.length,
    },
    hasMore: !!(data?.has_more ?? root?.has_more ?? data?.hasMore ?? root?.hasMore),
    nextToken:
      data?.token ??
      root?.token ??
      data?.next_token ??
      root?.next_token ??
      null,
  };
}

export function getParsedLookCount(parsed) {
  if (!parsed) return 0;
  const declared =
    parsed.lookCount ??
    parsed.engineCounts?.totalLooks ??
    parsed.engineCounts?.total_looks;
  const n = Number(declared);
  if (Number.isFinite(n) && n > 0) return n;
  return parsed.allLooks?.length ?? 0;
}

export function isSingleAppearanceGroup(parsed, mappedGroup = null) {
  if (parsed) return getParsedLookCount(parsed) === 1;
  const embedded = mappedGroup?.embeddedLooks || [];
  return embedded.length === 1;
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
  if (filter === LOOK_ENGINE_FILTERS.LEGACY_V2) {
    return engineBuckets.legacy_v2?.length
      ? engineBuckets.legacy_v2
      : allLooks.filter((l) => isLegacyV2Look(l, parsed));
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
    legacy_v2: mergeBucket('legacy_v2'),
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
      legacy_v2:
        engineBuckets.legacy_v2.length ||
        mergedLooks.filter((l) => isLegacyV2Look(l)).length,
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

/** Human-readable reason when an avatar/look cannot be used in video yet. */
export function getAvatarVideoBlockReason(avatar, look) {
  if (!avatar) return 'No avatar selected.';
  if (!look) return 'Select a look for this avatar first.';
  if (
    needsAvatarConsent({
      consent_status: avatar.consentStatus ?? avatar.consent_status,
      status: avatar.trainingStatus ?? avatar.status ?? avatar.training_status,
    })
  ) {
    return 'Complete consent before using this Digital Twin in videos.';
  }
  const lookId = look?.id ?? getLookId(look);
  if (!lookId || isAvatarGroupId(lookId) || String(lookId).startsWith('ag_')) {
    return 'No generatable look id — try refreshing or create a look first.';
  }
  const status = String(getLookTrainingStatus(look) || look?.status || '').toLowerCase();
  if (status === 'failed' || status === 'error') return 'This look failed to generate.';
  if (!getLookPreviewUrl(look) && !look?.image) return 'Look preview is not ready yet.';
  if (status === 'processing' || status === 'pending' || status === 'pending_consent') {
    return 'Look is still processing — try again shortly.';
  }
  if (look.ready === false) return 'Look is not ready for video yet.';
  return null;
}

/** True when avatar + look can be used to start a video or seed the editor. */
export function canUseAvatarInVideo(avatar, look) {
  return !getAvatarVideoBlockReason(avatar, look);
}

/** Payload for Create Video modal / editor boot — mirrors QuickCreate generate shape. */
export function buildAvatarPresenterSeed(avatar, look) {
  const avatarKind = look?.avatarType ?? avatar?.avatarType ?? 'studio_avatar';
  const lookId = look?.id ?? getLookId(look);
  const groupId = avatar?.id ?? avatar?.groupId ?? look?.groupId ?? null;
  const resolvedEngine = finalizeVideoCreatePayload({
    avatarId: lookId,
    avatarType: avatarKind,
    avatarEngine: look?.generatableEngine ?? look?.avatarEngine,
    isLegacyV2: look?.isLegacyV2,
    supportedEngines: look?.supportedEngines,
  });

  return {
    avatarLookId: lookId,
    avatarGroupId: groupId,
    avatarImage: look?.image ?? getLookPreviewUrl(look) ?? avatar?.image ?? null,
    avatarName: avatar?.name ?? look?.name ?? 'AI Presenter',
    lookName: look?.name ?? avatar?.name ?? null,
    avatarTypeLabel: avatarKind,
    avatarEngine: resolvedEngine,
    supportedEngines: look?.supportedEngines ?? [],
    isLegacyV2: look?.isLegacyV2 ?? false,
    engineUnknown: look?.engineUnknown ?? false,
    voiceId: look?.defaultVoiceId ?? avatar?.defaultVoiceId ?? null,
    voiceName: look?.defaultVoiceName ?? avatar?.defaultVoiceName ?? null,
  };
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

export function getLookDefaultVoiceId(look) {
  const raw =
    look?.default_voice_id ??
    look?.defaultVoiceId ??
    look?.voice_id ??
    look?.voiceId ??
    null;
  return raw ? String(raw) : null;
}

export function getLookDefaultVoiceName(look) {
  const raw =
    look?.default_voice_name ??
    look?.defaultVoiceName ??
    look?.voice_name ??
    look?.voiceName ??
    null;
  return raw ? String(raw).trim() : null;
}

export function getLookId(look) {
  if (!look) return null;

  const explicitLookFields = [
    look?.look_id,
    look?.lookId,
    look?.avatar_look_id,
    look?.avatarLookId,
  ];
  for (const raw of explicitLookFields) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_') || id.startsWith('agt_')) continue;
    return id;
  }

  // On look records, `id` is the generatable look id (uuid, lk_, or named public id).
  if (look?.id != null && look?.id !== '') {
    const id = String(look.id);
    if (!id.startsWith('ag_') && !id.startsWith('agt_')) return id;
  }

  const secondaryFields = [look?.avatar_id, look?.avatarId];
  for (const raw of secondaryFields) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_') || id.startsWith('agt_')) continue;
    if (isAvatarGroupId(id)) continue;
    return id;
  }

  return null;
}

/** True when id is a HeyGen avatar group id — not a look id (lk_…, named look, etc.). */
export function isAvatarGroupId(id) {
  if (!id) return false;
  const value = String(id);
  if (value.startsWith('lk_')) return false;
  if (value.startsWith('ag_') || value.startsWith('agt_')) return true;
  if (value.startsWith('group-') || value.startsWith('group-more-')) return true;
  if (/^[0-9a-fA-F]{32}$/.test(value)) return true;
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(value)) {
    return true;
  }
  return false;
}

export function getLooksApiGroupId(mappedGroup) {
  const source = mappedGroup?.sourceGroup ?? mappedGroup;
  const candidates = [
    source?.avatar_group_id,
    source?.group_id,
    mappedGroup?.id,
    source?.id,
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_') || id.startsWith('agt_')) return id;
    if (isAvatarGroupId(id)) return id;
  }
  for (const raw of candidates) {
    if (!raw) continue;
    return String(raw);
  }
  return null;
}

export function isDeclaredSingleLookGroup(mappedGroup) {
  const source = mappedGroup?.sourceGroup ?? mappedGroup;
  const declared = Number(
    source?.look_count ??
      source?.lookCount ??
      source?.num_looks ??
      mappedGroup?.lookCount
  );
  if (declared === 1) return true;
  const embedded = mappedGroup?.embeddedLooks ?? extractHeygenList(source, ['avatar_looks', 'looks']);
  return embedded.length === 1;
}

export function getGroupId(group) {
  return getLooksApiGroupId(group?.sourceGroup ? group : { sourceGroup: group, id: group?.id });
}

export function mapAvatarGroup(group) {
  const id = getGroupId(group);
  const embeddedLooks = extractHeygenList(group, ['avatar_looks', 'looks']);
  const lookCount = Number(group?.look_count ?? group?.lookCount ?? group?.num_looks) || embeddedLooks.length || 0;
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
    embeddedLooks,
    lookCount: lookCount || undefined,
    sourceGroup: group,
  };
}

/** Build a generatable look from group metadata when no separate looks are listed. */
export function buildLookFromGroup(group, mappedGroup = null) {
  const source = group?.sourceGroup ?? group;
  const name = mappedGroup?.name ?? source?.name ?? source?.group_name ?? 'AI Presenter';
  const image =
    mappedGroup?.image ??
    source?.preview_image_url ??
    source?.thumbnail_url ??
    source?.normal_image_url ??
    source?.image_url ??
    PLACEHOLDER_IMAGE;

  const embedded = extractHeygenList(source, ['avatar_looks', 'looks']);
  if (embedded.length === 1) return embedded[0];
  for (const item of embedded) {
    if (getLookId(item) || item?.id || item?.look_id) return item;
  }

  const idCandidates = [
    source?.default_look_id,
    source?.defaultLookId,
    source?.look_id,
    source?.lookId,
    source?.preview_avatar_id,
    source?.previewAvatarId,
    source?.avatar_id,
    source?.avatarId,
  ];

  for (const raw of idCandidates) {
    if (!raw) continue;
    const id = String(raw);
    if (id.startsWith('ag_') || id.startsWith('agt_')) continue;
    if (isAvatarGroupId(id) && !id.includes('_')) continue;

    return {
      id,
      avatar_name: name,
      name,
      preview_image_url: image,
      thumbnail_url: image,
      avatar_type: source?.avatar_type ?? source?.avatarType ?? 'studio_avatar',
      supported_api_engines: source?.supported_api_engines ?? source?.supportedApiEngines ?? [],
      default_voice_id: source?.default_voice_id ?? source?.defaultVoiceId,
      default_voice_name: source?.default_voice_name ?? source?.defaultVoiceName,
    };
  }

  if (isDeclaredSingleLookGroup(mappedGroup ?? { sourceGroup: source, embeddedLooks: embedded })) {
    const singleIdCandidates = [
      source?.preview_avatar_id,
      source?.previewAvatarId,
      source?.avatar_id,
      source?.avatarId,
      source?.default_look_id,
      source?.defaultLookId,
      source?.look_id,
      source?.lookId,
      source?.id,
    ];
    for (const raw of singleIdCandidates) {
      if (!raw) continue;
      const id = String(raw);
      if (id.startsWith('ag_') || id.startsWith('agt_')) continue;
      if (isAvatarGroupId(id) && !id.includes('_') && !id.startsWith('lk_')) continue;
      return {
        id,
        avatar_name: name,
        name,
        preview_image_url: image,
        thumbnail_url: image,
        avatar_type: source?.avatar_type ?? source?.avatarType ?? 'studio_avatar',
        supported_api_engines: source?.supported_api_engines ?? source?.supportedApiEngines ?? [],
        default_voice_id: source?.default_voice_id ?? source?.defaultVoiceId,
        default_voice_name: source?.default_voice_name ?? source?.defaultVoiceName,
      };
    }
  }

  return null;
}

/** Resolve all generatable looks for a group, including single-appearance fallbacks. */
export function resolveGroupGeneratableLooks(parsed, mappedGroup) {
  const allLooks = parsed?.allLooks ?? [];
  const lookCount = getParsedLookCount(parsed);

  // Backend lookCount: 1 + data.looks — always trust the single record.
  if (lookCount === 1 && allLooks.length > 0) {
    return [allLooks[0]];
  }
  if (lookCount === 1 && allLooks.length === 0 && mappedGroup) {
    const fallback = buildLookFromGroup(mappedGroup);
    if (fallback) return [fallback];
  }
  if (allLooks.length === 1) {
    return [allLooks[0]];
  }

  let looks = getGeneratableLooks(parsed, LOOK_ENGINE_FILTERS.ALL);
  if (looks.length > 0) return looks;

  const fromAll = allLooks.filter((look) => {
    const id = getLookId(look) || look?.id || look?.look_id;
    return id && (isGeneratableLook(look, parsed) || isLegacyV2Look(look, parsed) || isUnknownEngineLook(look));
  });
  if (fromAll.length > 0) return fromAll;

  if (!parsed && mappedGroup) {
    const embeddedOnly = mappedGroup.embeddedLooks || [];
    if (embeddedOnly.length === 1) return embeddedOnly;
    if (isDeclaredSingleLookGroup(mappedGroup)) {
      const fallback = buildLookFromGroup(mappedGroup);
      if (fallback) return [fallback];
    }
  }

  const embedded = mappedGroup?.embeddedLooks || [];
  if (embedded.length > 0) {
    const usable = embedded.filter(
      (look) =>
        (getLookId(look) || look?.id || look?.look_id) &&
        (isGeneratableLook(look, parsed) || isLegacyV2Look(look, parsed) || isUnknownEngineLook(look))
    );
    if (usable.length > 0) return usable;
  }

  const fallback = buildLookFromGroup(mappedGroup);
  if (fallback) {
    const allowSynthetic =
      !parsed ||
      lookCount === 1 ||
      allLooks.length <= 1 ||
      isDeclaredSingleLookGroup(mappedGroup);
    if (allowSynthetic) return [fallback];
  }
  return [];
}

/** Fetch + normalize looks for a mapped presenter group (tries API variants, then card fallback). */
export async function fetchMappedGroupLooks(heygenService, mappedGroup, options = {}) {
  const groupId = getLooksApiGroupId(mappedGroup);
  if (!groupId) {
    return {
      parsed: null,
      mappedLooks: mapResolvedLooks(null, mappedGroup, mappedGroup?.name),
      groupId: null,
    };
  }

  const limit = options.limit ?? 20;
  const ownership = options.ownership;
  const attempts = [];
  if (ownership) {
    attempts.push({ group_id: groupId, ownership, limit });
  }
  attempts.push({ group_id: groupId, limit });
  if (ownership !== 'public') {
    attempts.push({ group_id: groupId, ownership: 'public', limit });
  }

  let lastResponse = null;
  for (const params of attempts) {
    try {
      const responseData = await heygenService.getAvatarLooks(params);
      lastResponse = responseData;
      const parsed = parseAvatarLooksResponse(responseData);
      const mappedLooks = mapResolvedLooks(parsed, mappedGroup, mappedGroup?.name);
      if (mappedLooks.length > 0) {
        return { parsed, mappedLooks, groupId, responseData };
      }
      if ((parsed.allLooks?.length ?? 0) > 0) {
        const remapped = parsed.allLooks
          .map((look) => mapAvatarLook(look, mappedGroup?.name, parsed))
          .filter((look) => look.id);
        if (remapped.length > 0) {
          return { parsed, mappedLooks: remapped, groupId, responseData };
        }
      }
    } catch (err) {
      lastResponse = err;
    }
  }

  const fallbackLooks = mapResolvedLooks(null, mappedGroup, mappedGroup?.name);
  return {
    parsed: lastResponse && typeof lastResponse === 'object' ? parseAvatarLooksResponse(lastResponse) : null,
    mappedLooks: fallbackLooks,
    groupId,
    responseData: typeof lastResponse === 'object' ? lastResponse : null,
  };
}

export function mapResolvedLooks(parsed, mappedGroup, groupName = 'Look') {
  const rawList = resolveGroupGeneratableLooks(parsed, mappedGroup);
  return rawList
    .map((look) => mapAvatarLook(look, groupName, parsed))
    .filter((look) => look.id);
}

export function mapAvatarLook(look, fallbackName = 'Look', parsed = null) {
  const id = getLookId(look);
  const supportedEngines = getLookSupportedEngines(look);
  const isLegacyV2 = isLegacyV2Look(look, parsed);
  const usesLegacyV2Video =
    look?.usesLegacyV2Video ?? look?.uses_legacy_v2_video ?? false;
  const videoApi = look?.videoApi ?? look?.video_api ?? null;
  const generatableEngine = resolveVideoAvatarEngine({
    avatarLookId: id,
    avatarType: look?.avatar_type ?? look?.avatarType,
    supportedEngines,
    isLegacyV2,
    parsed,
  });

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
    isLegacyV2,
    usesLegacyV2Video,
    videoApi,
    generatableEngine,
    engineUnknown: supportedEngines.length === 0 && !isLegacyV2,
    defaultVoiceId: getLookDefaultVoiceId(look),
    defaultVoiceName: getLookDefaultVoiceName(look),
  };
}

export function formatLookBadgeLabel(look) {
  if (look?.isLegacyV2) return 'Expressive';
  return formatAvatarTypeLabel(look?.avatarType);
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

function getSceneAvatarClipContent(scene) {
  const avatarClip = (scene?.clips || []).find((c) => c.role === 'avatar' || c.type === 'avatar');
  return typeof avatarClip?.content === 'object' ? avatarClip.content : {};
}

/** HeyGen look id (lk_…) — scene.avatarType historically stored the look id. */
export function getSceneAvatarLookId(scene) {
  if (!scene) return null;

  const avatarContent = getSceneAvatarClipContent(scene);
  const candidates = [
    scene.avatarLookId,
    scene.presenter?.avatarLookId,
    scene.presenter?.lookId,
    scene.presenter?.avatarId,
    scene.presenter?.id,
    avatarContent.avatarLookId,
    avatarContent.avatarId,
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

/** Voice id used for HeyGen generation (scene, presenter, or avatar clip). */
export function getSceneVoiceId(scene) {
  if (!scene) return null;
  const avatarContent = getSceneAvatarClipContent(scene);
  return scene.voiceId || scene.presenter?.voiceId || avatarContent.voiceId || null;
}

/** Narration script for HeyGen generation. */
export function getSceneScript(scene) {
  if (!scene) return '';
  const avatarContent = getSceneAvatarClipContent(scene);
  return String(scene.script ?? scene.presenter?.script ?? avatarContent.script ?? '').trim();
}

/** True when avatar look, voice, and script are all configured for generation. */
export function hasScenePresenterSetup(scene) {
  return Boolean(getSceneAvatarLookId(scene) && getSceneVoiceId(scene) && getSceneScript(scene));
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

/** Apply a presenter seed to a scene (presenter fields + avatar clip). */
export function applyPresenterSeedToScene(scene, seed, resolution = { width: 1920, height: 1080 }) {
  if (!scene || !seed?.avatarLookId) return scene;

  const clips = [...(scene.clips || [])];
  const avatarClipIndex = clips.findIndex((c) => c.role === 'avatar' || c.type === 'avatar');
  const duration = scene.duration ?? 8;
  const avatarImage = seed.avatarImage;

  const sceneDraft = {
    ...scene,
    sceneId: scene.sceneId || scene.id,
    avatarType: seed.avatarLookId,
    avatarLookId: seed.avatarLookId,
    avatarKind: seed.avatarTypeLabel,
    avatarTypeLabel: seed.avatarTypeLabel,
    avatarEngine: seed.avatarEngine,
    supportedEngines: seed.supportedEngines,
    isLegacyV2: seed.isLegacyV2,
    engineUnknown: seed.engineUnknown,
    voiceId: seed.voiceId ?? scene.voiceId,
    script: scene.script ?? '',
    presenter: {
      ...(scene.presenter || {}),
      avatarId: seed.avatarLookId,
      avatarLookId: seed.avatarLookId,
      avatarName: seed.avatarName,
      avatarType: seed.avatarTypeLabel,
      avatarEngine: seed.avatarEngine,
      avatarGroupId: seed.avatarGroupId,
      voiceId: seed.voiceId,
      voiceName: seed.voiceName,
      supportedEngines: seed.supportedEngines,
      isLegacyV2: seed.isLegacyV2,
      engineUnknown: seed.engineUnknown,
    },
  };

  let updatedClips;
  if (avatarClipIndex !== -1) {
    updatedClips = [...clips];
    updatedClips[avatarClipIndex] = {
      ...updatedClips[avatarClipIndex],
      role: 'avatar',
      type: 'avatar',
      src: avatarImage,
      content: buildHeygenAvatarContent(sceneDraft, {
        ...updatedClips[avatarClipIndex],
        src: avatarImage,
      }),
    };
  } else {
    const centered = getCenteredAvatarPlacement(resolution);
    const newClip = {
      id: `clip_${Date.now()}`,
      type: 'avatar',
      role: 'avatar',
      src: avatarImage,
      layer: clips.length,
      startTime: 0,
      endTime: duration,
      position: centered.position,
      size: centered.size,
      opacity: 1,
      effects: { brightness: 1, contrast: 1, saturation: 1, blur: 0 },
    };
    newClip.content = buildHeygenAvatarContent(sceneDraft, newClip);
    updatedClips = [...clips, newClip];
  }

  return { ...sceneDraft, clips: updatedClips };
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

/** Consent / training status from a HeyGen avatar group row. */
export function getAvatarConsentStatus(group) {
  return group?.consent_status ?? group?.consentStatus ?? null;
}

export function getAvatarTrainingStatus(group) {
  return group?.status ?? group?.training_status ?? null;
}

export function isConsentApproved(group) {
  const status = String(getAvatarConsentStatus(group) || '').toLowerCase();
  return status === 'approved' || status === 'complete' || status === 'completed';
}

export function isAvatarPendingConsent(group) {
  const training = String(getAvatarTrainingStatus(group) || '').toLowerCase();
  const consent = String(getAvatarConsentStatus(group) || '').toLowerCase();
  return training === 'pending_consent' || consent === 'pending';
}

export function needsAvatarConsent(group) {
  if (!group) return false;
  if (isConsentApproved(group)) return false;
  return isAvatarPendingConsent(group);
}

const AVATAR_TRAINING_IN_PROGRESS = new Set([
  'processing',
  'pending',
  'pending_consent',
  'training',
  'queued',
]);

export function isAvatarTrainingInProgress(group) {
  const training = String(getAvatarTrainingStatus(group) || '').toLowerCase();
  return AVATAR_TRAINING_IN_PROGRESS.has(training);
}

/** Consent approved and HeyGen finished training — safe to create looks. */
export function isAvatarReadyForLooks(group) {
  if (!group) return false;
  if (!isConsentApproved(group)) return false;
  return !isAvatarTrainingInProgress(group);
}

export const AVATAR_TRAINING_POLL_INTERVAL_MS = 8000;
export const AVATAR_TRAINING_MAX_WAIT_MS = 15 * 60 * 1000;
export const AVATAR_TRAINING_TYPICAL_LABEL = '5–10 minutes';

export function getConsentUrlFromResponse(response) {
  return response?.url ?? response?.consent_url ?? response?.consentUrl ?? null;
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
    consentStatus: getAvatarConsentStatus(group),
    trainingStatus: getAvatarTrainingStatus(group),
    consentUrl: getConsentUrlFromResponse(response),
  };
}
