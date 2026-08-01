import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Sparkles, ImagePlus, X, Wand2, RotateCcw, Shuffle, Download, Trash2, Plus, Image as ImageIcon, Images, Check, Edit2, ArrowRight } from 'lucide-react'
import SelectMediaModal from '../../components/features/image-generation/SelectMediaModal'
import './AIImageStudio.css'

/* ── Constants ── */
const MODELS    = ['Auto', 'Nano Banana', 'Seedream', 'Flux', 'Ideogram', 'GPT Image', 'Stable Diffusion']
const STYLES    = ['Dynamic', 'Photorealistic', 'Cinematic', '3D Render', 'Anime', 'Watercolor', 'Minimal', 'Sketch']
const DIMS      = ['1:1', '16:9', '9:16', '4:5', '3:2', '2:3']
const QUALITIES = ['Standard', 'Premium', 'Ultra']
const QUALITY_META = {
  Standard: { credits: 1, desc: 'Great for everyday posts' },
  Premium:  { credits: 3, desc: 'Sharper detail and lighting' },
  Ultra:    { credits: 5, desc: 'Maximum detail, print ready' },
}
const VIS_TYPES = ['Photo', 'Illustration', 'Icon', 'Diagram', 'Infographic']

const CREDIT_COST = { Standard: 1, Premium: 3, Ultra: 5 }

/* Shape presets */
const SHAPE_PRESETS = [
  { id: 'instagram-post',      label: 'Instagram post',      ratio: '1:1',  sub: '1:1',     w: 1080, h: 1080, shape: 'square' },
  { id: 'instagram-story',     label: 'Instagram story',     ratio: '9:16', sub: '9:16',    w: 1080, h: 1920, shape: 'portrait-tall' },
  { id: 'linkedin-banner',     label: 'LinkedIn banner',     ratio: '4:1',  sub: '4:1',     w: 1584, h: 396,  shape: 'wide' },
  { id: 'youtube-thumbnail',   label: 'YouTube thumbnail',   ratio: '16:9', sub: '16:9',    w: 1280, h: 720,  shape: 'landscape' },
  { id: 'poster',              label: 'Poster',              ratio: '2:3',  sub: 'A-series', w: 794,  h: 1123, shape: 'portrait' },
  { id: 'desktop-wallpaper',   label: 'Desktop wallpaper',   ratio: '16:9', sub: '16:9',    w: 1920, h: 1080, shape: 'landscape' },
]

/* aspect-ratio shape → preview box style */
const SHAPE_PREVIEW_STYLES = {
  square:          { width: '90px',  aspectRatio: '1 / 1' },
  'portrait-tall': { width: '48px',  aspectRatio: '9 / 16' },
  wide:            { width: '100%',  aspectRatio: '4 / 1', maxWidth: '140px' },
  landscape:       { width: '100%',  aspectRatio: '16 / 9', maxWidth: '130px' },
  portrait:        { width: '64px',  aspectRatio: '2 / 3' },
}

/* Map dim ratio to picsum size string */
const DIM_SIZES = {
  '1:1':  '800/800',
  '16:9': '1280/720',
  '9:16': '720/1280',
  '4:5':  '800/1000',
  '3:2':  '900/600',
  '2:3':  '600/900',
}
const dimToSize = (d) => DIM_SIZES[d] || '800/800'

/* Map dim ratio to CSS aspect-ratio value */
const DIM_ASPECT = {
  '1:1':  '1 / 1',
  '16:9': '16 / 9',
  '9:16': '9 / 16',
  '4:5':  '4 / 5',
  '3:2':  '3 / 2',
  '2:3':  '2 / 3',
}
const dimToAspect = (d) => DIM_ASPECT[d] || '1 / 1'

const INSPIRATIONS = [
  { id: 1, seed: 'vintage-car',     prompt: 'A side profile view of a vintage red compact beetle parked in a golden sunflower field' },
  { id: 2, seed: 'portrait-woman',  prompt: 'A hyper-detailed studio photograph of woman with bold colorful makeup, high contrast' },
  { id: 3, seed: 'rowing-boat',     prompt: 'A cinematic photo of a blue wooden rowing boat floating on a misty lake at dawn' },
  { id: 4, seed: 'tokyo-night',     prompt: 'Dense neon-lit Tokyo alley at night, rain-soaked cobblestones, 35mm film grain' },
  { id: 5, seed: 'aurora-mtn',      prompt: 'Aurora borealis over snow-capped mountains, long exposure, photorealistic' },
  { id: 6, seed: 'coffee-marble',   prompt: 'Minimalist flat-lay of a white ceramic coffee cup on warm marble, morning light' },
]

const EXAMPLE_PROMPTS = [
  'A lone astronaut on a vast red Martian desert at golden hour, cinematic wide shot, volumetric dust, photorealistic, 8K',
  'Dense neon-lit Tokyo alley at 2am in heavy rain, cobblestones reflecting neon signs, 35mm film grain, cyberpunk',
  'Hyper-realistic portrait of an elderly Icelandic fisherman, weathered wrinkles, pale blue eyes, overcast coastal light',
  'Abstract macro photograph of deep navy and molten gold liquid swirls frozen mid-motion, luxury texture, fine art',
  'Futuristic matte black electric hypercar on a salt flat at dusk, ultra-low angle, dramatic storm clouds, CGI render',
  'Hidden waterfall deep inside a lush ancient jungle, sunlight through giant ferns, long exposure silk water effect',
  "Bird's-eye view of a lavender farm in Provence at peak bloom, golden hour, aerial drone photography",
  'A grand Victorian library at midnight, endless bookshelves, moonlight through stained glass, dark academia',
]

