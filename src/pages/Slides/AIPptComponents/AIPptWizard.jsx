import { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowUp, ArrowRight, Paperclip, FileText, BookOpen, TrendingUp, AlignLeft, Palette, Check, Globe, Image as ImageIcon, Box, Ban, ChevronDown, Star, Building } from 'lucide-react'

// Media
import mediaRealistic from '../../../assets/slides_icons/media_realistic.png'
import mediaAnime from '../../../assets/slides_icons/media_anime.png'
import mediaCartoon from '../../../assets/slides_icons/media_cartoon.png'
import mediaSketch from '../../../assets/slides_icons/media_sketch.png'
import mediaPainting from '../../../assets/Template_Image/gen_temp1.png'

// Templates
import temp1 from '../../../assets/Template_Image/gen_temp1.png'
import temp2 from '../../../assets/Template_Image/gen_temp2.png'
import temp3 from '../../../assets/Template_Image/gen_temp3.png'
import temp4 from '../../../assets/Template_Image/gen_temp4.png'

import themePetrolImg from '../../../assets/Template_Image/theme_petrol.png'
import themeStardustImg from '../../../assets/Template_Image/theme_stardust.png'
import themeChocolateImg from '../../../assets/Template_Image/theme_chocolate.png'
import themeMossImg from '../../../assets/Template_Image/theme_moss.png'
import themeBlueSteelImg from '../../../assets/Template_Image/theme_blue_steel.png'

import AIPptThemeModal from './AIPptThemeModal'
import AIPptImageModal from './AIPptImageModal'

const SUGGESTED_PROMPTS = [
  "Turn meeting notes into a presentation",
  "Summarize a research paper into key takeaways",
  "Research industry trends",
  "Create a strategy brief from planning notes"
]

const TONES = ['Professional', 'Creative', 'Academic', 'Persuasive', 'Casual']

