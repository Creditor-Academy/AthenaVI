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

  // Inline Styles
  const cardStyle = {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 12px 20px -8px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const previewWrapStyle = {
    position: 'relative',
    width: '100%',
    backgroundColor: '#f1f5f9'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    zIndex: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const footerStyle = {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: '#ffffff'
  };

  const titleStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const layoutBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '500',
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
          <div style={badgeStyle}>
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
        />
      </div>

      {/* Footer Section */}
      <div style={footerStyle}>
        <h3 style={titleStyle}>{title || 'Untitled Template'}</h3>
        <span style={layoutBadgeStyle}>
          {layoutType} {variant && variant !== 'centered' ? `• ${variant.replace(/-/g, ' ')}` : ''}
        </span>
      </div>
    </div>
  );
};

export default TemplateCard;
