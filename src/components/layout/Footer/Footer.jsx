import { MdArrowOutward, MdLanguage } from 'react-icons/md'
import { FaInstagram } from 'react-icons/fa'
import LogoImg from '../../../assets/herologo.webp'
import {
  FOOTER_PRODUCT_NAV,
  SOLUTION_NAV,
  HOME_HREF,
  ETHICS_HREF,
  PRIVACY_HREF,
  HELP_HREF,
} from '../../../seo/siteNav.js'
import './Footer.css'

/** Let the browser open the real href for modified clicks; otherwise keep in-app navigation. */
const spaClick = (event, action) => {
  if (event.metaKey || event.ctrlKey) return
  event.preventDefault()
  action()
}

function Footer({
  onLogoClick,
  onNavigateToProduct,
  onNavigateToSolution,
  onNavigateToEthics,
  onNavigateToCompany
}) {
  const handleProductClick = (e, productName) => {
    spaClick(e, () => {
      if (onNavigateToProduct) onNavigateToProduct(productName)
    })
  }

  const handleSolutionClick = (e, solutionName) => {
    spaClick(e, () => {
      if (onNavigateToSolution) onNavigateToSolution(solutionName)
    })
  }

  const handleCompanyClick = (item) => {
    if (onNavigateToCompany) {
      onNavigateToCompany(item)
    }
  }

  const handleEthicsClick = (e) => {
    spaClick(e, () => {
      if (onNavigateToEthics) onNavigateToEthics()
    })
  }

  const handleLogoClick = (e) => {
    spaClick(e, () => {
      if (onLogoClick) onLogoClick()
    })
  }

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <a href={HOME_HREF} className="footer-logo" onClick={handleLogoClick}>
              <img src={LogoImg} alt="Logo" className="footer-logo-img" />
            </a>
            <p className="footer-description">
              Create AI-powered videos with lifelike avatars. Transform your content into engaging visual experiences with Virtual Studio.
            </p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/company/lmsathena" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/athena.lms" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.youtube.com/@LMSAthena" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590841915126" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Products</h3>
            {FOOTER_PRODUCT_NAV.map((item) => (
              <a key={item.title} href={item.href} className="footer-link" onClick={(e) => handleProductClick(e, item.title)}>{item.title}</a>
            ))}
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">Solutions</h3>
            {SOLUTION_NAV.map((item) => (
              <a key={item.title} href={item.href} className="footer-link" onClick={(e) => handleSolutionClick(e, item.title)}>{item.title}</a>
            ))}
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
            <a href={ETHICS_HREF} className="footer-bottom-link" onClick={handleEthicsClick}>Trust Center</a>
            <a href={PRIVACY_HREF} className="footer-bottom-link" onClick={(e) => spaClick(e, () => handleCompanyClick('Privacy Policy'))}>Privacy Policy</a>
            <span className="footer-bottom-link">Terms of Service</span>
            <a
              href={HELP_HREF}
              className="footer-bottom-link"
              onClick={(e) => spaClick(e, () => handleCompanyClick('Help Center'))}
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

