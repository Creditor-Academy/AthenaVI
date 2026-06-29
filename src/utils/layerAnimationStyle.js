import { getEntranceAnimation } from './clipAnimations';

/**
 * Merge computed animation state into a layer's inline style (canvas + composition).
 */
export function applyAnimationToLayerStyle(baseStyle, clip, animState) {
  if (!animState || !animState.visible) {
    return { ...baseStyle, opacity: 0, pointerEvents: 'none' };
  }

  const rot = clip.rotation ?? 0;
  const animRot = animState.rotation ?? 0;
  const scale = (animState.scale ?? 1) * (clip.scale ?? 1);
  const parts = [
    `translate(${animState.translateX ?? 0}px, ${animState.translateY ?? 0}px)`,
    `rotate(${rot + animRot}deg)`,
    `scale(${scale})`,
  ];
  const existing = baseStyle.transform && baseStyle.transform !== 'none' ? `${baseStyle.transform} ` : '';

  return {
    ...baseStyle,
    opacity: animState.opacity ?? baseStyle.opacity ?? 1,
    transform: `${existing}${parts.join(' ')}`.trim(),
    filter: animState.blur
      ? [baseStyle.filter, `blur(${animState.blur}px)`].filter(Boolean).join(' ')
      : baseStyle.filter,
    transformOrigin: baseStyle.transformOrigin || 'center center',
  };
}

export function clipHasEntranceAnimation(clip) {
  const e = getEntranceAnimation(clip);
  return !!(e && e.type && e.type !== 'none');
}

/** Merge entrance preview into a positioned clip wrapper (live canvas). */
export function buildLiveAnimStyle(baseStyle, clip, animState, extras = {}) {
  const { flipTransform, cssFilter, overlayMode, ...layoutExtras } = extras;
  if (overlayMode) {
    return { ...baseStyle, ...layoutExtras, opacity: 0, pointerEvents: 'none' };
  }

  const filterParts = [];
  if (cssFilter) filterParts.push(cssFilter);
  if (animState?.blur) filterParts.push(`blur(${animState.blur}px)`);

  if (!animState) {
    const parts = [
      `rotate(${clip.rotation ?? 0}deg)`,
      `scale(${clip.scale ?? 1})`,
      flipTransform,
    ].filter(Boolean);
    return {
      ...baseStyle,
      ...layoutExtras,
      opacity: clip.opacity ?? 1,
      transform: parts.length ? parts.join(' ') : baseStyle.transform,
      transformOrigin: baseStyle.transformOrigin || 'top left',
      filter: filterParts.length ? filterParts.join(' ') : undefined,
    };
  }

  if (!animState.visible) {
    return { ...baseStyle, ...layoutExtras, opacity: 0, pointerEvents: 'none' };
  }

  const rot = (clip.rotation ?? 0) + (animState.rotation ?? 0);
  const scale = (animState.scale ?? 1) * (clip.scale ?? 1);
  const parts = [
    `translate(${animState.translateX ?? 0}px, ${animState.translateY ?? 0}px)`,
    `rotate(${rot}deg)`,
    `scale(${scale})`,
    flipTransform,
  ].filter(Boolean);

  return {
    ...baseStyle,
    ...layoutExtras,
    opacity: animState.opacity ?? clip.opacity ?? 1,
    transform: parts.join(' '),
    filter: filterParts.length ? filterParts.join(' ') : undefined,
    transformOrigin: baseStyle.transformOrigin || 'top left',
  };
}
