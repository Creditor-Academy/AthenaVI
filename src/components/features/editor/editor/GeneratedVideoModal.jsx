import React from 'react';
import { MdClose } from 'react-icons/md';

const GeneratedVideoModal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        width: '80%',
        maxWidth: '800px',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <MdClose size={24} />
        </button>
        <h2 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Generated AI Presenter Video</h2>
        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh', background: '#000' }}
          />
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No video URL available. It might still be processing.</p>
        )}
      </div>
    </div>
  );
};

export default GeneratedVideoModal;
