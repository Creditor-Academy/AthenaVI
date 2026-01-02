import { useState, useEffect } from 'react'
import { MdArrowOutward } from 'react-icons/md'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'

const styles = `
.hero-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Arial', sans-serif;
}

.hero-top {
  position: relative;
  width: 100%;
  padding: 80px 40px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  text-align: center;
}

.hero-title-top {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 72px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 24px;
  line-height: 1.1;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
}

.hero-subtitle-top {
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  max-width: 700px;
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
  padding: 40px 0;
}

.avatar-container {
  position: relative;
  width: min(1200px, 90vw);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-item {
  position: absolute;
  left: 50%;
  top: 50%;
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none;
}

.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  font-family: 'Arial', sans-serif;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.hero-cta .btn-primary {
  padding: 16px 32px;
  font-size: 16px;
}

.hero-cta .btn-outline {
  padding: 16px 32px;
  font-size: 16px;
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
  }

  .hero-subtitle-top {
    font-size: 16px;
  }
}
`

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)

  const avatars = [avatar2, avatar1, avatar5, avatar3, avatar4]

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
          <div className="avatar-container">
            {avatars.map((avatar, index) => {
              const position = index
              const avatarIndex = getAvatarAtPosition(position)
              const x = getHorizontalPosition(position)
              const isActive = position === 2
              
              return (
                <div
                  key={index}
                  className="avatar-item"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), -50%)`,
                    width: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(160px, 13vw, 200px)',
                    height: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(160px, 13vw, 200px)',
                    opacity: isActive ? 1 : 0.6,
                    filter: isActive ? 'blur(0px)' : 'blur(3px)',
                    zIndex: isActive ? 20 : 10 - Math.abs(position - 2),
                  }}
                >
                  <img
                    src={avatars[avatarIndex]}
                    alt={`Instructor ${avatarIndex + 1}`}
                  />
                </div>
              )
            })}
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
