const styles = `
.hero-section {
  min-height: 90vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  filter: blur(20px);
  z-index: 0;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(96, 165, 250, 0.2) 100%);
  z-index: 0;
}

.hero-content {
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: #ffffff;
}

.hero-description {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.primary-cta {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  text-decoration: none;
  width: fit-content;
}

.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.hero-right {
  position: relative;
  height: 600px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 16px;
  height: 100%;
  position: relative;
}

.feature-panel {
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #fbbf24;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.feature-panel:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 2;
}

.feature-panel:nth-child(2) {
  grid-column: 2;
  grid-row: 1 / 3;
  z-index: 2;
}

.feature-panel:nth-child(3) {
  grid-column: 1;
  grid-row: 2 / 3;
  z-index: 1;
}

.feature-panel:nth-child(4) {
  grid-column: 2;
  grid-row: 2 / 4;
  z-index: 2;
}

.feature-panel:nth-child(5) {
  grid-column: 1;
  grid-row: 3 / 4;
  z-index: 1;
}

.feature-panel:nth-child(6) {
  grid-column: 2;
  grid-row: 3 / 4;
  z-index: 1;
}

.feature-panel-image {
  width: 100%;
  height: calc(100% - 50px);
  object-fit: cover;
  display: block;
}

.feature-panel-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  text-align: center;
  border-top: 2px solid #fbbf24;
}

.feature-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.speech-bubble {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 12px;
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #000000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.95);
}

.flag-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: absolute;
  top: 10px;
  right: 10px;
}

.flag-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.envelope-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: absolute;
  top: 10px;
  right: 10px;
}

.envelope-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .hero-right {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 24px;
  }

  .hero-title {
    font-size: 42px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-right {
    height: 400px;
  }

  .features-grid {
    gap: 12px;
  }

  .feature-panel-label {
    font-size: 12px;
    padding: 10px 12px;
  }
}
`

import { MdArrowDownward, MdEmail, MdLanguage } from 'react-icons/md'

function HeroSection() {
  const features = [
    {
      label: 'Interactive Agents',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="speech-bubble" style={{ top: '20px', left: '20px' }}>
            Hello there!
          </div>
          <div className="speech-bubble" style={{ top: '60px', right: '20px' }}>
            How can we help?
          </div>
        </div>
      )
    },
    {
      label: 'Integrations',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&q=80'
    },
    {
      label: 'Video Translate',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="flag-icons">
            {['🇪🇬', '🇮🇳', '🇷🇺', '🇪🇸', '🇫🇷', '🇩🇪', '🇨🇳', '🇯🇵'].map((flag, i) => (
              <div key={i} className="flag-icon">{flag}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      label: 'Video Campaigns',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="envelope-icons">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="envelope-icon">
                <MdEmail />
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      label: 'Premium +',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80'
    },
    {
      label: 'Express Avatars',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&q=80'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Personalized AI Marketing Suite</h1>
            <p className="hero-description">
              Elevate every phase of your marketing funnel with our innovative suite of AI-powered avatars, designed to boost engagement and drive your business growth.
            </p>
            <a href="#" className="primary-cta">
              CONTACT SALES
              <MdArrowDownward style={{ transform: 'rotate(-45deg)' }} />
            </a>
          </div>

          <div className="hero-right">
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-panel">
                  <img 
                    src={feature.image} 
                    alt={feature.label}
                    className="feature-panel-image"
                    loading="lazy"
                  />
                  {feature.overlay}
                  <div className="feature-panel-label">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection

