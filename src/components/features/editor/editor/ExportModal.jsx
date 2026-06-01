import React, { useState, useEffect } from 'react';
import workspaceService from '../../../../services/workspaceService';
import { MdClose } from 'react-icons/md';

const ExportModal = ({ showExportModal, setShowExportModal, calculateCredits, workspaceId, projectId }) => {
  const [exportFormat, setExportFormat] = useState('MP4');
  const [exportResolution, setExportResolution] = useState('1920x1080');
  const [exportFrameRate, setExportFrameRate] = useState('30');
  const [exportQuality, setExportQuality] = useState('High');

  // Renders state
  const [renders, setRenders] = useState([]);
  const [rendersLoading, setRendersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'history'
  const [isExporting, setIsExporting] = useState(false);

  // Fetch renders history
  const fetchRenders = async (silent = false) => {
    if (!workspaceId || !projectId) return;
    try {
      if (!silent) setRendersLoading(true);
      const data = await workspaceService.listRenders(workspaceId, projectId);
      setRenders(data || []);
    } catch (err) {
      console.error('Failed to fetch renders:', err);
    } finally {
      if (!silent) setRendersLoading(false);
    }
  };

  // Poll active renders
  useEffect(() => {
    if (!showExportModal || !workspaceId || !projectId) return;

    fetchRenders();

    // Setup interval to poll renders list every 4 seconds
    const interval = setInterval(async () => {
      try {
        const data = await workspaceService.listRenders(workspaceId, projectId);
        setRenders(data || []);
      } catch (err) {
        console.error('Polling renders failed:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [showExportModal, workspaceId, projectId]);

  // Credit calculation function
  const calculateCreditsLocal = () => {
    let baseCredits = 100;
    
    // Format multipliers
    const formatMultipliers = {
      'MP4': 1.0,
      'WebM': 0.8,
      'GIF': 0.5
    };
    
    // Resolution multipliers
    const resolutionMultipliers = {
      '1920x1080': 1.0,
      '1280x720': 0.7,
      '3840x2160': 2.0
    };
    
    // Frame rate multipliers
    const frameRateMultipliers = {
      '30': 1.0,
      '24': 0.8,
      '60': 1.5
    };
    
    // Quality multipliers
    const qualityMultipliers = {
      'High': 1.2,
      'Medium': 1.0,
      'Low': 0.7
    };
    
    const formatMultiplier = formatMultipliers[exportFormat] || 1.0;
    const resolutionMultiplier = resolutionMultipliers[exportResolution] || 1.0;
    const frameRateMultiplier = frameRateMultipliers[exportFrameRate] || 1.0;
    const qualityMultiplier = qualityMultipliers[exportQuality] || 1.0;
    
    const totalCredits = Math.round(baseCredits * formatMultiplier * resolutionMultiplier * frameRateMultiplier * qualityMultiplier);
    
    return totalCredits;
  };

  const handleStartExport = async () => {
    if (!workspaceId || !projectId) {
      alert('Cannot start export: Workspace or Project ID is missing.');
      return;
    }

    try {
      setIsExporting(true);
      await workspaceService.createRender(workspaceId, projectId, { forceRebuild: false });
      await fetchRenders(true);
      setActiveTab('history');
    } catch (err) {
      console.error('Export failed to start:', err);
      alert(err.message || 'Failed to start export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadRender = async (renderId) => {
    try {
      const response = await workspaceService.downloadRender(workspaceId, projectId, renderId);
      if (response && response.presignedUrl) {
        window.open(response.presignedUrl, '_blank');
      } else {
        alert('Download URL not available');
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert(err.message || 'Failed to download render');
    }
  };

  if (!showExportModal) return null;

  const hasActiveRenders = renders.some(r => r.status === 'queued' || r.status === 'rendering' || r.status === 'processing');

  return (
    <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
        <h2 className="modal-title">Export Video</h2>
        
        {/* Tab Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <button
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'settings' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: activeTab === 'settings' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              outline: 'none'
            }}
            onClick={() => setActiveTab('settings')}
          >
            Export Settings
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: activeTab === 'history' ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
            onClick={() => setActiveTab('history')}
          >
            Export History
            {hasActiveRenders && (
              <span className="spinner-small" style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: '1.5px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
            )}
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '260px' }}>
          {activeTab === 'settings' && (
            <>
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
                backgroundColor: 'var(--bg-panel)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>Credit Consumption:</span>
                  <span style={{
                    color: '#10b981',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {calculateCreditsLocal()} credits
                  </span>
                </div>
                <div style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  Credits vary based on format, resolution, frame rate, and quality
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {rendersLoading && renders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  Loading history...
                </div>
              ) : renders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No previous exports. Start an export to compile this video.
                </div>
              ) : (
                renders.map((r) => {
                  const status = String(r.status || '').toLowerCase();
                  const isProgress = status === 'queued' || status === 'rendering' || status === 'processing';
                  const progressVal = r.progress != null ? `${Math.round(r.progress * 100)}%` : '';

                  return (
                    <div key={r.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                          Export #{r.id?.substring(0, 6)}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: status === 'completed'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : status === 'failed'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : 'rgba(59, 130, 246, 0.1)',
                          color: status === 'completed'
                            ? '#10b981'
                            : status === 'failed'
                              ? '#ef4444'
                              : '#3b82f6'
                        }}>
                          {status === 'completed' ? 'Ready' : status === 'failed' ? 'Failed' : `Compiling ${progressVal}`}
                        </span>
                        {status === 'completed' && (
                          <button
                            onClick={() => handleDownloadRender(r.id)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#fff',
                              backgroundColor: '#10b981',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
            Close
          </button>
          {activeTab === 'settings' && (
            <button 
              className="btn-primary" 
              onClick={handleStartExport}
              disabled={isExporting}
            >
              {isExporting ? 'Starting...' : 'Start Export'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportModal;
