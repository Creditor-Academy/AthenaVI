import { useState } from 'react'
import { 
  MdKeyboardArrowDown,
  MdSearch,
  MdSupport,
  MdHelpOutline,
  MdQuestionAnswer
} from 'react-icons/md'
import Navbar from '../../components/layout/Navbar/Navbar.jsx'
import Footer from '../../components/layout/Footer/Footer.jsx'
import { HELP_FAQS } from '../../seo/helpFaqs.js'

const styles = `
.company-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}

.page-header {
  padding: 120px 40px 80px;
  text-align: center;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.page-header h1 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 64px;
  font-weight: 400;
  margin: 0 0 20px;
  letter-spacing: -1.5px;
  line-height: 1.1;
  color: #ffffff;
}

.page-header p {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.95;
  color: #ffffff;
}

.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
}

.search-section {
  margin-bottom: 60px;
}

.search-box {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20px;
  color: rgba(30, 64, 175, 0.5);
  font-size: 24px;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 18px 24px 18px 60px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  border: 2px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  color: #1e40af;
  background: #ffffff;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input:focus + .search-icon,
.search-input:focus ~ .search-icon {
  color: #3b82f6;
}

.search-input::placeholder {
  color: rgba(30, 64, 175, 0.5);
}

.faq-section {
  margin-bottom: 60px;
}

.section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  letter-spacing: -1.5px;
  line-height: 1.2;
  margin: 0 0 40px;
  color: #1e40af;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.section-title-icon {
  color: #3b82f6;
  font-size: 42px;
}

.faq-container {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 2fr);
  gap: 20px;
}

.faq-item {
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%);
  border: 2px solid rgba(30, 64, 175, 0.15);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.faq-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  transform: scaleY(0);
  transition: transform 0.4s ease;
  transform-origin: top;
}

.faq-item.active {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  transform: translateX(4px);
}

.faq-item.active::before {
  transform: scaleY(1);
}

.faq-question {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1e40af;
  padding: 28px 36px;
  margin: 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.faq-question:hover {
  color: #3b82f6;
  padding-left: 40px;
}

.faq-question-number {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 500;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.faq-item.active .faq-question-number {
  background: rgba(59, 130, 246, 0.2);
  color: #2563eb;
  transform: scale(1.1);
}

.faq-question-text {
  flex: 1;
  line-height: 1.5;
}

.faq-icon {
  font-size: 28px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 10px;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
  background: rgba(59, 130, 246, 0.2);
}

.faq-answer {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.8;
  color: #333333;
  padding: 0 36px;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s ease;
  position: relative;
}

.faq-item.active .faq-answer {
  max-height: 1000px;
  padding: 0 36px 28px;
}

.faq-answer-content {
  padding-top: 8px;
  color: #4b5563;
}

.contact-section {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  padding: 48px;
  text-align: center;
}

.contact-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 55px;
  font-weight: 400;
  margin: 0 0 16px;
  color: #1e40af;
  letter-spacing: -1.5px;
  line-height: 1.2;
}

.contact-description {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: #1e40af;
  margin: 0 0 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.contact-button {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  text-decoration: none;
}

.contact-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.contact-button svg {
  font-size: 20px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 100px 24px 60px;
  }

  .page-header h1 {
    font-size: 36px;
  }

  .page-header p {
    font-size: 18px;
  }

  .help-container {
    padding: 40px 24px;
  }

  .section-title {
    font-size: 32px;
    flex-direction: column;
    gap: 12px;
  }

  .section-title-icon {
    font-size: 32px;
  }

  .faq-question {
    padding: 20px 24px;
    font-size: 18px;
    gap: 16px;
  }

  .faq-question:hover {
    padding-left: 24px;
  }

  .faq-question-number {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .faq-icon {
    width: 36px;
    height: 36px;
    font-size: 24px;
  }

  .faq-answer {
    padding: 0 24px;
    font-size: 16px;
  }

  .faq-item.active .faq-answer {
    padding: 0 24px 24px;
  }

  .contact-section {
    padding: 32px 24px;
  }

  .contact-title {
    font-size: 28px;
  }
}
`

function HelpCenter({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology, onNavigateToProduct, onNavigateToUseCases }) {
  const [activeFaq, setActiveFaq] = useState(null)

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="company-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToTechnology={onNavigateToTechnology}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToUseCases={onNavigateToUseCases}
        />
        
        <main>
        <div className="page-header">
          <h1>Help Center</h1>
          <p>Find answers to common questions and get the support you need</p>
        </div>

        <div className="help-container">
          <div className="search-section">
            <div className="search-box">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for help articles, tutorials, or FAQs..."
                />
                <MdSearch className="search-icon" />
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2 className="section-title">
              <MdQuestionAnswer className="section-title-icon" />
              Frequently Asked Questions
            </h2>
            <div className="faq-container">
              {HELP_FAQS.map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                >
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="faq-question-number">{index + 1}</div>
                    <div className="faq-question-text">{faq.question}</div>
                    <MdKeyboardArrowDown className="faq-icon" />
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-section">
            <h2 className="contact-title">Still need help?</h2>
            <p className="contact-description">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <a href="mailto:support@lmsathena.com" className="contact-button">
              <MdSupport />
              Contact Support
            </a>
          </div>
        </div>
        </main>

        <Footer 
          onLogoClick={onLogoClick}
          onNavigateToProduct={onNavigateToProduct}
          onNavigateToSolution={onNavigateToSolution}
          onNavigateToEthics={onNavigateToEthics}
          onNavigateToCompany={onNavigateToCompany}
          onNavigateToUseCases={onNavigateToUseCases}
        />
      </div>
    </>
  )
}

export default HelpCenter

