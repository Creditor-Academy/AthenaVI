import React, { useEffect, useRef, useState } from 'react';
import { FiFolderPlus, FiFileText, FiUser, FiPlay, FiArrowUpRight, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import CustomizeAi from '../../assets/CustomizeAi.jpg';
import AIvideo from '../../assets/AIvideo.jpg';
import Voice from '../../assets/Voice.jpg';

/* ── Step data from HowItWorks ── */
const steps = [
  {
    title: "Create Project",
    description: "Start a new project in your workspace and organize your video scenes.",
    Icon: FiFolderPlus,
  },
  {
    title: "Write Script",
    description: "Add narration text for each scene. The AI avatar will speak this script automatically.",
    Icon: FiFileText,
  },
  {
    title: "Choose AI Avatar",
    description: "Select an AI instructor avatar and customize voice and layout.",
    Icon: FiUser,
  },
  {
    title: "Generate Video",
    description: "Render the final video in HD and share it instantly.",
    Icon: FiPlay,
  },
];

/* ── Feature cards ── */
const featureCards = [
  {
    image: CustomizeAi,
    alt: 'AI-Powered Creation',
    title: 'AI-Powered Creation with NextGen Tools',
    description: 'Generate professional videos in minutes with our advanced AI technology.',
    category: 'AI Engine',
    features: ['Real-time Gen', 'HD 4K Support']
  },
  {
    image: AIvideo,
    alt: 'Easy Customization',
    title: 'Customize Every Frame with Ease',
    description: 'Personalize every aspect of your videos with intuitive editing tools.',
    category: 'Toolkit',
    features: ['Infinite Edit', 'Layer Control']
  },
  {
    image: Voice,
    alt: 'Voice-Based Interaction',
    title: 'Voice-Based Interaction',
    description: 'Enable users to ask questions using voice and receive intelligent spoken responses.',
    category: 'Vocal AI',
    features: ['Smart NLP', 'Instant Voice']
  },
];

/* ── Intersection Observer hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const styles = `
.unified-section {
  padding: 80px 40px;
  background: #ffffff;
  color: #1e40af;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.unified-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(17, 34, 87, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

/* Decorative Blobs */
.section-blob {
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}
.blob-1 { top: -100px; left: -100px; background: #3b82fb; }
.blob-2 { bottom: 200px; right: -100px; background: #8b5cf6; width: 400px; height: 400px; }

.unified-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── Video Section Styles ── */
.vs-header {
  text-align: center;
  margin-bottom: 80px;
}
.vs-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  color: #1e40af;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 8px 20px;
  border-radius: 100px;
  margin-bottom: 28px;
}
.vs-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  display: inline-block;
  animation: pulse-dot 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.6); }
}
.vs-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 400;
  line-height: 1.1;
  margin: 0 0 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
}
.vs-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 400;
  color: #475569;
  margin: 0 auto;
  max-width: 640px;
  line-height: 1.6;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 32px;
  margin-bottom: 120px;
}

.video-card-ref {
  background: #ffffff;
  border-radius: 30px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 580px;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 
    0 0 0 1px rgba(15, 23, 42, 0.02),
    0 2px 4px rgba(15, 23, 42, 0.02),
    0 10px 20px rgba(15, 23, 42, 0.04),
    0 20px 40px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
}

.card-number {
  position: absolute;
  top: 20px;
  right: 32px;
  font-size: 80px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.03);
  line-height: 1;
  pointer-events: none;
  font-family: 'Inter', sans-serif;
  transition: all 0.5s ease;
}
.video-card-ref:hover .card-number {
  color: rgba(59, 130, 246, 0.06);
  transform: translateY(-10px);
}

.card-category {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #3b82f6;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-category::before {
  content: '';
  width: 12px;
  height: 2px;
  background: currentColor;
  display: block;
}

/* Shimmer Sweep Animation */
.video-card-ref::after {
  content: '';
  position: absolute;
  top: 0; left: -150%;
  width: 100%; height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);
  transition: 0.8s;
  pointer-events: none;
}
.video-card-ref:hover::after {
  left: 150%;
}

