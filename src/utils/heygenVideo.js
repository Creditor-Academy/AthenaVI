import { normalizeClipStack } from './editorLayerUtils'

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
  if (isAvatarClip(clip)) {
    const http = pickHttpPlaybackUrl(
      scene?.playbackUrl,
      scene?.generatedVideoUrl,
      clip?.src
    )
    if (http) return http
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
  if (isAvatarClip(clip) && src) return looksLikeVideoUrl(src)
  return false
}

/** Scene has a generated HeyGen video we can play (audio comes from the video, not TTS). */
export function sceneHasHeygenPlayback(scene) {
  if (scene?.heygenStatus === 'needs_regeneration') return false
  if (!scene?.heygenVideoId) return false
  const url = scene.playbackUrl || scene.generatedVideoUrl
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

/** Attach resolved HeyGen URL to scene + avatar clip so every scene can play audio. */
export function applyPlaybackUrlToScene(scene, url) {
  if (!url || !scene) return scene
  const clips = (scene.clips || []).map((clip) => {
    if (!isAvatarClip(clip)) return clip
    return {
      ...clip,
      src: url,
      type: clip.type === 'avatar' ? 'video' : clip.type,
      role: 'avatar',
    }
  })
  return {
    ...scene,
    playbackUrl: url,
    generatedVideoUrl: url,
    clips,
  }
}

export async function resolveScenePlaybackUrls(scenes, workspaceId, projectId, heygenService) {
  if (!scenes?.length) return scenes
  if (!workspaceId || !projectId) return scenes
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

      const avatarClip = (scene.clips || []).find(isAvatarClip)
      const existing = pickHttpPlaybackUrl(
        scene.playbackUrl,
        scene.generatedVideoUrl,
        avatarClip?.src
      )

      try {
        const data = await heygenService.downloadVideo(
        const data = await heygenService.downloadVideo(
          workspaceId,
          projectId,
          scene.heygenVideoId,
          3600
        )
        const presigned = data?.presignedUrl || data?.url || data?.downloadUrl
        const resolved = pickHttpPlaybackUrl(presigned)
        if (resolved) {
          return applyPlaybackUrlToScene(scene, resolved)
        }
      } catch (err) {
        console.warn('[HeyGen] Presigned URL failed for scene', scene.id, err)
      }

      if (existing) {
        return applyPlaybackUrlToScene(scene, existing)
      }

      try {
        const streamUrl = heygenService.getStreamUrl(
          workspaceId,
          projectId,
          scene.heygenVideoId
        )
        if (streamUrl) {
          return applyPlaybackUrlToScene(scene, streamUrl)
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
  const heygenCount = withUrls.filter((s) => s.heygenVideoId).length
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
