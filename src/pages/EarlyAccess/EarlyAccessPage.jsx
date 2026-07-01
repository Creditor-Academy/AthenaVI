import React from 'react'
import EarlyAccess from '../../components/features/auth/authentication/EarlyAccess.jsx'
import loginBg from '../../assets/login_bg.jpg'
import './EarlyAccessPage.css'

function EarlyAccessPage({ onBack }) {
  return (
    <div 
      className="early-access-page" 
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="early-access-page__scrim" />
      
      <button 
        className="early-access-page__back" 
        onClick={onBack}
        aria-label="Back"
      >
        ← Back
      </button>

      <EarlyAccess />
    </div>
  )
}

export default EarlyAccessPage
