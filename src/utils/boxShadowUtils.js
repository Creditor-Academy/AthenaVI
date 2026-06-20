function parseRgba(color) {
  const match = String(color).match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!match) return null;
  return {
    r: Math.round(Number(match[1])),
    g: Math.round(Number(match[2])),
    b: Math.round(Number(match[3])),
    a: match[4] != null ? Number(match[4]) : 1,
  };
}

export function colorToHex(color, fallback = '#000000') {
  if (!color) return fallback;
  const value = String(color).trim();
  if (value.startsWith('#')) {
    if (value.length === 4) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    return value.slice(0, 7);
  }
  const rgba = parseRgba(value);
  if (!rgba) return fallback;
  const { r, g, b } = rgba;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function hexToRgba(hex, alpha = 0.35) {
  const normalized = colorToHex(hex, '#000000');
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function splitBoxShadow(boxShadow) {
  if (!boxShadow || boxShadow === 'none') return null;
  const match = String(boxShadow).match(
    /^(.*?)\s+(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})\s*$/i
  );
  if (!match) {
    return { geometry: String(boxShadow).trim(), color: 'rgba(0, 0, 0, 0.25)' };
  }
  return { geometry: match[1].trim(), color: match[2].trim() };
}

export function buildBoxShadow(geometry, color) {
  return `${geometry} ${color}`;
}

export function replaceBoxShadowColor(boxShadow, hexColor) {
  const split = splitBoxShadow(boxShadow);
  if (!split) return boxShadow;
  const rgba = parseRgba(split.color);
  const alpha = rgba?.a ?? 0.35;
  return buildBoxShadow(split.geometry, hexToRgba(hexColor, alpha));
}

export function getShadowGeometry(boxShadow) {
  return splitBoxShadow(boxShadow)?.geometry || String(boxShadow || '').trim();
}
