import { useState, useEffect } from 'react'
import { MdDescription, MdSchool, MdPlayCircle, MdClose } from 'react-icons/md'

const styles = `
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

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.resources-section {
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.resources-header {
  background: #ffffff;
  padding: 100px 40px 80px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

.resources-header-title {
  font-family: 'Arial', sans-serif;
  font-size: 56px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 20px;
  text-align: left;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.resources-header-description {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  color: #666666;
  margin: 0;
  text-align: left;
  line-height: 1.7;
  max-width: 800px;
}

.resources-cards-section {
  background: linear-gradient(135deg, #e6f2ff 0%, #dbeafe 100%);
  padding: 80px 40px 120px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.resources-cards-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.resources-cards-container {
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  position: relative;
  z-index: 1;
}

.resource-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
}

.resource-card:nth-child(1) {
  animation-delay: 0.1s;
}

.resource-card:nth-child(2) {
  animation-delay: 0.2s;
}

.resource-card:nth-child(3) {
  animation-delay: 0.3s;
}

.resource-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.resource-card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.resource-card:hover .resource-card-background {
  transform: scale(1.1);
}

.resource-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0.2) 0%, 
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 2;
  transition: background 0.4s ease;
}

.resource-card:hover .resource-card-overlay {
  background: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0.3) 0%, 
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.resource-card-content {
  position: relative;
  z-index: 3;
  padding: 40px 32px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.resource-card-type {
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 20px;
  opacity: 0.95;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.resource-card-title {
  font-family: 'Arial', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 auto;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.resource-card:hover .resource-card-title {
  transform: translateY(-2px);
}

.resource-card-button {
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 14px 28px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 32px;
  align-self: flex-start;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-transform: none;
  letter-spacing: 0.3px;
}

.resource-card-button:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.resource-card-button:active {
  transform: translateY(0) scale(1);
}

.resource-card.white-paper .resource-card-button {
  background: #60a5fa;
  border-color: #60a5fa;
}

.resource-card.white-paper .resource-card-button:hover {
  background: #3b82f6;
  border-color: #3b82f6;
}

.resource-card.case-study .resource-card-button {
  background: #4b5563;
  border-color: #4b5563;
}

.resource-card.case-study .resource-card-button:hover {
  background: #374151;
  border-color: #374151;
}

.resource-card.video .resource-card-button {
  background: #9ca3af;
  border-color: #9ca3af;
}

.resource-card.video .resource-card-button:hover {
  background: #6b7280;
  border-color: #6b7280;
}

.resource-card-icon {
  position: absolute;
  top: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  font-size: 24px;
  z-index: 4;
  transition: all 0.3s ease;
}

.resource-card:hover .resource-card-icon {
  transform: rotate(5deg) scale(1.1);
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .resources-cards-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .resource-card {
    min-height: 450px;
  }

  .resources-header-title {
    font-size: 48px;
  }
}

@media (max-width: 768px) {
  .resources-header {
    padding: 80px 24px 60px;
  }

  .resources-header-title {
    font-size: 40px;
  }

  .resources-header-description {
    font-size: 18px;
  }

  .resources-cards-section {
    padding: 60px 24px 80px;
  }

  .resource-card {
    min-height: 400px;
  }

  .resource-card-title {
    font-size: 26px;
  }

  .resource-card-content {
    padding: 32px 24px 24px;
  }
}

/* Modal Styles */
.resource-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.resource-modal-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.resource-modal-header {
  position: relative;
  height: 300px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 40px;
  color: #ffffff;
}

.resource-modal-header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.resource-modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: #1e40af;
}

.resource-modal-close-btn:hover {
  background: #ffffff;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.resource-modal-close-btn svg {
  width: 24px;
  height: 24px;
}

.resource-modal-header-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.resource-modal-type {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 12px;
  opacity: 0.95;
}

.resource-modal-title {
  font-family: 'Arial', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.resource-modal-body {
  padding: 40px;
  overflow-y: auto;
  flex: 1;
}

.resource-modal-description {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.8;
  color: #333333;
  margin: 0 0 32px;
}

.resource-modal-content-section {
  margin-bottom: 32px;
}

.resource-modal-content-section h4 {
  font-family: 'Arial', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 16px;
}

.resource-modal-content-section p {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #666666;
  margin: 0 0 16px;
}

.resource-modal-content-section ul {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #666666;
  margin: 0 0 16px;
  padding-left: 24px;
}

.resource-modal-content-section li {
  margin-bottom: 8px;
}

.resource-modal-cta {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.resource-modal-primary-btn {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: #3b82f6;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-modal-primary-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.resource-modal-secondary-btn {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  background: transparent;
  border: 2px solid #1e40af;
  border-radius: 10px;
  padding: 14px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resource-modal-secondary-btn:hover {
  background: #1e40af;
  color: #ffffff;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .resource-modal-container {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .resource-modal-header {
    height: 250px;
    padding: 24px;
  }

  .resource-modal-title {
    font-size: 28px;
  }

  .resource-modal-body {
    padding: 24px;
  }

  .resource-modal-cta {
    flex-direction: column;
  }

  .resource-modal-primary-btn,
  .resource-modal-secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
`

