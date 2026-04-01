import { useState, useEffect } from 'react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../../../contexts/AuthContext'

function Login({ onSuccess, onForgotPassword }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, googleLogin } = useAuth()

  // Check for auth errors in localStorage on mount
  useEffect(() => {
    const authError = localStorage.getItem('authError')
    if (authError) {
      setError(authError)
      localStorage.removeItem('authError') // Clear error after showing
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.target)
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const result = await login(credentials)
      if (result.success) {
        if (onSuccess) onSuccess()
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    if (provider === 'Google') {
      try {
        await googleLogin()
      } catch (err) {
        setError(err.message || 'Google login failed')
      }
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Sign In</h2>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div className="auth-input-wrapper">
        <MdEmail className="auth-input-icon" />
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="auth-input"
          required
          disabled={loading}
        />
      </div>

      <div className="auth-input-wrapper">
        <MdLock className="auth-input-icon" />
        <input
          id="signin-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter Password"
          className="auth-input"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={loading}
        >
          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
        </button>
      </div>

      <div className="auth-forgot-link">
        <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>
          Forgot Password?
        </a>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="auth-google-alt-btn"
        onClick={() => handleSocialLogin('Google')}
        aria-label="Sign in with Google"
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
    </form>
  )
}

export default Login

