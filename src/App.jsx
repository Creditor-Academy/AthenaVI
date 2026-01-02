import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'

function App() {
  const [view, setView] = useState(() => {
    // Always start with landing page for new visitors
    // Only restore dashboard/create if user was previously authenticated
    const storedView = window.localStorage.getItem('athenavi:view')
    const isAuthenticated = window.localStorage.getItem('athenavi:authenticated') === 'true'
    
    // Only restore authenticated views (dashboard, create)
    // Never restore 'auth' view - always show landing page first
    if (isAuthenticated && (storedView === 'dashboard' || storedView === 'create')) {
      return storedView
    }
    // Always default to landing page for new visitors or unauthenticated users
    return 'landing'
  })

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
    setView('dashboard')
  }

  if (view === 'create') {
    return <Create onBack={() => setView('dashboard')} />
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => {
          window.localStorage.removeItem('athenavi:authenticated')
          window.localStorage.removeItem('athenavi:view')
          setView('landing')
        }}
        onCreate={() => setView('create')}
      />
    )
  }

  if (view === 'auth') {
  return (
    <div className="app">
      <Auth onAuthComplete={handleAuthComplete} />
      </div>
    )
  }

  return (
    <Landing onLoginClick={() => setView('auth')} />
  )
}

export default App
