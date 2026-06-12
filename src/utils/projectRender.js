import { getSceneAvatarLookId } from './heygenAvatars';
import { isAvatarClip } from './heygenVideo';
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
  return !!(render.outputUrl || render.downloadUrl || render.videoUrl || render.s3Key || render.outputKey);
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
  link.target = '_blank';
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

  onStatus?.('Saving project…');
  const payload = toBackendProjectData(projectState);
  await workspaceService.saveProjectState(workspaceId, projectId, payload);

  onStatus?.('Starting full video render…');
  const created = await workspaceService.createRender(workspaceId, projectId, { forceRebuild: true });
  const renderId = created?.id || created?._id;
  if (!renderId) {
    throw new Error('Render could not be started');
  }

  let render = created;
  if (!isRenderComplete(render)) {
    render = await pollRenderUntilReady(workspaceService, workspaceId, projectId, renderId, {
      onPoll: (r) => onStatus?.(`Rendering… (${formatRenderStatus(r)})`),
    });
  }

  onStatus?.('Preparing download…');
  let presignedUrl = null;
  const resolvedRenderId = render.id || renderId;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const download = await workspaceService.downloadRender(workspaceId, projectId, resolvedRenderId);
      presignedUrl =
        download?.presignedUrl ||
        download?.url ||
        download?.render?.presignedUrl ||
        download?.render?.outputUrl;
      if (presignedUrl) break;
    } catch (err) {
      const retryable = err?.message?.includes('409') || err?.message?.toLowerCase().includes('not ready');
      if (!retryable || attempt === 7) throw err;
      await sleep(2000);
    }
  }

  presignedUrl =
    presignedUrl ||
    render?.presignedUrl ||
    render?.outputUrl ||
    render?.downloadUrl ||
    render?.videoUrl;

  if (!presignedUrl) {
    throw new Error('No download URL returned for the rendered video');
  }

  const safeName = sanitizeFilename(filename || projectState?.title || 'video');
  await triggerFileDownload(presignedUrl, `${safeName}.mp4`);
  return { render, presignedUrl };
}
