import { useState } from 'react'
import { MdTrendingDown, MdBarChart, MdLanguage, MdPeople, MdArrowForward, MdChevronLeft, MdChevronRight } from 'react-icons/md'

const styles = `
.engagement-section {
  padding: 60px 40px;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.engagement-section::before {
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

.engagement-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.engagement-header {
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

.engagement-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 52px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.engagement-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.engagement-cards-wrapper {
  position: relative;
  margin-bottom: 80px;
}

.engagement-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.engagement-cards-slider {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: none;
}

.engagement-cards-slider-container {
  display: flex;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.engagement-card-slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 0 12px;
  box-sizing: border-box;
}

.slider-controls {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.slider-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 26px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(251, 191, 36, 0.6);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.3);
}

.slider-btn:active {
  transform: scale(0.95);
}

.slider-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.slider-dots {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
}

.slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-dot:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.2);
}

.slider-dot.active {
  background: #fbbf24;
  width: 28px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  border-color: rgba(251, 191, 36, 0.3);
}

.engagement-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 44px 36px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
}

.engagement-card:nth-child(1) { animation-delay: 0.1s; }
.engagement-card:nth-child(2) { animation-delay: 0.2s; }
.engagement-card:nth-child(3) { animation-delay: 0.3s; }
.engagement-card:nth-child(4) { animation-delay: 0.4s; }

.engagement-card::before {
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

.engagement-card:hover::before {
  transform: scaleX(1);
}

.engagement-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(251, 191, 36, 0.2);
}

.engagement-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32px;
  margin-bottom: 28px;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 0;
}

.engagement-card:hover .engagement-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 24px rgba(251, 191, 36, 0.4);
}

.engagement-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.engagement-card:hover .engagement-icon::after {
  opacity: 1;
}

.engagement-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 500;
  margin: 0 0 18px 0;
  color: #1e293b;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.engagement-card:hover .engagement-card-title {
  color: #0f172a;
}

.engagement-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
  color: #64748b;
  font-weight: 400;
}

.engagement-cta {
  text-align: center;
  margin-top: 60px;
  animation: fadeInUp 0.8s ease-out;
  animation-delay: 0.5s;
  animation-fill-mode: both;
}

.contact-sales-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 40px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: 2px solid transparent;
  color: #000000;
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.35), 0 2px 8px rgba(251, 191, 36, 0.2);
  position: relative;
  overflow: hidden;
}

.contact-sales-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.contact-sales-btn span,
.contact-sales-btn svg {
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-sales-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.45), 0 4px 16px rgba(251, 191, 36, 0.3);
  border-color: rgba(251, 191, 36, 0.5);
}

.contact-sales-btn:hover::before {
  left: 0;
}

.contact-sales-btn svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 20px;
}

.contact-sales-btn:hover svg {
  transform: translateX(5px);
}

@media (max-width: 1024px) {
  .engagement-section {
    padding: 60px 40px;
  }

  .engagement-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

  .engagement-card {
    padding: 40px 32px;
  }
}

@media (max-width: 768px) {
  .engagement-section {
    padding: 60px 24px;
  }

  .engagement-header {
    margin-bottom: 60px;
  }

  .engagement-title {
    font-size: 38px;
  }

  .engagement-subtitle {
    font-size: 18px;
  }

  .engagement-cards {
    display: none;
  }

  .engagement-cards-slider {
    display: block;
  }

  .slider-controls {
    display: flex;
  }

  .slider-dots {
    display: flex;
  }

  .engagement-card {
    padding: 36px 28px;
  }

  .engagement-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 24px;
  }

  .engagement-card-title {
    font-size: 24px;
  }

  .engagement-cta {
    margin-top: 50px;
  }

  .contact-sales-btn {
    padding: 16px 32px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .engagement-section {
    padding: 60px 20px;
  }

  .engagement-header {
    margin-bottom: 50px;
  }

  .engagement-title {
    font-size: 32px;
  }

  .engagement-subtitle {
    font-size: 16px;
  }

  .engagement-card {
    padding: 32px 24px;
  }

  .engagement-card-title {
    font-size: 22px;
  }

  .engagement-card-description {
    font-size: 15px;
  }

  .engagement-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .contact-sales-btn {
    padding: 14px 28px;
    font-size: 13px;
  }
}
`

function EngagementSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const cards = [
    {
      icon: <MdTrendingDown />,
      title: 'Cost-efficient Content Creation',
      description: 'Traditional video production with human presenters can be expensive and time-consuming. Athena VI offers an innovative AI video solution that is not just affordable but also highly efficient.'
    },
    {
      icon: <MdBarChart />,
      title: 'Personalization at Scale',
      description: 'Make your content personalized and targeted at an unprecedented scale, making each interaction unique and memorable.'
    },
    {
      icon: <MdLanguage />,
      title: 'Speak to a Global Audience',
      description: 'With over 120 languages available, different voices and tones, and a premium range of virtual presenters your content can resonate with a global audience, ensuring no one is left behind.'
    },
    {
      icon: <MdPeople />,
      title: 'Higher Engagement & Retention',
      description: 'People retain 95% of video content messaging compared to only 10% of text and images alone. With Athena VI, you\'re not just sharing information; you\'re creating an experience.'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cards.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <>
      <style>{styles}</style>
      <section className="engagement-section">
        <div className="engagement-content">
          <div className="engagement-header">
            <h2 className="engagement-title">Create Smarter, Engage Better</h2>
            <p className="engagement-subtitle">Create Content that Informs, Inspires, and Drives Action</p>
          </div>

          <div className="engagement-cards-wrapper">
            {/* Desktop Grid View */}
            <div className="engagement-cards">
              {cards.map((card, index) => (
                <div key={index} className="engagement-card">
                  <div className="engagement-icon">
                    {card.icon}
                  </div>
                  <h3 className="engagement-card-title">{card.title}</h3>
                  <p className="engagement-card-description">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Mobile Slider View */}
            <div className="engagement-cards-slider">
              <div 
                className="engagement-cards-slider-container"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {cards.map((card, index) => (
                  <div key={index} className="engagement-card-slide">
                    <div className="engagement-card">
                      <div className="engagement-icon">
                        {card.icon}
                      </div>
                      <h3 className="engagement-card-title">{card.title}</h3>
                      <p className="engagement-card-description">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="slider-controls">
                <button 
                  className="slider-btn" 
                  onClick={prevSlide}
                  aria-label="Previous slide"
                >
                  <MdChevronLeft />
                </button>
                <div className="slider-dots">
                  {cards.map((_, index) => (
                    <button
                      key={index}
                      className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                <button 
                  className="slider-btn" 
                  onClick={nextSlide}
                  aria-label="Next slide"
                >
                  <MdChevronRight />
                </button>
              </div>
            </div>
          </div>

          <div className="engagement-cta">
            <a href="#" className="contact-sales-btn">
              <span>CONTACT SALES</span>
              <MdArrowForward />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default EngagementSection

