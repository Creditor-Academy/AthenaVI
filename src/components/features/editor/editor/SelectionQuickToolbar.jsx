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
import './SelectionQuickToolbar.css';

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
  if (!clip) return null;

  const isText = clip.type === 'text' || isTextLayer(clip);
  const isMedia =
    clip.type === 'image' ||
    clip.type === 'video' ||
    clip.type === 'avatar' ||
    clip.role === 'avatar';
  const isShape = clip.type === 'shape';
  const isLocked = !!clip.locked;
  const style = clip.style || {};
  const shapeBorder = parseLayerBorder(style, '#1a1b1c');
  const applyShapeBorder = (patch) => {
    onUpdateLayer?.({
      style: buildLayerBorderPatch(style, patch, '#1a1b1c'),
    });
  };
  const mediaLeftLayout = isMedia && !isText && !isShape;

  const fontSize = parseFontSize(style.fontSize, 24);
  const fontWeight = String(style.fontWeight || '400');
  const fontStyle = style.fontStyle || 'normal';
  const textDecoration = style.textDecoration || 'none';
  const resolvedFont = resolveFontFamilyValue(style.fontFamily);

  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el) return undefined;

    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();

    const next = {
      below: !isText ? true : rect.bottom <= vh - margin,
      mediaRight: !mediaLeftLayout ? true : rect.right <= vw - margin,
      shiftX: 0,
      shiftY: 0,
    };

    let dx = 0;
    let dy = 0;
    if (rect.left < margin) dx += margin - rect.left;
    if (rect.right > vw - margin) dx -= rect.right - (vw - margin);
    if (rect.top < margin) dy += margin - rect.top;
    if (rect.bottom > vh - margin) dy -= rect.bottom - (vh - margin);
    next.shiftX = Math.round(dx);
    next.shiftY = Math.round(dy);

    setToolbarPlacement((prev) =>
      prev.below === next.below &&
      prev.mediaRight === next.mediaRight &&
      prev.shiftX === next.shiftX &&
      prev.shiftY === next.shiftY
        ? prev
        : next
    );
  }, [clip.id, isText, mediaLeftLayout, fontMenuOpen, toolbarPlacement.below, toolbarPlacement.mediaRight]);

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
          <label className="sq-toolbar__color" title="Text color">
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
