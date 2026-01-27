import React, { useRef } from 'react'
import { MdClose, MdUploadFile } from 'react-icons/md'
import './ImportPowerPointModal.css'

const ImportPowerPointModal = ({ onClose }) => {
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
    <div className="ppt-modal-overlay" onClick={(e) => {
        if(e.target === e.currentTarget) onClose()
    }}>
      <div className="ppt-modal-content">
        <button className="ppt-close-btn" onClick={onClose} aria-label="Close modal">
          <MdClose size={20} />
        </button>
        
        <div className="ppt-left-panel">
          <h2 className="ppt-title">Import PowerPoint</h2>
          
          <div className="ppt-upload-area" onClick={handleClick}>
            <div className="file-shape">
              <MdUploadFile size={28} />
            </div>
            <span className="ppt-drop-text">Drag & drop your .pptx file</span>
            <button className="ppt-choose-btn">Choose file</button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pptx,.ppt" 
                style={{ display: 'none' }} 
            />
          </div>
        </div>

        <div className="ppt-right-panel">
          <p className="ppt-info-text">
            You can edit text, images, videos, and shapes after import
          </p>
          
          <div className="ppt-icon-large">
             <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <linearGradient id="bgGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF8F71" />
                      <stop offset="100%" stopColor="#EF6244" />
                   </linearGradient>
                   <filter id="dropshadow" height="130%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                      <feOffset dx="2" dy="2" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                      </feComponentTransfer>
                      <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                      </feMerge>
                    </filter>
                </defs>
                
                {/* Main Circle Background */}
                <circle cx="60" cy="60" r="50" fill="url(#bgGradient)" />
                
                {/* Pie Chart Segment (Visual Interest) */}
                <path d="M60 10 A50 50 0 0 1 110 60 L60 60 Z" fill="#ffffff" fillOpacity="0.15" />
                <path d="M60 60 L10 60 A50 50 0 0 0 60 110 Z" fill="#000000" fillOpacity="0.1" />

                {/* The 'P' Square */}
                <rect x="35" y="35" width="50" height="50" rx="8" fill="#C12F2F" filter="url(#dropshadow)" />
                <text x="60" y="73" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="#ffffff" textAnchor="middle">P</text>
             </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportPowerPointModal
