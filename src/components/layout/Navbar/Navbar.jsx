import { useState, useEffect, useRef } from 'react'
import { MdKeyboardArrowDown, MdArrowOutward, MdMenu, MdClose } from 'react-icons/md'
import {
  FiCpu, FiPlayCircle, FiGlobe, FiTrendingUp, FiUserCheck,
  FiBriefcase, FiDollarSign, FiUsers, FiBookOpen, FiMail,
  FiInfo, FiFileText, FiRss, FiLayers, FiShield, FiHelpCircle
} from 'react-icons/fi'
import ProductVideo from '../../../assets/ProductVideo.mp4'
import LogoImg from '../../../assets/herologo.png'

/* ─────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────── */
const styles = `

/* ── Floating pill container ── */
.navbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  width: calc(100% - 32px);
  max-width: 1320px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 20px;
  height: 60px;
  background: rgba(8, 14, 30, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  gap: 0;
}

/* ── Logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  cursor: pointer;
}

.nav-logo-img {
  height: 46px;
  width: auto;
  object-fit: contain;
  display: block;
}

/* ── Centre nav links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-btn {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(203, 213, 225, 0.9);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 999px;
  transition: color 0.18s ease, background 0.18s ease;
  white-space: nowrap;
  letter-spacing: 0.01em;
  line-height: 1;
  height: 36px;
  box-sizing: border-box;
}

.nav-btn:hover,
.nav-btn.open {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.07);
}

.nav-btn svg.chevron {
  font-size: 16px;
  opacity: 0.7;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease;
}

.nav-btn.open svg.chevron {
  transform: rotate(180deg);
  opacity: 1;
}

/* plain link variant (Pricing, Use Cases) */
.nav-plain {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(203, 213, 225, 0.9);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 999px;
  text-decoration: none;
  transition: color 0.18s ease, background 0.18s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
  line-height: 1;
}

.nav-plain:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.07);
}

/* ── Dropdown panel ── */
.nav-dropdown {
  position: fixed;
  top: 76px;
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  background: linear-gradient(160deg, #0d1526 0%, #0a1020 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3);
  padding: 8px;
  min-width: 240px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.22s ease, visibility 0.22s ease, transform 0.22s cubic-bezier(0.4,0,0.2,1);
  z-index: 600;
}

.nav-dropdown.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

/* bridge gap so mouse can move from button to panel */
.nav-dropdown::before {
  content: '';
  position: absolute;
  top: -14px;
  left: 0;
  right: 0;
  height: 14px;
  background: transparent;
}

/* ── Products mega dropdown ── */
.nav-dropdown.mega {
  left: 50%;
  min-width: 780px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 0;
  padding: 0;
  overflow: hidden;
  border-radius: 18px;
}

.mega-left {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  align-content: start;
}

.mega-right {
  background: rgba(255, 255, 255, 0.025);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mega-video {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
}

.mega-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mega-video-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mega-video-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.55;
  margin-top: -6px;
}

.mega-see-all {
  margin-top: auto;
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  transition: gap 0.2s ease;
  cursor: pointer;
}

.mega-see-all:hover { gap: 8px; }

/* ── Dropdown item ── */
.dd-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s ease;
}

.dd-item:hover { background: rgba(255, 255, 255, 0.05); }

.dd-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 16px;
  transition: background 0.18s ease, color 0.18s ease;
}

.dd-item:hover .dd-icon {
  background: #3b82f6;
  color: #fff;
}

.dd-text {}
.dd-title {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.3;
  transition: color 0.18s ease;
}
.dd-item:hover .dd-title { color: #60a5fa; }
.dd-desc {
  font-size: 11.5px;
  color: #475569;
  margin-top: 2px;
  line-height: 1.4;
}

/* simple column dropdown (solutions, company) */
.dd-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Right CTA group ── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-left: 8px;
}

.login-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.25);
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.login-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.35);
}

.act-primary {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #020617;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 100%);
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(255,179,0,0.3);
  transition: all 0.18s ease;
}

.act-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,179,0,0.42);
}

/* Hamburger */
.nav-ham {
  display: none;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f1f5f9;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.nav-ham:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

/* ── Overlay backdrop ── */
.nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(3px);
  z-index: 490;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.nav-overlay.show {
  display: block;
  opacity: 1;
  pointer-events: auto;
}

/* ── Mobile drawer ── */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(380px, 90vw);
  background: #0a1020;
  border-left: 1px solid rgba(255,255,255,0.07);
  z-index: 510;
  transform: translateX(100%);
  transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto;
  padding: 24px 20px;
  box-sizing: border-box;
}

.mobile-drawer.open {
  transform: translateX(0);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.drawer-close {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.18s ease;
}

.drawer-close:hover {
  background: rgba(255,255,255,0.1);
  transform: rotate(90deg);
}

.drawer-section {
  margin-bottom: 6px;
}

.drawer-nav-btn {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 13px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  text-decoration: none;
  transition: color 0.18s ease;
}

.drawer-nav-btn:hover { color: #fff; }

.drawer-nav-btn svg.chevron {
  font-size: 16px;
  opacity: 0.6;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.drawer-nav-btn.open svg.chevron {
  transform: rotate(180deg);
  opacity: 1;
}

.drawer-sub {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.drawer-sub.open { max-height: 1200px; }

.drawer-sub-inner {
  padding: 8px 0 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-sub-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s ease;
}

.drawer-sub-item:hover { background: rgba(255,255,255,0.04); }

.drawer-sub-icon {
  font-size: 15px;
  color: #60a5fa;
  flex-shrink: 0;
}

.drawer-sub-title {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.drawer-sub-desc {
  font-size: 11px;
  color: #475569;
}

.drawer-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-actions .act-ghost,
.drawer-actions .act-primary {
  width: 100%;
  justify-content: center;
  border-radius: 12px;
  padding: 13px 20px;
  font-size: 14px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .nav-links { gap: 0; }
  .nav-btn, .nav-plain { font-size: 13px; padding: 8px 11px; }
  .act-ghost { display: none; }
}

@media (max-width: 860px) {
  .nav-links, .nav-actions { display: none; }
  .nav-ham { display: flex; }
  .navbar { height: 56px; padding: 0 8px 0 16px; }
  .nav-logo-img { height: 32px; }
}

@media (max-width: 480px) {
  .navbar { width: calc(100% - 20px); top: 10px; }
}

`

