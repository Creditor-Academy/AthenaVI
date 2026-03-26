import { useRef } from 'react'
import { MdArrowOutward, MdSchool, MdAutoAwesome, MdRocketLaunch, MdInsights } from 'react-icons/md'
import BgImage from '../../assets/Bg.png'

/* 3D tilt card — follows cursor */
function StepCard({ icon, number, title, description }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left   // cursor X inside card
    const y = e.clientY - rect.top    // cursor Y inside card
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateY = ((x - cx) / cx) * 10   // max ±10deg
    const rotateX = -((y - cy) / cy) * 8    // max ±8deg
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)'
  }

  return (
    <div
      ref={cardRef}
      className="step-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s' }}
    >
      <div className="step-icon">{icon}</div>
      <div className="step-number">{number}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-description">{description}</p>
    </div>
  )
}

const styles = `
.product-section {
  min-height: 100vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-section.light {
  background: #f0f4ff;
  color: #0f172a;
}

.product-section.dark {
  background: #f0f4ff;
  color: #0f172a;
}

.product-section-content {
  max-width: 1200px;
  width: 100%;
}

.hero-section {
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  margin-top: -120px;
  margin-bottom: 0;
  background-size: cover;
  background-position: center right;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: 600px;
  padding: 160px 80px 100px;
  border-radius: 0;
  box-sizing: border-box;
}

/* Dark gradient overlay — readable on left, fades to transparent on right */
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(1, 8, 36, 0.92) 0%,
    rgba(1, 8, 36, 0.75) 45%,
    rgba(1, 8, 36, 0.25) 70%,
    transparent 100%
  );
  z-index: 0;
}

.hero-left {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 580px;
}

/* Override text colors for background-image hero */
.hero-section .eyebrow-text {
  color: rgba(147, 197, 253, 0.9) !important;
  letter-spacing: 3px;
}

.hero-section .hero-title {
  color: #ffffff !important;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: -1.5px;
  line-height: 1.2;
  font-size: 55px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}

.hero-section .hero-description {
  color: rgba(226, 232, 240, 0.88) !important;
}



/* ── Hero right interactive zone ── */
.hero-right-zone {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 55%;
  z-index: 2;
  pointer-events: none;
}

/* Invisible hotspot over the orb */
.orb-hotspot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-60%, -55%);
  width: 260px;
  height: 260px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
}

/* AI Agent label — hidden by default, shows on hover */
.orb-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  font: 700 18px/1 Arial, sans-serif;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 12px 24px;
  border-radius: 100px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translate(-50%, -50%) scale(0.9);
}

.orb-hotspot:hover .orb-label {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* ── Floating step badges ── */
.step-badge {
  position: absolute;
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.3);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  animation: step-float 4s ease-in-out infinite;
  transition: background 0.25s, transform 0.25s;
}

.step-badge:hover {
  background: rgba(255,255,255,0.28);
  transform: scale(1.12) !important;
}

/* Per-badge positions around the orb */
.step-badge:nth-child(2) { top: 15%;  left: 30%; animation-delay: 0s;   }
.step-badge:nth-child(3) { top: 20%;  left: 65%; animation-delay: 0.8s; }
.step-badge:nth-child(4) { bottom: 22%; left: 20%; animation-delay: 1.6s; }
.step-badge:nth-child(5) { bottom: 18%; left: 62%; animation-delay: 2.4s; }

@keyframes step-float {
  0%, 100% { translate: 0 0; }
  50%       { translate: 0 -12px; }
}

/* Tooltip that appears on hover */
.step-badge-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background: rgba(10, 20, 60, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  font: 600 12px/1.3 Arial, sans-serif;
  white-space: nowrap;
  padding: 8px 14px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.step-badge-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(10,20,60,0.85);
}

.step-badge:hover .step-badge-tooltip {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.eyebrow-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}

.product-section.light .eyebrow-text {
  color: rgba(30, 64, 175, 0.6);
}

.product-section.dark .eyebrow-text {
  color: rgba(255, 255, 255, 0.7);
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
}

.product-section.light .hero-title {
  color: #1e40af;
}

.product-section.dark .hero-title {
  color: #ffffff;
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  margin: 0;
}

.product-section.light .hero-description {
  color: rgba(30, 64, 175, 0.8);
}

.product-section.dark .hero-description {
  color: rgba(255, 255, 255, 0.9);
}

.hero-cta-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.primary-cta {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  width: fit-content;
}

.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.secondary-cta {
  font-family: 'Inter', sans-serif;
  background: transparent;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  width: fit-content;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

.product-section.light .secondary-cta {
  color: #1e40af;
  text-decoration-color: rgba(30, 64, 175, 0.4);
}

.product-section.dark .secondary-cta {
  color: #ffffff;
  text-decoration-color: rgba(255, 255, 255, 0.4);
}

.secondary-cta:hover {
  opacity: 0.8;
}



.how-it-works-section {
  position: relative;
  left: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  box-sizing: border-box;
  padding: 50px 80px;
  background: #f0f4ff;
}

.how-it-works-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.product-section.light .how-it-works-section {
  border-color: transparent;
}

.product-section.dark .how-it-works-section {
  border-color: transparent;
}

.how-it-works-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 42px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 12px;
  color: #0f172a;
}

.how-it-works-sub {
  text-align: center;
  font: 400 16px/1.6 Arial, sans-serif;
  color: #64748b;
  margin: 0 0 40px;
}

.how-it-works-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
}

/* ── Step card ── */
.step-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  cursor: default;
  position: relative;
  overflow: hidden;
}

.step-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.step-card:hover {
  background: linear-gradient(135deg, #3f2feeff 0%, #4f6df1ff 100%);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-4px);
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.35), 0 0 60px rgba(59, 130, 246, 0.15);
}

/* Make all text clearly visible on the gradient hover background */
.step-card:hover .step-number {
  color: rgba(255, 255, 255, 0.85);
}

.step-card:hover .step-title {
  color: #ffffff;
}

.step-card:hover .step-description {
  color: rgba(255, 255, 255, 0.9);
}

.step-card:hover .step-icon {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

/* No special highlight card — all cards uniform */
/* Step icon */
.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.step-card .step-icon {
  background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(29,78,216,0.12) 100%);
  color: #3b82f6;
}

.step-number {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
}

.step-card .step-number {
  color: #3b82f6;
}

.step-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: #0f172a;
}

.step-description {
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  line-height: 1.65;
  margin: 0;
}

.step-card .step-description {
  color: #64748b;
}

@media (max-width: 1024px) {
  .hero-section {
    padding: 140px 48px 80px;
    min-height: 500px;
    margin-left: -40px;
    margin-right: -40px;
  }
  .hero-section .hero-title {
    font-size: 44px;
  }
}

@media (max-width: 768px) {
  .product-section {
    padding: 80px 24px;
  }

  .hero-section {
    padding: 120px 28px 70px;
    min-height: 460px;
    margin-left: -24px;
    margin-right: -24px;
  }

  .hero-title, .hero-section .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 16px;
  }

  .how-it-works-section {
    padding: 70px 28px;
  }

  .how-it-works-title {
    font-size: 32px;
  }

  .how-it-works-steps {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
`

