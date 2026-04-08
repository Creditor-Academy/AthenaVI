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
    template.title === 'Main Hero - Left Text' || 
    template.title === 'Marketing Hero - Right Text' || 
    template.title === 'Centered Impact Hero' || 
    template.title === 'Avatar Group Hero' ||
    template.title.includes('Feature Split') ||
    template.title.includes('Text Skeleton') ||
    template.title.includes('Interactive Quiz') ||
    template.title.includes('3-Column Services') ||
    template.title === 'Lesson Overview - Left Avatar' ||
    template.title.includes('Minimal Memory Journal') ||
    template.title.includes('Social Support Outro') ||
    template.title === 'Hype Header - Social' ||
    template.title.includes('Step Learning Mode') ||
    template.title.includes('Horizontal 3-Step Process') ||
    template.title.includes('Vertical Process Steps') ||
    template.title.includes('Icon Highlight Steps') ||
    template.title.includes('Number Highlight Process') ||
    template.title.includes('Topic Deep Dive') ||
    template.title.includes('Quiz / Follow-up Outro') ||
    template.title === '3-Stats Business Row' ||
    template.title.includes('Icon Stats Bar') ||
    template.title === 'Single Number Highlight' ||
    template.title === 'Professional Testimonial - Centered' ||
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
    borderRadius: '0px', 
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

    // 1. Marketing Hero - Left Text
    if (template.title === 'Main Hero - Left Text') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', lineHeight: '1.1', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
              Your Next Big<br/>Idea Starts Here
            </div>
            <div style={{ fontSize: '8px', fontWeight: '500', color: '#64748b', maxWidth: '90%', lineHeight: '1.4' }}>
              The ultimate platform for AI video generation and professional layouts.
            </div>
            <div style={{ width: '80px', height: '22px', backgroundColor: '#3b82f6', borderRadius: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '40px', height: '4px', backgroundColor: '#ffffff', borderRadius: '2px' }} />
            </div>
          </div>
          <div style={{ width: '38%', height: '85%', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '16px', border: '1.5px solid #ffffff', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="#6366f1" style={{ opacity: 0.8 }}><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </div>
          {renderMockupExtras()}
        </div>
      );
    }

    // 2. Marketing Hero - Right Text
    if (template.title === 'Marketing Hero - Right Text') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexDirection: 'row-reverse' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', lineHeight: '1.1', textTransform: 'uppercase' }}>
              Scale Your Brand<br/>With AI Video
            </div>
            <div style={{ fontSize: '8px', fontWeight: '500', color: '#64748b', maxWidth: '90%', lineHeight: '1.4' }}>
              Generate professional marketing content in seconds.
            </div>
            <div style={{ width: '80px', height: '22px', backgroundColor: '#10b981', borderRadius: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '40px', height: '4px', backgroundColor: '#ffffff', borderRadius: '2px' }} />
            </div>
          </div>
          <div style={{ width: '38%', height: '85%', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', border: '1.5px solid #ffffff', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981" style={{ opacity: 0.8 }}><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          </div>
          {renderMockupExtras()}
        </div>
      );
    }

    // 3. Centered Impact Hero
    if (template.title === 'Centered Impact Hero') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '10px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', textAlign: 'center', lineHeight: '1.0', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
            REDEFINING<br/>CREATIVITY
          </div>
          <div style={{ width: '100px', height: '28px', backgroundColor: '#6366f1', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
          {renderMockupExtras()}
        </div>
      );
    }

    // 4. Hype Header - Social
    if (template.title === 'Hype Header - Social') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40px', height: '40px', background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)' }} />
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', fontStyle: 'italic', textAlign: 'center', lineHeight: '0.9', textTransform: 'uppercase', transform: 'rotate(-2deg)', textShadow: '0 0 20px rgba(239,68,68,0.6)' }}>
            MUST<br/>WATCH!
          </div>
          <div style={{ fontSize: '9px', fontWeight: '800', color: '#ef4444', marginTop: '12px', letterSpacing: '0.1em' }}>
            @YOURCHANNEL
          </div>
        </div>
      );
    }

    // 5. 3-Stats Business Row
    if (template.title === '3-Stats Business Row') {
      const stats = [
        { val: '10M+', lab: 'Users', col: '#3b82f6' },
        { val: '98%', lab: 'Success', col: '#10b981' },
        { val: '150k', lab: 'Projects', col: '#6366f1' }
      ];
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: '8px' }}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: s.col, lineHeight: '1' }}>{s.val}</div>
                <div style={{ fontSize: '8px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{s.lab}</div>
              </div>
              {i < 2 && <div style={{ width: '1.5px', height: '30px', backgroundColor: '#e2e8f0' }} />}
            </React.Fragment>
          ))}
          {renderMockupExtras()}
        </div>
      );
    }

    // 6. Professional Testimonial - Centered
    if (template.title === 'Professional Testimonial - Centered') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', border: '1.5px solid #ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
             <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="6" height="6" viewBox="0 0 24 24" fill="white"><path d="M6 17h3l2-4V7H5v6h3zM14 17h3l2-4V7h-6v6h3z"/></svg>
             </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', color: '#1e293b', textAlign: 'center', lineHeight: '1.3' }}>
            "Athena revolutionized our entire<br/>video workflow strategy."
          </div>
          <div style={{ fontSize: '7px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Jane Smith • Founder, TechRise
          </div>
          {renderMockupExtras()}
        </div>
      );
    }

    // 7. Minimal Memory Journal
    if (template.title === 'Minimal Memory Journal') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.05em' }}>TODAY'S MOMENTS</div>
          <div style={{ fontSize: '8px', fontWeight: '500', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
            Grateful for the small things in life.
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #ffffff', backgroundColor: '#ddd6fe', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
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
              gap: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              justifyContent: 'center'
            }}>
               <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#ffffff', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#6366f1"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
               </div>
               <div style={{ fontSize: '10px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', marginTop: '4px' }}>Service {String.fromCharCode(65 + i)}</div>
               <div style={{ fontSize: '5px', fontWeight: '500', color: '#ffffff', opacity: 0.8 }}>Professional solutions for your business.</div>
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
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', lineHeight: '1.1', textTransform: 'uppercase' }}>JOIN OUR GLOBAL<br/>COMMUNITY</div>
            <div style={{ fontSize: '7px', fontWeight: '600', color: '#3b82f6', letterSpacing: '0.05em' }}>10k+ ACTIVE CREATORS</div>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', alignItems: 'center' }}>
             <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>MODULE 01: INTRODUCTION</div>
             <div style={{ fontSize: '7px', fontWeight: '800', color: '#6366f1' }}>01 / 12</div>
          </div>

          {[...Array(4)].map((_, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: itemColors[i % itemColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748b" style={{ opacity: 0.8 }}>
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                   </svg>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '3px' }}>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>The Fundamentals of AI</div>
                    <div style={{ fontSize: '6px', fontWeight: '500', color: '#64748b' }}>Master the core architecture concepts.</div>
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
                   <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <div style={{ fontSize: '7px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>Phase {i+1}</div>
                      <div style={{ fontSize: '5px', fontWeight: '500', color: '#64748b' }}>Discovery Stage</div>
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                   <div style={{ fontSize: '9px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>Process Phase {i+1}</div>
                   <div style={{ fontSize: '6px', fontWeight: '600', color: '#64748b' }}>Technical Review Specification</div>
                   <div style={{ fontSize: '5px', fontWeight: '500', color: '#94a3b8' }}>Complete systems architecture alignment.</div>
                   
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

                {/* Content Text */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                   <div style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>CONFIGURE {i+1}</div>
                   <div style={{ fontSize: '7px', fontWeight: '700', color: '#3b82f6' }}>SYSTEM INITIALIZATION</div>
                   <div style={{ fontSize: '6px', fontWeight: '500', color: '#64748b' }}>Setting up secure communication keys.</div>
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
            <div style={{ fontSize: '10px', fontWeight: '900', color: '#0f172a', textAlign: 'center', textTransform: 'uppercase' }}>READY FOR THE NEXT MODULE?</div>
          </div>

          {/* Quiz Options */}
          <div style={{ width: '95%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
            {['AI STRATEGY', 'NEURAL NETS', 'ML MODELS', 'DATA SCI'].map((opt, i) => (
              <div key={i} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #cbd5e1', marginRight: '6px', flexShrink: 0 }} />
                 <div style={{ fontSize: '6px', fontWeight: '800', color: '#64748b' }}>{opt}</div>
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
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {/* Value (High Fidelity) */}
                          <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e293b', lineHeight: '1' }}>99.9% UPTIME</div>
                          {/* Label (High Fidelity) */}
                          <div style={{ fontSize: '6px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Reliability</div>
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

          {/* Big Number Text */}
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#10b981', lineHeight: '1', zIndex: 1 }}>100%</div>

          {/* Label Text */}
          <div style={{ fontSize: '8px', fontWeight: '800', color: '#64748b', zIndex: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CUSTOMER SATISFACTION</div>

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

          {/* Text Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textAlign: 'center', textTransform: 'uppercase' }}>THANK YOU FOR YOUR TIME.</div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#3b82f6', textAlign: 'center' }}>sales@athenavi.com • www.athenavi.com</div>
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
          <div style={{ fontSize: '9px', fontWeight: '900', color: '#1e293b', marginBottom: '2px', textTransform: 'uppercase' }}>TRUSTED BY INDUSTRY LEADERS</div>

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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', textAlign: 'center', lineHeight: '1.2' }}>THANKS FOR BEING PART<br/>OF MY JOURNEY.</div>
          </div>

          {/* Supporting Text */}
          <div style={{ fontSize: '7px', fontWeight: '600', color: '#64748b', textAlign: 'center', marginTop: '2px', fontStyle: 'italic' }}>Grateful to have you with me.</div>

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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textAlign: 'center', textTransform: 'uppercase' }}>START YOUR JOURNEY TODAY</div>
            <div style={{ fontSize: '7px', fontWeight: '500', color: '#64748b', textAlign: 'center' }}>Begin your 14-day free trial.</div>
          </div>

          {/* CTA Box */}
          <div style={{ width: '70%', height: '24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', marginTop: '4px', zIndex: 1, boxShadow: '0 4px 6px rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ fontSize: '7px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>GET STARTED</div>
          </div>

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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', textAlign: 'center', textTransform: 'uppercase' }}>JOIN THE MOVEMENT</div>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#64748b', textAlign: 'center' }}>Swipe up to learn more</div>
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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', textAlign: 'center', textTransform: 'uppercase' }}>NEURAL NETWORKS</div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#6366f1', textAlign: 'center' }}>TOPIC DEEP DIVE</div>
          </div>

          {/* Deep Content */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px' }}>
            <div style={{ fontSize: '7px', fontWeight: '500', color: '#64748b', textAlign: 'center', maxWidth: '85%' }}>A computational model inspired by the human brain's network of neurons.</div>
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
                 <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>{['SET UP', 'DEPLOY', 'SCALE'][i]}</div>
                    <div style={{ fontSize: '6px', fontWeight: '500', color: '#64748b' }}>Module {i+1}</div>
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                   <div style={{ fontSize: '9px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' }}>Step {i+1}: Module</div>
                   <div style={{ fontSize: '6px', fontWeight: '600', color: '#3b82f6' }}>Strategic Planning</div>
                   <div style={{ fontSize: '5px', fontWeight: '500', color: '#64748b' }}>Master the core architecture concepts.</div>
                   
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', justifyContent: 'center' }}>
             <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>STAY CONNECTED</div>
             <div style={{ fontSize: '7px', fontWeight: '600', color: '#6366f1' }}>FOLLOW OUR JOURNEY</div>
             <div style={{ fontSize: '6px', fontWeight: '500', color: '#64748b', marginTop: '4px' }}>Join 50k+ followers for daily updates.</div>
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
          <div style={{ ...getPctStyle(zones.text), display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', lineHeight: '1.2' }}>
              {template.title?.includes('Feature') ? 'Advanced System Features' : 
               template.title?.includes('Quiz') ? 'WHICH STRATEGY FITS?' : 
               'Universal Content Layout'}
            </div>
            <div style={{ fontSize: '7px', fontWeight: '500', color: '#64748b' }}>
              {template.title?.includes('Feature') ? 'Maximize your brand potential with AI.' : 
               template.title?.includes('Quiz') ? 'Choose the best path for growth.' : 
               'Professional styled text components for your brand.'}
            </div>
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
