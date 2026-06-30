import { useState, useRef } from 'react'
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../../contexts/AuthContext'
import {
  formatAuthErrorMessage,
  isEmailAlreadyRegisteredMessage,
} from '../../../../utils/apiError.js'
import {
  clearInputValidity,
  getFriendlyAuthErrorMessage,
  reportEmailValidity,
  reportNameValidity,
  reportPasswordMinLength,
} from '../../../../utils/authFormValidation.js'

const authAlertErrorStyle = {
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
  padding: '12px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: 1.45,
  marginBottom: '16px',
  border: '1px solid #fecaca',
}

const authAlertSuccessStyle = {
  backgroundColor: '#f0fdf4',
  color: '#166534',
  padding: '12px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: 1.45,
  marginBottom: '16px',
  border: '1px solid #bbf7d0',
}

function Signup({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef([])
  // null | 'combining' | 'done'
  const [successPhase, setSuccessPhase] = useState(null)
  const { register, precheckSignupEmail, generateOTP, resendOTP, googleLogin } = useAuth()

  /* ── Input handlers ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    clearInputValidity(e.target)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDigitChange = (index, e) => {
    const digit = e.target.value.replace(/[^0-9]/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const next = [...otpDigits]
        next[index] = ''
        setOtpDigits(next)
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleDigitPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pasted) return
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setOtpDigits(next)
    setTimeout(() => otpRefs.current[Math.min(pasted.length - 1, 5)]?.focus(), 0)
  }

  /* ── Step 1: email precheck + OTP generate ── */
  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const form = event.currentTarget
    if (!reportNameValidity(form.elements.name)) return
    if (!reportEmailValidity(form.elements.email)) return
    if (!reportPasswordMinLength(form.elements.password)) return

    setLoading(true)
    try {
      const precheck = await precheckSignupEmail({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })
      if (!precheck.success) {
        setError(formatAuthErrorMessage(precheck, 'Email already registered'))
        return
      }
      if (precheck.otpAlreadySent) { setStep(2); return }

      const result = await generateOTP(formData.email)
      if (result.success) {
        setStep(2)
      } else {
        setError(formatAuthErrorMessage(result, 'Failed to generate OTP'))
      }
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err.message || 'Failed to generate OTP'))
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: OTP verify + register ── */
  const handleOTPSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const otp = otpDigits.join('')
    if (otp.length < 6) {
      setError('Please enter all 6 digits of your OTP.')
      return
    }

    setLoading(true)
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        otp: Number(otp),
      })

      if (result.success) {
        // Start merge animation
        setSuccessPhase('combining')
        setTimeout(() => setSuccessPhase('done'), 650)
        setTimeout(() => { if (onSuccess) onSuccess() }, 2300)
        return
      }

      const message = formatAuthErrorMessage(result, 'Registration failed')
      if (result.status === 409 || isEmailAlreadyRegisteredMessage(message)) {
        setError(message); return
      }
      if (result.status === 410) {
        setError(message)
        setStep(1)
        setOtpDigits(['', '', '', '', '', ''])
        return
      }
      setError(message)
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err.message || 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setSuccessMessage('')
    try {
      const result = await resendOTP(formData.email)
      if (result.success) {
        setSuccessMessage('If this email is eligible, a new OTP has been sent.')
        setOtpDigits(['', '', '', '', '', ''])
        setTimeout(() => {
          setSuccessMessage('')
          otpRefs.current[0]?.focus()
        }, 4000)
      } else {
        setError(formatAuthErrorMessage(result, 'Failed to resend OTP'))
      }
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err.message || 'Failed to resend OTP'))
    }
  }

  const handleSocialLogin = async (provider) => {
    if (provider === 'Google') {
      try {
        await googleLogin()
      } catch (err) {
        setError(getFriendlyAuthErrorMessage(err.message || 'Google login failed'))
      }
    }
  }

  const goBack = () => {
    setStep(1)
    setError('')
    setSuccessMessage('')
    setOtpDigits(['', '', '', '', '', ''])
    setSuccessPhase(null)
  }

  return (
    <form className="auth-form" onSubmit={step === 1 ? handleFormSubmit : handleOTPSubmit}>
      <div className="auth-form-header">
        {step === 2 && (
          <button
            type="button"
            onClick={goBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', marginBottom: '16px', color: '#64748b',
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

      {error && <div style={authAlertErrorStyle}>{error}</div>}
      {successMessage && <div style={authAlertSuccessStyle}>{successMessage}</div>}

      {step === 1 ? (
        <>
          <div className="auth-input-wrapper">
            <MdPerson className="auth-input-icon" />
            <input id="signup-name" name="name" type="text" placeholder="Full Name"
              className="auth-input" value={formData.name}
              onChange={handleInputChange} disabled={loading} />
          </div>

          <div className="auth-input-wrapper">
            <MdEmail className="auth-input-icon" />
            <input id="signup-email" name="email" type="text" inputMode="email"
              autoComplete="email" placeholder="Email address"
              className="auth-input" value={formData.email}
              onChange={handleInputChange} disabled={loading} />
          </div>

          <div className="auth-input-wrapper">
            <MdLock className="auth-input-icon" />
            <input id="signup-password" name="password"
              type={showPassword ? 'text' : 'password'} autoComplete="new-password"
              placeholder="Password (min. 8 characters)"
              className="auth-input" value={formData.password}
              onChange={handleInputChange} disabled={loading} />
            <button type="button" className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}>
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>

          <div className="auth-divider"><span>or</span></div>

          <button type="button" className="auth-google-alt-btn"
            onClick={() => handleSocialLogin('Google')}
            aria-label="Sign up with Google" disabled={loading}>
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
        /* ── Step 2: OTP entry + animation ── */
        <>
          <div className="otp-anim-container">
            <AnimatePresence mode="wait">
              {successPhase === 'done' ? (
                /* ── Success circle with animated checkmark ── */
                <motion.div
                  key="success-circle"
                  className="otp-success-circle"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                >
                  <svg viewBox="0 0 52 52" className="otp-check-svg">
                    <motion.circle
                      cx="26" cy="26" r="23"
                      fill="none" stroke="#22c55e" strokeWidth="2.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <motion.path
                      fill="none" stroke="#22c55e" strokeWidth="3.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      d="M14 27l8 8 16-16"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
              ) : (
                /* ── Six OTP input boxes ── */
                <motion.div
                  key="otp-boxes"
                  className="otp-boxes-row"
                  animate={
                    successPhase === 'combining'
                      ? { scale: [1, 0.85, 0.4], opacity: [1, 1, 0] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={
                    successPhase === 'combining'
                      ? { duration: 0.55, ease: 'easeIn' }
                      : {}
                  }
                >
                  {otpDigits.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      id={`otp-box-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      className={`otp-box${digit ? ' otp-box--filled' : ''}`}
                      onChange={(e) => handleDigitChange(i, e)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      onPaste={handleDigitPaste}
                      disabled={loading || successPhase !== null}
                      autoFocus={i === 0}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Success label */}
          <AnimatePresence>
            {successPhase === 'done' && (
              <motion.p
                className="otp-success-label"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Account created! Redirecting…
              </motion.p>
            )}
          </AnimatePresence>

          {/* Verify button & resend (hidden during animation) */}
          {successPhase === null && (
            <>
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || otpDigits.join('').length < 6}
              >
                {loading ? 'Verifying…' : 'Verify & Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  style={{
                    background: 'none', border: 'none', color: '#2563eb',
                    cursor: 'pointer', fontSize: '14px', textDecoration: 'underline',
                  }}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </>
      )}
    </form>
  )
}

export default Signup
