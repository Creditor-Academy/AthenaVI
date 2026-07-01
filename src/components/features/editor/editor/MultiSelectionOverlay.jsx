import { useCallback, useRef } from 'react';
import { MIN_CLIP_HEIGHT, MIN_CLIP_WIDTH } from '../../../../utils/canvasTransformUtils';
import { getSelectionUnionBounds } from '../../../../utils/editorGroupUtils';
import { normalizeAngle } from '../../../../utils/canvasTransformUtils';
import SelectionOverlay from './SelectionOverlay';

/**
 * Unified selection overlay for multi-selected clips (pre-group).
 */
const MultiSelectionOverlay = ({
  clips,
  selectedIds,
  displayScale,
  onUpdateClip,
  onCommit,
  getRotationPivotClient,
}) => {
  const boundsRef = useRef(null);
  const origStateRef = useRef(null);

  const bounds = getSelectionUnionBounds(clips, selectedIds);
  if (!bounds || selectedIds.length < 2) return null;

  boundsRef.current = bounds;

  const virtualClip = {
    id: '__multi__',
    position: { x: bounds.x, y: bounds.y },
    size: { width: bounds.width, height: bounds.height },
    rotation: 0,
    scale: 1,
  };

  const selectedClips = clips.filter((c) => selectedIds.includes(c.id) && !c.groupId);

  const handleUpdatePosition = useCallback(
    (x, y) => {
      const b = boundsRef.current;
      if (!b) return;
      const dx = x - b.x;
      const dy = y - b.y;
      for (const clip of selectedClips) {
        onUpdateClip(clip.id, {
          position: {
            x: Math.round((clip.position?.x ?? 0) + dx),
            y: Math.round((clip.position?.y ?? 0) + dy),
          },
        });
      }
      boundsRef.current = { ...b, x, y };
    },
    [selectedClips, onUpdateClip]
  );

  const handleUpdateBounds = useCallback(
    (x, y, w, h) => {
      const b = boundsRef.current;
      if (!b || !origStateRef.current) return;
      const scaleX = w / b.width;
      const scaleY = h / b.height;

      for (const orig of origStateRef.current) {
        const relX = orig.x - b.x;
        const relY = orig.y - b.y;
        onUpdateClip(orig.id, {
          position: {
            x: Math.round(x + relX * scaleX),
            y: Math.round(y + relY * scaleY),
          },
          size: {
            width: Math.max(MIN_CLIP_WIDTH, Math.round(orig.w * scaleX)),
            height: Math.max(MIN_CLIP_HEIGHT, Math.round(orig.h * scaleY)),
          },
        });
      }
    },
    [onUpdateClip]
  );

  const handleUpdateRotation = useCallback(
    (deg) => {
      const b = boundsRef.current;
      const orig = origStateRef.current;
      if (!b || !orig) return;
      const delta = deg;
      const groupCx = b.x + b.width / 2;
      const groupCy = b.y + b.height / 2;
      const rad = (delta * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      for (const item of orig) {
        const dx = item.cx - groupCx;
        const dy = item.cy - groupCy;
        const newCx = groupCx + dx * cos - dy * sin;
        const newCy = groupCy + dx * sin + dy * cos;
        onUpdateClip(item.id, {
          rotation: normalizeAngle(item.rotation + delta),
          position: {
            x: Math.round(newCx - item.w / 2),
            y: Math.round(newCy - item.h / 2),
          },
        });
      }
    },
    [onUpdateClip]
  );

  const captureOrigState = () => {
    origStateRef.current = selectedClips.map((c) => ({
      id: c.id,
      x: c.position?.x ?? 0,
      y: c.position?.y ?? 0,
      w: c.size?.width ?? 100,
      h: c.size?.height ?? 100,
      cx: (c.position?.x ?? 0) + (c.size?.width ?? 0) / 2,
      cy: (c.position?.y ?? 0) + (c.size?.height ?? 0) / 2,
      rotation: c.rotation ?? 0,
    }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        pointerEvents: 'none',
        zIndex: 10000,
      }}
      onPointerDown={captureOrigState}
    >
      <SelectionOverlay
        clip={virtualClip}
        clipType="default"
        displayScale={displayScale}
        onUpdatePosition={handleUpdatePosition}
        onUpdateBounds={handleUpdateBounds}
        onUpdateRotation={handleUpdateRotation}
        onCommit={onCommit}
        getRotationPivotClient={getRotationPivotClient}
      />
    </div>
  );
};

export default MultiSelectionOverlay;
