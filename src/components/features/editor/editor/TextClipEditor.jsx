import { useRef, useEffect, useCallback, memo } from 'react';
import { getClipTextContent, toFontSizeCss } from '../../../../utils/textClip';
import {
  buildTextDisplayStyle,
  getTextShapeInnerStyle,
} from '../../../../utils/textEffects';
import { resolveClipRect } from '../../../../utils/clipLayout';
import { measureTextContentSize } from '../../../../utils/canvasTransformUtils';

/**
 * Inline text editor — double-click to enter, escape/click-outside to exit.
 * DOM-driven during edit to preserve caret (no React children in contentEditable).
 */
const TextClipEditor = memo(function TextClipEditor({
  clip,
  isEditing,
  isSelected,
  overlayMode,
  onContentChange,
  onUpdateSize,
  onEnterEdit,
  onExitEdit,
  onPointerEnter,
  onPointerLeave,
  divRef: externalRef,
}) {
  const internalRef = useRef(null);
  const divRef = externalRef || internalRef;
  const measureRaf = useRef(null);
  const lastSyncedRef = useRef('');
  const s = clip.style || {};
  const textLayout = resolveClipRect(clip);

  const syncTextSize = useCallback(() => {
    if (!divRef.current || overlayMode || clip._userPlaced) return;
    const hasFill =
      !!(s.backgroundColor && s.backgroundColor !== 'transparent') ||
      !!(s.boxShadow && s.boxShadow !== 'none');
    const measured = measureTextContentSize(divRef.current, {
      paddingX: hasFill ? 24 : 8,
      paddingY: hasFill ? 20 : 4,
    });
    if (!measured) return;
    const currentW = clip.size?.width ?? textLayout.size.width;
    const width = clip._userPlaced ? currentW : Math.max(currentW, measured.width);
    const height = measured.height;
    const curH = clip.size?.height ?? textLayout.size.height;
    const curW = clip.size?.width ?? textLayout.size.width;
    if (Math.abs(height - curH) > 2 || (!clip._userPlaced && Math.abs(width - curW) > 2)) {
      onUpdateSize?.(clip.id, Math.round(width), Math.round(height));
    }
  }, [clip.id, clip.size, clip._userPlaced, s.backgroundColor, s.boxShadow, textLayout, overlayMode, onUpdateSize, divRef]);

  const displayText = getClipTextContent(clip);
  const displayStyle = buildTextDisplayStyle(s, clip.opacity ?? 1);
  const shapeInner = getTextShapeInnerStyle(s.textShape);

  const textStyle = {
    ...displayStyle,
    fontSize: toFontSizeCss(textLayout.fontSize ?? s.fontSize, 24),
    outline: 'none',
    cursor: isEditing ? 'text' : isSelected ? 'default' : 'pointer',
    width: '100%',
    maxWidth: '100%',
    position: 'relative',
    minHeight: '1em',
    ...shapeInner,
  };

  // Sync text into DOM when not editing (avoid clobbering caret while editing)
  useEffect(() => {
    const el = divRef.current;
    if (!el || isEditing) return;
    if (lastSyncedRef.current !== displayText) {
      el.textContent = displayText;
      lastSyncedRef.current = displayText;
    }
  }, [displayText, isEditing, divRef]);

  // Focus when entering edit mode
  useEffect(() => {
    if (!isEditing) return;
    const el = divRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && el.childNodes.length) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing, divRef]);

  const handleBlur = useCallback(() => {
    if (!isEditing) return;
    const el = divRef.current;
    if (el && onContentChange) {
      const text = el.innerText ?? '';
      lastSyncedRef.current = text;
      onContentChange(clip.id, text);
    }
    syncTextSize();
    onExitEdit?.();
  }, [isEditing, clip.id, onContentChange, syncTextSize, onExitEdit, divRef]);

  const handleInput = useCallback(() => {
    cancelAnimationFrame(measureRaf.current);
    measureRaf.current = requestAnimationFrame(syncTextSize);
  }, [syncTextSize]);

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (overlayMode || clip.editable === false) return;
      onEnterEdit?.(clip.id);
    },
    [clip.id, clip.editable, overlayMode, onEnterEdit]
  );

  const handleClick = useCallback(
    (e) => {
      if (isEditing) e.stopPropagation();
    },
    [isEditing]
  );

  if (overlayMode) {
    return (
      <div style={textStyle} className="text-clip-editor text-clip-editor--preview">
        {displayText}
      </div>
    );
  }

  return (
    <div
      ref={divRef}
      className={`text-clip-editor ${isEditing ? 'text-clip-editor--editing' : ''}`}
      contentEditable={isEditing && clip.editable !== false}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={textStyle}
      data-clip-id={clip.id}
    />
  );
});

export default TextClipEditor;
