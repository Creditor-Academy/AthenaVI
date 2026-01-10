import { MdArrowForward } from 'react-icons/md'

const styles = `
.feature-marketing-section {
  padding: 60px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #1e40af;
  position: relative;
  overflow: hidden;
}

.feature-marketing-section::before {
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

.feature-marketing-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-marketing-header {
  text-align: center;
  margin-bottom: 100px;
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

.feature-marketing-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 52px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 28px 0;
  color: #1e40af;
  letter-spacing: -0.5px;
}

.feature-marketing-description {
  font-family: 'Arial', sans-serif;
  font-size: 19px;
  line-height: 1.8;
  margin: 0;
  color: #64748b;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.feature-marketing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.feature-marketing-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(30, 64, 175, 0.08);
  position: relative;
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
}

.feature-marketing-card:nth-child(1) { animation-delay: 0.1s; }
.feature-marketing-card:nth-child(2) { animation-delay: 0.2s; }
.feature-marketing-card:nth-child(3) { animation-delay: 0.3s; }
.feature-marketing-card:nth-child(4) { animation-delay: 0.4s; }
.feature-marketing-card:nth-child(5) { animation-delay: 0.5s; }
.feature-marketing-card:nth-child(6) { animation-delay: 0.6s; }

.feature-marketing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.feature-marketing-card:hover::before {
  transform: scaleX(1);
}

.feature-marketing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(30, 64, 175, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(30, 64, 175, 0.2);
}

.feature-marketing-card-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.feature-marketing-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-marketing-card:hover .feature-marketing-card-image {
  transform: scale(1.08);
}

.feature-marketing-card-image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.feature-marketing-card:hover .feature-marketing-card-image-wrapper::after {
  opacity: 0;
}

.enterprise-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  padding: 10px 20px;
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(146, 64, 14, 0.15);
  border-bottom: 2px solid rgba(146, 64, 14, 0.2);
}

.feature-marketing-card-content {
  padding: 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.feature-marketing-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 500;
  margin: 0 0 18px 0;
  color: #1e40af;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.feature-marketing-card:hover .feature-marketing-card-title {
  color: #3b82f6;
}

.feature-marketing-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 28px 0;
  color: #64748b;
  flex: 1;
  font-weight: 400;
}

.feature-marketing-card-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #1e40af;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 2px solid rgba(30, 64, 175, 0.15);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
}

.feature-marketing-card-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.feature-marketing-card-cta span,
.feature-marketing-card-cta svg {
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-marketing-card-cta:hover {
  gap: 12px;
  color: #ffffff;
  border-color: #1e40af;
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.2), 0 2px 8px rgba(30, 64, 175, 0.15);
  transform: translateY(-2px);
}

.feature-marketing-card-cta:hover::before {
  left: 0;
}

.feature-marketing-card-cta svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 18px;
}

.feature-marketing-card-cta:hover svg {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .feature-marketing-section {
    padding: 60px 40px;
  }

  .feature-marketing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }

  .feature-marketing-header {
    margin-bottom: 80px;
  }

  .feature-marketing-card-image-wrapper {
    height: 170px;
  }
}

@media (max-width: 768px) {
  .feature-marketing-section {
    padding: 60px 24px;
  }

  .feature-marketing-title {
    font-size: 38px;
  }

  .feature-marketing-description {
    font-size: 17px;
  }

  .feature-marketing-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .feature-marketing-card-content {
    padding: 28px;
  }

  .feature-marketing-card-image-wrapper {
    height: 160px;
  }

  .feature-marketing-header {
    margin-bottom: 60px;
  }
}

@media (max-width: 480px) {
  .feature-marketing-section {
    padding: 60px 20px;
  }

  .feature-marketing-title {
    font-size: 32px;
  }

  .feature-marketing-description {
    font-size: 16px;
  }

  .feature-marketing-card-content {
    padding: 24px;
  }

  .feature-marketing-card-image-wrapper {
    height: 140px;
  }

  .feature-marketing-card-cta {
    padding: 10px 20px;
    font-size: 13px;
  }
}
`

function Heaturemarketing() {
  const features = [
    {
      title: 'Video Translate',
      description: 'Expand your global reach with seamless AI-powered translation, voice cloning, and lip-syncing to localize video content for different audiences.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    },
    {
      title: 'Video Campaigns',
      description: 'Effortlessly create tailored, AI-driven video content for email campaigns and other personalized marketing efforts to maximize engagement.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    },
    {
      title: 'Express Avatars',
      description: 'Transform any video footage into AI avatars, enabling faster content creation that makes your brand stand out.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    },
    {
      title: 'Interactive Agents',
      description: 'Connect with customers in real-time using AI avatars powered by large language models (LLMs) and your knowledge base for 24/7 personalized interaction.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    },
    {
      title: 'Seamless Integrations',
      description: 'Work directly within popular tools like Canva and PowerPoint to streamline your creative process.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    },
    {
      title: 'Premium Avatars',
      description: 'Upload a five-minute video recording to create a fully personalized, lifelike, reusable avatar that replicates your voice and captures intricate details of your appearance and expressions.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=400&fit=crop&q=80',
      enterpriseOnly: false
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <section className="feature-marketing-section">
        <div className="feature-marketing-content">
          <div className="feature-marketing-header">
            <h2 className="feature-marketing-title">The Ultimate Marketing Toolkit</h2>
            <p className="feature-marketing-description">
              Our Marketing Suite provides comprehensive tools and features designed to help you create, manage, and optimize your marketing efforts with ease.
            </p>
          </div>

          <div className="feature-marketing-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-marketing-card">
                <div className="feature-marketing-card-image-wrapper">
                  {feature.enterpriseOnly && (
                    <div className="enterprise-banner">
                      AVAILABLE TO ENTERPRISE CUSTOMERS ONLY
                    </div>
                  )}
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="feature-marketing-card-image"
                    loading="lazy"
                  />
                </div>
                <div className="feature-marketing-card-content">
                  <h3 className="feature-marketing-card-title">{feature.title}</h3>
                  <p className="feature-marketing-card-description">{feature.description}</p>
                  <a href="#" className="feature-marketing-card-cta">
                    <span>LEARN MORE</span>
                    <MdArrowForward />
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

export default Heaturemarketing

