/**
 * Group / ungroup utilities for editor canvas clips.
 */

import { resolveClipRect } from './clipLayout';
import {
  clipToTransformMatrix,
  getOrientedBounds,
  localToWorldTransform,
} from './clipTransformUtils';

export function isGroupClip(clip) {
  return clip?.type === 'group' && Array.isArray(clip.childIds);
}

export function isGroupedChild(clip) {
  return !!clip?.groupId;
}

/** Root-level clips: groups and ungrouped clips (not children of a group). */
export function getRootClips(clips = []) {
  return clips.filter((c) => !isGroupedChild(c));
}

export function getGroupChildren(clips = [], group) {
  const ids = new Set(group?.childIds || []);
  return clips.filter((c) => ids.has(c.id));
}

export function canGroup(clips, selectedIds) {
  const selected = clips.filter(
    (c) =>
      selectedIds.includes(c.id) &&
      !isGroupedChild(c) &&
      !isGroupClip(c) &&
      c.type !== 'audio' &&
      !c.locked
  );
  return selected.length >= 2;
}

export function canUngroup(clips, selectedIds) {
  if (selectedIds.length !== 1) return false;
  const clip = clips.find((c) => c.id === selectedIds[0]);
  return isGroupClip(clip);
}

export function getUnionBounds(clips) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const clip of clips) {
    const b = getOrientedBounds(clip);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function createGroup(clips, selectedIds) {
  const children = clips.filter(
    (c) =>
      selectedIds.includes(c.id) &&
      !isGroupedChild(c) &&
      !isGroupClip(c) &&
      c.type !== 'audio'
  );
  if (children.length < 2) return clips;

  const bounds = getUnionBounds(children);
  const groupId = `group_${Date.now()}`;
  const childIds = children.map((c) => c.id);

  const group = {
    id: groupId,
    type: 'group',
    childIds,
    position: { x: Math.round(bounds.x), y: Math.round(bounds.y) },
    size: { width: Math.round(bounds.width), height: Math.round(bounds.height) },
    rotation: 0,
    scale: 1,
    opacity: 1,
    layer: Math.max(...children.map((c) => c.layer ?? 0)),
    style: { scaleX: 1, scaleY: 1 },
    visible: true,
    locked: false,
    startTime: Math.min(...children.map((c) => c.startTime ?? 0)),
    endTime: Math.max(...children.map((c) => c.endTime ?? 5)),
  };

  const childIdSet = new Set(childIds);
  return clips.map((clip) => {
    if (!childIdSet.has(clip.id)) return clip;
    return {
      ...clip,
      groupId,
      position: {
        x: Math.round((clip.position?.x ?? 0) - bounds.x),
        y: Math.round((clip.position?.y ?? 0) - bounds.y),
      },
    };
  }).concat(group);
}

export function ungroupGroup(clips, groupId) {
  const group = clips.find((c) => c.id === groupId && isGroupClip(c));
  if (!group) return clips;

  const groupMatrix = clipToTransformMatrix(group);
  const childIds = new Set(group.childIds || []);

  return clips
    .filter((c) => c.id !== groupId)
    .map((clip) => {
      if (!childIds.has(clip.id)) return clip;
      const baked = localToWorldTransform(groupMatrix, clip);
      const { groupId: _gid, ...rest } = clip;
      return {
        ...rest,
        position: {
          x: Math.round(baked.position.x),
          y: Math.round(baked.position.y),
        },
        size: {
          width: Math.round(baked.size.width),
          height: Math.round(baked.size.height),
        },
        rotation: Math.round((baked.rotation ?? 0) * 10) / 10,
        scale: baked.scale ?? 1,
        style: { ...(clip.style || {}), ...baked.style },
        layer: group.layer ?? clip.layer,
      };
    });
}

/** Union bounds for multi-selection overlay (composition space). */
export function getSelectionUnionBounds(clips, selectedIds) {
  const selected = clips.filter((c) => selectedIds.includes(c.id) && !isGroupedChild(c));
  if (!selected.length) return null;
  if (selected.length === 1 && isGroupClip(selected[0])) {
    return getOrientedBounds(selected[0]);
  }
  return getUnionBounds(selected);
}

export function duplicateGroupStructure(clips, idMap) {
  return clips.map((clip) => {
    const next = { ...clip, id: idMap.get(clip.id) || clip.id };
    if (isGroupClip(clip)) {
      next.childIds = (clip.childIds || []).map((id) => idMap.get(id) || id);
    }
    if (clip.groupId) {
      next.groupId = idMap.get(clip.groupId) || clip.groupId;
    }
    return next;
  });
}