export const THEMES = [
  { id: 'petrol', name: 'Petrol', outer: 'linear-gradient(135deg, #1e293b, #0f172a)', inner: '#F9F8F6', title: '#114B5F', body: '#333333', previewImg: themePetrolImg },
  { id: 'stardust', name: 'Stardust', outer: 'linear-gradient(135deg, #18181b, #000000)', inner: '#0A0A0A', title: '#FFFFFF', body: '#E5E5E5', previewImg: themeStardustImg },
  { id: 'chocolate', name: 'Chocolate', outer: 'linear-gradient(135deg, #a8a29e, #78716c)', inner: '#4A3B39', title: '#FFFFFF', body: '#F9F8F6', previewImg: themeChocolateImg },
  { id: 'moss', name: 'Moss & Mist', outer: 'linear-gradient(135deg, #1A1C19, #0f172a)', inner: '#212421', title: '#E3E3E3', body: '#FFFFFF', previewImg: themeMossImg },
  { id: 'blue-steel', name: 'Blue Steel', outer: 'linear-gradient(135deg, #1E232B, #0f172a)', inner: '#26303B', title: '#7692B8', body: '#FFFFFF', previewImg: themeBlueSteelImg },
  { id: 'indigo', name: 'Indigo', outer: 'linear-gradient(135deg, #1e1b4b, #312e81)', inner: '#2E1065', title: '#FFFFFF', body: '#E0E7FF' },
  { id: 'peach', name: 'Peach', outer: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', inner: '#FFFFFF', title: '#4A3B39', body: '#D84315' },
  { id: 'incandescent', name: 'Incandescent', outer: 'linear-gradient(135deg, #1A1025, #4c1d95)', inner: '#2D1B36', title: '#E91E63', body: '#F48FB1' },
  { id: 'oatmeal', name: 'Oatmeal', outer: 'linear-gradient(135deg, #f5f5f4, #d6d3d1)', inner: '#F5F5F0', title: '#333333', body: '#555555' },
  { id: 'sanguine', name: 'Sanguine', outer: 'linear-gradient(135deg, #7f1d1d, #450a0a)', inner: '#2B0000', title: '#FFFFFF', body: '#FF5252' },
  { id: 'sage', name: 'Sage', outer: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', inner: '#FFFFFF', title: '#2E4F4F', body: '#333333' },
  { id: 'verdigris', name: 'Verdigris', outer: 'linear-gradient(135deg, #134e4a, #042f2e)', inner: '#123838', title: '#4DB6AC', body: '#B2DFDB' },
]

const TEMPLATES = [
  { id: 'corp-pitch', name: 'Corporate Pitch', img: temp1 },
  { id: 'marketing', name: 'Marketing Campaign', img: temp2 },
  { id: 'social', name: 'Social Media', img: temp3 },
  { id: 'portfolio', name: 'Personal Portfolio', img: temp4 },
]

const IMAGE_STYLES = [
  { id: 'scene', name: 'Scene', img: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'photo', name: 'Photo', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&auto=format&fit=crop', tags: ['Realistic'] },
  { id: 'still-life', name: 'Still life', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop', tags: ['Realistic'] },
  { id: 'spot-color', name: 'Spot Color', img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop', tags: ['Minimal'] },
  
  { id: 'illustration', name: 'Illustration', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'flat-line', name: 'Flat Line Art', img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop', tags: ['Minimal'] },
  { id: 'modern-art', name: 'Modern Art', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=200&auto=format&fit=crop', tags: ['Abstract'] },
  
  { id: 'isometric', name: 'Isometric', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'gouache', name: 'Gouache Paint', img: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'bold-poster', name: 'Bold Poster', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=200&auto=format&fit=crop', tags: ['Bold'] },
  
  { id: 'watercolor', name: 'Watercolor', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'bauhaus', name: 'Bauhaus', img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=200&auto=format&fit=crop', tags: ['Bold', 'Minimal'] },
  
  { id: '3d', name: '3D', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'neon-glow', name: 'Neon Glow', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop', tags: ['Bold'] },
  { id: 'cinematic', name: 'Cinematic', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop', tags: ['Realistic', 'Scenic'] },
  { id: 'mesh', name: 'Mesh', img: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=200&auto=format&fit=crop', tags: ['Abstract'] },
]

const IMAGE_SOURCES = [
  { id: 'ai', title: 'AI images', subtitle: '', icon: Sparkles, extra: '2 per image' },
  { id: 'web', title: 'Web images', subtitle: 'Search the web for relevant images', icon: Globe },
  { id: 'stock', title: 'Stock images', subtitle: 'High quality stock photography', icon: ImageIcon },
  { id: 'placeholders', title: 'Image placeholders', subtitle: 'Generate empty placeholders for your own images', icon: Box },
  { id: 'none', title: "Don't add images", subtitle: '', icon: Ban }
]

const SCREEN_SIZES = [
  { id: '16:9', name: 'Default', ratio: '16/9' },
  { id: '4:3', name: 'Traditional', ratio: '4/3' },
  { id: '9:16', name: 'Tall', ratio: '9/16' }
]

const TEXT_AMOUNTS = [
  { id: 'Minimal', name: 'Minimal', columns: 1, lines: 3 },
  { id: 'Concise', name: 'Concise', columns: 1, lines: 4 },
  { id: 'Detailed', name: 'Detailed', columns: 2, lines: 3 },
  { id: 'Extensive', name: 'Extensive', columns: 3, lines: 4 },
]

const SLIDE_COUNTS = [10, 15, 20, 25, 30]

const STYLE_OPTIONS = ['Abstract', 'Aesthetic', 'Black & White', 'Colorful', 'Craft & Notebook', 'Creative', 'Cute', 'Dark', 'Deluxe', 'Doodle', 'Duotone', 'Floral & Plants', 'Illustration', 'Interactive & Animated', 'Minimalist', 'Modern', 'Pattern', 'Professional', 'Simple', 'Vintage', 'Watercolor']
const COLOR_OPTIONS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Monochrome']
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Marketing', 'E-commerce', 'Creative Agency']

export default function AIPptWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  
  // Form Data
  const [title, setTitle] = useState('')
  const [outline, setOutline] = useState('')
  const [tone, setTone] = useState('Professional')
  
  // Theme Filters
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState([])
  
  const [baseTemplate, setBaseTemplate] = useState('corp-pitch')
  const [theme, setTheme] = useState('petrol')
  const [screenSize, setScreenSize] = useState('16:9')
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const [slides, setSlides] = useState(10)
  const [textAmount, setTextAmount] = useState('Concise')
  
  const [imageSource, setImageSource] = useState('ai')
  const [isImageSourceDropdownOpen, setIsImageSourceDropdownOpen] = useState(false)
  const [mediaStyle, setMediaStyle] = useState('photo')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageStyleFilter, setImageStyleFilter] = useState('Suggested')
  
  const [isGenerating, setIsGenerating] = useState(false)
  
  const outlineRef = useRef(null)
  
  // Step entrance animation
  const [stepReady, setStepReady] = useState(false)
  
  useEffect(() => {
    if (step > 1) {
      setStepReady(false)
      const timer = setTimeout(() => setStepReady(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Auto-resize textarea
  useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.style.height = 'auto'
      outlineRef.current.style.height = outlineRef.current.scrollHeight + 'px'
    }
  }, [outline])

  const handleGenerateOutline = () => {
    setIsGenerating(true)
    setTimeout(() => {
      // Mock the outline based on slide count
      const mockOutline = Array.from({ length: slides }).map((_, i) => ({
        id: i + 1,
        title: i === 0 ? (title || 'Introduction') : 
               i === slides - 1 ? 'Conclusion & Next Steps' : 
               `Slide Topic ${i + 1}`,
        description: [
          'Global shock forces rapid pivot to digital resilience',
          'Legacy mindsets shattered by immediate necessity',
          'Firms forced to shore up business models and accelerate cloud adoption'
        ],
        isEditing: false
      }))
      
      const config = { title, outline, tone, baseTemplate, theme, screenSize, slides, textAmount, mediaStyle }
      onComplete(mockOutline, config)
    }, 2000)
  }

  const handlePromptSubmit = () => {
    if (title.trim()) setStep(2)
  }

  return (
    <>
      <main className="aig-main-fullscreen">
        
        {step === 1 && (
          <div className="aig-new-hero-section fade-in">
            <div className="aig-new-header">
              <span className="aig-new-greeting">Hi Creator</span>
              <h1 className="aig-new-title">What would you like to create?</h1>
              <p className="aig-new-subtitle">Use one of the common prompts below or write your own idea</p>
            </div>
            
            {!title.trim() && (
              <div className="aig-new-suggestions-grid">
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Turn meeting notes into a presentation')}>
                  <FileText className="aig-suggestion-icon" size={24} />
                  <p>Turn meeting notes into a presentation</p>
                </div>
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Summarize a research paper into key takeaways')}>
                  <BookOpen className="aig-suggestion-icon" size={24} />
                  <p>Summarize a research paper into key takeaways</p>
                </div>
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Research industry trends')}>
                  <TrendingUp className="aig-suggestion-icon" size={24} />
                  <p>Research industry trends and market analysis</p>
                </div>
              </div>
            )}

            <div className={`aig-new-prompt-container ${title.trim() ? 'expanded' : ''}`}>
              {title.trim() && (
                <div className="aig-new-prompt-expanded fade-in">
                  <textarea 
                    ref={outlineRef}
                    className="aig-new-outline-input"
                    placeholder="Add an outline or notes to guide the AI (optional)..."
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    rows={3}
                  />
                  <div className="aig-new-tone-selector">
                    <span>Voice & Tone:</span>
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

              <div className="aig-new-input-row">
                <button className="aig-attach-btn"><Paperclip size={20} /></button>
                <input 
                  className="aig-new-main-input"
                  placeholder="Ask whatever you want..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                  autoFocus
                />
                <button 
                  className={`aig-new-submit-btn ${title.trim() ? 'active' : ''}`}
                  onClick={handlePromptSubmit}
                  disabled={!title.trim()}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
            <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
              <h2 className="aig-step-title">The Vibe</h2>
              <p className="aig-step-subtitle">Select a base template and color theme.</p>
            </div>
            


            <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
            <div className="aig-selection-section">
              <div className="aig-theme-filters" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn" 
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'style' ? null : 'style')}
                  >
                    <span>{selectedStyle || 'Style'}</span> <ChevronDown size={14} />
                  </button>
                  {activeFilterDropdown === 'style' && (
                    <div className="aig-filter-dropdown-menu">
                      {STYLE_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item" 
                          onClick={() => { setSelectedStyle(opt); setActiveFilterDropdown(null); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn"
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'color' ? null : 'color')}
                  >
                    <span>{selectedColor || 'Color'}</span> <Palette size={14} />
                  </button>
                  {activeFilterDropdown === 'color' && (
                    <div className="aig-filter-dropdown-menu">
                      {COLOR_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item" 
                          onClick={() => { setSelectedColor(opt); setActiveFilterDropdown(null); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn"
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'industry' ? null : 'industry')}
                  >
                    <span>{selectedIndustries.length > 0 ? `${selectedIndustries.length} Selected` : 'Industry'}</span> <Building size={14} />
                  </button>
                  {activeFilterDropdown === 'industry' && (
                    <div className="aig-filter-dropdown-menu">
                      {INDUSTRY_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item"
                          onClick={() => {
                            if (selectedIndustries.includes(opt)) {
                              setSelectedIndustries(selectedIndustries.filter(i => i !== opt))
                            } else {
                              setSelectedIndustries([...selectedIndustries, opt])
                            }
                          }}
                        >
                          <div className={`aig-filter-checkbox ${selectedIndustries.includes(opt) ? 'checked' : ''}`}>
                            {selectedIndustries.includes(opt) && <Check size={12} strokeWidth={3} />}
                          </div>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="aig-section-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 className="aig-selection-label" style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Color Themes</h3>
                <button className="aig-view-more-btn" onClick={() => setIsThemeModalOpen(true)}>
                  <Palette size={14} /> View more
                </button>
              </div>

              <div className="aig-new-theme-grid-5">
                {THEMES.slice(0, 5).map(t => (
                  <button
                    key={t.id}
                    className={`aig-new-theme-card-premium ${theme === t.id ? 'active' : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div className="aig-theme-card-header">
                       <span className="aig-theme-card-title">{t.name}</span>
                       {theme === t.id && (
                         <div className="aig-theme-card-check">
                           <Check size={14} strokeWidth={3} color="#2563eb" />
                         </div>
                       )}
                    </div>
                    
                    <div className="aig-theme-card-palette">
                      <div className="palette-color" style={{ background: t.outer.includes('gradient') ? t.outer.split(',')[1].trim() : t.outer }}></div>
                      <div className="palette-color" style={{ background: t.title }}></div>
                      <div className="palette-color" style={{ background: t.inner }}></div>
                      <div className="palette-color" style={{ background: t.body }}></div>
                    </div>
                    
                    <div className="aig-theme-card-image-wrapper">
                       <img src={t.previewImg || temp1} alt={t.name} className="aig-theme-card-image" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Screen Size</h3>
              <div className="aig-selection-grid">
                {SCREEN_SIZES.map(s => (
                  <button 
                    key={s.id}
                    className={`aig-aspect-card ${screenSize === s.id ? 'active' : ''}`}
                    onClick={() => setScreenSize(s.id)}
                  >
                    <div className="aig-aspect-preview">
                       <div className="aig-aspect-box" style={{ aspectRatio: s.ratio }}></div>
                    </div>
                    <div className="aig-aspect-info">
                       <strong>{s.name}</strong>
                       <span>{s.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-or-divider">
              <span>OR select a full template</span>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Base Template</h3>
              <div className="aig-selection-grid aig-template-grid">
                {TEMPLATES.map(tmp => (
                  <button
                    key={tmp.id}
                    className={`aig-template-card ${baseTemplate === tmp.id ? 'active' : ''}`}
                    onClick={() => setBaseTemplate(tmp.id)}
                  >
                    <div className="aig-template-img-wrapper">
                      <img src={tmp.img} alt={tmp.name} className="aig-template-img" />
                      {baseTemplate === tmp.id && (
                        <div className="aig-template-check">
                          <Check size={16} strokeWidth={3} color="#ffffff" />
                        </div>
                      )}
                    </div>
                    <span className="aig-card-label">{tmp.name}</span>
                  </button>
                ))}
              </div>
            </div>
            </div>
            
          </div>
        )}

        {step === 3 && (
          <div className={`aig-step aig-step--3 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
            <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
              <h2 className="aig-step-title">The Details</h2>
              <p className="aig-step-subtitle">Fine-tune the content and media.</p>
            </div>
            
            <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
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
              <div className="aig-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
          
                <h3 className="aig-selection-label" style={{ margin: 0 }}>Text content</h3>
              </div>
              
              
              <div className="aig-text-amount-grid">
                {TEXT_AMOUNTS.map(t => (
                  <button 
                    key={t.id}
                    className={`aig-text-card ${textAmount === t.id ? 'active' : ''}`}
                    onClick={() => setTextAmount(t.id)}
                  >
                    <div className="aig-text-preview">
                      {Array.from({ length: t.columns }).map((_, colIdx) => (
                        <div key={colIdx} className="aig-text-column">
                          {Array.from({ length: t.lines }).map((_, lineIdx) => (
                            <div key={lineIdx} className={`aig-text-line ${lineIdx === t.lines - 1 ? 'short' : ''}`}></div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <span className="aig-text-card-label">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Image source</h3>
              <div className="aig-image-source-container">
                <button 
                  className={`aig-image-source-dropdown ${isImageSourceDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsImageSourceDropdownOpen(!isImageSourceDropdownOpen)}
                >
                  {(() => {
                    const activeSrc = IMAGE_SOURCES.find(s => s.id === imageSource) || IMAGE_SOURCES[0]
                    const Icon = activeSrc.icon
                    return (
                      <>
                        <Icon size={18} style={{ color: '#0f172a' }} /> {activeSrc.title}
                        {activeSrc.extra && <span className="aig-image-source-extra">{activeSrc.extra}</span>}
                        <span className="aig-image-source-chevron"><ChevronDown size={16} /></span>
                      </>
                    )
                  })()}
                </button>
                
                {isImageSourceDropdownOpen && (
                  <>
                    <div className="aig-dropdown-overlay" onClick={() => setIsImageSourceDropdownOpen(false)}></div>
                    <div className="aig-image-source-menu fade-in">
                      {IMAGE_SOURCES.map(src => {
                        const Icon = src.icon
                        return (
                          <button 
                            key={src.id}
                            className={`aig-iso-option ${imageSource === src.id ? 'active' : ''}`}
                            onClick={() => {
                              setImageSource(src.id)
                              setIsImageSourceDropdownOpen(false)
                            }}
                          >
                            <div className="aig-iso-icon"><Icon size={18} /></div>
                            <div className="aig-iso-text">
                              <span className="aig-iso-title">{src.title}</span>
                              {src.subtitle && <span className="aig-iso-subtitle">{src.subtitle}</span>}
                            </div>
                            {imageSource === src.id && <Check size={16} className="aig-iso-check" />}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <h3 className="aig-selection-label" style={{ marginTop: '24px' }}>Art style</h3>
              
              <div className="aig-theme-filters" style={{ marginBottom: '16px' }}>
                {['Suggested', 'Photo', 'Illustration', 'Abstract'].map(f => (
                  <button 
                    key={f}
                    className={`filter-pill ${imageStyleFilter === f ? 'active' : ''}`}
                    onClick={() => setImageStyleFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="aig-art-style-inline-grid">
                {IMAGE_STYLES.slice(0, 4).map(style => (
                  <button
                    key={style.id}
                    className={`aig-image-style-card ${mediaStyle === style.id ? 'active' : ''}`}
                    onClick={() => setMediaStyle(style.id)}
                  >
                    <div className="aig-image-card-img-wrapper">
                      <img src={style.img} alt={style.name} />
                      {mediaStyle === style.id && (
                        <div className="aig-image-card-check-overlay">
                          <Check size={16} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="aig-image-card-label">{style.name}</span>
                  </button>
                ))}
                
                {/* View More Card */}
                <button className="aig-image-style-card" onClick={() => setIsImageModalOpen(true)}>
                  <div className="aig-image-card-img-wrapper view-more-wrapper">
                     <div className="view-more-stack">
                        <img src={IMAGE_STYLES[5].img} className="stack-img-back" />
                        <img src={IMAGE_STYLES[6].img} className="stack-img-mid" />
                        <img src={IMAGE_STYLES[7].img} className="stack-img-front" />
                     </div>
                  </div>
                  <span className="aig-image-card-label">View more</span>
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
      </main>

      {step > 1 && stepReady && (
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
                onClick={handleGenerateOutline}
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

      {/* THEME MODAL */}
      <AIPptThemeModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themes={THEMES}
        initialTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* IMAGE MODAL */}
      <AIPptImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageStyles={IMAGE_STYLES}
        initialStyle={mediaStyle}
        onSelectStyle={setMediaStyle}
      />
    </>
  )
}
