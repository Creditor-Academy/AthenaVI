import React from 'react';
import { MdClose } from 'react-icons/md';

const GeneratedVideoModal = ({ isOpen, onClose, videoUrl, onUseInEditor, onRemake }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '28px',
        width: '90%',
        maxWidth: '750px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'var(--text-main, #f8fafc)',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <MdClose size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ color: 'var(--text-main, #f8fafc)', margin: 0, fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✨</span> AI Presenter Ready
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontSize: '13px' }}>
            Preview your generated neural presenter clip below.
          </p>
        </div>

        {videoUrl ? (
          <div style={{ 
            width: '100%', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            background: '#000', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
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
            padding: '60px 20px', 
            textAlign: 'center', 
            color: 'var(--text-muted, #94a3b8)',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <p style={{ margin: 0 }}>No video URL available. It might still be processing.</p>
          </div>
        )}

        {/* Buttons Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px',
          marginTop: '8px'
        }}>
          <button
            onClick={onRemake}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'transparent',
              color: 'var(--text-main, #f8fafc)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Remake Presenter
          </button>
          
          <button
            onClick={onUseInEditor}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Use in Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedVideoModal;
