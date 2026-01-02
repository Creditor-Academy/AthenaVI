import { useState, useEffect, useRef } from 'react'
import { MdKeyboardArrowDown, MdLanguage, MdArrowOutward, MdMenu, MdClose } from 'react-icons/md'

const styles = `
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(30, 64, 175, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(30, 64, 175, 0.05);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
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

.logo-icon::before {
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

.logo-icon::after {
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

.nav-center {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-link-wrapper {
  position: relative;
}

.nav-link {
  font-family: 'Arial', sans-serif;
  color: #1e40af;
  text-decoration: none;
  font-size: 15px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.nav-link:hover {
  color: #3b82f6;
}

.nav-link svg {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.nav-link.active svg {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(30, 64, 175, 0.15);
  border: 1px solid rgba(30, 64, 175, 0.1);
  min-width: 240px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1000;
}

.dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  font-family: 'Arial', sans-serif;
  display: block;
  padding: 12px 20px;
  color: #1e40af;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: rgba(30, 64, 175, 0.1);
  color: #3b82f6;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-outline {
  font-family: 'Arial', sans-serif;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.login-link {
  font-family: 'Arial', sans-serif;
  color: #1e40af;
  text-decoration: none;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.login-link:hover {
  color: #3b82f6;
}

.lang-selector {
  font-family: 'Arial', sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e40af;
  cursor: pointer;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.lang-selector:hover {
  background: rgba(30, 64, 175, 0.1);
  color: #3b82f6;
}

.lang-selector svg {
  font-size: 18px;
  color: #3b82f6;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: #1e40af;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s ease;
}

.mobile-menu-btn:hover {
  color: #3b82f6;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 1000;
  padding: 80px 24px 24px;
  overflow-y: auto;
}

.mobile-menu.active {
  display: block;
}

.mobile-nav-link {
  font-family: 'Arial', sans-serif;
  display: block;
  color: #1e40af;
  text-decoration: none;
  font-size: 18px;
  font-weight: 400;
  padding: 16px 0;
  border-bottom: 1px solid rgba(30, 64, 175, 0.1);
  cursor: pointer;
  transition: color 0.2s ease;
}

.mobile-nav-link:hover {
  color: #3b82f6;
}

.mobile-nav-link.has-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-dropdown {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-dropdown.active {
  max-height: 1000px;
}

.mobile-dropdown-item {
  font-family: 'Arial', sans-serif;
  display: block;
  padding: 12px 24px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 16px;
  border-bottom: 1px solid rgba(30, 64, 175, 0.05);
  transition: all 0.2s ease;
}

.mobile-dropdown-item:hover {
  color: #1e40af;
  background: rgba(30, 64, 175, 0.05);
}

.mobile-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-actions .btn-outline,
.mobile-actions .btn-primary {
  width: 100%;
  justify-content: center;
}

@media (max-width: 1024px) {
  .nav-center {
    gap: 24px;
  }
  
  .nav-link {
    font-size: 14px;
  }
  
  .btn-outline,
  .btn-primary {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 20px;
  }

  .nav-center,
  .nav-right {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
  }
}
`

