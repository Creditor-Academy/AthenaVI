import React from 'react'
import { motion } from 'framer-motion'
import avatar2 from '../assets/Avatarr2.png'
import avatar3 from '../assets/Avatarr3.png'
import avatar4 from '../assets/Avatarr4.png'
import avatar5 from '../assets/Avatarr5.png'

const styles = `
.avatar-marquee-section {
  width: 100%;
  padding: 40px 0;
  background: #ffffff;
  overflow: hidden;
  position: relative;
}

.avatar-marquee-container {
  display: flex;
  width: 100%;
}

.marquee-track {
  display: flex;
  gap: 30px;
}

.avatar-card-marquee {
  position: relative;
  flex-shrink: 0;
  width: 260px;
  height: 320px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.avatar-card-marquee img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-card-marquee:hover img {
  transform: scale(1.08);
}

.badge-premium {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-dot {
  width: 5px;
  height: 5px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 10px #3b82f6;
}

.marquee-overlay-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 15%;
  height: 100%;
  background: linear-gradient(to left, #ffffff, transparent);
  z-index: 5;
  pointer-events: none;
}

.marquee-overlay-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 15%;
  height: 100%;
  background: linear-gradient(to right, #ffffff, transparent);
  z-index: 5;
  pointer-events: none;
}

@media (max-width: 768px) {
  .avatar-card-marquee {
    width: 200px;
    height: 250px;
    border-radius: 20px;
  }
}
`

const avatars = [
  { src: avatar2, premium: true, bgColor: '#7aedfaff' },
  { src: avatar3, premium: false, bgColor: '#9fffc5ff' },
  { src: avatar4, premium: true, bgColor: '#b4c3ffff' },
  { src: avatar5, premium: false, bgColor: '#ff9ad3ff' },
]

const AvatarMarquee = () => {
  // Triple the list for a seamless loop
  const list = [...avatars, ...avatars, ...avatars]

  return (
    <>
      <style>{styles}</style>
      <section className="avatar-marquee-section">
        <div className="marquee-overlay-left"></div>
        <div className="marquee-overlay-right"></div>

        <div className="avatar-marquee-container">
          <motion.div
            className="marquee-track"
            animate={{ x: [0, -1800] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {list.map((av, index) => (
              <div key={index} className="avatar-card-marquee" style={{ background: av.bgColor }}>
                <img src={av.src} alt={`AI Avatar ${index}`} />
                {av.premium && (
                  <div className="badge-premium">
                    <span className="badge-dot"></span>
                    Premium+
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default AvatarMarquee
