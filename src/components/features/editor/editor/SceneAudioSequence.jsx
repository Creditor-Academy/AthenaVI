import React from 'react';
import { Audio, Sequence } from 'remotion';
import { resolveClipMediaSrc } from '../../../../utils/heygenVideo';
import { buildRemotionAudioVolumeFn } from '../../../../utils/audioVolume';

const SceneAudioSequence = ({ clip, scene, fps, sceneStartFrame }) => {
  const audioSrc = resolveClipMediaSrc(clip, scene);
  if (!audioSrc) return null;

  const clipStartSec = clip.startTime || 0;
  const clipEndSec = clip.endTime ?? scene.duration ?? 5;
  const clipDurationSec = Math.max(0.1, clipEndSec - clipStartSec);
  const clipStart = Math.floor(clipStartSec * fps);
  const clipDuration = Math.max(1, Math.floor(clipDurationSec * fps));
  const globalFrom = sceneStartFrame + clipStart;
  const baseVolume = typeof clip.volume === 'number' ? clip.volume : 1;
  const fadeIn = Number(clip.fadeIn) || 0;
  const fadeOut = Number(clip.fadeOut) || 0;

  const volume = buildRemotionAudioVolumeFn({
    fps,
    durationSec: clipDurationSec,
    baseVolume,
    fadeIn,
    fadeOut,
  });

  return (
    <Sequence
      key={clip.id || `${scene.id}-audio`}
      from={globalFrom}
      durationInFrames={clipDuration}
      layout="none"
    >
      <Audio src={audioSrc} volume={volume} placeholder={null} />
    </Sequence>
  );
};

export default SceneAudioSequence;
