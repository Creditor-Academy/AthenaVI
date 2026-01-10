import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'
import Products from './pages/Products.jsx'
import MarketingSuite from './pages/MarketingSuite.jsx'
import SalesSuite from './pages/SalesSuite.jsx'
import Ethics from './pages/Ethics.jsx'

function App() {
  // Initialize view from localStorage on mount to persist page on refresh
  const [view, setView] = useState(() => {
    const savedView = window.localStorage.getItem('athenavi:view')
    return savedView || 'landing'
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [productSection, setProductSection] = useState(null)

  // Save view to localStorage whenever it changes
  useEffect(() => {
    window.localStorage.setItem('athenavi:view', view)
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

  const handleAuthComplete = () => {
    window.localStorage.setItem('athenavi:authenticated', 'true')
    setShowAuthModal(false)
    setView('dashboard')
  }

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  if (view === 'create') {
    return (
      <>
        <Create onBack={() => setView('dashboard')} />
        {showAuthModal && (
          <Auth 
            onAuthComplete={handleAuthComplete}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  if (view === 'dashboard') {
    return (
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
    )
  }

  if (view === 'products') {
    return (
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
          onNavigateToEthics={() => setView('ethics')}
          onLogoClick={() => setView('landing')}
        />
        {showAuthModal && (
          <Auth 
            onAuthComplete={handleAuthComplete}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  if (view === 'marketing-suite') {
    return (
      <>
        <MarketingSuite 
          onLoginClick={handleLoginClick}
          onNavigateToEthics={() => setView('ethics')}
          onLogoClick={() => setView('landing')}
        />
        {showAuthModal && (
          <Auth 
            onAuthComplete={handleAuthComplete}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  if (view === 'sales-suite') {
    return (
      <>
        <SalesSuite 
          onLoginClick={handleLoginClick}
          onLogoClick={() => setView('landing')}
          onNavigateToSolution={(solution) => {
            if (solution === 'Marketing Suite') {
              setView('marketing-suite')
            } else if (solution === 'Sales Solutions') {
              setView('sales-suite')
            }
          }}
          onNavigateToProduct={(section) => {
            setProductSection(section)
            setView('products')
          }}
          onNavigateToEthics={() => setView('ethics')}
        />
        {showAuthModal && (
          <Auth 
            onAuthComplete={handleAuthComplete}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  if (view === 'ethics') {
    return (
      <>
        <Ethics 
          onLoginClick={handleLoginClick}
          onLogoClick={() => setView('landing')}
          onNavigateToSolution={(solution) => {
            if (solution === 'Marketing Suite') {
              setView('marketing-suite')
            } else if (solution === 'Sales Solutions') {
              setView('sales-suite')
            }
          }}
          onNavigateToProduct={(section) => {
            setProductSection(section)
            setView('products')
          }}
          onNavigateToEthics={() => setView('ethics')}
        />
        {showAuthModal && (
          <Auth 
            onAuthComplete={handleAuthComplete}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  return (
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
        onLogoClick={() => setView('landing')}
      />
      {showAuthModal && (
        <Auth 
          onAuthComplete={handleAuthComplete}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  )
}

export default App
