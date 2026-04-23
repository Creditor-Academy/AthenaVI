import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdArrowOutward, MdPayments } from 'react-icons/md'
import { HiTrendingUp } from 'react-icons/hi'
import avatar1 from '../../assets/Avatarr1.png'
import avatar2 from '../../assets/Avatarr2.png'
import avatar3 from '../../assets/Avatarr3.png'
import avatar4 from '../../assets/Avatarr4.png'
import avatar5 from '../../assets/Avatarr5.png'
import LeftCard from './LeftCard'
import RightCardCarousel from './RightCardCarousel'

const styles = `
.hero-container {
  width: 100%;
  min-height: 85vh;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
}

.hero-top {
  position: relative;
  width: 100%;
  padding: 40px 40px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  text-align: center;
}

.hero-title-top {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 550;
  color: #ffffff;
  margin: 0 0 24px;
  line-height: 1.1;
  letter-spacing: -2px;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
}

.hero-subtitle-top {
  font-family: 'Inter', sans-serif;
  font-size: clamp(15px, 2vw, 18px);
  color: rgba(255, 255, 255, 0.9);
  margin: 0 auto;
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: 0;
  text-align: center;
  max-width: 700px;
  padding: 0 20px;
}

.hero-avatars {
  position: relative;
  width: 100%;
  min-height: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  overflow: visible;
  padding: 40px 20px;
}

.hero-avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 150px;
  width: 100%;
  max-width: 1800px;
  position: relative;
  padding: 0 60px;
  margin-top: -20px;
}

.center-avatar-wrapper {
  position: relative;
  width: 450px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1500px;
}

.hero-cube-container {
  width: 320px;
  height: 400px;
  position: relative;
  transform-style: preserve-3d;
}

.hero-cube {
  width: 100%;
  height: 100%;
  position: absolute;
  transform-style: preserve-3d;
  animation: rotateCube 20s linear infinite;
}

.cube-face {
  position: absolute;
  width: 320px;
  height: 400px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.2) 100%);
  backdrop-filter: blur(25px);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 35px;
  backface-visibility: visible;
  transition: all 0.5s ease;
  overflow: hidden;
}

.cube-face-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

/* Floating Neon Ring under avatar */
.cube-face-content::after {
  content: '';
  position: absolute;
  bottom: 85px;
  width: 160px;
  height: 60px;
  border: 2px solid rgba(251, 191, 36, 0.4);
  border-radius: 50%;
  transform: rotateX(75deg);
  box-shadow: 
    0 0 25px rgba(251, 191, 36, 0.2),
    inset 0 0 15px rgba(251, 191, 36, 0.2);
  z-index: 0;
  animation: floatRing 4s ease-in-out infinite;
}

@keyframes floatRing {
  0%, 100% { transform: rotateX(75deg) translateY(0) scale(1); opacity: 0.4; }
  50% { transform: rotateX(75deg) translateY(-15px) scale(1.1); opacity: 0.7; }
}

.cube-face img {
  width: 90%;
  height: 280px;
  object-fit: contain;
  filter: drop-shadow(0 15px 30px rgba(0,0,0,0.3));
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  /* Fade out the bottom to hide sharp cuts */
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.cube-face-label {
  text-align: center;
  z-index: 10;
  padding: 0px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.face-name {
  display: block;
  font-family: 'Georgia', serif;
  font-size: 26px;
  font-weight: 650;
  background: linear-gradient(to bottom, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.face-role {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #d97706; /* Darker amber for contrast on white */
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
}

.face-0 { 
  transform: rotateY(0deg) translateZ(220px); 
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow: 0 15px 45px rgba(59, 130, 246, 0.25), inset 0 0 50px rgba(59, 130, 246, 0.5);
}
.face-1 { 
  transform: rotateY(72deg) translateZ(220px); 
  border-color: rgba(168, 85, 247, 0.7);
  box-shadow: 0 15px 45px rgba(168, 85, 247, 0.25), inset 0 0 50px rgba(168, 85, 247, 0.5);
}
.face-2 { 
  transform: rotateY(144deg) translateZ(220px); 
  border-color: rgba(236, 72, 153, 0.7);
  box-shadow: 0 15px 45px rgba(236, 72, 153, 0.25), inset 0 0 50px rgba(236, 72, 153, 0.5);
}
.face-3 { 
  transform: rotateY(216deg) translateZ(220px); 
  border-color: rgba(20, 184, 166, 0.7);
  box-shadow: 0 15px 45px rgba(20, 184, 166, 0.25), inset 0 0 50px rgba(20, 184, 166, 0.5);
}
.face-4 { 
  transform: rotateY(288deg) translateZ(220px); 
  border-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 15px 45px rgba(245, 158, 11, 0.25), inset 0 0 50px rgba(245, 158, 11, 0.5);
}

@keyframes rotateCube {
  from { transform: rotateX(-5deg) rotateY(0deg); }
  to { transform: rotateX(-5deg) rotateY(360deg); }
}

.hero-bottom {
  padding: 20px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 50;
}

.avatar-label-container {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: max-content;
  pointer-events: none;
  z-index: 40;
}

.avatar-message {
  font-size: clamp(10px, 3.8vw, 18px);
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  line-height: 1.5;
  padding-bottom: 8px;
  white-space: nowrap;
}

.avatar-message span {
  color: #fbbf24;
}

.hero-bottom {
  padding: 20px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 50;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-outline {
  font-family: 'Inter', sans-serif;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.85);
  color: #fff;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: #fff;
  transform: translateY(-2px);
}

.btn-primary {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #1a1a1a;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.45);
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 28px rgba(251, 191, 36, 0.55) !important;
  background: linear-gradient(135deg, #f3c42aff 0%, #fbbf24 100%) !important;
}

.hero-cta .btn-primary {
  padding: 16px 32px;
  font-size: 16px;
}

.hero-cta .btn-outline {
  padding: 16px 32px;
  font-size: 16px;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  width: 320px;
  min-height: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .hero-avatar-container {
    gap: 40px;
    padding: 0 30px;
  }
  .center-avatar-wrapper {
    width: 350px;
    height: 400px;
  }
}

@media (max-width: 1024px) {
  .hero-avatar-container {
    flex-direction: column;
    gap: 60px;
    padding: 10px 20px;
  }
  
  .center-avatar-wrapper {
    width: 100%;
    max-width: 450px;
    height: 450px;
    order: 1;
  }
  
  .left-card-wrapper {
    order: 2;
    width: 100%;
    max-width: 450px;
  }
  
  .right-card-container {
    order: 3;
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .hero-top {
    padding: 60px 24px 30px;
  }

  .hero-title-top {
    font-size: 48px;
  }

  .hero-subtitle-top {
    font-size: 18px;
    padding: 0 16px;
  }

  .hero-avatars {
    min-height: 300px;
    padding: 20px 0;
  }

  .hero-bottom {
    padding: 30px 24px 60px;
  }

  .hero-cta {
    flex-direction: column;
    padding: 0 16px;
  }

  .hero-cta .btn-primary,
  .hero-cta .btn-outline {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .hero-title-top {
    font-size: 36px;
    margin: 0 0 20px;
  }

  .hero-subtitle-top {
    font-size: 16px;
    line-height: 1.5;
    padding: 0 16px;
  }
}
`

