import { colorToHex } from './boxShadowUtils';

const BORDER_SHORTHAND_RE =
  /^(\d+(?:\.\d+)?px)\s+(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)\s+(.+)$/i;

function parseExplicitWidth(style) {
  if (style.borderWidth == null || style.borderWidth === '') return null;
  const width = parseFloat(String(style.borderWidth));
  if (Number.isNaN(width)) return null;
  return width;
}

/**
 * Resolve border width/color from panel fields or legacy `border` shorthand (templates).
 */
export function parseLayerBorder(style = {}, defaultColor = '#94a3b8') {
  const explicitWidth = parseExplicitWidth(style);
  const explicitStyle = String(style.borderStyle || 'solid').toLowerCase();

  if (explicitWidth != null) {
    if (explicitWidth <= 0 || explicitStyle === 'none') {
      return { width: 0, color: style.borderColor || defaultColor, borderStyle: 'solid' };
    }
    return {
      width: Math.round(explicitWidth),
      color: style.borderColor || defaultColor,
      borderStyle: explicitStyle,
    };
  }

  const shorthand = style.border;
  if (shorthand && shorthand !== 'none') {
    const match = String(shorthand).trim().match(BORDER_SHORTHAND_RE);
    if (match) {
      const width = parseFloat(match[1]);
      const borderStyle = match[2].toLowerCase();
      const rawColor = match[3].trim();
      if (width > 0 && borderStyle !== 'none') {
        return {
          width: Math.round(width),
          color: rawColor.startsWith('#') ? rawColor : colorToHex(rawColor, defaultColor),
          borderStyle,
          fromShorthand: true,
        };
      }
    }
  }

  return { width: 0, color: style.borderColor || defaultColor, borderStyle: 'solid' };
}

export function formatLayerBorderCss(style = {}, defaultColor = '#94a3b8') {
  const { width, color, borderStyle } = parseLayerBorder(style, defaultColor);
  if (width <= 0) return 'none';
  return `${width}px ${borderStyle || 'solid'} ${color}`;
}

/**
 * Build a full style object with normalized border fields and legacy `border` removed.
 */
export function buildLayerBorderPatch(style = {}, patch = {}, defaultColor = '#94a3b8') {
  const current = parseLayerBorder(style, defaultColor);
  const width = patch.width != null
    ? Math.max(0, Math.min(20, Math.round(Number(patch.width) || 0)))
    : current.width;
  const color = patch.color != null ? patch.color : current.color;
  const borderStyle = patch.borderStyle || current.borderStyle || 'solid';

  const next = { ...style };
  delete next.border;

  if (width <= 0) {
    next.borderWidth = '0px';
    next.borderStyle = 'none';
    next.borderColor = color;
    return next;
  }

  next.borderWidth = `${width}px`;
  next.borderStyle = borderStyle;
  next.borderColor = color;
  return next;
}
