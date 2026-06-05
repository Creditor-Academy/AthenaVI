/**
 * Per-layer entrance animations (stored on clip.animations[]).
 * Scene-to-scene transitions live on scene.transition — separate concept.
 */

export const ANIMATION_PHASE = {
  ENTRANCE: 'entrance',
  EXIT: 'exit',
};

const BASE_ENTRANCE = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'zoomOut', label: 'Zoom Out' },
  { value: 'pop', label: 'Pop' },
  { value: 'blurIn', label: 'Blur In' },
];

const TEXT_ONLY = [
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'wordFade', label: 'Word by Word' },
];

const MEDIA_EXTRA = [
  { value: 'kenBurns', label: 'Ken Burns' },
];

export function getAnimationOptionsForClip(clip) {
  const type = clip?.type || 'image';
  const role = clip?.role || '';

  if (type === 'text' || role.includes('text') || role === 'main-text' || role === 'subtitle-text') {
    return [
      ...BASE_ENTRANCE,
      ...TEXT_ONLY,
      { value: 'ascend', label: 'Ascend' },
      { value: 'shift', label: 'Shift' },
      { value: 'merge', label: 'Merge' },
      { value: 'block', label: 'Block' },
      { value: 'burst', label: 'Burst' },
    ];
  }
  if (type === 'image' || type === 'video' || type === 'avatar' || role === 'avatar') {
    return [...BASE_ENTRANCE, ...MEDIA_EXTRA];
  }
  if (type === 'shape') {
    return BASE_ENTRANCE.filter((o) => o.value !== 'blurIn');
  }
  return BASE_ENTRANCE;
}

export function getEntranceAnimation(clip) {
  const list = clip?.animations;
  if (!Array.isArray(list)) return null;
  return (
    list.find((a) => a?.phase === ANIMATION_PHASE.ENTRANCE) ||
    list.find((a) => !a?.phase) ||
    null
  );
}

