import React from 'react';

/**
 * TemplatePreview Component
 * Provides a minimal, Canva-style visual preview of different scene layouts.
 * 
 * @param {Object} props
 * @param {string} props.layoutType - Type of layout (Hero, Split, Centered, Grid, Story)
 * @param {string} props.variant - Sub-variant for the layout (primarily for Hero)
 */
const TemplatePreview = ({ layoutType = 'Hero', variant = 'centered' }) => {
  // Base Styles
  const containerStyle = {
    width: '100%',
    aspectRatio: '16 / 9',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    padding: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const textLineStyle = {
    height: '6px',
    backgroundColor: '#94a3b8',
    borderRadius: '3px',
    margin: '6px 0',
    opacity: 0.8
  };

  const imageBoxStyle = {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    borderRadius: '6px',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  // Layout Renderers
  const renderHero = () => {
    const v = variant.toLowerCase();
    
    switch (v) {
      case 'left-avatar':
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px', height: '100%' }}>
            <div style={avatarStyle} />
            <div style={{ flex: 1 }}>
              <div style={{ ...textLineStyle, width: '70%', height: '8px' }} />
              <div style={{ ...textLineStyle, width: '90%' }} />
              <div style={{ ...textLineStyle, width: '50%' }} />
            </div>
          </div>
        );
      
      case 'right-image':
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...textLineStyle, width: '80%', height: '8px' }} />
              <div style={{ ...textLineStyle, width: '60%' }} />
              <div style={{ ...textLineStyle, width: '70%' }} />
            </div>
            <div style={{ ...imageBoxStyle, width: '45%', height: '80%' }} />
          </div>
        );

      case 'centered':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <div style={{ ...textLineStyle, width: '60%', height: '8px' }} />
            <div style={{ ...textLineStyle, width: '40%' }} />
            <div style={{ ...textLineStyle, width: '30%' }} />
          </div>
        );

      case 'background':
        return (
          <div style={{ ...imageBoxStyle, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px', position: 'absolute', top: 0, left: 0 }}>
             <div style={{ ...textLineStyle, width: '50%', height: '10px', backgroundColor: 'rgba(255,255,255,0.9)' }} />
             <div style={{ ...textLineStyle, width: '40%', height: '6px', backgroundColor: 'rgba(255,255,255,0.7)' }} />
          </div>
        );

      case 'avatar-group':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', gap: '12px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '-12px' }}>
              <div style={{ ...avatarStyle, border: '2px solid #f8fafc', width: '28px', height: '28px' }} />
              <div style={{ ...avatarStyle, border: '2px solid #f8fafc', width: '28px', height: '28px', marginLeft: '-12px' }} />
              <div style={{ ...avatarStyle, border: '2px solid #f8fafc', width: '28px', height: '28px', marginLeft: '-12px' }} />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ ...textLineStyle, width: '60%', height: '8px' }} />
              <div style={{ ...textLineStyle, width: '40%' }} />
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
            <div style={{ ...textLineStyle, width: '40%', height: '8px' }} />
            <div style={{ ...textLineStyle, width: '20%' }} />
          </div>
        );

      default:
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <div style={{ ...textLineStyle, width: '60%', height: '8px' }} />
            <div style={{ ...textLineStyle, width: '40%' }} />
          </div>
        );
    }
  };

  const renderContent = () => {
    const type = layoutType.toLowerCase();

    switch (type) {
      case 'hero':
        return renderHero();

      case 'split':
        return (
          <div style={{ display: 'flex', width: '100%', height: '100%', gap: '12px' }}>
            <div style={{ flex: 1, ...imageBoxStyle }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...textLineStyle, width: '90%', height: '8px' }} />
              <div style={{ ...textLineStyle, width: '70%' }} />
              <div style={{ ...textLineStyle, width: '80%' }} />
            </div>
          </div>
        );

      case 'centered':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ ...imageBoxStyle, width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ ...textLineStyle, width: '70%', height: '8px' }} />
              <div style={{ ...textLineStyle, width: '50%' }} />
            </div>
          </div>
        );

      case 'grid':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', height: '100%' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ ...imageBoxStyle, height: '30px' }} />
                <div>
                   <div style={{ ...textLineStyle, width: '100%', height: '4px', margin: '2px 0' }} />
                   <div style={{ ...textLineStyle, width: '60%', height: '4px', margin: '2px 0' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'story':
        return (
          <div style={{ display: 'flex', gap: '8px', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '45%', ...imageBoxStyle, borderRadius: '8px', position: 'relative', flexShrink: 0 }}>
               <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                 <div style={{ ...textLineStyle, width: '80%', height: '6px', backgroundColor: 'rgba(255,255,255,0.7)' }} />
                 <div style={{ ...textLineStyle, width: '50%', height: '4px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
               </div>
            </div>
            <div style={{ width: '45%', ...imageBoxStyle, borderRadius: '8px', opacity: 0.4, flexShrink: 0 }} />
            <div style={{ width: '45%', ...imageBoxStyle, borderRadius: '8px', opacity: 0.15, flexShrink: 0 }} />
          </div>
        );

      default:
        return renderHero();
    }
  };

  return (
    <div className="template-preview-container" style={containerStyle}>
      {renderContent()}
    </div>
  );
};

export default TemplatePreview;
