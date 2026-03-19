import { useState } from 'react'
import { MdArrowForward, MdPersonalVideo, MdSpeed, MdTouchApp, MdPublic, MdEdit, MdPlayCircle } from 'react-icons/md'

const styles = `
.benefits-section {
  padding: 50px 0;
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

/* Glassmorphism background blur when hovering any card */
.benefits-section.is-hovering .benefits-header,
.benefits-section.is-hovering .benefits-card:not(:hover) {
  filter: blur(8px);
  opacity: 0.7;
  transition: all 0.4s ease;
}

.benefits-section.is-hovering::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  z-index: 5;
  pointer-events: none;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.benefits-content {
  width: 100%;
  position: relative;
  z-index: 1;
}

.benefits-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 0 40px;
  transition: all 0.4s ease;
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

/* Marquee Styles */
.marquee-container {
  padding: 80px 0;
  width: 100vw;
  overflow: visible;
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: scroll 30s linear infinite;
  gap: 24px;
  padding: 20px;
}

.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.benefits-card {
  background: #ffffff;
  border-radius: 20px;
  width: 300px;
  flex-shrink: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  z-index: 2;
  will-change: transform, filter;
}

.benefits-card:hover {
  transform: scale(1.13);
  z-index: 80 !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  border-color: #d0d0d0ff;
  filter: blur(1) !important;
  opacity: 1 !important;
}

.benefits-card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.benefits-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.benefits-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 20px;
  margin-bottom: 4px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.benefits-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  line-height: 1.3;
}

.benefits-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.5;
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

@media (max-width: 768px) {
  .benefits-title {
    font-size: 38px;
  }
  .benefits-card {
    width: 320px;
  }
}
`

function BenefitsSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

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

  // Duplicate for seamless loop
  const marqueeItems = [...benefits, ...benefits]

  return (
    <>
      <style>{styles}</style>
      <section className={`benefits-section ${hoveredIndex !== null ? 'is-hovering' : ''}`}>
        <div className="benefits-content">
          <div className="benefits-header">
            <h2 className="benefits-title">The Benefits of Athena VI's Sales Platform</h2>
            <p className="benefits-subtitle">
              Empower your sales team with AI-powered video solutions that drive engagement, 
              increase conversion rates, and scale your outreach efforts globally.
            </p>
          </div>

          <div className="marquee-container">
            <div className="marquee-track">
              {marqueeItems.map((benefit, index) => (
                <div 
                  key={index} 
                  className="benefits-card"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
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
                    <a href="#" className="benefits-card-link" onClick={(e) => e.preventDefault()}>
                      Learn more <MdArrowForward />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default BenefitsSection
