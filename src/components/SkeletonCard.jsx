import React from 'react';

/**
 * SkeletonCard Component
 * A placeholder loading state for TemplateCard with pulse animations.
 */
const SkeletonCard = () => {
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const pulseAnimation = {
    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  const previewSkeletonStyle = {
    width: '100%',
    aspectRatio: '16 / 9',
    backgroundColor: '#f1f5f9',
    position: 'relative',
    ...pulseAnimation
  };

  const footerSkeletonStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const lineStyle = {
    height: '10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    ...pulseAnimation
  };

  return (
    <div style={cardStyle}>
      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
      
      {/* Preview Area Skeleton */}
      <div style={previewSkeletonStyle} />

      {/* Footer Area Skeleton */}
      <div style={footerSkeletonStyle}>
        <div style={{ ...lineStyle, width: '60%' }} />
        <div style={{ ...lineStyle, width: '40%', height: '8px' }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
