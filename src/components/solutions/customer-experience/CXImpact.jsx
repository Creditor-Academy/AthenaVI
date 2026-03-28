import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  HiOutlineChartBar, 
  HiOutlineChatBubbleOvalLeft, 
  HiOutlineBolt, 
  HiOutlineClock,
  HiOutlineShieldCheck
} from 'react-icons/hi2'

const styles = `
.cx-impact-section {
  padding: 60px 80px 60px 80px;
  background: linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #faf5ff 100%);
  color: #0f172a;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cx-impact-section::before {
  content: '';
  position: absolute;
  top: -120px;
  left: -120px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.cx-impact-section::after {
  content: '';
  position: absolute;
  bottom: -120px;
  right: -100px;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.cx-impact-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cx-impact-header {
  margin-bottom: 72px;
}

.cx-impact-badge {
  display: inline-block;
  padding: 6px 18px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 20px;
}

.cx-impact-title {
  font-family: 'Georgia', serif;
  font-size: 52px;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.cx-impact-subheading {
  font-size: 18px;
  color: #475569;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.cx-impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
}

.cx-impact-card {
  background: #ffffff;
  padding: 44px 28px 36px;
  border-radius: 24px;
  border: 1px solid rgba(59, 130, 246, 0.12);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.04),
    0 20px 25px -5px rgba(59, 130, 246, 0.06);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.cx-impact-card:nth-child(1) { background: linear-gradient(135deg, #ddedff, #ffffff); border-color: #b3d4ff; }
.cx-impact-card:nth-child(2) { background: linear-gradient(135deg, #e8fdee, #ffffff); border-color: #b3d4ff; }
.cx-impact-card:nth-child(3) { background: linear-gradient(135deg, #fae4ff, #ffffff); border-color: #b3d4ff; }
.cx-impact-card:nth-child(4) { background: linear-gradient(135deg, #ffeeda, #ffffff); border-color: #b3d4ff; }

.cx-impact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #0ea5e9);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.cx-impact-card:hover {
  transform: translateY(-10px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.06),
    0 30px 60px -12px rgba(59, 130, 246, 0.18);
}

.cx-impact-card:hover::before {
  opacity: 1;
}

.cx-impact-icon-wrapper {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%);
  color: #3b82f6;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.12);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.cx-impact-card:hover .cx-impact-icon-wrapper {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(14, 165, 233, 0.18) 100%);
  box-shadow: 0 0 32px rgba(59, 130, 246, 0.22);
}

.cx-impact-stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cx-impact-stat-number {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cx-impact-stat-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.01em;
}

.cx-impact-stat-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.cx-impact-trust {
  margin-top: 72px;
  font-size: 15px;
  color: #475569;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 40px;
  border-top: 1px solid rgba(59, 130, 246, 0.12);
}

@media (max-width: 1024px) {
  .cx-impact-section { padding: 80px 40px; }
  .cx-impact-grid { grid-template-columns: repeat(2, 1fr); }
  .cx-impact-title { font-size: 42px; }
}

@media (max-width: 640px) {
  .cx-impact-section { padding: 60px 20px; }
  .cx-impact-title { font-size: 34px; }
  .cx-impact-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
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
    <motion.span ref={ref} className="cx-impact-stat-number">
      {display}{suffix}
    </motion.span>
  )
}

const impactMetrics = [
  {
    value: 40,
    suffix: "%",
    title: "Customer Engagement",
    desc: "More meaningful interactions through human-like AI conversations.",
    icon: <HiOutlineChartBar />
  },
  {
    value: 60,
    suffix: "%",
    title: "Support Workload",
    desc: "Automate repetitive queries while handling complex interactions efficiently.",
    icon: <HiOutlineChatBubbleOvalLeft />
  },
  {
    value: 3,
    suffix: "x",
    title: "Faster Response Time",
    desc: "Provide instant, real-time responses without delays.",
    icon: <HiOutlineBolt />
  },
  {
    value: 24,
    suffix: "/7",
    title: "Consistent Availability",
    desc: "Ensure uninterrupted customer support across all time zones.",
    icon: <HiOutlineClock />
  }
]

const CXImpact = () => {
  return (
    <section className="cx-impact-section">
      <style>{styles}</style>
      <div className="cx-impact-container">
        <motion.div 
          className="cx-impact-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="cx-impact-badge">Proven Results</div>
          <h2 className="cx-impact-title">Real Impact on Customer Experience</h2>
          <p className="cx-impact-subheading">
            Deliver measurable improvements in engagement, efficiency, and customer satisfaction.
          </p>
        </motion.div>

        <div className="cx-impact-grid">
          {impactMetrics.map((stat, index) => (
            <motion.div
              key={index} 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="cx-impact-card"
            >
              <div className="cx-impact-icon-wrapper">
                {stat.icon}
              </div>
              <div className="cx-impact-stat-content">
                <StatCounter value={stat.value} suffix={stat.suffix} />
                <h3 className="cx-impact-stat-title">{stat.title}</h3>
                <p className="cx-impact-stat-desc">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
          className="cx-impact-trust"
        >
          <HiOutlineShieldCheck style={{ color: '#3b82f6', fontSize: '20px' }} />
          <span>Trusted by businesses to deliver scalable and intelligent customer experiences.</span>
        </motion.div>
      </div>
    </section>
  )
}

export default CXImpact
