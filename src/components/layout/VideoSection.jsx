import { useState } from 'react'

const styles = `
.video-section {
  padding: 40px 40px 100px;
  background: #f8faff;
  color: #1e40af;
  position: relative;
  overflow: hidden;
}

.video-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(30,64,175,0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

.video-section-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* Badge */
.video-section-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(30,64,175,0.1) 0%, rgba(59,130,246,0.1) 100%);
  border: 1px solid rgba(30,64,175,0.18);
  color: #1e40af;
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 7px 18px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.video-section-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3b82f6;
  display: inline-block;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

.video-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 20px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1.5px;
}

.video-section-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #64748b;
  margin: 0 auto 20px;
  max-width: 600px;
  line-height: 1.7;
}

.video-section-divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #1e40af, #60a5fa);
  border-radius: 999px;
  margin: 0 auto 60px;
}

/* ── Grid: fixed layout, no shifts ── */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  align-items: stretch;
}

/* ── Card: always same height ── */
.video-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 320px;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(255, 255, 255, 0.8), 0 8px 32px rgba(0, 0, 50, 0.08);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
  flex-shrink: 0;
}

.video-card:hover {
  box-shadow: 0 8px 40px rgba(255, 255, 255, 0.9), 0 16px 48px rgba(0, 0, 80, 0.10);
  transform: translateY(-4px);
}

/* ── Image always fills card ── */
.video-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: transform;
  transition: transform 0.6s ease;
}

.video-card:hover .video-card-image {
  transform: scale(1.07);
}

/* ── Overlay: sits on top of image, slides up on hover ── */
.video-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 20, 60, 0.92) 0%,
    rgba(10, 20, 60, 0.6) 55%,
    rgba(10, 20, 60, 0) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px 22px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.video-card:hover .video-card-overlay {
  opacity: 1;
}

/* Always-visible title strip at bottom */
.video-card-title-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 50px 22px 20px;
  background: linear-gradient(to top, rgba(10,20,60,0.78) 0%, transparent 100%);
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Hide strip when hovered so overlay takes over */
.video-card:hover .video-card-title-strip {
  opacity: 0;
}

.video-card-title {
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Description inside overlay */
.video-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  margin: 12px 0 0;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
}

.video-card:hover .video-card-description {
  opacity: 1;
  transform: translateY(0);
}

/* Title inside overlay */
.video-card-overlay .video-card-title {
  font-size: 20px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.video-card:hover .video-card-overlay .video-card-title {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .video-section {
    padding: 40px 24px 80px;
  }

  .video-section-title {
    font-size: 40px;
  }

  .video-section-subtitle {
    font-size: 18px;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .video-card {
    height: 280px;
  }
}
`

const cards = [
  {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80',
    alt: 'AI-Powered Creation',
    title: 'AI-Powered Creation',
    description: 'Generate professional videos in minutes with our advanced AI technology. Simply provide your content and let the AI handle the rest.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80',
    alt: 'Easy Customization',
    title: 'Easy Customization',
    description: 'Personalize every aspect of your videos with intuitive editing tools. Adjust styles, fonts, colors, and transitions to match your brand.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80',
    alt: 'Multi-Language Support',
    title: 'Multi-Language Support',
    description: 'Create videos in any language with automatic translation features. Reach a global audience with AI-powered voice synthesis.'
  },
]

function VideoSection() {
  return (
    <>
      <style>{styles}</style>
      <section className="video-section">
        <div className="video-section-content">
          <div className="video-section-badge">
            <span className="video-section-badge-dot"></span>
            AI-Powered Tools
          </div>
          <h2 className="video-section-title">
            Create Stunning Videos
          </h2>
          <p className="video-section-subtitle">
            Transform your ideas into engaging video content with our powerful AI tools
          </p>
          <div className="video-section-divider"></div>

          <div className="video-grid">
            {cards.map((card, i) => (
              <div className="video-card" key={i}>
                {/* Always-visible image */}
                <img
                  src={card.image}
                  alt={card.alt}
                  className="video-card-image"
                />
                {/* Always-visible title strip at bottom */}
                <div className="video-card-title-strip">
                  <h3 className="video-card-title">{card.title}</h3>
                </div>

                {/* Overlay: appears on hover over the image */}
                <div className="video-card-overlay">
                  <h3 className="video-card-title">{card.title}</h3>
                  <p className="video-card-description">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default VideoSection
