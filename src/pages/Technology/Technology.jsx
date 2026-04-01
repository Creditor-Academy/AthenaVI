
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
import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import productVideo from '../../assets/Technology.mp4'

// Import card assets
import consultingImg from '../../assets/AI2.jpg'
import engineeringImg from '../../assets/AI system integration.png'
import connectivityImg from '../../assets/AI virtual assistant.png'
import integrationImg from '../../assets/ML-Photoroom.png'
import Neural from '../../assets/NeuralNetwork.jpg'

const styles = `
.technology-page {
  min-height: 100vh;
  background: #020617;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  overflow-x: clip;
}

/* Futuristic Hero Section */
.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 5% 0; /* Fixed invalid padding and added top space */
  background: #000000;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
  align-items: center;
  position: relative;
  z-index: 10;
}

.hero-text {
  text-align: left;
  margin-top: -130px; /* Reduced negative margin to stop clipping */
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 100px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-top: 15px; /* Shifted badge downward */
  margin-bottom: -5px; /* Reduced gap between badge and title */
  backdrop-filter: blur(4px);
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 400;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(to bottom right, #ffffff 30%, rgba(255,255,255,0.7));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-description {
  font-size: 20px;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 40px;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-pri {
  background: linear-gradient(135deg, #fbbf24, #f59e0b)   !important;
  color: #000000 !important;
  padding: 13px 32px !important;
  border-radius: 8px !important;  
  font-size: 16px !important;  
  font-weight: 600 !important;  
  display: inline-flex;  
  align-items: center;  
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2), 0 2px 4px -1px rgba(245, 158, 11, 0.1);
  min-height: 48px;
  text-decoration: none;
}

.btn-pri:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -5px rgba(245, 158, 11, 0.4), 0 8px 10px -6px rgba(245, 158, 11, 0.2); 
}

.btn-pri:active {
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: flex-end;
  height: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  height: 70vh; /* Further reduced height */
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #000000 0%, transparent 15%, transparent 85%, #000000 100%),
              linear-gradient(to bottom, transparent 70%, #000000 100%);
  pointer-events: none;
  z-index: 2;
}

.tech-video {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.glow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), transparent);
  pointer-events: none;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  background: #60a5fa;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(1px);
  animation: float 20s infinite linear;
}

@keyframes float {
  0% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-20px) translateX(20px); }
  66% { transform: translateY(20px) translateX(-20px); }
  100% { transform: translateY(0) translateX(0); }
}

.light-effect-1 {
  position: absolute;
  top: 20%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 0;
}

.light-effect-2 {
  position: absolute;
  bottom: 10%;
  left: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
}

/* Feature Cards Section */
.features-section {
  padding: 80px 40px;
  background: #ffffff;
}

.features-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  color: #1e40af;
  margin: 0 0 20px;
  text-align: center;
  letter-spacing: -1.5px;
  line-height: 1.2;
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
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 260px 220px 260px; /* Slightly adjusted for assets */
  gap: 24px;
  margin-top: 40px;
}

.feature-card-span-2 {
  grid-column-end: span 2 !important;
}

.feature-card-row-span-2 {
  grid-row-end: span 2 !important;
}

.feature-card-row-1 { grid-row-start: 1; }
.feature-card-row-2 { grid-row-start: 2; }
.feature-card-row-3 { grid-row-start: 3; }

.feature-card-col-1 { grid-column-start: 1; }
.feature-card-col-2 { grid-column-start: 2; }
.feature-card-col-3 { grid-column-start: 3; }
.feature-card-col-4 { grid-column-start: 4; }

.feature-card {
  background: rgba(255, 255, 255, 0.03); /* Base for glassmorphism */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 28px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.6; /* Increased for more richness */
  z-index: 0;
  transition: transform 0.6s ease, opacity 0.4s ease;
}

.feature-card:hover .feature-card-bg {
  opacity: 0.8;
  transform: scale(1.05);
}

.feature-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.1));
  z-index: 1;
}

.feature-card-asset {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 90%;
  height: 90%;
  object-fit: contain;
  object-position: bottom right;
  opacity: 0.4;
  z-index: 0;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  mix-blend-mode: screen;
  filter: brightness(1.1) contrast(1.1);
  mask-image: radial-gradient(circle at bottom right, black 25%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at bottom right, black 25%, transparent 80%);
  pointer-events: none;
}

.feature-card:hover .feature-card-asset {
  transform: scale(1.08);
  opacity: 0.75;
}

.feature-card-dark {
  color: #ffffff;
}

.feature-card-dark .feature-card-title {
  color: #ffffff;
}

.feature-card-dark .feature-card-description,
.feature-card-dark .feature-card-category {
  color: rgba(255,255,255,0.8);
}

.feature-card-dark .btn-card {
  background: rgba(255,255,255,0.1);
  color: #ffffff;
  border-color: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
}

.feature-card-dark .feature-card-icon-floating {
  color: #ffffff;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}


.feature-card-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 2;
}

.feature-card-category {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
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
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 16px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.feature-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  flex: 1;
  max-width: 85%;
}

.feature-card-action {
  margin-top: auto;
  padding-top: 24px;
}

.btn-card {
  padding: 10px 20px;
  background: white;
  color: #1e293b;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.feature-card:hover .btn-card {
  border-color: #3b82f6;
  color: #3b82f6;
}

.feature-card-icon-floating {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 140px;
  height: 140px;
  opacity: 0.1;
  color: #3b82f6;
  z-index: 1;
  pointer-events: none;
  transition: all 0.5s ease;
}

.feature-card:hover .feature-card-icon-floating {
  opacity: 0.2;
  transform: translateY(-50%) scale(1.1);
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
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -1.5px;
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

function Technology({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToProduct, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToUseCases }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      title: 'Harness the Power of Artificial Intelligence',
      description: 'Highlight the importance of AI for businesses, such as improved efficiency, productivity, predictive analytics, and automation.'
    }
  ]

  const features = [
    {
      category: 'Consulting',
      icon: MdPsychology,
      title: 'AI Strategy and Consulting',
      description: 'Provide expert guidance on developing an AI strategy and roadmap to drive business outcomes.',
      backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #061a18 0%, #0d2a27 100%)',
      cardAsset: consultingImg,
      isDark: true,
      span: 2,
      row: 1,
      rowSpan: 1,
      col: 1,
      price: '$0.99'
    },
    {
      category: 'Engineering',
      icon: MdSpeed,
      title: 'Machine Learning Solutions',
      description: 'Develop and deploy custom machine learning models to extract insights and make predictions from your data.',
      backgroundImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #0a0f1a 0%, #1e1b4b 100%)',
      cardAsset: engineeringImg,
      isDark: true,
      span: 1,
      row: 1,
      rowSpan: 2,
      col: 3,
      price: '$0.19'
    },
    {
      category: 'Connectivity',
      icon: MdIntegrationInstructions,
      title: 'Neural Network Systems',
      description: 'Advanced architectures for deep learning applications.',
      backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #1a1005 0%, #2a1f0f 100%)',
      cardAsset: connectivityImg,
      isDark: true,
      span: 1,
      row: 1,
      rowSpan: 2,
      col: 4,
      price: '$2.29'
    },
    {
      category: 'Integration',
      icon: MdIntegrationInstructions,
      title: 'AI Integration and Deployment',
      description: 'Assist in seamlessly integrating AI solutions into your existing systems and deploying them at scale.',
      backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      cardAsset: integrationImg,
      isDark: true,
      span: 1,
      row: 2,
      rowSpan: 2,
      col: 1,
      price: '$0.09'
    },
    {
      category: 'Intelligence',
      icon: MdAutoAwesome,
      title: 'AthenaVI Advanced Intelligence',
      description: 'Leverage cutting-edge AI technology to power AthenaVI, delivering intelligent, adaptive, and personalized virtual instruction experiences.',
      backgroundImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #1a0510 0%, #2a0f1b 100%)',
      cardAsset: Neural,
      isDark: true,
      span: 1,
      row: 2,
      rowSpan: 2,
      col: 2,
      price: '$0.99'
    },
    {
      category: 'Cognition',
      icon: MdTranslate,
      title: 'Natural Language Processing',
      metric: '250+',
      metricLabel: 'Active users every day',
      description: 'Advanced NLP capabilities that understand, process, and generate human language with unprecedented accuracy.',
      backgroundImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
      cardAsset: connectivityImg,
      isDark: true,
      span: 2,
      row: 3,
      rowSpan: 1,
      col: 3,
      price: '$0.29'
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
          onNavigateToEthics={() => {}}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToUseCases={onNavigateToUseCases}
        />

        {/* Hero Section */}
        <section className="hero-section">
          <div className="light-effect-1"></div>
          <div className="light-effect-2"></div>

          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              ></div>
            ))}
          </div>

          <div className="hero-container">
            <div className="hero-text">
              <div className="hero-badge">
                <MdAutoAwesome />
                <span>Future of Artificial Intelligence</span>
              </div>
              <h1 className="hero-title">
                Harness the Power of <br />
                <span style={{ color: '#3b82f6' }}>Artificial Intelligence</span>
              </h1>
              <p className="hero-description">
                Highlight the importance of AI for businesses, such as improved efficiency, productivity, predictive analytics, and automation.
              </p>
              <div className="hero-actions">
                <button className="btn-pri">
                  Explore
                  <MdArrowOutward />
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="video-container">
                <video
                  className="tech-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={productVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
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
                const spanClass = feature.span === 2 ? 'feature-card-span-2' : ''
                const rowSpanClass = feature.rowSpan === 2 ? 'feature-card-row-span-2' : ''
                const colClass = `feature-card-col-${feature.col}`
                const rowClass = `feature-card-row-${feature.row}`

                return (
                  <div
                    key={index}
                    className={`feature-card ${spanClass} ${rowSpanClass} ${rowClass} ${colClass} ${feature.isDark ? 'feature-card-dark' : ''}`}
                    style={{ background: feature.gradient }}
                  >
                    <div className="feature-card-overlay"></div>
                    <img className="feature-card-asset" src={feature.cardAsset} alt="" />
                    <div className="feature-card-content-wrapper">
                      <div className="feature-card-category">{feature.category}</div>
                      <h3 className="feature-card-title">{feature.title}</h3>
                      <p className="feature-card-description">{feature.description}</p>
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

        <Footer
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default Technology

