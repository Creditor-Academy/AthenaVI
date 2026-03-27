import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlinePauseCircle, 
  HiOutlineMicrophone, 
  HiOutlineCpuChip, 
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
  HiOutlineSparkles
} from 'react-icons/hi2'
import styles from './InteractiveAIExperience.module.css'

const InteractiveAIExperience = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  const flowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "backOut" } }
  }

  const flowSteps = [
    {
      icon: <HiOutlineCpuChip />,
      title: "AI Talking",
      desc: "Delivering intelligent, context-aware information.",
      color: "#2563eb"
    },
    {
      icon: <HiOutlinePauseCircle />,
      title: "User Interrupts",
      desc: `AI <span class="${styles.highlight}">pauses</span> instantly to listen.`,
      color: "#ef4444"
    },
    {
      icon: <HiOutlineMicrophone />,
      title: "AI Responds",
      desc: `Real-time <span class="${styles.highlight}">response</span> using natural language.`,
      color: "#10b981"
    },
    {
      icon: <HiOutlinePlayCircle />,
      title: "AI Resumes",
      desc: `Seamlessly <span class="${styles.highlight}">resumes</span> exactly where it left off.`,
      color: "#8b5cf6"
    }
  ]

  return (
    <section className={styles.interactiveSection}>
      <div className={styles.container}>
        {/* Left Content */}
        <motion.div 
          className={styles.textContent}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className={styles.headingWrapper}>
            <motion.h2 variants={itemVariants} className={styles.heading}>
              The Interactive AI Experience
            </motion.h2>
            <motion.p variants={itemVariants} className={styles.subheading}>
              Our AI doesn’t just respond—it interacts intelligently in real time.
            </motion.p>
          </div>

          <ul className={styles.bulletList}>
            <motion.li variants={itemVariants} className={styles.bulletItem}>
              <HiOutlineCheckCircle className={styles.bulletIcon} />
              <span><span className={styles.highlight}>Pauses</span> instantly when users ask questions</span>
            </motion.li>
            <motion.li variants={itemVariants} className={styles.bulletItem}>
              <HiOutlineCheckCircle className={styles.bulletIcon} />
              <span>Understands context in real-time</span>
            </motion.li>
            <motion.li variants={itemVariants} className={styles.bulletItem}>
              <HiOutlineCheckCircle className={styles.bulletIcon} />
              <span>Responds using <span className={styles.highlight}>voice</span> and natural language</span>
            </motion.li>
            <motion.li variants={itemVariants} className={styles.bulletItem}>
              <HiOutlineCheckCircle className={styles.bulletIcon} />
              <span><span className={styles.highlight}>Resumes</span> seamlessly from the exact same point</span>
            </motion.li>
            <motion.li variants={itemVariants} className={styles.bulletItem}>
              <HiOutlineCheckCircle className={styles.bulletIcon} />
              <span>Maintains a continuous, human-like conversation</span>
            </motion.li>
          </ul>

          <motion.div variants={itemVariants} className={styles.closingLine}>
            "This creates a smooth, engaging experience instead of fragmented chatbot interactions."
          </motion.div>

          {/* Highlighted Box */}
          <motion.div 
            variants={flowVariants}
            className={styles.highlightBox}
          >
            <p>
              <HiOutlineSparkles style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Unlike traditional chatbots, this system maintains conversation continuity and delivers a truly human-like experience.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Content - Visual Flow */}
        <motion.div 
          className={styles.visualContent}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className={styles.flowContainer}>
            <div className={styles.flowLine}></div>
            {flowSteps.map((step, index) => (
              <motion.div 
                key={index} 
                className={styles.flowStep}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className={`${styles.iconWrapper} ${index === 0 ? styles.pulsingNode : ''}`} style={{ color: step.color }}>
                  {step.icon}
                </div>
                <div className={styles.stepInfo}>
                  <h4 className={styles.stepTitle}>{step.title}</h4>
                  <p className={styles.stepDesc} dangerouslySetInnerHTML={{ __html: step.desc }}></p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveAIExperience
