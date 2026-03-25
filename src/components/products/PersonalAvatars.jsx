import { motion } from 'framer-motion'
import { MdFaceRetouchingNatural, MdGraphicEq, MdMotionPhotosAuto } from 'react-icons/md'
import personalAvatarVideo from '../../assets/Personal Avatar.mp4'

const styles = `
#personal-avatars.product-section {
  min-height: 100vh;
  padding: 100px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #ffffff;
}

#personal-avatars.product-section.light {
  background: #ffffff;
  color: #1e40af;
}

#personal-avatars.product-section.dark {
 background: #ffffff;
  color: #1e40af; /* Adjust text color for white background */
}

#personal-avatars .product-section-content {
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 2;
}

#personal-avatars .text-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

#personal-avatars .product-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  text-align: left;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

#personal-avatars.product-section.light .product-section-title {
  color: #1e40af;
}

#personal-avatars.product-section.dark .product-section-title {
  color: #1e40af;
}

#personal-avatars .product-section-description {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  text-align: left;
  max-width: 600px;
  margin: 0;
}

#personal-avatars.product-section.light .product-section-description {
  color: #1e40af;
}

#personal-avatars.product-section.dark .product-section-description {
  color: #1e40af;
}

#personal-avatars .product-features {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  perspective: 1000px;
}

#personal-avatars .product-feature {
  padding: 32px 0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  border-bottom: 1px solid rgba(25, 48, 114, 0.1); /* Subtle dark blue underline */
  transform-style: preserve-3d;
}

#personal-avatars .product-feature:last-child {
  border-bottom: none;
}

#personal-avatars .product-feature:hover {
  /* Hover effects handled by Framer Motion and below */
}

#personal-avatars .product-feature-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e3a8a; /* Strong blue for heading */
  transition: color 0.3s ease;
}

#personal-avatars .product-feature:hover .product-feature-title {
  color: #031643ff; /* Darker heading on hover */
}

#personal-avatars .feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  color: #3b82f6; 
  transition: transform 0.3s ease;
}

#personal-avatars .product-feature:hover .feature-icon-wrapper {
  transform: scale(1.1);
}

#personal-avatars .product-feature-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: #4b5563; /* Gray-blue for description */
  transition: color 0.3s ease;
}

#personal-avatars .product-feature:hover .product-feature-description {
  color: #1f2937; /* Darker description on hover */
}

#personal-avatars .video-column {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1200px;
}

#personal-avatars .video-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  max-width: 650px; 
  display: flex;
  border-radius: 24px;
  box-shadow: 
    0 10px 30px rgba(27, 98, 190,0.08),
    0 20px 60px rgba(27, 98, 190, 0.12),
    0 30px 100px rgba(27, 98, 190, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.04);
  background: #ffffffff;
}

#personal-avatars .avatar-video {
  width: 100%;
  height: auto;
  display: block;
}

#personal-avatars .product-cta {
  align-self: flex-start;
  margin-top: -16px;
}

#personal-avatars .product-cta-button {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 16px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  display: inline-flex;
  align-items: center;
}

#personal-avatars .product-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

@media (max-width: 1024px) {
  #personal-avatars .product-section-content {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }
  
  #personal-avatars .text-column {
    align-items: center;
  }
  
  #personal-avatars .product-section-title, #personal-avatars .product-section-description {
    text-align: center;
  }
  
  #personal-avatars .product-feature {
    text-align: left;
  }
  
  #personal-avatars .product-feature:hover {
    transform: translateY(-5px);
  }

  #personal-avatars .video-wrapper {
    max-width: 650px;
  }
}

@media (max-width: 768px) {
  #personal-avatars.product-section {
    padding: 80px 24px;
  }
}
`

function PersonalAvatars({ variant = 'light' }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -40, y: 30 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const videoVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateX: 10,
      rotateY: -15,
      z: -100
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.4
      }
    }
  }

  return (
    <>
      <style>{styles}</style>
      <section id="personal-avatars" className={`product-section ${variant}`}>
        <motion.div
          className="product-section-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-column">
            <motion.h1 className="product-section-title" variants={itemVariants}>
              Personal Avatars
            </motion.h1>
            <motion.p className="product-section-description" variants={itemVariants}>
              Create your own digital avatar that looks, sounds, and moves like you. Perfect for personalized video content, presentations, and virtual interactions.
            </motion.p>

            <div className="product-features">
              <motion.div
                className="product-feature"
                variants={itemVariants}
                whileHover={{
                  scale: 1,
                  rotateX: 1,
                  rotateY: 2,
                  z: 5,
                  transition: { duration: 0.3 }
                }}
              >
                <h3 className="product-feature-title">
                  <div className="feature-icon-wrapper">
                    <MdFaceRetouchingNatural />
                  </div>
                  Realistic Appearance
                </h3>
                <p className="product-feature-description">
                  Generate photorealistic avatars that capture your unique features, expressions, and personality with incredible detail.
                </p>
              </motion.div>
              <motion.div
                className="product-feature"
                variants={itemVariants}
                whileHover={{
                  scale: 1,
                  rotateX: 1,
                  rotateY: 2,
                  z: 5,
                  transition: { duration: 0.3 }
                }}
              >
                <h3 className="product-feature-title">
                  <div className="feature-icon-wrapper">
                    <MdGraphicEq />
                  </div>
                  Voice Cloning
                </h3>
                <p className="product-feature-description">
                  Replicate your voice with precision, maintaining your natural tone, accent, and speaking style for authentic audio.
                </p>
              </motion.div>
              <motion.div
                className="product-feature"
                variants={itemVariants}
                whileHover={{
                  scale: 1,
                  rotateX: 1,
                  rotateY: 2,
                  z: 5,
                  transition: { duration: 0.3 }
                }}
              >
                <h3 className="product-feature-title">
                  <div className="feature-icon-wrapper">
                    <MdMotionPhotosAuto />
                  </div>
                  Dynamic Movements
                </h3>
                <p className="product-feature-description">
                  Avatars that move naturally with realistic gestures, facial expressions, and body language for engaging presentations.
                </p>
              </motion.div>
            </div>

            <motion.div className="product-cta" variants={itemVariants}>
              <button className="product-cta-button">
                CREATE AVATAR
              </button>
            </motion.div>
          </div>

          <motion.div
            className="video-column"
            variants={videoVariants}
            whileHover={{
              scale: 1.05,
              y: -20,
              z: 50,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
          >
            <div className="video-wrapper">
              <video
                className="avatar-video"
                autoPlay
                loop
                muted
                playsInline
                src={personalAvatarVideo}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}

export default PersonalAvatars
