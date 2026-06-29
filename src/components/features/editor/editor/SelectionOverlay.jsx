import { useRef, useState, useCallback } from 'react';
import {
  computeResize,
  getClipTransformCenter,
  isCornerHandle,
  localizePointerDelta,
  MIN_CLIP_HEIGHT,
  MIN_CLIP_WIDTH,
  MIN_TEXT_HEIGHT,
  MIN_TEXT_WIDTH,
  normalizeAngle,
  pointerAngleFromCenter,
  snapAngle,
} from '../../../../utils/canvasTransformUtils';
import { resolveClipRect } from '../../../../utils/clipLayout';
import './SelectionOverlay.css';

const HANDLE_OFFSET = 7;

const CornerHandle = ({ cursor, style, onPointerDown }) => (
  <div
    className="sel-handle sel-handle--corner"
    onPointerDown={onPointerDown}
    style={{ cursor, ...style }}
    role="presentation"
  />
);

const EdgeHandle = ({ cursor, vertical, style, onPointerDown }) => (
  <div
    className={`sel-handle sel-handle--edge ${vertical ? 'sel-handle--edge-v' : 'sel-handle--edge-h'}`}
    onPointerDown={onPointerDown}
    style={{ cursor, ...style }}
    role="presentation"
  />
);

function bindPointerDrag(onPointerDown) {
  return (e) => {
    e.stopPropagation();
    e.preventDefault();
    onPointerDown(e);
  };
}

function attachPointerDrag(e, onMove, onEnd) {
  const target = e.currentTarget;
  if (target.setPointerCapture) {
    target.setPointerCapture(e.pointerId);
  }

  const handleMove = (mv) => {
    if (mv.pointerId !== e.pointerId) return;
    onMove(mv);
  };

  const handleUp = (mv) => {
    if (mv.pointerId !== e.pointerId) return;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    onEnd?.(mv);
  };

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleUp);
  window.addEventListener('pointercancel', handleUp);
}

/**
 * Interactive selection overlay: move, 8-handle resize, rotation handle.
 */
