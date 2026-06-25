import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Landing from './pages/Landing/Landing.jsx'
import AuthPage from './pages/Auth/AuthPage.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Create from './pages/Editor/Editor.jsx'
import Products from './pages/Products/Products.jsx'
import AboutUsBlog from './pages/AboutUs/AboutUs.jsx'
import News from './pages/News/News.jsx'
import Resources from './pages/Resources/Resources.jsx'
import HelpCenter from './pages/HelpCenter/HelpCenter.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy.jsx'
import MarketingSuite from './pages/MarketingSuite/MarketingSuite.jsx'
import SalesSuite from './pages/SalesSuite/SalesSuite.jsx'
import Ethics from './pages/Ethics/Ethics.jsx'
import Technology from './pages/Technology/Technology.jsx'
import CustomerExperience from './pages/CustomerExperience/CustomerExperience.jsx'
import LearningDevelopment from './pages/LearningDevelopment/LearningDevelopment.jsx'
import ResetPassword from './components/features/auth/authentication/ResetPassword.jsx'
import Settings from './pages/Settings/Settings.jsx'
import UseCases from './pages/UseCases/UseCases.jsx'
import InviteAcceptance from './pages/InviteAcceptance/InviteAcceptance.jsx'
import AIAvatarsVideos from './pages/AIAvatarsVideos/AIAvatarsVideos.jsx'
import AIVideos from './pages/AIVideos/AIVideos.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import RenderDownload from './pages/Download/RenderDownload.jsx'
import GoogleCallback from './components/features/auth/GoogleCallback.jsx'
import { persistWorkspaceFolderNavigation } from './utils/navigateToWorkspaceFolder.js'
import { isOAuthCallbackPath, resolveViewFromLocation } from './utils/authRouting.js'

const PATH_TO_VIEW_MAP = {
  '/': 'landing',
  '/dashboard': 'dashboard',
  '/dashboard/home': 'dashboard',
  '/dashboard/videos': 'dashboard',
  '/dashboard/avatars': 'dashboard',
  '/dashboard/create-avatar': 'dashboard',
  '/dashboard/templates': 'dashboard',
  '/dashboard/template-details': 'dashboard',
  '/dashboard/library': 'dashboard',
  '/dashboard/workspace': 'dashboard',
  '/dashboard/admin-portal': 'dashboard',
  '/dashboard/settings': 'dashboard',
  '/dashboard/voices': 'dashboard',
  '/dashboard/create-voice': 'dashboard',
  '/dashboard/brandkits': 'dashboard',
  '/dashboard/credits': 'dashboard',
  '/dashboard/help': 'dashboard',
  '/profile': 'dashboard',
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
  '/learning-development': 'learning-development',
  '/settings': 'settings',
  '/ai-videos': 'ai-videos',
  '/ai-avatars-videos': 'ai-avatars-videos',
  '/support': 'dashboard',
  '/download': 'download',
  '/login': 'login',
  '/signup': 'login',
  '/auth/google/callback': 'google-callback',
  '/auth/callback': 'google-callback',
  '/oauth/callback': 'google-callback',
}

