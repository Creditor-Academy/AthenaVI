import { MdArrowDownward, MdTrendingUp, MdPeople, MdLanguage, MdVideoLibrary } from 'react-icons/md'

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
  background-image: url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&q=80');
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

.hero-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stat-value {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 32px;
  font-weight: 500;
  color: #fbbf24;
}

.hero-stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: rgba(251, 191, 36, 0.95);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sales-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(251, 191, 36, 0.95);
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

  .hero-stats {
    gap: 24px;
  }

  .hero-stat-value {
    font-size: 28px;
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

  .hero-stats {
    gap: 20px;
  }

  .hero-stat-value {
    font-size: 24px;
  }

  .hero-right {
    max-width: 350px;
  }

  .features-grid {
    gap: 8px;
  }
}
`

function HeroSection() {
  const features = [
    {
      label: 'Personalized Outreach',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="feature-icon">
            <MdPeople />
          </div>
        </div>
      )
    },
    {
      label: 'Sales Videos',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop&q=80',
      badge: 'AI Powered'
    },
    {
      label: 'Multi-Language',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="feature-icon">
            <MdLanguage />
          </div>
        </div>
      )
    },
    {
      label: 'Video Library',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&q=80',
      overlay: (
        <div className="feature-overlay">
          <div className="feature-icon">
            <MdVideoLibrary />
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Transform Your Sales Strategy with AI</h1>
            <p className="hero-description">
              In today's competitive sales landscape, grabbing your prospects' attention has never been more important. Athena VI focuses on harnessing state-of-the-art artificial intelligence to produce customized, compelling video materials that enable sales teams to achieve remarkable results across all their interactions.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">82%</div>
                <div className="hero-stat-label">Higher Engagement</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">3x</div>
                <div className="hero-stat-label">Faster Response</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">120+</div>
                <div className="hero-stat-label">Languages</div>
              </div>
            </div>
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
                  {feature.badge && (
                    <div className="sales-badge">{feature.badge}</div>
                  )}
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
