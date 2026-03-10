import { useState, useEffect } from 'react'
import Login from '../components/authentication/Login.jsx'
import Signup from '../components/authentication/Signup.jsx'
import ForgotPassword from '../components/authentication/ForgotPassword.jsx'

const styles = `
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.auth-modal-container {
  position: relative;
  width: 100%;
  max-width: 720px;
  min-height: 500px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.auth-modal-content {
  display: flex;
  width: 100%;
  height: 500px;
  position: relative;
  transition: all 0.5s ease;
}

.auth-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
}

.auth-close-btn:hover {
  background: #f1f5f9;
  transform: scale(1.1);
}

.auth-close-btn svg {
  width: 16px;
  height: 16px;
  stroke: #64748b;
  stroke-width: 2.5;
}

.auth-left-panel {
  flex: 1;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  z-index: 2;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-modal-content.signup-active .auth-left-panel {
  transform: translateX(-100%);
}

.auth-right-panel {
  flex: 0.85;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

.auth-modal-content.signup-active .auth-right-panel {
  transform: translateX(-100%);
  z-index: 3;
}

.auth-promo-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
}

.auth-promo-subtitle {
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.5;
}

.auth-promo-btn {
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid #ffffff;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.auth-promo-btn:hover {
  background: #ffffff;
  color: #2563eb;
}

.auth-login-form-container {
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.auth-form-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: left;
}

.auth-form-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
  text-align: left;
}

.auth-signup-form-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateX(100%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 4;
  opacity: 0;
}

.auth-modal-content.signup-active .auth-signup-form-container {
  transform: translateX(0);
  opacity: 1;
  width: 55%;
}

.auth-blue-panel-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 45%;
  height: 100%;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
  transform: translateX(-100%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 5;
  opacity: 0;
}

.auth-modal-content.signup-active .auth-blue-panel-left {
  transform: translateX(0);
  opacity: 1;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-form-header {
  margin-bottom: 8px;
}

.auth-social-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.auth-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
}

.auth-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.auth-input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.auth-password-toggle {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
}

.auth-forgot-link {
  text-align: right;
  margin-top: -4px;
}

.auth-forgot-link a {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.auth-submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.auth-submit-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 12px 0;
  gap: 12px;
}

.auth-divider::before, .auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.auth-divider span {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.auth-google-alt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-google-alt-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .auth-modal-container {
    max-width: 400px;
    min-height: auto;
  }

  .auth-modal-content {
    height: auto;
    min-height: 480px;
  }

  .auth-right-panel, .auth-blue-panel-left {
    display: none;
  }

  .auth-left-panel {
    flex: 1;
    padding: 32px 24px;
  }

  .auth-modal-content.signup-active .auth-signup-form-container {
    width: 100%;
    position: relative;
    transform: none;
    opacity: 1;
    padding: 32px 24px;
  }

  .auth-modal-content.signup-active .auth-left-panel {
    display: none;
  }
}
`

function Auth({ onAuthComplete, onClose }) {
  const [isSignupActive, setIsSignupActive] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  const handleAuthSuccess = () => {
    if (onAuthComplete) {
      onAuthComplete()
    }
    if (onClose) {
      onClose()
    }
  }

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
  }

  const handleSignupClick = () => {
    setIsSignupActive(true)
  }

  const handleSignInClick = () => {
    setIsSignupActive(false)
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="auth-modal-overlay" onClick={handleBackdropClick}>
        <div className="auth-modal-container">
          <div className={`auth-modal-content ${isSignupActive ? 'signup-active' : ''}`}>
            <button
              className="auth-close-btn"
              onClick={() => onClose && onClose()}
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Left Column - Sign In Form (when login active) */}
            <div className="auth-left-panel">
              <div className="auth-login-form-container">
                {showForgotPassword ? (
                  <ForgotPassword onBack={handleBackToLogin} onSuccess={handleAuthSuccess} />
                ) : (
                  <Login onSuccess={handleAuthSuccess} onForgotPassword={handleForgotPasswordClick} />
                )}
              </div>
            </div>

            {/* Right Column - Blue Promotional Panel with Sign Up Button (when login active) */}
            <div className="auth-right-panel">
              {showForgotPassword ? (
                <div className="auth-promo-content">
                  <h2 className="auth-promo-title">Secure Recovery</h2>
                  <p className="auth-promo-subtitle">Follow the steps to safely reset your account password and regain access.</p>
                  <div style={{
                    fontSize: '64px',
                    marginTop: '20px',
                    opacity: '0.9',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                  }}>🛡️</div>
                </div>
              ) : (
                <div className="auth-promo-content">
                  <h2 className="auth-promo-title">Hello World</h2>
                  <p className="auth-promo-subtitle">Sign up now and enjoy our site</p>
                  <button className="auth-promo-btn" onClick={handleSignupClick}>
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Sign Up Form - Slides in from right when signup is active */}
            <div className="auth-signup-form-container">
              <div className="auth-form-container">
                <Signup onSuccess={handleAuthSuccess} />
              </div>
            </div>

            {/* Blue Panel on Left - Slides in from left when signup is active */}
            <div className="auth-blue-panel-left">
              <div className="auth-promo-content">
                <h2 className="auth-promo-title">Welcome Back</h2>
                <p className="auth-promo-subtitle">Already have an account? Sign in to continue</p>
                <button className="auth-promo-btn" onClick={handleSignInClick}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Auth

