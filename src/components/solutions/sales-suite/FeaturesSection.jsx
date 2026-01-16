import { MdCheckCircle, MdVideoCall, MdEmail, MdCampaign, MdAnalytics } from 'react-icons/md'

const styles = `
.features-section {
  padding: 100px 40px;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.features-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.features-header {
  text-align: center;
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.features-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 52px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.features-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.features-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 80px;
}

.features-image-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.features-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 20px;
}

.features-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 40px;
  color: #ffffff;
}

.features-image-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 28px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #ffffff;
}

.features-image-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #ffffff;
  line-height: 1.3;
}

.feature-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.8);
}

.feature-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-benefit {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-benefit-icon {
  color: #10b981;
  font-size: 18px;
  flex-shrink: 0;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.use-case-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(30, 64, 175, 0.08);
}

.use-case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.use-case-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 24px;
  margin-bottom: 20px;
}

.use-case-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #1e293b;
}

.use-case-description {
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  color: #64748b;
}

@media (max-width: 1024px) {
  .features-section {
    padding: 80px 40px;
  }

  .features-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .use-cases-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 60px 24px;
  }

  .features-header {
    margin-bottom: 60px;
  }

  .features-title {
    font-size: 38px;
  }

  .features-subtitle {
    font-size: 18px;
  }

  .features-list {
    gap: 24px;
  }

  .feature-item {
    gap: 16px;
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .feature-title {
    font-size: 22px;
  }

  .use-cases-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .features-section {
    padding: 60px 20px;
  }

  .features-title {
    font-size: 32px;
  }

  .features-subtitle {
    font-size: 16px;
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .feature-title {
    font-size: 20px;
  }

  .feature-description {
    font-size: 15px;
  }
}
`

function FeaturesSection() {
  const features = [
    {
      icon: <MdVideoCall />,
      title: 'Video Sales Calls',
      description: 'Create personalized video messages for each prospect, making your outreach stand out in crowded inboxes.',
      benefits: [
        'Higher open rates',
        'Personalized at scale',
        'Multi-language support'
      ]
    },
    {
      icon: <MdEmail />,
      title: 'Email Campaigns',
      description: 'Embed AI-generated videos in your email campaigns to increase engagement and conversion rates.',
      benefits: [
        '3x higher click-through',
        'Automated personalization',
        'A/B testing ready'
      ]
    },
    {
      icon: <MdCampaign />,
      title: 'Sales Presentations',
      description: 'Transform your sales decks into dynamic video presentations with AI presenters that speak any language.',
      benefits: [
        'Professional quality',
        'Instant localization',
        'Easy updates'
      ]
    }
  ]

  const useCases = [
    {
      icon: <MdVideoCall />,
      title: 'Prospect Outreach',
      description: 'Send personalized video introductions to warm up cold leads and increase response rates.'
    },
    {
      icon: <MdEmail />,
      title: 'Follow-up Sequences',
      description: 'Automate follow-up emails with embedded videos to nurture prospects through the sales funnel.'
    },
    {
      icon: <MdAnalytics />,
      title: 'Performance Tracking',
      description: 'Monitor video engagement metrics to optimize your sales strategy and improve conversion rates.'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section className="features-section">
        <div className="features-content">
          <div className="features-header">
            <h2 className="features-title">Powerful Sales Features</h2>
            <p className="features-subtitle">
              Everything you need to create, personalize, and scale your sales video content 
              across all channels and touchpoints.
            </p>
          </div>

          <div className="features-layout">
            <div className="features-image-container">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80"
                alt="Sales team collaboration"
                className="features-image"
                loading="lazy"
              />
              <div className="features-image-overlay">
                <h3 className="features-image-title">AI-Powered Sales Videos</h3>
                <p className="features-image-description">
                  Create professional sales videos in minutes, not weeks. Our AI handles everything 
                  from script to delivery, allowing your team to focus on closing deals.
                </p>
              </div>
            </div>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-benefits">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="feature-benefit">
                          <MdCheckCircle className="feature-benefit-icon" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">
                  {useCase.icon}
                </div>
                <h3 className="use-case-title">{useCase.title}</h3>
                <p className="use-case-description">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default FeaturesSection

