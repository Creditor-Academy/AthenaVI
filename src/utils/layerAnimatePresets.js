/** Canva-style animate presets for image / video / shape layers */

export const ANIMATION_DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
};

export const PRIMARY_LAYER_ANIMATIONS = [
  { id: 'pop', label: 'Pop', entrance: 'pop' },
  { id: 'wipe', label: 'Wipe', entrance: 'wipe' },
  { id: 'blur', label: 'Blur', entrance: 'blurIn' },
  { id: 'succession', label: 'Succession', entrance: 'succession' },
  { id: 'breathe', label: 'Breathe', entrance: 'breathe' },
  { id: 'baseline', label: 'Baseline', entrance: 'baseline' },
  { id: 'drift', label: 'Drift', entrance: 'drift' },
  { id: 'tectonic', label: 'Tectonic', entrance: 'tectonic' },
  { id: 'tumble', label: 'Tumble', entrance: 'tumble' },
  { id: 'neon', label: 'Neon', entrance: 'neon' },
  { id: 'scrapbook', label: 'Scrapbook', entrance: 'scrapbook' },
  { id: 'stomp', label: 'Stomp', entrance: 'stomp' },
];

export const ADDON_LAYER_ANIMATIONS = [
  { id: 'rotate', label: 'Rotate', entrance: 'rotate' },
  { id: 'flicker', label: 'Flicker', entrance: 'flicker' },
  { id: 'pulse', label: 'Pulse', entrance: 'pulse' },
  { id: 'wiggle', label: 'Wiggle', entrance: 'wiggle' },
];

export const ALL_LAYER_ANIMATION_IDS = [
  ...PRIMARY_LAYER_ANIMATIONS.map((p) => p.id),
  ...ADDON_LAYER_ANIMATIONS.map((p) => p.id),
];

export function findLayerAnimationPreset(id) {
  return (
    PRIMARY_LAYER_ANIMATIONS.find((p) => p.id === id) ||
    ADDON_LAYER_ANIMATIONS.find((p) => p.id === id) ||
    null
  );
}

export function getLayerAnimationPresetId(entranceType) {
  const all = [...PRIMARY_LAYER_ANIMATIONS, ...ADDON_LAYER_ANIMATIONS];
  return all.find((p) => p.entrance === entranceType)?.id || '';
}

export function durationForEntrance(type) {
  const map = {
    pop: 0.65,
    wipe: 0.75,
    blurIn: 0.8,
    succession: 0.9,
    breathe: 1.1,
    baseline: 0.8,
    drift: 1,
    tectonic: 0.85,
    tumble: 0.9,
    neon: 0.7,
    scrapbook: 0.85,
    stomp: 0.55,
    rotate: 0.8,
    flicker: 0.9,
    pulse: 1,
    wiggle: 0.75,
    fadeIn: 0.7,
    slideUp: 0.75,
    slideLeft: 0.75,
    slideRight: 0.75,
    zoomIn: 0.8,
    kenBurns: 1.2,
  };
  return map[type] ?? 0.75;
}
