import React, { useEffect, useState } from 'react'
import './LinkUnavailable.css'

export default function LinkUnavailable({
  title = "This link isn’t available",
  subtitle = "It may have been turned off, reset, or expired. Ask the owner for a new link.",
  onGoHome,
  onGoBack,
}) {
  const [glitching, setGlitching] = useState(false)
  const [blink, setBlink] = useState(false)

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
      return
    }
    const token = localStorage.getItem('accessToken')
    window.location.href = token ? '/dashboard' : '/'
  }

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
      return
    }
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  // Glitch effect loop
  useEffect(() => {
    const t = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 300)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  // Owl blink effect loop
  useEffect(() => {
    const blinker = () => {
      setBlink(true)
      setTimeout(() => setBlink(false), 180)
    }
    blinker()
    const t = setInterval(() => {
      blinker()
      setTimeout(blinker, 400)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="lu-page">
      {/* Ambient orbs */}
      <div className="lu-orb lu-orb-1" />
      <div className="lu-orb lu-orb-2" />

      {/* Dot grid */}
      <div className="lu-dot-grid" />

      {/* Main split content */}
      <div className="lu-content">

        {/* ── Left: Owl & Broken Link Illustration ── */}
        <div className="lu-illustration">
          <div className="lu-owl-scene">
            <svg
              viewBox="0 0 280 340"
              xmlns="http://www.w3.org/2000/svg"
              className="lu-owl-svg"
            >
              <defs>
                <radialGradient id="luBodyGrad" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity="1" />
                </radialGradient>
                <radialGradient id="luBellyGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                </radialGradient>
                <filter id="luSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(var(--primary-rgb),0.35)" />
                </filter>
              </defs>

              {/* Shadow under owl */}
              <ellipse cx="140" cy="305" rx="58" ry="10" fill="rgba(var(--primary-rgb),0.12)" className="lu-owl-shadow" />

              {/* Perch branch */}
              <rect x="40" y="270" width="200" height="18" rx="9" fill="var(--primary-dark)" opacity="0.75" />
              <line x1="60" y1="272" x2="65" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="100" y1="272" x2="105" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="150" y1="272" x2="155" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="200" y1="272" x2="205" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />

              {/* Owl body group (animated float) */}
              <g className="lu-owl-float" filter="url(#luSoftShadow)">

                {/* Tail feathers */}
                <ellipse cx="125" cy="272" rx="12" ry="8" transform="rotate(-15, 125, 272)" fill="var(--primary-dark)" opacity="0.9" />
                <ellipse cx="140" cy="274" rx="12" ry="8" fill="var(--primary-dark)" opacity="0.9" />
                <ellipse cx="155" cy="272" rx="12" ry="8" transform="rotate(15, 155, 272)" fill="var(--primary-dark)" opacity="0.9" />

                {/* Main body */}
                <ellipse cx="140" cy="210" rx="56" ry="68" fill="url(#luBodyGrad)" />

                {/* Belly */}
                <ellipse cx="140" cy="225" rx="34" ry="42" fill="url(#luBellyGrad)" />

                {/* Belly feather lines */}
                {[195, 210, 225, 240].map((y, i) => (
                  <path
                    key={i}
                    d={`M ${110 + i * 3},${y} Q 140,${y + 6} ${170 - i * 3},${y}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                ))}

                {/* Wings */}
                <ellipse cx="90" cy="225" rx="24" ry="46"
                  transform="rotate(-18, 90, 225)"
                  fill="var(--primary-dark)"
                  opacity="0.9"
                  className="lu-wing-left"
                />
                <ellipse cx="190" cy="225" rx="24" ry="46"
                  transform="rotate(18, 190, 225)"
                  fill="var(--primary-dark)"
                  opacity="0.9"
                  className="lu-wing-right"
                />

                {/* Head */}
                <ellipse cx="140" cy="145" rx="48" ry="46" fill="url(#luBodyGrad)" />

                {/* Ear tufts */}
                <ellipse cx="115" cy="103" rx="9" ry="18" transform="rotate(-15, 115, 103)" fill="var(--primary-dark)" />
                <ellipse cx="165" cy="103" rx="9" ry="18" transform="rotate(15, 165, 103)" fill="var(--primary-dark)" />

                {/* Left eye */}
                <circle cx="122" cy="148" r="18" fill="white" opacity="0.95" />
                <circle cx="122" cy="148" r="14" fill="#1e293b" />
                <circle cx="122" cy="148" r={blink ? 0 : 10} fill="var(--primary)" style={{ transition: 'r 0.08s ease' }} />
                <circle cx="122" cy="148" r={blink ? 0 : 5} fill="#0f172a" style={{ transition: 'r 0.08s ease' }} />
                {!blink && <circle cx="126" cy="143" r="3" fill="white" opacity="0.9" />}
                <circle cx="122" cy="148" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />

                {/* Right eye */}
                <circle cx="158" cy="148" r="18" fill="white" opacity="0.95" />
                <circle cx="158" cy="148" r="14" fill="#1e293b" />
                <circle cx="158" cy="148" r={blink ? 0 : 10} fill="var(--primary)" style={{ transition: 'r 0.08s ease' }} />
                <circle cx="158" cy="148" r={blink ? 0 : 5} fill="#0f172a" style={{ transition: 'r 0.08s ease' }} />
                {!blink && <circle cx="162" cy="143" r="3" fill="white" opacity="0.9" />}
                <circle cx="158" cy="148" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />

                {/* Beak */}
                <polygon points="140,160 132,174 148,174" fill="#f59e0b" />
                <line x1="132" y1="168" x2="148" y2="168" stroke="#d97706" strokeWidth="1.5" />

                {/* Feet */}
                <g className="lu-owl-feet">
                  <line x1="120" y1="270" x2="110" y2="282" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="120" y1="270" x2="118" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="120" y1="270" x2="126" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="150" y2="282" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="158" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="166" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                </g>
              </g>

              {/* Floating stars */}
              <circle cx="60" cy="120" r="3" fill="var(--primary)" opacity="0.5" className="lu-star lu-star-1" />
              <circle cx="220" cy="100" r="2.5" fill="var(--primary)" opacity="0.4" className="lu-star lu-star-2" />
              <circle cx="42" cy="190" r="2" fill="var(--primary)" opacity="0.35" className="lu-star lu-star-3" />
              <circle cx="238" cy="180" r="2" fill="var(--primary)" opacity="0.35" className="lu-star lu-star-4" />

              {/* Floating question mark / broken link graphics */}
              <text x="42" y="155" fontSize="16" fill="var(--primary)" opacity="0.4" className="lu-question lu-q-1" fontWeight="700">?</text>
              <text x="224" y="145" fontSize="16" fill="var(--primary)" opacity="0.4" className="lu-question lu-q-2" fontWeight="700">?</text>
              <text x="56" y="240" fontSize="12" fill="var(--primary)" opacity="0.3" className="lu-question lu-q-3" fontWeight="700">?</text>

            </svg>
          </div>
        </div>

        {/* ── Right: Text & Actions Block ── */}
        <div className="lu-text">
          <div className={`lu-error-code ${glitching ? 'glitch' : ''}`} data-text="404">
            404
          </div>

          <div className="lu-badge">
            <span className="lu-badge-dot" />
            Hoo… link unavailable!
          </div>

          <h2 className="lu-heading">{title}</h2>
          <p className="lu-sub">{subtitle}</p>

          <div className="lu-actions">
            <button className="lu-btn primary" onClick={handleGoHome}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
            <button className="lu-btn secondary" onClick={handleGoBack}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          <p className="lu-hint">
            or try:{' '}
            <a href="/help" className="lu-link">Help Center</a>
            {' · '}
            <a href="/products" className="lu-link">Solutions</a>
          </p>
        </div>
      </div>
    </div>
  )
}
