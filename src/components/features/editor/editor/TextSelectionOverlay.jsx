import { useRef, useState, useCallback } from 'react';
import {
  localizePointerDelta,
  MIN_TEXT_HEIGHT,
  MIN_TEXT_WIDTH,
  normalizeAngle,
  pointerAngleFromCenter,
} from '../../../../utils/canvasTransformUtils';
import { resolveClipRect } from '../../../../utils/clipLayout';
import { attachPointerDrag, bindPointerDrag, exceedsDragThreshold } from '../../../../utils/pointerDrag';
import {
  computeTextResize,
  isCornerResizeHandle,
  isSideResizeHandle,
  snapTextAngle,
} from '../../../../utils/textCanvasTransform';
import { computeTextSmartGuides } from '../../../../utils/textSmartGuides';
import './TextSelectionOverlay.css';

const HANDLE_OFFSET = 7;
const BORDER_DRAG = 8;

const CornerHandle = ({ cursor, style, onPointerDown }) => (
  <div
    className="text-sel-handle text-sel-handle--corner"
    onPointerDown={onPointerDown}
    style={{ cursor, ...style }}
    role="presentation"
  />
);

const EdgeHandle = ({ cursor, vertical, style, onPointerDown }) => (
  <div
    className={`text-sel-handle text-sel-handle--edge ${vertical ? 'text-sel-handle--edge-v' : 'text-sel-handle--edge-h'}`}
    onPointerDown={onPointerDown}
    style={{ cursor, ...style }}
    role="presentation"
  />
);

/**
 * Text-only selection chrome: border drag strips, 8 handles, rotation, badges.
 * Hidden when isEditing. Uses RAF + ephemeral updates during drag.
 */
