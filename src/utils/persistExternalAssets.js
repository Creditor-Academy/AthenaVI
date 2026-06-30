import assetService from '../services/assetService';
import { dispatchStorageRefresh } from './storageQuota';
import { isAvatarClip } from './heygenVideo';

const UPLOAD_MEDIA_TYPES = new Set(['image', 'video', 'icon']);

function sceneHeygenVideoId(scene) {
  if (!scene) return null;
  if (scene.heygenVideoId) return scene.heygenVideoId;
  if (scene.generation?.heygenVideoId) return scene.generation.heygenVideoId;
  for (const clip of scene.clips || []) {
    const content = typeof clip.content === 'object' ? clip.content : null;
    if (content?.heygenVideoId) return content.heygenVideoId;
  }
  return null;
}

function avatarPreviewSrc(clip, scene) {
  return (
    clip?.src ||
    clip?.previewImage ||
    clip?.presenter?.previewSrc ||
    clip?.presenter?.image ||
    scene?.presenter?.previewSrc ||
    scene?.presenter?.image
  );
}

/**
 * Avatar placeholders without a generated HeyGen video export as static images
 * so the render pipeline does not wait for a missing video asset.
 */
export function flattenStaticAvatarClips(scenes = []) {
  return scenes.map((scene) => {
    const heygenId = sceneHeygenVideoId(scene);
    const nextClips = [];

    for (const clip of scene.clips || []) {
      if (!isAvatarClip(clip)) {
        nextClips.push(clip);
        continue;
      }

      if (heygenId) {
        nextClips.push(clip);
        continue;
      }

      const src = avatarPreviewSrc(clip, scene);
      if (!src) continue;

      const content = typeof clip.content === 'object' && clip.content ? { ...clip.content } : {};
      delete content.provider;
      delete content.heygenVideoId;
      delete content.previewSrc;

      nextClips.push({
        ...clip,
        type: 'image',
        role: clip.role || 'avatar',
        src,
        placeholder: true,
        content: {
          ...content,
          src,
          mediaType: 'image',
        },
      });
    }

    return { ...scene, clips: nextClips };
  });
}

function clipContent(clip) {
  return typeof clip.content === 'object' && clip.content ? clip.content : null;
}

function clipMediaSrc(clip) {
  const content = clipContent(clip);
  return clip.src || content?.src || content?.url || null;
}

function clipHasAssetId(clip) {
  const content = clipContent(clip);
  return Boolean(content?.assetId || clip.fillAssetId);
}

function isWorkspaceAssetUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\/api\/assets\//i.test(url);
}

function isEphemeralUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('blob:') || url.includes('X-Amz-');
}

/**
 * True when the render pipeline needs a workspace asset instead of a bare URL.
 * Skips avatar preview images and already-persisted workspace assets.
 */
export function clipNeedsWorkspacePersist(clip) {
  if (!clip) return false;
  // HeyGen video avatars are resolved separately; skip raw avatar placeholders.
  if (clip.type === 'avatar') return false;
  if (clip.type === 'video' && clip.role === 'avatar') return false;

  const type = clip.type;
  const role = String(clip.role || '').toLowerCase();
  const isMedia =
    type === 'image' ||
    type === 'video' ||
    role === 'icon' ||
    role === 'logo' ||
    role === 'hero-image';

  if (!isMedia && !UPLOAD_MEDIA_TYPES.has(type)) {
    if (!clip.fillSrc) return false;
  }

  if (clipHasAssetId(clip)) return false;

  const src = clipMediaSrc(clip);
  const fillSrc = clip.fillSrc;

  const needsMain =
    isMedia &&
    src &&
    !isWorkspaceAssetUrl(src) &&
    (isEphemeralUrl(src) || /^https?:\/\//i.test(src));

  const needsFill =
    fillSrc &&
    !clip.fillAssetId &&
    !isWorkspaceAssetUrl(fillSrc) &&
    (isEphemeralUrl(fillSrc) || /^https?:\/\//i.test(fillSrc));

  return needsMain || needsFill;
}

function guessExtension(mimeType, url) {
  if (mimeType?.includes('png')) return '.png';
  if (mimeType?.includes('webp')) return '.webp';
  if (mimeType?.includes('mp4')) return '.mp4';
  if (mimeType?.includes('mpeg') || mimeType?.includes('mp3')) return '.mp3';
  if (url?.includes('.png')) return '.png';
  if (url?.includes('.webp')) return '.webp';
  return '.jpg';
}

function buildUploadName(clip, url) {
  const base = clip.assetKey || clip.role || clip.id || 'template-media';
  const ext = guessExtension(null, url);
  return `${String(base).replace(/[^\w.-]+/g, '-').slice(0, 48)}${ext}`;
}

async function urlToUploadFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    // Return null so callers can skip this asset gracefully instead of
    // crashing the entire export when an external URL is broken/expired.
    return null;
  }
  const blob = await response.blob();
  const type = blob.type || 'image/jpeg';
  return new File([blob], filename, { type });
}

