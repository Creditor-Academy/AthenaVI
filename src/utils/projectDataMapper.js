import heygenService from '../services/heygenService';
import { buildHeygenAvatarContent, getSceneAvatarKind, getSceneAvatarLookId } from './heygenAvatars';
import { getClipTextContent, isTextLayer, parseFontSize } from './textClip';

const FPS = 30;

function isEphemeralUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('blob:') || url.includes('X-Amz-');
}

function clipDurationSeconds(clip) {
  if (clip.endTime != null && clip.startTime != null) {
    return Math.max(0.1, clip.endTime - clip.startTime);
  }
  return clip.duration || 5;
}

function sanitizeContent(content) {
  if (!content || typeof content !== 'object') return content;
  const next = { ...content };
  if (next.src && isEphemeralUrl(next.src)) delete next.src;
  if (next.url && isEphemeralUrl(next.url)) delete next.url;
  if (next.previewSrc && isEphemeralUrl(next.previewSrc)) delete next.previewSrc;
  if (next.generatedVideoUrl) delete next.generatedVideoUrl;
  return next;
}

/** Backend V2 text style shape */
export function normalizeTextStyle(style = {}) {
  const normalized = {
    fontFamily: style.fontFamily || 'Inter, sans-serif',
    fontSize: parseFontSize(style.fontSize, 32),
    fontWeight: String(style.fontWeight ?? '700'),
    fontStyle: style.fontStyle || 'normal',
    textTransform: style.textTransform || 'none',
    color: style.color || '#0f172a',
    backgroundColor: style.backgroundColor ?? 'transparent',
    textAlign: style.textAlign || 'left',
    lineHeight: style.lineHeight ?? 1.2,
    letterSpacing:
      style.letterSpacing == null || style.letterSpacing === 'normal'
        ? '0px'
        : style.letterSpacing,
    padding: style.padding ?? '0px',
  };

  if (style.textDecoration && style.textDecoration !== 'none') {
    normalized.textDecoration = style.textDecoration;
  }
  if (style.borderRadius) normalized.borderRadius = style.borderRadius;
  if (style.boxShadow) normalized.boxShadow = style.boxShadow;

  return normalized;
}

function normalizeBackground(background) {
  if (!background) return { type: 'color', value: '#ffffff' };
  if (typeof background === 'string') return { type: 'color', value: background };
  if (typeof background === 'object') {
    if (background.type && background.value != null) return background;
    if (background.value) return { type: background.type || 'color', value: background.value };
  }
  return { type: 'color', value: '#ffffff' };
}

function sanitizeStyle(style = {}, type = 'text') {
  if (!style || typeof style !== 'object') return undefined;
  const next = { ...style };
  // Drop editor-only / non-persisted keys
  delete next.width;
  delete next.height;
  delete next.zIndex;
  if (type === 'text') return normalizeTextStyle(next);
  return Object.keys(next).length ? next : undefined;
}

function buildMediaContent(clip) {
  const raw =
    typeof clip.content === 'object' && clip.content !== null ? { ...clip.content } : {};
  const cleaned = sanitizeContent(raw);

  if (cleaned.assetId) {
    return {
      assetId: cleaned.assetId,
      mediaType: cleaned.mediaType || clip.type || 'image',
    };
  }

  const src = cleaned.src || cleaned.url || clip.src;
  if (src && !isEphemeralUrl(src)) {
    return {
      src,
      mediaType: cleaned.mediaType || clip.type || 'image',
    };
  }

  return { mediaType: cleaned.mediaType || clip.type || 'image' };
}

function buildElementContent(clip, scene) {
  if (isTextLayer(clip)) return buildTextContent(clip);

  const isAvatarClip = clip.type === 'avatar' || clip.role === 'avatar';
  if (isAvatarClip) {
    return sanitizeContent(
      buildHeygenAvatarContent({ ...scene, sceneId: scene.sceneId || scene.id }, clip)
    );
  }

  if (clip.type === 'audio') return buildMediaContent({ ...clip, type: 'audio' });
  if (clip.type === 'shape') {
    return {
      shape: clip.content?.shape || clip.shape || 'rect',
      ...(typeof clip.content === 'object' && clip.content !== null ? sanitizeContent(clip.content) : {}),
    };
  }
  if (clip.type === 'image' || clip.type === 'video') return buildMediaContent(clip);

  if (typeof clip.content === 'object' && clip.content !== null) {
    const cleaned = sanitizeContent(clip.content);
    if (Object.keys(cleaned).length) return cleaned;
  }

  if (clip.src && !isEphemeralUrl(clip.src)) {
    return { src: clip.src, mediaType: clip.type || 'image' };
  }

  return { mediaType: clip.type || 'image' };
}

