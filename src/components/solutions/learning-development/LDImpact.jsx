import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  HiOutlineUserGroup, 
  HiOutlineCurrencyDollar, 
  HiOutlineBolt, 
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck
} from 'react-icons/hi2'

const styles = `
.ld-impact-section {
  padding: 70px 24px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.ld-impact-container {
  max-width: 1350px;
  margin: 0 auto;
}

.ld-impact-header {
  text-align: center;
  margin-bottom: 80px;
}

.ld-impact-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  font-size: 14px;
  font-weight: 700;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.ld-impact-title {
  font-family: 'Georgia, Times New Roman, serif';
  font-size: 60px;
  font-weight: 400;
  color: #0f172a;
  margin-bottom: 28px;
  letter-spacing: -2px;
  line-height: 1.1;
}

.ld-impact-subheading {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 400;
  line-height: 1.65;
}

.ld-impact-banner {
  background: #1e3a8a;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15);
  min-height: 240px;
}

.ld-impact-banner-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.ld-impact-banner-waves svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

.ld-impact-banner-inner {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 2;
  align-items: center;
}

.ld-impact-stats-row {
  display: flex;
  flex: 1;
  justify-content: space-around;
  padding: 24px;
  gap: 16px;
  width: 100%;
}

.ld-impact-stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 36px 24px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  background: transparent;
}

.ld-impact-stat-col:hover {
  background: #0f172a;
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.5);
}

.ld-impact-num {
  font-family: 'Outfit', sans-serif;
  font-size: 52px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1;
  transition: all 0.3s ease;
}

.ld-impact-stat-col:hover .ld-impact-num {
  font-weight: 800;
  color: #ffffff;
}

.ld-impact-title-small {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.ld-impact-stat-col:hover .ld-impact-title-small {
  color: #bfdbfe;
}

.ld-impact-desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #bfdbfe;
  line-height: 1.6;
  font-weight: 500;
  transition: color 0.3s ease;
}

.ld-impact-stat-col:hover .ld-impact-desc {
  color: #cbd5e1;
}

.ld-impact-trust {
  margin-top: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .ld-impact-stats-row {
    flex-wrap: wrap;
    justify-content: center;
    padding: 24px;
  }
  .ld-impact-stat-col {
    min-width: 40%;
  }
}

@media (max-width: 640px) {
  .ld-impact-stats-row {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .ld-impact-title { font-size: 40px; letter-spacing: -1px; }
  .ld-impact-stat-col {
    min-width: 100%;
  }
}
`

// Stat Counter Sub-component
const StatCounter = ({ value, suffix }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 2000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 16)
      
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  const display = Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)

  return (
    <motion.span ref={ref}>
      {display}{suffix}
    </motion.span>
  )
}

const impactMetrics = [
  {
    value: 90,
    suffix: "%",
    title: "Retention Rate",
    desc: "Interactive AI humans significantly boost knowledge retention compared to passive learning.",
    icon: <HiOutlineUserGroup />
  },
  {
    value: 70,
    suffix: "%",
    title: "Cost Reduction",
    desc: "Eliminate the need for expensive studio shoots and recurring production costs.",
    icon: <HiOutlineCurrencyDollar />
  },
  {
    value: 2,
    suffix: "x",
    title: "Onboarding Speed",
    desc: "Get new hires ramped up and productive twice as fast with personalized AI paths.",
    icon: <HiOutlineBolt />
  },
  {
    value: 60,
    suffix: "+",
    title: "Global Languages",
    desc: "Scale training globally in an instant with AI-powered video translation and localization.",
    icon: <HiOutlineGlobeAlt />
  }
]

const LDImpact = () => {
  return (
    <section className="ld-impact-section">
      <style>{styles}</style>
      <div className="ld-impact-container">
        <motion.div 
          className="ld-impact-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="ld-impact-badge">Proven ROI</div>
          <h2 className="ld-impact-title">Real Impact on Corporate Learning</h2>
          <p className="ld-impact-subheading">
            Deliver measurable improvements in employee performance and organizational efficiency.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="ld-impact-banner"
        >
          {/* Abstract Blue Waves SVG */}
          <div className="ld-impact-banner-waves">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="rgba(59, 130, 246, 0.4)" d="M0,192L48,208C96,224,192,256,288,234.7C384,213,480,139,576,128C672,117,768,171,864,197.3C960,224,1056,224,1152,213.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              <path fill="rgba(37, 99, 235, 0.5)" d="M0,64L48,80C96,96,192,128,288,144C384,160,480,160,576,149.3C672,139,768,117,864,122.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          <div className="ld-impact-banner-inner">
            <div className="ld-impact-stats-row">
              {impactMetrics.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="ld-impact-stat-col"
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="ld-impact-num">
                    <StatCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="ld-impact-title-small">{stat.title}</div>
                  <div className="ld-impact-desc">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
          className="ld-impact-trust"
        >
          <HiOutlineShieldCheck style={{ color: '#1e40af', fontSize: '20px' }} />
          <span>Trusted by Fortune 500 companies to power their global training initiatives.</span>
        </motion.div>
      </div>
    </section>
  )
}

export default LDImpact