function Navbar({ onLoginClick }) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdowns, setMobileDropdowns] = useState({})
  const dropdownRefs = useRef({})

  const productsItems = [
    'Visual AI Agents',
    'Creative Reality™ Studio',
    'Video Translate',
    'Video Campaigns',
    'Personal Avatars'
  ]

  const solutionsItems = [
    'Marketing Suite',
    'Sales Solutions',
    'Customer Experience',
    'Learning & Development',
    'AI Videos'
  ]

  const companyItems = [
    'About Us',
    'Blog',
    'Careers',
    'Leadership',
    'Partners',
    'News',
    'Resources',
    'Trust Center',
    'Privacy Policy',
    'Help Center'
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key]
        if (ref && !ref.contains(event.target)) {
          setActiveDropdown(null)
        }
      })
    }

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown])

  useEffect(() => {
    const handleMobileMenuClose = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleMobileMenuClose)
    }
    return () => document.removeEventListener('click', handleMobileMenuClose)
  }, [mobileMenuOpen])

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
  }

  const toggleMobileDropdown = (dropdownName) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }))
  }

  const handleMobileLinkClick = (e, hasDropdown) => {
    if (hasDropdown) {
      e.preventDefault()
      const dropdownName = e.currentTarget.dataset.dropdown
      toggleMobileDropdown(dropdownName)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-left">
          <a href="#" className="logo">
            <div className="logo-icon"></div>
            Athena VI
          </a>
        </div>

        <div className="nav-center">
          <div
            className="nav-link-wrapper"
            ref={el => dropdownRefs.current.products = el}
            onMouseEnter={() => setActiveDropdown('products')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a
              href="#"
              className={`nav-link ${activeDropdown === 'products' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                toggleDropdown('products')
              }}
            >
              Products
              <MdKeyboardArrowDown />
            </a>
            <div className={`dropdown ${activeDropdown === 'products' ? 'active' : ''}`}>
              {productsItems.map((item, index) => (
                <a key={index} href="#" className="dropdown-item">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div
            className="nav-link-wrapper"
            ref={el => dropdownRefs.current.solutions = el}
            onMouseEnter={() => setActiveDropdown('solutions')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a
              href="#"
              className={`nav-link ${activeDropdown === 'solutions' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                toggleDropdown('solutions')
              }}
            >
              Solutions
              <MdKeyboardArrowDown />
            </a>
            <div className={`dropdown ${activeDropdown === 'solutions' ? 'active' : ''}`}>
              {solutionsItems.map((item, index) => (
                <a key={index} href="#" className="dropdown-item">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div
            className="nav-link-wrapper"
            ref={el => dropdownRefs.current.technology = el}
            onMouseEnter={() => setActiveDropdown('technology')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a
              href="#"
              className={`nav-link ${activeDropdown === 'technology' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                toggleDropdown('technology')
              }}
            >
              Technology
              <MdKeyboardArrowDown />
            </a>
            <div className={`dropdown ${activeDropdown === 'technology' ? 'active' : ''}`}>
              <a href="#" className="dropdown-item">AI Technology</a>
              <a href="#" className="dropdown-item">API Documentation</a>
            </div>
          </div>

          <a href="#" className="nav-link">
            Ethics
          </a>

          <a href="#" className="nav-link">
            Pricing
          </a>

          <div
            className="nav-link-wrapper"
            ref={el => dropdownRefs.current.company = el}
            onMouseEnter={() => setActiveDropdown('company')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a
              href="#"
              className={`nav-link ${activeDropdown === 'company' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                toggleDropdown('company')
              }}
            >
              Company
              <MdKeyboardArrowDown />
            </a>
            <div className={`dropdown ${activeDropdown === 'company' ? 'active' : ''}`}>
              {companyItems.map((item, index) => (
                <a key={index} href="#" className="dropdown-item">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-right">
          <button className="btn-outline">
            CONTACT SALES
            <MdArrowOutward />
          </button>
          <button className="btn-primary">
            START FREE TRIAL
            <MdArrowOutward />
          </button>
          <a href="#" className="login-link" onClick={(e) => {
            e.preventDefault()
            if (onLoginClick) onLoginClick()
          }}>
            Log in
          </a>
          <div className="lang-selector">
            <MdLanguage />
            <MdKeyboardArrowDown />
          </div>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <a
          href="#"
          className="mobile-nav-link has-dropdown"
          data-dropdown="products"
          onClick={(e) => handleMobileLinkClick(e, true)}
        >
          Products
          <MdKeyboardArrowDown />
        </a>
        <div className={`mobile-dropdown ${mobileDropdowns.products ? 'active' : ''}`}>
          {productsItems.map((item, index) => (
            <a key={index} href="#" className="mobile-dropdown-item">
              {item}
            </a>
          ))}
        </div>

        <a
          href="#"
          className="mobile-nav-link has-dropdown"
          data-dropdown="solutions"
          onClick={(e) => handleMobileLinkClick(e, true)}
        >
          Solutions
          <MdKeyboardArrowDown />
        </a>
        <div className={`mobile-dropdown ${mobileDropdowns.solutions ? 'active' : ''}`}>
          {solutionsItems.map((item, index) => (
            <a key={index} href="#" className="mobile-dropdown-item">
              {item}
            </a>
          ))}
        </div>

        <a
          href="#"
          className="mobile-nav-link has-dropdown"
          data-dropdown="technology"
          onClick={(e) => handleMobileLinkClick(e, true)}
        >
          Technology
          <MdKeyboardArrowDown />
        </a>
        <div className={`mobile-dropdown ${mobileDropdowns.technology ? 'active' : ''}`}>
          <a href="#" className="mobile-dropdown-item">AI Technology</a>
          <a href="#" className="mobile-dropdown-item">API Documentation</a>
        </div>

        <a href="#" className="mobile-nav-link">Ethics</a>
        <a href="#" className="mobile-nav-link">Pricing</a>

        <a
          href="#"
          className="mobile-nav-link has-dropdown"
          data-dropdown="company"
          onClick={(e) => handleMobileLinkClick(e, true)}
        >
          Company
          <MdKeyboardArrowDown />
        </a>
        <div className={`mobile-dropdown ${mobileDropdowns.company ? 'active' : ''}`}>
          {companyItems.map((item, index) => (
            <a key={index} href="#" className="mobile-dropdown-item">
              {item}
            </a>
          ))}
        </div>

        <div className="mobile-actions">
          <button className="btn-outline">
            CONTACT SALES
            <MdArrowOutward />
          </button>
          <button className="btn-primary">
            START FREE TRIAL
            <MdArrowOutward />
          </button>
          <a href="#" className="login-link" onClick={(e) => {
            e.preventDefault()
            setMobileMenuOpen(false)
            if (onLoginClick) onLoginClick()
          }}>
            Log in
          </a>
        </div>
      </div>
    </>
  )
}

export default Navbar

