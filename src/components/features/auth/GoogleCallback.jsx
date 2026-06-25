import { useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { getOAuthAccessTokenFromUrl } from '../../../utils/authRouting.js'

function GoogleCallback() {
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (loading) return

    if (isAuthenticated) {
      window.history.replaceState({ view: 'dashboard' }, '', '/dashboard')
      window.dispatchEvent(new CustomEvent('auth:oauth-complete'))
      return
    }

    if (!getOAuthAccessTokenFromUrl()) {
      localStorage.setItem('authError', 'Google sign-in failed. Please try again.')
      window.history.replaceState({ view: 'login' }, '', '/login')
      window.dispatchEvent(new CustomEvent('auth:oauth-error'))
    }
  }, [loading, isAuthenticated])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ fontSize: '18px', marginBottom: '16px' }}>
        Completing Google sign-in...
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default GoogleCallback
