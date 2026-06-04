import {
  normalizeSceneTransition,
  sceneHasVisibleTransition,
} from './sceneTransitionUtils';

export const COMPOSITION_FPS = 30;

export function sceneDurationFrames(scene, fps = COMPOSITION_FPS) {
  return Math.max(1, Math.round((scene.duration || 8) * fps));
}

function getIncomingTransition(scene) {
  if (!scene || !sceneHasVisibleTransition(scene)) return null;
  const t = normalizeSceneTransition(scene.transition);
  if (!t || t.type === 'none') return null;
  return t;
}

function transitionLengthFrames(spec, fps) {
  return Math.max(1, Math.round((spec.duration ?? 0.5) * fps));
}

/**
 * Crossfade / slide / zoom styles for outgoing & incoming scene layers.
 * @param {number} progress 0..1
 */
function layerTransitionStyles(progress, spec, role) {
  const p = Math.min(1, Math.max(0, progress));
  const type = spec.type || 'fade';
  const direction = spec.direction || 'left';
  const base = {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    filter: undefined,
  };

  if (type === 'fade' || type === 'blur') {
    if (role === 'outgoing') {
      return { ...base, opacity: 1 - p, filter: type === 'blur' ? `blur(${p * 6}px)` : undefined };
    }
    return {
      ...base,
      opacity: p,
      filter: type === 'blur' ? `blur(${(1 - p) * 10}px)` : undefined,
    };
  }

  if (type === 'zoom') {
    if (role === 'outgoing') {
      return { ...base, opacity: 1 - p, scale: 1 + p * 0.08 };
    }
    return { ...base, opacity: p, scale: 0.88 + p * 0.12 };
  }

  if (type === 'slide') {
    const slidePx = 420;
    let inX = 0;
    let inY = 0;
    let outX = 0;
    let outY = 0;
    if (direction === 'right') {
      inX = (1 - p) * slidePx;
      outX = -p * slidePx * 0.35;
    } else if (direction === 'up') {
      inY = (1 - p) * slidePx;
      outY = p * slidePx * 0.35;
    } else if (direction === 'down') {
      inY = -(1 - p) * slidePx;
      outY = -p * slidePx * 0.35;
    } else {
      inX = -(1 - p) * slidePx;
      outX = p * slidePx * 0.35;
    }
    if (role === 'outgoing') {
      return { ...base, opacity: 1 - p * 0.85, translateX: outX, translateY: outY };
    }
    return { ...base, opacity: p, translateX: inX, translateY: inY };
  }

  if (role === 'outgoing') return { ...base, opacity: 1 - p };
  return { ...base, opacity: p };
}

/**
 * Layers to render at a global frame (back → front).
 * @returns {Array<{ scene, frameInScene, opacity, translateX, translateY, scale, filter }>}
 */
export function resolveSceneLayersAtFrame(scenes, globalFrame, fps = COMPOSITION_FPS) {
  const list = scenes || [];
  if (!list.length) return [];

  let cursor = 0;
  for (let i = 0; i < list.length; i += 1) {
    const scene = list[i];
    const dur = sceneDurationFrames(scene, fps);
    const start = cursor;
    const end = start + dur;

    if (globalFrame < end || i === list.length - 1) {
      const local = Math.min(Math.max(0, globalFrame - start), dur - 1);
      const spec = i > 0 ? getIncomingTransition(scene) : null;
      const tLen = spec ? transitionLengthFrames(spec, fps) : 0;

      if (i > 0 && spec && local < tLen) {
        const progress = local / tLen;
        const prev = list[i - 1];
        const prevDur = sceneDurationFrames(prev, fps);
        const outFrame = Math.max(0, prevDur - (tLen - local));
        const inFrame = local;
        return [
          {
            scene: prev,
            frameInScene: outFrame,
            ...layerTransitionStyles(progress, spec, 'outgoing'),
          },
          {
            scene,
            frameInScene: inFrame,
            ...layerTransitionStyles(progress, spec, 'incoming'),
          },
        ];
      }

      return [
        {
          scene,
          frameInScene: local,
          opacity: 1,
          translateX: 0,
          translateY: 0,
          scale: 1,
          filter: undefined,
        },
      ];
    }
    cursor = end;
  }

  return [
    {
      scene: list[0],
      frameInScene: 0,
      opacity: 1,
      translateX: 0,
      translateY: 0,
      scale: 1,
      filter: undefined,
    },
  ];
}

export function getTotalDurationInFrames(scenes, fps = COMPOSITION_FPS) {
  return (scenes || []).reduce((sum, s) => sum + sceneDurationFrames(s, fps), 0);
}
