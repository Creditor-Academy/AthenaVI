import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiPlay, FiVideo } from 'react-icons/fi'

const PREMIUM_TEMPLATES = [
  {
    id: 1,
    title: "Business Proposal",
    category: "Company",
    duration: "8s",
    transition: "Asymmetric Cover",
    thumb: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "A high-end 5-slide Business Proposal presentation mimicking custom editorial mockups. Features dynamic pie charts, asymmetrical cover layouts, and sleek column arrangements.",
    accentColor: "#3b82f6",
    accentRgb: "59, 130, 246",
    span: 2
  },
  {
    id: 2,
    title: "Women's Wellness",
    category: "Courses",
    duration: "8s",
    transition: "Cross Dissolve",
    thumb: "https://images.pexels.com/photos/3759664/pexels-photo-3759664.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "A beautiful 6-slide wellness self-care tracker designed to present wellness guides, biological routines, and somatic habits.",
    accentColor: "#f472b6",
    accentRgb: "244, 114, 182",
    span: 1
  },
  {
    id: 3,
    title: "Product Demo",
    category: "SaaS Marketing",
    duration: "8s",
    transition: "Slide Left",
    thumb: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "Showcase software product features side-by-side with an engaging virtual instructor.",
    accentColor: "#a855f7",
    accentRgb: "168, 85, 247",
    span: 1
  },
  {
    id: 4,
    title: "Performance Metrics",
    category: "Data Analytics",
    duration: "8s",
    transition: "Zoom In",
    thumb: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "Let statistics and performance charts tell the story. High-fidelity visual metrics and growth charts presented by a digital twin instructor.",
    accentColor: "#10b981",
    accentRgb: "16, 185, 129",
    span: 2
  },
  {
    id: 5,
    title: "AI Integration Flow",
    category: "Technical Overview",
    duration: "8s",
    transition: "Slide Top",
    thumb: "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "Explain complex architectures effortlessly. A futuristic flow layout illustrating technical integrations, system workflows, and machine learning connections.",
    accentColor: "#06b6d4",
    accentRgb: "6, 182, 212",
    span: 1
  },
  {
    id: 6,
    title: "Intro Sequence",
    category: "AI Presentation",
    duration: "8s",
    transition: "Fade Transition",
    thumb: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "Make an unforgettable first impression. High-impact intro scene featuring centered AI avatar presenter.",
    accentColor: "#2563eb",
    accentRgb: "37, 99, 235",
    span: 1
  }
];

