import React from 'react'
import { motion } from 'framer-motion'
import { HiOutlineArrowRight } from 'react-icons/hi2'

const styles = `
.cx-cta-section {
  padding: 60px 40px;
  background: radial-gradient(circle at top, #f8fafc 0%, #e2e8f0 100%);
  color: #0f172a;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cx-cta-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.cx-cta-glow-top {
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
}

.cx-cta-glow-bottom {
  bottom: -200px;
  right: 10%;
  background: #8b5cf6;
}

.cx-cta-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cx-cta-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.cx-cta-title {
  font-family: 'Georgia', serif;
  font-size: 56px;
  line-height: 1.1;
  margin-bottom: 24px;
  font-weight: 700;
  background: linear-gradient(to bottom, #0f172a, #334155);
  -webkit-background-clip: text;
  background-clip: text;
  color: #0f172a;
  -webkit-text-fill-color: transparent;
}

.cx-cta-subheading {
  font-size: 20px;
  color: #475569;
  max-width: 700px;
  margin: 0 auto 48px auto;
  line-height: 1.6;
}

.cx-cta-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;
}

.cx-cta-btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
}

.cx-cta-btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -10px rgba(37, 99, 235, 0.6);
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.cx-cta-btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #0f172a;
  padding: 16px 36px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cx-cta-btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.cx-cta-support {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  display: block;
}

@media (max-width: 768px) {
  .cx-cta-section { padding: 80px 20px; }
  .cx-cta-title { font-size: 38px; }
  .cx-cta-subheading { font-size: 18px; }
  .cx-cta-actions { flex-direction: column; align-items: stretch; max-width: 320px; margin-left: auto; margin-right: auto; }
}
`

const CXFinalCTA = () => {
  return (
    <section className="cx-cta-section">
      <style>{styles}</style>
      {/* Background Glowing Elements */}
      <div className="cx-cta-glow cx-cta-glow-top"></div>
      <div className="cx-cta-glow cx-cta-glow-bottom"></div>

      <div className="cx-cta-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="cx-cta-badge">Ready to scale?</div>
          <h2 className="cx-cta-title">Transform Your Customer Experience Today</h2>
          <p className="cx-cta-subheading">
            Create intelligent, human-like AI interactions that engage, assist, and scale effortlessly across your business.
          </p>

          <div className="cx-cta-actions">
            <motion.a 
              href="#" 
              className="cx-cta-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial
              <HiOutlineArrowRight />
            </motion.a>
            <motion.a 
              href="#" 
              className="cx-cta-btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request a Demo
            </motion.a>
          </div>

          <motion.span 
            className="cx-cta-support"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
          >
            No credit card required &bull; Get started in minutes
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}

export default CXFinalCTA