/* ─────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────── */
function Navbar({
  onLoginClick,
  onNavigateToProduct,
  onLogoClick,
  onNavigateToCompany,
  onNavigateToSolution,
  onNavigateToEthics,
  onNavigateToTechnology,
  onNavigateToUseCases,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSubs, setDrawerSubs] = useState({})

  const wrapperRefs = useRef({})
  const closeTimer = useRef(null)

  /* ── helpers ── */
  const openDD = (name) => { clearTimeout(closeTimer.current); setActiveDropdown(name) }
  const closeDD = () => { closeTimer.current = setTimeout(() => setActiveDropdown(null), 120) }
  const keepDD = () => clearTimeout(closeTimer.current)

  const toggleDrawerSub = (key) =>
    setDrawerSubs(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') { setActiveDropdown(null); setDrawerOpen(false) } }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  /* ── data ── */
  const productsItems = [
    { title: 'Visual AI Agents', desc: 'AI teaching avatars', icon: <FiCpu /> },
    { title: 'Creative Reality™ Studio', desc: 'AI video studio', icon: <FiPlayCircle /> },
    { title: 'Video Translate', desc: 'Multilingual video', icon: <FiGlobe /> },
    { title: 'Video Campaigns', desc: 'Marketing videos', icon: <FiTrendingUp /> },
    { title: 'Personal Avatars', desc: 'Digital instructors', icon: <FiUserCheck /> },
    { title: 'AI Avatars & Videos', desc: 'AI avatars and video demos', icon: <FiPlayCircle /> },
    { title: 'Technology', desc: 'Technology overview', icon: <FiCpu /> },
  ]

  const solutionsItems = [
    { title: 'Marketing Suite', desc: 'Campaign automation', icon: <FiBriefcase /> },
    { title: 'Sales Solutions', desc: 'Video outreach', icon: <FiDollarSign /> },
    { title: 'Customer Experience', desc: 'Customer engagement', icon: <FiUsers /> },
    { title: 'Learning & Development', desc: 'Corporate training', icon: <FiBookOpen /> },
    { title: 'AI Videos', desc: 'Automated comms', icon: <FiMail /> },
  ]

  const companyItems = [
    { title: 'About Us', desc: 'Company overview', icon: <FiInfo /> },
    { title: 'Blog', desc: 'Insights & articles', icon: <FiFileText /> },
    { title: 'News', desc: 'Platform updates', icon: <FiRss /> },
    { title: 'Ethics', desc: 'AI Ethics pledge', icon: <FiShield /> },
    { title: 'Resources', desc: 'Learning materials', icon: <FiLayers /> },
    { title: 'Privacy Policy', desc: 'Data protection', icon: <FiShield /> },
    { title: 'Help Center', desc: 'Customer support', icon: <FiHelpCircle /> },
  ]

  /* ── item click dispatcher ── */
  const handleProductClick = (title) => {
    if (title === 'Technology') { if (onNavigateToTechnology) onNavigateToTechnology() }
    else if (onNavigateToProduct) onNavigateToProduct(title)
    setActiveDropdown(null); setDrawerOpen(false)
  }

  const handleSolutionClick = (title) => {
    if (onNavigateToSolution) onNavigateToSolution(title)
    setActiveDropdown(null); setDrawerOpen(false)
  }

  const handleCompanyClick = (title) => {
    if (title === 'Ethics') { if (onNavigateToEthics) onNavigateToEthics() }
    else if (onNavigateToCompany) onNavigateToCompany(title)
    setActiveDropdown(null); setDrawerOpen(false)
  }

  /* ── reusable desktop dropdown item ── */
  const DDItem = ({ item, onClick }) => (
    <a
      href="#"
      className="dd-item"
      onClick={(e) => { e.preventDefault(); onClick(item.title) }}
    >
      <div className="dd-icon">{item.icon}</div>
      <div className="dd-text">
        <div className="dd-title">{item.title}</div>
        <div className="dd-desc">{item.desc}</div>
      </div>
    </a>
  )

  /* ── reusable drawer sub item ── */
  const DrawerItem = ({ item, onClick }) => (
    <a
      href="#"
      className="drawer-sub-item"
      onClick={(e) => { e.preventDefault(); onClick(item.title) }}
    >
      <span className="drawer-sub-icon">{item.icon}</span>
      <div>
        <div className="drawer-sub-title">{item.title}</div>
        <div className="drawer-sub-desc">{item.desc}</div>
      </div>
    </a>
  )

  return (
    <>
      <style>{styles}</style>

      {/* ── Floating Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">

        {/* Logo */}
        <a
          href="#"
          className="nav-logo"
          onClick={(e) => { e.preventDefault(); setDrawerOpen(false); if (onLogoClick) onLogoClick() }}
          aria-label="Home"
        >
          <img src={LogoImg} alt="Logo" className="nav-logo-img" />
        </a>

        {/* Centre links (desktop) */}
        <div className="nav-links">

          {/* Products */}
          <button
            className={`nav-btn ${activeDropdown === 'products' ? 'open' : ''}`}
            onMouseEnter={() => openDD('products')}
            onMouseLeave={closeDD}
            onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
            aria-expanded={activeDropdown === 'products'}
          >
            Products <MdKeyboardArrowDown className="chevron" />
          </button>
          <div
            className={`nav-dropdown mega ${activeDropdown === 'products' ? 'open' : ''}`}
            onMouseEnter={keepDD}
            onMouseLeave={closeDD}
          >
            <div className="mega-left">
              {productsItems.map((item, i) => (
                <DDItem key={i} item={item} onClick={handleProductClick} />
              ))}
            </div>
            <div className="mega-right">
              <div className="mega-video">
                <video autoPlay muted loop playsInline>
                  <source src={ProductVideo} type="video/mp4" />
                </video>
              </div>
              <div className="mega-video-title">
                Translate audio &amp; captions <MdArrowOutward />
              </div>
              <p className="mega-video-desc">
                Save time and money on localisation with AI‑powered video translation.
              </p>
              <a href="#" className="mega-see-all" onClick={(e) => { e.preventDefault(); if (onNavigateToTechnology) onNavigateToTechnology(); setActiveDropdown(null) }}>
                See all Technology <MdArrowOutward />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <button
            className={`nav-btn ${activeDropdown === 'solutions' ? 'open' : ''}`}
            onMouseEnter={() => openDD('solutions')}
            onMouseLeave={closeDD}
            onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
            aria-expanded={activeDropdown === 'solutions'}
          >
            Solutions <MdKeyboardArrowDown className="chevron" />
          </button>
          <div
            className={`nav-dropdown ${activeDropdown === 'solutions' ? 'open' : ''}`}
            onMouseEnter={keepDD}
            onMouseLeave={closeDD}
          >
            <div className="dd-list">
              {solutionsItems.map((item, i) => (
                <DDItem key={i} item={item} onClick={handleSolutionClick} />
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <a
            href="#"
            className="nav-plain"
            onClick={(e) => { e.preventDefault(); if (onNavigateToUseCases) onNavigateToUseCases() }}
          >
            Use Cases
          </a>

          {/* Pricing */}
          {/* <a href="#" className="nav-plain" onClick={(e) => e.preventDefault()}>Pricing</a> */}

          {/* Company */}
          {/* 
          <button
            className={`nav-btn ${activeDropdown === 'company' ? 'open' : ''}`}
            onMouseEnter={() => openDD('company')}
            onMouseLeave={closeDD}
            onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
            aria-expanded={activeDropdown === 'company'}
          >
            Company <MdKeyboardArrowDown className="chevron" />
          </button>
          <div
            className={`nav-dropdown ${activeDropdown === 'company' ? 'open' : ''}`}
            onMouseEnter={keepDD}
            onMouseLeave={closeDD}
          >
            <div className="dd-list">
              {companyItems.map((item, i) => (
                <DDItem key={i} item={item} onClick={handleCompanyClick} />
              ))}
            </div>
          </div>
          */}

        </div>

        {/* Right CTA */}
        <div className="nav-actions">
          <a
            href="#"
            className="login-link"
            onClick={(e) => { e.preventDefault(); if (onLoginClick) onLoginClick() }}
          >
            Log in
          </a>
          <a
            href="/early-access"
            className="act-primary"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({ view: 'early-access' }, '', '/early-access');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Request Early Access <MdArrowOutward />
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="nav-ham"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <MdMenu />
        </button>
      </nav>

      {/* ── Mobile overlay ── */}
      <div
        className={`nav-overlay ${drawerOpen ? 'show' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ── */}
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>

        {/* Drawer header */}
        <div className="drawer-head">
          <img src={LogoImg} alt="Logo" style={{ height: 32, width: 'auto' }} />
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <MdClose />
          </button>
        </div>

        {/* Products */}
        <div className="drawer-section">
          <button
            className={`drawer-nav-btn ${drawerSubs.products ? 'open' : ''}`}
            onClick={() => toggleDrawerSub('products')}
          >
            Products <MdKeyboardArrowDown className="chevron" />
          </button>
          <div className={`drawer-sub ${drawerSubs.products ? 'open' : ''}`}>
            <div className="drawer-sub-inner">
              {productsItems.map((item, i) => (
                <DrawerItem key={i} item={item} onClick={handleProductClick} />
              ))}
            </div>
          </div>
        </div>

        {/* Solutions */}
        <div className="drawer-section">
          <button
            className={`drawer-nav-btn ${drawerSubs.solutions ? 'open' : ''}`}
            onClick={() => toggleDrawerSub('solutions')}
          >
            Solutions <MdKeyboardArrowDown className="chevron" />
          </button>
          <div className={`drawer-sub ${drawerSubs.solutions ? 'open' : ''}`}>
            <div className="drawer-sub-inner">
              {solutionsItems.map((item, i) => (
                <DrawerItem key={i} item={item} onClick={handleSolutionClick} />
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="drawer-section">
          <a
            href="#"
            className="drawer-nav-btn"
            onClick={(e) => { e.preventDefault(); if (onNavigateToUseCases) onNavigateToUseCases(); setDrawerOpen(false) }}
          >
            Use Cases
          </a>
        </div>

        {/* Pricing */}
        <div className="drawer-section">
          <a href="#" className="drawer-nav-btn" onClick={(e) => { e.preventDefault(); setDrawerOpen(false) }}>
            Pricing
          </a>
        </div>

        {/* Company */}
        {/* 
        <div className="drawer-section">
          <button
            className={`drawer-nav-btn ${drawerSubs.company ? 'open' : ''}`}
            onClick={() => toggleDrawerSub('company')}
          >
            Company <MdKeyboardArrowDown className="chevron" />
          </button>
          <div className={`drawer-sub ${drawerSubs.company ? 'open' : ''}`}>
            <div className="drawer-sub-inner">
              {companyItems.map((item, i) => (
                <DrawerItem key={i} item={item} onClick={handleCompanyClick} />
              ))}
            </div>
          </div>
        </div>
        */}

        {/* Actions */}
        <div className="drawer-actions">
          <a
            href="#"
            className="login-link"
            onClick={(e) => { e.preventDefault(); setDrawerOpen(false); if (onLoginClick) onLoginClick() }}
          >
            Log in
          </a>
          <a 
            href="/early-access" 
            className="act-primary" 
            onClick={(e) => { 
              e.preventDefault(); 
              setDrawerOpen(false);
              window.history.pushState({ view: 'early-access' }, '', '/early-access');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Request Early Access <MdArrowOutward />
          </a>
        </div>
      </aside>
    </>
  )
}

export default Navbar
