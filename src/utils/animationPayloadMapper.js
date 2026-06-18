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
  blurOut: 'fade-out',
  wipe: 'slide-left',
};

const EDITOR_EXIT_TO_BACKEND = {
  fadeOut: 'fade-out',
  slideUp: 'slide-up',
  slideDown: 'slide-down',
  slideLeft: 'slide-left',
  slideRight: 'slide-right',
  zoomOut: 'zoom-out',
  zoomIn: 'zoom-in',
  pop: 'scale-out',
  blurOut: 'fade-out',
  typewriter: 'fade-out',
  wordFade: 'fade-out',
  ascend: 'slide-up',
  shift: 'slide-left',
  merge: 'scale-out',
  block: 'fade-out',
  burst: 'bounce',
  kenBurns: 'zoom-out',
  succession: 'scale-out',
  breathe: 'pulse',
  baseline: 'slide-up',
  drift: 'slide-right',
  tectonic: 'slide-left',
  tumble: 'rotate-out',
  neon: 'fade-out',
  scrapbook: 'rotate-out',
  stomp: 'bounce',
  rotate: 'rotate-out',
  flicker: 'pulse',
  pulse: 'pulse',
  wiggle: 'bounce',
  wipe: 'slide-left',
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
  'scale-out': 'pop',
  typewriter: 'typewriter',
  bounce: 'burst',
  pulse: 'pulse',
  'rotate-in': 'rotate',
  'rotate-out': 'rotate',
};

const BACKEND_EXIT_TO_EDITOR = {
  'fade-out': 'fadeOut',
  'slide-up': 'slideUp',
  'slide-down': 'slideDown',
  'slide-left': 'slideLeft',
  'slide-right': 'slideRight',
  'zoom-out': 'zoomOut',
  'zoom-in': 'zoomIn',
  'scale-out': 'pop',
  bounce: 'burst',
  pulse: 'pulse',
  'rotate-out': 'rotate',
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

export function editorExitTypeToBackend(editorType, direction) {
  if (!editorType || editorType === 'none') return null;

  if (editorType === 'wipe' || editorType === 'shift') {
    return direction === 'right' ? 'slide-right' : 'slide-left';
  }
  if (editorType === 'drift') {
    return direction === 'right' ? 'slide-right' : 'slide-left';
  }
  if (editorType === 'rotate' || editorType === 'tumble' || editorType === 'scrapbook') {
    return 'rotate-out';
  }

  return EDITOR_EXIT_TO_BACKEND[editorType] || 'fade-out';
}

export function backendAnimationTypeToEditor(backendType) {
  if (!backendType) return 'fadeIn';
  return BACKEND_TO_EDITOR[backendType] || backendType.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function backendExitTypeToEditor(backendType) {
  if (!backendType) return 'fadeOut';
  return BACKEND_EXIT_TO_EDITOR[backendType] || 'fadeOut';
}

function isBackendExitType(backendType) {
  return (
    backendType?.endsWith('-out') ||
    backendType === 'scale-out' ||
    backendType === 'rotate-out'
  );
}

function buildEntrancePayload(entrance) {
  const type = editorAnimationTypeToBackend(entrance.type, entrance.direction);
  if (!type || !BACKEND_ANIMATION_TYPES.has(type)) return null;

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

  return { type, startFrame, durationInFrames };
}

function buildExitPayload(exit, clipDurationSec) {
  if (!clipDurationSec || clipDurationSec <= 0) return null;
  const type = editorExitTypeToBackend(exit.type, exit.direction);
  if (!type || !BACKEND_ANIMATION_TYPES.has(type)) return null;

  const exitDelayFrames = Math.round((exit.delay || 0) * FPS);
  const exitDurationFrames = Math.max(1, Math.round((exit.duration || 0.6) * FPS));
  const clipDurationFrames = Math.max(1, Math.round(clipDurationSec * FPS));
  const startFrame = Math.max(0, clipDurationFrames - exitDurationFrames - exitDelayFrames);

  return { type, startFrame, durationInFrames: exitDurationFrames };
}

/**
 * Editor clip.animations[] → backend element.animations[] for PATCH /data.
 */
export function mapAnimationsForBackend(clipAnimations, clipDurationSec) {
  if (!Array.isArray(clipAnimations) || clipAnimations.length === 0) return [];

  const result = [];

  const entrance =
    clipAnimations.find((a) => a?.phase === ANIMATION_PHASE.ENTRANCE) ||
    clipAnimations.find((a) => !a?.phase);

  if (entrance && entrance.type !== 'none') {
    const payload = buildEntrancePayload(entrance);
    if (payload) result.push(payload);
  }

  const exit = clipAnimations.find((a) => a?.phase === ANIMATION_PHASE.EXIT);
  if (exit && exit.type !== 'none') {
    const payload = buildExitPayload(exit, clipDurationSec);
    if (payload) result.push(payload);
  }

  return result;
}

/**
 * Backend element.animations[] → editor clip.animations[] when loading project.
 */
export function mapAnimationsFromBackend(backendAnimations, clipDurationSec) {
  if (!Array.isArray(backendAnimations) || backendAnimations.length === 0) return [];

  const result = [];

  backendAnimations.forEach((anim) => {
    if (!anim?.type) return;

    const durationSec = (anim.durationInFrames || FPS) / FPS;
    const startSec = (anim.startFrame || 0) / FPS;

    if (isBackendExitType(anim.type)) {
      const editorType = backendExitTypeToEditor(anim.type);
      const clipDur = clipDurationSec ?? startSec + durationSec;
      const delayFromEnd = Math.max(0, clipDur - startSec - durationSec);
      result.push({
        phase: ANIMATION_PHASE.EXIT,
        type: editorType,
        delay: delayFromEnd,
        duration: durationSec,
      });
      return;
    }

    const editorType = backendAnimationTypeToEditor(anim.type);
    if (editorType === 'none') return;

    result.push({
      phase: ANIMATION_PHASE.ENTRANCE,
      type: editorType,
      delay: startSec,
      duration: durationSec,
    });
  });

  return result;
}
