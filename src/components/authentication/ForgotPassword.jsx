import { useState } from 'react'
import { MdEmail, MdArrowBack } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'

function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const result = await forgotPassword(email)
      if (result.success) {
        setSuccess(true)
        // Keep the email in state to show it in the success message
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-form" style={{ gap: '10px' }}>
        <div className="auth-form-header" style={{ marginBottom: '4px' }}>
          <h2 className="auth-form-title" style={{ fontSize: '22px' }}>Check Your Email</h2>
          <p className="auth-form-subtitle" style={{ fontSize: '13px', marginBottom: '12px' }}>
            We've sent a password reset link to your email address.
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '16px 20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '24px',
            width: '48px',
            height: '48px',
            backgroundColor: '#eff6ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>📧</div>
          <div>
            <p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '13px' }}>
              Reset link sent to
            </p>
            <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '14px', wordBreak: 'break-all' }}>
              {email}
            </p>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0' }}>Didn't receive the email? Check spam or</p>
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              padding: '0'
            }}
          >
            Try another email
          </button>
        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={onBack}
          style={{ marginTop: '12px', padding: '10px' }}
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Forgot Password?</h2>
        <p className="auth-form-subtitle">
          Enter your email address and we'll send you a link to reset your password.
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
          <MdEmail className="auth-input-icon" />
          <input
            id="forgot-email"
            name="email"
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="auth-back-btn"
        style={{
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          marginTop: '16px'
        }}
      >
        <MdArrowBack size={16} />
        Back to Login
      </button>
    </div>
  )
}

export default ForgotPassword
