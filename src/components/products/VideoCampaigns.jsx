const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.video-campaigns-section {
  min-height: 80vh;
  padding: 120px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background image with parallax effect */
.video-campaigns-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("/src/assets/Campaign.PNG") center/cover no-repeat;
  z-index: 0;
  transform: scale(1.1);
  transition: transform 0.3s ease-out;
}

.video-campaigns-section:hover::before {
  transform: scale(1.05);
}

/* Enhanced gradient overlay with animation */
.video-campaigns-section::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.88) 0%,
    rgba(59, 130, 246, 0.85) 50%,
    rgba(37, 99, 235, 0.88) 100%
  );
  z-index: 1;
  animation: shimmer 20s infinite linear;
  background-size: 200% 200%;
}

/* Decorative gradient orbs */
.video-campaigns-section {
  background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(30, 64, 175, 0.3) 0%, transparent 50%);
}

/* Main container */
.video-campaigns-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #fff;
  animation: fadeInUp 0.8s ease-out;
}

/* Enhanced title with gradient text */
.video-campaigns-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 72px;
  font-weight: 600;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* Enhanced description */
.video-campaigns-description {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.8;
  max-width: 680px;
  margin: 0 auto 48px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 300;
  letter-spacing: 0.3px;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

/* Enhanced CTA button */
.video-campaigns-cta {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e40af;
  border: none;
  padding: 20px 48px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2),
              0 0 0 0 rgba(255, 255, 255, 0.3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.6s both, float 3s ease-in-out infinite 1s;
}

.video-campaigns-cta::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.video-campaigns-cta:hover::before {
  left: 100%;
}

.video-campaigns-cta:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3),
              0 0 0 4px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
}

.video-campaigns-cta:active {
  transform: translateY(-2px) scale(1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

/* Feature highlights as inline badges */
.video-campaigns-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-top: 56px;
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.feature-badge {
  padding: 12px 24px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.3px;
}

.feature-badge:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 900px) {
  .video-campaigns-content {
    max-width: 100%;
  }

  .video-campaigns-features {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .video-campaigns-section {
    padding: 100px 24px;
    min-height: 75vh;
  }

  .video-campaigns-title {
    font-size: 48px;
    margin-bottom: 24px;
  }

  .video-campaigns-description {
    font-size: 18px;
    margin-bottom: 40px;
    line-height: 1.7;
  }

  .video-campaigns-cta {
    padding: 18px 40px;
    font-size: 16px;
  }

  .feature-badge {
    font-size: 13px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .video-campaigns-title {
    font-size: 40px;
  }

  .video-campaigns-description {
    font-size: 16px;
  }

  .video-campaigns-cta {
    padding: 16px 32px;
    font-size: 14px;
  }
}
`;

function VideoCampaigns() {
  return (
    <>
      <style>{styles}</style>

      <section id="video-campaigns" className="video-campaigns-section">
        <div className="video-campaigns-content">
          <h1 className="video-campaigns-title">Video Campaigns</h1>
          <p className="video-campaigns-description">
            Plan, launch, and scale high-impact video campaigns with tools
            designed for performance-driven teams.
          </p>
          <button className="video-campaigns-cta">
            START YOUR CAMPAIGN
          </button>
          
          <div className="video-campaigns-features">
            <span className="feature-badge">Unified Campaign Control</span>
            <span className="feature-badge">Performance Intelligence</span>
            <span className="feature-badge">Creative A/B Testing</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default VideoCampaigns;
