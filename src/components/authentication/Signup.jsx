import { useState } from 'react'
import { MdPerson, MdEmail, MdPhone, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

function Signup({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSuccess) onSuccess()
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>

      <div className="auth-form-header">
        <h2 className="auth-form-title">Sign Up</h2>
        <p className="auth-form-subtitle">Create your account to get started</p>
      </div>

      <div className="auth-input-wrapper">
        <MdPerson className="auth-input-icon" />
        <input
          id="signup-username"
          name="username"
          type="text"
          placeholder="Username"
          className="auth-input"
          required
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
          required
        />
      </div>

      <div className="auth-input-wrapper">
        <MdPhone className="auth-input-icon" />
        <input
          id="signup-phone"
          name="phone"
          type="tel"
          placeholder="Phone number"
          className="auth-input"
          required
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

      <button type="submit" className="auth-submit-btn">
        Sign Up
      </button>
    </form>
  )
}

export default Signup

