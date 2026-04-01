import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlineArrowRight, 
} from 'react-icons/hi2'

const styles = `
.ld-cta-wrapper {
  padding: 60px 24px;
  background: #f8fafc; /* Base shade */
  position: relative;
  overflow: hidden;
  text-align: center;
}

.ld-cta-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

/* Enhanced Gradient Orbs Animation */
.ld-gradient-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.ld-orb-1 {
  position: absolute;
  top: -10%;
  left: 20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
  filter: blur(80px);
}

.ld-orb-2 {
  position: absolute;
  bottom: -20%;
  right: 10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%);
  filter: blur(100px);
}

.ld-orb-3 {
  position: absolute;
  top: 40%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 70%);
  filter: blur(70px);
}

.ld-cta-badge {
  display: inline-block;
  padding: 8px 24px;
  background: #ffffff;
  color: #2563eb;
  border-radius: 99px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 32px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.ld-cta-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 60px;
  font-weight: 400;
  color: #0f172a;
  line-height: 1.1;
  margin-bottom: 28px;
  letter-spacing: -2px;
}

.ld-cta-sub {
  font-family: 'Inter', sans-serif;
  font-size: 21px;
  color: #64748b;
  max-width: 800px;
  margin: 0 auto 56px;
  line-height: 1.6;
  opacity: 0.9;
}

.ld-cta-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 48px;
}

.btn-primary-gradient {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 14px 32px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-soft-pill {
  background: transparent;
  color: #3b82f6;
  padding: 12px 30px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  border: 2px solid #3b82f6;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-soft-pill:hover {
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.ld-cta-info {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

@media (max-width: 768px) {
  .ld-cta-btns { flex-direction: column; width: 100%; }
  .btn-primary-gradient, .btn-soft-pill { width: 100%; justify-content: center; }
  .ld-cta-title { font-size: 44px; letter-spacing: -1px; }
  .ld-cta-sub { font-size: 18px; }
}
`

const LDFinalCTA = () => {
  return (
    <section className="ld-cta-wrapper">
      <style>{styles}</style>
      
      {/* Dynamic Background Gradients */}
      <div className="ld-gradient-canvas">
        <motion.div 
          className="ld-orb-1" 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="ld-orb-2" 
          animate={{ 
            x: [0, -150, 0], 
            y: [0, -70, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="ld-orb-3" 
          animate={{ 
            x: [0, 80, 0], 
            y: [0, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="ld-cta-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="ld-cta-badge">Ready to revolutionize?</div>

          {/* Centered Heading */}
          <h2 className="ld-cta-title">
            Future-Proof Your Workforce Today
          </h2>

          {/* Subtitle */}
          <p className="ld-cta-sub">
            Create high-impact, AI-driven learning experiences that scale effortlessly 
            across your global organization. No credit card required.
          </p>

          {/* Action Buttons */}
          <div className="ld-cta-btns">
            <motion.a 
              href="#" 
              className="btn-primary-gradient"
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
              <HiOutlineArrowRight strokeWidth={2.5} />
            </motion.a>
            <motion.a 
              href="#" 
              className="btn-soft-pill"
              whileTap={{ scale: 0.95 }}
            >
              Request a Demo
            </motion.a>
          </div>

          {/* Support Info */}
          <motion.div 
            className="ld-cta-info"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            No credit card required &bull; Get started in minutes
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default LDFinalCTA