function buildTextContent(clip) {
  if (typeof clip.content === 'object' && clip.content !== null && clip.content.text != null) {
    return { text: String(clip.content.text) };
  }
  if (typeof clip.content === 'string') {
    return { text: clip.content };
  }
  return { text: String(clip.src ?? '') };
}

function readClipTiming(clip) {
  const startFrame = Math.max(
    0,
    Math.round(clip.timing?.startFrame ?? clip.startFrame ?? (clip.startTime || 0) * FPS)
  );
  const durationInFrames = Math.max(
    1,
    Math.round(
      clip.timing?.durationInFrames ??
        clip.durationInFrames ??
        clipDurationSeconds(clip) * FPS
    )
  );
  return { startFrame, durationInFrames };
}

function readClipPlacement(clip) {
  const p = clip.placement || {};
  return {
    x: Number(clip.position?.x ?? p.x ?? 0),
    y: Number(clip.position?.y ?? p.y ?? 0),
    width: Math.max(1, Number(clip.size?.width ?? p.width ?? 100)),
    height: Math.max(1, Number(clip.size?.height ?? p.height ?? 100)),
    rotation: Number(clip.rotation ?? p.rotation ?? 0),
    scale: clip.scale ?? p.scale ?? 1,
    opacity: clip.opacity ?? p.opacity ?? 1,
  };
}

function textClipToElement(clip, cIdx) {
  const { startFrame, durationInFrames } = readClipTiming(clip);
  const element = {
    id: String(clip.id || `clip_${cIdx}`),
    type: 'text',
    layer: clip.layer ?? 0,
    visible: clip.visible !== false,
    startFrame,
    durationInFrames,
    timing: { startFrame, durationInFrames },
    placement: readClipPlacement(clip),
    content: buildTextContent(clip),
    style: normalizeTextStyle(clip.style),
    animations: clip.animations ?? [],
  };

  if (clip.role) element.role = clip.role;
  return element;
}

function clipToElement(clip, scene, cIdx) {
  if (isTextLayer(clip)) {
    return textClipToElement(clip, cIdx);
  }

  const { startFrame, durationInFrames } = readClipTiming(clip);
  const content = buildElementContent(clip, scene);

  const element = {
    id: String(clip.id || `clip_${cIdx}`),
    type: ['avatar', 'text', 'image', 'video', 'audio', 'shape', 'subtitle'].includes(clip.type)
      ? clip.type
      : 'image',
    layer: clip.layer ?? 0,
    startFrame,
    durationInFrames,
    timing: { startFrame, durationInFrames },
    placement: readClipPlacement(clip),
    content,
    animations: clip.animations ?? [],
  };

  if (clip.role) element.role = clip.role;
  const style = sanitizeStyle(clip.style, clip.type);
  if (style) element.style = style;
  const filters = clip.filters || clip.cssFilters;
  if (filters) element.filters = filters;
  if (clip.visible !== undefined) element.visible = clip.visible;

  return element;
}

