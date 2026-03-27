import { motion } from 'framer-motion'
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineMicrophone, 
  HiOutlineLightBulb, 
  HiOutlineUserGroup, 
  HiOutlineArrowPath, 
  HiOutlineCubeTransparent 
} from 'react-icons/hi2'

const styles = `
.cx-capabilities {
  padding: 100px 80px;
  background: #f8fafc;
  text-align: center;
}

.cx-capabilities-header {
  max-width: 800px;
  margin: 0 auto 60px;
}

.cx-capabilities-title {
  font-family: 'Georgia', serif;
  font-size: 48px;
  color: #0f172a;
  margin-bottom: 20px;
  font-weight: 700;
}

.cx-capabilities-subheading {
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
}

.cx-capabilities-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.cx-capability-card {
  background: #ffffff;
  padding: 40px 32px;
  border-radius: 20px;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #f1f5f9;
}

.cx-capability-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.cx-capability-icon {
  width: 56px;
  height: 56px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 8px;
}

.cx-capability-title {
  font-size: 22px;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 12px;
}

.cx-capability-desc {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .cx-capabilities {
    padding: 80px 40px;
  }
  .cx-capabilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cx-capabilities-title {
    font-size: 36px;
  }
  .cx-capabilities-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .cx-capabilities {
    padding: 60px 20px;
  }
}
`

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
    icon: <HiOutlineArrowPath />,
    title: "Seamless Conversation Flow",
    desc: "Pause, respond, and resume conversations without breaking the user experience."
  },
  {
    icon: <HiOutlineCubeTransparent />,
    title: "Scalable Interaction System",
    desc: "Handle multiple users and sessions efficiently without performance loss."
  }
]

function CoreCapabilities() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="cx-capabilities">
      <style>{styles}</style>
      
      <div className="cx-capabilities-header">
        <h2 className="cx-capabilities-title">Powerful AI Capabilities</h2>
        <p className="cx-capabilities-subheading">
          Our platform combines conversational intelligence with human-like interaction to deliver a superior customer experience.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="cx-capabilities-grid"
      >
        {capabilities.map((cap, index) => (
          <motion.div 
            key={index}
            variants={item}
            className="cx-capability-card"
          >
            <div className="cx-capability-icon">
              {cap.icon}
            </div>
            <h3 className="cx-capability-title">{cap.title}</h3>
            <p className="cx-capability-desc">{cap.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default CoreCapabilities
