import { FaMicrophoneAlt, FaLanguage, FaRegSmileBeam } from 'react-icons/fa'
import VideosectionImage from '../../assets/Videosection.PNG'
import ProductVideo from '../../assets/Product.mp4'

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
  margin-bottom: 32px;
}

.product-section-description {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;
}

.product-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* MOCKUP CONTAINER */
.product-mockup-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  overflow: visible;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.product-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 20px;
}

/* BLACK OVERLAY ON IMAGE */
.product-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  pointer-events: none;
  z-index: 1;
}

/* VIDEO CONTAINER - SHIFTED OUTSIDE */
.product-video-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  height: 45%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  /* Shift more to the right to extend outside the image container */
  transform: translate(calc(-50% + 80px), calc(-50% - 8px));
  z-index: 2;
}

.product-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

/* RIGHT SIDE – FEATURE LIST */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255,255,255,0.25);
}

.product-section.light .feature-item {
  border-color: rgba(30,64,175,0.15);
}

.feature-icon {
  font-size: 28px;
  margin-top: 4px;
  color: #fbbf24;
  flex-shrink: 0;
}

.product-section.light .feature-icon {
  color: #f59e0b;
}

.feature-text h3 {
  font-family: 'Georgia', serif;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
}

.feature-text p {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.6;
  opacity: 0.95;
}

.product-cta {
  text-align: center;
  margin-top: 80px;
}

.product-cta-button {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #000;
  padding: 16px 36px;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 16px rgba(251,191,36,0.35);
}

.product-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(251,191,36,0.45);
}

@media (max-width: 968px) {
  .product-grid-container {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .product-mockup-container {
    max-width: 100%;
  }

  .product-video-container {
    width: 80%;
    height: 42%;
    transform: translate(calc(-50% + 50px), calc(-50% - 5px));
  }
}

@media (max-width: 768px) {
  .product-section {
    padding: 80px 24px;
  }

  .product-section-title {
    font-size: 42px;
  }

  .product-mockup-container {
    max-width: 100%;
  }

  .product-video-container {
    width: 75%;
    height: 40%;
    transform: translate(calc(-50% + 35px), calc(-50% - 3px));
    border-radius: 10px;
  }

  .product-video {
    border-radius: 10px;
  }
}
`

function VideoTranslate({ variant = 'dark' }) {
  return (
    <>
      <style>{styles}</style>

      <section className={`product-section ${variant}`}>
        <div className="product-section-content">

          <h1 className="product-section-title">Video Translate</h1>
          <p className="product-section-description">
            Automatically translate your videos into multiple languages with perfect lip-sync and natural voice. Reach global audiences without losing authenticity.
          </p>

          <div className="product-grid-container">

            {/* LEFT - MOCKUP WITH VIDEO OVERLAY */}
            <div className="product-mockup-container">
              <div className="product-image-wrapper">
                <img
                  src={VideosectionImage}
                  alt="Video Translation Mockup"
                  className="product-image"
                />
                <div className="product-image-overlay"></div>
              </div>
              <div className="product-video-container">
                <video
                  className="product-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={ProductVideo} type="video/mp4" />
                </video>
              </div>
            </div>

            {/* RIGHT – CLEAN VERTICAL LIST */}
            <div className="feature-list">

              <div className="feature-item">
                <FaRegSmileBeam className="feature-icon" />
                <div className="feature-text">
                  <h3>Perfect Lip-Sync</h3>
                  <p>
                    AI precisely aligns translated speech with mouth movements,
                    making videos feel naturally recorded in every language.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <FaMicrophoneAlt className="feature-icon" />
                <div className="feature-text">
                  <h3>Natural Voice</h3>
                  <p>
                    Retains the speaker’s tone, emotion, and personality so
                    translations don’t sound robotic or flat.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <FaLanguage className="feature-icon" />
                <div className="feature-text">
                  <h3>Multiple Languages</h3>
                  <p>
                    Translate once and publish everywhere — reach global markets
                    simultaneously without extra production work.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="product-cta">
            <button className="product-cta-button">
              TRY TRANSLATE
            </button>
          </div>

        </div>
      </section>
    </>
  )
}

export default VideoTranslate