function VisualAIAgents({ variant = 'light' }) {
  return (
    <>
      <style>{styles}</style>
      <section id="visual-ai-agents" className={`product-section ${variant}`}>
        <div className="product-section-content">
          {/* Hero Section */}
          <div className="hero-section" style={{ backgroundImage: `url(${BgImage})` }}>
            {/* Left Content */}
            <div className="hero-left">
              <p className="eyebrow-text">AI-Powered Agents</p>
              <h1 className="hero-title">
                Create AI Agents That Know Everything About Your Business
              </h1>
              <p className="hero-description">
                Redefining digital connections. Craft a lifelike conversational AI Agent that knows everything about you, your products, and services, all while reflecting your brand's look, voice, and tone.
              </p>
              <div className="hero-cta-group">
                <button className="primary-cta">
                  BUILD AN AGENT
                  <MdArrowOutward />
                </button>
                <button className="secondary-cta">
                  Watch Demo
                  <MdArrowOutward />
                </button>
              </div>
            </div>

            {/* Right interactive zone — orb hotspot + step badges */}
            <div className="hero-right-zone">
              {/* Orb hotspot: hover shows AI Agent */}
              <div className="orb-hotspot">
                <span className="orb-label">✦ AI Agent</span>
              </div>
              {/* Step 1 */}
              <div className="step-badge">
                <MdSchool />
                <span className="step-badge-tooltip">Train Your Agent</span>
              </div>
              {/* Step 2 */}
              <div className="step-badge">
                <MdAutoAwesome />
                <span className="step-badge-tooltip">Customize Appearance</span>
              </div>
              {/* Step 3 */}
              <div className="step-badge">
                <MdRocketLaunch />
                <span className="step-badge-tooltip">Deploy &amp; Engage</span>
              </div>
              {/* Step 4 */}
              <div className="step-badge">
                <MdInsights />
                <span className="step-badge-tooltip">Learn &amp; Improve</span>
              </div>
            </div>

            {/* Right Visual removed — orb lives in background */}
          </div>

          {/* How the Agent Works Section */}
          <div className="how-it-works-section">
            <div className="how-it-works-inner">
              <p style={{ textAlign: 'center', color: '#60a5fa', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 12px' }}>How It Works</p>
              <h2 className="how-it-works-title">How the Agent Works</h2>
              <p className="how-it-works-sub">Four powerful steps to make your AI agent live and learning.</p>
              <div className="how-it-works-steps">
                <StepCard
                  icon={<MdSchool />}
                  number="01 — Train"
                  title="Train Your Agent"
                  description="Upload your knowledge base, documents, and product information. Our AI learns everything about your business, services, and brand."
                />
                <StepCard
                  icon={<MdAutoAwesome />}
                  number="02 — Design"
                  title="Customize Appearance"
                  description="Design your agent’s look, voice, and personality to perfectly match your brand identity. Choose from templates or create custom designs."
                />
                <StepCard
                  icon={<MdRocketLaunch />}
                  number="03 — Launch"
                  title="Deploy & Engage"
                  description="Launch your AI agent across your website, apps, or platforms. It engages with customers 24/7, answering questions and providing support."
                />
                <StepCard
                  icon={<MdInsights />}
                  number="04 — Grow"
                  title="Learn & Improve"
                  description="Your agent continuously learns from interactions, improving responses and adapting to customer needs over time with advanced analytics."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default VisualAIAgents
