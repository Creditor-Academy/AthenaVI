import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiSettings, FiMaximize, FiZap, FiCheckCircle, FiPieChart, FiUser, FiMoreHorizontal } from 'react-icons/fi';
import { LANDING_FONT, LANDING_LIGHT, LANDING_TYPE } from '../../styles/landingTypography';

const styles = `
.img-node-section {
  padding: 100px 20px;
  background: #ffffff;
  font-family: ${LANDING_FONT};
  position: relative;
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${LANDING_TYPE.eyebrowSize};
  font-weight: ${LANDING_TYPE.eyebrowWeight};
  color: #3b82f6;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 20px;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 16px;
  border-radius: 100px;
}

.section-title {
  font-size: ${LANDING_TYPE.titleSize};
  font-weight: ${LANDING_TYPE.titleWeight};
  color: ${LANDING_LIGHT.title};
  line-height: 1.15;
  letter-spacing: ${LANDING_TYPE.titleSpacing};
}

.section-title span {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.node-container {
  max-width: 1240px;
  height: 520px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nodes-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 520px;
  z-index: 2;
  width: 280px;
}

.nodes-column.right {
  justify-content: center;
}

/* Left Node Cards */
.node-card {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: all 0.3s ease;
  height: 120px; /* Fixed height for consistent SVG lines */
  justify-content: center;
  opacity: 0.5;
  filter: grayscale(100%);
}

.node-card.active {
  opacity: 1;
  filter: grayscale(0%);
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
}

.node-card.active .node-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.1));
  color: #3b82f6;
}

.node-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

/* Prompt Box (Shared Input) */
.shared-input-container {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #334155;
  border: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.shared-input-text {
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-word;
  line-height: 1.4;
}

.shared-input-image {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.typing-cursor {
  display: inline-block;
  width: 6px;
  height: 12px;
  background-color: #3b82f6;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Laptop Mockup */
.laptop-center {
  position: relative;
  width: 580px;
  z-index: 2;
  perspective: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.laptop-body {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #1e293b;
  border-radius: 16px 16px 0 0;
  padding: 12px;
  box-shadow: inset 0 0 0 2px #334155, 0 20px 40px rgba(0,0,0,0.1);
  position: relative;
}

.laptop-screen {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* App UI inside Laptop */
.app-header {
  background: #ffffff;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-dots {
  display: flex;
  gap: 6px;
}

.app-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
}
.app-dots span:nth-child(1) { background: #fecaca; }
.app-dots span:nth-child(2) { background: #fef08a; }
.app-dots span:nth-child(3) { background: #bbf7d0; }

.app-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  flex-grow: 1;
  text-align: center;
  margin-right: 40px;
}

.app-body {
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-row {
  display: flex;
  gap: 12px;
  max-width: 90%;
}

.chat-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
  font-size: 16px;
}

.chat-row.ai .chat-avatar {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  color: white;
}

/* Laptop specific shared input styling */
.chat-row.user .shared-input-container {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
  border-top-right-radius: 4px;
  max-height: none; /* remove max height in chat */
}
.chat-row.user .shared-input-text {
  color: white;
}
.chat-row.user .shared-input-image {
  height: auto;
  max-height: 150px;
}

/* AI Chat GPT style animation */
.ai-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
  font-size: 13px;
  color: #64748b;
}

.dot-flashing {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 5px;
  background-color: #3b82f6;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}
.dot-flashing::before, .dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 6px;
  height: 6px;
  border-radius: 5px;
  background-color: #3b82f6;
}
.dot-flashing::before {
  left: -10px;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}
.dot-flashing::after {
  left: 10px;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% { background-color: #3b82f6; }
  50%, 100% { background-color: rgba(59, 130, 246, 0.2); }
}

/* Fantastic Photos Grid */
.photos-result {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 4px;
  width: 380px; /* fixed width for chat bubble */
}

.photos-result img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 2px solid white;
}

.laptop-base {
  width: 115%;
  height: 20px;
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 0 0 16px 16px;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 15px 25px rgba(0,0,0,0.2);
}

.laptop-base::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #64748b;
  border-radius: 0 0 4px 4px;
}

/* Right Visuals - Image Grid */
.variations-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.variation-item {
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  border: 2px solid white;
}

.variation-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.variation-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(15, 23, 42, 0.7);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  font-weight: 600;
}

/* Connections */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.connection-path {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 2;
}

.connection-path-active {
  fill: none;
  stroke: url(#line-gradient);
  stroke-width: 2.5;
  stroke-dasharray: 8 8;
  animation: dash-flow 3s linear infinite;
}

@keyframes dash-flow {
  to {
    stroke-dashoffset: -100;
  }
}

@media (max-width: 1024px) {
  .img-node-section {
    padding: 60px 20px;
  }
  .node-container {
    height: auto;
    flex-direction: column;
    gap: 40px;
  }
  .connections-svg {
    display: none;
  }
  .laptop-center {
    width: 100%;
    max-width: 580px;
    order: -1;
  }
  .nodes-column {
    width: 100%;
    max-width: 580px;
    height: auto;
    gap: 16px;
  }
}
`;

