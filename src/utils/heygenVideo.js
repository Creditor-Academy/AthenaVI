import { isBackgroundClip, normalizeClipStack } from './editorLayerUtils'

const HEYGEN_POLL_INTERVAL_MS = 2000
const HEYGEN_POLL_MAX_ATTEMPTS = 60

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isHeygenVideoFailed(videoData) {
  const status = videoData?.status
  return status === 'failed' || status === 'error'
}

/** True when the authenticated /stream endpoint can serve the avatar video. */
export function isHeygenVideoPlaybackReady(videoData) {
  return !!videoData?.playbackReady
}

/**
 * Poll until playbackReady (do not wait for s3Key).
 * Uses ?sync=status — never sync=full for canvas polling.
 */
export async function pollUntilHeygenPlaybackReady(
  workspaceId,
  projectId,
  heygenVideoId,
  heygenService,
  { intervalMs = HEYGEN_POLL_INTERVAL_MS, maxAttempts = HEYGEN_POLL_MAX_ATTEMPTS, onProgress } = {}
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const videoData = await heygenService.getVideo(workspaceId, projectId, heygenVideoId, {
      sync: 'status',
    })

    if (isHeygenVideoFailed(videoData)) {
      throw new Error('Avatar video generation failed')
    }

    if (isHeygenVideoPlaybackReady(videoData)) {
      return videoData
    }

    onProgress?.(videoData, attempt)
    await sleep(intervalMs)
  }

  throw new Error('Avatar video generation timed out')
}

function isNonDefaultAvatarPlacement(clip, resolution) {
  if (!clip?.position || !clip?.size) return false
  const x = clip.position.x ?? 0
  const y = clip.position.y ?? 0
  const w = clip.size.width ?? 0
  const h = clip.size.height ?? 0
  if (x === 50 && y === 50) return false
  const c = getCenteredAvatarPlacement(resolution)
  const nearCenter =
    Math.abs(x - c.position.x) < 12 &&
    Math.abs(y - c.position.y) < 12 &&
    Math.abs(w - c.size.width) < 24 &&
    Math.abs(h - c.size.height) < 24
  return !nearCenter
}

/** Centered presenter box for the virtual 1920×1080 canvas (top-left origin). */
export function getCenteredAvatarPlacement(resolution = { width: 1920, height: 1080 }) {
  const w = Math.max(1, resolution?.width || 1920)
  const h = Math.max(1, resolution?.height || 1080)
  const avatarW = Math.round(Math.min(w * 0.32, 560))
  const avatarH = Math.round(Math.min(h * 0.72, h * 0.85))
  return {
    position: {
      x: Math.round((w - avatarW) / 2),
      y: Math.round((h - avatarH) / 2),
    },
    size: { width: avatarW, height: avatarH },
  }
}

/**
 * Insert or update the HeyGen presenter clip without removing other scene layers.
 * New clips are centered; existing clips keep position, size, style, fit, and effects.
 */
export function applyGeneratedHeygenToClips(
  clips = [],
  { videoUrl, resolution, sceneDuration, scene, buildContent, forceCenter = false }
) {
  if (!videoUrl) return clips

  const centered = getCenteredAvatarPlacement(resolution)
  const duration = sceneDuration ?? 8
  let next = [...clips]
  const idx = next.findIndex(isAvatarClip)

  const mergeVideoIntoClip = (existing) => {
    const hadCustomLayout =
      !forceCenter &&
      existing &&
      (existing._userPlaced || isNonDefaultAvatarPlacement(existing, resolution))

    const merged = {
      ...existing,
      type: 'video',
      role: 'avatar',
      src: videoUrl,
      startTime: existing?.startTime ?? 0,
      endTime: duration,
      opacity: existing?.opacity ?? 1,
      style: {
        ...(existing?.style || {}),
        objectFit: existing?.style?.objectFit || existing?.objectFit || 'contain',
      },
      content: buildContent
        ? buildContent(scene, {
            ...existing,
            src: videoUrl,
            type: 'video',
            role: 'avatar',
          })
        : existing?.content,
    }

    if (!hadCustomLayout) {
      merged.position = centered.position
      merged.size = centered.size
    }

    if (existing?.isBackground || isBackgroundClip(existing)) {
      merged.isBackground = true
      merged.position = { x: 0, y: 0 }
      merged.size = { width: 1920, height: 1080 }
      merged.style = {
        ...(merged.style || {}),
        objectFit: 'cover',
      }
    }

    return merged
  }

  if (idx >= 0) {
    const updated = mergeVideoIntoClip(next[idx])
    updated.id = next[idx].id
    next = next.filter((_, i) => i !== idx)
    next.push(updated)
  } else {
    next.push({
      id: `clip_avatar_${Date.now()}`,
      layer: next.length,
      ...mergeVideoIntoClip({}),
    })
  }

  return normalizeClipStack(next)
}

