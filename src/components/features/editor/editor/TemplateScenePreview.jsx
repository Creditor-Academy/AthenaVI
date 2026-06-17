import { useEffect, useMemo, useRef, useState } from 'react';
import LiveCanvasRenderer from './LiveCanvasRenderer';
import { prepareTemplateSceneForEditor } from '../../../../utils/templateSceneUtils';
import {
  fetchTemplateAvatarLookSet,
  getCachedTemplateAvatarLookSet,
  TEMPLATE_AVATAR_LOOK_COUNT,
} from '../../../../utils/templateAvatarPreview';

/**
 * WYSIWYG template thumbnail — lazy canvas; HeyGen avatars only when loaded.
 */
const TemplateScenePreview = ({ template, className = '' }) => {
  const rootRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [avatarLookSet, setAvatarLookSet] = useState(
    () => getCachedTemplateAvatarLookSet()?.slice(0, TEMPLATE_AVATAR_LOOK_COUNT) || []
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;
    let cancelled = false;
    fetchTemplateAvatarLookSet(TEMPLATE_AVATAR_LOOK_COUNT).then((looks) => {
      if (!cancelled && looks?.length) setAvatarLookSet(looks);
    });
    return () => {
      cancelled = true;
    };
  }, [isVisible]);

  const previewResolution = useMemo(() => {
    const cw = template?.canvasSize?.width;
    const ch = template?.canvasSize?.height;
    if (!cw || !ch) return undefined;
    if (ch > cw) return { width: 1080, height: 1920 };
    return { width: 1920, height: 1080 };
  }, [template?.canvasSize?.width, template?.canvasSize?.height]);

  const aspectRatio = useMemo(() => {
    const cw = template?.canvasSize?.width ?? 16;
    const ch = template?.canvasSize?.height ?? 9;
    return `${cw} / ${ch}`;
  }, [template?.canvasSize?.width, template?.canvasSize?.height]);

  const scene = useMemo(
    () =>
      template?.clips?.length && isVisible
        ? prepareTemplateSceneForEditor(template, previewResolution, { avatarLookSet })
        : null,
    [template, isVisible, avatarLookSet, previewResolution]
  );

  return (
    <div
      ref={rootRef}
      className={`template-scene-preview ${className}`.trim()}
      style={{
        width: '100%',
        aspectRatio,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
        pointerEvents: 'none',
      }}
    >
      {scene ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <LiveCanvasRenderer scene={scene} overlayMode={false} staticPreview />
        </div>
      ) : null}
    </div>
  );
};

export default TemplateScenePreview;
