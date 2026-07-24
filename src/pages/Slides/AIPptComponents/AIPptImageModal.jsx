import { useState, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'

const FILTERS = ['All', 'Scenic', 'Realistic', 'Minimal', 'Playful', 'Bold', 'Abstract']

export default function AIPptImageModal({ isOpen, onClose, imageStyles, initialStyle, onSelectStyle }) {
  const [activeStyleId, setActiveStyleId] = useState(initialStyle)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setActiveStyleId(initialStyle)
      setSearchQuery('')
      setActiveFilter('All')
    }
  }, [isOpen, initialStyle])

  if (!isOpen) return null;

  const activeStyle = imageStyles.find(s => s.id === activeStyleId) || imageStyles[0];

  const filteredStyles = imageStyles.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'All' || (s.tags && s.tags.includes(activeFilter))
    return matchesSearch && matchesFilter
  });

  const handleSave = () => {
    onSelectStyle(activeStyleId)
    onClose()
  }

  return (
    <div className="aig-theme-modal-overlay fade-in">
      <div className="aig-image-modal-container scale-in">
        
        {/* HEADER & MAIN GRID (LEFT SIDE) */}
        <div className="aig-image-modal-main">
          
          <div className="aig-image-modal-header">
            <h2>Image choices</h2>
            <button className="aig-modal-close-icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="aig-image-modal-search-area">
            <div className="aig-theme-search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for a style" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="aig-theme-filters">
              {FILTERS.map(f => (
                <button 
                  key={f}
                  className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="aig-image-modal-grid-scroll">
            <div className="aig-image-style-modal-grid">
              {filteredStyles.map(s => {
                const isActive = activeStyleId === s.id;
                return (
                  <button
                    key={s.id}
                    className={`aig-image-style-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveStyleId(s.id)}
                  >
                    <div className="aig-image-card-img-wrapper">
                      <img src={s.img} alt={s.name} />
                      {isActive && (
                        <div className="aig-image-card-check-overlay">
                          <Check size={16} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="aig-image-card-label">{s.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* DETAILS SIDEBAR (RIGHT SIDE) */}
        <div className="aig-image-modal-sidebar">
           <div className="aig-image-sidebar-content">
             <h3 className="aig-image-sidebar-title">{activeStyle.name}</h3>
             
             {activeStyle.tags && activeStyle.tags[0] && (
               <span className="aig-image-sidebar-tag">{activeStyle.tags[0]}</span>
             )}

             <div className="aig-image-sidebar-preview-grid fade-in" key={activeStyle.id}>
                {/* 4 Distinct Preview Images for the selected style */}
                <img src={activeStyle.img} alt="Preview 1" />
                <img src={`https://picsum.photos/seed/${activeStyle.id}-2/200/200`} alt="Preview 2" />
                <img src={`https://picsum.photos/seed/${activeStyle.id}-3/200/200`} alt="Preview 3" />
                <img src={`https://picsum.photos/seed/${activeStyle.id}-4/200/200`} alt="Preview 4" />
             </div>
           </div>

           <div className="aig-image-modal-footer">
             <button className="aig-btn-secondary-white" onClick={onClose}>Cancel</button>
             <button className="aig-btn-primary-blue" onClick={handleSave}>Save</button>
           </div>
        </div>

      </div>
    </div>
  )
}
