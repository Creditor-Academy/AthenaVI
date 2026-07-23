import { useState, useRef, useEffect } from 'react'
import { Sparkles, ChevronLeft, ArrowRight, Wand2, ArrowUp } from 'lucide-react'

// Media
import mediaRealistic from '../../assets/slides_icons/media_realistic.png'
import mediaAnime from '../../assets/slides_icons/media_anime.png'
import mediaCartoon from '../../assets/slides_icons/media_cartoon.png'
import mediaSketch from '../../assets/slides_icons/media_sketch.png'
import mediaPainting from '../../assets/Template_Image/gen_temp1.png'

// Templates
import temp1 from '../../assets/Template_Image/gen_temp1.png'
import temp2 from '../../assets/Template_Image/gen_temp2.png'
import temp3 from '../../assets/Template_Image/gen_temp3.png'
import temp4 from '../../assets/Template_Image/gen_temp4.png'

import './AIPptGenerator.css'

const SUGGESTED_PROMPTS = [
  "Turn meeting notes into a presentation",
  "Summarize a research paper into key takeaways",
  "Research industry trends",
  "Create a strategy brief from planning notes"
]

const TONES = ['Professional', 'Creative', 'Academic', 'Persuasive', 'Casual']

const THEMES = [
  { id: 'modern-light', name: 'Modern Light', color1: '#ffffff', color2: '#f1f5f9' },
  { id: 'dark-neon', name: 'Dark Neon', color1: '#0f172a', color2: '#8b5cf6' },
  { id: 'corporate-blue', name: 'Corporate Blue', color1: '#0ea5e9', color2: '#0284c7' },
  { id: 'soft-pastel', name: 'Soft Pastel', color1: '#fdf4ff', color2: '#fce7f3' },
  { id: 'minimalist', name: 'Minimalist', color1: '#fafafa', color2: '#e5e5e5' },
]

const TEMPLATES = [
  { id: 'blank', name: 'Start Blank', img: null },
  { id: 'corp-pitch', name: 'Corporate Pitch', img: temp1 },
  { id: 'marketing', name: 'Marketing Campaign', img: temp2 },
  { id: 'social', name: 'Social Media', img: temp3 },
  { id: 'portfolio', name: 'Personal Portfolio', img: temp4 },
]

const MEDIA_STYLES = [
  { id: 'realistic', name: 'Realistic', img: mediaRealistic },
  { id: 'anime', name: 'Anime', img: mediaAnime },
  { id: 'cartoon', name: 'Cartoon', img: mediaCartoon },
  { id: 'sketch', name: 'Sketch', img: mediaSketch },
  { id: 'painting', name: 'Painting', img: mediaPainting },
]

const SLIDE_COUNTS = [10, 15, 20, 25, 30]

