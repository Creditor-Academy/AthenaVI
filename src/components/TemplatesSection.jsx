import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiLayers, FiEdit3, FiCpu, FiDownload, FiPlay } from 'react-icons/fi'

/* ── Template data ── */
const TEMPLATES = [
  {
    id: 1,
    title: 'Corporate Explainer',
    badge: 'Popular',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    layout: [
      { label: 'Avatar', x: '8%', y: '12%', w: '38%', h: '60%' },
      { label: 'Title', x: '52%', y: '18%', w: '40%', h: '14%' },
      { label: 'Subtitle', x: '52%', y: '38%', w: '36%', h: '8%' },
      { label: 'CTA', x: '52%', y: '56%', w: '28%', h: '10%' },
    ],
  },
  {
    id: 2,
    title: 'Product Demo',
    badge: 'New',
    gradient: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
    layout: [
      { label: 'Screen', x: '6%', y: '6%', w: '88%', h: '55%' },
      { label: 'Guide', x: '6%', y: '66%', w: '30%', h: '28%' },
      { label: 'CTA', x: '42%', y: '74%', w: '24%', h: '12%' },
    ],
  },
  {
    id: 3,
    title: 'Social Story',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
    layout: [
      { label: '9:16', x: '20%', y: '4%', w: '60%', h: '70%' },
      { label: 'Text', x: '15%', y: '78%', w: '70%', h: '10%' },
    ],
  },
  {
    id: 4,
    title: 'Training Module',
    gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    layout: [
      { label: 'Slides', x: '6%', y: '6%', w: '60%', h: '50%' },
      { label: 'Quiz', x: '6%', y: '60%', w: '60%', h: '34%' },
      { label: 'Instructor', x: '70%', y: '6%', w: '24%', h: '40%' },
    ],
  },
  {
    id: 5,
    title: 'News Bulletin',
    badge: 'Popular',
    gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    layout: [
      { label: 'Anchor', x: '6%', y: '6%', w: '40%', h: '65%' },
      { label: 'Headline', x: '50%', y: '12%', w: '44%', h: '16%' },
      { label: 'Ticker', x: '6%', y: '80%', w: '88%', h: '12%' },
    ],
  },
]

/* ── Feature data ── */
const FEATURES = [
  {
    Icon: FiLayers,
    title: 'Ready-Made Templates',
    desc: 'Pre-designed templates for business, marketing, education, and social media.',
  },
  {
    Icon: FiEdit3,
    title: 'Easy Customization',
    desc: 'Edit text, avatars, colors, and layout with simple drag-and-drop controls.',
  },
  {
    Icon: FiCpu,
    title: 'Smart AI Assistance',
    desc: 'AI helps generate scripts, voice, and visuals automatically for your video.',
  },
  {
    Icon: FiDownload,
    title: 'Fast Export',
    desc: 'Generate and download videos in high quality within minutes — no rendering queues.',
  },
]