function buildPresenter(scene) {
  const avatarId = getSceneAvatarLookId(scene);
  const hasPresenterData =
    avatarId || scene.voiceId || scene.script || scene.avatarName || scene.presenter;

  if (!hasPresenterData) return undefined;

  const base = scene.presenter || {};
  const presenter = {
    avatarId: avatarId || base.avatarId,
    avatarName: scene.avatarName || base.avatarName,
    avatarType: getSceneAvatarKind(scene),
    avatarEngine: scene.avatarEngine || base.avatarEngine || 'avatar_iv',
    voiceId: scene.voiceId || base.voiceId,
    voiceName: scene.voiceName || base.voiceName,
    script: scene.script ?? base.script ?? '',
  };

  const preview = scene.avatar || base.avatarPreviewSrc;
  if (preview && !isEphemeralUrl(preview)) {
    presenter.avatarPreviewSrc = preview;
  }

  const voiceSettings = scene.voiceSettings || base.voiceSettings;
  if (voiceSettings) {
    presenter.voiceSettings = {
      speed: voiceSettings.speed ?? 1,
      pitch: voiceSettings.pitch ?? 0,
      ...(voiceSettings.locale ? { locale: voiceSettings.locale } : {}),
    };
  }

  return presenter;
}

function buildGeneration(scene) {
  const avatarClip = (scene.clips || []).find((c) => c.role === 'avatar' || c.type === 'avatar');
  const avatarContent =
    typeof avatarClip?.content === 'object' ? avatarClip.content : {};

  const heygenVideoId =
    scene.heygenVideoId ||
    scene.generation?.heygenVideoId ||
    avatarContent.heygenVideoId;

  if (!heygenVideoId && !scene.heygenStatus && !scene.generation) return undefined;

  return {
    status: scene.heygenStatus || scene.generation?.status || 'pending',
    heygenVideoId: heygenVideoId || undefined,
  };
}

export function toBackendProjectData(projectState) {
  const meta = { ...(projectState.meta || {}) };
  if (projectState.createConfig?.tags?.length) {
    meta.tags = projectState.createConfig.tags;
  }
  if (!meta.aspectRatio && projectState.resolution) {
    const { width, height } = projectState.resolution;
    meta.aspectRatio = width === height ? '1:1' : width > height ? '16:9' : '9:16';
  }

  const data = {
    videoSettings: {
      width: projectState.resolution?.width || 1920,
      height: projectState.resolution?.height || 1080,
      fps: FPS,
      backgroundColor: projectState.videoSettings?.backgroundColor || '#000000',
    },
    scenes: (projectState.scenes || []).map((scene, idx) => {
      const sceneId = scene.sceneId || scene.id || `scene_${idx}`;
      const isRenderableElement = (el) => {
        if (!el) return false;
        if (el.type !== 'image' && el.type !== 'video' && el.type !== 'audio') return true;
        const content = el.content;
        const src =
          el.src ||
          (typeof content === 'object' && content !== null ? (content.src || content.url) : null) ||
          (typeof content === 'string' ? content : null);
        const assetId = typeof content === 'object' && content !== null ? content.assetId : null;
        return !!(assetId || (src && !isEphemeralUrl(src)));
      };
      const scenePayload = {
        sceneId,
        name: scene.title || scene.name || `Scene ${idx + 1}`,
        durationInFrames: Math.max(1, Math.round((scene.duration || 8) * FPS)),
        background: normalizeBackground(scene.background),
        elements: (scene.clips || [])
          .map((clip, cIdx) => clipToElement(clip, { ...scene, sceneId }, cIdx))
          .filter(isRenderableElement),
      };

      if (scene.transition?.type && scene.transition.type !== 'none') {
        scenePayload.transition = {
          type: scene.transition.type,
          durationInFrames: Math.max(
            0,
            Math.round((scene.transition.duration ?? 0.5) * FPS)
          ),
          ...(scene.transition.direction ? { direction: scene.transition.direction } : {}),
        };
      }

      const presenter = buildPresenter(scene);
      const generation = buildGeneration(scene);
      if (presenter) scenePayload.presenter = presenter;
      if (generation?.heygenVideoId) scenePayload.generation = generation;

      return scenePayload;
    }),
  };

  if (Object.keys(meta).length > 0) data.meta = meta;

  return { data };
}

