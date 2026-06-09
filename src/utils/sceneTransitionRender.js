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
function wipeInset(direction, p, role) {
  const pct = Math.round(p * 100);
  if (direction === 'right') {
    return role === 'incoming'
      ? `inset(0 ${100 - pct}% 0 0)`
      : `inset(0 0 0 ${pct}%)`;
  }
  if (direction === 'left') {
    return role === 'incoming'
      ? `inset(0 0 0 ${100 - pct}%)`
      : `inset(0 ${pct}% 0 0)`;
  }
  if (direction === 'down') {
    return role === 'incoming'
      ? `inset(${100 - pct}% 0 0 0)`
      : `inset(0 0 ${pct}% 0)`;
  }
  return role === 'incoming'
    ? `inset(0 0 ${100 - pct}% 0)`
    : `inset(${pct}% 0 0 0)`;
}

function layerTransitionStyles(progress, spec, role) {
  const p = Math.min(1, Math.max(0, progress));
  const type = spec.type || 'fade';
  const direction = spec.direction || 'left';
  const roleKey = role === 'outgoing' ? 'outgoing' : 'incoming';
  const base = {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    filter: undefined,
    clipPath: undefined,
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

  if (type === 'zoom' || type === 'match-move') {
    if (role === 'outgoing') {
      return { ...base, opacity: 1 - p, scale: 1 + p * 0.06 };
    }
    return { ...base, opacity: p, scale: type === 'match-move' ? 0.92 + p * 0.08 : 0.88 + p * 0.12 };
  }

  if (type === 'chop') {
    const cut = p < 0.5 ? 1 : 0;
    return { ...base, opacity: role === 'outgoing' ? cut : 1 - cut };
  }

  if (type === 'circle-wipe') {
    const radius = spec.variant === 'out'
      ? (role === 'outgoing' ? (1 - p) * 150 : 150)
      : (role === 'incoming' ? p * 150 : 150);
    return {
      ...base,
      opacity: 1,
      clipPath: `circle(${radius}% at 50% 50%)`,
    };
  }

  if (type === 'color-wipe' || type === 'line-wipe') {
    return {
      ...base,
      opacity: 1,
      clipPath: wipeInset(direction, p, roleKey),
    };
  }

  if (type === 'slide' || type === 'flow' || type === 'stack') {
    const slidePx = type === 'stack' ? 520 : 420;
    const flowBlur = type === 'flow' ? `blur(${(1 - p) * 4}px)` : undefined;
    let inX = 0;
    let inY = 0;
    let outX = 0;
    let outY = 0;
    if (direction === 'right') {
      inX = (1 - p) * slidePx;
      outX = type === 'stack' ? 0 : -p * slidePx * 0.35;
    } else if (direction === 'up') {
      inY = (1 - p) * slidePx;
      outY = type === 'stack' ? 0 : p * slidePx * 0.35;
    } else if (direction === 'down') {
      inY = -(1 - p) * slidePx;
      outY = type === 'stack' ? 0 : -p * slidePx * 0.35;
    } else {
      inX = -(1 - p) * slidePx;
      outX = type === 'stack' ? 0 : p * slidePx * 0.35;
    }
    if (role === 'outgoing') {
      return {
        ...base,
        opacity: type === 'stack' ? 1 : 1 - p * 0.85,
        translateX: outX,
        translateY: outY,
        filter: flowBlur,
      };
    }
    return {
      ...base,
      opacity: type === 'stack' ? 1 : p,
      translateX: inX,
      translateY: inY,
      filter: flowBlur,
    };
  }

  if (role === 'outgoing') return { ...base, opacity: 1 - p };
  return { ...base, opacity: p };
}

/**
 * Layers to render at a global frame (back → front).
 * @returns {Array<{ scene, frameInScene, opacity, translateX, translateY, scale, filter, clipPath }>}
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

/** Global composition frame where each scene begins (for Remotion Sequence offsets). */
export function getSceneStartFrames(scenes, fps = COMPOSITION_FPS) {
  const starts = new Map();
  let cursor = 0;
  for (const scene of scenes || []) {
    const key = scene.id || scene.sceneId;
    if (key != null) starts.set(key, cursor);
    cursor += sceneDurationFrames(scene, fps);
  }
  return starts;
}
