import React from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineArrowUpRight,
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineArrowUp
} from 'react-icons/hi2'

/* Implementation of the Rotating "Watch Video" Hub matching the reference position and scale */
const SameSamePlayHub = () => {
  return (
    <div className="same-play-hub-wrapper">
      <div className="same-play-hub-circle">
        <div className="same-play-hub-text-path">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path id="sameCirclePath" d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
            <text fill="#ffffff" style={{ fontSize: '7px', fontWeight: '800', letterSpacing: '2.2px', textTransform: 'uppercase' }}>
              <textPath xlinkHref="#sameCirclePath">
                WATCH VIDEO OF THE ACTION • WATCH VIDEO OF THE ACTION •
              </textPath>
            </text>
          </svg>
        </div>
        <div className="same-play-hub-btn">
          <HiOutlinePlay style={{ fill: '#1e40af' }} />
        </div>
      </div>
    </div>
  )
}

const styles = `
.cb-hero-section {
  padding: 50px 24px 100px;
  background: #ffffff;
  color: #0f172a;
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.cb-hero-container {
  max-width: 1350px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 80px;
  align-items: center;
}

.cb-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(69, 106, 255, 0.08); 
  color: #1e40af;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  width: fit-content;
  border: 1px solid rgba(52, 66, 255, 0.15);
  margin-bottom: 40px;
}

.cb-hero-left {
  margin-top: -100px;
}

.cb-hero-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 64px;
  line-height: 1.02;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 28px;
  line-height: 1.1;
}

.cb-hero-subheading {
  font-size: 20px;
  color: #475569;
  line-height: 1.65;
  max-width: 650px;
  margin-bottom: 32px;
  font-weight: 500;
}

.cb-supporting-line {
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
  padding-left: 24px;
  border-left: 4px solid #1e40af;
  max-width: 580px;
  line-height: 1.55;
  margin-bottom: 40px;
}

.cb-hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cb-btn-primary {
  background: linear-gradient(90deg, #3854b1 60%, #2182e3 100%);
  color: #ffffff;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(56, 84, 177, 0.25);
}

.cb-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(56, 84, 177, 0.35);
}

.cb-btn-secondary {
  background: transparent;
  color: #3b82f6;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  border: 2px solid #3b82f6;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.cb-btn-secondary:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* RIGHT SECTION - 1:1 "Same Same" Overhaul */

.cb-hero-right {
  position: relative;
  display: grid;
  grid-template-columns: 240px 1fr 165px;
  gap: 20px;
}

.same-card-orange {
  grid-column: 1 / 2;
  background: #1e40af;
  border-radius: 40px; 
  padding: 32px 28px;
  color: #ffffff;
  position: relative;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.white-line-deco {
  width: 1px;
  height: 24px;
  background: #ffffff;
  opacity: 0.6;
  margin-bottom: 20px;
}

.avatar-row-stack {
  display: flex;
  margin-bottom: 24px;
}

.avatar-circ {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #1e40af;
  margin-left: -12px;
  background: #f1f5f9;
  overflow: hidden;
}

.avatar-circ:first-child { margin-left: 0; }
.avatar-circ img { width: 100%; height: 100%; object-fit: cover; }

.val-heavy-num { 
  font-size: 54px; 
  font-weight: 900; 
  line-height: 1; 
  margin-bottom: 12px; 
  font-family: 'Outfit', sans-serif; 
}
.val-sub-msg { 
  font-size: 11px; 
  color: #ffffff;
  opacity: 1; 
  line-height: 1.5; 
  font-weight: 500; 
  max-width: 160px;
}

/* Center Hub exactly in the gap */
.same-play-hub-wrapper {
  position: absolute;
  top: 205px;
  left: -48px;
  z-index: 100;
}

.same-play-hub-circle {
  width: 115px;
  height: 115px;
  background: #0f172a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  border: 4px solid #ffffff;
}

.same-play-hub-text-path {
  width: 100%;
  height: 100%;
  position: absolute;
  animation: rotationLoop 15s linear infinite;
}

@keyframes rotationLoop {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.same-play-hub-btn {
  width: 44px;
  height: 44px;
  color: #1e40af;
  font-size: 32px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Exact Growth Card */
.same-card-graph {
  grid-column: 1 / 2;
  background: #1e40af;
  border-radius: 40px;
  padding: 32px 28px;
  color: #ffffff;
  height: 200px;
  margin-top: 20px;
  position: relative;
}

.graph-heading { font-size: 12px; font-weight: 700; opacity: 1; margin-bottom: 28px; display: block; }

.graph-bars-area {
  height: 80px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  position: relative;
}

.thick-bar { width: 28px; background: #ffffff; border-radius: 3px 3px 0 0; }
.bar-s { height: 35%; opacity: 0.85; }
.bar-m { height: 55%; opacity: 0.95; }
.bar-m2 { height: 45%; opacity: 0.9; }
.bar-l { height: 85%; opacity: 1; }
.bar-xl { 
  height: 100%; 
  opacity: 1; 
  background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.8) 100%);
  box-shadow: 5px 0 15px rgba(0,0,0,0.05);
}

.same-arrow-graph {
  position: absolute;
  top: -12px;
  right: 12px;
  font-size: 36px;
  opacity: 0.8;
  color: #ffffff;
}

/* Images Matching the reference perfectly */
.woman-expert-visual {
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  border-radius: 40px; 
  overflow: hidden;
  height: 480px;
  position: relative;
}
.woman-expert-visual img { width: 100%; height: 100%; object-fit: cover; }

.team-collaboration-visual {
  grid-column: 1 / 3;
  border-radius: 40px;
  overflow: hidden;
  height: 230px;
  margin-top: -5px;
}
.team-collaboration-visual img { width: 100%; height: 100%; object-fit: cover; }

/* Far Right Navy Pills precisely aligned */
.same-stat-column {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-40%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
}

.stat-box-navy {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #347effff;
  border-radius: 16px;
  padding: 18px 24px;
  color: #ffffff;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  width: 170px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-box-navy:hover {
  transform: translateX(10px);
  background: rgba(15, 23, 42, 1);
  border-left-width: 6px;
  box-shadow: 0 20px 50px rgba(255, 103, 52, 0.2);
}

.st-label-orange { 
  font-size: 11px; 
  text-transform: uppercase; 
  color: rgba(255, 255, 255, 0.85); 
  font-weight: 700; 
  letter-spacing: 0.05em; 
  display: block; 
}

.st-value-orange { 
  font-family: 'Outfit', sans-serif; 
  font-size: 30px; 
  font-weight: 800; 
  color: #ffffff; 
  line-height: 1; 
}

@media (max-width: 1200px) {
  .cb-hero-container { grid-template-columns: 1fr; }
  .cb-hero-right { max-width: 850px; margin: 0 auto; grid-template-columns: 1fr 1.5fr; }
  .same-stat-column { grid-column: 1 / 3; flex-direction: row; flex-wrap: wrap; margin-top: 20px; }
}
`