const scenarios = [
  {
    id: 'text',
    title: 'Text Prompt',
    icon: <FiZap />,
    input: "A clean, bright lifestyle photograph of a minimalist ceramic vase, airy lighting, promotional banner.",
    inputType: 'text',
    resultImages: [
      "/promo_banner_1.jpg",
      "/promo_banner_1b.jpg"
    ]
  },
  {
    id: 'reference',
    title: 'Reference Image',
    icon: <FiImage />,
    input: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300", // Bright minimalist office reference
    inputType: 'image',
    resultImages: [
      "/promo_banner_2.jpg",
      "/promo_banner_2b.jpg"
    ]
  },
  {
    id: 'infographic',
    title: 'Infographics',
    icon: <FiPieChart />,
    input: "Generate a clean, subtle 3D infographic chart with soft pastel colors, elegant business style.",
    inputType: 'text',
    resultImages: [
      "/infographic_clean.jpg",
      "/infographic_clean_b.jpg"
    ]
  }
];

const ImageGenerationSection = () => {
  const [sIndex, setSIndex] = useState(0);
  const [subState, setSubState] = useState('idle'); // idle -> typing -> sending -> generating -> done
  const [typedPrompt, setTypedPrompt] = useState("");

  const scenario = scenarios[sIndex];

  // State Machine Controller
  useEffect(() => {
    let timeout;

    if (subState === 'idle') {
      setTypedPrompt("");
      timeout = setTimeout(() => setSubState('typing'), 500);
    } 
    else if (subState === 'typing') {
      if (scenario.inputType === 'text') {
        let i = 0;
        const typingInterval = setInterval(() => {
          if (i < scenario.input.length) {
            setTypedPrompt(scenario.input.substring(0, i + 1));
            i++;
          } else {
            clearInterval(typingInterval);
            setTimeout(() => setSubState('sending'), 800);
          }
        }, 30);
        return () => clearInterval(typingInterval);
      } else {
        // Image upload simulation
        timeout = setTimeout(() => setSubState('sending'), 1500);
      }
    }
    else if (subState === 'sending') {
      // Swiping to laptop animation duration
      timeout = setTimeout(() => setSubState('generating'), 800);
    }
    else if (subState === 'generating') {
      // ChatGPT thinking animation duration
      timeout = setTimeout(() => setSubState('done'), 2500);
    }
    else if (subState === 'done') {
      // Show final photos before moving to next scenario
      timeout = setTimeout(() => {
        setSubState('idle');
        setSIndex((prev) => (prev + 1) % scenarios.length);
      }, 4000);
    }

    return () => clearTimeout(timeout);
  }, [subState, scenario]);

  // Shared Input Component (Animates across layout changes)
  const renderSharedInput = () => (
    <motion.div 
      layoutId="shared-input"
      className="shared-input-container"
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {scenario.inputType === 'text' ? (
        <div className="shared-input-text">
          {subState === 'typing' ? typedPrompt : scenario.input}
          {subState === 'typing' && <span className="typing-cursor"></span>}
        </div>
      ) : (
        <img className="shared-input-image" src={scenario.input} alt="Reference" />
      )}
    </motion.div>
  );

  return (
    <>
      <style>{styles}</style>
      <section className="img-node-section">
        <div className="section-header">
          <div className="badge">AI Workspace</div>
          <h2 className="section-title">
            From <span>imagination</span> to reality
          </h2>
        </div>

        <div className="node-container">
          {/* Static Background Connections SVG 
              Layout metrics: Container 520px height. 
              Left Cards are 120px height each, spaced evenly (justify-between).
              So centers are at Y = 60, 260, 460.
              Laptop Center is at Y = 260.
          */}
          <svg className="connections-svg" viewBox="0 0 1240 520" preserveAspectRatio="none">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            {/* Background Paths */}
             <path className="connection-path" d="M 280,60 C 440,60 420,260 520,260" />
             <path className="connection-path" d="M 280,260 C 440,260 420,260 520,260" />
             <path className="connection-path" d="M 280,460 C 440,460 420,260 520,260" />
             <path className="connection-path" d="M 720,260 C 820,260 800,260 960,260" />

            {/* Active Animated Paths based on sIndex */}
            {sIndex === 0 && (
              <path className="connection-path-active" d="M 280,60 C 440,60 420,260 520,260" />
            )}
            {sIndex === 1 && (
              <path className="connection-path-active" d="M 280,260 C 440,260 420,260 520,260" />
            )}
            {sIndex === 2 && (
              <path className="connection-path-active" d="M 280,460 C 440,460 420,260 520,260" />
            )}

            {/* Laptop to Right Path active when done */}
            {subState === 'done' && (
               <path className="connection-path-active" d="M 720,260 C 820,260 800,260 960,260" />
            )}
          </svg>

          {/* Left Column (Scenarios) */}
          <div className="nodes-column left">
            {scenarios.map((scen, idx) => {
              const isActive = sIndex === idx;
              const isTypingPhase = isActive && (subState === 'typing' || subState === 'idle');
              
              return (
                <div key={scen.id} className={`node-card ${isActive ? 'active' : ''}`}>
                  <div className="node-header">
                    <div className="node-icon">{scen.icon}</div>
                    <h4 className="node-title">{scen.title}</h4>
                  </div>
                  {/* Render the shared input HERE during typing phase */}
                  {isTypingPhase && renderSharedInput()}
                </div>
              );
            })}
          </div>

          {/* Central Laptop (Workspace) */}
          <motion.div 
            className="laptop-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="laptop-body">
              <div className="laptop-screen">
                <div className="app-header">
                  <div className="app-dots"><span></span><span></span><span></span></div>
                  <div className="app-title">Athena AI Workspace</div>
                </div>

                <div className="app-body">
                  {/* Render the shared input HERE after swipe */}
                  {subState !== 'idle' && subState !== 'typing' && (
                    <div className="chat-row user">
                      <div className="chat-avatar"><FiUser /></div>
                      {renderSharedInput()}
                    </div>
                  )}

                  {/* AI Generating State */}
                  {subState === 'generating' && (
                    <motion.div 
                      className="chat-row ai"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="chat-avatar"><FiZap /></div>
                      <div className="ai-thinking">
                         <div className="dot-flashing"></div>
                         <span style={{marginLeft: 16}}>Generating...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Done State (Show 2 Fantastic Photos) */}
                  {subState === 'done' && (
                    <motion.div 
                      className="chat-row ai"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="chat-avatar"><FiZap /></div>
                      <div className="photos-result">
                        <img src={scenario.resultImages[0]} alt="Result 1" />
                        <img src={scenario.resultImages[1]} alt="Result 2" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            <div className="laptop-base"></div>
          </motion.div>

          {/* Right Column (History / Variations) */}
          <div className="nodes-column right">
             <div className="node-title" style={{marginBottom: 16, justifyContent: 'center'}}>
               Output Variations
             </div>
             
             <div className="variations-grid">
               <motion.div 
                 className="variation-item"
                 animate={{ 
                   opacity: subState === 'done' ? 1 : 0.4, 
                   scale: subState === 'done' ? 1 : 0.9 
                 }}
               >
                 <img src={scenario.resultImages[0]} alt="V1" />
                 <div className="variation-badge">V1</div>
               </motion.div>

               <motion.div 
                 className="variation-item"
                 animate={{ 
                   opacity: subState === 'done' ? 1 : 0.4, 
                   scale: subState === 'done' ? 1 : 0.9 
                 }}
                 transition={{ delay: 0.1 }}
               >
                 <img src={scenario.resultImages[1]} alt="V2" />
                 <div className="variation-badge">V2</div>
               </motion.div>
             </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ImageGenerationSection;