function ResourcesSection(props) {
  // variant prop is accepted for compatibility but not used in current design
  // eslint-disable-next-line no-unused-vars
  const { variant } = props;
  const [selectedResource, setSelectedResource] = useState(null)

  const resources = [
    {
      type: 'WHITE PAPER',
      title: 'The Future of AI-Powered Virtual Instruction',
      buttonText: 'Read the White Paper',
      backgroundImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      cardClass: 'white-paper',
      icon: MdDescription,
      description: 'Explore the transformative potential of AI-powered virtual instructors in modern education. This comprehensive white paper delves into how artificial intelligence is revolutionizing the way we teach and learn, making education more accessible, personalized, and effective.',
      content: {
        overview: 'AI-powered virtual instructors represent a paradigm shift in educational technology. By combining advanced natural language processing, computer vision, and machine learning, these systems can deliver personalized instruction at scale.',
        keyPoints: [
          'Personalized learning experiences tailored to individual student needs',
          '24/7 availability for on-demand learning support',
          'Scalable solutions that can reach millions of students simultaneously',
          'Multilingual capabilities breaking down language barriers',
          'Adaptive teaching methods that adjust to learning styles'
        ],
        impact: 'Educational institutions worldwide are experiencing significant improvements in student engagement, retention rates, and learning outcomes through the implementation of AI virtual instructors.'
      }
    },
    {
      type: 'CASE STUDY',
      title: 'How Leading Universities Use AthenaVI for Online Learning',
      buttonText: 'See the Case Study',
      backgroundImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      cardClass: 'case-study',
      icon: MdSchool,
      description: 'Discover how top-tier universities have successfully integrated AthenaVI into their online learning platforms, resulting in improved student satisfaction, higher completion rates, and enhanced educational outcomes.',
      content: {
        overview: 'This case study examines the implementation of AthenaVI across multiple prestigious universities, showcasing real-world results and best practices.',
        results: [
          '85% increase in course completion rates',
          '92% student satisfaction score',
          '60% reduction in instructor workload',
          '40% improvement in average test scores',
          'Support for 50+ languages across global campuses'
        ],
        testimonial: '"AthenaVI has transformed our online learning experience. Our students now have access to personalized instruction whenever they need it, and our faculty can focus on higher-level teaching tasks." - Dr. Sarah Johnson, Dean of Online Education'
      }
    },
    {
      type: 'VIDEO',
      title: 'Creating Your First AI Avatar: A Complete Tutorial',
      buttonText: 'Watch the video',
      backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      cardClass: 'video',
      icon: MdPlayCircle,
      description: 'Learn step-by-step how to create your first AI-powered virtual instructor using AthenaVI. This comprehensive tutorial covers everything from avatar selection to voice customization and content creation.',
      content: {
        overview: 'This video tutorial provides a complete walkthrough of the AthenaVI platform, guiding you through the process of creating engaging AI-powered educational content.',
        steps: [
          'Setting up your AthenaVI account and workspace',
          'Choosing the perfect avatar for your content',
          'Customizing voice and speech patterns',
          'Creating and uploading your educational content',
          'Configuring interactive features and assessments',
          'Publishing and sharing your virtual instructor'
        ],
        duration: '45 minutes',
        level: 'Beginner to Intermediate'
      }
    }
  ]

  const handleOpenModal = (resource) => {
    setSelectedResource(resource)
  }

  const handleCloseModal = () => {
    setSelectedResource(null)
  }

  useEffect(() => {
    if (selectedResource) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedResource])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedResource) {
        handleCloseModal()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedResource])

  return (
    <>
      <style>{styles}</style>
      <section id="resources" className="resources-section">
        <div className="resources-header">
          <h1 className="resources-header-title">Resource Center</h1>
          <p className="resources-header-description">
            Learn about everything from customer success stories, product info, to viewpoints from the core team. Discover how AI-powered virtual instructors are transforming education and training.
          </p>
        </div>
        
        <div className="resources-cards-section">
          <div className="resources-cards-container">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon
              return (
              <div key={index} className={`resource-card ${resource.cardClass}`}>
                <div 
                  className="resource-card-background"
                  style={{ backgroundImage: `url(${resource.backgroundImage})` }}
                />
                <div className="resource-card-overlay" />
                <div className="resource-card-icon">
                  {IconComponent && <IconComponent size={24} />}
                </div>
                <div className="resource-card-content">
                  <div>
                    <p className="resource-card-type">{resource.type}</p>
                    <h3 className="resource-card-title">{resource.title}</h3>
                  </div>
                  <button 
                    className="resource-card-button"
                    onClick={() => handleOpenModal(resource)}
                  >
                    {resource.buttonText}
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Resource Modal */}
      {selectedResource && (
        <div 
          className="resource-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal()
            }
          }}
        >
          <div className="resource-modal-container">
            <div 
              className="resource-modal-header"
              style={{ backgroundImage: `url(${selectedResource.backgroundImage})` }}
            >
              <div className="resource-modal-header-overlay" />
              <button 
                className="resource-modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <MdClose />
              </button>
              <div className="resource-modal-header-content">
                <p className="resource-modal-type">{selectedResource.type}</p>
                <h2 className="resource-modal-title">{selectedResource.title}</h2>
              </div>
            </div>
            
            <div className="resource-modal-body">
              <p className="resource-modal-description">
                {selectedResource.description}
              </p>

              {selectedResource.content && (
                <>
                  {selectedResource.content.overview && (
                    <div className="resource-modal-content-section">
                      <h4>Overview</h4>
                      <p>{selectedResource.content.overview}</p>
                    </div>
                  )}

                  {selectedResource.content.keyPoints && (
                    <div className="resource-modal-content-section">
                      <h4>Key Points</h4>
                      <ul>
                        {selectedResource.content.keyPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResource.content.results && (
                    <div className="resource-modal-content-section">
                      <h4>Results</h4>
                      <ul>
                        {selectedResource.content.results.map((result, idx) => (
                          <li key={idx}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResource.content.steps && (
                    <div className="resource-modal-content-section">
                      <h4>What You'll Learn</h4>
                      <ul>
                        {selectedResource.content.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResource.content.impact && (
                    <div className="resource-modal-content-section">
                      <h4>Impact</h4>
                      <p>{selectedResource.content.impact}</p>
                    </div>
                  )}

                  {selectedResource.content.testimonial && (
                    <div className="resource-modal-content-section">
                      <h4>Testimonial</h4>
                      <p style={{ fontStyle: 'italic', color: '#1e40af' }}>
                        {selectedResource.content.testimonial}
                      </p>
                    </div>
                  )}

                  {selectedResource.content.duration && (
                    <div className="resource-modal-content-section">
                      <p><strong>Duration:</strong> {selectedResource.content.duration}</p>
                      <p><strong>Level:</strong> {selectedResource.content.level}</p>
                    </div>
                  )}
                </>
              )}

              <div className="resource-modal-cta">
                <button className="resource-modal-primary-btn">
                  {selectedResource.buttonText}
                  <MdPlayCircle size={20} />
                </button>
                <button 
                  className="resource-modal-secondary-btn"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ResourcesSection

