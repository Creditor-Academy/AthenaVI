import React from 'react'
import { motion } from 'framer-motion'
import { MdPlayArrow, MdArrowForward } from 'react-icons/md'
import bgHero from '../assets/AvtarHero.png'
import groupAvtar from '../assets/GroupAvtar.png'

const styles = `
.avatar-hero-section {
  position: relative;
  width: 100%;
  min-height: 70vh;
  background: #05070a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px 4% 0px;
  color: #ffffff;
}

.hero-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${bgHero});
  background-size: cover;
  background-position: center;
  filter: blur(4px);
  opacity: 0.5;
  z-index: 0;
  transform: scale(1.1);
}

.hero-bg-mesh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.mesh-1 {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(80px);
}

.mesh-2 {
  position: absolute;
  bottom: -10%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
  filter: blur(80px);
}

.hero-grid {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1400px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 60px;
  align-items: center;
  margin-top: -50px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  width: fit-content;
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.hero-h1 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
  margin: 0;
  background: linear-gradient(to bottom, #ffffff 60%, rgba(255,255,255,0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  font-size: 18px;
  font-weight: 400;
  color: #e2e8f0;
  max-width: 560px;
  line-height: 1.5;
}

.hero-btns {
  display: flex;
  gap: 11px;
  margin-top: 10px;
}

.btn-primary-grad {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary-grad:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
}

.btn-secondary-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-secondary-glass:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.group-image-visual {
  width: 100%;
  max-width: 800px;
  z-index: 10;
  filter: drop-shadow(0 30px 60px rgba(0,0,0,0.5));
  margin-top: -60px;
}

.group-image-visual img {
  width: 100%;
  height: auto;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

@media (max-width: 1200px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 60px;
  }
  .hero-content { align-items: center; }
  .group-image-visual { max-width: 600px; margin: 0 auto; }
}

@media (max-width: 768px) {
  .hero-h1 { font-size: 36px; }
  .hero-btns { flex-direction: column; width: 100%; }
}
`

const AIAvatarHero = () => {
  return (
    <>
      <style>{styles}</style>
      <section className="avatar-hero-section">
        <div className="hero-bg-image"></div>
        <div className="hero-bg-mesh">
          <div className="mesh-1"></div>
          <div className="mesh-2"></div>
        </div>

        <div className="hero-grid">
          {/* LEFT CONTENT */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="badge">AI Video Platform</div>
            <h1 className="hero-h1">AI Avatars for Real-Time Video & Human Interaction</h1>
            <p className="hero-sub">
              Choose lifelike digital humans with natural expressions and human-like nuance.
              Deploy diverse avatars across video campaigns, real-time apps, and professional training.
            </p>

            <div className="hero-btns">
              <button className="btn-primary-grad">
                Start Creating <MdArrowForward size={18} />
              </button>
              <button className="btn-secondary-glass">
                Watch Demo <MdPlayArrow size={20} />
              </button>
            </div>
          </motion.div>

          {/* RIGHT VISUAL - SIMPLIFIED GROUP IMAGE */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="group-image-visual">
              <motion.img
                src={groupAvtar}
                alt="AI Avatar Group"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default AIAvatarHero
