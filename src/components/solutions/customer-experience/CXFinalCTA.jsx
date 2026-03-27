import React from 'react'
import { motion } from 'framer-motion'
import { HiOutlineArrowRight } from 'react-icons/hi2'
import styles from './CXFinalCTA.module.css'

const CXFinalCTA = () => {
  return (
    <section className={styles.ctaSection}>
      {/* Background Glows */}
      <div className={`${styles.glowBlob} ${styles.glowTop}`}></div>
      <div className={`${styles.glowBlob} ${styles.glowBottom}`}></div>

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className={styles.badge}>Ready to scale?</div>
          <h2 className={styles.title}>Transform Your Customer Experience Today</h2>
          <p className={styles.subheading}>
            Create intelligent, human-like AI interactions that engage, assist, and scale effortlessly across your business.
          </p>

          <div className={styles.actions}>
            <motion.a 
              href="#" 
              className={styles.btnPrimary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial
              <HiOutlineArrowRight />
            </motion.a>
            <motion.a 
              href="#" 
              className={styles.btnSecondary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request a Demo
            </motion.a>
          </div>

          <motion.span 
            className={styles.supportingLine}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
          >
            No credit card required &bull; Get started in minutes
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}

export default CXFinalCTA
