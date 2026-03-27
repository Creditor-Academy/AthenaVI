import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlinePresentationChartLine, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineCpuChip, 
  HiOutlineMicrophone, 
  HiOutlineArrowPath,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import styles from './CXHowItWorks.module.css'

const steps = [
  {
    number: "01",
    icon: <HiOutlinePresentationChartLine />,
    title: "AI Presents Information",
    desc: "The AI digital human delivers content or assistance in a clear and engaging way."
  },
  {
    number: "02",
    icon: <HiOutlineQuestionMarkCircle />,
    title: "User Interrupts with a Question",
    desc: "The user can ask questions at any time during the interaction."
  },
  {
    number: "03",
    icon: <HiOutlineCpuChip />,
    title: "AI Understands and Responds",
    desc: "The system processes the query using context-aware intelligence and provides an accurate response."
  },
  {
    number: "04",
    icon: <HiOutlineMicrophone />,
    title: "Real-Time Voice Interaction",
    desc: "The AI communicates using natural voice for a more human-like experience."
  },
  {
    number: "05",
    icon: <HiOutlineArrowPath />,
    title: "Seamless Resume",
    desc: "The AI resumes from the exact same point without breaking the flow."
  }
]

const CXHowItWorks = () => {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How the Experience Works</h2>
          <p className={styles.subheading}>
            A seamless, real-time interaction flow designed to feel natural and human-like.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className={styles.timeline}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className={styles.stepCard}
            >
              <div className={styles.stepMarker}>
                <span className={styles.stepNumber}>{step.number}</span>
                {step.icon}
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          viewport={{ once: true }}
          className={styles.footerLine}
        >
          <HiOutlineCheckCircle style={{ color: '#2563eb' }} />
          "Designed to create continuous, interruption-friendly conversations."
        </motion.div>
      </div>
    </section>
  )
}

export default CXHowItWorks
