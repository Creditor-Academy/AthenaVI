import React, { useEffect, useState } from 'react'
import './LinkUnavailable.css'

export default function LinkUnavailable({
  title = "This link isn’t available",
  subtitle = "It may have been turned off, reset, or expired. Ask the owner for a new link.",
  onGoHome,
  onGoBack,
}) {
  const [blink, setBlink] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleCopyRequestMessage = async () => {
    const textToCopy = "Hey! The link to the presentation isn't available anymore. Could you send me a new link?"
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = textToCopy
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Owl eye blink effect loop
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
      {/* Ambient glowing background orbs */}
      <div className="lu-orb lu-orb-primary" />
      <div className="lu-orb lu-orb-secondary" />
      <div className="lu-orb lu-orb-accent" />

      {/* Animated grid drift */}
      <div className="lu-dot-grid" />

      {/* Main Container Card */}
      <div className="lu-card-container">

        {/* Top Header Badge & Icon */}
        <div className="lu-header-group">
          <div className="lu-icon-halo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lu-chain-icon">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="8" y1="8" x2="16" y2="16" stroke="var(--warning-amber, #f59e0b)" strokeWidth="2.5" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="lu-badge">
            <span className="lu-badge-dot" />
            Link Inactive or Expired
          </div>
        </div>

        {/* Main Split Layout: Text + Illustration */}
        <div className="lu-body-split">

          {/* Left Column: Text & Reasons */}
          <div className="lu-text-col">
            <h1 className="lu-title">{title}</h1>
            <p className="lu-lead">{subtitle}</p>

            {/* Glassmorphic Breakdown Card */}
            <div className="lu-reasons-card">
              <span className="lu-reasons-title">Possible Reasons</span>
              <div className="lu-reasons-grid">

                <div className="lu-reason-item">
                  <div className="lu-reason-icon">⏳</div>
                  <div className="lu-reason-text">
                    <strong>Link Expired</strong>
                    <span>Timer or access limit was reached</span>
                  </div>
                </div>

                <div className="lu-reason-item">
                  <div className="lu-reason-icon">🔒</div>
                  <div className="lu-reason-text">
                    <strong>Access Revoked</strong>
                    <span>Owner modified share settings</span>
                  </div>
                </div>

                <div className="lu-reason-item">
                  <div className="lu-reason-icon">🔗</div>
                  <div className="lu-reason-text">
                    <strong>Changed URL</strong>
                    <span>Presentation address was updated</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="lu-actions">
              <button className="lu-btn lu-btn-primary" onClick={handleGoHome}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </button>

              <button className="lu-btn lu-btn-secondary" onClick={handleCopyRequestMessage}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? "Message Copied!" : "Ask for New Link"}
              </button>

              <button className="lu-btn lu-btn-ghost" onClick={handleGoBack}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>

            {copied && (
              <div className="lu-toast fade-in">
                ✨ Text copied! Send it to the presentation owner.
              </div>
            )}
          </div>

          {/* Right Column: Custom Owl Inspector SVG Illustration */}
          <div className="lu-illustration-col">
            <div className="lu-svg-wrapper">
              <svg
                viewBox="0 0 280 340"
                xmlns="http://www.w3.org/2000/svg"
                className="lu-inspector-svg"
              >
                <defs>
                  <radialGradient id="luBodyGrad2" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="var(--primary, #2563eb)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="var(--primary-dark, #1e40af)" stopOpacity="1" />
                  </radialGradient>
                  <radialGradient id="luBellyGrad2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </radialGradient>
                  <filter id="luGlowGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(var(--primary-rgb, 37, 99, 235),0.4)" />
                  </filter>
                </defs>

                {/* Perch Platform */}
                <ellipse cx="140" cy="305" rx="60" ry="12" fill="rgba(var(--primary-rgb, 37, 99, 235), 0.15)" className="lu-shadow-pulse" />
                <rect x="40" y="270" width="200" height="18" rx="9" fill="var(--primary-dark, #1e40af)" opacity="0.8" />
                <line x1="70" y1="272" x2="75" y2="286" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="140" y1="272" x2="145" y2="286" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="200" y1="272" x2="205" y2="286" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Floating Owl Body */}
                <g className="lu-owl-float-anim" filter="url(#luGlowGlow)">
                  {/* Tail */}
                  <ellipse cx="140" cy="274" rx="14" ry="9" fill="var(--primary-dark, #1e40af)" opacity="0.9" />

                  {/* Body & Belly */}
                  <ellipse cx="140" cy="210" rx="54" ry="66" fill="url(#luBodyGrad2)" />
                  <ellipse cx="140" cy="225" rx="32" ry="40" fill="url(#luBellyGrad2)" />

                  {/* Belly feather arcs */}
                  {[195, 210, 225, 240].map((y, i) => (
                    <path
                      key={i}
                      d={`M ${112 + i * 3},${y} Q 140,${y + 6} ${168 - i * 3},${y}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  ))}

                  {/* Wings */}
                  <ellipse cx="90" cy="225" rx="22" ry="44" transform="rotate(-20, 90, 225)" fill="var(--primary-dark, #1e40af)" opacity="0.9" />
                  <ellipse cx="190" cy="225" rx="22" ry="44" transform="rotate(20, 190, 225)" fill="var(--primary-dark, #1e40af)" opacity="0.9" />

                  {/* Head */}
                  <ellipse cx="140" cy="145" rx="46" ry="44" fill="url(#luBodyGrad2)" />
                  <ellipse cx="116" cy="103" rx="8" ry="16" transform="rotate(-15, 116, 103)" fill="var(--primary-dark, #1e40af)" />
                  <ellipse cx="164" cy="103" rx="8" ry="16" transform="rotate(15, 164, 103)" fill="var(--primary-dark, #1e40af)" />

                  {/* Left eye with inspection lens overlay */}
                  <circle cx="122" cy="148" r="17" fill="white" opacity="0.95" />
                  <circle cx="122" cy="148" r="13" fill="#0f172a" />
                  <circle cx="122" cy="148" r={blink ? 0 : 9} fill="var(--primary, #2563eb)" style={{ transition: 'r 0.08s ease' }} />
                  {!blink && <circle cx="125" cy="144" r="3" fill="white" opacity="0.9" />}

                  {/* Right eye */}
                  <circle cx="158" cy="148" r="17" fill="white" opacity="0.95" />
                  <circle cx="158" cy="148" r="13" fill="#0f172a" />
                  <circle cx="158" cy="148" r={blink ? 0 : 9} fill="var(--primary, #2563eb)" style={{ transition: 'r 0.08s ease' }} />
                  {!blink && <circle cx="161" cy="144" r="3" fill="white" opacity="0.9" />}

                  {/* Beak */}
                  <polygon points="140,158 133,172 147,172" fill="#f59e0b" />

                  {/* Feet */}
                  <line x1="120" y1="270" x2="114" y2="282" stroke="var(--primary-dark, #1e40af)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="120" y1="270" x2="124" y2="283" stroke="var(--primary-dark, #1e40af)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="154" y2="282" stroke="var(--primary-dark, #1e40af)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="160" y1="270" x2="164" y2="283" stroke="var(--primary-dark, #1e40af)" strokeWidth="3.5" strokeLinecap="round" />
                </g>

                {/* Floating Severed Chain Graphic */}
                <g className="lu-floating-chain">
                  {/* Left Chain Loop */}
                  <rect x="75" y="70" width="22" height="34" rx="11" fill="none" stroke="var(--primary, #2563eb)" strokeWidth="3.5" opacity="0.75" transform="rotate(-25, 86, 87)" />
                  {/* Right Chain Loop (Severed) */}
                  <rect x="183" y="70" width="22" height="34" rx="11" fill="none" stroke="var(--primary, #2563eb)" strokeWidth="3.5" opacity="0.75" transform="rotate(25, 194, 87)" />
                  {/* Energy Spark Rings */}
                  <circle cx="140" cy="85" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" className="lu-spark-ring" />
                  <circle cx="140" cy="85" r="4" fill="#f43f5e" opacity="0.9" />
                </g>

                {/* Floating particle stars */}
                <circle cx="50" cy="110" r="2.5" fill="var(--primary, #2563eb)" opacity="0.6" className="lu-star-float-1" />
                <circle cx="230" cy="120" r="3" fill="var(--primary, #2563eb)" opacity="0.5" className="lu-star-float-2" />
                <circle cx="65" cy="210" r="2" fill="var(--primary, #2563eb)" opacity="0.4" className="lu-star-float-3" />
                <circle cx="220" cy="200" r="2" fill="var(--primary, #2563eb)" opacity="0.4" className="lu-star-float-4" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