// Protected Route Component
const ProtectedRoute = ({ children, setView }) => {
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

// App Component with Auth Protection
function App() {
  const isInviteAcceptancePath =
    window.location.pathname.includes('/invite/accept') ||
    window.location.pathname.includes('/invitations/accept')

  // Initialize view from localStorage on mount to persist page on refresh
  const [view, setView] = useState(() => resolveViewFromLocation(PATH_TO_VIEW_MAP))
  const [productSection, setProductSection] = useState(null)
  const [createVideoConfig, setCreateVideoConfig] = useState(() => {
    try {
      const saved = window.localStorage.getItem('athenavi:createVideoConfig')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync createVideoConfig to localStorage
  useEffect(() => {
    try {
      if (createVideoConfig) {
        window.localStorage.setItem('athenavi:createVideoConfig', JSON.stringify(createVideoConfig))
      } else {
        window.localStorage.removeItem('athenavi:createVideoConfig')
      }
    } catch (e) {
      console.error('Failed to sync createVideoConfig to localStorage', e)
    }
  }, [createVideoConfig])

  // Save view to localStorage whenever it changes
  useEffect(() => {
    if (view === 'not-found' || view === 'google-callback') return

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
      'learning-development': '/learning-development',
      'settings': '/settings',
      'ai-videos': '/ai-videos',
      'ai-avatars-videos': '/ai-avatars-videos',
      'help': '/dashboard/help',
      'download': '/download',
      'login': '/login',
    }
    
    const newUrl = urlMap[view] || '/'
    
    // Don't override the URL on invite acceptance or reset-password paths — the token lives in the path/hash
    const currentPath = window.location.pathname
    const onProtectedPath = currentPath.includes('/invitations/accept') ||
      currentPath.includes('/invite/accept') ||
      currentPath.includes('/reset-password') ||
      isOAuthCallbackPath(currentPath)
    const isDashboardSubPath = currentPath === '/profile' || currentPath.startsWith('/dashboard')
    const targetUrl = (view === 'dashboard' && isDashboardSubPath) ? currentPath : newUrl
    try {
      if (!onProtectedPath && currentPath !== targetUrl) {
        window.history.pushState({ view }, '', targetUrl)
      }
    } catch {
      // Fallback to hash routing if pushState fails
      if (!onProtectedPath && window.location.hash !== `#${targetUrl}`) {
        window.location.hash = targetUrl
      }
    }
  }, [view])

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  // After Google OAuth completes, switch from callback spinner to dashboard
  useEffect(() => {
    const onOAuthComplete = () => setView('dashboard')
    const onOAuthError = () => setView('login')
    window.addEventListener('auth:oauth-complete', onOAuthComplete)
    window.addEventListener('auth:oauth-error', onOAuthError)
    return () => {
      window.removeEventListener('auth:oauth-complete', onOAuthComplete)
      window.removeEventListener('auth:oauth-error', onOAuthError)
    }
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setView(resolveViewFromLocation(PATH_TO_VIEW_MAP))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleAuthComplete = () => {
    setView('dashboard')
  }

  const handleLoginClick = () => {
    setView('login')
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

  const handleNavigateToProduct = (section) => {
    if (section === 'AI Avatars & Videos') {
      setView('ai-avatars-videos')
    } else {
      setProductSection(section)
      setView('products')
    }
  }

  const handleNavigateToSolution = (solution) => {
    const solutionMap = {
      'Marketing Suite': 'marketing-suite',
      'Sales Solutions': 'sales-suite',
      'Customer Experience': 'customer-experience',
      'Learning & Development': 'learning-development',
      'AI Videos': 'ai-videos',
      'AI Avatars & Videos': 'ai-avatars-videos'
    }
    const targetView = solutionMap[solution]
    if (targetView) {
      setView(targetView)
    }
  }

  // Handle URL-based routing for reset password and invite acceptance
  useEffect(() => {
    const currentPath = window.location.pathname
    if (currentPath.includes('/reset-password') || isInviteAcceptancePath) {
      // Don't show auth modal, let reset password or invite acceptance component handle it
      return
    }
  }, [isInviteAcceptancePath])

  return (
    <ThemeProvider>
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
      {isInviteAcceptancePath && (
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
          <Create
            onBack={() => {
              const dashboardPath = persistWorkspaceFolderNavigation(createVideoConfig)
              setCreateVideoConfig(null)
              if (window.location.pathname !== dashboardPath) {
                window.history.pushState({ section: 'workspace' }, '', dashboardPath)
              }
              setView('dashboard')
            }}
            initialConfig={createVideoConfig}
          />
        </ProtectedRoute>
      )}

      {view === 'download' && (
        <ProtectedRoute view={view} setView={setView}>
          <RenderDownload onBack={() => setView('create')} />
        </ProtectedRoute>
      )}

      {view === 'dashboard' && (
        <ProtectedRoute view={view} setView={setView}>
          <Dashboard
            onLogout={() => {
              // AuthContext will handle logout
              setView('landing')
            }}
            onCreate={(config) => {
              setCreateVideoConfig(config || null)
              setView('create')
            }}
            initialSection={(() => {
              // Pass the initial section from URL to Dashboard
              let currentPath = window.location.pathname
              if (window.location.hash && window.location.hash !== '#') {
                currentPath = window.location.hash.replace('#', '') || '/'
                if (currentPath.endsWith('/') && currentPath.length > 1) {
                  currentPath = currentPath.slice(0, -1)
                }
              }
              if (currentPath === '/support') {
                return 'help'
              }
              if (currentPath.startsWith('/dashboard/')) {
                return currentPath.replace('/dashboard/', '') || 'home'
              }
              if (currentPath === '/profile') {
                return 'profile'
              }
              return 'home'
            })()}
          />
        </ProtectedRoute>
      )}
      {view === 'ai-videos' && (
        <>
          <AIVideos 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'ai-avatars-videos' && (
        <>
          <AIAvatarsVideos 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'settings' && (
        <ProtectedRoute view={view} setView={setView}>
          <Settings onBack={() => setView('dashboard')} />
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'help-center' && (
        <>
          <HelpCenter 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'technology' && (
        <>
          <Technology 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'ethics' && (
        <>
          <Ethics 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
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
              } else if (solution === 'Learning & Development') {
                setView('learning-development')
              } else if (solution === 'AI Videos') {
                setView('ai-videos')
              }
            }}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'sales-suite' && (
        <>
          <SalesSuite 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'use-cases' && (
        <>
          <UseCases 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'customer-experience' && (
        <>
          <CustomerExperience 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'learning-development' && (
        <>
          <LearningDevelopment 
            onLoginClick={handleLoginClick}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
          />
        </>
      )}

      {view === 'google-callback' && <GoogleCallback />}

      {view === 'login' && (
        <AuthPage
          initialMode={window.location.pathname === '/signup' ? 'signup' : 'login'}
          onAuthComplete={handleAuthComplete}
          onBack={() => setView('landing')}
        />
      )}

      {view === 'not-found' && (
        <NotFound setView={setView} />
      )}

      {!['create', 'dashboard', 'products', 'about-us-blog', 'news', 'resources', 'help-center', 'privacy-policy', 'technology', 'ethics', 'marketing-suite', 'sales-suite', 'use-cases', 'customer-experience', 'learning-development', 'ai-videos', 'ai-avatars-videos', 'settings', 'login', 'google-callback', 'not-found'].includes(view) && (
        <>
          <Landing 
            onLoginClick={handleLoginClick}
            onNavigateToProduct={handleNavigateToProduct}
            onNavigateToSolution={handleNavigateToSolution}
            onNavigateToEthics={() => setView('ethics')}
            onNavigateToTechnology={() => setView('technology')}
            onNavigateToUseCases={() => setView('use-cases')}
            onLogoClick={() => setView('landing')}
            onNavigateToCompany={handleNavigateToCompany}
          />
        </>
      )}
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
