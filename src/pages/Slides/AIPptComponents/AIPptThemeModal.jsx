import { useState, useEffect, useMemo } from 'react'
import { X, Search, Check, Image as ImageIcon } from 'lucide-react'

function themeAppearance(theme) {
  if (theme?.appearance === 'dark' || theme?.appearance === 'light') return theme.appearance
  const vibe = String(theme?.vibe || '').toLowerCase()
  if (vibe.includes('dark')) return 'dark'
  return 'light'
}

export default function AIPptThemeModal({ isOpen, onClose, themes, initialTheme, onSelectTheme }) {
  const [activeThemeId, setActiveThemeId] = useState(initialTheme)
  const [searchQuery, setSearchQuery] = useState('')
  const [appearanceFilter, setAppearanceFilter] = useState('all') // 'all' | 'light' | 'dark'

  useEffect(() => {
    if (isOpen) {
      setActiveThemeId(initialTheme)
      setSearchQuery('')
      setAppearanceFilter('all')
    }
  }, [isOpen, initialTheme])

  const filteredThemes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return (themes || []).filter((t) => {
      const appearance = themeAppearance(t)
      if (appearanceFilter !== 'all' && appearance !== appearanceFilter) return false
      if (!query) return true
      return `${t.name} ${t.vibe || ''}`.toLowerCase().includes(query)
    })
  }, [themes, searchQuery, appearanceFilter])

  if (!isOpen) return null

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0] || filteredThemes[0]

  const handleSelect = () => {
    if (!activeTheme?.id) return
    onSelectTheme(activeTheme.id)
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

            <div className="aig-theme-filters" role="group" aria-label="Theme appearance">
              <button
                type="button"
                className={`filter-pill ${appearanceFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAppearanceFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-pill ${appearanceFilter === 'light' ? 'active' : ''}`}
                onClick={() => setAppearanceFilter('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`filter-pill ${appearanceFilter === 'dark' ? 'active' : ''}`}
                onClick={() => setAppearanceFilter('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="aig-theme-sidebar-scroll">
            <div className="aig-theme-sidebar-grid">
              {!filteredThemes.length && (
                <div className="aig-template-drawer-empty" style={{ gridColumn: '1 / -1' }}>
                  No themes match this filter.
                </div>
              )}
              {filteredThemes.map((t) => {
                const isActive = activeThemeId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`aig-sidebar-theme-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveThemeId(t.id)}
                  >
                    <div className="aig-sidebar-preview" style={{ background: t.outer }}>
                      <div
                        className="aig-sidebar-inner"
                        style={{ background: t.inner, borderColor: t.border || 'transparent' }}
                      >
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

        {/* RIGHT PREVIEW */}
        <div
          className="aig-theme-modal-preview-area"
          style={{ background: activeTheme?.background || activeTheme?.inner || '#f8fafc' }}
        >
          <button type="button" className="aig-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          {activeTheme && (
            <div className="aig-3d-slides-wrapper">
              <div
                className="aig-3d-slide aig-3d-slide-3"
                style={{ background: activeTheme.inner, color: activeTheme.title }}
              >
                <h3 style={{ color: activeTheme.title }}>Welcome</h3>
                <p style={{ color: activeTheme.body }}>
                  A preview of how body copy looks on this palette.
                </p>
                <div className="aig-slide-buttons-row">
                  <button
                    type="button"
                    className="aig-mock-btn-primary"
                    style={{ background: activeTheme.primary, color: '#fff' }}
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    className="aig-mock-btn-secondary"
                    style={{ borderColor: activeTheme.secondary, color: activeTheme.secondary }}
                  >
                    Secondary
                  </button>
                </div>
              </div>

              <div
                className="aig-3d-slide aig-3d-slide-2"
                style={{ background: activeTheme.inner, color: activeTheme.title, position: 'relative' }}
              >
                <h2 style={{ color: activeTheme.title }}>Gallery</h2>
                <div className="aig-3d-images-row">
                  <div className="aig-mock-img" style={{ background: activeTheme.primary }} />
                  <div className="aig-mock-img" style={{ background: activeTheme.secondary }} />
                  <div className="aig-mock-img" style={{ background: activeTheme.accent }} />
                </div>
                <div className="aig-mock-captions">
                  <span style={{ color: activeTheme.body }}>Label one</span>
                  <span style={{ color: activeTheme.body }}>Label two</span>
                  <span style={{ color: activeTheme.body }}>Label three</span>
                </div>
                <div className="aig-3d-floating-image-block">
                  <div className="aig-placeholder-img-icon">
                    <ImageIcon />
                  </div>
                </div>
              </div>

              <div
                className="aig-3d-slide aig-3d-slide-1"
                style={{ background: activeTheme.inner, color: activeTheme.title }}
              >
                <div className="aig-slide-hello" style={{ color: activeTheme.primary }}>
                  HELLO
                </div>
                <h2 style={{ color: activeTheme.title }}>Key points</h2>
                <div className="aig-slide-boxes-row">
                  <div
                    className="aig-mock-text-box"
                    style={{ background: activeTheme.background_secondary || activeTheme.secondary, color: activeTheme.title }}
                  >
                    First insight with primary accent.
                  </div>
                  <div
                    className="aig-mock-text-box"
                    style={{ background: activeTheme.background_secondary || activeTheme.accent, color: activeTheme.title }}
                  >
                    Second insight with secondary tone.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="aig-theme-modal-footer">
            <button type="button" className="aig-btn-secondary-white" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="aig-btn-primary-blue" onClick={handleSelect}>
              Apply theme
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
