import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdContentCopy,
  MdDelete,
  MdFlipToFront,
  MdFlipToBack,
  MdLock,
  MdLockOpen,
  MdImage,
  MdCrop,
  MdPalette,
  MdBorderColor,
  MdOpacity,
  MdExpandMore,
  MdCheck,
} from 'react-icons/md';
import {
  isTextLayer,
  FONT_FAMILIES,
  parseFontSize,
  resolveFontFamilyValue,
} from '../../../../utils/textClip';
import { buildLayerBorderPatch, parseLayerBorder } from '../../../../utils/layerBorderUtils';
import {
  COMPOSITION_H,
  COMPOSITION_W,
  resolveClipRect,
} from '../../../../utils/clipLayout';
import './SelectionQuickToolbar.css';

const TOOLBAR_GAP = 12;
const CANVAS_MARGIN = 8;

/** Partial counter-scale: readable on a zoomed-out canvas without full screen-sized UI. */
export function getToolbarUiScale(displayScale) {
  const scale = Number(displayScale);
  if (!scale || scale <= 0 || scale >= 0.9) return 1;
  const fullCompensation = 1 / scale;
  const partial = 1 + (fullCompensation - 1) * 0.5;
  return Math.min(1.75, partial);
}

export function getToolbarCompositionBounds(toolbarEl, compositionEl, displayScale) {
  if (!toolbarEl || !compositionEl || !displayScale) return null;
  const tRect = toolbarEl.getBoundingClientRect();
  const cRect = compositionEl.getBoundingClientRect();
  return {
    left: (tRect.left - cRect.left) / displayScale,
    top: (tRect.top - cRect.top) / displayScale,
    right: (tRect.right - cRect.left) / displayScale,
    bottom: (tRect.bottom - cRect.top) / displayScale,
    width: tRect.width / displayScale,
    height: tRect.height / displayScale,
  };
}

function measureCanvasOverflow(bounds, compositionWidth, compositionHeight) {
  let dx = 0;
  let dy = 0;
  if (bounds.left < CANVAS_MARGIN) dx += CANVAS_MARGIN - bounds.left;
  if (bounds.right > compositionWidth - CANVAS_MARGIN) {
    dx -= bounds.right - (compositionWidth - CANVAS_MARGIN);
  }
  if (bounds.top < CANVAS_MARGIN) dy += CANVAS_MARGIN - bounds.top;
  if (bounds.bottom > compositionHeight - CANVAS_MARGIN) {
    dy -= bounds.bottom - (compositionHeight - CANVAS_MARGIN);
  }
  return { dx, dy };
}

function applyToolbarPlacementDom(el, placement, mediaLeftLayout) {
  el.style.setProperty('--sq-shift-x', `${placement.shiftX}px`);
  el.style.setProperty('--sq-shift-y', `${placement.shiftY}px`);
  if (mediaLeftLayout) {
    el.classList.toggle('sq-toolbar--media-right', placement.mediaRight);
    el.classList.toggle('sq-toolbar--media-left-side', !placement.mediaRight);
    el.classList.remove('sq-toolbar--above');
  } else {
    el.classList.toggle('sq-toolbar--above', !placement.below);
    el.classList.remove('sq-toolbar--media-right', 'sq-toolbar--media-left-side');
  }
}

function overflowMagnitude(dx, dy) {
  return Math.abs(dx) + Math.abs(dy);
}

export function refineToolbarPlacement({
  toolbarEl,
  compositionEl,
  displayScale,
  initialPlacement,
  compositionWidth,
  compositionHeight,
  mediaLeftLayout,
}) {
  const tryRefine = (startPlacement) => {
    let current = { ...startPlacement, shiftX: 0, shiftY: 0 };
    applyToolbarPlacementDom(toolbarEl, current, mediaLeftLayout);

    for (let i = 0; i < 5; i += 1) {
      const bounds = getToolbarCompositionBounds(toolbarEl, compositionEl, displayScale);
      if (!bounds) return current;
      const { dx, dy } = measureCanvasOverflow(bounds, compositionWidth, compositionHeight);
      if (overflowMagnitude(dx, dy) < 0.5) return current;
      current = {
        ...current,
        shiftX: Math.round(current.shiftX + dx),
        shiftY: Math.round(current.shiftY + dy),
      };
      applyToolbarPlacementDom(toolbarEl, current, mediaLeftLayout);
    }
    return current;
  };

  let placement = tryRefine(initialPlacement);
  const bounds = getToolbarCompositionBounds(toolbarEl, compositionEl, displayScale);
  if (!bounds) return placement;

  const primaryOverflow = measureCanvasOverflow(bounds, compositionWidth, compositionHeight);
  if (overflowMagnitude(primaryOverflow.dx, primaryOverflow.dy) <= 0.5) {
    return placement;
  }

  const alternate = {
    ...initialPlacement,
    shiftX: 0,
    shiftY: 0,
    ...(mediaLeftLayout
      ? { mediaRight: !initialPlacement.mediaRight }
      : { below: !initialPlacement.below }),
  };

  if (
    alternate.mediaRight === initialPlacement.mediaRight &&
    alternate.below === initialPlacement.below
  ) {
    return placement;
  }

  const alternatePlacement = tryRefine(alternate);
  const alternateBounds = getToolbarCompositionBounds(toolbarEl, compositionEl, displayScale);
  if (!alternateBounds) return placement;

  const alternateOverflow = measureCanvasOverflow(
    alternateBounds,
    compositionWidth,
    compositionHeight
  );
  if (
    overflowMagnitude(alternateOverflow.dx, alternateOverflow.dy) <
    overflowMagnitude(primaryOverflow.dx, primaryOverflow.dy)
  ) {
    return alternatePlacement;
  }

  return placement;
}

