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
  padding: 120px 40px;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
}

.ld-impact-container {
  max-width: 1200px;
  margin: 0 auto;
}

.ld-impact-header {
  text-align: center;
  margin-bottom: 80px;
}

.ld-impact-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-size: 14px;
  font-weight: 700;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.ld-impact-title {
  font-size: 42px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.ld-impact-subheading {
  font-size: 18px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.ld-impact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.ld-impact-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.ld-impact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
  border-color: #e2e8f0;
}

.ld-impact-icon-wrapper {
  width: 56px;
  height: 56px;
  background: #f1f5f9;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 24px;
  flex-shrink: 0;
}

.ld-impact-stat-content {
  flex: 1;
}

.ld-impact-number {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #4f46e5;
  margin-bottom: 8px;
  line-height: 1;
}

.ld-impact-stat-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.ld-impact-stat-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}

.ld-impact-trust {
  margin-top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 968px) {
  .ld-impact-grid {
    grid-template-columns: 1fr;
  }
  .ld-impact-title { font-size: 32px; }
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
    <motion.span ref={ref} className="ld-impact-number">
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
          className="ld-impact-grid"
        >
          {impactMetrics.map((stat, index) => (
            <motion.div
              key={index} 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="ld-impact-card"
            >
              <div className="ld-impact-icon-wrapper">
                {stat.icon}
              </div>
              <div className="ld-impact-stat-content">
                <StatCounter value={stat.value} suffix={stat.suffix} />
                <h3 className="ld-impact-stat-title">{stat.title}</h3>
                <p className="ld-impact-stat-desc">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
          className="ld-impact-trust"
        >
          <HiOutlineShieldCheck style={{ color: '#4f46e5', fontSize: '20px' }} />
          <span>Trusted by Fortune 500 companies to power their global training initiatives.</span>
        </motion.div>
      </div>
    </section>
  )
}

export default LDImpact
