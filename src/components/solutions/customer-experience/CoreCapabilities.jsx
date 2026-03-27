import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineMicrophone, 
  HiOutlineLightBulb, 
  HiOutlineUserGroup, 
  HiOutlineArrowPath, 
  HiOutlineCubeTransparent,
  HiGlobeAmericas
} from 'react-icons/hi2'
import styles from './CoreCapabilities.module.css'

const capabilities = [
  {
    icon: <HiOutlineChatBubbleLeftRight />,
    title: "Real-Time Conversational AI",
    desc: "Engage users instantly with dynamic, real-time conversations that feel natural and responsive."
  },
  {
    icon: <HiOutlineMicrophone />,
    title: "Voice-Based Interaction",
    desc: "Enable users to ask questions using voice and receive intelligent spoken responses."
  },
  {
    icon: <HiOutlineLightBulb />,
    title: "Context-Aware Intelligence",
    desc: "Understand user intent and maintain context for meaningful, accurate responses."
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "Human-Like Digital Avatars",
    desc: "Use realistic AI avatars to create engaging and relatable interactions."
  },
  {
    icon: <HiOutlineCubeTransparent />,
    title: "Scalable Interaction System",
    desc: "Handle multiple users and sessions efficiently without performance loss."
  }
]

const CoreCapabilities = () => {
  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        {/* Left Side: The "Core" Disc and Arc */}
        <div className={styles.leftContainer}>
          <div className={styles.arcCircle}></div>
          <motion.div 
            className={styles.centralDisc}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.discIcon}>
              <HiGlobeAmericas />
            </div>
            <h2 className={styles.discTitle}>POWERFUL<br />CAPABILITIES</h2>
            <div className={styles.discDivider} />
            <p className={styles.discDesc}>
              Our platform combines conversational intelligence with human-like interaction to deliver a superior customer experience.
            </p>
          </motion.div>
        </div>

        {/* Right Side: The Infographic Stream */}
        <div className={styles.rightSide}>
          {capabilities.map((cap, index) => (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              key={index}
              className={`${styles.itemRow} ${styles[`row${index + 1}`]}`}
            >
              {/* Connector Line from Arc to Icon */}
              <div className={styles.connectorLine}>
                <div className={styles.connectorDot} />
              </div>

              {/* Icon Circle */}
              <div className={styles.iconCircle}>
                {cap.icon}
              </div>
              
              {/* Dark Card */}
              <div className={styles.card}>
                {/* Number Overlay */}
                <div className={styles.itemNumber}>
                  0{index + 1}
                </div>
                
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                <p className={styles.cardDesc}>{cap.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CoreCapabilities
