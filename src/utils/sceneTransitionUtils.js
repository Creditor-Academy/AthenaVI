const FPS = 30;

/** Backend scene transition enum (project save API). */
export const BACKEND_SCENE_TRANSITION_TYPES = new Set([
  'cut',
  'fade',
  'dissolve',
  'slide-left',
  'slide-right',
  'slide-up',
  'slide-down',
  'wipe-left',
  'wipe-right',
  'zoom-in',
  'zoom-out',
  'circle-wipe-in',
  'circle-wipe-out',
  'colour-wipe-left',
  'colour-wipe-right',
  'colour-wipe-up',
  'colour-wipe-down',
  'line-wipe-left',
  'line-wipe-right',
  'line-wipe-up',
  'line-wipe-down',
  'match-move',
  'flow-left',
  'flow-right',
  'flow-up',
  'flow-down',
  'stack-left',
  'stack-right',
  'stack-up',
  'stack-down',
  'chop',
]);

/** Full transition list shown in the scene sidebar picker. */
export const SCENE_TRANSITION_CATALOG = [
  { value: 'none', label: 'None' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'slide-left', label: 'Slide left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'circle-wipe-in', label: 'Circle Wipe In' },
  { value: 'circle-wipe-out', label: 'Circle Wipe Out' },
  { value: 'color-wipe-left', label: 'Colour wipe left' },
  { value: 'color-wipe-right', label: 'Colour wipe right' },
  { value: 'color-wipe-up', label: 'Colour wipe up' },
  { value: 'color-wipe-down', label: 'Colour wipe down' },
  { value: 'line-wipe-left', label: 'Line wipe left' },
  { value: 'line-wipe-right', label: 'Line wipe right' },
  { value: 'line-wipe-up', label: 'Line wipe up' },
  { value: 'line-wipe-down', label: 'Line wipe down' },
  { value: 'match-move', label: 'Match & Move' },
  { value: 'flow-left', label: 'Flow left' },
  { value: 'flow-right', label: 'Flow right' },
  { value: 'flow-up', label: 'Flow up' },
  { value: 'flow-down', label: 'Flow down' },
  { value: 'stack-left', label: 'Stack left' },
  { value: 'stack-right', label: 'Stack right' },
  { value: 'stack-up', label: 'Stack up' },
  { value: 'stack-down', label: 'Stack down' },
  { value: 'chop', label: 'Chop' },
];

/** Category grid shown in the sidebar transition picker (icons + labels). */
export const SCENE_TRANSITION_GROUPS = [
  { id: 'none', label: 'None', defaultValue: 'none' },
  { id: 'dissolve', label: 'Dissolve', defaultValue: 'dissolve' },
  { id: 'slide', label: 'Slide', defaultValue: 'slide-left', hasVariants: true },
  { id: 'circle-wipe', label: 'Circle Wipe', defaultValue: 'circle-wipe-in', hasVariants: true },
  { id: 'color-wipe', label: 'Color Wipe', defaultValue: 'color-wipe-left', hasVariants: true },
  { id: 'line-wipe', label: 'Line Wipe', defaultValue: 'line-wipe-left', hasVariants: true },
  { id: 'match-move', label: 'Match & Move', defaultValue: 'match-move' },
  { id: 'flow', label: 'Flow', defaultValue: 'flow-left', hasVariants: true },
  { id: 'stack', label: 'Stack', defaultValue: 'stack-down', hasVariants: true },
  { id: 'chop', label: 'Chop', defaultValue: 'chop' },
];

export function getSceneTransitionGroupId(catalogValue) {
  if (!catalogValue || catalogValue === 'none') return 'none';
  if (catalogValue === 'dissolve') return 'dissolve';
  if (catalogValue.startsWith('slide-')) return 'slide';
  if (catalogValue.startsWith('circle-wipe')) return 'circle-wipe';
  if (catalogValue.startsWith('color-wipe')) return 'color-wipe';
  if (catalogValue.startsWith('line-wipe')) return 'line-wipe';
  if (catalogValue === 'match-move') return 'match-move';
  if (catalogValue.startsWith('flow-')) return 'flow';
  if (catalogValue.startsWith('stack-')) return 'stack';
  if (catalogValue === 'chop') return 'chop';
  return 'dissolve';
}

export function getVariantsForTransitionGroup(groupId) {
  if (groupId === 'circle-wipe') {
    return SCENE_TRANSITION_CATALOG.filter((o) => o.value.startsWith('circle-wipe'));
  }
  const prefixes = {
    slide: 'slide-',
    'color-wipe': 'color-wipe-',
    'line-wipe': 'line-wipe-',
    flow: 'flow-',
    stack: 'stack-',
  };
  const prefix = prefixes[groupId];
  if (!prefix) return [];
  return SCENE_TRANSITION_CATALOG.filter((o) => o.value.startsWith(prefix));
}

/** @deprecated Use SCENE_TRANSITION_CATALOG — kept for older UI chips */
export const SCENE_TRANSITION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Dissolve' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
];

