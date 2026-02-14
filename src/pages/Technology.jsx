
import { useState } from 'react'
import { 
  MdArrowBack, 
  MdArrowForward,
  MdPsychology,
  MdSpeed,
  MdTranslate,
  MdIntegrationInstructions,
  MdCode,
  MdSupportAgent,
  MdArrowOutward,
  MdSchool,
  MdVideoLibrary,
  MdPerson,
  MdAutoAwesome
} from 'react-icons/md'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const styles = `
.technology-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* Hero Section */
.hero-section {
  min-height: 90vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 40px 80px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.hero-background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.7) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(96, 165, 250, 0.5) 100%);
  z-index: 1;
}

.hero-background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.15) 0%, transparent 50%);
  z-index: 2;
}

.hero-content {
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 400;
  letter-spacing: -1.5px;
  line-height: 1.15;
  color: #ffffff;
  margin: 0 0 24px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.hero-cta {
  font-family: 'Inter', sans-serif;
  background: rgba(30, 30, 30, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.hero-cta:hover {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.hero-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  backdrop-filter: blur(10px);
}

.hero-navigation:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.hero-navigation.prev {
  left: 20px;
}

.hero-navigation.next {
  right: 20px;
}

.hero-navigation svg {
  font-size: 24px;
  color: #ffffff;
}

/* Feature Cards Section */
.features-section {
  padding: 80px 40px;
  background: #ffffff;
}

.features-section-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 20px;
  text-align: center;
}

.features-section-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #64748b;
  margin: 0 0 60px;
  text-align: center;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.features-container {
  max-width: 1400px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 40px;
}

.feature-card-span-2 {
  grid-column: span 2;
}

.feature-card-span-1 {
  grid-column: span 1;
}

.feature-card-col-3 {
  grid-column-start: 3;
}

.feature-card-row-2 {
  grid-row: 2;
}

.feature-card-row-3 {
  grid-row: 3;
}

.feature-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.feature-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.25;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .feature-card-bg {
  opacity: 0.3;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
  opacity: 0.2;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  z-index: 1;
}

.feature-card:hover::before {
  opacity: 0.85;
}

.feature-card-overlay {
  display: none;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}


.feature-card-content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.feature-card-main {
  flex: 1;
}

.feature-card-icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover .feature-card-icon-circle {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.feature-card-icon-circle svg {
  font-size: 40px;
  color: #ffffff;
}

.feature-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 16px;
  position: relative;
  z-index: 2;
  line-height: 1.3;
}

.feature-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #475569;
  margin: 0;
  position: relative;
  z-index: 2;
  flex: 1;
}

.feature-card-metric {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #1e40af;
  margin: 24px 0 8px;
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card-metric-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #64748b;
  position: relative;
  z-index: 2;
  font-weight: 500;
}

.feature-card-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.feature-card-arrow:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.feature-card-arrow svg {
  font-size: 24px;
  color: #ffffff;
}


/* Solutions Section */
.solutions-section {
  padding: 100px 40px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}

.solutions-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.solutions-left {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.solutions-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.solutions-cta {
  font-family: 'Inter', sans-serif;
  background: rgba(30, 30, 30, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  backdrop-filter: blur(10px);
}

.solutions-cta:hover {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.solutions-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.solution-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.solution-icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}

.solution-item:hover .solution-icon-wrapper {
  transform: scale(1.15) rotate(5deg);
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
}

.solution-icon-wrapper svg {
  font-size: 40px;
  color: #ffffff;
}

.solution-content {
  flex: 1;
}

.solution-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
}

.solution-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: 48px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card-span-2 {
    grid-column: span 1;
  }

  .solutions-container {
    grid-template-columns: 1fr;
    gap: 60px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 100px 24px 60px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 18px;
  }

  .hero-navigation {
    display: none;
  }

  .features-section {
    padding: 60px 24px;
  }

  .features-section-title {
    font-size: 36px;
  }

  .feature-card {
    min-height: 350px;
    padding: 32px;
  }

  .solutions-section {
    padding: 60px 24px;
  }

  .solutions-title {
    font-size: 36px;
  }
}
`