/**
 * Compute toolbar flip/shift so the bar stays inside the composition canvas.
 * Coordinates are composition pixels; toolbar is positioned relative to the clip box.
 */
export function computeToolbarPlacement({
  clipRect,
  toolbarW,
  toolbarH,
  compositionWidth,
  compositionHeight,
  mediaLeftLayout,
}) {
  const clipX = clipRect.position.x;
  const clipY = clipRect.position.y;
  const clipW = clipRect.size.width;
  const clipH = clipRect.size.height;
  const clipRight = clipX + clipW;
  const clipBottom = clipY + clipH;

  if (mediaLeftLayout) {
    const rightFits = clipRight + TOOLBAR_GAP + toolbarW <= compositionWidth - CANVAS_MARGIN;
    const leftFits = clipX - TOOLBAR_GAP - toolbarW >= CANVAS_MARGIN;
    let mediaRight = true;
    if (rightFits) {
      mediaRight = true;
    } else if (leftFits) {
      mediaRight = false;
    } else {
      const roomRight = compositionWidth - CANVAS_MARGIN - (clipRight + TOOLBAR_GAP);
      const roomLeft = clipX - TOOLBAR_GAP - CANVAS_MARGIN;
      mediaRight = roomRight >= roomLeft;
    }

    let shiftX = 0;
    let shiftY = 0;

    const toolbarTop = () => clipY + shiftY;
    const toolbarBottom = () => toolbarTop() + toolbarH;
    if (toolbarTop() < CANVAS_MARGIN) {
      shiftY += CANVAS_MARGIN - toolbarTop();
    }
    if (toolbarBottom() > compositionHeight - CANVAS_MARGIN) {
      shiftY -= toolbarBottom() - (compositionHeight - CANVAS_MARGIN);
    }

    const toolbarLeft = () =>
      mediaRight
        ? clipRight + TOOLBAR_GAP + shiftX
        : clipX - TOOLBAR_GAP - toolbarW + shiftX;
    const toolbarRight = () => toolbarLeft() + toolbarW;

    if (toolbarLeft() < CANVAS_MARGIN) {
      shiftX += CANVAS_MARGIN - toolbarLeft();
    }
    if (toolbarRight() > compositionWidth - CANVAS_MARGIN) {
      shiftX -= toolbarRight() - (compositionWidth - CANVAS_MARGIN);
    }

    return {
      below: true,
      mediaRight,
      shiftX: Math.round(shiftX),
      shiftY: Math.round(shiftY),
    };
  }

  const belowFits = clipBottom + TOOLBAR_GAP + toolbarH <= compositionHeight - CANVAS_MARGIN;
  const aboveFits = clipY - TOOLBAR_GAP - toolbarH >= CANVAS_MARGIN;
  let below = true;
  if (belowFits) {
    below = true;
  } else if (aboveFits) {
    below = false;
  } else {
    const roomBelow = compositionHeight - CANVAS_MARGIN - (clipBottom + TOOLBAR_GAP);
    const roomAbove = clipY - TOOLBAR_GAP - CANVAS_MARGIN;
    below = roomBelow >= roomAbove;
  }

  let shiftX = 0;
  let shiftY = 0;
  const centerX = clipX + clipW / 2;

  const toolbarLeft = () => centerX - toolbarW / 2 + shiftX;
  const toolbarRight = () => toolbarLeft() + toolbarW;
  if (toolbarLeft() < CANVAS_MARGIN) {
    shiftX += CANVAS_MARGIN - toolbarLeft();
  }
  if (toolbarRight() > compositionWidth - CANVAS_MARGIN) {
    shiftX -= toolbarRight() - (compositionWidth - CANVAS_MARGIN);
  }

  const toolbarTop = () =>
    below
      ? clipBottom + TOOLBAR_GAP + shiftY
      : clipY - TOOLBAR_GAP - toolbarH + shiftY;
  const toolbarBottom = () => toolbarTop() + toolbarH;

  if (toolbarTop() < CANVAS_MARGIN) {
    shiftY += CANVAS_MARGIN - toolbarTop();
  }
  if (toolbarBottom() > compositionHeight - CANVAS_MARGIN) {
    shiftY -= toolbarBottom() - (compositionHeight - CANVAS_MARGIN);
  }

  return {
    below,
    mediaRight: true,
    shiftX: Math.round(shiftX),
    shiftY: Math.round(shiftY),
  };
}

