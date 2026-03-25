import React from 'react';
import { motion } from 'framer-motion';
import { MdLayers, MdMic, MdMouse, MdAutoAwesome } from "react-icons/md";

const styles = `
.left-card-wrapper {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 24px 30px;
  width: 380px;
  min-height: 250px;

  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.08),
    0 5px 15px rgba(59, 130, 246, 0.05);

  transition: all 0.3s ease;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-card-wrapper:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.12),
    0 10px 20px rgba(59, 130, 246, 0.1);
}

/* HEADER ICON */
.left-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.left-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  box-shadow: 0 8px 15px rgba(59,130,246,0.25);
}

/* TAG */
.left-card-tag {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(30, 64, 175, 0.1);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: #1e40af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TITLE */
.left-card-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1e40af;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

/* SUBTITLE */
.left-card-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
  margin-bottom: 16px;
  font-weight: 500;
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
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}

/* ITEM ICON */
.left-card-item-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(59,130,246,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

/* BACKGROUND */
.left-card-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='1.5' fill='%233b82f6' opacity='0.08'/></svg>");
  background-size: 30px 30px;
}

.left-card-wrapper::after {
  content: "";
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%);
  top: -75px;
  right: -75px;
  animation: floatGlow 8s ease-in-out infinite alternate;
}

@keyframes floatGlow {
  0% { transform: translate(0, 0); opacity: 0.2; }
  100% { transform: translate(-30px, 30px); opacity: 0.5; }
}

.left-card-wrapper > * {
  position: relative;
  z-index: 2;
}

@media (max-width: 1024px) {
  .left-card-wrapper {
    width: 100%;
    max-width: 380px;
    padding: 20px;
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