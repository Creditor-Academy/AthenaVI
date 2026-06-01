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

export function toFontSizeCss(value, fallback = 32) {
  const n = parseFontSize(value, fallback);
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())
    ? n
    : `${n}px`;
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
