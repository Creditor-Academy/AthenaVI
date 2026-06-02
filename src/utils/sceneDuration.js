/** Natural speech rate used for HeyGen / TTS duration estimates (~138 wpm). */
export const BASE_WORDS_PER_SECOND = 2.3

/** Small tail buffer so the timeline does not cut off the last word. */
const END_PADDING_SECONDS = 0.5

const MIN_SCENE_DURATION = 3
const MAX_SCENE_DURATION = 60

export function countScriptWords(script) {
  return (script || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export function roundSceneDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return MIN_SCENE_DURATION
  return Math.ceil(seconds * 2) / 2
}

/**
 * Estimate scene length from script length and voice speed.
 * Faster voice → shorter duration.
 */
export function estimateHeygenSceneDuration(script, voiceSettings = {}) {
  const words = countScriptWords(script)
  if (words === 0) return 8

  const speed = Math.max(0.5, Math.min(2, Number(voiceSettings.speed) || 1))
  const wordsPerSecond = BASE_WORDS_PER_SECOND * speed
  const rawSeconds = words / wordsPerSecond + END_PADDING_SECONDS
  const rounded = roundSceneDuration(rawSeconds)

  return Math.max(MIN_SCENE_DURATION, Math.min(MAX_SCENE_DURATION, rounded))
}

/** Extend or cap layer end times when the scene duration changes. */
export function applyDurationToSceneClips(clips, duration) {
  if (!clips?.length || !Number.isFinite(duration)) return clips || []

  return clips.map((clip) => {
    const startTime = clip.startTime ?? 0
    let endTime = clip.endTime ?? duration

    if (startTime === 0) {
      endTime = duration
    } else {
      endTime = Math.min(endTime, duration)
      endTime = Math.max(endTime, startTime + 0.5)
    }

    return { ...clip, endTime }
  })
}

export function buildSceneDurationPatch(scene, overrides = {}) {
  const script = overrides.script ?? scene?.script
  const voiceSettings = overrides.voiceSettings ?? scene?.voiceSettings ?? {}
  const duration = estimateHeygenSceneDuration(script, voiceSettings)
  const clips = applyDurationToSceneClips(
    overrides.clips ?? scene?.clips,
    duration
  )

  return {
    duration,
    clips,
    durationFromScript: true,
  }
}

/** Read actual MP4 duration from a blob or remote URL (after HeyGen completes). */
export function probeVideoDuration(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No video URL'))
      return
    }

    const video = document.createElement('video')
    video.preload = 'metadata'

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
    }

    video.onloadedmetadata = () => {
      const duration = video.duration
      cleanup()
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration)
      } else {
        reject(new Error('Invalid video duration'))
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Failed to load video metadata'))
    }

    video.src = url
  })
}

export function durationFromVideoMetadata(videoData) {
  const candidates = [
    videoData?.duration,
    videoData?.durationSeconds,
    videoData?.videoDuration,
    videoData?.video_duration,
    videoData?.metadata?.duration,
  ]

  for (const value of candidates) {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) return roundSceneDuration(n)
  }

  return null
}
