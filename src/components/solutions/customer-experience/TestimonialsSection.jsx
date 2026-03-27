import React from 'react';
import { motion } from 'framer-motion';
import styles from './TestimonialsSection.module.css';

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "AthenaVI transformed our customer support. The AI avatars provide a human touch that standard chatbots just can't match.",
      name: "Sarah Jenkins",
      role: "Head of CS, TechFlow",
      image: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      quote: "Our engagement rates tripled after we started using personalized video messages for our onboarding process.",
      name: "Michael Chen",
      role: "Product Manager, Growthly",
      image: "https://i.pravatar.cc/150?u=michael"
    },
    {
      quote: "The multilingual support is a game changer. We can now support customers in their native language with ease.",
      name: "Elena Rodriguez",
      role: "Global Ops, Mundo",
      image: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className={styles.section}>
      <div className={`${styles.glowBlob} ${styles.glowTop}`}></div>
      <div className={`${styles.glowBlob} ${styles.glowBottom}`}></div>
      
      <div className={styles.container}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          What Our Customers Say
        </motion.h2>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              className={styles.card}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <p className={styles.quote}>"{t.quote}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  <img src={t.image} alt={t.name} />
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
