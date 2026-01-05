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
  margin: 0 0 40px;
}

.product-section.light .product-section-title {
  color: #1e40af;
}

.product-section.dark .product-section-title {
  color: #ffffff;
}

.product-section-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.product-section.light .product-section-description {
  color: #1e40af;
}

.product-section.dark .product-section-description {
  color: rgba(255, 255, 255, 0.9);
}

.product-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 60px;
}

.product-section.light .product-feature {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.product-section.dark .product-feature {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.product-feature {
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}

.product-section.light .product-feature:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
}

.product-section.dark .product-feature:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.product-feature:hover {
  transform: translateY(-4px);
}

.product-feature-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 16px;
}

.product-section.light .product-feature-title {
  color: #1e40af;
}

.product-section.dark .product-feature-title {
  color: #ffffff;
}

.product-feature-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.product-section.light .product-feature-description {
  color: #1e40af;
}

.product-section.dark .product-feature-description {
  color: rgba(255, 255, 255, 0.9);
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

@media (max-width: 768px) {
  .product-section {
    padding: 80px 24px;
  }

  .product-section-title {
    font-size: 42px;
  }

  .product-section-description {
    font-size: 18px;
  }

  .product-features {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
`

function PersonalAvatars({ variant = 'light' }) {
  return (
    <>
      <style>{styles}</style>
      <section id="personal-avatars" className={`product-section ${variant}`}>
        <div className="product-section-content">
          <h1 className="product-section-title">Personal Avatars</h1>
          <p className="product-section-description">
            Create your own digital avatar that looks, sounds, and moves like you. Perfect for personalized video content, presentations, and virtual interactions.
          </p>
          
          <div className="product-features">
            <div className="product-feature">
              <h3 className="product-feature-title">Realistic Appearance</h3>
              <p className="product-feature-description">
                Generate photorealistic avatars that capture your unique features, expressions, and personality with incredible detail.
              </p>
            </div>
            <div className="product-feature">
              <h3 className="product-feature-title">Voice Cloning</h3>
              <p className="product-feature-description">
                Replicate your voice with precision, maintaining your natural tone, accent, and speaking style for authentic audio.
              </p>
            </div>
            <div className="product-feature">
              <h3 className="product-feature-title">Dynamic Movements</h3>
              <p className="product-feature-description">
                Avatars that move naturally with realistic gestures, facial expressions, and body language for engaging presentations.
              </p>
            </div>
          </div>

          <div className="product-cta">
            <button className="product-cta-button">
              CREATE AVATAR
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default PersonalAvatars