const ToolbarBtn = ({ icon, title, active, onClick, danger }) => (
  <button
    type="button"
    className={`sq-toolbar__btn ${active ? 'sq-toolbar__btn--active' : ''} ${danger ? 'sq-toolbar__btn--danger' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    onPointerDown={(e) => e.stopPropagation()}
    title={title}
  >
    {icon}
  </button>
);

const ToolbarDivider = () => <span className="sq-toolbar__divider" />;

/**
 * Floating contextual toolbar shown above a selected canvas object.
 */
const SelectionQuickToolbar = ({
  clip,
  compositionWidth = COMPOSITION_W,
  compositionHeight = COMPOSITION_H,
  displayScale = 1,
  compositionRef,
  onUpdateStyle,
  onUpdateLayer,
  onDuplicate,
  onDelete,
  onMoveLayerOrder,
  onToggleLock,
  onReplaceMedia,
  onOpenCrop,
}) => {
  const fileInputRef = useRef(null);
  const fontMenuRef = useRef(null);
  const toolbarRef = useRef(null);
  const fontListRef = useRef(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [toolbarPlacement, setToolbarPlacement] = useState({
    below: true,
    mediaRight: true,
    shiftX: 0,
    shiftY: 0,
  });
  const [fontListUpward, setFontListUpward] = useState(false);
  const [fontListShiftX, setFontListShiftX] = useState(0);

  const isText = clip?.type === 'text' || (clip ? isTextLayer(clip) : false);
  const isMedia =
    clip?.type === 'image' ||
    clip?.type === 'video' ||
    clip?.type === 'avatar' ||
    clip?.role === 'avatar';
  const isShape = clip?.type === 'shape';
  const mediaLeftLayout = isMedia && !isText && !isShape;
  const uiScale = getToolbarUiScale(displayScale);

  const clipPosX = clip?.position?.x;
  const clipPosY = clip?.position?.y;
  const clipSizeW = clip?.size?.width;
  const clipSizeH = clip?.size?.height;

  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el || !clip) return undefined;

    const updatePlacement = () => {
      const layoutW = el.offsetWidth;
      const layoutH = el.offsetHeight;
      if (layoutW <= 0 || layoutH <= 0) return;

      const toolbarW = layoutW * uiScale;
      const toolbarH = layoutH * uiScale;

      const clipRect = resolveClipRect(clip, {
        width: compositionWidth,
        height: compositionHeight,
      });
      const initial = computeToolbarPlacement({
        clipRect,
        toolbarW,
        toolbarH,
        compositionWidth,
        compositionHeight,
        mediaLeftLayout,
      });

      const compositionEl = compositionRef?.current;
      const next =
        compositionEl && displayScale
          ? refineToolbarPlacement({
              toolbarEl: el,
              compositionEl,
              displayScale,
              initialPlacement: initial,
              compositionWidth,
              compositionHeight,
              mediaLeftLayout,
            })
          : initial;

      setToolbarPlacement((prev) =>
        prev.below === next.below &&
        prev.mediaRight === next.mediaRight &&
        prev.shiftX === next.shiftX &&
        prev.shiftY === next.shiftY
          ? prev
          : next
      );
    };

    updatePlacement();

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updatePlacement)
      : null;
    observer?.observe(el);

    return () => observer?.disconnect();
  }, [
    clip,
    clipPosX,
    clipPosY,
    clipSizeW,
    clipSizeH,
    mediaLeftLayout,
    fontMenuOpen,
    compositionWidth,
    compositionHeight,
    displayScale,
    uiScale,
    compositionRef,
    toolbarPlacement.below,
    toolbarPlacement.mediaRight,
  ]);

  const handleReplaceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      onUpdateLayer?.({ src: url, type: 'video' });
    } else if (file.type.startsWith('image/')) {
      onUpdateLayer?.({ src: url });
    }
    e.target.value = '';
  };

  useEffect(() => {
    if (!fontMenuOpen) return undefined;
    const onDocPointerDown = (e) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
        setFontMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', onDocPointerDown);
    return () => window.removeEventListener('pointerdown', onDocPointerDown);
  }, [fontMenuOpen]);

  useLayoutEffect(() => {
    if (!fontMenuOpen || !fontListRef.current) return undefined;
    const list = fontListRef.current;
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = list.getBoundingClientRect();

    setFontListUpward(rect.bottom > vh - margin && rect.top > margin);

    let shiftX = 0;
    if (rect.left < margin) shiftX += margin - rect.left;
    if (rect.right > vw - margin) shiftX -= rect.right - (vw - margin);
    setFontListShiftX(Math.round(shiftX));
  }, [fontMenuOpen]);

  if (!clip) return null;

  const isLocked = !!clip.locked;
  const style = clip.style || {};
  const shapeBorder = parseLayerBorder(style, '#1a1b1c');
  const applyShapeBorder = (patch) => {
    onUpdateLayer?.({
      style: buildLayerBorderPatch(style, patch, '#1a1b1c'),
    });
  };

  const fontSize = parseFontSize(style.fontSize, 24);
  const fontWeight = String(style.fontWeight || '400');
  const fontStyle = style.fontStyle || 'normal';
  const textDecoration = style.textDecoration || 'none';
  const resolvedFont = resolveFontFamilyValue(style.fontFamily);

  return (
    <div
      ref={toolbarRef}
      className={[
        'sq-toolbar',
        mediaLeftLayout ? (toolbarPlacement.mediaRight ? 'sq-toolbar--media-right' : 'sq-toolbar--media-left-side') : '',
        !mediaLeftLayout && !toolbarPlacement.below ? 'sq-toolbar--above' : '',
      ].filter(Boolean).join(' ')}
      style={{
        '--sq-shift-x': `${toolbarPlacement.shiftX}px`,
        '--sq-shift-y': `${toolbarPlacement.shiftY}px`,
        '--sq-max-width': `${Math.max(0, compositionWidth - CANVAS_MARGIN * 2)}px`,
        '--sq-ui-scale': uiScale,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {isText && (
        <>
          <div className="sq-font-menu" ref={fontMenuRef}>
            <button
              type="button"
              className={`sq-toolbar__select sq-toolbar__select--font sq-font-menu__trigger ${fontMenuOpen ? 'sq-font-menu__trigger--open' : ''}`}
              title="Font family"
              style={{ fontFamily: resolvedFont }}
              onClick={() => setFontMenuOpen((v) => !v)}
            >
              <span className="sq-font-menu__label">
                {(FONT_FAMILIES.find((f) => f.value === resolvedFont)?.label) || 'Font'}
              </span>
              <MdExpandMore size={16} />
            </button>
            {fontMenuOpen && (
              <div
                ref={fontListRef}
                className={`sq-font-menu__list ${fontListUpward ? 'sq-font-menu__list--up' : ''}`}
                style={{ '--sq-font-list-shift-x': `${fontListShiftX}px` }}
                role="listbox"
                aria-label="Font family"
              >
                {FONT_FAMILIES.map((f) => {
                  const active = f.value === resolvedFont;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      className={`sq-font-menu__item ${active ? 'sq-font-menu__item--active' : ''}`}
                      style={{ fontFamily: f.value }}
                      onClick={() => {
                        onUpdateStyle?.({ fontFamily: f.value });
                        setFontMenuOpen(false);
                      }}
                    >
                      <span>{f.label}</span>
                      {active ? <MdCheck size={14} /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="sq-toolbar__stepper">
            <button type="button" onClick={() => onUpdateStyle?.({ fontSize: Math.max(8, fontSize - 2) })}>−</button>
            <span>{fontSize}</span>
            <button type="button" onClick={() => onUpdateStyle?.({ fontSize: Math.min(300, fontSize + 2) })}>+</button>
          </div>
          <label
            className="sq-toolbar__color sq-toolbar__color--swatch"
            title="Text color"
            style={{ '--sq-swatch': style.color || '#1a1b1c' }}
          >
            <input
              type="color"
              value={style.color || '#1a1b1c'}
              onChange={(e) => onUpdateStyle?.({ color: e.target.value })}
            />
          </label>
          <ToolbarDivider />
          <ToolbarBtn
            icon={<MdFormatBold size={16} />}
            title="Bold"
            active={['700', '800', '900', 'bold'].includes(fontWeight)}
            onClick={() =>
              onUpdateStyle?.({
                fontWeight: ['700', '800', '900', 'bold'].includes(fontWeight) ? '400' : '700',
              })
            }
          />
          <ToolbarBtn
            icon={<MdFormatItalic size={16} />}
            title="Italic"
            active={fontStyle === 'italic'}
            onClick={() => onUpdateStyle?.({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
          />
          <ToolbarBtn
            icon={<MdFormatUnderlined size={16} />}
            title="Underline"
            active={textDecoration.includes('underline')}
            onClick={() =>
              onUpdateStyle?.({
                textDecoration: textDecoration.includes('underline') ? 'none' : 'underline',
              })
            }
          />
          <ToolbarDivider />
          <ToolbarBtn
            icon={<MdFormatAlignLeft size={16} />}
            title="Align left"
            active={(style.textAlign || 'left') === 'left'}
            onClick={() => onUpdateStyle?.({ textAlign: 'left' })}
          />
          <ToolbarBtn
            icon={<MdFormatAlignCenter size={16} />}
            title="Align center"
            active={style.textAlign === 'center'}
            onClick={() => onUpdateStyle?.({ textAlign: 'center' })}
          />
          <ToolbarBtn
            icon={<MdFormatAlignRight size={16} />}
            title="Align right"
            active={style.textAlign === 'right'}
            onClick={() => onUpdateStyle?.({ textAlign: 'right' })}
          />
          <ToolbarDivider />
        </>
      )}

      {isMedia && (
        <>
          <ToolbarBtn
            icon={<MdImage size={16} />}
            title="Replace media"
            onClick={() => {
              if (onReplaceMedia) onReplaceMedia();
              else fileInputRef.current?.click();
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleReplaceFile}
          />
          <ToolbarBtn
            icon={<MdCrop size={16} />}
            title="Crop / fit"
            onClick={() => onOpenCrop?.()}
          />
          <ToolbarDivider />
        </>
      )}

      {isShape && (
        <>
          <label className="sq-toolbar__color" title="Fill color">
            <MdPalette size={14} style={{ pointerEvents: 'none' }} />
            <input
              type="color"
              value={style.backgroundColor?.startsWith('#') ? style.backgroundColor : '#6366f1'}
              onChange={(e) => onUpdateStyle?.({ backgroundColor: e.target.value })}
            />
          </label>
          <label className="sq-toolbar__color" title="Border color">
            <MdBorderColor size={14} style={{ pointerEvents: 'none' }} />
            <input
              type="color"
              value={shapeBorder.color?.startsWith('#') ? shapeBorder.color : '#1a1b1c'}
              onChange={(e) => applyShapeBorder({
                color: e.target.value,
                width: shapeBorder.width > 0 ? shapeBorder.width : 2,
              })}
            />
          </label>
          <select
            className="sq-toolbar__select sq-toolbar__select--narrow"
            value={shapeBorder.width}
            onChange={(e) => applyShapeBorder({ width: Number(e.target.value) })}
            title="Border width"
          >
            {[0, 1, 2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n}px
              </option>
            ))}
          </select>
          <ToolbarBtn
            icon={<MdOpacity size={16} />}
            title={`Opacity ${Math.round((clip.opacity ?? 1) * 100)}%`}
            onClick={() => {
              const next = (clip.opacity ?? 1) >= 1 ? 0.5 : (clip.opacity ?? 1) + 0.25;
              onUpdateLayer?.({ opacity: Math.min(1, next) });
            }}
          />
          <ToolbarDivider />
        </>
      )}

      <ToolbarBtn icon={<MdContentCopy size={16} />} title="Duplicate" onClick={onDuplicate} />
      <ToolbarBtn icon={<MdDelete size={16} />} title="Delete" danger onClick={onDelete} />
      <ToolbarBtn
        icon={<MdFlipToFront size={16} />}
        title="Bring forward"
        onClick={() => onMoveLayerOrder?.('forward')}
      />
      <ToolbarBtn
        icon={<MdFlipToBack size={16} />}
        title="Send backward"
        onClick={() => onMoveLayerOrder?.('backward')}
      />
      <ToolbarBtn
        icon={isLocked ? <MdLock size={16} /> : <MdLockOpen size={16} />}
        title={isLocked ? 'Unlock' : 'Lock'}
        active={isLocked}
        onClick={() => onToggleLock?.(!isLocked)}
      />
    </div>
  );
};

export default SelectionQuickToolbar;
