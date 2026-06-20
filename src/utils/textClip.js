/** Helpers for text clip content ({ text }) and typography values. */

export function isTextLayer(clip) {
  if (!clip) return false;
  if (clip.type === 'text') return true;
  if (clip.role === 'main-text' || clip.role === 'subtitle-text') return true;
  if (clip.content?.text != null) return true;
  if (typeof clip.content === 'string' && clip.content && !clip.src) return true;
  return false;
}

export function getClipTextContent(clip) {
  if (!clip) return '';
  const c = clip.content;
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object') {
    if (typeof c.text === 'string') return c.text;
    if (typeof c.name === 'string') return c.name;
  }
  return '';
}

export function buildClipTextContent(text, existingContent) {
  const base =
    typeof existingContent === 'object' && existingContent !== null ? existingContent : {};
  return { ...base, text: text ?? '' };
}

export function parseFontSize(value, fallback = 32) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const n = parseFloat(String(value));
  return Number.isNaN(n) ? fallback : Math.round(n);
}

/** Parse CSS lengths like `800px`, `50%` (returns number for px only). */
export function parseCssPx(value, fallback = null) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const str = String(value).trim();
  if (str.endsWith('%')) return fallback;
  const n = parseFloat(str);
  return Number.isNaN(n) ? fallback : Math.round(n);
}

const COMPOSITION_W = 1920;
const COMPOSITION_H = 1080;

/**
 * Text box in Remotion must match editor intent: use style.width / sensible defaults
 * when placement size is missing or too small (common after backend load).
 */
export function resolveTextClipRect(clip) {
  const pos = {
    x: Number(clip?.position?.x ?? 0),
    y: Number(clip?.position?.y ?? 0),
  };
  const style = clip?.style || {};
  const fontSize = parseFontSize(style.fontSize, 32);

  if (clip._userPlaced && clip?.size?.width && clip?.size?.height) {
    return {
      position: pos,
      size: {
        width: Math.max(40, Number(clip.size.width)),
        height: Math.max(20, Number(clip.size.height)),
      },
      fontSize,
    };
  }

  let width = parseCssPx(clip?.size?.width);
  let height = parseCssPx(clip?.size?.height);
  const styleWidth = parseCssPx(style.width);
  const styleMaxWidth = parseCssPx(style.maxWidth);

  if (styleWidth && (!width || width < styleWidth * 0.85)) {
    width = styleWidth;
  } else if (styleMaxWidth && width && width > styleMaxWidth) {
    width = styleMaxWidth;
  }

  const text = getClipTextContent(clip);
  const lineCount = Math.max(1, text.split('\n').length);
  const lineHeight = typeof style.lineHeight === 'number' ? style.lineHeight : parseFloat(style.lineHeight) || 1.2;
  const minHeight = Math.ceil(fontSize * lineHeight * lineCount + (clip._userPlaced ? 8 : 4));

  if (!width || width < 80) {
    width = styleWidth || styleMaxWidth || Math.min(720, Math.max(120, text.length * fontSize * 0.22));
  }
  if (!height || (!clip._userPlaced && height < minHeight)) {
    height = Math.min(600, Math.max(minHeight, fontSize * lineHeight + 8));
  }

  width = Math.min(width, COMPOSITION_W - Math.max(0, pos.x));
  height = Math.min(height, COMPOSITION_H - Math.max(0, pos.y));
  width = Math.max(40, width);
  height = Math.max(20, height);

  return {
    position: pos,
    size: { width, height },
    fontSize,
  };
}

export function toFontSizeCss(value, fallback = 32) {
  const n = parseFontSize(value, fallback);
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())
    ? n
    : `${n}px`;
}

export function normalizeFontFamilyKey(fontFamily) {
  if (!fontFamily) return '';
  return String(fontFamily)
    .split(',')[0]
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase();
}

/** Map stored font stacks (e.g. "Inter, sans-serif") to a FONT_FAMILIES option value. */
export function resolveFontFamilyValue(stored, families = FONT_FAMILIES) {
  if (!families.length) return stored || '';
  if (!stored) return families[0].value;

  const exact = families.find((family) => family.value === stored);
  if (exact) return exact.value;

  const storedKey = normalizeFontFamilyKey(stored);
  const match = families.find(
    (family) =>
      normalizeFontFamilyKey(family.value) === storedKey ||
      family.label.toLowerCase() === storedKey
  );
  return match?.value ?? families[0].value;
}

export const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
];

export const FONT_WEIGHT_OPTIONS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' },
];

export const TEXT_TRANSFORM_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'UPPERCASE', value: 'uppercase' },
  { label: 'lowercase', value: 'lowercase' },
  { label: 'Capitalize', value: 'capitalize' },
];
