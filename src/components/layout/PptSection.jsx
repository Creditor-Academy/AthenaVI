import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayout, FiEdit3, FiArrowRight, FiCheck } from 'react-icons/fi';
import { LANDING_FONT, LANDING_LIGHT, LANDING_TYPE } from '../../styles/landingTypography';

import PptPromptGen from '../../assets/ppt_prompt_gen.jpg';
import PptSmartLayout from '../../assets/ppt_smart_layout.jpg';
import PptBrandKit from '../../assets/ppt_brand_kit.jpg';

const styles = `
.ppt-section {
  padding: 100px 40px;
  background: #f8fafc;
  font-family: ${LANDING_FONT};
  position: relative;
  overflow: hidden;
}

.ppt-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 4fr 6fr; /* 40:60 ratio */
  gap: 60px;
  align-items: stretch; /* Match heights */
}

.ppt-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 650px; /* Force split view height */
}

.ppt-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${LANDING_TYPE.eyebrowSize};
  font-weight: ${LANDING_TYPE.eyebrowWeight};
  color: #3b82f6;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 16px;
  border-radius: 100px;
  align-self: flex-start;
  flex-shrink: 0;
}

.ppt-title {
  font-size: 40px;
  font-weight: ${LANDING_TYPE.titleWeight};
  color: ${LANDING_LIGHT.title};
  line-height: 1.15;
  margin-bottom: 16px;
  letter-spacing: ${LANDING_TYPE.titleSpacing};
  flex-shrink: 0;
}

.ppt-title span {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ppt-desc {
  font-size: 15px;
  color: ${LANDING_LIGHT.subtitle};
  line-height: 1.6;
  margin-bottom: 24px;
  flex-shrink: 0;
}

/* Animated Accordion */
.ppt-accordion {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.accordion-item {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
}

.accordion-item:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.accordion-item.active {
  border-color: #3b82f6;
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.12);
}

.accordion-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.accordion-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 20px;
  transition: all 0.3s ease;
}

.accordion-item.active .accordion-icon {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.accordion-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  transition: color 0.3s ease;
}

.accordion-item.active .accordion-header h4 {
  color: #3b82f6;
}

.accordion-inner {
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.accordion-inner p {
  font-size: 15px;
  color: #475569;
  margin: 0;
  line-height: 1.6;
}

.accordion-img {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
}


/* Canvas Mockup - Interactive */
.ppt-visual {
  position: relative;
  perspective: 1000px;
  width: 100%;
  height: 650px;
}

.ppt-mockup {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ppt-mockup-header {
  height: 48px;
  background: #f1f5f9;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 8px;
  flex-shrink: 0;
}

.mockup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.mockup-dot.r { background: #ef4444; }
.mockup-dot.y { background: #f59e0b; }
.mockup-dot.g { background: #10b981; }

.ppt-mockup-body {
  flex: 1;
  position: relative;
  background: #f8fafc;
  overflow: hidden;
}

/* State 1: Prompt Input */
.ppt-prompt-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%);
  z-index: 10;
  padding: 40px;
}

.ppt-prompt-box {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.ppt-prompt-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ppt-prompt-title svg { color: #3b82f6; }

.ppt-textarea {
  width: 100%;
  height: 120px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  resize: none;
  font-family: inherit;
  font-size: 15px;
  color: #334155;
  background: #f8fafc;
  transition: all 0.2s;
}
.ppt-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ppt-generate-btn {
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ppt-generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

/* State 2: Loading */
.ppt-loading-overlay {
  position: absolute;
  inset: 0;
  background: white;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.ppt-loader-bars {
  display: flex;
  gap: 8px;
}
.ppt-loader-bar {
  width: 6px;
  height: 24px;
  background: #3b82f6;
  border-radius: 3px;
}

.ppt-loading-text {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* State 3: Generated UI */
.ppt-editor-ui {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100%;
}

.ppt-sidebar {
  border-right: 1px solid rgba(15, 23, 42, 0.05);
  background: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.ppt-slide-thumb {
  aspect-ratio: 16/9;
  border-radius: 8px;
  background: #f1f5f9;
  border: 2px solid transparent;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}
.ppt-slide-thumb.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* Dummy thumbnail contents */
.thumb-title { height: 6px; width: 60%; background: #cbd5e1; border-radius: 3px; }
.thumb-line { height: 4px; width: 90%; background: #e2e8f0; border-radius: 2px; }
.thumb-img { height: 40px; width: 100%; background: #e2e8f0; border-radius: 4px; margin-top: auto; }

.ppt-canvas-area {
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.ppt-slide-canvas {
  width: 100%;
  aspect-ratio: 16/9;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.slide-header {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
}

.slide-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  flex: 1;
}

.slide-text-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.slide-fake-text {
  height: 10px;
  background: #e2e8f0;
  border-radius: 5px;
  width: 100%;
}

.slide-image-block {
  background: #f1f5f9;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 40px;
}

.reset-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.reset-btn:hover { background: #f8fafc; }


@media (max-width: 1024px) {
  .ppt-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .ppt-visual { order: -1; position: relative; top: 0; }
  .ppt-editor-ui { grid-template-columns: 140px 1fr; }
}
@media (max-width: 640px) {
  .ppt-editor-ui { grid-template-columns: 1fr; }
  .ppt-sidebar { display: none; }
  .ppt-section { padding: 60px 20px; }
  .ppt-mockup { height: 400px; }
  .slide-header { font-size: 16px; margin-bottom: 12px; }
  .ppt-slide-canvas { padding: 16px; }
}
`;

