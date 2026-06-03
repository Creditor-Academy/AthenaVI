import { computeClipAnimationState } from '../utils/clipAnimations';
import { useLayerEntrancePreview } from './useLayerEntrancePreview';

const PREVIEW_FPS = 30;

/** Live canvas / sidebar preview: maps rAF progress → animation state. */
export function useComputedEntranceState(clip) {
  const { entrance, progress } = useLayerEntrancePreview(clip);
  const durationFrames = Math.max(1, Math.round((entrance?.duration || 0.75) * PREVIEW_FPS));
  const frameInClip =
    progress != null ? Math.floor(progress * durationFrames) : durationFrames;

  const animState =
    entrance && entrance.type !== 'none' && progress != null
      ? computeClipAnimationState(frameInClip, PREVIEW_FPS, clip)
      : null;

  return { entrance, animState, progress, previewActive: progress != null };
}
