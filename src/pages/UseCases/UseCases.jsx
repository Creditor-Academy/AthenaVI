import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import { FiShoppingCart, FiBookOpen, FiPlayCircle, FiGlobe, FiUsers, FiHardDrive } from 'react-icons/fi'
import './UseCases.css'

const industries = [
  {
    name: "Finance",
    title: "Finance & Banking",
    desc: "Deliver personalized market updates, explain investment plans, and automate customer inquiries with secure, regulatory-compliant AI presenters."
  },
  {
    name: "Healthcare",
    title: "Healthcare & Patient Care",
    desc: "Explain complex medical procedures, provide automated patient intake instructions, and offer 24/7 care guides in multiple languages."
  },
  {
    name: "Education",
    title: "Education & E-Learning",
    desc: "Create interactive courses with digital instructors that can answer student questions in over 120 languages. Perfect for global certification programs and corporate upskilling."
  },
  {
    name: "Tech",
    title: "Technology & SaaS",
    desc: "Create high-impact product demos, release updates, and walk clients through onboarding tutorials with lifelike digital avatars."
  },
  {
    name: "Hospitality",
    title: "Hospitality & Travel",
    desc: "Deploy virtual concierges, welcome guests in their native languages, and showcase destination highlights dynamically."
  },
  {
    name: "Manufacturing",
    title: "Manufacturing & Operations",
    desc: "Standardize safety briefings, deliver equipment tutorials, and scale corporate training across global factories operations."
  }
]


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
  const [activeTab, setActiveTab] = useState(2) // Defaults to Education

  return (
    <>
      <div className="use-cases-page">
        {/* Ambient background graphics */}
        <div className="uc-bg-graphics">
          <div className="uc-orb uc-orb-1" />
          <div className="uc-orb uc-orb-2" />
          <div className="uc-dot-grid" />
        </div>

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
            Real-World Impact
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
            Discover how visionary companies are using Virtual Studio to redefine communication, education, and customer engagement across every industry.
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
            <p className="industry-subtext">Seamless integration into your existing workflows.</p>
          </div>
          <div className="industry-tabs">
            {industries.map((ind, i) => (
              <span
                key={i}
                className={`industry-tab ${i === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveTab(i)
                  }
                }}
              >
                {ind.name}
              </span>
            ))}
          </div>
          <div className="industry-details-card">
            <h3 className="industry-details-title">{industries[activeTab].title}</h3>
            <p className="industry-details-desc">
              {industries[activeTab].desc}
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