function catalogLabel(value) {
  return SCENE_TRANSITION_CATALOG.find((o) => o.value === value)?.label || 'Dissolve';
}

function parseCatalogValue(value) {
  if (!value || value === 'none') {
    return { value: 'none', type: 'none', duration: 0 };
  }
  if (value === 'dissolve' || value === 'fade') {
    return { value: 'dissolve', type: 'fade', duration: 0.5 };
  }
  if (value.startsWith('slide-')) {
    return { value, type: 'slide', direction: value.slice('slide-'.length), duration: 0.5 };
  }
  if (value === 'circle-wipe-in') {
    return { value, type: 'circle-wipe', variant: 'in', duration: 0.6 };
  }
  if (value === 'circle-wipe-out') {
    return { value, type: 'circle-wipe', variant: 'out', duration: 0.6 };
  }
  if (value.startsWith('color-wipe-') || value.startsWith('colour-wipe-')) {
    const prefix = value.startsWith('colour-wipe-') ? 'colour-wipe-' : 'color-wipe-';
    const direction = value.slice(prefix.length);
    const editorValue = `color-wipe-${direction}`;
    return { value: editorValue, type: 'color-wipe', direction, duration: 0.5 };
  }
  if (value.startsWith('line-wipe-')) {
    return { value, type: 'line-wipe', direction: value.slice('line-wipe-'.length), duration: 0.5 };
  }
  if (value === 'match-move') {
    return { value, type: 'match-move', duration: 0.7 };
  }
  if (value.startsWith('flow-')) {
    return { value, type: 'flow', direction: value.slice('flow-'.length), duration: 0.55 };
  }
  if (value.startsWith('stack-')) {
    return { value, type: 'stack', direction: value.slice('stack-'.length), duration: 0.5 };
  }
  if (value === 'chop') {
    return { value, type: 'chop', duration: 0.2 };
  }
  if (value === 'zoom') return { value: 'dissolve', type: 'zoom', duration: 0.5 };
  if (value === 'blur') return { value: 'dissolve', type: 'blur', duration: 0.5 };
  return { value: 'dissolve', type: 'fade', duration: 0.5 };
}

function legacySpecToCatalogValue(spec) {
  if (!spec || spec.type === 'none') return 'none';
  if (spec.type === 'fade') return 'dissolve';
  if (spec.type === 'slide') return `slide-${spec.direction || 'left'}`;
  if (spec.type === 'zoom' || spec.type === 'blur') return 'dissolve';
  if (spec.type === 'circle-wipe') {
    return spec.variant === 'out' ? 'circle-wipe-out' : 'circle-wipe-in';
  }
  if (spec.type === 'color-wipe') return `color-wipe-${spec.direction || 'left'}`;
  if (spec.type === 'line-wipe') return `line-wipe-${spec.direction || 'left'}`;
  if (spec.type === 'match-move') return 'match-move';
  if (spec.type === 'flow') return `flow-${spec.direction || 'left'}`;
  if (spec.type === 'stack') return `stack-${spec.direction || 'left'}`;
  if (spec.type === 'chop') return 'chop';
  if (spec.value) return spec.value;
  return 'dissolve';
}

