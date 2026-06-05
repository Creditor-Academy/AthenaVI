/** Layer ordering, duplication, and snap helpers for the editor. */

export const DEFAULT_GRID_SIZE = 20;

/** Layers that can fill the canvas via "Set as Scene Background" (not shapes). */
export function canSetAsSceneBackground(clip) {
  if (!clip) return false;
  return clip.type === 'image' || clip.type === 'video';
}

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
  return sortClipsByPaintOrder(clips);
}

/** Paint order: background clips first, then by layer (low = behind). */
export function sortClipsByPaintOrder(clips = []) {
  return [...clips].sort((a, b) => clipRenderRank(a) - clipRenderRank(b));
}

export function countBackgroundClips(clips = []) {
  return clips.filter(isBackgroundClip).length;
}

/** First paint-order index a non-background clip may occupy (just above backgrounds). */
export function minMovableStackIndex(clips = []) {
  return countBackgroundClips(clips);
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

/** Assign sequential layer numbers from the given paint order (do not re-sort). */
export function reindexLayerNumbers(clips) {
  let nextLayer = 1;
  return clips.map((clip) => {
    if (isBackgroundClip(clip)) {
      return { ...clip, isBackground: true, layer: 0 };
    }
    const updated = { ...clip, isBackground: false, layer: nextLayer };
    nextLayer += 1;
    return updated;
  });
}

export function moveClipInStack(clips, clipId, direction) {
  const sorted = sortClipsByPaintOrder(clips);
  const index = sorted.findIndex((c) => c.id === clipId);
  if (index === -1 || isBackgroundClip(sorted[index])) return clips;

  const minIndex = minMovableStackIndex(sorted);

  if (direction === 'up') {
    const targetIndex = index + 1;
    if (targetIndex >= sorted.length) return clips;
    const next = [...sorted];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return reindexLayerNumbers(next);
  }

  const targetIndex = index - 1;
  if (targetIndex < minIndex) return clips;
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

/** Place clip directly above scene backgrounds (behind avatar, text, images). */
export function sendClipToBack(clips, clipId) {
  const sorted = sortClipsByPaintOrder(clips);
  const index = sorted.findIndex((c) => c.id === clipId);
  if (index === -1 || isBackgroundClip(sorted[index])) return clips;

  const minIndex = minMovableStackIndex(sorted);
  if (index <= minIndex) return clips;

  const clip = sorted[index];
  const bgClips = sorted.filter(isBackgroundClip);
  const others = sorted.filter((c) => !isBackgroundClip(c) && c.id !== clipId);
  return reindexLayerNumbers([...bgClips, clip, ...others]);
}

export function bringClipToFront(clips, clipId) {
  const sorted = sortClipsByPaintOrder(clips);
  const index = sorted.findIndex((c) => c.id === clipId);
  if (index === -1 || isBackgroundClip(sorted[index]) || index >= sorted.length - 1) return clips;

  const clip = sorted[index];
  const rest = sorted.filter((c) => c.id !== clipId);
  return reindexLayerNumbers([...rest, clip]);
}

/** Layer index in paint order (low = back). */
export function getClipStackIndex(clips, clipId) {
  return sortClipsByPaintOrder(clips).findIndex((c) => c.id === clipId);
}

export function buildSceneBackgroundPatch(clip) {
  const origPos = clip._origPosition || clip.position;
  const origSize = clip._origSize || clip.size;
  const patch = {
    isBackground: true,
    role: 'background',
    _origPosition: origPos,
    _origSize: origSize,
    position: { x: 0, y: 0 },
    size: { width: 1920, height: 1080 },
  };
  if (clip.type === 'image' || clip.type === 'video') {
    patch.style = {
      ...(clip.style || {}),
      objectFit: clip.style?.objectFit || 'cover',
      zIndex: 0,
    };
  }
  return patch;
}

export function buildUnsetSceneBackgroundPatch(clip) {
  return {
    isBackground: false,
    position: clip._origPosition || { x: 200, y: 200 },
    size: clip._origSize || { width: 600, height: 400 },
    _origPosition: undefined,
    _origSize: undefined,
  };
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
  return reindexLayerNumbers([...sortClipsByPaintOrder(clips), ...newClips]);
}