const css = `
/* ────────────────────────────────────────────────────────
   Horizontal Scroll Bento Marquee Layout (Reference Design)
   ──────────────────────────────────────────────────────── */
.pts-section {
  position: relative;
  padding: 120px 48px;
  background: #f4f6fa; /* Clean light slate background */
  color: #0f172a;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

/* Background ambient glows */
.pts-bg-glows {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.pts-glow-blue {
  position: absolute;
  top: 10%;
  left: -10%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(80px);
}
.pts-glow-purple {
  position: absolute;
  bottom: 10%;
  right: 5%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(80px);
}

/* 2-Column Split Layout */
.pts-container {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 56px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  align-items: center;
  box-sizing: border-box;
}

/* Left Column: Heading, buttons & partner logos */
.pts-info-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.pts-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
}
.pts-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
  box-shadow: 0 0 6px #2563eb;
  animation: pts-pulse 2s infinite;
}
@keyframes pts-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
.pts-section-title {
  font-family: 'Georgia', serif;
  font-size: clamp(34px, 3.6vw, 44px);
  font-weight: 400;
  color: #0f172a;
  line-height: 1.25;
  letter-spacing: -1.2px;
  margin: 0 0 24px;
}
.pts-section-title span {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button row matching reference image style */
.pts-btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.pts-btn-left-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #93c5fd; /* Soft blue primary button from image */
  color: #1e3a8a;
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(147, 197, 253, 0.3);
}
.pts-btn-left-primary:hover {
  background: #bdd7ff;
  transform: translateY(-1px);
}
.pts-btn-left-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.4);
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pts-btn-left-outline:hover {
  background: rgba(15, 23, 42, 0.04);
}

.pts-section-subtitle {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 320px;
}

/* Partner Logos Section */
.pts-partners {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.pts-partner-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  opacity: 0.65;
}
.pts-partner-logo {
  font-size: 13px;
  font-weight: 850;
  color: #475569;
  letter-spacing: -0.5px;
}
.pts-partner-logo span {
  color: #2563eb;
}

/* Right Column: Horizontally Scrollable Marquee Viewport */
.pts-scroll-column {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 12px 0;
  /* fade edges mask */
  mask-image: linear-gradient(to right, transparent, white 5%, white 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, white 5%, white 95%, transparent);
}

/* Marquee Track */
.pts-marquee-track {
  display: flex;
  gap: 24px;
  width: max-content;
  animation: pts-bento-marquee 40s linear infinite;
}
.pts-marquee-track:hover {
  animation-play-state: paused;
}

@keyframes pts-bento-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    /* Translate exactly by 2 bento groups (1144px width + 24px gap) */
    transform: translateX(-1168px);
  }
}

/* Bento Group Container */
.pts-bento-group {
  display: grid;
  grid-template-columns: repeat(2, 270px);
  grid-template-rows: repeat(2, 210px);
  gap: 20px;
  width: 560px;
  height: 440px;
  flex-shrink: 0;
}

/* Bento Card Style */
.pts-bento-card {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease;
}
.pts-bento-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 20px 40px rgba(var(--accent-rgb), 0.08),
              0 0 0 1px var(--accent);
}

/* Individual placements inside bento grid */
.pts-bento-card-wide {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  width: 560px;
  height: 210px;
}
.pts-bento-card-standard-1 {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  width: 270px;
  height: 210px;
}
.pts-bento-card-standard-2 {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  width: 270px;
  height: 210px;
}

/* Inner Layouts */
.pts-card-inner-wide {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}
.pts-card-inner-wide .pts-card-media {
  width: 50%;
  height: 100%;
  border-bottom: none;
  border-right: 1px solid rgba(15, 23, 42, 0.04);
}
.pts-card-inner-wide .pts-card-info {
  width: 50%;
  height: 100%;
}

.pts-card-inner-standard {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.pts-card-inner-standard .pts-card-media {
  height: 105px;
}
.pts-card-inner-standard .pts-card-info {
  height: 105px;
}

/* Media Areas */
.pts-card-media {
  position: relative;
  overflow: hidden;
  background: #0f172a;
}
.pts-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s ease;
}
.pts-bento-card:hover .pts-card-img {
  transform: scale(1.05);
  opacity: 0.95;
}

/* Float Badge */
.pts-card-float-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  color: #ffffff;
  font-size: 9px;
  font-weight: 600;
}

/* Play Overlays */
.pts-card-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(1px);
  opacity: 0;
  transition: opacity 0.35s ease;
  z-index: 4;
}
.pts-bento-card:hover .pts-card-play-overlay {
  opacity: 1;
}
.pts-card-play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--accent, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding-left: 2px;
}
.pts-card-play-btn:hover {
  transform: scale(1.1);
  background: var(--accent, #2563eb);
  color: #ffffff;
}

/* Progress Timeline */
.pts-card-progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  z-index: 5;
}
.pts-card-progress-bar {
  height: 100%;
  width: 0;
  background: var(--accent, #2563eb);
}
.pts-bento-card:hover .pts-card-progress-bar {
  animation: bento-play-line 3s linear infinite;
}
@keyframes bento-play-line {
  0% { width: 0%; }
  100% { width: 100%; }
}

/* Info Details */
.pts-card-info {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
}
.pts-card-inner-standard .pts-card-info {
  padding: 10px 14px;
}

.pts-card-cat {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent, #2563eb);
  letter-spacing: 1px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pts-card-cat-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}
.pts-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
  margin: 0 0 2px;
  line-height: 1.2;
}
.pts-card-inner-wide .pts-card-title {
  font-size: 17px;
  margin-bottom: 4px;
}
.pts-card-desc {
  font-size: 11px;
  color: #64748b;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pts-card-inner-wide .pts-card-desc {
  -webkit-line-clamp: 3;
}

/* Actions Button Reveal on Hover */
.pts-card-actions {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.pts-bento-card:hover .pts-card-actions {
  max-height: 34px;
  opacity: 1;
  margin-top: 6px;
}
.pts-btn-primary {
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--accent, #2563eb);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(var(--accent-rgb), 0.15);
  width: 100%;
}
.pts-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(var(--accent-rgb), 0.25);
  filter: brightness(1.05);
}

/* Responsive design */
@media (max-width: 1024px) {
  .pts-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .pts-info-column {
    align-items: center;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
  .pts-scroll-column {
    mask-image: none;
    -webkit-mask-image: none;
  }
}

@media (max-width: 768px) {
  .pts-section {
    padding: 80px 20px;
  }
  .pts-scroll-column {
    overflow-x: auto;
  }
  .pts-marquee-track {
    animation: none;
  }
}
`;

