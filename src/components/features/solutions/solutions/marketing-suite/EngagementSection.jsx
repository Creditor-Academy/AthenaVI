import { useState, useEffect } from 'react'
import { MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md'
import avatar1 from '../../../../../assets/avatar1.png'
import avatar2 from '../../../../../assets/avatar2.png'
import avatar3 from '../../../../../assets/avatar3.png'
import avatar4 from '../../../../../assets/avatar4.png'

const styles = `
.engagement-section {
  padding: 0 0 60px 0;
  background: #ffffff;
  color: #000000;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.netflix-header {
  textAlign: center;
  padding: 30px 60px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 100;
}

.section-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.section-title {
  color: #101050;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  margin: 0 0 10px 0;
  letter-spacing: -1.5px;
  line-height: 1.2;
}

.section-subtitle {
  color: #4a658a;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
}

.user-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 500px;
  margin: 40px 0;
}

.slide-item {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform, opacity, filter;
  /* Make left 50% translation base */
  left: 58%;
}

.poster-container {
  width: 320px;
  height: 480px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 10px 10px 40px rgba(0,0,0,0.5);
  position: relative;
  z-index: 2;
  cursor: pointer;
  background: #f1f2f6;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.detail-panel {
  width: 480px;
  height: 380px;
  margin-left: -5px; /* Slight overlap */
  padding: 50px 40px 40px 50px;
  color: white;
  border-radius: 0 4px 4px 0;
  box-shadow: 15px 15px 40px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-item:not(.active) .detail-panel {
  opacity: 0;
  transform: translateX(-40px);
  pointer-events: none;
}

.detail-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 42px;
  font-weight: 400;
  margin: 0 0 20px 0;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.detail-desc {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0 0 30px 0;
  font-weight: 300;
}

.detail-meta {
  display: flex;
  align-items: center;
  margin-top: auto;
  justify-content: flex-end;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 100px;
  color: #251677ff;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  font-weight: 100;
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  transform: translateY(-50%) scale(1.1);
}

.nav-left { left: 40px; }
.nav-right { right: 40px; }

@media (max-width: 1024px) {
  .poster-container { width: 260px; height: 390px; }
  .detail-panel { width: 320px; height: 320px; padding: 30px; }
  .detail-title { font-size: 24px; }
  .detail-desc { font-size: 13px; }
}

@media (max-width: 768px) {
  .netflix-header { padding: 20px; }
  .slide-item { flex-direction: column; left: 50% !important; transform: translate(-50%, -50%) !important; opacity: 0; pointer-events: none; }
  .slide-item.active { opacity: 1; pointer-events: all; }
  .detail-panel { 
    margin-left: 0; 
    margin-top: -20px; 
    border-radius: 4px; 
    width: 260px; 
    height: auto; 
    padding: 20px; 
  }
}
`

function EngagementSection() {
  const [currentSlide, setCurrentSlide] = useState(2)

  // Set initial slide on mount to 3 so we see the full stack effect like the image
  useEffect(() => {
    setCurrentSlide(3)
  }, [])

  // Exactly 4 cards, different colors, image titles
  const cards = [
    {
      image: avatar1,
      color: '#f4686fff',
      title: 'Cost-efficient Content',
      description: 'Traditional video production with human presenters can be expensive and time-consuming. Athena VI offers an innovative AI video solution that is not just affordable but also highly efficient.',
    },
    {
      image: avatar2,
      color: '#f1cb6bff',
      title: 'Personalization',
      description: 'Make your content personalized and targeted at an unprecedented scale, making each interaction unique and memorable.',
    },
    {
      image: avatar3,
      color: '#30cea2ff',
      title: 'Global Audience',
      description: 'With over 120 languages available, different voices and tones, and a premium range of virtual presenters your content can resonate with a global audience.',
    },
    {
      image: avatar4,
      color: '#f06f76ff',
      title: 'Higher Engagement',
      description: 'People retain 95% of video content messaging compared to only 10% of text and images alone. With Athena VI, you are creating an experience.',
    }
  ]

  const totalCards = cards.length;

  const nextSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide < totalCards - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const getSlideStyle = (index) => {
    const isActive = index === currentSlide;
    const offset = currentSlide - index;
    const isPast = offset > 0;
    const isFuture = offset < 0;

    let style = {
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      opacity: 0
    };

    if (isActive) {
      // Center the whole slide group (poster + panel)
      style = {
        transform: 'translate(-50%, -50%) scale(1)',
        zIndex: 50,
        opacity: 1,
        filter: 'none'
      };
    } else if (isPast) {
      // Stacked to the left, smaller and blurred
      style = {
        transform: `translate(calc(-50% - ${150 + offset * 120}px), -50%) scale(${1 - offset * 0.15})`,
        zIndex: 50 - offset,
        opacity: Math.max(0, 1 - offset * 0.2),
        filter: `blur(${2 + offset * 2}px)`,
        cursor: 'pointer'
      };
    } else if (isFuture) {
      // Future cards come from the right (usually not visible until they slide in, similar to Netflix's edge-clip)
      style = {
        transform: `translate(calc(-50% + ${300 - offset * 100}px), -50%) scale(${1 + offset * 0.1})`,
        zIndex: 50 + offset,
        opacity: 0,
        filter: 'blur(4px)',
        pointerEvents: 'none'
      };
    }
    return style;
  };

  return (
    <>
      <style>{styles}</style>
      <section className="engagement-section">
        {/* Header */}
        <header className="netflix-header">
          <div style={{ flex: 1 }}></div>
          <div className="section-title-container">
            <h2 className="section-title">Create Smarter, Engage Better</h2>
            <p className="section-subtitle">Create Content that Informs, Inspires, and Drives Action</p>
          </div>
        </header>

        {/* Carousel */}
        <div className="carousel-container">
          {currentSlide < totalCards - 1 && (
            <button className="nav-arrow nav-left" onClick={prevSlide}>
              <MdChevronLeft />
            </button>
          )}

          {cards.map((card, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={index}
                className={`slide-item ${isActive ? 'active' : ''}`}
                style={getSlideStyle(index)}
              >
                <div
                  className="poster-container"
                  onClick={() => setCurrentSlide(index)}
                >
                  <img src={card.image} alt={card.title} className="poster-img" />
                </div>

                <div className="detail-panel" style={{ background: card.color }}>
                  <h3 className="detail-title">{card.title}</h3>
                  <p className="detail-desc">{card.description}</p>
                </div>
              </div>
            )
          })}

          {currentSlide > 0 && (
            <button className="nav-arrow nav-right" onClick={nextSlide}>
              <MdChevronRight />
            </button>
          )}
        </div>

      </section>
    </>
  )
}

export default EngagementSection;
