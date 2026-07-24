import { useState, useEffect } from 'react'
import { Edit2, Check, LayoutTemplate, Plus } from 'lucide-react'

export default function AIPptOutline({ initialOutline, onGenerate, onBack }) {
  const [outline, setOutline] = useState(initialOutline)
  const [stepReady, setStepReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStepReady(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleEditOutline = (id) => {
    setOutline(prev => prev.map(item => 
      item.id === id ? { ...item, isEditing: !item.isEditing } : item
    ))
  }

  const updateOutlineTitle = (id, newTitle) => {
    setOutline(prev => prev.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    ))
  }

  return (
    <>
      <main className="aig-main-fullscreen">
        <div className={`aig-step aig-step--4 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
          <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
            <h2 className="aig-step-title">The Blueprint</h2>
            <p className="aig-step-subtitle">Review your outline. Click edit to tweak any slide topics before we generate.</p>
          </div>
          
          <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
          <div className="aig-outline-list">
            {outline.map((slide, idx) => (
              <div 
                key={slide.id} 
                className="aig-outline-card aig-stagger-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="aig-outline-number">
                  <span>{slide.id}</span>
                </div>
                <div className="aig-outline-content">
                  {slide.isEditing ? (
                    <input 
                      className="aig-outline-input fade-in" 
                      value={slide.title}
                      onChange={(e) => updateOutlineTitle(slide.id, e.target.value)}
                      autoFocus
                      onBlur={() => toggleEditOutline(slide.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleEditOutline(slide.id)}
                    />
                  ) : (
                    <h4 className="aig-outline-topic fade-in">{slide.title}</h4>
                  )}
                  
                  <ul className="aig-outline-bullets fade-in">
                    {Array.isArray(slide.description) ? (
                      slide.description.map((pt, i) => <li key={i}>{pt}</li>)
                    ) : (
                      <li>{slide.description}</li>
                    )}
                  </ul>

                </div>
                <button 
                  className={`aig-outline-edit-btn ${slide.isEditing ? 'editing' : ''}`} 
                  onClick={() => toggleEditOutline(slide.id)}
                  aria-label="Edit topic"
                >
                  {slide.isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                </button>
              </div>
            ))}
            
            <button className="aig-outline-add-btn aig-stagger-fade-in" style={{ animationDelay: `${outline.length * 0.05}s` }}>
              <Plus size={18} strokeWidth={2.5} /> Add slide
            </button>
          </div>
          </div>
        </div>
      </main>

      <footer className={`aig-footer ${stepReady ? 'fade-in' : ''}`} style={{ opacity: stepReady ? 1 : 0 }}>
        <div className="aig-footer-content">
          <button className="aig-btn-secondary" onClick={onBack}>
            Back
          </button>
          <button 
            className="aig-btn-primary"
            onClick={() => onGenerate(outline)}
          >
            <LayoutTemplate size={18} /> Build Presentation
          </button>
        </div>
      </footer>
    </>
  )
}
