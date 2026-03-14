import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function GoogleCallback() {
  const { handleGoogleCallback } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await handleGoogleCallback()
        if (result.success) {
          // Redirect to dashboard after successful Google login
          window.location.href = '/dashboard'
        } else {
          // Store error in localStorage and redirect to clean login page
          localStorage.setItem('authError', 'Google sign-in failed. Please try again.')
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Google callback error:', error)
        // Store error in localStorage and redirect to clean login page
        localStorage.setItem('authError', 'Google sign-in failed. Please try again.')
        window.location.href = '/login'
      }
    }

    handleCallback()
  }, [handleGoogleCallback])

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
      }}></div>
    </div>
  )
}

export default GoogleCallback
