import { useState, useEffect } from 'react';
import { getEntranceAnimation } from '../utils/clipAnimations';

/** Drives live canvas preview while the timeline is paused. */
export function useLayerEntrancePreview(clip) {
  const [progress, setProgress] = useState(null);
  const entrance = getEntranceAnimation(clip);
  const animKey = JSON.stringify(clip?.animations ?? []);

  useEffect(() => {
    const ent = getEntranceAnimation(clip);
    if (!ent || ent.type === 'none') {
      setProgress(null);
      return undefined;
    }
    const durationMs = Math.max(400, (ent.duration || 0.75) * 1000);
    const delayMs = Math.max(0, (ent.delay || 0) * 1000);
    let raf = 0;
    let start = 0;
    setProgress(0);

    const tick = (now) => {
      if (!start) start = now;
      const elapsed = now - start - delayMs;
      if (elapsed < 0) {
        setProgress(0);
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / durationMs);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animKey]);

  return { entrance, progress };
}
