import React from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineBolt,
  HiOutlineUsers,
  HiOutlineArrowPath,
} from 'react-icons/hi2'

const styles = `
.ld-benefits-wavy {
  padding: 80px 24px;
  background: #e7f3ffff;
  position: relative;
  overflow: hidden;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.ld-benefits-wavy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.ld-benefits-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.ld-benefits-header {
  text-align: center;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.ld-benefits-badge {
  font-family: 'Georgia', serif;
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
  padding: 8px 20px;
  background: #ffffff;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.ld-benefits-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 60px;
  font-weight: 400;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -2px;
  background: linear-gradient(180deg, #0f172a 0%, #324a6aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.ld-benefits-subtitle {
  font-size: 20px;
  color: #64748b;
  max-width: 750px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: 'Georgia', serif;
  font-style: italic;
  opacity: 0.8;
}

.ld-benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.ld-wavy-card {
  background: #ffffff;
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  position: relative;
  border: 1px solid #f1f5f9;
}

.ld-wavy-card:hover {
  transform: translateY(-16px);
}

/* Card Header (White) */
.ld-card-top {
  padding: 50px 32px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  min-height: 200px;
  justify-content: center;
  position: relative;
}

.ld-card-icon-wavy {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  position: relative;
}

.ld-card-title-wavy {
  font-family: 'Georgia', serif;
  font-size: 28px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.2;
}

/* Wavy Divider */
.ld-card-wave-box {
  width: 100%;
  height: 50px;
  margin-bottom: -1px;
}

.ld-card-wave { display: block; width: 100%; height: 100%; }

/* Card Body (Balanced Vibrance) */
.ld-card-bottom {
  flex: 1;
  padding: 20px 32px 48px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 32px;
  text-align: center;
}

.ld-card-content-wavy {
  font-size: 16px;
  line-height: 1.8;
  font-weight: 500;
  color: #ffffffff;
 
}

/* Premium Pill Tags */
.ld-card-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
}

.ld-card-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transition: all 0.3s ease;
}

.ld-wavy-card:hover .ld-card-tag {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

/* Medium-Vibrant Color Themes */
.theme-purple .ld-card-bottom { background: linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 100%); }
.theme-purple .ld-card-icon-wavy { color: #8b5cf6; }
.theme-purple .ld-card-wave path { fill: #c4b5fd; }
.theme-purple:hover { box-shadow: 0 30px 60px -15px rgba(139, 92, 246, 0.3); }

.theme-orange .ld-card-bottom { background: linear-gradient(180deg, #fdba74 0%, #f97316 100%); }
.theme-orange .ld-card-icon-wavy { color: #f97316; }
.theme-orange .ld-card-wave path { fill: #fdba74; }
.theme-orange:hover { box-shadow: 0 30px 60px -15px rgba(249, 115, 22, 0.3); }

.theme-teal .ld-card-bottom { background: linear-gradient(180deg, #5eead4 0%, #2dd4bf 100%); }
.theme-teal .ld-card-icon-wavy { color: #0ea5e9; }
.theme-teal .ld-card-wave path { fill: #5eead4; }
.theme-teal:hover { box-shadow: 0 30px 60px -15px rgba(45, 212, 191, 0.3); }

@media (max-width: 1024px) {
  .ld-benefits-grid { grid-template-columns: 1fr; max-width: 450px; margin: 0 auto; }
  .ld-benefits-title { font-size: 40px; }
}
`

const benefits = [
  {
    icon: <HiOutlineBolt />,
    title: "Cheaper, Faster, Easier",
    theme: "theme-purple",
    content: "Reduce the cost, time, and effort required to produce training videos. Convert simple text, documents, or images into engaging AI-powered videos without needing production teams, studios, or technical expertise.",
    tags: ["No-Production", "Instant-Creation", "Scalable"]
  },
  {
    icon: <HiOutlineUsers />,
    title: "Total Personalization & Control",
    theme: "theme-orange",
    content: "Create training videos tailored to specific employees, departments, or regions. Choose from a wide range of AI instructors or generate your own from a single image to deliver personalized learning experiences at scale.",
    tags: ["Tailored", "AI-Avatars", "Multi-Language"]
  },
  {
    icon: <HiOutlineArrowPath />,
    title: "Instant Updates & Revisions",
    theme: "theme-teal",
    content: "Keep training content accurate and up to date by simply editing text and regenerating videos instantly. No need to re-record or restart production workflows.",
    tags: ["Edit-Anytime", "Real-Time", "Compliance-Ready"]
  }
]

const LDBenefits = () => {
  return (
    <section className="ld-benefits-wavy">
      <style>{styles}</style>
      <div className="ld-benefits-container">
        <motion.div
          className="ld-benefits-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="ld-benefits-badge">Platform Benefits</div>
          <h2 className="ld-benefits-title">Cheaper, Faster, and Smarter Training with AI</h2>
          <p className="ld-benefits-subtitle">
            Transform how your organization creates, personalizes, and updates training content using generative AI.
          </p>
        </motion.div>

        <div className="ld-benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className={`ld-wavy-card ${benefit.theme}`}
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="ld-card-top">
                <motion.div
                  className="ld-card-icon-wavy"
                  whileHover={{ scale: 1.1 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="ld-card-title-wavy">{benefit.title}</h3>
              </div>

              <div className="ld-card-wave-box">
                <svg className="ld-card-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,122.7C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
              </div>

              <div className="ld-card-bottom">
                <p className="ld-card-content-wavy">{benefit.content}</p>
                <div className="ld-card-tags">
                  {benefit.tags.map((tag, i) => (
                    <motion.div
                      key={i}
                      className="ld-card-tag"
                      whileHover={{ y: -2 }}
                    >
                      {tag}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LDBenefits
