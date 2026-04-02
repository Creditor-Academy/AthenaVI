import React from 'react';
import TemplateCard from './TemplateCard';

/**
 * TemplateGrid Component
 * Renders a responsive grid of TemplateCard components.
 * 
 * @param {Object} props
 * @param {Array} props.templates - List of template objects to display
 * @param {function} props.onSelect - Callback function for when a template is selected
 */
const TemplateGrid = ({ templates = [], onSelect }) => {
  // Inline Styles
  const gridStyle = {
    display: 'grid',
    // Default to 1 column for mobile, 2 for tablet, 3 for desktop
    // Using a simpler 3-column repeat for this specific request
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
    padding: '16px 0',
    boxSizing: 'border-box'
  };

  const emptyStateStyle = {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #e2e8f0',
    textAlign: 'center'
  };

  if (!templates || templates.length === 0) {
    return (
      <div style={gridStyle}>
        <div style={emptyStateStyle}>
          <p style={{ margin: 0, fontWeight: '500' }}>No templates found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-grid" style={gridStyle}>
      {templates.map((template, index) => (
        <TemplateCard 
          key={template.id || index} 
          template={template} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  );
};

export default TemplateGrid;
