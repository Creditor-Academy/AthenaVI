import React from 'react'
import './SessionExpiredModal.css'

export default function SessionExpiredModal({ isOpen = true, onLogoutAndLogin }) {
  if (!isOpen) return null

  return (
    <div
      className="session-expired-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="session-expired-card">
        <div className="session-expired-icon-wrapper">
          <div className="session-expired-pulse" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div className="session-expired-badge">
          <span>Session Security</span>
        </div>

        <h2 id="session-expired-title" className="session-expired-title">
          Session Expired
        </h2>

        <p id="session-expired-desc" className="session-expired-message">
          Your security token has expired or your session is no longer valid.
          Please log out and sign back in to continue working securely.
        </p>

        <div className="session-expired-actions">
          <button
            type="button"
            className="session-expired-btn-primary"
            onClick={onLogoutAndLogin}
            autoFocus
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out & Log In Again
          </button>
        </div>
      </div>
    </div>
  )
}