/** Ensure each editor scene has a stable, unique HeyGen sceneId for API calls. */
export function ensureSceneIdentity(scene, index = 0) {
  const id = scene?.id || scene?.sceneId || `scene_${Date.now()}_${index}`
  const sceneId = scene?.sceneId || id
  return { ...scene, id, sceneId }
}

export function nextHeygenSceneId(currentSceneId, editorSceneId) {
  const base = String(currentSceneId || editorSceneId || `scene_${Date.now()}`).replace(/_v\d+$/, '')
  return `${base}_v${Date.now()}`
}

export function isAvatarClip(clip) {
  return (
    clip?.role === 'avatar' ||
    clip?.type === 'avatar' ||
    (clip?.type === 'video' && clip?.role === 'avatar')
  )
}

/** Primary avatar layer for a scene (canvas + timeline selection). */
export function findSceneAvatarClip(scene) {
  const clips = scene?.clips || []
  const explicit = clips.find(isAvatarClip)
  if (explicit) return explicit

  const hasPresenter = !!(
    scene?.avatarType ||
    scene?.avatar ||
    scene?.generatedVideoUrl ||
    scene?.heygenVideoId ||
    scene?.heygenStatus
  )
  if (!hasPresenter) return null

  return (
    clips.find(
      (c) =>
        c.type === 'avatar' ||
        c.type === 'video' ||
        c.role === 'avatar' ||
        c.label?.toLowerCase().includes('avatar')
    ) ?? null
  )
}

/** Resolve persisted HeyGen id from scene-level fields or avatar element content. */
export function resolveSceneHeygenVideoId(scene) {
  if (!scene) return null
  if (scene.heygenVideoId) return scene.heygenVideoId
  if (scene.generation?.heygenVideoId) return scene.generation.heygenVideoId

  for (const clip of scene.clips || []) {
    const content = typeof clip?.content === 'object' ? clip.content : null
    if (content?.heygenVideoId) return content.heygenVideoId
  }

  return null
}

/** Generated HeyGen A/V — foreground avatar or avatar sent to scene background. */
export function isHeygenPlaybackClip(clip, scene) {
  if (!resolveSceneHeygenVideoId(scene)) return false
  if (isAvatarClip(clip)) return true
  if (
    isBackgroundClip(clip) &&
    (clip.type === 'video' || clip.type === 'avatar')
  ) {
    return true
  }
  return false
}

export function clipHasHeygenAudio(clip, scene) {
  return isHeygenPlaybackClip(clip, scene)
}

function pickHttpPlaybackUrl(...candidates) {
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue
    if (raw.startsWith('blob:')) continue
    if (/^https?:\/\//i.test(raw)) return raw
  }
  return null
}

