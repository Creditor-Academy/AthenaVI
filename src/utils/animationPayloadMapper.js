import { ANIMATION_PHASE } from './clipAnimations';

const FPS = 30;

/** Backend API animation type enum (kebab-case). */
export const BACKEND_ANIMATION_TYPES = new Set([
  'fade-in',
  'fade-out',
  'slide-up',
  'slide-down',
  'slide-left',
  'slide-right',
  'zoom-in',
  'zoom-out',
  'scale-in',
  'scale-out',
  'rotate-in',
  'rotate-out',
  'typewriter',
  'bounce',
  'pulse',
]);

const EDITOR_TO_BACKEND = {
  fadeIn: 'fade-in',
  fadeOut: 'fade-out',
  slideUp: 'slide-up',
  slideDown: 'slide-down',
  slideLeft: 'slide-left',
  slideRight: 'slide-right',
  zoomIn: 'zoom-in',
  zoomOut: 'zoom-out',
  pop: 'scale-in',
  blurIn: 'fade-in',
  typewriter: 'typewriter',
  wordFade: 'fade-in',
  ascend: 'slide-up',
  shift: 'slide-left',
  merge: 'scale-in',
  block: 'fade-in',
  burst: 'bounce',
  kenBurns: 'zoom-in',
  succession: 'scale-in',
  breathe: 'pulse',
  baseline: 'slide-up',
  drift: 'slide-right',
  tectonic: 'slide-left',
  tumble: 'rotate-in',
  neon: 'fade-in',
  scrapbook: 'rotate-in',
  stomp: 'bounce',
  rotate: 'rotate-in',
  flicker: 'pulse',
  pulse: 'pulse',
  wiggle: 'bounce',
};

const BACKEND_TO_EDITOR = {
  'fade-in': 'fadeIn',
  'fade-out': 'fadeOut',
  'slide-up': 'slideUp',
  'slide-down': 'slideDown',
  'slide-left': 'slideLeft',
  'slide-right': 'slideRight',
  'zoom-in': 'zoomIn',
  'zoom-out': 'zoomOut',
  'scale-in': 'pop',
  'scale-out': 'zoomOut',
  'rotate-in': 'rotate',
  'rotate-out': 'rotate',
  typewriter: 'typewriter',
  bounce: 'burst',
  pulse: 'pulse',
};

export function editorAnimationTypeToBackend(editorType, direction) {
  if (!editorType || editorType === 'none') return null;

  if (editorType === 'wipe' || editorType === 'shift') {
    return direction === 'right' ? 'slide-right' : 'slide-left';
  }
  if (editorType === 'drift') {
    return direction === 'right' ? 'slide-left' : 'slide-right';
  }
  if (editorType === 'rotate' || editorType === 'tumble' || editorType === 'scrapbook') {
    return 'rotate-in';
  }

  return EDITOR_TO_BACKEND[editorType] || 'fade-in';
}

export function backendAnimationTypeToEditor(backendType) {
  if (!backendType) return 'fadeIn';
  return BACKEND_TO_EDITOR[backendType] || backendType.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Editor clip.animations[] → backend element.animations[] for PATCH /data.
 */
export function mapAnimationsForBackend(clipAnimations) {
  if (!Array.isArray(clipAnimations) || clipAnimations.length === 0) return [];

  const entrance =
    clipAnimations.find((a) => a?.phase === ANIMATION_PHASE.ENTRANCE) ||
    clipAnimations.find((a) => !a?.phase);

  if (!entrance || entrance.type === 'none') return [];

  const type = editorAnimationTypeToBackend(entrance.type, entrance.direction);
  if (!type || !BACKEND_ANIMATION_TYPES.has(type)) return [];

  const startFrame = Math.max(0, Math.round((entrance.delay || 0) * FPS));
  const baseDuration = entrance.duration ?? 0.6;
  const speed =
    entrance.type === 'typewriter' || entrance.type === 'wordFade'
      ? Math.max(0.25, entrance.speed ?? 1)
      : 1;
  const effectiveDuration =
    entrance.type === 'typewriter' || entrance.type === 'wordFade'
      ? baseDuration / speed
      : baseDuration;
  const durationInFrames = Math.max(1, Math.round(effectiveDuration * FPS));

  return [
    {
      type,
      startFrame,
      durationInFrames,
    },
  ];
}

/**
 * Backend element.animations[] → editor clip.animations[] when loading project.
 */
export function mapAnimationsFromBackend(backendAnimations) {
  if (!Array.isArray(backendAnimations) || backendAnimations.length === 0) return [];

  const first = backendAnimations[0];
  if (!first?.type) return [];

  const editorType = backendAnimationTypeToEditor(first.type);
  if (editorType === 'none') return [];

  return [
    {
      phase: ANIMATION_PHASE.ENTRANCE,
      type: editorType,
      delay: (first.startFrame || 0) / FPS,
      duration: (first.durationInFrames || FPS) / FPS,
    },
  ];
}
