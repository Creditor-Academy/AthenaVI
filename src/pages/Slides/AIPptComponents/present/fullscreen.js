/**
 * Full screen for Present (Present plan, Phase 2.2), with the `webkit` names older Safari uses.
 *
 * The whole page goes full screen (not the Present element): browsers only allow it straight from
 * a click or key press, and the editor's Present button handler runs before Present exists. Present
 * covers the page above every other layer, so the page behind it never shows.
 */

const doc = () => (typeof document === 'undefined' ? null : document)

/** The element shown full screen now, or null. */
export function fullscreenElement() {
  const d = doc()
  return d ? d.fullscreenElement || d.webkitFullscreenElement || null : null
}

/** False on iPhone (no element full screen) and inside a frame that doesn't allow it. */
export function canFullscreen() {
  const d = doc()
  if (!d) return false
  const el = d.documentElement
  const api = typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function'
  const enabled = d.fullscreenEnabled ?? d.webkitFullscreenEnabled ?? true
  return api && enabled !== false
}

/**
 * Ask for full screen. Call it from the click or key press that starts it.
 * @returns {Promise<boolean>} true once the page is full screen
 */
export function requestPresentFullscreen() {
  const d = doc()
  if (!d || !canFullscreen()) return Promise.resolve(false)
  if (fullscreenElement()) return Promise.resolve(true)
  const el = d.documentElement
  try {
    const result = el.requestFullscreen
      ? el.requestFullscreen({ navigationUI: 'hide' })
      : el.webkitRequestFullscreen()
    return Promise.resolve(result).then(
      () => Boolean(fullscreenElement()),
      () => false
    )
  } catch {
    return Promise.resolve(false)
  }
}

export function exitPresentFullscreen() {
  const d = doc()
  if (!d || !fullscreenElement()) return Promise.resolve()
  try {
    const result = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.()
    return Promise.resolve(result).catch(() => {})
  } catch {
    return Promise.resolve()
  }
}

/** Calls `handler` when the page enters or leaves full screen. Returns the unsubscribe. */
export function onFullscreenChange(handler) {
  const d = doc()
  if (!d) return () => {}
  d.addEventListener('fullscreenchange', handler)
  d.addEventListener('webkitfullscreenchange', handler)
  return () => {
    d.removeEventListener('fullscreenchange', handler)
    d.removeEventListener('webkitfullscreenchange', handler)
  }
}
