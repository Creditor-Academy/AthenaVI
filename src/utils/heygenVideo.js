import { normalizeClipStack } from './editorLayerUtils'

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
 * Avatar is centered and stacked above non-background clips.
 */
export function applyGeneratedHeygenToClips(
  clips = [],
  { videoUrl, resolution, sceneDuration, scene, buildContent }
) {
  if (!videoUrl) return clips

  const { position, size } = getCenteredAvatarPlacement(resolution)
  const duration = sceneDuration ?? 8
  let next = [...clips]
  const idx = next.findIndex(isAvatarClip)

  const baseClip = {
    type: 'video',
    role: 'avatar',
    src: videoUrl,
    startTime: 0,
    endTime: duration,
    opacity: 1,
    position,
    size,
    objectFit: 'contain',
  }

  if (idx >= 0) {
    const existing = next[idx]
    const updated = {
      ...existing,
      ...baseClip,
      id: existing.id,
      content: buildContent
        ? buildContent(scene, { ...existing, ...baseClip })
        : existing.content,
    }
    next = next.filter((_, i) => i !== idx)
    next.push(updated)
  } else {
    next.push({
      id: `clip_avatar_${Date.now()}`,
      layer: next.length,
      ...baseClip,
      content: buildContent ? buildContent(scene, baseClip) : undefined,
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

/** Resolve playable src for a clip, preferring fresh presigned HeyGen URLs when available. */
export function resolveClipMediaSrc(clip, scene) {
  if (isAvatarClip(clip)) {
    const http = pickHttpPlaybackUrl(
      scene?.playbackUrl,
      scene?.generatedVideoUrl,
      clip?.src
    )
    if (http) return http
    return scene?.playbackUrl || scene?.generatedVideoUrl || clip?.src || null
  }
  return clip?.src || null
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
  if (!scene?.heygenVideoId) return false
  const url = scene.playbackUrl || scene.generatedVideoUrl
  return !!(url && typeof url === 'string')
}

function pickHttpPlaybackUrl(...candidates) {
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue
    if (raw.startsWith('blob:')) continue
    if (/^https?:\/\//i.test(raw)) return raw
  }
  return null
}

export async function resolveScenePlaybackUrls(scenes, workspaceId, projectId, heygenService) {
  if (!scenes?.length) return scenes
  if (!workspaceId || !projectId) return scenes

  return Promise.all(
    scenes.map(async (scene) => {
      if (!scene.heygenVideoId) return scene

      const avatarClip = (scene.clips || []).find(isAvatarClip)
      const existing = pickHttpPlaybackUrl(
        scene.playbackUrl,
        scene.generatedVideoUrl,
        avatarClip?.src
      )

      try {
        const data = await heygenService.downloadVideo(
          workspaceId,
          projectId,
          scene.heygenVideoId,
          3600
        )
        const presigned = data?.presignedUrl || data?.url || data?.downloadUrl
        const resolved = pickHttpPlaybackUrl(presigned)
        if (resolved) {
          return { ...scene, playbackUrl: resolved, generatedVideoUrl: resolved }
        }
      } catch (err) {
        console.warn('[HeyGen] Presigned URL failed for scene', scene.id, err)
      }

      if (existing) {
        return { ...scene, playbackUrl: existing, generatedVideoUrl: existing }
      }

      try {
        const streamUrl = heygenService.getStreamUrl(
          workspaceId,
          projectId,
          scene.heygenVideoId
        )
        if (streamUrl) {
          return { ...scene, playbackUrl: streamUrl, generatedVideoUrl: streamUrl }
        }
      } catch (err) {
        console.warn('[HeyGen] Stream URL failed for scene', scene.id, err)
      }

      return scene
    })
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

/**
 * Warm browser cache for HeyGen scene videos before Remotion playback.
 * @param {Function} [onProgress] - ({ done, total, label })
 */
export async function preloadSceneHeygenVideos(scenes, onProgress) {
  const urls = [
    ...new Set(
      (scenes || []).flatMap((s) => {
        const list = []
        if (s?.heygenVideoId) {
          list.push(s.playbackUrl, s.generatedVideoUrl)
        }
        for (const clip of s.clips || []) {
          if (isAvatarClip(clip)) list.push(clip.src)
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
