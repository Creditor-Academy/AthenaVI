import { FiUsers, FiClock, FiGlobe, FiSmile } from 'react-icons/fi'

const styles = `
.cx-features {
  padding: 100px 40px;
  background: white;
}

.cx-features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.cx-feature-card {
  padding: 40px;
  background: #f8fafc;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.cx-feature-card:hover {
  transform: translateY(-8px);
  border-color: #3b82f6;
  box-shadow: 0 12px 30px rgba(30, 64, 175, 0.08);
}

.cx-feature-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.cx-feature-title {
  font-size: 24px;
  color: #1e3a8a;
  margin-bottom: 16px;
  font-weight: 600;
}

.cx-feature-desc {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .cx-features-grid {
    grid-template-columns: 1fr;
  }
}
`

function ExperienceFeatures() {
  const features = [
    {
      icon: <FiUsers />,
      title: "Personalized Interactions",
      desc: "Connect with each customer using their name, interests, and past interactions for a truly tailored experience."
    },
    {
      icon: <FiClock />,
      title: "Real-time Engagement",
      desc: "Be there for your customers 24/7 with AI-powered visual assistance that responds instantly to their needs."
    },
    {
      icon: <FiGlobe />,
      title: "Multilingual Support",
      desc: "Reach a global audience with videos and interactions translated into over 100 languages, making every customer feel at home."
    },
    {
      icon: <FiSmile />,
      title: "Enhanced Satisfaction",
      desc: "Studies show that visual AI interactions lead to higher CSAT scores and stronger brand loyalty."
    }
  ]

  return (
    <section className="cx-features">
      <style>{styles}</style>
      <div className="cx-features-grid">
        {features.map((feature, index) => (
          <div key={index} className="cx-feature-card">
            <div className="cx-feature-icon">{feature.icon}</div>
            <h3 className="cx-feature-title">{feature.title}</h3>
            <p className="cx-feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExperienceFeatures
