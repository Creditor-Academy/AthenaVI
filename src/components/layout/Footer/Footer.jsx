import { MdArrowOutward, MdLanguage } from 'react-icons/md'
import LogoImg from '../../../assets/herologo.png'
import './Footer.css'


function Footer({
  onLogoClick,
  onNavigateToProduct,
  onNavigateToSolution,
  onNavigateToEthics,
  onNavigateToCompany
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

  const handleCompanyClick = (item) => {
    if (onNavigateToCompany) {
      onNavigateToCompany(item)
    }
  }

  const handleEthicsClick = (e) => {
    e.preventDefault()
    if (onNavigateToEthics) {
      onNavigateToEthics()
    }
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (onLogoClick) {
      onLogoClick()
    }
  }

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="footer-logo" onClick={handleLogoClick}>
              <img src={LogoImg} alt="Logo" className="footer-logo-img" />
            </a>
            <p className="footer-description">
              Create AI-powered videos with lifelike avatars. Transform your content into engaging visual experiences with Virtual Studio.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
            © {new Date().getFullYear()} Virtual Studio. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link" onClick={handleEthicsClick}>Trust Center</a>
            <a href="#" className="footer-bottom-link" onClick={(e) => {
              e.preventDefault()
              handleCompanyClick('Privacy Policy')
            }}>Privacy Policy</a>
            <a href="#" className="footer-bottom-link">Terms of Service</a>
            <a
              href="#"
              className="footer-bottom-link"
              onClick={(e) => {
                e.preventDefault()
                handleCompanyClick('Help Center')
              }}
            >
              Help Center
            </a>
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

