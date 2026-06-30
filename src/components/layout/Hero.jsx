import { useEffect, useState } from 'react'
import { MdArrowOutward } from 'react-icons/md'

import HeroArcGallery from './HeroArcGallery'
import heygenService from '../../services/heygenService'
import { extractHeygenList, mapAvatarGroup } from '../../utils/heygenAvatars'

const styles = `
.hero-container {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(circle at 50% 30%, #080f26 0%, #040817 60%, #01020a 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  color: #f1f5f9;
  padding-top: 130px;
  padding-bottom: 40px;
  box-sizing: border-box;
}

/* Elegant bottom gradient border line */
.hero-container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 25%, rgba(255, 224, 130, 0.15) 50%, rgba(147, 51, 234, 0.2) 75%, transparent 100%);
  z-index: 15;
  pointer-events: none;
}

/* Background Graphics Container */
.hero-bg-graphics {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

/* Ambient Dynamic Glow Orbs */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.18;
  will-change: transform;
}

.hero-orb-1 {
  top: 5%;
  left: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #06b6d4 0%, rgba(6, 182, 212, 0) 70%);
  animation: floatOrb1 22s infinite ease-in-out alternate;
}

.hero-orb-2 {
  bottom: 5%;
  right: 10%;
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, #8b5cf6 0%, rgba(147, 51, 234, 0) 70%);
  animation: floatOrb2 28s infinite ease-in-out alternate;
}

.hero-orb-3 {
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 650px;
  height: 650px;
  background: radial-gradient(circle, #3b82f6 0%, rgba(59, 130, 246, 0) 70%);
  animation: floatOrb3 35s infinite ease-in-out alternate;
}

/* Tech Dot Matrix Grid Layer */
.hero-dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px);
  background-size: 40px 40px;
  background-position: center;
  mask-image: radial-gradient(circle at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%);
  -webkit-mask-image: radial-gradient(circle at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%);
  z-index: 2;
}

/* Cyber orbits SVG layer */
.hero-tech-orbits {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 850px;
  height: 850px;
  z-index: 3;
  opacity: 0.45;
  pointer-events: none;
  animation: slowSpin 80s linear infinite;
  mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%);
}

@keyframes floatOrb1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(60px, 90px) scale(1.1); }
}

@keyframes floatOrb2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-90px, -60px) scale(0.95); }
}

@keyframes floatOrb3 {
  0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  50% { transform: translate(-46%, -54%) scale(1.05) rotate(180deg); }
  100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); }
}

@keyframes slowSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}


.hero-copy {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 10;
}

.hero-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 16px;
}

.hero-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 75%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px;
  line-height: 1.15;
  letter-spacing: -1.5px;
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(16px, 2vw, 18px);
  color: #94a3b8;
  margin: 0 auto 36px;
  font-weight: 400;
  line-height: 1.7;
  max-width: 580px;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-cta .btn-primary {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 50%, #ff8f00 100%);
  border: none;
  color: #030712;
  padding: 14px 30px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(255, 179, 0, 0.35);
  letter-spacing: 0.5px;
}

.hero-cta .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 179, 0, 0.5), 0 0 15px rgba(255, 224, 130, 0.2);
  background: linear-gradient(135deg, #fff3e0 0%, #ffe082 50%, #ffb300 100%);
}

.hero-cta .btn-outline {
  font-family: 'Inter', sans-serif;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #f1f5f9;
  padding: 14px 30px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.hero-cta .btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
}

.hero-gallery-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  position: relative;
  z-index: 5;
}

.hero-cards-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 40px;
  max-width: 900px;
  margin: 48px auto 64px;
  padding: 0 24px;
  width: 100%;
  position: relative;
  z-index: 5;
}

@media (max-width: 1024px) {
  .hero-cards-row {
    flex-direction: column;
    align-items: center;
    gap: 32px;
    margin: 40px auto 56px;
  }

  .hero-cards-row .left-card-wrapper,
  .hero-cards-row .right-card-container {
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    min-height: 100vh;
    min-height: 100dvh;
    padding-top: 100px;
    padding-bottom: 24px;
  }

  .hero-copy {
    padding: 0 20px 32px;
  }

  .hero-title {
    font-size: 36px;
    letter-spacing: -1px;
  }

  .hero-subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }

  .hero-cta {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta .btn-primary,
  .hero-cta .btn-outline {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .hero-cards-row {
    margin: 32px auto 48px;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
    line-height: 1.15;
  }

  .hero-subtitle {
    font-size: 15px;
    line-height: 1.55;
  }
}

`

function Hero() {
  const [avatarsList] = useState([
    /* ── Target avatars in sequence (1 → 7) ── */
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_target.mp4', name: 'Noah', role: 'Technical Expert' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_target+(1).mp4', name: 'Liam', role: 'Virtual Studio' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_target+(2).mp4', name: 'Lucas', role: 'Product Presenter' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_target+(6).mp4', name: 'Mia', role: 'Brand Storyteller' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_target+(7).mp4', name: 'Zara', role: 'Sales Presenter' },
    /* ── Talk avatars ── */
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_talk_1.mp4', name: 'Ava', role: 'Digital Assistant' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_talk_2.mp4', name: 'Ethan', role: 'AI Video Assistant' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_talk_2+(1).mp4', name: 'Oliver', role: 'Digital Host' },
    { src: 'https://testing-vi.s3.us-east-1.amazonaws.com/Hero+Video/preview_video_talk_3.mp4', name: 'Olivia', role: 'Language Coach' },
  ])

  useEffect(() => {
    // HeyGen image fetching disabled to display local high-fidelity videos in the hero marquee instead of static images
  }, [])


  return (
    <>
      <style>{styles}</style>
      <div className="hero-container">
        {/* Modern Graphic Background Elements */}
        <div className="hero-bg-graphics">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-dot-grid" />
          <div className="hero-tech-orbits">
            <svg viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="500" cy="500" r="400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="500" cy="500" r="300" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="1.5" />
              <circle cx="500" cy="500" r="200" stroke="rgba(255, 224, 130, 0.03)" strokeWidth="1" strokeDasharray="20 10 5 10" />
              <circle cx="500" cy="100" r="4" fill="rgba(59, 130, 246, 0.3)" />
              <circle cx="500" cy="300" r="3" fill="rgba(255, 179, 0, 0.3)" />
            </svg>
          </div>
        </div>

        <div className="hero-copy">
          <h1 className="hero-title">
            Create AI-Powered Videos
            <br />
            That Speak Your Language
          </h1>
          <p className="hero-subtitle">
            Transform text into engaging video content with lifelike AI avatars.
            Create professional videos in minutes, not hours.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn-primary">
              Request Early Access
              <MdArrowOutward />
            </button>
            <button type="button" className="btn-outline">
              CONTACT SALES
              <MdArrowOutward />
            </button>
          </div>
        </div>

        <div className="hero-gallery-bleed">
          <HeroArcGallery avatars={avatarsList} fullWidth />
        </div>
      </div>
    </>
  )
}

export default Hero
