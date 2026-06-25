import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

// Unsplash CDN helper
const U = (id, w = 400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// Each category has 4 portrait-style preview images
const CATEGORIES = [
  {
    id: 1,
    title: 'Corporate\nPresentation',
    count: 12,
    images: [
      U('1556761175-4b46a572b786'), // boardroom
      U('1573497019236-17f8177b81e8'), // presentation
      U('1497366216548-37526070297c'), // modern office
    ],
  },
  {
    id: 2,
    title: 'Educational\nModule',
    count: 9,
    images: [
      U('1456513080510-7bf3a84b82f8'), // studying
      U('1503676260728-1c00da094a0b'), // classroom
      U('1516321318423-f06f85e504b3'), // laptop learning
    ],
  },
  {
    id: 3,
    title: 'Marketing\nCampaign',
    count: 14,
    images: [
      U('1533750349088-cd871a92f312'), // neon marketing
      U('1460925895917-afdab827c52f'), // laptop analytics
      U('1551650975-d300049d99fa'), // phone mockup
    ],
  },
  {
    id: 4,
    title: 'Personal\nStory',
    count: 8,
    images: [
      U('1531746020798-e6953c6e8e04'), // portrait
      U('1529156069898-49953e39b3ac'), // lifestyle
      U('1508214751196-bcfd4ca60f91'), // individual
    ],
  },
  {
    id: 5,
    title: 'Social\nShort',
    count: 11,
    images: [
      U('1611162616475-46b635cb6868'), // phone creator
      U('1585184394271-4c0d40a8e25f'), // content creation
      U('1512941937669-90a1b58e7e9c'), // mobile phone
    ],
  },
  {
    id: 6,
    title: 'All-Purpose\nTemplate',
    count: 16,
    images: [
      U('1499750310107-5fef28a66643'), // workspace
      U('1522202176988-66273c2fd55f'), // team creative
      U('1454165804606-c3d57bc86b40'), // work desk
    ],
  },
]

const css = `
/* ─────────────────────────────────────────
   Templates Section
───────────────────────────────────────── */
.ts-section {
  padding: 96px 48px 88px;
  background: #e8eef6;
  font-family: 'Inter', sans-serif;
}

/* Header */
.ts-header {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 56px;
}
.ts-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(30,64,175,0.06);
  border: 1px solid rgba(30,64,175,0.12);
  border-radius: 999px;
  color: #1e40af;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.ts-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  animation: ts-pulse 2s ease-in-out infinite;
}
@keyframes ts-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.3; transform:scale(.55); }
}
.ts-title {
  font-family: 'Georgia','Times New Roman',serif;
  font-size: clamp(32px, 4vw, 50px);
  font-weight: 400;
  color: #0f172a;
  line-height: 1.12;
  letter-spacing: -1.6px;
  margin: 0 0 14px;
}
.ts-title span {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ts-subtitle {
  font-size: 16px;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
}

/* Grid — 3 cols × 2 rows */
.ts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto 56px;
}

/* ── Card ── */
.ts-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid rgba(15,23,42,0.09);
  border-radius: 18px;
  height: 160px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .28s ease, box-shadow .28s ease;
}
.ts-card:hover {
  border-color: rgba(30,64,175,0.22);
  box-shadow: 0 8px 32px rgba(15,23,42,0.09);
}

/* Left text block */
.ts-card-label {
  flex-shrink: 0;
  width: 148px;
  padding: 0 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}
.ts-card-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
  white-space: pre-line;
  letter-spacing: -0.4px;
}
.ts-card-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* Right image cluster — sits flush to right edge, clipped by card overflow:hidden */
.ts-img-cluster {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 46%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  transition: width .42s cubic-bezier(.16,1,.3,1);
}
.ts-card:hover .ts-img-cluster {
  width: 56%;
}

/* Each portrait image strip */
.ts-img-strip {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
  border-left: 2px solid #ffffff;
}
.ts-img-strip:first-child {
  border-left: none;
}
.ts-img-strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1);
  transition: transform .5s cubic-bezier(.16,1,.3,1);
}
.ts-card:hover .ts-img-strip img {
  transform: scale(1.07);
}

/* ── CTA strip ── */
.ts-cta {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 36px;
  background: #f8fafc;
  border: 1px solid rgba(15,23,42,0.06);
  border-radius: 20px;
}
.ts-cta-left h4 {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -.3px;
}
.ts-cta-left p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}
.ts-cta-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #0f172a;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.ts-cta-btn:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30,64,175,.28);
}

/* Responsive */
@media (max-width: 1024px) {
  .ts-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ts-grid { grid-template-columns: 1fr; }
  .ts-section { padding: 64px 20px; }
  .ts-cta { flex-direction: column; text-align: center; }
  .ts-cta-btn { width: 100%; justify-content: center; }
  .ts-card { height: 140px; }
  .ts-card-label { width: 130px; padding-left: 20px; }
  .ts-card-name { font-size: 15px; }
}
`

function TemplatesSection({ onNavigateToSolution }) {
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
          transition={{ duration: 0.6 }}
        >
          <div className="ts-eyebrow">
            <span className="ts-eyebrow-dot" />
            Templates
          </div>
          <h2 className="ts-title">
            Start with a template.<br /><span>Ship in minutes.</span>
          </h2>
          <p className="ts-subtitle">
            Ready-made layouts for every use case — pick one, add your content, and generate.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="ts-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="ts-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              {/* Left: title */}
              <div className="ts-card-label">
                <span className="ts-card-name">{cat.title}</span>
                <span className="ts-card-count">{cat.count} templates</span>
              </div>

              {/* Right: image strips */}
              <div className="ts-img-cluster">
                {cat.images.map((src, j) => (
                  <div className="ts-img-strip" key={j}>
                    <img src={src} alt={`${cat.title} preview ${j + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          className="ts-cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="ts-cta-left">
            <h4>50+ templates across every category</h4>
            <p>New templates added every week — always something fresh to start from.</p>
          </div>
          <button
            className="ts-cta-btn"
            onClick={() => onNavigateToSolution && onNavigateToSolution('AI Videos')}
          >
            Browse All Templates <FiArrowRight size={15} />
          </button>
        </motion.div>

      </section>
    </>
  )
}

export default TemplatesSection