export default function AIPptGenerator({ onBack }) {
  const [step, setStep] = useState(1)
  
  // Form Data
  const [title, setTitle] = useState('')
  const [outline, setOutline] = useState('')
  const [tone, setTone] = useState('Professional')
  
  const [baseTemplate, setBaseTemplate] = useState('blank')
  const [theme, setTheme] = useState('modern-light')

  const [slides, setSlides] = useState(10)
  const [textAmount, setTextAmount] = useState('Medium')
  const [mediaStyle, setMediaStyle] = useState('realistic')
  
  const [isGenerating, setIsGenerating] = useState(false)
  
  const outlineRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.style.height = 'auto'
      outlineRef.current.style.height = outlineRef.current.scrollHeight + 'px'
    }
  }, [outline])

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 3000) // fake generation
  }

  const handlePromptSubmit = () => {
    if (title.trim()) setStep(2)
  }

  const renderStepIndicator = () => (
    <div className="aig-wizard-indicator">
      <div className={`aig-wizard-dot ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)} />
      <div className={`aig-wizard-dot ${step >= 2 ? 'active' : ''}`} onClick={() => title.trim() && setStep(2)} />
      <div className={`aig-wizard-dot ${step >= 3 ? 'active' : ''}`} onClick={() => title.trim() && setStep(3)} />
    </div>
  )

  return (
    <div className="aig-container">
      {/* Sky Blue Gradient Background with Fixed Waves */}
      <div className="aig-bg-sky">
        <div className="aig-bg-wave aig-bg-wave-1"></div>
        <div className="aig-bg-wave aig-bg-wave-2"></div>
        <div className="aig-bg-wave aig-bg-wave-3"></div>
      </div>
      
      <header className="aig-header-floating">
        <button className="aig-home-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Home
        </button>
        {step > 1 && renderStepIndicator()}
        <div style={{ width: '80px' }}></div>
      </header>

      <main className={`aig-main-fullscreen ${step === 1 ? 'aig-main-center' : ''}`}>
        
        {step === 1 && (
          <div className="aig-hero-section fade-in">
            
            <div className="aig-hero-card">
              <div className="aig-hero-card-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}></div>
              <div className="aig-hero-card-content">
                
                <h1 className="aig-hero-card-title">Create with Agent</h1>
                <p className="aig-hero-card-subtitle">
                  Turn your ideas, notes and files into presentations. <br/>
                  Agent does the research and shapes the narrative.
                </p>

                <div className="aig-prompt-container">
                  <div className="aig-prompt-box">
                    
                    <div className="aig-prompt-input-row">
                      <input 
                        className="aig-prompt-input"
                        placeholder="Describe it, paste it or write an idea..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                        autoFocus
                      />
                      <button 
                        className={`aig-prompt-send ${title.trim() ? 'active' : ''}`} 
                        onClick={handlePromptSubmit}
                        disabled={!title.trim()}
                      >
                        <ArrowUp size={20} />
                      </button>
                    </div>

                    {title.trim() && (
                      <div className="aig-prompt-expanded fade-in">
                        <textarea 
                          ref={outlineRef}
                          className="aig-prompt-outline"
                          placeholder="Optional outline or notes..."
                          value={outline}
                          onChange={(e) => setOutline(e.target.value)}
                          rows={1}
                        />
                        
                        <div className="aig-prompt-tone">
                          <span className="aig-prompt-tone-label">Voice & Tone:</span>
                          <div className="aig-pill-grid">
                            {TONES.map(t => (
                              <button 
                                key={t}
                                className={`aig-pill-small ${tone === t ? 'active' : ''}`}
                                onClick={() => setTone(t)}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!title.trim() && (
                    <div className="aig-prompt-suggestions">
                      {SUGGESTED_PROMPTS.map(p => (
                        <button key={p} className="aig-prompt-pill" onClick={() => setTitle(p)}>
                          <Sparkles size={14}/> {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="aig-step aig-step--2 fade-in">
            <div className="aig-step-header">
              <h2 className="aig-step-title">The Vibe</h2>
              <p className="aig-step-subtitle">Select a base template and color theme.</p>
            </div>
            
            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Base Template</h3>
              <div className="aig-selection-grid">
                {TEMPLATES.map(tmp => (
                  <button
                    key={tmp.id}
                    className={`aig-template-card ${baseTemplate === tmp.id ? 'active' : ''}`}
                    onClick={() => setBaseTemplate(tmp.id)}
                  >
                    {tmp.img ? (
                      <div className="aig-template-img-wrapper">
                        <img src={tmp.img} alt={tmp.name} className="aig-template-img" />
                      </div>
                    ) : (
                      <div className="aig-template-blank">
                        <Sparkles size={32} />
                      </div>
                    )}
                    <span className="aig-card-label">{tmp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Color Theme</h3>
              <div className="aig-theme-grid">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    className={`aig-theme-card ${theme === t.id ? 'active' : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div className="aig-theme-preview">
                      <span style={{ backgroundColor: t.color1 }}></span>
                      <span style={{ backgroundColor: t.color2 }}></span>
                    </div>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="aig-step aig-step--3 fade-in">
            <div className="aig-step-header">
              <h2 className="aig-step-title">The Details</h2>
              <p className="aig-step-subtitle">Fine-tune the content and media.</p>
            </div>
            
            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Slide Count</h3>
              <div className="aig-pill-grid">
                {SLIDE_COUNTS.map(count => (
                  <button 
                    key={count}
                    className={`aig-pill ${slides === count ? 'active' : ''}`}
                    onClick={() => setSlides(count)}
                  >
                    {count} Slides
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Text Density</h3>
              <div className="aig-pill-grid">
                {['Low', 'Medium', 'High'].map(level => (
                  <button 
                    key={level}
                    className={`aig-pill aig-pill--detailed ${textAmount === level ? 'active' : ''}`}
                    onClick={() => setTextAmount(level)}
                  >
                    <strong>{level}</strong>
                    <span>{level === 'Low' ? 'Visual heavy' : level === 'Medium' ? 'Balanced' : 'Text heavy'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Media Style</h3>
              <div className="aig-selection-grid">
                {MEDIA_STYLES.map(style => (
                  <button
                    key={style.id}
                    className={`aig-media-card ${mediaStyle === style.id ? 'active' : ''}`}
                    onClick={() => setMediaStyle(style.id)}
                  >
                    <div className="aig-media-img-wrapper">
                      <img src={style.img} alt={style.name} className="aig-media-img" />
                    </div>
                    <span className="aig-card-label">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {step > 1 && (
        <footer className="aig-footer fade-in">
          <div className="aig-footer-content">
            <button className="aig-btn-secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
            
            {step < 3 ? (
              <button 
                className="aig-btn-primary" 
                onClick={() => setStep(step + 1)}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                className={`aig-btn-magic ${isGenerating ? 'loading' : ''}`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="aig-spinner"></div>
                    Designing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Magic
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
