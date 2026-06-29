import React, { useState, useEffect, useRef } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import { FiShield, FiMic, FiGlobe, FiVideo, FiCpu } from 'react-icons/fi';

import DigitalTwin01 from '../../assets/digitaltwin01.png';
import DigitalTwin02 from '../../assets/digitaltwin02.png';

const styles = `
.dt-showcase-section {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 750px;
  max-height: 950px;
  background: #04060b;
  overflow: hidden;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* Base images stack */
.dt-showcase-media-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: crosshair;
}

.dt-portrait-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.dt-portrait-real {
  z-index: 3;
  filter: contrast(1.02) brightness(0.95);
}

.dt-portrait-clone {
  z-index: 2;
  filter: contrast(1.08) brightness(1.02) saturate(1.08);
}

/* Sci-fi Overlay Vignette */
.dt-showcase-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, transparent 20%, rgba(4, 6, 11, 0.3) 60%, rgba(4, 6, 11, 0.95) 95%);
  z-index: 4;
  pointer-events: none;
}

/* Side Panels Grid - Always Visible */
.dt-showcase-panels-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  padding: 200px 6% 80px 6%;
  z-index: 10;
  pointer-events: none;
}

.dt-left-column, .dt-right-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  width: 320px;
  pointer-events: auto;
}

.dt-feature-panel {
  position: relative;
  background: rgba(10, 15, 30, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 
    0 15px 35px -10px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dt-feature-panel:hover {
  transform: translateY(-4px);
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}

.dt-panel-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dt-panel-number {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.12);
  letter-spacing: -0.05em;
  line-height: 1;
}

.dt-panel-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.dt-feature-panel:hover .dt-panel-icon-wrapper {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.dt-panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.dt-panel-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.55;
}

/* Headline overlay */
.dt-showcase-title-block {
  position: absolute;
  top: 60px;
  left: 6%;
  z-index: 12;
  text-align: left;
  max-width: 600px;
  pointer-events: none;
}

.dt-showcase-eyebrow {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 14px;
  border-radius: 100px;
  margin-bottom: 12px;
}

.dt-showcase-heading {
  font-family: 'Georgia', serif;
  font-size: clamp(24px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: -1px;
  color: #ffffff;
}
.dt-showcase-heading span {
  color: #ffffff;
}

/* Hover prompt overlay instruction */
.dt-interactive-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.75;
  animation: pulse-opacity 2s infinite alternate;
  pointer-events: none;
}
@keyframes pulse-opacity {
  0% { opacity: 0.4; }
  100% { opacity: 0.9; }
}

@media (max-width: 1100px) {
  .dt-showcase-panels-overlay {
    padding: 80px 3%;
  }
  .dt-left-column, .dt-right-column {
    width: 250px;
    gap: 20px;
  }
}

@media (max-width: 900px) {
  .dt-showcase-section {
    height: auto;
    min-height: auto;
    max-height: none;
    padding: 60px 20px;
  }
  .dt-showcase-media-container {
    position: relative;
    width: 100%;
    height: 450px;
    border-radius: 24px;
    overflow: hidden;
    margin-top: 100px;
    margin-bottom: 40px;
  }
  .dt-showcase-panels-overlay {
    position: relative;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .dt-left-column, .dt-right-column {
    width: 100%;
  }
  .dt-showcase-title-block {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    margin-bottom: 20px;
  }
  .dt-system-telemetry, .dt-interactive-hint {
    display: none !important;
  }
}
`;

