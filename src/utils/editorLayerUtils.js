/** Layer ordering, duplication, and snap helpers for the editor. */

export const DEFAULT_GRID_SIZE = 20;

export function snapValue(value, gridSize = DEFAULT_GRID_SIZE, enabled = true) {
  if (!enabled || gridSize <= 0) return Math.round(value);
  return Math.round(value / gridSize) * gridSize;
}

export function snapPoint(point, gridSize, enabled) {
  return {
    x: snapValue(point.x, gridSize, enabled),
    y: snapValue(point.y, gridSize, enabled),
  };
}

export function reindexLayerNumbers(clips) {
  return [...clips]
    .sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
    .map((clip, index) => ({ ...clip, layer: index }));
}

export function moveClipInStack(clips, clipId, direction) {
  const sorted = [...clips].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  const index = sorted.findIndex((c) => c.id === clipId);
  if (index === -1) return clips;

  const targetIndex = direction === 'up' ? index + 1 : index - 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return clips;

  const next = [...sorted];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return reindexLayerNumbers(next);
}

export function bringClipForward(clips, clipId) {
  return moveClipInStack(clips, clipId, 'up');
}

export function sendClipBackward(clips, clipId) {
  return moveClipInStack(clips, clipId, 'down');
}

export function duplicateClip(clip, overrides = {}) {
  const id = `clip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const offset = 24;
  return {
    ...structuredClone(clip),
    id,
    locked: false,
    position: clip.position
      ? { x: (clip.position.x ?? 0) + offset, y: (clip.position.y ?? 0) + offset }
      : clip.position,
    layer: (clip.layer ?? 0) + 1,
    ...overrides,
  };
}

export function duplicateScene(scene, index) {
  const sceneKey = `scene_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const copy = structuredClone(scene);
  copy.id = sceneKey;
  copy.sceneId = sceneKey;
  copy.title = `${scene.title || scene.name || 'Scene'} (copy)`;
  copy.order = index + 1;
  copy.clips = (copy.clips || []).map((clip) =>
    duplicateClip(clip, { layer: clip.layer ?? 0 })
  );
  return copy;
}

export function pasteClipsAt(clips, pastedClips, offset = { x: 32, y: 32 }) {
  const maxLayer = clips.reduce((max, c) => Math.max(max, c.layer ?? 0), -1);
  const newClips = pastedClips.map((clip, i) =>
    duplicateClip(clip, {
      position: {
        x: (clip.position?.x ?? 0) + offset.x,
        y: (clip.position?.y ?? 0) + offset.y,
      },
      layer: maxLayer + 1 + i,
    })
  );
  return reindexLayerNumbers([...clips, ...newClips]);
}
