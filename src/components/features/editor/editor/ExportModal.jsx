import { useState } from 'react'

const ExportModal = ({ showExportModal, setShowExportModal, calculateCredits }) => {
  const [exportFormat, setExportFormat] = useState('MP4')
  const [exportResolution, setExportResolution] = useState('1920x1080')
  const [exportFrameRate, setExportFrameRate] = useState('30')
  const [exportQuality, setExportQuality] = useState('High')

  // Credit calculation function
  const calculateCreditsLocal = () => {
    let baseCredits = 100
    
    // Format multipliers
    const formatMultipliers = {
      'MP4': 1.0,
      'WebM': 0.8,
      'GIF': 0.5
    }
    
    // Resolution multipliers
    const resolutionMultipliers = {
      '1920x1080': 1.0,
      '1280x720': 0.7,
      '3840x2160': 2.0
    }
    
    // Frame rate multipliers
    const frameRateMultipliers = {
      '30': 1.0,
      '24': 0.8,
      '60': 1.5
    }
    
    // Quality multipliers
    const qualityMultipliers = {
      'High': 1.2,
      'Medium': 1.0,
      'Low': 0.7
    }
    
    const formatMultiplier = formatMultipliers[exportFormat] || 1.0
    const resolutionMultiplier = resolutionMultipliers[exportResolution] || 1.0
    const frameRateMultiplier = frameRateMultipliers[exportFrameRate] || 1.0
    const qualityMultiplier = qualityMultipliers[exportQuality] || 1.0
    
    const totalCredits = Math.round(baseCredits * formatMultiplier * resolutionMultiplier * frameRateMultiplier * qualityMultiplier)
    
    return totalCredits
  }

  if (!showExportModal) return null

  return (
    <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Export Video</h2>
        <div className="modal-body">
          <div className="property-group">
            <div className="property-row">
              <label className="property-label">Format</label>
              <select 
                className="property-input"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option>MP4</option>
                <option>WebM</option>
                <option>GIF</option>
              </select>
            </div>
            <div className="property-row">
              <label className="property-label">Resolution</label>
              <select 
                className="property-input"
                value={exportResolution}
                onChange={(e) => setExportResolution(e.target.value)}
              >
                <option>1920x1080</option>
                <option>1280x720</option>
                <option>3840x2160</option>
              </select>
            </div>
            <div className="property-row">
              <label className="property-label">Frame Rate</label>
              <select 
                className="property-input"
                value={exportFrameRate}
                onChange={(e) => setExportFrameRate(e.target.value)}
              >
                <option>30</option>
                <option>24</option>
                <option>60</option>
              </select>
            </div>
            <div className="property-row">
              <label className="property-label">Quality</label>
              <select 
                className="property-input"
                value={exportQuality}
                onChange={(e) => setExportQuality(e.target.value)}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          {/* Credit Display */}
          <div className="credit-display" style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dadce0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#202124', fontSize: '14px', fontWeight: '500' }}>Credit Consumption:</span>
              <span style={{
                color: '#34a853',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {calculateCreditsLocal()} credits
              </span>
            </div>
            <div style={{
              color: '#5f6368',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              Credits vary based on format, resolution, frame rate, and quality
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={() => {
            alert(`Video export started! This will consume ${calculateCreditsLocal()} credits.`)
            setShowExportModal(false)
          }}>
            Start Export
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
