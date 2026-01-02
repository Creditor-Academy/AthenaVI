import { useState, useEffect } from 'react'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'

function Hero({ onLoginClick }) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Use avatar4 twice to make 5 avatars total
  const avatars = [avatar2, avatar1, avatar5, avatar3, avatar4]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % avatars.length)
    }, 3000) // Rotate every 3 seconds

    return () => clearInterval(interval)
  }, [avatars.length])

  // Calculate which avatar should be at each horizontal position
  // For smooth sliding from left to right
  const getAvatarAtPosition = (position) => {
    // Position 0 is leftmost, position 4 is rightmost
    // When activeIndex increases, avatars slide from left to right
    // We want the active avatar to appear at center (position 2)
    const offset = (activeIndex + position - 2 + avatars.length) % avatars.length
    return offset
  }

  // Calculate horizontal position (left to right)
  const getHorizontalPosition = (position) => {
    const totalPositions = avatars.length
    const containerWidth = Math.min(1200, window.innerWidth * 0.9)
    const spacing = containerWidth / (totalPositions + 1)
    const x = (position + 1) * spacing - (containerWidth / 2)
    return x
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 50%, #cce5ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      fontFamily: "'Roboto', 'Arial', sans-serif"
    }}>
      {/* Title Text - At the top, above avatars */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        width: '100%',
        maxWidth: '1200px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: '900',
          color: '#0d47a1',
          margin: 0,
          textShadow: '2px 2px 4px rgba(255, 255, 255, 0.9), 0 0 20px rgba(13, 71, 161, 0.2)',
          letterSpacing: '4px',
          lineHeight: '1.2',
          fontFamily: "'Roboto', 'Arial', sans-serif"
        }}>
          VIRTUAL INSTRUCTOR
        </h1>
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: '#1565c0',
          marginTop: '20px',
          fontWeight: '400',
          letterSpacing: '0.5px',
          fontFamily: "'Roboto', 'Arial', sans-serif"
        }}>
          Learn with confidence from expert virtual instructors
        </p>
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
          color: '#1976d2',
          marginTop: '25px',
          fontWeight: '300',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '25px auto 0',
          fontFamily: "'Roboto', 'Arial', sans-serif"
        }}>
          Experience personalized learning with our AI-powered virtual instructors. 
          Get expert guidance, interactive lessons, and tailored support to achieve your educational goals.
        </p>
      </div>

      {/* Hero Section with Avatars - Positioned below text */}
      <div style={{
        position: 'absolute',
        top: '38%',
        width: '100%',
        height: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        overflow: 'hidden'
      }}>
        {/* Avatar Container */}
        <div style={{
          position: 'relative',
          width: 'min(1200px, 90vw)',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {avatars.map((avatar, index) => {
            const position = index // Position 0, 1, 2, 3, 4 from left to right
            const avatarIndex = getAvatarAtPosition(position)
            const x = getHorizontalPosition(position)
            // Position 2 is the center (middle of 5 avatars)
            const isActive = position === 2
            
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), -50%)`,
                  transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  width: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(160px, 13vw, 200px)',
                  height: isActive ? 'clamp(280px, 22vw, 350px)' : 'clamp(160px, 13vw, 200px)',
                  opacity: isActive ? 1 : 0.6,
                  filter: isActive ? 'blur(0px)' : 'blur(3px)',
                  zIndex: isActive ? 20 : 10 - Math.abs(position - 2),
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={avatars[avatarIndex]}
                  alt={`Instructor ${avatarIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Login Button - Bottom Right */}
      <button
        onClick={onLoginClick}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          padding: '16px 32px',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
          transition: 'all 0.3s ease-in-out',
          zIndex: 200,
          fontFamily: "'Roboto', 'Arial', sans-serif"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 12px 35px rgba(25, 118, 210, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.4)'
        }}
      >
        <span>Login</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default Hero
