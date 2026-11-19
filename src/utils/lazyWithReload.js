import { lazy } from 'react'

/**
 * Pages load as separate files. A page that was opened before a new deploy still asks for the
 * old files, which the deploy removed, so the download fails (after login: a blank dashboard
 * until a refresh). Reload once instead: the fresh page brings the new file names. A second
 * failure within a short time is a real problem (offline, server down) and is shown, not looped.
 */

const RELOAD_KEY = 'athena.newVersionReloadAt'
const RELOAD_WINDOW_MS = 10000

const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading (CSS )?chunk .* failed|Unable to preload CSS/i

/** True for a failed download of one of the app's own files. */
export function isChunkLoadError(error) {
  return CHUNK_ERROR.test(String(error?.message || error || ''))
}

/**
 * Reload the page unless that was just tried. Returns true when a reload has started.
 * `storage` and `location` are passed in tests.
 */
export function reloadOnceForNewVersion({
  storage = globalThis.sessionStorage,
  location = globalThis.location,
  now = Date.now(),
} = {}) {
  try {
    const last = Number(storage.getItem(RELOAD_KEY)) || 0
    if (now - last < RELOAD_WINDOW_MS) return false
    storage.setItem(RELOAD_KEY, String(now))
  } catch {
    // Without storage a reload could repeat forever: show the error instead.
    return false
  }
  location.reload()
  return true
}

/** React.lazy that reloads once when the page's file is gone after a deploy. */
export function lazyWithReload(importer) {
  return lazy(() =>
    importer().catch((error) => {
      if (isChunkLoadError(error) && reloadOnceForNewVersion()) {
        // The page is reloading; keep showing the loading state until it does.
        return new Promise(() => {})
      }
      throw error
    })
  )
}

/** Vite reports failed preloads (a page's CSS or shared files) as `vite:preloadError`. */
export function installNewVersionReload(target = globalThis.window) {
  if (!target?.addEventListener) return
  target.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForNewVersion()) event.preventDefault()
  })
}
