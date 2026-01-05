import { useState, useEffect } from 'react'
import Login from '../components/authentication/Login.jsx'
import Signup from '../components/authentication/Signup.jsx'

const styles = `
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-modal-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 600px;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.auth-modal-content {
  width: 100%;
  height: 100%;
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.3);
  font-family: 'Arial', sans-serif;
  position: relative;
}

.auth-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(30, 64, 175, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.1);
}

.auth-close-btn:hover {
  background: rgba(30, 64, 175, 0.1);
  border-color: rgba(30, 64, 175, 0.3);
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
}

.auth-close-btn svg {
  width: 20px;
  height: 20px;
  stroke: #1e40af;
  stroke-width: 2.5;
}

.auth-left-panel {
  flex: 0 0 50%;
  background: #ffffff;
  padding: 50px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-modal-content.signup-active .auth-left-panel {
  transform: translateX(-100%);
  pointer-events: none;
}

.auth-right-panel {
  flex: 0 0 50%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

.auth-modal-content.signup-active .auth-right-panel {
  transform: translateX(-100%);
  z-index: 3;
}

.auth-promo-content {
  color: #ffffff;
  transition: opacity 0.3s ease;
  width: 100%;
}

.auth-modal-content.signup-active .auth-promo-content {
  opacity: 0;
  pointer-events: none;
}

.auth-promo-title {
  font-family: 'Arial', sans-serif;
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.auth-promo-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  margin: 0 0 40px 0;
  opacity: 0.95;
  line-height: 1.6;
}

.auth-promo-btn {
  padding: 14px 32px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: transparent;
  border: 2px solid #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-promo-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.auth-form-container {
  width: 100%;
  max-width: 100%;
}

.auth-login-form-container {
  width: 100%;
  max-width: 100%;
  transition: opacity 0.3s ease;
}

.auth-modal-content.signup-active .auth-login-form-container {
  opacity: 0;
  pointer-events: none;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-form-header {
  text-align: center;
  margin-bottom: 8px;
}

.auth-form-title {
  font-family: 'Arial', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.auth-form-subtitle {
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  color: rgba(30, 64, 175, 0.6);
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-social-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.auth-social-btn {
  width: 100%;
  aspect-ratio: 1;
  background: #ffffff;
  border: 1px solid rgba(30, 64, 175, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
  padding: 0;
}

.auth-social-btn:hover {
  border-color: rgba(30, 64, 175, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(30, 64, 175, 0.15);
}

.auth-social-btn.google {
  color: #4285F4;
}

.auth-social-btn.facebook {
  color: #1877F2;
}

.auth-social-btn.github {
  color: #333333;
}

.auth-social-btn.linkedin {
  color: #0077B5;
}

.auth-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  left: 16px;
  color: rgba(30, 64, 175, 0.5);
  font-size: 18px;
  pointer-events: none;
  transition: color 0.2s ease;
  z-index: 1;
}

.auth-input-wrapper:focus-within .auth-input-icon {
  color: #3b82f6;
}

.auth-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.15);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.auth-input::placeholder {
  color: rgba(30, 64, 175, 0.5);
}

.auth-input:hover {
  border-color: rgba(30, 64, 175, 0.25);
  background: rgba(30, 64, 175, 0.08);
}

.auth-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.auth-password-toggle {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(30, 64, 175, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 6px;
  font-size: 20px;
}

.auth-password-toggle:hover {
  color: #3b82f6;
  background: rgba(30, 64, 175, 0.05);
}

.auth-submit-btn {
  width: 100%;
  padding: 14px 24px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
}

.auth-submit-btn:active {
  transform: translateY(0);
}

.auth-forgot-link {
  text-align: right;
  margin-top: 4px;
}

.auth-forgot-link a {
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  color: rgba(30, 64, 175, 0.7);
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-forgot-link a:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.auth-signup-form-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: #ffffff;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateX(100%);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 4;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
}

.auth-modal-content.signup-active .auth-signup-form-container {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.auth-blue-panel-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transform: translateX(-100%);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 5;
  opacity: 0;
  pointer-events: none;
}

.auth-modal-content.signup-active .auth-blue-panel-left {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.auth-blue-panel-left .auth-promo-content {
  opacity: 0;
  transition: opacity 0.3s ease 0.4s;
  pointer-events: auto;
}

.auth-modal-content.signup-active .auth-blue-panel-left .auth-promo-content {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .auth-modal-container {
    max-width: 100%;
    height: auto;
    max-height: 90vh;
  }
  
  .auth-modal-content {
    flex-direction: column;
    height: auto;
  }
  
  .auth-left-panel,
  .auth-right-panel {
    flex: 1 1 auto;
    min-height: 400px;
  }
  
  .auth-modal-content.signup-active .auth-left-panel,
  .auth-modal-content.signup-active .auth-right-panel {
    transform: none;
  }
  
  .auth-signup-form-container,
  .auth-blue-panel-left {
    position: static;
    width: 100%;
    transform: none;
    padding: 40px 30px;
  }
  
  .auth-left-panel {
    padding: 40px 30px;
  }
  
  .auth-right-panel {
    padding: 40px 30px;
  }
  
  .auth-promo-title {
    font-size: 32px;
  }
  
  .auth-form-title {
    font-size: 28px;
  }
}
`

function Auth({ onAuthComplete, onClose }) {
  const [isSignupActive, setIsSignupActive] = useState(false)

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
                <Login onSuccess={handleAuthSuccess} />
              </div>
            </div>

            {/* Right Column - Blue Promotional Panel with Sign Up Button (when login active) */}
            <div className="auth-right-panel">
              <div className="auth-promo-content">
                <h2 className="auth-promo-title">Hello World</h2>
                <p className="auth-promo-subtitle">Sign up now and enjoy our site</p>
                <button className="auth-promo-btn" onClick={handleSignupClick}>
                  Sign Up
                </button>
              </div>
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