function applyAssetToClip(clip, asset) {
  const normalized = assetService.normalizeAsset(asset);
  if (!normalized?.id || !normalized?.url) {
    throw new Error('Upload succeeded but asset URL is missing');
  }

  const content = clipContent(clip);
  const mediaType = normalized.mediaType || clip.type || 'image';

  return {
    ...clip,
    src: normalized.url,
    placeholder: false,
    content: {
      ...(content || {}),
      assetId: normalized.id,
      url: normalized.url,
      src: normalized.url,
      mediaType,
    },
  };
}

function applyFillAssetToClip(clip, asset) {
  const normalized = assetService.normalizeAsset(asset);
  if (!normalized?.id || !normalized?.url) {
    throw new Error('Upload succeeded but fill asset URL is missing');
  }

  return {
    ...clip,
    fillSrc: normalized.url,
    fillAssetId: normalized.id,
  };
}

/**
 * Upload external / blob template media into the workspace and attach assetIds.
 * Deduplicates by URL within a single run.
 */
export async function persistExternalSceneAssets(scenes = [], workspaceId, { onProgress } = {}) {
  if (!workspaceId || !Array.isArray(scenes) || scenes.length === 0) {
    return { scenes, uploadCount: 0, skippedUrls: new Set() };
  }

  const urlCache = new Map();
  const skippedUrls = new Set(); // URLs that failed to download or were rejected by the server
  let uploadCount = 0;

  const resolveUrl = async (url, clip) => {
    if (!url || urlCache.has(url)) return urlCache.get(url);

    onProgress?.(
      uploadCount === 0
        ? 'Uploading template images to workspace…'
        : `Uploading template images (${uploadCount + 1})…`
    );

    const file = await urlToUploadFile(url, buildUploadName(clip, url));
    const uploaded = await assetService.uploadAsset(workspaceId, file);
    uploadCount += 1;
    urlCache.set(url, uploaded);
    return uploaded;
  };

  const nextScenes = [];

  for (const scene of scenes) {
    const nextClips = [];

    for (const clip of scene.clips || []) {
      let next = clip;

      try {
        if (clipNeedsWorkspacePersist(clip)) {
          const src = clipMediaSrc(clip);
          if (
            src &&
            !clipContent(clip)?.assetId &&
            !isWorkspaceAssetUrl(src) &&
            (isEphemeralUrl(src) || /^https?:\/\//i.test(src))
          ) {
            const file = await urlToUploadFile(src, buildUploadName(clip, src));
            if (file) {
              try {
                if (!urlCache.has(src)) {
                  onProgress?.(
                    uploadCount === 0
                      ? 'Uploading template images to workspace…'
                      : `Uploading template images (${uploadCount + 1})…`
                  );
                  const asset = await assetService.uploadAsset(workspaceId, file);
                  uploadCount += 1;
                  urlCache.set(src, asset);
                }
                next = applyAssetToClip(next, urlCache.get(src));
              } catch (uploadErr) {
                // Server rejected the file (e.g. SVG not allowed) — skip gracefully
                console.warn(`[Export] Server rejected asset "${clip.role || clip.type}" (${src}):`, uploadErr?.message);
                skippedUrls.add(src);
              }
            } else {
              console.warn(
                `[Export] Skipping broken asset for clip "${clip.role || clip.type}" — URL returned non-OK: ${src}`
              );
              skippedUrls.add(src);
            }
          }

          if (
            clip.fillSrc &&
            !next.fillAssetId &&
            !isWorkspaceAssetUrl(clip.fillSrc) &&
            (isEphemeralUrl(clip.fillSrc) || /^https?:\/\//i.test(clip.fillSrc))
          ) {
            const fillFile = await urlToUploadFile(clip.fillSrc, buildUploadName(clip, clip.fillSrc));
            if (fillFile) {
              try {
                const fillAsset = await resolveUrl(clip.fillSrc, clip);
                next = applyFillAssetToClip(next, fillAsset);
              } catch (uploadErr) {
                console.warn(`[Export] Server rejected fill asset "${clip.role || clip.type}":`, uploadErr?.message);
                skippedUrls.add(clip.fillSrc);
              }
            } else {
              console.warn(
                `[Export] Skipping broken fill asset for clip "${clip.role || clip.type}" — URL returned non-OK: ${clip.fillSrc}`
              );
              skippedUrls.add(clip.fillSrc);
            }
          }
        }
      } catch (err) {
        const label = clip.role || clip.assetKey || clip.type || 'media';
        // Log but don't crash — a missing logo/icon shouldn't block the whole export.
        console.error(`[Export] Could not persist asset "${label}":`, err);
        const src = clipMediaSrc(clip);
        if (src) skippedUrls.add(src);
        if (clip.fillSrc) skippedUrls.add(clip.fillSrc);
      }

      nextClips.push(next);
    }

    nextScenes.push({ ...scene, clips: nextClips });
  }

  if (uploadCount > 0) {
    dispatchStorageRefresh();
  }

  return { scenes: nextScenes, uploadCount, skippedUrls };
}

export function getUnresolvedExportMediaIssues(scenes = [], skippedUrls = new Set()) {
  const issues = [];

  scenes.forEach((scene, index) => {
    const label = scene.title || scene.name || `Scene ${index + 1}`;

    for (const clip of scene.clips || []) {
      if (isAvatarClip(clip) && clip.type !== 'image') {
        if (!sceneHeygenVideoId(scene)) {
          issues.push(`${label}: avatar layer is missing a generated avatar video`);
        }
        continue;
      }

      const isMedia =
        clip.type === 'image' ||
        clip.type === 'video' ||
        clip.role === 'icon' ||
        clip.role === 'logo' ||
        clip.role === 'hero-image';

      if (!isMedia) continue;

      const content = typeof clip.content === 'object' && clip.content ? clip.content : null;
      const assetId = content?.assetId || clip.fillAssetId;
      const src = clip.src || content?.src || content?.url;

      // Skip URLs that were already attempted but couldn't be uploaded (wrong format, 404, etc.)
      if (src && skippedUrls.has(src)) continue;

      if (!assetId && src && /^https?:\/\//i.test(src) && !isWorkspaceAssetUrl(src)) {
        issues.push(
          `${label}: "${clip.role || clip.assetKey || clip.type}" is still an external URL — re-upload or replace it`
        );
      }
    }
  });

  return issues;
}

/**
 * Flatten static avatars, upload external media, return scenes ready for backend save.
 */
export async function prepareScenesForBackendExport(scenes = [], workspaceId, { onProgress } = {}) {
  const flattened = flattenStaticAvatarClips(scenes);
  const { scenes: persisted, uploadCount, skippedUrls } = await persistExternalSceneAssets(
    flattened,
    workspaceId,
    { onProgress }
  );

  // Pass skippedUrls so assets that failed (unsupported format, 404) don't block export
  const issues = getUnresolvedExportMediaIssues(persisted, skippedUrls);
  if (issues.length) {
    throw new Error(issues.join(' '));
  }

  return { scenes: persisted, uploadCount };
}

export function countExternalPersistCandidates(scenes = []) {
  let count = 0;
  const seen = new Set();

  for (const scene of scenes) {
    for (const clip of scene.clips || []) {
      if (!clipNeedsWorkspacePersist(clip)) continue;
      const src = clipMediaSrc(clip);
      if (src && !seen.has(src)) {
        seen.add(src);
        count += 1;
      }
      if (clip.fillSrc && !seen.has(clip.fillSrc)) {
        seen.add(clip.fillSrc);
        count += 1;
      }
    }
  }

  return count;
}