/** Editor catalog value → backend scene transition type. */
export function catalogValueToBackendTransitionType(catalogValue) {
  if (!catalogValue || catalogValue === 'none') return null;
  if (catalogValue === 'dissolve') return 'dissolve';
  if (catalogValue.startsWith('color-wipe-')) {
    return catalogValue.replace('color-wipe-', 'colour-wipe-');
  }
  if (BACKEND_SCENE_TRANSITION_TYPES.has(catalogValue)) return catalogValue;
  return 'dissolve';
}

/** Backend scene transition type → editor catalog value. */
export function backendTransitionTypeToCatalogValue(rawType) {
  if (!rawType || rawType === 'none' || rawType === 'cut') return 'none';
  if (rawType === 'fade' || rawType === 'dissolve' || rawType === 'fade-in' || rawType === 'fade-out') {
    return 'dissolve';
  }
  if (rawType === 'zoom-in' || rawType === 'zoom-out' || rawType === 'zoom') return 'dissolve';
  if (rawType.startsWith('colour-wipe-')) {
    return rawType.replace('colour-wipe-', 'color-wipe-');
  }
  if (rawType === 'wipe-left') return 'color-wipe-left';
  if (rawType === 'wipe-right') return 'color-wipe-right';
  if (SCENE_TRANSITION_CATALOG.some((o) => o.value === rawType)) return rawType;
  return 'dissolve';
}

/** Backend transition → editor shape for UI / local state. */
export function mapSceneTransitionFromBackend(transition) {
  if (transition == null) return normalizeSceneTransition('dissolve');

  const rawType = typeof transition === 'string' ? transition : transition.type;
  const durationInFrames =
    typeof transition === 'object' && transition !== null
      ? transition.durationInFrames ??
        (transition.duration != null ? Math.round(transition.duration * FPS) : undefined)
      : undefined;
  const duration =
    durationInFrames != null ? durationInFrames / FPS : (transition.duration ?? 0.5);

  const catalogValue = backendTransitionTypeToCatalogValue(rawType);
  return normalizeSceneTransition({ value: catalogValue, duration });
}

/**
 * PATCH payload transition for scenes after the first (incoming transition).
 * Returns null when nothing should be sent.
 */
export function mapSceneTransitionForBackend(transition, sceneIndex) {
  if (sceneIndex === 0 || transition == null) return null;

  const normalized = normalizeSceneTransition(transition);
  if (normalized.type === 'none') return null;

  const catalogValue = normalized.value || legacySpecToCatalogValue(normalized);
  const type = catalogValueToBackendTransitionType(catalogValue);
  if (!type || !BACKEND_SCENE_TRANSITION_TYPES.has(type)) return null;

  return {
    type,
    durationInFrames: Math.max(0, Math.round((normalized.duration ?? 0.5) * FPS)),
  };
}

export function getSceneTransitionCatalogValue(scene) {
  const normalized = normalizeSceneTransition(scene?.transition);
  return normalized.value || legacySpecToCatalogValue(normalized);
}

export function getSceneTransitionType(scene) {
  return normalizeSceneTransition(scene?.transition).type;
}

export function getSceneTransitionLabel(scene) {
  return catalogLabel(getSceneTransitionCatalogValue(scene));
}

export function normalizeSceneTransition(value) {
  if (value == null) {
    return { ...parseCatalogValue('dissolve'), duration: 0.5 };
  }
  if (typeof value === 'string') {
    const spec = parseCatalogValue(value);
    return { ...spec, duration: spec.duration ?? 0.5 };
  }
  if (value.value) {
    const spec = parseCatalogValue(value.value);
    return {
      ...spec,
      duration: value.duration ?? spec.duration ?? 0.5,
      ...(value.direction && !spec.direction ? { direction: value.direction } : {}),
    };
  }
  const catalogValue = legacySpecToCatalogValue(value);
  const spec = parseCatalogValue(catalogValue);
  return {
    ...spec,
    duration: value.duration ?? spec.duration ?? 0.5,
    ...(value.direction && !spec.direction ? { direction: value.direction } : {}),
    ...(value.variant && !spec.variant ? { variant: value.variant } : {}),
  };
}

export function sceneHasVisibleTransition(scene) {
  const normalized = normalizeSceneTransition(scene?.transition);
  return normalized.type && normalized.type !== 'none';
}