.video-card-ref.visible {
  opacity: 1;
  transform: translateY(0);
}

.video-card-ref:hover {
  transform: translateY(-16px);
  box-shadow: 
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 20px 40px -10px rgba(15, 23, 42, 0.1),
    0 40px 80px -20px rgba(15, 23, 42, 0.15);
}

.ref-title {
  font-family: 'Inter', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
  margin: 0 0 16px;
  letter-spacing: -1.2px;
  transition: color 0.3s ease;
}

.ref-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #475569;
  margin-bottom: 20px;
  letter-spacing: -0.2px;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

.feature-tag {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  gap: 5px;
}

.ref-img-wrap {
  width: 100%;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  background: #f1f5f9;
}

/* Aurora Glow Effect behind image */
.ref-img-wrap::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.12), transparent 70%);
  filter: blur(20px);
  z-index: -1;
  opacity: 0;
  transition: 0.5s;
}
.video-card-ref:hover .ref-img-wrap::before {
  opacity: 1;
}

.ref-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.video-card-ref:hover .ref-img {
  transform: scale(1.08);
}

/* Middle Card Variant (Index 1) */
.video-card-ref.variant-middle {
  background: linear-gradient(145deg, #1e40af 0%, #1d4ed8 40%, #3b82f6 100%);
  color: #ffffff;
  border: none;
  box-shadow: 
    0 10px 30px rgba(30, 64, 175, 0.2),
    0 20px 60px rgba(30, 64, 175, 0.15);
}
.video-card-ref.variant-middle::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}

.variant-middle .card-category { color: rgba(255,255,255,0.8); }
.variant-middle .card-number { color: rgba(255,255,255,0.05); }
.variant-middle .feature-tag { background: rgba(255,255,255,0.1); border: none; color: #fff; }

.variant-middle .ref-title {
  color: #ffffff;
  margin-top: 24px;
}

.variant-middle .ref-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.variant-middle .ref-img-wrap {
  margin-top: 0;
  height: 240px;
  border-radius: 0;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}


/* ── How It Works Styles ── */
.hiw-header {
  text-align: center;
  margin-bottom: 60px;
}
.hiw-badge {
    display: inline-block;
    padding: 6px 18px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3b82f6;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.15);
    margin-bottom: 18px;
}
.hiw-heading {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 55px;
    font-weight: 400;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 14px;
    letter-spacing: -1.5px;
}
.hiw-heading span {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hiw-timeline {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    max-width: 1200px;
    margin: 80px auto 0;
    position: relative;
}
.hiw-timeline::before {
    content: '';
    position: absolute;
    top: 38px;
    left: calc(12.5% + 40px);
    right: calc(12.5% + 40px);
    height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #3b82f6, transparent);
    z-index: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.hiw-timeline.visible::before { transform: scaleX(1); }

.hiw-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.hiw-timeline.visible .hiw-step { opacity: 1; transform: translateY(0); }

.hiw-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.05);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 2;
    color: #1e40af;
    position: relative;
}
.hiw-step:hover .hiw-icon-wrap {
    transform: translateY(-5px) rotate(8deg);
    background: #1e40af;
    color: #ffffff;
    box-shadow: 0 20px 40px -10px rgba(30, 64, 175, 0.3);
    border-color: transparent;
}
.hiw-icon-wrap svg { width: 32px; height: 32px; stroke-width: 1.5; }

.hiw-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(15, 23, 42, 0.06);
    border-radius: 24px;
    padding: 32px 24px;
    width: 100%;
    max-width: 280px;
    transition: all 0.4s ease;
}
.hiw-step:hover .hiw-card {
    transform: translateY(-8px);
    background: #ffffff;
    box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.08);
    border-color: rgba(59, 130, 246, 0.15);
}
.hiw-card h3 { 
  font-family: 'Inter', sans-serif;
  font-size: 19px; 
  font-weight: 700; 
  color: #0f172a; 
  margin: 0 0 14px; 
  letter-spacing: -0.5px;
}
.hiw-card p { 
  font-family: 'Inter', sans-serif;
  font-size: 15px; 
  line-height: 1.6; 
  color: #475569; 
  margin: 0; 
  font-weight: 400;
}