const TextSelectionOverlay = ({
  clip,
  displayScale,
  compositionWidth = 1920,
  compositionHeight = 1080,
  otherTextClips = [],
  isEditing = false,
  snapToGrid = true,
  gridSize = 20,
  onUpdatePosition,
  onUpdateBounds,
  onUpdateTextFontSize,
  onUpdateRotation,
  onCommit,
  onEphemeralChange,
  onGuidesChange,
  onDragBadgeChange,
  getRotationPivotClient,
}) => {
  const containerRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const rafPendingRef = useRef(false);
  const ephemeralRef = useRef(null);
  const [angleBadge, setAngleBadge] = useState(null);

  const scheduleEphemeral = useCallback(
    (patch) => {
      ephemeralRef.current = patch;
      if (rafPendingRef.current) return;
      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;
        onEphemeralChange?.(ephemeralRef.current);
      });
    },
    [onEphemeralChange]
  );

  const clearEphemeral = useCallback(() => {
    ephemeralRef.current = null;
    onEphemeralChange?.(null);
  }, [onEphemeralChange]);

  const snapPoint = useCallback(
    (x, y) => {
      if (!snapToGrid) return { x, y };
      const snap = (v) => Math.round(v / gridSize) * gridSize;
      return { x: snap(x), y: snap(y) };
    },
    [snapToGrid, gridSize]
  );

  const startDrag = useCallback(
    (e) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const layout = resolveClipRect(clip);
      const origX = layout.position.x;
      const origY = layout.position.y;
      let dragging = false;

      document.body.style.userSelect = 'none';

      attachPointerDrag(
        e,
        (mv) => {
          if (!dragging && !exceedsDragThreshold(startX, startY, mv.clientX, mv.clientY)) return;
          dragging = true;
          const dx = (mv.clientX - startX) / displayScale;
          const dy = (mv.clientY - startY) / displayScale;
          let nx = origX + dx;
          let ny = origY + dy;

          const guides = computeTextSmartGuides(
            { x: nx, y: ny, width: layout.size.width, height: layout.size.height },
            otherTextClips,
            { width: compositionWidth, height: compositionHeight },
            clip.id
          );
          nx += guides.snapDx;
          ny += guides.snapDy;
          onGuidesChange?.(guides.guides);
          onDragBadgeChange?.({ x: Math.round(nx), y: Math.round(ny) });
          scheduleEphemeral({ clipId: clip.id, x: nx, y: ny });
        },
        () => {
          document.body.style.userSelect = '';
          onGuidesChange?.([]);
          onDragBadgeChange?.(null);
          const ep = ephemeralRef.current;
          if (ep && dragging) {
            const snapped = snapPoint(ep.x, ep.y);
            onUpdatePosition(snapped.x, snapped.y);
          }
          clearEphemeral();
          onCommit?.();
        }
      );
    },
    [
      clip,
      displayScale,
      otherTextClips,
      compositionWidth,
      compositionHeight,
      onUpdatePosition,
      onCommit,
      onGuidesChange,
      onDragBadgeChange,
      scheduleEphemeral,
      clearEphemeral,
      snapPoint,
    ]
  );

  const startResize = useCallback(
    (handle, e) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const layout = resolveClipRect(clip);
      const origW = Number(layout.size.width) || 200;
      const origH = Number(layout.size.height) || 120;
      const origX = Number(layout.position.x) || 0;
      const origY = Number(layout.position.y) || 0;
      const origFontSize = Number.parseFloat(String(clip.style?.fontSize ?? 24)) || 24;
      const rotation = clip.rotation ?? 0;

      document.body.style.userSelect = 'none';

      attachPointerDrag(
        e,
        (mv) => {
          const dx = (mv.clientX - startX) / displayScale;
          const dy = (mv.clientY - startY) / displayScale;
          const useProportional = isCornerResizeHandle(handle) && mv.shiftKey;
          const fromCenter = mv.altKey;
          const result = computeTextResize(
            handle,
            { x: origX, y: origY, width: origW, height: origH },
            dx,
            dy,
            { proportional: useProportional, fromCenter, rotation }
          );
          lastBoundsRef.current = result;
          scheduleEphemeral({
            clipId: clip.id,
            x: result.x,
            y: result.y,
            width: result.width,
            height: result.height,
          });
          onDragBadgeChange?.({ w: Math.round(result.width), h: Math.round(result.height) });

          if (isCornerResizeHandle(handle) && onUpdateTextFontSize) {
            const scale = Math.min(result.width / origW, result.height / origH);
            const nextFont = Math.round(Math.max(8, Math.min(300, origFontSize * scale)) * 10) / 10;
            scheduleEphemeral({
              clipId: clip.id,
              x: result.x,
              y: result.y,
              width: result.width,
              height: result.height,
              fontSize: nextFont,
            });
          }
        },
        () => {
          document.body.style.userSelect = '';
          onDragBadgeChange?.(null);
          const result = lastBoundsRef.current;
          if (result) {
            onUpdateBounds(result.x, result.y, result.width, result.height);
            if (isCornerResizeHandle(handle) && onUpdateTextFontSize && result.fontSize == null) {
              const scale = Math.min(result.width / origW, result.height / origH);
              const nextFont = Math.round(Math.max(8, Math.min(300, origFontSize * scale)) * 10) / 10;
              onUpdateTextFontSize(nextFont);
            } else if (ephemeralRef.current?.fontSize != null && onUpdateTextFontSize) {
              onUpdateTextFontSize(ephemeralRef.current.fontSize);
            }
          }
          lastBoundsRef.current = null;
          clearEphemeral();
          onCommit?.();
        }
      );
    },
    [
      clip,
      displayScale,
      onUpdateBounds,
      onUpdateTextFontSize,
      onCommit,
      onDragBadgeChange,
      scheduleEphemeral,
      clearEphemeral,
    ]
  );

  const startRotate = useCallback(
    (e) => {
      if (!onUpdateRotation) return;
      const pivot = getRotationPivotClient?.(clip);
      let centerX;
      let centerY;
      if (pivot) {
        centerX = pivot.x;
        centerY = pivot.y;
      } else {
        const el = containerRef.current?.parentElement;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      const startPointerAngle = pointerAngleFromCenter(e.clientX, e.clientY, centerX, centerY);
      const origRotation = clip.rotation ?? 0;
      document.body.style.userSelect = 'none';

      attachPointerDrag(
        e,
        (mv) => {
          const pointerAngle = pointerAngleFromCenter(mv.clientX, mv.clientY, centerX, centerY);
          const delta = pointerAngle - startPointerAngle;
          const raw = origRotation + delta;
          const snapped = snapTextAngle(raw, mv.shiftKey);
          scheduleEphemeral({ clipId: clip.id, rotation: snapped });
          setAngleBadge({
            x: mv.clientX,
            y: mv.clientY - 16,
            angle: normalizeAngle(snapped),
          });
        },
        () => {
          document.body.style.userSelect = '';
          setAngleBadge(null);
          const ep = ephemeralRef.current;
          if (ep?.rotation != null) onUpdateRotation(ep.rotation);
          clearEphemeral();
          onCommit?.();
        }
      );
    },
    [clip, onUpdateRotation, onCommit, getRotationPivotClient, scheduleEphemeral, clearEphemeral]
  );

  if (isEditing) return null;

  return (
    <div ref={containerRef} className="text-sel-overlay text-sel-overlay--visible">
      <div className="text-sel-overlay__border" />

      {/* Border drag strips — inner area stays clickable for double-click edit */}
      <div
        className="text-sel-overlay__drag text-sel-overlay__drag--top"
        style={{ height: BORDER_DRAG, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag(startDrag)}
      />
      <div
        className="text-sel-overlay__drag text-sel-overlay__drag--bottom"
        style={{ height: BORDER_DRAG, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag(startDrag)}
      />
      <div
        className="text-sel-overlay__drag text-sel-overlay__drag--left"
        style={{ width: BORDER_DRAG, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag(startDrag)}
      />
      <div
        className="text-sel-overlay__drag text-sel-overlay__drag--right"
        style={{ width: BORDER_DRAG, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag(startDrag)}
      />

      <CornerHandle
        cursor="nw-resize"
        style={{ top: -HANDLE_OFFSET, left: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('top-left', ev))}
      />
      <CornerHandle
        cursor="ne-resize"
        style={{ top: -HANDLE_OFFSET, right: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('top-right', ev))}
      />
      <CornerHandle
        cursor="sw-resize"
        style={{ bottom: -HANDLE_OFFSET, left: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('bottom-left', ev))}
      />
      <CornerHandle
        cursor="se-resize"
        style={{ bottom: -HANDLE_OFFSET, right: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('bottom-right', ev))}
      />

      <EdgeHandle
        vertical={false}
        cursor="n-resize"
        style={{ top: -4, left: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('top', ev))}
      />
      <EdgeHandle
        vertical={false}
        cursor="s-resize"
        style={{ bottom: -4, left: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('bottom', ev))}
      />
      <EdgeHandle
        vertical
        cursor="w-resize"
        style={{ left: -4, top: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('left', ev))}
      />
      <EdgeHandle
        vertical
        cursor="e-resize"
        style={{ right: -4, top: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((ev) => startResize('right', ev))}
      />

      {onUpdateRotation && (
        <>
          <div className="text-sel-overlay__rotate-line" />
          <div
            className="text-sel-overlay__rotate-handle"
            onPointerDown={bindPointerDrag(startRotate)}
            style={{ pointerEvents: 'auto' }}
            title="Rotate (Shift: 15° snap)"
          />
        </>
      )}

      {angleBadge && (
        <div
          className="text-sel-overlay__angle-badge"
          style={{ left: angleBadge.x, top: angleBadge.y }}
        >
          {angleBadge.angle}°
        </div>
      )}
    </div>
  );
};

export default TextSelectionOverlay;
