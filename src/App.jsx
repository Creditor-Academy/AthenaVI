import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import CustomerExperience from './pages/CustomerExperience.jsx'
import ResetPassword from './components/authentication/ResetPassword.jsx'
import Settings from './pages/Settings.jsx'
import UseCases from './pages/UseCases.jsx'
import InviteAcceptance from './pages/InviteAcceptance.jsx'

// Protected Route Component
const ProtectedRoute = ({ children, view, setView }) => {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to landing page if not authenticated
      setView('landing')
    }
  }, [isAuthenticated, loading, setView])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'white',
        position: 'relative'
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f1f5f9',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Loading...
          </div>
          <div style={{
            color: '#64748b',
            fontSize: '14px'
          }}>
            Please wait
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return children
}

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

// App Component with Auth Protection
function App() {
  // Initialize view from localStorage on mount to persist page on refresh
  const [view, setView] = useState(() => {
    // Check if current URL matches a known route
    const pathToViewMap = {
      '/': 'landing',
      '/dashboard': 'dashboard',
      '/dashboard/videos': 'dashboard',
      '/dashboard/avatars': 'dashboard',
      '/dashboard/templates': 'dashboard',
      '/dashboard/library': 'dashboard',
      '/dashboard/team-workspace': 'dashboard',
      '/dashboard/admin-portal': 'dashboard',
      '/dashboard/settings': 'dashboard',
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
      '/technology': 'technology',
      '/use-cases': 'use-cases',
      '/customer-experience': 'customer-experience',
      '/settings': 'settings'
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
      'technology': '/technology',
      'use-cases': '/use-cases',
      'customer-experience': '/customer-experience',
      'settings': '/settings'
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
        '/dashboard/videos': 'dashboard',
        '/dashboard/avatars': 'dashboard',
        '/dashboard/templates': 'dashboard',
        '/dashboard/library': 'dashboard',
        '/dashboard/team-workspace': 'dashboard',
        '/dashboard/admin-portal': 'dashboard',
        '/dashboard/settings': 'dashboard',
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
        '/technology': 'technology',
        '/use-cases': 'use-cases',
        '/customer-experience': 'customer-experience',
        '/settings': 'settings'
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

  // Handle URL-based routing for reset password and invite acceptance
  useEffect(() => {
    const currentPath = window.location.pathname
    if (currentPath.includes('/reset-password') || currentPath.includes('/invite/accept')) {
      // Don't show auth modal, let reset password or invite acceptance component handle it
      return
    }
  }, [])

  // Inject auth styles into document head
  useEffect(() => {
    if (window.location.pathname.includes('/reset-password') || window.location.pathname.includes('/invite/accept')) {
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

      {/* Invite Acceptance Page - Standalone */}
      {window.location.pathname.includes('/invite/accept') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 2002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <InviteAcceptance />
        </div>
      )}

      {/* Protected Routes */}
      {view === 'create' && (
        <ProtectedRoute view={view} setView={setView}>
          <Create onBack={() => setView('dashboard')} />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </ProtectedRoute>
      )}

      {view === 'dashboard' && (
        <ProtectedRoute view={view} setView={setView}>
          <Dashboard
            onLogout={() => {
              // AuthContext will handle logout
              setView('landing')
            }}
            onCreate={() => setView('create')}
            initialSection={(() => {
              // Pass the initial section from URL to Dashboard
              const currentPath = window.location.pathname
              if (currentPath.startsWith('/dashboard/')) {
                return currentPath.replace('/dashboard/', '') || 'home'
              }
              return 'home'
            })()}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </ProtectedRoute>
      )}

      {view === 'settings' && (
        <ProtectedRoute view={view} setView={setView}>
          <Settings onBack={() => setView('dashboard')} />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </ProtectedRoute>
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
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
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'use-cases' && (
        <>
          <UseCases 
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {view === 'customer-experience' && (
        <>
          <CustomerExperience 
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
          {showAuthModal && (
            <Auth 
              onAuthComplete={handleAuthComplete}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      )}

      {!['create', 'dashboard', 'products', 'about-us-blog', 'news', 'resources', 'help-center', 'privacy-policy', 'technology', 'ethics', 'marketing-suite', 'sales-suite', 'use-cases', 'customer-experience'].includes(view) && (
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
              } else if (solution === 'Customer Experience') {
                setView('customer-experience')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
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
