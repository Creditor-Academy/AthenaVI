import { getEntranceAnimation } from './clipAnimations';
import { buildClipTransform, CLIP_TRANSFORM_ORIGIN } from './clipTransformUtils';

/**
 * Merge computed animation state into a layer's inline style (canvas + composition).
 */
export function applyAnimationToLayerStyle(baseStyle, clip, animState) {
  if (!animState || !animState.visible) {
    return { ...baseStyle, opacity: 0, pointerEvents: 'none' };
  }

  const { transform } = buildClipTransform(clip, {
    translateX: animState.translateX ?? 0,
    translateY: animState.translateY ?? 0,
    rotation: animState.rotation ?? 0,
    scale: animState.scale ?? 1,
  });

  return {
    ...baseStyle,
    opacity: animState.opacity ?? baseStyle.opacity ?? 1,
    transform,
    filter: animState.blur
      ? [baseStyle.filter, `blur(${animState.blur}px)`].filter(Boolean).join(' ')
      : baseStyle.filter,
    transformOrigin: baseStyle.transformOrigin || CLIP_TRANSFORM_ORIGIN,
  };
}

export function clipHasEntranceAnimation(clip) {
  const e = getEntranceAnimation(clip);
  return !!(e && e.type && e.type !== 'none');
}

/** Merge entrance preview into a positioned clip wrapper (live canvas). */
export function buildLiveAnimStyle(baseStyle, clip, animState, extras = {}) {
  const { cssFilter, overlayMode, ...layoutExtras } = extras;
  if (overlayMode) {
    return { ...baseStyle, ...layoutExtras, opacity: 0, pointerEvents: 'none' };
  }

  const filterParts = [];
  if (cssFilter) filterParts.push(cssFilter);
  if (animState?.blur) filterParts.push(`blur(${animState.blur}px)`);

  if (!animState) {
    const { transform, transformOrigin } = buildClipTransform(clip);
    return {
      ...baseStyle,
      ...layoutExtras,
      opacity: clip.opacity ?? 1,
      transform: transform ?? baseStyle.transform,
      transformOrigin: baseStyle.transformOrigin || transformOrigin,
      filter: filterParts.length ? filterParts.join(' ') : undefined,
    };
  }

  if (!animState.visible) {
    return { ...baseStyle, ...layoutExtras, opacity: 0, pointerEvents: 'none' };
  }

  const { transform, transformOrigin } = buildClipTransform(clip, {
    translateX: animState.translateX ?? 0,
    translateY: animState.translateY ?? 0,
    rotation: animState.rotation ?? 0,
    scale: animState.scale ?? 1,
  });

  return {
    ...baseStyle,
    ...layoutExtras,
    opacity: animState.opacity ?? clip.opacity ?? 1,
    transform,
    filter: filterParts.length ? filterParts.join(' ') : undefined,
    transformOrigin: baseStyle.transformOrigin || transformOrigin,
  };
}
