import React from 'react'
import { motion } from 'framer-motion'
import { HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2'
import styles from './CXComparison.module.css'

const comparisons = [
  {
    feature: "Human-Like Interaction",
    traditional: "Limited and scripted",
    ai: "Natural, human-like conversations"
  },
  {
    feature: "Voice Communication",
    traditional: "Not supported",
    ai: "Supports real-time voice interaction"
  },
  {
    feature: "Context Understanding",
    traditional: "Basic or limited",
    ai: "Advanced context-aware intelligence"
  },
  {
    feature: "Real-Time Explanation",
    traditional: "Cannot explain deeply",
    ai: "Provides detailed, contextual explanations"
  },
  {
    feature: "Conversation Continuity",
    traditional: "Breaks flow between responses",
    ai: "Maintains seamless conversation flow"
  }
]

const CXComparison = () => {
  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const rowAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.sectionTag}>Comparison Guide</div>
          <h2 className={styles.title}>See Why AthenaVI Outperforms Traditional Tools</h2>
          <p className={styles.subheading}>
            A smarter, more human way to interact, explain, and engage.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <div className={styles.tableWrapper}>
          <div className={styles.badge}>RECOMMENDED</div>
          
          <motion.div 
            className={styles.comparisonGrid}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Table Header Row */}
            <div className={styles.gridHeader}>
              <div className={styles.headerCell}>Features</div>
              <div className={styles.headerCell}>Traditional Tools</div>
              <div className={`${styles.headerCell} ${styles.aiHeader}`}>Athena VI</div>
            </div>

            {/* Feature Comparison Rows */}
            {comparisons.map((row, index) => (
              <motion.div key={index} className={styles.tableRow} variants={rowAnim}>
                <div className={`${styles.cell} ${styles.featureCell}`}>
                  {row.feature}
                </div>
                <div className={`${styles.cell} ${styles.traditionalCell}`}>
                  <HiOutlineXMark className={`${styles.icon} ${styles.crossIcon}`} />
                  {row.traditional}
                </div>
                <div className={`${styles.cell} ${styles.aiCell}`}>
                  <HiOutlineCheck className={`${styles.icon} ${styles.checkIcon}`} />
                  {row.ai}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Center CTA Pill */}
        <motion.div 
          className={styles.footerArea}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className={styles.ctaPill}>
            Upgrade from static responses to intelligent, continuous conversations.
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CXComparison
