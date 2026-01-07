import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'
import Products from './pages/Products.jsx'
import MarketingSuite from './pages/MarketingSuite.jsx'

function App() {
  const [view, setView] = useState('landing')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [productSection, setProductSection] = useState(null)

  useEffect(() => {
    // Only persist authenticated views
    if (view === 'dashboard' || view === 'create') {
      window.localStorage.setItem('athenavi:view', view)
      window.localStorage.setItem('athenavi:authenticated', 'true')
    } else if (view === 'landing') {
      // Clear authentication state when showing landing page
      window.localStorage.removeItem('athenavi:view')
      window.localStorage.removeItem('athenavi:authenticated')
    }
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
          }
        }}
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
