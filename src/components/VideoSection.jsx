import { MdArrowOutward } from 'react-icons/md'

const styles = `
.video-section {
  padding: 100px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%);
  color: #1e40af;
}

.video-section-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.video-section-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(24px, 3vw, 40px);
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 24px;
  color: #1e40af;
}

.video-section-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #3b82f6;
  margin: 0 0 60px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 60px;
}

.video-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(30, 64, 175, 0.15);
}

.video-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  margin: 0;
  padding: 0;
}

.video-card-content {
  padding: 24px;
}

.video-card-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(24px, 2.5vw, 32px);
  font-weight: 600;
  line-height: 1.25;
  color: #1e40af;
  margin: 0 0 12px;
}

.video-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #3b82f6;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .video-section {
    padding: 60px 24px;
  }

  .video-section-title {
    font-size: 40px;
  }

  .video-section-subtitle {
    font-size: 18px;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
`

function VideoSection() {
  return (
    <>
      <style>{styles}</style>
      <section className="video-section">
        <div className="video-section-content">
          <h2 className="video-section-title">
            Create Stunning Videos
          </h2>
          <p className="video-section-subtitle">
            Transform your ideas into engaging video content with our powerful AI tools
          </p>
          <div className="video-grid">
            <div className="video-card">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80"
                alt="AI-Powered Creation"
                className="video-card-image"
              />
              <div className="video-card-content">
                <h3 className="video-card-title">AI-Powered Creation</h3>
                <p className="video-card-description">
                  Generate professional videos in minutes with our advanced AI technology
                </p>
              </div>
            </div>
            <div className="video-card">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80"
                alt="Easy Customization"
                className="video-card-image"
              />
              <div className="video-card-content">
                <h3 className="video-card-title">Easy Customization</h3>
                <p className="video-card-description">
                  Personalize every aspect of your videos with intuitive editing tools
                </p>
              </div>
            </div>
            <div className="video-card">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
                alt="Multi-Language Support"
                className="video-card-image"
              />
              <div className="video-card-content">
                <h3 className="video-card-title">Multi-Language Support</h3>
                <p className="video-card-description">
                  Create videos in any language with automatic translation features
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default VideoSection