const SelectionOverlay = ({
  clip,
  clipType = 'default',
  displayScale,
  onUpdatePosition,
  onUpdateSize,
  onUpdateBounds,
  onUpdateTextFontSize,
  onUpdateRotation,
  onCommit,
  getRotationPivotClient,
  showRotation = true,
  showDimensions = false,
}) => {
  const containerRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const [angleBadge, setAngleBadge] = useState(null);
  const [sizeBadge, setSizeBadge] = useState(null);

  const isText = clipType === 'text';
  const minW = isText ? MIN_TEXT_WIDTH : MIN_CLIP_WIDTH;
  const minH = isText ? MIN_TEXT_HEIGHT : MIN_CLIP_HEIGHT;

  const startDrag = useCallback(
    (e) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const layout = resolveClipRect(clip);
      const origX = layout.position.x;
      const origY = layout.position.y;

      attachPointerDrag(
        e,
        (mv) => {
          const dx = (mv.clientX - startX) / displayScale;
          const dy = (mv.clientY - startY) / displayScale;
          onUpdatePosition(origX + dx, origY + dy);
        },
        () => onCommit?.()
      );
    },
    [clip, displayScale, onUpdatePosition, onCommit]
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
      if (origW <= 0 || origH <= 0) return;
      const origFontSize = Number.parseFloat(String(clip.style?.fontSize ?? 24)) || 24;
      const rotation = clip.rotation ?? 0;

      /** Compute font scale from resize result based on which handle was dragged. */
      const computeFontScale = (result) => {
        if (handle === 'left' || handle === 'right') {
          return result.width / origW;
        }
        if (handle === 'top' || handle === 'bottom') {
          return result.height / origH;
        }
        // corners: use the smaller ratio so text always fits inside the box
        return Math.min(result.width / origW, result.height / origH);
      };

      attachPointerDrag(
        e,
        (mv) => {
          const dx = (mv.clientX - startX) / displayScale;
          const dy = (mv.clientY - startY) / displayScale;
          const { dx: localDx, dy: localDy } = localizePointerDelta(dx, dy, rotation);
          const useProportional = isCornerHandle(handle) && mv.shiftKey;
          const result = computeResize(
            handle,
            { width: origW, height: origH, x: origX, y: origY },
            localDx,
            localDy,
            { proportional: useProportional, minWidth: minW, minHeight: minH }
          );
          lastBoundsRef.current = result;
          if (onUpdateBounds) {
            onUpdateBounds(result.x, result.y, result.width, result.height);
          } else {
            onUpdateSize(result.width, result.height);
            if (result.x !== origX || result.y !== origY) {
              onUpdatePosition(result.x, result.y);
            }
          }
          if (showDimensions) {
            setSizeBadge({ w: result.width, h: result.height });
          }
          // Live font scaling for text clips — all handle types
          if (isText && onUpdateTextFontSize) {
            const scale = computeFontScale(result);
            const nextFont = Math.round(Math.max(8, Math.min(300, origFontSize * scale)) * 10) / 10;
            onUpdateTextFontSize(nextFont);
          }
        },
        () => {
          const result = lastBoundsRef.current;
          // Final commit of scaled font size for text clips
          if (result && isText && onUpdateTextFontSize) {
            const scale = computeFontScale(result);
            const nextFont = Math.round(Math.max(8, Math.min(300, origFontSize * scale)) * 10) / 10;
            onUpdateTextFontSize(nextFont);
          }
          lastBoundsRef.current = null;
          setSizeBadge(null);
          onCommit?.();
        }
      );
    },
    [
      clip,
      displayScale,
      onUpdatePosition,
      onUpdateSize,
      onUpdateBounds,
      onCommit,
      minW,
      minH,
      showDimensions,
      isText,
      onUpdateTextFontSize,
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

      attachPointerDrag(
        e,
        (mv) => {
          const pointerAngle = pointerAngleFromCenter(mv.clientX, mv.clientY, centerX, centerY);
          const delta = pointerAngle - startPointerAngle;
          const raw = origRotation + delta;
          const snapped = snapAngle(raw, !mv.altKey && !mv.ctrlKey && !mv.metaKey);
          onUpdateRotation(snapped);
          setAngleBadge({
            x: mv.clientX,
            y: mv.clientY - 16,
            angle: normalizeAngle(snapped),
          });
        },
        () => {
          setAngleBadge(null);
          onCommit?.();
        }
      );
    },
    [clip, onUpdateRotation, onCommit, getRotationPivotClient]
  );

  return (
    <div ref={containerRef} className="sel-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div className="sel-overlay__border" />

      <div
        className="sel-overlay__move"
        onPointerDown={bindPointerDrag(startDrag)}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Corner handles */}
      <CornerHandle
        cursor="nw-resize"
        style={{ top: -HANDLE_OFFSET, left: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('top-left', e))}
      />
      <CornerHandle
        cursor="ne-resize"
        style={{ top: -HANDLE_OFFSET, right: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('top-right', e))}
      />
      <CornerHandle
        cursor="sw-resize"
        style={{ bottom: -HANDLE_OFFSET, left: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('bottom-left', e))}
      />
      <CornerHandle
        cursor="se-resize"
        style={{ bottom: -HANDLE_OFFSET, right: -HANDLE_OFFSET, pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('bottom-right', e))}
      />

      {/* Edge handles */}
      <EdgeHandle
        vertical={false}
        cursor="n-resize"
        style={{ top: -4, left: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('top', e))}
      />
      <EdgeHandle
        vertical={false}
        cursor="s-resize"
        style={{ bottom: -4, left: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('bottom', e))}
      />
      <EdgeHandle
        vertical
        cursor="w-resize"
        style={{ left: -4, top: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('left', e))}
      />
      <EdgeHandle
        vertical
        cursor="e-resize"
        style={{ right: -4, top: 'calc(50% - 11px)', pointerEvents: 'auto' }}
        onPointerDown={bindPointerDrag((e) => startResize('right', e))}
      />

      {showRotation && onUpdateRotation && (
        <>
          <div className="sel-overlay__rotate-line" />
          <div
            className="sel-overlay__rotate-handle"
            onPointerDown={bindPointerDrag(startRotate)}
            style={{ pointerEvents: 'auto' }}
            title="Rotate (hold Alt to disable snap)"
          />
        </>
      )}

      {sizeBadge && (
        <div className="sel-overlay__dimension-badge">
          {sizeBadge.w} × {sizeBadge.h}
        </div>
      )}

      {angleBadge && (
        <div
          className="sel-overlay__angle-badge"
          style={{ left: angleBadge.x, top: angleBadge.y }}
        >
          {angleBadge.angle}°
        </div>
      )}
    </div>
  );
};

export default SelectionOverlay;
