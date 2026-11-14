import { useEffect, useState } from 'react'

/** Images that have finished loading during this visit; reopening a page with them shows no loader. */
const readyImages = new Set()
const pendingImages = new Map()

/**
 * Starts loading an image and resolves once it is decoded and ready to paint.
 * A failed load also resolves, so a missing image never keeps a page hidden.
 */
export function preloadImage(src) {
  if (!src || readyImages.has(src)) return Promise.resolve()
  if (pendingImages.has(src)) return pendingImages.get(src)

  const promise = new Promise((resolve) => {
    const img = new Image()
    const finish = (ok) => {
      if (ok) readyImages.add(src)
      pendingImages.delete(src)
      resolve()
    }
    img.onload = () => {
      // decode() waits until the image can be painted without a visible top-to-bottom reveal.
      const decoded = typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
      decoded.then(() => finish(true))
    }
    img.onerror = () => finish(false)
    img.src = src
  })
  pendingImages.set(src, promise)
  return promise
}

/**
 * True once `src` has loaded (or failed, or `timeoutMs` passed). A falsy `src` counts as ready.
 */
export function useImageReady(src, { timeoutMs = 12000 } = {}) {
  const [settledSrc, setSettledSrc] = useState(null)

  useEffect(() => {
    if (!src || readyImages.has(src)) return undefined
    let cancelled = false
    const settle = () => {
      if (!cancelled) setSettledSrc(src)
    }
    const timer = window.setTimeout(settle, timeoutMs)
    preloadImage(src).then(() => {
      window.clearTimeout(timer)
      settle()
    })
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [src, timeoutMs])

  return !src || readyImages.has(src) || settledSrc === src
}
