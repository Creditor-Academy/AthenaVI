import { motion } from 'framer-motion'
import { HiOutlineExclamationCircle, HiOutlineSparkles } from 'react-icons/hi2'

const styles = `
.cx-problem-solution {
  padding: 100px 80px;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.cx-ps-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  position: relative;
}

.cx-ps-card {
  flex: 1;
  padding: 48px;
  border-radius: 24px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
}

.cx-ps-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.cx-ps-problem {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

.cx-ps-solution {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
}

.cx-ps-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.problem-icon {
  background: #fee2e2;
  color: #ef4444;
}

.solution-icon {
  background: #bae6fd;
  color: #0ea5e9;
}

.cx-ps-heading {
  font-family: 'Georgia', serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.3;
}

.problem-heading {
  color: #991b1b;
}

.solution-heading {
  color: #0369a1;
}

.cx-ps-text {
  font-size: 18px;
  line-height: 1.7;
}

.problem-text {
  color: #7f1d1d;
}

.solution-text {
  color: #0c4a6e;
}

.cx-ps-footer {
  text-align: center;
  margin-top: 60px;
  font-size: 20px;
  color: #64748b;
  font-weight: 500;
  font-style: italic;
  position: relative;
  z-index: 2;
}

.cx-ps-footer span {
  color: #2563eb;
  font-weight: 600;
  font-style: normal;
}

@media (max-width: 1024px) {
  .cx-problem-solution {
    padding: 80px 40px;
  }
  .cx-ps-container {
    flex-direction: column;
    gap: 32px;
  }
  .cx-ps-card {
    padding: 32px;
  }
}

@media (max-width: 640px) {
  .cx-problem-solution {
    padding: 60px 20px;
  }
  .cx-ps-heading {
    font-size: 24px;
  }
  .cx-ps-text {
    font-size: 16px;
  }
}
`

function ProblemSolution() {
  return (
    <section className="cx-problem-solution">
      <style>{styles}</style>
      
      <div className="cx-ps-container">
        {/* Problem Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cx-ps-card cx-ps-problem"
        >
          <div className="cx-ps-icon-wrapper problem-icon">
            <HiOutlineExclamationCircle />
          </div>
          <h2 className="cx-ps-heading problem-heading">
            The Problem with Traditional Customer Support
          </h2>
          <p className="cx-ps-text problem-text">
            Traditional customer support tools struggle to handle complex queries and lack human connection. Chatbots often deliver fragmented responses, fail to understand context, and break the flow of conversation—leading to poor customer experience and frustration.
          </p>
        </motion.div>

        {/* Solution Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="cx-ps-card cx-ps-solution"
        >
          <div className="cx-ps-icon-wrapper solution-icon">
            <HiOutlineSparkles />
          </div>
          <h2 className="cx-ps-heading solution-heading">
            Our AI-Powered Solution
          </h2>
          <p className="cx-ps-text solution-text">
            Our AI-powered digital humans transform customer interactions by delivering real-time, interactive, and context-aware conversations. Instead of isolated responses, the system creates a continuous and human-like experience—engaging users, resolving queries efficiently, and improving overall satisfaction.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="cx-ps-footer"
      >
        "From fragmented responses to <span>seamless, intelligent conversations.</span>"
      </motion.div>
    </section>
  )
}

export default ProblemSolution
