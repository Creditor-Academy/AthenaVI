import { MdChat, MdCode, MdAutoAwesome, MdSettings, MdSchool, MdArrowOutward } from 'react-icons/md'

const styles = `
.product-section {
  min-height: 100vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-section.light {
  background: #ffffff;
  color: #1e40af;
}

.product-section.dark {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.product-section-content {
  max-width: 1200px;
  width: 100%;
}

.hero-section {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 60px;
  align-items: center;
  margin-bottom: 120px;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.hero-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.mascot-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-illustration {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: rotate(-5deg);
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15));
  z-index: 2;
}

.floating-badge {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: float 3s ease-in-out infinite;
  z-index: 3;
}

.product-section.light .floating-badge {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e40af;
  border: 2px solid rgba(30, 64, 175, 0.1);
}

.product-section.dark .floating-badge {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  color: #1e40af;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.floating-badge:nth-child(1) {
  top: 10%;
  right: 10%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.floating-badge:nth-child(2) {
  top: 50%;
  left: -5%;
  animation-delay: 0.5s;
  transform: rotate(-10deg);
}

.floating-badge:nth-child(3) {
  bottom: 15%;
  right: 5%;
  animation-delay: 1s;
  transform: rotate(20deg);
}

.floating-badge:nth-child(4) {
  top: 25%;
  left: 15%;
  animation-delay: 1.5s;
  transform: rotate(-15deg);
}

.floating-badge:nth-child(5) {
  bottom: 30%;
  left: 5%;
  animation-delay: 2s;
  transform: rotate(10deg);
}

.floating-badge:nth-child(6) {
  top: 5%;
  left: 50%;
  animation-delay: 2.5s;
  transform: rotate(-5deg);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-15px) rotate(var(--rotation, 0deg));
  }
}

.how-it-works-section {
  margin-top: 120px;
  padding-top: 80px;
  border-top: 1px solid;
}

.product-section.light .how-it-works-section {
  border-color: rgba(30, 64, 175, 0.1);
}

.product-section.dark .how-it-works-section {
  border-color: rgba(255, 255, 255, 0.1);
}

.how-it-works-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 42px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 60px;
}

.product-section.light .how-it-works-title {
  color: #1e40af;
}

.product-section.dark .how-it-works-title {
  color: #ffffff;
}

.how-it-works-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.step-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-number {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1;
  margin: 0;
}

.product-section.light .step-number {
  color: rgba(30, 64, 175, 0.2);
}

.product-section.dark .step-number {
  color: rgba(255, 255, 255, 0.2);
}

.step-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.product-section.light .step-title {
  color: #1e40af;
}

.product-section.dark .step-title {
  color: #ffffff;
}

.step-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.product-section.light .step-description {
  color: rgba(30, 64, 175, 0.8);
}

.product-section.dark .step-description {
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .hero-right {
    min-height: 400px;
  }

  .mascot-container {
    max-width: 350px;
    height: 350px;
  }
}

@media (max-width: 768px) {
  .product-section {
    padding: 80px 24px;
  }

  .hero-title {
    font-size: 42px;
  }

  .hero-description {
    font-size: 16px;
  }

  .how-it-works-title {
    font-size: 36px;
  }

  .how-it-works-steps {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .mascot-container {
    max-width: 300px;
    height: 300px;
  }

  .floating-badge {
    width: 60px;
    height: 60px;
    font-size: 24px;
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
          <div className="hero-section">
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

            {/* Right Visual */}
            <div className="hero-right">
              <div className="mascot-container">
                {/* AI Mascot Illustration - using placeholder */}
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop&q=80"
                  alt="AI Agent Mascot"
                  className="mascot-illustration"
                />
                {/* Floating Badges */}
                <div className="floating-badge" style={{ '--rotation': '15deg' }}>
                  <MdChat />
                </div>
                <div className="floating-badge" style={{ '--rotation': '-10deg' }}>
                  <MdCode />
                </div>
                <div className="floating-badge" style={{ '--rotation': '20deg' }}>
                  <MdAutoAwesome />
                </div>
                <div className="floating-badge" style={{ '--rotation': '-15deg' }}>
                  <MdSettings />
                </div>
                <div className="floating-badge" style={{ '--rotation': '10deg' }}>
                  <MdSchool />
                </div>
                <div className="floating-badge" style={{ '--rotation': '-5deg' }}>
                  <MdAutoAwesome />
                </div>
              </div>
            </div>
          </div>

          {/* How the Agent Works Section */}
          <div className="how-it-works-section">
            <h2 className="how-it-works-title">How the Agent Works</h2>
            <div className="how-it-works-steps">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3 className="step-title">Train Your Agent</h3>
                <p className="step-description">
                  Upload your knowledge base, documents, and product information. Our AI learns everything about your business, services, and brand.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h3 className="step-title">Customize Appearance</h3>
                <p className="step-description">
                  Design your agent's look, voice, and personality to perfectly match your brand identity. Choose from templates or create custom designs.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h3 className="step-title">Deploy & Engage</h3>
                <p className="step-description">
                  Launch your AI agent across your website, apps, or platforms. It engages with customers 24/7, answering questions and providing support.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">04</div>
                <h3 className="step-title">Learn & Improve</h3>
                <p className="step-description">
                  Your agent continuously learns from interactions, improving responses and adapting to customer needs over time with advanced analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default VisualAIAgents
