import { getSceneAvatarLookId } from './heygenAvatars';
import { isAvatarClip } from './heygenVideo';
import { prepareScenesForBackendExport } from './persistExternalAssets';
import { rehydrateSceneAssetUrls } from './assetClipUtils';
import { toBackendProjectData } from './projectDataMapper';

const COMPLETE_STATUSES = new Set(['completed', 'complete', 'ready', 'success', 'done']);
const FAILED_STATUSES = new Set(['failed', 'error', 'cancelled', 'canceled']);

export function getRenderStatus(render) {
  return String(render?.status || render?.state || '').toLowerCase();
}

export function isRenderComplete(render) {
  if (!render) return false;
  const status = getRenderStatus(render);
  if (COMPLETE_STATUSES.has(status)) return true;
  return false;
}

export function isRenderFailed(render) {
  if (!render) return false;
  const status = getRenderStatus(render);
  return FAILED_STATUSES.has(status) || !!render.error;
}

export function formatRenderStatus(render) {
  const status = getRenderStatus(render);
  if (!status) return 'processing';
  return status.replace(/_/g, ' ');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sceneLabel(scene, index) {
  return scene.title || scene.name || `Scene ${index + 1}`;
}

/** Lip-sync export requires HeyGen when presenter fields are configured or generation was started. */
function sceneNeedsHeygenVideo(scene) {
  if (scene.heygenVideoId || scene.heygenStatus || scene.generation?.heygenVideoId) {
    return true;
  }
  const lookId = getSceneAvatarLookId(scene);
  const hasScript = typeof scene.script === 'string' && scene.script.trim();
  const hasVoice = !!scene.voiceId;
  return !!(lookId && hasScript && hasVoice);
}

function clipMissingPersistedMedia(clip) {
  if (clip.type !== 'image' && clip.type !== 'video') return false;
  if (isAvatarClip(clip)) return false;
  if (clip.content?.assetId) return false;
  const src = clip.src || clip.content?.src || clip.content?.url;
  // Many templates use "image" layers as styled panels (no src required).
  // If it has a visible style background, don't block export.
  if (!src) {
    const role = String(clip.role || '').toLowerCase();
    // Template placeholders that are allowed to be empty.
    if (role === 'media-showcase' || role === 'media-panel') return false;
    const s = clip.style || {};
    if (s.backgroundColor || s.background || s.border || s.boxShadow) return false;
    return true;
  }
  return String(src).startsWith('blob:');
}

function clipLayerLabel(clip) {
  return clip.role || clip.label || clip.type;
}

/** Client-side checks before starting a server render (mirrors common backend failures). */
export function getExportReadinessIssues(projectState) {
  const byScene = [];

  (projectState?.scenes || []).forEach((scene, index) => {
    const label = sceneLabel(scene, index);
    const sceneIssues = [];

    if (sceneNeedsHeygenVideo(scene)) {
      const status = scene.heygenStatus || scene.generation?.status;
      const videoId = scene.heygenVideoId || scene.generation?.heygenVideoId;

      if (status === 'processing') {
        sceneIssues.push('avatar video is still generating');
      } else if (status === 'failed') {
        sceneIssues.push('avatar video failed — regenerate it in Scene settings');
      } else if (!videoId || status !== 'completed') {
        sceneIssues.push('generate the avatar video in Scene settings (script + voice + Generate)');
      }
    }

    (scene.clips || []).forEach((clip) => {
      if (clipMissingPersistedMedia(clip)) {
        sceneIssues.push(`upload media for the "${clipLayerLabel(clip)}" layer`);
      }
    });

    if (sceneIssues.length) {
      byScene.push(`${label}: ${sceneIssues.join('; ')}.`);
    }
  });

  return byScene;
}

export async function pollRenderUntilReady(workspaceService, workspaceId, projectId, renderId, options = {}) {
  const { intervalMs = 2500, timeoutMs = 15 * 60 * 1000, onPoll } = options;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const render = await workspaceService.getRender(workspaceId, projectId, renderId);
    onPoll?.(render);

    if (isRenderComplete(render)) return render;
    if (isRenderFailed(render)) {
      throw new Error(render?.error || render?.message || 'Video render failed');
    }

    await sleep(intervalMs);
  }

  throw new Error('Video render timed out. Try again in a few minutes.');
}

