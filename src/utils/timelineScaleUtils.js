export const MIN_ZOOM = 10
export const MAX_ZOOM = 200
export const DEFAULT_ZOOM = 60
export const FIT_PADDING = 48
export const MIN_MAJOR_SPACING_PX = 80

const RULER_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300]

function isStepMultiple(time, step) {
  if (!step) return false
  const ratio = time / step
  return Math.abs(ratio - Math.round(ratio)) < 1e-6
}

export function computeFitZoom(durationSec, viewportWidth, padding = FIT_PADDING) {
  if (!viewportWidth || !durationSec || durationSec <= 0) return DEFAULT_ZOOM
  const available = Math.max(200, viewportWidth - padding)
  const fitZoom = available / durationSec
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom))
}

export function pickRulerStep(zoomPxPerSec) {
  if (!zoomPxPerSec || zoomPxPerSec <= 0) return 1
  for (const step of RULER_STEPS) {
    if (step * zoomPxPerSec >= MIN_MAJOR_SPACING_PX) return step
  }
  return RULER_STEPS[RULER_STEPS.length - 1]
}

export function formatRulerLabel(seconds) {
  if (seconds < 60) {
    const rounded = Number.isInteger(seconds) ? seconds : parseFloat(seconds.toFixed(1))
    return `${rounded}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function buildRulerTicks(durationSec, zoomPxPerSec) {
  const majorStep = pickRulerStep(zoomPxPerSec)
  const ticks = []
  const minorStep = majorStep >= 5 ? majorStep / 5 : majorStep >= 2 ? majorStep / 2 : null

  if (minorStep && minorStep * zoomPxPerSec >= 12) {
    const minorCount = Math.ceil(durationSec / minorStep) + 2
    for (let i = 0; i <= minorCount; i++) {
      const time = i * minorStep
      if (time > durationSec + minorStep) break
      if (isStepMultiple(time, majorStep)) continue
      ticks.push({ time, isMajor: false })
    }
  }

  const majorCount = Math.ceil(durationSec / majorStep) + 2
  for (let i = 0; i <= majorCount; i++) {
    const time = i * majorStep
    if (time > durationSec + majorStep) break
    ticks.push({ time, isMajor: true })
  }

  ticks.sort((a, b) => a.time - b.time)
  return ticks
}
