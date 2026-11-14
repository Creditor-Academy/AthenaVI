import React, { useEffect, useState } from 'react'
import './DaypartBgLoader.css'

const FADE_MS = 420

/**
 * Full-screen loading cover for pages with a daypart landscape background. Its colors follow
 * the landscape for that time of day, so the page doesn't flash a half-painted image.
 * It fades out when `ready` turns true and then stays gone, even if the background changes later.
 * Place it inside the page's fixed container.
 */
export default function DaypartBgLoader({ ready, daypart = 'afternoon', label = 'Loading…' }) {
  // Already loaded when the page opens (e.g. a second visit): never show the cover at all.
  const [gone, setGone] = useState(ready)

  useEffect(() => {
    if (!ready || gone) return undefined
    const id = window.setTimeout(() => setGone(true), FADE_MS)
    return () => window.clearTimeout(id)
  }, [ready, gone])

  if (gone) return null

  return (
    <div
      className={`daypart-bg-loader daypart-bg-loader--${daypart}${ready ? ' is-done' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!ready}
    >
      <div className="daypart-bg-loader__spinner" aria-hidden>
        <span />
        <span />
      </div>
      <p className="daypart-bg-loader__label">{label}</p>
    </div>
  )
}
