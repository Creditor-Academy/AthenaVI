import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import AuthLoginVideo from '../../components/ui/AnimatedAvatar/AuthLoginVideo.jsx'
import AuthShellBubbles from '../../components/ui/AnimatedAvatar/AuthShellBubbles.jsx'
import Login from '../../components/features/auth/authentication/Login.jsx'
import Signup from '../../components/features/auth/authentication/Signup.jsx'
import ForgotPassword from '../../components/features/auth/authentication/ForgotPassword.jsx'
import './auth-forms.css'
import './AuthPage.css'

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
}

function AuthPage({ onAuthComplete, onBack, initialMode = 'login' }) {
  const { isAuthenticated, loading } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!loading && isAuthenticated && onAuthComplete) {
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

  const switchToSignup = () => {
    setDirection(1)
    setMode('signup')
  }

  const switchToLogin = () => {
    setDirection(-1)
    setMode('login')
  }

  const isLogin = mode === 'login'
  const formKey = showForgotPassword ? 'forgot' : mode

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
      <AuthShellBubbles />
      <div className="auth-card">
        {/* ── Left brand panel ── */}
        <aside className="auth-panel auth-panel--brand">
          <AuthLoginVideo />
          <div className="auth-panel__scrim" aria-hidden="true" />

          <div className="auth-panel__wordmark">
            <span className="auth-panel__play-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            </span>
            <span className="auth-panel__brand-name">Athena VI</span>
          </div>

          <div className="auth-panel__center">
            <h1 className="auth-panel__tagline">Where every lesson comes alive.</h1>
            <p className="auth-panel__subcopy">
              Turn lessons into lifelike avatar videos in minutes.
            </p>
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="auth-panel auth-panel--form">
          <button type="button" className="auth-panel__back" onClick={onBack}>
            ← Back
          </button>

          <div className="auth-form-panel">
            {!showForgotPassword && isLogin && (
              <header className="auth-form-panel__header">
                <h2>Your studio awaits</h2>
                <p>Sign in and turn your next lesson into a lifelike avatar video.</p>
              </header>
            )}

            {!showForgotPassword && !isLogin && (
              <header className="auth-form-panel__header">
                <h2>Lights, camera — let&apos;s go</h2>
                <p>Create your account and start building with AI avatars.</p>
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
                    />
                  ) : (
                    <Signup onSuccess={onAuthComplete} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {!showForgotPassword && (
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthPage
