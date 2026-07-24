import { useState } from 'react'
import { FiPlay, FiDownload, FiShare2, FiPlus, FiGrid, FiType, FiImage, FiSettings, FiZoomIn, FiZoomOut, FiMousePointer, FiAlignLeft, FiMoreHorizontal, FiSearch, FiBarChart2, FiFilm, FiLayout, FiSidebar } from 'react-icons/fi'
import { MdUndo, MdRedo, MdDragIndicator, MdOutlineColorLens } from 'react-icons/md'
import { BsStars, BsLayoutSidebarInset, BsLayoutSplit, BsLayoutTextWindow } from 'react-icons/bs'
import { THEMES } from './AIPptWizard'

export default function AIPptEditor({ outline, config, onBack }) {
  const [localSlides, setLocalSlides] = useState(outline)
  const [showMinimap, setShowMinimap] = useState(true)

  const handleAddSlide = (index, type) => {
    const newSlide = {
      id: `new-slide-${Date.now()}`,
      title: type === 'ai' ? 'AI Generated Slide' : type === 'template' ? 'Template Slide' : 'Blank Slide',
      description: 'Double click to add content.'
    }
    const updated = [...localSlides]
    updated.splice(index + 1, 0, newSlide)
    setLocalSlides(updated)
  }

  // Find the selected theme data, fallback to 'petrol' if not found
  // Find the selected theme data, fallback to 'petrol' if not found
  const activeThemeData = THEMES.find(t => t.id === config.theme) || THEMES[0]

  return (
    <div className="aig-editor-container fade-in">
      {/* Top Navbar */}
      <nav className="aig-editor-nav">
        <div className="aig-editor-nav-left">
          <button className="aig-home-btn" onClick={onBack}>
            Exit Editor
          </button>
          <div className="aig-editor-title">
            {config.title || 'Untitled Presentation'}
            <span className="aig-editor-badge">AI Generated</span>
          </div>
        </div>
        <div className="aig-editor-nav-center">
          <button className="aig-editor-btn-icon" title="Undo"><MdUndo size={16} /></button>
          <button className="aig-editor-btn-icon" title="Redo"><MdRedo size={16} /></button>
          <div className="aig-editor-nav-divider"></div>
          <button className="aig-editor-btn-icon active" title="Select"><FiMousePointer size={16} /></button>
          <button className="aig-editor-btn-icon" title="Add Text"><FiType size={16} /></button>
          <button className="aig-editor-btn-icon" title="Add Media"><FiImage size={16} /></button>
        </div>
        <div className="aig-editor-nav-right">
          <div className="aig-editor-avatars">
            <div className="aig-avatar" style={{ backgroundColor: '#f43f5e' }}>A</div>
            <div className="aig-avatar" style={{ backgroundColor: '#8b5cf6' }}>M</div>
            <div className="aig-avatar" style={{ backgroundColor: '#10b981' }}>J</div>
          </div>
          <div className="aig-editor-nav-divider"></div>
          <button className="aig-editor-btn-secondary"><FiShare2 size={16} /> Share</button>
          <button className="aig-editor-btn-secondary"><FiDownload size={16} /> Export</button>
          <button className="aig-editor-btn-primary"><FiPlay size={16} /> Present</button>
        </div>
      </nav>

      <div className="aig-editor-workspace gamma-layout">
        
        {/* Main Infinite Scroll Canvas */}
        <main className="aig-editor-main-scroll" style={{ marginLeft: showMinimap ? '260px' : '0' }}>
          <div className="aig-editor-scroll-container">
            {localSlides.map((slide, idx) => (
              <div key={slide.id} className="aig-scroll-slide-container">
                
                {/* The Massive Slide */}
                <div className="aig-scroll-slide-wrapper">
                  
                  {/* Hover Action Bar on Slide */}
                  <div className="aig-scroll-slide-hover-actions">
                    <button className="aig-slide-action-btn" title="Drag"><MdDragIndicator size={16} /></button>
                    <button className="aig-slide-action-btn" title="Style"><MdOutlineColorLens size={16} /></button>
                    <button className="aig-slide-action-btn" title="Edit with AI"><BsStars size={16} /></button>
                  </div>

                  <div className="aig-editor-canvas" style={{ background: activeThemeData.outer }}>
                    <div className="aig-slide-mock" style={{ background: activeThemeData.inner }}>
                      <h1 className="aig-slide-mock-title" style={{ color: activeThemeData.title }}>
                        {slide.title}
                      </h1>
                      <div className="aig-slide-mock-text" style={{ color: activeThemeData.body }}>
                        {Array.isArray(slide.description) ? (
                          <ul style={{ paddingLeft: '32px', margin: 0 }}>
                            {slide.description.map((pt, i) => (
                              <li key={i} style={{ marginBottom: '12px' }}>{pt}</li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ margin: 0 }}>{slide.description}</p>
                        )}
                      </div>
                      
                      <div className="aig-slide-mock-visual" style={{ borderColor: activeThemeData.body }}>
                        <div className="aig-slide-mock-placeholder" style={{ color: activeThemeData.body }}>
                          {config.mediaStyle || 'Selected'} style visual
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Add Slide Divider Between Slides */}
                <div className="aig-scroll-add-slide-divider">
                  <button className="aig-add-slide-btn">
                    <FiPlus size={14} /> Add
                  </button>
                  <div className="aig-add-slide-dropdown">
                    <div className="aig-dropdown-item" onClick={() => handleAddSlide(idx, 'blank')}><span className="aig-dropdown-icon">📄</span> Blank Slide</div>
                    <div className="aig-dropdown-item" onClick={() => handleAddSlide(idx, 'ai')}><BsStars className="aig-dropdown-icon" /> Add with AI</div>
                    <div className="aig-dropdown-item" onClick={() => handleAddSlide(idx, 'template')}><FiGrid className="aig-dropdown-icon" /> From Template</div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Canvas Zoom Controls (Bottom Right of scroll view) */}
          <div className="aig-canvas-controls">
            <button className="aig-canvas-ctrl-btn"><FiZoomOut size={14} /></button>
            <span className="aig-canvas-zoom-level">100%</span>
            <button className="aig-canvas-ctrl-btn"><FiZoomIn size={14} /></button>
            <div className="aig-canvas-ctrl-divider"></div>
            <button className="aig-canvas-ctrl-btn">Fit</button>
          </div>
        </main>

        {/* Floating Right Toolbar (Gamma style) */}
        <div className="aig-floating-toolbar">
          <button className="aig-float-btn" title="Search"><FiSearch size={18} /></button>
          <button className="aig-float-btn" title="Typography" style={{ color: '#3b82f6' }}><FiType size={18} /></button>
          <button className="aig-float-btn" title="Images" style={{ color: '#3b82f6' }}><FiImage size={18} /></button>
          <button className="aig-float-btn" title="Layouts" style={{ color: '#3b82f6' }}><FiLayout size={18} /></button>
          <button className="aig-float-btn" title="Theme" style={{ color: '#3b82f6' }}><MdOutlineColorLens size={18} /></button>
          <button className="aig-float-btn" title="Charts" style={{ color: '#3b82f6' }}><FiBarChart2 size={18} /></button>
          <button className="aig-float-btn" title="Video" style={{ color: '#3b82f6' }}><FiFilm size={18} /></button>
          <button className="aig-float-btn" title="Forms" style={{ color: '#3b82f6' }}><FiGrid size={18} /></button>
          
          <div className="aig-float-divider"></div>
          
          <button className="aig-float-btn-special" title="Edit Options"><FiSettings size={18} /></button>
        </div>

        {/* Floating Minimap / Outline View on Right */}
        <div className="aig-editor-minimap-toggle">
          <button className={`aig-float-btn ${showMinimap ? 'active' : ''}`} onClick={() => setShowMinimap(!showMinimap)} title="Toggle Outline">
            <FiSidebar size={18} />
          </button>
        </div>

        {showMinimap && (
          <aside className="aig-editor-minimap">
            <div className="aig-minimap-header">
              <button className="aig-minimap-add-btn" onClick={() => handleAddSlide(localSlides.length - 1, 'blank')}>
                <FiPlus size={16} /> New Slide
              </button>
            </div>
            <div className="aig-minimap-scroll">
              {localSlides.map((slide, idx) => (
                <div key={slide.id} className="aig-minimap-item">
                  <span className="aig-minimap-num">{idx + 1}</span>
                  <div className="aig-minimap-thumb" style={{ background: activeThemeData.outer }}>
                    <div className="aig-minimap-thumb-inner" style={{ background: activeThemeData.inner }}>
                      <div className="aig-minimap-thumb-title" style={{ color: activeThemeData.title }}>{slide.title}</div>
                      <div className="aig-minimap-thumb-body" style={{ color: activeThemeData.body }}>
                        {Array.isArray(slide.description) ? slide.description[0]?.substring(0, 20) : slide.description?.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

      </div>
    </div>
  )
}
