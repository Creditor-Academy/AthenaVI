/** Build CSS filter string from clip.cssFilters (editor + sidebar preview). */
export function buildCssFilterString(cf = {}) {
  if (!cf || Object.keys(cf).length === 0) return undefined;
  const parts = [];
  if (cf.brightness != null && cf.brightness !== 1) parts.push(`brightness(${cf.brightness})`);
  if (cf.contrast != null && cf.contrast !== 1) parts.push(`contrast(${cf.contrast})`);
  if (cf.saturate != null && cf.saturate !== 1) parts.push(`saturate(${cf.saturate})`);
  if (cf.blur != null && cf.blur !== 0) parts.push(`blur(${cf.blur}px)`);
  if (cf.hueRotate != null && cf.hueRotate !== 0) parts.push(`hue-rotate(${cf.hueRotate}deg)`);
  if (cf.sepia != null && cf.sepia !== 0) parts.push(`sepia(${cf.sepia})`);
  if (cf.invert != null && cf.invert !== 0) parts.push(`invert(${cf.invert})`);
  if (cf.grayscale != null && cf.grayscale !== 0) parts.push(`grayscale(${cf.grayscale})`);
  return parts.length > 0 ? parts.join(' ') : undefined;
}
