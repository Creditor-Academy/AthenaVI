import bgvideo from "../../assets/bgvideo.mp4";

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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.video-campaigns-section {
  min-height: 100vh;
  padding: 50px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background Video */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Dark overlay for readability */
.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* Content container */
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

/* Title */
.video-campaigns-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 72px;
  font-weight: 600;
  margin-bottom: 32px;
  line-height: 1.1;
}

/* Description */
.video-campaigns-description {
  font-family: Arial, sans-serif;
  font-size: 22px;
  line-height: 1.8;
  max-width: 680px;
  margin: 0 auto 48px;
}

/* CTA Button */
.video-campaigns-cta {
  background: #ffffff;
  color: #1e40af;
  border: none;
  padding: 20px 48px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out 0.6s both, float 3s ease-in-out infinite 1s;
}

.video-campaigns-cta:hover {
  transform: translateY(-4px);
}

/* Feature badges */
.video-campaigns-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-top: 56px;
}

.feature-badge {
  padding: 12px 24px;
  border-radius: 30px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  font-size: 14px;
}

/* Responsive */

@media (max-width: 768px) {

  .video-campaigns-section {
    padding: 100px 24px;
  }

  .video-campaigns-title {
    font-size: 48px;
  }

  .video-campaigns-description {
    font-size: 18px;
  }

  .video-campaigns-cta {
    padding: 18px 40px;
    font-size: 16px;
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

        {/* Background Video */}
        <video
          className="video-bg"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={bgvideo} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="video-overlay"></div>

        {/* Content */}
        <div className="video-campaigns-content">

          <h1 className="video-campaigns-title">
            Video Campaigns
          </h1>

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