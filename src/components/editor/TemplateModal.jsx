import { useState, useMemo } from 'react'
import { MdClose, MdSearch, MdAutoAwesome, MdHistory, MdFavoriteBorder, MdDashboardCustomize } from 'react-icons/md'
import StaticPreview from './StaticPreview'
import { pageTemplates, predefinedAvatars } from '../../constants/editorData'
import projectTemplate from '../../constants/projectTemplate.json'
const placeholderAvatar = predefinedAvatars[0].image;

const TemplateModal = ({ showTemplateModal, setShowTemplateModal, handleAddTemplateScene }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Marketing', 'Educational', 'Corporate', 'Social', 'Personal']

  const filteredTemplates = useMemo(() => {
    return projectTemplate.project.scenes.filter(template => {
      const matchesSearch = (template.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, activeCategory])

  if (!showTemplateModal) return null

  return (
    <div className="modal-overlay template-selector-overlay">
      <div className="template-modal premium-template-modal">
        <div className="template-modal-header">
          <div className="header-content">
            <h3 className="template-modal-title">
              <MdAutoAwesome style={{ color: 'var(--primary)', marginRight: '8px' }} />
              Choose Scene Template
            </h3>
            <p className="template-modal-subtitle">Start with a professionally designed layout for your scene.</p>
          </div>
          <button className="template-modal-close" onClick={() => setShowTemplateModal(false)}>
            <MdClose size={24} />
          </button>
        </div>

        <div className="template-filters-bar">
          <div className="template-search">
            <MdSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-scroll">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="template-grid-container premium-scrollbar">
          {filteredTemplates.length > 0 ? (
            <div className="template-grid">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="template-card premium-card"
                  onClick={() => handleAddTemplateScene(template)}
                  style={{ '--index': index }}
                >
                  <div className="template-preview-container">
                    <div className="template-preview-content">
                       <StaticPreview scene={{
                        layout: template.layout || 'split-right',
                        titleText: template.title,
                        avatar: placeholderAvatar,
                        clips: template.clips,
                        background: template.background
                      }} />
                    </div>
                    <div className="template-card-overlay">
                      <button className="btn-add-scene">
                        <MdAutoAwesome /> Use Template
                      </button>
                    </div>
                    <div className="template-badge">
                      {template.layout === 'quote' ? 'Statement' : 'Layout'}
                    </div>
                  </div>
                  <div className="template-card-footer">
                    <div className="template-icon-box">{template.icon}</div>
                     <div className="template-text">
                      <h4>{template.title}</h4>
                      <p>{template.duration}s Sequence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <MdSearch size={48} />
              <h4>No templates found</h4>
              <p>Try searching for something else or browse categories.</p>
            </div>
          )}
        </div>

        <div className="template-modal-footer">
            <div className="footer-info">
                <MdHistory style={{ marginRight: '4px' }} />
                <span>Recently used templates will appear here</span>
            </div>
          <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
