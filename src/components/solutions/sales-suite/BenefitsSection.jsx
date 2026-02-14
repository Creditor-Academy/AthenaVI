import { MdArrowForward, MdPersonalVideo, MdSpeed, MdTouchApp, MdPublic, MdEdit, MdPlayCircle } from 'react-icons/md'

const styles = `
.benefits-section {
  padding: 100px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #1e40af;
  position: relative;
  overflow: hidden;
}

.benefits-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(30, 64, 175, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.benefits-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.benefits-header {
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

.benefits-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 52px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1e40af;
  letter-spacing: -0.5px;
}

.benefits-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0;
  color: #64748b;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.benefits-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  display: flex;
  flex-direction: column;
}

.benefits-card:nth-child(1) { animation-delay: 0.1s; }
.benefits-card:nth-child(2) { animation-delay: 0.2s; }
.benefits-card:nth-child(3) { animation-delay: 0.3s; }
.benefits-card:nth-child(4) { animation-delay: 0.4s; }
.benefits-card:nth-child(5) { animation-delay: 0.5s; }
.benefits-card:nth-child(6) { animation-delay: 0.6s; }

.benefits-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.benefits-card:hover::before {
  transform: scaleX(1);
}

.benefits-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(251, 191, 36, 0.2);
}

.benefits-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.benefits-card-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.benefits-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 24px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.benefits-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: #1e293b;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.benefits-card:hover .benefits-card-title {
  color: #0f172a;
}

.benefits-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
  color: #64748b;
  font-weight: 400;
  flex: 1;
}

.benefits-card-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  transition: gap 0.3s ease;
}

.benefits-card-link:hover {
  gap: 10px;
}

@media (max-width: 1024px) {
  .benefits-section {
    padding: 80px 40px;
  }

  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

  .benefits-card-content {
    padding: 28px;
  }
}

@media (max-width: 768px) {
  .benefits-section {
    padding: 60px 24px;
  }

  .benefits-header {
    margin-bottom: 60px;
  }

  .benefits-title {
    font-size: 38px;
  }

  .benefits-subtitle {
    font-size: 18px;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .benefits-card-content {
    padding: 24px;
  }

  .benefits-card-title {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .benefits-section {
    padding: 60px 20px;
  }

  .benefits-title {
    font-size: 32px;
  }

  .benefits-subtitle {
    font-size: 16px;
  }

  .benefits-card-content {
    padding: 20px;
  }

  .benefits-card-title {
    font-size: 20px;
  }

  .benefits-card-description {
    font-size: 15px;
  }

  .benefits-card-image {
    height: 180px;
  }
}
`

function BenefitsSection() {
  const benefits = [
    {
      icon: <MdPersonalVideo />,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&q=80',
      title: 'Personalized Videos at Scale',
      description: 'Personalize videos at scale, giving a human face to communications and sales outreach. Create unique video messages for each prospect without the time and cost of traditional production.'
    },
    {
      icon: <MdSpeed />,
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=80',
      title: 'Fast & Cost-efficient',
      description: 'Turn existing sales decks, proposals, or audio files into engaging video content with minimal effort. Reduce production time from weeks to minutes.'
    },
    {
      icon: <MdTouchApp />,
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop&q=80',
      title: 'At the Touch of a Button',
      description: 'Create diverse sales and training content at the touch of a button. No technical skills required - our AI handles everything.'
    },
    {
      icon: <MdPublic />,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop&q=80',
      title: 'Scale from Anywhere',
      description: 'Seamlessly scale and localize sales content across regions, languages and dialects. Reach global prospects in their native language.'
    },
    {
      icon: <MdEdit />,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80',
      title: 'All in One Place',
      description: 'Make revisions and updates without having to go back into video production. Edit scripts, change presenters, or update content instantly.'
    },
    {
      icon: <MdPlayCircle />,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&q=80',
      title: 'Instant Explainer Videos',
      description: 'Create highly affordable explainer videos without the need for expensive production teams. Perfect for product demos, onboarding, and sales pitches.'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-header">
            <h2 className="benefits-title">The Benefits of Athena VI's Sales Platform</h2>
            <p className="benefits-subtitle">
              Empower your sales team with AI-powered video solutions that drive engagement, 
              increase conversion rates, and scale your outreach efforts globally.
            </p>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefits-card">
                <img 
                  src={benefit.image} 
                  alt={benefit.title}
                  className="benefits-card-image"
                  loading="lazy"
                />
                <div className="benefits-card-content">
                  <div className="benefits-card-icon">
                    {benefit.icon}
                  </div>
                  <h3 className="benefits-card-title">{benefit.title}</h3>
                  <p className="benefits-card-description">{benefit.description}</p>
                  <a href="#" className="benefits-card-link">
                    Learn more <MdArrowForward />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default BenefitsSection