/* ── Styles ── */
const css = `
  .ts-section {
    padding: 110px 40px 120px;
    background: #f8fafc;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .ts-section::before {
    content: "";
    position: absolute;
    bottom: -100px; left: -100px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .ts-section::after {
    content: "";
    position: absolute;
    top: -80px; right: -80px;
    width: 350px; height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Header */
  .ts-header {
    text-align: center;
    margin-bottom: 56px;
    position: relative;
    z-index: 1;
  }
  .ts-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #3b82f6;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .ts-eyebrow-line {
    width: 24px; height: 2px;
    background: linear-gradient(90deg, #3b82f6, #9333ea);
    border-radius: 2px;
  }
  .ts-title {
    font-size: clamp(30px, 5vw, 50px);
    font-weight: 850;
    color: #0f172a;
    line-height: 1.1;
    margin: 0 0 14px;
    letter-spacing: -0.025em;
  }
  .ts-title span {
    background: linear-gradient(135deg, #1e40af, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ts-subtitle {
    font-size: clamp(15px, 1.5vw, 17px);
    color: #64748b;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Main Layout */
  .ts-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 48px;
    max-width: 1140px;
    margin: 0 auto;
    align-items: start;
    position: relative;
    z-index: 1;
  }

  /* ========= LEFT: Asymmetric Grid ========= */
  .ts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }
  .ts-grid-featured {
    grid-row: 1 / 3;
  }

  /* Template Card */
  .ts-card {
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transition: all 0.4s cubic-bezier(0.2,0.8,0.2,1);
  }
  .ts-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0,0,0,0.14);
    border-color: rgba(59,130,246,0.15);
  }

  .ts-card-preview {
    position: relative;
    overflow: hidden;
  }
  .ts-card-preview.featured {
    height: 100%;
    min-height: 380px;
  }
  .ts-card-preview.small {
    height: 170px;
  }

  /* Hover overlay */
  .ts-card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 3;
    transition: background 0.3s ease;
    pointer-events: none;
  }
  .ts-card:hover .ts-card-overlay {
    background: rgba(0,0,0,0.45);
    pointer-events: auto;
  }

  .ts-overlay-btn {
    padding: 10px 24px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.3px;
    transition: all 0.25s ease;
    opacity: 0;
    transform: translateY(8px);
  }
  .ts-card:hover .ts-overlay-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .ts-card:hover .ts-overlay-btn:nth-child(2) {
    transition-delay: 0.06s;
  }

  .ts-overlay-btn.primary {
    background: #3b82f6;
    color: #fff;
    border: none;
    box-shadow: 0 6px 20px rgba(59,130,246,0.4);
  }
  .ts-overlay-btn.primary:hover {
    background: #2563eb;
    transform: scale(1.04) translateY(0);
  }
  .ts-overlay-btn.secondary {
    background: transparent;
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.7);
  }
  .ts-overlay-btn.secondary:hover {
    background: rgba(255,255,255,0.15);
    transform: scale(1.04) translateY(0);
  }

  /* Badge */
  .ts-badge {
    position: absolute;
    top: 12px; left: 12px;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #fff;
    z-index: 4;
    backdrop-filter: blur(8px);
  }

  /* Card info */
  .ts-card-info {
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ts-card-name {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .ts-card-arrow {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex; align-items: center; justify-content: center;
    color: #475569;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }
  .ts-card:hover .ts-card-arrow {
    background: #1e40af;
    color: #fff;
    transform: translateX(2px);
  }

  /* ========= RIGHT: Feature Panel ========= */
  .ts-panel {
    position: sticky;
    top: 120px;
  }
  .ts-panel-title {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }
  .ts-panel-sub {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 32px;
    line-height: 1.55;
  }

  .ts-feature-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ts-feature {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 16px 18px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: all 0.3s ease;
  }
  .ts-feature:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: rgba(59,130,246,0.12);
  }

  .ts-feature-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #9333ea);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(59,130,246,0.2);
  }
  .ts-feature-icon svg {
    width: 20px; height: 20px;
    color: #fff;
  }

  .ts-feature-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
  }
  .ts-feature-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }

  /* Panel CTA */
  .ts-panel-cta {
    margin-top: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 26px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    background: #1e40af;
    color: #fff;
    border: none;
    cursor: pointer;
    width: 100%;
    justify-content: center;
    transition: all 0.3s ease;
    letter-spacing: 0.3px;
  }
  .ts-panel-cta:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(30,64,175,0.3);
  }

  /* Responsive */
  @media (max-width: 920px) {
    .ts-layout {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .ts-panel { position: static; }
    .ts-grid-featured { grid-row: auto; }
  }
  @media (max-width: 600px) {
    .ts-section { padding: 64px 16px 80px; }
    .ts-grid { grid-template-columns: 1fr; }
    .ts-card-preview.featured { min-height: 240px; }
  }
`

