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

export const PRIMARY_LAYER_EXIT_ANIMATIONS = [
  { id: 'exit-pop', label: 'Pop', exit: 'pop' },
  { id: 'exit-wipe', label: 'Wipe', exit: 'wipe' },
  { id: 'exit-blur', label: 'Blur', exit: 'blurOut' },
  { id: 'exit-succession', label: 'Succession', exit: 'succession' },
  { id: 'exit-breathe', label: 'Breathe', exit: 'breathe' },
  { id: 'exit-baseline', label: 'Baseline', exit: 'baseline' },
  { id: 'exit-drift', label: 'Drift', exit: 'drift' },
  { id: 'exit-tectonic', label: 'Tectonic', exit: 'tectonic' },
  { id: 'exit-tumble', label: 'Tumble', exit: 'tumble' },
  { id: 'exit-neon', label: 'Neon', exit: 'neon' },
  { id: 'exit-scrapbook', label: 'Scrapbook', exit: 'scrapbook' },
  { id: 'exit-stomp', label: 'Stomp', exit: 'stomp' },
];

export const ADDON_LAYER_EXIT_ANIMATIONS = [
  { id: 'exit-rotate', label: 'Rotate', exit: 'rotate' },
  { id: 'exit-flicker', label: 'Flicker', exit: 'flicker' },
  { id: 'exit-pulse', label: 'Pulse', exit: 'pulse' },
  { id: 'exit-wiggle', label: 'Wiggle', exit: 'wiggle' },
];

export const BASIC_LAYER_EXIT_ANIMATIONS = [
  { id: 'exit-fade', label: 'Fade', exit: 'fadeOut' },
  { id: 'exit-slide-up', label: 'Slide up', exit: 'slideUp' },
  { id: 'exit-slide-down', label: 'Slide down', exit: 'slideDown' },
  { id: 'exit-zoom-out', label: 'Zoom out', exit: 'zoomOut' },
];

export const ALL_LAYER_ANIMATION_IDS = [
  ...PRIMARY_LAYER_ANIMATIONS.map((p) => p.id),
  ...ADDON_LAYER_ANIMATIONS.map((p) => p.id),
];

export const BASIC_LAYER_ANIMATIONS = [
  { id: 'fade', label: 'Fade', entrance: 'fadeIn' },
  { id: 'slide-up', label: 'Slide up', entrance: 'slideUp' },
  { id: 'slide-down', label: 'Slide down', entrance: 'slideDown' },
  { id: 'zoom-in', label: 'Zoom in', entrance: 'zoomIn' },
];

export const ALL_MEDIA_ANIMATION_PRESETS = [
  ...BASIC_LAYER_ANIMATIONS,
  ...PRIMARY_LAYER_ANIMATIONS,
  ...ADDON_LAYER_ANIMATIONS,
];

export function entranceTypeToExitType(entranceType) {
  const map = {
    fadeIn: 'fadeOut',
    blurIn: 'blurOut',
    zoomIn: 'zoomOut',
    zoomOut: 'zoomIn',
    slideUp: 'slideUp',
    slideDown: 'slideDown',
    slideLeft: 'slideLeft',
    slideRight: 'slideRight',
    typewriter: 'fadeOut',
    wordFade: 'fadeOut',
    kenBurns: 'kenBurns',
    ascend: 'ascend',
    shift: 'shift',
    merge: 'merge',
    block: 'block',
    burst: 'burst',
  };
  return map[entranceType] || entranceType;
}

export function findMediaAnimationPreset(id) {
  return ALL_MEDIA_ANIMATION_PRESETS.find((p) => p.id === id) || null;
}

export function getActiveMediaPresetId(entrance, exit) {
  if (entrance?.type && entrance.type !== 'none') {
    const basicId = BASIC_LAYER_ANIMATIONS.find((p) => p.entrance === entrance.type)?.id;
    if (basicId) return basicId;
    return getLayerAnimationPresetId(entrance.type);
  }
  if (exit?.type && exit.type !== 'none') {
    const fromExit = ALL_MEDIA_ANIMATION_PRESETS.find(
      (p) => entranceTypeToExitType(p.entrance) === exit.type,
    );
    return fromExit?.id || '';
  }
  return '';
}

export function inferAnimationScope(preset, entrance, exit) {
  if (!preset) return 'entrance';
  const exitType = entranceTypeToExitType(preset.entrance);
  const hasEntrance = entrance?.type === preset.entrance && entrance.type !== 'none';
  const hasExit = exit?.type === exitType && exit.type !== 'none';
  if (hasEntrance && hasExit) return 'both';
  if (hasExit) return 'exit';
  return 'entrance';
}

export function findLayerAnimationPreset(id) {
  return (
    findMediaAnimationPreset(id) ||
    PRIMARY_LAYER_ANIMATIONS.find((p) => p.id === id) ||
    ADDON_LAYER_ANIMATIONS.find((p) => p.id === id) ||
    null
  );
}

export function findLayerExitPreset(id) {
  return (
    BASIC_LAYER_EXIT_ANIMATIONS.find((p) => p.id === id) ||
    PRIMARY_LAYER_EXIT_ANIMATIONS.find((p) => p.id === id) ||
    ADDON_LAYER_EXIT_ANIMATIONS.find((p) => p.id === id) ||
    null
  );
}

export function getLayerAnimationPresetId(entranceType) {
  const all = [...PRIMARY_LAYER_ANIMATIONS, ...ADDON_LAYER_ANIMATIONS];
  return all.find((p) => p.entrance === entranceType)?.id || '';
}

export function getLayerExitPresetId(exitType) {
  const all = [
    ...BASIC_LAYER_EXIT_ANIMATIONS,
    ...PRIMARY_LAYER_EXIT_ANIMATIONS,
    ...ADDON_LAYER_EXIT_ANIMATIONS,
  ];
  return all.find((p) => p.exit === exitType)?.id || '';
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

export function durationForExit(type) {
  const map = {
    fadeOut: 0.7,
    slideUp: 0.75,
    slideDown: 0.75,
    slideLeft: 0.75,
    slideRight: 0.75,
    zoomOut: 0.8,
    zoomIn: 0.8,
    pop: 0.65,
    blurOut: 0.8,
    wipe: 0.75,
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
    kenBurns: 1.2,
    ascend: 0.85,
    shift: 0.75,
    merge: 0.8,
    burst: 0.65,
  };
  return map[type] ?? 0.75;
}
