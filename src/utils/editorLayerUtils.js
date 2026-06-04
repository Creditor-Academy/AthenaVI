/** Layer ordering, duplication, and snap helpers for the editor. */

export const DEFAULT_GRID_SIZE = 20;

/** True when a clip should render behind all other scene layers. */
export function isBackgroundClip(clip) {
  if (!clip) return false;
  if (clip.isBackground) return true;
  if (clip.role === 'background') return true;
  const label = (clip.label || '').toLowerCase();
  if (clip.type === 'image' && (label.includes('background') || label.includes('bg'))) return true;
  const w = clip.size?.width;
  const h = clip.size?.height;
  if (clip.type === 'image' && typeof w === 'number' && typeof h === 'number' && w >= 1800 && h >= 1000) {
    return true;
  }
  return false;
}

export function clipRenderRank(clip) {
  if (isBackgroundClip(clip)) return -1000 + (clip.layer ?? 0);
  return clip.layer ?? 0;
}

export function sortClipsForRender(clips = []) {
  return [...clips].sort((a, b) => clipRenderRank(a) - clipRenderRank(b));
}

export function getClipZIndex(clip, isSelected = false) {
  if (isBackgroundClip(clip)) return isSelected ? 5 : 1;
  const layer = clip.layer ?? 0;
  return isSelected ? 200 + layer : 10 + layer;
}

/** Ensure background / full-bleed images sit at the back of the stack. */
export function normalizeClipStack(clips = []) {
  if (!clips.length) return clips;

  const sorted = [...clips].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  let nextLayer = 1;

  return sorted.map((clip) => {
    if (isBackgroundClip(clip)) {
      return { ...clip, isBackground: true, layer: 0 };
    }
    const normalized = { ...clip, isBackground: false, layer: nextLayer };
    nextLayer += 1;
    return normalized;
  });
}

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
  copy.heygenVideoId = undefined;
  copy.generatedVideoUrl = undefined;
  copy.playbackUrl = undefined;
  copy.heygenStatus = undefined;
  copy.generation = undefined;
  copy.clips = (copy.clips || []).map((clip) =>
    duplicateClip(clip, { layer: clip.layer ?? 0 })
  );
  return copy;
}

/**
 * Normalise template clips to match the actual scene duration.
 * Avatar/HeyGen clips are always stretched to the full scene.
 * Other clips that were hardcoded to the old scene length are also
 * stretched, but only when their endTime exactly equalled the old
 * duration so we don't accidentally shrink user-trimmed clips.
 */
export function normalizeClipsToScene(clips = [], sceneDuration = 8) {
  return clips.map((clip) => {
    const isAvatarOrVideo =
      clip.type === 'avatar' || clip.role === 'avatar' ||
      (clip.type === 'video' && (clip.role === 'avatar' || clip.role === 'media'));

    if (isAvatarOrVideo) {
      return { ...clip, startTime: 0, endTime: sceneDuration };
    }

    const start = clip.startTime ?? 0;
    const end = clip.endTime ?? sceneDuration;
    if (end <= start) {
      return { ...clip, endTime: sceneDuration };
    }
    return clip;
  });
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