/* ── Mini Preview Component ── */
const MiniPreview = ({ gradient, layout }) => (
  <div style={{
    width: '100%', height: '100%', background: gradient,
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Wireframe container */}
    <div style={{
      position: 'absolute', inset: '12%',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.15)',
      overflow: 'hidden',
    }}>
      {/* Mini toolbar */}
      <div style={{
        display: 'flex', gap: '3px', padding: '6px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {['#f87171','#fbbf24','#34d399'].map(c => (
          <div key={c} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
        ))}
      </div>
    </div>

    {/* Layout blocks */}
    {layout.map((block, i) => (
      <motion.div
        key={block.label}
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
        style={{
          position: 'absolute', left: block.x, top: block.y,
          width: block.w, height: block.h,
          borderRadius: '6px',
          border: '1px dashed rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{
          fontSize: '9px', color: 'rgba(255,255,255,0.6)',
          fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.5px',
        }}>{block.label}</span>
      </motion.div>
    ))}
  </div>
)

/* ── Main Component ── */
function TemplatesSection() {
  const featured = TEMPLATES[0]
  const rest = TEMPLATES.slice(1)

  return (
    <>
      <style>{css}</style>
      <section className="ts-section">

        {/* Header */}
        <motion.div
          className="ts-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="ts-eyebrow">
            <span className="ts-eyebrow-line" />
            Video Templates
          </div>
          <h2 className="ts-title">
            Start with <span>Templates</span>, Make It Yours
          </h2>
          <p className="ts-subtitle">
            Choose a template, customize it, and generate professional videos in minutes.
          </p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="ts-layout">

          {/* ── LEFT: Asymmetric Template Grid ── */}
          <div className="ts-grid">
            {/* Featured (large, spans 2 rows) */}
            <motion.div
              className="ts-card ts-grid-featured"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              animate={{ y: [0, -4, 0] }}
            >
              <div className="ts-card-preview featured">
                <MiniPreview gradient={featured.gradient} layout={featured.layout} />
                {featured.badge && (
                  <span className="ts-badge" style={{ background: 'rgba(59,130,246,0.7)' }}>
                    {featured.badge}
                  </span>
                )}
                <div className="ts-card-overlay">
                  <button className="ts-overlay-btn primary">
                    <FiPlay style={{ width: 14, height: 14 }} /> Use Template
                  </button>
                </div>
              </div>
              <div className="ts-card-info">
                <h3 className="ts-card-name">{featured.title}</h3>
                <div className="ts-card-arrow"><FiArrowRight style={{ width: 14, height: 14 }} /></div>
              </div>
            </motion.div>

            {/* Smaller cards */}
            {rest.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                className="ts-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 + i * 0.1 }}
                animate={{ y: [0, -3, 0] }}
              >
                <div className="ts-card-preview small">
                  <MiniPreview gradient={tmpl.gradient} layout={tmpl.layout} />
                  {tmpl.badge && (
                    <span className="ts-badge" style={{
                      background: tmpl.badge === 'New'
                        ? 'rgba(16, 185, 129, 0.75)'
                        : 'rgba(59,130,246,0.7)',
                    }}>
                      {tmpl.badge}
                    </span>
                  )}
                  <div className="ts-card-overlay">
                    <button className="ts-overlay-btn primary">
                      <FiPlay style={{ width: 13, height: 13 }} /> Use Template
                    </button>
                  </div>
                </div>
                <div className="ts-card-info">
                  <h3 className="ts-card-name">{tmpl.title}</h3>
                  <div className="ts-card-arrow"><FiArrowRight style={{ width: 14, height: 14 }} /></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── RIGHT: Feature Panel ── */}
          <motion.div
            className="ts-panel"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="ts-panel-title">Why Use Our Templates?</h3>
            <p className="ts-panel-sub">
              Save hours of work. Start with proven structures and make them uniquely yours.
            </p>

            <div className="ts-feature-list">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="ts-feature"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  <div className="ts-feature-icon">
                    <feat.Icon />
                  </div>
                  <div>
                    <p className="ts-feature-title">{feat.title}</p>
                    <p className="ts-feature-desc">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="ts-panel-cta">
              Browse All Templates <FiArrowRight />
            </button>
          </motion.div>

        </div>

      </section>
    </>
  )
}

export default TemplatesSection
