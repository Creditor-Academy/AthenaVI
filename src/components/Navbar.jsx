import { useState, useEffect, useRef } from 'react'
import { MdKeyboardArrowDown, MdArrowOutward, MdMenu, MdClose } from 'react-icons/md'

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
  z-index: 200;
  box-shadow: 0 2px 20px rgba(30, 64, 175, 0.05);
  width: 100%;
  max-width: 100%;
  overflow: visible;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
  z-index: 101;
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
  flex: 1 1 auto;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
}

.nav-link-wrapper {
  position: relative;
  display: inline-block;
  z-index: 201;
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
  flex-shrink: 0;
  padding: 8px 4px;
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
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(30, 64, 175, 0.15);
  border: 1px solid rgba(30, 64, 175, 0.1);
  min-width: 240px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 1100;
}

.dropdown.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
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

.nav-center .login-link {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  border: none;
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
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  flex-shrink: 0;
}

.nav-center .login-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
}

.nav-center .btn-primary {
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
  flex-shrink: 0;
}

.nav-center .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  min-width: 0;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.login-link {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  border: none;
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
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  flex-shrink: 0;
}

.login-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
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
  z-index: 1101;
  position: relative;
  flex-shrink: 0;
}

.mobile-menu-btn:hover {
  color: #3b82f6;
}

.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1098;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.mobile-menu-overlay.active {
  display: block;
  opacity: 1;
  pointer-events: auto;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  z-index: 1099;
  padding: 24px;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
}

.mobile-menu.active {
  transform: translateX(0);
}

.mobile-menu-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #1e40af;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 22px;
  z-index: 1;
}

.mobile-menu-close-btn:hover {
  background: rgba(30, 64, 175, 0.1);
  color: #3b82f6;
  transform: rotate(90deg);
}

.mobile-nav-link {
  font-family: 'Arial', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e40af;
  text-decoration: none;
  font-size: 15px;
  font-weight: 400;
  padding: 12px 0;
  border-bottom: 1px solid rgba(30, 64, 175, 0.1);
  cursor: pointer;
  transition: color 0.2s ease;
}

.mobile-nav-link svg {
  font-size: 18px;
}

.mobile-nav-link:hover {
  color: #3b82f6;
}

.mobile-nav-link.has-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-nav-link.has-dropdown svg {
  transition: transform 0.3s ease;
}

