import { useState } from 'react'
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'

function Signup({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: form, 2: otp
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  })
  const { register, generateOTP, resendOTP, googleLogin } = useAuth()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Generate OTP first
      const result = await generateOTP(formData.email)
      if (result.success) {
        setStep(2) // Move to OTP step
      } else {
        setError(result.error || 'Failed to generate OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Submitting registration with data:', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      })
      
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      })
      
      console.log('Registration result:', result)
      
      if (result.success) {
        if (onSuccess) onSuccess()
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    try {
      const result = await resendOTP(formData.email)
      if (result.success) {
        // Show success message
        setError('OTP resent successfully')
        setTimeout(() => setError(''), 3000)
      } else {
        setError(result.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP')
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

  const goBack = () => {
    setStep(1)
    setError('')
  }

  return (
    <form className="auth-form" onSubmit={step === 1 ? handleFormSubmit : handleOTPSubmit}>
      <div className="auth-form-header">
        {step === 2 && (
          <button
            type="button"
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              color: '#64748b'
            }}
          >
            <MdArrowBack size={20} style={{ marginRight: '8px' }} />
            Back
          </button>
        )}
        <h2 className="auth-form-title">Sign Up</h2>
        <p className="auth-form-subtitle">
          {step === 1 ? 'Create your account to get started' : 'Enter the OTP sent to your email'}
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: error.includes('success') ? '#dcfce7' : '#fee2e2',
          color: error.includes('success') ? '#166534' : '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {step === 1 ? (
        <>
          <div className="auth-input-wrapper">
            <MdPerson className="auth-input-icon" />
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Full Name"
              className="auth-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-wrapper">
            <MdEmail className="auth-input-icon" />
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              className="auth-input"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-wrapper">
            <MdLock className="auth-input-icon" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleInputChange}
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

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-google-alt-btn"
            onClick={() => handleSocialLogin('Google')}
            aria-label="Sign up with Google"
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
        </>
      ) : (
        <>
          <div className="auth-input-wrapper">
            <MdEmail className="auth-input-icon" />
            <input
              id="signup-otp"
              name="otp"
              type="text"
              placeholder="Enter OTP"
              className="auth-input"
              value={formData.otp}
              onChange={handleInputChange}
              required
              disabled={loading}
              maxLength={6}
              style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '18px' }}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleResendOTP}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        </>
      )}
    </form>
  )
}

export default Signup

