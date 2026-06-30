import { motion } from 'framer-motion'
import { FiArrowRight, FiPlay, FiVideo } from 'react-icons/fi'

import temp1 from '../../assets/Template Image/temp1.png'
import temp2 from '../../assets/Template Image/temp2.png'
import temp3 from '../../assets/Template Image/temp3.png'
import temp4 from '../../assets/Template Image/temp4.png'
import temp5 from '../../assets/Template Image/temp5.png'
import temp6 from '../../assets/Template Image/temp6.png'
import temp7 from '../../assets/Template Image/temp7.png'
import temp8 from '../../assets/Template Image/temp8.png'
import temp9 from '../../assets/Template Image/temp9.png'
import temp10 from '../../assets/Template Image/temp10.png'
import temp11 from '../../assets/Template Image/temp11.png'
import temp12 from '../../assets/Template Image/temp12.png'

const TEMPLATE_IMAGES = [
  temp1, temp2, temp3, temp4,
  temp5, temp6, temp7, temp8,
  temp9, temp10, temp11, temp12
]

const EXPLANATIONS = [
  {
    id: "exp-1",
    title: "Life Science Graphics",
    category: "Specialized",
    desc: "Pre-made DNA structures, cell divisions, and clinical trials graphics optimized for scientific research.",
    accentColor: "#3b82f6",
    accentRgb: "59, 130, 246"
  },
  {
    id: "exp-2",
    title: "Corporate Briefings",
    category: "Professional",
    desc: "Polished templates for presenting financial reports, key KPIs, and corporate milestones.",
    accentColor: "#10b981",
    accentRgb: "16, 185, 129"
  },
  {
    id: "exp-3",
    title: "Onboarding & SaaS",
    category: "Product Suite",
    desc: "Interactive dashboards and avatar walkthrough layouts to demonstrate software features.",
    accentColor: "#8b5cf6",
    accentRgb: "139, 92, 246"
  },
  {
    id: "exp-4",
    title: "Educational Lessons",
    category: "Academic",
    desc: "Clear visual structures for teaching physics, math, and humanities with graphical focus.",
    accentColor: "#ef4444",
    accentRgb: "239, 68, 68"
  },
  {
    id: "exp-5",
    title: "Marketing Campaigns",
    category: "Ads & Social",
    desc: "High-impact layouts optimized to grab attention and boost product conversions.",
    accentColor: "#06b6d4",
    accentRgb: "6, 182, 212"
  },
  {
    id: "exp-6",
    title: "Company Onboarding",
    category: "Human Resources",
    desc: "Welcome templates introducing workspace tools, guidelines, and corporate culture.",
    accentColor: "#f59e0b",
    accentRgb: "245, 158, 11"
  }
]

const css = `
/* ────────────────────────────────────────────────────────
   Vertical Infinite Scrolling Grid (35:65 ratio)
   ──────────────────────────────────────────────────────── */
.pts-section {
  position: relative;
  padding: 120px 48px;
  background: #f4f6fa;
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

/* Layout grid - 35% Left (Info), 65% Right (Scroll) */
.pts-layout-grid {
  display: grid;
  grid-template-columns: 35fr 65fr;
  gap: 56px;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Right side (65%) vertical scroll area */
.pts-scroll-wrapper {
  position: relative;
  height: 680px;
  overflow: hidden;
  /* Top & bottom fading mask */
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
}

.pts-scroll-columns-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: 100%;
}

.pts-scroll-column {
  display: flex;
  flex-direction: column;
  height: max-content;
}

.scroll-track-up {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: scroll-up 35s linear infinite;
}

.scroll-track-down {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: scroll-down 35s linear infinite;
}

/* Pausing columns on container hover */
.pts-scroll-wrapper:hover .scroll-track-up,
.pts-scroll-wrapper:hover .scroll-track-down {
  animation-play-state: paused;
}

@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes scroll-down {
  0% {
    transform: translateY(-50%);
  }
  100% {
    transform: translateY(0);
  }
}

/* ─── PURE IMAGE CARD ─── */
.pts-image-card {
  background: #ffffff;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.pts-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ─── EXPLANATION CARD ─── */
.pts-explanation-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  position: relative;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

.pts-card-category-tag {
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--accent-color, #3b82f6);
  margin-bottom: 6px;
}

.pts-card-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.pts-card-desc {
  font-size: 10px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Left Column (35%) styling */
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

.pts-section-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px;
}

.pts-btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.pts-btn-left-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #93c5fd;
  color: #1e3a8a;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
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
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pts-btn-left-outline:hover {
  background: rgba(15, 23, 42, 0.04);
}

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

/* ────────────────────────────────────────────────────────
   Responsive Media Queries
   ──────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .pts-layout-grid {
    grid-template-columns: 40fr 60fr;
    gap: 32px;
  }
}

@media (max-width: 968px) {
  .pts-section {
    padding: 80px 24px;
  }

  .pts-layout-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  
  .pts-info-column {
    align-items: center;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .pts-scroll-wrapper {
    height: 520px;
  }
}

@media (max-width: 576px) {
  .pts-scroll-columns-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pts-scroll-column:nth-child(3) {
    display: none;
  }
  
  .pts-scroll-wrapper {
    height: 420px;
  }
}
`

function ImageCard({ img }) {
  return (
    <div className="pts-image-card">
      <img src={img} alt="Template Preview" className="pts-card-img" />
    </div>
  )
}

