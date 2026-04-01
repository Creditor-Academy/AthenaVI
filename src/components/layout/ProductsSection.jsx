import { useState } from 'react'
import { MdArrowForward, MdArrowOutward, MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'

const styles = `
/* ── Section ── */
.ps-section {
  padding: 80px 40px;
  background: #e1ecf7ff;
  overflow: hidden;
}

.ps-section-header {
  text-align: center;
  margin-bottom: 52px;
}

.ps-section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #f59e0b;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.ps-section-eyebrow-line {
  width: 20px; height: 2px;
  background: #f59e0b;
  border-radius: 2px;
}

.ps-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  color: #0f172a;
  margin: 0 0 12px;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.ps-section-title span {
 color: #1e40af;
}

.ps-section-sub {
  font-family: 'Inter', sans-serif;
  font-size: clamp(15px, 2vw, 18px);
  font-weight: 400;
  color: #64748b;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── Card track ── */
.ps-track-wrap {
  position: relative;
}

.ps-track {
  display: flex;
  gap: 16px;
  align-items: stretch;
  justify-content: center;
}

/* ── Base card ── */
.ps-card {
  flex-shrink: 0;
  border-radius: 24px;
  cursor: pointer;
  transition: width 0.38s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.38s ease,
              box-shadow 0.38s ease;
  overflow: hidden;
  display: flex;
  position: relative;
  height: 360px;
}

/* Collapsed card */
.ps-card.collapsed {
  width: 240px;
  background: #1e293b;
  position: relative;
  overflow: hidden;
  padding: 0;
}

/* Expanded (active) card */
.ps-card.expanded {
  width: 580px;
  background: #ffffff;
  flex-direction: row;
  box-shadow: 0 16px 48px rgba(30, 64, 175, 0.15);
  padding: 0;
}

/* ── Collapsed card internals ── */
/* Text overlay sits above the image */
.ps-card-collapsed-inner {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 22px 20px;
  pointer-events: none;
}
/* Re-enable pointer events on interactive children */
.ps-card-collapsed-inner * {
  pointer-events: auto;
}

.ps-collapsed-title {
  font: 900 26px/1.2 Arial,sans-serif;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.7);
  flex-shrink: 0;
}

/* Full-bleed background image */
.ps-collapsed-img-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 24px;
  overflow: hidden;
}

.ps-collapsed-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  opacity: 0.88;
  transition: opacity 0.35s ease, transform 0.35s ease;
  display: block;
}

/* Gradient: transparent top, heavy dark at bottom for text */
.ps-collapsed-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 30%,
    rgba(0,0,0,0.75) 100%
  );
  pointer-events: none;
}

.ps-card.collapsed:hover .ps-collapsed-img-wrap img {
  opacity: 1;
  transform: scale(1.04);
}

.ps-collapsed-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-top: auto;
}

.ps-collapsed-label {
  font: 600 15px/1 Arial,sans-serif;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.ps-collapsed-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.ps-card.collapsed:hover .ps-collapsed-arrow {
  background: rgba(255,255,255,0.35);
}

/* ── Expanded card internals ── */
.ps-card-left {
  flex: 1;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
}

/* Fade-in content when card expands */
.ps-card.expanded .ps-card-left > * {
  animation: ps-fade-up 0.35s ease both;
}
.ps-card.expanded .ps-card-left > *:nth-child(1) { animation-delay: 0.05s; }
.ps-card.expanded .ps-card-left > *:nth-child(2) { animation-delay: 0.12s; }
.ps-card.expanded .ps-card-left > *:nth-child(3) { animation-delay: 0.19s; }

@keyframes ps-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ps-expanded-eyebrow {
  font: 700 13px/1 Arial,sans-serif;
  color: #f59e0b;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
}

.ps-expanded-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.ps-expanded-desc {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #64748b;
  margin: 0;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 1;
}

.ps-expanded-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: 700 13px/1 Arial,sans-serif;
  color: #1e40af;
  background: transparent;
  border: 2px solid #1e40af;
  border-radius: 8px;
  cursor: pointer;
  padding: 12px 22px;
  letter-spacing: 0.5px;
  margin-top: 4px;
  transition: background 0.25s, color 0.25s, gap 0.25s, transform 0.25s;
  white-space: nowrap;
}

.ps-expanded-btn:hover {
  background: #1e40af;
  color: #ffffff;
  gap: 14px;
  transform: translateY(-1px);
}

.ps-expanded-btn-icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(30,64,175,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  transition: transform 0.2s, background 0.25s;
}

.ps-expanded-btn:hover .ps-expanded-btn-icon {
  transform: translateX(2px);
  background: rgba(255,255,255,0.25);
}

/* ── Image column (expanded) ── */
.ps-card-right {
  width: 210px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border-radius: 0 24px 24px 0;
}

/* Image slides in from left when card expands */
.ps-card-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  animation: ps-slide-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ps-slide-in {
  from { transform: translateX(-30px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

/* ── Nav arrows ── */
.ps-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 36px;
}

.ps-nav-btn {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #1e40af;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.2s;
}

.ps-nav-btn:hover {
  background: #1e40af;
  color: #fff;
  border-color: #1e40af;
  transform: scale(1.08);
}

.ps-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.ps-dots { display: flex; gap: 8px; align-items: center; }

.ps-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.ps-dot.active {
  background: #1e40af;
  width: 22px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .ps-section { padding: 60px 20px; }
  .ps-section-title { font-size: 34px; }
  .ps-card { height: auto !important; }
  .ps-card.expanded { width: 100%; flex-direction: column; }
  .ps-card.collapsed { width: 160px; min-height: 220px; }
  .ps-card-right { width: 100%; height: 180px; border-radius: 0 0 24px 24px; }
  .ps-track { flex-wrap: nowrap; overflow-x: auto; }
}
`

const CARDS = [
  {
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=700&fit=crop&q=80',
    eyebrow: 'Visual AI Agent',
    title: 'Visual AI Agents',
    description: 'Redefining digital connections. Craft a lifelike conversational AI Agent that knows everything about you, your products, and services, all while reflecting your brand\'s look, voice, and tone.',
    btn: 'BUILD AN AGENT',
    bg: '#991b1b',
    cardBg: '#fee2e2',
  },
  {
    img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=700&fit=crop&q=80',
    eyebrow: 'Video Studio',
    title: 'Video Studio',
    description: 'Create professional videos with our advanced video editing tools and AI-powered features. Produce stunning content at scale without a production team.',
    btn: 'EXPLORE STUDIO',
    bg: '#1d4ed8',
    cardBg: '#dbeafe',
  },
  {
    img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=700&fit=crop&q=80',
    eyebrow: 'Video Translate',
    title: 'Video Translate',
    description: 'Automatically translate your videos into multiple languages with perfect lip-sync and natural voice. Reach a global audience without re-shooting a single frame.',
    btn: 'TRY TRANSLATE',
    bg: '#15803d',
    cardBg: '#dcfce7',
  },
  {
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=700&fit=crop&q=80',
    eyebrow: 'Video Campaigns',
    title: 'Video Campaigns',
    description: 'Launch and manage video marketing campaigns with analytics and optimization tools. Drive engagement with personalised video content at scale.',
    btn: 'START CAMPAIGN',
    bg: '#7e22ce',
    cardBg: '#ede9fe',
  },
]

const TOTAL = CARDS.length

function ProductsSection() {
  // Default: first card (index 0) is always expanded on load
  const [activeIndex, setActiveIndex] = useState(0)

  const prev = () => setActiveIndex(i => Math.max(0, i - 1))
  const next = () => setActiveIndex(i => Math.min(TOTAL - 1, i + 1))

  return (
    <>
      <style>{styles}</style>
      <section className="ps-section">

        <div className="ps-section-header">
          <div className="ps-section-eyebrow">
            <span className="ps-section-eyebrow-line" />
            Our Products
          </div>
          <h2 className="ps-section-title">
            Everything You Need to <span>Create</span>
          </h2>
          <p className="ps-section-sub">
            One platform. All the AI tools your team needs to produce, translate, and deliver video at scale.
          </p>
        </div>

        <div className="ps-track-wrap">
          <div className="ps-track">
            {CARDS.map((card, i) => {
              const isActive = i === activeIndex
              return (
                <div
                  key={i}
                  className={`ps-card ${isActive ? 'expanded' : 'collapsed'}`}
                  style={!isActive ? { background: card.cardBg } : {}}
                  /* Desktop: hover to expand */
                  onMouseEnter={() => setActiveIndex(i)}
                  /* Mobile: tap to expand */
                  onClick={() => setActiveIndex(i)}
                >
                  {isActive ? (
                    /* ── Expanded layout ── */
                    <>
                      <div className="ps-card-left">
                        <div>
                          <p className="ps-expanded-eyebrow">{card.eyebrow}</p>
                          <h3 className="ps-expanded-title">{card.title}</h3>
                        </div>
                        <p className="ps-expanded-desc">{card.description}</p>
                        <button className="ps-expanded-btn">
                          {card.btn}
                          <span className="ps-expanded-btn-icon"><MdArrowForward /></span>
                        </button>
                      </div>
                      <div className="ps-card-right" style={{ background: card.cardBg }}>
                        <img
                          key={`expanded-${i}`}
                          src={card.img}
                          alt={card.title}
                          onError={e => { e.currentTarget.src = `https://placehold.co/210x360/1e293b/fff?text=${card.title}` }}
                        />
                      </div>
                    </>
                  ) : (
                    /* ── Collapsed layout ── */
                    <>
                      {/* Layer 0: full-bleed background image */}
                      <div className="ps-collapsed-img-wrap">
                        <img
                          src={card.img}
                          alt={card.title}
                          onError={e => { e.currentTarget.src = `https://placehold.co/240x360/1e293b/fff?text=${card.title}` }}
                        />
                      </div>
                      {/* Layer 1: text overlay on top */}
                      <div className="ps-card-collapsed-inner">
                        <h3 className="ps-collapsed-title">{card.title}</h3>
                        <div className="ps-collapsed-footer">
                          <span className="ps-collapsed-label">Read More</span>
                          <span className="ps-collapsed-arrow"><MdArrowOutward /></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="ps-nav">
          <button className="ps-nav-btn" onClick={prev} disabled={activeIndex === 0} aria-label="Previous">
            <MdArrowBackIos />
          </button>
          <div className="ps-dots">
            {CARDS.map((_, i) => (
              <button
                key={i}
                className={`ps-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Card ${i + 1}`}
              />
            ))}
          </div>
          <button className="ps-nav-btn" onClick={next} disabled={activeIndex >= TOTAL - 1} aria-label="Next">
            <MdArrowForwardIos />
          </button>
        </div>

      </section>
    </>
  )
}

export default ProductsSection
