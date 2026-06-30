const MAX_VERSIONS = 5;

function storageKey(projectId) {
  return `athenavi_versions_${projectId}`;
}

/**
 * Strip large ephemeral/binary fields from a scene before storing in localStorage.
 * Keeps identifiers (IDs, roles, text) but removes heavy media blobs/URLs.
 */
function stripHeavySceneData(scenes = []) {
  return scenes.map((scene) => ({
    ...scene,
    // Remove large playback URLs — they are re-fetched on load
    generatedVideoUrl: undefined,
    playbackUrl: undefined,
    clips: (scene.clips || []).map((clip) => {
      const src = clip.src || '';
      const isBlobOrBase64 = src.startsWith('blob:') || src.startsWith('data:');
      const isPresigned = src.includes('X-Amz-') || src.includes('x-amz-');
      return {
        ...clip,
        // Drop ephemeral/large src values; keep workspace asset URLs
        src: isBlobOrBase64 || isPresigned ? undefined : clip.src,
        previewImage: undefined,
        fillSrc: clip.fillSrc?.startsWith('blob:') ? undefined : clip.fillSrc,
        content: clip.content && typeof clip.content === 'object'
          ? {
              ...clip.content,
              // Remove any embedded base64 or blob content
              src: (() => {
                const cs = clip.content.src || '';
                return cs.startsWith('blob:') || cs.startsWith('data:') || cs.includes('X-Amz-')
                  ? undefined
                  : clip.content.src;
              })(),
            }
          : clip.content,
      };
    }),
  }));
}

export function saveVersionSnapshot(projectId, projectState) {
  if (!projectId || !projectState) return;
  try {
    const key = storageKey(projectId);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = {
      savedAt: new Date().toISOString(),
      title: projectState.title,
      data: {
        resolution: projectState.resolution,
        scenes: stripHeavySceneData(projectState.scenes || []),
        meta: projectState.meta,
      },
    };
    const next = [entry, ...existing].slice(0, MAX_VERSIONS);
    localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    console.warn('[VersionHistory] Failed to save snapshot', e);
  }
}

export function listVersionSnapshots(projectId) {
  if (!projectId) return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(projectId)) || '[]');
  } catch {
    return [];
  }
}

export function loadVersionSnapshot(projectId, index) {
  const versions = listVersionSnapshots(projectId);
  return versions[index]?.data || null;
}
