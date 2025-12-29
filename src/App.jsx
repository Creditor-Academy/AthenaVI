import { useEffect, useState } from 'react'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Create from './pages/Create.jsx'

function App() {
  const [view, setView] = useState(() => {
    return window.localStorage.getItem('athenavi:view') || 'auth'
  })

  useEffect(() => {
    window.localStorage.setItem('athenavi:view', view)
  }, [view])

  const handleAuthComplete = () => {
    setView('dashboard')
  }

  if (view === 'create') {
    return <Create onBack={() => setView('dashboard')} />
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => {
          setView('auth')
          window.localStorage.setItem('athenavi:view', 'auth')
        }}
        onCreate={() => setView('create')}
      />
    )
  }

  return (
    <div className="app">
      <Auth onAuthComplete={handleAuthComplete} />
      </div>
  )
}

export default App
