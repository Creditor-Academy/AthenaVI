import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import AuthLoginVideo from '../../components/ui/AnimatedAvatar/AuthLoginVideo.jsx'
import Login from '../../components/features/auth/authentication/Login.jsx'
import Signup from '../../components/features/auth/authentication/Signup.jsx'
import ForgotPassword from '../../components/features/auth/authentication/ForgotPassword.jsx'
import invitationFlowService from '../../services/invitationFlowService.js'
import {
  getPendingInvitation,
  getPendingInvitationPreview,
} from '../../utils/inviteNavigation.js'
import './auth-forms.css'
import './AuthPage.css'
import { applySeoHead } from '../../seo/applySeoHead.js'
import { browserPathFor } from '../../seo/seoRoutes.js'

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
}

const inviteBannerStyle = {
  backgroundColor: '#e8f1fa',
  color: '#144f8a',
  padding: '12px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: 1.45,
  marginBottom: '16px',
  border: '1px solid #bfdbfe',
}

function AuthPage({ onAuthComplete, onBack, initialMode = 'login' }) {
  const { isAuthenticated, loading } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [direction, setDirection] = useState(0)

  const pendingInvite = useMemo(() => getPendingInvitation(), [])
  const invitePreview = useMemo(() => getPendingInvitationPreview(), [])
  const hasPendingInvite = Boolean(pendingInvite?.token)

  const handleInviteSignupComplete = useCallback((workspace) => {
    if (workspace?.id) {
      invitationFlowService.finishInviteWithWorkspace(workspace)
      return
    }
    onAuthComplete?.()
  }, [onAuthComplete])

  const handleInviteLoginSuccess = useCallback(async () => {
    onAuthComplete?.()
  }, [onAuthComplete])

  useEffect(() => {
    if (!loading && isAuthenticated && onAuthComplete && !getPendingInvitation()) {
      onAuthComplete()
    }
  }, [isAuthenticated, loading, onAuthComplete])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // A visit that started on /early-access stays an early-access sign-up (its own H1 and URL).
  const [isEarlyAccess] = useState(() => /^\/early-access\/?$/.test(window.location.pathname))

  /** Keep the address bar, title and H1 in step with the form shown (only on the sign-in URLs). */
  const showFormUrl = (nextMode) => {
    if (!/^\/(login|signup|early-access)\/?$/.test(window.location.pathname)) return
    const url = browserPathFor(nextMode === 'login' ? '/login' : isEarlyAccess ? '/early-access' : '/signup')
    if (window.location.pathname === url) return
    window.history.replaceState({ ...(window.history.state || {}), view: 'login' }, '', url)
    applySeoHead(url)
  }

  const switchToSignup = () => {
    setDirection(1)
    setMode('signup')
    setShowForgotPassword(false)
    showFormUrl('signup')
  }

  const switchToLogin = () => {
    setDirection(-1)
    setMode('login')
    setShowForgotPassword(false)
    showFormUrl('login')
  }

  const isLogin = mode === 'login'
  const formKey = showForgotPassword ? 'forgot' : mode
  const workspaceName =
    invitePreview?.workspace?.name ||
    pendingInvite?.workspaceName ||
    'your workspace'

  if (loading) {
    return (
      <div className="auth-shell auth-shell--loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-panel auth-panel--brand">
          <AuthLoginVideo />
          <div className="auth-panel__scrim" aria-hidden="true" />

          <div className="auth-panel__wordmark">
            <span className="auth-panel__play-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            </span>
            <span className="auth-panel__brand-name">Virtual Studio</span>
          </div>

          <div className="auth-panel__center">
            <p className="auth-panel__tagline">Where every lesson comes alive.</p>
            <p className="auth-panel__subcopy">
              Turn lessons into lifelike avatar videos in minutes.
            </p>
          </div>
        </aside>

        <main className="auth-panel auth-panel--form">
          <button type="button" className="auth-panel__back" onClick={onBack}>
            ← Back
          </button>

          <div className="auth-form-panel">
            {hasPendingInvite && !showForgotPassword && (
              <div style={inviteBannerStyle} role="status">
                You&apos;re joining <strong>{workspaceName}</strong>
                {pendingInvite?.email ? ` as ${pendingInvite.email}` : ''}.
              </div>
            )}

            {!showForgotPassword && isLogin && (
              <header className="auth-form-panel__header">
                <h1>Your studio awaits</h1>
                <p>
                  {hasPendingInvite
                    ? 'Sign in to accept your workspace invitation.'
                    : 'Sign in and turn your next lesson into a lifelike avatar video.'}
                </p>
              </header>
            )}

            {!showForgotPassword && !isLogin && (
              <header className="auth-form-panel__header">
                <h1>{isEarlyAccess ? 'Get early access' : <>Lights, camera &mdash; let&apos;s go</>}</h1>
                <p>
                  {hasPendingInvite
                    ? 'Create your account to join the invited workspace.'
                    : 'Create your account and start building with AI avatars.'}
                </p>
              </header>
            )}

            <div className="auth-form-panel__stage">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={formKey}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`auth-form-panel__body ${showForgotPassword ? 'auth-form-panel__body--forgot' : ''}`}
                >
                  {showForgotPassword ? (
                    <ForgotPassword
                      onBack={() => setShowForgotPassword(false)}
                      onSuccess={onAuthComplete}
                    />
                  ) : isLogin ? (
                    <Login
                      onSuccess={onAuthComplete}
                      onForgotPassword={() => setShowForgotPassword(true)}
                      inviteMode={hasPendingInvite}
                      lockedEmail={pendingInvite?.email || ''}
                      onInviteLoginSuccess={handleInviteLoginSuccess}
                      invitationToken={pendingInvite?.token || ''}
                    />
                  ) : (
                    <Signup
                      onSuccess={onAuthComplete}
                      inviteMode={hasPendingInvite}
                      lockedEmail={pendingInvite?.email || ''}
                      invitationToken={pendingInvite?.token || ''}
                      onSwitchToLogin={switchToLogin}
                      onInviteComplete={handleInviteSignupComplete}
                      onInvalidInvite={() => {
                        if (pendingInvite?.token) {
                          window.location.assign(`/invitations/accept/${pendingInvite.token}`)
                        }
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {!showForgotPassword && !hasPendingInvite && (
              <p className="auth-form-panel__footer">
                {isLogin ? (
                  <>
                    New here?{' '}
                    <button type="button" onClick={switchToSignup}>
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={switchToLogin}>
                      Log in
                    </button>
                  </>
                )}
              </p>
            )}

            {!showForgotPassword && hasPendingInvite && (
              <p className="auth-form-panel__footer">
                {isLogin ? (
                  <>
                    Need an account?{' '}
                    <button type="button" onClick={switchToSignup}>
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={switchToLogin}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthPage
