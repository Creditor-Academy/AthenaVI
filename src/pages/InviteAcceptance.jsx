import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCheck, MdClose, MdGroup, MdEmail, MdError, MdBusiness } from 'react-icons/md'
import workspaceService from '../services/workspaceService.js'

const styles = `
.invite-acceptance-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.invite-acceptance-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invite-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 40px;
}

.invite-icon-wrapper.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.invite-icon-wrapper.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
}

.invite-icon-wrapper.loading {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.invite-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.invite-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.invite-workspace-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.invite-workspace-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.invite-workspace-type {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
}

.invite-email {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 16px;
  margin-bottom: 24px;
}

.invite-success-details {
  text-align: center;
  padding: 24px;
  background: #f0fdf4;
  border-radius: 16px;
  margin-top: 24px;
}

.invite-success-title {
  font-size: 20px;
  font-weight: 700;
  color: #166534;
  margin: 0 0 8px 0;
}

.invite-success-message {
  color: #15803d;
  font-size: 16px;
  line-height: 1.5;
}

.invite-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1e293b;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .invite-acceptance-card {
    margin: 20px;
    max-width: 100%;
  }
  
  .invite-title {
    font-size: 24px;
  }
  
  .invite-actions {
    flex-direction: column;
  }
}
`

const InviteAcceptance = () => {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(true)
  const [inviteData, setInviteData] = useState(null)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const inviteToken = urlParams.get('token')
    
    if (!inviteToken) {
      setError('No invitation token found')
      setLoading(false)
      setValidating(false)
      return
    }
    
    setToken(inviteToken)
    validateToken(inviteToken)
  }, [])

  const validateToken = async (token) => {
    try {
      // For now, we'll skip validation and assume the token is valid
      // In a real implementation, you might want to create a validation endpoint
      // or handle validation on the backend during acceptance
      
      // Mock validation - assume valid for demo purposes
      setInviteData({
        valid: true,
        workspace: {
          id: 'ws-123',
          name: 'Team Marketing Workspace',
          type: 'TEAM'
        },
        invitedEmail: 'john.doe@example.com'
      })
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to validate invitation')
    } finally {
      setValidating(false)
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!token || !inviteData) return
    
    try {
      setAccepting(true)
      setError('')
      
      const workspace = await workspaceService.acceptInvitation(token)
      
      // Redirect to workspace after successful acceptance
      window.location.href = `/dashboard?workspace=${workspace.id}`
    } catch (err) {
      setError(err.message || 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    // Redirect to home page
    window.location.href = '/'
  }

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="invite-icon-wrapper loading">
            <MdEmail />
          </div>
          <h1 className="invite-title">Validating Invitation</h1>
          <p className="invite-subtitle">
            Please wait while we validate your invitation...
          </p>
        </>
      )
    }

    if (validating) {
      return (
        <>
          <div className="invite-icon-wrapper loading">
            <MdEmail />
          </div>
          <h1 className="invite-title">Validating Invitation</h1>
          <p className="invite-subtitle">
            Please wait while we validate your invitation...
          </p>
        </>
      )
    }

    if (error) {
      return (
        <>
          <div className="invite-icon-wrapper error">
            <MdError />
          </div>
          <h1 className="invite-title">Invalid Invitation</h1>
          <p className="invite-subtitle">
            {error}
          </p>
          <div className="invite-actions">
            <button className="btn-secondary" onClick={handleDecline}>
              Go Home
            </button>
          </div>
        </>
      )
    }

    if (inviteData && inviteData.valid) {
      return (
        <>
          <div className="invite-icon-wrapper success">
            <MdGroup />
          </div>
          <h1 className="invite-title">You're Invited!</h1>
          <div className="invite-info">
            <p>
              You've been invited to join <strong>{inviteData.workspace.name}</strong>
            </p>
            <p className="invite-email">
              <MdEmail />
              {inviteData.invitedEmail}
            </p>
          </div>
          <div className="invite-actions">
            <button 
              className="btn-secondary" 
              onClick={handleDecline}
              disabled={accepting}
            >
              Decline
            </button>
            <button 
              className="btn-primary" 
              onClick={handleAcceptInvitation}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <div className="btn-spinner"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <MdCheck />
                  Accept Invitation
                </>
              )}
            </button>
          </div>
        </>
      )
    }

    return null
  }

  return (
    <>
      <style>{styles}</style>
      <div className="invite-acceptance-container">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="invite-acceptance-card"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default InviteAcceptance
