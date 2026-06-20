import React from 'react'
import { MdClose, MdRecordVoiceOver, MdSmartDisplay } from 'react-icons/md'
import './PresenterModeModal.css'

export default function PresenterModeModal({
  isOpen,
  onClose,
  onChooseAvatar,
  onChooseVoiceOnly,
}) {
  if (!isOpen) return null

  return (
    <div
      className="pm-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="pm-modal">
        <div className="pm-head">
          <div style={{ minWidth: 0 }}>
            <div className="pm-title">Set up presenter</div>
            <div className="pm-subtitle">
              What do you want for this scene?
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close">
            <MdClose size={18} />
          </button>
        </div>

        <div className="pm-body pm-grid">
          <div className="pm-card pm-card--primary">
            <div className="pm-card-top">
              <div className="pm-icon" aria-hidden>
                <MdSmartDisplay size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="pm-option-title">
                  Talking avatar video <span className="pm-badge pm-badge--primary">Recommended</span>
                </div>
                <div className="pm-option-desc">
                  Creates a presenter MP4 (voice + lip‑sync included).
                </div>
              </div>
            </div>

            <div className="pm-bestfor">
              <span className="pm-bestfor-label">Best for</span>
              <span className="pm-bestfor-value">On‑camera presenter scenes</span>
            </div>

            <div className="pm-bullets">
              <span>• Lip‑sync + motion</span>
              <span>• Audio included</span>
              <span>• Most realistic</span>
            </div>
            <button type="button" className="pm-cta pm-cta--primary" onClick={() => onChooseAvatar?.()}>
              Create talking avatar
            </button>
          </div>

          <div className="pm-card">
            <div className="pm-card-top">
              <div className="pm-icon pm-icon--voice" aria-hidden>
                <MdRecordVoiceOver size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="pm-option-title">Voice‑only narration</div>
                <div className="pm-option-desc">
                  Creates an MP3 narration track (no avatar layer).
                </div>
              </div>
            </div>

            <div className="pm-bestfor pm-bestfor--voice">
              <span className="pm-bestfor-label">Best for</span>
              <span className="pm-bestfor-value">Slides, b‑roll, explainers</span>
            </div>

            <div className="pm-bullets">
              <span>• Faster to generate</span>
              <span>• Clean voiceover</span>
              <span>• No avatar</span>
            </div>
            <button type="button" className="pm-cta" onClick={() => onChooseVoiceOnly?.()}>
              Create narration audio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

