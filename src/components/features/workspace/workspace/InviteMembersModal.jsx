import { useState } from 'react'
import { MdClose, MdEmail, MdGroup, MdAdd, MdCheck, MdError } from 'react-icons/md'

const styles = `
.invite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.invite-modal-dialog {
  display: flex;
  width: 560px;
  max-width: 90%;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-card, #1e293b) 75%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid color-mix(in srgb, var(--border-color, #1e293b) 45%, transparent);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  color: var(--text-main, #ffffff);
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'Outfit', var(--font-family);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invite-modal-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.invite-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  letter-spacing: -0.010em;
}

.invite-modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--text-muted, #94a3b8);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-modal-close:hover {
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 60%, transparent);
  color: var(--text-main, #ffffff);
}

.invite-form-group {
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.invite-form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main, #ffffff);
}

.invite-form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--border-color, #1e293b) 70%, transparent);
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 40%, transparent);
  color: var(--text-main, #ffffff);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.invite-form-input:focus {
  border-color: var(--primary, #3b82f6);
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 60%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #3b82f6) 15%, transparent);
}

.invite-form-input.error {
  border-color: var(--delete-red, #ef4444) !important;
  background: color-mix(in srgb, var(--delete-red, #ef4444) 5%, var(--bg-surface, #0f172a)) !important;
}

.invite-form-error {
  font-size: 11px;
  color: var(--delete-red, #ef4444);
  font-weight: 600;
}

.invite-role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.invite-role-card {
  border: 1px solid color-mix(in srgb, var(--border-color, #1e293b) 60%, transparent);
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 40%, transparent);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.invite-role-card:hover {
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 60%, transparent);
  border-color: color-mix(in srgb, var(--border-color, #1e293b) 80%, transparent);
}

.invite-role-card.selected {
  border-color: var(--primary, #3b82f6);
  background: color-mix(in srgb, var(--primary, #3b82f6) 10%, transparent);
}

.invite-role-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 20px;
}

.invite-role-icon.admin {
  background: color-mix(in srgb, var(--primary, #3b82f6) 15%, transparent);
  color: var(--primary, #3b82f6);
}

.invite-role-icon.member {
  background: color-mix(in srgb, var(--text-muted, #64748b) 15%, transparent);
  color: var(--text-muted, #64748b);
}

.invite-role-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main, #ffffff);
  margin: 0 0 4px 0;
}

.invite-role-description {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  margin: 0;
  line-height: 1.4;
}

.invite-success-message {
  background: color-mix(in srgb, var(--success-green, #10b981) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--success-green, #10b981) 30%, transparent);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.invite-success-icon {
  color: var(--success-green, #10b981);
  font-size: 20px;
  flex-shrink: 0;
}

.invite-success-content h4 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--success-green, #10b981);
}

.invite-success-content p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  line-height: 1.5;
}

.invite-link-box {
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 60%, transparent);
  border: 1px solid var(--border-color, #1e293b);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--text-main, #ffffff);
  word-break: break-all;
}

.invite-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
  width: 100%;
}

.btn-secondary {
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-main, #ffffff);
  border: 1px solid var(--border-color, #1e293b);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: color-mix(in srgb, var(--bg-surface, #0f172a) 60%, transparent);
  border-color: var(--text-muted, #94a3b8);
}

.btn-primary {
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--primary, #3b82f6);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover, #2563eb);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--success-green, #10b981);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-success:hover {
  background: color-mix(in srgb, var(--success-green, #10b981) 85%, black);
}

.invite-loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.invite-multiple-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.invite-email-item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.invite-email-item input {
  flex: 1;
}

.invite-remove-email {
  padding: 8px;
  border: none;
  background: color-mix(in srgb, var(--delete-red, #ef4444) 10%, transparent);
  color: var(--delete-red, #ef4444);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-remove-email:hover {
  background: color-mix(in srgb, var(--delete-red, #ef4444) 20%, transparent);
}

.invite-add-email {
  padding: 8px 16px;
  border: 1px dashed color-mix(in srgb, var(--border-color, #1e293b) 60%, transparent);
  background: transparent;
  color: var(--text-muted, #94a3b8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
}

.invite-add-email:hover {
  border-color: var(--text-muted, #94a3b8);
  color: var(--text-main, #ffffff);
}
`

