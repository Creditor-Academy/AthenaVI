import { useState, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'

export default function AIPptThemeModal({ isOpen, onClose, themes, initialTheme, onSelectTheme }) {
  const [activeThemeId, setActiveThemeId] = useState(initialTheme)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync active theme when opened
  useEffect(() => {
    if (isOpen) {
      setActiveThemeId(initialTheme)
      setSearchQuery('')
    }
  }, [isOpen, initialTheme])

  if (!isOpen) return null;

  const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];
  const query = searchQuery.toLowerCase().trim();
  const filteredThemes = themes.filter(t =>
    `${t.name} ${t.vibe || ''}`.toLowerCase().includes(query)
  );

  const handleSelect = () => {
    onSelectTheme(activeThemeId)
    onClose()
  }

  return (
    <div className="aig-theme-modal-overlay fade-in">
      <div className="aig-theme-modal-container scale-in">
        
        {/* LEFT SIDEBAR */}
        <div className="aig-theme-modal-sidebar">
          <div className="aig-theme-sidebar-header">
            <h2>All themes</h2>
            <p>View and select from all themes</p>
            
            <div className="aig-theme-search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for a theme" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="aig-theme-filters">
              <button className="filter-pill">Dark</button>
              <button className="filter-pill">Light</button>
              <button className="filter-pill">Professional</button>
              <button className="filter-pill">Colorful</button>
            </div>
          </div>

          <div className="aig-theme-sidebar-scroll">
            <div className="aig-theme-sidebar-grid">
              {filteredThemes.map(t => {
                const isActive = activeThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    className={`aig-sidebar-theme-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveThemeId(t.id)}
                  >
                    <div className="aig-sidebar-preview" style={{ background: t.outer }}>
                      <div className="aig-sidebar-inner" style={{ background: t.inner, borderColor: t.border || 'transparent' }}>
                        <h4 style={{ color: t.title }}>Title</h4>
                        <p style={{ color: t.body }}>Body & link</p>
                        <div className="aig-sidebar-swatches">
                          <span style={{ background: t.primary }} />
                          <span style={{ background: t.secondary }} />
                          <span style={{ background: t.accent }} />
                        </div>
                      </div>
                    </div>
                    <div className="aig-sidebar-footer">
                      {isActive && <Check size={14} className="aig-theme-check" />}
                      <span>{t.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW AREA */}
        <div className="aig-theme-modal-preview-area" style={{ background: activeTheme.outer }}>
          
          <button className="aig-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          {/* CASCADING 3D SLIDES PREVIEW */}
          <div className="aig-3d-slides-wrapper" key={activeTheme.id}>
             
             {/* Slide 3 (Back) */}
             <div className="aig-3d-slide aig-3d-slide-3" style={{ background: activeTheme.inner }}>
                <h3 style={{ color: activeTheme.title }}>This is a title</h3>
                <h2 style={{ color: activeTheme.title }}>It's like a heading, but bigger</h2>
                <p style={{ color: activeTheme.body }}>
                  This is body text. You can change your fonts, colors and images later in the theme editor.
                  You can also create your own custom branded theme. What's more, you can create multiple themes and switch between them at any time.
                </p>
             </div>

             {/* Slide 2 (Middle) */}
             <div className="aig-3d-slide aig-3d-slide-2" style={{ background: activeTheme.inner }}>
                <h3 style={{ color: activeTheme.title }}>This is a heading</h3>
                <div className="aig-3d-images-row">
                  <div className="aig-mock-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=300&q=80)', backgroundSize: 'cover' }}></div>
                  <div className="aig-mock-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&q=80)', backgroundSize: 'cover' }}></div>
                  <div className="aig-mock-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80)', backgroundSize: 'cover' }}></div>
                </div>
                <div className="aig-mock-captions">
                  <span style={{ color: activeTheme.body }}>Image 1</span>
                  <span style={{ color: activeTheme.body }}>Image 2</span>
                  <span style={{ color: activeTheme.body }}>Image 3</span>
                </div>
             </div>

             {/* Slide 1 (Front) */}
             <div className="aig-3d-slide aig-3d-slide-1" style={{ background: activeTheme.inner }}>
                <div className="aig-slide-hello">Hello 👋</div>
                <h2 style={{ color: activeTheme.title }}>This is a theme preview</h2>
                <p style={{ color: activeTheme.body }}>
                  This is body text. You can change your fonts, colors and images later in the theme editor.
                  You can also create your own custom branded theme.
                </p>
                <a href="#" style={{ color: activeTheme.accent || activeTheme.title, display: 'block', margin: '16px 0', textDecoration: 'underline' }}>This is a link.</a>
                
                <div className="aig-slide-boxes-row">
                  <div className="aig-mock-text-box" style={{ background: 'rgba(0,0,0,0.05)', color: activeTheme.body }}>
                    This is a smart layout: it acts as a text box.
                  </div>
                  <div className="aig-mock-text-box" style={{ background: 'rgba(0,0,0,0.05)', color: activeTheme.body }}>
                    You can get these by typing /smart
                  </div>
                </div>

                <div className="aig-slide-buttons-row">
                  <button className="aig-mock-btn-primary" style={{ background: activeTheme.title, color: activeTheme.inner }}>Primary button</button>
                  <button className="aig-mock-btn-secondary" style={{ borderColor: activeTheme.title, color: activeTheme.title }}>Secondary button</button>
                </div>
             </div>
             
          </div>

          <div className="aig-theme-modal-footer">
            <button className="aig-btn-secondary-white" onClick={onClose}>Cancel</button>
            <button className="aig-btn-primary-blue" onClick={handleSelect}>Select theme</button>
          </div>
        </div>

      </div>
    </div>
  )
}
