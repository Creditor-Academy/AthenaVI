import React, { useState } from 'react';
import { 
  MdVideoLibrary, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClose, 
  MdMonitor, 
  MdPhoneIphone, 
  MdLayers, 
  MdAccessTime 
} from 'react-icons/md';
import './TemplateManager.css';

const TemplateManager = () => {
  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: 'Corporate Onboarding', 
      category: 'Business', 
      ratio: '16:9', 
      scenes: 8, 
      duration: '2:15', 
      thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600',
      tag: 'BUSINESS',
      description: 'A professional template designed for welcoming new employees.'
    },
    { 
      id: 2, 
      name: 'Educational Lecture', 
      category: 'Education', 
      ratio: '16:9', 
      scenes: 12, 
      duration: '5:00', 
      thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
      tag: 'EDUCATION',
      description: 'Perfect for academic content.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Business',
    ratio: '16:9',
    scenes: 1,
    duration: '',
    thumb: '',
    tag: '',
    description: ''
  });

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData(template);
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        category: 'Business',
        ratio: '16:9',
        scenes: 1,
        duration: '',
        thumb: '',
        tag: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...formData, id: t.id } : t));
    } else {
      setTemplates([...templates, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="template-manager-container">
      <div className="template-manager-header">
        <h2><MdVideoLibrary /> Video Template Library</h2>
        <button className="btn-add-template" onClick={() => handleOpenModal()}>
          <MdAdd /> Create New Template
        </button>
      </div>

      <div className="template-grid">
        {templates.map(template => (
          <div key={template.id} className="template-admin-card">
            <div 
              className="template-card-thumb" 
              style={{ backgroundImage: `url(${template.thumb || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'})` }}
            >
              <div className="template-card-tag">{template.tag}</div>
            </div>
            <div className="template-card-content">
              <h3>{template.name}</h3>
              <div className="template-card-meta">
                <span>{template.ratio === '16:9' ? <MdMonitor /> : <MdPhoneIphone />} {template.ratio}</span>
                <span><MdLayers /> {template.scenes} Scenes</span>
                <span><MdAccessTime /> {template.duration}</span>
              </div>
              <div className="template-card-actions">
                <button className="btn-template-edit" onClick={() => handleOpenModal(template)}>
                  <MdEdit size={16} /> Edit
                </button>
                <button className="btn-template-delete" onClick={() => handleDelete(template.id)}>
                  <MdDelete size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="template-modal-overlay">
          <div className="template-modal">
            <div className="template-manager-header">
              <h2>{editingTemplate ? 'Edit Template' : 'Design New Template'}</h2>
              <MdClose style={{ cursor: 'pointer', fontSize: '24px' }} onClick={handleCloseModal} />
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Template Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Modern Product Showcase"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Aspect Ratio</label>
                  <select name="ratio" value={formData.ratio} onChange={handleInputChange}>
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="1:1">Square (1:1)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Total Scenes</label>
                  <input 
                    type="number" 
                    name="scenes" 
                    value={formData.scenes} 
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 1:30"
                  />
                </div>

                <div className="form-group">
                  <label>Primary Tag (All Caps)</label>
                  <input 
                    type="text" 
                    name="tag" 
                    value={formData.tag} 
                    onChange={handleInputChange} 
                    placeholder="e.g. NEW, PRO, FREE"
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input 
                    type="text" 
                    name="thumb" 
                    value={formData.thumb} 
                    onChange={handleInputChange} 
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="3"
                    placeholder="Brief overview of the template's purpose..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-save">
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
