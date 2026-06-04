import { BACKEND_ANIMATION_TYPES } from './animationPayloadMapper';

const FPS = 30;

export const SCENE_TRANSITION_OPTIONS = [
  { value: 'fade', label: 'Dissolve' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
  { value: 'none', label: 'None' },
];

/** Editor scene transition type → backend kebab-case (same enum as layer animations). */
export function editorTransitionTypeToBackend(editorType, direction) {
  if (!editorType || editorType === 'none') return null;
  if (BACKEND_ANIMATION_TYPES.has(editorType)) return editorType;

  switch (editorType) {
    case 'fade':
      return 'fade-in';
    case 'slide': {
      const d = direction || 'left';
      if (d === 'right') return 'slide-right';
      if (d === 'up') return 'slide-up';
      if (d === 'down') return 'slide-down';
      return 'slide-left';
    }
    case 'zoom':
      return 'zoom-in';
    case 'blur':
      return 'fade-in';
    default:
      return 'fade-in';
  }
}

/** Backend transition → editor shape for UI / local state. */
export function mapSceneTransitionFromBackend(transition) {
  if (transition == null) return { type: 'none', duration: 0 };

  const rawType = typeof transition === 'string' ? transition : transition.type;
  const durationInFrames =
    typeof transition === 'object' && transition !== null
      ? transition.durationInFrames ??
        (transition.duration != null ? Math.round(transition.duration * FPS) : undefined)
      : undefined;
  const duration =
    durationInFrames != null ? durationInFrames / FPS : (transition.duration ?? 0.5);

  if (!rawType || rawType === 'none') return { type: 'none', duration: 0 };

  if (rawType.startsWith('slide-')) {
    return {
      type: 'slide',
      duration,
      direction: rawType.replace('slide-', '') || 'left',
    };
  }
  if (rawType === 'fade-in' || rawType === 'fade-out' || rawType === 'fade') {
    return { type: 'fade', duration };
  }
  if (rawType === 'zoom-in' || rawType === 'zoom-out' || rawType === 'zoom') {
    return { type: 'zoom', duration };
  }
  if (rawType === 'blur' || rawType === 'blur-in') {
    return { type: 'blur', duration };
  }

  const editorType =
    SCENE_TRANSITION_OPTIONS.find((o) => o.value === rawType)?.value || 'fade';
  return normalizeSceneTransition({ type: editorType, duration });
}

/**
 * PATCH payload transition for scenes after the first (incoming transition).
 * Returns null when nothing should be sent.
 */
export function mapSceneTransitionForBackend(transition, sceneIndex) {
  if (sceneIndex === 0 || transition == null) return null;

  const normalized = normalizeSceneTransition(transition);
  if (normalized.type === 'none') return null;

  const type = editorTransitionTypeToBackend(normalized.type, normalized.direction);
  if (!type || !BACKEND_ANIMATION_TYPES.has(type)) return null;

  return {
    type,
    durationInFrames: Math.max(0, Math.round((normalized.duration ?? 0.5) * FPS)),
  };
}

export function getSceneTransitionType(scene) {
  const t = scene?.transition;
  if (!t) return 'fade';
  if (typeof t === 'string') return t;
  return t.type || 'fade';
}

export function getSceneTransitionLabel(scene) {
  const type = getSceneTransitionType(scene);
  return SCENE_TRANSITION_OPTIONS.find((o) => o.value === type)?.label || 'Dissolve';
}

export function normalizeSceneTransition(value) {
  if (value == null) return { type: 'fade', duration: 0.5 };
  if (typeof value === 'string') {
    return value === 'none'
      ? { type: 'none', duration: 0 }
      : { type: value, duration: 0.5 };
  }
  return {
    type: value.type || 'fade',
    duration: value.duration ?? 0.5,
    ...(value.direction ? { direction: value.direction } : {}),
  };
}

export function sceneHasVisibleTransition(scene) {
  const type = getSceneTransitionType(scene);
  return type && type !== 'none';
}
