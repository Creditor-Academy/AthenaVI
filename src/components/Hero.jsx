import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdArrowOutward, MdPayments } from 'react-icons/md'
import { HiTrendingUp } from 'react-icons/hi'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'
import LeftCard from './LeftCard'
import RightCardCarousel from './RightCardCarousel'

const styles = `
.hero-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
}

.hero-top {
  position: relative;
  width: 100%;
  padding: 40px 40px 40px;
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
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  overflow: hidden;
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
}

.center-avatar-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-avatar-item {
  position: absolute;
  left: 50%;
  top: 50%;
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none;
}

.hero-avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.avatar-label-container {
  position: absolute;
  bottom: -40px;
  left: 0;
  text-align: left;
  width: max-content;
  pointer-events: none;
  z-index: 40;
}

.avatar-message {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.avatar-message span {
  color: #fbbf24;
}

.hero-bottom {
  padding: 40px 40px 80px;
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
  box-shadow: 0 10px 28px rgba(251, 191, 36, 0.55);
  background: linear-gradient(135deg, #f3c42aff 0%, #fbbf24 100%);
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
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .hero-avatar-container {
    flex-direction: column;
    gap: 40px;
  }
  
  .center-avatar-wrapper {
    width: 300px;
    height: 300px;
    order: 1;
  }
  
  .left-card-wrapper {
    order: 2;
  }
  
  .right-card-container {
    order: 3;
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
  const [activeIndex, setActiveIndex] = useState(0)

  const avatars = [
    { src: avatar2, name: "Sophia", role: "an AI Video Assistant" },
    { src: avatar1, name: "Liam", role: "a Virtual Instructor" },
    { src: avatar5, name: "Emma", role: "a Digital Host" },
    { src: avatar3, name: "Noah", role: "a Technical Expert" },
    { src: avatar4, name: "Olivia", role: "a Language Coach" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % avatars.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [avatars.length])

  const getAvatarAtPosition = (position) => {
    const offset = (activeIndex + position - 2 + avatars.length) % avatars.length
    return offset
  }

  const getHorizontalPosition = (position) => {
    const totalPositions = avatars.length
    const containerWidth = Math.min(1200, window.innerWidth * 0.9)
    const spacing = containerWidth / (totalPositions + 1)
    const x = (position + 1) * spacing - (containerWidth / 2)
    return x
  }

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

            {/* CENTER: AI Avatars */}
            <div className="center-avatar-wrapper">
              {[1, 2, 3].map((position) => {
                const avatarIndex = getAvatarAtPosition(position)
                const x = getHorizontalPosition(position)
                const isActive = position === 2
                const currentAvatar = avatars[avatarIndex]

                return (
                  <div
                    key={position}
                    className="hero-avatar-item"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), -50%)`,
                      width: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(200px, 15vw, 250px)',
                      height: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(200px, 15vw, 250px)',
                      opacity: isActive ? 1 : 0.3,
                      filter: isActive ? 'blur(0px)' : 'blur(4px)',
                      zIndex: isActive ? 20 : 10,
                      left: '50%',
                      top: '50%',
                    }}
                  >
                    <img
                      src={currentAvatar.src}
                      alt={currentAvatar.name}
                    />

                    {/* AVATAR LABEL (Only for Active) */}
                    {isActive && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentAvatar.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5 }}
                          className="avatar-label-container"
                        >
                          <p className="avatar-message">
                            Hello, I am <span>{currentAvatar.name}</span> and I am {currentAvatar.role}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                )
              })}
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
