import React from 'react'
import { motion } from 'framer-motion'
import { MdPlayArrow, MdOutlineTimer, MdTransform } from 'react-icons/md'
import introThumb from '../assets/IntroSequence.png'
import demoThumb from '../assets/ProductDemo.png'
import strategyThumb from '../assets/StrategicOverview.png'
import metricsThumb from '../assets/PerformanceMetrics.png'
import journeyThumb from '../assets/CustomerJourney.png'
import integrationThumb from '../assets/AIIntegration.png'

const styles = `
.template-showcase-section {
  width: 100%;
  padding: 100px 4%;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-header {
  text-align: center;
  margin-bottom: 60px;
  max-width: 1200px;
}

.template-label {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.template-h2 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 50px;
  font-weight: 400;
  color: #0f172a;
  margin-bottom: 20px;
  line-height: 1.2;
}

.template-p {
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  width: 100%;
  max-width: 1400px;
}

.template-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: #e2e8f0;
}

.thumb-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.template-card:hover .thumb-image {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.template-card:hover .play-overlay {
  opacity: 1;
}

.play-button-icon {
  width: 60px;
  height: 60px;
  background: #ffffff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.transition-tag {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
}

.card-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  align-items: flex-start;
}

.btn-preview {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  margin: 0;
  line-height: 1;
}

.btn-preview:hover {
  background: #e2e8f0;
}

.btn-use {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: #3b82f6;
  color: #ffffff;
  border: 1px solid #3b82f6;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  margin: 0;
  line-height: 1;
}

.btn-use:hover {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

@media (max-width: 1200px) {
  .template-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .template-grid { grid-template-columns: 1fr; }
  .template-section { padding: 60px 4%; }
}
`

const templates = [
  {
    id: 1,
    title: "Intro Sequence",
    duration: "8s",
    transition: "Fade",
    thumb: introThumb,
    desc: "High-impact intro with centered AI avatar and bold headline for strong first impressions."
  },
  {
    id: 2,
    title: "Product Demo",
    duration: "8s",
    transition: "Slide (Left)",
    thumb: demoThumb,
    desc: "Split-screen layout ideal for showcasing product features alongside an AI avatar presenter."
  },
  {
    id: 3,
    title: "Strategic Overview",
    duration: "8s",
    transition: "Fade",
    thumb: strategyThumb,
    desc: "Clean, centered layout designed for big-picture messaging and business storytelling."
  },
  {
    id: 4,
    title: "Performance Metrics",
    duration: "8s",
    transition: "Zoom In",
    thumb: metricsThumb,
    desc: "Dynamic layout focused on data, growth stats, and performance visualization."
  },
  {
    id: 5,
    title: "Customer Journey",
    duration: "8s",
    transition: "Fade",
    thumb: journeyThumb,
    desc: "Engaging sequence to highlight user stories, testimonials, or step-by-step journeys."
  },
  {
    id: 6,
    title: "AI Integration",
    duration: "8s",
    transition: "Slide (Top)",
    thumb: integrationThumb,
    desc: "Futuristic scene with motion effects to represent AI workflows and automation."
  }
]

const TemplateShowcase = () => {
  return (
    <>
      <style>{styles}</style>
      <section className="template-showcase-section">
        <motion.div
          className="template-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="template-label">Templates</span>
          <h2 className="template-h2">Ready-to-Use AI Video Templates</h2>
          <p className="template-p">
            Create professional videos faster with pre-designed scenes optimized for
            storytelling, engagement, and results.
          </p>
        </motion.div>

        <div className="template-grid">
          {templates.map((tpl, index) => (
            <motion.div
              key={tpl.id}
              className="template-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="thumb-container">
                <img src={tpl.thumb} alt={tpl.title} className="thumb-image" />
                <div className="play-overlay">
                  <div className="play-button-icon">
                    <MdPlayArrow size={32} />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="card-meta">
                  <span className="meta-tag">
                    <MdOutlineTimer size={14} /> {tpl.duration}
                  </span>
                  <span className="meta-tag transition-tag">
                    <MdTransform size={14} /> {tpl.transition}
                  </span>
                </div>
                <h3 className="card-title">{tpl.title}</h3>
                <p className="card-desc">{tpl.desc}</p>

                <div className="card-footer">
                  <div className="btn-preview">Preview</div>
                  <div className="btn-use">Use Template</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}

export default TemplateShowcase