const DigitalTwinSection = () => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const radiusVal = useMotionValue(0);
  const [radius, setRadius] = useState(0);

  // Synchronize MotionValue to React state for clip-path rendering
  useEffect(() => {
    const unsubscribe = radiusVal.on('change', (latest) => {
      setRadius(latest);
    });
    return () => unsubscribe();
  }, [radiusVal]);

  const handleMouseEnter = () => {
    setHovered(true);
    animate(radiusVal, 220, { duration: 0.4, ease: 'easeOut' });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    animate(radiusVal, 0, { duration: 0.3, ease: 'easeIn' });
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  // Smooth, organic fluid blob shape following the mouse cursor
  const getSmoothBlob = (cx, cy, r) => {
    if (r === 0) return 'polygon(0% 0%, 0% 0%)';
    const numPoints = 36; // High density polygon for smooth rounded curves
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints;
      // Fluid wave formula creating smooth, organic lobes
      const factor = 1 + 0.12 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5);
      const radiusWithNoise = r * factor;
      const x = cx + Math.cos(angle) * radiusWithNoise;
      const y = cy + Math.sin(angle) * radiusWithNoise;
      points.push(`${Math.round(x)}px ${Math.round(y)}px`);
    }
    return `polygon(${points.join(', ')})`;
  };

  return (
    <>
      <style>{styles}</style>
      <section 
        className="dt-showcase-section" 
        aria-labelledby="dt-showcase-heading"
      >
        {/* Interactive media container */}
        <div 
          className="dt-showcase-media-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {/* Base Layer: AI Digital Twin (always visible in background) */}
          <img 
            src={DigitalTwin02} 
            alt="AI digital twin clone portrait" 
            className="dt-portrait-img dt-portrait-clone"
            style={{ 
              transform: hovered ? 'scale(1.02)' : 'scale(1.0)',
              opacity: 1
            }}
          />

          {/* Reveal Layer: Real Human (sits on top, clipped on hover) */}
          <img 
            src={DigitalTwin01} 
            alt="Real human portrait source" 
            className="dt-portrait-img dt-portrait-real"
            style={{ 
              transform: hovered ? 'scale(0.70)' : 'scale(0.85)',
              clipPath: getSmoothBlob(mousePos.x, mousePos.y, radius)
            }}
          />
        </div>

        {/* Ambient Dark Volumetric Lighting Overlays */}
        <div className="dt-showcase-vignette" />

        {/* Section title header */}
        <div className="dt-showcase-title-block">
          <span className="dt-showcase-eyebrow">Advanced AI Cloning</span>
          <h2 id="dt-showcase-heading" className="dt-showcase-heading">
            Scale Your Presence with <span>Digital Twin</span>
          </h2>
        </div>

        {/* Side Panels - ALWAYS VISIBLE */}
        <div className="dt-showcase-panels-overlay">
          {/* Left Columns - Features 1 and 2 */}
          <div className="dt-left-column">
            <div className="dt-feature-panel">
              <div className="dt-panel-top-row">
                <div className="dt-panel-number">01</div>
                <div className="dt-panel-icon-wrapper"><FiVideo size={16} /></div>
              </div>
              <h3 className="dt-panel-title">Cinematic Digital Twin</h3>
              <p className="dt-panel-desc">
                Generate a photorealistic AI avatar with one click. Replicates your micro‑expressions, gestures, and natural body language in stunning HD quality.
              </p>
            </div>

            <div className="dt-feature-panel">
              <div className="dt-panel-top-row">
                <div className="dt-panel-number">02</div>
                <div className="dt-panel-icon-wrapper"><FiCpu size={16} /></div>
              </div>
              <h3 className="dt-panel-title">Studio‑Grade Lip‑Sync</h3>
              <p className="dt-panel-desc">
                Achieve perfect audiovisual alignment. Matches lip movements, jaw extensions, and facial muscles to any narration script with sub‑frame accuracy.
              </p>
            </div>
          </div>

          {/* Right Columns - Features 3, 4, and 5 */}
          <div className="dt-right-column">
            <div className="dt-feature-panel">
              <div className="dt-panel-top-row">
                <div className="dt-panel-number">03</div>
                <div className="dt-panel-icon-wrapper"><FiMic size={16} /></div>
              </div>
              <h3 className="dt-panel-title">Perfect Voice Cloning</h3>
              <p className="dt-panel-desc">
                Clone your speech signature in seconds. Replicates your native accent, vocal tone, emotional inflections, and unique cadence from a short sample.
              </p>
            </div>

            <div className="dt-feature-panel">
              <div className="dt-panel-top-row">
                <div className="dt-panel-number">04</div>
                <div className="dt-panel-icon-wrapper"><FiGlobe size={16} /></div>
              </div>
              <h3 className="dt-panel-title">80+ Fluent Languages</h3>
              <p className="dt-panel-desc">
                Go global instantly. Speak over 80 languages and dialects fluently while retaining your unique cloned voice and natural speech patterns.
              </p>
            </div>

            <div className="dt-feature-panel">
              <div className="dt-panel-top-row">
                <div className="dt-panel-number">05</div>
                <div className="dt-panel-icon-wrapper"><FiShield size={16} /></div>
              </div>
              <h3 className="dt-panel-title">Likeness Protection</h3>
              <p className="dt-panel-desc">
                Enterprise‑grade security shield. Mandatory biometric consent verification prevents unauthorized likeness generations and safeguards your digital identity.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Indicator Hint */}
        {!hovered && (
          <div className="dt-interactive-hint">
            <span>Hover portrait to scan likeness</span>
            <FiCpu className="pulsing-icon" />
          </div>
        )}
      </section>
    </>
  );
};

export default DigitalTwinSection;
