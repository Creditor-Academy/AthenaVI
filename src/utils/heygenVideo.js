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
    return scene?.playbackUrl || scene?.generatedVideoUrl || clip?.src || null
  }
  return clip?.src || null
}

export function isVideoMedia(clip, src) {
  if (clip?.type === 'video') return true
  if (isAvatarClip(clip) && src) return true
  return false
}

export async function resolveScenePlaybackUrls(scenes, workspaceId, projectId, heygenService) {
  if (!workspaceId || !projectId || !scenes?.length) return scenes

  return Promise.all(
    scenes.map(async (scene) => {
      if (!scene.heygenVideoId) return scene

      try {
        const { presignedUrl } = await heygenService.downloadVideo(
          workspaceId,
          projectId,
          scene.heygenVideoId,
          3600
        )
        if (!presignedUrl) return scene
        return { ...scene, playbackUrl: presignedUrl, generatedVideoUrl: presignedUrl }
      } catch (err) {
        console.warn('[HeyGen] Failed to resolve playback URL for scene', scene.id, err)
        return scene
      }
    })
  )
}
