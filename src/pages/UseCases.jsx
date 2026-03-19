import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { FiShoppingCart, FiBookOpen, FiPlayCircle, FiGlobe, FiUsers, FiHardDrive } from 'react-icons/fi'

const styles = `
.use-cases-page {
  min-height: 100vh;
  background: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.use-cases-hero {
  padding: 120px 40px 80px;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent),
              radial-gradient(circle at bottom left, rgba(30, 64, 175, 0.03), transparent);
  text-align: center;
}

.hero-tag {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-title {
  font-family: 'Georgia', serif;
  font-size: clamp(40px, 5vw, 72px);
  font-weight: 400;
  line-height: 1.1;
  color: #1e3a8a;
  margin-bottom: 24px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.hero-subtitle {
  font-size: clamp(18px, 2vw, 22px);
  color: #64748b;
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px;
}

.use-case-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.use-case-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.1), 0 18px 36px -18px rgba(0, 0, 0, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.card-icon {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: all 0.3s ease;
}

.use-case-card:hover .card-icon {
  background: #1e40af;
  color: #ffffff;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.card-desc {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  flex-grow: 1;
}

.card-features {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
}

.feature-dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
}

.industry-section {
  padding: 100px 40px;
  background: #0f172a;
  color: #ffffff;
  position: relative;
}

.industry-header {
  text-align: center;
  margin-bottom: 60px;
}

.industry-title {
  font-size: clamp(32px, 3.5vw, 48px);
  font-family: 'Georgia', serif;
  margin-bottom: 20px;
}

.industry-tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 60px;
}

.industry-tab {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.industry-tab.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

@media (max-width: 768px) {
  .use-cases-hero {
    padding: 100px 24px 60px;
  }
  .use-cases-grid {
    padding: 40px 24px;
    grid-template-columns: 1fr;
  }
}
`

const useCases = [
  {
    title: "E-commerce & Retail",
    desc: "Transform your product pages into dynamic experiences with AI video presenters that explain features and boost conversions.",
    icon: <FiShoppingCart />,
    features: ["Personalized product videos", "Dynamic pricing announcements", "Multilingual customer support"]
  },
  {
    title: "Corporate Training",
    desc: "Scale your internal communications and training programs without the need for high-cost video production crews.",
    icon: <FiBookOpen />,
    features: ["Automated onboarding videos", "Technical documentation guides", "Leadership updates"]
  },
  {
    title: "Content Creation",
    desc: "Empower your creative team to produce high-quality video content at 10x the speed using visual AI agents.",
    icon: <FiPlayCircle />,
    features: ["Rapid prototype generation", "Social media automation", "Engagement-driven storytelling"]
  },
  {
    title: "Global Marketing",
    desc: "Break language barriers instantly by translating your marketing campaigns across 120+ languages while maintaining personality.",
    icon: <FiGlobe />,
    features: ["Cultural adaptation", "Seamless lip-sync translation", "localized ad campaigns"]
  },
  {
    title: "Customer Success",
    desc: "Provide face-to-face support 24/7 with interactive AI avatars that can handle complex queries in real-time.",
    icon: <FiUsers />,
    features: ["Interactive troubleshooting", "Virtual concierge services", "Account management automation"]
  },
  {
    title: "Data Visualization",
    desc: "Turn complex data reports into engaging video narratives that stakeholders can actually understand and act upon.",
    icon: <FiHardDrive />,
    features: ["Animated insight reports", "Dashboard commentary", "Quarterly briefing videos"]
  }
]

function UseCases({ onLoginClick, onLogoClick, onNavigateToSolution, onNavigateToProduct, onNavigateToEthics, onNavigateToTechnology, onNavigateToCompany, onNavigateToUseCases }) {
  return (
    <>
      <style>{styles}</style>
      <div className="use-cases-page">
        <Navbar 
          onLoginClick={onLoginClick} 
          onLogoClick={onLogoClick}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />

        <section className="use-cases-hero">
          <motion.span 
            className="hero-tag"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Real-World impact
          </motion.span>
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Universal Applications for Visual AI
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover how visionary companies are using Athena VI to redefine communication, education, and customer engagement across every industry.
          </motion.p>
        </section>

        <section className="use-cases-grid">
          {useCases.map((uc, index) => (
            <motion.div 
              key={index}
              className="use-case-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="card-icon">{uc.icon}</div>
              <h3 className="card-title">{uc.title}</h3>
              <p className="card-desc">{uc.desc}</p>
              <ul className="card-features">
                {uc.features.map((feature, fIndex) => (
                  <li key={fIndex} className="feature-item">
                    <span className="feature-dot" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        <section className="industry-section">
          <div className="industry-header">
            <h2 className="industry-title">Built for every industry</h2>
            <p style={{ color: '#94a3b8', fontSize: '18px' }}>Seamless integration into your existing workflows.</p>
          </div>
          <div className="industry-tabs">
            {["Finance", "Healthcare", "Education", "Tech", "Hospitality", "Manufacturing"].map((tab, i) => (
              <span key={i} className={`industry-tab ${i === 2 ? 'active' : ''}`}>{tab}</span>
            ))}
          </div>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.1)', padding: '60px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)' }}>
             <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>Education & E-Learning</h3>
             <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>
               Create interactive courses with digital instructors that can answer student questions in over 120 languages. Perfect for global certification programs and corporate upskilling.
             </p>
          </div>
        </section>

        <Footer 
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default UseCases
