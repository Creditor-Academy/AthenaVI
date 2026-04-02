import React from 'react';

/**
 * TemplatePreview Component
 * Provides a minimal, Canva-style visual preview of different scene layouts.
 * 
 * @param {Object} props
 * @param {Object} props.template - The full template object including zones
 * @param {string} props.layoutType - Fallback type of layout
 * @param {string} props.variant - Fallback sub-variant
 */
const TemplatePreview = ({ template, layoutType = 'Hero', variant = 'centered' }) => {
  const zones = template?.zones;

  const isMockup = template?.title && (
    template.title.includes('Main Hero') || 
    template.title.includes('Marketing Hero') || 
    template.title.includes('Centered Impact Hero') || 
    template.title.includes('Avatar Group Hero') ||
    template.title.includes('Feature Split') ||
    template.title.includes('Interactive Quiz') ||
    template.title.includes('3-Column Services') ||
    template.title.includes('Lesson Overview')
  );

  // Base Styles
  const containerStyle = {
    width: '100%',
    aspectRatio: '16 / 9',
    backgroundColor: isMockup ? '#f8fafc' : '#f1f5f9',
    borderRadius: isMockup ? '8px' : '12px',
    border: isMockup ? 'none' : '1px solid #e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    padding: isMockup ? '30px' : '16px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const textLineStyle = {
    height: '8px',
    backgroundColor: '#cbd5e1',
    borderRadius: '4px',
    margin: '8px 0',
    opacity: 0.8
  };

  const imageBoxStyle = {
    background: isMockup 
      ? 'none' 
      : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    backgroundColor: isMockup ? '#6366f1' : 'transparent',
    borderRadius: isMockup ? '10px' : '6px',
    border: 'none'
  };

  const avatarPlaceholderStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '0px', // Sharp square as requested
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#628ecbff',
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    border: '1.5px solid #cbd5e1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    zIndex: 10
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
            <div style={{ ...textLineStyle, width: '60%', height: '12px' }} />
            <div style={{ ...textLineStyle, width: '40%', height: '12px' }} />
          </div>
        );
    }
  };

  const renderZones = () => {
    if (!zones) return renderHero();

    const canvasWidth = 1280;
    const canvasHeight = 720;

    const getPctStyle = (zone) => ({
      position: 'absolute',
      left: `${(zone.x / canvasWidth) * 100}%`,
      top: `${(zone.y / canvasHeight) * 100}%`,
      width: `${(zone.width / canvasWidth) * 100}%`,
      height: `${(zone.height / canvasHeight) * 100}%`,
    });

    const renderMockupExtras = () => (
      <>
        <div style={avatarPlaceholderStyle}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
           </svg>
        </div>
      </>
    );

    // Specific Mockup Renderers
    if (template.title?.includes('Interactive Quiz')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 20px', gap: '8px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ 
              width: '100%', 
              height: '24px', 
              backgroundColor: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              gap: '8px'
            }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i === 1 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />}
               </div>
               <div style={{ ...textLineStyle, width: '70%', height: '6px', margin: 0 }} />
               {i === 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748b" style={{ marginLeft: 'auto' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            </div>
          ))}
          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('3-Column Services')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: '8px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ 
              flex: 1, 
              height: '70%', 
              backgroundColor: '#6366f1', 
              border: '1px solid #6366f1', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
               <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#ffffff', opacity: 0.6 }} />
               <div style={{ ...textLineStyle, width: '80%', height: '8px', backgroundColor: '#ffffff', opacity: 0.4 }} />
               <div style={{ ...textLineStyle, width: '50%', height: '6px', backgroundColor: '#ffffff', opacity: 0.3 }} />
            </div>
          ))}
          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Avatar Group Hero')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ ...textLineStyle, width: '90%', height: '10px' }} />
            <div style={{ ...textLineStyle, width: '90%', height: '10px' }} />
            <div style={{ ...textLineStyle, width: '60%', height: '10px' }} />
          </div>
          <div style={{ width: '50%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
             {[...Array(9)].map((_, i) => (
               <div key={i} style={{ aspectRatio: '1/1', backgroundColor: '#e2e8f0', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748b"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
               </div>
             ))}
          </div>
          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Centered Impact Hero')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <div style={{ ...textLineStyle, width: '60%', height: '14px' }} />
          <div style={{ ...textLineStyle, width: '40%', height: '10px' }} />
          <div style={{ ...textLineStyle, width: '80%', height: '10px' }} />
          <div style={{ ...textLineStyle, width: '50%', height: '10px' }} />
          {renderMockupExtras()}
        </div>
      );
    }

    // Default Zone Renderer
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {zones.image && (
          <div style={{ ...getPctStyle(zones.image), ...imageBoxStyle }} />
        )}
        {zones.text && (
          <div style={{ ...getPctStyle(zones.text), display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ ...textLineStyle, width: '90%', height: '10px' }} />
            <div style={{ ...textLineStyle, width: '90%', height: '10px' }} />
            <div style={{ ...textLineStyle, width: '70%', height: '10px' }} />
            <div style={{ ...textLineStyle, width: '85%', height: '10px' }} />
          </div>
        )}
        {zones.avatar && (
           <div style={{ ...getPctStyle(zones.avatar), ...imageBoxStyle }} />
        )}
        {isMockup && renderMockupExtras()}
      </div>
    );
  };

  return (
    <div className="template-preview-container" style={containerStyle}>
      {renderZones()}
    </div>
  );
};

export default TemplatePreview;
