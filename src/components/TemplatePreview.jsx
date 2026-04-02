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
    template.title.includes('Text Skeleton') ||
    template.title.includes('Interactive Quiz') ||
    template.title.includes('3-Column Services') ||
    template.title.includes('Lesson Overview') ||
    template.title.includes('Minimal Memory Journal') ||
    template.title.includes('Social Support Outro') ||
    template.title.includes('Hype Header') ||
    template.title.includes('Step Learning Mode') ||
    template.title.includes('Horizontal 3-Step Process') ||
    template.title.includes('Vertical Process Steps') ||
    template.title.includes('Icon Highlight Steps') ||
    template.title.includes('Number Highlight Process') ||
    template.title.includes('Topic Deep Dive') ||
    template.title.includes('Quiz / Follow-up Outro') ||
    template.title.includes('3-Stats Business Row') ||
    template.title.includes('Icon Stats Bar') ||
    template.title.includes('Single Number Highlight') ||
    template.title.includes('Professional Testimonial – Centered') ||
    template.title.includes('Executive Outro') ||
    template.title.includes('Interactive Story CTA') ||
    template.title.includes('Logo + Call to Action') ||
    template.title.includes('Sincere Outro') ||
    template.title.includes('Client Grid Overview')
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
    bottom: '3px',
    right: '3px',
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

    if (template.title?.includes('Lesson Overview')) {
      const itemColors = ['#bfdbfe', '#bbf7d0', '#fef08a', '#fbcfe8'];
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
             <div style={{ width: '75%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
             <div style={{ width: '15%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {[...Array(4)].map((_, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: itemColors[i % itemColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748b" style={{ opacity: 0.8 }}>
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                   </svg>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '3px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ width: '65%', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
                      <div style={{ width: '10%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                   </div>
                   <div style={{ width: '45%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                   <div style={{ width: '35%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                </div>
             </div>
          ))}

          <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
             <div style={{ flex: 1, height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
             <div style={{ flex: 1, height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Horizontal 3-Step Process')) {
      const stepGradients = [
        'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
        'linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)',
        'linear-gradient(135deg, #ddd6fe 0%, #a855f7 100%)' 
      ];
      const stepColors = ['#3b82f6', '#22c55e', '#a855f7'];

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>
          
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
             {/* Connecting Line */}
             <div style={{ position: 'absolute', top: '14px', left: '16%', width: '68%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />

             {[...Array(3)].map((_, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                   
                   {/* Step Indicator */}
                   <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ffffff', border: `2px solid ${stepColors[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: stepColors[i] }}>{i+1}</div>
                   </div>

                   {/* Content */}
                   <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <div style={{ width: '70%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                      <div style={{ width: '90%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                      <div style={{ width: '60%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   </div>

                   <div style={{ width: '80%', height: '36px', borderRadius: '6px', background: stepGradients[i], marginTop: '4px', opacity: 0.9 }} />
                </div>
             ))}
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Vertical Process Steps')) {
      const stepGradients = [
        'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
        'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
        'linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)'
      ];
      
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px', overflow: 'hidden' }}>
          
          {/* Vertical Connecting Line */}
          <div style={{ position: 'absolute', top: '24px', bottom: '24px', left: '31px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />

          {/* Steps */}
          {[...Array(3)].map((_, i) => (
             <div key={i} style={{ display: 'flex', gap: '12px', zIndex: 1, position: 'relative' }}>
                
                {/* Step Indicator */}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>{`0${i+1}`}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                   <div style={{ width: '65%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                   <div style={{ width: '85%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   <div style={{ width: '55%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   
                   <div style={{ width: '70px', height: '30px', borderRadius: '6px', background: stepGradients[i], marginTop: '2px', opacity: 0.8 }} />
                </div>
             </div>
          ))}

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Number Highlight Process')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px', overflow: 'hidden', justifyContent: 'center' }}>
          
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '30px', bottom: '30px', left: '33px', width: '2px', backgroundColor: '#f1f5f9', zIndex: 0 }} />

          {[...Array(3)].map((_, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 1, position: 'relative' }}>
                
                {/* Big Number Placeholder */}
                <div style={{ width: '28px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                   <div style={{ fontSize: '26px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '-0.05em', lineHeight: 0.8, marginTop: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                     {`0${i+1}`}
                   </div>
                </div>

                {/* Content Skeletons */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   <div style={{ width: '65%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                   <div style={{ width: '85%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   <div style={{ width: '55%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                </div>
             </div>
          ))}

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Quiz / Follow-up Outro')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px', gap: '6px', overflow: 'hidden' }}>
          
          {/* Progress Bar */}
          <div style={{ width: '40%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', alignSelf: 'center', marginBottom: '2px' }}>
            <div style={{ width: '60%', height: '100%', backgroundColor: '#6366f1' }} />
          </div>

          {/* Prompt Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* Quiz Options */}
          <div style={{ width: '95%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #cbd5e1', marginRight: '6px', flexShrink: 0 }} />
                 <div style={{ width: '70%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div style={{ width: '50%', height: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '20px', marginTop: '4px', boxShadow: '0 4px 6px rgba(99,102,241,0.2)' }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('3-Stats Business Row')) {
      const stepGradients = [
        'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
        'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
      ];

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>
          
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
             {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      
                      {/* Icon */}
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: stepGradients[i], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                         <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '3px' }} />
                      </div>

                      {/* Number (Thick Skeleton) */}
                      <div style={{ width: '50%', height: '12px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />

                      {/* Label */}
                      <div style={{ width: '70%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />

                   </div>
                   
                   {/* Divider */}
                   {i < 2 && (
                      <div style={{ width: '1px', height: '40px', backgroundColor: '#e2e8f0' }} />
                   )}
                </React.Fragment>
             ))}
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Icon Stats Bar')) {
      const stepGradients = [
        'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      ];

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflow: 'hidden' }}>
          
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
             {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      
                      {/* Icon */}
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: stepGradients[i], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                         <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
                      </div>

                      {/* Text Column */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                         {/* Value (Thick Skeleton) */}
                         <div style={{ width: '60%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
                         {/* Label (Thin Skeleton) */}
                         <div style={{ width: '80%', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                      </div>

                   </div>
                   
                   {/* Divider */}
                   {i < 2 && (
                      <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', flexShrink: 0 }} />
                   )}
                </React.Fragment>
             ))}
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Single Number Highlight')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '12px', overflow: 'hidden' }}>
          
          {/* Background Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)', zIndex: 0, borderRadius: '50%' }} />

          {/* Icon */}
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 2px 4px rgba(99,102,241,0.2)' }}>
            <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '2px' }} />
          </div>

          {/* Big Number Skeleton */}
          <div style={{ width: '50%', height: '20px', background: 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 100%)', borderRadius: '4px', zIndex: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} />

          {/* Label Skeleton */}
          <div style={{ width: '60%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', zIndex: 1 }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Professional Testimonial – Centered')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '12px', overflow: 'hidden' }}>
          
          {/* Avatar Area */}
          <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             {/* Quote Badge */}
             <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff' }}>
                <div style={{ width: '4px', height: '4px', backgroundColor: '#ffffff', borderRadius: '1px' }} />
             </div>
          </div>

          {/* Testimonial Lines */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '75%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
            <div style={{ width: '85%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
            <div style={{ width: '65%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* Name & Role */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <div style={{ width: '40%', height: '6px', backgroundColor: '#94a3b8', borderRadius: '3px' }} />
            <div style={{ width: '30%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Executive Outro')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '14px', overflow: 'hidden' }}>
          
          {/* Logo Placeholder */}
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #94a3b8' }}>
             <div style={{ width: '50%', height: '50%', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '2px' }} />
          </div>

          {/* Text Lines */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {/* Main */}
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            {/* Supporting */}
            <div style={{ width: '55%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
            <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* Contact Methods (Option B) */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
             {[...Array(3)].map((_, i) => (
                <div key={i} style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ width: '40%', height: '40%', backgroundColor: '#94a3b8', borderRadius: '2px' }} />
                </div>
             ))}
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Client Grid Overview')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '12px', overflow: 'hidden' }}>
          
          {/* Section Title */}
          <div style={{ width: '50%', height: '6px', backgroundColor: '#94a3b8', borderRadius: '3px', marginBottom: '2px' }} />

          {/* Grid Layout 3x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
             {[...Array(6)].map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                   {/* Logo Box */}
                   <div style={{ width: '100%', height: '36px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '40%', height: '40%', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
                   </div>
                   {/* Optional Label */}
                   <div style={{ width: '50%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                </div>
             ))}
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Sincere Outro')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '12px', overflow: 'hidden' }}>
          
          {/* Top Avatar/Logo */}
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <div style={{ width: '50%', height: '50%', backgroundColor: '#e2e8f0', borderRadius: '50%' }} />
          </div>

          {/* Main Sincere Text */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            <div style={{ width: '55%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
          </div>

          {/* Supporting Text */}
          <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px', opacity: 0.8, marginTop: '2px' }} />

          {/* Subtle CTA */}
          <div style={{ width: '30%', height: '14px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '6px', border: '1px solid #e2e8f0' }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Logo + Call to Action')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '14px', overflow: 'hidden' }}>
          
          {/* Logo Placeholder */}
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #94a3b8' }}>
             <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
          </div>

          {/* Text Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {/* Main */}
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            {/* Supporting */}
            <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* CTA Box */}
          <div style={{ width: '70%', height: '24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', marginTop: '4px', zIndex: 1, boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Interactive Story CTA')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: '12px', overflow: 'hidden' }}>
          
          {/* Background Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, rgba(45,212,191,0) 70%)', zIndex: 0, borderRadius: '50%' }} />

          {/* Floating Elements */}
          <div style={{ position: 'absolute', top: '24px', left: '16px', width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', zIndex: 0, opacity: 0.8 }} />
          <div style={{ position: 'absolute', top: '20px', right: '24px', width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', zIndex: 0, opacity: 0.9, transform: 'rotate(15deg)' }} />
          <div style={{ position: 'absolute', bottom: '28px', left: '20px', width: '20px', height: '20px', borderRadius: '8px', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', zIndex: 0, opacity: 0.7, transform: 'rotate(-10deg)' }} />
          <div style={{ position: 'absolute', bottom: '24px', right: '16px', width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)', zIndex: 0, opacity: 0.8 }} />

          {/* Text Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* CTA Box */}
          <div style={{ width: '60%', height: '22px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '12px', marginTop: '6px', zIndex: 1, boxShadow: '0 4px 6px rgba(139,92,246,0.3)' }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Topic Deep Dive')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px', gap: '10px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '65%', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            <div style={{ width: '45%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* Deep Content */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <div style={{ width: '85%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
            <div style={{ width: '75%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
            <div style={{ width: '65%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
            <div style={{ width: '90%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
          </div>

          {/* Highlight Box */}
          <div style={{ width: '90%', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80%', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
            <div style={{ width: '60%', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          {/* Visual Placeholder */}
          <div style={{ width: '70%', height: '42px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', borderRadius: '8px', border: '1px solid #c7d2fe', marginTop: '2px' }} />

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Icon Highlight Steps')) {
      const stepGradients = [
        'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
        'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
      ];

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
             <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                
                {/* Icon Placeholder */}
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: stepGradients[i], 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                }}>
                   <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px' }} />
                </div>

                {/* Content */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                   <div style={{ width: '65%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                   <div style={{ width: '85%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                </div>
             </div>
          ))}

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Step Learning Mode')) {
      const stepGradients = [
        'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
      ];
      
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px', overflow: 'hidden' }}>
          
          {/* Vertical Connecting Line */}
          <div style={{ position: 'absolute', top: '24px', bottom: '24px', left: '31px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />

          {/* Steps */}
          {[...Array(3)].map((_, i) => (
             <div key={i} style={{ display: 'flex', gap: '12px', zIndex: 1, position: 'relative' }}>
                
                {/* Step Indicator */}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>{`0${i+1}`}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                   <div style={{ width: '65%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
                   <div style={{ width: '85%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   <div style={{ width: '55%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                   
                   <div style={{ width: '70px', height: '30px', borderRadius: '6px', background: stepGradients[i], marginTop: '2px', opacity: 0.8 }} />
                </div>
             </div>
          ))}

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('CTA Outro - Modern')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', justifyContent: 'center' }}>
             <div style={{ width: '65%', height: '30px', backgroundColor: '#cbd5e1', borderRadius: '4px', opacity: 1 }} />
             <div style={{ width: '75%', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', opacity: 0.9 }} />
             <div style={{ width: '65%', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', opacity: 0.7 }} />
             <div style={{ width: '55%', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', opacity: 0.7 }} />
             <div style={{ width: '20%', height: '20px', backgroundColor: '#cbd5e1', borderRadius: '4px', opacity: 0.5 }} />
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Hype Header')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

          {/* Floating Boxes */}
          <div style={{ position: 'absolute', top: '15%', left: '15%', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#ec4899', boxShadow: '0 4px 6px rgba(236,72,153,0.2)', transform: 'rotate(-12deg)' }} />
          <div style={{ position: 'absolute', top: '25%', right: '15%', width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 6px rgba(239,68,68,0.2)', transform: 'rotate(15deg)' }} />
          <div style={{ position: 'absolute', bottom: '25%', left: '20%', width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#3b82f6', boxShadow: '0 4px 6px rgba(59,130,246,0.2)', transform: 'rotate(-5deg)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#a855f7', boxShadow: '0 4px 6px rgba(168,85,247,0.2)', transform: 'rotate(8deg)' }} />

          {/* Header & CTA Content */}
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', textAlign: 'center', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>DON'T MISS THIS!</div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#6366f1', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Watch till the end</div>
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '6px 14px', borderRadius: '20px', color: '#ffffff', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 10px rgba(99,102,241,0.4)', marginTop: '2px' }}>
               TAP HERE
            </div>
          </div>

          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Social Support Outro')) {
      const socialColors = ['#a855f7', '#3b82f6', '#ec4899', 'linear-gradient(135deg, #f59e0b, #ef4444)'];
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', textAlign: 'center', letterSpacing: '-0.02em' }}>Thanks for Watching</div>
          <div style={{ fontSize: '9px', fontWeight: '500', color: '#64748b', textAlign: 'center', marginBottom: '4px' }}>Follow us for more content</div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', margin: '4px 0' }}>
             {socialColors.map((bg, i) => (
                <div key={i} style={{ 
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px', 
                  background: bg,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }} />
             ))}
          </div>

          <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Stay Connected</div>
          {renderMockupExtras()}
        </div>
      );
    }

    if (template.title?.includes('Minimal Memory Journal')) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '12px', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'center', letterSpacing: '0.02em', marginTop: '-2px' }}>My Memories</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px', flex: 1 }}>
             {[...Array(4)].map((_, i) => (
                <div key={i} style={{ 
                  borderRadius: '10px', 
                  backgroundColor: '#e2e8f0',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="#1351a7ff" style={{ zIndex: 1 }}>
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                   </svg>
                </div>
             ))}
          </div>
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