export function setEntranceAnimation(clip, patch) {
  const list = Array.isArray(clip?.animations) ? [...clip.animations] : [];
  const idx = list.findIndex((a) => a?.phase === ANIMATION_PHASE.ENTRANCE);
  const prev = idx >= 0 ? list[idx] : {};
  const nextType = patch.type ?? prev.type ?? 'fadeIn';
  const next = {
    phase: ANIMATION_PHASE.ENTRANCE,
    type: nextType,
    duration: patch.duration ?? prev.duration ?? 0.6,
    delay: patch.delay ?? prev.delay ?? 0,
    ...(prev.direction ? { direction: prev.direction } : {}),
    ...(patch.direction != null ? { direction: patch.direction } : {}),
    ...(patch.previewSeed != null ? { previewSeed: patch.previewSeed } : {}),
    ...((nextType === 'typewriter' || nextType === 'wordFade' || prev.speed != null || patch.speed != null)
      ? { speed: patch.speed ?? prev.speed ?? 1 }
      : {}),
  };
  if (next.type === 'none') {
    const filtered = list.filter((a) => a?.phase !== ANIMATION_PHASE.ENTRANCE);
    return { ...clip, animations: filtered };
  }
  if (idx >= 0) list[idx] = next;
  else list.push(next);
  return { ...clip, animations: list };
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * @param {number} frameInClip - frames since clip start (0-based)
 * @param {number} fps
 * @param {object} clip
 * @returns {{ opacity: number, scale: number, translateX: number, translateY: number, blur: number, typewriterChars: number|null }}
 */
export function computeClipAnimationState(frameInClip, fps, clip) {
  const entrance = getEntranceAnimation(clip);
  const baseOpacity = clip.opacity ?? 1;

  if (!entrance || entrance.type === 'none') {
    return {
      opacity: baseOpacity,
      scale: 1,
      translateX: 0,
      translateY: 0,
      blur: 0,
      typewriterChars: null,
      visible: true,
    };
  }

  const delayFrames = Math.round((entrance.delay || 0) * fps);
  const baseDuration = entrance.duration || 0.6;
  const speed =
    entrance.type === 'typewriter' || entrance.type === 'wordFade'
      ? Math.max(0.25, entrance.speed ?? 1)
      : 1;
  const durationFrames = Math.max(
    1,
    Math.round(
      (entrance.type === 'typewriter' || entrance.type === 'wordFade'
        ? baseDuration / speed
        : baseDuration) * fps
    )
  );
  const localFrame = frameInClip - delayFrames;

  if (localFrame < 0) {
    return {
      opacity: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      blur: 0,
      typewriterChars: 0,
      visible: false,
    };
  }

  const t = clamp01(localFrame / durationFrames);
  const eased = easeOutCubic(t);
  const type = entrance.type;

  let opacity = baseOpacity;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let blur = 0;
  let typewriterChars = null;

  const slidePx = 48;
  const dir = entrance.direction === 'right' ? -1 : 1;
  let rotation = 0;

  switch (type) {
    case 'fadeIn':
      opacity = baseOpacity * eased;
      break;
    case 'slideUp':
      opacity = baseOpacity * eased;
      translateY = (1 - eased) * slidePx;
      break;
    case 'slideDown':
      opacity = baseOpacity * eased;
      translateY = -(1 - eased) * slidePx;
      break;
    case 'slideLeft':
      opacity = baseOpacity * eased;
      translateX = (1 - eased) * slidePx * dir;
      break;
    case 'slideRight':
      opacity = baseOpacity * eased;
      translateX = -(1 - eased) * slidePx * dir;
      break;
    case 'wipe':
      opacity = baseOpacity * eased;
      translateX = (1 - eased) * slidePx * 1.2 * dir;
      break;
    case 'succession':
      opacity = baseOpacity * eased;
      scale = 0.88 + 0.12 * eased;
      translateY = (1 - eased) * 28;
      break;
    case 'breathe':
      opacity = baseOpacity * Math.min(1, eased * 1.1);
      scale = 0.92 + 0.08 * Math.sin(eased * Math.PI);
      break;
    case 'baseline':
      opacity = baseOpacity * eased;
      translateY = (1 - eased) * 44;
      break;
    case 'drift':
      opacity = baseOpacity * eased;
      translateX = -(1 - eased) * slidePx * 0.7 * dir;
      translateY = (1 - eased) * 14;
      break;
    case 'tectonic':
      opacity = baseOpacity * eased;
      scale = 0.9 + 0.1 * eased;
      translateX = (1 - eased) * slidePx * 0.55 * dir;
      break;
    case 'tumble':
      opacity = baseOpacity * eased;
      scale = 0.72 + 0.28 * eased;
      rotation = (1 - eased) * -28 * dir;
      break;
    case 'neon':
      opacity = baseOpacity * eased;
      blur = (1 - eased) * 5;
      scale = 0.97 + 0.03 * eased;
      break;
    case 'scrapbook':
      opacity = baseOpacity * eased;
      rotation = (1 - eased) * 10 * dir;
      scale = 0.94 + 0.06 * eased;
      break;
    case 'stomp':
      opacity = baseOpacity * Math.min(1, eased * 1.25);
      scale = eased < 0.45 ? 1.2 - eased * 0.35 : 1.04 - (eased - 0.45) * 0.08;
      break;
    case 'rotate':
      opacity = baseOpacity * eased;
      rotation = (1 - eased) * 180 * dir;
      break;
    case 'flicker':
      opacity =
        baseOpacity *
        (eased < 0.12 ? eased / 0.12 : 0.55 + 0.45 * Math.abs(Math.sin(eased * 20 * Math.PI)));
      break;
    case 'pulse':
      opacity = baseOpacity * eased;
      scale =
        eased > 0.4 ? 1 + 0.07 * Math.sin((eased - 0.4) * Math.PI * 5) : 0.94 + 0.06 * (eased / 0.4);
      break;
    case 'wiggle':
      opacity = baseOpacity * eased;
      translateX = Math.sin(eased * Math.PI * 6) * (1 - eased) * 18 * dir;
      break;
    case 'zoomIn':
      opacity = baseOpacity * eased;
      scale = 0.85 + 0.15 * eased;
      break;
    case 'zoomOut':
      opacity = baseOpacity * eased;
      scale = 1.12 - 0.12 * eased;
      break;
    case 'pop':
      opacity = baseOpacity * Math.min(1, eased * 1.2);
      scale = eased < 0.6 ? 0.7 + (eased / 0.6) * 0.35 : 1.05 - (eased - 0.6) * 0.08;
      break;
    case 'blurIn':
      opacity = baseOpacity * eased;
      blur = (1 - eased) * 8;
      break;
    case 'kenBurns':
      opacity = baseOpacity * Math.min(1, eased * 1.5);
      scale = 1 + eased * 0.08;
      break;
    case 'typewriter':
    case 'wordFade':
      opacity = baseOpacity;
      scale = 1;
      break;
    case 'ascend':
      opacity = baseOpacity * eased;
      translateY = (1 - eased) * 56;
      break;
    case 'shift':
      opacity = baseOpacity * eased;
      translateX = (1 - eased) * -40;
      break;
    case 'merge':
      opacity = baseOpacity * eased;
      scale = 0.55 + 0.45 * eased;
      break;
    case 'block':
      opacity = baseOpacity * Math.min(1, eased * 1.4);
      scale = 1;
      break;
    case 'burst':
      opacity = baseOpacity * Math.min(1, eased * 1.3);
      scale = eased < 0.55 ? 0.4 + (eased / 0.55) * 0.75 : 1.15 - (eased - 0.55) * 0.27;
      break;
    default:
      opacity = baseOpacity * eased;
  }

  let blockReveal = null;
  if (type === 'block') {
    blockReveal = eased;
  }

  if (type === 'typewriter' || type === 'wordFade') {
    const text =
      typeof clip.content === 'object' && clip.content?.text != null
        ? String(clip.content.text)
        : String(clip.content ?? '');
    const total = text.length;
    typewriterChars = Math.floor(eased * total);
  }

  return {
    opacity,
    scale,
    translateX,
    translateY,
    blur,
    rotation,
    typewriterChars,
    blockReveal,
    visible: opacity > 0.01 || (typewriterChars != null && typewriterChars > 0),
  };
}

export function getAnimatedTextContent(clip, typewriterChars, getClipTextContent) {
  if (typewriterChars == null) {
    return getClipTextContent ? getClipTextContent(clip) : '';
  }
  const text =
    typeof clip.content === 'object' && clip.content?.text != null
      ? String(clip.content.text)
      : String(clip.content ?? '');
  if (getEntranceAnimation(clip)?.type === 'wordFade') {
    const words = text.split(/(\s+)/);
    let charBudget = typewriterChars;
    let out = '';
    for (const w of words) {
      if (charBudget <= 0) break;
      if (charBudget >= w.length) {
        out += w;
        charBudget -= w.length;
      } else {
        out += w.slice(0, charBudget);
        charBudget = 0;
      }
    }
    return out;
  }
  return text.slice(0, typewriterChars);
}
