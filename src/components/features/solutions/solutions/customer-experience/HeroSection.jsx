import { MdArrowOutward, MdCheckCircle } from 'react-icons/md'
import { motion } from 'framer-motion'
import AIVirtualAssistant from '../../../../../assets/CustomerExpHero.png'
import CustomerSatisfaction from '../../../../../assets/CustomerSatisfaction.jpg'

const styles = `
.cx-hero {
  min-height: 80vh;
  margin-top: -80px;
  padding: 150px 80px 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  gap: 80px;
}

.cx-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${CustomerSatisfaction});
  background-size: cover;
  background-position: center;
  filter: blur(4px);
  transform: scale(1.1);
  z-index: 1;
}

.cx-hero-content {
  flex: 1.2;
  max-width: 700px;
  position: relative;
  z-index: 2;
}

.cx-hero-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border-radius: 99px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  margin-top: -5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cx-hero-title {
  font-family: 'Georgia', serif;
  font-size: 48px;
  color: #ffffff;
  margin-bottom: 24px;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.cx-hero-subheading {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  line-height: 1.6;
}

.cx-hero-highlight {
  font-size: 18px;
  color: #60a5fa;
  font-weight: 500;
  margin-bottom: 40px;
  padding-left: 16px;
  border-left: 3px solid #3b82f6;
}

.cx-hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}

.btn-primary-cx {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
}

.btn-primary-cx:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
}

.btn-secondary-cx {
  background: transparent;
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-secondary-cx:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #cbd5e1;
}

.cx-hero-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 500;
}

.stat-icon {
  color: #4ade80;
  font-size: 20px;
}

.cx-hero-visual {
  flex: 0.8;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.visual-image-wrapper {
  position: relative;
  display: inline-flex;
}

.visual-image-wrapper img {
  width: 100%;
  max-width: 500px;
  height: 550px;
  border-radius: 20px;
}

.floating-bubble {
  position: absolute;
  padding: 16px 18px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  white-space: nowrap;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.bubble-1 {
  top: 5%;
  left: 220px;
  background: rgba(255, 255, 255, 0.65);
  color: #1e293b;
  border-bottom-left-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.bubble-2 {
  bottom: 18%;
  right: -50px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(29, 78, 216, 0.8) 100%);
  color: #ffffff;
  border-bottom-right-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 1024px) {
  .cx-hero {
    flex-direction: column;
    padding: 140px 40px 80px;
    text-align: center;
    gap: 60px;
  }
  .cx-hero-content {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cx-hero-title {
    font-size: 48px;
  }
  .cx-hero-actions {
    justify-content: center;
  }
  .cx-hero-stats {
    align-items: center;
  }
  .cx-hero-highlight {
    border-left: none;
    padding-left: 0;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .cx-hero {
    padding: 120px 20px 60px;
  }
  .cx-hero-title {
    font-size: 36px;
  }
  .cx-hero-actions {
    flex-direction: column;
    width: 100%;
  }
  .btn-primary-cx, .btn-secondary-cx {
    width: 100%;
    justify-content: center;
  }
}
`

function HeroSection() {
  return (
    <section className="cx-hero">
      <style>{styles}</style>
      
      <div className="cx-hero-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cx-hero-tag"
        >
          AI-Powered Customer Experience Platform
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="cx-hero-title"
        >
          Revolutionize Customer Experience with Interactive AI Humans
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="cx-hero-subheading"
        >
          Deliver real-time, human-like conversations powered by AI. Use intelligent virtual assistants that engage, respond, and guide users seamlessly—enhancing support, sales, and customer interactions at scale.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="cx-hero-highlight"
        >
          AI that doesn’t just respond—but understands, interacts, and continues the conversation like a human.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="cx-hero-actions"
        >
          <a href="#" className="btn-primary-cx">
            Start Free Trial
            <MdArrowOutward />
          </a>
          <a href="#" className="btn-secondary-cx">
            Watch Demo
          </a>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="cx-hero-stats"
        >
          <div className="stat-item">
            <MdCheckCircle className="stat-icon" />
            40% increase in engagement
          </div>
          <div className="stat-item">
            <MdCheckCircle className="stat-icon" />
            60% reduction in support cost
          </div>
          <div className="stat-item">
            <MdCheckCircle className="stat-icon" />
            120+ languages supported
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="cx-hero-visual"
      >
        <div className="visual-image-wrapper">
          <img src={AIVirtualAssistant} alt="AI Virtual Assistant Dashboard" />
          
          <motion.div 
            className="floating-bubble bubble-1"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span style={{ fontSize: '20px' }}></span> Hello there!
          </motion.div>

          <motion.div 
            className="floating-bubble bubble-2"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            How can I help you?
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
