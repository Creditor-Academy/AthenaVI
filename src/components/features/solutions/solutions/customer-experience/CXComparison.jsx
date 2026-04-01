import React from 'react'
import { motion } from 'framer-motion'
import { HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2'

const styles = `
.cx-comp-section {
  padding: 50px 40px 100px 40px;
  background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 40%),
              #ffffff;
  position: relative;
  overflow: hidden;
}

.cx-comp-container {
  max-width: 1000px;
  margin: 0 auto;
}

.cx-comp-header {
  text-align: center;
  margin-bottom: 60px;
}

.cx-comp-tag {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 100px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.cx-comp-title {
  font-family: 'Georgia', serif;
  font-size: 56px;
  background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cx-comp-subheading {
  font-size: 20px;
  color: #64748b;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.cx-comp-table-wrapper {
  position: relative;
  margin-top: 60px;
}

.cx-comp-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.2fr;
  gap: 0;
  border-radius: 32px;
  overflow: visible;
  box-shadow: 0 4px 50px -10px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  background: #ffffff;
}

.cx-comp-row {
  display: contents;
}

.cx-comp-row:hover .cx-comp-cell {
  background-color: #f1f5fa;
}

.cx-comp-cell {
  padding: 30px 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  font-size: 16px;
  line-height: 1.5;
  min-height: 100px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.cx-comp-row:last-child .cx-comp-cell {
  border-bottom: none;
}

.cx-comp-feature-cell {
  justify-content: flex-start;
  font-weight: 700;
  color: #1e293b;
  text-align: left;
}

.cx-comp-traditional-cell {
  justify-content: flex-start;
  color: #94a3b8;
  background: rgba(238, 243, 248, 0.5);
  gap: 12px;
}

.cx-comp-ai-cell {
  justify-content: flex-start;
  font-weight: 600;
  color: #1e40af;
  gap: 12px;
  background: #ffffff;
  position: relative;
  z-index: 10;
  border-left: 2px solid #3b82f6;
  border-right: 2px solid #3b82f6;
  box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.15);
}

.cx-comp-row:hover .cx-comp-ai-cell {
  background-color: rgba(59, 130, 246, 0.02);
}

.cx-comp-ai-cell:first-of-type, .cx-comp-ai-header {
  border-top: 5px solid #3b82f6;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.cx-comp-row:last-child .cx-comp-ai-cell {
  border-bottom: 5px solid #3b82f6;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.cx-comp-grid-header {
  display: contents;
}

.cx-comp-header-cell {
  padding: 24px 40px;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 2px solid #f1f5f9;
}

.cx-comp-header-cell.cx-comp-ai-header {
  color: #2563eb;
  background: #ffffff;
  border-bottom: 2px solid transparent;
  position: relative;
  z-index: 10;
  border-left: 2px solid #3b82f6;
  border-right: 2px solid #3b82f6;
  box-shadow: 0 -10px 40px -10px rgba(59, 130, 246, 0.05);
}

.cx-comp-icon { font-size: 20px; flex-shrink: 0; }
.cx-comp-cross { color: #ef4444; opacity: 0.6; }
.cx-comp-check { color: #10b981; }

.cx-comp-badge {
  position: absolute;
  top: -18px;
  right: 6%; 
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 8px 24px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  z-index: 30;
  white-space: nowrap;
}

.cx-comp-footer {
  margin-top: 100px;
  display: flex;
  justify-content: center;
}

.cx-comp-pill {
  display: inline-flex;
  align-items: center;
  padding: 24px 60px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 100px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cx-comp-pill:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.4);
  background: #1e3a8a;
}

@media (max-width: 1024px) {
  .cx-comp-section { padding: 80px 20px; }
  .cx-comp-title { font-size: 42px; }
  .cx-comp-grid { grid-template-columns: 1fr 1fr; }
  .cx-comp-feature-cell { display: none; } 
  .cx-comp-ai-cell, .cx-comp-header-cell.cx-comp-ai-header { border-width: 1px; }
  .cx-comp-badge { right: 10%; }
}

@media (max-width: 768px) {
  .cx-comp-header { margin-bottom: 60px; }
  .cx-comp-grid {
    grid-template-columns: 1fr;
    border: none;
    background: transparent;
    box-shadow: none;
    gap: 40px;
  }
  .cx-comp-cell { border: 1px solid #f1f5f9; border-radius: 24px; min-height: auto; padding: 24px; }
  .cx-comp-ai-cell { border: 2px solid #3b82f6; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1); }
  .cx-comp-pill { padding: 16px 40px; font-size: 16px; width: 100%; }
}
`

const comparisons = [
  {
    feature: "Human-Like Interaction",
    traditional: "Limited and scripted",
    ai: "Natural, human-like conversations"
  },
  {
    feature: "Voice Communication",
    traditional: "Not supported",
    ai: "Supports real-time voice interaction"
  },
  {
    feature: "Context Understanding",
    traditional: "Basic or limited",
    ai: "Advanced context-aware intelligence"
  },
  {
    feature: "Real-Time Explanation",
    traditional: "Cannot explain deeply",
    ai: "Provides detailed, contextual explanations"
  },
  {
    feature: "Conversation Continuity",
    traditional: "Breaks flow between responses",
    ai: "Maintains seamless conversation flow"
  }
]

const CXComparison = () => {
  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const rowAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="cx-comp-section">
      <style>{styles}</style>
      <div className="cx-comp-container">
        {/* Section Header */}
        <motion.div 
          className="cx-comp-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="cx-comp-tag">Comparison Guide</div>
          <h2 className="cx-comp-title">See Why AthenaVI Outperforms Traditional Tools</h2>
          <p className="cx-comp-subheading">
            A smarter, more human way to interact, explain, and engage.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <div className="cx-comp-table-wrapper">
          <div className="cx-comp-badge">RECOMMENDED</div>
          
          <motion.div 
            className="cx-comp-grid"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Table Header Row */}
            <div className="cx-comp-grid-header">
              <div className="cx-comp-header-cell">Features</div>
              <div className="cx-comp-header-cell">Traditional Tools</div>
              <div className="cx-comp-header-cell cx-comp-ai-header">Athena VI</div>
            </div>

            {/* Feature Comparison Rows */}
            {comparisons.map((row, index) => (
              <motion.div key={index} className="cx-comp-row" variants={rowAnim}>
                <div className="cx-comp-cell cx-comp-feature-cell">
                  {row.feature}
                </div>
                <div className="cx-comp-cell cx-comp-traditional-cell">
                  <HiOutlineXMark className="cx-comp-icon cx-comp-cross" />
                  {row.traditional}
                </div>
                <div className="cx-comp-cell cx-comp-ai-cell">
                  <HiOutlineCheck className="cx-comp-icon cx-comp-check" />
                  {row.ai}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Center CTA Pill */}
        <motion.div 
          className="cx-comp-footer"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="cx-comp-pill">
            Upgrade from static responses to intelligent, continuous conversations.
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CXComparison
