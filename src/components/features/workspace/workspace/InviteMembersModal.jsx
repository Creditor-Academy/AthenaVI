import { useState } from 'react'
import { MdClose, MdEmail, MdGroup, MdAdd, MdCheck, MdError } from 'react-icons/md'

const styles = `
.invite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.invite-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.invite-modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.invite-modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-modal-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.invite-form-group {
  margin-bottom: 24px;
}

.invite-form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.invite-form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.invite-form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.invite-form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.invite-form-error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.invite-role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.invite-role-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.invite-role-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.invite-role-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.invite-role-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
}

.invite-role-icon.admin {
  background: #e0e7ff;
  color: #3730a3;
}

.invite-role-icon.member {
  background: #f3f4f6;
  color: #6b7280;
}

.invite-role-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.invite-role-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.invite-success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.invite-success-icon {
  color: #10b981;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.invite-success-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
}

.invite-success-content p {
  margin: 0;
  font-size: 13px;
  color: #15803d;
  line-height: 1.5;
}

.invite-link-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
  word-break: break-all;
}

.invite-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-success {
  padding: 10px 20px;
  border: none;
  background: #10b981;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-success:hover {
  background: #059669;
}

.invite-loading {
  display: inline-block;
  width: 16px;
  height: 16px;
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
  gap: 12px;
}

.invite-email-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.invite-email-item input {
  flex: 1;
}

.invite-remove-email {
  padding: 8px;
  border: none;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.invite-remove-email:hover {
  background: #fecaca;
}

.invite-add-email {
  padding: 8px 16px;
  border: 1px dashed #d1d5db;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.invite-add-email:hover {
  border-color: #9ca3af;
  color: #374151;
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
