import { useState } from 'react'
import { MdPerson, MdEmail, MdBusiness, MdWork, MdSend } from 'react-icons/md'
import EnvelopeSuccess from './EnvelopeSuccess.jsx'
import earlyAccessService from '../../../../services/earlyAccessService.js'


const USE_CASES = [
  'Corporate Training',
  'Educational Content',
  'Marketing Videos',
  'Product Demos',
  'HR Onboarding',
  'Sales Enablement',
  'Other',
]

function EarlyAccess() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    useCase: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const result = await earlyAccessService.submitRequest(formData)
      setSuccessMessage(result.message)
      setSubmitted(true)
    } catch (err) {
      if (err.fields && typeof err.fields === 'object') {
        setFieldErrors(err.fields)
      }
      setError(err.message || 'Failed to submit your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <EnvelopeSuccess 
        email={formData.email}
        message={successMessage}
        onReset={() => {
          setSubmitted(false)
          setSuccessMessage('')
          setFormData({ name: '', email: '', company: '', role: '', useCase: '', message: '' })
        }} 
      />
    )
  }

  return (
    <div className="ea-form-container">
      <form className="auth-form ea-form" onSubmit={handleSubmit} noValidate>
        {/* Header Section */}
        <div className="ea-header-section">
          <div className="ea-pill">✨ Beyond Artificial</div>
          <h1 className="ea-heading">Early Access to Game-Changing AI</h1>
          <p className="ea-subtitle">
            Unlock exclusive early access to groundbreaking AI. Subscribe now and stay ahead of the future!
          </p>
        </div>

      {error && (
        <div className="ea-error">{error}</div>
      )}

      <div className="ea-form-grid">

      {/* Name */}
      <div className="auth-input-wrapper">
        <div className="auth-input-field">
          <MdPerson className="auth-input-icon" aria-hidden="true" />
          <input
            id="ea-name"
            name="name"
            type="text"
            placeholder="Full Name *"
            className={`auth-input${fieldErrors.name ? ' ea-input-error' : ''}`}
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            autoComplete="name"
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.name)}
          />
        </div>
        {fieldErrors.name && <span className="ea-field-error">{fieldErrors.name}</span>}
      </div>

      {/* Email */}
      <div className="auth-input-wrapper">
        <div className="auth-input-field">
          <MdEmail className="auth-input-icon" aria-hidden="true" />
          <input
            id="ea-email"
            name="email"
            type="email"
            placeholder="Work Email *"
            className={`auth-input${fieldErrors.email ? ' ea-input-error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </div>
        {fieldErrors.email && <span className="ea-field-error">{fieldErrors.email}</span>}
      </div>

      {/* Company */}
      <div className="auth-input-wrapper">
        <div className="auth-input-field">
          <MdBusiness className="auth-input-icon" aria-hidden="true" />
          <input
            id="ea-company"
            name="company"
            type="text"
            placeholder="Company / Organization"
            className="auth-input"
            value={formData.company}
            onChange={handleChange}
            disabled={loading}
            autoComplete="organization"
            maxLength={150}
          />
        </div>
      </div>

      {/* Role */}
      <div className="auth-input-wrapper">
        <div className="auth-input-field">
          <MdWork className="auth-input-icon" aria-hidden="true" />
          <input
            id="ea-role"
            name="role"
            type="text"
            placeholder="Your Role / Title"
            className="auth-input"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            autoComplete="organization-title"
            maxLength={100}
          />
        </div>
      </div>

      </div>

      {/* Use Case select */}
      <div className="auth-input-wrapper">
        <select
          id="ea-usecase"
          name="useCase"
          className="auth-input ea-select"
          value={formData.useCase}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">Primary Use Case</option>
          {USE_CASES.map((uc) => (
            <option key={uc} value={uc}>{uc}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="ea-textarea-wrapper">
        <textarea
          id="ea-message"
          name="message"
          placeholder="Tell us a bit about your goals (optional)"
          className="auth-input ea-textarea"
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          rows={3}
          maxLength={1000}
        />
      </div>

      <button
        type="submit"
        className="ea-submit-btn"
        disabled={loading}
      >
        {loading ? (
          <span className="ea-loading-row">
            <span className="ea-spinner" />
            Sending request…
          </span>
        ) : (
          <span className="ea-submit-row">
            <MdSend style={{ fontSize: 16 }} />
            Request Early Access
          </span>
        )}
      </button>

        <p className="ea-disclaimer">
          By submitting, you agree to be contacted by the Virtual Studio team. No spam, ever.
        </p>
      </form>
    </div>
  )
}

export default EarlyAccess
