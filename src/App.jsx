import { useEffect, useState } from 'react'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'
import Hero from './components/Hero.jsx'

function App() {
  const [view, setView] = useState(() => {
    return window.localStorage.getItem('athenavi:view') || 'hero'
  })
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    window.localStorage.setItem('athenavi:view', view)
  }, [view])

  const handleAuthComplete = () => {
    setView('dashboard')
  }

  const handleLoginClick = () => {
    setShowAuth(true)
    setView('auth')
  }

  const handleBackToHero = () => {
    setShowAuth(false)
    setView('hero')
  }

  if (view === 'create') {
    return <Create onBack={() => setView('dashboard')} />
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => {
          setView('hero')
          setShowAuth(false)
          window.localStorage.setItem('athenavi:view', 'hero')
        }}
        onCreate={() => setView('create')}
      />
    )
  }

  if (view === 'hero' && !showAuth) {
    return <Hero onLoginClick={handleLoginClick} />
  }

  return (
    <div className="app">
      <Auth onAuthComplete={handleAuthComplete} onBackToHero={handleBackToHero} />
      </div>
  )
}

export default App
