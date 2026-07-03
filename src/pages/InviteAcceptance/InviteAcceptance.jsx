import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MdCheck, MdGroup, MdEmail, MdError } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext.jsx'
import workspaceService from '../../services/workspaceService.js'
import invitationFlowService from '../../services/invitationFlowService.js'
import logoImg from '../../assets/herologo.png'
import {
  parseInvitationTokenFromUrl,
  buildInvitationHeadline,
  savePendingInvitation,
  savePendingInvitationPreview,
} from '../../utils/inviteNavigation.js'
import './InviteAcceptance.css'

const InviteAcceptance = () => {
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth()
  const [token, setToken] = useState('')
  const [invitation, setInvitation] = useState(null)
  const [pageMode, setPageMode] = useState('loading')
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  const headline = useMemo(
    () => (invitation ? buildInvitationHeadline(invitation) : ''),
    [invitation]
  )

  const persistInviteContext = useCallback(() => {
    if (!token || !invitation) return
    savePendingInvitation({
      token,
      email: invitation.email,
      workspaceId: invitation.workspace?.id,
      workspaceName: invitation.workspace?.name,
    })
    savePendingInvitationPreview(invitation)
  }, [token, invitation])

  const loadPreview = useCallback(async (inviteToken) => {
    setPageMode('loading')
    setError('')
    try {
      const preview = await workspaceService.getInvitationPreview(inviteToken)
      setInvitation(preview)
      savePendingInvitation({
        token: inviteToken,
        email: preview.email,
        workspaceId: preview.workspace?.id,
        workspaceName: preview.workspace?.name,
      })
      savePendingInvitationPreview(preview)
      setPageMode('ready')
    } catch (err) {
      setInvitation(null)
      setError(err.message || 'This invitation is no longer valid')
      setPageMode('invalid')
    }
  }, [])

  useEffect(() => {
    const inviteToken = parseInvitationTokenFromUrl()
    if (!inviteToken) {
      setError('No invitation token found. Please use the link from your invitation email.')
      setPageMode('invalid')
      return
    }
    setToken(inviteToken)
  }, [])

  useEffect(() => {
    if (!token || authLoading) return
    loadPreview(token)
  }, [token, authLoading, loadPreview])

  useEffect(() => {
    if (!invitation || authLoading || accepting || pageMode !== 'ready') return
    if (
      isAuthenticated &&
      user?.email &&
      user.email.toLowerCase() !== invitation.email.toLowerCase()
    ) {
      setPageMode('wrongAccount')
    }
  }, [invitation, isAuthenticated, authLoading, user?.email, accepting, pageMode])

  const handleAcceptInvitation = async () => {
    if (!token || !invitation) return

    persistInviteContext()

    const isCorrectAccount =
      isAuthenticated &&
      user?.email &&
      user.email.toLowerCase() === invitation.email.toLowerCase()

    if (!isAuthenticated || !isCorrectAccount) {
      if (isAuthenticated && user?.email && !isCorrectAccount) {
        setPageMode('wrongAccount')
        return
      }
      const authPath = '/login'
      window.location.assign(authPath)
      return
    }

    setAccepting(true)
    setError('')
    try {
      const workspace = await invitationFlowService.completePendingInvitation()
      invitationFlowService.redirectAfterInvite(workspace || invitation.workspace)
    } catch (err) {
      const message = err.message || 'Failed to accept invitation'
      if (message.toLowerCase().includes('different email')) {
        setError(`Sign in with ${invitation.email} to accept this invitation.`)
        setPageMode('wrongAccount')
      } else if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
        setPageMode('invalid')
        setError('This invitation is no longer valid')
      } else {
        setError(message)
      }
    } finally {
      setAccepting(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    setPageMode('ready')
    setError('')
    if (token) {
      await loadPreview(token)
    }
  }

  const handleDecline = () => {
    window.location.href = '/'
  }

  const isBusy = pageMode === 'loading' || authLoading

  const renderBody = () => {
    if (isBusy) {
      return (
        <>
          <div className="invite-icon-badge invite-icon-badge--loading">
            <MdEmail />
          </div>
          <h1 className="invite-title">Checking your invitation</h1>
          <p className="invite-subtitle">
            Please wait while we prepare your workspace access&hellip;
          </p>
        </>
      )
    }

    if (pageMode === 'invalid') {
      return (
        <>
          <div className="invite-icon-badge invite-icon-badge--error">
            <MdError />
          </div>
          <h1 className="invite-title">Invitation unavailable</h1>
          <p className="invite-subtitle">
            This link may have expired or already been used.
          </p>
          {error && (
            <div className="invite-error-banner" role="alert">
              {error}
            </div>
          )}
          <div className="invite-actions">
            <button type="button" className="invite-btn invite-btn--secondary" onClick={handleDecline}>
              Go to homepage
            </button>
          </div>
        </>
      )
    }

    if (!invitation) return null

    return (
      <>
        <div className="invite-icon-badge invite-icon-badge--success">
          <MdGroup />
        </div>
        <h1 className="invite-title">You&apos;re invited!</h1>
        <p className="invite-subtitle">{headline}</p>
        <p className="invite-subtitle invite-subtitle--role">
          You&apos;ll join as <strong>{invitation.role}</strong>.
        </p>

        <div className="invite-workspace-card">
          <p className="invite-workspace-card__label">Workspace invitation</p>
          <p className="invite-workspace-card__name">
            <MdGroup size={22} aria-hidden />
            {invitation.workspace?.name || 'Workspace'}
          </p>
          <p className="invite-workspace-card__meta">
            Invited as {invitation.email}
          </p>
        </div>

        {pageMode === 'wrongAccount' && (
          <div className="invite-error-banner" role="alert">
            This invite was sent to <strong>{invitation.email}</strong>. Sign out and use that account.
          </div>
        )}

        {error && pageMode !== 'wrongAccount' && (
          <div className="invite-error-banner" role="alert">
            {error}
          </div>
        )}

        <div className="invite-actions">
          {pageMode === 'wrongAccount' ? (
            <button type="button" className="invite-btn invite-btn--primary" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="invite-btn invite-btn--secondary"
                onClick={handleDecline}
                disabled={accepting}
              >
                Decline
              </button>
              <button
                type="button"
                className="invite-btn invite-btn--primary"
                onClick={handleAcceptInvitation}
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <span className="invite-btn__spinner" aria-hidden />
                    Accepting&hellip;
                  </>
                ) : (
                  <>
                    <MdCheck size={18} aria-hidden />
                    Accept invitation
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {!isAuthenticated && pageMode === 'ready' && (
          <p className="invite-footer-note">
            You&apos;ll be asked to sign in to complete this invitation.
          </p>
        )}
      </>
    )
  }

  return (
    <div className="invite-shell">
      <div className="invite-card">
        <div className="invite-brand">
          <img src={logoImg} alt="Virtual Studio" className="invite-brand__logo" />
        </div>
        {renderBody()}
      </div>
    </div>
  )
}

export default InviteAcceptance
