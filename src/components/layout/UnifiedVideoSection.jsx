import React, { useEffect, useRef, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import CustomizeAi from '../../assets/CustomizeAi.jpg';
import AIvideo from '../../assets/AIvideo.jpg';
import Voice from '../../assets/Voice.jpg';

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
  background: #e1ecf7;
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
.blob-1 { top: -100px; left: -100px; background: #3b82fb; opacity: 0.25; }
.blob-2 { bottom: 200px; right: -100px; background: #8b5cf6; width: 400px; height: 400px; opacity: 0.2; }

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
  grid-template-columns: repeat(3, 1fr);
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

/* Middle Card Variant (Index 1) — matches Hero section navy gradient */
.video-card-ref.variant-middle {
  background: radial-gradient(circle at 50% 30%, #080f26 0%, #040817 60%, #01020a 100%);
  color: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 
    0 10px 30px rgba(4, 8, 23, 0.45),
    0 20px 60px rgba(8, 15, 38, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.video-card-ref.variant-middle::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%);
  pointer-events: none;
}

.variant-middle .card-category { color: rgba(255,255,255,0.7); }
.variant-middle .card-number { color: rgba(255,255,255,0.04); }
.variant-middle .feature-tag { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.25); color: #93c5fd; }

.variant-middle .ref-title {
  color: #ffffff;
  margin-top: 24px;
}

.variant-middle .ref-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.variant-middle .ref-img-wrap {
  margin-top: 0;
  height: 240px;
  border-radius: 0;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 20px 40px rgba(0,0,0,0.35);
}


@media (max-width: 1024px) {
  .video-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .unified-section { padding: 80px 20px; }
  .video-grid { grid-template-columns: 1fr; }
}
`;

const UnifiedVideoSection = () => {
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
            {/* <div className="vs-badge">
              <span className="vs-badge-dot"></span>
              AI-Powered Tools
            </div> */}
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





        </div>
      </section>
    </>
  );
};

export default UnifiedVideoSection;