/* ── Inline select chip ── */
function ChipSelect({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="aig-chip-select" onBlur={() => setOpen(false)}>
      <button
        type="button"
        className={`aig-chip ${value !== options[0] ? 'aig-chip--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={label}
      >
        {value} <ChevronDown size={10} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="aig-chip-menu">
          {options.map(o => (
            <button
              key={o}
              type="button"
              className={`aig-chip-opt ${value === o ? 'aig-chip-opt--on' : ''}`}
              onMouseDown={() => { onChange(o); setOpen(false) }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AIImageStudio({ onBack }) {
  const [step, setStep]       = useState('prompt')
  const [prompt, setPrompt]   = useState('')
  const [inspiring, setInspiring] = useState(false)

  // Settings
  const [model,      setModel]      = useState('Auto')
  const [style,      setStyle]      = useState('Dynamic')
  const [dim,        setDim]        = useState('1:1')
  const [quality,    setQuality]    = useState('Standard')
  const [visualType, setVisualType] = useState('Photo')
  const [count]                     = useState(1)

  // Shape step
  const [selectedShape, setSelectedShape] = useState(SHAPE_PRESETS[0])
  const [customW, setCustomW] = useState('1200')
  const [customH, setCustomH] = useState('800')
  const [useCustom, setUseCustom] = useState(false)

  // Options step
  const [activeOptStep, setActiveOptStep] = useState('Quality')

  // Review step
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [draftPrompt, setDraftPrompt] = useState('')

  // Workspace — sessions-based
  const [sessions,         setSessions]         = useState([])
  const [activeSessionId,  setActiveSessionId]  = useState(null)
  const [showEmpty,        setShowEmpty]        = useState(true)

  // Other workspace state
  const [workPrompt,    setWorkPrompt]    = useState('')
  const [showMedia,     setShowMedia]     = useState(false)
  const [refImages,     setRefImages]     = useState([])
  const [downloadPanel, setDownloadPanel] = useState(null)

  const historyRef  = useRef(null)
  const textRef     = useRef(null)
  const reviewTextRef = useRef(null)
  const workTextRef = useRef(null)

  // Derived
  const activeGenerations = sessions.find(s => s.id === activeSessionId)?.generations ?? []
  const isGenerating      = activeGenerations.some(g => g.status === 'generating')
  const creditCost        = CREDIT_COST[quality] * count
  const allImages = sessions.flatMap(s =>
    s.generations.filter(g => g.status === 'done').map(g => ({ ...g, sessionLabel: s.label, sessionId: s.id }))
  )

  // The effective dim to use for generation (preset ratio or custom)
  const effectiveDim = useCustom ? `${customW}:${customH}` : (selectedShape?.ratio || dim)

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [sessions, activeSessionId])

  const handleInspire = () => {
    const pool = EXAMPLE_PROMPTS.filter(p => p !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)]
    setInspiring(true)
    setPrompt('')
    let i = 0
    const iv = setInterval(() => {
      i++
      setPrompt(next.slice(0, i))
      if (textRef.current) {
        textRef.current.style.height = 'auto'
        textRef.current.style.height = textRef.current.scrollHeight + 'px'
      }
      if (i >= next.length) { clearInterval(iv); setInspiring(false) }
    }, 8)
  }

  // Step 1 → Step 2 (shape)
  const handleNextToShape = () => {
    if (!prompt.trim()) return
    setStep('shape')
  }

  // Step 2 → Step 3 (options)
  const handleNextToOptions = () => {
    setStep('options')
  }

  // Step 3 → Step 4 (review)
  const handleNextToReview = () => {
    setStep('review')
  }

  // Final generate from review
  const handleGenerate = () => {
    const p   = prompt.trim()
    const useDim = useCustom ? dim : (selectedShape?.ratio || dim)
    const sid = Date.now().toString()
    const gens = Array.from({ length: count }, (_, i) => ({
      id: `${sid}_g${i}`,
      prompt: p,
      model,
      dim: useDim,
      status: 'generating',
      imageUrl: null,
    }))
    setSessions([{ id: sid, label: p.slice(0, 40), thumb: null, generations: gens }])
    setActiveSessionId(sid)
    setShowEmpty(false)
    setStep('workspace')
    gens.forEach((gen, i) => {
      setTimeout(() => {
        const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(useDim)}`
        setSessions(prev => prev.map(s => s.id === sid ? {
          ...s,
          thumb: s.thumb || url,
          generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
        } : s))
      }, 3500 + i * 400)
    })
  }

  const handleWorkspaceGenerate = () => {
    if (!workPrompt.trim() || isGenerating) return
    const p = workPrompt.trim()
    setWorkPrompt('')
    const gens = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}_g${i}`,
      prompt: p,
      model,
      dim,
      status: 'generating',
      imageUrl: null,
    }))

    if (!activeSessionId) {
      const sid = Date.now().toString()
      setSessions(prev => [...prev, { id: sid, label: p.slice(0, 40), thumb: null, generations: gens }])
      setActiveSessionId(sid)
      setShowEmpty(false)
      gens.forEach((gen, i) => {
        setTimeout(() => {
          const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(dim)}`
          setSessions(prev => prev.map(s => s.id === sid ? {
            ...s,
            thumb: s.thumb || url,
            generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
          } : s))
        }, 3500 + i * 400)
      })
    } else {
      setSessions(prev => prev.map(s => s.id === activeSessionId
        ? { ...s, generations: [...s.generations, ...gens] } : s))
      gens.forEach((gen, i) => {
        setTimeout(() => {
          const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(dim)}`
          setSessions(prev => prev.map(s => s.id === activeSessionId ? {
            ...s,
            thumb: s.thumb || url,
            generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
          } : s))
        }, 3500 + i * 400)
      })
    }
  }

  /* ══ PROMPT PAGE ══ */
  if (step === 'prompt') {

    const SUGGESTION_PILLS = [
      'Soft daylight photography',
      'Editorial illustration',
      'Minimal, lots of empty space',
      'Warm film grain',
      'Bold graphic poster',
      'Cinematic wide shot',
      'Dark academia',
    ]

    return (
      <div className="aig-step-shell aig-step-shell--prompt">
        <nav className="aig-step-nav">
          <button type="button" className="aig-back-btn" onClick={onBack}>
            <ChevronLeft size={15} /> Home
          </button>
          <span className="aig-step-nav-title">AI Image Studio</span>
          <div className="aig-step-nav-right">
            <button
              type="button"
              className="aig-my-images-btn"
              onClick={() => setStep('gallery')}
            >
              <Images size={14} strokeWidth={2} />
              My Images
              {allImages.length > 0 && (
                <span className="aig-my-images-count">{allImages.length}</span>
              )}
            </button>
            <span className="aig-credits-badge">&#10022; 150 Credits</span>
          </div>
        </nav>

        <div className="aig-prompt-page">
          <div className="aig-prompt-split">

            {/* ── Left: Hero + Prompt Card ── */}
            <div className="aig-prompt-left">

              {/* Hero heading — centered, Aperture style */}
              <div className="aig-hero-heading">
                <span className="aig-hero-eyebrow">Image Studio</span>
                <h1 className="aig-hero-h1">Make the exact<br />image you need.</h1>
              </div>

              {/* Prompt card — large, clean */}
              <div className="aig-lp-card">
                <textarea
                  id="aig-prompt-input"
                  ref={textRef}
                  className="aig-lp-textarea"
                  placeholder="A quiet coastal lighthouse at golden hour, deep blue sea, painted in soft editorial brushwork…"
                  value={prompt}
                  rows={3}
                  onChange={e => {
                    setPrompt(e.target.value)
                    const el = textRef.current
                    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                  }}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt.trim()) handleNextToShape()
                  }}
                />

                {/* Bottom toolbar inside card */}
                <div className="aig-lp-toolbar">
                  <div className="aig-lp-toolbar-left">
                    <ChipSelect value={model}   options={MODELS}    onChange={setModel}   label="Model"   />
                    <ChipSelect value={style}   options={STYLES}    onChange={setStyle}   label="Style"   />
                    <ChipSelect value={dim}     options={DIMS}      onChange={setDim}     label="Ratio"   />
                    <button type="button" className="aig-chip" onClick={() => setShowMedia(true)} title="Add reference image">
                      <ImagePlus size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`aig-lp-generate-btn ${prompt.trim() ? 'aig-lp-generate-btn--ready' : ''}`}
                    disabled={!prompt.trim()}
                    onClick={handleNextToShape}
                    aria-label="Next step"
                  >
                    <Sparkles size={15} strokeWidth={2} />
                  </button>
                </div>

                {/* Reference image thumbnails */}
                {refImages.length > 0 && (
                  <div className="aig-ref-thumbs">
                    {refImages.map(img => (
                      <div key={img.id} className="aig-ref-thumb">
                        <img src={img.url} alt={img.name} />
                        <button
                          type="button"
                          className="aig-ref-thumb-remove"
                          onClick={() => setRefImages(prev => prev.filter(r => r.id !== img.id))}
                          aria-label="Remove reference"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspire me link */}
              <button
                type="button"
                className="aig-lp-inspire"
                onClick={handleInspire}
                disabled={inspiring}
              >
                <Wand2 size={13} strokeWidth={2} />
                {inspiring ? 'Writing…' : 'Inspire me with a random prompt'}
              </button>

            </div>

            {/* ── Right: Scrolling Gallery ── */}
            <div className="aig-prompt-right">
              <div className="aig-scroll-wrapper">
                <div className="aig-scroll-columns-container">
                  <div className="aig-scroll-column">
                    <div className="aig-scroll-track-up">
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].map((item, idx) => (
                        <button key={`c1-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}1/400/500`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="aig-scroll-column">
                    <div className="aig-scroll-track-down">
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].reverse().map((item, idx) => (
                        <button key={`c2-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}2/400/600`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="aig-scroll-column aig-scroll-column--extra">
                    <div className="aig-scroll-track-up" style={{ animationDuration: '100s' }}>
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].map((item, idx) => (
                        <button key={`c3-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}3/400/450`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {showMedia && (
          <SelectMediaModal
            onClose={() => setShowMedia(false)}
            onConfirm={img => { setRefImages(prev => [...prev, img]) }}
          />
        )}
      </div>
    )
  }

  /* ══ STEP 2 — PICK A SHAPE ══ */
  if (step === 'shape') {
    const activePreset = useCustom ? null : selectedShape
    const previewAspect = useCustom
      ? `${customW} / ${customH}`
      : (SHAPE_PREVIEW_STYLES[selectedShape.shape]?.['aspectRatio'] || '1 / 1')
    const previewLabel = useCustom
      ? `Custom · ${customW} × ${customH} px`
      : `${selectedShape.label} · ${selectedShape.w} × ${selectedShape.h} px`

    return (
      <div className="aig-step-shell aig-step-shell--setup">
        <div className="aig-setup-body">
          {/* Left: presets grid */}
          <div className="aig-setup-left">
            <div className="aig-setup-heading">
              <h2 className="aig-setup-h2">Pick a shape</h2>
              <p className="aig-setup-sub">{prompt.length > 60 ? prompt.slice(0, 60) + '…' : prompt}</p>
            </div>

            <div className="aig-shape-grid">
              {SHAPE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`aig-shape-card ${!useCustom && activePreset?.id === preset.id ? 'aig-shape-card--active' : ''}`}
                  onClick={() => { setSelectedShape(preset); setUseCustom(false) }}
                >
                  <div className="aig-shape-preview-wrap">
                    <div
                      className="aig-shape-preview-box"
                      style={SHAPE_PREVIEW_STYLES[preset.shape] || { width: '80px', aspectRatio: '1/1' }}
                    />
                  </div>
                  <div className="aig-shape-card-label">{preset.label}</div>
                  <div className="aig-shape-card-sub">{preset.sub}</div>
                  {!useCustom && activePreset?.id === preset.id && (
                    <div className="aig-shape-card-check"><Check size={12} strokeWidth={3} /></div>
                  )}
                </button>
              ))}

              {/* Custom size card */}
              <button
                type="button"
                className={`aig-shape-card aig-shape-card--custom ${useCustom ? 'aig-shape-card--active' : ''}`}
                onClick={() => setUseCustom(true)}
              >
                <div className="aig-shape-preview-wrap">
                  <div className="aig-custom-size-inputs" onClick={e => e.stopPropagation()}>
                    <input
                      className="aig-custom-input"
                      type="number"
                      value={customW}
                      onChange={e => { setCustomW(e.target.value); setUseCustom(true) }}
                      min="64"
                      max="4096"
                      aria-label="Width"
                    />
                    <span className="aig-custom-sep">×</span>
                    <input
                      className="aig-custom-input"
                      type="number"
                      value={customH}
                      onChange={e => { setCustomH(e.target.value); setUseCustom(true) }}
                      min="64"
                      max="4096"
                      aria-label="Height"
                    />
                  </div>
                </div>
                <div className="aig-shape-card-label">Custom size</div>
                <div className="aig-shape-card-sub">Pixels</div>
                {useCustom && (
                  <div className="aig-shape-card-check"><Check size={12} strokeWidth={3} /></div>
                )}
              </button>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="aig-setup-right">
            <div className="aig-shape-preview-panel">
              <div className="aig-shape-preview-canvas">
                <div
                  className="aig-shape-preview-art"
                  style={{ aspectRatio: previewAspect }}
                >
                  <span className="aig-shape-preview-eyebrow">
                    {useCustom ? 'Custom' : selectedShape.label.toUpperCase()} · {useCustom ? `${customW}:${customH}` : selectedShape.ratio}
                  </span>
                  <p className="aig-shape-preview-text">
                    {prompt.length > 48 ? prompt.slice(0, 48) + '…' : prompt}
                  </p>
                </div>
              </div>
              <p className="aig-shape-preview-meta">{previewLabel}</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="aig-setup-footer">
          <span className="aig-setup-footer-hint">Choose the canvas shape for your image</span>
          <div className="aig-setup-footer-actions">
            <button type="button" className="aig-setup-back-btn" onClick={() => setStep('prompt')}>
              Back
            </button>
            <button type="button" className="aig-setup-next-btn" onClick={handleNextToOptions}>
              Next <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══ STEP 3 — CHOOSE HOW IT'S MADE ══ */
  if (step === 'options') {
    const shapeLabel = useCustom ? `Custom · ${customW}:${customH}` : `${selectedShape.label} · ${selectedShape.ratio}`

    const MODEL_META = {
      'Auto':             { icon: '✦', desc: 'Best model chosen automatically' },
      'Nano Banana':      { icon: '⚡', desc: 'Fast generation, great quality' },
      'Seedream':         { icon: '🌱', desc: 'Dreamlike, painterly results' },
      'Flux':             { icon: '◈', desc: 'Crisp realism and detail' },
      'Ideogram':         { icon: '◉', desc: 'Excellent text in images' },
      'GPT Image':        { icon: '◎', desc: 'Instruction-following focused' },
      'Stable Diffusion': { icon: '◆', desc: 'Open-source, highly flexible' },
    }
    const STYLE_GRADIENTS = {
      'Dynamic':       'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Photorealistic':'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Cinematic':     'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      '3D Render':     'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Anime':         'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
      'Watercolor':    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'Minimal':       'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      'Sketch':        'linear-gradient(135deg, #d3cce3 0%, #e9e4f0 100%)',
    }

    const SideItem = ({ label, value, id }) => (
      <button
        type="button"
        className={`aig-opts-side-item ${activeOptStep === id ? 'aig-opts-side-item--active' : ''}`}
        onClick={() => setActiveOptStep(id)}
      >
        <span className="aig-opts-side-label">{label}</span>
        <span className="aig-opts-side-value">{value}</span>
      </button>
    )

    return (
      <div className="aig-step-shell aig-step-shell--setup aig-step-shell--options">
        <header className="aig-opts-header">
          <div className="aig-opts-header-left">
            <span className="aig-opts-step-badge">STEP 3 OF 4</span>
            <h2 className="aig-opts-heading">Choose how it's made</h2>
          </div>
          <div className="aig-opts-header-right">
            <div className="aig-opts-shape-badge">
              <div className="aig-opts-shape-thumb"
                style={{ aspectRatio: useCustom ? `${customW}/${customH}` : selectedShape.ratio.replace(':', '/') }} />
              <span>{shapeLabel}</span>
              <button type="button" className="aig-opts-change-btn" onClick={() => setStep('shape')}>change</button>
            </div>
          </div>
        </header>

        <div className="aig-opts-body">
          {/* Left sidebar */}
          <aside className="aig-opts-sidebar">
            <div className="aig-opts-sidebar-list">
              <SideItem id="Model"   label="Model"   value={model} />
              <SideItem id="Style"   label="Style"   value={style} />
              <SideItem id="Quality" label="Quality" value={`${quality} · ${CREDIT_COST[quality]} cr`} />
              <SideItem id="Type"    label="Type"    value={visualType} />
            </div>
          </aside>

          {/* Right content panel */}
          <div className="aig-opts-panel">
            <div className="aig-opts-container-card">

              {/* ── MODEL ── */}
              {activeOptStep === 'Model' && (
                <div className="aig-opts-section">
                  <div className="aig-model-grid">
                    {MODELS.map(m => (
                      <button key={m} type="button"
                        className={`aig-model-card ${model === m ? 'aig-model-card--active' : ''}`}
                        onClick={() => setModel(m)}>
                        <span className="aig-model-name">{m}</span>
                        {m === 'Auto' && <span className="aig-model-sub">recommended</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STYLE ── */}
              {activeOptStep === 'Style' && (
                <div className="aig-opts-section">
                  <div className="aig-style-grid">
                    {STYLES.map(s => (
                      <button key={s} type="button"
                        className={`aig-style-card ${style === s ? 'aig-style-card--active' : ''}`}
                        onClick={() => setStyle(s)}>
                        <div className="aig-style-swatch" style={{ background: STYLE_GRADIENTS[s] }} />
                        <span className="aig-style-name">{s}</span>
                        {style === s && <span className="aig-style-check"><Check size={12} strokeWidth={3}/></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── QUALITY ── */}
              {activeOptStep === 'Quality' && (
                <div className="aig-opts-section">
                  <div className="aig-quality-grid">
                    {QUALITIES.map((q, i) => (
                      <button key={q} type="button"
                        className={`aig-quality-card ${quality === q ? 'aig-quality-card--active' : ''}`}
                        onClick={() => setQuality(q)}>
                        <div className="aig-quality-tier" data-tier={i} />
                        <div className="aig-quality-body">
                          <div className="aig-quality-top-row">
                            <span className="aig-quality-name">{q}</span>
                            <span className="aig-quality-cost">{QUALITY_META[q].credits} cr</span>
                          </div>
                          <p className="aig-quality-desc">{QUALITY_META[q].desc}</p>
                        </div>
                        {quality === q && <span className="aig-quality-check"><Check size={13} strokeWidth={3}/></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TYPE ── */}
              {activeOptStep === 'Type' && (
                <div className="aig-opts-section">
                  <div className="aig-type-grid">
                    {[
                      {
                        id: 'Photo',
                        desc: 'Realistic camera shot',
                        svg: (
                          <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
                            <rect x="4" y="8" width="48" height="32" rx="5" fill="currentColor" opacity="0.08"/>
                            <rect x="4" y="8" width="48" height="32" rx="5" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                            <circle cx="28" cy="24" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                            <circle cx="28" cy="24" r="5" fill="currentColor" opacity="0.25"/>
                            <rect x="19" y="5" width="18" height="6" rx="3" fill="currentColor" opacity="0.2"/>
                            <circle cx="44" cy="13" r="2.5" fill="currentColor" opacity="0.4"/>
                          </svg>
                        )
                      },
                      {
                        id: 'Illustration',
                        desc: 'Hand-crafted artwork',
                        svg: (
                          <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
                            <path d="M10 34 C14 20, 22 10, 28 14 C34 18, 30 30, 36 26 C42 22, 46 30, 46 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
                            <circle cx="16" cy="16" r="6" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
                            <path d="M32 8 L35 14 L41 14 L36 18 L38 24 L32 20 L26 24 L28 18 L23 14 L29 14 Z" fill="currentColor" opacity="0.2"/>
                            <path d="M8 38 Q20 28 32 32 Q44 36 48 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.35"/>
                          </svg>
                        )
                      },
                      {
                        id: 'Icon',
                        desc: 'Clean symbolic graphic',
                        svg: (
                          <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
                            <rect x="16" y="10" width="24" height="24" rx="7" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
                            <path d="M22 22 L26 26 L34 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                          </svg>
                        )
                      },
                      {
                        id: 'Diagram',
                        desc: 'Charts and flows',
                        svg: (
                          <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
                            <rect x="6" y="28" width="8" height="10" rx="2" fill="currentColor" opacity="0.25"/>
                            <rect x="18" y="20" width="8" height="18" rx="2" fill="currentColor" opacity="0.35"/>
                            <rect x="30" y="14" width="8" height="24" rx="2" fill="currentColor" opacity="0.45"/>
                            <rect x="42" y="8" width="8" height="30" rx="2" fill="currentColor" opacity="0.55"/>
                            <path d="M6 32 L20 24 L32 18 L44 12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" fill="none"/>
                          </svg>
                        )
                      },
                      {
                        id: 'Infographic',
                        desc: 'Data meets design',
                        svg: (
                          <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
                            <circle cx="28" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                            <path d="M28 8 A14 14 0 0 1 42 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
                            <path d="M42 22 A14 14 0 0 1 28 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.35"/>
                            <path d="M28 36 A14 14 0 0 1 14 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.2"/>
                            <path d="M14 22 A14 14 0 0 1 28 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45"/>
                            <circle cx="28" cy="22" r="5" fill="currentColor" opacity="0.15"/>
                            <circle cx="28" cy="22" r="2" fill="currentColor" opacity="0.4"/>
                          </svg>
                        )
                      },
                    ].map(t => (
                      <button key={t.id} type="button"
                        className={`aig-type-card ${visualType === t.id ? 'aig-type-card--active' : ''}`}
                        onClick={() => setVisualType(t.id)}>
                        <div className="aig-type-visual">{t.svg}</div>
                        <span className="aig-type-name">{t.id}</span>
                        <span className="aig-type-desc">{t.desc}</span>
                        {visualType === t.id && <span className="aig-type-check"><Check size={12} strokeWidth={3}/></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="aig-setup-footer">
          <span className="aig-setup-footer-hint">Everything has a sensible default — go straight ahead if you like.</span>
          <div className="aig-setup-footer-actions">
            <button type="button" className="aig-setup-back-btn" onClick={() => setStep('shape')}>
              Back
            </button>
            <button type="button" className="aig-setup-next-btn" onClick={handleNextToReview}>
              Review
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══ STEP 4 — REVIEW ══ */
  if (step === 'review') {

    const shapeLabel = useCustom
      ? `Custom · ${customW} × ${customH} px`
      : `${selectedShape.label} · ${selectedShape.ratio}`
    const previewAspect = useCustom
      ? `${customW} / ${customH}`
      : (SHAPE_PREVIEW_STYLES[selectedShape.shape]?.['aspectRatio'] || '1 / 1')

    const rows = [
      { label: 'Shape',   value: shapeLabel,          onEdit: () => setStep('shape') },
      { label: 'Model',   value: model,                onEdit: () => setStep('options') },
      { label: 'Style',   value: style,                onEdit: () => setStep('options') },
      { label: 'Quality', value: `${quality} · ${CREDIT_COST[quality]} credit${CREDIT_COST[quality] > 1 ? 's' : ''}`, onEdit: () => setStep('options') },
      { label: 'Type',    value: visualType,           onEdit: () => setStep('options') },
    ]

    return (
      <div className="aig-step-shell aig-step-shell--setup">

        {/* Nav */}
        <nav className="aig-step-nav">
          <button type="button" className="aig-back-btn" onClick={() => setStep('options')}>
            <ChevronLeft size={15} /> Back
          </button>
          <div className="aig-wizard-steps">
            <span className="aig-wizard-step aig-wizard-step--done">1</span>
            <span className="aig-wizard-line aig-wizard-line--done" />
            <span className="aig-wizard-step aig-wizard-step--done">2</span>
            <span className="aig-wizard-line aig-wizard-line--done" />
            <span className="aig-wizard-step aig-wizard-step--done">3</span>
            <span className="aig-wizard-line aig-wizard-line--done" />
            <span className="aig-wizard-step aig-wizard-step--active">4</span>
          </div>
          <div className="aig-step-nav-right">
            <span className="aig-credits-badge">&#10022; 150 Credits</span>
          </div>
        </nav>

        <div className="aig-review-body">
          {/* Left: summary */}
          <div className="aig-review-left">
            <div className="aig-review-heading">
              <h2 className="aig-setup-h2">Review &amp; generate</h2>
              <p className="aig-setup-sub">Check everything looks right, then hit Generate.</p>
            </div>

            {/* Prompt block */}
            <div className="aig-review-prompt-block">
              <div className="aig-review-row-label">
                <span>Prompt</span>
                <button type="button" className="aig-review-edit-btn"
                  onClick={() => { setEditingPrompt(e => !e); setDraftPrompt(prompt) }}>
                  <Edit2 size={13} strokeWidth={2} /> {editingPrompt ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editingPrompt ? (
                <div className="aig-review-prompt-edit">
                  <textarea
                    ref={reviewTextRef}
                    className="aig-review-textarea"
                    value={draftPrompt}
                    onChange={e => setDraftPrompt(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <button type="button" className="aig-review-save-btn"
                    onClick={() => { setPrompt(draftPrompt); setEditingPrompt(false) }}>
                    Save
                  </button>
                </div>
              ) : (
                <p className="aig-review-prompt-text">{prompt}</p>
              )}
            </div>

            {/* Settings rows */}
            <div className="aig-review-settings">
              {rows.map(row => (
                <div key={row.label} className="aig-review-row">
                  <span className="aig-review-row-key">{row.label}</span>
                  <span className="aig-review-row-val">{row.value}</span>
                  <button type="button" className="aig-review-edit-btn" onClick={row.onEdit}>
                    <Edit2 size={12} strokeWidth={2} /> Edit
                  </button>
                </div>
              ))}
            </div>

            {/* Cost summary */}
            <div className="aig-review-cost">
              <span className="aig-review-cost-label">Total cost</span>
              <span className="aig-review-cost-value">{creditCost} credit{creditCost !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Right: canvas preview */}
          <div className="aig-review-right">
            <div className="aig-review-canvas-wrap">
              <div className="aig-review-canvas" style={{ aspectRatio: previewAspect }}>
                <div className="aig-review-canvas-inner">
                  <Sparkles size={28} strokeWidth={1.25} className="aig-review-canvas-icon" />
                  <p className="aig-review-canvas-label">
                    {useCustom ? 'Custom' : selectedShape.label}<br />
                    <span>{useCustom ? `${customW} × ${customH}` : `${selectedShape.w} × ${selectedShape.h}`} px</span>
                  </p>
                </div>
              </div>
              <p className="aig-review-canvas-meta">
                {style} · {model} · {quality}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="aig-setup-footer aig-setup-footer--generate">
          <span className="aig-setup-footer-hint">
            <span className="aig-review-credit-dot" />
            {creditCost} credit{creditCost !== 1 ? 's' : ''} will be used
          </span>
          <div className="aig-setup-footer-actions">
            <button type="button" className="aig-setup-back-btn" onClick={() => setStep('options')}>
              Back
            </button>
            <button type="button" className="aig-setup-generate-btn" onClick={handleGenerate}>
              <Sparkles size={16} strokeWidth={2} /> Generate Image
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ══ MY IMAGES GALLERY ══ */
  if (step === 'gallery') {
    return (
      <div className="aig-step-shell aig-step-shell--gallery">
        {/* Nav */}
        <nav className="aig-step-nav">
          <button
            type="button"
            className="aig-back-btn"
            onClick={() => setStep(sessions.length > 0 ? 'workspace' : 'prompt')}
          >
            <ChevronLeft size={15} /> Back
          </button>
          <span className="aig-step-nav-title">My Images</span>
          <div className="aig-step-nav-right">
            <span className="aig-credits-badge">&#10022; 150 Credits</span>
          </div>
        </nav>

        {/* Body */}
        <div className="aig-gallery-page">
          {allImages.length === 0 ? (
            <div className="aig-gallery-empty">
              <div className="aig-gallery-empty-icon">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
                  <rect x="4" y="10" width="44" height="34" rx="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3" />
                  <circle cx="18" cy="22" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 34l12-9 9 7 7-6 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="aig-gallery-empty-title">No images yet</p>
              <p className="aig-gallery-empty-sub">Generate your first image to see it here.</p>
              <button
                type="button"
                className="aig-gallery-empty-btn"
                onClick={() => setStep('prompt')}
              >
                <Sparkles size={14} strokeWidth={2} /> Start Creating
              </button>
            </div>
          ) : (
            <>
              <div className="aig-gallery-toolbar">
                <span className="aig-gallery-count">{allImages.length} image{allImages.length !== 1 ? 's' : ''} generated</span>
                <button
                  type="button"
                  className="aig-gallery-new-btn"
                  onClick={() => setStep('prompt')}
                >
                  <Plus size={13} strokeWidth={2.5} /> New Image
                </button>
              </div>
              <div className="aig-gallery-grid">
                {allImages.map(img => (
                  <div
                    key={img.id}
                    className="aig-gallery-card"
                    onClick={() => {
                      setActiveSessionId(img.sessionId)
                      setShowEmpty(false)
                      setStep('workspace')
                    }}
                  >
                    <div className="aig-gallery-card-img-wrap">
                      <img src={img.imageUrl} alt={img.prompt} className="aig-gallery-card-img" loading="lazy" />
                      <div className="aig-gallery-card-overlay">
                        <a
                          href={img.imageUrl}
                          download={`athena-image.png`}
                          className="aig-gallery-card-btn"
                          title="Download"
                          onClick={e => e.stopPropagation()}
                        >
                          <Download size={13} strokeWidth={1.75} />
                        </a>
                        <button
                          type="button"
                          className="aig-gallery-card-btn"
                          title="Reuse prompt"
                          onClick={(e) => {
                            e.stopPropagation()
                            setWorkPrompt(img.prompt)
                            setActiveSessionId(img.sessionId)
                            setShowEmpty(false)
                            setStep('workspace')
                          }}
                        >
                          <Shuffle size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="aig-gallery-card-btn aig-gallery-card-btn--danger"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSessions(prev => prev.map(s => ({
                              ...s,
                              generations: s.generations.filter(g => g.id !== img.id)
                            })))
                          }}
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                    <div className="aig-gallery-card-caption">
                      <span className="aig-gallery-card-prompt">
                        {img.prompt.length > 60 ? img.prompt.slice(0, 60) + '\u2026' : img.prompt}
                      </span>
                      <span className="aig-gallery-card-meta">{img.model}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ══ WORKSPACE ══ */
  return (
    <div className="aig-step-shell aig-step-shell--workspace">

      {/* ── Top nav ── */}
      <nav className="aig-work-nav">
        <button type="button" className="aig-back-btn" onClick={() => setStep('prompt')}>
          <ChevronLeft size={15} /> New Image
        </button>
        <span className="aig-step-nav-title">AI Image Studio</span>
        <div className="aig-step-nav-right">
          <button
            type="button"
            className="aig-my-images-btn"
            onClick={() => setStep('gallery')}
          >
            <Images size={14} strokeWidth={2} />
            My Images
            {allImages.length > 0 && (
              <span className="aig-my-images-count">{allImages.length}</span>
            )}
          </button>
          <span className="aig-credits-badge">&#10022; 150 Credits</span>
        </div>
      </nav>

      {/* ── Body: sidebar + main ── */}
      <div className="aig-workspace-body">

        {/* ── Sessions Sidebar ── */}
        <aside className="aig-work-sidebar">
          <div className="aig-sb-sessions-head">
            <div className="aig-sb-brand">
              <div className="aig-sb-brand-icon">
                <Sparkles size={16} strokeWidth={1.75} />
              </div>
              <div className="aig-sb-brand-text">
                <span className="aig-sb-brand-title">Image Studio</span>
                <span className="aig-sb-brand-sub">AI Generation</span>
              </div>
            </div>
            <div className="aig-sb-sessions-label">Sessions</div>
          </div>

          {/* New Session button */}
          <button
            type="button"
            className="aig-sb-new-session"
            onClick={() => { setShowEmpty(true); setActiveSessionId(null); setWorkPrompt('') }}
          >
            <div className="aig-sb-new-icon"><Plus size={16} strokeWidth={2.5} /></div>
            <span>New Session</span>
          </button>

          {/* Session list */}
          <div className="aig-sb-session-list">
            {sessions.length === 0 && (
              <div className="aig-sb-no-sessions">No sessions yet. Start generating!</div>
            )}
            {[...sessions].reverse().map(s => (
              <button
                key={s.id}
                type="button"
                className={`aig-sb-session-item ${activeSessionId === s.id ? 'aig-sb-session-item--active' : ''}`}
                onClick={() => { setActiveSessionId(s.id); setShowEmpty(false) }}
              >
                <div className="aig-sb-session-thumb">
                  {s.thumb
                    ? <img src={s.thumb} alt={s.label} />
                    : <div className="aig-sb-session-thumb-placeholder"><ImageIcon size={14} /></div>
                  }
                </div>
                <div className="aig-sb-session-info">
                  <span className="aig-sb-session-label">
                    {s.label.length > 28 ? s.label.slice(0, 28) + '\u2026' : s.label}
                  </span>
                  <span className="aig-sb-session-count">
                    {s.generations.length} image{s.generations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main column: canvas + prompt bar ── */}
        <div className="aig-workspace-main">

          {/* Canvas area */}
          {showEmpty ? (
            <div className="aig-empty-canvas">
              <h2 className="aig-empty-canvas-title">What will you create today?</h2>

              {/* Inspiration image grid — 4 cards */}
              <div className="aig-empty-inspo-grid">
                {INSPIRATIONS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="aig-empty-inspo-card"
                    onClick={() => setWorkPrompt(item.prompt)}
                    title={item.prompt}
                  >
                    <img
                      src={`https://picsum.photos/seed/${item.seed}${idx}/400/500`}
                      alt={item.prompt}
                      loading="lazy"
                    />
                    <div className="aig-empty-inspo-overlay">
                      <p>{item.prompt.split(',')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="aig-workspace-scroll" ref={historyRef}>
              {activeGenerations.map(gen => (
                <div key={gen.id} className="aig-gen-row">
                  <div className="aig-gen-bubble">
                    <p className="aig-gen-bubble-text">{gen.prompt}</p>
                    <span className="aig-gen-bubble-chip">{gen.model}</span>
                  </div>
                  <div className="aig-gen-images">
                    {gen.status === 'generating' ? (
                      <div className="aig-skeleton-card" style={{ aspectRatio: dimToAspect(gen.dim || '1:1') }}>
                        <div className="aig-skeleton-shimmer" />
                        <div className="aig-skeleton-label">
                          <span className="aig-dot-pulse" />
                          Generating&hellip;
                        </div>
                      </div>
                    ) : (
                      <div className="aig-img-card" style={{ aspectRatio: dimToAspect(gen.dim || '1:1') }}>
                        <img src={gen.imageUrl} alt={gen.prompt} className="aig-img" />
                        <div className="aig-img-hover-bar">
                          <button type="button" className="aig-hover-btn"
                            onClick={() => { const genId = Date.now().toString(); const p = gen.prompt; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, generations: [...s.generations, { id: genId, prompt: p, model: gen.model, dim: gen.dim || '1:1', status: 'generating', imageUrl: null }] } : s)); setTimeout(() => { const url = `https://picsum.photos/seed/${encodeURIComponent(p + genId)}/${dimToSize(gen.dim || '1:1')}`; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, thumb: s.thumb || url, generations: s.generations.map(g => g.id === genId ? { ...g, status: 'done', imageUrl: url } : g) } : s)) }, 3500) }}>
                            <RotateCcw size={13} strokeWidth={1.75} /> Retry
                          </button>
                          <button type="button" className="aig-hover-btn" onClick={() => setWorkPrompt(gen.prompt)}>
                            <Shuffle size={13} strokeWidth={1.75} /> Reuse
                          </button>
                          <button type="button" className="aig-hover-btn"
                            onClick={() => setDownloadPanel({ genId: gen.id, imageUrl: gen.imageUrl })}>
                            <Download size={13} strokeWidth={1.75} /> Download
                          </button>
                          <button type="button" className="aig-hover-btn aig-hover-btn--danger"
                            onClick={() => setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, generations: s.generations.filter(g => g.id !== gen.id) } : s))}>
                            <Trash2 size={13} strokeWidth={1.75} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Bottom prompt bar ── */}
          <div className="aig-work-bar">
            <div className="aig-work-bar-inner">
              <textarea
                ref={workTextRef}
                className="aig-work-textarea"
                placeholder="Describe your next image\u2026"
                value={workPrompt}
                rows={2}
                onChange={e => setWorkPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWorkspaceGenerate() } }}
              />
              <div className="aig-work-chips">
                <ChipSelect value={model}      options={MODELS}    onChange={setModel}      label="Model" />
                <ChipSelect value={style}      options={STYLES}    onChange={setStyle}      label="Style" />
                <ChipSelect value={quality}    options={QUALITIES} onChange={setQuality}    label="Quality" />
                <ChipSelect value={dim}        options={DIMS}      onChange={setDim}        label="Dimension" />
                <ChipSelect value={visualType} options={VIS_TYPES} onChange={setVisualType} label="Visual Type" />
                <button type="button" className="aig-chip" onClick={() => setShowMedia(true)} title="Reference image">
                  <ImagePlus size={13} strokeWidth={1.75} />
                </button>
                {/* Reference image thumbnails in bar */}
                {refImages.map(img => (
                  <div key={img.id} className="aig-ref-thumb">
                    <img src={img.url} alt={img.name} />
                    <button
                      type="button"
                      className="aig-ref-thumb-remove"
                      onClick={() => setRefImages(prev => prev.filter(r => r.id !== img.id))}
                      aria-label="Remove reference"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                <div className="aig-work-spacer" />
                <span className="aig-work-cost">{creditCost} cr</span>
                <button
                  type="button"
                  className={`aig-send-btn ${workPrompt.trim() && !isGenerating ? 'aig-send-btn--ready' : ''}`}
                  onClick={handleWorkspaceGenerate}
                  disabled={!workPrompt.trim() || isGenerating}
                  aria-label="Generate"
                >
                  <Sparkles size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

        </div>{/* end aig-workspace-main */}
      </div>{/* end aig-workspace-body */}

      {/* ── Download panel ── */}
      {downloadPanel && (
        <div className="aig-dl-backdrop" onClick={() => setDownloadPanel(null)}>
          <div className="aig-dl-panel" onClick={e => e.stopPropagation()}>
            <div className="aig-dl-header">
              <button type="button" className="aig-dl-back" onClick={() => setDownloadPanel(null)}>
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="aig-dl-title">Download</span>
            </div>

            <div className="aig-dl-body">
              <div className="aig-dl-section-label">File type</div>
              <div className="aig-dl-formats">
                {[
                  { fmt: 'JPG',  desc: 'Best for sharing'                  },
                  { fmt: 'PNG',  desc: 'Best for complex images'            },
                  { fmt: 'WebP', desc: 'Smaller file size, modern browsers' },
                  { fmt: 'PDF',  desc: 'Best for print & documents'         },
                ].map(({ fmt, desc }) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`aig-dl-fmt-row ${dlFormat === fmt ? 'aig-dl-fmt-row--active' : ''}`}
                    onClick={() => setDlFormat(fmt)}
                  >
                    <div className="aig-dl-fmt-icon">
                      <Download size={16} strokeWidth={1.75} />
                    </div>
                    <div className="aig-dl-fmt-info">
                      <span className="aig-dl-fmt-name">{fmt}</span>
                      <span className="aig-dl-fmt-desc">{desc}</span>
                    </div>
                    {dlFormat === fmt && <div className="aig-dl-fmt-check">✓</div>}
                  </button>
                ))}
              </div>

              <div className="aig-dl-section-label" style={{ marginTop: 20 }}>Preview</div>
              <div className="aig-dl-preview">
                <img src={downloadPanel.imageUrl} alt="Preview" />
              </div>
            </div>

            <div className="aig-dl-footer">
              <a
                href={downloadPanel.imageUrl}
                download={`athena-image.${dlFormat.toLowerCase()}`}
                className="aig-dl-btn"
                onClick={() => setDownloadPanel(null)}
              >
                <Download size={16} strokeWidth={2} />
                Download {dlFormat}
              </a>
            </div>
          </div>
        </div>
      )}

      {showMedia && (
        <SelectMediaModal
          onClose={() => setShowMedia(false)}
          onConfirm={img => { setRefImages(prev => [...prev, img]); setShowMedia(false) }}
        />
      )}
    </div>
  )
}
