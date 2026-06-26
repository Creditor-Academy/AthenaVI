import { computeClipAnimationState } from '../utils/clipAnimations';
import { useLayerEntrancePreview } from './useLayerEntrancePreview';
import { usePreviewMode } from '../contexts/PreviewModeContext';

const PREVIEW_FPS = 30;

/** Live canvas / sidebar preview: maps rAF progress → animation state. */
export function useComputedEntranceState(clip) {
  const { staticEntrance } = usePreviewMode();
  const { entrance, progress } = useLayerEntrancePreview(clip);
  const delayFrames = Math.round((entrance?.delay || 0) * PREVIEW_FPS);
  const durationFrames = Math.max(1, Math.round((entrance?.duration || 0.75) * PREVIEW_FPS));
  const frameInClip = staticEntrance
    ? delayFrames + durationFrames
    : progress != null
      ? (progress === 0 ? 0 : delayFrames + Math.floor(progress * durationFrames))
      : delayFrames + durationFrames;

  const animState =
    entrance && entrance.type !== 'none' && (staticEntrance || progress != null)
      ? computeClipAnimationState(frameInClip, PREVIEW_FPS, clip)
      : null;

  return { entrance, animState, progress, previewActive: staticEntrance || progress != null };
}
