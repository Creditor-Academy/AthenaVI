import { normalizeClipStack, normalizeClipsToScene } from './editorLayerUtils';
import { normalizeSceneClips, COMPOSITION_W, COMPOSITION_H } from './clipLayout';

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
  resolution = { width: COMPOSITION_W, height: COMPOSITION_H }
) {
  const duration = template?.duration || 8;
  const base = stripGenerationArtifacts(template);

  let clips = supplementClipsFromZones(
    template,
    JSON.parse(JSON.stringify(template?.clips || []))
  );

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
    clips,
  };
}
