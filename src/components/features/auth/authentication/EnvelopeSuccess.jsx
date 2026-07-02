import React, { useState, useEffect } from 'react'
import './EnvelopeSuccess.css'

function EnvelopeSuccess({ email, onReset }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Open the envelope after a short delay
    const timer = setTimeout(() => setIsOpen(true), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="env-wrapper">
      <div className={`env-container ${isOpen ? 'open' : ''}`}>
        <div className="env-envelope">
          <div className="env-flap-back"></div>
          <div className="env-letter">
            <h3 className="env-title">You're on the list!</h3>
            <p className="env-body">
              Thanks for requesting early access to Virtual Studio.
            </p>
            <p className="env-sub">
              Our team will review your request and get back to you at <strong>{email}</strong> shortly.
            </p>
          </div>
          <div className="env-flap-bottom"></div>
          <div className="env-flap-left"></div>
          <div className="env-flap-right"></div>
          <div className="env-flap-top"></div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <button className="env-retry-btn" onClick={onReset}>
          Submit another request
        </button>
      </div>
    </div>
  )
}

export default EnvelopeSuccess
