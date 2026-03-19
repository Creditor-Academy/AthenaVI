import React, { useEffect, useRef, useState } from 'react';
import { FiFolderPlus, FiFileText, FiUser, FiPlay } from 'react-icons/fi';

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

/* ── Feature cards from VideoSection ── */
const featureCards = [
  {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80',
    alt: 'AI-Powered Creation',
    title: 'AI-Powered Creation',
    description: 'Generate professional videos in minutes with our advanced AI technology. Simply provide your content and let the AI handle the rest.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80',
    alt: 'Easy Customization',
    title: 'Easy Customization',
    description: 'Personalize every aspect of your videos with intuitive editing tools. Adjust styles, fonts, colors, and transitions to match your brand.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80',
    alt: 'Multi-Language Support',
    title: 'Multi-Language Support',
    description: 'Create videos in any language with automatic translation features. Reach a global audience with AI-powered voice synthesis.'
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
  padding: 100px 40px;
  background: #ffffff;
  color: #1e40af;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}

.unified-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(17, 34, 87, 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

.unified-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── Video Section Styles ── */
.vs-header {
  text-align: center;
  margin-bottom: 60px;
}
.vs-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(30,64,175,0.1) 0%, rgba(59,130,246,0.1) 100%);
  border: 1px solid rgba(30,64,175,0.18);
  color: #1e40af;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 7px 18px;
  border-radius: 999px;
  margin-bottom: 24px;
}
.vs-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3b82f6;
  display: inline-block;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}
.vs-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 20px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.vs-subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0 auto 20px;
  max-width: 600px;
  line-height: 1.7;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 120px;
}
.video-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  height: 340px;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.4s ease;
}
.video-card:hover {
  box-shadow: 0 20px 48px rgba(30, 64, 175, 0.1);
  transform: translateY(-8px);
}
.video-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.video-card:hover .video-card-image {
  transform: scale(1.1);
}
.video-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 20, 60, 0.95) 0%, rgba(10, 20, 60, 0.4) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.video-card:hover .video-card-overlay {
  opacity: 1;
}
.video-card-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-transform: uppercase;
}
.video-card-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-top: 12px;
  transform: translateY(20px);
  transition: transform 0.4s ease;
}
.video-card:hover .video-card-description {
  transform: translateY(0);
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
    font-size: clamp(28px, 4vw, 46px);
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 0 0 14px;
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
    max-width: 1100px;
    margin: 60px auto 0;
    position: relative;
}
.hiw-timeline::before {
    content: '';
    position: absolute;
    top: 38px;
    left: calc(12.5% + 20px);
    right: calc(12.5% + 20px);
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6);
    z-index: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.hiw-timeline.visible::before { transform: scaleX(1); }

.hiw-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 12px;
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}
.hiw-timeline.visible .hiw-step { opacity: 1; transform: translateY(0); }
.hiw-timeline.visible .hiw-step:nth-child(1) { transition-delay: 0.15s; }
.hiw-timeline.visible .hiw-step:nth-child(2) { transition-delay: 0.3s; }
.hiw-timeline.visible .hiw-step:nth-child(3) { transition-delay: 0.45s; }
.hiw-timeline.visible .hiw-step:nth-child(4) { transition-delay: 0.6s; }

.hiw-icon-wrap {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid rgba(59,130,246,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    box-shadow: 0 12px 24px rgba(59,130,246,0.06);
    transition: all 0.4s ease;
    z-index: 2;
    color: #3b82f6;
}
.hiw-step:hover .hiw-icon-wrap {
    transform: scale(1.1) rotate(5deg);
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    box-shadow: 0 16px 32px rgba(59,130,246,0.2);
}
.hiw-icon-wrap svg { width: 30px; height: 30px; stroke-width: 2; }

.hiw-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 28px 24px;
    width: 100%;
    max-width: 260px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    transition: all 0.4s ease;
}
.hiw-step:hover .hiw-card {
    transform: translateY(-8px);
    box-shadow: 0 20px 48px rgba(59,130,246,0.1);
}
.hiw-card h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
.hiw-card p { font-size: 14px; line-height: 1.6; color: #64748b; margin: 0; }

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

  return (
    <>
      <style>{styles}</style>
      <section className="unified-section">
        <div className="unified-content">
          
          {/* Part 1: Video Features (from VideoSection) */}
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

          <div className="video-grid">
            {featureCards.map((card, i) => (
              <div className="video-card" key={i}>
                <img src={card.image} alt={card.alt} className="video-card-image" />
                <div className="video-card-overlay">
                  <h3 className="video-card-title">{card.title}</h3>
                  <p className="video-card-description">{card.description}</p>
                </div>
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
