const MAX_VERSIONS = 10;

function storageKey(projectId) {
  return `athenavi_versions_${projectId}`;
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
        scenes: projectState.scenes,
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
