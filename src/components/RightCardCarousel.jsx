import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdLayers, MdMic, MdMovie } from "react-icons/md";

const styles = `
.right-card-container {
  position: relative;
  width: 380px;
  height: 380px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.right-card-wrapper {
  position: absolute;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  color: #1e293b;
  cursor: pointer;
  height: 270px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: box-shadow 0.3s ease;
  overflow: hidden;
}

.right-card-wrapper:hover {
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
}

.right-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  position: relative;
  z-index: 10;
}

.right-card-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.right-card-tag {
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

.right-card-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1e40af;
  position: relative;
  z-index: 10;
}

.right-card-description {
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
  position: relative;
  z-index: 10;
}

/* ===== BACKGROUND VARIANTS ===== */

.card-rendering::before,
.card-ai::before,
.card-scale::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
}

.card-rendering::after,
.card-ai::after,
.card-scale::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* RENDERING */
.card-rendering::before {
  background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15), transparent 70%);
}
.card-rendering::after {
  background-image: url("data:image/svg+xml;utf8,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q50 50 100 100 T200 100' stroke='%233b82f6' fill='none' stroke-width='1.5' opacity='0.2'/%3E%3C/svg%3E");
  animation: flowMove 6s linear infinite;
}

/* AI */
.card-ai::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 80% 20%,
    rgba(147,51,234,0.2),
    transparent 60%
  );
}
.card-ai::after {
  content: "";
  position: absolute;
  inset: 0;

  background-image: url("data:image/svg+xml;utf8,\
  <svg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'>\
    <path d='M0 100 C100 20 300 180 400 100' stroke='%239333ea' fill='none' stroke-width='2' opacity='0.2'/>\
    <path d='M0 140 C120 60 280 200 400 140' stroke='%239333ea' fill='none' stroke-width='2' opacity='0.15'/>\
  </svg>");

  background-size: cover;
  background-repeat: no-repeat;

  animation: meshMove 6s ease-in-out infinite alternate;
}
/* SCALE */
.card-scale::before {
  background: radial-gradient(circle at center, rgba(16, 185, 129, 0.15), transparent 70%);
}
.card-scale::after {
  background-image: url("data:image/svg+xml;utf8,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='60' stroke='%2310b981' fill='none' stroke-width='2' opacity='0.2'/%3E%3Ccircle cx='100' cy='100' r='90' stroke='%233b82f6' fill='none' stroke-width='2' opacity='0.15'/%3E%3C/svg%3E");
  animation: pulseGlow 4s ease-in-out infinite;
}

@keyframes flowMove {
  0% { background-position: 0 0; }
  100% { background-position: 200px 0; }
}

@keyframes meshMove {
  0% {
    transform: translateY(0px);
    opacity: 0.3;
  }
  100% {
    transform: translateY(-10px);
    opacity: 0.5;
  }
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@media (max-width: 1024px) {
  .right-card-container {
    width: 100%;
    max-width: 380px;
    height: 380px;
  }
}
`;

const cards = [
  {
    tag: "Rendering Engine",
    title: "Smart Video Rendering",
    description: "Generate high-quality videos using an asynchronous rendering pipeline with scene-by-scene processing and automatic stitching.",
    icon: <MdMovie size={18} />,
    color: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    type: "card-rendering"
  },
  {
    tag: "AI Interaction",
    title: "Interactive AI Instructor",
    description: "AI instructor can pause lectures, answer questions using voice, and resume seamlessly from the same point.",
    icon: <MdMic size={18} />,
    color: "linear-gradient(135deg, #9333ea, #c084fc)",
    type: "card-ai"
  },
  {
    tag: "Scalability",
    title: "Built for Scale",
    description: "A fully scalable system with distributed workers, cloud storage, and CDN delivery for fast and reliable performance.",
    icon: <MdLayers size={18} />,
    color: "linear-gradient(135deg, #10b981, #34d399)",
    type: "card-scale"
  }
];

const RightCardCarousel = () => {
  const [index, setIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 20;
    const rotateY = (x - centerX) / 20;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="right-card-container">
      <style>{styles}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {cards.map((card, i) => {
          const position = (i - index + cards.length) % cards.length;
          const isFront = position === 0;
          const isMiddle = position === 1;
          const isBack = position === 2;

          return (
            <motion.div
              key={i}
              className={`right-card-wrapper ${card.type}`}
              onMouseMove={isFront ? handleMouseMove : undefined}
              onMouseLeave={isFront ? handleMouseLeave : undefined}
              animate={{
                scale: isFront ? 1 : isMiddle ? 0.94 : 0.88,
                y: isFront ? 40 : isMiddle ? 0 : -40,
                x: isFront ? 0 : isMiddle ? 15 : 30,
                zIndex: isFront ? 30 : isMiddle ? 20 : 10,
                opacity: isFront ? 1 : isMiddle ? 0.6 : 0.3,
                filter: isFront ? 'blur(0px)' : isMiddle ? 'blur(1px)' : 'blur(2px)',
                rotateX: isFront ? tilt.x : 0,
                rotateY: isFront ? tilt.y : 0,
                transformPerspective: 1000,
                transition: {
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
            >
              <div className="right-card-header">
                <div
                  className="right-card-icon-box"
                  style={{ background: card.color }}
                >
                  {card.icon}
                </div>
                <span className="right-card-tag">{card.tag}</span>
              </div>
              <h3 className="right-card-title">{card.title}</h3>
              <p className="right-card-description">{card.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RightCardCarousel;