/** Resolve playable src for a clip, preferring fresh presigned HeyGen URLs when available. */
export function resolveClipMediaSrc(clip, scene) {
  const scenePlayback = scene?.playbackUrl || scene?.generatedVideoUrl || null

  if (isHeygenPlaybackClip(clip, scene)) {
    const http = pickHttpPlaybackUrl(scene?.playbackUrl, scene?.generatedVideoUrl, clip?.src)
    if (http) return http
    return scenePlayback || clip?.src || null
  }

  const content = typeof clip?.content === 'object' && clip.content ? clip.content : null
  const candidates = [clip?.src, content?.url, content?.src, clip?.fillSrc]

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue
    if (raw.startsWith('blob:')) return raw
    if (/^https?:\/\//i.test(raw)) return raw
  }

  return clip?.src || content?.url || content?.src || null
}

function looksLikeVideoUrl(src) {
  if (!src || typeof src !== 'string') return false
  if (src.startsWith('blob:')) return true
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src)) return true
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(src)) return false
  if (/^https?:\/\//i.test(src)) return true
  return false
}

export function isVideoMedia(clip, src) {
  if (clip?.type === 'video') return true
  if (isAvatarClip(clip) && src) return looksLikeVideoUrl(src)
  return false
}

/** Scene has a generated HeyGen video we can play (audio comes from the video, not TTS). */
export function sceneHasHeygenPlayback(scene) {
  if (scene?.heygenStatus === 'needs_regeneration') return false
  if (!scene?.heygenVideoId) return false
  if (scene.heygenStatus === 'completed' || scene.generation?.status === 'completed') {
    return true
  }
  const url = scene.playbackUrl || scene.generatedVideoUrl
  for (const clip of scene.clips || []) {
    if (isHeygenPlaybackClip(clip, scene) && clip.src && typeof clip.src === 'string') return true
  }
  return !!(url && typeof url === 'string')
}

/** Clear generated HeyGen output after presenter changes (until user regenerates). */
export function invalidateHeygenSceneVideo() {
  return {
    heygenStatus: 'needs_regeneration',
    heygenVideoId: undefined,
    generatedVideoUrl: undefined,
    playbackUrl: undefined,
  }
}

export function sceneNeedsHeygenRegeneration(scene) {
  return scene?.heygenStatus === 'needs_regeneration'
}

/** Attach resolved HeyGen URL to scene + every clip that carries HeyGen A/V. */
export function applyPlaybackUrlToScene(scene, url) {
  if (!url || !scene) return scene
  const clips = (scene.clips || []).map((clip) => {
    if (!isHeygenPlaybackClip(clip, scene)) return clip
    return {
      ...clip,
      src: url,
      type: clip.type === 'avatar' ? 'video' : clip.type,
    }
  })
  return {
    ...scene,
    playbackUrl: url,
    generatedVideoUrl: url,
    clips,
  }
}

/**
 * Fetch a playable URL for a generated HeyGen clip.
 * Backend stores the MP4 in S3; the editor must request a fresh URL on each load.
 * Tries authenticated /stream first, then S3 presigned /download.
 */
export async function fetchHeygenPlaybackUrl(
  workspaceId,
  projectId,
  heygenVideoId,
  heygenService
) {
  try {
    return await heygenService.getVideoBlobUrl(workspaceId, projectId, heygenVideoId)
  } catch (streamErr) {
    console.warn('[HeyGen] /stream failed, trying S3 presigned /download', heygenVideoId, streamErr)
    const download = await heygenService.downloadVideo(workspaceId, projectId, heygenVideoId)
    const presigned =
      download?.presignedUrl ||
      download?.heygenVideo?.presignedUrl ||
      download?.url ||
      download?.videoUrl
    if (presigned && typeof presigned === 'string') return presigned
    throw streamErr
  }
}