.mobile-nav-link.has-dropdown.active svg {
  transform: rotate(180deg);
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
.mobile-actions .btn-primary,
.mobile-actions .login-link {
  width: 100%;
  justify-content: center;
}

@media (min-width: 1920px) {
  .navbar {
    padding: 16px 60px;
  }
  
  .nav-center {
    gap: 40px;
  }
  
  .nav-link {
    font-size: 16px;
  }
  
  .btn-outline,
  .btn-primary {
    padding: 12px 24px;
    font-size: 15px;
  }
}

@media (max-width: 1400px) {
  .nav-center {
    gap: 24px;
  }
  
  .nav-link {
    font-size: 14px;
  }
}

@media (max-width: 1200px) {
  .nav-center {
    gap: 20px;
  }
  
  .nav-link {
    font-size: 13px;
  }
  
  .btn-outline,
  .btn-primary {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .login-link {
    font-size: 13px;
  }
}

@media (max-width: 1024px) {
  .navbar {
    padding: 14px 24px;
  }
  
  .nav-center {
    gap: 18px;
  }
  
  .nav-link {
    font-size: 13px;
  }
  
  .btn-outline,
  .btn-primary {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .login-link {
    font-size: 13px;
  }
}

@media (max-width: 968px) {
  .nav-center,
  .nav-right {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }
  
  .navbar {
    padding: 12px 20px;
  }
  
  .logo {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
  }
  
  .logo {
    font-size: 20px;
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
  }
  
  .mobile-menu {
    max-width: 100%;
    padding: 20px;
  }
  
  .mobile-nav-link {
    font-size: 14px;
    padding: 12px 0;
  }
  
  .mobile-dropdown-item {
    font-size: 15px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 12px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .logo-icon {
    width: 24px;
    height: 24px;
  }
  
  .mobile-menu-btn {
    font-size: 22px;
    padding: 6px;
  }
  
  .mobile-menu {
    padding: 16px;
  }
  
  .mobile-menu-close-btn {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    font-size: 20px;
  }
  
  .mobile-nav-link {
    font-size: 14px;
    padding: 10px 0;
  }
  
  .mobile-dropdown-item {
    font-size: 14px;
    padding: 8px 16px;
  }
  
  .mobile-actions .btn-outline,
  .mobile-actions .btn-primary,
  .mobile-actions .login-link {
    padding: 12px 20px;
    font-size: 14px;
  }
}
`

function Navbar({ onLoginClick, onNavigateToProduct, onLogoClick }) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdowns, setMobileDropdowns] = useState({})
  const dropdownRefs = useRef({})
  const mobileMenuRef = useRef(null)
  const mobileMenuBtnRef = useRef(null)
  const clickTimeoutRef = useRef(null)

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

  // Handle desktop dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedInside = false
      
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key]
        if (ref && ref.contains(event.target)) {
          clickedInside = true
        }
      })
      
      if (!clickedInside && activeDropdown) {
        // Clear click timeout if dropdown is closed
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
          clickTimeoutRef.current = null
        }
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      // Small delay to allow click events to complete
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [activeDropdown])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  // Handle mobile menu overlay clicks and body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      
      const handleClickOutside = (event) => {
        if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          mobileMenuBtnRef.current &&
          !mobileMenuBtnRef.current.contains(event.target)
        ) {
          setMobileMenuOpen(false)
        }
      }

      // Small delay to prevent immediate close
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
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
    } else {
      setMobileMenuOpen(false)
    }
  }

  const handleMobileActionClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-left">
          <a 
            href="#" 
            className="logo" 
            onClick={(e) => {
              e.preventDefault()
              setMobileMenuOpen(false)
              if (onLogoClick) {
                onLogoClick()
              }
            }}
          >
            <div className="logo-icon"></div>
            Athena VI
          </a>
        </div>

        <div className="nav-center">
          <div
            className="nav-link-wrapper"
            ref={el => dropdownRefs.current.products = el}
            onMouseEnter={() => {
              if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current)
                clickTimeoutRef.current = null
              }
              setActiveDropdown('products')
            }}
            onMouseLeave={() => {
              // Only close if not clicked (clicked dropdowns stay open for 3-4 seconds)
              if (!clickTimeoutRef.current) {
                setActiveDropdown(null)
              }
            }}
          >
            <a
              href="#"
              className={`nav-link ${activeDropdown === 'products' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                // Clear any existing timeout
                if (clickTimeoutRef.current) {
                  clearTimeout(clickTimeoutRef.current)
                }
                setActiveDropdown('products')
                // Keep dropdown open for 3.5 seconds after click
                clickTimeoutRef.current = setTimeout(() => {
                  setActiveDropdown(null)
                  clickTimeoutRef.current = null
                }, 3500)
              }}
            >
              Products
              <MdKeyboardArrowDown />
            </a>
            <div className={`dropdown ${activeDropdown === 'products' ? 'active' : ''}`}>
              {productsItems.map((item, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault()
                    // Clear timeout when item is clicked
                    if (clickTimeoutRef.current) {
                      clearTimeout(clickTimeoutRef.current)
                      clickTimeoutRef.current = null
                    }
                    if (onNavigateToProduct) {
                      onNavigateToProduct(item)
                    }
                    setActiveDropdown(null)
                  }}
                >
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

          <a href="#" className="nav-link">Ethics</a>
          <a href="#" className="nav-link">Pricing</a>

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

          <a 
            href="#" 
            className="login-link" 
            onClick={(e) => {
              e.preventDefault()
              if (onLoginClick) onLoginClick()
            }}
          >
            Log in
            <MdArrowOutward />
          </a>

          <button className="btn-primary">
            CONTACT US
            <MdArrowOutward />
          </button>
        </div>

        <button
          ref={mobileMenuBtnRef}
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <button 
          className="mobile-menu-close-btn"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <MdClose />
        </button>

        <a 
          href="#" 
          className="mobile-nav-link"
          onClick={(e) => {
            e.preventDefault()
            handleMobileActionClick()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          Home
        </a>

        <a
          href="#"
          className={`mobile-nav-link has-dropdown ${mobileDropdowns.products ? 'active' : ''}`}
          data-dropdown="products"
          onClick={(e) => handleMobileLinkClick(e, true)}
        >
          Products
          <MdKeyboardArrowDown />
        </a>
          <div className={`mobile-dropdown ${mobileDropdowns.products ? 'active' : ''}`}>
            {productsItems.map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="mobile-dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleMobileActionClick()
                  if (onNavigateToProduct) {
                    onNavigateToProduct(item)
                  }
                }}
              >
                {item}
              </a>
            ))}
          </div>

          <a
            href="#"
            className={`mobile-nav-link has-dropdown ${mobileDropdowns.solutions ? 'active' : ''}`}
            data-dropdown="solutions"
            onClick={(e) => handleMobileLinkClick(e, true)}
          >
            Solutions
            <MdKeyboardArrowDown />
          </a>
          <div className={`mobile-dropdown ${mobileDropdowns.solutions ? 'active' : ''}`}>
            {solutionsItems.map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="mobile-dropdown-item"
                onClick={handleMobileActionClick}
              >
                {item}
              </a>
            ))}
          </div>

          <a
            href="#"
            className={`mobile-nav-link has-dropdown ${mobileDropdowns.technology ? 'active' : ''}`}
            data-dropdown="technology"
            onClick={(e) => handleMobileLinkClick(e, true)}
          >
            Technology
            <MdKeyboardArrowDown />
          </a>
          <div className={`mobile-dropdown ${mobileDropdowns.technology ? 'active' : ''}`}>
            <a href="#" className="mobile-dropdown-item" onClick={handleMobileActionClick}>
              AI Technology
            </a>
            <a href="#" className="mobile-dropdown-item" onClick={handleMobileActionClick}>
              API Documentation
            </a>
          </div>

          <a href="#" className="mobile-nav-link" onClick={handleMobileActionClick}>
            Ethics
          </a>
          <a href="#" className="mobile-nav-link" onClick={handleMobileActionClick}>
            Pricing
          </a>

          <a
            href="#"
            className={`mobile-nav-link has-dropdown ${mobileDropdowns.company ? 'active' : ''}`}
            data-dropdown="company"
            onClick={(e) => handleMobileLinkClick(e, true)}
          >
            Company
            <MdKeyboardArrowDown />
          </a>
          <div className={`mobile-dropdown ${mobileDropdowns.company ? 'active' : ''}`}>
            {companyItems.map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="mobile-dropdown-item"
                onClick={handleMobileActionClick}
              >
                {item}
              </a>
            ))}
          </div>

        <div className="mobile-actions">
          <button className="btn-outline" onClick={handleMobileActionClick}>
            CONTACT SALES
            <MdArrowOutward />
          </button>
          <button className="btn-primary" onClick={handleMobileActionClick}>
            CONTACT US
            <MdArrowOutward />
          </button>
          <a 
            href="#" 
            className="login-link" 
            onClick={(e) => {
              e.preventDefault()
              handleMobileActionClick()
              if (onLoginClick) onLoginClick()
            }}
          >
            Log in
            <MdArrowOutward />
          </a>
        </div>
      </div>
    </>
  )
}

export default Navbar
