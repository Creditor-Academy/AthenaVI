import React from 'react'
import { motion } from 'framer-motion'

const styles = `
.cx-test-section {
  padding: 30px 40px 80px;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cx-test-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(150px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}

.cx-test-glow-top {
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
}

.cx-test-glow-bottom {
  bottom: -300px;
  right: 10%;
  background: #8b5cf6;
}

.cx-test-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cx-test-title {
  font-family: 'Georgia', serif;
  font-size: 52px;
  background: linear-gradient(to bottom, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 80px;
  font-weight: 700;
}

.cx-test-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.cx-test-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
  text-align: left;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.cx-test-card::before {
  content: '"';
  position: absolute;
  top: 10px;
  right: 30px;
  font-size: 140px;
  color: rgba(0, 0, 0, 0.04);
  font-family: 'Georgia', serif;
  line-height: 1;
  pointer-events: none;
}

.cx-test-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
}

.cx-test-quote {
  font-size: 19px;
  color: #334155;
  line-height: 1.7;
  margin-bottom: 40px;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.cx-test-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.cx-test-avatar {
  width: 56px;
  height: 56px;
  background: #f1f5f9;
  border-radius: 50%;
  overflow: hidden;
}

.cx-test-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cx-test-info {
  display: flex;
  flex-direction: column;
}

.cx-test-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.cx-test-role {
  font-size: 14px;
  color: #64748b;
  margin-top: 2px;
}

@media (max-width: 1024px) {
  .cx-test-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .cx-test-section { padding: 80px 20px; }
  .cx-test-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
  .cx-test-title { font-size: 40px; margin-bottom: 48px; }
  .cx-test-card { padding: 32px 24px; }
}
`

const testimonials = [
  {
    quote: "AthenaVI has transformed how we handle customer onboarding. Our users are now engaged from the second they land on our portal.",
    name: "Sarah Jenkins",
    role: "Head of CX, CloudScale",
    avatar: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
  },
  {
    quote: "The voice interaction is remarkably natural. It’s significantly reduced our support team’s repetitive workload while keeping the 'human' touch.",
    name: "Michael Chen",
    role: "Operations Director, InnoVault",
    avatar: "https://xsgames.co/randomusers/assets/avatars/male/2.jpg"
  },
  {
    quote: "Deploying the digital avatar was zero-effort. It’s become our best-performing lead generation tool in only 3 weeks.",
    name: "Emma Rodriguez",
    role: "Founder, NeoFlow",
    avatar: "https://xsgames.co/randomusers/assets/avatars/female/3.jpg"
  }
]

const TestimonialsSection = () => {
  return (
    <section className="cx-test-section">
      <style>{styles}</style>
      <div className="cx-test-glow cx-test-glow-top"></div>
      <div className="cx-test-glow cx-test-glow-bottom"></div>

      <div className="cx-test-container">
        <motion.h2 
          className="cx-test-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          What Leaders Say About Us
        </motion.h2>

        <div className="cx-test-grid">
          {testimonials.map((t, index) => (
            <motion.div
              key={index} 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="cx-test-card"
            >
              <p className="cx-test-quote">{t.quote}</p>
              <div className="cx-test-author">
                <div className="cx-test-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div className="cx-test-info">
                  <span className="cx-test-name">{t.name}</span>
                  <span className="cx-test-role">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
