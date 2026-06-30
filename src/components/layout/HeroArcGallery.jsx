import { useRef, useEffect, useState, useMemo } from 'react'
import { useAnimationFrame } from 'framer-motion'

const SCROLL_DURATION_DESKTOP = 35
const SCROLL_DURATION_MOBILE = 45

function getScrollDuration() {
  if (typeof window === 'undefined') return SCROLL_DURATION_DESKTOP
  return window.matchMedia('(max-width: 768px)').matches
    ? SCROLL_DURATION_MOBILE
    : SCROLL_DURATION_DESKTOP
}

function computeArcTransform(offset, fullWidth) {
  const abs = Math.min(Math.abs(offset), 3)
  const rotateFactor = fullWidth ? -42 : -22
  const scaleBase = fullWidth ? 0.58 : 0.72
  const scaleBoost = fullWidth ? 0.16 : 0.09
  return {
    rotateY: offset * rotateFactor,
    scale: scaleBase + abs * scaleBoost,
    translateZ: -abs * (fullWidth ? 70 : 45),
    zIndex: Math.round(100 - abs * 10),
  }
}

const styles = `
.hero-arc-gallery {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  perspective: 1400px;
  perspective-origin: 50% 50%;
}

.hero-arc-gallery--full {
  height: 420px;
  perspective: 1100px;
}

.hero-arc-track {
  display: flex;
  align-items: center;
  gap: 0;
  width: max-content;
  transform-style: preserve-3d;
  will-change: transform;
}

@keyframes hero-arc-scroll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(-1 * var(--scroll-distance, 0px)), 0, 0);
  }
}

.hero-arc-tile {
  flex-shrink: 0;
  width: 160px;
  height: 220px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  margin: 0 -10px;
}

.hero-arc-gallery--full .hero-arc-tile {
  width: 270px;
  height: 380px;
  border-radius: 32px;
  margin: 0 -30px;
}

.hero-arc-tile img,
.hero-arc-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
}

.hero-arc-labels {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 5vw, 64px);
  padding: 20px 24px 0;
  flex-wrap: wrap;
}

.hero-arc-label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.hero-arc-label-num {
  font-weight: 500;
  letter-spacing: 0.02em;
}

.hero-arc-label-text {
  font-weight: 400;
}

@media (max-width: 1200px) {
  .hero-arc-gallery--full {
    height: 360px;
  }

  .hero-arc-gallery--full .hero-arc-tile {
    width: 230px;
    height: 320px;
    border-radius: 28px;
    margin: 0 -20px;
  }

  .hero-arc-tile {
    width: 140px;
    height: 190px;
    border-radius: 24px;
    margin: 0 -10px;
  }
}

@media (max-width: 768px) {
  .hero-arc-gallery {
    perspective: 1000px;
  }

  .hero-arc-gallery--full {
    height: 300px;
  }

  .hero-arc-gallery--full .hero-arc-tile,
  .hero-arc-tile {
    width: 185px;
    height: 260px;
    border-radius: 22px;
    margin: 0 -20px;
  }

  .hero-arc-labels {
    display: none;
  }
}
`

function HeroArcGallery({ avatars = [], fullWidth = false, pillarLabels = [] }) {
  const galleryRef = useRef(null)
  const tileRefs = useRef([])
  const [scrollDistance, setScrollDistance] = useState(0)
  const [scrollDuration, setScrollDuration] = useState(SCROLL_DURATION_DESKTOP)
  const trackStyle = scrollDistance > 0
    ? {
        ['--scroll-distance']: `${scrollDistance}px`,
        animation: `${scrollDuration}s hero-arc-scroll linear infinite`,
      }
    : undefined

  const tiles = useMemo(
    () => [...avatars, ...avatars, ...avatars],
    [avatars]
  )

  useEffect(() => {
    const measure = () => {
      const first = tileRefs.current[0]
      const second = tileRefs.current[1]
      if (!first || avatars.length === 0) return

      let tileStep = first.getBoundingClientRect().width
      if (second) {
        const firstRect = first.getBoundingClientRect()
        const secondRect = second.getBoundingClientRect()
        tileStep = secondRect.left - firstRect.left
      }

      setScrollDistance(Math.max(1, Math.round(tileStep * avatars.length)))
      setScrollDuration(getScrollDuration())
    }

    const raf = requestAnimationFrame(measure)
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => measure())
      : null

    if (resizeObserver && galleryRef.current) {
      resizeObserver.observe(galleryRef.current)
    }

    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      resizeObserver?.disconnect()
    }
  }, [avatars.length, tiles.length])

  useAnimationFrame(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    const galleryRect = gallery.getBoundingClientRect()
    const centerX = galleryRect.left + galleryRect.width / 2
    const normalizer = galleryRect.width / (fullWidth ? 3.8 : 4)

    tileRefs.current.forEach((tile) => {
      if (!tile) return
      const rect = tile.getBoundingClientRect()
      const tileCenterX = rect.left + rect.width / 2
      const offset = (tileCenterX - centerX) / normalizer
      const { rotateY, scale, translateZ, zIndex } = computeArcTransform(offset, fullWidth)
      tile.style.transform = `rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`
      tile.style.zIndex = String(zIndex)
    })
  })

  const galleryClass = fullWidth ? 'hero-arc-gallery hero-arc-gallery--full' : 'hero-arc-gallery'

  return (
    <>
      <style>{styles}</style>
      <div className={galleryClass} ref={galleryRef} aria-hidden="true">
        <div className="hero-arc-track" style={trackStyle}>
          {tiles.map((avatar, i) => (
            <div
              key={`${avatar.name}-${i}`}
              ref={(el) => {
                tileRefs.current[i] = el
              }}
              className="hero-arc-tile"
            >
              <video
                src={avatar.src}
                muted
                autoPlay
                loop
                playsInline
                webkit-playsinline="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>
      {fullWidth && pillarLabels.length > 0 && (
        <div className="hero-arc-labels">
          {pillarLabels.map(({ num, label }) => (
            <div key={num} className="hero-arc-label">
              <span className="hero-arc-label-num">// {num}</span>
              <span className="hero-arc-label-text">{label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default HeroArcGallery