function Technology({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToProduct, onNavigateToSolution, onNavigateToEthics }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      title: 'Harness the Power of Artificial Intelligence',
      description: 'Highlight the importance of AI for businesses, such as improved efficiency, productivity, predictive analytics, and automation.'
    }
  ]

  const features = [
    {
      icon: MdPsychology,
      title: 'AI Strategy and Consulting',
      description: 'Provide expert guidance on developing an AI strategy and roadmap to drive business outcomes.',
      backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
      span: 2,
      row: 1,
      col: 1
    },
    {
      icon: MdSpeed,
      title: 'Machine Learning Solutions',
      description: 'Develop and deploy custom machine learning models to extract insights and make predictions from your data.',
      backgroundImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&q=80',
      span: 1,
      row: 1,
      col: 3
    },
    {
      icon: MdIntegrationInstructions,
      title: 'AI Integration and Deployment',
      description: 'Assist in seamlessly integrating AI solutions into your existing systems and deploying them at scale.',
      backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&q=80',
      span: 1,
      row: 2,
      col: 1
    },
    {
      icon: MdAutoAwesome,
      title: 'AthenaVI Advanced Intelligence',
      description: 'Leverage cutting-edge AI technology to power AthenaVI, delivering intelligent, adaptive, and personalized virtual instruction experiences.',
      backgroundImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&q=80',
      span: 1,
      row: 2,
      col: 2
    },
    {
      icon: MdTranslate,
      title: 'Natural Language Processing',
      metric: '250+',
      metricLabel: 'Active users every day',
      description: 'Advanced NLP capabilities that understand, process, and generate human language with unprecedented accuracy.',
      backgroundImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop&q=80',
      span: 1,
      row: 2,
      col: 3
    }
  ]

  const solutions = [
    {
      icon: MdIntegrationInstructions,
      title: 'Neural Network Integration',
      description: 'Seamlessly integrating neural network models into your existing systems, monitoring performance, and ensuring scalability for your business needs.'
    },
    {
      icon: MdCode,
      title: 'Neural Network Development',
      description: 'Customized design and development of neural network architectures tailored to your specific business needs and objectives.'
    },
    {
      icon: MdSupportAgent,
      title: 'Neural Network Consulting',
      description: 'Expert guidance and consulting services to optimize existing neural network implementations, identify new areas for AI adoption, and uncover overlooked opportunities.'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="technology-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={() => {}}
        />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop&q=80"
              alt="AI Technology Background"
              className="hero-background-image"
            />
            <div className="hero-background-overlay"></div>
            <div className="hero-background-pattern"></div>
          </div>
          
          <button 
            className="hero-navigation prev"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            aria-label="Previous slide"
          >
            <MdArrowBack />
          </button>

          <div className="hero-content">
            <h1 className="hero-title">{heroSlides[currentSlide].title}</h1>
            <p className="hero-description">{heroSlides[currentSlide].description}</p>
            <button className="hero-cta">
              Explore
              <MdArrowOutward />
            </button>
          </div>

          <button 
            className="hero-navigation next"
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            aria-label="Next slide"
          >
            <MdArrowForward />
          </button>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <h2 className="features-section-title">Our Technology Solutions</h2>
            <p className="features-section-subtitle">
              Cutting-edge AI technologies designed to transform your business operations and drive innovation
            </p>
            <div className="features-grid">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                const rowClass = feature.row === 2 ? 'feature-card-row-2' : feature.row === 3 ? 'feature-card-row-3' : ''
                const spanClass = feature.span === 2 ? 'feature-card-span-2' : 'feature-card-span-1'
                const colClass = feature.col === 3 ? 'feature-card-col-3' : ''
                return (
                  <div 
                    key={index} 
                    className={`feature-card ${spanClass} ${rowClass} ${colClass}`}
                  >
                    <div 
                      className="feature-card-bg"
                      style={{ backgroundImage: `url(${feature.backgroundImage})` }}
                    ></div>
                    <div className="feature-card-overlay"></div>
                    <div className="feature-card-content-wrapper">
                      <div className="feature-card-main">
                        <h3 className="feature-card-title">{feature.title}</h3>
                        {feature.metric && (
                          <>
                            <div className="feature-card-metric">{feature.metric}</div>
                            <div className="feature-card-metric-label">{feature.metricLabel}</div>
                          </>
                        )}
                        <p className="feature-card-description">{feature.description}</p>
                      </div>
                      <div className="feature-card-icon-circle">
                        <IconComponent />
                      </div>
                    </div>
                    <div className="feature-card-arrow">
                      <MdArrowOutward />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="solutions-section">
          <div className="solutions-container">
            <div className="solutions-left">
              <h2 className="solutions-title">Empowering business transformation with Neural Network solutions</h2>
              <button className="solutions-cta">
                Explore here
                <MdArrowOutward />
              </button>
            </div>
            <div className="solutions-list">
              {solutions.map((solution, index) => {
                const IconComponent = solution.icon
                return (
                  <div key={index} className="solution-item">
                    <div className="solution-icon-wrapper">
                      <IconComponent />
                    </div>
                    <div className="solution-content">
                      <h3 className="solution-title">{solution.title}</h3>
                      <p className="solution-description">{solution.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default Technology

