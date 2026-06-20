import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi'

import AllTemplateImg  from '../../assets/Template Image/AllTemplate.png'
import CorporateImg    from '../../assets/Template Image/Coporate.png'
import EducationalImg  from '../../assets/Template Image/Educational.png'
import MarketingImg    from '../../assets/Template Image/Marketing.png'
import PersonalImg     from '../../assets/Template Image/Personal.png'
import SocialImg       from '../../assets/Template Image/Social.png'

const TEMPLATES = [
  { id: 1, title: 'Corporate Presentation', category: 'Business',   duration: '3–5 min', scenes: 8,  img: CorporateImg   },
  { id: 2, title: 'Educational Module',     category: 'Education',  duration: '2–4 min', scenes: 6,  img: EducationalImg },
  { id: 3, title: 'Marketing Campaign',     category: 'Marketing',  duration: '1–2 min', scenes: 5,  img: MarketingImg   },
  { id: 4, title: 'Personal Story',         category: 'Personal',   duration: '1–3 min', scenes: 4,  img: PersonalImg    },
  { id: 5, title: 'Social Short',           category: 'Social',     duration: '30–60 s', scenes: 3,  img: SocialImg      },
  { id: 6, title: 'All-Purpose',            category: 'General',    duration: '2–5 min', scenes: 7,  img: AllTemplateImg },
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
  margin-bottom: 48px;
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
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 56px;
}

/* ── Card ── */
.ts-card {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15,23,42,0.07);
  background: #fff;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.04);
  transition: transform .32s cubic-bezier(.16,1,.3,1), box-shadow .32s ease, border-color .32s ease;
  display: flex;
  flex-direction: column;
}
.ts-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(15,23,42,0.1);
  border-color: rgba(30,64,175,0.18);
}

/* Image area */
.ts-img-wrap {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: #f1f5f9;
  position: relative;
}
.ts-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .5s cubic-bezier(.16,1,.3,1);
}
.ts-card:hover .ts-img-wrap img {
  transform: scale(1.04);
}

/* Card footer */
.ts-foot {
  padding: 16px 20px;
  border-top: 1px solid rgba(15,23,42,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ts-foot-info {}
.ts-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -.2px;
}
.ts-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
}
.ts-cat {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(30,64,175,0.07);
  color: #1e40af;
  border: 1px solid rgba(30,64,175,0.12);
}
.ts-dot { width:3px; height:3px; border-radius:50%; background:#cbd5e1; }
.ts-arrow {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  border: none;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  flex-shrink: 0;
  transition: background .2s, color .2s;
  cursor: default;
}
.ts-card:hover .ts-arrow {
  background: #1e40af;
  color: #fff;
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
@media (max-width:960px)  { .ts-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width:600px)  {
  .ts-grid { grid-template-columns: 1fr; }
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
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.38, delay: i * 0.06 }}
              >
                <div className="ts-img-wrap">
                  <img src={t.img} alt={t.title} loading="lazy" />
                </div>
                <div className="ts-foot">
                  <div className="ts-foot-info">
                    <div className="ts-card-title">{t.title}</div>
                    <div className="ts-card-meta">
                      <span className="ts-cat">{t.category}</span>
                      <span className="ts-dot" />
                      <span>{t.scenes} scenes</span>
                      <span className="ts-dot" />
                      <span>{t.duration}</span>
                    </div>
                  </div>
                  <div className="ts-arrow">
                    <FiArrowUpRight size={14} />
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
