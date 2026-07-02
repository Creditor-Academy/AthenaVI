/**
 * EarlyAccess.jsx
 *
 * TODO (Backend Integration):
 *   Currently uses a mailto: fallback to send early access requests.
 *   Once the backend API is ready, replace the handleSubmit mailto block
 *   with a POST /api/early-access/request call.
 *
 *   See full payload spec, response shapes, email templates, and DB schema at:
 *   EARLY_ACCESS_API_SPEC.md (root of project)
 *
 *   Payload shape:
 *   {
 *     name:    string (required),
 *     email:   string (required),
 *     company: string,
 *     role:    string,
 *     useCase: string,
 *     message: string,
 *   }
 */
import { useState } from 'react'
import { MdPerson, MdEmail, MdBusiness, MdWork, MdSend, MdStar } from 'react-icons/md'
import EnvelopeSuccess from './EnvelopeSuccess.jsx'

const EARLY_ACCESS_EMAIL = 'team@athenavi.com'


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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    // Build mailto link with all user details
    const subject = encodeURIComponent(`Early Access Request – ${formData.name}`)
    const body = encodeURIComponent(
      `Early Access Request\n` +
      `${'='.repeat(40)}\n\n` +
      `Name:     ${formData.name}\n` +
      `Email:    ${formData.email}\n` +
      `Company:  ${formData.company || 'N/A'}\n` +
      `Role:     ${formData.role || 'N/A'}\n` +
      `Use Case: ${formData.useCase || 'N/A'}\n\n` +
      `Additional Notes:\n${formData.message || 'None'}\n\n` +
      `${'='.repeat(40)}\n` +
      `Sent from Virtual Studio Early Access Form`
    )

    // Simulate async request (TODO: replace with actual API call)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  if (submitted) {
    return (
      <EnvelopeSuccess 
        email={formData.email} 
        onReset={() => {
          setSubmitted(false)
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
          <h1 className="ea-heading">Early Access to<br/>Game-Changing AI</h1>
          <p className="ea-subtitle">
            Unlock exclusive early access to groundbreaking AI.<br/>
            Subscribe now and stay ahead of the future!
          </p>
        </div>

      {error && (
        <div className="ea-error">{error}</div>
      )}

      <div className="ea-form-grid">

      {/* Name */}
      <div className="auth-input-wrapper">
        <MdPerson className="auth-input-icon" />
        <input
          id="ea-name"
          name="name"
          type="text"
          placeholder="Full Name *"
          className="auth-input"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div className="auth-input-wrapper">
        <MdEmail className="auth-input-icon" />
        <input
          id="ea-email"
          name="email"
          type="email"
          placeholder="Work Email *"
          className="auth-input"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          autoComplete="email"
        />
      </div>

      {/* Company */}
      <div className="auth-input-wrapper">
        <MdBusiness className="auth-input-icon" />
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
        />
      </div>

      {/* Role */}
      <div className="auth-input-wrapper">
        <MdWork className="auth-input-icon" />
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
        />
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
          style={{ paddingLeft: '14px' }}
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
