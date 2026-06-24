import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

// Unsplash CDN — free to use with attribution
const UNSPLASH = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const TEMPLATES = [
  {
    id: 1,
    title: 'Corporate Presentation',
    description: 'Polish your brand story with structured slides, data visuals, and a professional AI avatar.',
    category: 'Business',
    duration: '3–5 min',
    scenes: 8,
    // Modern office / boardroom — Unsplash: Scott Graham
    img: UNSPLASH('1556761175-4b46a572b786'),
  },
  {
    id: 2,
    title: 'Educational Module',
    description: 'Break down complex topics into clear, engaging lessons your audience will actually retain.',
    category: 'Education',
    duration: '2–4 min',
    scenes: 6,
    // Student studying / learning — Unsplash: Green Chameleon
    img: UNSPLASH('1456513080510-7bf3a84b82f8'),
  },
  {
    id: 3,
    title: 'Marketing Campaign',
    description: 'Drive clicks and conversions with high-energy visuals and persuasive AI-generated copy.',
    category: 'Marketing',
    duration: '1–2 min',
    scenes: 5,
    // Bold colorful marketing / neon lights — Unsplash: Merakist
    img: UNSPLASH('1533750349088-cd871a92f312'),
  },
  {
    id: 4,
    title: 'Personal Story',
    description: 'Share your journey in an authentic, human way — great for personal branding and portfolios.',
    category: 'Personal',
    duration: '1–3 min',
    scenes: 4,
    // Portrait / personal brand — Unsplash: Ivana Cajina
    img: UNSPLASH('1531746020798-e6953c6e8e04'),
  },
  {
    id: 5,
    title: 'Social Short',
    description: 'Punchy 30–60 second clips built for Instagram, TikTok, and YouTube Shorts.',
    category: 'Social',
    duration: '30–60 s',
    scenes: 3,
    // Phone / social media content creator — Unsplash: Jakob Owens
    img: UNSPLASH('1611162616475-46b635cb6868'),
  },
  {
    id: 6,
    title: 'All-Purpose',
    description: 'A flexible starter layout that adapts to any message — the perfect blank canvas.',
    category: 'General',
    duration: '2–5 min',
    scenes: 7,
    // Clean workspace / creative setup — Unsplash: Domenico Loia
    img: UNSPLASH('1499750310107-5fef28a66643'),
  },
]

const CATEGORIES = ['All', 'Business', 'Education', 'Marketing', 'Personal', 'Social', 'General']

const css = `
.ts-section {
  padding: 96px 40px 80px;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* ── Header ── */
.ts-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 52px;
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
  animation: ts-blink 2s ease-in-out infinite;
}
@keyframes ts-blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.35; transform:scale(.6); }
}
.ts-title {
  font-family: 'Georgia','Times New Roman',serif;
  font-size: clamp(34px,4vw,52px);
  font-weight: 400;
  color: #0f172a;
  line-height: 1.12;
  letter-spacing: -1.8px;
  margin: 0 0 14px;
}
.ts-title span {
  background: linear-gradient(135deg,#1e40af,#3b82f6);
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

/* ── Filters ── */
.ts-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 52px;
}
.ts-filter {
  padding: 7px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(15,23,42,0.1);
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all .2s ease;
  font-family: 'Inter',sans-serif;
}
.ts-filter:hover {
  border-color: rgba(30,64,175,.25);
  color: #1e40af;
}
.ts-filter.active {
  background: #1e40af;
  border-color: #1e40af;
  color: #fff;
  box-shadow: 0 4px 14px rgba(30,64,175,.22);
}

/* ── Grid ── */
.ts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px 32px;
  max-width: 1200px;
  margin: 0 auto 64px;
}

/* ── Card — image-first, text below ── */
.ts-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: transparent;
  border: none;
}

/* Image block */
.ts-img-wrap {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 20px;
  overflow: hidden;
  background: #f1f5f9;
  position: relative;
  flex-shrink: 0;
}
.ts-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .55s cubic-bezier(.16,1,.3,1);
}
.ts-card:hover .ts-img-wrap img {
  transform: scale(1.05);
}

/* Hover overlay */
.ts-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(15,23,42,0);
  border-radius: 20px;
  transition: background .3s ease;
}
.ts-card:hover .ts-img-wrap::after {
  background: rgba(15,23,42,0.08);
}

/* "Use template" pill that appears on hover */
.ts-hover-pill {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  white-space: nowrap;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(15,23,42,0.18);
  opacity: 0;
  transition: opacity .25s ease, transform .25s ease;
  z-index: 2;
  pointer-events: none;
}
.ts-card:hover .ts-hover-pill {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Text below image */
.ts-card-body {
  padding: 20px 4px 0;
}
.ts-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -.3px;
  line-height: 1.3;
}
.ts-card-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 12px;
}
.ts-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ts-cat {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(30,64,175,0.07);
  color: #1e40af;
  border: 1px solid rgba(30,64,175,0.12);
}
.ts-meta-dot {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}
.ts-meta-text {
  font-size: 12px;
  color: #94a3b8;
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
  font-family: 'Inter',sans-serif;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.ts-cta-btn:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30,64,175,.25);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .ts-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .ts-grid { grid-template-columns: 1fr; gap: 32px 0; }
  .ts-section { padding: 60px 20px; }
  .ts-cta { flex-direction: column; text-align: center; }
  .ts-cta-btn { width: 100%; justify-content: center; }
}
`

function TemplatesSection({ onNavigateToSolution }) {
  const [active, setActive] = useState('All')

  const list = active === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === active)

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

        {/* Filters */}
        <motion.div
          className="ts-filters"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`ts-filter${active === cat ? ' active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div className="ts-grid" layout>
          <AnimatePresence mode="popLayout">
            {list.map((t, i) => (
              <motion.div
                key={t.id}
                className="ts-card"
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                {/* Image */}
                <div className="ts-img-wrap">
                  <img src={t.img} alt={t.title} loading="lazy" />
                  <span className="ts-hover-pill">Use this template →</span>
                </div>

                {/* Text below */}
                <div className="ts-card-body">
                  <div className="ts-card-title">{t.title}</div>
                  <p className="ts-card-desc">{t.description}</p>
                  <div className="ts-card-meta">
                    <span className="ts-cat">{t.category}</span>
                    <span className="ts-meta-dot" />
                    <span className="ts-meta-text">{t.scenes} scenes</span>
                    <span className="ts-meta-dot" />
                    <span className="ts-meta-text">{t.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

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
