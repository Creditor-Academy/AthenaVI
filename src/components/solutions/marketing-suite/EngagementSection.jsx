import { useState } from 'react'
import { MdTrendingDown, MdBarChart, MdLanguage, MdPeople, MdArrowForward, MdChevronLeft, MdChevronRight } from 'react-icons/md'

const styles = `
.engagement-section {
  padding: 100px 40px;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #ffffff;
}

.engagement-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.engagement-header {
  text-align: center;
  margin-bottom: 80px;
}

.engagement-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 20px 0;
  color: #ffffff;
}

.engagement-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.engagement-cards-wrapper {
  position: relative;
  margin-bottom: 60px;
}

.engagement-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.slider-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-dots {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.slider-dot.active {
  background: #fbbf24;
  width: 24px;
  border-radius: 5px;
}

.engagement-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.engagement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.engagement-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  margin-bottom: 24px;
}

.engagement-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #000000;
}

.engagement-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: #4b5563;
}

.engagement-cta {
  text-align: center;
  margin-top: 40px;
}

.contact-sales-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000000;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.contact-sales-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.contact-sales-btn svg {
  transition: transform 0.3s ease;
}

.contact-sales-btn:hover svg {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .engagement-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .engagement-section {
    padding: 60px 24px;
  }

  .engagement-title {
    font-size: 36px;
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
    padding: 32px 24px;
  }
}
`

function EngagementSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const cards = [
    {
      icon: <MdTrendingDown />,
      title: 'Cost-efficient Content Creation',
      description: 'Traditional video production with human presenters can be expensive and time-consuming. D-ID offers an innovative AI video solution that is not just affordable but also highly efficient.'
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
      description: 'People retain 95% of video content messaging compared to only 10% of text and images alone. With D-ID, you\'re not just sharing information; you\'re creating an experience.'
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
              CONTACT SALES
              <MdArrowForward />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default EngagementSection

