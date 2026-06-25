import assetService from '../services/assetService';

export function collectAssetIdsFromScenes(scenes = []) {
  const ids = new Set();
  for (const scene of scenes) {
    for (const clip of scene.clips || []) {
      const content = typeof clip.content === 'object' && clip.content ? clip.content : null;
      if (content?.assetId) ids.add(String(content.assetId));
      if (clip.fillAssetId) ids.add(String(clip.fillAssetId));
    }
  }
  return ids;
}

function clipNeedsAssetUrl(clip) {
  const content = typeof clip.content === 'object' && clip.content ? clip.content : null;
  const hasResolvableSrc = Boolean(
    clip.src ||
      content?.url ||
      content?.src ||
      (clip.fillSrc && !clip.fillAssetId)
  );
  if (hasResolvableSrc) return false;
  return Boolean(content?.assetId || clip.fillAssetId);
}

export async function buildAssetUrlMap(workspaceId, assetIds) {
  if (!workspaceId || !assetIds?.size) return new Map();

  const list = await assetService.listAllAssets(workspaceId, { source: 'all' });
  const map = new Map();
  for (const raw of list) {
    const normalized = assetService.normalizeAsset(raw);
    if (normalized?.id && normalized?.url) {
      map.set(String(normalized.id), normalized.url);
    }
  }

  return map;
}

export function applyAssetUrlsToClip(clip, urlMap) {
  if (!clip || !urlMap?.size) return clip;

  let next = clip;
  const content = typeof clip.content === 'object' && clip.content ? clip.content : null;
  const assetId = content?.assetId ? String(content.assetId) : null;
  const fillAssetId = clip.fillAssetId ? String(clip.fillAssetId) : null;

  if (assetId && urlMap.has(assetId)) {
    const url = urlMap.get(assetId);
    next = {
      ...next,
      src: next.src || url,
      content: content ? { ...content, url: content.url || url } : { assetId, url },
    };
  }

  if (fillAssetId && urlMap.has(fillAssetId)) {
    const url = urlMap.get(fillAssetId);
    next = {
      ...next,
      fillSrc: next.fillSrc || url,
    };
  }

  return next;
}

export async function rehydrateSceneAssetUrls(scenes, workspaceId) {
  if (!workspaceId || !Array.isArray(scenes) || scenes.length === 0) return scenes;

  const assetIds = new Set();
  for (const scene of scenes) {
    for (const clip of scene.clips || []) {
      if (clipNeedsAssetUrl(clip)) {
        const content = typeof clip.content === 'object' && clip.content ? clip.content : null;
        if (content?.assetId) assetIds.add(String(content.assetId));
        if (clip.fillAssetId) assetIds.add(String(clip.fillAssetId));
      }
    }
  }

  if (!assetIds.size) return scenes;

  try {
    const urlMap = await buildAssetUrlMap(workspaceId, assetIds);
    if (!urlMap.size) return scenes;

    return scenes.map((scene) => ({
      ...scene,
      clips: (scene.clips || []).map((clip) => applyAssetUrlsToClip(clip, urlMap)),
    }));
  } catch (err) {
    console.warn('[Assets] Failed to rehydrate workspace asset URLs', err);
    return scenes;
  }
}
