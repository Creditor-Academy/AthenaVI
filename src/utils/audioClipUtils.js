import { resolveClipMediaSrc } from './heygenVideo';

export const SCENE_MUSIC_ROLES = new Set(['scene-audio', 'background-music']);

export function isSceneMusicClip(clip) {
  if (!clip || clip.type !== 'audio') return false;
  const role = String(clip.role || '').toLowerCase();
  if (role === 'narration' || role === 'voiceover') return false;
  if (!role || SCENE_MUSIC_ROLES.has(role)) return true;
  return !clip.role;
}

export function findSceneMusicClip(scene) {
  if (!scene?.clips?.length) return null;
  return (
    scene.clips.find((c) => isSceneMusicClip(c) && c.role === 'scene-audio') ||
    scene.clips.find((c) => isSceneMusicClip(c)) ||
    null
  );
}

export function resolveAudioClipSrc(clip, scene) {
  return resolveClipMediaSrc(clip, scene);
}

export function getAudioClipDisplayName(clip, audioSrc) {
  if (clip?.label) return clip.label;
  if (clip?.name) return clip.name;
  const src = audioSrc || clip?.src || clip?.content?.url;
  if (src) return String(src).split('/').pop()?.split('?')[0] || 'Audio';
  return 'Audio clip';
}

export function getAudioClipDurationSec(clip) {
  const start = Number(clip?.startTime) || 0;
  const end = Number(clip?.endTime ?? clip?.duration);
  if (Number.isFinite(end) && end > start) return end - start;
  if (Number.isFinite(Number(clip?.duration))) return Number(clip.duration);
  return 8;
}

export function buildSceneMusicClip({
  src,
  assetId,
  sceneDuration = 8,
  name = 'Background music',
  volume = 1,
  startTime = 0,
  fadeIn = 0,
  fadeOut = 0,
}) {
  const duration = Math.max(0.1, Number(sceneDuration) || 8);
  const id = `clip_audio_${Date.now()}`;
  const content = {
    mediaType: 'audio',
    ...(assetId ? { assetId } : {}),
    ...(src ? { url: src } : {}),
  };

  return {
    id,
    type: 'audio',
    role: 'scene-audio',
    label: name,
    src: src || null,
    content,
    layer: 0,
    startTime: Math.max(0, startTime),
    endTime: duration,
    duration,
    volume: Math.min(1, Math.max(0, Number(volume) || 1)),
    fadeIn: Math.max(0, Number(fadeIn) || 0),
    fadeOut: Math.max(0, Number(fadeOut) || 0),
    visible: true,
  };
}
