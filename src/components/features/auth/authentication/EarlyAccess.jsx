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
import { MdPerson, MdEmail, MdBusiness, MdWork, MdSend, MdCheckCircle, MdStar } from 'react-icons/md'

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
      `Sent from AthenaVI Early Access Form`
    )

    const mailtoLink = `mailto:${EARLY_ACCESS_EMAIL}?subject=${subject}&body=${body}`

    // Simulate async + open mail client
    setTimeout(() => {
      window.location.href = mailtoLink
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  if (submitted) {
    return (
      <div className="ea-success">
        <div className="ea-success__icon-ring">
          <MdCheckCircle className="ea-success__icon" />
        </div>
        <h3 className="ea-success__title">You're on the list!</h3>
        <p className="ea-success__body">
          Your early access request has been sent to our team. We'll review your details and reach out
          to <strong>{formData.email}</strong> soon.
        </p>
        <div className="ea-success__badge">
          <MdStar style={{ fontSize: 14, marginRight: 5 }} />
          Expected review time: 1–3 business days
        </div>
        <button
          className="ea-retry-btn"
          onClick={() => {
            setSubmitted(false)
            setFormData({ name: '', email: '', company: '', role: '', useCase: '', message: '' })
          }}
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form className="auth-form ea-form" onSubmit={handleSubmit} noValidate>
      {/* Badge */}
      <div className="ea-badge">
        <span className="ea-badge__dot" />
        Limited spots available
      </div>

      {error && (
        <div className="ea-error">{error}</div>
      )}

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
        className="auth-submit-btn ea-submit-btn"
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
        By submitting, you agree to be contacted by the AthenaVI team. No spam, ever.
      </p>
    </form>
  )
}

export default EarlyAccess
