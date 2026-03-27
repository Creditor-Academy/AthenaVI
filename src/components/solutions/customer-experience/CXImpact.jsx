import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { 
  HiOutlineChartBar, 
  HiOutlineChatBubbleOvalLeft, 
  HiOutlineBolt, 
  HiOutlineClock,
  HiOutlineShieldCheck
} from 'react-icons/hi2'
import styles from './CXImpact.module.css'

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
    <motion.span ref={ref} className={styles.statNumber}>
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
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <section className={styles.impactSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className={styles.badge}>Proven Results</div>
          <h2 className={styles.title}>Real Impact on Customer Experience</h2>
          <p className={styles.subheading}>
            Deliver measurable improvements in engagement, efficiency, and customer satisfaction.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className={styles.impactGrid}
        >
          {impactMetrics.map((stat, index) => (
            <motion.div
              key={index} 
              variants={item}
              className={styles.impactCard}
            >
              <div className={styles.iconWrapper}>
                {stat.icon}
              </div>
              <div className={styles.statContent}>
                <StatCounter value={stat.value} suffix={stat.suffix} />
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <p className={styles.statDesc}>{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
          className={styles.trustLine}
        >
          <HiOutlineShieldCheck style={{ color: '#3b82f6', fontSize: '20px' }} />
          <span>Trusted by businesses to deliver scalable and intelligent customer experiences.</span>
        </motion.div>
      </div>
    </section>
  )
}

export default CXImpact
