import { useEffect, useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'
import Products from './pages/Products.jsx'
import AboutUsBlog from './pages/AboutUsBlog.jsx'
import News from './pages/News.jsx'
import Resources from './pages/Resources.jsx'
import HelpCenter from './pages/HelpCenter.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import MarketingSuite from './pages/MarketingSuite.jsx'
import SalesSuite from './pages/SalesSuite.jsx'
import Ethics from './pages/Ethics.jsx'
import Technology from './pages/Technology.jsx'
import ResetPassword from './components/authentication/ResetPassword.jsx'

// Import auth styles from Auth.jsx
const authStyles = `
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 20px;
}

.auth-form-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.auth-form-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.auth-input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.auth-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  background: #f9fafb;
}

.auth-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
}

.auth-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 18px;
}

.auth-password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.auth-password-toggle:hover {
  color: #3b82f6;
}

.auth-submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
`

function App() {
  // Initialize view from localStorage on mount to persist page on refresh
  const [view, setView] = useState(() => {
    // Check if current URL matches a known route
    const pathToViewMap = {
      '/': 'landing',
      '/dashboard': 'dashboard',
      '/create': 'create',
      '/products': 'products',
      '/about-us': 'about-us-blog',
      '/news': 'news',
      '/resources': 'resources',
      '/help': 'help-center',
      '/privacy': 'privacy-policy',
      '/marketing-suite': 'marketing-suite',
      '/sales-suite': 'sales-suite',
      '/ethics': 'ethics',
      '/technology': 'technology'
    }
    
    // Get current path (handle both hash and regular routing)
    let currentPath = window.location.pathname
    
    // If hash routing is being used, extract from hash
    if (window.location.hash && window.location.hash !== '#') {
      currentPath = window.location.hash.replace('#', '') || '/'
    }
    
    const urlView = pathToViewMap[currentPath]
    
    if (urlView) {
      return urlView
    }
    
    // Fallback to localStorage
    const savedView = window.localStorage.getItem('athenavi:view')
    return savedView || 'landing'
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [productSection, setProductSection] = useState(null)

  // Save view to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('athenavi:view', view)
    
    // Update browser URL to reflect current view
    const urlMap = {
      'landing': '/',
      'dashboard': '/dashboard',
      'create': '/create',
      'products': '/products',
      'about-us-blog': '/about-us',
      'news': '/news',
      'resources': '/resources',
      'help-center': '/help',
      'privacy-policy': '/privacy',
      'marketing-suite': '/marketing-suite',
      'sales-suite': '/sales-suite',
      'ethics': '/ethics',
      'technology': '/technology'
    }
    
    const newUrl = urlMap[view] || '/'
    
    // Try to use pushState first (clean URLs)
    try {
      if (window.location.pathname !== newUrl) {
        window.history.pushState({ view }, '', newUrl)
      }
    } catch (error) {
      // Fallback to hash routing if pushState fails
      if (window.location.hash !== `#${newUrl}`) {
        window.location.hash = newUrl
      }
    }
    
    if (view === 'dashboard' || view === 'create') {
      window.localStorage.setItem('athenavi:authenticated', 'true')
    } else if (view === 'landing') {
      // Clear authentication state when showing landing page
      window.localStorage.removeItem('athenavi:authenticated')
    }
  }, [view])

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const pathToViewMap = {
        '/': 'landing',
        '/dashboard': 'dashboard',
        '/create': 'create',
        '/products': 'products',
        '/about-us': 'about-us-blog',
        '/news': 'news',
        '/resources': 'resources',
        '/help': 'help-center',
        '/privacy': 'privacy-policy',
        '/marketing-suite': 'marketing-suite',
        '/sales-suite': 'sales-suite',
        '/ethics': 'ethics',
        '/technology': 'technology'
      }
      
      const currentPath = window.location.pathname
      const urlView = pathToViewMap[currentPath]
      
      if (urlView) {
        setView(urlView)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleAuthComplete = () => {
    window.localStorage.setItem('athenavi:authenticated', 'true')
    setShowAuthModal(false)
    setView('dashboard')
  }

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleNavigateToCompany = (item) => {
    const companyPageMap = {
      'About Us': 'about-us-blog',
      'Blog': 'about-us-blog',
      'News': 'news',
      'Resources': 'resources',
      'Privacy Policy': 'privacy-policy',
      'Help Center': 'help-center'
    }
    
    const page = companyPageMap[item]
    if (page) {
      setView(page)
    }
  }

  // Handle URL-based routing for reset password
  useEffect(() => {
    const currentPath = window.location.pathname
    if (currentPath.includes('/reset-password')) {
      // Don't show auth modal, let reset password component handle it
      return
    }
  }, [])

  // Inject auth styles into document head
  useEffect(() => {
    if (window.location.pathname.includes('/reset-password')) {
      const styleElement = document.createElement('style')
      styleElement.textContent = authStyles
      document.head.appendChild(styleElement)
      
      return () => {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  return (
    <AuthProvider>
      {/* Reset Password Page - Standalone */}
      {window.location.pathname.includes('/reset-password') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 2001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '450px',
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <ResetPassword />
          </div>
        </div>
      )}

      {view === 'create' && (
        <>
          <Create onBack={() => setView('dashboard')} />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'dashboard' && (
        <>
          <Dashboard
            onLogout={() => {
              window.localStorage.removeItem('athenavi:authenticated')
              window.localStorage.removeItem('athenavi:view')
              setView('landing')
            }}
            onCreate={() => setView('create')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'products' && (
        <>
          <Products 
            onLoginClick={handleLoginClick}
            initialSection={productSection}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              // Already on products page, just scroll to section
              setTimeout(() => {
                const sectionMap = {
                  'Visual AI Agents': 'visual-ai-agents',
                  'Creative Reality™ Studio': 'creative-reality-studio',
                  'Video Translate': 'video-translate',
                  'Video Campaigns': 'video-campaigns',
                  'Personal Avatars': 'personal-avatars'
                }
                const sectionId = sectionMap[section]
                if (sectionId) {
                  const element = document.getElementById(sectionId)
                  if (element) {
                    const navHeight = 80
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })
                  }
                }
              }, 100)
            }}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'about-us-blog' && (
        <>
          <AboutUsBlog 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'news' && (
        <>
          <News 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'resources' && (
        <>
          <Resources 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'help-center' && (
        <>
          <HelpCenter 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'privacy-policy' && (
        <>
          <PrivacyPolicy 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'technology' && (
        <>
          <Technology 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'ethics' && (
        <>
          <Ethics 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'marketing-suite' && (
        <>
          <MarketingSuite 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'sales-suite' && (
        <>
          <SalesSuite 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {!['create', 'dashboard', 'products', 'about-us-blog', 'news', 'resources', 'help-center', 'privacy-policy', 'technology', 'ethics', 'marketing-suite', 'sales-suite'].includes(view) && (
        <>
          <Landing 
            onLoginClick={handleLoginClick}
            onNavigateToProduct={(section) => {
              setProductSection(section)
              setView('products')
            }}
            onNavigateToSolution={(solution) => {
              if (solution === 'Marketing Suite') {
                setView('marketing-suite')
              } else if (solution === 'Sales Solutions') {
                setView('sales-suite')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}
    </AuthProvider>
  )
}

export default App