function elementToClip(element) {
  const startFrame = element.timing?.startFrame ?? element.startFrame ?? 0;
  const durationInFrames = element.timing?.durationInFrames ?? element.durationInFrames ?? FPS;
  const startTime = startFrame / FPS;
  const duration = durationInFrames / FPS;
  const placement = element.placement || {};

  const content = element.content;
  let src = element.src;

  if (typeof content === 'object' && content !== null) {
    if (content.src && !isEphemeralUrl(content.src)) src = content.src;
    else if (content.previewSrc) src = content.previewSrc;
  } else if (typeof content === 'string') {
    src = content;
  }

  const clip = {
    id: element.id,
    type: element.type,
    layer: element.layer ?? 0,
    startTime,
    endTime: startTime + duration,
    duration,
    startFrame,
    durationInFrames,
    position: { x: placement.x ?? element.position?.x ?? 0, y: placement.y ?? element.position?.y ?? 0 },
    size: {
      width: placement.width ?? element.size?.width ?? 100,
      height: placement.height ?? element.size?.height ?? 100,
    },
    rotation: placement.rotation ?? element.rotation ?? 0,
    scale: placement.scale ?? element.scale ?? 1,
    opacity: placement.opacity ?? element.opacity ?? 1,
    content,
    src,
  };

  if (element.role) clip.role = element.role;
  if (element.style) clip.style = { ...element.style };
  if (element.filters) clip.filters = element.filters;
  if (element.animations) clip.animations = element.animations;
  if (element.visible !== undefined) clip.visible = element.visible;

  if (isTextLayer(clip)) {
    clip.type = 'text';
    clip.content =
      typeof clip.content === 'object' && clip.content !== null
        ? { text: getClipTextContent(clip) }
        : { text: String(clip.content ?? '') };
    clip.style = normalizeTextStyle(clip.style);
  }

  return clip;
}

export function sceneFromBackend(scene) {
  const presenter = scene.presenter || {};
  const generation = scene.generation || {};
  const avatarClip = (scene.elements || scene.clips || []).find(
    (e) => e.role === 'avatar' || e.type === 'avatar'
  );
  const avatarContent = typeof avatarClip?.content === 'object' ? avatarClip.content : {};

  const lookId = presenter.avatarId || avatarContent.avatarId;
  const heygenVideoId =
    generation.heygenVideoId || avatarContent.heygenVideoId || scene.heygenVideoId;

  return {
    ...scene,
    sceneId: scene.sceneId || scene.id,
    id: scene.sceneId || scene.id,
    title: scene.name || scene.title || 'Scene',
    duration: scene.durationInFrames ? scene.durationInFrames / FPS : scene.duration || 8,
    avatar: presenter.avatarPreviewSrc || scene.avatar || avatarContent.previewSrc,
    avatarLookId: lookId,
    avatarType: lookId || scene.avatarType,
    avatarKind: presenter.avatarType || scene.avatarKind,
    avatarName: presenter.avatarName || scene.avatarName,
    voiceId: presenter.voiceId || avatarContent.voiceId || scene.voiceId,
    voiceName: presenter.voiceName || scene.voiceName,
    voiceSettings: presenter.voiceSettings || scene.voiceSettings,
    script: presenter.script ?? avatarContent.script ?? scene.script ?? '',
    heygenVideoId,
    heygenStatus: generation.status || scene.heygenStatus,
    presenter,
    generation,
    clips: (scene.elements || scene.clips || []).map(elementToClip),
  };
}

export function fromBackendProjectData(data, overrides = {}) {
  const videoSettings = data?.videoSettings || {};
  return {
    resolution: {
      width: videoSettings.width || 1920,
      height: videoSettings.height || 1080,
    },
    videoSettings,
    meta: data?.meta,
    scenes: (data?.scenes || []).map(sceneFromBackend),
    ...overrides,
  };
}

export async function rehydrateSceneVideos(scenes, workspaceId, projectId) {
  if (!workspaceId || !projectId || !scenes?.length) return scenes;

  return Promise.all(
    scenes.map(async (scene) => {
      if (!scene.heygenVideoId) return scene;

      try {
        const blobUrl = await heygenService.getVideoBlobUrl(
          workspaceId,
          projectId,
          scene.heygenVideoId
        );
        return {
          ...scene,
          generatedVideoUrl: blobUrl,
          heygenStatus: scene.heygenStatus || 'completed',
        };
      } catch (err) {
        console.warn(
          '[ProjectData] Failed to rehydrate HeyGen video for scene',
          scene.sceneId || scene.id,
          err
        );
        return scene;
      }
    })
  );
}
