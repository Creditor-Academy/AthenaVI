const styles = `
.hero-section {
  min-height: 90vh;
  padding: 60px 40px;
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
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -1.5px;
  margin: 0;
  color: #ffffff;
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.primary-cta {
  font-family: 'Inter', sans-serif;
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
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
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
  grid-row: 1;
}

.feature-panel:nth-child(2) {
  grid-column: 2 / 4;
  grid-row: 1 / 3;
}

.feature-panel:nth-child(3) {
  grid-column: 1;
  grid-row: 2 / 4;
}

.feature-panel:nth-child(4) {
  grid-column: 2 / 4;
  grid-row: 3;
}

.feature-panel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  font-family: 'Inter', sans-serif;
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
  .hero-section {
    padding: 60px 40px;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .hero-right {
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 24px;
  }

  .hero-title {
    font-size: 42px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-right {
    max-width: 400px;
  }

  .features-grid {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 15px;
  }

  .hero-right {
    max-width: 350px;
  }

  .features-grid {
    gap: 8px;
  }
}
`

import { MdArrowDownward } from 'react-icons/md'

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
      label: 'Premium +',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80'
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

