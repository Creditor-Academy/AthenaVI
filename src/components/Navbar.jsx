import { useState, useEffect, useRef } from 'react'
import { MdKeyboardArrowDown, MdArrowOutward, MdMenu, MdClose } from 'react-icons/md'
import { 
  FiCpu, FiPlayCircle, FiGlobe, FiTrendingUp, FiUserCheck,
  FiBriefcase, FiDollarSign, FiUsers, FiBookOpen, FiMail,
  FiInfo, FiFileText, FiRss, FiLayers, FiShield, FiHelpCircle
} from 'react-icons/fi'

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
  gap: 4px;
  flex: 1 1 auto;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
  margin-left: 48px;
}

.nav-pills-group {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 5px 8px;
}

.nav-link-wrapper {
  position: relative;
  display: inline-block;
  z-index: 201;
}

.nav-link {
  font-family: 'Arial', sans-serif;
  color: #374151;
  text-decoration: none;
  font-size: 15px;
  font-weight: 550;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.22s ease;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: 999px;
}

.nav-link:hover {
  background: #3b82f6;
  color: #ffffff;
}

.nav-link.active {
  background:  #3b82f6;
  color: #ffffff;
}

.nav-link svg {
  font-size: 18px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link.active svg {
  transform: rotate(180deg);
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: rgba(30, 64, 175, 0.15);
  margin: 0 12px 0 12px;
  flex-shrink: 0;
}

/* Mega Dropdown Styles */
.dropdown {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #F8FAFC;
  border-radius: 16px;
  box-shadow: 2px 30px 60px -12px rgba(0, 0, 0, 0.20), 0 18px 36px -18px rgba(0, 0, 0, 0.20), 0 0 0 1px rgba(0, 0, 0, 0.20);
  border: none;
  width: min(650px, 80vw);
  padding: 24px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  z-index: 1100;
}

.dropdown::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 0;
  right: 0;
  height: 15px;
  background: transparent;
}

.dropdown::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #F8FAFC;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  z-index: -1;
}

.dropdown.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #EFF6FF;
}

