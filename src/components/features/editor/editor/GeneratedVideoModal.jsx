import React, { useState } from 'react';
import { MdClose, MdGeneratingTokens } from 'react-icons/md';
import projectTemplate from '../../../../constants/projectTemplate.json';
import TemplatePreview from '../../../TemplatePreview';

const GeneratedVideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  creditsUsed = null,
  onUseInEditor,
  onRemake,
  onSelectLayout,
}) => {
  const [activeLayout, setActiveLayout] = useState(null);

  if (!isOpen) return null;

  // Fetch the exact same templates that we use for the canvas
  const templates = projectTemplate.project.scenes.map(s => ({
    id: s.id,
    name: s.title,
    templateData: s
  }));

  const handleLayoutClick = (layoutId) => {
    setActiveLayout(layoutId);
  };

  const handleApplyLayout = () => {
    if (activeLayout && onSelectLayout) {
      onSelectLayout(activeLayout);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '360px', /* Avoids overlapping the right properties panel */
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        width: '360px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'var(--text-main, #f8fafc)',
            cursor: 'pointer',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <MdClose size={16} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ color: 'var(--text-main, #f8fafc)', margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✨</span> AI Presenter Ready
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontSize: '12px', paddingRight: '20px' }}>
            Your presenter is already centered on the scene. Preview below, or optionally replace the layout with a template.
          </p>
        </div>

        {creditsUsed != null && Number(creditsUsed) > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(91, 58, 122, 0.14)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#e9d5ff',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            <MdGeneratingTokens size={16} aria-hidden />
            <span>
              {Number(creditsUsed).toLocaleString()} credit{Number(creditsUsed) === 1 ? '' : 's'} used
            </span>
          </div>
        )}

        {videoUrl ? (
          <div style={{ 
            width: '100%', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            background: '#000', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: 'var(--text-muted, #94a3b8)',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <p style={{ margin: 0, fontSize: '13px' }}>Video processing...</p>
          </div>
        )}

        {/* Layout Selection */}
        {videoUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: 'var(--text-main, #f8fafc)', fontSize: '13px', fontWeight: '500' }}>
              Optional — replace layout with template:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }} className="premium-scrollbar">
              {templates.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutClick(layout.id)}
                  title={layout.name}
                  style={{
                    background: activeLayout === layout.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: activeLayout === layout.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                    color: activeLayout === layout.id ? '#a855f7' : 'var(--text-muted, #94a3b8)',
                    borderRadius: '8px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ width: '100%', pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <TemplatePreview template={layout.templateData} />
                  </div>
                  <span style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', paddingBottom: '2px' }}>{layout.name}</span>
                </button>
              ))}
            </div>
            {activeLayout ? (
              <button
                type="button"
                onClick={handleApplyLayout}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Apply selected template (replaces scene layout)
              </button>
            ) : null}
          </div>
        )}

        {/* Buttons Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px',
          marginTop: '4px'
        }}>
          <button
            onClick={onRemake}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'transparent',
              color: 'var(--text-main, #f8fafc)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Remake
          </button>
          
          <button
            onClick={onUseInEditor}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedVideoModal;
