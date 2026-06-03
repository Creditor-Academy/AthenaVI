export const SCENE_TRANSITION_OPTIONS = [
  { value: 'fade', label: 'Dissolve' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
  { value: 'none', label: 'None' },
];

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
