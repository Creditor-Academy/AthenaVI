import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { pageTemplates } from '../../../../constants/editorData';
import StaticPreview from './StaticPreview';
import avatar1 from '../../../../assets/avatar1.png';

const EditorSidebarTemplates = ({ handleAddTemplateScene, setShowTemplateModal }) => {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  return (
    <div className="tool-panel-content">
      <div className="media-grid">
        {pageTemplates.map(template => (
          <div
            key={template.id}
            className="media-item"
            title={template.name}
            onClick={() => setPreviewTemplate(template)}
          >
            {template.icon}
          </div>
        ))}
      </div>

      {previewTemplate && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="template-modal" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="preview-modal-header">
              <h3 className="preview-modal-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)', display: 'flex' }}>{previewTemplate.icon}</span>
                {previewTemplate.name}
              </h3>
              <button className="preview-modal-close" onClick={() => setPreviewTemplate(null)}>
                <MdClose size={24} />
              </button>
            </div>

            <div style={{ padding: '0 24px 16px 24px' }}>
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                pointerEvents: 'none',
                marginBottom: '16px'
              }}>
                <StaticPreview scene={{
                  layout: previewTemplate.layout,
                  titleText: previewTemplate.fields.find(f => f.key === 'titleText')?.default || previewTemplate.name,
                  subtitleText: previewTemplate.fields.find(f => f.key === 'subtitleText')?.default || '',
                  avatar: avatar1,
                  ...previewTemplate.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
                }} />
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                {previewTemplate.description}
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setPreviewTemplate(null);
                    if (setShowTemplateModal) setShowTemplateModal(true);
                  }}
                >
                  See more
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    handleAddTemplateScene(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Add this template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorSidebarTemplates;