.dropdown-icon {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e40af;
  font-size: 22px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dropdown-item:hover .dropdown-icon {
  background: #3b82f6;
  color: #ffffff;
  transform: scale(1.05);
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-title {
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.dropdown-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.dropdown-item:hover .dropdown-title {
  color: #3b82f6;
}

/* Backdrop for active dropdowns */
.nav-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(34, 48, 82, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 150;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.nav-backdrop.active {
  opacity: 1;
  visibility: visible;
}

.nav-center .login-link {
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
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
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e40af;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  padding: 16px 0;
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
  background: #F8FAFC;
  border-radius: 8px;
}

.mobile-dropdown.active {
  max-height: 1000px;
  margin-bottom: 8px;
}

.mobile-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.mobile-item-icon {
  font-size: 18px;
  color: #1e40af;
}

.mobile-item-info {
  display: flex;
  flex-direction: column;
}

.mobile-item-title {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.mobile-item-desc {
  color: #64748b;
  font-size: 11px;
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

  .dropdown {
    width: 700px;
  }
}

@media (max-width: 1024px) {
  .navbar {
    padding: 14px 24px;
  }
  
  .nav-center {
    gap: 12px;
  }
  
  .nav-link {
    font-size: 13px;
    padding: 8px 12px;
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
}
`

function Navbar({ onLoginClick, onNavigateToProduct, onLogoClick, onNavigateToCompany, onNavigateToSolution, onNavigateToEthics, onNavigateToTechnology }) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdowns, setMobileDropdowns] = useState({})
  const dropdownRefs = useRef({})
  const mobileMenuRef = useRef(null)
  const mobileMenuBtnRef = useRef(null)
  const clickTimeoutRef = useRef(null)
  const clickedDropdownRef = useRef(null)

  const productsItems = [
    { title: 'Visual AI Agents', desc: 'AI teaching avatars', icon: <FiCpu /> },
    { title: 'Creative Reality™ Studio', desc: 'AI video studio', icon: <FiPlayCircle /> },
    { title: 'Video Translate', desc: 'Multilingual video', icon: <FiGlobe /> },
    { title: 'Video Campaigns', desc: 'Marketing videos', icon: <FiTrendingUp /> },
    { title: 'Personal Avatars', desc: 'Digital instructors', icon: <FiUserCheck /> }
  ]

  const solutionsItems = [
    { title: 'Marketing Suite', desc: 'Campaign automation', icon: <FiBriefcase /> },
    { title: 'Sales Solutions', desc: 'Video outreach', icon: <FiDollarSign /> },
    { title: 'Customer Experience', desc: 'Customer engagement', icon: <FiUsers /> },
    { title: 'Learning & Development', desc: 'Corporate training', icon: <FiBookOpen /> },
    { title: 'AI Videos', desc: 'Automated communication', icon: <FiMail /> }
  ]

  const companyItems = [
    { title: 'About Us', desc: 'Company overview', icon: <FiInfo /> },
    { title: 'Blog', desc: 'Insights articles', icon: <FiFileText /> },
    { title: 'News', desc: 'Platform updates', icon: <FiRss /> },
    { title: 'Resources', desc: 'Learning materials', icon: <FiLayers /> },
    { title: 'Privacy Policy', desc: 'Data protection', icon: <FiShield /> },
    { title: 'Help Center', desc: 'Customer support', icon: <FiHelpCircle /> }
  ]

  const handleCompanyItemClick = (item) => {
    if (onNavigateToCompany) {
      onNavigateToCompany(item)
    }
    setActiveDropdown(null)
    setMobileMenuOpen(false)
  }

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
        clickedDropdownRef.current = null
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
      <div className={`nav-backdrop ${activeDropdown ? 'active' : ''}`} />
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
          {/* Pill group for nav links */}
          <div className="nav-pills-group">
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
                if (clickedDropdownRef.current !== 'products') {
                  setActiveDropdown(null)
                }
              }}
            >
              <a
                href="#"
                className={`nav-link ${activeDropdown === 'products' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  if (clickTimeoutRef.current) {
                    clearTimeout(clickTimeoutRef.current)
                  }
                  clickedDropdownRef.current = 'products'
                  setActiveDropdown('products')
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
                      if (clickTimeoutRef.current) {
                        clearTimeout(clickTimeoutRef.current)
                        clickTimeoutRef.current = null
                      }
                      clickedDropdownRef.current = null
                      if (onNavigateToProduct) {
                        onNavigateToProduct(item.title)
                      }
                      setActiveDropdown(null)
                    }}
                  >
                    <div className="dropdown-icon">{item.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{item.title}</div>
                      <div className="dropdown-desc">{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div
              className="nav-link-wrapper"
              ref={el => dropdownRefs.current.solutions = el}
              onMouseEnter={() => {
                if (clickTimeoutRef.current) {
                  clearTimeout(clickTimeoutRef.current)
                  clickTimeoutRef.current = null
                }
                setActiveDropdown('solutions')
              }}
              onMouseLeave={() => {
                if (clickedDropdownRef.current !== 'solutions') {
                  setActiveDropdown(null)
                }
              }}
            >
              <a
                href="#"
                className={`nav-link ${activeDropdown === 'solutions' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  if (clickTimeoutRef.current) {
                    clearTimeout(clickTimeoutRef.current)
                  }
                  clickedDropdownRef.current = 'solutions'
                  setActiveDropdown('solutions')
                }}
              >
                Solutions
                <MdKeyboardArrowDown />
              </a>
              <div className={`dropdown ${activeDropdown === 'solutions' ? 'active' : ''}`}>
                {solutionsItems.map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault()
                      if (clickTimeoutRef.current) {
                        clearTimeout(clickTimeoutRef.current)
                        clickTimeoutRef.current = null
                      }
                      clickedDropdownRef.current = null
                      if (onNavigateToSolution) {
                        onNavigateToSolution(item.title)
                      }
                      setActiveDropdown(null)
                    }}
                  >
                    <div className="dropdown-icon">{item.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{item.title}</div>
                      <div className="dropdown-desc">{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateToTechnology) {
                  onNavigateToTechnology()
                }
              }}
            >
              Technology
            </a>

            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateToTechnology) {
                  onNavigateToTechnology()
                }
              }}
            >
              Use Cases
            </a>

            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateToEthics) {
                  onNavigateToEthics()
                }
              }}
            >
              Ethics
            </a>

            <a href="#" className="nav-link">Pricing</a>

            <div
              className="nav-link-wrapper"
              ref={el => dropdownRefs.current.company = el}
              onMouseEnter={() => {
                if (clickTimeoutRef.current) {
                  clearTimeout(clickTimeoutRef.current)
                  clickTimeoutRef.current = null
                }
                setActiveDropdown('company')
              }}
              onMouseLeave={() => {
                if (clickedDropdownRef.current !== 'company') {
                  setActiveDropdown(null)
                }
              }}
            >
              <a
                href="#"
                className={`nav-link ${activeDropdown === 'company' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  if (clickTimeoutRef.current) {
                    clearTimeout(clickTimeoutRef.current)
                  }
                  clickedDropdownRef.current = 'company'
                  setActiveDropdown('company')
                }}
              >
                Company
                <MdKeyboardArrowDown />
              </a>
              <div className={`dropdown ${activeDropdown === 'company' ? 'active' : ''}`}>
                {companyItems.map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault()
                      if (clickTimeoutRef.current) {
                        clearTimeout(clickTimeoutRef.current)
                        clickTimeoutRef.current = null
                      }
                      handleCompanyItemClick(item.title)
                    }}
                  >
                    <div className="dropdown-icon">{item.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{item.title}</div>
                      <div className="dropdown-desc">{item.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Separator between nav pill group and auth buttons */}
          <div className="nav-divider" />

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

          <button className="btn-primary" style={{ marginLeft: '8px' }}>
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
            if (onLogoClick) {
              onLogoClick()
            }
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
                  onNavigateToProduct(item.title)
                }
              }}
            >
              <div className="mobile-item-icon">{item.icon}</div>
              <div className="mobile-item-info">
                <span className="mobile-item-title">{item.title}</span>
                <span className="mobile-item-desc">{item.desc}</span>
              </div>
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
              onClick={(e) => {
                e.preventDefault()
                handleMobileActionClick()
                if (onNavigateToSolution) {
                  onNavigateToSolution(item.title)
                }
              }}
            >
              <div className="mobile-item-icon">{item.icon}</div>
              <div className="mobile-item-info">
                <span className="mobile-item-title">{item.title}</span>
                <span className="mobile-item-desc">{item.desc}</span>
              </div>
            </a>
          ))}
        </div>

        <a
          href="#"
          className="mobile-nav-link"
          onClick={(e) => {
            e.preventDefault()
            handleMobileActionClick()
            if (onNavigateToTechnology) {
              onNavigateToTechnology()
            }
          }}
        >
          Technology
        </a>

        <a
          href="#"
          className="mobile-nav-link"
          onClick={(e) => {
            e.preventDefault()
            setMobileMenuOpen(false)
            if (onNavigateToEthics) {
              onNavigateToEthics()
            }
          }}
        >
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
              onClick={(e) => {
                e.preventDefault()
                handleCompanyItemClick(item.title)
              }}
            >
              <div className="mobile-item-icon">{item.icon}</div>
              <div className="mobile-item-info">
                <span className="mobile-item-title">{item.title}</span>
                <span className="mobile-item-desc">{item.desc}</span>
              </div>
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
