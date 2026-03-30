import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlineUserCircle, 
  HiOutlineCurrencyDollar, 
  HiOutlineCursorArrowRays, 
  HiOutlineGlobeAlt, 
  HiOutlineSquaresPlus, 
  HiOutlinePlayCircle,
  HiOutlineSparkles
} from 'react-icons/hi2'

const styles = `
.ld-why-choose {
  padding: 120px 0;
  background: #eaeaeaff; /* Updated Background Color by User */
  position: relative;
  overflow: hidden;
}

.ld-why-choose-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Following Georgia Guideline */
.ld-why-choose-header {
  text-align: center;
  margin-bottom: 80px;
  padding: 0 24px;
}

.ld-why-badge {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  padding: 8px 24px;
  background: #ffffff;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.1);
  display: inline-block;
  margin-bottom: 24px;
}

.ld-why-choose-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 60px;
  font-weight: 400;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: -2px;
  background: linear-gradient(180deg, #0f172a 0%, #324a6aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.ld-why-choose-subtitle {
  font-size: 21px;
  color: #1e293b;
  max-width: 850px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
  opacity: 0.9;
}

/* Infinite Slider Track */
.ld-why-slider-viewport {
  width: 100%;
  overflow: hidden;
  padding: 40px 0;
}

.ld-why-slider-track {
  display: flex;
  gap: 32px;
  width: max-content;
}

.ld-why-card {
  width: 440px;
  padding: 48px 40px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  flex-shrink: 0;
}

/* Substantially Darker Alternate Gradients */
.ld-why-card-0 { background: linear-gradient(135deg, #bfdbfe 0%, #ffffff 50%, #60a5fa 100%); }
.ld-why-card-1 { background: linear-gradient(135deg, #ddd6fe 0%, #ffffff 50%, #a78bfa 100%); }
.ld-why-card-2 { background: linear-gradient(135deg, #c7d2fe 0%, #ffffff 50%, #818cf8 100%); }

.ld-why-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 60px -15px rgba(37, 99, 235, 0.2);
  border-color: #2563eb;
  z-index: 10;
}

.ld-why-icon-box {
  width: 60px;
  height: 60px;
  background: #ffffff;
  color: #2563eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.ld-why-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16px;
  line-height: 1.3;
}

.ld-why-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #1e293b;
  line-height: 1.65;
  font-weight: 500;
}

.ld-why-card-sparkle {
  position: absolute;
  top: 32px;
  right: 32px;
  color: #2563eb;
  opacity: 0.25;
  font-size: 24px;
}
`

const benefitsList = [
  {
    icon: <HiOutlineUserCircle />,
    title: "Personalized Learning Videos",
    desc: "Create training videos tailored to individual roles, teams, or regions. Deliver human-like learning experiences using AI instructors that improve engagement."
  },
  {
    icon: <HiOutlineCurrencyDollar />,
    title: "Fast & Cost-Efficient Creation",
    desc: "Turn existing documents or audio into professional training videos in minutes—without production teams or expensive studios."
  },
  {
    icon: <HiOutlineCursorArrowRays />,
    title: "One-Click Video Generation",
    desc: "Generate high-quality training, onboarding, and explainer videos instantly with just a few inputs. No technical expertise required."
  },
  {
    icon: <HiOutlineGlobeAlt />,
    title: "Scalable Across Teams & Regions",
    desc: "Deliver consistent training across global teams with support for multiple languages, voices, and localized high-fidelity content."
  },
  {
    icon: <HiOutlineSquaresPlus />,
    title: "Centralized Content Management",
    desc: "Manage and update all training videos in one place without restarting production, ensuring content stays accurate and relevant globally."
  },
  {
    icon: <HiOutlinePlayCircle />,
    title: "Instant Explainer & Training",
    desc: "Quickly create tutorials and walkthroughs that simplify complex topics without relying on expensive production resources."
  }
]

// Duplicate list for infinite effect
const infiniteList = [...benefitsList, ...benefitsList]

const LDWhyChoose = () => {
  return (
    <section className="ld-why-choose">
      <style>{styles}</style>
      
      <div className="ld-why-choose-container">
        {/* Header Following Guidelines */}
        <motion.div 
          className="ld-why-choose-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="ld-why-badge">Platform Benefits</div>
          <h2 className="ld-why-choose-title">Why Teams Choose Athena VI</h2>
          <p className="ld-why-choose-subtitle">
            Deliver impactful training experiences with AI-powered video creation, 
            personalization, and seamless scalability across your global organization.
          </p>
        </motion.div>
      </div>

      {/* Infinite Slider Implementation */}
      <div className="ld-why-slider-viewport">
        <motion.div 
          className="ld-why-slider-track"
          animate={{ x: [0, -2832] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          whileHover={{ animationPlayState: "paused" }}
          style={{ cursor: 'pointer' }}
        >
          {infiniteList.map((item, index) => (
            <div 
              key={index}
              className={`ld-why-card ld-why-card-${index % 3}`}
            >
              <HiOutlineSparkles className="ld-why-card-sparkle" />
              
              <div className="ld-why-icon-box">
                {item.icon}
              </div>

              <h3 className="ld-why-card-title">{item.title}</h3>
              <p className="ld-why-card-desc">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default LDWhyChoose
