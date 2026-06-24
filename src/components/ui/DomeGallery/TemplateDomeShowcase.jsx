import { useEffect, useState } from 'react';
import DomeGalleryLazy from './DomeGalleryLazy';
import DomeGalleryFallback from './DomeGalleryFallback';
import './DomeGalleryShell.css';

function usePreferStaticGallery() {
  const [preferStatic, setPreferStatic] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPreferStatic(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return preferStatic;
}

function useIsNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isNarrow;
}

/**
 * Dome gallery with lazy load, reduced-motion fallback, and optional static grid on mobile.
 */
export default function TemplateDomeShowcase({
  images = [],
  onImageClick,
  compact = false,
  borderless = false,
  showDragHint = false,
  overlayBlurColor = '#f8fafc',
  grayscale = false,
  minRadius,
  className = '',
  autoRotate = true,
  autoRotateSpeed = 10,
  interactive = false,
  enableDrag = false,
}) {
  const preferStatic = usePreferStaticGallery();
  const isNarrow = useIsNarrowViewport();
  const useFallback = preferStatic || isNarrow;

  const shellClass = [
    'dome-gallery-shell',
    compact ? 'dome-gallery-shell--compact' : '',
    borderless ? 'dome-gallery-shell--borderless' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!images.length) return null;

  if (useFallback) {
    return (
      <div className={shellClass}>
        <DomeGalleryFallback images={images} onImageClick={interactive ? onImageClick : undefined} />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <DomeGalleryLazy
        images={images}
        onImageClick={onImageClick}
        overlayBlurColor={overlayBlurColor}
        grayscale={grayscale}
        minRadius={minRadius ?? (compact ? 320 : borderless ? 480 : 400)}
        fit={borderless ? 0.55 : compact ? 0.45 : 0.5}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        interactive={interactive}
        enableDrag={enableDrag}
      />
      {showDragHint && interactive ? (
        <p className="dome-gallery-hint">Drag to explore · Click a tile to enlarge</p>
      ) : null}
    </div>
  );
}