const HeroSection = () => {
  return (
    <section className="cb-hero-section">
      <style>{styles}</style>

      <div className="cb-hero-container">
        {/* Left Side Content */}
        <div className="cb-hero-left">
          <motion.div
            className="cb-hero-badge"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <HiOutlineSparkles />
            AI Powered Development
          </motion.div>

          <motion.h1
            className="cb-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            E-Learning & Corporate Training Videos Powered by AI
          </motion.h1>

          <motion.p
            className="cb-hero-subheading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Create engaging training videos at scale for onboarding, internal communication,
            and employee development using generative AI.
          </motion.p>

          <motion.div
            className="cb-supporting-line"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Turn simple text, documents, or audio into professional learning videos
            with AI instructors in minutes.
          </motion.div>

          <motion.div
            className="cb-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a href="#" className="cb-btn-primary">Get Started for Free</a>
            <a href="#" className="cb-btn-secondary">
              <HiOutlineArrowUpRight />
              Watch Demo
            </a>
          </motion.div>
        </div>

        <motion.div
          className="cb-hero-right"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          {/* Circular Play Hub exactly positioned */}
          <SameSamePlayHub />

          {/* Top Left Card (Orange) */}
          <div className="same-card-orange">
            <div className="white-line-deco" />
            <div className="avatar-row-stack">
              <div className="avatar-circ"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" /></div>
              <div className="avatar-circ"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" /></div>
              <div className="avatar-circ"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" /></div>
            </div>
            <div className="val-heavy-num">124K+</div>
            <p className="val-sub-msg">More than 2,000 people has joined us</p>
          </div>

          {/* Bottom Left Card (Orange Chart) */}
          <div className="same-card-graph">
            <span className="graph-heading">Successful growth</span>
            <div className="graph-bars-area">
              <div className="thick-bar bar-s"></div>
              <div className="thick-bar bar-m"></div>
              <div className="thick-bar bar-m2"></div>
              <div className="thick-bar bar-l"></div>
              <div className="thick-bar bar-xl"></div>
              <div className="same-arrow-graph"><HiOutlineArrowUp /></div>
            </div>
          </div>

          {/* Main Visual (Expert with Tablet in Orange) */}
          <div className="woman-expert-visual">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Learning Expert" />
          </div>

          {/* Bottom Team Visual */}
          <div className="team-collaboration-visual">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" alt="Collaboration" />
          </div>

          {/* Far Right Stats Column matching reference styles */}
          <div className="same-stat-column">
            <div className="stat-box-navy">
              <span className="st-label-orange">AI Video Generation </span>
            </div>
            <div className="stat-box-navy">
                <span className="st-label-orange">No Studio Required</span>
            </div>
            <div className="stat-box-navy">
                <span className="st-label-orange">Instant Updates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