function InviteMembersModal({ isOpen, onClose, workspace, onInvite, loading, error }) {
  const [formData, setFormData] = useState({
    emails: [''],
    role: 'MEMBER'
  })
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const errors = {}
    const validEmails = formData.emails.filter(email => email.trim())
    
    if (validEmails.length === 0) {
      errors.emails = 'Please add at least one email address'
    } else {
      validEmails.forEach((email, index) => {
        if (!validateEmail(email)) {
          errors[`email_${index}`] = 'Invalid email address'
        }
      })
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return false
    }

    setFormErrors({})
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const validEmails = formData.emails.filter(email => email.trim())
    
    try {
      // TODO: Replace with actual API call using workspaceService
      // const invitePromises = validEmails.map(email => 
      //   workspaceService.inviteMember(workspace.id, { email, role: formData.role })
      // )
      // const results = await Promise.all(invitePromises)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setInviteSuccess({
        emails: validEmails,
        role: formData.role,
        inviteLink: `${window.location.origin}/invite/accept?token=mock-token-${Date.now()}`
      })
      
      // Reset form
      setFormData({ emails: [''], role: 'MEMBER' })
    } catch (err) {
      console.error('Error inviting members:', err)
    }
  }

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails]
    newEmails[index] = value
    setFormData(prev => ({ ...prev, emails: newEmails }))
    
    // Clear error for this email
    if (formErrors[`email_${index}`]) {
      setFormErrors(prev => ({ ...prev, [`email_${index}`]: '' }))
    }
  }

  const addEmailField = () => {
    setFormData(prev => ({ ...prev, emails: [...prev.emails, ''] }))
  }

  const removeEmailField = (index) => {
    if (formData.emails.length > 1) {
      const newEmails = formData.emails.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, emails: newEmails }))
    }
  }

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleClose = () => {
    setInviteSuccess(null)
    setFormData({ emails: [''], role: 'MEMBER' })
    setFormErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <style>{styles}</style>
      <div className="invite-modal-overlay" onClick={handleClose}>
        <div className="invite-modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="invite-modal-header">
            <h2 className="invite-modal-title">Invite Members</h2>
            <button className="invite-modal-close" onClick={handleClose}>
              <MdClose size={20} />
            </button>
          </div>

          {!inviteSuccess ? (
            <form onSubmit={handleSubmit}>
              <div className="invite-form-group">
                <label className="invite-form-label">Email Addresses</label>
                <div className="invite-multiple-inputs">
                  {formData.emails.map((email, index) => (
                    <div key={index} className="invite-email-item">
                      <input
                        type="email"
                        className={`invite-form-input ${formErrors[`email_${index}`] ? 'error' : ''}`}
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder="Enter email address"
                        disabled={loading}
                      />
                      {formData.emails.length > 1 && (
                        <button
                          type="button"
                          className="invite-remove-email"
                          onClick={() => removeEmailField(index)}
                          disabled={loading}
                        >
                          <MdClose size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formErrors.emails && (
                    <div className="invite-form-error">{formErrors.emails}</div>
                  )}
                  {formData.emails.map((email, index) => (
                    formErrors[`email_${index}`] && (
                      <div key={index} className="invite-form-error">
                        {formErrors[`email_${index}`]}
                      </div>
                    )
                  ))}
                  <button
                    type="button"
                    className="invite-add-email"
                    onClick={addEmailField}
                    disabled={loading}
                  >
                    <MdAdd size={16} />
                    Add another email
                  </button>
                </div>
              </div>

              <div className="invite-form-group">
                <label className="invite-form-label">Role</label>
                <div className="invite-role-selection">
                  <div
                    className={`invite-role-card ${formData.role === 'MEMBER' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('MEMBER')}
                  >
                    <div className="invite-role-icon member">
                      <MdGroup />
                    </div>
                    <h3 className="invite-role-title">Member</h3>
                    <p className="invite-role-description">
                      Can view and contribute to projects
                    </p>
                  </div>

                  <div
                    className={`invite-role-card ${formData.role === 'ADMIN' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('ADMIN')}
                  >
                    <div className="invite-role-icon admin">
                      <MdGroup />
                    </div>
                    <h3 className="invite-role-title">Admin</h3>
                    <p className="invite-role-description">
                      Can manage members and settings
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="invite-form-error">{error}</div>
              )}

              <div className="invite-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="invite-loading"></div>
                      Sending Invites...
                    </>
                  ) : (
                    <>
                      <MdEmail />
                      Send Invites
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="invite-success-message">
                <MdCheck className="invite-success-icon" />
                <div className="invite-success-content">
                  <h4>Invitations Sent!</h4>
                  <p>
                    Successfully sent invitations to {inviteSuccess.emails.length} member(s) 
                    as {inviteSuccess.role.toLowerCase()}.
                  </p>
                </div>
              </div>

              <div className="invite-form-group">
                <label className="invite-form-label">Share Invitation Link</label>
                <div className="invite-link-box">
                  {inviteSuccess.inviteLink}
                </div>
              </div>

              <div className="invite-actions">
                <button className="btn-success" onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InviteMembersModal
