import React from 'react';
import { motion } from 'framer-motion';
import { MdLayers, MdMic, MdMouse, MdAutoAwesome } from "react-icons/md";

const styles = `
.left-card-wrapper {
  position: relative;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 28px 32px;
  width: 380px;
  min-height: 250px;

  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.35),
    0 0 25px rgba(59, 130, 246, 0.06);

  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-card-wrapper:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 35px rgba(59, 130, 246, 0.15);
}

/* HEADER ICON */
.left-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.left-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

/* TAG */
.left-card-tag {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* TITLE */
.left-card-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.25;
}

/* SUBTITLE */
.left-card-subtitle {
  font-size: 14px;
  line-height: 1.55;
  color: #94a3b8;
  margin-bottom: 20px;
  font-weight: 400;
}

/* LIST */
.left-card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ITEM */
.left-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13.5px;
  color: #cbd5e1;
  font-weight: 500;
}

/* ITEM ICON */
.left-card-item-icon {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
}

/* BACKGROUND ACCENTS */
.left-card-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='1.5' fill='%2360a5fa' opacity='0.04'/></svg>");
  background-size: 30px 30px;
  pointer-events: none;
}

.left-card-wrapper::after {
  content: "";
  position: absolute;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
  top: -80px;
  right: -80px;
  pointer-events: none;
  animation: floatGlow 8s ease-in-out infinite alternate;
}

@keyframes floatGlow {
  0% { transform: translate(0, 0); opacity: 0.3; }
  100% { transform: translate(-20px, 20px); opacity: 0.7; }
}

.left-card-wrapper > * {
  position: relative;
  z-index: 2;
}

@media (max-width: 1024px) {
  .left-card-wrapper {
    width: 100%;
    max-width: 450px;
    padding: 28px;
    margin: 0 auto;
  }
  .left-card-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .left-card-wrapper {
    padding: 24px 20px;
  }
  .left-card-title {
    font-size: 18px;
  }
}
`;

const LeftCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="left-card-wrapper"
    >
      <style>{styles}</style>

      {/* HEADER */}
      <div className="left-card-header">
        <div className="left-card-icon">
          <MdAutoAwesome size={16} />
        </div>
        <span className="left-card-tag">Core Feature</span>
      </div>

      <h3 className="left-card-title">
        AI Instructor Video Creation
      </h3>

      <p className="left-card-subtitle">
        Create professional AI-powered instructional videos with scene-based
        editing and lifelike avatars.
      </p>

      <ul className="left-card-list">
        <li className="left-card-item">
          <div className="left-card-item-icon">
            <MdLayers size={14} />
          </div>
          Scene-based video editor
        </li>

        <li className="left-card-item">
          <div className="left-card-item-icon">
            <MdMic size={14} />
          </div>
          AI avatar with voice & lip-sync
        </li>

        <li className="left-card-item">
          <div className="left-card-item-icon">
            <MdMouse size={14} />
          </div>
          Drag-and-drop visual elements
        </li>
      </ul>

    </motion.div>
  );
};

export default LeftCard;