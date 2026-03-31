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

const styles = `
.cx-caps-section {
  padding: 80px 40px;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.cx-caps-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.cx-caps-layout {
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 1400px;
  width: 100%;
}

.cx-caps-left {
  position: relative;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cx-caps-arc {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 750px;
  height: 750px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  z-index: 1;
}

.cx-caps-disc {
  position: relative;
  width: 440px;
  height: 440px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.cx-caps-disc-icon {
  font-size: 48px;
  color: #0f172a;
  margin-bottom: 20px;
}

.cx-caps-disc-title {
  font-family: 'Georgia', serif;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 16px;
}

.cx-caps-disc-divider {
  width: 60px;
  height: 0;
  border-bottom: 2px dotted #64748b;
  margin-bottom: 16px;
}

.cx-caps-disc-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.5;
}

.cx-caps-right {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.cx-caps-item {
  display: flex;
  align-items: center;
  position: relative;
  height: 90px;
}

.cx-caps-connector {
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
}

.cx-caps-dot {
  width: 14px;
  height: 14px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  margin-left: -7px;
}

.cx-caps-icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ffffff;
  color: #0f172a;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 3;
}

.cx-caps-card {
  flex: 1;
  max-width: 440px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 3px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-bottom: 3px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40px 0 65px;
  margin-left: -35px;
  z-index: 2;
  position: relative;
  clip-path: polygon(0% 0%, calc(100% - 30px) 0%, 100% 50%, calc(100% - 30px) 100%, 0% 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cx-caps-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: calc(100% - 30px);
  width: 52px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  transform-origin: left top;
  transform: rotate(56.31deg);
  pointer-events: none;
}

.cx-caps-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: calc(100% - 30px);
  width: 55px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  transform-origin: left bottom;
  transform: rotate(-56.31deg);
  pointer-events: none;
}

.cx-caps-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.cx-caps-card-desc {
  font-size: 13px;
  color: #afbfd7;
  line-height: 1.4;
}

.cx-caps-number {
  position: absolute;
  top: 10px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: #ffffff;
  border-radius: 50%;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  border: 2px solid #27303f;
  z-index: 4;
}

.cx-row-1 { margin-left: 55px; }
.cx-row-1 .cx-caps-connector { width: 145px; }

.cx-row-2 { margin-left: 110px; }
.cx-row-2 .cx-caps-connector { width: 140px; }

.cx-row-3 { margin-left: 135px; }
.cx-row-3 .cx-caps-connector { width: 140px; }

.cx-row-4 { margin-left: 110px; }
.cx-row-4 .cx-caps-connector { width: 140px; }

.cx-row-5 { margin-left: 55px; }
.cx-row-5 .cx-caps-connector { width: 145px; }

@media (max-width: 1024px) {
  .cx-caps-section { padding: 60px 20px; }
  .cx-caps-layout { flex-direction: column; gap: 40px; }
  .cx-caps-left { width: 100%; max-width: 400px; }
  .cx-caps-arc { display: none; }
  .cx-caps-disc { width: 340px; height: 340px; padding: 30px; }
  .cx-caps-right { padding-left: 0; width: 100%; align-items: center; }
  .cx-caps-item { margin-left: 0 !important; width: 100%; max-width: 400px; }
  .cx-caps-connector { display: none; }
  .cx-caps-icon-circle { box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
  .cx-caps-card { clip-path: none; margin-left: 15px; border-radius: 12px; padding-left: 20px; }
  .cx-caps-number { right: -10px; top: -10px; border-color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
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
    icon: <HiOutlineCubeTransparent />,
    title: "Scalable Interaction System",
    desc: "Handle multiple users and sessions efficiently without performance loss."
  }
]

const CoreCapabilities = () => {
  return (
    <section className="cx-caps-section">
      <style>{styles}</style>
      <div className="cx-caps-layout">
        <div className="cx-caps-left">
          <div className="cx-caps-arc"></div>
          <motion.div 
            className="cx-caps-disc"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="cx-caps-disc-icon">
              <HiGlobeAmericas />
            </div>
            <h2 className="cx-caps-disc-title">POWERFUL<br />CAPABILITIES</h2>
            <div className="cx-caps-disc-divider" />
            <p className="cx-caps-disc-desc">
              Our platform combines conversational intelligence with human-like interaction to deliver a superior customer experience.
            </p>
          </motion.div>
        </div>

        <div className="cx-caps-right">
          {capabilities.map((cap, index) => (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              key={index}
              className={`cx-caps-item cx-row-${index + 1}`}
            >
              <div className="cx-caps-connector">
                <div className="cx-caps-dot" />
              </div>

              <div className="cx-caps-icon-circle">
                {cap.icon}
              </div>
              
              <div className="cx-caps-card">
                <div className="cx-caps-number">
                  0{index + 1}
                </div>
                
                <h3 className="cx-caps-card-title">{cap.title}</h3>
                <p className="cx-caps-card-desc">{cap.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CoreCapabilities
