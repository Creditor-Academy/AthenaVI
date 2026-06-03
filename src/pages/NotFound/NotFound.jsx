import React, { useEffect, useState } from 'react'
import './NotFound.css'

function NotFound({ setView }) {
  const [glitching, setGlitching] = useState(false)
  const [blink, setBlink] = useState(false)

  const handleGoHome = () => {
    const token = localStorage.getItem('accessToken')
    setView(token ? 'dashboard' : 'landing')
  }

  // Glitch effect on 404
  useEffect(() => {
    const t = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 300)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  // Owl blink effect
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
    <div className="nf-page">
      {/* Ambient orbs */}
      <div className="nf-orb nf-orb-1" />
      <div className="nf-orb nf-orb-2" />

      {/* Dot grid */}
      <div className="nf-dot-grid" />

      {/* Full-page split */}
      <div className="nf-content">

        {/* ── Left: Owl Illustration ── */}
        <div className="nf-illustration">
          <div className="nf-owl-scene">
            <svg
              viewBox="0 0 280 340"
              xmlns="http://www.w3.org/2000/svg"
              className="nf-owl-svg"
            >
              <defs>
                <radialGradient id="bodyGrad" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity="1" />
                </radialGradient>
                <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                </radialGradient>
                <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                </radialGradient>
                <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(var(--primary-rgb),0.35)" />
                </filter>
                <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* ─── Shadow under owl ─── */}
              <ellipse cx="140" cy="305" rx="58" ry="10" fill="rgba(var(--primary-rgb),0.12)" className="owl-shadow" />

              {/* ─── Branch ─── */}
              <rect x="40" y="270" width="200" height="18" rx="9" fill="var(--primary-dark)" opacity="0.75" />
              {/* Branch texture lines */}
              <line x1="60" y1="272" x2="65" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="100" y1="272" x2="105" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="150" y1="272" x2="155" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="200" y1="272" x2="205" y2="286" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />

              {/* ─── Owl body group (animated float) ─── */}
              <g className="owl-float" filter="url(#softShadow)">

                {/* Tail feathers */}
                <ellipse cx="125" cy="272" rx="12" ry="8" transform="rotate(-15, 125, 272)" fill="var(--primary-dark)" opacity="0.9" />
                <ellipse cx="140" cy="274" rx="12" ry="8" fill="var(--primary-dark)" opacity="0.9" />
                <ellipse cx="155" cy="272" rx="12" ry="8" transform="rotate(15, 155, 272)" fill="var(--primary-dark)" opacity="0.9" />

                {/* Main body */}
                <ellipse cx="140" cy="210" rx="56" ry="68" fill="url(#bodyGrad)" />

                {/* Belly */}
                <ellipse cx="140" cy="225" rx="34" ry="42" fill="url(#bellyGrad)" />

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

                {/* Left wing */}
                <ellipse cx="90" cy="225" rx="24" ry="46"
                  transform="rotate(-18, 90, 225)"
                  fill="var(--primary-dark)"
                  opacity="0.9"
                  className="wing-left"
                />

                {/* Right wing */}
                <ellipse cx="190" cy="225" rx="24" ry="46"
                  transform="rotate(18, 190, 225)"
                  fill="var(--primary-dark)"
                  opacity="0.9"
                  className="wing-right"
                />

                {/* Head */}
                <ellipse cx="140" cy="145" rx="48" ry="46" fill="url(#bodyGrad)" />

                {/* Ear tufts (horns) */}
                <ellipse cx="115" cy="103" rx="9" ry="18" transform="rotate(-15, 115, 103)" fill="var(--primary-dark)" />
                <ellipse cx="165" cy="103" rx="9" ry="18" transform="rotate(15, 165, 103)" fill="var(--primary-dark)" />

                {/* ── Left eye ── */}
                <circle cx="122" cy="148" r="18" fill="white" opacity="0.95" />
                <circle cx="122" cy="148" r="14" fill="#1e293b" />
                <circle cx="122" cy="148" r={blink ? 0 : 10} fill="var(--primary)" style={{ transition: 'r 0.08s ease' }} />
                <circle cx="122" cy="148" r={blink ? 0 : 5} fill="#0f172a" style={{ transition: 'r 0.08s ease' }} />
                {/* Eye shine */}
                {!blink && <circle cx="126" cy="143" r="3" fill="white" opacity="0.9" />}
                {/* Eye ring */}
                <circle cx="122" cy="148" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />

                {/* ── Right eye ── */}
                <circle cx="158" cy="148" r="18" fill="white" opacity="0.95" />
                <circle cx="158" cy="148" r="14" fill="#1e293b" />
                <circle cx="158" cy="148" r={blink ? 0 : 10} fill="var(--primary)" style={{ transition: 'r 0.08s ease' }} />
                <circle cx="158" cy="148" r={blink ? 0 : 5} fill="#0f172a" style={{ transition: 'r 0.08s ease' }} />
                {!blink && <circle cx="162" cy="143" r="3" fill="white" opacity="0.9" />}
                <circle cx="158" cy="148" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />

                {/* Beak */}
                <polygon points="140,160 132,174 148,174" fill="#f59e0b" />
                <line x1="132" y1="168" x2="148" y2="168" stroke="#d97706" strokeWidth="1.5" />

                {/* Feet / talons */}
                <g className="owl-feet">
                  {/* Left foot */}
                  <line x1="120" y1="270" x2="110" y2="282" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="120" y1="270" x2="118" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="120" y1="270" x2="126" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  {/* Right foot */}
                  <line x1="160" y1="270" x2="150" y2="282" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="158" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="166" y2="284" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round" />
                </g>

              </g>{/* end owl-float group */}

              {/* Stars / dots floating around the owl */}
              <circle cx="60" cy="120" r="3" fill="var(--primary)" opacity="0.5" className="star star-1" />
              <circle cx="220" cy="100" r="2.5" fill="var(--primary)" opacity="0.4" className="star star-2" />
              <circle cx="42" cy="190" r="2" fill="var(--primary)" opacity="0.35" className="star star-3" />
              <circle cx="238" cy="180" r="2" fill="var(--primary)" opacity="0.35" className="star star-4" />
              <circle cx="70" cy="70" r="1.5" fill="var(--primary)" opacity="0.3" className="star star-5" />
              <circle cx="210" cy="60" r="1.5" fill="var(--primary)" opacity="0.3" className="star star-6" />

              {/* "? ? ?" question marks near owl */}
              <text x="42" y="155" fontSize="16" fill="var(--primary)" opacity="0.4" className="question q-1" fontWeight="700">?</text>
              <text x="224" y="145" fontSize="16" fill="var(--primary)" opacity="0.4" className="question q-2" fontWeight="700">?</text>
              <text x="56" y="240" fontSize="12" fill="var(--primary)" opacity="0.3" className="question q-3" fontWeight="700">?</text>

            </svg>
          </div>
        </div>

        {/* ── Right: Text ── */}
        <div className="nf-text">
          <div className={`nf-error-code ${glitching ? 'glitch' : ''}`} data-text="404">
            404
          </div>

          <div className="nf-badge">
            <span className="nf-badge-dot" />
            Hoo… where'd that go?
          </div>

          <h2 className="nf-heading">Page Not Found</h2>
          <p className="nf-sub">
            Even our wisest owl can't find what you're looking for.
            <br />The page may have flown away or never existed.
          </p>

          <div className="nf-actions">
            <button className="nf-btn primary" onClick={handleGoHome}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
            <button className="nf-btn secondary" onClick={() => window.history.back()}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          <p className="nf-hint">
            or try:{' '}
            <span onClick={() => setView('help-center')} className="nf-link">Help Center</span>
            {' · '}
            <span onClick={() => setView('products')} className="nf-link">Solutions</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
