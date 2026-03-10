import { useState } from 'react'
import { MdTrendingDown, MdBarChart, MdLanguage, MdPeople, MdChevronLeft, MdChevronRight, MdArrowForward } from 'react-icons/md'

const styles = `
.impact-section {
  padding: 100px 40px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
  color: #1e40af;
  position: relative;
  overflow: hidden;
}

.impact-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.impact-section::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.impact-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.impact-header {
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.impact-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1e40af;
  letter-spacing: -0.5px;
}

.impact-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.7;
  margin: 0;
  color: #64748b;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.impact-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

.impact-cards-wrapper {
  position: relative;
  overflow: hidden;
  display: none;
}

.impact-cards-slider {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.impact-card-slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 0 12px;
  box-sizing: border-box;
}

.slider-controls {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.slider-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-size: 28px;
}

.slider-button:hover:not(:disabled) {
  background: #1e40af;
  color: #ffffff;
  transform: scale(1.1);
  border-color: #1e40af;
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.3);
}

.slider-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-dots {
  display: none;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.slider-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  padding: 0;
}

.slider-dot.active {
  background: #1e40af;
  width: 32px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

.impact-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 4px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  min-width: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.impact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.impact-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(30, 64, 175, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  transition: all 0.6s ease;
  opacity: 0;
}

.impact-card:hover::before {
  transform: scaleX(1);
}

.impact-card:hover::after {
  opacity: 1;
  transform: scale(1.5);
}

.impact-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 12px 40px rgba(30, 64, 175, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(30, 64, 175, 0.2);
}

.impact-card:nth-child(1) { animation-delay: 0.1s; }
.impact-card:nth-child(2) { animation-delay: 0.2s; }
.impact-card:nth-child(3) { animation-delay: 0.3s; }
.impact-card:nth-child(4) { animation-delay: 0.4s; }

.impact-icon-wrapper {
  position: relative;
  margin-bottom: 24px;
  width: fit-content;
}

.impact-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32px;
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.25);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.impact-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  transition: all 0.4s ease;
  opacity: 0;
}

.impact-card:hover .impact-icon-wrapper::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.impact-card:hover .impact-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(30, 64, 175, 0.35);
}

.impact-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #1e293b;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.impact-card:hover .impact-card-title {
  color: #1e40af;
}

.impact-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  margin: 0 0 20px 0;
  color: #64748b;
  font-weight: 400;
  flex: 1;
}

.impact-card-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  text-decoration: none;
  margin-top: auto;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-10px);
}

.impact-card:hover .impact-card-link {
  opacity: 1;
  transform: translateX(0);
}

.impact-card-link:hover {
  gap: 12px;
  color: #3b82f6;
}

@media (max-width: 1200px) {
  .impact-cards {
    gap: 20px;
  }

  .impact-card {
    padding: 36px 28px;
  }
}

@media (max-width: 1024px) {
  .impact-section {
    padding: 80px 40px;
  }

  .impact-title {
    font-size: 48px;
  }

  .impact-cards {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .impact-card {
    padding: 32px 24px;
  }

  .impact-card-title {
    font-size: 20px;
  }

  .impact-card-description {
    font-size: 14px;
  }

  .impact-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .impact-section {
    padding: 60px 24px;
  }

  .impact-header {
    margin-bottom: 60px;
  }

  .impact-title {
    font-size: 38px;
  }

  .impact-subtitle {
    font-size: 18px;
  }

  .impact-cards {
    display: none;
  }

  .impact-cards-wrapper {
    display: block;
  }

  .impact-cards-slider {
    display: flex;
  }

  .slider-controls {
    display: flex;
  }

  .slider-dots {
    display: flex;
  }

  .impact-card {
    padding: 36px 28px;
    margin: 0;
    animation: none;
  }

  .impact-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
    margin-bottom: 24px;
  }

  .impact-card-title {
    font-size: 22px;
  }

  .impact-card-link {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .impact-section {
    padding: 60px 20px;
  }

  .impact-title {
    font-size: 32px;
  }

  .impact-subtitle {
    font-size: 16px;
  }

  .impact-card {
    padding: 32px 24px;
  }

  .impact-card-title {
    font-size: 20px;
  }

  .impact-card-description {
    font-size: 14px;
  }

  .impact-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .slider-button {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
`

function ImpactSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const cards = [
    {
      icon: <MdTrendingDown />,
      title: 'Cost-effective Content Creation',
      description: 'Conventional video creation featuring live presenters often comes with high costs and lengthy timelines. Athena VI provides a groundbreaking artificial intelligence video platform that combines budget-friendly pricing with exceptional productivity.'
    },
    {
      icon: <MdBarChart />,
      title: 'Scale Personalization',
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
      description: 'Audiences engage much more effectively with video materials compared to written text and static visuals. Through Athena VI, you\'re going beyond simple communication; you\'re crafting memorable moments that resonate.'
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
      <section className="impact-section">
        <div className="impact-content">
          <div className="impact-header">
            <h2 className="impact-title">High impact content that converts</h2>
            <p className="impact-subtitle">
              Did you know that video content can increase purchase intent by a staggering 82%? And that 73% of consumers are more likely to purchase after watching a product video. Ready to elevate your marketing game with AI video presenters?
            </p>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="impact-cards">
            {cards.map((card, index) => (
              <div key={index} className="impact-card">
                <div className="impact-icon-wrapper">
                  <div className="impact-icon">
                    {card.icon}
                  </div>
                </div>
                <h3 className="impact-card-title">{card.title}</h3>
                <p className="impact-card-description">{card.description}</p>
                <a href="#" className="impact-card-link">
                  Learn more <MdArrowForward />
                </a>
              </div>
            ))}
          </div>

          {/* Mobile: Slider Layout */}
          <div className="impact-cards-wrapper">
            <div 
              className="impact-cards-slider"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {cards.map((card, index) => (
                <div key={index} className="impact-card-slide">
                  <div className="impact-card">
                    <div className="impact-icon-wrapper">
                      <div className="impact-icon">
                        {card.icon}
                      </div>
                    </div>
                    <h3 className="impact-card-title">{card.title}</h3>
                    <p className="impact-card-description">{card.description}</p>
                    <a href="#" className="impact-card-link">
                      Learn more <MdArrowForward />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="slider-controls">
              <button 
                className="slider-button"
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
                className="slider-button"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <MdChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ImpactSection
