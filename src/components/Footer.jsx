import { MdArrowOutward, MdLanguage } from 'react-icons/md'

const styles = `
.footer {
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #FFFFFF;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  padding: 80px 40px 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  font-family: 'Georgia', 'Times New Roman', serif;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}

.footer-logo:hover {
  color: #60a5fa;
}

.footer-logo-icon {
  width: 32px;
  height: 32px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}

.footer-logo-icon::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.footer-logo-icon::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #60a5fa;
  border-radius: 50%;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
}

.footer-description {
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  max-width: 280px;
}

.footer-social {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-link {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 18px;
}

.social-link:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  color: #60a5fa;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-column-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.footer-link {
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.footer-link:hover {
  color: #60a5fa;
}

.footer-link svg {
  font-size: 12px;
  opacity: 0.6;
}

.footer-newsletter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.newsletter-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.newsletter-description {
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.newsletter-form {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.newsletter-input {
  font-family: 'Arial', sans-serif;
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.newsletter-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.15);
}

.newsletter-button {
  font-family: 'Arial', sans-serif;
  padding: 12px 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.newsletter-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-copyright {
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.footer-bottom-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-bottom-link {
  font-family: 'Arial', sans-serif;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-bottom-link:hover {
  color: #60a5fa;
}

.footer-language {
  font-family: 'Arial', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.footer-language:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.footer-language svg {
  font-size: 18px;
  color: #3b82f6;
}

@media (max-width: 1200px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 40px;
  }

  .footer-newsletter {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 60px 24px 32px;
  }

  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-newsletter {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer-bottom-links {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-button {
    width: 100%;
    justify-content: center;
  }
}
`

function Footer({ 
  onLogoClick, 
  onNavigateToProduct, 
  onNavigateToSolution, 
  onNavigateToEthics 
}) {
  const handleProductClick = (e, productName) => {
    e.preventDefault()
    if (onNavigateToProduct) {
      onNavigateToProduct(productName)
    }
  }

  const handleSolutionClick = (e, solutionName) => {
    e.preventDefault()
    if (onNavigateToSolution) {
      onNavigateToSolution(solutionName)
    }
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (onLogoClick) {
      onLogoClick()
    }
  }

  const handleEthicsClick = (e) => {
    e.preventDefault()
    if (onNavigateToEthics) {
      onNavigateToEthics()
    }
  }

  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="footer-logo" onClick={handleLogoClick}>
              <div className="footer-logo-icon"></div>
              Athena VI
            </a>
            <p className="footer-description">
              Create AI-powered videos with lifelike avatars. Transform your content into engaging visual experiences with Athena VI.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Products</h3>
            <a href="#" className="footer-link" onClick={(e) => handleProductClick(e, 'Visual AI Agents')}>Visual AI Agents</a>
            <a href="#" className="footer-link" onClick={(e) => handleProductClick(e, 'Creative Reality™ Studio')}>Creative Reality™ Studio</a>
            <a href="#" className="footer-link" onClick={(e) => handleProductClick(e, 'Video Translate')}>Video Translate</a>
            <a href="#" className="footer-link" onClick={(e) => handleProductClick(e, 'Video Campaigns')}>Video Campaigns</a>
            <a href="#" className="footer-link" onClick={(e) => handleProductClick(e, 'Personal Avatars')}>Personal Avatars</a>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Solutions</h3>
            <a href="#" className="footer-link" onClick={(e) => handleSolutionClick(e, 'Marketing Suite')}>Marketing Suite</a>
            <a href="#" className="footer-link" onClick={(e) => handleSolutionClick(e, 'Sales Solutions')}>Sales Solutions</a>
            <a href="#" className="footer-link">Customer Experience</a>
            <a href="#" className="footer-link">Learning & Development</a>
            <a href="#" className="footer-link">AI Videos</a>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Company</h3>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Leadership</a>
            <a href="#" className="footer-link">Partners</a>
            <a href="#" className="footer-link">News</a>
            <a href="#" className="footer-link">Resources</a>
          </div>

          <div className="footer-newsletter">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest news and updates about AI video technology.
            </p>
            <form className="newsletter-form" onSubmit={(e) => {
              e.preventDefault()
              // Handle newsletter subscription
            }}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
                <MdArrowOutward />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} Athena VI. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link" onClick={handleEthicsClick}>Trust Center</a>
            <a href="#" className="footer-bottom-link">Privacy Policy</a>
            <a href="#" className="footer-bottom-link">Terms of Service</a>
            <a href="#" className="footer-bottom-link">Help Center</a>
          </div>
          <div className="footer-language">
            <MdLanguage />
            <span>English</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer

