import React, { useState } from 'react';
import TemplatePreview from './TemplatePreview';

/**
 * TemplateCard Component
 * Displays a template preview with a title, duration badge, and layout information.
 * 
 * @param {Object} props
 * @param {Object} props.template - The template data object
 * @param {string} props.template.title - Title of the template
 * @param {string} props.template.layoutType - Type of layout (Hero, Split, etc.)
 * @param {string} props.template.variant - Specific variant of the layout
 * @param {string} props.template.duration - Formatted duration (e.g., "00:15")
 * @param {function} props.onSelect - Callback function when the card is clicked
 */
const TemplateCard = ({ template, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!template) return null;

  const { title, layoutType, variant, duration } = template;
  
  const isMockup = title && (
    title.includes('Main Hero') || 
    title.includes('Marketing Hero') || 
    title.includes('Centered Impact Hero') || 
    title.includes('Avatar Group Hero')
  );

  // Inline Styles
  const cardStyle = {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? (isMockup ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 12px 20px -8px rgba(0, 0, 0, 0.15)')
      : (isMockup ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'),
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: isMockup ? '8px' : '0'
  };

  const previewWrapStyle = {
    position: 'relative',
    width: '100%',
    backgroundColor: isMockup ? 'transparent' : '#f1f5f9'
  };

  const badgeStyle = {
    position: 'absolute',
    top: isMockup ? '12px' : '10px',
    right: isMockup ? '12px' : '10px',
    backgroundColor: isMockup ? 'rgba(51, 65, 85, 0.8)' : 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: isMockup ? '4px 8px' : '4px 10px',
    borderRadius: isMockup ? '10px' : '20px',
    fontSize: isMockup ? '0.65rem' : '0.75rem',
    fontWeight: '700',
    zIndex: 5,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isMockup ? '24px' : 'auto'
  };

  const footerStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#ffffff'
  };

  const titleStyle = {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.01em'
  };

  const layoutBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    textTransform: 'capitalize',
    width: 'fit-content'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.2s ease',
    zIndex: 2,
    backdropFilter: 'blur(2px)'
  };

  const useTemplateBtnStyle = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transform: isHovered ? 'scale(1)' : 'scale(0.9)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div 
      className="template-card"
      style={cardStyle}
      onClick={() => onSelect && onSelect(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Section */}
      <div style={previewWrapStyle}>
        {duration && (
          <div style={{ ...badgeStyle, top: '16px', right: '16px' }}>
            {typeof duration === 'number' ? `${duration}s` : duration}
          </div>
        )}
        
        {/* Hover Overlay Button */}
        <div style={overlayStyle}>
          <button style={useTemplateBtnStyle}>
            Use Template
          </button>
        </div>

              <TemplatePreview 
          template={template}
          layoutType={layoutType} 
          variant={variant} 
          style={{ borderRadius: '8px' }}
        />
      </div>

      {/* Footer Section */}
      <div style={footerStyle}>
        <h3 style={titleStyle}>{title || 'Untitled Template'}</h3>
        <div style={layoutBadgeStyle}>
          {layoutType}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
