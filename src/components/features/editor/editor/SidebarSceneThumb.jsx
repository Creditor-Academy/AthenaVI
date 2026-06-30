import React, { useEffect, useRef } from 'react';

/** Static scene thumbnail (no live canvas) for the left scenes list. */
function getSceneBaseStyle(scene) {
  if (scene?.backgroundImage) {
    return {
      backgroundImage: `url(${scene.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  const bg = scene?.background;
  if (bg?.value) {
    const value = String(bg.value);
    if (value.includes('gradient(')) {
      return { backgroundImage: value, backgroundSize: 'cover' };
    }
    return { backgroundColor: value };
  }
  if (typeof bg === 'string') {
    return { backgroundColor: bg };
  }
  return {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
  };
}

function resolveClipVisualSrc(clip) {
  if (!clip || typeof clip !== 'object') return null;
  return (
    clip.src ||
    clip.fillSrc ||
    clip.content?.src ||
    clip.content?.url ||
    clip.content?.previewSrc ||
    null
  );
}

function resolveScenePreview(scene) {
  if (!scene) return null;

  // Prefer a scene background image first (most "scene-like" preview).
  if (typeof scene?.backgroundImage === 'string' && scene.backgroundImage) {
    return { kind: 'image', src: scene.backgroundImage, fit: 'cover' };
  }

  // If a narration-only scene exists, we still want a visual preview of its layers;
  // fall back to top-most image/video layer (skip avatar/presenter layers).
  const clips = Array.isArray(scene.clips) ? scene.clips : [];
  const visual = clips
    .filter((c) => {
      if (!c) return false;
      if (!(c.type === 'image' || c.type === 'video')) return false;
      const role = String(c.role || '').toLowerCase();
      if (role === 'avatar' || role === 'presenter') return false;
      return true;
    })
    .sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0))[0];

  const src = resolveClipVisualSrc(visual);
  if (src) {
    return { kind: visual?.type === 'video' ? 'video' : 'image', src, fit: 'cover' };
  }

  // Then prefer generated / playback media when available (often presenter/avatar video).
  const generated = scene.playbackUrl || scene.generatedVideoUrl;
  if (typeof generated === 'string' && generated) {
    return { kind: 'video', src: generated, fit: 'contain' };
  }

  if (scene?.avatar) {
    return { kind: 'image', src: scene.avatar, fit: 'contain' };
  }

  return null;
}

function buildThumbTextHint(scene) {
  if (!scene) return null;
  const clips = Array.isArray(scene.clips) ? scene.clips : [];
  const t = clips.find((c) => c?.type === 'text' && (typeof c.content === 'string' ? c.content.trim() : false));
  const content = typeof t?.content === 'string' ? t.content.trim() : '';
  if (!content) return null;
  return content.length > 28 ? `${content.slice(0, 28)}…` : content;
}

const SidebarSceneThumb = ({ scene, isActive }) => {
  const preview = resolveScenePreview(scene);
  const hint = buildThumbTextHint(scene);
  const baseStyle = getSceneBaseStyle(scene);
  const videoRef = useRef(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const onLoaded = () => {
      try {
        node.currentTime = 0.01;
        node.pause();
      } catch {
        // ignore
      }
    };
    node.addEventListener('loadeddata', onLoaded);
    return () => node.removeEventListener('loadeddata', onLoaded);
  }, [preview?.src]);

  return (
    <div className="sidebar-scene-thumb sidebar-scene-thumb--static" style={baseStyle} aria-hidden>
      {preview?.src ? (
        preview.kind === 'video' ? (
          <video
            className={`sidebar-scene-thumb__media${preview.fit === 'contain' ? ' sidebar-scene-thumb__media--contain' : ''}`}
            ref={videoRef}
            src={preview.src}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className={`sidebar-scene-thumb__media${preview.fit === 'contain' ? ' sidebar-scene-thumb__media--contain' : ''}`}
            src={preview.src}
            alt=""
            draggable={false}
          />
        )
      ) : null}
      {hint ? <div className="sidebar-scene-thumb__text" aria-hidden>{hint}</div> : null}
      <div className="sidebar-scene-thumb__shade" aria-hidden />
      {scene?.heygenStatus === 'processing' && (
        <div className="sidebar-scene-thumb__processing-overlay">
          <div className="sidebar-scene-thumb__spin" />
          <span className="sidebar-scene-thumb__processing-text">Generating...</span>
        </div>
      )}
      {isActive ? <div className="sidebar-scene-thumb__ring" aria-hidden /> : null}
    </div>
  );
};

export default SidebarSceneThumb;
