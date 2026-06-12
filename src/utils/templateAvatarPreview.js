import heygenService from '../services/heygenService';
import {
  extractHeygenList,
  getIvOrVLooks,
  hasIvOrVEngineSupport,
  LOOK_ENGINE_FILTERS,
  mapAvatarGroup,
  mapAvatarLook,
  parseAvatarLooksResponse,
  resolveAvatarEngine,
} from './heygenAvatars';

/** How many HeyGen IV/V looks to load for template bundles (alternates per scene). */
export const TEMPLATE_AVATAR_LOOK_COUNT = 2;

let cachedLookSet = null;
let fetchLookSetPromise = null;

const HEYGEN_FETCH_TIMEOUT_MS = 6000;
const MAX_GROUPS_TO_SCAN = 2;
const LOOKS_PER_GROUP = 8;

function isHeygenLook(look) {
  return Boolean(look?.id && look?.image && !String(look.id).startsWith('fallback_'));
}

/** Cached HeyGen looks only — never random stock photos. */
export function getImmediateAvatarLookSet(minCount = TEMPLATE_AVATAR_LOOK_COUNT) {
  if (!cachedLookSet?.length) return [];
  return cachedLookSet.slice(0, minCount);
}

export function getCachedTemplateAvatarLookSet() {
  return cachedLookSet?.length ? cachedLookSet : null;
}

export function prefetchTemplateAvatarLookSet(minCount = TEMPLATE_AVATAR_LOOK_COUNT) {
  fetchTemplateAvatarLookSet(minCount).catch(() => {});
  return getImmediateAvatarLookSet(minCount);
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

function collectIvOrVLook(rawLook, groupName, groupId, seenIds, collected) {
  if (!hasIvOrVEngineSupport(rawLook)) return;
  const mapped = mapAvatarLook(rawLook, groupName);
  if (!mapped.id || mapped.engineUnknown) return;
  if (!mapped.image || String(mapped.image).includes('placeholder')) return;
  if (seenIds.has(mapped.id)) return;
  seenIds.add(mapped.id);
  collected.push({
    id: mapped.id,
    image: mapped.image,
    name: mapped.name,
    groupId: mapped.groupId || groupId,
    engine: resolveAvatarEngine(rawLook),
  });
}

async function loadHeygenLookSet(minCount) {
  const collected = [];
  const seenIds = new Set();

  try {
    const groupsRes = await heygenService.getAvatarGroups({ ownership: 'public', limit: MAX_GROUPS_TO_SCAN });
    const groups = extractHeygenList(groupsRes, ['avatar_groups', 'groups'])
      .map(mapAvatarGroup)
      .filter((g) => g.id)
      .slice(0, MAX_GROUPS_TO_SCAN);

    for (const group of groups) {
      if (collected.length >= minCount) break;
      try {
        const looksRes = await heygenService.getAvatarLooks({
          group_id: group.id,
          limit: LOOKS_PER_GROUP,
        });
        const parsed = parseAvatarLooksResponse(looksRes);
        getIvOrVLooks(parsed, LOOK_ENGINE_FILTERS.ALL).forEach((look) =>
          collectIvOrVLook(look, group.name, group.id, seenIds, collected)
        );
      } catch {
        /* try next group */
      }
    }
  } catch {
    /* return empty — no stock fallbacks */
  }

  return collected.slice(0, minCount);
}

/** Fetch HeyGen Avatar IV/V looks only. Returns [] if API unavailable. */
export async function fetchTemplateAvatarLookSet(minCount = TEMPLATE_AVATAR_LOOK_COUNT) {
  if (cachedLookSet?.length >= minCount) {
    return cachedLookSet.slice(0, minCount);
  }
  if (!fetchLookSetPromise) {
    fetchLookSetPromise = (async () => {
      const result = await withTimeout(loadHeygenLookSet(minCount), HEYGEN_FETCH_TIMEOUT_MS);
      if (result?.length) {
        cachedLookSet = result;
      }
      return cachedLookSet || [];
    })().finally(() => {
      fetchLookSetPromise = null;
    });
  }
  return fetchLookSetPromise;
}

export function getTemplateAvatarLookForIndex(index = 0, lookSet = cachedLookSet) {
  if (!lookSet?.length) return null;
  return lookSet[Math.abs(index) % lookSet.length];
}

export function resolveTemplateAvatarLook(template, sceneIndex = 0, options = {}) {
  const idx = Number.isFinite(sceneIndex) ? sceneIndex : 0;
  const lookSet = options.avatarLookSet || cachedLookSet;

  if (lookSet?.length) {
    const look = getTemplateAvatarLookForIndex(idx, lookSet);
    return isHeygenLook(look) ? look : null;
  }

  return null;
}

export const DEFAULT_AVATAR_PREVIEW_STYLE = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: '3px solid #faf7f2',
  boxShadow: '0 10px 28px rgba(28, 25, 23, 0.2)',
};

export const DARK_SCENE_AVATAR_STYLE = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: '3px solid #E8B84A',
  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
};

/** Apply HeyGen look preview on avatar clips — skips if no valid look id. */
export function applyAvatarPreviewToClips(
  clips,
  lookOrSrc,
  style = DEFAULT_AVATAR_PREVIEW_STYLE,
  lookIndex = 0
) {
  const look = lookOrSrc && typeof lookOrSrc === 'object' && lookOrSrc.image ? lookOrSrc : null;
  if (!isHeygenLook(look)) return clips;

  const presenterMeta = {
    lookId: look.id,
    groupId: look.groupId || null,
    previewSrc: look.image,
    image: look.image,
    engine: look.engine || null,
    name: look.name || 'Presenter',
  };

  return clips.map((clip) => {
    if (clip.type !== 'avatar') return clip;
    const nextStyle = { ...style, ...(clip.style || {}) };

    return {
      ...clip,
      src: look.image,
      previewImage: look.image,
      placeholder: true,
      templateLookIndex: lookIndex,
      style: nextStyle,
      presenter: presenterMeta,
      avatarId: look.id,
      lookId: look.id,
    };
  });
}

/** Avatar image for canvas — HeyGen cache/clips only, no stock photos. */
export function resolveAvatarDisplaySrc(clip, scene) {
  const lookIndex =
    clip?.templateLookIndex ??
    scene?.templateLookIndex ??
    Math.max(0, (scene?.slideIndex ?? 1) - 1);

  const clipLookId = clip?.lookId || clip?.presenter?.lookId || clip?.avatarId;
  const direct =
    clip?.src ||
    clip?.previewImage ||
    clip?.presenter?.image ||
    clip?.presenter?.previewSrc ||
    scene?.presenter?.image ||
    scene?.presenter?.previewSrc;

  if (direct && clipLookId) return direct;

  const cached = getTemplateAvatarLookForIndex(lookIndex);
  return isHeygenLook(cached) ? cached.image : null;
}
