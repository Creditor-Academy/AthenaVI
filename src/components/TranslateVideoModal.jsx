import React, { useRef } from 'react'
import { MdClose, MdUploadFile, MdAccountBalanceWallet } from 'react-icons/md'
import { FaYoutube } from 'react-icons/fa'
import './TranslateVideoModal.css'

const TranslateVideoModal = ({ onClose }) => {
    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('File selected:', file.name)
            // Here you would handle the actual upload
        }
    }

    return (
        <div className="dub-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
        }}>
            <div className="dub-modal-content">
                <button className="dub-close-btn" onClick={onClose} aria-label="Close modal">
                    <MdClose size={20} />
                </button>

                <div className="dub-left-panel">
                    <h2 className="dub-title">AI Dubbing</h2>

                    <div className="dub-upload-area" onClick={handleClick}>
                        <div className="dub-upload-icon">
                            <MdUploadFile size={28} />
                        </div>
                        <div className="dub-upload-title">Click or drag to upload</div>
                        <div className="dub-upload-subtitle">mp4, mov, webm supported. Up to 5GB or 2.5h</div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".mp4,.mov,.webm"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="dub-divider">or</div>

                    <div className="dub-youtube-input-wrapper">
                        <FaYoutube className="dub-youtube-icon" />
                        <input type="text" className="dub-youtube-input" placeholder="Paste a YouTube link" />
                    </div>
                    <div className="dub-input-hint">Up to 2 minutes. Longer videos will be trimmed.</div>

                    <div className="dub-credits-footer">
                        <MdAccountBalanceWallet size={16} className="dub-credits-highlight" />
                        <span className="dub-credits-highlight">63,576 credits</span>
                        available to your workspace.
                    </div>
                </div>

                <div className="dub-right-panel">
                    <h3 className="dub-info-title">
                        Translate any video into 139 languages with the original voice
                    </h3>

                    <div className="dub-badges-container">
                        <div className="dub-lang-badge">
                            <span role="img" aria-label="Spanish">🇪🇸</span> Spanish (ES)
                        </div>
                        <div className="dub-lang-badge">
                            <span role="img" aria-label="English">🇬🇧</span> English (GB)
                        </div>
                        <div className="dub-lang-badge">
                            <span role="img" aria-label="Italian">🇮🇹</span> Italian (IT)
                        </div>
                    </div>

                    <div className="dub-legal-text">
                        By using this service, you confirm you have all necessary rights, licenses and permissions to upload and dub this content, and that your use of any dubbed content will be in accordance with the <span className="dub-legal-link">Acceptable Use Policy</span> and in compliance with applicable regulations related to intellectual property and data privacy.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TranslateVideoModal
