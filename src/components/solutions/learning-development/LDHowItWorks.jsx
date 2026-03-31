import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlineUserCircle, 
  HiOutlineGlobeAlt, 
  HiOutlineClock, 
  HiOutlineDocumentText, 
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineMicrophone,
  HiOutlineArrowRight
} from 'react-icons/hi2'

const styles = `
.ld-how-it-works {
  padding: 80px 24px;
  background: #fdfdfd;
  position: relative;
  overflow: hidden;
}

.ld-how-container {
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Updated Header Styles - Following Inter Guideline */
.ld-how-header {
  text-align: center;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.ld-workflow-badge {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  padding: 8px 24px;
  background: #ffffff;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.ld-how-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 60px;
  font-weight: 400;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -2px;
  background: linear-gradient(180deg, #0f172a 0%, #324a6aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.ld-how-subtitle {
  font-size: 20px;
  color: #64748b;
  max-width: 850px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
  opacity: 0.9;
}

/* 2-Column Grid */
.ld-how-split {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 100px;
  align-items: center;
  margin-bottom: 80px;
}

/* Step Cards */
.ld-steps-list {
  display: flex;
  flex-direction: column;
  gap: 36px;
  position: relative;
}

.ld-step-item {
  display: flex;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #97c8ffff 0%, #ffffff 50%, #d1e8ffff 100%);
  border-radius: 28px;
  border: 1px solid rgba(37, 99, 235, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  width: 550px;
}

.ld-step-item:hover {
  transform: translateX(12px);
  border-color: #2563eb;
  box-shadow: 0 20px 50px -15px rgba(37, 99, 235, 0.15);
}

.ld-step-num-float {
  position: absolute;
  top: -24px;
  left: -24px;
  width: 52px;
  height: 52px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 26px;
  font-weight: 800;
  color: #2563eb;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  z-index: 10;
  transition: all 0.4s ease;
}

.ld-step-item:hover .ld-step-num-float {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  transform: scale(1.1);
}

.ld-step-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ld-step-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.ld-step-desc {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #64748b;
  line-height: 1.65;
}

/* PREMIUM SHOWCASE */
.ld-premium-showcase {
  position: relative;
  padding: 40px;
}

.ld-ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140%;
  height: 140%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 60%);
  z-index: -1;
  pointer-events: none;
}

.ld-laptop-frame {
  position: relative;
  perspective: 2000px;
  z-index: 2;
}

.ld-laptop-main {
  background: #1e293b;
  border: 14px solid #0f172a;
  border-radius: 36px;
  box-shadow: 0 50px 100px -20px rgba(0,0,0,0.4);
  overflow: hidden;
  position: relative;
  aspect-ratio: 16/10;
  transform: rotateY(-12deg) rotateX(4deg);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.ld-laptop-main:hover {
  transform: rotateY(-1deg) rotateX(0deg) scale(1.02);
}

.ld-screen-content {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

.ld-screen-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

.ld-play-portal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 42px;
  cursor: pointer;
  z-index: 10;
}

.ld-play-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid rgba(37, 99, 235, 0.4);
}

.ld-status-panel {
  position: absolute;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.5);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  z-index: 100;
}

.ld-panel-top { top: -20px; right: -20px; }
.ld-panel-bottom { bottom: -30px; left: -40px; }

.ld-ui-icon-round {
  width: 44px;
  height: 44px;
  background: #2563eb;
  color: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.ld-ui-text { display: flex; flex-direction: column; }
.ld-ui-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.ld-ui-value { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: #0f172a; }

/* CREATE VIDEO CALL TO ACTION */
.ld-how-footer {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.ld-btn-create-video {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 44px;
  background: #2563eb;
  color: #ffffff;
  border-radius: 99px;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.3);
  border: none;
  cursor: pointer;
}

.ld-btn-create-video:hover {
  transform: translateY(-8px) scale(1.02);
  background: #1d4ed8;
  box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.5);
}

.ld-btn-icon-grow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.ld-btn-create-video:hover .ld-btn-icon-grow {
  transform: translateX(8px);
}

@media (max-width: 1024px) {
  .ld-how-split { grid-template-columns: 1fr; gap: 80px; }
  .ld-laptop-main { transform: none !important; }
  .ld-panel-top, .ld-panel-bottom { display: none; }
  .ld-how-title { font-size: 32px; }
}
`

