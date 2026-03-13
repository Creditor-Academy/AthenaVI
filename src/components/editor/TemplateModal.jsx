import { MdClose } from 'react-icons/md'
import StaticPreview from './StaticPreview'
import { pageTemplates } from '../../constants/editorData'
import avatar1 from '../../assets/avatar1.png'

const TemplateModal = ({ showTemplateModal, setShowTemplateModal, handleAddTemplateScene }) => {
  if (!showTemplateModal) return null

  return (
    <div className="modal-overlay">
      <div className="template-modal">
        <div className="preview-modal-header">
          <h3 className="preview-modal-title">Select a Scene Template</h3>
          <button className="preview-modal-close" onClick={() => setShowTemplateModal(false)}>
            <MdClose size={24} />
          </button>
        </div>
        <div className="template-grid">
          {pageTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleAddTemplateScene(template)}
            >
              <div className="template-preview-wrapper" style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #dadce0',
                background: '#f8f9fa',
                pointerEvents: 'none'
              }}>
                <StaticPreview scene={{
                  layout: template.layout,
                  titleText: template.fields.find(f => f.key === 'titleText')?.default || template.name,
                  subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || '',
                  avatar: avatar1,
                  ...template.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
                }} />
              </div>
              <div className="template-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ color: '#1a73e8', fontSize: '18px', display: 'flex' }}>{template.icon}</div>
                  <h4 style={{ margin: 0, color: '#202124' }}>{template.name}</h4>
                </div>
                <p>{template.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