function Hero() {
  const avatars = [
    { src: avatar1, name: "Ethan", role: "an AI Video Assistant" },
    { src: avatar4, name: "Liam", role: "a Virtual Instructor" },
    { src: avatar2, name: "Oliver", role: "a Digital Host" },
    { src: avatar5, name: "Noah", role: "a Technical Expert" },
    { src: avatar3, name: "Olivia", role: "a Language Coach" }
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="hero-container">
        {/* Top Section with Heading and Subheading */}
        <div className="hero-top">
          <h1 className="hero-title-top">
            Create AI-Powered Videos
            <br />
            That Speak Your Language
          </h1>
          <p className="hero-subtitle-top">
            Transform text into engaging video content with lifelike AI avatars.
            Create professional videos in minutes, not hours.
          </p>
        </div>

        {/* Middle Section with Avatar Carousel */}
        <div className="hero-avatars">
          <div className="hero-avatar-container">
            {/* LEFT SIDE: Static Card */}
            <LeftCard />

            {/* CENTER: 3D Rotating Pentagonal Prism (for 5 avatars) */}
            <div className="center-avatar-wrapper">
              <div className="hero-cube-container">
                <div className="hero-cube">
                  {avatars.map((avatar, i) => (
                    <div key={i} className={`cube-face face-${i}`}>
                      <div className="cube-face-content">
                        <img src={avatar.src} alt={avatar.name} />
                        <div className="cube-face-label">
                          <span className="face-name">{avatar.name}</span>
                          <span className="face-role">{avatar.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Auto-Rotating Cards */}
            <RightCardCarousel />
          </div>
        </div>

        {/* Bottom Section with CTA Buttons */}
        <div className="hero-bottom">
          <div className="hero-cta">
            <button className="btn-primary">
              START FREE TRIAL
              <MdArrowOutward />
            </button>
            <button className="btn-outline">
              CONTACT SALES
              <MdArrowOutward />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
