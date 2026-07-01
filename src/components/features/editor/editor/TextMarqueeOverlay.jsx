import { useCallback, useRef } from 'react';
import { attachPointerDrag } from '../../../../utils/pointerDrag';
import { clientToComposition } from '../../../../utils/editorPlacementUtils';
import { getTextClips, rectsIntersect } from '../../../../utils/textCanvasTransform';

/**
 * Marquee (rubber-band) selection for text layers only.
 */
const TextMarqueeOverlay = ({
  compositionRef,
  displayScale,
  displayOffset,
  clips = [],
  onSelectTextIds,
  onMarqueeChange,
  onDeselect,
}) => {
  const startRef = useRef(null);

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      const comp = compositionRef?.current;
      if (!comp) return;

      const rect = comp.getBoundingClientRect();
      const start = clientToComposition(e.clientX, e.clientY, rect, displayScale, displayOffset);
      startRef.current = start;
      const additive = e.shiftKey;

      attachPointerDrag(
        e,
        (mv) => {
          const current = clientToComposition(mv.clientX, mv.clientY, rect, displayScale, displayOffset);
          const x = Math.min(start.x, current.x);
          const y = Math.min(start.y, current.y);
          const width = Math.abs(current.x - start.x);
          const height = Math.abs(current.y - start.y);
          onMarqueeChange?.({ x, y, width, height });
        },
        (mv) => {
          const current = clientToComposition(mv.clientX, mv.clientY, rect, displayScale, displayOffset);
          const marquee = {
            x: Math.min(start.x, current.x),
            y: Math.min(start.y, current.y),
            width: Math.abs(current.x - start.x),
            height: Math.abs(current.y - start.y),
          };
          onMarqueeChange?.(null);

          if (marquee.width < 4 && marquee.height < 4) {
            if (!additive) onDeselect?.();
            return;
          }

          const textClips = getTextClips(clips);
          const hits = textClips
            .filter((clip) => {
              const px = clip.position?.x ?? 0;
              const py = clip.position?.y ?? 0;
              const pw = clip.size?.width ?? 100;
              const ph = clip.size?.height ?? 40;
              return rectsIntersect(marquee, { x: px, y: py, width: pw, height: ph });
            })
            .map((c) => c.id);

          if (hits.length) onSelectTextIds?.(hits, { additive });
        }
      );
    },
    [compositionRef, displayScale, displayOffset, clips, onSelectTextIds, onMarqueeChange, onDeselect]
  );

  return (
    <div
      className="text-marquee-capture"
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        cursor: 'crosshair',
      }}
      aria-hidden
    />
  );
};

export default TextMarqueeOverlay;
