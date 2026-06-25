export function computeAudioVolumeAtTime({
  t = 0,
  duration = 1,
  baseVolume = 1,
  fadeIn = 0,
  fadeOut = 0,
}) {
  const time = Math.max(0, Number(t) || 0);
  const clipDuration = Math.max(0.01, Number(duration) || 0.01);
  let volume = Math.min(1, Math.max(0, Number(baseVolume) || 0));

  const fadeInSec = Math.max(0, Number(fadeIn) || 0);
  const fadeOutSec = Math.max(0, Number(fadeOut) || 0);

  if (fadeInSec > 0 && time < fadeInSec) {
    volume *= time / fadeInSec;
  }

  const fadeOutStart = clipDuration - fadeOutSec;
  if (fadeOutSec > 0 && time > fadeOutStart) {
    volume *= Math.max(0, (clipDuration - time) / fadeOutSec);
  }

  return Math.min(1, Math.max(0, volume));
}

export function buildRemotionAudioVolumeFn({ fps, durationSec, baseVolume, fadeIn, fadeOut }) {
  return (frame) =>
    computeAudioVolumeAtTime({
      t: frame / fps,
      duration: durationSec,
      baseVolume,
      fadeIn,
      fadeOut,
    });
}
