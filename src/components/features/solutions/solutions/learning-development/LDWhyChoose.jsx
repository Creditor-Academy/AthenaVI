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
  padding: 70px 0;
  background: #e5f4ffff; /* Updated Background Color by User */
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

@keyframes shimmer {
  0% { transform: translateX(-150%) skewX(-25deg); }
  50% { transform: translateX(150%) skewX(-25deg); }
  100% { transform: translateX(150%) skewX(-25deg); }
}

.ld-why-card {
  width: 440px;
  padding: 48px 40px;
  border-radius: 32px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 40px rgba(0,0,0,0.04), inset 0 2px 10px rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  /* Premium Glossy Base */
  background-image: linear-gradient(165deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
}

.ld-why-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
  transform: skewX(-25deg);
  animation: shimmer 6s infinite;
  pointer-events: none;
  z-index: 2;
}

/* Shiny specular highlight & Bevel */
.ld-why-card::before {
  content: "";
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 60%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.2;
  transition: all 0.6s ease;
}

.ld-why-card:hover::before {
  opacity: 0.4;
  transform: scale(1.1) translate(5%, 5%);
}

/* 4 Alternate Light Solid Colors */
.ld-why-card-0 { background-color: #eff6ff; }
.ld-why-card-1 { background-color: #f5f3ff; }
.ld-why-card-2 { background-color: #f0fdf4; }
.ld-why-card-3 { background-color: #fff7ed; }

.ld-why-card:hover {
  transform: translateY(-15px) scale(1.02);
  z-index: 10;
}

/* Theme-matched Hover Transitions */
.ld-why-card-0:hover { border-color: #3b82f6; box-shadow: 0 30px 60px rgba(59, 130, 246, 0.2); }
.ld-why-card-1:hover { border-color: #8b5cf6; box-shadow: 0 30px 60px rgba(139, 92, 246, 0.2); }
.ld-why-card-2:hover { border-color: #22c55e; box-shadow: 0 30px 60px rgba(34, 197, 94, 0.2); }
.ld-why-card-3:hover { border-color: #f97316; box-shadow: 0 30px 60px rgba(249, 115, 22, 0.2); }

.ld-why-card-0:hover .ld-why-icon-box { color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); }
.ld-why-card-1:hover .ld-why-icon-box { color: #8b5cf6; border-color: rgba(139, 92, 246, 0.2); }
.ld-why-card-2:hover .ld-why-icon-box { color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
.ld-why-card-3:hover .ld-why-icon-box { color: #f97316; border-color: rgba(249, 115, 22, 0.2); }

.ld-why-card:hover .ld-why-icon-box {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 12px 25px rgba(0,0,0,0.08);
  background: #ffffff;
}

.ld-why-icon-box {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.9);
  color: #1e293b;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 3;
}

.ld-card-ai-badge {
  font-size: 10px;
  font-weight: 800;
  color: #1e40af;
  background: #ffffff;
  padding: 6px 14px;
  border-radius: 99px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid rgba(30, 64, 175, 0.1);
  position: relative;
  z-index: 3;
}

.ld-why-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  line-height: 1.3;
  position: relative;
  z-index: 3;
}

.ld-why-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  font-weight: 500;
  position: relative;
  z-index: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ld-why-card-sparkle {
  position: absolute;
  top: 32px;
  right: 32px;
  color: #1e40af;
  opacity: 0.2;
  font-size: 24px;
  z-index: 3;
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
              className={`ld-why-card ld-why-card-${index % 4}`}
            >
              <div className="ld-card-ai-badge">AI Powered</div>

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