const featuresData = [
  {
    id: 'prompt',
    title: 'Prompt to Presentation',
    icon: <FiEdit3 />,
    desc: 'Transform a single prompt into a beautifully structured, multi-slide deck in seconds. Our AI handles the design and content generation.',
    img: PptPromptGen
  },
  {
    id: 'layout',
    title: 'Smart Layout Engine',
    icon: <FiLayout />,
    desc: 'AI automatically selects perfect layouts, aligns text, and inserts relevant charts. Never worry about pixel-perfect alignment again.',
    img: PptSmartLayout
  },
  {
    id: 'brand',
    title: 'Brand Customization',
    icon: <FiCheck />,
    desc: 'Instantly apply your brand colors, fonts, and logos across every slide with a single click. Keep everything perfectly on-brand.',
    img: PptBrandKit
  }
];

const PptSection = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle'); // idle, generating, generated
  const [activeFeature, setActiveFeature] = useState('prompt');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setStatus('generating');
    
    setTimeout(() => {
      setStatus('generated');
    }, 2500);
  };

  const handleReset = () => {
    setPrompt('');
    setStatus('idle');
  };

  return (
    <>
      <style>{styles}</style>
      <section className="ppt-section">
        <div className="ppt-container">
          <div className="ppt-content">
            <div className="ppt-badge">AI Presentations</div>
            <h2 className="ppt-title">
              Design presentations<br /><span>in seconds</span>
            </h2>
            <p className="ppt-desc">
              Transform a simple prompt or document into a fully formatted, beautiful presentation.
            </p>

            <div className="ppt-accordion">
              {featuresData.map((feature) => {
                const isActive = activeFeature === feature.id;
                return (
                  <motion.div 
                    layout
                    key={feature.id} 
                    className={`accordion-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveFeature(feature.id)}
                  >
                    <motion.div layout="position" className="accordion-header">
                      <div className="accordion-icon">{feature.icon}</div>
                      <h4>{feature.title}</h4>
                    </motion.div>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          className="accordion-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="accordion-inner">
                            <p>{feature.desc}</p>
                            <div className="accordion-img" style={{ backgroundImage: `url(${feature.img})` }}></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="ppt-visual">
            <div className="ppt-mockup">
              <div className="ppt-mockup-header">
                <div className="mockup-dot r"></div>
                <div className="mockup-dot y"></div>
                <div className="mockup-dot g"></div>
              </div>
              
              <div className="ppt-mockup-body">
                <AnimatePresence mode="wait">
                  {status === 'idle' && (
                    <motion.div 
                      key="idle"
                      className="ppt-prompt-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="ppt-prompt-box">
                        <div className="ppt-prompt-title">
                          <FiEdit3 /> What would you like to create?
                        </div>
                        <textarea
                          className="ppt-textarea"
                          placeholder="e.g. A 10-slide pitch deck for a new sustainable coffee brand..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                        <button 
                          className="ppt-generate-btn"
                          onClick={handleGenerate}
                          disabled={!prompt.trim()}
                          style={{ opacity: !prompt.trim() ? 0.6 : 1 }}
                        >
                          Generate AI Presentation <FiArrowRight />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {status === 'generating' && (
                    <motion.div 
                      key="generating"
                      className="ppt-loading-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="ppt-loader-bars">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="ppt-loader-bar"
                            animate={{ scaleY: [1, 1.8, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <div className="ppt-loading-text">Structuring your slides...</div>
                    </motion.div>
                  )}

                  {status === 'generated' && (
                    <motion.div 
                      key="generated"
                      className="ppt-editor-ui"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="ppt-sidebar">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`ppt-slide-thumb ${i === 1 ? 'active' : ''}`}>
                            <div className="thumb-title"></div>
                            <div className="thumb-line"></div>
                            <div className="thumb-line" style={{ width: '70%' }}></div>
                            <div className="thumb-img"></div>
                          </div>
                        ))}
                      </div>
                      <div className="ppt-canvas-area">
                        <div className="ppt-slide-canvas">
                          <div className="slide-header">
                            {prompt.length > 25 ? prompt.substring(0, 25) + '...' : (prompt || "Generated Presentation")}
                          </div>
                          <div className="slide-body">
                            <div className="slide-text-block">
                              <div className="slide-fake-text" style={{ width: '90%' }}></div>
                              <div className="slide-fake-text" style={{ width: '95%' }}></div>
                              <div className="slide-fake-text" style={{ width: '80%' }}></div>
                              <div className="slide-fake-text" style={{ width: '85%', marginTop: '12px' }}></div>
                              <div className="slide-fake-text" style={{ width: '75%' }}></div>
                              <div className="slide-fake-text" style={{ width: '60%' }}></div>
                            </div>
                            <div className="slide-image-block">
                              <FiLayout />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="reset-btn" onClick={handleReset}>Start Over</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PptSection;
