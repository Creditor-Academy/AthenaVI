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
  max-width: 1400px;
  width: 100%;
}

.product-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 60px;
}

.product-section.light .product-section-title {
  color: #1e40af;
}

.product-section.dark .product-section-title {
  color: #ffffff;
}

.product-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 24px;
  margin-top: 60px;
  min-height: 600px;
}

.product-grid-card {
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

.product-grid-card.light-beige {
  background: #f5f5dc;
  color: #1e40af;
}

.product-grid-card.light-purple {
  background: #e6e6fa;
  color: #1e40af;
}

.product-grid-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  grid-row: 1 / 3;
}

.product-grid-column:first-child {
  grid-column: 1;
}

.product-grid-column:last-child {
  grid-column: 3;
}

.product-grid-card-text {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 16px;
}

.product-grid-card-stat {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  margin: 0 0 8px;
}

.product-grid-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.8;
}

.product-grid-image {
  border-radius: 16px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}

.product-grid-image-container {
  border-radius: 16px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 280px;
}

.product-grid-center {
  grid-row: 1 / 3;
  grid-column: 2;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 100%;
}

.product-grid-center-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-grid-center-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.product-grid-center-stat {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 16px;
}

.product-grid-center-text {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  max-width: 400px;
}

.product-cta {
  text-align: center;
  margin-top: 60px;
}

.product-cta-button {
  font-family: 'Arial', sans-serif;
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
}

.product-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

@media (max-width: 1024px) {
  .product-grid-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .product-grid-center {
    grid-row: auto;
    grid-column: 1;
    min-height: 400px;
  }

  .product-grid-column {
    grid-row: auto;
    grid-column: 1;
  }

  .product-grid-image-container {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .product-section {
    padding: 80px 24px;
  }

  .product-section-title {
    font-size: 42px;
  }

  .product-grid-card {
    padding: 24px;
  }

  .product-grid-card-stat {
    font-size: 36px;
  }

  .product-grid-center-stat {
    font-size: 48px;
  }

  .product-grid-center-text {
    font-size: 16px;
  }
}
`

function CreativeRealityStudio({ variant = 'light' }) {
  return (
    <>
      <style>{styles}</style>
      <section id="creative-reality-studio" className={`product-section ${variant}`}>
        <div className="product-section-content">
          <h1 className="product-section-title">Creative Reality™ Studio</h1>
          
          <div className="product-grid-layout">
            {/* First Column: Text Card on top, Image below */}
            <div className="product-grid-column">
              <div className="product-grid-card light-beige">
                <p className="product-grid-card-text">
                  Our advanced AI-powered platform ensures you deliver engaging, high-quality virtual instruction that meets the highest educational standards.
                </p>
                <div className="product-grid-card-stat">99.8%</div>
                <p className="product-grid-card-description">Student Satisfaction</p>
              </div>
              <div className="product-grid-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop" 
                  alt="Virtual classroom instruction" 
                  className="product-grid-image"
                />
              </div>
            </div>

            {/* Second Column: Full image with overlay text (spans 2 rows) - CENTER */}
            <div className="product-grid-center">
              <img 
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop" 
                alt="Creative studio professional" 
                className="product-grid-center-image"
              />
              <div className="product-grid-center-overlay">
                <div className="product-grid-center-stat">98%</div>
                <p className="product-grid-center-text">
                  Completion Rate. Students consistently complete courses with our engaging virtual instruction platform.
                </p>
              </div>
            </div>

            {/* Third Column: Image on top, Text Card below */}
            <div className="product-grid-column">
              <div className="product-grid-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                  alt="Virtual instructor platform" 
                  className="product-grid-image"
                />
              </div>
              <div className="product-grid-card light-purple">
                <div className="product-grid-card-stat">10K+</div>
                <p className="product-grid-card-description">
                  Active Learners. Empower your students with interactive virtual instruction and personalized learning experiences.
                </p>
              </div>
            </div>
          </div>

          <div className="product-cta">
            <button className="product-cta-button">
              EXPLORE STUDIO
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default CreativeRealityStudio

