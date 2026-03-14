import { useState, useEffect } from 'react'
import { MdLock, MdVisibility, MdVisibilityOff, MdCheck } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'

function ResetPassword() {
  const { resetPassword, loading } = useAuth()

  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Get token from URL path (not query params)
    const currentPath = window.location.pathname
    const tokenMatch = currentPath.match(/\/reset-password\/(.+)/)
    const tokenFromUrl = tokenMatch ? tokenMatch[1] : null

    if (!tokenFromUrl) {
      setTokenValid(false)
      setError('Invalid reset link. Please request a new password reset.')
    } else {
      setToken(tokenFromUrl)
    }
  }, [])

  const navigateToLogin = () => {
    window.location.href = '/login'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const result = await resetPassword(token, newPassword)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    }
  }

  if (!tokenValid) {
    return (
      <div className="auth-form">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Invalid Reset Link</h2>
          <p className="auth-form-subtitle">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <p style={{ margin: 0, color: '#dc2626' }}>
            Invalid or expired reset link
          </p>
        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={navigateToLogin}
        >
          Back to Login
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Password Reset Successful</h2>
          <p className="auth-form-subtitle">
            Your password has been successfully reset.
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <MdCheck size={32} color="#16a34a" />
          <p style={{ margin: '8px 0 0 0', color: '#166534' }}>
            Password updated successfully!
          </p>
        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={navigateToLogin}
        >
          Login with New Password
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Reset Password</h2>
        <p className="auth-form-subtitle">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-input-wrapper">
          <MdLock className="auth-input-icon" />
          <input
            id="new-password"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            className="auth-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        <div className="auth-input-wrapper">
          <MdLock className="auth-input-icon" />
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm New Password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
          >
            {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={navigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '14.5px',
            fontWeight: '600',
            padding: '4px 8px',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword
