/**
 * Canva-style text effects & shape — stored on clip.style.textEffect / clip.style.textShape
 */

export const TEXT_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'drop', label: 'Drop' },
  { id: 'glow', label: 'Glow' },
  { id: 'echo', label: 'Echo' },
  { id: 'outline', label: 'Outline' },
  { id: 'background', label: 'Background' },
  { id: 'splice', label: 'Splice' },
  { id: 'hollow', label: 'Hollow' },
  { id: 'neon', label: 'Neon' },
  { id: 'glitch', label: 'Glitch' },
];

export const TEXT_SHAPE_OPTIONS = [
  { id: 'none', label: 'Straight' },
  { id: 'curve', label: 'Curve' },
];

/** Canva-style "Suggested" row (2×3) → entrance animation type */
export const SUGGESTED_TEXT_ANIMATIONS = [
  { id: 'suggested-typewriter', label: 'Typewriter', entrance: 'typewriter' },
  { id: 'suggested-ascend', label: 'Ascend', entrance: 'ascend' },
  { id: 'suggested-shift', label: 'Shift', entrance: 'shift' },
  { id: 'suggested-merge', label: 'Merge', entrance: 'merge' },
  { id: 'suggested-block', label: 'Block', entrance: 'block' },
  { id: 'suggested-burst', label: 'Burst', entrance: 'burst' },
];

/** Text-only motion presets (sidebar) → entrance animation type */
export const TEXT_MOTION_PRESETS = [
  { id: 'none', label: 'None', entrance: 'none' },
  { id: 'bounce', label: 'Bounce', entrance: 'pop' },
  { id: 'roll', label: 'Roll', entrance: 'slideLeft' },
  { id: 'skate', label: 'Skate', entrance: 'slideRight' },
  { id: 'spread', label: 'Spread', entrance: 'zoomIn' },
  { id: 'clarify', label: 'Clarify', entrance: 'blurIn' },
];

/** General motion presets */
export const GENERAL_MOTION_PRESETS = [
  { id: 'rise', label: 'Rise', entrance: 'slideUp' },
  { id: 'pan', label: 'Pan', entrance: 'slideRight' },
  { id: 'fade', label: 'Fade', entrance: 'fadeIn' },
  { id: 'pop', label: 'Pop', entrance: 'pop' },
  { id: 'wipe', label: 'Wipe', entrance: 'slideLeft' },
  { id: 'blur', label: 'Blur', entrance: 'blurIn' },
  { id: 'succession', label: 'Succession', entrance: 'zoomIn' },
  { id: 'breathe', label: 'Breathe', entrance: 'zoomOut' },
  { id: 'baseline', label: 'Baseline', entrance: 'slideUp' },
];

export function getTextEffectId(style = {}) {
  return style.textEffect || 'none';
}

export function getTextShapeId(style = {}) {
  return style.textShape || 'none';
}

/**
 * Merge base typography with effect-specific CSS for canvas / composition.
 */
export function buildTextDisplayStyle(style = {}, layerOpacity = 1) {
  const color = style.color || '#7c3aed';
  const effect = getTextEffectId(style);
  const opacity = (style.opacity ?? layerOpacity ?? 1);

  const base = {
    fontWeight: style.fontWeight || '700',
    color,
    textAlign: style.textAlign || 'left',
    textTransform: style.textTransform || 'none',
    fontStyle: style.fontStyle || 'normal',
    textDecoration: style.textDecoration || 'none',
    lineHeight: style.lineHeight || 1.2,
    letterSpacing: style.letterSpacing ?? '0px',
    fontFamily: style.fontFamily || 'Inter, sans-serif',
    padding: style.padding || '0px',
    borderRadius: style.borderRadius || '0px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    opacity,
    background: 'transparent',
    boxShadow: 'none',
    WebkitTextStroke: undefined,
    textShadow: 'none',
    filter: 'none',
  };

  switch (effect) {
    case 'drop':
      return {
        ...base,
        textShadow: '2px 4px 6px rgba(15, 23, 42, 0.55), 0 1px 2px rgba(0,0,0,0.2)',
      };
    case 'glow':
      return {
        ...base,
        textShadow: `0 0 8px ${color}, 0 0 18px ${color}99, 0 0 32px ${color}55`,
      };
    case 'echo':
      return {
        ...base,
        textShadow: `3px 3px 0 ${hexAlpha(color, 0.35)}, 6px 6px 0 ${hexAlpha(color, 0.2)}, 9px 9px 0 ${hexAlpha(color, 0.1)}`,
      };
    case 'outline':
      return {
        ...base,
        WebkitTextStroke: `2px ${color}`,
        paintOrder: 'stroke fill',
        color: style.fillColor || '#ffffff',
      };
    case 'background':
      return {
        ...base,
        backgroundColor: style.effectBackground || hexAlpha(color, 0.22),
        padding: style.padding && style.padding !== '0px' ? style.padding : '8px 14px',
        borderRadius: style.borderRadius && style.borderRadius !== '0px' ? style.borderRadius : '8px',
      };
    case 'splice':
      return {
        ...base,
        color: style.fillColor || '#ffffff',
        textShadow: `3px 3px 0 ${color}, -1px -1px 0 ${hexAlpha(color, 0.5)}`,
      };
    case 'hollow':
      return {
        ...base,
        color: 'transparent',
        WebkitTextStroke: `2px ${color}`,
      };
    case 'neon':
      return {
        ...base,
        color: '#fff',
        textShadow: `0 0 4px #fff, 0 0 12px ${color}, 0 0 24px ${color}, 0 0 48px ${color}`,
      };
    case 'glitch':
      return {
        ...base,
        textShadow: `2px 0 #22d3ee, -2px 0 #e879f9`,
        filter: 'contrast(1.1)',
      };
    default:
      if (style.backgroundColor && style.backgroundColor !== 'transparent') {
        return { ...base, backgroundColor: style.backgroundColor };
      }
      if (style.boxShadow && style.boxShadow !== 'none') {
        return { ...base, boxShadow: style.boxShadow };
      }
      return base;
  }
}

function hexAlpha(hex, alpha) {
  const h = String(hex || '#7c3aed').replace('#', '');
  if (h.length !== 6) return `rgba(124, 58, 237, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** CSS class for curved text wrapper */
export function getTextShapeWrapperStyle(shapeId) {
  if (shapeId !== 'curve') return {};
  return {
    transform: 'perspective(400px) rotateX(8deg)',
    transformOrigin: 'center bottom',
  };
}

export function getTextShapeInnerStyle(shapeId) {
  if (shapeId !== 'curve') return {};
  return {
    display: 'inline-block',
    transform: 'translateY(-4px)',
    letterSpacing: '0.12em',
  };
}

/** Live canvas preview animation class */
export function getTextPreviewAnimationClass(entranceType) {
  if (!entranceType || entranceType === 'none') return '';
  return `text-live-anim text-live-anim--${entranceType}`;
}

export function findMotionPresetByEntrance(entranceType) {
  const all = [...SUGGESTED_TEXT_ANIMATIONS, ...TEXT_MOTION_PRESETS, ...GENERAL_MOTION_PRESETS];
  return all.find((p) => p.entrance === entranceType)?.id || null;
}

export function getSuggestedAnimationId(entranceType) {
  return SUGGESTED_TEXT_ANIMATIONS.find((p) => p.entrance === entranceType)?.id || '';
}