const stepsData = [
  {
    icon: <HiOutlineUserCircle />,
    title: "Select AI Avatar",
    desc: "Choose a digital instructor from an elite library of lifelike avatars or instantly create one from a photo."
  },
  {
    icon: <HiOutlineGlobeAlt />,
    title: "Global Voice Sync",
    desc: "Seamlessly translate your content into 60+ languages with studio-quality AI voices."
  },
  {
    icon: <HiOutlineClock />,
    title: "Set Course Parameters",
    desc: "Precision control over video length and format to meet specialized training standards."
  },
  {
    icon: <HiOutlineDocumentText />,
    title: "Smart Content Input",
    desc: "Simply drop your PDFs or text scripts. Our AI handles the heavy lifting of video structuring."
  },
  {
    icon: <HiOutlinePlay />,
    title: "Generate & Deploy",
    desc: "One click transforms your raw data into a high-performance training video ready for your global LMS."
  }
]

const LDHowItWorks = () => {
  return (
    <section className="ld-how-it-works">
      <style>{styles}</style>
      <div className="ld-how-container">
        {/* Header */}
        <motion.div 
          className="ld-how-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="ld-workflow-badge">Experience Workflow</div>
          <h2 className="ld-how-title">Process for AI-Powered Learning</h2>
          <p className="ld-how-subtitle">
            Experience a frictionless, high-fidelity AI workflow. We’ve automated the production pipeline 
            so you can focus on delivering impactful educational content.
          </p>
        </motion.div>

        <div className="ld-how-split">
          {/* Left Side: Steps */}
          <div className="ld-steps-list">
            {stepsData.map((step, index) => (
              <motion.div
                key={index}
                className="ld-step-item"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="ld-step-num-float">{index + 1}</div>
                <div className="ld-step-text">
                  <h3 className="ld-step-title">{step.title}</h3>
                  <p className="ld-step-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side: PREMIUM PRODUCT SHOWCASE */}
          <div className="ld-premium-showcase">
            <div className="ld-ambient-glow"></div>
            <div className="ld-laptop-frame">
              {/* Floating Top Panel */}
              <motion.div 
                className="ld-status-panel ld-panel-top"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.5 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="ld-ui-icon-round" style={{ background: '#10b981' }}>
                  <HiOutlineMicrophone />
                </div>
                <div className="ld-ui-text">
                  <span className="ld-ui-label">Voice Matching</span>
                  <span className="ld-ui-value">Natural AI Sync...</span>
                </div>
              </motion.div>

              {/* Main Laptop */}
              <motion.div 
                className="ld-laptop-main"
                initial={{ opacity: 0, rotateY: -20 }}
                whileInView={{ opacity: 1, rotateY: -12 }}
                transition={{ duration: 1.5 }}
              >
                <div className="ld-screen-content">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" alt="Training Platform" />
                  <motion.div className="ld-play-portal" whileHover={{ scale: 1.1 }}>
                    <HiOutlinePlay />
                    <motion.div 
                      className="ld-play-pulse"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Bottom Panel */}
              <motion.div 
                className="ld-status-panel ld-panel-bottom"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.8 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="ld-ui-icon-round">
                  <HiOutlineCheckCircle />
                </div>
                <div className="ld-ui-text">
                  <span className="ld-ui-label">Quality Assurance</span>
                  <span className="ld-ui-value">HD Video Export Ready</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CREATE VIDEO CTA BUTTON */}
        <motion.div 
          className="ld-how-footer"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.button 
            className="ld-btn-create-video"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Video Now
            <HiOutlineArrowRight className="ld-btn-icon-grow" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default LDHowItWorks
