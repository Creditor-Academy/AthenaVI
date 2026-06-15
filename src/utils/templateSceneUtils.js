import { normalizeClipStack, normalizeClipsToScene } from './editorLayerUtils';
import { normalizeSceneClips, COMPOSITION_W, COMPOSITION_H } from './clipLayout';
import {
  applyAvatarPreviewToClips,
  DARK_SCENE_AVATAR_STYLE,
  DEFAULT_AVATAR_PREVIEW_STYLE,
  resolveTemplateAvatarLook,
} from './templateAvatarPreview';

/** Template zone rects in JSON are authored on a 1280×720 reference frame. */
const ZONE_REF_W = 1280;
const ZONE_REF_H = 720;

function uniqueClipId(prefix = 'clip') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function zoneRectToPixels(
  zone,
  canvas = { width: COMPOSITION_W, height: COMPOSITION_H }
) {
  const cw = canvas.width ?? COMPOSITION_W;
  const ch = canvas.height ?? COMPOSITION_H;
  return {
    position: {
      x: Math.round((Number(zone.x ?? 0) / ZONE_REF_W) * cw),
      y: Math.round((Number(zone.y ?? 0) / ZONE_REF_H) * ch),
    },
    size: {
      width: Math.round((Number(zone.width ?? 0) / ZONE_REF_W) * cw),
      height: Math.round((Number(zone.height ?? 0) / ZONE_REF_H) * ch),
    },
  };
}

function hasClipType(clips, type) {
  return clips.some((c) => c.type === type);
}

function scaleTextStyle(style, scale) {
  if (!style) return style;
  const next = { ...style };
  if (next.fontSize != null) {
    const n = parseFloat(String(next.fontSize));
    if (!Number.isNaN(n)) next.fontSize = Math.round(n * scale);
  }
  return next;
}

/** Scale clip boxes authored on template.canvasSize (e.g. 1280×720) to editor composition pixels. */
function scaleClipFromReference(clip, refW, refH, targetW, targetH) {
  if (!clip || clip._coordsNormalized || clip._userPlaced) return clip;

  const sx = targetW / refW;
  const sy = targetH / refH;
  const typeScale = (sx + sy) / 2;
  const scaled = { ...clip, _coordsNormalized: true };

  if (clip.position) {
    scaled.position = {
      x: Math.round(Number(clip.position.x ?? 0) * sx),
      y: Math.round(Number(clip.position.y ?? 0) * sy),
    };
  }
  if (clip.size) {
    scaled.size = {
      width: Math.round(Number(clip.size.width ?? 0) * sx),
      height: Math.round(Number(clip.size.height ?? 0) * sy),
    };
  }
  if (clip.type === 'text' || clip.content?.text != null) {
    scaled.style = scaleTextStyle(clip.style, typeScale);
  }
  return scaled;
}

function scaleClipsToComposition(clips, template, resolution) {
  const refW = template?.canvasSize?.width ?? ZONE_REF_W;
  const refH = template?.canvasSize?.height ?? ZONE_REF_H;
  const targetW = resolution.width ?? COMPOSITION_W;
  const targetH = resolution.height ?? COMPOSITION_H;

  if (refW === targetW && refH === targetH) {
    return clips.map((clip) => ({ ...clip, _coordsNormalized: true }));
  }

  return clips.map((clip) => scaleClipFromReference(clip, refW, refH, targetW, targetH));
}

/**
 * Add placeholder media/avatar layers when zones define slots but clips omit them.
 * Keeps modal preview and live canvas aligned with the layout metadata.
 */
export function supplementClipsFromZones(template, clips = []) {
  const zones = template?.zones;
  if (!zones) return [...clips];

  const duration = template.duration || 8;
  const extras = [];

  const isGridWithColumns =
    template?.layoutType === 'Grid' &&
    (hasClipType(clips, 'shape') || clips.filter((c) => c.role?.includes('service')).length >= 3);

  if (zones.image && !hasClipType(clips, 'image') && !isGridWithColumns) {
    const { position, size } = zoneRectToPixels(zones.image);
    extras.push({
      id: uniqueClipId('zone_image'),
      type: 'image',
      role: 'media-showcase',
      editable: true,
      position,
      size,
      startTime: 0,
      endTime: duration,
      _coordsNormalized: true,
      layer: 0,
    });
  }

  if (zones.avatar && !hasClipType(clips, 'avatar')) {
    const { position, size } = zoneRectToPixels(zones.avatar);
    extras.push({
      id: uniqueClipId('zone_avatar'),
      type: 'avatar',
      role: 'avatar',
      editable: true,
      position,
      size,
      startTime: 0,
      endTime: duration,
      _coordsNormalized: true,
      layer: extras.length + 1,
    });
  }

  return [...extras, ...clips];
}

export function stripGenerationArtifacts(scene) {
  const next = { ...scene };
  delete next.heygenVideoId;
  delete next.generatedVideoUrl;
  delete next.playbackUrl;
  delete next.heygenStatus;
  delete next.generation;
  return next;
}

/**
 * Normalize a JSON template scene for editor canvas + Remotion playback.
 * Used when adding a scene and when rendering template thumbnails.
 */
export function prepareTemplateSceneForEditor(
  template,
  resolution = { width: COMPOSITION_W, height: COMPOSITION_H },
  options = {}
) {
  const duration = template?.duration || 8;
  const base = stripGenerationArtifacts(template);
  const sceneLookIndex = Math.max(0, (template?.slideIndex ?? 1) - 1);
  const isDarkScene =
    template?.background?.value === '#0a0a0a' ||
    String(template?.tags || []).includes('closing') ||
    (template?.title || '').toLowerCase().includes('cta');

  let clips = supplementClipsFromZones(
    template,
    JSON.parse(JSON.stringify(template?.clips || []))
  );

  const avatarLook = resolveTemplateAvatarLook(template, sceneLookIndex, options);
  if (avatarLook?.id) {
    clips = applyAvatarPreviewToClips(
      clips,
      avatarLook,
      isDarkScene ? DARK_SCENE_AVATAR_STYLE : DEFAULT_AVATAR_PREVIEW_STYLE,
      sceneLookIndex
    );
  }

  clips = scaleClipsToComposition(clips, template, resolution);

  clips = clips.map((clip, idx) => ({
    ...clip,
    id: uniqueClipId('clip'),
    layer: clip.layer ?? idx + 1,
  }));

  clips = normalizeClipStack(clips);
  clips = normalizeSceneClips(clips, resolution);
  clips = normalizeClipsToScene(clips, duration);

  return {
    ...base,
    duration,
    templateLookIndex: sceneLookIndex,
    presenter: avatarLook,
    clips,
  };
}
