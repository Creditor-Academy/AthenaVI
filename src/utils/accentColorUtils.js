const HEX_RE = /^#?([0-9A-Fa-f]{6})$/;

export function normalizeHex(hex) {
  if (!hex) return null;
  const match = String(hex).trim().match(HEX_RE);
  if (!match) return null;
  return `#${match[1].toLowerCase()}`;
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255
  };
}

/** HSL with h in [0, 360), s and l in [0, 1]. */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  if (max === rgb.r) {
    hue = ((rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0)) / 6;
  } else if (max === rgb.g) {
    hue = ((rgb.b - rgb.r) / delta + 2) / 6;
  } else {
    hue = ((rgb.r - rgb.g) / delta + 4) / 6;
  }

  return { h: hue * 360, s: saturation, l: lightness };
}

/** Too pale / washed out for a light interface. */
export function isLightAccentColor(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return true;
  if (hsl.l >= 0.62) return true;
  if (hsl.l >= 0.52 && hsl.s <= 0.35) return true;
  return false;
}

/** Too deep / near-black for a dark interface. */
export function isDarkAccentColor(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return true;
  return hsl.l <= 0.18;
}

export function isAccentAllowedForMode(hex, mode) {
  const normalized = normalizeHex(hex);
  if (!normalized) return false;
  if (mode === 'light') return !isLightAccentColor(normalized);
  if (mode === 'dark') return !isDarkAccentColor(normalized);
  return true;
}

export function getAccentDisabledReason(hex, mode) {
  if (isAccentAllowedForMode(hex, mode)) return '';
  if (mode === 'light') return 'This color is too light for Light mode';
  if (mode === 'dark') return 'This color is too dark for Dark mode';
  return 'This color is not available for the current interface mode';
}