/** Resolve session playback via /stream or S3 presigned /download (not the raw s3Key in project JSON). */
export async function resolveScenePlaybackUrl(scene, workspaceId, projectId, heygenService) {
  const heygenVideoId = resolveSceneHeygenVideoId(scene)
  if (!heygenVideoId || !workspaceId || !projectId) return scene

  const sceneWithId = {
    ...scene,
    heygenVideoId,
    generation: {
      ...(scene.generation || {}),
      heygenVideoId,
      status: scene.generation?.status || scene.heygenStatus || 'completed',
    },
  }

  const playbackClips = (sceneWithId.clips || []).filter((c) => isHeygenPlaybackClip(c, sceneWithId))
  const existingUrl = pickHttpPlaybackUrl(
    sceneWithId.playbackUrl,
    sceneWithId.generatedVideoUrl,
    playbackClips.find((c) => c.src)?.src
  )

  if (existingUrl) {
    return applyPlaybackUrlToScene(sceneWithId, existingUrl)
  }

  try {
    const playbackUrl = await fetchHeygenPlaybackUrl(
      workspaceId,
      projectId,
      heygenVideoId,
      heygenService
    )
    return applyPlaybackUrlToScene(sceneWithId, playbackUrl)
  } catch (err) {
    console.warn('[HeyGen] Playback rehydration failed for scene', scene.id, err)
    return sceneWithId
  }
}

export async function resolveScenePlaybackUrls(scenes, workspaceId, projectId, heygenService) {
  if (!scenes?.length) return scenes
  if (!workspaceId || !projectId) return scenes

  return Promise.all(
    scenes.map((scene) => resolveScenePlaybackUrl(scene, workspaceId, projectId, heygenService))
  )
}

function preloadVideoUrl(url, timeoutMs = 45000) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false)
      return
    }
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    if (/^https?:\/\//i.test(url)) {
      video.crossOrigin = 'anonymous'
    }

    let settled = false
    const finish = (ok) => {
      if (settled) return
      settled = true
      video.src = ''
      video.load()
      resolve(ok)
    }

    const timer = setTimeout(() => finish(false), timeoutMs)

    video.addEventListener(
      'canplaythrough',
      () => {
        clearTimeout(timer)
        finish(true)
      },
      { once: true }
    )
    video.addEventListener(
      'error',
      () => {
        clearTimeout(timer)
        finish(false)
      },
      { once: true }
    )

    video.src = url
    video.load()
  })
}

/** Unmute Remotion Player after user-initiated playback. */
export function unmuteRemotionPlayer(player) {
  if (!player) return
  try {
    if (typeof player.unmute === 'function') player.unmute()
    if (typeof player.setVolume === 'function') player.setVolume(1)
  } catch {
    // ignore
  }
}

/** Resolve HeyGen URLs and warm cache before Player / Preview playback. */
export async function prepareScenesForPlayback(
  scenes,
  workspaceId,
  projectId,
  heygenService,
  onProgress
) {
  const list = scenes || []
  const withUrls = await resolveScenePlaybackUrls(
    list,
    workspaceId,
    projectId,
    heygenService
  )
  const heygenCount = withUrls.filter((s) => resolveSceneHeygenVideoId(s)).length
  if (heygenCount > 0) {
    await preloadSceneHeygenVideos(withUrls, onProgress)
  }
  return withUrls
}

export async function preloadSceneHeygenVideos(scenes, onProgress) {
  const urls = [
    ...new Set(
      (scenes || []).flatMap((s) => {
        const list = []
        if (resolveSceneHeygenVideoId(s)) {
          list.push(s.playbackUrl, s.generatedVideoUrl)
        }
        for (const clip of s.clips || []) {
          if (isHeygenPlaybackClip(clip, s)) list.push(clip.src)
        }
        return list.filter((u) => u && typeof u === 'string')
      })
    ),
  ]

  if (!urls.length) {
    onProgress?.({ done: 0, total: 0, label: 'Ready' })
    return
  }

  let done = 0
  const total = urls.length
  onProgress?.({ done: 0, total, label: 'Caching avatar videos…' })

  await Promise.all(
    urls.map(async (url) => {
      await preloadVideoUrl(url)
      done += 1
      onProgress?.({
        done,
        total,
        label: `Caching avatar videos (${done}/${total})…`,
      })
    })
  )
}
