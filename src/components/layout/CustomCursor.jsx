import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

function CustomCursor() {
  const [cursorType, setCursorType] = useState('default') // 'default', 'pointer', 'cloning'
  const [isMobile, setIsMobile] = useState(true)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 30, stiffness: 350, mass: 0.4 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if device supports fine hover interactions (desktops/laptops)
    const checkHover = () => {
      const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      setIsMobile(!hasHover)
    }
    checkHover()
    window.addEventListener('resize', checkHover)
    return () => window.removeEventListener('resize', checkHover)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      const target = e.target
      if (!target) return
      
      // Determine cursor scaling zone
      const isCloning = target.closest('[data-cursor="cloning"]')
      if (isCloning) {
        setCursorType('cloning')
        return
      }
      
      const isInteractive = target.closest('a, button, .btn-primary, .btn-outline, .dt-feature-panel, [role="button"]')
      if (isInteractive) {
        setCursorType('pointer')
      } else {
        setCursorType('default')
      }
    }

    window.addEventListener('mousemove', moveCursor)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [cursorX, cursorY, isMobile])

  if (isMobile) return null

  // Dimension mapping based on pointer role
  let size = 26
  let fill = 'url(#crystalGlow)'
  let stroke = 'none'
  let strokeWidth = 0
  let filter = 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.5))'
  
  if (cursorType === 'pointer') {
    size = 52
    fill = 'url(#crystalGlow)'
    stroke = 'none'
    strokeWidth = 0
    filter = 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.7))'
  } else if (cursorType === 'cloning') {
    size = 260 // matches the max radius of clip-path
    fill = 'transparent'
    stroke = 'url(#crystalGlow)'
    strokeWidth = 1.5
    filter = 'drop-shadow(0 0 14px rgba(0, 242, 254, 0.8))'
  }

  return (
    <>
      <style>{`
        /* Hide system cursor globally on hover-capable devices */
        @media (hover: hover) and (pointer: fine) {
          body, a, button, [role="button"], .dt-showcase-media-container, input, select, textarea {
            cursor: none !important;
          }
        }
        
        .custom-cursor-container {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          will-change: transform, width, height;
        }
      `}</style>
      <motion.div
        className="custom-cursor-container"
        style={{
          x: cursorType === 'cloning' ? cursorX : cursorXSpring,
          y: cursorType === 'cloning' ? cursorY : cursorYSpring,
          width: size,
          height: size,
        }}
        animate={{
          width: size,
          height: size,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 350,
          mass: 0.4
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{ filter, overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="crystalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>
          <path
            d="M 32,10 L 90,55 L 65,82 L 20,82 Z"
            fill={fill}
            stroke={stroke === 'none' ? 'none' : 'url(#crystalGlow)'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </>
  )
}

export default CustomCursor
