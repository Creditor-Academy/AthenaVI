import { useState } from 'react'
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
  font-family: 'Arial', sans-serif;
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

.search-input {
  width: 100%;
  padding: 18px 24px;
  font-family: 'Arial', sans-serif;
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

.search-input::placeholder {
  color: rgba(30, 64, 175, 0.5);
}

.categories-section {
  margin-bottom: 60px;
}

.section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 42px;
  font-weight: 500;
  margin: 0 0 24px;
  color: #1e40af;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.category-card {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  padding: 32px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.category-card:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
  transform: translateY(-4px);
}

.category-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.category-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #1e40af;
}

.category-count {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #3b82f6;
  margin: 0;
}

.faq-section {
  margin-bottom: 60px;
}

.faq-item {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item.active {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
}

.faq-question {
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #1e40af;
  padding: 24px 32px;
  margin: 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.faq-question:hover {
  color: #3b82f6;
}

.faq-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
  color: #3b82f6;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #1e40af;
  padding: 0 32px 24px;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-item.active .faq-answer {
  max-height: 500px;
  padding-top: 0;
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
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: #1e40af;
  margin: 0 0 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.contact-button {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  text-decoration: none;
}

.contact-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
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
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .faq-question {
    padding: 20px 24px;
    font-size: 16px;
  }

  .faq-answer {
    padding: 0 24px 20px;
    font-size: 15px;
  }

  .contact-section {
    padding: 32px 24px;
  }

  .contact-title {
    font-size: 28px;
  }
}
`

function HelpCenter({ onLoginClick, onLogoClick, onNavigateToCompany }) {
  const [activeFaq, setActiveFaq] = useState(null)

  const categories = [
    { icon: '🚀', title: 'Getting Started', count: '12 articles' },
    { icon: '🎬', title: 'Video Creation', count: '28 articles' },
    { icon: '👤', title: 'Avatars & Voices', count: '15 articles' },
    { icon: '🔧', title: 'Account & Billing', count: '10 articles' },
    { icon: '💼', title: 'Business Features', count: '18 articles' },
    { icon: '🔌', title: 'API & Integrations', count: '22 articles' }
  ]

  const faqs = [
    {
      question: 'How do I create my first video?',
      answer: 'Creating your first video is easy! Start by selecting a template or uploading your own content. Then choose an avatar, add your script, and customize the settings. Our AI will handle the rest, generating a professional video in minutes.'
    },
    {
      question: 'Can I use my own voice for avatars?',
      answer: 'Yes! AthenaVI supports voice cloning technology. Simply record a few minutes of your voice, and our AI will create a voice model that can speak any text you provide in your natural voice.'
    },
    {
      question: 'What video formats are supported?',
      answer: 'We support all major video formats including MP4, MOV, AVI, and WebM. You can export your videos in various resolutions from 720p to 4K, depending on your subscription plan.'
    },
    {
      question: 'How does the pricing work?',
      answer: 'We offer flexible pricing plans to suit different needs. Our plans are based on the number of videos you create per month and the features you need. You can upgrade or downgrade your plan at any time.'
    },
    {
      question: 'Is my content secure and private?',
      answer: 'Absolutely. We take security and privacy seriously. All your content is encrypted and stored securely. We never share your videos or data with third parties without your explicit consent.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won\'t be charged for the next cycle.'
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
        />
        
        <div className="page-header">
          <h1>Help Center</h1>
          <p>Find answers to common questions and get the support you need</p>
        </div>

        <div className="help-container">
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search for help articles, tutorials, or FAQs..."
              />
            </div>
          </div>

          <div className="categories-section">
            <h2 className="section-title">Browse by Category</h2>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <div key={index} className="category-card">
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-title">{category.title}</h3>
                  <p className="category-count">{category.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <div 
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">▼</span>
                </div>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="contact-section">
            <h2 className="contact-title">Still need help?</h2>
            <p className="contact-description">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <a href="#" className="contact-button">
              Contact Support →
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default HelpCenter