/** Trigger a browser file save for a remote URL (e.g. presigned S3). */
export async function triggerFileDownload(url, filename) {
  const fullName = sanitizeFilename(filename).endsWith('.mp4')
    ? sanitizeFilename(filename)
    : `${sanitizeFilename(filename)}.mp4`;

  try {
    window.sessionStorage.setItem(
      'athenavi:lastDownload',
      JSON.stringify({ url, filename: fullName })
    );
  } catch {
    // ignore
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fullName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  } catch (err) {
    console.warn('[Export] Blob download failed, falling back to direct link', err);
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = fullName;
  link.target = '_self';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function sanitizeFilename(name) {
  return String(name || 'video')
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video';
}

export async function downloadFinalRenderStream({
  workspaceService,
  workspaceId,
  projectId,
  renderId,
  filename,
}) {
  const safeName = sanitizeFilename(filename || 'video');
  const finalName = safeName.toLowerCase().endsWith('.mp4') ? safeName : `${safeName}.mp4`;

  const res = await workspaceService.streamRender(workspaceId, projectId, renderId);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = finalName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  return { filename: finalName };
}

/**
 * Save project state, render the full composed video on the server, poll until ready,
 * then download the final MP4 (all scenes, layers, text, images — not HeyGen-only).
 */
export async function exportFullProjectVideo({
  workspaceService,
  workspaceId,
  projectId,
  projectState,
  filename,
  autoDownload = true,
  forceRebuild = false,
  onStatus,
}) {
  if (!workspaceId || !projectId) {
    throw new Error('Save this project to a workspace folder before downloading.');
  }

  if (!projectState?.scenes?.length) {
    throw new Error('Add at least one scene before downloading.');
  }

  const blockers = getExportReadinessIssues(projectState);
  if (blockers.length) {
    throw new Error(blockers.join(' '));
  }

  onStatus?.('Preparing workspace assets…');
  const { scenes: scenesForExport, uploadCount } = await prepareScenesForBackendExport(
    projectState.scenes,
    workspaceId,
    { onProgress: onStatus }
  );

  let hydratedScenes = scenesForExport;
  if (uploadCount > 0) {
    onStatus?.('Waiting for uploaded assets to sync…');
    await sleep(2000);
    hydratedScenes = await rehydrateSceneAssetUrls(scenesForExport, workspaceId);
  }

  const exportState = { ...projectState, scenes: hydratedScenes };

  onStatus?.('Saving project…');
  const payload = toBackendProjectData(exportState);
  await workspaceService.saveProjectState(workspaceId, projectId, payload);

  onStatus?.('Starting full video render…');
  const created = await workspaceService.createRender(workspaceId, projectId, { forceRebuild: !!forceRebuild });
  const renderId = created?.id || created?._id;
  if (!renderId) {
    throw new Error('Render could not be started');
  }

  let render = created;
  if (!isRenderComplete(render)) {
    render = await pollRenderUntilReady(workspaceService, workspaceId, projectId, renderId, {
      onPoll: (r) => {
        let pct = 0;
        if (r && r.progress !== undefined) {
          pct = typeof r.progress === 'number'
            ? (r.progress <= 1 ? Math.round(r.progress * 100) : Math.round(r.progress))
            : parseInt(r.progress, 10) || 0;
        } else if (r && r.percent !== undefined) {
          pct = typeof r.percent === 'number'
            ? (r.percent <= 1 ? Math.round(r.percent * 100) : Math.round(r.percent))
            : parseInt(r.percent, 10) || 0;
        }
        onStatus?.(`Rendering… (${formatRenderStatus(r)})`, pct);
      },
    });
  }

  onStatus?.('Preparing download…');
  const resolvedRenderId = render.id || renderId;

  let suggestedFilename = sanitizeFilename(filename || projectState?.title || 'video');
  // Optional: read backend-provided filename (sanitized based on Project.name).
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const downloadMeta = await workspaceService.downloadRender(workspaceId, projectId, resolvedRenderId);
      const apiName = downloadMeta?.filename || downloadMeta?.data?.filename;
      if (apiName) {
        suggestedFilename = apiName;
      }
      break;
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase();
      const retryable = msg.includes('409') || msg.includes('not ready');
      if (!retryable || attempt === 5) break;
      await sleep(1500);
    }
  }

  if (autoDownload) {
    await downloadFinalRenderStream({
      workspaceService,
      workspaceId,
      projectId,
      renderId: resolvedRenderId,
      filename: suggestedFilename,
    });
  }

  return { render, renderId: resolvedRenderId, filename: suggestedFilename, projectState: exportState };
}
