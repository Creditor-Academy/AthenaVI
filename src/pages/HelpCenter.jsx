import { useState } from 'react'
import { 
  MdKeyboardArrowDown,
  MdSearch,
  MdSupport,
  MdHelpOutline,
  MdQuestionAnswer
} from 'react-icons/md'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

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
  font-size: 56px;
  font-weight: 500;
  margin: 0 0 20px;
}

.page-header p {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.95;
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
  font-size: clamp(40px, 4vw, 64px);
  font-weight: 400;
  letter-spacing: -1.5px;
  line-height: 1.15;
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
  font-size: 32px;
  font-weight: 500;
  margin: 0 0 16px;
  color: #1e40af;
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

function HelpCenter({ onLoginClick, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology }) {
  const [activeFaq, setActiveFaq] = useState(null)

  const faqs = [
    {
      question: 'How do I create my first video?',
      answer: 'Creating your first video is easy! Start by selecting a template or uploading your own content. Then choose an avatar, add your script, and customize the settings. Our AI will handle the rest, generating a professional video in minutes. You can preview your video before finalizing and make any adjustments needed.'
    },
    {
      question: 'Can I use my own voice for avatars?',
      answer: 'Yes! AthenaVI supports voice cloning technology. Simply record a few minutes of your voice (we recommend 5-10 minutes for best results), and our AI will create a voice model that can speak any text you provide in your natural voice. The voice cloning feature is available on our Pro and Enterprise plans.'
    },
    {
      question: 'What video formats are supported?',
      answer: 'We support all major video formats including MP4, MOV, AVI, and WebM. You can export your videos in various resolutions from 720p to 4K, depending on your subscription plan. All videos are optimized for web, social media, and professional use.'
    },
    {
      question: 'How does the pricing work?',
      answer: 'We offer flexible pricing plans to suit different needs. Our plans are based on the number of videos you create per month and the features you need. You can upgrade or downgrade your plan at any time. We also offer annual billing with a 20% discount. All plans include access to our library of avatars and basic templates.'
    },
    {
      question: 'Is my content secure and private?',
      answer: 'Absolutely. We take security and privacy seriously. All your content is encrypted and stored securely using industry-standard encryption. We never share your videos or data with third parties without your explicit consent. Your content remains private and you have full control over who can access it.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won\'t be charged for the next cycle. You can cancel directly from your account settings, and there are no cancellation fees.'
    },
    {
      question: 'What languages are supported for video creation?',
      answer: 'AthenaVI supports over 50 languages for video creation, including English, Spanish, French, German, Chinese, Japanese, Arabic, and many more. Our AI avatars can speak in any of these languages with natural pronunciation and intonation.'
    },
    {
      question: 'Can I customize the appearance of avatars?',
      answer: 'Yes! You can customize various aspects of avatars including clothing, background, gestures, and expressions. Our Creative Reality™ Studio offers advanced customization options for creating unique avatar appearances that match your brand identity.'
    },
    {
      question: 'How long does it take to generate a video?',
      answer: 'Video generation time depends on the length and complexity of your video. Typically, a 1-minute video takes 2-5 minutes to generate. Longer videos or videos with complex animations may take up to 10-15 minutes. You\'ll receive a notification when your video is ready.'
    },
    {
      question: 'Do you offer API access for developers?',
      answer: 'Yes! We offer comprehensive API access for developers on our Enterprise plan. Our API allows you to integrate AthenaVI\'s video generation capabilities directly into your applications, automate video creation workflows, and build custom solutions. Documentation and support are included.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We provide multiple support channels including email support, live chat (for Pro and Enterprise users), comprehensive documentation, video tutorials, and a community forum. Our support team is available 24/7 to help you with any questions or issues.'
    },
    {
      question: 'Can I use AthenaVI for commercial purposes?',
      answer: 'Yes! All our plans allow commercial use of the videos you create. You can use the videos for marketing, advertising, training, education, and any other business purposes. We also offer extended licensing options for Enterprise customers who need additional usage rights.'
    }
  ]

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
        />
        
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
              {faqs.map((faq, index) => (
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
            <a href="#" className="contact-button">
              <MdSupport />
              Contact Support
            </a>
          </div>
        </div>

        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default HelpCenter

