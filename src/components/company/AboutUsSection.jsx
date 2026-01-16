const styles = `
.about-section {
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.about-section.light {
  background: #ffffff;
  color: #1e40af;
}

.about-section.dark {
  background: #ffffff;
  color: #1e40af;
}

.about-hero {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.about-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.7) 0%, rgba(59, 130, 246, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 72px;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.about-section-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 40px;
}

.about-intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 80px;
}

.about-intro-heading {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
}

.about-intro-heading .heading-part-1 {
  color: #000000;
}

.about-intro-heading .heading-part-2 {
  color: #1e40af;
}

.about-intro-text {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
}

.about-section.light .about-card {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.about-section.dark .about-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.about-card {
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}

.about-section.light .about-card:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
}

.about-section.dark .about-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.about-card:hover {
  transform: translateY(-4px);
}

.about-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 16px;
}

.about-section.light .about-card-title {
  color: #1e40af;
}

.about-section.dark .about-card-title {
  color: #ffffff;
}

.about-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
}

.about-section.light .about-card-description {
  color: #1e40af;
}

.about-section.dark .about-card-description {
  color: rgba(255, 255, 255, 0.9);
}

.about-images-container {
  position: relative;
  margin-top: 60px;
  width: 100%;
}

.about-main-image {
  width: 70%;
  height: 500px;
  object-fit: cover;
  border-radius: 16px;
  position: relative;
}

.about-video-container {
  position: absolute;
  bottom: 80px;
  right: 40px;
  width: 45%;
  height: 350px;
  z-index: 10;
  border: 4px solid #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.about-video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  position: absolute;
  top: 0;
  left: 0;
}

.about-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.about-video-overlay:hover {
  background: rgba(0, 0, 0, 0.3);
}

.about-play-button {
  width: 80px;
  height: 80px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32px;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
  transition: all 0.3s ease;
}

.about-video-overlay:hover .about-play-button {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(239, 68, 68, 0.6);
}

@media (max-width: 768px) {
  .about-hero {
    height: 300px;
  }

  .about-hero-title {
    font-size: 42px;
  }

  .about-section-content {
    padding: 60px 24px;
  }

  .about-intro-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 60px;
  }

  .about-intro-heading {
    font-size: 36px;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 60px;
  }

  .about-images-container {
    margin-top: 40px;
  }

  .about-main-image {
    height: 400px;
  }

  .about-video-container {
    position: relative;
    bottom: auto;
    right: auto;
    width: 100%;
    height: 300px;
    margin-top: 24px;
  }

  .about-play-button {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}
`

function AboutUsSection({ variant = 'light' }) {
  // Placeholder image URL - replace with actual image
  const heroImageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80'
  const mainImageUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80'
  const videoThumbnailUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'

  return (
    <>
      <style>{styles}</style>
      <section id="about-us" className={`about-section ${variant}`}>
        {/* Hero Image with Overlay */}
        <div className="about-hero">
          <img 
            src={heroImageUrl} 
            alt="About Us" 
            className="about-hero-image"
          />
          <div className="about-hero-overlay">
            <h1 className="about-hero-title">About Us</h1>
          </div>
        </div>

        <div className="about-section-content">
          {/* 3-Column Intro Grid */}
          <div className="about-intro-grid">
            <div>
              <h2 className="about-intro-heading">
                <span className="heading-part-1">Introduction To </span>
                <span className="heading-part-2">Best Digital Agency!</span>
              </h2>
            </div>
            <div>
              <p className="about-intro-text">
                We're pioneering the future of video creation with cutting-edge AI technology. Our mission is to democratize professional video production, making it accessible, affordable, and effortless for everyone.
              </p>
            </div>
            <div>
              <p className="about-intro-text">
                With innovative solutions and a commitment to excellence, we empower businesses and creators to tell their stories through powerful, engaging video content that resonates with audiences worldwide.
              </p>
            </div>
          </div>

          {/* Three Cards */}
          <div className="about-content">
            <div className="about-card">
              <h3 className="about-card-title">Our Mission</h3>
              <p className="about-card-description">
                To empower individuals and businesses worldwide with AI-powered video creation tools that break down barriers and unlock creative potential.
              </p>
            </div>

            <div className="about-card">
              <h3 className="about-card-title">Our Vision</h3>
              <p className="about-card-description">
                A world where anyone can create professional-quality video content, regardless of technical expertise or budget constraints.
              </p>
            </div>

            <div className="about-card">
              <h3 className="about-card-title">Our Values</h3>
              <p className="about-card-description">
                Innovation, accessibility, ethical AI development, and a commitment to helping our users tell their stories in the most compelling way possible.
              </p>
            </div>
          </div>

          {/* Two Images Section */}
          <div className="about-images-container">
            <img 
              src={mainImageUrl} 
              alt="Team collaboration" 
              className="about-main-image"
            />
            <div className="about-video-container">
              <img 
                src={videoThumbnailUrl} 
                alt="Video thumbnail" 
                className="about-video-thumbnail"
              />
              <div className="about-video-overlay">
                <div className="about-play-button">
                  ▶
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutUsSection

