import React from 'react';
import TemplateCard from './TemplateCard';
import SkeletonCard from './SkeletonCard';

/**
 * TemplateGrid Component
 * Renders a responsive grid of TemplateCard components or skeletons.
 * 
 * @param {Object} props
 * @param {Array} props.templates - List of template objects to display
 * @param {boolean} props.loading - Loading state
 * @param {function} props.onSelect - Callback function for when a template is selected
 */
const TemplateGrid = ({ templates = [], loading = false, onSelect }) => {
  // Inline Styles
  const gridStyle = {
    // Changed to 2 columns as requested
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    width: '100%',
    padding: '16px 0',
    boxSizing: 'border-box',
    display: 'grid'
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

  if (loading) {
    return (
      <div style={gridStyle}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

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