function ExplanationCard({ info }) {
  return (
    <div 
      className="pts-explanation-card"
      style={{
        '--accent-color': info.accentColor,
        '--accent-rgb': info.accentRgb
      }}
    >
      <div className="pts-card-category-tag">{info.category}</div>
      <h3 className="pts-card-title">{info.title}</h3>
      <p className="pts-card-desc">{info.desc}</p>
    </div>
  )
}

function TemplatesSection({ onNavigateToSolution }) {
  const handleUseClick = () => {
    onNavigateToSolution && onNavigateToSolution('AI Videos')
  }

  // Column 1: Mix of images and text explanations
  const col1 = [
    { type: 'image', id: 'img-1', data: TEMPLATE_IMAGES[0] },
    { type: 'text', id: 'exp-1', data: EXPLANATIONS[0] },
    { type: 'image', id: 'img-2', data: TEMPLATE_IMAGES[1] },
    { type: 'image', id: 'img-3', data: TEMPLATE_IMAGES[2] },
    { type: 'text', id: 'exp-2', data: EXPLANATIONS[1] },
    { type: 'image', id: 'img-4', data: TEMPLATE_IMAGES[3] }
  ]

  // Column 2: Mix of images and text explanations
  const col2 = [
    { type: 'image', id: 'img-5', data: TEMPLATE_IMAGES[4] },
    { type: 'text', id: 'exp-3', data: EXPLANATIONS[2] },
    { type: 'image', id: 'img-6', data: TEMPLATE_IMAGES[5] },
    { type: 'image', id: 'img-7', data: TEMPLATE_IMAGES[6] },
    { type: 'text', id: 'exp-4', data: EXPLANATIONS[3] },
    { type: 'image', id: 'img-8', data: TEMPLATE_IMAGES[7] }
  ]

  // Column 3: Mix of images and text explanations
  const col3 = [
    { type: 'image', id: 'img-9', data: TEMPLATE_IMAGES[8] },
    { type: 'text', id: 'exp-5', data: EXPLANATIONS[4] },
    { type: 'image', id: 'img-10', data: TEMPLATE_IMAGES[9] },
    { type: 'image', id: 'img-11', data: TEMPLATE_IMAGES[10] },
    { type: 'text', id: 'exp-6', data: EXPLANATIONS[5] },
    { type: 'image', id: 'img-12', data: TEMPLATE_IMAGES[11] }
  ]

  const col1Repeated = [...col1, ...col1]
  const col2Repeated = [...col2, ...col2]
  const col3Repeated = [...col3, ...col3]

  return (
    <>
      <style>{css}</style>
      <section className="pts-section">
        
        {/* Glow Effects */}
        <div className="pts-bg-glows">
          <div className="pts-glow-blue" />
          <div className="pts-glow-purple" />
        </div>

        {/* 35:65 Layout Grid */}
        <div className="pts-layout-grid">
          
          {/* LEFT SIDE (35%): Typography & CTA content */}
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
              World-class templates that <span>empower creators</span>
            </h2>
            
            <p className="pts-section-subtitle">
              Virtual Studio empowers creators to transform text into professional videos with lifelike AI avatars and virtual instructors. Select a pre-designed layout to jumpstart your production.
            </p>

            {/* Button CTA Row */}
            <div className="pts-btn-row">
              <button className="pts-btn-left-primary" onClick={handleUseClick}>
                Get started <FiArrowRight size={13} style={{ marginLeft: 2 }} />
              </button>
              <button className="pts-btn-left-outline" onClick={handleUseClick}>
                <FiPlay size={11} style={{ marginRight: 4, display: 'inline' }} /> How it works
              </button>
            </div>

            {/* Client logos matching mockup style */}
            <div className="pts-partners">
              <div className="pts-partner-row">
                <div className="pts-partner-logo">● Headway</div>
                <div className="pts-partner-logo">brightline</div>
                <div className="pts-partner-logo">hazel</div>
                <div className="pts-partner-logo">G&STC</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE (65%): Infinite Scroll Columns */}
          <div className="pts-scroll-wrapper">
            <div className="pts-scroll-columns-container">
              
              {/* Column 1: Scrolls Up */}
              <div className="pts-scroll-column">
                <div className="scroll-track-up">
                  {col1Repeated.map((item, idx) => (
                    item.type === 'image' ? (
                      <ImageCard key={`col1-img-${item.id}-${idx}`} img={item.data} />
                    ) : (
                      <ExplanationCard key={`col1-exp-${item.id}-${idx}`} info={item.data} />
                    )
                  ))}
                </div>
              </div>

              {/* Column 2: Scrolls Down */}
              <div className="pts-scroll-column">
                <div className="scroll-track-down">
                  {col2Repeated.map((item, idx) => (
                    item.type === 'image' ? (
                      <ImageCard key={`col2-img-${item.id}-${idx}`} img={item.data} />
                    ) : (
                      <ExplanationCard key={`col2-exp-${item.id}-${idx}`} info={item.data} />
                    )
                  ))}
                </div>
              </div>

              {/* Column 3: Scrolls Up */}
              <div className="pts-scroll-column">
                <div className="scroll-track-up">
                  {col3Repeated.map((item, idx) => (
                    item.type === 'image' ? (
                      <ImageCard key={`col3-img-${item.id}-${idx}`} img={item.data} />
                    ) : (
                      <ExplanationCard key={`col3-exp-${item.id}-${idx}`} info={item.data} />
                    )
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>
    </>
  )
}

export default TemplatesSection