.hiw-demo-wrap {
    max-width: 1000px;
    margin: 100px auto 0;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s;
}
.hiw-demo-wrap.visible { opacity: 1; transform: translateY(0); }

.hiw-demo {
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 32px 80px rgba(0,0,0,0.06);
    overflow: hidden;
}

@media (max-width: 1024px) {
  .hiw-timeline { grid-template-columns: repeat(2, 1fr); gap: 40px 20px; }
  .hiw-timeline::before { display: none; }
}

@media (max-width: 768px) {
  .unified-section { padding: 80px 20px; }
  .video-grid { grid-template-columns: 1fr; }
  .hiw-timeline { grid-template-columns: 1fr; }
}
`;

const UnifiedVideoSection = () => {
  const [tlRef, tlVisible] = useReveal(0.1);
  const [demoRef, demoVisible] = useReveal(0.1);
  const [gridRef, gridVisible] = useReveal(0.05);

  return (
    <>
      <style>{styles}</style>
      <section className="unified-section">
        {/* Decor Blobs */}
        <div className="section-blob blob-1"></div>
        <div className="section-blob blob-2"></div>

        <div className="unified-content">
          
          {/* Part 1: Video Features */}
          <div className="vs-header">
            <div className="vs-badge">
              <span className="vs-badge-dot"></span>
              AI-Powered Tools
            </div>
            <h2 className="vs-title">Create Stunning Videos</h2>
            <p className="vs-subtitle">
              Transform your ideas into engaging video content with our powerful AI tools
            </p>
          </div>

          <div ref={gridRef} className="video-grid">
            {featureCards.map((card, i) => (
              <div 
                className={`video-card-ref${i === 1 ? ' variant-middle' : ''}${gridVisible ? ' visible' : ''}`} 
                key={i}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {i === 1 ? (
                  <>
                    <div className="card-number">0{i + 1}</div>
                    <div className="card-category">{card.category}</div>
                    <div className="ref-img-wrap">
                      <img src={card.image} alt={card.alt} className="ref-img" />
                    </div>
                    <h3 className="ref-title">{card.title}</h3>
                    <p className="ref-description">{card.description}</p>
                    <div className="card-features">
                      {card.features.map(f => (
                        <span key={f} className="feature-tag">
                          <FiCheckCircle size={12} /> {f}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="card-number">0{i + 1}</div>
                    <div className="card-category">{card.category}</div>
                    <h3 className="ref-title">{card.title}</h3>
                    <p className="ref-description">{card.description}</p>
                    <div className="card-features">
                      {card.features.map(f => (
                        <span key={f} className="feature-tag">
                          <FiCheckCircle size={12} /> {f}
                        </span>
                      ))}
                    </div>
                    <div className="ref-img-wrap">
                      <img src={card.image} alt={card.alt} className="ref-img" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Part 2: How It Works (from HowItWorks) */}
          <div className="hiw-header">
            <div className="hiw-badge">AI Video Workflow</div>
            <h2 className="hiw-heading">
              Create AI Videos in <span>4 Simple Steps</span>
            </h2>
          </div>

          <div ref={tlRef} className={`hiw-timeline${tlVisible ? ' visible' : ''}`}>
            {steps.map((step, i) => {
              const { Icon } = step;
              return (
                <div className="hiw-step" key={i}>
                  <div className="hiw-icon-wrap">
                    <Icon />
                  </div>
                  <div className="hiw-card">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demo Preview */}
          <div ref={demoRef} className={`hiw-demo-wrap${demoVisible ? ' visible' : ''}`}>
            <div className="hiw-demo">
              <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399' }} />
              </div>
              <div style={{ padding: '40px', background: '#f8faff', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <FiPlay color="white" size={32} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>AI_EDITOR_PREVIEW</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default UnifiedVideoSection;
