import { useState } from 'react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

function Login({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSuccess) onSuccess()
  }

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`)
    // Add your social login logic here
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Sign In</h2>
      </div>

      <div className="auth-social-buttons">
        <button
          type="button"
          className="auth-social-btn google"
          onClick={() => handleSocialLogin('Google')}
          aria-label="Sign in with Google"
        >
          G
        </button>
        <button
          type="button"
          className="auth-social-btn facebook"
          onClick={() => handleSocialLogin('Facebook')}
          aria-label="Sign in with Facebook"
        >
          f
        </button>
        <button
          type="button"
          className="auth-social-btn github"
          onClick={() => handleSocialLogin('GitHub')}
          aria-label="Sign in with GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.538 4.04-.538 5.997 0 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </button>
        <button
          type="button"
          className="auth-social-btn linkedin"
          onClick={() => handleSocialLogin('LinkedIn')}
          aria-label="Sign in with LinkedIn"
        >
          in
        </button>
      </div>

      <p className="auth-form-subtitle">Sign in With Email & Password</p>

      <div className="auth-input-wrapper">
        <MdEmail className="auth-input-icon" />
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter E-mail"
          className="auth-input"
          required
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
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
        </button>
      </div>

      <div className="auth-forgot-link">
        <a href="#" onClick={(e) => e.preventDefault()}>
          Forget Password?
        </a>
      </div>

      <button type="submit" className="auth-submit-btn">
        Sign In
      </button>
    </form>
  )
}

export default Login

