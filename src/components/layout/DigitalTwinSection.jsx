import React from 'react';
import { FiShield, FiMic, FiGlobe, FiVideo, FiCpu } from 'react-icons/fi';

import DigitalTwin03 from '../../assets/digitaltwin04.png';

const styles = `
.dt-showcase-section {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 750px;
  max-height: 950px;
  background: radial-gradient(circle at 50% 30%, #080f26 0%, #040817 60%, #01020a 100%);
  overflow: hidden;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* Base image background styling */
.dt-showcase-media-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.dt-portrait-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
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
  font-family: 'Inter', sans-serif;
  font-size: clamp(24px, 3vw, 42px);
  font-weight: 800;
  letter-spacing: -1px;
  color: #ffffff;
}
.dt-showcase-heading span {
  color: #ffffff;
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
  return (
    <>
      <style>{styles}</style>
      <section
        className="dt-showcase-section"
        aria-labelledby="dt-showcase-heading"
      >
        {/* Background media container */}
        <div className="dt-showcase-media-container">
          <img
            src={DigitalTwin03}
            alt="AI digital twin clone portrait background"
            className="dt-portrait-img"
          />
        </div>

        {/* Ambient Dark Volumetric Lighting Overlays */}
        <div className="dt-showcase-vignette" />

        {/* Section title header */}
        <div className="dt-showcase-title-block">
          {/* <span className="dt-showcase-eyebrow">Advanced AI Cloning</span> */}
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
                Generate a photorealistic AI avatar with one click. Replicates your micro‑expressions, gestures, and body language in stunning HD quality.
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
                Go global instantly. Speak over 80 languages and dialects fluently while retaining your unique cloned voice and speech patterns.
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
      </section>
    </>
  );
};

export default DigitalTwinSection;
