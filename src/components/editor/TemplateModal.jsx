import { useState, useMemo, useEffect } from 'react'
import {
  MdClose, MdSearch, MdAutoAwesome, MdFilterList,
  MdDashboard, MdViewQuilt, MdCenterFocusStrong, MdGridOn, MdDynamicFeed,
  MdLayers, MdTimer, MdLabel, MdPlayCircleOutline
} from 'react-icons/md'
import StaticPreview from './StaticPreview'
import { predefinedAvatars } from '../../constants/editorData'

const placeholderAvatar = predefinedAvatars[0].image;

const categories = [
  {
    id: 'All',
    label: 'All Templates',
    previews: [
      predefinedAvatars[1].image
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    previews: [predefinedAvatars[0].image]
  },
  {
    id: 'educational',
    label: 'Educational',
    previews: [predefinedAvatars[1].image]
  },
  {
    id: 'corporate',
    label: 'Corporate',
    previews: [predefinedAvatars[2].image]
  },
  {
    id: 'social',
    label: 'Social',
    previews: [predefinedAvatars[3].image]
  },
  {
    id: 'personal',
    label: 'Personal',
    previews: [predefinedAvatars[4].image]
  }
];

const layoutTypes = ['All Layouts', 'Hero', 'Split', 'Centered', 'Grid', 'Story'];

const TemplateModal = ({ showTemplateModal, setShowTemplateModal, handleAddTemplateScene }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeLayout, setActiveLayout] = useState('All Layouts')
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)

  // Dynamic Fetching
  useEffect(() => {
    if (!showTemplateModal) return;

    const fetchTemplates = async () => {
      setLoading(true);
      try {
        if (activeCategory === 'All') {
          const files = ['marketing', 'educational', 'corporate', 'social', 'personal'];
          const responses = await Promise.all(
            files.map(file => fetch(`/templates/${file}.json`).then(res => res.json()))
          );
          const allScenes = responses.flatMap(data => data.scenes);
          setTemplates(allScenes);
        } else {
          const response = await fetch(`/templates/${activeCategory}.json`);
          const data = await response.json();
          setTemplates(data.scenes || []);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [activeCategory, showTemplateModal]);

  // Combined Filtering Logic
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = (template.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLayout = activeLayout === 'All Layouts' || template.layoutType === activeLayout;
      return matchesSearch && matchesLayout;
    });
  }, [templates, searchQuery, activeLayout]);

  if (!showTemplateModal) return null

  return (
    <div className="modal-overlay template-selector-overlay">
      <div className="template-modal-modern">
        {/* Sidebar */}
        <aside className="template-sidebar">
          <div className="sidebar-header">
            <MdAutoAwesome className="logo-icon" />
            <span>Categories</span>
          </div>
          <nav className="sidebar-nav">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`nav-item ${activeCategory === cat.label || activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="nav-label-text">{cat.label}</span>
                <div className="mini-previews">
                  {cat.previews.map((src, i) => (
                    <div key={i} className="mini-img" style={{ backgroundImage: `url(${src})`, zIndex: cat.previews.length - i }} />
                  ))}
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="template-main">
          {/* Header */}
          <header className="template-header">
            <div className="header-text">
              <h2>Choose a template to start your scene</h2>
              <p>Professional layouts tailored for your {activeCategory === 'All' ? 'needs' : activeCategory}.</p>
            </div>
            <button className="close-btn" onClick={() => setShowTemplateModal(false)}>
              <MdClose size={24} />
            </button>
          </header>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search templates or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="layout-filters">
              {layoutTypes.map(layout => (
                <button
                  key={layout}
                  className={`layout-pill ${activeLayout === layout ? 'active' : ''}`}
                  onClick={() => setActiveLayout(layout)}
                >
                  {layout}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid Area */}
          <div className="templates-grid-area premium-scrollbar">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Loading templates...</span>
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="templates-grid">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="template-card-modern"
                    onClick={() => handleAddTemplateScene(template)}
                  >
                    <div className="preview-wrap">
                      <StaticPreview scene={{
                        layout: template.layoutType?.toLowerCase() || 'split',
                        titleText: template.title,
                        avatar: placeholderAvatar,
                        clips: template.clips,
                        background: template.background || '#f8fafc'
                      }} />
                      <div className="hover-overlay">
                        <button className="use-btn">
                          <MdPlayCircleOutline /> Use Template
                        </button>
                      </div>
                      <div className="duration-tag">
                        <MdTimer /> {template.duration}s
                      </div>
                    </div>

                    <div className="card-info">
                      <div className="title-row">
                        <h4>{template.title}</h4>
                        <span className="layout-badge">{template.layoutType}</span>
                      </div>
                      <p className="description">{template.description}</p>
                      <div className="flow-info">
                        <MdLayers className="flow-icon" />
                        <span>{template.flow}</span>
                      </div>
                      <div className="tags-row">
                        {template.tags?.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <MdSearch size={64} />
                <h3>No matching templates</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .template-modal-modern {
          width: 90vw;
          height: 85vh;
          max-width: 1200px;
          background: #ffffff;
          border-radius: 20px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Sidebar */
        .template-sidebar {
          width: 300px;
          background: #fcfcfd;
          border-right: 1px solid #e6e8eaff;
          padding: 28px 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
        }

        .template-sidebar::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0,0,0,0.08),
            transparent
          );
}

        .sidebar-header {
          padding: 0 28px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          color: #0f172a;
          font-size: 18px;
        }

        .logo-icon { color: #3b82f6; font-size: 22px; }

        .sidebar-nav { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
          padding: 0 16px; 
        }

        .nav-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border: none;
          background: transparent;
          color: #475569;
          font-weight: 600;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          width: 280px;
          font-size: 15px;
          gap: 20px;
        }

        .nav-label-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mini-previews {
          display: flex;
          align-items: center;
          position: relative;
          height: 42px;
          width: 72px;
          flex-shrink: 0;
        }

       .mini-img {
          width: 60px;
          height: 42px;
          background-size: cover;
          background-position: center;
          border-radius: 6px;
          border: none;           
          box-shadow: none;
          background-color: transparent;
        }

        .mini-previews .mini-img:nth-child(2) {
          right: 18px;
          opacity: 0.6;
          transform: scale(0.92);
        }

        .nav-item:hover { background: #f1f5f9; color: #0f172a; }
        .nav-item.active { 
          background: #3b82f6; 
          color: #ffffff; 
          box-shadow: 0 10px 20px -8px rgba(59, 130, 246, 0.4);
        }

        .nav-item.active .mini-img { border-color: rgba(255,255,255,0.5); }

        /* Main Area */
        .template-main { flex: 1; display: flex; flex-direction: column; background: #fff; min-width: 0; }

        .template-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h2 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 700; }
        .header-text p { margin: 4px 0 0; color: #64748b; font-size: 14px; }

        .close-btn { background: transparent; border: none; cursor: pointer; color: #94a3b8; }
        .close-btn:hover { color: #0f172a; }

        /* Filters Bar */
        .filters-bar {
          padding: 16px 32px;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-box {
          position: relative;
          width: 100%;
        }

        .search-box input {
          width: 100%;
          padding: 10px 10px 10px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          font-size: 14px;
        }

        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

        .layout-filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .layout-filters::-webkit-scrollbar { display: none; }

        .layout-pill {
          padding: 6px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .layout-pill:hover { border-color: #3b82f6; color: #3b82f6; }
        .layout-pill.active { background: #1e293b; color: #fff; border-color: #1e293b; }

        /* Grid Area */
        .templates-grid-area { flex: 1; overflow-y: auto; padding: 24px 32px; background: #fafafa; }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .template-card-modern {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #eceff1;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .template-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .preview-wrap {
          position: relative;
          aspect-ratio: 16/9;
          background: #f1f5f9;
        }

        .hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
          z-index: 10;
        }

        .preview-wrap:hover .hover-overlay { opacity: 1; }

        .use-btn {
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 100px;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .use-btn .MdPlayCircleOutline {
          font-size: 20px;
        }

        .duration-tag {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-info { padding: 16px; }

        .title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
        .title-row h4 { margin: 0; font-size: 15px; color: #1e293b; line-height: 1.4; }
        
        .layout-badge {
          background: #eff6ff;
          color: #3b82f6;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .description { font-size: 13px; color: #64748b; margin: 0 0 12px; line-height: 1.5; height: 3.0em; overflow: hidden; }

        .flow-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #1e40af;
          background: #ebf0fe;
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .tags-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-size: 11px; color: #94a3b8; font-weight: 500; }

        .loading-state, .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 992px) {
          .template-sidebar { width: 240px; }
          .nav-item { padding: 12px 16px; font-size: 13px; }
          .template-modal-modern { width: 98vw; height: 95vh; }
          .mini-previews { width: 40px; transform: scale(0.85); transform-origin: right; }
        }
      `}</style>
    </div>
  )
}
export default TemplateModal
