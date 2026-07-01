import { useCallback, useState } from 'react';

/**
 * Text canvas interaction state: edit mode, hover, marquee, ephemeral transforms, smart guides.
 */
export function useTextCanvasInteraction() {
  const [textEditClipId, setTextEditClipId] = useState(null);
  const [hoverClipId, setHoverClipId] = useState(null);
  const [smartGuides, setSmartGuides] = useState([]);
  const [marqueeRect, setMarqueeRect] = useState(null);
  const [dragBadge, setDragBadge] = useState(null);
  const [ephemeralTransform, setEphemeralTransform] = useState(null);

  const enterEditMode = useCallback((clipId) => {
    setTextEditClipId(clipId);
    if (!clipId) {
      setEphemeralTransform(null);
    }
  }, []);

  const exitEditMode = useCallback(() => {
    setTextEditClipId(null);
  }, []);

  const clearEphemeral = useCallback(() => {
    setEphemeralTransform(null);
  }, []);

  return {
    textEditClipId,
    enterEditMode,
    exitEditMode,
    hoverClipId,
    setHoverClipId,
    smartGuides,
    setSmartGuides,
    marqueeRect,
    setMarqueeRect,
    dragBadge,
    setDragBadge,
    ephemeralTransform,
    setEphemeralTransform,
    clearEphemeral,
  };
}

export default useTextCanvasInteraction;