function BentoMarqueeCard({ tpl, isWide, standardIndex, onUseClick }) {
  const innerClass = isWide ? 'pts-card-inner-wide' : 'pts-card-inner-standard'
  const placementClass = isWide 
    ? 'pts-bento-card-wide' 
    : (standardIndex === 1 ? 'pts-bento-card-standard-1' : 'pts-bento-card-standard-2')

  return (
    <div
      className={`pts-bento-card ${placementClass}`}
      style={{
        '--accent': tpl.accentColor,
        '--accent-rgb': tpl.accentRgb
      }}
    >
      <div className={innerClass}>
        
        {/* Media Area */}
        <div className="pts-card-media">
          <img
            src={tpl.thumb}
            alt={tpl.title}
            className="pts-card-img"
          />
          <span className="pts-card-float-badge">
            <FiVideo size={11} />
            {tpl.duration}
          </span>
          
          {/* Play Overlay */}
          <div className="pts-card-play-overlay">
            <div className="pts-card-play-btn" onClick={onUseClick}>
              <FiPlay size={16} />
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="pts-card-progress-track">
            <div className="pts-card-progress-bar" />
          </div>
        </div>

        {/* Info Details */}
        <div className="pts-card-info">
          <div className="pts-card-main-info">
            <div className="pts-card-cat">
              <span className="pts-card-cat-dot" />
              {tpl.category}
            </div>
            <h3 className="pts-card-title">{tpl.title}</h3>
            <p className="pts-card-desc">{tpl.desc}</p>
          </div>

          {/* Actions Button */}
          <div className="pts-card-actions">
            <button className="pts-btn-primary" onClick={onUseClick}>
              Use Template <FiArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function BentoGroup({ groupIndex, templates, onUseClick }) {
  // Group 0: Top = templates[0], BottomLeft = templates[1], BottomRight = templates[2]
  // Group 1: Top = templates[3], BottomLeft = templates[4], BottomRight = templates[5]
  const tplTop = groupIndex === 0 ? templates[0] : templates[3]
  const tplBottomLeft = groupIndex === 0 ? templates[1] : templates[4]
  const tplBottomRight = groupIndex === 0 ? templates[2] : templates[5]

  return (
    <div className="pts-bento-group">
      <BentoMarqueeCard tpl={tplTop} isWide={true} onUseClick={onUseClick} />
      <BentoMarqueeCard tpl={tplBottomLeft} isWide={false} standardIndex={1} onUseClick={onUseClick} />
      <BentoMarqueeCard tpl={tplBottomRight} isWide={false} standardIndex={2} onUseClick={onUseClick} />
    </div>
  )
}

function TemplatesSection({ onNavigateToSolution }) {
  const handleUseClick = () => {
    onNavigateToSolution && onNavigateToSolution('AI Videos')
  }

  return (
    <>
      <style>{css}</style>
      <section className="pts-section">
        
        {/* Glow Effects */}
        <div className="pts-bg-glows">
          <div className="pts-glow-blue" />
          <div className="pts-glow-purple" />
        </div>

        {/* Split Container */}
        <div className="pts-container">
          
          {/* LEFT COLUMN: Reference-styled headings & info */}
          <motion.div
            className="pts-info-column"
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="pts-eyebrow">
              <span className="pts-eyebrow-dot" />
              Template Library
            </div>
            <h2 className="pts-section-title">
              World-class templates that<span> empower creators</span>
            </h2>
            
            {/* Button CTA Row */}
            <div className="pts-btn-row">
              <button className="pts-btn-left-primary" onClick={handleUseClick}>
                Get started <FiArrowRight size={13} style={{ marginLeft: 2 }} />
              </button>
              <button className="pts-btn-left-outline" onClick={handleUseClick}>
                <FiPlay size={11} style={{ marginRight: 4, display: 'inline' }} /> How it works
              </button>
            </div>

            <p className="pts-section-subtitle">
              AthenaVI collaborates with professional-led teams to foster the creation of premium life science, corporate, and educational videos.
            </p>

            {/* Client logos matching reference mockup */}
            <div className="pts-partners">
              <div className="pts-partner-row">
                <div className="pts-partner-logo">● Headway</div>
                <div className="pts-partner-logo">brightline</div>
                <div className="pts-partner-logo">hazel</div>
                <div className="pts-partner-logo">G&STC</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Infinite Scrolling Bento Marquee */}
          <div className="pts-scroll-column">
            <div className="pts-marquee-track">
              <BentoGroup groupIndex={0} templates={PREMIUM_TEMPLATES} onUseClick={handleUseClick} />
              <BentoGroup groupIndex={1} templates={PREMIUM_TEMPLATES} onUseClick={handleUseClick} />
              {/* Duplicate groups to make loop seamless */}
              <BentoGroup groupIndex={0} templates={PREMIUM_TEMPLATES} onUseClick={handleUseClick} />
              <BentoGroup groupIndex={1} templates={PREMIUM_TEMPLATES} onUseClick={handleUseClick} />
            </div>
          </div>

        </div>

      </section>
    </>
  )
}

export default TemplatesSection
